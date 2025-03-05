import { IUser } from '@octobots/ui/src/auth/types';
import React from 'react';
import {
  OctobotsStaffProfile,
  OctobotsSupporters,
  StateSpan,
  Supporters as SupporterStyled
} from './styles';
import { __, getUserAvatar } from 'coreui/utils';

type Props = {
  showChatPreview?: boolean;
  supporterIds?: string[];
  teamMembers: IUser[];
  isOnline: boolean;
  showTimezone?: boolean;
  timezone?: string;
};

class Supporters extends React.Component<Props> {
  renderContent() {
    const { isOnline, teamMembers, supporterIds } = this.props;

    const supporters = teamMembers.filter(user =>
      (supporterIds || []).includes(user._id || '')
    );

    return supporters.map(u => {
      const details = u.details || {};

      return (
        <OctobotsStaffProfile key={u._id}>
          <div className="avatar">
            <img src={getUserAvatar(u)} alt={details.fullName} />
            <StateSpan state={isOnline || false} />
          </div>
        </OctobotsStaffProfile>
      );
    });
  }

  renderTimezone() {
    const { showTimezone, timezone } = this.props;

    if (!showTimezone) {
      return null;
    }

    return <span>{timezone ? timezone : __('No timezone chosen')}</span>;
  }

  render() {
    const { supporterIds, showChatPreview } = this.props;

    if ((supporterIds || []).length === 0) {
      return null;
    }

    if (showChatPreview) {
      return <SupporterStyled>{this.renderContent()}</SupporterStyled>;
    }

    return (
      <OctobotsSupporters>
        {this.renderContent()}
        {this.renderTimezone()}
      </OctobotsSupporters>
    );
  }
}

export default Supporters;
