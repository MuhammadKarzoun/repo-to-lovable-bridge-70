import * as compose from "lodash.flowright";

import {
  AddMessageMutationResponse,
  AddMessageMutationVariables,
  UpdateMessageMutationResponse,
  DmConfig,
  IConversation,
  IMessage,
  MessagesQueryResponse,
  MessagesTotalCountQuery
} from "@octobots/ui-inbox/src/inbox/types";
import {
  mutations,
  queries,
  subscriptions
} from "@octobots/ui-inbox/src/inbox/graphql";
import { sendDesktopNotification, withProps } from "@octobots/ui/src/utils";

import { AppConsumer } from "coreui/appContext";
import DmWorkArea from "../../components/conversationDetail/workarea/DmWorkArea";
import { IUser } from "@octobots/ui/src/auth/types";
import { NOTIFICATION_TYPE } from "../../constants";
import React from "react";
import { gql } from "@apollo/client";
import { graphql } from "@apollo/client/react/hoc";
import { isConversationMailKind } from "@octobots/ui-inbox/src/inbox/utils";
import strip from "strip";
import { Alert } from "@octobots/ui/src/utils";

// messages limit
let initialLimit = 10;

type Props = {
  currentConversation: IConversation;
  currentId?: string;
  refetchDetail: () => void;
  dmConfig?: DmConfig;
  content?: any;
  msg?: string;
};

type FinalProps = {
  currentUser: IUser;
  messagesQuery: any;
  messagesTotalCountQuery: any;
} & Props &
  AddMessageMutationResponse
  & UpdateMessageMutationResponse;

type State = {
  loadingMessages: boolean;
  typingInfo?: string;
  hideMask: boolean;
  connectionStatus: 'connected' | 'disconnected' | 'connecting';
};

const getQueryString = (
  type: "messagesQuery" | "countQuery",
  dmConfig?: DmConfig
): string => {
  const defaultQuery =
    type === "messagesQuery"
      ? "conversationMessages"
      : "conversationMessagesTotalCount";

  return dmConfig ? dmConfig[type].query : defaultQuery;
};

const getListQueryName = (dmConfig?: DmConfig) => {
  return dmConfig ? dmConfig.messagesQuery.name : "conversationMessages";
};

const getQueryResult = (queryResponse: object, countQuery?: boolean) => {
  let key = countQuery
    ? "conversationMessagesTotalCount"
    : "conversationMessages";

  for (const k of Object.keys(queryResponse)) {
    if (k.includes("ConversationMessages")) {
      key = k;
      break;
    }
  }

  return queryResponse[key] || [];
};

const getQueryResultKey = (queryResponse: object, countQuery?: boolean) => {
  let key = countQuery
    ? "conversationMessagesTotalCount"
    : "conversationMessages";

  for (const k of Object.keys(queryResponse || {})) {
    if (k.includes("ConversationMessages")) {
      key = k;
      break;
    }
  }

  return key;
};

class WorkArea extends React.Component<FinalProps, State> {
  // Fix 1: Use distinct variables for all subscriptions
  private messageInsertedSubscription;
  private messageStatusChangedSubscription;
  private typingInfoSubscription;

  constructor(props) {
    super(props);

    this.state = { 
      loadingMessages: false, 
      typingInfo: "", 
      hideMask: false,
      connectionStatus: 'connecting' 
    };

    this.messageInsertedSubscription = null;
    this.messageStatusChangedSubscription = null;
    this.typingInfoSubscription = null;
  }

  componentDidMount() {
    // Set up initial subscriptions
    this.setupSubscriptions();
  }

  componentWillUnmount() {
    // Fix 3: Properly clean up subscriptions to prevent memory leaks
    this.cleanupSubscriptions();
  }

  componentWillReceiveProps(nextProps) {
    const { currentUser } = this.props;
    const { currentId, currentConversation } = nextProps;

    // It is first time or subsequent conversation change
    if (currentId !== this.props.currentId) {
      console.log('[DmWorkArea] Conversation changed, updating subscriptions', { 
        from: this.props.currentId, 
        to: currentId 
      });
      
      // Clean up existing subscriptions
      this.cleanupSubscriptions();
      
      // Set up new subscriptions
      this.setupSubscriptions(nextProps);
    }
  }

