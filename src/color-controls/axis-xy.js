import { StoreContext } from '../store-context.js';
import { useDrag } from '../use-drag.js';
const { useMemo, useContext, useState } = preactHooks;

export const createAxisXY = ({
  xDomain,
  yDomain,
  xName,
  yName,
  getX,
  getY,
  getZ,
  toLab,
}) => ({
  width,
  height,
  padding = 10,
  colors,
}) => {
  const xscale = useMemo(
    () => d3.scaleLinear(xDomain, [padding, width - padding]),
    [padding, width]);
  const yscale = useMemo(
    () => d3.scaleLinear(yDomain, [height - padding, padding]),
    [padding, height]);

  const { state, dispatch } = useContext(StoreContext);
  const { editingIdx } = state;

  const [ref] = useState({ colors, dragging: false });
  ref.colors = colors;

  const drag = useDrag({
    startPosition: (e) => ({
      x: e.offsetX,
      y: e.offsetY
    }),
    drag: ({ target, x, y }) => {
      ref.dragging = true;

      x = xscale.invert(x);
      y = yscale.invert(y);
  
      const idx = target.dataset.idx;
  
      const current = ref.colors[idx];
      const next = toLab(x, y, getZ(current));
      
      current !== next && dispatch({
        type: 'palette/update',
        payload: { idx, next }
      });
    },
    end: () => {
      ref.dragging = false;
    }
  }, [/* FIXME */]);

  return html`<g>
    <rect ...${{ width, height }} stroke="currentColor" fill="none"/>
    <text x=5>${xName}, ${yName}</text>
    <line
      ...${{
        x1: padding,
        y1: height / 2,
        x2: width - padding,
        y2: height / 2,
        stroke: 'currentColor'
      }}
    />
    <text
      x=${padding}
      y=${height / 2}
    >${xDomain[0]}</text>
    <text
      style=${{
        'text-anchor': 'end',
      }}
      x=${width - padding}
      y=${height / 2}
    >${xDomain[1]}</text>
    <line
      ...${{
        x1: width / 2,
        y1: padding,
        x2: width / 2,
        y2: height - padding,
        stroke: 'currentColor'
      }}
    />
    <text
      style=${{
        'text-anchor': 'end',
        'dominant-baseline': 'central'
      }}
      x=${width / 2 - 2}
      y=${padding}
    >${yDomain[1]}</text>
    <text
      style=${{
        'text-anchor': 'end',
        'dominant-baseline': 'central'
      }}
      x=${width / 2 - 2}
      y=${height - padding}
    >${yDomain[0]}</text>
    <g ...${drag}>
    ${colors.map((c, idx) => {
      const thisIsEditing = editingIdx === idx;
      return html`<circle
        data-idx=${idx}
        style=${{
          cursor: 'pointer',
        }}
        cx=${xscale(getX(c))} cy=${yscale(getY(c))}
        r=${thisIsEditing ? 7 : 5}
        fill=${c + ''}
        onmouseover=${() => dispatch({
          type: 'editingIdx/hover',
          payload: idx
        })}
        onmouseout=${(e) => !ref.dragging && dispatch({
          type: 'editingIdx/unhover'
        })}
      />`
    })}
    </g>
  </g>`;
};
