import { Contents, HeightedWrapper } from "@octobots/ui/src/layout/styles";

import ConversationDetail from "../containers/conversationDetail/ConversationDetail";
import Header from "@octobots/ui/src/layout/components/Header";
import React from "react";
import { __ } from "coreui/utils";
import asyncComponent from "@octobots/ui/src/components/AsyncComponent";
import { loadDynamicComponent } from "@octobots/ui/src/utils/core";

const Sidebar = asyncComponent(
  () =>
    import(
      /* webpackChunkName:"Inbox-Sidebar" */ "../containers/leftSidebar/Sidebar"
    )
);

type Props = {
  queryParams: any;
  currentConversationId: string;
  msg?: string;
  currentUserId: string;
};

const Inbox = (props: Props) => {
  const { currentConversationId, queryParams, msg, currentUserId } = props;

  const menuInbox = [{ title: "Team Inbox", link: "/inbox/index" }, {title: "Dashboard Apps", link: "/inbox/dashboard-apps" }, {title: "My tasks", link: `/taks?assignedUserIds=${currentUserId}` }, {title: "My tickets", link: `/ticket?assignedUserIds=${currentUserId}` }];
  const ReportsFormButton = loadDynamicComponent("reportsCommonFormButton", {
    serviceName: "inbox",
    reportTemplateType: "inbox",
    ...props,
  });

  return (
    <HeightedWrapper>
      <Header
        title={"Conversation"}
        queryParams={queryParams}
        submenu={menuInbox}
      />
      <Contents>
        <Sidebar
          queryParams={queryParams}
          currentConversationId={currentConversationId}
        />
        <ConversationDetail currentId={currentConversationId} msg={msg} />
      </Contents>
    </HeightedWrapper>
  );
};

export default Inbox;
