import { StoreContext } from '../store-context.js';
import { useDrag } from '../use-drag.js';
const { useMemo, useContext, useRef } = preactHooks;

export const createAxisZ = ({
  zDomain,
  zName,
  getX,
  getY,
  getZ,
  toLab
}) => ({
  left,
  marginLeft = 0,
  paddingV = 5,
  paddingH = 15,
  width,
  height,
  colors,
}) => {
  const w = width - marginLeft;
  
  const scale = useMemo(() => d3.scaleLinear(zDomain, [paddingV, height - paddingV]), [paddingV, height]);

  const { state, dispatch } = useContext(StoreContext);
  const { editingIdx } = state;

  const isEditing = editingIdx != null;

  const colorsRef = useRef(colors);
  colorsRef.current = colors;

  const drag = useDrag((e) => {
    const { offsetY } = e;
    const z = scale.invert(offsetY);

    const idx = e.draggingTarget.dataset.idx;

    const current = colorsRef.current[idx];
    const next = toLab(getX(current), getY(current), z);

    current !== next && dispatch({
      type: 'palette/update',
      payload: { idx, next }
    });
  }, [/* FIXME */]);

  return html`<g ...${drag} style=${{ transform: `translate(${left + marginLeft}px,0)` }}>
    <rect width=${w} height=${height} stroke="currentColor" fill="none"/>
    <text x=5 class="desc">${zName}</text>
    ${colors.map((c, idx) => {
      const y = scale(getZ(c));
      const thisIsEditing = editingIdx === idx;
      const canHover = !isEditing || thisIsEditing;
      const xy = thisIsEditing ? {
        x1: paddingH - 3,
        x2: w - paddingH + 3,
        y1: y,
        y2: y
      } : {
        x1: paddingH,
        x2: w - paddingH,
        y1: y,
        y2: y
      }
      return html`<line
        data-idx=${idx}
        ...${xy}
        style=${{
          cursor: 'pointer',
          'pointer-events': canHover ? 'inherit' : 'none'
        }}
        stroke=${c + ''}
        stroke-width=${thisIsEditing ? 3 : 2}
        onmouseover=${() => dispatch({
          type: 'editingIdx/hover',
          payload: idx
        })}
        onmouseout=${() => dispatch({
          type: 'editingIdx/unhover'
        })}
      />`;
    })}
  </g>`;
};
