import { __ } from 'coreui/utils';
import { isEnabled, loadDynamicComponent } from '@octobots/ui/src/utils/core';
import React, { useState } from 'react';
import styled from 'styled-components';
import { modernColors, borderRadius, spacing, typography, transitions, shadows } from '../../../../styles/theme';

import { IConversation } from '@octobots/ui-inbox/src/inbox/types';
import Resolver from '../../../containers/Resolver';
import Icon from '@octobots/ui/src/components/Icon';

import asyncComponent from '@octobots/ui/src/components/AsyncComponent';
import Button from '@octobots/ui/src/components/Button';
import Tip from '@octobots/ui/src/components/Tip';
import { ActionIconContainer } from '@octobots/ui-inbox/src/inbox/styles';

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

const InfoSection = asyncComponent(
  () =>
    import(
      /* webpackChunkName:"Inbox-Sidebar-InfoSection" */ "@octobots/ui-contacts/src/customers/components/common/InfoSection"
    ),
  { withImage: true }
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

const ParticipantsContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.sm};
  margin-left: ${spacing.md};
`;

const ActionButtonsContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.sm};
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
  toggle?: () => void;
};

export default function ActionBar({ currentConversation, toggle }: Props) {
  const [isExpanded, setIsExpanded] = useState(false);

  const { kind } = currentConversation.integration;
  const participatedUsers = currentConversation.participatedUsers || [];
  const readUsers = currentConversation.readUsers || [];

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

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
          <InfoSection integration={currentConversation.integration} customer={currentConversation.customer} hideForm={true} avatarSize={40} noPadding={true} />
        </ActionBarSection>

        <ActionBarSection>
          {renderParticipators()}
          {renderReadUsers()}
          {renderDynamicComponents()}
        </ActionBarSection>

        <ActionBarSection>

          <ActionButtonsContainer>
            {renderConvertButton()}

            <Resolver
              conversations={[currentConversation]}
              {...({ onClick, isResolved }) => (
                <Button

                  btnStyle={isResolved ? "primary" : "success"}
                  size="small"
                  icon={isResolved ? "redo" : "check-circle"}
                  iconLeftAlignment={true}
                  onClick={onClick}
                >
                  {isResolved ? __('Reopen') : __('Resolve')}
                </Button>
              )}
            />

            <ExpandButton
              $isExpanded={isExpanded}
              onClick={toggleExpand}
              title={isExpanded ? __('Hide details') : __('Show details')}
            >
              <Icon icon="ellipsis-h" />
            </ExpandButton>
            <ActionIconContainer onClick={toggle}>
              <Tip placement="top" text={__('Open/Hide sidebar')}>
                <Icon icon="subject" />
              </Tip>
            </ActionIconContainer>
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