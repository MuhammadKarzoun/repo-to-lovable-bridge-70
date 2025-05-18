import { useState, useEffect, useCallback } from 'react';
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
// For simplicity in Phase 1, we'll assume the standard query name,
// but this is a placeholder for more dynamic handling if needed later.
const getMessagesQueryName = (/* dmConfig?: DmConfig */) => {
  // In a real scenario, this might inspect dmConfig if provided.
  // For now, using the default from DmWorkArea.tsx as a common case.
  // This will need to be more robust if multiple custom message queries are used.
  return 'conversationMessages';
};


interface UseInboxRealtimeEventsProps {
  currentUser: IUser | null;
  currentConversationId?: string;
  // Optional customerId for messenger connection status,
  // The component using this hook (e.g. ConversationDetail container)
  // would be responsible for fetching and passing this if conversation is messenger type.
  messengerCustomerId?: string;
  // queryParams are needed to correctly update the sidebarConversations cache
  // This is a simplification for Phase 1. A more robust solution might involve
  // a global state for queryParams or a different cache update strategy.
  // For now, this is needed if we want to try to add new conversations to the sidebar.
  // However, adding new convos without knowing active filters from queryParams is very hard from here.
  // So, for now, we will only update existing convos in sidebar.
  // sidebarQueryParams?: any; 
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

  const currentUserId = currentUser?._id;

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
        // If the query hasn't been fetched yet, we can't reliably update it.
        // The component responsible for this count should fetch it initially.
        // Or, we could refetch it here, but that goes against avoiding refetches.
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

  // Subscription for new messages (client-wide)
  useSubscription(gql(subscriptions.conversationClientMessageInserted), {
    variables: { userId: currentUserId },
    skip: !currentUserId,
    onData: ({ data: subData }) => {
      if (!subData?.data?.conversationClientMessageInserted) return;
      setConnectionStatus('connected');
      const message = subData.data
        .conversationClientMessageInserted as IMessage & {
        conversation?: IConversation;
      };
      const conversationOfMessage = message.conversation;

      console.log(
        '[useInboxRealtimeEvents] Received conversationClientMessageInserted:',
        message
      );

      // 1. Update Unread Count
      updateUnreadCountCache();

      // 2. Update Sidebar Conversations Cache
      if (conversationOfMessage) {
         try {
            // This logic attempts to update an existing conversation in any sidebar cache.
            // It's a best-effort approach without knowing specific list variables.
            client.cache.modify({
              id: client.cache.identify(conversationOfMessage),
              fields: {
                lastMessage() {
                  return message;
                },
                unreadCount(existingUnreadCount = 0) {
                  // Only increment if the message is not from the current user
                  // and the conversation is not the currently active one (to avoid double counting if view is open)
                  if (message.userId !== currentUserId && message.conversationId !== currentConversationId) {
                    return existingUnreadCount + 1;
                  }
                  // If it's the current user's message or current convo, unread count on sidebar item shouldn't increment
                  // or should be handled by markAsRead logic when conversation is opened.
                  return existingUnreadCount;
                },
                // Potentially update other fields like `updatedAt`
                updatedAt() {
                  return Date.now(); // Or use message.createdAt if appropriate
                }
              },
            });
            // Additionally, if it's a new conversation not yet in cache,
            // this modify call might not add it. A more robust solution might involve
            // refetching the list or carefully adding it if it matches active filters,
            // but that's significantly more complex and deferred.
         } catch (e) {
            console.error('[useInboxRealtimeEvents] Error updating sidebar conversations cache for new message:', e);
         }
      }


      // 3. Update Current Conversation Messages Cache (if applicable)
      if (
        currentConversationId &&
        message.conversationId === currentConversationId
      ) {
        try {
          const queryName = getMessagesQueryName();
          const messagesQueryDefinition = {
            query: gql(queries.conversationMessages), // Or dynamic query
            variables: {
              conversationId: currentConversationId,
              // Assuming default limit/skip for now, matching cache key is crucial
            },
          };

          const existingMessagesData = client.cache.readQuery<
            MessagesQueryResponse
          >(messagesQueryDefinition);
          
          if (existingMessagesData && existingMessagesData[queryName]) {
            const currentMessages = existingMessagesData[queryName];
            if (!currentMessages.find((m) => m._id === message._id)) {
              client.cache.writeQuery({
                ...messagesQueryDefinition,
                data: {
                  [queryName]: [...currentMessages, message],
                },
              });
            }
          } else {
            client.cache.writeQuery({
              ...messagesQueryDefinition,
              data: {
                [queryName]: [message],
              },
            });
          }
        } catch (e) {
          console.error(
            '[useInboxRealtimeEvents] Error updating current conversation messages cache for new message:',
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
          userId: currentUserId || '',
          requireInteraction: false,
        });
      }
    },
    onError: (err) => {
      console.error(
        '[useInboxRealtimeEvents] Subscription error (conversationClientMessageInserted):',
        err
      );
      setConnectionStatus('disconnected');
    },
  });

