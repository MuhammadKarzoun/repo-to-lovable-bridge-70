
import * as compose from "lodash.flowright";

import { Alert, withProps } from "@octobots/ui/src/utils";
import {
  ConversationDetailQueryResponse,
  MarkAsReadMutationResponse,
} from "@octobots/ui-inbox/src/inbox/types";
import {
  mutations,
  queries,
  subscriptions,
} from "@octobots/ui-inbox/src/inbox/graphql";

import { AppConsumer } from "coreui/appContext";
import ConversationDetail from "../../components/conversationDetail/ConversationDetail";
import { IField } from "@octobots/ui/src/types";
import { IUser } from "@octobots/ui/src/auth/types";
import React from "react";
import { gql } from "@apollo/client";
import { graphql } from "@apollo/client/react/hoc";

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
} & Props &
  MarkAsReadMutationResponse & { currentUser: IUser };

type State = {
  connectionStatus: 'connected' | 'disconnected' | 'connecting';
};

class DetailContainer extends React.Component<FinalProps, State> {
  // Use separate variables for different subscriptions
  private conversationChangedSubscription;
  private customerConnectionSubscription;

  constructor(props) {
    super(props);

    this.state = {
      connectionStatus: 'connecting',
    };

    this.conversationChangedSubscription = null;
    this.customerConnectionSubscription = null;
  }

  componentDidMount() {
    // Set up initial subscriptions
    this.setupSubscriptions();
  }

  componentWillUnmount() {
    this.cleanupSubscriptions();
  }

  componentWillReceiveProps(nextProps) {
    const { currentId, detailQuery } = nextProps;

    // if conversation id changed, then unsubscribe previous subscriptions
    if (this.props.currentId !== currentId) {
      console.log('[ConversationDetail] Conversation changed, updating subscriptions', { 
        from: this.props.currentId, 
        to: currentId 
      });
      
      // Clean up existing subscriptions
      this.cleanupSubscriptions();
      
      // Set up new subscriptions if we have conversation details
      if (!detailQuery.loading && detailQuery.conversationDetail) {
        this.setupSubscriptions(nextProps);
      }
    }
  }

  // Set up all subscriptions with error handling
  setupSubscriptions = (props = this.props) => {
    const { currentId, detailQuery } = props;
    
    if (!currentId || !detailQuery.conversationDetail) {
      return;
    }

    try {
      // Listen for conversation changes like status, assignee
      console.log('[ConversationDetail] Setting up conversation changed subscription', { conversationId: currentId });
      
      this.conversationChangedSubscription = detailQuery.subscribeToMore({
        document: gql(subscriptions.conversationChanged),
        variables: { _id: currentId },
        updateQuery: () => {
          this.props.detailQuery.refetch();
          return undefined;
        },
        onError: (error) => {
          console.error('[ConversationDetail] Error in conversation changed subscription', error);
          this.setState({ connectionStatus: 'disconnected' });
        }
      });

      // Listen for customer connection if it's a messenger conversation
      const conversation = detailQuery.conversationDetail;
      
      if (
        conversation.integration &&
        conversation.integration.kind === "messenger"
      ) {
        const customerId = conversation.customer && conversation.customer._id;
        
        if (customerId) {
          console.log('[ConversationDetail] Setting up customer connection subscription', { customerId });
          
          this.customerConnectionSubscription = detailQuery.subscribeToMore({
            document: gql(subscriptions.customerConnectionChanged),
            variables: { _id: customerId },
            updateQuery: (prev, { subscriptionData: { data } }) => {
              try {
                if (!data) {
                  return prev;
                }
                
                const prevConv = prev.conversationDetail;
                const customerConnection = data.customerConnectionChanged;

                if (prevConv && prevConv.customer._id === customerConnection._id) {
                  this.props.detailQuery.refetch();
                }
                
                return prev;
              } catch (error) {
                console.error('[ConversationDetail] Error in customer connection subscription updateQuery', error);
                return prev;
              }
            },
            onError: (error) => {
              console.error('[ConversationDetail] Error in customer connection subscription', error);
              this.setState({ connectionStatus: 'disconnected' });
            }
          });
        }
      }
      
      this.setState({ connectionStatus: 'connected' });
    } catch (error) {
      console.error('[ConversationDetail] Error setting up subscriptions', error);
      this.setState({ connectionStatus: 'disconnected' });
    }
  };

  // Clean up all subscriptions
  cleanupSubscriptions = () => {
    console.log('[ConversationDetail] Cleaning up subscriptions');
    
    // Safely unsubscribe from conversation changes subscription
    if (this.conversationChangedSubscription) {
      try {
        this.conversationChangedSubscription();
        console.log('[ConversationDetail] Unsubscribed from conversation changed subscription');
      } catch (error) {
        console.error('[ConversationDetail] Error unsubscribing from conversation changed subscription', error);
      }
      this.conversationChangedSubscription = null;
    }

    // Safely unsubscribe from customer connection subscription
    if (this.customerConnectionSubscription) {
      try {
        this.customerConnectionSubscription();
        console.log('[ConversationDetail] Unsubscribed from customer connection subscription');
      } catch (error) {
        console.error('[ConversationDetail] Error unsubscribing from customer connection subscription', error);
      }
      this.customerConnectionSubscription = null;
    }
  };

  render() {
    const {
      currentId,
      detailQuery,
      markAsReadMutation,
      currentUser,
      userDashboardApps,
    } = this.props;
    const { connectionStatus } = this.state;

    const loading = detailQuery.loading;
    const conversation = detailQuery.conversationDetail;

    // mark as read ============
    if (!loading && conversation) {
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

    const updatedProps = {
      ...this.props,
      currentConversationId: currentId,
      currentConversation: conversation,
      refetchDetail: detailQuery.refetch,
      loading,
      connectionStatus,
    };

    return <ConversationDetail {...updatedProps} />;
  }
}

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
      {({ currentUser }) => (
        <WithQuery {...props} currentUser={currentUser || ({} as IUser)} />
      )}
    </AppConsumer>
  );
};

export default WithConsumer;
