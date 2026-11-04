# IPInput

IP / IPv6 / MAC 地址分段输入控件（antd 无此组件，skill 内置实现）。

## 导入

```jsx
import IpInput from "./assets/shared/ip-input.jsx";
```

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `type` | `"ipv4"` / `"ipv6"` / `"mac"` | `"ipv4"` | 段数与分隔符：ipv4 = 4 段 `"."` 十进制（分隔点居中），ipv6 = 8 段 `":"` 十六进制，mac = 6 段 `"-"` 十六进制 |
| `value` | string | — | 完整地址字符串（如 `"192.168.1.1"`） |
| `onChange` | `(v: string) => void` | — | 任一分段变化即回调完整字符串 |
| `onFocus` | `(v: string) => void` | — | 聚焦时回调当前完整字符串 |
| `onBlur` | `(v: string) => void` | — | 失焦时回调归一化后的完整字符串 |
| `status` | `"error"` / undefined | — | 错误态（表单校验联动，边框变 `--color-error`） |
| `id` | string | — | 落到首段 input，供 label `htmlFor` 关联 |
| `disabled` | boolean | `false` | 禁用 |
| `className` / `style` | — | — | 容器透传 |

## 使用规则

- 分段输入时非法字符自动过滤；blur 时分段归一化：ipv4 段钳制 0–255（空段补 0），ipv6 转小写，mac 左补零转两位大写。
- 宽度属 Form.md 控件宽度的固定 rem 族：显式定宽，不拉满。
- 与自研表单配合：受控 `value` + `onChange`，校验用 `status="error"`，同其他输入控件。
