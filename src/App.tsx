import React from 'react';
import GeneralRoutes from './generalRoutes';
import { PluginLayout } from '@octobots/ui/src/styles/main';
import { AppProvider } from 'coreui/appContext';
import { dummyUser } from '@octobots/ui/src/constants/dummy-data';
import '@octobots/ui/src/styles/global-styles.ts';
import 'octobots-icon/css/octobots.min.css';
import '@octobots/ui/src/styles/style.min.css';
import '@nateradebaugh/react-datetime/css/react-datetime.css';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import localizedFormat from 'dayjs/plugin/localizedFormat';

dayjs.extend(localizedFormat);
dayjs.extend(relativeTime);

const App = () => {
  return (
    <PluginLayout>
      <AppProvider currentUser={dummyUser}>
        <GeneralRoutes />
      </AppProvider>
    </PluginLayout>
  );
};

export default App;