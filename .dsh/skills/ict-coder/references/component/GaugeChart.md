# GaugeChart

> Gauge chart for displaying values on a circular dial (仪表盘). Used via `<Chart name="GaugeChart" option={...} />`.

## Required option props

- `data`: object[] — chart data (e.g. `[{ value: 71, name: "利用率" }]`)

## Optional option props

- `pointer`: boolean — show gauge pointer needle
- `min` / `max` / `splitNumber`: number — custom range and divisions
- `markLine`: number — threshold value (gauge turns red when exceeded)
- `splitColor`: number[][] — multi-color ranges as `[threshold, color]` pairs, e.g. `[[0.25, "#0d9458"], [0.5, "#eeba18"], [0.75, "#ec6f1a"], [1, "#f43146"]]`
- `text`: object — center text configuration (`offset`, `formatter`)
- `color`: string[] — custom gauge color (stick to defaults unless explicitly requested)
- `mini`: boolean — minimal display mode for small-size scenes, hides axes

## Example

```jsx
<Chart
  name="GaugeChart"
  option={{
    data: [{ value: 71, name: "利用率" }],
    min: 0,
    max: 100,
    splitNumber: 4,
    markLine: 88,
    text: { formatter: (value) => `历史 ${value} ` },
  }}
/>
```
