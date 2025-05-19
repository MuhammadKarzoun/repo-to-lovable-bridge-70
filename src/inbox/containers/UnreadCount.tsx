
import * as compose from 'lodash.flowright';

import { isEnabled } from '@octobots/ui/src/utils/core';
import { queries } from '@octobots/ui-inbox/src/inbox/graphql';

import { IUser } from '@octobots/ui/src/auth/types';
import React from 'react';
import { UnreadConversationsTotalCountQueryResponse } from '@octobots/ui-inbox/src/inbox/types';
import UnreadCountComponent from '../components/UnreadCount';
import { gql } from '@apollo/client';
import { graphql } from '@apollo/client/react/hoc';
import withCurrentUser from '@octobots/ui/src/auth/containers/withCurrentUser';
import { withProps } from '@octobots/ui/src/utils';

type Props = {
  currentUser: IUser;
};

type FinalProps = {
  unreadConversationsCountQuery: UnreadConversationsTotalCountQueryResponse;
} & Props;

class UnreadCountContainer extends React.Component<FinalProps> {
  // Subscriptions and related lifecycle methods (componentWillMount)
  // were removed in earlier phases. The unread count is now updated
  // via Apollo Client cache modifications performed by useInboxRealtimeEvents.

  render() {
    const { unreadConversationsCountQuery } = this.props;

    const unreadConversationsCount =
      (unreadConversationsCountQuery &&
        unreadConversationsCountQuery.conversationsTotalUnreadCount) ||
      0;

    const unreadCountProps = {
      unreadConversationsCount,
    };

    return <UnreadCountComponent {...unreadCountProps} />;
  }
}

export default withProps<Props>(
  compose(
    graphql<{}, UnreadConversationsTotalCountQueryResponse>(
      gql(queries.unreadConversationsCount),
      {
        name: 'unreadConversationsCountQuery',
        options: () => ({
          fetchPolicy: 'network-only',
          notifyOnNetworkStatusChange: true, // Remains true to react to cache updates
        }),
        skip: !isEnabled('inbox'),
      },
    ),
  )(withCurrentUser(UnreadCountContainer)),
);
