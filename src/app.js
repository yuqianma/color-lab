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
.palette,.color-controls,.palette-list {
  float: left;
}

.palette-list {
  margin-left: 10px;
}
`;

export const App = () => {
  const [state, dispatch] = useReducer(reducer, initialState);
  return html`<${StoreContext.Provider} value=${{ state, dispatch }}>
  <div id="app">
    <style>${STYLE}</style>
    <${Palette} />
    <${ColorControls} />
    <div class="palette-list">
      ${state.palette.map(c => {
        return html`<div style=${{
          background: c.hex(),
          width: 80,
        }}>${c.hex()}</div>`;
      })}
    </div>
  </div>
  </${StoreContext.Provider}>
  `;
};
