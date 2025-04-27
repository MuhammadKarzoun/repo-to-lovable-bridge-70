import { __ } from 'coreui/utils';
import { isEnabled, loadDynamicComponent } from '@octobots/ui/src/utils/core';
import React, { useState } from 'react';
import styled from 'styled-components';
import { modernColors, borderRadius, spacing, typography, transitions, shadows } from '../../../../styles/theme';

import { IConversation } from '@octobots/ui-inbox/src/inbox/types';
import AssignBoxPopover from '../../assignBox/AssignBoxPopover';
import Tagger from '../../../containers/Tagger';
import Resolver from '../../../containers/Resolver';
import Icon from '@octobots/ui/src/components/Icon';
import Avatar from '../../../../components/common/Avatar';
import ModernButton from '../../../../components/common/Button';
import Tags from '@octobots/ui/src/components/Tags';

import asyncComponent from '@octobots/ui/src/components/AsyncComponent';

const Participators = asyncComponent(
  () =>
    import(
      /* webpackChunkName:"Inbox-Participators" */ '@octobots/ui-inbox/src/inbox/components/conversationDetail/workarea/Participators'
    ),
  { height: '30px', width: '30px', round: true }
);

const ConvertTo = asyncComponent(
  () =>
    import(
      /* webpackChunkName:"Inbox-ConvertTo" */ '../../../components/conversationDetail/workarea/ConvertTo'
    ),
  { height: '22px', width: '71px' }
);

const Post = asyncComponent(
  () =>
    import(
      /* webpackChunkName:"Inbox-ConvertTo" */ '../../../containers/conversationDetail/workarea/Post'
    ),
  { height: '22px', width: '71px' }
);

const PostInstagram = asyncComponent(
  () =>
    import(
      /* webpackChunkName:"Inbox-ConvertTo" */ '../../../containers/conversationDetail/workarea/PostIg'
    ),
  { height: '22px', width: '71px' }
);

// Modern styled components
const ActionBarContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${spacing.md} ${spacing.lg};
  background-color: ${modernColors.contentBackground};
  border-bottom: 1px solid ${modernColors.border};
  border-radius: ${borderRadius.md} ${borderRadius.md} 0 0;
`;

const ActionBarSection = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.md};
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
  background-color: ${props => props.$hasAssignee ? modernColors.active : modernColors.messageBackground};
  border-radius: ${borderRadius.md};
  cursor: pointer;
  transition: all ${transitions.fast};
  
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
  
  &:hover {
    background-color: ${modernColors.hover};
  }
  
  i {
    color: ${modernColors.textSecondary};
    font-size: 12px;
  }
`;

const ActionButtonsContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.sm};
`;

const ActionButton = styled.button<{ $variant?: 'primary' | 'secondary' | 'default' }>`
  display: flex;
  align-items: center;
  gap: ${spacing.xs};
  padding: ${spacing.xs} ${spacing.md};
  background-color: ${props => 
    props.$variant === 'primary' ? modernColors.primary : 
    props.$variant === 'secondary' ? modernColors.secondary : 
    modernColors.messageBackground
  };
  color: ${props => 
    (props.$variant === 'primary' || props.$variant === 'secondary') ? 'white' : 
    modernColors.textPrimary
  };
  border: none;
  border-radius: ${borderRadius.md};
  font-size: ${typography.fontSizes.md};
  font-weight: ${typography.fontWeights.medium};
  cursor: pointer;
  transition: all ${transitions.fast};
  
  &:hover {
    background-color: ${props => 
      props.$variant === 'primary' ? '#1a85e0' : 
      props.$variant === 'secondary' ? '#d9a300' : 
      modernColors.hover
    };
  }
  
  i {
    font-size: 14px;
  }
`;

const ExpandButton = styled.button<{ $isExpanded: boolean }>`
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: transparent;
  border: none;
  border-radius: ${borderRadius.md};
  color: ${modernColors.textSecondary};
  cursor: pointer;
  transition: all ${transitions.fast};
  
  &:hover {
    background-color: ${modernColors.hover};
    color: ${modernColors.textPrimary};
  }
  
  i {
    transition: transform ${transitions.fast};
    transform: ${props => props.$isExpanded ? 'rotate(180deg)' : 'rotate(0deg)'};
  }
`;

const ExpandedSection = styled.div<{ $isExpanded: boolean }>`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background-color: ${modernColors.contentBackground};
  border-bottom: 1px solid ${modernColors.border};
  padding: ${spacing.md} ${spacing.lg};
  z-index: 10;
  box-shadow: ${shadows.md};
  transition: all ${transitions.normal};
  max-height: ${props => props.$isExpanded ? '300px' : '0'};
  overflow: hidden;
  opacity: ${props => props.$isExpanded ? 1 : 0};
`;

const RelativeContainer = styled.div`
  position: relative;
