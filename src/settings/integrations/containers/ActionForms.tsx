import { IUser, IUserDetails } from '@octobots/ui/src/auth/types';

import Button from '@octobots/ui/src/components/Button';
import Icon from '@octobots/ui/src/components/Icon';
import ModalTrigger from '@octobots/ui/src/components/ModalTrigger';
import React from 'react';
import SmsForm from '@octobots/ui-inbox/src/settings/integrations/containers/telnyx/SmsForm';
import Tip from '@octobots/ui/src/components/Tip';
import { __ } from '@octobots/ui/src/utils';
import EmailWidget from '@octobots/ui-inbox/src/inbox/components/EmailWidget';
import { isEnabled } from '@octobots/ui/src/utils/core';

type Props = {
  user: IUser;
};

class ActionForms extends React.Component<Props, {}> {
  render() {
    const { user } = this.props;
    const { operatorPhone } = user.details || ({} as IUserDetails);

    const smsForm = props => (
      <SmsForm {...props} primaryPhone={operatorPhone} />
    );

    return (
      <>
        {(isEnabled('engages') || isEnabled('imap')) && (
          <EmailWidget
            disabled={user.email ? false : true}
            buttonStyle={user.email ? 'primary' : 'simple'}
            emailTo={user.email}
            customerId={user._id || undefined}
            buttonSize="small"
            type="action"
          />
        )}

        <ModalTrigger
          dialogClassName="middle"
          title={`Send SMS to (${operatorPhone})`}
          trigger={
            <Button
              disabled={operatorPhone ? false : true}
              size="small"
              btnStyle={operatorPhone ? 'primary' : 'simple'}
            >
              <Tip text="Send SMS" placement="top-end">
                <Icon icon="message" />
              </Tip>
            </Button>
          }
          content={smsForm}
        />
      </>
    );
  }
}

export default ActionForms;
