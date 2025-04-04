import { AttachmentWrapper, Meta } from '@octobots/ui/src/components/Attachment';
import { colors, dimensions } from '@octobots/ui/src/styles';
import { darken, rgba } from '@octobots/ui/src/styles/ecolor';
import styled, { css } from 'styled-components';
import { modernColors, borderRadius, spacing, typography, transitions } from '../../../../../styles/theme';

import styledTS from 'styled-components-ts';

const MessageContent = styledTS<{ $failed?: boolean; $internal?: boolean; $staff?: boolean }>(
  styled.div,
)`
  max-width: 80%;
  position: relative;
  padding: ${spacing.md} ${spacing.lg};
  border-radius: ${borderRadius.lg};
  background: ${props => 
    props.$failed ? modernColors.danger :
    props.$internal ? modernColors.info + '20' :
    props.$staff ? modernColors.messageBackgroundOwn : modernColors.messageBackground
  };
  word-break: break-word;
  box-shadow: 0 1px 2px 0 ${modernColors.shadow};
  color: ${props => props.$staff && !props.$internal ? modernColors.messageTextOwn : modernColors.textPrimary};
  text-align: start;

  ${props =>
    props.$staff &&
    css`
      border-bottom-end-radius: ${borderRadius.sm};

      ${AttachmentWrapper}, ${Meta} {
        color: ${rgba(colors.colorWhite, 0.9)};
      }
    `};

  ${props =>
    !props.$staff &&
    css`
      border-bottom-start-radius: ${borderRadius.sm};
    `};

  a {
    color: ${props =>
      props.$staff && !props.$internal
        ? modernColors.messageTextOwn
        : modernColors.primary};
    text-decoration: underline;
  }

  .dropdown-item {
    color: ${modernColors.textPrimary};
    text-decoration: none;
    padding: 3px 10px;
  }

  .dropdown-item > i{
    padding-inline-end: 5px;
  }
  
  .message-first-div>div {
    position: absolute;
    width: 100%;
    height: 0px;
  }

  p {
    margin: 0;
  }

  > span {
    display: block;
  }

  .mention {
    font-weight: bold;
    display: inline-block;
  }

  img {
    max-width: 300px;
    border-radius: ${borderRadius.md};
  }

  ul,
  ol {
    padding-inline-start: 25px;
    margin: 0;
  }

  h3 {
    margin-top: 0;
  }

  blockquote {
    margin-bottom: 0;
    border-color: ${colors.borderDarker};
  }

  pre {
    margin-bottom: 0;
  }
`;

const MessageBody = styledTS<{ $staff?: boolean }>(styled.div)`
  margin: ${props => props.$staff ? '0 55px 0 0' : '0 0 0 55px'};
  display: flex;
  flex-direction: ${props => props.$staff ? 'row-reverse' : 'row'};
  align-items: flex-start;
  position: relative;

  footer {
    flex-shrink: 0;
    font-size: 11px;
    display: inline-block;
    color: ${modernColors.textMuted};
    margin: 0 10px;
    cursor: pointer;
  }

  > img {
    box-shadow: 0 1px 1px 0 ${colors.darkShadow};
    max-width: 100%;
  }

  /* Add hover effect for dropdown visibility */
  &:hover .msg-reaction-button {
    opacity: 1;
  }
`;

const MessageItem = styledTS<{
  $isSame?: boolean;
  $staff?: boolean;
  $isBot?: boolean;
}>(styled.div)`
  margin-top: ${props => props.$isSame ? spacing.sm : spacing.lg};
  padding-inline-end: 17%;
  display: flex;
  flex-direction: row;
  position: relative;
  clear: both;

  > span {
    position: absolute;
    inset-inline-end: ${props => props.$staff && '0'};
    bottom: 0;
  }

  ${props =>
    props.$isBot &&
    css`
      padding-inline-end: 0;

      ${MessageBody} {
        flex-direction: column;
        align-items: flex-start;
      }

      ${MessageContent} {
        border-radius: ${borderRadius.lg};
      }
    `};

  ${props => {
    if (!props.$staff) {
      return '';
    }

    return `
      padding-inline-end: 0;
      padding-inline-start: 10%;
      text-align: end;
      flex-direction: row-reverse;
    `;
  }};

  &.same {
    ${MessageContent} {
      border-top-start-radius: ${props => !props.$staff && borderRadius.sm};
      border-top-end-radius: ${props => props.$staff && borderRadius.sm};
    }

    &:last-of-type {
      ${MessageContent} {
        border-bottom-end-radius: ${props => props.$staff && borderRadius.lg};
        border-bottom-start-radius: ${props => !props.$staff && borderRadius.lg};
      }
    }
  }

  &.attachment ${MessageContent} {
    padding: ${spacing.lg};

    > span {
      margin-bottom: 5px;
    }

    br {
      display: none;
    }
  }

  &.fbpost {
    .body {
      padding: 12px;
      background: #f6f7f9;
      border: 1px solid;
      border-color: #e5e6e9 #dfe0e4 #d0d1d5;
      border-radius: 4px;
    }
  }
`;