`;

type Props = {
  currentConversation: IConversation;
};

export default function ActionBar({ currentConversation }: Props) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const { kind } = currentConversation.integration;
  const tags = currentConversation.tags || [];
  const assignedUser = currentConversation.assignedUser;
  const participatedUsers = currentConversation.participatedUsers || [];
  const readUsers = currentConversation.readUsers || [];

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const tagTrigger = (
    <TagButton id='conversationTags'>
      {tags.length ? (
        <Tags
          tags={tags}
          limit={1}
        />
      ) : (
        <span>{__('Add tags')}</span>
      )}
      <Icon icon='angle-down' />
    </TagButton>
  );

  const assignTrigger = (
    <AssignButton 
      id='conversationAssignTrigger' 
      $hasAssignee={!!assignedUser}
    >
      {assignedUser && assignedUser._id ? (
        <Avatar user={assignedUser} size={28} />
      ) : (
        <span>{__('Assign')}</span>
      )}
      <Icon icon='angle-down' />
    </AssignButton>
  );

  const renderParticipators = () => {
    if (!participatedUsers || participatedUsers.length === 0) {
      return null;
    }
    
    return (
      <ParticipantsContainer>
        <Participators
          participatedUsers={participatedUsers}
          limit={3}
        />
      </ParticipantsContainer>
    );
  };

  const renderReadUsers = () => {
    if (
      !['facebook-messenger', 'whatsapp', 'instagram-messenger'].includes(kind) ||
      !readUsers || 
      readUsers.length === 0 || 
      participatedUsers.length > 0
    ) {
      return null;
    }
    
    return (
      <ParticipantsContainer>
        <Participators
          participatedUsers={readUsers}
          limit={3}
        />
      </ParticipantsContainer>
    );
  };

  const renderDynamicComponents = (): JSX.Element[] => {
    const components: JSX.Element[] = [];
  
    // Add dynamic components
    const dynamicComponent = loadDynamicComponent('inboxConversationDetailActionBar', {
      conversation: currentConversation,
    });
  
    if (dynamicComponent) {
      components.push(dynamicComponent);
    }
  
    // Add Facebook Post component
    if (kind === 'facebook-post') {
      components.push(<Post key="facebook-post" conversation={currentConversation} />);
    }
  
    // Add Instagram Post component
    if (kind === 'instagram-post') {
      components.push(<PostInstagram key="instagram-post" conversation={currentConversation} />);
    }
  
    return components;
  };

  const renderConvertButton = () => {
    if (
      !isEnabled('sales') && 
      !isEnabled('tickets') && 
      !isEnabled('tasks') && 
      !isEnabled('purchases')
    ) {
      return null;
    }
    
    return <ConvertTo conversation={currentConversation} />;
  };

  return (
    <RelativeContainer>
      <ActionBarContainer>
        <ActionBarSection>
          <AssignSection>
            <AssignLabel>{__('Assign to')}:</AssignLabel>
            <AssignBoxPopover
              targets={[currentConversation]}
              trigger={assignTrigger}
            />
          </AssignSection>
          
          {renderParticipators()}
          {renderReadUsers()}
          {renderDynamicComponents()}
        </ActionBarSection>
        
        <ActionBarSection>
          <TagsContainer>
            <Tagger
              targets={[currentConversation]}
              trigger={tagTrigger}
            />
          </TagsContainer>
          
          <ActionButtonsContainer>
            {renderConvertButton()}
            
            <Resolver
              conversations={[currentConversation]}
              {...({ onClick, isResolved }) => (
                <ModernButton
                  variant={isResolved ? "primary" : "success"}
                  size="sm"
                  icon={isResolved ? "redo" : "check-circle"}
                  onClick={onClick}
                >
                  {isResolved ? __('Reopen') : __('Resolve')}
                </ModernButton>
              )}
            />
            
            <ExpandButton 
              $isExpanded={isExpanded}
              onClick={toggleExpand}
              title={isExpanded ? __('Hide details') : __('Show details')}
            >
              <Icon icon="ellipsis-h" />
            </ExpandButton>
          </ActionButtonsContainer>
        </ActionBarSection>
      </ActionBarContainer>
      
      <ExpandedSection $isExpanded={isExpanded}>
        <div>
          {/* Additional conversation details that can be shown when expanded */}
          <div>
            <strong>{__('Integration')}:</strong> {kind}
          </div>
          <div>
            <strong>{__('Created')}:</strong> {new Date(currentConversation.createdAt).toLocaleString()}
          </div>
          {currentConversation.updatedAt && (
            <div>
              <strong>{__('Last updated')}:</strong> {new Date(currentConversation.updatedAt).toLocaleString()}
            </div>
          )}
          {currentConversation.customer && (
            <div>
              <strong>{__('Customer')}:</strong> {currentConversation.customer.firstName} {currentConversation.customer.lastName}
            </div>
          )}
        </div>
      </ExpandedSection>
    </RelativeContainer>
  );
}