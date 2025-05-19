import * as compose from "lodash.flowright";
import React, { useEffect } from "react";
import { gql } from "@apollo/client";
import { graphql } from "@apollo/client/react/hoc";

import { Alert, withProps } from "@octobots/ui/src/utils";
import {
  ConversationDetailQueryResponse,
  MarkAsReadMutationResponse,
  IConversation,
} from "@octobots/ui-inbox/src/inbox/types";
import {
  mutations,
  queries,
} from "@octobots/ui-inbox/src/inbox/graphql";

import { AppConsumer } from "coreui/appContext";
import ConversationDetailComponent from "../../components/conversationDetail/ConversationDetail";
import { IField } from "@octobots/ui/src/types";
import { IUser } from "@octobots/ui/src/auth/types";
import { useInboxRealtimeEvents } from "../../hooks/useInboxRealtimeEvents";

export type DashboardApp = {
  _id: string;
  __typename?: string;
  description?: string;
  icon?: any;
  iframeUrl?: string;
  name?: string;
};

type Props = {
  currentId: string;
  conversationFields?: IField[];
  msg?: string;
  userDashboardApps?: { userDashboardApps: DashboardApp[] };
};

type FinalProps = {
  detailQuery: ConversationDetailQueryResponse;
  currentUser: IUser;
} & Props &
  MarkAsReadMutationResponse;

const DetailContainer: React.FC<FinalProps> = (props) => {
  const {
    currentId,
    detailQuery,
    markAsReadMutation,
    currentUser,
    // userDashboardApps, // Pass through if needed by component
  } = props;

  const conversation = detailQuery.conversationDetail;
  const messengerCustomerId =
    conversation?.integration?.kind === "messenger" && conversation?.customer?._id
      ? conversation.customer._id
      : undefined;

  // useInboxRealtimeEvents hook provides connectionStatus and handles typingInfo internally,
  // which are then passed to DmWorkArea container, which then passes to DmWorkAreaComponent.
  // This container (DetailContainer) doesn't directly consume typingInfo.
  // It does consume connectionStatus to pass down.
  const { connectionStatus } = useInboxRealtimeEvents({
    currentUser,
    currentConversationId: currentId,
    messengerCustomerId,
  });

  useEffect(() => {
    if (!detailQuery.loading && conversation && currentUser) {
      const readUserIds = conversation.readUserIds || [];
      if (!readUserIds.includes(currentUser._id)) {
        markAsReadMutation({
          variables: { _id: conversation._id },
        }).catch((e) => {
          console.error('[ConversationDetail] Error marking conversation as read', e);
          Alert.error(e.message);
        });
      }
    }
  }, [detailQuery.loading, conversation, currentUser, markAsReadMutation]);

  // Old subscription logic for conversation changes or message status was handled
  // by useInboxRealtimeEvents hook in Phase 1/2. This component relies on cache updates.

  const updatedProps = {
    ...props,
    currentConversationId: currentId,
    currentConversation: conversation,
    refetchDetail: detailQuery.refetch,
    loading: detailQuery.loading,
    connectionStatus, // Pass connectionStatus to ConversationDetailComponent
    // typingInfo is handled by DmWorkArea container/component
  };

  return <ConversationDetailComponent {...updatedProps} />;
};

const WithQuery = withProps<Props & { currentUser: IUser }>(
  compose(
    graphql<Props, ConversationDetailQueryResponse, { _id: string }>(
      gql(queries.conversationDetail),
      {
        name: "detailQuery",
        options: ({ currentId }) => ({
          variables: { _id: currentId },
          fetchPolicy: "network-only",
        }),
      }
    ),
    graphql<Props, MarkAsReadMutationResponse, { _id: string }>(
      gql(mutations.markAsRead),
      {
        name: "markAsReadMutation",
        options: ({ currentId }) => {
          return {
            refetchQueries: [
              // Refetching conversationDetailMarkAsRead might be redundant if cache updates directly
              // for readUserIds. Keeping for now as it was existing logic.
              {
                query: gql(queries.conversationDetailMarkAsRead),
                variables: { _id: currentId },
              },
              { query: gql(queries.unreadConversationsCount) },
            ],
          };
        },
      }
    ),
    graphql<Props, any, { _id: string }>(gql(queries.UserDashboardApps), {
      name: "userDashboardApps",
      options: ({ currentId }) => ({
        variables: { _id: currentId },
        fetchPolicy: "network-only",
      }),
    })
  )(DetailContainer)
);

const WithConsumer = (props: Props) => {
  return (
    <AppConsumer>
      {({ currentUser }) => {
        if (!currentUser) {
          return null; 
        }
        return <WithQuery {...props} currentUser={currentUser} />;
      }}
    </AppConsumer>
  );
};

export default WithConsumer;
