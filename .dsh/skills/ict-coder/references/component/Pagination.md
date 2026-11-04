# Pagination

## 设计规范

# Pagination 分页器使用规范

用于在大数据集或分页结果之间切换。

## 使用规则

- 必须设置 `showTotal` 属性，配置为：`showTotal: (total, range) => \`总记录数：${total}\``；当有复选（行选择）时，扩展为 `(total, range) => \`总记录数：${total} 已选中行数：${selectedCount}\``（`selectedCount` 取自页面选中项的受控 state）。
- 必须开启 `showSizeChanger: true` 与 `showQuickJumper: { goButton: "跳转" }`。
- 切换页码时保留筛选、搜索和排序条件；当前页超出新结果范围时回到有效页。

## 布局

- 放在所控制的数据容器底部，通常右对齐或与容器工具区对齐。
- 页码很多时由组件处理省略，不手动画页码链。

## Don't

- 不要在数据量很少时分页。
- 不要把 Pagination 放得远离所控制的内容。