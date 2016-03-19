import React from 'react';
import {Route, IndexRoute} from 'react-router';

import {redirectToDefaultRoute} from './routes/helpers';
import * as DefaultRoutes from './routes/default_routes';

export function getRoutes(store) {
  let routes = []
    .concat(DefaultRoutes.getRoutes(store));
  return (
    <Route>
      {routes}
    </Route>
  )
}
