# PieChart

> Pie chart for composition / proportion. Used via `<Chart name="PieChart" option={...} />`.

## Required option props

- `data`: object[] — chart data (e.g. `[{ name: "运行中", value: 62 }, ...]`)
- `title.text`: string — center title

## Optional option props

- `title.subtext`: string — supplementary note below the center title
- `legendPosition`: `"centerRight" | "bottomCenter"` — legend placement
- `label.show`: boolean — direct labels on sectors (set only when needed)
- `mini`: boolean — minimal display mode for small-size scenes, hides legend and label

## Example

```jsx
<Chart
  name="PieChart"
  option={{
    data: [
      { name: "运行中", value: 62 },
      { name: "告警", value: 18 },
      { name: "停机", value: 12 },
    ],
    title: { text: "设备状态", subtext: "共 92 台" },
    legendPosition: "bottomCenter",
  }}
/>
```
