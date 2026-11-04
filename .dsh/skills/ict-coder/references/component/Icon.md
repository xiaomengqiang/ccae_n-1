# Icon 图标使用规范

用于表达操作、导航、状态、类别或重点对象。

## 图标来源 — Lucide(唯一)

本 skill 的页面图标一律使用 **Lucide 图标**（`<Icon name="..." />`），不使用 `@ant-design/icons`。antd 组件自身的内置图标（Select 箭头、Modal 关闭键等）随 antd.min.js 携带，无需处理、也不做替换。

```jsx
import { Icon } from "./assets/shared/icon.jsx";

<Icon name="chevron-down" size="1rem" color="#0067D1" className="chev" />

const item = { icon: "home", label: "首页" };
<Icon name={item.icon} size="1.25rem" />

<Icon name={open ? "chevron-up" : "chevron-down"} />

<Icon src="./assets/uploads/logo.svg" size="2rem" />

<Icon name="trash-2" size="1rem" title="删除" onClick={() => del(row.id)} />
```

## 图标尺寸（Size）

`size` 使用 **rem 字符串**（随视口等比缩放）。**必须使用下列推荐尺寸**，不要使用 13、22 等非推荐值。尺寸 px 与 rem 对照：

| 尺寸 px | 尺寸 rem |
|-----------|-----------|
| 12 | `size="0.75rem"` |
| 14 | `size="0.875rem"` |
| 16 | `size="1rem"` |
| 20 | `size="1.25rem"` |
| 24 | `size="1.5rem"` |
| 32 | `size="2rem"` |
| 36 | `size="2.25rem"` |
| 40 | `size="2.5rem"` |
| 48 | `size="3rem"` |
| 60 | `size="3.75rem"` |

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `name` | string | — | Lucide 图标名（kebab-case） |
| `src` | string | — | 用户提供的图片路径（svg/png/jpg）；与 `name` 同设时优先 |
| `size` | string (rem) | `"1rem"` | 图标尺寸 rem 字符串 |
| `color` | string | `currentColor` | 描边色（name 模式）。仅支持 6 位 hex（如 `#0067D1`），不支持 rgba / rgb / 8 位 hex |
| `className` | string | `""` | CSS 类（间距/hover 效果写这里） |
| `style` | object | — | 内联样式 |
| `id` | string | — | 元素 id |
| `strokeWidth` | number | `2` | 描边宽度（name 模式） |
| `onClick` | function | — | 点击回调；设置后自动带 `cursor: pointer` |
| `title` | string | — | 悬停提示文案（可点击图标必须配，说明操作含义） |

## name 模式规则（默认）

1. **只用真实存在的 Lucide 名** — kebab-case（`chevron-down`、`shopping-cart`、`circle-check`），不发明、不猜拼、不擅自复数化
2. **绝不手写 SVG path** — Icon 渲染的是 Lucide nodes，手写 path 不会显示
3. **camelCase 自动转换** — `chevronDown` → `chevron-down`，但仍优先 kebab-case
4. **变量传名合法** — `name={item.icon}`、`name={cond ? "a" : "b"}` 均可；运行时拼接名（`` `${type}-icon` ``）无法被构建提取，渲染为空
5. **不用已更名的旧名** — 如 `bar-chart-3` → `chart-column`、`more-horizontal` → `ellipsis`、`check-circle-2` → `circle-check-big`
6. 拿不准的名字靠 Lucide 知识或查 https://lucide.dev/icons
7. build.mjs 会在构建时校验每个名字并按需注入；非 Lucide 名触发 WARN

## src 模式（用户资产）

仅当用户明确提供图片资产（svg/png/jpg）时使用。文件放入页面脚手架 `assets/uploads/`，路径相对脚手架根解析：

1. `<Icon src="./assets/uploads/logo.svg" size="2rem" />`
2. `<img src="./assets/uploads/banner.png" />`

## 与 antd 组件搭配

antd 的 `icon` 类 prop 接收任意 ReactNode，直接传 `<Icon />`：

```jsx
<Button icon={<Icon name="search" size="0.875rem" />}>查询</Button>
<Input prefix={<Icon name="user" size="0.875rem" />} placeholder="账号" />
<Menu items={[{ key: "home", icon: <Icon name="house" size="0.875rem" />, label: "首页" }]} />
```

注意 `size` 显式传值（antd 文字默认 14px 即 `0.875rem`，Lucide 默认 24px 即 `1.5rem` 会撑爆行高）。
