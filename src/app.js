import { StoreContext } from './store-context.js';
import { Palette } from './palette.js';
import { ColorControls } from './color-controls.js';
import { initialState, reducer } from './store.js';
const { useReducer, useMemo, useContext, useRef, useEffect } = preactHooks;

const STYLE = `
#app {
  margin: 10px;
}
#app h3 {
  color: #888;
}
.palette,.color-controls {
  float: left;
}
`;

export const App = () => {
  const [state, dispatch] = useReducer(reducer, initialState);
  return html`<${StoreContext.Provider} value=${{ state, dispatch }}>
  <div id="app">
    <style>${STYLE}</style>
    <${Palette} />
    <${ColorControls} />
  </div>
  </${StoreContext.Provider}>
  `;
};
