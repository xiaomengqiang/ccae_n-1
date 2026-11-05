import "./shared/motion-runtime.js";
import "./shared/evidence.js";
import "./shared/entrance.js";
import "./shared/story-state.js";
import "./shared/enhancement-animations.js";
import "./utils/clock.js";
import { mountStoryRender } from "./views/story/render.js";

// optical-event 已 React 化（views/optical-event/index.jsx），由 app.jsx 渲染接管，
// 此处不再调用 mountOpticalEvent；shared/entrance.js 提供 nic-event 依赖的 window.HCEntrance。
export function runBoot() {
  mountStoryRender();
}
