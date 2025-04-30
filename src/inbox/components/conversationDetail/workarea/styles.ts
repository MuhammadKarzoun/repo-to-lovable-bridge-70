import { colors, dimensions } from "@octobots/ui/src/styles";
import styled from "styled-components";
import {
  modernColors,
  borderRadius,
  spacing,
  typography,
  transitions,
} from "../../../../styles/theme";

import styledTS from "styled-components-ts";

const ConversationWrapper = styled.div`
  height: 100%;
  overflow: auto;
  min-height: 100px;
  background: ${modernColors.background};
  padding: ${spacing.md};
`;

const RenderConversationWrapper = styled.div`
  padding: ${spacing.md};
  overflow: hidden;
  min-height: 100%;
  > div:first-child {
    margin-top: 0;
  }
`;

const ActionBarLeft = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: ${spacing.md};
`;

const AssignTrigger = styledTS<{ $active?: boolean }>(styled.div)`
  display: flex;
  align-items: center;
  gap: ${spacing.sm};
  padding: ${spacing.sm} ${spacing.md};
  border-radius: ${borderRadius.md};
  cursor: pointer;
  transition: all ${transitions.fast};
  background-color: ${(props) => (props.$active ? modernColors.active : "transparent")};
  
  &:hover {
    background-color: ${modernColors.hover};
  }
  
  img {
    width: 24px;
    height: 24px;
    border-radius: ${borderRadius.circle};
  }
  
  i {
    color: ${modernColors.textSecondary};
    transition: transform ${transitions.fast};
  }
  
  &[aria-describedby] {
    background-color: ${modernColors.active};
    
    i {
      transform: rotate(180deg);
    }
  }
`;

const AssignText = styled.div`
  font-size: ${typography.fontSizes.md};
  color: ${modernColors.textSecondary};
  margin-right: ${spacing.sm};
`;

const MailSubject = styled.h3`
  margin: 0 0 ${spacing.md} 0;
  font-weight: ${typography.fontWeights.medium};
  font-size: 18px;
  line-height: 22px;
  color: ${modernColors.textPrimary};
