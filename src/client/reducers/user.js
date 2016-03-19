import {actions} from '../constants';
export function user(state = null, action) {
  switch (action.type) {
    case actions.user.SET_USER:
      return Object.assign({}, action.payload);
    case actions.organisation.CREATE_ORGANISATION:
      let organisations = Array.from(state.organisations || []);
      organisations.push(Object.assign({}, action.payload));
      return Object.assign({}, state, {organisations});
    case actions.session.LOGGED_IN:
    case actions.user.CREATED:
      return Object.assign({}, action.payload.user);
    case actions.session.LOGGED_OUT:
      return null;
    default:
      return state;
  }
}
