import * as dayjs from "dayjs";
import * as relativeTime from "dayjs/plugin/relativeTime";

import {
  AssigneeImg,
  CheckBox,
  Count,
  FlexContent,
  Idle,
  MainInfo,
  MessageContent,
  MessagePreview,
  RowContent,
  RowItem,
  SmallTextOneLine,
  CustomerInfo,
  AssigneesContainer,
} from "./styles";
import {
  cleanIntegrationKind,
  readFile,
  renderFullName,
} from "@octobots/ui/src/utils";

import { IConversation } from "@octobots/ui-inbox/src/inbox/types";
import { ICustomer } from "@octobots/ui-contacts/src/customers/types";
import { IUser } from "@octobots/ui/src/auth/types";
import React, { useEffect, useState } from "react";
import FormControl from "@octobots/ui/src/components/form/Control";
import Tip from "@octobots/ui/src/components/Tip";
import Tags from "@octobots/ui/src/components/Tags";
// import withCurrentUser from "@octobots/ui/src/auth/containers/withCurrentUser";
import Avatar from "../../../components/common/Avatar";
import styled from "styled-components";
import { modernColors, typography, spacing } from "../../../styles/theme";
import Badge from "../../../components/common/Badge";
import { IIntegration } from '@octobots/ui-inbox/src/settings/integrations/types';
import Icon from "@octobots/ui/src/components/Icon";

dayjs.extend(relativeTime);

const CustomerName = styled.div`
  font-weight: ${typography.fontWeights.medium};
  color: ${modernColors.textPrimary};
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  time {
    font-size: ${typography.fontSizes.sm};
    color: ${modernColors.textSecondary};
    font-weight: ${typography.fontWeights.normal};
  }
`;

type Props = {
  conversation: IConversation;
  channelId?: string;
  isActive: boolean;
  onClick: (conversation: IConversation) => void;
  toggleCheckbox: (conversation: IConversation, checked: boolean) => void;
  selectedIds?: string[];
  currentUser: IUser;
};

const ConversationItem: React.FC<Props> = (props) => {
  const {
    conversation,
    isActive,
    selectedIds = [],
    currentUser,
    onClick,
    toggleCheckbox,
  } = props;

  const toggleCheckboxHandler = (e: React.FormEvent<HTMLElement>) => {
    toggleCheckbox(conversation, (e.target as HTMLInputElement).checked);
  };

  const onClickHandler = (e: React.MouseEvent) => {
    e.preventDefault();
    onClick(conversation);
  };

  const renderCheckbox = () => {
    if (!toggleCheckbox) {
      return null;
    }

    return (
      <CheckBox onClick={(e) => e.stopPropagation()}>
        <FormControl
          componentclass="checkbox"
          onChange={toggleCheckboxHandler}
        />
      </CheckBox>
    );
  };

  const isIdleContent = (integration, updatedAt: Date, idleTimeConfig: number, lastMsgFrom?: string) => {
    const kind = integration.kind;

    if (
      kind === "form" ||
      kind.includes("nylas") ||
      kind === "gmail" ||
      conversation.status === "closed" ||
      conversation.status === "pending"
    ) {
      return;
    }

    const now = new Date();
    let idleTimePassed = (now.getTime() - (new Date(updatedAt) || now).getTime()) / (1000 * 60);

    const [idle, setIdle] = useState(idleTimePassed);

    useEffect(() => {
      const interval = setInterval(() => {
        setIdle((oldValue) => {
          const newValue = oldValue + (1 / 60);
          if (newValue >= idleTimeConfig) {
            clearInterval(interval);
          }
          return newValue;
        });
      }, 1000);

      return () => {
        clearInterval(interval);
      };
    }, []);

    return (
      lastMsgFrom == 'customer' && idle >= idleTimeConfig &&
      <Tip placement="left" text="Idle">
        <Idle>
          <Icon
            icon="fire"
            size={11}
            color={"#ca244d"}
            style={{ marginInlineEnd: spacing.xs }}
          />

          <span>{(dayjs(updatedAt) || ({} as any)).fromNow(true)}</span>
        </Idle>
      </Tip>
    );
  };


  const renderIntegration = (integration: IIntegration) => {

    if (!integration) {
      return null;
    }

    const { name, kind } = integration;
    let icon = "external-link-alt";
    let color = "##333333";
    switch (kind) {
      case "whatsapp":
        icon = "whatsapp";
        color = "#25D366";
        break;
      case "facebook-messenger":
        icon = "facebook";
        color = "#3b5998";
        break;
      case "facebook-post":
        icon = "facebook-official";
        color = "#3b5998";
        break;
      case "instagram-messenger":
        icon = "instagram";
        color = "#E1306C";
        break;
      case "instagram-post":
        icon = "instagram";
        color = "#E1306C";
        break;
      default:
        icon = "earthgrid";
        break;
    }

    return (
      <span >
        <Icon icon={icon} color={color} size={12} /> <span>{name}</span>
      </span>
    );
  }

  const showMessageContent = (kind: string, content: string) => {
    if (kind === "callpro") {
      return (
        <span style={{ color: content.toLowerCase() === "answered" ? modernColors.success : modernColors.danger }}>
          {content}
        </span>
      );
    }

    return content ? content.replace(/<[^>]*>?/gm, '') : '';
  };

  const {
    createdAt,
    updatedAt,
    idleTime,
    content,
    customer = {} as ICustomer,
    integration = {} as IIntegration,
    tags = [],
    assignedUser,
    messageCount = 0,
    readUserIds,
    idleTimeConfig,
    lastMsgFrom
  } = conversation;

  const isRead = readUserIds && readUserIds.indexOf(currentUser._id) > -1;
  const isExistingCustomer = customer && customer._id;
  const isChecked = selectedIds.includes(conversation._id);
  const brand = integration.brand || {};

  return (
    <RowItem onClick={onClickHandler} $isActive={isActive} $isRead={isRead}>
      <RowContent $isChecked={isChecked}>
        {renderCheckbox()}
        <FlexContent>
          <MainInfo>
            {isExistingCustomer && (
              <Avatar
                customer={customer}
                size={40}
                status={customer.isOnline ? 'online' : 'offline'}
              />
            )}
            <CustomerInfo>
              <CustomerName>
                <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {isExistingCustomer && renderFullName(customer, true)}
                </div>
                <time>
                  {(dayjs(updatedAt || createdAt) || ({} as any)).fromNow(true)}
                </time>
              </CustomerName>

              <SmallTextOneLine>
                {renderIntegration(integration)}
              </SmallTextOneLine>
            </CustomerInfo>
          </MainInfo>

          <MessageContent>
            <MessagePreview>
              {showMessageContent(integration.kind, content || "")}
            </MessagePreview>
            <div style={{ display: 'flex', alignItems: 'center', gap: spacing.xs }}>
              {messageCount > 1 && <Badge variant="primary" count={messageCount} />}
              {assignedUser && (
                <AssigneesContainer>
                  <Tip
                    key={assignedUser._id}
                    placement="top"
                    text={assignedUser.details && assignedUser.details.fullName}
                  >
                    <Avatar
                      user={assignedUser}
                      size={24}
                    />
                  </Tip>
                </AssigneesContainer>
              )}
            </div>
          </MessageContent>
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing.xs }}>
            {isIdleContent(integration, updatedAt, idleTimeConfig || 3, lastMsgFrom)}
            <Tags tags={tags} limit={3} />
          </div>
        </FlexContent>
      </RowContent>
    </RowItem>
  );
};

export default ConversationItem;