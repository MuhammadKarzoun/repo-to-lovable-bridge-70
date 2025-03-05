import {
  CallButtons,
  OctobotsAvatar,
  OctobotsDate,
  OctobotsFromCustomer,
  OctobotsMessage,
  OctobotsMessageSender,
  OctobotsMessagesList,
  OctobotsSpacialMessage,
  FromCustomer,
  SkillWrapper,
  VideoCallRequestWrapper
} from './styles';
import {
  IMessagesItem,
  ISkillData
} from '@octobots/ui-inbox/src/settings/integrations/types';

import Button from '@octobots/ui/src/components/Button';
import React from 'react';
import { __ } from 'coreui/utils';

type Props = {
  color: string;
  textColor: string;
  wallpaper: string;
  isOnline?: boolean;
  skillData?: ISkillData;
  activeStep?: string;
  showVideoCallRequest?: boolean;
  message?: IMessagesItem;
};

class WidgetContent extends React.Component<Props, { skillResponse?: string }> {
  constructor(props) {
    super(props);

    this.state = {
      skillResponse: ''
    };
  }
  onSkillClick = skill => {
    this.setState({ skillResponse: skill.response && skill.response });
  };

  renderMessage = msg => {
    if (!msg) {
      return null;
    }

    return <OctobotsSpacialMessage>{msg}</OctobotsSpacialMessage>;
  };

  renderVideoCall() {
    const { showVideoCallRequest, color, activeStep } = this.props;

    if (!showVideoCallRequest || activeStep !== 'default') {
      return null;
    }

    return (
      <VideoCallRequestWrapper color={color}>
        <h5>{__('Audio and video call')}</h5>
        <p>{__('You can contact the operator by voice or video!')}</p>
        <CallButtons color={color}>
          <Button icon="phone-call">{__('Audio call')}</Button>
          <Button icon="videocamera">{__('Video call')}</Button>
        </CallButtons>
      </VideoCallRequestWrapper>
    );
  }

  renderSkills() {
    const { activeStep, color, skillData } = this.props;

    if (
      !skillData ||
      (Object.keys(skillData) || []).length === 0 ||
      !skillData.options ||
      activeStep !== 'intro'
    ) {
      return null;
    }

    if (this.state.skillResponse) {
      return (
        <SkillWrapper>
          <FromCustomer>{this.state.skillResponse}</FromCustomer>
        </SkillWrapper>
      );
    }

    return (
      <SkillWrapper color={color}>
        {(skillData.options || []).map((skill, index) => {
          if (!skill.label) {
            return null;
          }

          return (
            <Button onClick={this.onSkillClick.bind(this, skill)} key={index}>
              {skill.label}
            </Button>
          );
        })}
      </SkillWrapper>
    );
  }

  render() {
    const { color, wallpaper, message, isOnline, textColor } = this.props;

    const backgroundClasses = `background-${wallpaper}`;

    return (
      <>
        <OctobotsMessagesList className={backgroundClasses}>
          {isOnline && this.renderMessage(message && message.welcome)}
          {this.renderSkills()}
          {this.renderVideoCall()}
          <li>
            <OctobotsAvatar>
              <img src="/images/avatar-colored.jpeg" alt="avatar" />
            </OctobotsAvatar>
            <OctobotsMessage>{__('Hi, any questions?')}</OctobotsMessage>
            <OctobotsDate>{__('1 hour ago')}</OctobotsDate>
          </li>
          <OctobotsFromCustomer>
            <FromCustomer style={{ backgroundColor: color, color: textColor }}>
              {__('We need your help!')}
            </FromCustomer>
            <OctobotsDate>{__('6 minutes ago')}</OctobotsDate>
          </OctobotsFromCustomer>
          {!isOnline && this.renderMessage(message && message.away)}
        </OctobotsMessagesList>

        <OctobotsMessageSender>
          <span>{__('Send a message')} ...</span>
        </OctobotsMessageSender>
      </>
    );
  }
}

export default WidgetContent;
