import { StoreContext } from './store-context.js';
import { initialState, reducer } from './store.js';
import { Palette } from './palette.js';
import { ColorControls } from './color-controls/index.js';
import { Calculator } from './calculator.js';
import { Marks } from './marks.js';
const { useReducer, useMemo, useContext, useRef, useEffect } = preactHooks;

const STYLE = `
#app {
  margin: 10px;
}
#app .title {
  color: #999;
  font-weight: bolder;
  margin: 10px 0;
}
#app > div {
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
    <${Marks} />
    <${Calculator} />
  </div>
  </${StoreContext.Provider}>
  `;
};
