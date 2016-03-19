import {
  actions
} from '../constants';

import {
  CALL_API
} from 'redux-api-middleware';

export function initEditor() {
  return dispatch => {
    return fetch('/api/editor/state', {
        method: 'GET',
        credentials: 'same-origin',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      })
      .then((response) => {

        return response
          .json()
          .then((editorInfo) => {
            dispatch({
              type: actions.editor.LOADED_EDITOR,
              payload: editorInfo
            });
          });
      });
  }
}
export function switchEvent(event) {
  return dispatch => {
    return fetch(`/api/editor/script/${event}`, {
        method: 'GET',
        credentials: 'same-origin',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      })
      .then((response) => {
        if (response.status === 200) {
          return response
            .json()
            .then((script) => {
              dispatch({
                type: actions.editor.LOADED_SCRIPT,
                payload: script
              });
            });
        }
      });
  }
}
export function getConsoleMessages() {

  return (dispatch, getState) => {
    let state = getState();
    let endpoint = '/api/console';
    if (state.console.continuationToken) {
      endpoint = endpoint + "?continuationToken=" + state.console.continuationToken;
    }
    return dispatch({
      [CALL_API]: {
        endpoint,
        method: 'GET',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json'
        },
        types: [actions.console.POLL.REQUESTING, actions.console.POLL.SUCCESS, actions.console.POLL.FAILED]
      }
    });
  }
}
export function addEvent(eventName) {
  return (dispatch, getState) => {
    let state = getState();
    if (state.events && state.events.find((ev) => {
        return ev.key === eventName;
      })) {
      return;
    } else {
      return dispatch({
        [CALL_API]: {
          endpoint: '/api/event',
          method: 'POST',
          credentials: 'same-origin',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            eventName
          }),
          types: [actions.event.CREATE.REQUESTING, actions.event.CREATE.SUCCESS, actions.event.CREATE.FAILED]
        }
      })
    }
  }
}
export function saveCode(eventName, code) {
  return dispatch => {
    return dispatch({
      [CALL_API]: {
        endpoint: `/api/editor/script/${eventName}`,
        method: 'POST',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          code: code
        }),
        types: [actions.editor.SAVED_SCRIPT.REQUESTING, actions.editor.SAVED_SCRIPT.SUCCESS, actions.editor.SAVED_SCRIPT.FAILED]
      }
    })
  }
}
