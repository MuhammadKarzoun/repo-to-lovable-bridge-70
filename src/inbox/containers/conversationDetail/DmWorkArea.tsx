import * as compose from "lodash.flowright";
import React, { useState, useEffect } from "react";

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
} from "@octobots/ui-inbox/src/inbox/graphql";
import { Alert, withProps } from "@octobots/ui/src/utils";

import { AppConsumer } from "coreui/appContext";
import DmWorkAreaComponent from "../../components/conversationDetail/workarea/DmWorkArea";
import { IUser } from "@octobots/ui/src/auth/types";
import { isConversationMailKind } from "@octobots/ui-inbox/src/inbox/utils";
import { useInboxRealtimeEvents } from "../../hooks/useInboxRealtimeEvents";
import { gql } from "@apollo/client";
import { graphql } from "@apollo/client/react/hoc";

// messages limit
let initialLimit = 10;

type Props = {
  currentConversation: IConversation;
  refetchDetail: () => void;
  dmConfig?: DmConfig;
  content?: any;
  msg?: string;
  toggle?: () => void;
  userDashboardApps?: { userDashboardApps: any[] }; 
  connectionStatus?: 'connected' | 'disconnected' | 'connecting'; // Passed from WorkAreaWithHook
  typingInfo?: string | null; // Passed from WorkAreaWithHook
};

type FinalProps = {
  currentUser: IUser;
  messagesQuery: any; // Specific type would be MessagesQueryResponse with dynamic key
  messagesTotalCountQuery: any; // Specific type would be MessagesTotalCountQuery with dynamic key
} & Props &
  AddMessageMutationResponse &
  UpdateMessageMutationResponse;

// State for WorkArea class component
type WorkAreaState = {
  loadingMessages: boolean;
  hideMask: boolean;
  // Removed state related to direct WebSocket subscriptions like typingInfo, connectionStatus
  // as these are now passed as props from WorkAreaWithHook.
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

  // Handle cases where queryResponse might be null or undefined early
  if (!queryResponse) {
    return countQuery ? 0 : [];
  }
  
  for (const k of Object.keys(queryResponse)) {
    if (k.includes("ConversationMessages")) {
      key = k;
      break;
    }
  }
  
  // Ensure a default return type if key is not found or value is nullish
  return queryResponse[key] || (countQuery ? 0 : []);
};

const getQueryResultKey = (queryResponse: object, countQuery?: boolean) => {
  let key = countQuery
    ? "conversationMessagesTotalCount"
    : "conversationMessages";

  if (!queryResponse) {
    return key; // Return default key if queryResponse is null/undefined
  }

  for (const k of Object.keys(queryResponse || {})) {
    if (k.includes("ConversationMessages")) {
      key = k;
      break;
    }
  }

  return key;
};

class WorkArea extends React.Component<FinalProps, WorkAreaState> {
  constructor(props: FinalProps) {
    super(props);

    this.state = { 
      loadingMessages: false, 
      hideMask: false,
      // No initial state for typingInfo or connectionStatus here
    };
  }

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
    const { addMessageMutation, currentConversation, dmConfig } = this.props;
    // immediate ui update =======
    let update;

    if (optimisticResponse) {
      update = (cache, { data: { conversationMessageAdd } }) => {
        try {
          const message = conversationMessageAdd;

          let messagesQueryString = queries.conversationMessages; // default

          if (dmConfig) {
            messagesQueryString = getQueryString("messagesQuery", dmConfig);
          }
          
          const queryName = getListQueryName(dmConfig);


          const selector = {
            query: gql(messagesQueryString),
            variables: {
              conversationId: currentConversation._id,
              limit: initialLimit, // Ensure initialLimit is correctly scoped or passed
              skip: 0
            }
          };

          try {
             const dataInCache = cache.readQuery(selector);
             if (dataInCache) {
                const messages = dataInCache[queryName] || [];
                 // check duplications
                if (messages.find(m => m._id === message._id)) {
                  return; // Do not update if message already exists
                }
                cache.writeQuery({
                  ...selector,
                  data: { ...dataInCache, [queryName]: [...messages, message] },
                });
             } else {
                // If query is not in cache, it might be an issue with variables matching
                // or it simply hasn't been fetched yet. Forcing a write might be risky
                // without knowing the exact structure.
                // For now, we'll assume if it's not there, the optimistic update might not apply cleanly.
                console.warn('[DmWorkArea] Optimistic update: Query not found in cache for selector:', selector);
             }
          } catch (e) {
            console.error('[DmWorkArea] Error reading/writing query from/to cache for optimistic update', e);
          }
        } catch (error) {
          console.error('[DmWorkArea] Error in optimistic update logic', error);
        }
      };
    }

