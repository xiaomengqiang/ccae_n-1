# ProcessChart

> Progress bar chart for completion status and ratio ranking (进度条). Used via `<Chart name="ProcessChart" option={...} />`.

## Required option props

- `name`: `"ProcessBarChart" | "StackProcessBarChart"` — variant: horizontal progress bar / stacked horizontal progress bar
- `data`: object[] — chart data
  - ProcessBarChart: `[{ name, value }]`
  - StackProcessBarChart: `[{ name, children: [{ type, value }] }]`

## Optional option props

- `unit`: string — value suffix (e.g. `"%"`, `"MB"`, `"GB"`)
- `mini`: boolean — minimal display mode for small-size scenes, hides legend and axes
- `color`: string[] — custom bar colors (stick to defaults unless explicitly requested)

## Example: Basic Progress Bar

```jsx
<Chart
  name="ProcessChart"
  option={{
    name: "ProcessBarChart",
    data: [
      { name: "逆变器 A12", value: 80 },
      { name: "汇流箱 C04", value: 65 },
      { name: "储能单元 B02", value: 45 },
    ],
    unit: "%",
  }}
/>
```

## Example: Stacked Progress Bar

```jsx
<Chart
  name="ProcessChart"
  option={{
    name: "StackProcessBarChart",
    data: [
      {
        name: "华北风电场",
        children: [
          { type: "运行", value: 30 },
          { type: "检修", value: 20 },
        ],
      },
      {
        name: "华东光伏站",
        children: [
          { type: "运行", value: 12 },
          { type: "检修", value: 14 },
        ],
      },
    ],
  }}
/>
```
