import {actions} from '../constants';

export function setCurrentOrg(dispatch, org) {
  return fetch(`/api/session/organisation`, {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({_id: org._id})
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

export function switchOrganisation(slug, next) {
  return (dispatch, getState) => {
    let state = getState();
    if (state.organisation.slug === slug) {
      //dont do anything
      if (next) {
        next(true);
      }
    } else {
      let orgFromStore = state
        .organisations
        .find((org) => org.slug === slug);
      if (orgFromStore) {
        setCurrentOrg(dispatch, orgFromStore)
          .then(next)
          .catch(() => next(false));
      } else {
        //no matching org from store, we should check the server
        fetch(`/api/organisation/${slug}`, {
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
                dispatch({type: actions.organisation.ADD_ORGANISATION, payload: result});
                setCurrentOrg(dispatch, result)
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

export function createOrganisation(form, redirect) {
  return dispatch => {
    dispatch({
      type: actions.action.PENDING,
      payload: {
        actionName: actions.organisation.CREATE_ORGANISATION
      }
    });
    fetch('/api/organisation', {
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
                actionName: actions.organisation.CREATE_ORGANISATION
              }
            });
            dispatch({type: actions.organisation.CREATE_ORGANISATION, payload: result});
            dispatch({type: actions.organisation.SWITCH_ORGANISATION, payload: result});
            //created organisations dont have applications so set current app to null
            dispatch({type: actions.application.SWITCH_APPLICATION, payload: null});
            if (redirect) {
              redirect();
            }
          } else {
            dispatch({
              type: actions.action.FAILED,
              payload: {
                actionName: actions.organisation.CREATE_ORGANISATION,
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
