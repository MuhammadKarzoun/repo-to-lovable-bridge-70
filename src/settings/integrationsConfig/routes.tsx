import { Route, Routes } from "react-router-dom";

import React from "react";
import asyncComponent from "@octobots/ui/src/components/AsyncComponent";

const IntegrationsConfig = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "IntegrationConfigs - Settings" */ "./containers/IntegrationConfigs"
    )
);

const routes = () => (
  <Routes>
    <Route
      path="/settings/integrations-config/"
      element={<IntegrationsConfig />}
    />
  </Routes>
);

export default routes;
