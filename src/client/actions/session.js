import {actions} from '../constants';
export function logout(redirect) {
  return dispatch => {
    dispatch({
      type: actions.action.PENDING,
      payload: {
        actionName: actions.session.LOGGED_OUT
      }
    });
    fetch('/api/session', {
      method: 'delete',
      credentials: 'same-origin',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    }).then((response) => {
      if (response.status === 200) {
        dispatch({
          type: actions.action.SUCCESS,
          payload: {
            actionName: actions.session.LOGGED_IN
          }
        });
      } else {
        return response
          .json()
          .then((result) => {
            dispatch({
              type: actions.action.FAILED,
              payload: {
                actionName: actions.session.LOGGED_OUT,
                result: result
              }
            });
          })
      }
    }).catch((err) => {
      dispatch({
        type: actions.action.FAILED,
        payload: {
          actionName: actions.session.LOGGED_OUT,
          result: err
        }
      });
    }).then(() => {
      dispatch({type: actions.session.LOGGED_OUT});
      redirect && redirect();
    });
  }
}
export function login(form, redirect, failure) {
  return dispatch => {
    dispatch({
      type: actions.action.PENDING,
      payload: {
        actionName: actions.session.LOGGED_IN
      }
    });
    fetch('/api/session', {
      method: 'post',
      credentials: 'same-origin',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(form)
    }).then((response) => {
      return response
        .json()
        .then((result) => {
          if (response.status === 200) {
            dispatch({
              type: actions.action.SUCCESS,
              payload: {
                actionName: actions.session.LOGGED_IN
              }
            });
            dispatch({type: actions.session.LOGGED_IN, payload: result});
            if (redirect) {
              redirect();
            }
          } else {
            dispatch({
              type: actions.action.FAILED,
              payload: {
                actionName: actions.session.LOGGED_IN,
                result: result
              }
            });
            if(failure) {
              failure();
            }
          }
        });
    }).catch((err) => {
      dispatch({
        type: actions.action.FAILED,
        payload: {
          actionName: actions.session.LOGGED_IN,
          result: err
        }
      });
      if(failure) {
        failure();
      }
    });
  }
}
