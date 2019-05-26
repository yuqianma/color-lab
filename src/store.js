import { normalizeColor } from './util.js';

const PALETTE = `#7fc97f
#beaed4
#fdc086
#ffff99
#386cb0
#f0027f
#bf5b17
#666666`;

export const initialState = {
  palette: PALETTE.split('\n'),
  editing: null,
};

const reducers = {
  'palette/replace': (_, payload) => payload,
  'palette/add': ({ palette }, payload) => palette.concat(payload),
  'palette/del': ({ palette }, payload) => {
    palette = palette.slice();
    palette.splice(palette.indexOf(payload), 1);
    return palette; 
  },
  'editing/hover': (_, payload) => normalizeColor(payload),
  'editing/unhover': () => null,
};

export function reducer(state, { type, payload }) {
  const subReducer = reducers[type];
  if (!subReducer) {
    console.warn(`cannot find action: "${type}"`);
    return state;
  }

  const [field, subType] = type.split('/');
  if (subType) {
    const result = subReducer(state, payload);
    if (result === undefined || result === state[field]) {
      return state;
    } else {
      return {
        ...state,
        [field]: result
      }
    }
  }

  return subReducer(state, payload);
}
