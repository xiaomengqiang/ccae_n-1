# RadarChart

> Radar chart for multivariate comparison on polar axes (雷达图). Used via `<Chart name="RadarChart" option={...} />`. The chart already includes a legend — do not add an additional one.

## Required option props

- `data`: object — chart data: series name as key, dimension-value pairs as value (e.g. `{ Domestic: { Equipment: 41, VM: 91, CSP: 81 } }`)
- `radarMax`: number — maximum value for the outermost circle

## Optional option props

- `area.show`: boolean (default: true) — radar area fill
- `radar.shape`: `"polygon"` — polygon shape (default is circle)
- `markLine`: number — threshold circle line
- `color`: string[] — custom radar color (stick to defaults unless explicitly requested)
- `mini`: boolean — minimal display mode for small-size scenes, hides axis and label

## Example

```jsx
<Chart
  name="RadarChart"
  option={{
    radarMax: 100,
    data: {
      Domestic: { Equipment: 41, VM: 91, CSP: 81 },
    },
  }}
/>
```
