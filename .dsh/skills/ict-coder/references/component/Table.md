# Table 表格使用规范

用于密集、可比较、基于行的企业数据。

## 使用规则

- 数字类右对齐，其余优先左对齐，操作列必须左对齐。
- 数据列默认启用内置排序 `sorter`；取值有限的列（状态、类型、归属等）启用筛选 `filters` + `onFilter`。
- 必须在 Table 级统一设置：`sortDirections={["ascend", "descend", "ascend"]}` 与 `showSorterTooltip={false}`。
- `pagination` 必须设置 `showTotal` 属性：
  - 默认：`(total, range) => \`总记录数：${total}\``
  - 有复选列：`(total, range) => \`总记录数：${total} 已选中行数：${selectedCount}\``（`selectedCount` 取自 `rowSelection.selectedRowKeys.length` 的受控 state）
- `pagination` 必须开启 `showSizeChanger: true` 与 `showQuickJumper: { goButton: "跳转" }`。
- 优先使用 `size="large"`（antd 默认尺寸），高密度场景使用 `middle`。
- 操作列直接使用 `<Icon>` 组件，不套 Button：统一 `size="0.875rem"`，图标间距统一 `1rem`，hover 用 `--color-brand`，禁用态用 `--color-text-disabled`。
- 数据列中的链接式操作（如点击名称查看详情）使用 `<a>` 标签 + `var(--interactive-link)` + `cursor: pointer`。**不使用 `<Button type="link">`**。
- 状态使用文本、图标或 Tag，不使用 Badge。

## 布局

- 固定列宽度仅用于操作列、时间列等内容确定的列；其余列不设宽度，自适应吸收剩余空间。禁止给所有列都设置宽度。
- 同一表格中的普通文字使用统一的文字色 Token；仅链接、状态、告警和禁用内容使用对应语义色，不得按列或行随意改变文字颜色。
- 选中行后在表格工具区显示已选数量和可执行操作。

## Don't

- 不要给所有列都设置固定宽度。
- 不要使用 Table 的 `title` 和 `footer` 属性。
- 不要同时设置左右固定列（`fixed: "left"` + `fixed: "right"`）— 只允许固定一侧。
- 不要手动画分页、复选列、排序或筛选。
- 不要把标准表格行做成 Card。
- 不要在操作列使用 Button 组件，一律使用纯图标 `<Icon>`。