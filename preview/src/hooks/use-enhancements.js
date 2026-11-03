import { useEffect } from "react";
import { HC_ASSETS, HOME_LINKS_SVG } from "../mock/hc-assets.js";

// HCOpticalFlow —— 给 SVG path 添加流光轨迹动画（WAAPI 驱动）
// 被 optical-event / nic-event / enhancements 的 cabinet-links 调用
window.HCOpticalFlow = function (svg) {
  if (HCMotion.REDUCED || svg.querySelector(".hc-flow-paths")) return;
  const ns = "http://www.w3.org/2000/svg", group = document.createElementNS(ns, "g");
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
// 被 story.js / nic-event 调用（处理面板文字更新时的转场）
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

export function useEnhancements() {
  useEffect(() => {
    const run = () => {
    const screen = document.getElementById("screen");
    if (!screen) return;

    // 1. 机柜链路 SVG 替换 + 流光动画
    const original = screen.querySelector("img.cabinet-links");
    if (original) {
      const svg = new DOMParser().parseFromString(HOME_LINKS_SVG, "image/svg+xml").documentElement;
      svg.removeAttribute("width");
      svg.removeAttribute("height");
      svg.setAttribute("class", "cabinet-links hc-home-flow");
      svg.setAttribute("aria-hidden", "true");
      svg.querySelectorAll("path").forEach((n) => {
        n.style.opacity = "0";
        if (n.getAttribute("d") === "M0 72.9998C0 72.9998 74.1541 0.00011598 226.513 1.3952e-10C378.872 -0.00011598 408.537 72.3088 408.537 72.3088" && n.getAttribute("transform") === "matrix(-1,0,0,1,1369.23,593.536)") {
          n.classList.add("evt-fault-link");
        }
      });
      original.after(svg);
      window.HCOpticalFlow(svg);
    }

    // 2. 能耗信息图标
    const info = document.querySelector(".energy-info");
    if (info) {
      info.firstChild.textContent = "";
      const img = document.createElement("img");
      img.src = HC_ASSETS.icons["tips-0909"];
      img.alt = "";
      info.prepend(img);
    }

    // 3. select 美化器（下拉框样式替换）
    let openMenu = null;
    function decorate(select, mode = false) {
      const wrapper = select.parentElement;
      select.tabIndex = -1;
      select.setAttribute("aria-hidden", "true");
      select.style.pointerEvents = "none";
      const trigger = document.createElement("button");
      trigger.type = "button";
      trigger.className = "hc-select-trigger";
      trigger.setAttribute("aria-label", select.getAttribute("aria-label"));
      trigger.setAttribute("aria-haspopup", "listbox");
      trigger.setAttribute("aria-expanded", "false");
      const menu = document.createElement("div");
      menu.className = "hc-select-menu";
      menu.setAttribute("role", "listbox");
      menu.hidden = true;
      screen.append(menu);
      const close = () => { menu.hidden = true; trigger.setAttribute("aria-expanded", "false"); if (openMenu === close) openMenu = null; };
      const sync = () => { if (!mode) trigger.textContent = select.options[select.selectedIndex].textContent; };
      const choose = (i) => { select.selectedIndex = i; select.dispatchEvent(new Event("change", { bubbles: true })); sync(); close(); trigger.focus(); };
      const show = () => {
        if (!menu.hidden) { close(); return; }
        openMenu?.();
        const sr = screen.getBoundingClientRect(), r = wrapper.getBoundingClientRect(), scale = sr.width / 1920;
        menu.style.left = ((r.left - sr.left) / scale) + "px";
        menu.style.top = ((r.bottom - sr.top) / scale + 8) + "px";
        menu.replaceChildren();
        [...select.options].forEach((option, i) => {
          const b = document.createElement("button");
          b.type = "button";
          b.textContent = option.textContent;
          b.setAttribute("role", "option");
          b.setAttribute("aria-selected", String(i === select.selectedIndex));
          b.onclick = () => choose(i);
          b.onkeydown = (e) => {
            if (e.key === "Escape") { close(); trigger.focus(); }
            else if (["ArrowDown", "ArrowUp"].includes(e.key)) { e.preventDefault(); menu.children[(i + (e.key === "ArrowDown" ? 1 : -1) + select.options.length) % select.options.length].focus(); }
          };
          menu.append(b);
        });
        menu.hidden = false;
        trigger.setAttribute("aria-expanded", "true");
        openMenu = close;
      };
      trigger.onclick = show;
      trigger.onkeydown = (e) => {
        if (e.key === "ArrowDown") { e.preventDefault(); show(); menu.children[select.selectedIndex]?.focus(); }
        if (e.key === "Escape") close();
      };
      select.addEventListener("change", sync);
      wrapper.append(trigger);
      if (!mode) { select.style.opacity = "0"; wrapper.querySelector(":scope>span")?.setAttribute("hidden", ""); }
      sync();
      document.addEventListener("click", (e) => { if (!wrapper.contains(e.target) && !menu.contains(e.target)) close(); });
    }
    decorate(document.querySelector("#home-header select"), true);
    decorate(document.getElementById("range"));
    document.querySelector("#home-header button").addEventListener("click", () => openMenu?.());
  };

    if (document.readyState === "complete") setTimeout(run, 0);
    else window.addEventListener("load", run, { once: true });
    return () => window.removeEventListener("load", run);
  }, []);
}
