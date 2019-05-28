import { StoreContext } from './store-context.js';
const { useMemo, useCallback, useContext, useRef, useEffect } = preactHooks;

const STYLE = `
.color-controls svg {
  color: #aaa;
}
.color-controls svg .desc {
  dominant-baseline: text-before-edge;
  user-select: none;
  fill: #aaa;
  font-size: 12px;
}
.color-controls .controller {
  font-family: monospace;
}
.color-controls .controller input[type=range] {
  width: 200px;
}
`;

const COLOR_DOMAIN = [-128, 128];

const useDrag = (dragHandler, args) => {
  let target = null;
  const ondrag = useCallback((e) => {
    target && dragHandler(Object.assign(e, { draggingTarget: target }));
  }, args);

  const onmouseup = useCallback(() => {
    target = null;
    document.body.removeEventListener('mousemove', ondrag);
    document.body.removeEventListener('mouseup', onmouseup);
  }, [ondrag]);

  const onmousedown = useCallback((e) => {
    target = e.target;
    document.body.addEventListener('mousemove', ondrag);
    document.body.addEventListener('mouseup', onmouseup);
  }, [ondrag]);

  return {
    onmousedown,
    // onmouseup,
  }
};

const LCHController = ({
  width = 320
}) => {
  const { state, dispatch } = useContext(StoreContext);
  const { palette, editingIdx } = state;

  const targetColor = palette[editingIdx];
  const { l, c, h } = targetColor ? d3.lch(targetColor) : {};

  return html`<div class="lch controller">
    ${[
      { name: 'L', min: 0, max: 100, value: l },
      { name: 'C', min: 0, max: 230, value: c },
      { name: 'H', min: 0, max: 360, value: h },
    ].map((v) =>
      html`<div>
        <span class="label">${v.name}</span>
        <input type=range ...${v} />
        ${v.value}
      </div>`
    )}
    
  </div>`
}

const ColorAB = ({
  width = 300,
  height = 300,
  padding = 5,
  colors,
}) => {
  // const w = width - padding * 2;
  // const h = height - padding * 2;
  const xscale = useMemo(
    () => d3.scaleLinear(COLOR_DOMAIN, [padding, width - padding]),
    [padding, width]);
  const yscale = useMemo(
    () => d3.scaleLinear(COLOR_DOMAIN.slice().reverse(), [padding, height - padding]),
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
    const next = d3.lab(current.l, a, b);
    
    current !== next && dispatch({
      type: 'palette/update',
      payload: { idx, next }
    });
  }, [/* FIXME */]);

  return html`<g>
    <rect ...${{ width, height }} stroke="currentColor" fill="none"/>
    <text x=5 class="desc">a*, b*</text>
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

const ColorL = ({
  left,
  marginLeft = 10,
  paddingV = 5,
  paddingH = 15,
  width,
  height,
  colors,
}) => {
  const w = width - marginLeft;
  
  const scale = useMemo(() => d3.scaleLinear([100, 0], [paddingV, height - paddingV]), [paddingV, height]);

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
    const next = d3.lab(l, current.a, current.b);

    current !== next && dispatch({
      type: 'palette/update',
      payload: { idx, next }
    });
  }, [/* FIXME */]);

  return html`<g ...${drag} style=${{ transform: `translate(${left + marginLeft}px,0)` }}>
    <rect width=${w} height=${height} stroke="currentColor" fill="none"/>
    <text x=5 class="desc">L*</text>
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

const ColorAxis = ({
  height = 300, // axis width === height
  lPct = 0.25,
}) => {
  const lWidth = height * lPct;
  const width = height + lWidth;

  const { state, dispatch } = useContext(StoreContext);
  const { palette } = state;
  const colors = palette;

  return html`<svg ...${{ width, height }}>
    <${ColorAB} ...${{ width: height, height, colors }} />
    <${ColorL} ...${{ left: height, width: lWidth, height, colors }}/>
  </svg>`;
};

export const ColorControls = ({
}) => {
  return html`<div class="color-controls">
    <style>${STYLE}</style>
    <div class="title">Color Controls</div>
    <${LCHController} />
    <${ColorAxis} />
  </div>`;
};
