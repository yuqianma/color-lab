import { StoreContext } from './store-context.js';
import { normalizeColor } from './util.js';
const { useMemo, useContext, useRef, useEffect } = preactHooks;

const ColorAB = ({
  width = 300,
  height = 300,
  domainFrom = -160,
  domainTo = 160,
  colors,
}) => {
  const xscale = useMemo(() => d3.scaleLinear([domainFrom, domainTo], [0, width]), [width]);
  const yscale = useMemo(() => d3.scaleLinear([domainTo, domainFrom], [0, height]), [height]);

  const { state, dispatch } = useContext(StoreContext);

  const { editing } = state;

  return html`<g>
    <rect ...${{ width, height }} stroke="currentColor" fill="none"/>
    <line x1=0 y1=${height / 2} x2=${width} y2=${height / 2} stroke="currentColor" />
    <line x1=${width / 2} y1=0 x2=${width / 2} y2=${height} stroke="currentColor" />
    ${colors.map(c => {
      return html`<circle
        cx=${xscale(c.a)} cy=${yscale(c.b)} r="5"
        fill=${c + ''}
        stroke="#000"
        stroke-width=${editing === normalizeColor(c) ? 1 : 0}
        onmouseover=${() => dispatch({
          type: 'editing/hover',
          payload: c
        })}
        onmouseout=${() => dispatch({
          type: 'editing/unhover'
        })}
      />`
    })}
  </g>`;
};

const ColorL = ({
  left,
  marginLeft = 10,
  paddingH = 15,
  width,
  height,
  colors,
}) => {
  const w = width - marginLeft;
  
  const scale = useMemo(() => d3.scaleLinear([100, 0], [0, height]), [height]);

  const { state, dispatch } = useContext(StoreContext);

  const { editing } = state;

  return html`<g style=${{ transform: `translate(${left + marginLeft}px,0)` }}>
    <rect width=${w} height=${height} stroke="currentColor" fill="none"/>
    ${colors.map(c => {
      const y = scale(c.l);
      const isEditing = editing === normalizeColor(c);
      return html`<rect
        x=${paddingH} y=${y} width=${w - paddingH * 2} height=${isEditing ? 3 : 2}
        fill=${c + ''}
        stroke="#333"
        stroke-width=${isEditing ? 1 : 0}
        onmouseover=${() => dispatch({
          type: 'editing/hover',
          payload: c
        })}
        onmouseout=${() => dispatch({
          type: 'editing/unhover'
        })}
      />`;
    })}
  </g>`;
};

const ColorAxis = ({
  width = 400,
  lPct = 0.25
}) => {
  const lWidth = width * lPct;
  const height = width - lWidth;

  const { state, dispatch } = useContext(StoreContext);
  const { palette } = state;
  const colors = palette.map(c => d3.lab(c));

  return html`<svg ...${{ width, height }} style=${{ color: '#aaa' }}>
    <${ColorAB} ...${{ width: height, height, colors }} />
    <${ColorL} ...${{ left: height, width: lWidth, height, colors }}/>
  </svg>`;
};

export const ColorControls = ({
}) => {
  return html`<div class="color-controls">
    <h3>Color Controls</h3>
    <${ColorAxis} />
  </div>`;
};
