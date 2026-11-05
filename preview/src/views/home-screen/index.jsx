import { useEffect, useState } from "react";
import { useFitScale } from "../../hooks/use-fit-scale.js";
import { useHealthMetrics } from "../../hooks/use-health-metrics.js";
import { useLinkedEvent } from "../../hooks/use-linked-event.js";
import StoryRenderer from "../story/story-renderer.jsx";
import MetricRibbon from "../../components/metric-ribbon/index.jsx";
import Composer from "../../components/composer/index.jsx";
import Header from "../../components/header/index.jsx";
import Sidebar from "../../components/sidebar/index.jsx";
import { HC_ASSETS } from "../../mock/hc-assets.js";
import { initCompactStatus } from "./compact-status.js";
import EnhancementsPortal from "../../hooks/use-enhancements-portal.jsx";

const createPortal = (node, host) => ReactDOM.createPortal(node, host);

// home-screen 装配层 —— 全部 React 化
// Header / Sidebar / Composer / MetricRibbon 由 React portal 渲染
// StoryRenderer 统一管理 story 状态驱动的全页联动
export default function HomeScreen() {
  useFitScale();
  useHealthMetrics();
  useLinkedEvent();

  return (
    <>
      <SlotPortal slotId="home-header">
        <Header onReset={resetDemo} />
      </SlotPortal>
      <SlotPortal slotId="home-sidebar">
        <SidebarWithExpand />
      </SlotPortal>
      <SlotPortal slotId="home-metrics">
        <MetricRibbon onChange={(cat, idx) => window.showWorkloads?.(cat, idx)} />
      </SlotPortal>
      <SlotPortal slotId="home-composer">
        <Composer />
      </SlotPortal>
      <StoryRenderer />
      <EnhancementsPortal />
      <TicksSlot />
      <InitEffects />
    </>
  );
}

function SidebarWithExpand() {
  return (
    <>
      <Sidebar />
      <img className="sidebar-expand" src={HC_ASSETS.icons["侧边栏展开"]} alt="展开侧栏" />
    </>
  );
}

function TicksSlot() {
  const [host, setHost] = useState(null);
  useEffect(() => setHost(document.getElementById("ticks")), []);
  if (!host) return null;
  return createPortal(
    <>
      {Array.from({ length: 20 }, (_, i) => (
        <span key={i}>{HCClock.format(i * 60 - 360).slice(0, 8)}</span>
      ))}
    </>,
    host
  );
}

function InitEffects() {
  useEffect(() => {
    initCompactStatus();
  }, []);
  return null;
}

function SlotPortal({ slotId, children }) {
  const [host, setHost] = useState(null);
  useEffect(() => setHost(document.getElementById(slotId)), []);
  if (!host) return null;
  return createPortal(children, host);
}

function resetDemo() {
  window.HCClock?.reset();
  window.resetOpticalEvent?.();
  window.resetNicEvent?.();
  const guardAll = document.getElementById("guard-all");
  if (guardAll) guardAll.hidden = true;
  const ribbon = document.querySelector("#home-metrics .hc-ribbon");
  ribbon?.activate?.("resource", 0, true);
  window.HCStory?.start();
  window.restartMascotEntrance?.();
}