  // Fix 1 & 3: Separate method for subscription setup with error handling
  setupSubscriptions = (props = this.props) => {
    const { currentId, currentConversation, messagesQuery, dmConfig, currentUser } = props;
    
    if (!currentId) {
      console.log('[DmWorkArea] No conversation ID, skipping subscription setup');
      return;
    }

    try {
      console.log('[DmWorkArea] Setting up message inserted subscription', { conversationId: currentId });
      // Message inserted subscription
      this.messageInsertedSubscription = messagesQuery.subscribeToMore({
        document: gql(subscriptions.conversationMessageInserted),
        variables: { _id: currentId },
        updateQuery: (prev, { subscriptionData }) => {
          try {
            if (!subscriptionData?.data) {
              console.warn('[DmWorkArea] No subscription data received for message insert');
              return prev;
            }

            console.log('[DmWorkArea] Message inserted subscription data', subscriptionData.data);
            const message = subscriptionData.data.conversationMessageInserted;
            const kind = currentConversation.integration.kind;

            if (message.customerId && message.customerId.length > 0) {
              this.setState({ hideMask: true });
            }

            if (!prev) {
              return prev;
            }

            // current user"s message is being showed after insert message
            // mutation. So to prevent from duplication we are ignoring current
            // user"s messages from subscription
            const isMessenger = kind === "messenger";

            if (isMessenger && message.userId === currentUser._id) {
              return prev;
            }

            if (currentId !== this.props.currentId) {
              return prev;
            }

            const messages = getQueryResult(prev);

            // Sometimes it is becoming undefined because of left sidebar query
            if (!messages) {
              return prev;
            }

            // check whether or not already inserted
            const prevEntry = messages.find(m => m._id === message._id);

            if (prevEntry) {
              return prev;
            }

            // add new message to messages list
            const next = {
              ...prev,
              [getListQueryName(dmConfig)]: [...messages, message]
            };

            // send desktop notification
            sendDesktopNotification({
              title: NOTIFICATION_TYPE[kind] || `You have a new ${kind} message`,
              content: strip(message.content) || ""
            });

            return next;
          } catch (error) {
            console.error('[DmWorkArea] Error in message inserted subscription updateQuery', error);
            return prev;
          }
        },
        onError: (error) => {
          // Fix 2: Add proper error handling
          console.error('[DmWorkArea] Error in message inserted subscription', error);
          this.setState({ connectionStatus: 'disconnected' });
        }
      });

      console.log('[DmWorkArea] Setting up message status changed subscription', { conversationId: currentId });
      // Message status changed subscription (separate variable)
      this.messageStatusChangedSubscription = messagesQuery.subscribeToMore({
        document: gql(subscriptions.conversationMessageStatusChanged),
        variables: { _id: currentId },
        updateQuery: (prev, { subscriptionData }) => {
          try {
            if (!subscriptionData?.data) {
              console.warn('[DmWorkArea] No subscription data received for status change');
              return prev;
            }
            
            console.log('[DmWorkArea] Message status changed subscription data', subscriptionData.data);
            const message = subscriptionData.data.conversationMessageStatusChanged;
            const kind = currentConversation.integration.kind;

            if (!prev) {
              return prev;
            }
            
            // current user"s message is being showed after insert message
            // mutation. So to prevent from duplication we are ignoring current
            // user"s messages from subscription
            const isMessenger = kind === "messenger";

            if (isMessenger && message.userId === currentUser._id) {
              return prev;
            }

            if (currentId !== this.props.currentId) {
              return prev;
            }

            const messages = getQueryResult(prev);

            // Sometimes it is becoming undefined because of left sidebar query
            if (!messages) {
              return prev;
            }

            // check whether or not already inserted
            const messageIndex = messages.findIndex((m) => m._id === message._id);

            if (messageIndex === -1) {
              return prev;
            }

            // Create a new messages array to ensure reactivity
            const updatedMessages = [...messages];
            updatedMessages[messageIndex] = { 
              ...updatedMessages[messageIndex], 
              status: message.status, 
              errorMsg: message.errorMsg 
            };

            // add new message to messages list
            const next = {
              ...prev,
              [getListQueryName(dmConfig)]: updatedMessages,
            };

            return next;
          } catch (error) {
            console.error('[DmWorkArea] Error in message status changed subscription updateQuery', error);
            return prev;
          }
        },
        onError: (error) => {
          console.error('[DmWorkArea] Error in message status changed subscription', error);
          this.setState({ connectionStatus: 'disconnected' });
        }
      });

      console.log('[DmWorkArea] Setting up typing info subscription', { conversationId: currentId });
      // Typing info subscription (separate variable)
      this.typingInfoSubscription = messagesQuery.subscribeToMore({
        document: gql(subscriptions.conversationClientTypingStatusChanged),
        variables: { _id: currentId },
        updateQuery: (
          prev,
          {
            subscriptionData
          }
        ) => {
          try {
            if (!subscriptionData?.data) {
              return prev;
            }
            
            const { conversationClientTypingStatusChanged } = subscriptionData.data;
            console.log('[DmWorkArea] Client typing status changed', conversationClientTypingStatusChanged);
            
            this.setState({
              typingInfo: conversationClientTypingStatusChanged.text,
              connectionStatus: 'connected'
            });
            
            return prev;
          } catch (error) {
            console.error('[DmWorkArea] Error in typing info subscription updateQuery', error);
            return prev;
          }
        },
        onError: (error) => {
          console.error('[DmWorkArea] Error in typing info subscription', error);
          this.setState({ connectionStatus: 'disconnected' });
        }
      });
      
      this.setState({ connectionStatus: 'connected' });
    } catch (error) {
      console.error('[DmWorkArea] Error setting up subscriptions', error);
      this.setState({ connectionStatus: 'disconnected' });
    }
  };

