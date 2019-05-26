import { StoreContext } from './store-context.js';
import { normalizeColor } from './util.js';
const { useMemo, useContext, useRef, useEffect } = preactHooks;

const COLOR_DOMAIN = [-160, 160];

const ColorAB = ({
  width = 300,
  height = 300,
  padding = 5,
  colors,
}) => {
  const w = width - padding * 2;
  const h = height - padding * 2;
  const xscale = useMemo(() => d3.scaleLinear(COLOR_DOMAIN, [padding, w]), [w]);
  const yscale = useMemo(() => d3.scaleLinear(COLOR_DOMAIN.slice().reverse(), [padding, h]), [h]);

  const { state, dispatch } = useContext(StoreContext);

  const { editing } = state;

  return html`<g>
    <rect ...${{ width, height }} stroke="currentColor" fill="none"/>
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
    ${colors.map(c => {
      return html`<circle
        style=${{ cursor: 'pointer' }}
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
  paddingV = 5,
  paddingH = 15,
  width,
  height,
  colors,
}) => {
  const w = width - marginLeft;
  const h = height - paddingV * 2;
  
  const scale = useMemo(() => d3.scaleLinear([100, 0], [paddingV, h]), [h]);

  const { state, dispatch } = useContext(StoreContext);

  const { editing } = state;

  return html`<g style=${{ transform: `translate(${left + marginLeft}px,0)` }}>
    <rect width=${w} height=${height} stroke="currentColor" fill="none"/>
    ${colors.map(c => {
      const y = scale(c.l);
      const isEditing = editing === normalizeColor(c);
      const height = isEditing ? 3 : 2;
      return html`<rect
        ...${{
          x: paddingH,
          y: y - height / 2,
          width: w - paddingH * 2,
          height
        }}
        style=${{ cursor: 'pointer' }}
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
  lPct = 0.25,
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
