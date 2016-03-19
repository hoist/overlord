import {actions} from '../constants';
export function session(state = {}, action) {
  switch (action.type) {
    case actions.session.LOGGED_IN:
    case actions.user.CREATED:
      return Object.assign({}, state, {isValid: true});
    case actions.session.LOGGED_OUT:
      return {isValid: false};
    default:
      return state;
  }
  return state;
}
