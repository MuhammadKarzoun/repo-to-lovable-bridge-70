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
import { promises } from "dns";
//
// import { BrandsQueryResponse } from "@octobots/ui/src/brands/types";
// import { queries as brandQuery } from "@octobots/ui/src/brands/graphql";

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
  // 
  //  brandsQuery: BrandsQueryResponse;
} & Props &
  AddMessageMutationResponse
  & UpdateMessageMutationResponse;

type State = {
  loadingMessages: boolean;
  typingInfo?: string;
  hideMask: boolean;
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
  private prevMessageInsertedSubscription;
  private prevMessageStatusUpdatedSubscription
  private prevTypingInfoSubscription;

  constructor(props) {
    super(props);

    this.state = { loadingMessages: false, typingInfo: "", hideMask: false };

    this.prevMessageInsertedSubscription = null;
    this.prevMessageStatusUpdatedSubscription = null;

  }

  componentWillReceiveProps(nextProps) {
    const { currentUser } = this.props;
    const { currentId, currentConversation, messagesQuery, dmConfig } =
      nextProps;

    // It is first time or subsequent conversation change
    if (
      !this.prevMessageInsertedSubscription ||
      currentId !== this.props.currentId
    ) {
      // Unsubscribe previous subscription ==========
      if (this.prevMessageInsertedSubscription) {
        this.prevMessageInsertedSubscription();
      }
      
      if (!this.prevMessageStatusUpdatedSubscription || currentId !== this.props.currentId) {
        this.prevMessageStatusUpdatedSubscription();
      }

      if (this.prevTypingInfoSubscription) {
        this.setState({ typingInfo: "" });
        this.prevTypingInfoSubscription();
      }

      // Start new subscriptions =============
      this.prevMessageInsertedSubscription = messagesQuery.subscribeToMore({
        document: gql(subscriptions.conversationMessageInserted),
        variables: { _id: currentId },
        updateQuery: (prev, { subscriptionData }) => {
          console.log('subscriptionData', JSON.stringify(subscriptionData));
          const message = subscriptionData.data.conversationMessageInserted;
          const kind = currentConversation.integration.kind;

          if (message.customerId && message.customerId.length > 0) {
            this.setState({ hideMask: true });
          }

          if (!prev) {
            return;
          }

          // current user"s message is being showed after insert message
          // mutation. So to prevent from duplication we are ignoring current
          // user"s messages from subscription
          const isMessenger = kind === "messenger";

          if (isMessenger && message.userId === currentUser._id) {
            return;
          }

          if (currentId !== this.props.currentId) {
            return;
          }

          const messages = getQueryResult(prev);

          // Sometimes it is becoming undefined because of left sidebar query
          if (!messages) {
            return;
          }

          // check whether or not already inserted
          const prevEntry = messages.find(m => m._id === message._id);

          if (prevEntry) {
            return;
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
        },
      });

      // added by hichem
      this.prevMessageStatusUpdatedSubscription = messagesQuery.subscribeToMore({
        document: gql(subscriptions.conversationMessageStatusChanged),
        variables: { _id: currentId },
        updateQuery: (prev, { subscriptionData }) => {
          console.log('subscriptionData conversationMessageStatusChanged', JSON.stringify(subscriptionData));
          const message = subscriptionData.data.conversationMessageStatusChanged;
          const kind = currentConversation.integration.kind;

          if (!prev) {
            return;
          }
          
          // current user"s message is being showed after insert message
          // mutation. So to prevent from duplication we are ignoring current
          // user"s messages from subscription
          const isMessenger = kind === "messenger";

          if (isMessenger && message.userId === currentUser._id) {
            return;
          }

          if (currentId !== this.props.currentId) {
            return;
          }

          const messages = getQueryResult(prev);

          // Sometimes it is becoming undefined because of left sidebar query
          if (!messages) {
            return;
          }

          // check whether or not already inserted
          let prevEntry = messages.find((m) => m._id === message._id);

          if (!prevEntry) {
            return;
          }

          prevEntry = { ...prevEntry, status: message.status, errorMsg: message.errorMsg }

          // add new message to messages list
          const next = {
            ...prev,
            [getListQueryName(dmConfig)]: messages,
          };

          return next;
        },
      });

      this.prevTypingInfoSubscription = messagesQuery.subscribeToMore({
        document: gql(subscriptions.conversationClientTypingStatusChanged),
        variables: { _id: currentId },
        updateQuery: (
          _prev,
          {
            subscriptionData: {
              data: { conversationClientTypingStatusChanged }
            }
          }
        ) => {
          this.setState({
            typingInfo: conversationClientTypingStatusChanged.text
          });
        }
      });
    }
  }

  addMessage = ({
    variables,
    optimisticResponse,
    callback
  }: {
    variables: any;
    optimisticResponse: any;
    callback?: (e?) => void;
  }) => {
    const { addMessageMutation, currentId, dmConfig } = this.props;
    // immediate ui update =======
    let update;

    if (optimisticResponse) {
      update = (cache, { data: { conversationMessageAdd } }) => {
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
            const key = getQueryResultKey(data || {});
            const messages = data ? data[key] : [];

            // check duplications
            if (messages.find(m => m._id === message._id)) {
              return {};
            }

            return { [key]: [...messages, message] };
          });
        } catch (e) {
          console.error(e);
          return;
        }
      };
    }

    addMessageMutation({ variables, optimisticResponse, update })
      .then(() => {
        if (callback) {
          callback();

          // clear saved messages from storage
          localStorage.removeItem("replyToMessage");
          localStorage.removeItem(currentId || "");
        }
      })
      .catch(e => {
        if (callback) {
          callback(e);
        }
      });
  };

  loadMoreMessages = () => {
    const { currentId, messagesTotalCountQuery, messagesQuery, dmConfig } =
      this.props;

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

          return {
            ...prev,
            [getListQueryName(dmConfig)]: [
              ...fetchedMessages,
              ...prevConversationMessages
            ]
          };
        }
      });
    }
  };

  updateMsg = (id, content, action) => {
    const { updateMessageMutation } = this.props;

    updateMessageMutation({
      variables: { _id: id, content: content },
    })
      .then(() => {
        if (action == "delete") Alert.success("You successfully deleted the message");
        else Alert.success("You successfully updated the message");
      })
      .catch((e) => {
        Alert.error(e.message);
      });
  }

  render() {
    const { loadingMessages, typingInfo, hideMask } = this.state;
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
      // brands: brandsQuery.brands
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
