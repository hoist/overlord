import {actions} from '../constants';

export function editor(state = {}, action) {
  let code;
  switch (action.type) {
    case actions.editor.LOADED_EDITOR:
      code = Object.assign({}, action.payload.code);
      return {current: code.script, loaded: [code], currentEvent: code.event};
    case actions.editor.LOADED_SCRIPT:
      code = Object.assign({}, action.payload);
      let loaded = (state.loaded || []).map((cache) => {
        return Object.assign({}, cache);
      });
      if (!loaded.find((c) => c.event === code.event)) {
        loaded.push(code);
      }
      return {current: code.script, loaded: loaded, currentEvent: code.event};
    default:
      return state;
  }
}
