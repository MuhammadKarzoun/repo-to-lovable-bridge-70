import React from 'react';
import HistoryName from './components/HistoryName';

const Automation = props => {
  const { componentType } = props;
console.log('we are here habibi', props);
  switch (componentType) {
    case 'historyName':
      return <HistoryName {...props} />;

    default:
      return null;
  }
};

export default Automation;
