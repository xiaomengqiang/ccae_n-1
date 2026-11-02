# HillChart

> Hill chart for absolute-value ranking (山峰图). Used via `<Chart name="HillChart" option={...} />`.

## Required option props

- `data`: object[] — chart data (e.g. `[{ name: "A", value: 45 }, ...]`)

## Optional option props

- `color`: string[] — custom hill colors (stick to defaults unless explicitly requested)

## Example

```jsx
<Chart
  name="HillChart"
  option={{
    data: [
      { name: "华北风电场", value: 1250 },
      { name: "华东光伏站", value: 840 },
      { name: "华南储能站", value: 620 },
    ],
  }}
/>
```
