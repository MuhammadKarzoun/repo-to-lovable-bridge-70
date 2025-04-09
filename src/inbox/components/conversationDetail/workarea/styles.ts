import { display } from "./../../../../../../../node_modules/@octobots/ui/node_modules/chart.js/dist/plugins/plugin.subtitle.d";
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
export {
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
