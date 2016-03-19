import {actions} from '../constants';
import {flatten} from 'lodash';

function getEventsFromConnectors(connectors) {
  return flatten(connectors.map(connector => connector.events.map(event => Object.assign({}, event))));
}
export function events(state = [], action) {
  switch (action.type) {
    case actions.editor.LOADED_EDITOR:
      return action.payload.events || [];
    case actions.event.CREATE.SUCCESS:
      return (state || [])
        .concat([action.payload])
        .sort((ev) => ev.key);
    default:
      return state;
  }
}
