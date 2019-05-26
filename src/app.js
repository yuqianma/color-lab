const { createContext } = preact;
const { useReducer, useMemo, useContext, useRef, useEffect } = preactHooks;

const STYLE = `
#app {
  margin: 10px;
}
#app h3 {
  color: #888;
}
.palette,.color-controls {
  float: left;
}
`;

const PALETTE = `#7fc97f
#beaed4
#fdc086
#ffff99
#386cb0
#f0027f
#bf5b17
#666666`;

const initialState = {
  palette: PALETTE.split('\n'),
  color: '#0bd',
};

const reducers = {
  'palette/replace': (_, payload) => {
    return payload
  },
  'palette/add': ({ palette }, payload) => {
    palette = palette.slice();
    palette.push(payload);
    return palette; 
  },
  'palette/del': ({ palette }, payload) => {
    palette = palette.slice();
    palette.splice(palette.indexOf(payload), 1);
    return palette; 
  },
};

function reducer(state, { type, payload }) {
  const subReducer = reducers[type];
  if (!subReducer) {
    console.warn(`cannot find action: "${type}"`);
    return state;
  }

  const [field, subType] = type.split('/');
  if (subType) {
    return {
      ...state,
      [field]: subReducer(state, payload)
    }
  }

  return subReducer(state, payload);
}

const StoreContext = createContext(null);

const Palette = ({
  width = 300,
}) => {
  const { state, dispatch } = useContext(StoreContext);
  return html`<div class="palette" style=${{ width }}>
    <h3>Palette</h3>
    <textarea
      style=${{ width: 100, height: 300, fontFamily: 'monospace' }}
      onchange=${e => dispatch({
        type: 'palette/replace',
        payload: e.target.value.trim().split('\n')
      })}
    >
      ${state.palette.join('\n')}
    </textarea>
  </div>`;
};

const ColorAxis = ({
  width = 300,
  height = 300,
  padding = 10,
  axisColor = '#aaa',
  domainFrom = -160,
  domainTo = 160
}) => {
  const w = width - padding * 2,
        h = height - padding * 2;
  const xscale = useMemo(() => d3.scaleLinear([domainFrom, domainTo], [0, w]), [w]);
  const yscale = useMemo(() => d3.scaleLinear([domainTo, domainFrom], [0, h]), [h]);

  const refSvg = useRef(null);

  useEffect(() => {
    const ticks = [domainFrom, domainFrom / 2, domainTo / 2, domainTo];
    const xAxis = d3.axisBottom(xscale).tickValues(ticks);
    const yAxis = d3.axisLeft(yscale).tickValues(ticks.slice().reverse());

    d3.select(refSvg.current)
      .append('g')
      .attr('color', axisColor)
      .attr('transform', `translate(${padding},${height / 2})`)
      .call(xAxis);

    d3.select(refSvg.current)
      .append('g')
      .attr('color', axisColor)
      .attr('transform', `translate(${width / 2},${padding})`)
      .call(yAxis);
    
  }, [width, height, padding, domainFrom, domainTo, axisColor]);

  return html`<svg width=${width} height=${height} ref=${refSvg}>
    <rect x=${padding} y=${padding} width=${w} height=${h} stroke="#eee" fill="none"/>
  </svg>`;
};

const ColorControls = () => {
  return html`<div class="color-controls">
    <h3>Color Controls</h3>
    <${ColorAxis} />
  </div>`;
};

export const App = () => {
  const [state, dispatch] = useReducer(reducer, initialState);
  return html`<${StoreContext.Provider} value=${{ state, dispatch }}>
  <div id="app">
    <style>${STYLE}</style>
    <${Palette} />
    <${ColorControls} />
  </div>
  </${StoreContext.Provider}>
  `;
};
