import {actions} from '../constants';
export function organisation(state = null, action) {
  switch (action.type) {
    case actions.organisation.SWITCH_ORGANISATION:
      return Object.assign({}, action.payload);
    case actions.session.UPDATE_SESSION:
    case actions.session.LOGGED_IN:
    case actions.user.CREATED:
      return Object.assign({}, action.payload.organisation);
    case actions.session.LOGGED_OUT:
      return null;
    default:
      return state;
  }

}
