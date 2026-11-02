# Segmented 分段控制器使用规范

用于少量互斥选项的切换（卡片右上角视图切换等场景）。

## Don't

- `size` 只用默认的 `middle`，不使用 `large` / `small`。
- 不使用 `vertical` 属性；竖向场景用原生 HTML + CSS 自行实现。
