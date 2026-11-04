# Tabs 页签使用规范

用于同一上下文中同级内容的切换。

## 使用规则

- `size` 只用默认的 `middle`，不使用 `large` / `small`。
- `type` 分层使用：常规页签用默认的 `line`；`line` 内嵌套的次级页签才用 `card`。禁止使用 `type="editable-card"`。
- 关闭页签用 item 的 `closable: true`，增加页签用 `tabBarExtraContent`；关闭和增加功能不改变 `type` 的层级选择。
- 通过 `items` 的 `children` 渲染面板内容时，children 的根容器加 `padding-top: 1rem`。

## 布局

- Tabs 紧邻所控制的内容，当前项在组内最突出。
- 页签过多时使用组件溢出能力；需要多层导航时改用 Side Navigation 或内容分组。

## Don't

- 不要使用 `size="large"` / `size="small"`。
- 禁止使用 `type="editable-card"`。
- 不要在最外层使用 `card`。
- 不要用 Tabs 表示步骤流程或跨模块导航。
- 不要混合同级和非同级内容。
