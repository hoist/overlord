import React from 'react';
import {
  Route,
  IndexRoute
} from 'react-router';

export function getRoutes(store) {
  return (
    <Route getComponent={(location, callback) => {
      require
        .ensure([], function(require) {
          callback(null, require('../../components/page.jsx').default);
        });
    }} key="dashboard-route">
      <Route path='/' getComponent={(location, callback) => {
        require
          .ensure([], function(require) {
            callback(null, require('../../pages/dashboard.jsx').default);
          });
      }}/>
    </Route>
  );
}
