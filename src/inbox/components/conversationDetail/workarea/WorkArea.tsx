import { __ } from 'coreui/utils';
import ActionBar from './ActionBar';
import { ContentBox } from '@octobots/ui/src/layout/styles';
import React from 'react';
import { IConversation } from '@octobots/ui-inbox/src/inbox/types';
import { RenderConversationWrapper } from './styles';

type Props = {
  currentConversation: IConversation;
  content: any;
  toggle?: () => void;
};
export default class WorkArea extends React.Component<Props> {

  render() {
    const { currentConversation, content, toggle } = this.props;

    return (
      <>
        <ActionBar toggle={toggle} currentConversation={currentConversation} />

        <ContentBox>
          <RenderConversationWrapper>{content}</RenderConversationWrapper>
        </ContentBox>
      </>
    );
  }
}
