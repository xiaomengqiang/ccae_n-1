// index.jsx —— EnergyDetail 节能详情页 React 壳
// 职责：portal 挂载 #hc-energy-root、订阅会话仓库、注册 window API 桥、
//      首页守护列表增强（augmentHome）、SVG 文本缩放观察器
// 命令式 DOM 桥（augmentHome）操作 story 面板渲染的 React 节点，与 legacy 行为一致
import { Fragment, useEffect, useRef, useState } from "react";
import EnergyLeft from "./left-panel.jsx";
import EnergyRight from "./right-panel.jsx";
import {
  subscribe, getCurrent, getOpenSeq, openSession, closeSession, resetAll,
  startRecognition, clearTimers, registerHomeSync, getSessionByName, getLastFocus,
} from "./session-store.js";

const createPortal = (node, host) => ReactDOM.createPortal(node, host);

// 首页"自动处理中"页签补充节能识别中事件行（DOM 桥，操作 story 面板渲染的节点）
function augmentHome() {
  const box = document.querySelector("#home-events .hc-guard-events") || document.getElementById("home-events")?.firstElementChild;
  if (!box) return;
  const tabs = box.querySelectorAll("[role=tab]"), auto = tabs[1];
  if (!auto) return;
  const impactOnly = box.querySelector(".hc-impact-filter")?.getAttribute("aria-checked") === "true";
  const processing = impactOnly ? [] : (window.getProcessingEnergyEvents?.() || []);
  const badge = auto.querySelector(".hc-tab-count");
  if (badge) {
    if (!badge.dataset.energyBase) badge.dataset.energyBase = badge.textContent;
    badge.textContent = Number(badge.dataset.energyBase) + processing.length;
  }
  const oldList = box.querySelector(".hc-energy-home-list");
  if (oldList) {
    oldList.querySelectorAll(".hc-event-row:not(.hc-energy-home-row)").forEach((row) => box.insertBefore(row, oldList));
    oldList.remove();
  }
  if (auto.getAttribute("aria-selected") !== "true" || !processing.length) return;
  box.querySelector(".story-empty")?.remove();
  const energyList = document.createElement("div");
  energyList.className = "hc-energy-home-list";
  box.querySelectorAll(".hc-event-row").forEach((row) => energyList.append(row));
  box.append(energyList);
  processing.forEach((item) => {
    const row = document.createElement("article");
    row.className = "hc-event-row hc-energy-home-row hc-event-processing";
    const head = document.createElement("div");
    head.className = "hc-event-head";
    const ring = window.HCComponents?.EventTypeIcon({ domain: "inference", type: "energy", name: item.name, size: 26 });
    const name = document.createElement("span");
    name.textContent = item.name;
    const time = document.createElement("time");
    time.textContent = item.start.replace("今天 ", "");
    head.append(ring, name, time);
    const p = document.createElement("p");
    p.textContent = item.root;
    row.append(head, p);
    if (item.action === "energy") row.setAttribute("aria-disabled", "true");
    window.HCComponents?.FlowBorder(row);
    energyList.append(row);
  });
}

export default function EnergyDetail() {
  const [host, setHost] = useState(null);
  const [, setVersion] = useState(0);
  const rootRef = useRef(null);
  const prevOpenRef = useRef(false);

  useEffect(() => { setHost(document.getElementById("screen")); }, []);
  useEffect(() => subscribe(() => setVersion((v) => v + 1)), []);

  const s = getCurrent();
  const openSeq = getOpenSeq();

  // 关闭面板后把焦点还给打开前的元素
  useEffect(() => {
    const open = !!s;
    if (prevOpenRef.current && !open) getLastFocus()?.focus?.({ preventScroll: true });
    prevOpenRef.current = open;
  }, [s]);

  // window API 桥 + 全局监听（挂载一次）
  useEffect(() => {
    registerHomeSync(augmentHome);
    window.openEnergyService = (data) => openSession(data.name);
    window.openEnergyEvent = (item) => openSession(item.object.split(" / ").pop(), item.stateClass === "energy-wait");
    window.closeEnergyDetail = closeSession;
    window.getEnergyEventState = (name) => {
      const session = getSessionByName(name);
      return session ? { done: session.stage === 4, time: session.effectiveAt } : null;
    };

    // 包装 story 容器的 renderStoryGuard：守护列表重渲染后补充节能事件行
    const base = window.renderStoryGuard;
    const wrapGuard = (...args) => { base?.(...args); augmentHome(); };
    window.renderStoryGuard = wrapGuard;
    const onStoryChange = () => augmentHome();
    window.addEventListener("hc-story-change", onStoryChange);

    startRecognition();

    const headerBtn = document.querySelector("#home-header button");
    const onReset = () => resetAll();
    headerBtn?.addEventListener("click", onReset);
    const homeBtn = document.querySelector('#home-sidebar button[aria-label="首页"]');
    homeBtn?.addEventListener("click", closeSession);
    const onPageHide = () => clearTimers();
    window.addEventListener("pagehide", onPageHide);

    augmentHome();

    return () => {
      window.removeEventListener("hc-story-change", onStoryChange);
      headerBtn?.removeEventListener("click", onReset);
      homeBtn?.removeEventListener("click", closeSession);
      window.removeEventListener("pagehide", onPageHide);
      if (window.renderStoryGuard === wrapGuard) {
        if (base) window.renderStoryGuard = base;
        else delete window.renderStoryGuard;
      }
    };
  }, []);

  // SVG 文本随 preserveAspectRatio=none 拉伸自动补偿（观查内容与尺寸变化）
  useEffect(() => {
    if (!host) return;
    const root = rootRef.current;
    if (!root) return;
    let pending = false;
    function sync() {
      pending = false;
      root.querySelectorAll('svg[preserveAspectRatio="none"]').forEach((svg) => {
        const v = svg.viewBox.baseVal, r = svg.getBoundingClientRect();
        if (!r.width || !r.height || !v.width || !v.height) return;
        const ratio = r.width * v.height / (r.height * v.width);
        svg.querySelectorAll("text").forEach((t) => {
          const x = parseFloat(t.getAttribute("x")) || 0, y = parseFloat(t.getAttribute("y")) || 0;
          t.setAttribute("transform", `translate(${x} ${y}) scale(1 ${ratio}) translate(${-x} ${-y})`);
        });
      });
    }
    function queue() { if (!pending) { pending = true; requestAnimationFrame(sync); } }
    const mo = new MutationObserver(queue);
    mo.observe(root, { childList: true, subtree: true });
    const screen = document.getElementById("screen");
    const ro = screen && typeof ResizeObserver !== "undefined" ? new ResizeObserver(queue) : null;
    ro?.observe(screen);
    window.addEventListener("resize", queue);
    return () => {
      mo.disconnect();
      ro?.disconnect();
      window.removeEventListener("resize", queue);
    };
  }, [host]);

  if (!host) return null;

  return createPortal(
    <section
      id="hc-energy-root"
      ref={rootRef}
      data-phase={s ? (s.stage < 4 ? "strategy" : "monitor") : undefined}
      hidden={!s}
      onKeyDown={(e) => { if (e.key === "Escape") closeSession(); }}
    >
      {s && (
        <Fragment key={openSeq}>
          <EnergyLeft s={s} />
          <EnergyRight s={s} />
        </Fragment>
      )}
    </section>,
    host
  );
}
