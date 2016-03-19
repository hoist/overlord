import {actions} from '../constants';
export function applications(state = [], action) {
  switch (action.type) {
    case actions.organisation.SWITCH_ORGANISATION:
      return [];
    case actions.application.CREATE_APPLICATION:
      return state
        .slice()
        .concat(Object.assign({}, action.payload));
    case actions.application.SET_APPLICATIONS:
      return Object.assign({}, action.payload);
    case actions.session.UPDATE_SESSION:
    case actions.session.LOGGED_IN:
    case actions.user.CREATED:
      return (action.payload.applications || []).map((app) => Object.assign({}, app));
    case actions.session.LOGGED_OUT:
      return [];
    default:
      return state;
  }

}
