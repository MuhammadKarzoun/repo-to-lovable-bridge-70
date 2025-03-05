import * as compose from 'lodash.flowright';

import { ActivityLogQueryResponse } from '@octobots/ui-contacts/src/customers/types';
import { ICustomer } from '@octobots/ui-contacts/src/customers/types';
import { IUser } from '@octobots/ui/src/auth/types';
import React from 'react';
import SidebarActivity from '../../components/conversationDetail/sidebar/SidebarActivity';
import { gql } from '@apollo/client';
import { graphql } from '@apollo/client/react/hoc';
import { queries } from '@octobots/ui-log/src/activityLogs/graphql';
import { withProps } from '@octobots/ui/src/utils';

type Props = {
  customer: ICustomer;
  currentSubTab: string;
};

type FinalProps = {
  customerActivityLogQuery: ActivityLogQueryResponse;
  currentUser: IUser;
} & Props;

class SidebarActivityContainer extends React.Component<FinalProps> {
  render() {
    const { customerActivityLogQuery, currentUser, customer } = this.props;

    const updatedProps = {
      ...this.props,
      customer,
      loadingLogs: customerActivityLogQuery.loading,
      activityLogsCustomer: customerActivityLogQuery.activityLogs || [],
      currentUser
    };

    return <SidebarActivity {...updatedProps} />;
  }
}

export default withProps<Props>(
  compose(
    graphql<Props, ActivityLogQueryResponse>(gql(queries.activityLogs), {
      name: 'customerActivityLogQuery',
      options: ({ customer }) => ({
        variables: {
          contentId: customer._id,
          contentType: 'customer'
        }
      })
    })
  )(SidebarActivityContainer)
);
