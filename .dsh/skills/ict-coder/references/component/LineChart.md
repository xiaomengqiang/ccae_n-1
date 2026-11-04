# LineChart

> Line chart for data trends over time or categories. Used via `<Chart name="LineChart" option={...} />`.

## Required option props

- `data`: object[] — chart data (e.g. `[{ "月份": "1月", "发电量": 320, "计划": 300 }, ...]`)
- `xAxis.data`: string — field name for X-axis dimension mapping
- `yAxisTitle`: string — descriptive Y-axis title (e.g. "发电量 (MWh)")

## Optional option props

- `smooth`: boolean — smooth curve display
- `step`: boolean — step line display
- `stack`: boolean — stacked lines
- `area`: boolean — display as area chart
- `xAxis.name`: string — X-axis display name
- `mini`: boolean — minimal display mode for small-size scenes, hides legend and axes
- `dataZoom.show`: boolean — enable data zoom, for large data volume scenes
- `markLine.top` / `markLine.bottom`: number — threshold reference lines

## Example

```jsx
<Chart
  name="LineChart"
  option={{
    data: [
      { "月份": "1月", "实际": 286, "计划": 300 },
      { "月份": "2月", "实际": 312, "计划": 300 },
      { "月份": "3月", "实际": 298, "计划": 310 },
    ],
    xAxis: { data: "月份", name: "时间" },
    yAxisTitle: "发电量 (MWh)",
    smooth: true,
    markLine: { bottom: 280 },
  }}
/>
```
