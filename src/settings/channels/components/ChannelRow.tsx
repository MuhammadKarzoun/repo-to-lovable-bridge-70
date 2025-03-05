import { ActionButtons, SidebarListItem } from "@octobots/ui-settings/src/styles";

import Button from "@octobots/ui/src/components/Button";
import ChannelForm from "@octobots/ui-inbox/src/settings/channels/containers/ChannelForm";
import { FieldStyle } from "@octobots/ui/src/layout/styles";
import { IButtonMutateProps } from "@octobots/ui/src/types";
import { IChannel } from "@octobots/ui-inbox/src/settings/channels/types";
import { IUser } from "@octobots/ui/src/auth/types";
import Icon from "@octobots/ui/src/components/Icon";
import { Link } from "react-router-dom";
import MemberAvatars from "@octobots/ui/src/components/MemberAvatars";
import ModalTrigger from "@octobots/ui/src/components/ModalTrigger";
import React from "react";
import Tip from "@octobots/ui/src/components/Tip";
import { __ } from "coreui/utils";
import { ISkill } from "../types";

type Props = {
  channel: IChannel;
  members: IUser[];
  skills: ISkill[];
  remove: (id: string) => void;
  isActive: boolean;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
};

class ChannelRow extends React.Component<Props, {}> {
  remove = () => {
    const { remove, channel } = this.props;
    remove(channel._id);
  };

  renderEditAction = () => {
    const { channel, renderButton, skills } = this.props;

    const editTrigger = (
      <Button btnStyle="link">
        <Icon icon="edit" />
      </Button>
    );

    const content = (props) => (
      <ChannelForm {...props} channel={channel} skills={skills} renderButton={renderButton} />
    );

    return (
      <ModalTrigger
        title="Edit"
        tipText="Edit"
        trigger={editTrigger}
        content={content}
      />
    );
  };

  render() {
    const { channel, isActive, members } = this.props;
    const selectedMemberIds = channel.memberIds || [];

    return (
      <SidebarListItem key={channel._id} $isActive={isActive}>
        <Link to={`?_id=${channel._id}`}>
          <FieldStyle>
            {channel.name}
            <MemberAvatars
              allMembers={members}
              selectedMemberIds={selectedMemberIds}
            />
          </FieldStyle>
        </Link>
        <ActionButtons>
          {this.renderEditAction()}
          <Tip text="Delete" placement="bottom">
            <Button btnStyle="link" onClick={this.remove} icon="cancel-1" />
          </Tip>
        </ActionButtons>
      </SidebarListItem>
    );
  }
}

export default ChannelRow;
