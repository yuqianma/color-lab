import { StoreContext } from './store-context.js';
const { useReducer, useMemo, useContext, useRef, useEffect } = preactHooks;

const STYLE = `
.palette .text-box {
  position: relative;
  font-family: monospace;
  font-size: 14px;
  line-height: 1.25;
}
.palette .text-box textarea {
  position: absolute;
  top: 0;
  font-family: monospace;
  font-size: 14px;
  background: transparent;
  border-width: 1px;
  padding: 2px;
  padding-left: 1.5em;
  line-height: 1.25;
}
.palette .text-box .icons {
  padding: 3px;
}
`;

export const Palette = ({
  width = 200,
}) => {
  const { state, dispatch } = useContext(StoreContext);
  const { palette } = state;
  return html`<div
    class="palette"
    style=${{ width }}
  >
    <style>${STYLE}</style>
    <h3>Palette</h3>
    <div class="text-box">
      <div class="icons">
        ${palette.map(c => {
          return html`<div style=${{ color: c.hex() }}>●</div>`;
        })}
      </div>
      <textarea
        style=${{ width: 100, height: 300 }}
        onchange=${e => dispatch({
          type: 'palette/replace',
          payload: e.target.value.trim().split('\n')
        })}
        value=${palette.map(c => c.hex()).join('\n')}
      />
    </div>
    
  </div>`;
};
