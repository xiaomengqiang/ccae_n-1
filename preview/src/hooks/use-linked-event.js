import { useEffect } from "react";

// 联动高亮 —— 跨视图事件高亮（从 story/legacy.js 提取）
// hover/focus 守护事件行/时间轴标记/故障提示时，同步高亮其他视图中的同一事件
// 包括 3D 场景 iframe 的 postMessage 联动

export function useLinkedEvent() {
  useEffect(() => {
    const screen = document.getElementById("screen");
    if (!screen) return;

    let linkedPointer = null, linkedFocus = null;

    function linkedEvent(target) {
      const row = target?.closest?.("#home-events [data-linked-event]");
      if (row) return { keys: [row.dataset.linkedEvent] };
      const anchor = target?.closest?.("#home-timeline-markers .marker-anchor");
      if (anchor) return { keys: [anchor.dataset.eventKey] };
      const tip = target?.closest?.("#home-tips>.optical,#home-tips>.qwen");
      if (tip) return { keys: [tip.classList.contains("optical") ? "optical" : "qwen"] };
      const card = target?.closest?.("#home-workloads .hc-workload.inference");
      if (card && /^Qwen-1.5B/.test(card.querySelector(".hc-workload-name")?.textContent || "") && card.querySelector(".hc-workload-progress")) return { keys: ["qwen"] };
      return null;
    }

    function paintLinkedEvent(selection) {
      const keys = selection?.keys || [];
      document.querySelectorAll(".story-linked-target").forEach((n) => n.classList.remove("story-linked-target"));
      document.querySelectorAll(".story-linked-location").forEach((n) => n.remove());
      document.querySelectorAll("#home-events [data-linked-event]").forEach((n) => { if (keys.includes(n.dataset.linkedEvent)) n.classList.add("story-linked-target"); });
      document.querySelectorAll("#home-timeline-markers .marker-anchor").forEach((n) => { if (keys.includes(n.dataset.eventKey)) n.querySelectorAll(".story-marker").forEach((m) => m.classList.add("story-linked-target")); });
      for (const key of keys) {
        document.querySelector("#home-tips>." + key)?.classList.add("story-linked-target");
        if (key === "qwen") document.querySelectorAll("#home-workloads .hc-workload.inference").forEach((card) => { if (/^Qwen-1.5B/.test(card.querySelector(".hc-workload-name")?.textContent || "")) card.classList.add("story-linked-target"); });
        if (!["qwen", "optical"].includes(key) || (key === "qwen" && window.HCStory.get().qwen < 5)) continue;
        const original = document.querySelector(key === "optical" ? ".cabinet-fault-link" : ".cabinet-red");
        if (original) {
          const highlight = original.cloneNode(false);
          highlight.removeAttribute("hidden");
          highlight.removeAttribute("id");
          highlight.classList.add("story-linked-location");
          highlight.alt = "";
          highlight.setAttribute("aria-hidden", "true");
          screen.append(highlight);
        }
      }
      document.querySelector("#home-room-overview iframe")?.contentWindow?.postMessage({ type: "ccae-room-hover", keys, key: keys[0] || null }, "*");
    }

    const handlers = [];
    for (const [enter, leave, isFocus] of [["pointerover", "pointerout", false], ["focusin", "focusout", true]]) {
      const onEnter = (e) => {
        const selection = linkedEvent(e.target);
        if (!selection) { if (!isFocus && linkedPointer) { linkedPointer = null; paintLinkedEvent(linkedFocus); } return; }
        if (isFocus) linkedFocus = selection; else linkedPointer = selection;
        paintLinkedEvent(linkedPointer || linkedFocus);
      };
      const onLeave = (e) => {
        if (!linkedEvent(e.target)) return;
        const selection = linkedEvent(e.relatedTarget);
        if (isFocus) linkedFocus = selection; else linkedPointer = selection;
        paintLinkedEvent(linkedPointer || linkedFocus);
      };
      document.addEventListener(enter, onEnter);
      document.addEventListener(leave, onLeave);
      handlers.push([enter, onEnter], [leave, onLeave]);
    }

    const onMessage = (e) => {
      if (e.source !== document.querySelector("#home-room-overview iframe")?.contentWindow || e.data?.type !== "ccae-room-object-hover") return;
      const keys = (e.data.keys || []).filter((k) => ["qwen", "optical", "cabinetD08-0", "cabinetD08-1"].includes(k));
      linkedPointer = keys.length ? { keys } : null;
      paintLinkedEvent(linkedPointer || linkedFocus);
    };
    window.addEventListener("message", onMessage);

    const clearOnDetailEntry = () => {
      if (!screen.querySelector(":scope > .hc-event-module, #optical-event-root:not([hidden]) > .hc-event-module")) return;
      if (linkedPointer || linkedFocus) { linkedPointer = null; linkedFocus = null; paintLinkedEvent(null); }
      document.querySelectorAll("#home-timeline-markers .story-visible").forEach((n) => n.classList.remove("story-visible"));
    };
    const detailEntryObserver = new MutationObserver(clearOnDetailEntry);
    detailEntryObserver.observe(screen, { childList: true });
    const opticalRoot = document.getElementById("optical-event-root");
    if (opticalRoot) detailEntryObserver.observe(opticalRoot, { childList: true, attributes: true, attributeFilter: ["hidden"] });

    const onBlur = () => { linkedPointer = null; linkedFocus = null; paintLinkedEvent(null); };
    window.addEventListener("blur", onBlur);

    const onStoryChange = () => paintLinkedEvent(linkedPointer || linkedFocus);
    window.addEventListener("hc-story-change", onStoryChange);

    return () => {
      handlers.forEach(([type, fn]) => document.removeEventListener(type, fn));
      window.removeEventListener("message", onMessage);
      window.removeEventListener("blur", onBlur);
      window.removeEventListener("hc-story-change", onStoryChange);
      detailEntryObserver.disconnect();
    };
  }, []);
}
