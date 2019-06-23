import { StoreContext } from '../store-context.js';
import { useDrag } from '../use-drag.js';
const { useMemo, useCallback, useContext, useRef, useEffect } = preactHooks;

const createCoord = ({
  xDomain,
  yDomain,
  xName,
  yName,
  getZ,
  toLab,
}) => ({
  width,
  height,
  padding = 5,
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
    const a = xscale.invert(offsetX);
    const b = yscale.invert(offsetY);

    const idx = e.draggingTarget.dataset.idx;

    const current = colorsRef.current[idx];
    const next = toLab(a, b, getZ(current));
    
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
        cx=${xscale(c.a)} cy=${yscale(c.b)}
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

const createZ = ({
  domain,
  name,
  getX,
  getY,
  toLab
}) => ({
  left,
  marginLeft = 10,
  paddingV = 5,
  paddingH = 15,
  width,
  height,
  colors,
}) => {
  const w = width - marginLeft;
  
  const scale = useMemo(() => d3.scaleLinear(domain, [paddingV, height - paddingV]), [paddingV, height]);

  const { state, dispatch } = useContext(StoreContext);
  const { editingIdx } = state;

  const isEditing = editingIdx != null;

  const colorsRef = useRef(colors);
  colorsRef.current = colors;

  const drag = useDrag((e) => {
    const { offsetY } = e;
    const l = scale.invert(offsetY);

    const idx = e.draggingTarget.dataset.idx;

    const current = colorsRef.current[idx];
    const next = toLab(getX(current), getY(current), l);

    current !== next && dispatch({
      type: 'palette/update',
      payload: { idx, next }
    });
  }, [/* FIXME */]);

  return html`<g ...${drag} style=${{ transform: `translate(${left + marginLeft}px,0)` }}>
    <rect width=${w} height=${height} stroke="currentColor" fill="none"/>
    <text x=5 class="desc">${name}</text>
    ${colors.map((c, idx) => {
      const y = scale(c.l);
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

const createAxes = ({
  Coord,
  ZAxis
}) => ({
  height = 300, // width === height
  leftWidth = 75,
  colors,
}) => {
  const width = height + leftWidth;

  return html`<svg ...${{ width, height }}>
    <${Coord} ...${{ width: height, height, colors }} />
    <${ZAxis} ...${{ left: height, width: leftWidth, height, colors }}/>
  </svg>`;
};

const toLab = (x, y, z) => d3.lab(z, x, y);

const AB = createCoord({
  xDomain: [-128, 128],
  yDomain: [-128, 128],
  xName: 'a*',
  yName: 'b*',
  getZ: current => current.l,
  toLab,
});

const L = createZ({
  domain: [100, 0],
  name: 'L*',
  getX: current => current.a,
  getY: current => current.b,
  toLab,
});

export const LAB = createAxes({
  Coord: AB,
  ZAxis: L
});
