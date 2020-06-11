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

const borderWidth = 2;
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

<div class="frame" style="position:absolute;--border-width: {borderWidth}px;">
  <div class="border" style="width:{boxSize}px;height:{boxSize}px;"></div>
  <div class="border" style="left:{boxSize}px;width:{sideSize}px;height:{boxSize}px;"></div>
  <!-- <div class="axis-line" style="left:{borderWidth + padding}px;width:{boxSize - padding * 2}px"></div> -->
  <!-- <div class="axis-line" style="top:{borderWidth + padding}px;width:{boxSize - padding * 2}px"></div> -->
</div>

<svg
  width={boxSize + sideSize}
  height={boxSize}
  class:modifying="{modIdx !== -1}"
  style="--border-width: {borderWidth}px"
>
  <g>
    <line
      class="axis-line"
      x1={padding}
      y1={boxSize / 2}
      x2={boxSize - padding}
      y2={boxSize / 2}
    />
    <line
      class="axis-line"
      y1={padding}
      x1={boxSize / 2}
      y2={boxSize - padding}
      x2={boxSize / 2}
    />
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
  <g transform="translate({boxSize}, 0)">
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
</svg>

<style>
.frame {
  pointer-events: none;
}
.frame .border {
  position: absolute;
  box-sizing: border-box;
  border: var(--border-width) solid #ddd;
}
.frame .border:first-child {
  border-right-width: calc(var(--border-width) / 2);
  border-radius: 5px 0 0 5px;
}
.frame .border:last-child {
  border-left-width: calc(var(--border-width) / 2);
  border-radius: 0 5px 5px 0;
}

.frame .axis-line {
  border: 1px solid #ddd;
}

svg {
}

svg.modifying {
  pointer-events: none;
}

svg .axis-line {
  stroke: #ddd;
  stroke-width: var(--border-width);
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
