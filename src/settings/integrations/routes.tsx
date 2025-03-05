import { Route, Routes, useLocation, useParams } from 'react-router-dom';

import { Authorization } from './containers/Authorization';
import React from 'react';
import asyncComponent from '@octobots/ui/src/components/AsyncComponent';
import queryString from 'query-string';
import CreateIntegration from './components/store/CreateIntegration';

const Store = asyncComponent(
  () => import(/* webpackChunkName: "Settings Store" */ './containers/Store'),
);

const HomeIntegration = asyncComponent(
  () => import(/* webpackChunkName: "Settings Store" */ './containers/HomeIntegration'),
);

const CreateMessenger = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "Settings CreateMessenger" */ './containers/messenger/Create'
    ),
);

const EditMessenger = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "Settings EditMessenger" */ './containers/messenger/Edit'
    ),
);

const IntegrationConfigs = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "Integration configs" */ '../integrationsConfig/containers/IntegrationConfigs'
    ),
);

const CreateMessengerComponent = () => {
  const location = useLocation();

  return <CreateMessenger queryParams={queryString.parse(location.search)} />;
};

const EditMessengerComponent = () => {
  const { _id } = useParams();

  return <EditMessenger integrationId={_id} />;
};

const HomeIntegrationComponent = () => {
  const location = useLocation();

  return <HomeIntegration queryParams={queryString.parse(location.search)} />;
};

const CreateIntegrationComponent = () => {
  const location = useLocation();

  return <Store queryParams={queryString.parse(location.search)} />;
};

const AuthComponent = () => {
  const location = useLocation();

  return <Authorization queryParams={queryString.parse(location.search)} />;
};

const routes = () => (
  <Routes>
    <Route
      key="/settings/integrations/createMessenger"
      path="/settings/integrations/createMessenger"
      element={<CreateMessengerComponent />}
    />

    <Route
      key="/settings/integrations/editMessenger/:_id"
      path="/settings/integrations/editMessenger/:_id"
      element={<EditMessengerComponent />}
    />

    <Route
      key="/settings/authorization"
      path="/settings/authorization"
      element={<AuthComponent />}
    />

    <Route
      key="/settings/integrations"
      path="/settings/integrations"
      element={<HomeIntegrationComponent />}
    />

<Route
      key="/settings/integrations/create"
      path="/settings/integrations/create"
      element={<CreateIntegrationComponent />}
    />
    <Route
      key="/settings/integrations-configs/"
      path="/settings/integrations-configs/"
      element={<IntegrationConfigs />}
    />
  </Routes>
);

export default routes;
