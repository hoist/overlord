import React from 'react';
import {Route, IndexRoute} from 'react-router';
import {setApplication} from './helpers';
import {UserActions} from '../../actions';

export function getRoutes(store) {
  return (
    <Route key="user-routes">
      <Route key="user" path='account'>
        <Route path='info' getComponent={(location, callback) => {
          require
            .ensure([], function (require) {
              callback(null, require('../../pages/my_account.jsx').default);
            });
        }}/>
      </Route>
    </Route>
  );
}
