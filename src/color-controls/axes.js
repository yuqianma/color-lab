import { createAxisXY } from './axis-xy.js';
import { createAxisZ } from './axis-z.js';

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

export const LAB = createAxes({
  xName: 'a*',
  yName: 'b*',
  zName: 'L*',
  xDomain: [-128, 128],
  yDomain: [-128, 128],
  zDomain: [100, 0],
  getX: _ => _.a,
  getY: _ => _.b,
  getZ: _ => _.l,
  toLab: (x, y, z) => d3.lab(z, x, y),
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
  toLab: (x, y, z) => d3.lab(d3.lch(x, y, z))
});
