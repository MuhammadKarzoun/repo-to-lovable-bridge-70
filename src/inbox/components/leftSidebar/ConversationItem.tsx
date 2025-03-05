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
  RowContent,
  RowItem,
  SmallTextOneLine,
} from "./styles";
import {
  CustomerName,
  EllipsisContent,
  Flex as FlexRoot,
} from "@octobots/ui/src/styles/main";
import {
  cleanIntegrationKind,
  readFile,
  renderFullName,
} from "@octobots/ui/src/utils";

import { CallLabel } from "@octobots/ui-inbox/src/inbox/styles";
import FormControl from "@octobots/ui/src/components/form/Control";
import { IBrand } from "@octobots/ui/src/brands/types";
import { IConversation } from "@octobots/ui-inbox/src/inbox/types";
import { ICustomer } from "@octobots/ui-contacts/src/customers/types";
import { IIntegration } from "@octobots/ui-inbox/src/settings/integrations/types";
import { IUser } from "@octobots/ui/src/auth/types";
import IntegrationIcon from "@octobots/ui-inbox/src/settings/integrations/components/IntegrationIcon";
import NameCard from "@octobots/ui/src/components/nameCard/NameCard";
import React, { useEffect, useState } from "react";
import Tags from "@octobots/ui/src/components/Tags";
import Tip from "@octobots/ui/src/components/Tip";
import strip from "strip";
import withCurrentUser from "@octobots/ui/src/auth/containers/withCurrentUser";

dayjs.extend(relativeTime);

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

  const isIdleContent = (integration: IIntegration, updatedAt: Date, idleTimeConfig: number, lastMsgFrom?: string) => {
    const kind = integration.kind;

    if (
      kind === "form" ||
      kind.includes("nylas") ||
      kind === "gmail" ||
      conversation.status === "closed" ||
      conversation.status === "pending"
    ) {
      return ;
    }

    const now = new Date();
    let idleTimePassed = (now.getTime() - (new Date(updatedAt) || now).getTime()) / (1000 * 60);

    const [idle, setIdle] = useState(idleTimePassed);

    //console.log("🚀 ~ isIdle ~ idleTimeConfig:", idleTimePassed, idleTimeConfig, lastMsgFrom)

    // use one function for closure interval in function, not in react component
    useEffect(() => {
      const interval = setInterval(() => {
        setIdle((oldValue) => {
          // use fountion for access real value without depend on it in useEffect
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
      // pass [] for remove rerender problem
    }, []);

    return (
      lastMsgFrom == 'customer' && idle >= idleTimeConfig &&
      <Tip placement="left" text="Idle">
        <Idle />
      </Tip>
    )
  };

  const showMessageContent = (kind: string, content: string) => {
    if (kind === "callpro") {
      return (
        <CallLabel type={(content || "").toLocaleLowerCase()}>
          {content}
        </CallLabel>
      );
    }

    return strip(content);
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
  const brand = integration.brand || ({} as IBrand);

  return (
    <RowItem onClick={onClickHandler} $isActive={isActive} $isRead={isRead}>
      <RowContent $isChecked={isChecked}>
        {renderCheckbox()}
        <FlexContent>
          <MainInfo>
            {isExistingCustomer && (
              <NameCard.Avatar
                size={36}
                letterCount={1}
                customer={customer}
                icon={<IntegrationIcon integration={integration} />}
              />
            )}
            <FlexContent>
              <CustomerName>
                <EllipsisContent>
                  {isExistingCustomer && renderFullName(customer)}
                </EllipsisContent>
                <time>
                  {(dayjs(updatedAt || createdAt) || ({} as any)).fromNow(true)}
                </time>
              </CustomerName>

              <SmallTextOneLine>
                to {brand.name} via{" "}
                {integration.kind === "callpro"
                  ? integration.name
                  : cleanIntegrationKind(integration && integration.kind)}
              </SmallTextOneLine>
            </FlexContent>
          </MainInfo>

          <MessageContent>
            <EllipsisContent>
              {showMessageContent(integration.kind, content || "")}
            </EllipsisContent>
            <FlexRoot>
              {messageCount > 1 && <Count>{messageCount}</Count>}
              {assignedUser && (
                <Tip
                  key={assignedUser._id}
                  placement="top"
                  text={assignedUser.details && assignedUser.details.fullName}
                >
                  <AssigneeImg
                    src={
                      assignedUser.details &&
                      (assignedUser.details.avatar
                        ? readFile(assignedUser.details.avatar, 36)
                        : "/images/avatar-colored.jpeg")
                    }
                  />
                </Tip>
              )}
            </FlexRoot>
          </MessageContent>
          <Tags tags={tags} limit={3} />
        </FlexContent>
      </RowContent>
      {isIdleContent(integration, updatedAt, idleTimeConfig || 3, lastMsgFrom)}
    </RowItem>
  );
};

export default withCurrentUser(ConversationItem);
