import { ActivityContent, DateContainer } from "@octobots/ui/src/styles/main";
import {
  ActivityDate,
  ActivityIcon,
  ActivityRow,
  ActivityTitle,
  AvatarWrapper,
  CenterText,
  Collapse,
  ConversationContent,
  Count,
  DeleteAction,
  EmailContent,
  FlexBody,
  FlexCenterContent,
  Header,
  IconWrapper,
  Row,
  Timeline,
  Title,
} from "@octobots/ui-log/src/activityLogs/styles";
import {
  AttachmentItem,
  AttachmentsContainer,
  Content,
  Details,
  Meta,
  Reply,
  RightSide,
} from "@octobots/ui-inbox/src/inbox/components/conversationDetail/workarea/mail/style";
import {
  FormTable,
  MessageBody,
  MessageContent,
  MessageItem,
  UserInfo,
} from "@octobots/ui-inbox/src/inbox/components/conversationDetail/workarea/conversation/styles";
import {
  SectionContainer,
  SidebarCollapse,
} from "@octobots/ui/src/layout/styles";
import {
  SpaceBetweenRow,
  Subject,
} from "@octobots/ui-inbox/src/settings/integrations/components/mail/styles";
import { colors, dimensions, typography as typography1 } from "@octobots/ui/src/styles";

import { CardItem } from "@octobots/ui-inbox/src/inbox/components/conversationDetail/workarea/conversation/messages/bot/styles";
import { Flex } from "@octobots/ui/src/styles/main";
import styled from "styled-components";
import { rgba } from "@octobots/ui/src/styles/ecolor";
import { borderRadius, modernColors, spacing, transitions, typography } from "../../../../styles/theme";

const FlexRow = styled(DateContainer)`
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 5px ${dimensions.unitSpacing}px;
`;

const FlexItem = styled.div`
  flex: 1;
  margin-inline-start: 5px;
`;

const NoteFormContainer = styled.div`
  border-bottom: 1px solid ${colors.borderPrimary};

  > span {
    padding: ${dimensions.coreSpacing}px ${dimensions.coreSpacing}px
      ${dimensions.unitSpacing}px;
    display: block;
  }

  .draftJsToolbar__toolbar__dNtBH button {
    width: 25px;
  }
`;

const ActivityLogContent = styled(ActivityContent)`
  padding: 0 16px;
  margin-bottom: ${dimensions.coreSpacing}px;

  img {
    max-width: 100%;
  }

  ${Timeline} {
    padding-inline-start: 0;

    &:before {
      display: none;
    }
  }

  ${Collapse} {
    padding: 16px;
  }

  ${Header} {
    font-size: 13px;
    word-break: break-word;
  }

  ${AvatarWrapper},
  ${MessageItem} > span, 
  ${Meta} > span,
  ${ConversationContent},
  ${Count} {
    display: none;
  }

  ${ActivityIcon} {
    inset-inline-start: -8px;
    width: 20px;
    height: 20px;
    line-height: 20px;
    font-size: 11px;
    top: -8px;
    z-index: 1;
  }

  ${ActivityTitle} {
    padding: ${dimensions.coreSpacing}px 0;
    font-weight: 500;
  }

  ${ActivityRow} {
    box-shadow: none;
    background: ${colors.bgActive};
    border-radius: 4px;
    margin-bottom: 16px;

    &:hover {
      background: ${colors.bgActive};
    }
  }

  ${ActivityDate} {
    margin: 0;
    font-style: italic;
    font-size: ${typography1.fontSizeUppercase}px;
  }

  ${EmailContent}, ${MessageItem} {
    padding: 0;
  }

  ${MessageContent}, ${UserInfo} {
    padding: 8px 16px;
  }

  ${MessageBody} {
    margin: 0;
    flex-direction: column;
    align-items: flex-start;

    footer {
      display: none;
    }
  }

  ${Flex} {
    flex-direction: column;
  }

  ${Row} {
    margin-inline-end: 0;
    margin-bottom: 20px;
  }

  ${FlexBody} {
    align-self: baseline;
  }

  ${Meta}, ${FlexCenterContent}, ${FlexBody} {
    flex-direction: column;
    align-items: baseline;
    width: 100%;
  }

  ${CenterText} {
    font-size: 12px;
  }

  ${DeleteAction} {
    visibility: visible;
  }

  ${Title} {
    margin: 0 0 10px;
    font-size: 14px;

    h4 {
      margin: 10px 0;
      font-size: 14px;
    }
  }

  ${IconWrapper} {
    margin-top: 10px;
  }

  //Bot
  ${CardItem} {
    width: 100%;
    margin-inline-end: 0;
  }

  // form
  ${FormTable} {
    overflow: auto;

    td {
      white-space: nowrap;
    }
  }

  // email
  ${Meta} {
    padding: 8px;
  }

  ${Details} {
    align-self: normal;
    margin: 0;
    word-break: break-word;
  }

  ${RightSide} {
    margin-inline-start: 0;
    padding: 0;
  }

  ${Reply} {
    padding: 8px 16px;
    display: flex;
    flex-direction: column;

    > button {
      margin: 4px 0;
    }
  }

  ${AttachmentsContainer} {
    margin: 0 16px 8px 16px;
  }

  ${AttachmentItem} {
    width: 180px;
    margin: 8px 0px 0px 0px;
  }

  ${Content} {
    padding: 8px 16px;

    > div {
      min-width: 300px;
    }
  }

  //email form
  ${SpaceBetweenRow} {
    flex-direction: column;

    > a {
      padding-inline-start: 0;
    }

    button {
      width: 100%;
      margin: 4px 0;
    }
  }

  ${Subject} {
    padding: 8px 16px;
  }
`;

