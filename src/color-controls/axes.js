import { StoreContext } from '../store-context.js';
import { useDrag } from '../use-drag.js';
const { useMemo, useCallback, useContext, useRef, useEffect } = preactHooks;

const createCoord = ({
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

const createZAxis = ({
  zDomain,
  zName,
  getX,
  getY,
  getZ,
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

const combineAxes = ({
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

const createAxes = (props) => combineAxes({
  Coord: createCoord(props),
  ZAxis: createZAxis(props)
});

export const LAB = createAxes({
  xName: 'a*',
  yName: 'b*',
  zName: 'L*',
  xDomain: [-128, 128],
  yDomain: [-128, 128],
  zDomain: [100, 0],
  getX: current => current.a,
  getY: current => current.b,
  getZ: current => current.l,
  toLab: (x, y, z) => d3.lab(z, x, y),
});

export const LCH = createAxes({
  xName: 'l',
  yName: 'c',
  zName: 'h',
  xDomain: [0, 100],
  yDomain: [0, 230],
  zDomain: [0, 360],
  getX: current => d3.lch(d3.lab(current)).l,
  getY: current => d3.lch(d3.lab(current)).c,
  getZ: current => d3.lch(d3.lab(current)).h,
  toLab: (x, y, z) => d3.lab(d3.lch(x, y, z))
});
