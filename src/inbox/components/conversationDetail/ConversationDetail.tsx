import { ContentBox, MainContent } from "@octobots/ui/src/layout/styles";
import DmWorkArea, {
  resetDmWithQueryCache,
} from "../../containers/conversationDetail/DmWorkArea";
import {
  getPluginConfig,
  loadDynamicComponent,
} from "@octobots/ui/src/utils/core";

import ConversationDetailLoader from "./ConversationDetailLoader";
import EmptySidebar from "@octobots/ui/src/layout/components/Sidebar";
import EmptyState from "@octobots/ui/src/components/EmptyState";
import { IConversation } from "@octobots/ui-inbox/src/inbox/types";
import { IField } from "@octobots/ui/src/types";
import React from "react";
import Sidebar from "../../containers/conversationDetail/Sidebar";
import SidebarLoader from "./sidebar/SidebarLoader";
import WorkArea from "./workarea/WorkArea"; // This is the simpler WorkArea component
import styled from "styled-components";
import { modernColors, borderRadius } from "../../../styles/theme";

// ... keep existing code (styled components ModernMainContent, ModernContentBox)
const ModernMainContent = styled(MainContent)`
  background-color: ${modernColors.contentBackground};
  border-radius: ${borderRadius.md};
  overflow: hidden;
  box-shadow: 0 1px 3px ${modernColors.shadow};
`;

const ModernContentBox = styled(ContentBox)`
  background-color: ${modernColors.contentBackground};
  border-radius: ${borderRadius.md};
  overflow: hidden;
`;

type Props = {
  currentConversation: IConversation;
  loading: boolean;
  conversationFields?: IField[];
  refetchDetail: () => void;
  msg?: string;
  connectionStatus?: 'connected' | 'disconnected' | 'connecting'; // Added to receive from container
  // Added from ConversationDetail.tsx (container) pass-through for DmWorkArea
  userDashboardApps?: { userDashboardApps: any[] }; 
};

type State = {
  isOpen: boolean;
};

export default class ConversationDetail extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);

    this.state = {
      isOpen: true,
    };
  }

  renderSidebar() {
    const { loading, currentConversation, conversationFields } = this.props;

    if (loading) {
      return (
        <EmptySidebar full={true}>
          <SidebarLoader />
        </EmptySidebar>
      );
    }

    if (currentConversation) {
      return (
        <Sidebar
          conversation={currentConversation}
          conversationFields={conversationFields}
        />
      );
    }

    return (
      <EmptySidebar full={true}>
        <EmptyState
          text="Customer not found"
          size="full"
          image="/images/actions/18.svg"
        />
      </EmptySidebar>
    );
  }

  componentWillReceiveProps(nextProps: Readonly<Props>) {
    const current = this.props.currentConversation;
    const ncurrent = nextProps.currentConversation;

    if (
      current &&
      ncurrent &&
      current.integration?.kind !== ncurrent.integration?.kind // Added optional chaining for kind
    ) {
      resetDmWithQueryCache();
    }
  }

  renderContent() {
    const { loading, currentConversation, msg, connectionStatus, userDashboardApps, refetchDetail } = this.props;

    const toggleSidebar = () => {
      this.setState({ isOpen: !this.state.isOpen })
    }

    if (loading) {
      return (
        <ModernContentBox>
          <ConversationDetailLoader />
        </ModernContentBox>
      );
    }

    if (currentConversation) {
      const { integration } = currentConversation;
      const kind = integration.kind.split("-")[0];

      let content;

      if (
        !["messenger", "lead", "webhook", "callpro"].includes(
          currentConversation.integration.kind
        )
      ) {
        const integrations = getPluginConfig({
          pluginName: kind,
          configName: "inboxIntegrations",
        });

        if (integrations) {
          const entry = integrations.find((i) => i.kind === integration.kind);
          const key = "inboxConversationDetail";

          if (entry && entry.components && entry.components.includes(key)) {
            content = loadDynamicComponent(
              key,
              {
                ...this.props,
                conversation: currentConversation,
              },
              false,
              kind
            );
          }
        }

        if (content) {
          if (currentConversation.integration.kind === "imap") {
            return (
              <DmWorkArea
                currentConversation={currentConversation}
                refetchDetail={refetchDetail}
                msg={msg}
                toggle={toggleSidebar}
                content={content} // DmWorkArea takes content for imap
                userDashboardApps={userDashboardApps}
                connectionStatus={connectionStatus} // Pass connectionStatus
              />
            );
          }

          return (
            <WorkArea
              currentConversation={currentConversation}
              content={content}
              toggle={toggleSidebar} // Pass toggle to simpler WorkArea as well
            />
          );
        }
      }

      const dmConfig = getPluginConfig({
        pluginName: kind,
        configName: "inboxDirectMessage",
      });

      return (
        <DmWorkArea
          currentConversation={currentConversation}
          refetchDetail={refetchDetail}
          msg={msg}
          toggle={toggleSidebar}
          dmConfig={dmConfig}
          userDashboardApps={userDashboardApps}
          connectionStatus={connectionStatus} // Pass connectionStatus
        />
      );
    }

    return (
      <EmptyState
        text="Conversation not found"
        size="full"
        image="/images/actions/14.svg"
      />
    );
  }

  render() {
    return (
      <React.Fragment>
        <ModernMainContent style={{ borderInlineEnd: '1px solid #e5e7eb', overflow: 'hidden' }}>{this.renderContent()}</ModernMainContent>
        {this.state.isOpen && this.renderSidebar()}
      </React.Fragment>
    );
  }
}
