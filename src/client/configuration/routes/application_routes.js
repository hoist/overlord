import React from 'react';
import {Route, IndexRoute} from 'react-router';
import {setApplication} from './helpers';
import {EditorActions} from '../../actions';

export function getRoutes(store) {
  return (
    <Route key="application-routes">
      <Route key="application" path='application'>
        <Route path='create' getComponent={(location, callback) => {
          require
            .ensure([], function(require) {
              callback(null, require('../../pages/create_application.jsx').default);
            });
        }}/>
      </Route>
      <Route key="applicationSlug" path=':applicationSlug' onEnter={(nextState, replaceState, callback) => setApplication(store, nextState, replaceState, callback)} getComponent={(location, callback) => {
        require
          .ensure([], function(require) {
            callback(null, require('../../pages/editor_page.jsx').default);
          });
      }}>
        <Route path="welcome" getComponent={(location, callback) => {
          require
            .ensure([], function(require) {
              callback(null, require('../../components/welcome.jsx').default);
            });
        }}></Route>
        <Route path="connector" getComponent={(location, callback) => {
          require
            .ensure([], function(require) {
              callback(null, require('../../components/connector_modal.jsx').default);
            });
        }}>
          <Route path="create">
            <IndexRoute getComponent={(location, callback) => {
              require
                .ensure([], function(require) {
                  callback(null, require('../../components/create_connector_list.jsx').default);
                });
            }}/>
            <Route path=":connectorType" getComponent={(location, callback) => {
              require
                .ensure([], function(require) {
                  callback(null, require('../../components/create_connector_form.jsx').default);
                });
            }}/>
          </Route>
          <Route path="edit">
            <Route path=":connectorKey" getComponent={(location, callback) => {
              require
                .ensure([], function(require) {
                  callback(null, require('../../components/edit_connector_form.jsx').default);
                });
            }}/>
          </Route>
        </Route>
      </Route>
    </Route>
  );
}
