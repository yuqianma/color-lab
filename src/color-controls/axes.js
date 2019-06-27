import { createAxisXY } from './axis-xy.js';
import { createAxisZ } from './axis-z.js';
import { clamp } from '../util.js';

const combineAxes = ({
  AxisXY,
  AxisZ
}) => ({
  height = 300, // width === height
  leftWidth = 75,
  colors,
}) => {
  const width = height + leftWidth;

  return html`<svg ...${{ width, height }}>
    <${AxisXY} ...${{ width: height, height, colors }} />
    <${AxisZ} ...${{ left: height, width: leftWidth, height, colors }}/>
  </svg>`;
};

const createAxes = (props) => combineAxes({
  AxisXY: createAxisXY(props),
  AxisZ: createAxisZ(props)
});

const limitedLab = (...args) => {
  const c = d3.lab(...args);
  c.l = clamp(c.l, 0, 100);
  c.a = clamp(c.a, -128, 128);
  c.b = clamp(c.b, -128, 128);
  return c;
};

export const LAB = createAxes({
  xName: 'a*',
  yName: 'b*',
  zName: 'L*',
  xDomain: [-128, 128],
  yDomain: [-128, 128],
  zDomain: [0, 100],
  getX: _ => _.a,
  getY: _ => _.b,
  getZ: _ => _.l,
  toLab: (x, y, z) => limitedLab(z, x, y),
});

export const LCH = createAxes({
  xName: 'l',
  yName: 'c',
  zName: 'h',
  xDomain: [0, 100],
  yDomain: [0, 230],
  zDomain: [0, 360],
  getX: _ => d3.lch(d3.lab(_)).l,
  getY: _ => d3.lch(d3.lab(_)).c,
  getZ: _ => d3.lch(d3.lab(_)).h,
  toLab: (x, y, z) => limitedLab(d3.lch(x, y, z))
});
