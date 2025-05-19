import { getConfig, setConfig } from '@octobots/ui-inbox/src/inbox/utils';

import DumbToggler from '@octobots/ui-inbox/src/inbox/components/leftSidebar/FilterToggler';
import React from 'react';

type Props = {
  groupText: string;
  toggleName: string;
  icon?: string;
  manageUrl?: string;
  children: React.ReactNode;
  isOpen: boolean;
  toggle: (params: { isOpen: boolean }) => void;
};

const STORAGE_KEY = 'octobots_additional_sidebar_config';

export default class FilterToggler extends React.PureComponent<Props, {}> {
  toggle = ({ isOpen }: { isOpen: boolean }) => {
    const name = this.props.toggleName;

    const config = getConfig(STORAGE_KEY);

    config[name] = isOpen;

    setConfig(STORAGE_KEY, config);
  };

  render() {
    const config = getConfig(STORAGE_KEY);
    const name = this.props.toggleName;

    if (!localStorage.getItem(STORAGE_KEY)) {
      setConfig(STORAGE_KEY, {
        showChannels: true,
        showBrands: false,
        showIntegrations: false,
        showTags: false,
        showSegments: false,
      });
    }

    const updatedProps = {
      ...this.props,
      isOpen: config[name],
      toggle: this.toggle,
    };

    return <DumbToggler {...updatedProps} />;
  }
}
