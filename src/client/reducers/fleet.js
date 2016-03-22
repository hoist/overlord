import {
  actions
} from '../constants';
export function fleet(state = [], action) {
  switch (action.type) {
    //pick the actions you want to create a new state on, and return the new state
  case actions.fleet.STATUS_UPDATE.SUCCEEDED:
    //rather than return the original array we create a new array with copies of the objects;
    return action.payload.map((fleetEntry) => {
      return Object.assign({}, fleetEntry)
    });
  default:
    return state;
  }

}
