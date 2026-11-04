// 演示时钟 —— 虚拟业务时间（2026-09-09 12:00 起算）
// 禁止使用系统时间，所有时间展示必须通过 HCClock
// window.HCClock 在模块顶层设置（不依赖 boot 调用时序）

let origin = Date.now();
const base = Date.UTC(2026, 8, 9, 12);
const seconds = () => Math.floor((Date.now() - origin) / 1000);
const format = (offset = seconds(), date = false) =>
  new Date(base + offset * 1000).toISOString().slice(date ? 0 : 11, 19).replace("T", " ");

window.HCClock = {
  seconds,
  format,
  reset() { origin = Date.now(); },
};

export function initClock() {}