const FormTable = styled.div`
  border: 1px solid ${modernColors.border};
  border-radius: ${borderRadius.md};
  font-size: 12px;
  padding: 0;
  margin-bottom: ${dimensions.coreSpacing}px;
  background: ${modernColors.contentBackground};

  table thead th:last-child {
    text-align: center;
    color: ${modernColors.textPrimary};
  }

  table tr td {
    word-break: break-word;
  }

  footer {
    flex-shrink: 0;
    font-size: 11px;
    float: inline-end;
    color: ${modernColors.textMuted};
    margin-inline-start: 10px;
    cursor: pointer;
  }
`;

const CellWrapper = styled.div`
  display: inline-block;
  max-width: 100%;

  > a {
    display: block;

    div:first-child {
      float: inline-start;
    }
  }
`;

const CallBox = styled.div`
  border: 1px solid ${modernColors.border};
  border-radius: ${borderRadius.md};
  background: ${modernColors.contentBackground};
  text-align: start;
  float: inline-end;
  box-shadow: ${modernColors.shadow} 0px 1px 3px;
`;

const AppMessageBox = styled(CallBox)`
  width: 320px;
  text-align: center;
`;

const CallButton = styled.div`
  padding: ${spacing.lg};
  border-top: 1px solid ${modernColors.border};

  h5 {
    margin-top: 0;
    margin-bottom: 15px;
  }

  button,
  a {
    width: 100%;
    border-radius: ${borderRadius.md};
    background: ${modernColors.primary};
    font-size: 14px;
    padding: 10px 20px;
    text-transform: initial;
    box-shadow: none;
    color: white;
    text-decoration: none;
    display: inline-block;
    text-align: center;
  }

  a {
    display: block;
    color: ${modernColors.messageTextOwn};

    &:hover {
      background: ${darken(modernColors.primary, 10)};
    }
  }
`;

const UserInfo = styled.div`
  padding: ${spacing.lg};
  display: flex;
  flex-direction: column;
  align-items: center;
  border-top: 3px solid ${modernColors.primary};
  border-radius: ${borderRadius.md};

  h4 {
    margin: 20px 0 0 0;
    font-size: 16px;
  }

  h5 {
    margin-top: 0;
  }

  h3 {
    margin: 0;
  }
`;

const FlexItem = styled.div`
  display: flex;
  justify-content: end;
`;

const FormMessageInput = styled.div`
  padding: ${dimensions.unitSpacing - 4}px ${dimensions.coreSpacing - 5}px;
  color: ${modernColors.textPrimary};
  border: 1px solid ${modernColors.border};
  margin-top: ${dimensions.unitSpacing - 5}px;
  background: ${modernColors.contentBackground};
  border-radius: ${borderRadius.md};
  font-size: 14px;
  min-height: 35px;
  overflow-wrap: break-word;
  box-shadow: inset 0 1px 3px 0 ${modernColors.shadow};

  img {
    max-height: 150px !important;
  }
`;

const FieldWrapper = styledTS<{ column?: number }>(styled.div)`
  input, .Select {
    pointer-events: none;
    cursor: default;

    .Select-value {
      padding: 0;
    }

    .Select-input, .Select-clear-zone, .Select-arrow-zone, .Select-value-icon {
      display: none !important;
    }
  }

${props =>
  props.column &&
  css`
    width: ${100 / props.column}%;
    display: inline-block;
  `}
`;

const ProductItem = styledTS(styled.div)`
  display:flex;
  justify-content: space-between;

  img {
    width: 100px;
    height: 100px;
    border-radius: ${borderRadius.md};
  }
`;

const StatusMessage = styled.div`
  margin-inline-start: 4px;
  cursor: pointer;
`;

const Forwarded = styledTS(styled.div)`
  background-color: ${modernColors.messageBackground};
  padding: 2px 10px;
  border-radius: ${borderRadius.md};
  text-align: center;
  margin-bottom: ${spacing.sm};

  i {
    transform: scaleX(-1);
    display: inline-block;
    padding: 0px 5px;
  }

  span {
    font-style: italic;
  }
`;

