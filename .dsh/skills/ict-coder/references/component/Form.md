# Form（表单骨架）

## 设计规范

不使用 antd 的 `Form` / `Form.Item`（构建时 FAIL）。表单 = 纯 H5 骨架（`form` / `label` / `div`）+ antd 输入组件受控使用。布局按页面场景自行选择并写在组件自己的 CSS 里。

## 布局

### 形态选型

- 标签居左：优先使用 CSS Grid（标签列 `max-content` 或固定 rem 宽度），确保标签逐行左对齐。
- 标签居上：标签在控件正上方，标签与控件间距固定 **`0.5rem`（8px）**。
- 弹窗内紧凑表单、筛选区、详情表单可以采用不同形态，但同一区域内必须统一。

### 标签

- 标签文字**一律左对齐**。
- 必填星号绝对定位悬挂在标签文字左侧，与标签垂直居中，不占排版空间（见下方参考写法）。

### 布局间距

- 间距一律使用 spacing token。
- 多列表单的横向组间距统一 `2rem`（32px），标签居左、标签居上均适用。
- 字段间纵向间距三档可选，按内容密度选档：
  - `1rem`（16px，紧凑场景：弹窗、筛选区）
  - `1.5rem`（24px，常规表单）
  - `2rem`（32px，分区表单或内容稀疏）

### 控件宽度（重点）

- Input / TextArea / Select / TreeSelect / Cascader / Slider：显式设置宽度，占满可用空间用 `style={{ width: "100%" }}`，或取固定 rem 值（筛选区等控件并排场景、宽容器中需限定宽度场景）。
- InputNumber / DatePicker / RangePicker / TimePicker：显式设置固定 rem 宽度，不随控件列拉长；仅在窄容器场景（抽屉、窄列等）可用 `100%`。
- Checkbox / Radio / Switch / Rate / ColorPicker / Segmented / IpInput 内容自适应，不设宽度。
- 同一区域同类控件宽度保持一致；宽度用 `style` 写在控件上，其余样式写组件 CSS。

### 校验文案

- 提示文案绝对定位在控件正下方，显示/隐藏不改变布局高度、不把内容往下顶（见下方参考写法）。

### 星号与校验文案参考写法（类名自定，CSS 写在组件自己的文件里）

```css
/* 必填星号：突出在标签左侧垂直居中，不占位 */
.form-label {
  position: relative;
}
.form-label.required::before {
  content: "*";
  position: absolute;
  left: -0.5rem; 
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-error);
  font: var(--font-body-m);
}

/* 校验文案：覆盖在控件下方，不占位 */
.form-field {
  position: relative; /* 控件单元 wrapper */
}
.form-error {
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: 0.25rem;
  font: var(--font-caption-m);
  color: var(--color-error);
}
```

```jsx
<label className="form-label required" htmlFor="f-name">名称</label>
<div className="form-field">
  <Input id="f-name" status={errors.name ? "error" : undefined} /* ... */ />
  {errors.name && <div className="form-error">{errors.name}</div>}
</div>
```

## 值与校验模式

- 每字段受控：`value` + `onChange`；`Input` 取 `e.target.value`，`Select` / `InputNumber` / `Switch` 回调直接是值。
- 提交时统一校验，结果写入 `errors` 对象 state；控件传 `status={errors.x ? "error" : undefined}`。
- 错误文案固定显示在对应控件正下方（绝对定位不占位），随 `errors` 渲染；输入修正后对应错误即时清除。
- label 用 `htmlFor` 关联控件 `id`；必填星号用 CSS 伪元素实现，突出不占位。

## Don't

- 不使用 `Form` / `Form.Item` / `Form.List`（构建 FAIL）。
- 不依赖浏览器原生校验气泡（原生 `required` / `type="email"` 提示）。
- 不要用普通 `Input` 拼接 IP / IPv6 / MAC 字段；使用 `IpInput`。
- 不手画红框代替 `status="error"`；错误信息不弹 message / notification，固定在控件下方。
