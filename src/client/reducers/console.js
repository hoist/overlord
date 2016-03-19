import {
  actions
} from '../constants';
export function console(state = {}, action) {
  action.payload = action.payload || {};
  switch (action.type) {
  case actions.console.POLL.REQUESTING:
    return Object.assign({}, {
      ...state,
      inProgress: true
    });
  case actions.console.POLL.FAILED:
    return Object.assign({}, {
      ...state,
      inProgress: false
    });
  case actions.console.POLL.SUCCESS:
    if (action.payload.messages) {
      let messages = (state.messages || [])
        .slice()
        .concat(action.payload.messages);
      return Object.assign({}, {
        ...state,
        continuationToken: action.payload.continuationToken,
        messages,
        inProgress: false
      });
    }
    return state;
  case actions.application.SWITCH_APPLICATION:
  case actions.session.LOGGED_OUT:
    return {}
  default:
    return state;
  }

}
