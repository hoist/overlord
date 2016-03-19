import {
  actions
} from '../constants';
import {
  CALL_API
} from 'redux-api-middleware';
export function showAuthorization(uri) {
  window.location = uri;
}
export function onConnectorConnect(connectorType, form) {
  return (dispatch) => {
    return dispatch({
      [CALL_API]: {
        endpoint: '/api/connector/connect',
        method: 'POST',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          connectorType,
          ...form
        }),
        types: [
          actions.connector.CONNECT.REQUESTING, {
            type: 'SUCCESS',
            payload: (action, state, res) => {
              const contentType = res
                .headers
                .get('Content-Type');
              if (contentType && ~contentType.indexOf('json')) {
                // Just making sure res.json() does not raise an error
                return res
                  .json()
                  .then((json) => showAuthorization(json.uri));
              }
            }
          },
          actions.connector.CONNECT.FAILED
        ]
      }
    });
  }
}
