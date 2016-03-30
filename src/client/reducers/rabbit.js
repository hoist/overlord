import {
  actions
} from '../constants';
export function rabbit(state = {
  queues: [],
  stats: {}
}, action) {
  switch (action.type) {
    //pick the actions you want to create a new state on, and return the new state
  case actions.rabbit.STATUS_UPDATE.SUCCEEDED:
    //rather than return the original array we create a new array with copies of the objects;
    return Object.assign({}, {...state
    }, {
      queues: action.payload.map((rabbitEntry) => {
        return Object.assign({}, rabbitEntry)
      })
    });
  case actions.rabbit.STATISTICS_UPDATE.SUCCEEDED:
    //rather than return the original array we create a new array with copies of the objects;
    return Object.assign({}, {...state
    }, {
      stats: Object.assign({}, action.payload)
    });
  default:
    return state;
  }

}
