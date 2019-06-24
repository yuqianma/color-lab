import { StoreContext } from '../store-context.js';
import { useDrag } from '../use-drag.js';
const { useMemo, useContext, useRef } = preactHooks;

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

  const isEditing = editingIdx != null;

  const colorsRef = useRef(colors);
  colorsRef.current = colors;

  const drag = useDrag((e) => {
    const { offsetX, offsetY } = e;
    const x = xscale.invert(offsetX);
    const y = yscale.invert(offsetY);

    const idx = e.draggingTarget.dataset.idx;

    const current = colorsRef.current[idx];
    const next = toLab(x, y, getZ(current));
    
    current !== next && dispatch({
      type: 'palette/update',
      payload: { idx, next }
    });
  }, [/* FIXME */]);

  return html`<g>
    <rect ...${{ width, height }} stroke="currentColor" fill="none"/>
    <text x=5 class="desc">${xName}, ${yName}</text>
    <line
      ...${{
        x1: padding,
        y1: height / 2,
        x2: width - padding,
        y2: height / 2,
        stroke: 'currentColor'
      }}
    />
    <line
      ...${{
        x1: width / 2,
        y1: padding,
        x2: width / 2,
        y2: height - padding,
        stroke: 'currentColor'
      }}
    />
    <g ...${drag}>
    ${colors.map((c, idx) => {
      const thisIsEditing = editingIdx === idx;
      const canHover = !isEditing || thisIsEditing;
      return html`<circle
        data-idx=${idx}
        style=${{
          cursor: 'pointer',
          'pointer-events': canHover ? 'inherit' : 'none'
        }}
        cx=${xscale(getX(c))} cy=${yscale(getY(c))}
        r=${thisIsEditing ? 7 : 5}
        fill=${c + ''}
        onmouseover=${() => dispatch({
          type: 'editingIdx/hover',
          payload: idx
        })}
        onmouseout=${() => dispatch({
          type: 'editingIdx/unhover'
        })}
      />`
    })}
    </g>
  </g>`;
};