  // Fix 3: Separate method to clean up subscriptions
  cleanupSubscriptions = () => {
    console.log('[DmWorkArea] Cleaning up subscriptions');
    
    // Safely unsubscribe from all subscriptions
    if (this.messageInsertedSubscription) {
      try {
        this.messageInsertedSubscription();
        console.log('[DmWorkArea] Unsubscribed from message inserted subscription');
      } catch (error) {
        console.error('[DmWorkArea] Error unsubscribing from message inserted subscription', error);
      }
      this.messageInsertedSubscription = null;
    }

    if (this.messageStatusChangedSubscription) {
      try {
        this.messageStatusChangedSubscription();
        console.log('[DmWorkArea] Unsubscribed from message status changed subscription');
      } catch (error) {
        console.error('[DmWorkArea] Error unsubscribing from message status changed subscription', error);
      }
      this.messageStatusChangedSubscription = null;
    }

    if (this.typingInfoSubscription) {
      try {
        this.typingInfoSubscription();
        console.log('[DmWorkArea] Unsubscribed from typing info subscription');
      } catch (error) {
        console.error('[DmWorkArea] Error unsubscribing from typing info subscription', error);
      }
      this.typingInfoSubscription = null;
      this.setState({ typingInfo: "" });
    }
  };

  addMessage = ({
    variables,
    optimisticResponse,
    callback,
    kind
  }: {
    variables: any;
    optimisticResponse: any;
    callback?: (e?) => void;
    kind: string;
  }) => {
    console.log("[DmWorkArea] Adding message", { variables, kind });
    const { addMessageMutation, currentId, dmConfig } = this.props;
    // immediate ui update =======
    let update;

    if (optimisticResponse) {
      update = (cache, { data: { conversationMessageAdd } }) => {
        try {
          const message = conversationMessageAdd;

          let messagesQuery = queries.conversationMessages;

          if (dmConfig) {
            messagesQuery = getQueryString("messagesQuery", dmConfig);
          }

          const selector = {
            query: gql(messagesQuery),
            variables: {
              conversationId: currentId,
              limit: initialLimit,
              skip: 0
            }
          };

          try {
            cache.updateQuery(selector, data => {
              if (!data) return {};
              
              const key = getQueryResultKey(data || {});
              const messages = data ? data[key] : [];

              // check duplications
              if (messages.find(m => m._id === message._id)) {
                return data;
              }

              return { ...data, [key]: [...messages, message] };
            });
          } catch (e) {
            console.error('[DmWorkArea] Error updating cache', e);
          }
        } catch (error) {
          console.error('[DmWorkArea] Error in optimistic update', error);
        }
      };
    }

    addMessageMutation({ variables, optimisticResponse, update })
      .then(() => {
        console.log('[DmWorkArea] Message added successfully');
        if (callback) {
          callback();

          // clear saved messages from storage
          localStorage.removeItem("replyToMessage");
          localStorage.removeItem(currentId || "");
        }
      })
      .catch(e => {
        console.error('[DmWorkArea] Error adding message', e);
        if (callback) {
          callback(e);
        }
      });
  };

