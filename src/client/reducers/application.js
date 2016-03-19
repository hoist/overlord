import {actions} from '../constants';
export function application(state = null, action) {
  switch (action.type) {
    case actions.application.SWITCH_APPLICATION:
      return Object.assign({}, action.payload);
    case actions.session.UPDATE_SESSION:
    case actions.session.LOGGED_IN:
    case actions.user.CREATED:
      return Object.assign({}, action.payload.application);
    case actions.session.LOGGED_OUT:
      return null;
    default:
      return state;
  }

}
