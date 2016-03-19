import {actions} from '../constants';
export function createApplication(form, redirect) {
  return dispatch => {
    dispatch({
      type: actions.action.PENDING,
      payload: {
        actionName: actions.application.CREATE_APPLICATION
      }
    });
    fetch('/api/application', {
      method: 'POST',
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
          if (response.status === 201) {
            dispatch({
              type: actions.action.SUCCESS,
              payload: {
                actionName: actions.application.CREATE_APPLICATION
              }
            });
            dispatch({type: actions.application.CREATE_APPLICATION, payload: result});
            dispatch({type: actions.application.SWITCH_APPLICATION, payload: result});
            if (redirect) {
              redirect();
            }
          } else {
            dispatch({
              type: actions.action.FAILED,
              payload: {
                actionName: actions.application.CREATE_APPLICATION,
                result: result
              }
            });
          }
        });
    }).catch((err) => {
      dispatch({
        type: actions.action.FAILED,
        payload: {
          actionName: actions.organisation.CREATE_ORGANISATION,
          result: err
        }
      });
    })
  }
}
export function setCurrentApplication(dispatch, application) {
  return fetch(`/api/session/application`, {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({_id: application._id})
  }).then((response) => {
    if (response.status === 200) {
      return response
        .json()
        .then((result) => {
          dispatch({type: actions.session.UPDATE_SESSION, payload: result});
          return true;
        });
    } else {
      return false;
    }
  }).catch((err) => {
    throw err;
  });
}

export function switchApplication(slug, next) {
  return (dispatch, getState) => {
    let state = getState();
    if (state.application.slug === slug) {
      //dont do anything
      if (next) {
        next(true);
      }
    } else {
      console.log('finding application');
      let applicationFromStore = state
        .applications
        .find((application) => application.slug === slug);
      console.log('application found?', slug, applicationFromStore);
      if (applicationFromStore) {
        setCurrentApplication(dispatch, applicationFromStore)
          .then(next)
          .catch(() => next(false));
      } else {
        //no matching application from store, we should check the server
        fetch(`/api/application/${slug}`, {
          credentials: 'same-origin',
          headers: {
            'Accept': 'application/json'
          },
          method: 'GET'
        }).then((response) => {
          if (response.status === 200) {
            return response
              .json()
              .then((result) => {
                dispatch({type: actions.organisation.ADD_APPLICATION, payload: result});
                setCurrentApplication(dispatch, result)
                  .then(next)
                  .catch((err) => {
                    next(false);
                  });
              });
          } else {
            next(false);
          }
        }).catch((err) => {
          next(false);
        });
      }
    }
  }
}
