# JadeJueChart

> Jade Jue chart (玉玦图) for ranked composition. Used via `<Chart name="JadeJueChart" option={...} />`.

## Required option props

- `data`: object[] — chart data (e.g. `[{ name: "A", value: 45 }, ...]`)

## Optional option props

- `title.text`: string — center title
- `title.subtext`: string — supplementary note below the center title
- `color`: string[] — custom segment colors (stick to defaults unless explicitly requested)

## Example

```jsx
<Chart
  name="JadeJueChart"
  option={{
    data: [
      { name: "风电", value: 45 },
      { name: "光伏", value: 30 },
      { name: "储能", value: 25 },
    ],
    title: { text: "装机占比", subtext: "单位: MW" },
  }}
/>
```
