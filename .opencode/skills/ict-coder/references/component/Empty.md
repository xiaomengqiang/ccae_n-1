# Empty 空状态使用规范

用于展示无数据时的占位提示。

## 使用规则

- 直接使用 `<Empty description="..." />`，不传 `image`——自定义空状态图已由 starter 的 ConfigProvider 全局配置（`empty.image` + `renderEmpty`），antd 默认图已全局替换。
- Table、Select 等组件内部的空状态同样由全局配置接管，无需单独处理。
