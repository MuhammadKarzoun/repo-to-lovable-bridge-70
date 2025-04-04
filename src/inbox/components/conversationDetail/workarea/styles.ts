import { colors, dimensions } from '@octobots/ui/src/styles';
import styled from 'styled-components';
import { modernColors, borderRadius, spacing, typography, transitions } from '../../../../styles/theme';

import styledTS from 'styled-components-ts';

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
  background-color: ${props => props.$active ? modernColors.active : 'transparent'};
  
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

export {
  ConversationWrapper,
  RenderConversationWrapper,
  ActionBarLeft,
  AssignTrigger,
  AssignText,
  MailSubject,
  ReplyComponent
};