const ReplyTo = styledTS(styled.div)`
  background-color: ${modernColors.messageBackground};
  padding: ${spacing.sm} ${spacing.md};
  border-radius: ${borderRadius.md};
  border-inline-start: solid 4px ${modernColors.primary};
  cursor: pointer;
  margin-bottom: ${spacing.sm};

  a {
    text-decoration: none;
    cursor: pointer;
  }
`;

const DropdownItem = styledTS(styled.a)`
  color: ${modernColors.textPrimary};
  text-decoration: none;
`;

const OptionsContainer = styledTS<{$staff?: boolean;}>(styled.div)`
  inset-inline-end: ${props => props.$staff? 'unset' : '24px'};
  inset-inline-start:  ${props => props.$staff? '-24px' : 'unset'};
  border-top-end-radius: ${props => props.$staff? 'unset' : '16px'};
  border-top-start-radius: ${props => props.$staff? '16px' : 'unset'};
  flex-direction: row;
  cursor: pointer;
  opacity: 0;
  transition: opacity ${transitions.fast};

  display: flex;
  position: absolute;
  top: -8px;
  padding: 5px;
  z-index: 2;

  .options-logo {
    display: flex;
    align-items: center;
    -webkit-box-pack: center;
    height: 16px;
    border-radius: 3px;
    text-align: start;
    justify-content: center;
    font-size: initial;
  }
  
  ${MessageBody}:hover & {
    opacity: 1;
  }
`;

const FloatItem = styledTS(styled.div)`
    position: absolute;
    z-index: 10000;
    background-color: transparent;
    inset-inline-end: 180px;
    bottom: -50px;
`;

const Reactionbutton = styledTS<{$staff?: boolean;}>(styled.button)`
    margin-${props => props.$staff? 'inline-end: 5px' : 'inline-start: 5px'};
    border-radius: 50%;
    border: solid 1px ${modernColors.border};
    background-color: transparent;
    font-size: 18px;
    color: ${modernColors.textSecondary};
    opacity: 0;
    transition: opacity ${transitions.fast};
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    
    &:hover {
      background-color: ${modernColors.hover};
    }
`;

const DeletedMessageContent = styledTS<{ $staff?: boolean }>(
  styled.div,
)`
  max-width: 80%;
  position: relative;
  padding: ${spacing.md} ${spacing.lg};
  border-radius: ${borderRadius.lg};
  background: ${modernColors.messageBackground};
  word-break: break-word;
  box-shadow: 0 1px 2px 0 ${modernColors.shadow};
  color: ${modernColors.textMuted};
  text-align: start;
  font-style: italic;

  ${props =>
    props.$staff &&
    css`
      border-bottom-end-radius: ${borderRadius.sm};
    `};

  i {
    font-size: 16px;
    padding: 0px 5px;
  }
`;

// Container for the emoji picker
const EmojiPickerContainer = styled.div`
  position: absolute;
  bottom: 100%;
  right: 0;
  background: ${modernColors.contentBackground};
  border: 1px solid ${modernColors.border};
  border-radius: ${borderRadius.md};
  box-shadow: 0 4px 12px ${modernColors.shadow};
  padding: ${spacing.md};
  display: flex;
  gap: ${spacing.md};
  z-index: 10;
`;

// Individual emoji button
const EmojiButton = styled.span`
  font-size: 18px;
  cursor: pointer;
  transition: transform ${transitions.fast}, opacity ${transitions.fast};

  &:hover {
    transform: scale(1.2);
    opacity: 0.9;
  }

  &:active {
    transform: scale(0.9);
  }
`;

// Container for the message reaction
const ReactionContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 4px;
`;

// Individual reaction emoji
const ReactionEmoji = styled.span`
  font-size: 14px;
  background: ${modernColors.messageBackground};
  padding: 4px 8px;
  border-radius: ${borderRadius.pill};
  cursor: pointer;
  transition: background ${transitions.fast};

  &:hover {
    background: ${modernColors.hover};
  }
`;

export {
  MessageItem,
  MessageBody,
  MessageContent,
  FormTable,
  AppMessageBox,
  CallButton,
  UserInfo,
  FlexItem,
  CallBox,
  CellWrapper,
  FieldWrapper,
  FormMessageInput,
  ProductItem,
  StatusMessage,
  Forwarded,
  OptionsContainer,
  DropdownItem,
  FloatItem,
  Reactionbutton,
  ReplyTo,
  DeletedMessageContent,
  EmojiPickerContainer,
  EmojiButton,
  ReactionContainer,
  ReactionEmoji
};