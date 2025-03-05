import Button from '@octobots/ui/src/components/Button';
import ChannelForm from '@octobots/ui-inbox/src/settings/channels/containers/ChannelForm';
import ChannelRow from './ChannelRow';
import EmptyState from '@octobots/ui/src/components/EmptyState';
import { Header } from '@octobots/ui-settings/src/styles';
import { IButtonMutateProps } from '@octobots/ui/src/types';
import { IChannel } from '@octobots/ui-inbox/src/settings/channels/types';
import LeftSidebar from '@octobots/ui/src/layout/components/Sidebar';
import ModalTrigger from '@octobots/ui/src/components/ModalTrigger';
import React from 'react';
import { SidebarList } from '@octobots/ui/src/layout/styles';
import Spinner from '@octobots/ui/src/components/Spinner';
import { ISkillDocument } from '@octobots/ui-inbox/src/settings/skills/types';

type Props = {
  channels: IChannel[];
  skills: ISkillDocument[];
  remove: (channelId: string) => void;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  loading: boolean;
  currentChannelId?: string;
  channelsTotalCount: number;
};

class Sidebar extends React.Component<Props, {}> {
  renderItems = () => {
    const { channels, skills, remove, currentChannelId, renderButton } = this.props;
    return channels.map(channel => (
      <ChannelRow
        key={channel._id}
        isActive={currentChannelId === channel._id}
        channel={channel}
        skills={skills}
        members={channel.members}
        remove={remove}
        renderButton={renderButton}
      />
    ));
  };

  renderSidebarHeader() {
    const { renderButton, skills } = this.props;

    const addChannel = (
      <Button btnStyle="primary" block={true} icon="plus-circle" iconLeftAlignment  style={{
        borderBottomRightRadius:0,
        borderBottomLeftRadius:0,

      }} >
        Add New Channel
      </Button>
    );


    const content = props => {
      const updatedProps = {
        ...props,
        skills
      };
      return (
        <ChannelForm {...updatedProps} renderButton={renderButton} />
      );
    } 

    return (
      
        <ModalTrigger
          title="New Channel"
          autoOpenKey="showChannelAddModal"
          trigger={addChannel}
          content={content}
          hideHeader
          size='lg'
        />
      
    );
  }
  render() {
    const { loading, channelsTotalCount } = this.props;

    return (
      <LeftSidebar
        wide={true}
        hasBorder={false}
        header={this.renderSidebarHeader()}
      >
        <SidebarList $noTextColor={true} $noBackground={true}>
          {this.renderItems()}
        </SidebarList>
        {loading && <Spinner />}
        {!loading && channelsTotalCount === 0 && (
          <EmptyState
            image="/images/actions/18.svg"
            text="There is no channel"
          />
        )}
      </LeftSidebar>
    );
  }
}

export default Sidebar;
