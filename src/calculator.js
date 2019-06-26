import { StoreContext } from './store-context.js';
const { useState, useCallback, useReducer, useMemo, useContext, useRef, useEffect } = preactHooks;

const STYLE = `
.calculator {
  margin-right: 10px;
}
`;

const DefaultValue = '#4c78a8\n#f58518';

export const Calculator = ({
  width = 100,
}) => {
  const [texts, setTexts] = useState(DefaultValue);

  const calc = useCallback((e) => {
    setTexts(e.target.value);
  }, []);

  let result = '';
  if (texts) {
    try {
      const [c1, c2] = texts.split('\n');
      const color1 = d3.lab(c1),
            color2 = d3.lab(c2);

      result = Math.sqrt(
        (color1.l - color2.l) ** 2 +
        (color1.a - color2.a) ** 2 +
        (color1.b - color2.b) ** 2
      ).toFixed(2);
    } catch (e) {
      console.error(e);
    }
  }

  return html`<div
    class="calculator"
    style=${{ width }}
  >
    <textarea oninput=${calc}>${DefaultValue}</textarea>
    <div>${result}</div>
  </div>`;
};
