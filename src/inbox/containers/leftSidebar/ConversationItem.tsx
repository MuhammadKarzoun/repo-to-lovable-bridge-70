import ConversationItem from '../../components/leftSidebar/ConversationItem';
import { IConversation } from '@octobots/ui-inbox/src/inbox/types';
import React from 'react';
import { IUser } from "@octobots/ui/src/auth/types";


type Props = {
  conversation: IConversation;
  currentConversationId?: string;
  toggleCheckbox: (conversation: IConversation, checked: boolean) => void;
  onClick: (conversation: IConversation) => void;
  selectedIds?: string[];
  currentUser: IUser;
};

const ConversationItemContainer: React.FC<Props> = (props) => {
  const { conversation, currentConversationId } = props;

  const updatedProps = {
    ...props,
    isActive: conversation._id === currentConversationId,
  };

  return <ConversationItem {...updatedProps} />;
};

export default ConversationItemContainer;