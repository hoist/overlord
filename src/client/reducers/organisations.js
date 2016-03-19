import {actions} from '../constants';
export function organisations(state = [], action) {
  switch (action.type) {
    case actions.organisation.CREATE_ORGANISATION:
      return state
        .slice()
        .concat(Object.assign({}, action.payload));
    case actions.organisation.SET_ORGANISATIONS:
      return Object.assign({}, action.payload);
    case actions.session.UPDATE_SESSION:
    case actions.session.LOGGED_IN:
    case actions.user.CREATED:
      return (action.payload.organisations || []).map(org => Object.assign({}, org));
    case actions.session.LOGGED_OUT:
      return [];
    default:
      return state;
  }

}
