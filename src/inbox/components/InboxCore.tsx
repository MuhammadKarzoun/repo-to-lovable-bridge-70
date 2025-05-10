import { Contents, HeightedWrapper } from "@octobots/ui/src/layout/styles";

import ConversationDetail from "../containers/conversationDetail/ConversationDetail";
import Header from "@octobots/ui/src/layout/components/Header";
import React from "react";
import { __ } from "coreui/utils";
import asyncComponent from "@octobots/ui/src/components/AsyncComponent";
import { loadDynamicComponent } from "@octobots/ui/src/utils/core";
import styled from "styled-components";
import { modernColors, spacing } from "../../styles/theme";

const Sidebar = asyncComponent(
  () =>
    import(
      /* webpackChunkName:"Inbox-Sidebar" */ "../containers/leftSidebar/Sidebar"
    )
);

const ModernHeightedWrapper = styled(HeightedWrapper)`
  background-color: ${modernColors.contentBackground};
`;

const ModernContents = styled(Contents)`
  padding: 0;
  gap: 1px;
`;

type Props = {
  queryParams: any;
  currentConversationId: string;
  msg?: string;
  currentUserId: string;
};

const Inbox = (props: Props) => {
  const { currentConversationId, queryParams, msg, currentUserId } = props;

  const menuInbox = [
    { title: "Team Inbox", link: "/inbox/index" }, 
    { title: "My tasks", link: `/taks?assignedUserIds=${currentUserId}` }, 
    { title: "My tickets", link: `/ticket?assignedUserIds=${currentUserId}` }
  ];
  
  const ReportsFormButton = loadDynamicComponent("reportsCommonFormButton", {
    serviceName: "inbox",
    reportTemplateType: "inbox",
    ...props,
  });

  return (
    <ModernHeightedWrapper>
      {/* <Header
        title={"Conversation"}
        queryParams={queryParams}
        submenu={[]}
      /> */}
      <ModernContents>
        <Sidebar
          queryParams={queryParams}
          currentConversationId={currentConversationId}
        />
        <ConversationDetail currentId={currentConversationId} msg={msg} />
      </ModernContents>
    </ModernHeightedWrapper>
  );
};

export default Inbox;