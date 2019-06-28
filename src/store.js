import { labEqual } from './util.js';

const PALETTE = `#4c78a8
#f58518
#e45756
#72b7b2
#54a24b
#eeca3b
#b279a2
#ff9da6
#9d755d
#bab0ac`;
// const PALETTE = `#666666`;

export const initialState = {
  palette: PALETTE.split('\n').map(c => d3.lab(c)),
  editingIdx: null,
};

const reducers = {
  'palette/replace': (_, payload) => payload.map(c => d3.lab(c)),
  'palette/add': ({ palette }, payload) => palette.concat(d3.lab(payload)),
  // 'palette/del': ({ palette }, payload) => {
  //   palette = palette.slice();
  //   palette.splice(palette.indexOf(payload), 1);
  //   return palette; 
  // },
  'palette/update': ({ palette }, { idx, next }) => {
    palette = palette.slice();
    palette[idx] = next;
    return palette;
  },
  'editingIdx/hover': (_, payload) => payload,
  'editingIdx/unhover': () => null,
};

function reducer(state, { type, payload }) {
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

function devReducer(state, action) {
  const nextState = reducer(state, action);
  console.log(action.type, action.payload, nextState);
  return nextState;
}

const DEV = window.localStorage.getItem('DEV');

const finalReducer = DEV ? devReducer : reducer;

export {
  finalReducer as reducer
}