    addMessageMutation({ variables, optimisticResponse, update })
      .then(() => {
        console.log('[DmWorkArea] Message added successfully');
        if (callback) {
          callback();
          localStorage.removeItem("replyToMessage");
          localStorage.removeItem(currentConversation._id || "");
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
    const { currentConversation, messagesTotalCountQuery, messagesQuery, dmConfig } =
      this.props;

    console.log('[DmWorkArea] Loading more messages', { conversationId: currentConversation._id });
    
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
            conversationId: currentConversation._id,
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
              const listQueryName = getListQueryName(dmConfig);
              return {
                ...prev,
                [listQueryName]: [ // Use dynamic list query name
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
        if (action === "delete") Alert.success("You successfully deleted the message");
        else Alert.success("You successfully updated the message");
      })
      .catch((e) => {
        console.error('[DmWorkArea] Error updating message', e);
        Alert.error(e.message);
      });
  }

  render() {
    const { loadingMessages, hideMask } = this.state;
    // typingInfo and connectionStatus are now received as props
    const { messagesQuery, msg, typingInfo, connectionStatus } = this.props;

    const conversationMessages = getQueryResult(messagesQuery);

    const updatedProps = {
      ...this.props,
      conversationMessages,
      loadMoreMessages: this.loadMoreMessages,
      addMessage: this.addMessage,
      loading: messagesQuery.loading || loadingMessages,
      refetchMessages: messagesQuery.refetch,
      typingInfo, // Pass prop from WorkAreaWithHook
      hideMask,
      connectionStatus, // Pass prop from WorkAreaWithHook
    };

    return <DmWorkAreaComponent updateMsg={this.updateMsg} msg={msg} {...updatedProps} />;
  }
}

const WorkAreaWithHook: React.FC<FinalProps> = (props) => {
  const { currentUser, currentConversation } = props;

  const messengerCustomerId =
    currentConversation?.integration?.kind === "messenger" && currentConversation?.customer?._id
      ? currentConversation.customer._id
      : undefined;

  // useInboxRealtimeEvents provides typingInfo and connectionStatus
  const { typingInfo, connectionStatus } = useInboxRealtimeEvents({
    currentUser,
    currentConversationId: currentConversation._id,
    messengerCustomerId,
  });

  // Pass typingInfo and connectionStatus as props to the WorkArea class component
  return <WorkArea {...props} typingInfo={typingInfo} connectionStatus={connectionStatus} />;
};

const WithQueryAndHook = (props: Props & { currentUser: IUser }) => {
  const { dmConfig, currentConversation } = props;
  let listQuery = queries.conversationMessages;
  let countQuery = queries.conversationMessagesTotalCount;

  if (dmConfig) {
    listQuery = getQueryString("messagesQuery", dmConfig);
    countQuery = getQueryString("countQuery", dmConfig);
  }
  
  const ComposedComponent = compose(
    graphql<
      Props & { currentUser: IUser },
      MessagesQueryResponse, // Replace 'any' with specific type if possible
      { conversationId?: string; limit: number; skip: number; }
    >(gql(listQuery), {
      name: "messagesQuery",
      options: ({ currentConversation: currentConvoDetail, dmConfig: currentDmConfig }) => {
        const windowHeight = window.innerHeight;
        // Make sure currentConvoDetail and its properties are checked for existence
        const isMail = currentConvoDetail ? isConversationMailKind(currentConvoDetail) : false;
        const isDm = (currentConvoDetail && currentConvoDetail.integration?.kind === "messenger") || currentDmConfig;

        initialLimit = !isMail
          ? Math.round((windowHeight - 330) / 45 + 1)
          : 10;

        return {
          variables: {
            conversationId: currentConvoDetail._id,
            limit: isDm || isMail ? initialLimit : 0, // Ensure 'isDm' is correctly evaluated
            skip: 0
          },
          fetchPolicy: "network-only" // Remains network-only for initial fetch
        };
      }
    }),
    graphql<Props & { currentUser: IUser }, MessagesTotalCountQuery, { conversationId?: string }>( // Replace 'any'
      gql(countQuery),
      {
        name: "messagesTotalCountQuery",
        options: ({ currentConversation }) => ({
          variables: { conversationId: currentConversation._id },
          fetchPolicy: "network-only"
        })
      }
    ),
    graphql<Props & { currentUser: IUser }, AddMessageMutationResponse, AddMessageMutationVariables>(
      gql(mutations.conversationMessageAdd),
      {
        name: "addMessageMutation"
      }
    ),
    graphql<Props & { currentUser: IUser }, UpdateMessageMutationResponse, { _id: string, content: any }>(
      gql(mutations.conversationMessageUpdate),
      {
        name: "updateMessageMutation",
      },
    )
  )(WorkAreaWithHook); // This now wraps WorkAreaWithHook

  return <ComposedComponent {...props} />;
};

let WithQuery;

export const resetDmWithQueryCache = () => {
  WithQuery = null;
};

const WithConsumer = (props: Props) => {
  return (
    <AppConsumer>
      {({ currentUser }) => {
        if (!currentUser) {
          return null;
        }
        // Ensure Props passed to WithQueryAndHook matches its expected Props type
        return <WithQueryAndHook {...props} currentUser={currentUser} />;
      }}
    </AppConsumer>
  );
};

export default WithConsumer;
