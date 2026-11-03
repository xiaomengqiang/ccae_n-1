import { HC_ASSETS } from "../../mock/hc-assets.js";
import "../../shared/motion-runtime.js";
import "../../utils/clock.js";

// boot 导入链 —— 确保共享函数在任何消费者之前加载
// Header 仍用 legacy 工厂挂载（enhancements/optical-event 依赖 #home-header 内元素在 boot 时存在）
// Composer 也用 legacy 工厂挂载（optical-event 的 initOpticalEvent 查询 .hc-composer 在 boot 时需存在）
// GuardEvents / MetricRibbon 已由 React portal 接管
export function initHomeScreenLegacy() {
  const C = window.HCComponents;
  function mount(id, node) { document.getElementById(id).replaceChildren(node); }

  mount("home-header", C.Header());

  mount("home-composer", C.Composer());
}
