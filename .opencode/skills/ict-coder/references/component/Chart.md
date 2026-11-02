# Chart

React wrapper over HUICharts (echarts-based).

**Import:** `import Chart from "../../../assets/shared/chart.jsx"` (adjust relative depth for component folders)

## Sizing

The chart fills its container (default 100% × 100%). **echarts** reads the container size at init — without a computable height the chart renders at 0px (invisible).

**Rules** — any sizing method works (style / className / flex / grid) as long as the height is computable:

- Percentages (`height: 50%`) only when the ancestor chain resolves to a definite height (e.g. a parent with `height: 30rem`) — inside an auto-height parent they collapse to 0
- In a column flex container, never pair `flex: 1` with `height` on the same element, `flex: 1` (`flex-basis: 0%`) overrides `height`
- `min-height` / `max-height` alone are NOT computable
- Grid `auto` rows are not computable; `1fr` rows in a definite-height grid are
- Hidden containers (antd Tabs / Collapse / Drawer panes) init at 0×0 but self-heal via ResizeObserver — no conditional rendering needed

**Pattern A — parent fixed height, chart fills:**

```jsx
<div style={{ height: "20rem", display: "flex", gap: "1rem" }}>
  <Chart name="BarChart" option={barOption} style={{ flex: 1 }} />
  <Chart name="PieChart" option={pieOption} style={{ flex: 1 }} />
</div>
```

**Pattern B — direct height on the chart, parent auto-height:**

```jsx
// use style
<Chart name="BarChart" option={{ ... }} style={{ height: "19rem" }} />
// with .chart-box { height: 19rem }
<Chart name="PieChart" option={{ ... }} className="chart-box" /> 
```

**Pattern C — elastic card (recommended for card grids):**

In equal-height grids (`align-items: stretch`), fixed heights leave dead space below the chart. Make the card `flex column`, give the chart `flex: 1` with `min-height` as the guaranteed floor — `flex: 1` absorbs any stretched height.

```jsx
<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", alignItems: "stretch" }}>
  // tall card — stretches the sibling to its height
  <div className="card">…25rem tall content…</div>
  // elastic card — flex column, chart absorbs the stretched height
  <div className="card" style={{ display: "flex", flexDirection: "column" }}>
    <h3>月度发电量</h3>
    <Chart name="BarChart" option={barOption} style={{ flex: 1, minHeight: "15rem" }} />
  </div>
</div>
```

## Card action area

Prefer this structure for the chart card's top-right action area: filter dropdown (Dropdown) → vertical divider → icon group, right-aligned, `1rem` gap within the group.

- Filter uses Dropdown.
- Vertical divider is hand-drawn: 1px wide, 0.75rem tall, background `--color-border`.
- Icon group uses `<Icon>`: refresh `refresh-cw`, settings `settings`, more `ellipsis`; `size="1rem"`, hover `--color-brand`, must have `title`.

## Stability — height feedback loop

A definite height anywhere in the chain — a `height` on the chart itself (Pattern B) or a fixed-height ancestor (Pattern A) — makes the layout safe. Risk only arises when the height comes purely from stretch allocation and no ancestor provides a definite height (Pattern C's stretch grids, a bare chart as a flex item): sizes written back by echarts re-enter layout, and the card grows on every resize.

Stretch-only layouts (no definite height in the chain) MUST cut both feedback channels (on the column flex container hosting the chart):

- `flex: 1 1 0` — never `flex: 1 1 auto` (basis auto makes content height the growth baseline)
- `min-height: 0`, a fixed rem value, or `overflow: hidden` — anything but the default `auto` kills the content-based minimum size

Chart wrapper: `flex: 1` + `minHeight: 0` or a fixed rem floor (vertical); `minWidth: 0` for horizontal shrinking.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `name` | `string` (required) | — | Chart type — see Selection below |
| `option` | `object` (required) | — | Chart config — per-type specs: `references/component/{ChartName}.md` |
| `className` | `string` | — | Custom class |
| `style` | `object` | — | Inline styles |
| `onChartRendered` | `(chart) => void` | — | Callback after render; receives the HUICharts instance |

## Selection

| Chart | Scenario |
|-------|----------|
| `BarChart` (柱状图) | Category comparison |
| `LineChart` (折线图) | Trends over time or categories |
| `PieChart` (饼图) | Composition / proportion |
| `GaugeChart` (仪表盘) | Single-value achievement rate |
| `HillChart` (山峰图) | Absolute-value ranking |
| `JadeJueChart` (玉玦图) | Ranked proportion |
| `ProcessChart` (多组进度图) | Completion progress, percentage/ratio ranking |
| `RadarChart` (雷达图) | Multivariate comparison across dimensions |

## Colors

- Charts use the default palette in order: `#2070f3, #62B42E, #715AFB, #2CB8C9, #F69E39, #5CA2E9, #BF68FA, #ED448A, #BFB9FA, #D19F00, #B8D9F9`. Set `option.color` only when the user explicitly requests custom colors.
- Keep color mapping consistent per data category across multiple charts.

## Dark mode

Automatic — the wrapper watches `<html>`'s `.dark` class and re-renders with `hdesign-dark` / `hdesign-light` theme. To force a specific theme, set `option.theme` explicitly.

## Public methods (via ref)

| Method | Returns | Description |
|--------|---------|-------------|
| `getEchartsInstance()` | echarts instance | Raw echarts instance for advanced operations (events, tooltips, dataZoom) |
| `resizeHandler()` | — | Manually trigger chart resize (auto via ResizeObserver; use after manual DOM changes) |

### Example: bind chart events via getEchartsInstance

```jsx
import { useRef } from "react";
import Chart from "../../../assets/shared/chart.jsx";

function ClickableBar({ data, onBarClick }) {
  const chartRef = useRef(null);

  const handleRendered = () => {
    const ec = chartRef.current?.getEchartsInstance();
    if (!ec) return;
    ec.on("click", (params) => {
      onBarClick?.(params.name, params.value);
    });
  };

  return (
    <Chart
      ref={chartRef}
      name="BarChart"
      option={{ data }}
      onChartRendered={handleRendered}
    />
  );
}
```

### Example: force resize via resizeHandler

```jsx
// 场景:容器尺寸被外部逻辑改变(如手动改了父容器 className),ResizeObserver
// 已自动覆盖大多数情况;此方法用于极端场景下手动兜底
chartRef.current?.resizeHandler();
```

## Don't

- Do not hand-draw legends, axes, units, or progress visuals.
- Do not call chart types or props that don't exist.