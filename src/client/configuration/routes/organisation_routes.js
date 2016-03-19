import React from 'react';
import {requireAuth, setOrganisation, redirectToDefaultRoute} from './helpers';
import {getRoutes as getApplicationRoutes} from './application_routes';
import {Route, IndexRoute} from 'react-router';

export function getRoutes(store) {
  return (
    <Route key="organisation-routes" onEnter={(nextState, replaceState, callback) => requireAuth(store, nextState, replaceState, callback)}>
      <Route key='organisation' path='organisation'>
        <Route path='create' getComponent={(location, callback) => {
          require
            .ensure([], function (require) {
              callback(null, require('../../pages/create_organisation.jsx').default);
            });
        }}/>
      </Route>
      <Route key='organisationSlug' path=':organisationSlug' onEnter={(nextState, replaceState, callback) => setOrganisation(store, nextState, replaceState, callback)}>
        <IndexRoute onEnter={(nextState, replaceState, callback) => {
          redirectToDefaultRoute(store, nextState, replaceState, callback);
        }}/>
        {getApplicationRoutes(store)}
      </Route>
    </Route>
  );
}
