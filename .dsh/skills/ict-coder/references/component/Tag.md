# Tag 标签使用规范

用于标记状态、分类或属性。

## 使用规则

- 状态/分类色一律走 antd `<Tag color="preset">` 的 `color` prop，皮肤已映射到 token、暗色自动跟随。

```jsx
<Tag color={color}>{label}</Tag>
```

## Don't
- 不要把 status / 业务枚举 / 数据值插值成 `className`，如 `` className={`st st-${kind}`} ``、`` className={`st ${cond ? "st-a" : "st-b"}`} ``。
- 不要为每种状态新建 CSS 类（如 `.st-warning` / `.st-success`），也不要重定义 `--color-tag-*` token。
