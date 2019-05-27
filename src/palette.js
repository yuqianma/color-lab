import { StoreContext } from './store-context.js';
const { useReducer, useMemo, useContext, useRef, useEffect } = preactHooks;

export const Palette = ({
  width = 200,
}) => {
  const { state, dispatch } = useContext(StoreContext);
  return html`<div class="palette" style=${{ width }}>
    <h3>Palette</h3>
    <textarea
      style=${{ width: 100, height: 300, fontFamily: 'monospace' }}
      onchange=${e => dispatch({
        type: 'palette/replace',
        payload: e.target.value.trim().split('\n')
      })}
    >
      ${state.palette.map(c => c.hex()).join('\n')}
    </textarea>
  </div>`;
};
