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
let hoverIdx = -1;

function handlePanStart(e) {
  modIdx = +e.target.dataset.idx;
}

function handlePanMove(e) {
  const { attributes } = e.target;
  let color = colors[modIdx];
  if (e.target.tagName === 'circle') {
    const cx = +attributes.cx.value;
    const cy = +attributes.cy.value;
    color = {
      x: cx + e.detail.dx,
      y: cy + e.detail.dy,
      z: zScale(getters.z(color))
    };
  } else {
    const z = +attributes.y.value;
    color = {
      x: xScale(getters.x(color)),
      y: yScale(getters.y(color)),
      z: z + e.detail.dy
    };
  }
  colors[modIdx] = setter(color);
  colors = [...colors];
}

function handlePanEnd(e) {
  modIdx = -1;
}

function handleMouseEnter(e) {
  hoverIdx = +e.target.dataset.idx;
}

function handleMouseLeave(e) {
  hoverIdx = -1;
}
</script>
<svg width={boxSize + sideSize} height={boxSize} class:modifying="{modIdx !== -1}">
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
          on:mouseenter={handleMouseEnter}
          on:mouseleave={handleMouseLeave}
          class="color pannable"
          class:focus="{idx === modIdx || idx === hoverIdx}"
          cx={xScale(getters.x(color))}
          cy={yScale(getters.y(color))}
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
          on:mouseenter={handleMouseEnter}
          on:mouseleave={handleMouseLeave}
          class="color pannable"
          class:focus="{idx === modIdx || idx === hoverIdx}"
          style="--padding: {padding}px;--side-size: {sideSize}px;"
          y={zScale(getters.z(color))}
          width={sideSize - padding * 2}
          height=1
          stroke={toCssColor(color)}
        />
      {/each}
    </g>
  </g>
</svg>

<style>
svg {
  color: #ccc;
}

svg.modifying {
  pointer-events: none;
}

.border {
  stroke: currentColor;
  fill: none;
}

.pannable {
  cursor: pointer;
}

.color {
  transition-duration: 150ms;
  transition-timing-function: ease-out;
}

circle.color {
  r: 5px;
  transition-property: r;
}
circle.color.focus {
  r: 7px;
}

rect.color {
  x: var(--padding);
  width: calc(var(--side-size) - var(--padding) * 2);
  stroke-width: 1px;
  transition-property: x, width;
}
rect.color.focus {
  x: calc(var(--padding) - 2px);
  width: calc(var(--side-size) - var(--padding) * 2 + 4px);
  stroke-width: 2px;
}

.color.focus {
  pointer-events: all;
}

</style>
