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
  ConversationsQueryResponse, // Added for typing, though not directly used for read/write here
} from '@octobots/ui-inbox/src/inbox/types';
import { IUser } from '@octobots/ui/src/auth/types';
import { sendDesktopNotification } from '@octobots/ui/src/utils';
import strip from 'strip';
import { ConnectionStatus, TypingInfo } from './realtimeEventTypes';
import { NOTIFICATION_TYPE } from '../constants';
// import { generateParams } from '@octobots/ui-inbox/src/inbox/utils'; // Not needed if using refetchQueries

// Helper to get the dynamic query name for messages (e.g., from dmConfig)
// For now, this is hardcoded as DmConfig isn't passed here directly.
// A more robust solution would involve context or props if dmConfig is needed.
const getMessagesQueryName = (/* dmConfig?: DmConfig */) => {
  // This was the previous implementation. If DmConfig influences this,
  // this function needs access to it or the name needs to be passed.
  // For now, sticking to the most common case.
  return 'conversationMessages';
};

interface UseInboxRealtimeEventsProps {
  currentUser: IUser | null;
  currentConversationId?: string;
  messengerCustomerId?: string;
  // Potentially pass dmConfig if it's available at this level and affects query names
  // dmConfig?: DmConfig; 
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

  const currentUserIdRef = useRef<string | undefined>(currentUser?._id);
  const currentConversationIdRef = useRef<string | undefined>(currentConversationId);
  const messengerCustomerIdRef = useRef<string | undefined>(messengerCustomerId);

  useEffect(() => {
    currentUserIdRef.current = currentUser?._id;
    currentConversationIdRef.current = currentConversationId;
    messengerCustomerIdRef.current = messengerCustomerId;
  }, [currentUser, currentConversationId, messengerCustomerId]);

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

