# TimePicker 时间选择器使用规范

用于选择时间点。

## 使用规则

- 同一页面保持 12/24 小时制和时间格式一致；12 小时制必须明确 AM/PM。

## 布局

- 面板贴近触发框，不遮挡当前任务的关键操作。
- 范围输入保持起止关系清晰，并为完整时间和长 placeholder 预留宽度。

## Don't

- 禁止使用 `TimePicker.RangePicker` 形态；时间范围用 `DatePicker.RangePicker showTime`。
- 不要用普通 Input 代替时间选择。
- 不要混用多种时间格式，或在不需要时显示秒。
- 不要使用开发组件不存在的属性或枚举值。