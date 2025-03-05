import Widget from '@octobots/ui-inbox/src/inbox/components/EmailWidget';
import { isEnabled } from '@octobots/ui/src/utils/core';
import React from 'react';

export default function EmailWidget() {
  return isEnabled('engages') || isEnabled('imap') ? <Widget type='widget' /> : null;
}
