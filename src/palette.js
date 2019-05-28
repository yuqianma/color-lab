import { StoreContext } from './store-context.js';
const { useReducer, useMemo, useContext, useRef, useEffect } = preactHooks;

const STYLE = `
.palette {
  margin-right: 50px;
}
.palette .text-box {
  position: relative;
  font-family: monospace;
  font-size: 13px;
}
.palette .text-box [contenteditable] {
  position: absolute;
  top: 0;
  border: 1px solid #aaa;
  padding: 2px;
  padding-left: 1em;
  box-sizing: border-box;
}
.palette .text-box .icons {
  padding: 3px;
}
`;

export const Palette = ({
  width = 100,
}) => {
  const { state, dispatch } = useContext(StoreContext);
  const { palette } = state;
  return html`<div
    class="palette"
    style=${{ width }}
  >
    <style>${STYLE}</style>
    <div class="title">Palette</div>
    <div class="text-box">
      <div class="icons">
        ${palette.map(c => {
          return html`<div style=${{ color: c.hex() }}>•</div>`;
        })}
      </div>
      <div
        contenteditable="plaintext-only"
        style=${{ width: 100, height: 300 }}
        onblur=${e => dispatch({
          type: 'palette/replace',
          payload: e.target.textContent.trim().split('\n')
        })}
      >
        ${palette.map(c => c.hex()).join('\n')}
      </div>
    </div>
    
  </div>`;
};
