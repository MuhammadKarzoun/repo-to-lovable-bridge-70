import * as compose from "lodash.flowright";

import {
  ConversationsQueryResponse,
  ConvesationsQueryVariables,
  IConversation,
} from "@octobots/ui-inbox/src/inbox/types";
import {
  router as routerUtils,
  withProps,
} from "@octobots/ui/src/utils";
import { queries } from "@octobots/ui-inbox/src/inbox/graphql";

import ConversationListComponent from "../../components/leftSidebar/ConversationList";
import { ConversationsTotalCountQueryResponse } from "@octobots/ui-inbox/src/inbox/types";
import { IUser } from "@octobots/ui/src/auth/types";
import { InboxManagementActionConsumer } from "../InboxCore";
import React from "react";
import { generateParams } from "@octobots/ui-inbox/src/inbox/utils";
import { gql } from "@apollo/client";
import { graphql } from "@apollo/client/react/hoc";
import { useNavigate, useLocation } from "react-router-dom";

type Props = {
  currentUser: IUser;
  currentConversationId?: string;
  queryParams: any;
  toggleRowCheckbox: (conversation: IConversation[], checked: boolean) => void;
  selectedConversations: IConversation[];
  counts?: any;
  location: any;
  navigate: any;
};

type FinalProps = {
  conversationsQuery: ConversationsQueryResponse;
  totalCountQuery: ConversationsTotalCountQueryResponse;
  updateCountsForNewMessage: () => void;
} & Props;

const ConversationListContainer: React.FC<FinalProps> = (props) => {
  const {
    navigate,
    location,
    conversationsQuery,
    totalCountQuery,
    queryParams,
    counts,
  } = props;

  // useEffect blocks for direct subscriptions (conversationClientMessageInserted, conversationChanged)
  // were removed in previous phases. This component now relies on Apollo Client cache updates
  // (triggered by useInboxRealtimeEvents or other mutations) to re-render the list.

  const getTotalCount = () => {
    let totalCount = totalCountQuery.conversationsTotalCount || 0;

    if (queryParams && counts) {
      if (queryParams.channelId && counts.byChannels) {
        totalCount += counts.byChannels[queryParams.channelId] || 0;
      }
      if (queryParams.segment && counts.bySegment) {
        totalCount += counts.bySegment[queryParams.segment] || 0;
      }
      if (queryParams.integrationId && counts.byIntegration) {
        totalCount += counts.byIntegration[queryParams.integrationId] || 0;
      }
      if (queryParams.tag && counts.byTags) {
        const tags = queryParams.tag.split(",");

        for (const tag of tags) {
          totalCount += counts.byTags[tag] || 0;
        }
      }
    }

    return totalCount;
  };

  const conversations = conversationsQuery.conversations || [];

  const onChangeConversation = (conversation: IConversation) => {
    if (navigate && location) {
      routerUtils.setParams(navigate, location, { _id: conversation._id });
    }
  };

  const onLoadMore = () => {
    return (
      conversationsQuery &&
      conversationsQuery.fetchMore({
        variables: {
          skip: conversations.length,
        },
        updateQuery: (prevResult, { fetchMoreResult }) => {
          if (!fetchMoreResult || fetchMoreResult.conversations.length === 0) {
            return prevResult;
          }

          const prevConversations = prevResult.conversations || [];
          const prevConversationIds = prevConversations.map(
            (conversation: IConversation) => conversation._id
          );

          const fetchedConversations: IConversation[] = [];

          for (const conversation of fetchMoreResult.conversations) {
            if (!prevConversationIds.includes(conversation._id)) {
              fetchedConversations.push(conversation);
            }
          }

          return {
            ...prevResult,
            conversations: [...prevConversations, ...fetchedConversations],
          };
        },
      })
    );
  };

  const updatedProps = {
    ...props,
    onLoadMore,
    conversations,
    onChangeConversation,
    loading: conversationsQuery.loading,
    totalCount: getTotalCount(),
  };

  return <ConversationListComponent {...updatedProps} />;
};

const ConversationListContainerWithRefetch = (props) => (
  <InboxManagementActionConsumer>
    {({ notifyConsumersOfManagementAction }) => (
      <ConversationListContainer
        {...props}
        updateCountsForNewMessage={notifyConsumersOfManagementAction}
      />
    )}
  </InboxManagementActionConsumer>
);

const generateOptions = (queryParams) => ({
  ...queryParams,
  limit: queryParams.limit ? parseInt(queryParams.limit, 10) : 10,
});

const WithRouterProps = (props) => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <ConversationListContainerWithRouter
      {...props}
      navigate={navigate}
      location={location}
    />
  );
};

const ConversationListContainerWithRouter = withProps<Props>(
  compose(
    graphql<Props, ConversationsQueryResponse, ConvesationsQueryVariables>(
      gql(queries.sidebarConversations),
      {
        name: "conversationsQuery",
        options: ({ queryParams }) => ({
          variables: generateParams(queryParams),
          notifyOnNetworkStatusChange: true,
          fetchPolicy: "cache-and-network", // CHANGED from "network-only"
        }),
      }
    ),
    graphql<Props, ConversationsTotalCountQueryResponse>(
      gql(queries.totalConversationsCount),
      {
        name: "totalCountQuery",
        options: ({ queryParams }) => ({
          notifyOnNetworkStatusChange: true,
          variables: generateOptions(queryParams),
          fetchPolicy: "cache-and-network", // OPTIONAL: Changed for consistency, was network-only
        }),
      }
    )
  )(ConversationListContainerWithRefetch)
);

export default WithRouterProps;