  const handleNewMessage = useCallback((message: IMessage & { conversation?: IConversation }) => {
    if (!message || !message._id) { // Added check for message._id for robustness
        console.warn('[useInboxRealtimeEvents] Received invalid message object:', message);
        return;
    }
    
    setConnectionStatus('connected');
    const conversationOfMessage = message.conversation;
    const currentUserId = currentUserIdRef.current;
    const currentConvoId = currentConversationIdRef.current;

    console.log(
      '[useInboxRealtimeEvents] Received conversationClientMessageInserted:',
      { messageId: message._id, conversationId: message.conversationId, currentUserId, currentConvoId }
    );

    updateUnreadCountCache();

    if (conversationOfMessage && conversationOfMessage._id) { // Added check for conversationOfMessage._id
      const typedConversationForCache = { 
        ...conversationOfMessage, 
        __typename: 'Conversation' as const 
      };
      // Ensure message also has __typename and _id, and no nested conversation for cache storage
      const typedMessageForCache = { 
        ...message, 
        conversation: undefined, 
        __typename: 'Message' as const 
      };

      try {
        client.cache.modify({
          id: client.cache.identify(typedConversationForCache),
          fields: {
            lastMessage: (existingLastMessage, { toReference }) => {
              const messageRef = typedMessageForCache._id ? toReference(typedMessageForCache) : undefined;
              // If toReference works, it means the message is already normalized in cache or can be.
              // Otherwise, store the direct object.
              if (messageRef) {
                console.log(`[useInboxRealtimeEvents] Updating lastMessage for convo ${typedConversationForCache._id} with reference:`, messageRef);
                return messageRef;
              }
              console.log(`[useInboxRealtimeEvents] Updating lastMessage for convo ${typedConversationForCache._id} with object:`, typedMessageForCache);
              return typedMessageForCache;
            },
            unreadCount(existingUnreadCount = 0) {
              if (message.userId !== currentUserId && message.conversationId !== currentConvoId) {
                console.log(`[useInboxRealtimeEvents] Incrementing unread count for convo ${typedConversationForCache._id}. Old: ${existingUnreadCount}, New: ${existingUnreadCount + 1}`);
                return existingUnreadCount + 1;
              }
              console.log(`[useInboxRealtimeEvents] Not incrementing unread count for convo ${typedConversationForCache._id}. userId: ${message.userId} (curUser: ${currentUserId}), convoId: ${message.conversationId} (curConvo: ${currentConvoId})`);
              return existingUnreadCount;
            },
            updatedAt() {
              const newTimestamp = new Date().toISOString();
              console.log(`[useInboxRealtimeEvents] Updating updatedAt for convo ${typedConversationForCache._id} to ${newTimestamp}`);
              return newTimestamp;
            }
          },
        });
        console.log('[useInboxRealtimeEvents] Successfully updated Conversation entity in cache:', typedConversationForCache._id);
        
        // Refetch the sidebar conversations query to ensure the list is updated and re-sorted.
        // This is more reliable than manual cache list manipulation from this decoupled hook.
        console.log('[useInboxRealtimeEvents] Triggering refetch for sidebarConversations query.');
        client.refetchQueries({
          include: [gql(queries.sidebarConversations)], // Assumes queries.sidebarConversations is a GQL string
        }).then(() => {
          console.log('[useInboxRealtimeEvents] sidebarConversations query refetched successfully.');
        }).catch(err => {
          console.error('[useInboxRealtimeEvents] Error refetching sidebarConversations:', err);
        });

      } catch (e) {
        console.error('[useInboxRealtimeEvents] Error processing new message for cache update:', e);
      }
    } else {
        console.warn('[useInboxRealtimeEvents] New message does not have associated conversation data or conversation _id, skipping cache update for conversation entity.', message);
    }

    // Refined: Update Current Conversation Messages Cache
    if (currentConvoId && message.conversationId === currentConvoId) {
      try {
        // const queryName = getMessagesQueryName(dmConfig); // If dmConfig influences this
        const queryName = getMessagesQueryName(); 
        
        // IMPORTANT: DmWorkArea uses variables: { conversationId, limit, skip }
        // We don't have limit and skip here. Attempting to update a query with *only*
        // conversationId might not affect DmWorkArea's view if Apollo treats them as
        // different queries due to different variable sets.
        // This section is now more conservative and aims to update if a query
        // with *matching* variables is found, or logs a warning.
        // A more robust solution might involve DmWorkArea exposing a way to trigger
        // a refetch or providing its exact variables to this hook, or this hook
        // being co-located or having more context.

        // Try to read the cache with the variables DmWorkArea likely uses.
        // We can't know 'initialLimit' from DmWorkArea here, so this is still an approximation.
        // We'll try a common case: limit 10, skip 0 as a fallback if more specific reads fail.
        // This part is highly speculative without knowing DmWorkArea's current state.
        const potentialVariables = [
          // We don't have `initialLimit` or current skip from DmWorkArea.
          // This makes precise cache updates for the *exact* query difficult from here.
          // If DmWorkArea uses cache-and-network, Apollo might handle normalization
          // if the message object itself is updated in the cache via client.cache.modify.
          // Let's try to update the message object directly in cache, Apollo might then propagate it.
        ];

        // Option 1: Modify the message entity directly. Apollo might update queries using it.
        // Ensure message has __typename for this to be effective
        const typedMessageForCache = { ...message, __typename: 'Message' as const, conversation: undefined };
        client.cache.modify({
          id: client.cache.identify(typedMessageForCache),
          fields: {
            // No specific fields to change on the message itself from a new message event,
            // but ensuring it's "fresh" in the cache can help.
            // If the message wasn't in the cache, this might not do much.
          }
        });
        
        // Option 2: Attempt to update a general conversationMessages query (less specific vars)
        // This was the previous attempt. It's kept as a fallback if direct entity update isn't enough.
        const minimalMessagesQuery = {
          query: gql(queries.conversationMessages),
          variables: { conversationId: currentConvoId }, // Lacks limit/skip
        };

        const existingMinimalData = client.cache.readQuery<MessagesQueryResponse>(minimalMessagesQuery);
        if (existingMinimalData && existingMinimalData[queryName]) {
           const currentMessages = existingMinimalData[queryName];
           if (!currentMessages.find((m) => m._id === message._id)) {
             client.cache.writeQuery({
               ...minimalMessagesQuery,
               data: { [queryName]: [...currentMessages, typedMessageForCache] }, // Use typedMessageForCache
             });
             console.log('[useInboxRealtimeEvents] Updated MINIMAL messages cache (only conversationId var). DmWorkArea might use different vars.');
           }
        } else {
           console.log('[useInboxRealtimeEvents] Minimal messages query not in cache or DmWorkArea uses different vars. Relying on Apollo normalization or DmWorkArea refetch for message list update.');
        }

      } catch (e) {
        console.error(
          '[useInboxRealtimeEvents] Error attempting to update current conversation messages cache for new message:',
          e
        );
      }
    }

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
  }, [client, updateUnreadCountCache]);

  const handleConversationChanged = useCallback((updatedConversation: IConversation) => {
    if (!updatedConversation) return;
    
    setConnectionStatus('connected');
    const currentConvoId = currentConversationIdRef.current;
    
    console.log(
      '[useInboxRealtimeEvents] Received conversationChanged:',
      updatedConversation
    );

    if (updatedConversation._id === currentConvoId) {
      try {
        const detailQuery = {
          query: gql(queries.conversationDetail),
          variables: { _id: currentConvoId },
        };
        client.cache.writeQuery<ConversationDetailQueryResponse>({
          ...detailQuery,
          data: { conversationDetail: {...updatedConversation, __typename: 'Conversation'} },
        });
      } catch (e) {
        console.error(
          '[useInboxRealtimeEvents] Error updating current conversation detail cache for conversationChanged:',
          e
        );
      }
    }

    try {
      client.cache.modify({
        id: client.cache.identify({...updatedConversation, __typename: 'Conversation'}),
        fields: {
          status() { return updatedConversation.status; },
          assignedUserId() { return updatedConversation.assignedUserId; },
          // Potentially other fields from updatedConversation
          // For example, if `tags` can change:
          // tags() { return updatedConversation.tags; }
        },
      });
    } catch (e) {
      console.error('[useInboxRealtimeEvents] Error updating sidebar cache for conversationChanged:', e);
    }
  }, [client]);

