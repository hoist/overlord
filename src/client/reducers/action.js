import {actions} from '../constants';
export function action(state = {}, action) {
  let actionState = {};
  switch (action.type) {
    case actions.action.PENDING:
      actionState[action.payload.actionName] = {
        state: "PENDING"
      };
      return Object.assign({}, state, actionState);
      break;
    case actions.action.FAILED:

      actionState[action.payload.actionName] = {
        state: "FAILED",
        result: action.payload.result
      };
      return Object.assign({}, state, actionState);
      break;
    case actions.action.SUCCESS:
      actionState[action.payload.actionName] = {
        state: "SUCCESS"
      };
      return Object.assign({}, state, actionState);
      break;
    default:
      return state;
  }

}
