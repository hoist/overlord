import React from 'react';
import {
  redirectToDefaultRouteIfLoggedIn,
  logout
} from './helpers';
import {
  Route,
  IndexRoute
} from 'react-router';

export function getRoutes(store) {
  let sessionRoutes = (
    <Route key="session-routes">
      <Route path="login" key="login" onEnter={(nextState, replaceState, callback) => redirectToDefaultRouteIfLoggedIn(store, nextState, replaceState, callback)} getComponent={(location, callback) => {
        require
          .ensure([], function (require) {
            callback(null, require('../../pages/login_page.jsx').default);
          });
      }}/>
      <Route path='logout' key="logout" onEnter={(nextState, replaceState, callback) => {
        logout(store, nextState, replaceState, callback);
      }}/>
      <Route path="signup" key="signup" onEnter={(nextState, replaceState, callback) => redirectToDefaultRouteIfLoggedIn(store, nextState, replaceState, callback)} getComponent={(location, callback) => {
        require
          .ensure([], function (require) {
            callback(null, require('../../pages/login_page.jsx').default);
          });
      }}/>
      <Route path="forgot-password" key="forgot-password" onEnter={(nextState, replaceState, callback) => redirectToDefaultRouteIfLoggedIn(store, nextState, replaceState, callback)} getComponent={(location, callback) => {
          console.log('matches')
          require
            .ensure([], function (require) {
              callback(null, require('../../pages/login_page.jsx').default);
            });
        }}>
        <Route path=":activationKey" key="forgot-password" onEnter={(nextState, replaceState, callback) => redirectToDefaultRouteIfLoggedIn(store, nextState, replaceState, callback)}/>
      </Route>

    </Route>
  );
  return sessionRoutes;
};
