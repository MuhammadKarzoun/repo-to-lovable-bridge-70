import { useState, useEffect, useCallback, useRef } from 'react';
import { useSubscription, useApolloClient, gql } from '@apollo/client';
import {
  queries,
  subscriptions,
} from '@octobots/ui-inbox/src/inbox/graphql';
import {
  IConversation,
  IMessage,
  UnreadConversationsTotalCountQueryResponse,
  ConversationDetailQueryResponse,
  MessagesQueryResponse,
} from '@octobots/ui-inbox/src/inbox/types';
import { IUser } from '@octobots/ui/src/auth/types';
import { sendDesktopNotification } from '@octobots/ui/src/utils';
import strip from 'strip';
import { ConnectionStatus, TypingInfo } from './realtimeEventTypes';
import { NOTIFICATION_TYPE } from '../constants';

// Helper to get the dynamic query name for messages (e.g., from dmConfig)
const getMessagesQueryName = (/* dmConfig?: DmConfig */) => {
  return 'conversationMessages';
};

interface UseInboxRealtimeEventsProps {
  currentUser: IUser | null;
  currentConversationId?: string;
  messengerCustomerId?: string;
}

export const useInboxRealtimeEvents = ({
  currentUser,
  currentConversationId,
  messengerCustomerId,
}: UseInboxRealtimeEventsProps) => {
  const client = useApolloClient();
  const [typingInfo, setTypingInfo] = useState<TypingInfo | null>(null);
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>('connecting');

  // Use refs to store stable values between renders
  const currentUserIdRef = useRef<string | undefined>(currentUser?._id);
  const currentConversationIdRef = useRef<string | undefined>(currentConversationId);
  const messengerCustomerIdRef = useRef<string | undefined>(messengerCustomerId);

  // Update refs when props change
  useEffect(() => {
    currentUserIdRef.current = currentUser?._id;
    currentConversationIdRef.current = currentConversationId;
    messengerCustomerIdRef.current = messengerCustomerId;
  }, [currentUser, currentConversationId, messengerCustomerId]);

  // Helper function to update unread count
  const updateUnreadCountCache = useCallback(() => {
    try {
      const unreadQuery = { query: gql(queries.unreadConversationsCount) };
      const existingUnreadData =
        client.cache.readQuery<UnreadConversationsTotalCountQueryResponse>(
          unreadQuery
        );

      if (existingUnreadData) {
        client.cache.writeQuery({
          ...unreadQuery,
          data: {
            conversationsTotalUnreadCount:
              (existingUnreadData.conversationsTotalUnreadCount || 0) + 1,
          },
        });
      } else {
        console.warn(
          '[useInboxRealtimeEvents] Unread count query not found in cache. Cannot increment.'
        );
      }
    } catch (e) {
      console.error(
        '[useInboxRealtimeEvents] Error updating unread count cache:',
        e
      );
    }
  }, [client.cache]);

  // Handle new messages from subscription
  const handleNewMessage = useCallback((message: IMessage & { conversation?: IConversation }) => {
    if (!message) return;
    
    setConnectionStatus('connected');
    const conversationOfMessage = message.conversation;
    const currentUserId = currentUserIdRef.current;
    const currentConvoId = currentConversationIdRef.current;

    console.log(
      '[useInboxRealtimeEvents] Received conversationClientMessageInserted:',
      message
    );

    // 1. Update Unread Count
    updateUnreadCountCache();

    // 2. Update Sidebar Conversations Cache
    if (conversationOfMessage) {
      try {
        client.cache.modify({
          id: client.cache.identify(conversationOfMessage),
          fields: {
            lastMessage() {
              return message; // Apollo Client will create a reference if message is in cache
            },
            unreadCount(existingUnreadCount = 0) {
              // Only increment if the message is not from the current user
              // AND (it's not for the current open conversation OR it is for the current conversation but current user is not viewing it - this part is hard to check here)
              // Simplification: if not from current user and not for current open conversation (or user has window unfocused - not checkable here)
              if (message.userId !== currentUserId && message.conversationId !== currentConvoId) {
                return existingUnreadCount + 1;
              }
              // If message is for the current conversation, DmWorkArea handles marking as read, which should decrement unread count via mutations.
              // Or, if the main component (ConversationDetail) marks as read, it should trigger a cache update for the conversation's unreadCount.
              return existingUnreadCount;
            },
            updatedAt() {
              return Date.now();
            }
          },
        });
      } catch (e) {
        console.error('[useInboxRealtimeEvents] Error updating sidebar conversations cache for new message:', e);
      }
    }

    // 3. Update Current Conversation Messages Cache (if applicable) - Made more conservative
    if (
      currentConvoId &&
      message.conversationId === currentConvoId
    ) {
      try {
        const queryName = getMessagesQueryName();
        // This definition uses only conversationId. DmWorkArea uses conversationId, limit, and skip.
        // Updating this "minimal" cache entry might not directly affect DmWorkArea's displayed list
        // if DmWorkArea relies on the more specific query with limit/skip.
        // However, if DmWorkArea switches to cache-and-network, Apollo's normalization might help if the message object itself is in the cache.
        const messagesQueryDefinitionMinimal = {
          query: gql(queries.conversationMessages),
          variables: { conversationId: currentConvoId },
        };

        const existingMessagesDataMinimal = client.cache.readQuery<MessagesQueryResponse>(messagesQueryDefinitionMinimal);
        
        if (existingMessagesDataMinimal && existingMessagesDataMinimal[queryName]) {
          const currentMessages = existingMessagesDataMinimal[queryName];
          // Add if message is not already present
          if (!currentMessages.find((m) => m._id === message._id)) {
            client.cache.writeQuery({
              ...messagesQueryDefinitionMinimal,
              data: {
                [queryName]: [...currentMessages, message],
              },
            });
            console.log('[useInboxRealtimeEvents] Updated MINIMAL messages query in cache (only conversationId variable).');
          }
        } else {
          // If this minimal query isn't in cache, it's unlikely this hook can update DmWorkArea's main message list
          // without knowing its exact 'limit' and 'skip' variables.
          // Relying on DmWorkArea's `cache-and-network` policy and Apollo's normalization is preferable here.
          console.log(
            '[useInboxRealtimeEvents] Minimal messages query (only conversationId var) not in cache, or DmWorkArea uses different variables (e.g. limit/skip). Skipping direct message list update by hook for this variant.'
          );
        }
      } catch (e) {
        console.error(
          '[useInboxRealtimeEvents] Error attempting to update current conversation messages cache for new message:',
          e
        );
      }
    }

    // 4. Send Desktop Notification
    if (message.userId !== currentUserId) {
      const kind = message.conversation?.integration?.kind || 'unknown';
      sendDesktopNotification({
        title:
          NOTIFICATION_TYPE[kind] || `You have a new ${kind} message`,
        content: strip(message.content || ''),
        userId: currentUserId || '', // Ensure userId is a string
        requireInteraction: false,
      });
    }
  }, [client, updateUnreadCountCache]); // currentUserIdRef and currentConversationIdRef are stable

  // Handle conversation changes from subscription
  const handleConversationChanged = useCallback((updatedConversation: IConversation) => {
    if (!updatedConversation) return;
    
    setConnectionStatus('connected');
    const currentConvoId = currentConversationIdRef.current;
    
    console.log(
      '[useInboxRealtimeEvents] Received conversationChanged:',
      updatedConversation
    );

    // 1. Update Conversation Detail Cache (if it's the current one)
    if (updatedConversation._id === currentConvoId) {
      try {
        const detailQuery = {
          query: gql(queries.conversationDetail),
          variables: { _id: currentConvoId },
        };
        client.cache.writeQuery<ConversationDetailQueryResponse>({
          ...detailQuery,
          data: { conversationDetail: updatedConversation },
        });
      } catch (e) {
        console.error(
          '[useInboxRealtimeEvents] Error updating current conversation detail cache for conversationChanged:',
          e
        );
      }
    }

    // 2. Update Sidebar Conversations Cache (for the specific conversation)
    try {
      client.cache.modify({
        id: client.cache.identify(updatedConversation),
        fields: {
          status() { return updatedConversation.status; },
          assignedUserId() { return updatedConversation.assignedUserId; },
        },
      });
    } catch (e) {
      console.error('[useInboxRealtimeEvents] Error updating sidebar cache for conversationChanged:', e);
    }
  }, [client]);

  // Handle message status changes from subscription
  const handleMessageStatusChanged = useCallback((updatedMessage: IMessage) => {
    if (!updatedMessage) return;
    
    setConnectionStatus('connected');
    const currentConvoId = currentConversationIdRef.current;

    console.log(
      '[useInboxRealtimeEvents] Received conversationMessageStatusChanged:',
      updatedMessage
    );
      
    // Only update if the message belongs to the currentConversationId
    if (updatedMessage.conversationId === currentConvoId) {
      try {
        const queryName = getMessagesQueryName();
        const messagesQueryDefinition = {
          query: gql(queries.conversationMessages),
          variables: { conversationId: currentConvoId },
        };
        const existingMessagesData = client.cache.readQuery<
          MessagesQueryResponse
        >(messagesQueryDefinition);

        if (existingMessagesData && existingMessagesData[queryName]) {
          const newMessages = existingMessagesData[queryName].map((msg) =>
            msg._id === updatedMessage._id ? { ...msg, ...updatedMessage } : msg
          );
          client.cache.writeQuery({
            ...messagesQueryDefinition,
            data: { [queryName]: newMessages },
          });
        }
      } catch (e) {
        console.error(
          '[useInboxRealtimeEvents] Error updating message status in cache for current conversation:',
          e
        );
      }
    }
  }, [client]);

  // Handle customer connection changes from subscription
  const handleCustomerConnectionChanged = useCallback((customerConnection: any) => {
    if (!customerConnection) return;
    
    setConnectionStatus('connected');
    const currentConvoId = currentConversationIdRef.current;

    console.log(
      '[useInboxRealtimeEvents] Received customerConnectionChanged:',
      customerConnection
    );

    if (currentConvoId) {
      try {
        const detailQuery = {
          query: gql(queries.conversationDetail),
          variables: { _id: currentConvoId },
        };
        const existingDetail =
          client.cache.readQuery<ConversationDetailQueryResponse>(
            detailQuery
          );

        if (
          existingDetail?.conversationDetail?.customer?._id ===
          customerConnection._id
        ) {
          client.cache.writeQuery<ConversationDetailQueryResponse>({
            ...detailQuery,
            data: {
              conversationDetail: {
                ...existingDetail.conversationDetail,
                customer: {
                  ...(existingDetail.conversationDetail.customer || {}),
                  ...customerConnection,
                },
              } as IConversation,
            },
          });
        }
      } catch (e) {
        console.error(
          '[useInboxRealtimeEvents] Error updating customer connection in cache:',
          e
        );
      }
    }
  }, [client]);

  // Handle typing status changes from subscription
  const handleTypingStatusChanged = useCallback((typingData: any) => {
    setConnectionStatus('connected');
    
    if (!typingData || !typingData.text) {
      setTypingInfo(null);
      return;
    }
    
    const currentConvoId = currentConversationIdRef.current;
    
    console.log(
      '[useInboxRealtimeEvents] Received conversationClientTypingStatusChanged:',
      typingData
    );
    
    if (typingData.conversationId === currentConvoId) {
      setTypingInfo({
        text: typingData.text,
        conversationId: currentConvoId,
      });
    } else {
      setTypingInfo(null);
    }
  }, []);

  // Set up message subscription with memoized handlers
  useSubscription(gql(subscriptions.conversationClientMessageInserted), {
    variables: { userId: currentUser?._id },
    skip: !currentUser?._id,
    onData: ({ data: subData }) => {
      if (!subData?.data?.conversationClientMessageInserted) return;
      handleNewMessage(subData.data.conversationClientMessageInserted);
    },
    onError: (err) => {
      console.error(
        '[useInboxRealtimeEvents] Subscription error (conversationClientMessageInserted):',
        err
      );
      setConnectionStatus('disconnected');
    },
  });

  // Set up conversation changes subscription with memoized handlers
  useSubscription(gql(subscriptions.conversationChanged), {
    variables: { _id: currentConversationId },
    skip: !currentConversationId,
    onData: ({ data: subData }) => {
      if (!subData?.data?.conversationChanged) return;
      handleConversationChanged(subData.data.conversationChanged);
    },
    onError: (err) => {
      console.error(
        '[useInboxRealtimeEvents] Subscription error (conversationChanged):',
        err
      );
      setConnectionStatus('disconnected');
    },
  });

  // Set up message status subscription with memoized handlers
  useSubscription(gql(subscriptions.conversationMessageStatusChanged), {
    variables: { _id: currentConversationId },
    skip: !currentConversationId,
    onData: ({ data: subData }) => {
      if (!subData?.data?.conversationMessageStatusChanged) return;
      handleMessageStatusChanged(subData.data.conversationMessageStatusChanged);
    },
    onError: (err) => {
      console.error(
        '[useInboxRealtimeEvents] Subscription error (conversationMessageStatusChanged):',
        err
      );
      setConnectionStatus('disconnected');
    },
  });

  // Set up customer connection subscription with memoized handlers
  useSubscription(gql(subscriptions.customerConnectionChanged), {
    variables: { _id: messengerCustomerId },
    skip: !messengerCustomerId || !currentConversationId,
    onData: ({ data: subData }) => {
      if (!subData?.data?.customerConnectionChanged) return;
      handleCustomerConnectionChanged(subData.data.customerConnectionChanged);
    },
    onError: (err) => {
      console.error(
        '[useInboxRealtimeEvents] Subscription error (customerConnectionChanged):',
        err
      );
      setConnectionStatus('disconnected');
    },
  });

  // Set up typing status subscription with memoized handlers
  useSubscription(gql(subscriptions.conversationClientTypingStatusChanged), {
    variables: { _id: currentConversationId },
    skip: !currentConversationId,
    onData: ({ data: subData }) => {
      handleTypingStatusChanged(subData?.data?.conversationClientTypingStatusChanged);
    },
    onError: (err) => {
      console.error(
        '[useInboxRealtimeEvents] Subscription error (conversationClientTypingStatusChanged):',
        err
      );
      setTypingInfo(null);
      setConnectionStatus('disconnected');
    },
  });

  return { typingInfo, connectionStatus };
};
