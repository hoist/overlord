import React, {Component} from 'react';
import {configureStore} from '../store'
import {getRoutes} from '../configuration';

import {Provider} from 'react-redux';
import {ReduxRouter} from 'redux-router';

const initialState = window.INITIAL_STATE;

export const store = configureStore(initialState)

export class Router extends Component {
  render() {
    let children = [];
    children.push((<ReduxRouter key="router" routes={[getRoutes(store)]}/>));
    if (__DEVTOOLS__) {
      const DevTools = require('./dev_tools').default;
      children.push((<DevTools key="devtools" store={store}/>));
    }
    return (
      <div>
        <Provider store={store}>
          <div>
            {children}
          </div>
        </Provider>
      </div>
    );
  }
}
