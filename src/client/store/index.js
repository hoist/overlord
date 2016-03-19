/* global __DEVTOOLS__ */
import {createStore, combineReducers, compose, applyMiddleware} from 'redux';
import {reduxReactRouter, routerStateReducer} from 'redux-router';
import {devTools, persistState} from 'redux-devtools';
import createBrowserHistory from 'history/lib/createBrowserHistory';
import thunk from 'redux-thunk';
import logger from '../middleware/logger';
import * as reducers from '../reducers';
import {apiMiddleware} from 'redux-api-middleware';

// Use hash location for Github Pages
// but switch to HTML5 history locally.
const createHistory = createBrowserHistory

let combinedCreateStore
const storeEnhancers = [reduxReactRouter({createHistory})]

if (__DEVTOOLS__) {
  const DevTools = require('../components/dev_tools').default;
  storeEnhancers.push(DevTools.instrument())
}

const finalCreateStore = compose(applyMiddleware(thunk, apiMiddleware, logger), ...storeEnhancers)(createStore);
const combinedReducer = combineReducers(Object.assign({
  router: routerStateReducer
}, reducers))

export function configureStore(initialState) {

  const store = finalCreateStore(combinedReducer, initialState)

  if (module.hot)
    // Enable Webpack hot module replacement for reducers
    module.hot.accept('../reducers', () => {
      const nextRootReducer = require('../reducers/index').default
      store.replaceReducer(nextRootReducer)
    })

  return store
}
