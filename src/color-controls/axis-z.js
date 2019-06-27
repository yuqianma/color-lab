import { StoreContext } from '../store-context.js';
import { useDrag } from '../use-drag.js';
const { useMemo, useContext, useState } = preactHooks;

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

  const [ref] = useState({ colors, dragging: false });
  ref.colors = colors;

  const drag = useDrag({
    startPosition: (e) => ({
      x: e.offsetX,
      y: e.offsetY
    }),
    drag: ({ target, y }) => {
      ref.dragging = true;

      const z = scale.invert(y);

      const idx = target.dataset.idx;

      const current = ref.colors[idx];
      const next = toLab(getX(current), getY(current), z);

      current !== next && dispatch({
        type: 'palette/update',
        payload: { idx, next }
      });
    },
    end: () => {
      ref.dragging = false;
    }
  }, [/* FIXME */]);

  return html`<g ...${drag} style=${{ transform: `translate(${left + marginLeft}px,0)` }}>
    <rect width=${w} height=${height} stroke="currentColor" fill="none"/>
    <text x=5>${zName}</text>
    <text
      style=${{
        'text-anchor': 'end',
      }}
      x=${width - 2}
    >${zDomain[0]}</text>
    <text
      style=${{
        'text-anchor': 'end',
        'dominant-baseline': 'text-after-edge'
      }}
      x=${width - 2}
      y=${height}
    >${zDomain[1]}</text>
    ${colors.map((c, idx) => {
      const y = scale(getZ(c));
      const thisIsEditing = editingIdx === idx;
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
        }}
        stroke=${c + ''}
        stroke-width=${thisIsEditing ? 3 : 2}
        onmouseover=${() => dispatch({
          type: 'editingIdx/hover',
          payload: idx
        })}
        onmouseout=${() => !ref.dragging && dispatch({
          type: 'editingIdx/unhover'
        })}
      />`;
    })}
  </g>`;
};
