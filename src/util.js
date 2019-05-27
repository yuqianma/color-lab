const d3Lab = d3.lab;

// https://github.com/d3/d3-color/blob/f666cf09dc21efcf570c0cb08e2bc4c864cc3c7c/test/labEqual.js#L4
export const labEqual = (x, y) => {
  return x instanceof d3Lab && y instanceof d3Lab
    && (isNaN(x.l) ? isNaN(y.l) && y.l !== y.l : x.l - 1e-6 <= y.l && y.l <= x.l + 1e-6)
    && (isNaN(x.a) ? isNaN(y.a) && y.a !== y.a : x.a - 1e-6 <= y.a && y.a <= x.a + 1e-6)
    && (isNaN(x.b) ? isNaN(y.b) && y.b !== y.b : x.b - 1e-6 <= y.b && y.b <= x.b + 1e-6)
    && (isNaN(x.opacity) ? isNaN(y.opacity) && y.opacity !== y.opacity : y.opacity === x.opacity);
}
