import React from 'react';
import {
  Route,
  IndexRoute
} from 'react-router';
import {
  setApplication
} from './helpers';
import {
  EditorActions
} from '../../actions';

export function getRoutes(store) {
  return (
    <Route path="/" getComponent={(location, callback) => {
      require
        .ensure([], function(require) {
          callback(null, require('../../components/page.jsx').default);
        });
    }} key="dashboard-route">
      <Route path='home' getComponent={(location, callback) => {
        require
          .ensure([], function(require) {
            callback(null, require('../../pages/dashboard.jsx').default);
          });
      }}/>
    </Route>
  );
}
