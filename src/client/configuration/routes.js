import React from 'react';
import {Route, IndexRoute} from 'react-router';

import {redirectToDefaultRoute} from './routes/helpers';
import * as SessionRoutes from './routes/session_routes';
import * as OrganisationRoutes from './routes/organisation_routes';
import * as UserRoutes from './routes/user_routes';

export function getRoutes(store) {
  let routes = []
    .concat(SessionRoutes.getRoutes(store))
    .concat(UserRoutes.getRoutes(store))
    .concat(OrganisationRoutes.getRoutes(store));
  return (
    <Route path="/">  
      <IndexRoute onEnter={(nextState, replaceState, callback) => {
        redirectToDefaultRoute(store, nextState, replaceState, callback);
      }}/>
      {routes}
      <Route path="*" onEnter={(nextState, replaceState, callback) => {
        redirectToDefaultRoute(store, nextState, replaceState, callback);
      }}/>
    </Route>
  )
}
