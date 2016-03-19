import {actions} from '../constants';
export function connectors(state = [], action) {
  switch (action.type) {
    case actions.connectors.LOADED_CONNECTORS:
      return action
        .payload
        .map(connector => Object.assign({}, connector));
    case actions.editor.LOADED_EDITOR:
      return (action.payload.connectors || []).map(connector => Object.assign({}, connector));
    default:
      return state;
  }

}

export function availableConnectors(state = [], action) {
  switch (action.type) {
    default:
      return state;
  }
}