  loadMoreMessages = () => {
    const { currentId, messagesTotalCountQuery, messagesQuery, dmConfig } =
      this.props;

    console.log('[DmWorkArea] Loading more messages', { conversationId: currentId });
    
    try {
      const conversationMessagesTotalCount = getQueryResult(
        messagesTotalCountQuery,
        true
      );

      const conversationMessages = getQueryResult(messagesQuery);

      const loading = messagesQuery.loading || messagesTotalCountQuery.loading;
      const hasMore =
        conversationMessagesTotalCount > conversationMessages.length;

      if (!loading && hasMore) {
        this.setState({ loadingMessages: true });

        messagesQuery.fetchMore({
          variables: {
            conversationId: currentId,
            limit: 10,
            skip: conversationMessages.length
          },
          updateQuery: (prev, { fetchMoreResult }) => {
            try {
              this.setState({ loadingMessages: false });

              if (!fetchMoreResult) {
                return prev;
              }

              const prevConversationMessages = getQueryResult(prev);
              const prevMessageIds = prevConversationMessages.map(m => m._id);

              const fetchedMessages: IMessage[] = [];

              const more = getQueryResult(fetchMoreResult);

              for (const message of more) {
                if (!prevMessageIds.includes(message._id)) {
                  fetchedMessages.push(message);
                }
              }

              console.log('[DmWorkArea] Loaded more messages', { count: fetchedMessages.length });

              return {
                ...prev,
                [getListQueryName(dmConfig)]: [
                  ...fetchedMessages,
                  ...prevConversationMessages
                ]
              };
            } catch (error) {
              console.error('[DmWorkArea] Error in fetchMore updateQuery', error);
              this.setState({ loadingMessages: false });
              return prev;
            }
          }
        }).catch(error => {
          console.error('[DmWorkArea] Error fetching more messages', error);
          this.setState({ loadingMessages: false });
        });
      }
    } catch (error) {
      console.error('[DmWorkArea] Error in loadMoreMessages', error);
      this.setState({ loadingMessages: false });
    }

    return Promise.resolve();
  };

  updateMsg = (id, content, action) => {
    const { updateMessageMutation } = this.props;

    console.log('[DmWorkArea] Updating message', { id, action });
    
    updateMessageMutation({
      variables: { _id: id, content: content },
    })
      .then(() => {
        if (action == "delete") Alert.success("You successfully deleted the message");
        else Alert.success("You successfully updated the message");
      })
      .catch((e) => {
        console.error('[DmWorkArea] Error updating message', e);
        Alert.error(e.message);
      });
  }

  render() {
    const { loadingMessages, typingInfo, hideMask, connectionStatus } = this.state;
    const { messagesQuery, msg } = this.props;

    const conversationMessages = getQueryResult(messagesQuery);

    const updatedProps = {
      ...this.props,
      conversationMessages,
      loadMoreMessages: this.loadMoreMessages,
      addMessage: this.addMessage,
      loading: messagesQuery.loading || loadingMessages,
      refetchMessages: messagesQuery.refetch,
      typingInfo,
      hideMask,
      connectionStatus
    };

    return <DmWorkArea updateMsg={this.updateMsg} msg={msg} {...updatedProps} />;
  }
}

const generateWithQuery = (props: Props) => {
  const { dmConfig, currentConversation } = props;
  const { integration } = currentConversation;

  let listQuery = queries.conversationMessages;
  let countQuery = queries.conversationMessagesTotalCount;

  if (dmConfig) {
    listQuery = getQueryString("messagesQuery", dmConfig);
    countQuery = getQueryString("countQuery", dmConfig);
  }

  return withProps<Props & { currentUser: IUser }>(
    compose(
      graphql<
        Props,
        MessagesQueryResponse,
        { conversationId?: string; limit: number }
      >(gql(listQuery), {
        name: "messagesQuery",
        options: ({ currentId }) => {
          const windowHeight = window.innerHeight;
          const isMail = isConversationMailKind(currentConversation);
          const isDm = integration.kind === "messenger" || dmConfig;

          // 330 - height of above and below sections of detail area
          // 45 -  min height of per message
          initialLimit = !isMail
            ? Math.round((windowHeight - 330) / 45 + 1)
            : 10;

          return {
            variables: {
              conversationId: currentId,
              limit: isDm || isMail ? initialLimit : 0,
              skip: 0
            },
            fetchPolicy: "network-only"
          };
        }
      }),
      graphql<Props, MessagesTotalCountQuery, { conversationId?: string }>(
        gql(countQuery),
        {
          name: "messagesTotalCountQuery",
          options: ({ currentId }) => ({
            variables: { conversationId: currentId },
            fetchPolicy: "network-only"
          })
        }
      ),
      graphql<Props, AddMessageMutationResponse, AddMessageMutationVariables>(
        gql(mutations.conversationMessageAdd),
        {
          name: "addMessageMutation"
        }
      ),
      graphql<Props, UpdateMessageMutationResponse, { _id: string, content: any }>(
        gql(mutations.conversationMessageUpdate),
        {
          name: "updateMessageMutation",
        },
      ),
    )(WorkArea)
  );
};

let WithQuery;

export const resetDmWithQueryCache = () => {
  WithQuery = null;
};

const WithConsumer = (props: Props) => {
  const [isInitial, setIsInitial] = React.useState(true);

  React.useEffect(() => {
    setIsInitial(false);
  }, [WithQuery]);

  return (
    <AppConsumer>
      {({ currentUser }) => {
        if (!currentUser) {
          return null;
        }

        if (isInitial) {
          WithQuery = generateWithQuery(props);
        }

        return <WithQuery {...props} currentUser={currentUser} />;
      }}
    </AppConsumer>
  );
};

export default WithConsumer;
