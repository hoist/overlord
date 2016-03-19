import {
  actions
}
from '../constants';
export function signup(form, redirect, failure) {
  return dispatch => {
    dispatch({
      type: actions.action.PENDING,
      payload: {
        actionName: actions.user.CREATED
      }
    });
    fetch('/api/user', {
        method: 'post',
        credentials: 'same-origin',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(form)
      })
      .then((response) => {
        return response
          .json()
          .then((result) => {
            if (response.status === 200) {
              dispatch({
                type: actions.action.SUCCESS,
                payload: {
                  actionName: actions.user.CREATED
                }
              });
              dispatch({
                type: actions.user.CREATED,
                payload: result
              });
              if (redirect) {
                redirect();
              }
            } else {
              dispatch({
                type: actions.action.FAILED,
                payload: {
                  actionName: actions.user.CREATED,
                  result: result
                }
              });
              if (failure) {
                failure();
              }
            }
          });
      })
      .catch((err) => {
        dispatch({
          type: actions.action.FAILED,
          payload: {
            actionName: actions.user.CREATED,
            result: err
          }
        });
        if (failure) {
          failure();
        }
      });
  }
}
export function forgotPassword(form, redirect, failure) {
  return dispatch => {
    dispatch({
      type: actions.action.PENDING,
      payload: {
        actionName: actions.user.FORGOT_PASSWORD_CREATED
      }
    });
    let uri = '/api/user/forgot-password';
    if (form.activationKey) {
      uri = `${uri}/${encodeURIComponent(form.activationKey)}`
    }
    fetch(uri, {
        method: 'post',
        credentials: 'same-origin',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(form)
      })
      .then((response) => {
        return response
          .json()
          .then((result) => {
            if (response.status === 200) {
              dispatch({
                type: actions.action.SUCCESS,
                payload: {
                  actionName: actions.user.FORGOT_PASSWORD_CREATED
                }
              });
              dispatch({
                type: actions.user.FORGOT_PASSWORD_CREATED,
                payload: result
              });
              if (redirect) {
                redirect();
              }
            } else {
              dispatch({
                type: actions.action.FAILED,
                payload: {
                  actionName: actions.user.FORGOT_PASSWORD_CREATED,
                  result: result
                }
              });
              if (failure) {
                failure();
              }
            }
          });
      })
      .catch((err) => {
        dispatch({
          type: actions.action.FAILED,
          payload: {
            actionName: actions.user.FORGOT_PASSWORD_CREATED,
            result: err
          }
        });
        if (failure) {
          failure();
        }
      });
  }
}
