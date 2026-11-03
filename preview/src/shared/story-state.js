// HCStory 状态机 —— 全局故事线状态（光链路/Qwen/节能三条剧情线）
// 纯函数 + subscribe/emit，可注入 schedule/cancel/now（用于测试）
// window.HCStory 在模块顶层设置（不依赖 boot 调用时序）
// 原版测试：源码/home/tests/story-state.test.cjs

export function createHCStory({ schedule = setTimeout, cancel = clearTimeout, now = Date.now } = {}) {
  const listeners = new Set(), timers = new Set();
  let state;
  const emit = () => listeners.forEach((fn) => fn({ ...state }));
  const later = (fn, ms) => { const id = schedule(() => { timers.delete(id); fn(); }, ms); timers.add(id); };
  function phase(key, value) { state[key] = value; if (value === 9) state[key + "ClosedAt"] = now(); emit(); }
  function reset() { timers.forEach(cancel); timers.clear(); state = { optical: 0, energy: 0, qwen: 0, startedAt: now() }; emit(); }
  // Presentation runs at 2x; displayed business timestamps remain unchanged.
  const presentationSpeed = 2;
  function start() {
    reset(); phase("optical", 1);
    for (let p = 2; p <= 6; p++) later(() => phase("optical", p), [0, 0, 2000, 4000, 6500, 9000, 12000][p]);
    later(() => phase("energy", 1), 6000);
    later(() => { phase("qwen", 1); for (let p = 2; p <= 6; p++) later(() => phase("qwen", p), [0, 0, 10000, 28000, 36000, 44000, 54000][p] / presentationSpeed); }, 12000);
  }
  function complete(key) {
    if (key === "qwen" && state.qwen === 6) { phase("qwen", 7); later(() => phase("qwen", 8), 1800); later(() => phase("qwen", 9), 3600); return true; }
    if (key !== "optical" || state[key] !== 6) return false;
    phase(key, 7); later(() => phase(key, 8), 520); later(() => phase(key, 9), 1040);
    return true;
  }
  reset();
  return { start, reset, complete, get: () => ({ ...state }), subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); } };
}

// window 挂载（模块顶层执行）
// story.js 在 boot 中运行时通过 window.HCStory 使用
window.HCStory = createHCStory();