  // Subscription for conversation changes
  useSubscription(gql(subscriptions.conversationChanged), {
    variables: { _id: currentConversationId },
    skip: !currentConversationId, // Skip if no specific conversation is active
    onData: ({ data: subData }) => {
      if (!subData?.data?.conversationChanged) return;
      setConnectionStatus('connected');
      const updatedConversation = subData.data
        .conversationChanged as IConversation;
      
      console.log(
        '[useInboxRealtimeEvents] Received conversationChanged:',
        updatedConversation
      );

      // 1. Update Conversation Detail Cache (if it's the current one)
      if (updatedConversation._id === currentConversationId) {
        try {
          const detailQuery = {
            query: gql(queries.conversationDetail),
            variables: { _id: currentConversationId },
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
            // Potentially update other relevant fields from updatedConversation
            // For example, if tags or other metadata change:
            // tags() { return updatedConversation.tags; }
            // unreadCount() { return updatedConversation.unreadCount; } // If backend provides it
          },
        });
      } catch (e) {
        console.error('[useInboxRealtimeEvents] Error updating sidebar cache for conversationChanged:', e);
      }
    },
    onError: (err) => {
      console.error(
        '[useInboxRealtimeEvents] Subscription error (conversationChanged):',
        err
      );
      setConnectionStatus('disconnected');
    },
  });

  // Subscription for message status changes
  useSubscription(gql(subscriptions.conversationMessageStatusChanged), {
    variables: { _id: currentConversationId }, // Assuming this subscription is for messages in the current convo
    skip: !currentConversationId,
    onData: ({ data: subData }) => {
      if (!subData?.data?.conversationMessageStatusChanged) return;
      setConnectionStatus('connected');
      const updatedMessage = subData.data
        .conversationMessageStatusChanged as IMessage;

      console.log(
        '[useInboxRealtimeEvents] Received conversationMessageStatusChanged:',
        updatedMessage
      );
        
      // This should only apply if the message belongs to the currentConversationId
      if (updatedMessage.conversationId === currentConversationId) {
        try {
          const queryName = getMessagesQueryName();
          const messagesQueryDefinition = {
            query: gql(queries.conversationMessages),
            variables: { conversationId: currentConversationId },
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
    },
    onError: (err) => {
      console.error(
        '[useInboxRealtimeEvents] Subscription error (conversationMessageStatusChanged):',
        err
      );
      setConnectionStatus('disconnected');
    },
  });

  // Subscription for customer connection changes
  useSubscription(gql(subscriptions.customerConnectionChanged), {
    variables: { _id: messengerCustomerId },
    skip: !messengerCustomerId || !currentConversationId, // Also skip if no current convo to update
    onData: ({ data: subData }) => {
      if (!subData?.data?.customerConnectionChanged) return;
      setConnectionStatus('connected');
      const customerConnection = subData.data.customerConnectionChanged;

      console.log(
        '[useInboxRealtimeEvents] Received customerConnectionChanged:',
        customerConnection
      );

      if (currentConversationId) { // Check should be redundant due to skip, but good practice
        try {
          const detailQuery = {
            query: gql(queries.conversationDetail),
            variables: { _id: currentConversationId },
          };
          const existingDetail =
            client.cache.readQuery<ConversationDetailQueryResponse>(
              detailQuery
            );

          if (
            existingDetail?.conversationDetail?.customer?._id ===
            customerConnection._id // Ensure we are updating the correct customer
          ) {
            client.cache.writeQuery<ConversationDetailQueryResponse>({
              ...detailQuery,
              data: {
                conversationDetail: {
                  ...existingDetail.conversationDetail,
                  customer: {
                    ...(existingDetail.conversationDetail.customer || {}), // Preserve other customer fields
                    ...customerConnection, // Apply new connection status fields
                  },
                } as IConversation, // Cast to IConversation to satisfy type
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
    },
    onError: (err) => {
      console.error(
        '[useInboxRealtimeEvents] Subscription error (customerConnectionChanged):',
        err
      );
      setConnectionStatus('disconnected');
    },
  });

  // Subscription for typing status
  useSubscription(gql(subscriptions.conversationClientTypingStatusChanged), {
    variables: { _id: currentConversationId },
    skip: !currentConversationId,
    onData: ({ data: subData }) => {
      setConnectionStatus('connected'); // Assume connected if data or lack of data is intentional
      const typingData = subData?.data?.conversationClientTypingStatusChanged;
      
      if (!typingData || !typingData.text) { // Clear if no data, empty text, or explicitly told to clear
        setTypingInfo(null);
        return;
      }
      
      console.log(
        '[useInboxRealtimeEvents] Received conversationClientTypingStatusChanged:',
        typingData
      );
      // Ensure typing is for the current conversation
      if (typingData.conversationId === currentConversationId) {
        setTypingInfo({
          text: typingData.text,
          conversationId: currentConversationId,
        });
      } else {
        // If typing is for a different conversation, clear for the current one
        setTypingInfo(null);
      }
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
  
  // Effect to set initial connection status
  useEffect(() => {
    // This is a bit simplistic. True connection status would come from WebSocket state.
    // For now, if any subscription works, we set to connected.
    // If all subscriptions fail to initialize or an error occurs, it becomes disconnected.
    // This could be refined with Apollo Client's link state or a dedicated WebSocket manager.
    if (currentUserId) { // Only attempt if user is available
        // Consider a timeout or a check after subscriptions attempt to connect
        // For now, we optimistically assume 'connecting' and subscriptions will update it.
    }
  }, [currentUserId]);


  return { typingInfo, connectionStatus };
};