  const handleMessageStatusChanged = useCallback((updatedMessage: IMessage) => {
    if (!updatedMessage || !updatedMessage._id) return; // Added checks
    
    setConnectionStatus('connected');
    const currentConvoId = currentConversationIdRef.current;
    const typedUpdatedMessage = { ...updatedMessage, __typename: 'Message' as const, conversation: undefined };

    console.log(
      '[useInboxRealtimeEvents] Received conversationMessageStatusChanged:',
      typedUpdatedMessage
    );
      
    if (typedUpdatedMessage.conversationId === currentConvoId) {
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
            msg._id === typedUpdatedMessage._id ? { ...msg, ...typedUpdatedMessage } : msg
          );
          client.cache.writeQuery({
            ...messagesQueryDefinition,
            data: { [queryName]: newMessages },
          });
           console.log('[useInboxRealtimeEvents] Updated message status in MINIMAL messages cache.');
        } else {
          client.cache.modify({
            id: client.cache.identify(typedUpdatedMessage),
            fields: {
              // Update specific status fields on the message entity
              // This depends on what IMessage status fields are (e.g., isRead, deliveryStatus)
              // Example:
              // isRead: () => typedUpdatedMessage.isRead, 
              // Another example if 'status' is a field on IMessage:
              // status: () => typedUpdatedMessage.status,
            }
          });
          console.log('[useInboxRealtimeEvents] Minimal messages query not in cache for status update. Attempted direct entity modification for message:', typedUpdatedMessage._id);
        }
      } catch (e) {
        console.error(
          '[useInboxRealtimeEvents] Error updating message status in cache for current conversation:',
          e
        );
      }
    }
    // Also update the message if it's part of the lastMessage of any conversation in sidebar
    // This is more complex as it requires finding which conversation might have this message as lastMessage
    // For now, focusing on the current conversation's message list.
  }, [client]);

  const handleCustomerConnectionChanged = useCallback((customerConnection: any) => { // Type for customerConnection?
    if (!customerConnection || !customerConnection._id) return;
    
    setConnectionStatus('connected');
    const currentConvoId = currentConversationIdRef.current;
    // Assuming customerConnection should also have a __typename if it's a GraphQL type
    const typedCustomerConnection = { ...customerConnection, __typename: 'Customer' as const };


    console.log(
      '[useInboxRealtimeEvents] Received customerConnectionChanged:',
      typedCustomerConnection
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
          typedCustomerConnection._id
        ) {
          client.cache.writeQuery<ConversationDetailQueryResponse>({
            ...detailQuery,
            data: {
              conversationDetail: {
                ...(existingDetail.conversationDetail || {}), // Spread existing to keep all fields
                __typename: 'Conversation', // Ensure __typename on conversationDetail
                customer: {
                  ...(existingDetail.conversationDetail.customer || {}), // Spread existing customer fields
                  ...typedCustomerConnection, // Apply updates
                  __typename: 'Customer', // Ensure __typename on customer
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

  const handleTypingStatusChanged = useCallback((typingData: any) => { // Type for typingData?
    setConnectionStatus('connected');
    
    if (!typingData || !typingData.text) { // If text is empty, typing stopped
      setTypingInfo(null);
      return;
    }
    
    const currentConvoId = currentConversationIdRef.current;
    
    console.log(
      '[useInboxRealtimeEvents] Received conversationClientTypingStatusChanged:',
      typingData
    );
    
    // Only show typing indicator if it's for the currently open conversation
    // AND it's not the current user typing (if such info is available, often it's just "someone is typing")
    if (typingData.conversationId === currentConvoId) {
      setTypingInfo({
        text: typingData.text, // e.g., "User is typing..."
        conversationId: typingData.conversationId, 
      });
    } else {
      // If typing is for another conversation, or if text is empty, clear indicator
      setTypingInfo(null); 
    }
  }, []); // currentConversationIdRef is stable


  // Subscriptions setup
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

  useSubscription(gql(subscriptions.customerConnectionChanged), {
    variables: { _id: messengerCustomerId },
    skip: !messengerCustomerId || !currentConversationId, // Only subscribe if we have a customer and an open convo
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

  useSubscription(gql(subscriptions.conversationClientTypingStatusChanged), {
    variables: { _id: currentConversationId }, // Subscribes to typing events for the current conversation
    skip: !currentConversationId,
    onData: ({ data: subData }) => {
      // Ensure subData and its nested properties exist before accessing
      handleTypingStatusChanged(subData?.data?.conversationClientTypingStatusChanged);
    },
    onError: (err) => {
      console.error(
        '[useInboxRealtimeEvents] Subscription error (conversationClientTypingStatusChanged):',
        err
      );
      setTypingInfo(null); // Clear typing info on error
      setConnectionStatus('disconnected');
    },
  });

  return { typingInfo, connectionStatus };
};