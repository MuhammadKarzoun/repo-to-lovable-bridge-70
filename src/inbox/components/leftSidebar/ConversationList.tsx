import Button from '@octobots/ui/src/components/Button';
import ConversationItem from '../../containers/leftSidebar/ConversationItem';
import { ConversationItems } from './styles';
import EmptyState from '@octobots/ui/src/components/EmptyState';
import { IConversation } from '@octobots/ui-inbox/src/inbox/types';
import React from 'react';
import { __ } from '@octobots/ui/src/utils/core';
import styled from 'styled-components';
import { modernColors, borderRadius, spacing, typography, transitions } from '../../../styles/theme';
import ModernButton from '../../../components/common/Button';
import { IUser } from "@octobots/ui/src/auth/types";

const EmptyStateWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${spacing.xl};
  text-align: center;
  
  img {
    width: 120px;
    height: 120px;
    margin-bottom: ${spacing.lg};
  }
  
  h4 {
    font-size: ${typography.fontSizes.lg};
    font-weight: ${typography.fontWeights.medium};
    margin-bottom: ${spacing.md};
    color: ${modernColors.textPrimary};
  }
  
  p {
    color: ${modernColors.textSecondary};
    margin-bottom: ${spacing.lg};
  }
`;

const LoadMoreButton = styled.button`
  background: none;
  border: none;
  color: ${modernColors.primary};
  font-size: ${typography.fontSizes.md};
  padding: ${spacing.md};
  width: 100%;
  text-align: center;
  cursor: pointer;
  transition: all ${transitions.fast};
  
  &:hover {
    background-color: ${modernColors.hover};
  }
  
  i {
    margin-right: ${spacing.xs};
  }
`;

type Props = {
  conversations: IConversation[];
  currentConversationId?: string;
  selectedConversations?: IConversation[];
  onChangeConversation: (conversation: IConversation) => void;
  toggleRowCheckbox: (conversation: IConversation[], checked: boolean) => void;
  loading: boolean;
  totalCount: number;
  onLoadMore: () => void;
  location: any;
  navigate: any;
  currentUser: IUser;
};

export default class ConversationList extends React.Component<Props> {
  renderLoadMore() {
    const { loading, conversations, totalCount, onLoadMore } = this.props;

    if (conversations.length >= totalCount) {
      return null;
    }

    return (
      <LoadMoreButton onClick={onLoadMore}>
        <i className="icon-redo"></i>
        {loading ? __('Loading...') : __('Load more')}
      </LoadMoreButton>
    );
  }

  render() {
    const { 
      conversations, 
      currentConversationId, 
      selectedConversations, 
      onChangeConversation, 
      toggleRowCheckbox, 
      loading,
      currentUser
    } = this.props;

    if (!loading && conversations.length === 0) {
      return (
        <EmptyStateWrapper>
          <img src="/images/actions/6.svg" alt="No conversations" />
          <h4>{__("No conversations yet")}</h4>
          <p>{__("When you receive messages, they'll appear here")}</p>
          <ModernButton variant="primary" icon="plus-circle">
            {__("Start a conversation")}
          </ModernButton>
        </EmptyStateWrapper>
      );
    }

    return (
      <React.Fragment>
        <ConversationItems id="conversations">
          {conversations.map(conv => (
            <ConversationItem
              key={conv._id}
              conversation={conv}
              toggleCheckbox={toggleRowCheckbox}
              onClick={onChangeConversation}
              selectedIds={(selectedConversations || []).map(
                conversation => conversation._id
              )}
              currentConversationId={currentConversationId}
              currentUser={currentUser}
            />
          ))}
        </ConversationItems>

        {this.renderLoadMore()}
      </React.Fragment>
    );
  }
}