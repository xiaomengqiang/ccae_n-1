# BarChart

> Bar chart for category comparison. Used via `<Chart name="BarChart" option={...} />`.

## Required option props

- `data`: object[] — chart data (e.g. `[{ name: "华北风电场", value: 320 }, ...]`)
- `xAxis.data`: string — field name for X-axis dimension mapping
- `yAxisTitle`: string — descriptive Y-axis title (e.g. "发电量 (MWh)", "台数")

## Optional option props

- `direction`: `"vertical" | "horizontal"` — horizontal bar orientation
- `stack`: boolean (default: false) — stacked comparison
- `mini`: boolean — minimal display mode for small-size scenes, hides legend and axes
- `dataZoom.show`: boolean — enable data zoom, for large data volume scenes
- `markLine.top` / `markLine.bottom`: number — threshold reference lines (set only when thresholds are needed)

## Example

```jsx
<Chart
  name="BarChart"
  option={{
    data: [
      { "电站": "华北风电场", "发电量": 320 },
      { "电站": "华东光伏站", "发电量": 280 },
      { "电站": "华南储能站", "发电量": 150 },
    ],
    xAxis: { data: "电站" },
    yAxisTitle: "发电量 (MWh)",
    direction: "horizontal",
  }}
/>
```