`;

const ReplyComponent = styled.div`
  display: flex;
  padding: ${spacing.sm} ${spacing.md};
  background-color: ${modernColors.messageBackground};
  border-radius: ${borderRadius.md};
  margin-bottom: ${spacing.md};

  .reply-head {
    font-weight: ${typography.fontWeights.medium};
    color: ${modernColors.textSecondary};
    margin-right: ${spacing.md};
  }

  .reply-content {
    flex: 1;
    padding: ${spacing.sm} ${spacing.md};
    background-color: ${modernColors.contentBackground};
    border-left: 3px solid ${modernColors.primary};
    border-radius: ${borderRadius.sm};
    color: ${modernColors.textPrimary};
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .reply-close {
    display: flex;
    align-items: center;

    button {
      background: none;
      border: none;
      color: ${modernColors.textSecondary};
      cursor: pointer;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: ${borderRadius.circle};

      &:hover {
        background-color: ${modernColors.hover};
        color: ${modernColors.danger};
      }
    }
  }
`;
const SendButtonContainer = styled.div`
  /* width: 3rem; */
  height: 3rem;
  display: grid;
  place-items: center;
`;
const SendButton = styled.button`
  border: none;
  outline: none;
  background: #1f97ff;
  display: grid;
  place-items: center;
  /* width: 2.2rem; */
  height: 2.2rem;
  border-radius: 10px;
  padding-inline: 1rem;
  transition: all 0.2s ease-in-out;
  &:hover {
    width: 2.5rem;
    height: 2.5rem;
  }
`;
const RespondBoxContainer = styled.div`
  border: 1px solid #dedede;
  border-radius: 20px;
  padding: 1rem;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;
const RespondTypeContainer = styled.div`
  display: flex;
  align-items: center;
  background-color: #dedede;
  border-radius: 10px;
  padding: 4px;
  width: auto;
`;

const RespondTypeButton = styled.button<{ isSelected: boolean }>`
  border: none;
  outline: none;
  border-radius: 10px;
  background: ${({ isSelected }) => (isSelected ? "#fff" : "#dedede")};
  margin-inline: 4px;
`;
const ActionIconContainer = styled.label`
  width: auto;
  height: 2.5rem;
  border-radius: 10px;
  background-color: #f0f0f0;
  border: 1px solid #f0f0f0;
  display: grid;
  place-items: center;
  transition: all 0.3s ease-in-out;
  cursor: pointer;

  .headlessui-popover-tooltip {
    display: grid;
    place-items: center;
  }

  i {
    font-size: 1.2rem;
    &::before {
      margin: 7px;
    }
  }
  button {
    padding-inline: 10px;
  }
  &:hover {
    background-color: #bbe0ff;

    .microphone-2 {
      color: #fff;
    }
  }
`;
const CheckBoxContainer = styled.div`
  span {
    display: flex;
    align-items: center;
  }
`;
const ButtonsContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;
const TabsContainer = styled.div`
  display: flex;
  align-items: center;
`;
const TabButton = styled.button<{ isActive: boolean }>`
  outline: none;
  border: none;
  background: none;
  border-bottom: ${({ isActive }) => (isActive ? "2px solid #3789E6" : "none")};
  font-weight: ${({ isActive }) => (isActive ? "600" : "400")};
  color: ${({ isActive }) => (isActive ? "#3789E6" : "#000")};
  cursor: pointer;
  padding: 1rem;
`;



// export const TabsContainer = styled.div`
//   display: flex;
//   background: ${colors.colorWhite};
//   box-shadow: 0 1px 5px 0 rgba(0, 0, 0, 0.1);
//   border-bottom: 1px solid ${colors.borderPrimary};
//   overflow-x: auto;
// `;

export const TabTitle = styled.div`
  display: inline-block;
  font-weight: 500;
  padding: 0 30px;
`;

// export const TabButton = styled.button`
//   padding: 14px 20px;
//   background: none;
//   border: none;
//   white-space: nowrap;
//   position: relative;
//   font-weight: 600;

//   &:focus {
//     outline: none;
//   }

//   ${props =>
//     props.isActive &&
//     `
//     color: ${colors.colorPrimary};

//     &:after {
//       content: '';
//       position: absolute;
//       height: 3px;
//       width: 100%;
//       left: 0;
//       right: 0;
//       bottom: 0;
//       background: ${colors.colorPrimary};
//     }
//   `};
// `;

// export const MailSubject = styled.div`
//   font-weight: bold;
//   font-size: 16px;
//   padding: 30px 20px 0;
//   color: ${colors.textPrimary};
// `;

// export const ConversationWrapper = styled.div`
//   margin-top: 5px;
//   padding-bottom: 20px;
//   flex: 1;
//   overflow: auto;
// `;

// export const RenderConversationWrapper = styled.div`
//   overflow-wrap: break-word;
// `;

export const ConnectionStatus = styled.div<{ status: string }>`
  padding: 8px 12px;
  background-color: ${props => props.status === 'connecting' ? '#FFF3CD' : '#F8D7DA'};
  color: ${props => props.status === 'connecting' ? '#856404' : '#721C24'};
  border: 1px solid ${props => props.status === 'connecting' ? '#FFEEBA' : '#F5C6CB'};
  font-size: 13px;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;

  &:before {
    content: '';
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: ${props => props.status === 'connecting' ? '#856404' : '#721C24'};
    margin-right: 8px;
    animation: blink 1.5s infinite;
  }

  @keyframes blink {
    0% { opacity: 0.2; }
    50% { opacity: 1; }
    100% { opacity: 0.2; }
  }
`;

export {
  TabButton,
  TabsContainer,
  ButtonsContainer,
  CheckBoxContainer,
  ActionIconContainer,
  RespondTypeButton,
  RespondTypeContainer,
  RespondBoxContainer,
  SendButton,
  SendButtonContainer,
  ConversationWrapper,
  RenderConversationWrapper,
  ActionBarLeft,
  AssignTrigger,
  AssignText,
  MailSubject,
  ReplyComponent,
};
