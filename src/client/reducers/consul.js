import {
  actions
} from '../constants';
export function consul(state = {services: [], nodes: []}, action) {
  switch (action.type) {
    //pick the actions you want to create a new state on, and return the new state
  case actions.consul.STATUS_UPDATE.SUCCEEDED:
    return Object.assign({}, action.payload)
  default:
    return state;
  }

}
