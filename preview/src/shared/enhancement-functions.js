// SVG 流光动画 + 文字淡入淡出 —— 跨域共享函数
// 被 enhancements.js（boot）/ optical-event / nic-event / story.js 调用
// window.HCOpticalFlow / window.HCFadeTip 在模块顶层设置
// 本模块通过 enhancements.js → boot.js 导入链被加载，确保在所有消费者之前
import "./motion-runtime.js";

// HCOpticalFlow —— 给 SVG path 添加流光轨迹动画（WAAPI 驱动）
window.HCOpticalFlow = function (svg) {
  if (HCMotion.REDUCED || svg.querySelector(".hc-flow-paths")) return;
  const ns = "http://www.w3.org/2000/svg";
  const group = document.createElementNS(ns, "g");
  group.classList.add("hc-flow-paths");
  group.setAttribute("aria-hidden", "true");
  const seen = new Set();
  const paths = [...svg.querySelectorAll("path:not(defs path):not(.evt-npu-flow)")].filter((base) => {
    const key = base.getAttribute("d") + "|" + (base.getAttribute("transform") || "");
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  svg.append(group);
  const speed = svg.classList.contains("evt-links") ? 315 / (1.25 * 1.75) : 315;
  const lengths = paths.map((p) => p.getTotalLength());
  const cycle = Math.max(1, ...lengths.map((L) => (L + 110) / speed * 1000));
  const epoch = document.timeline.currentTime;
  paths.forEach((base, i) => {
    const L = lengths[i];
    if (!L) return;
    const end = (L + 110) / speed * 1000 / cycle;
    [[110, .06], [70, .10], [40, .16], [16, .34]].forEach(([seg, opacity]) => {
      const p = document.createElementNS(ns, "path");
      p.setAttribute("d", base.getAttribute("d"));
      if (base.hasAttribute("transform")) p.setAttribute("transform", base.getAttribute("transform"));
      p.setAttribute("class", "hc-flow-trace" + (base.classList.contains("evt-fault-link") ? " hc-flow-fault" : ""));
      p.style.cssText = `fill:none;stroke:var(--hc-flow-color,rgb(99,213,168));stroke-opacity:${opacity};stroke-width:1;stroke-linecap:round;stroke-dasharray:${seg} ${L + 110 + seg};pointer-events:none`;
      group.append(p);
      const animation = p.animate(
        [{ strokeDashoffset: seg, offset: 0 }, { strokeDashoffset: seg - (L + 110), offset: end }, { strokeDashoffset: seg - (L + 110), offset: 1 }],
        { duration: cycle, delay: 0, iterations: Infinity, easing: "linear" }
      );
      animation.startTime = epoch;
    });
  });
};

// HCFadeTip —— 文字淡入淡出切换（blur + opacity 动画）
window.HCFadeTip = function (node, text) {
  const label = node.querySelector("span");
  if (node.dataset.copy === text) return;
  const first = node.dataset.copy === undefined;
  node.dataset.copy = text;
  clearTimeout(node._copyTimer);
  label.getAnimations().forEach((a) => a.cancel());
  if (first || HCMotion.REDUCED) { label.textContent = text; return; }
  label.animate([{ opacity: 1, filter: "blur(0px)" }, { opacity: 0, filter: "blur(3px)" }], { duration: 200, easing: "cubic-bezier(.4,0,1,1)", fill: "forwards" });
  node._copyTimer = setTimeout(() => {
    if (!node.isConnected) return;
    label.getAnimations().forEach((a) => a.cancel());
    label.textContent = text;
    label.animate([{ opacity: 0, filter: "blur(6px)" }, { opacity: 1, filter: "blur(0px)" }], { duration: 300, easing: "cubic-bezier(.33,0,.67,1)" });
  }, 250);
};
