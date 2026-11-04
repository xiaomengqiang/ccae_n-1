import { useEffect, useRef, useState } from "react";
import { useFitScale } from "../../hooks/use-fit-scale.js";
import { useHealthMetrics } from "../../hooks/use-health-metrics.js";
import { useLinkedEvent } from "../../hooks/use-linked-event.js";
import StoryGuardPanel from "./story-guard-panel.jsx";

const createPortal = (node, host) => ReactDOM.createPortal(node, host);

// StoryGuardPanelContainer —— 订阅 HCStory 状态，驱动 StoryGuardPanel
export default function StoryGuardPanelContainer() {
  const [storyState, setStoryState] = useState(() => window.HCStory?.get() || { optical: 0, qwen: 0, startedAt: 0 });
  const [view, setView] = useState("manual");
  const viewRef = useRef(view);
  viewRef.current = view;

  useEffect(() => {
    const unsubscribe = window.HCStory?.subscribe((s) => {
      setStoryState(s);
      // story 状态变化时保持当前 view
    });
    // 暴露 window.renderStoryGuard 供外部调用
    window.renderStoryGuard = (v) => {
      if (v) setView(v === "energy" ? "energy" : "manual");
      setStoryState(window.HCStory?.get() || storyState);
    };
    return () => {
      unsubscribe?.();
      delete window.renderStoryGuard;
    };
  }, []);

  return (
    <StoryGuardPanel
      view={view}
      storyState={storyState}
      onViewAll={() => window.openGuardEvents?.()}
      onViewChange={(v) => setView(v)}
    />
  );
}
