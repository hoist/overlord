import {
  actions
} from '../constants';
import {
  CALL_API
} from 'redux-api-middleware';

/**
 * this is an action file, it'll be mapped into a component using Connect({properties},{actions});
 */

export function getQueues() {
  //return a function that takes in dispatch as a parameter
  return (dispatch) => {
    //this will call an API and dispatch a pending event, then either a success or fail event with the body as the payload
    return dispatch({
      [CALL_API]: {
        endpoint: '/api/rabbit/status',
        method: 'GET',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json'
        },
        types: [
          //these are the events that will be thrown, in progress, success, failed
          actions.rabbit.STATUS_UPDATE.IN_PROGRESS,
          actions.rabbit.STATUS_UPDATE.SUCCEEDED,
          actions.rabbit.STATUS_UPDATE.FAILED
        ]
      }
    });
  }
}

export function getQueueStats() {
  //return a function that takes in dispatch as a parameter
  return (dispatch) => {
    //this will call an API and dispatch a pending event, then either a success or fail event with the body as the payload
    return dispatch({
      [CALL_API]: {
        endpoint: '/api/rabbit/statistics',
        method: 'GET',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json'
        },
        types: [
          //these are the events that will be thrown, in progress, success, failed
          actions.rabbit.STATISTICS_UPDATE.IN_PROGRESS,
          actions.rabbit.STATISTICS_UPDATE.SUCCEEDED,
          actions.rabbit.STATISTICS_UPDATE.FAILED
        ]
      }
    });
  }
}
