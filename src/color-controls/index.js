import { LAB, LCH } from './axes.js';
import { StoreContext } from '../store-context.js';
const { useContext } = preactHooks;

const STYLE = `
.color-controls svg {
  color: #aaa;
}
.color-controls svg text {
  dominant-baseline: text-before-edge;
  user-select: none;
  fill: #ccc;
  font-size: 12px;
}
.color-controls .controller {
  font-family: monospace;
}
.color-controls .controller input[type=range] {
  width: 200px;
}
`;

export const ColorControls = ({
}) => {
  const { state, dispatch } = useContext(StoreContext);
  const { palette } = state;

  return html`<div class="color-controls">
    <style>${STYLE}</style>
    <div class="title">Color Controls</div>
    <${LAB} colors=${palette}/>
    <${LCH} colors=${palette}/>
  </div>`;
};
