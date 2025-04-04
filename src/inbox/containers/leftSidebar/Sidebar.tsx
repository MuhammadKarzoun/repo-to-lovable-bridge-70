import * as compose from "lodash.flowright";

import { Alert, confirm, withProps } from "@octobots/ui/src/utils";
import {
  ResolveAllMutationResponse,
  ResolveAllMutationVariables,
} from "@octobots/ui-inbox/src/inbox/types";
import {
  getConfig,
  refetchSidebarConversationsOptions,
  setConfig,
} from "@octobots/ui-inbox/src/inbox/utils";
import { mutations, queries } from "@octobots/ui-inbox/src/inbox/graphql";

import { AppConsumer } from "coreui/appContext";
import Bulk from "@octobots/ui/src/components/Bulk";
import DumbSidebar from "../../components/leftSidebar/Sidebar";
import { IBulkContentProps } from "@octobots/ui/src/components/Bulk";
import { InboxManagementActionConsumer } from "../InboxCore";
import React from "react";
import { gql } from "@apollo/client";
import { graphql } from "@apollo/client/react/hoc";
import { useNavigate, useLocation } from "react-router-dom";

import { loadErrorMessages, loadDevMessages } from "@apollo/client/dev";


loadDevMessages();
loadErrorMessages();

type Props = {
  queryParams: any;
  currentConversationId?: string;
  navigate: (path: string) => void;
  location: any;
};

type FinalProps = Props & ResolveAllMutationResponse;

const STORAGE_KEY = "octobots_additional_sidebar_config";

class Sidebar extends React.Component<FinalProps> {
  toggle = ({ isOpen }: { isOpen: boolean }) => {
    const config = getConfig(STORAGE_KEY);

    config.showAddition = isOpen;

    setConfig(STORAGE_KEY, config);
  };

  // resolve all conversation
  resolveAll = (notifyHandler) => () => {
    const message = "Are you sure you want to resolve all conversations?";

    confirm(message).then(() => {
      this.props
        .resolveAllMutation({ variables: this.props.queryParams })
        .then(() => {
          if (notifyHandler) {
            notifyHandler();
          }

          Alert.success("The conversation has been resolved!");
        })
        .catch((e) => {
          Alert.error(e.message);
        });
    });
  };

  render() {
    if (!localStorage.getItem(STORAGE_KEY)) {
      setConfig(STORAGE_KEY, {
        showAddition: false,
        showChannels: true,
        showBrands: false,
        showIntegrations: false,
        showTags: false,
        showSegments: false,
      });
    }

    const { currentConversationId, queryParams, navigate, location } = this.props;
    const content = ({ bulk, toggleBulk, emptyBulk }: IBulkContentProps) => {
      return (
        <AppConsumer>
          {({ currentUser }) => (
            <InboxManagementActionConsumer>
              {({ notifyConsumersOfManagementAction }) => (
                <DumbSidebar
                  currentUser={currentUser}
                  currentConversationId={currentConversationId}
                  queryParams={queryParams}
                  bulk={bulk}
                  emptyBulk={emptyBulk}
                  toggleBulk={toggleBulk}
                  config={getConfig(STORAGE_KEY)}
                  toggleSidebar={this.toggle}
                  resolveAll={this.resolveAll(
                    notifyConsumersOfManagementAction
                  )}
                  history={{ location, navigate }}
                />
              )}
            </InboxManagementActionConsumer>
          )}
        </AppConsumer>
      );
    };

    return <Bulk content={content} />;
  }
}

const WithRouterProps = (props) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  return <SidebarWithProps {...props} navigate={navigate} location={location} />;
};

const SidebarWithProps = withProps<Props>(
  compose(
    graphql<Props, ResolveAllMutationResponse, ResolveAllMutationVariables>(
      gql(mutations.resolveAll),
      {
        name: "resolveAllMutation",
        options: () => refetchSidebarConversationsOptions(),
      }
    )
  )(Sidebar)
);

export default WithRouterProps;