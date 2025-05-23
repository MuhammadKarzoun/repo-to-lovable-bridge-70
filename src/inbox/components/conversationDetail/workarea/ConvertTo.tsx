import {
  IConversation,
  IMail,
  IMessage
} from "@octobots/ui-inbox/src/inbox/types";

import Button from "@octobots/ui/src/components/Button";
import DealConvertTrigger from "@octobots/ui-sales/src/deals/components/DealConvertTrigger";
import Dropdown from "react-bootstrap/Dropdown";
import DropdownToggle from "@octobots/ui/src/components/DropdownToggle";
import Icon from "@octobots/ui/src/components/Icon";
import PurchaseConvertTrigger from "@octobots/ui-purchases/src/purchases/components/PurchaseConvertTrigger";
import React from "react";
import TaskConvertTrigger from "@octobots/ui-tasks/src/tasks/components/TaskConvertTrigger";
import TicketConvertTrigger from "@octobots/ui-tickets/src/tickets/components/TicketConvertTrigger";
import { __, isEnabled } from "@octobots/ui/src/utils/core";
import styled from "styled-components";

const Container = styled.div`
  display: inline-block;

  .dropdown-menu {
    min-width: fit-content;
  }
`;

type Props = {
  conversation: IConversation;
};

export default function ConvertTo(props: Props) {
  const { conversation } = props;

  const assignedUserIds = conversation.assignedUserId
    ? [conversation.assignedUserId]
    : [];
  const customerIds = conversation.customerId ? [conversation.customerId] : [];
  const sourceConversationId = conversation._id;

  const triggerProps: any = {
    assignedUserIds,
    relTypeIds: customerIds,
    relType: "customer",
    sourceConversationId
  };

  return (
    <Container>
      <Dropdown>
        <Dropdown.Toggle as={DropdownToggle} id="dropdown-convert-to">
          <Button size="small" btnStyle="simple">
            {__("Convert")} <Icon icon="angle-down" />
          </Button>
        </Dropdown.Toggle>
        <Dropdown.Menu>
          {isEnabled("tickets") && (
            <li key="ticket">
              <TicketConvertTrigger {...triggerProps} />
            </li>
          )}

          {isEnabled("sales") && (
            <li key="deal">
              <DealConvertTrigger
                {...triggerProps}
              />
            </li>
          )}

          {isEnabled("tasks") && (
            <li key="task">
              <TaskConvertTrigger {...triggerProps} />
            </li>
          )}

          {isEnabled("purchases") && (
            <li key="purchase">
              <PurchaseConvertTrigger {...triggerProps} />
            </li>
          )}
        </Dropdown.Menu>
      </Dropdown>
    </Container>
  );
}
