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
import WorkArea from "./workarea/WorkArea";
import styled from "styled-components";
import { modernColors, borderRadius } from "../../../styles/theme";

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
};

export default class ConversationDetail extends React.Component<Props> {
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
      current.integration.kind !== ncurrent.integration.kind
    ) {
      resetDmWithQueryCache();
    }
  }

  renderContent() {
    const { loading, currentConversation, msg } = this.props;

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
            return <DmWorkArea msg={msg} content={content} {...this.props} />;
          }

          return (
            <WorkArea
              currentConversation={currentConversation}
              content={content}
            />
          );
        }
      }

      const dmConfig = getPluginConfig({
        pluginName: kind,
        configName: "inboxDirectMessage",
      });

      if (dmConfig) {
        return <DmWorkArea msg={msg} {...this.props} dmConfig={dmConfig} />;
      }

      return <DmWorkArea msg={msg} {...this.props} />;
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
        <ModernMainContent>{this.renderContent()}</ModernMainContent>
        {this.renderSidebar()}
      </React.Fragment>
    );
  }
}
