import { useEffect, useRef } from "react";

// 面板入场动画引擎（命令式保留：TreeWalker 逐词拆分/定时队列/IntersectionObserver 编排
// 操作任意 DOM，不适合声明式渲染）+ 声明式生命周期封装：
// usePanelEntrance(ref, {mode, memory}) 管理引擎创建/enter/stop，返回句柄（stream/chart/recovery/reveal）
// 供 nic/optical 面板在交互节点调用。window.HCEntrance 全局仍注册（兼容存量消费）。

function createEntrance(root, memory = { played: () => false, mark: () => {} }) {
  const timers = new Set(), observers = new Set();
  const reduced = () => window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  function later(fn, ms) { const id = setTimeout(() => { timers.delete(id); fn(); }, ms); timers.add(id); }
  function stop() {
    timers.forEach(clearTimeout); timers.clear();
    observers.forEach((o) => o.disconnect()); observers.clear();
    root.querySelectorAll("[data-observed]").forEach((n) => { if (!n.classList.contains("evt-chart-enter")) delete n.dataset.observed; });
    root.querySelectorAll("[data-stream-hidden]").forEach((n) => { n.style.visibility = n.dataset.streamHidden; delete n.dataset.streamHidden; });
    root.querySelectorAll(".evt-word").forEach((n) => n.replaceWith(n.textContent));
    root.querySelectorAll(".evt-generating,.evt-line-enter,.evt-thinking,.evt-stream-settle").forEach((n) => n.classList.remove("evt-generating", "evt-line-enter", "evt-thinking", "evt-stream-settle"));
  }
  function stream(container, skip = 0, onDone = () => {}) {
    if (!container || reduced()) { onDone(); return; }
    container.classList.add("evt-generating", "evt-thinking");
    later(() => container.classList.remove("evt-thinking"), 200);
    const words = [];
    const skipped = [...container.children].slice(0, skip);
    const included = (n) => !skipped.some((el) => el === n || el.contains(n));
    const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
    const texts = [];
    while (walker.nextNode()) {
      const n = walker.currentNode;
      if (included(n) && n.textContent.trim() && !n.parentElement.closest("svg,button,time:not(.evt-recovery-time),.evt-badge,.evt-data-halo,.evt-data-ring,.evt-data-ambient")) texts.push(n);
    }
    texts.forEach((n) => {
      const fragment = document.createDocumentFragment();
      (n.textContent.match(/[\u3400-\u9fff]|[a-zA-Z0-9]+|[^\u3400-\u9fffa-zA-Z0-9]/gu) || []).forEach((text) => {
        const span = document.createElement("span"); span.className = "evt-word"; span.textContent = text;
        words.push(span); fragment.append(span);
      });
      n.replaceWith(fragment);
    });
    // 图标在本行首字出现时显示，标签在前面的文字打完后显示。
    container.querySelectorAll("img,svg,.evt-badge,li").forEach((node) => {
      if (!included(node)) return;
      const badge = node.matches(".evt-badge");
      let index;
      if (badge) { index = words.filter((w) => w.compareDocumentPosition(node) & Node.DOCUMENT_POSITION_FOLLOWING).length; }
      else { index = words.findIndex((w) => node.contains(w) || (node.compareDocumentPosition(w) & Node.DOCUMENT_POSITION_FOLLOWING)); }
      if (index < 0) index = 0;
      node.dataset.streamHidden = node.style.visibility;
      node.style.visibility = "hidden";
      later(() => { node.style.visibility = node.dataset.streamHidden || ""; delete node.dataset.streamHidden; }, 400 + index * 45);
    });
    words.forEach((word, i) => later(() => {
      word.classList.add("evt-word-on", "evt-word-live");
      if (i >= 18) words[i - 18].classList.remove("evt-word-live");
    }, 400 + i * 45));
    later(() => {
      words.forEach((n) => n.classList.remove("evt-word-live"));
      container.classList.add("evt-stream-settle");
      later(() => { container.classList.remove("evt-generating", "evt-stream-settle"); onDone(); }, 300);
    }, 400 + words.length * 45 + 200);
  }
  function typeResponse(container) {
    if (!container || reduced()) return;
    const words = [];
    container.querySelectorAll(":scope>.evt-response-heading button,:scope>p").forEach((node) => {
      node.classList.remove("evt-line-enter");
      const text = node.textContent; node.replaceChildren();
      Array.from(text).forEach((char) => {
        const span = document.createElement("span"); span.className = "evt-word evt-response-char"; span.textContent = char;
        node.append(span); words.push(span);
      });
    });
    container.querySelectorAll(":scope>.evt-response-heading").forEach((node) => node.classList.remove("evt-line-enter"));
    // 所有段落共享一条匀速队列，段落之间不额外停顿。
    words.forEach((word, i) => later(() => word.classList.add("evt-word-on"), i * 30));
  }
  function lines(nodes) {
    if (reduced()) return;
    nodes.forEach((n, i) => { n.style.setProperty("--evt-enter-delay", `${i * 70}ms`); n.classList.add("evt-line-enter"); });
  }
  function observeOnce(card, key, play) {
    if (memory.played(key)) return;
    const show = () => { if (memory.played(key)) return; memory.mark(key); if (!reduced()) play(); };
    if (typeof IntersectionObserver === "undefined") { show(); return; }
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) { show(); observer.disconnect(); observers.delete(observer); }
    }, { root: root.querySelector(".evt-diagnostic-scroll"), threshold: .15 });
    observers.add(observer); observer.observe(card);
  }
  function chart() {
    root.querySelectorAll(".evt-chart-card:not([data-observed])").forEach((card) => {
      card.dataset.observed = "true";
      observeOnce(card, "chartPlayed", () => card.classList.add("evt-chart-enter"));
    });
  }
  function recovery() {
    root.querySelectorAll(".evt-recovery:not([data-observed])").forEach((card) => {
      card.dataset.observed = "true";
      observeOnce(card, "recoveryPlayed", () => {
        ["halo", "ring", "ambient"].forEach((name) => {
          const layer = document.createElement("div"); layer.className = "evt-data-" + name; layer.setAttribute("aria-hidden", "true");
          if (name === "halo") layer.append(document.createElement("i"));
          card.prepend(layer);
        });
        card.classList.add("evt-data-enter");
      });
    });
  }
  // 以内容行/完整卡片为入场单元，背景与文字共同出现，避免空框先行。
  function reveal(container = root) {
    lines([...container.querySelectorAll(".evt-step-header,.evt-step-body>p,.evt-step-body>div>p,.evt-step-body>div>.evt-card,.nic-manual-copy,.evt-review-actions,.evt-user-message,.evt-response-heading,.evt-response>p,.evt-chart-card,.evt-close-row")]);
  }
  function enter(mode) {
    stop(); reveal();
    if (mode === "live") {
      const current = root.querySelector(".evt-step:last-child .evt-step-body");
      current?.querySelectorAll(".evt-line-enter").forEach((n) => n.classList.remove("evt-line-enter"));
      stream(current);
    }
    chart(); recovery();
  }

  return { stop, enter, stream, chart, recovery, reveal, typeResponse };
}

// 声明式生命周期封装：挂载即创建引擎并 enter(mode)，卸载自动 stop
export function usePanelEntrance(ref, { mode = "complete", memory, enabled = true } = {}) {
  const handleRef = useRef(null);
  useEffect(() => {
    if (!enabled || !ref.current) return;
    const entrance = createEntrance(ref.current, memory);
    handleRef.current = entrance;
    entrance.enter(mode);
    return () => { entrance.stop(); handleRef.current = null; };
  }, [enabled]);
  return handleRef;
}

// window 全局注册（兼容存量消费方式）
window.HCEntrance = createEntrance;
