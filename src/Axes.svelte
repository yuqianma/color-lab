<script>
import { createEventDispatcher } from 'svelte';
import { scaleLinear } from 'd3-scale';
import { lab } from 'd3-color';
import { pannable } from './utils/pannable.js';

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

const dispatch = createEventDispatcher();

export let boxSize = 300;
export let sideSize = 75;
export let padding = 10;

const borderWidth = 1;
const contentOffset = borderWidth / 2;

export let xDomain = [-128, 128];
export let yDomain = [-128, 128];
export let zDomain = [0, 100];

$: range = [padding, boxSize - padding];

$: xScale = scaleLinear(xDomain, range);
$: yScale = scaleLinear(yDomain, range);

$: zScale = scaleLinear(zDomain, range);

let colors = PALETTE.split('\n').map(c => lab(c));
export let getters = {
  x: _ => _.a,
  y: _ => _.b,
  z: _ => _.l,
};
export let setter = ({x, y, z}) => {
  return lab(
    zScale.invert(z),
    xScale.invert(x),
    yScale.invert(y)
  )
};
export let toCssColor = _ => _ + '';

let modIdx = -1;

function handlePanStart(e) {
  modIdx = e.target.dataset.idx;
}

function handlePanMove(e) {
  const { attributes } = e.target;
  const cx = +attributes.cx.value;
  const cy = +attributes.cy.value;
  colors[modIdx] = setter({
    x: cx + e.detail.dx,
    y: cy + e.detail.dy,
    z: zScale(getters.z(colors[modIdx]))
  });
  colors = [...colors];
}

function handlePanEnd(e) {
  modIdx = -1;
}
</script>

<svg width={boxSize + sideSize} height={boxSize}>
  <g transform="translate({contentOffset}, {contentOffset})">
    <rect class="border" width={boxSize - borderWidth} height={boxSize - borderWidth} />
    <g>
      {#each colors as color, idx}
        <circle
          data-idx={idx}
          use:pannable
          on:panstart={handlePanStart}
          on:panmove={handlePanMove}
          on:panend={handlePanEnd}
          class="pannable"
          cx={xScale(getters.x(color))}
          cy={yScale(getters.y(color))}
          r=5
          fill={toCssColor(color)}
        />
      {/each}
    </g>
  </g>
  <g transform="translate({boxSize - contentOffset}, {contentOffset})">
    <rect class="border" width={sideSize - borderWidth} height={boxSize - borderWidth} />
    <g>
      {#each colors as color, idx}
        <rect
          data-idx={idx}
          use:pannable
          on:panstart={handlePanStart}
          on:panmove={handlePanMove}
          on:panend={handlePanEnd}
          class="pannable"
          x={padding}
          y={zScale(getters.z(color))}
          width={sideSize - padding * 2}
          height=2
          fill={toCssColor(color)}
        />
      {/each}
    </g>
  </g>
</svg>

<style>
svg {
  color: #ccc;
}

.border {
  stroke: currentColor;
  fill: none;
}

.pannable {
  cursor: pointer;
}
</style>