const BasicInfo = styled.div`
  margin-top: 10px;
`;

const TabContent = styled.div`
  ul {
    padding: ${dimensions.unitSpacing}px 0;
  }
`;

const SideBarButton = styled.button<{ showSideBar, isRTL: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #e0e1e6;
  background: white;
  border-radius: ${({ isRTL }) => (isRTL ? "0px 7px 7px 0px" : "7px 0px 0px 7px")};
  padding: 5px 0px 2px 0px;
  cursor: pointer;
  position: absolute;
  top: 4.5rem;
  inset-inline-start: ${({ showSideBar }) => (showSideBar ? "-14px" : "0")};
  z-index: 10;
  border-inline-end: none;

  &:hover {
    background: #f5f5f5;
  }
`;
const SideBarContainer = styled.div`
  position: relative;
`;
const SideBarContent = styled.div<{ showSideBar }>`
  padding: 0 8px;
  width: ${({ showSideBar }) => (showSideBar ? "100%" : "0")};
  transform: ${({ showSideBar }) =>
    showSideBar ? "none" : "translateX(-1.5rem)"};
  transition: all 0.3s ease-in-out;
`;

const SideBarSection = styled.section`
  box-sizing: border-box;
  display: flex;
  position: relative;
  flex-direction: column;
  flex-shrink: 0;
  width: 290px;
  background: ${colors.colorWhite};
`;

const RoundedItem = styled.div`
  border-radius: 10px;
  //margin-bottom: 8px;
  border: 1px solid #e5e7eb;
  // background: #FFF;
  // box-shadow: 0 4px 12px ${rgba(colors.shadowPrimary, 0.1)};
`;

const ContactItem = styled.div`
  padding: 0px 20px 8px 20px;
  display: flex;
  align-items: center;
  gap: .5rem;
  margin-inline-start: .25rem;
`;

const AssignSection = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.sm};
`;

const AssignLabel = styled.div`
  font-size: ${typography.fontSizes.md};
  color: ${modernColors.textSecondary};
`;

const AssignButton = styled.div<{ $hasAssignee: boolean }>`
  display: flex;
  align-items: center;
  gap: ${spacing.sm};
  padding: ${spacing.xs} ${props => props.$hasAssignee ? spacing.xs : spacing.md};
  background-color: ${modernColors.messageBackground};
  border-radius: ${borderRadius.md};
  cursor: pointer;
  transition: all ${transitions.fast};
  justify-content: space-between;
  height: 34px;
  
  &:hover {
    background-color: ${modernColors.hover};
  }
  
  span {
    color: ${modernColors.textPrimary};
    font-weight: ${typography.fontWeights.medium};
  }
  
  i {
    color: ${modernColors.textSecondary};
    font-size: 12px;
  }
`;

const ParticipantsContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.sm};
  margin-left: ${spacing.md};
`;

const TagsContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.sm};
  
  .tags {
    display: flex;
    flex-wrap: wrap;
    gap: ${spacing.xs};
  }
`;

const TagButton = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.xs};
  padding: ${spacing.xs} ${spacing.md};
  background-color: ${modernColors.messageBackground};
  border-radius: ${borderRadius.md};
  cursor: pointer;
  transition: all ${transitions.fast};
  height: 30px;
  color: ${colors.colorPrimary};
  width: max-content;
  
  &:hover {
    background-color: ${modernColors.hover};
  }
`;

const ConversationActionSection = styled.div`
  display: flex;
  align-items: center;
  padding: 0 10px;

  .relative > button {
    width: 100% !important; 
  }

  [id^="headlessui-popover-panel-"] {
    width: max-content !important;
    border-radius: 8px;
    padding: 5px;
  }
`;

export {
  SideBarContent,
  SideBarContainer,
  SideBarButton,
  FlexRow,
  FlexItem,
  SectionContainer,
  SideBarSection,
  NoteFormContainer,
  ActivityLogContent,
  BasicInfo,
  SidebarCollapse,
  TabContent,
  RoundedItem,
  ContactItem,
  AssignSection,
  AssignLabel,
  AssignButton,
  ParticipantsContainer,
  TagsContainer,
  TagButton,
  ConversationActionSection
};
