import { useEffect, useLayoutEffect, useState } from "react";
import { useFitScale } from "../../hooks/use-fit-scale.js";
import MetricRibbon from "../../components/metric-ribbon/index.jsx";
import GuardEvents from "../../components/guard-events/index.jsx";
import Composer from "../../components/composer/index.jsx";
import Header from "../../components/header/index.jsx";
import Sidebar from "../../components/sidebar/index.jsx";
import { HC_ASSETS } from "../../mock/hc-assets.js";
import { initWorkloadBrowser, initWorkloadBrowserWindowAPI } from "./workload-browser.js";
import { initCompactStatus } from "./compact-status.js";

const createPortal = (node, host) => ReactDOM.createPortal(node, host);

// home-screen 装配层 —— 全部 React 化
// Header/Sidebar 用 useLayoutEffect 提前挂载（在 boot 的 initEnhancements 之前）
// MetricRibbon / GuardEvents / Composer 用 useEffect 在 boot 后挂载
export default function HomeScreen() {
  useFitScale();

  return (
    <>
      <SlotPortal slotId="home-metrics">
        <MetricRibbon onChange={(cat, idx) => window.showWorkloads?.(cat, idx)} />
      </SlotPortal>
      <SlotPortal slotId="home-events">
        <GuardEvents
          view="manual"
          onChange={handleGuardViewChange}
          onViewAll={() => window.openGuardEvents?.()}
        />
      </SlotPortal>
      <TicksSlot />
      <InitEffects />
    </>
  );
}

// Sidebar + 展开图标（原版 legacy-mount.js 中 sidebar.append(expand)）
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

// 延迟初始化（workloadBrowser / compactStatus）
function InitEffects() {
  useEffect(() => {
    initWorkloadBrowser();
    initWorkloadBrowserWindowAPI();
    initCompactStatus();
    document.querySelector(".time-now b").textContent = HCClock.format(0);
  }, []);
  return null;
}

// SlotPortal —— useLayout=true 用 useLayoutEffect（在所有 useEffect 之前执行，确保 boot 时元素已存在）
function SlotPortal({ slotId, children, useLayout = false }) {
  const [host, setHost] = useState(null);
  const setHostEffect = useLayout ? useLayoutEffect : useEffect;
  setHostEffect(() => setHost(document.getElementById(slotId)), []);
  if (!host) return null;
  return createPortal(children, host);
}

function handleGuardViewChange(view) {
  if (window.renderStoryGuard) {
    window.renderStoryGuard(view);
    return;
  }
}

function resetDemo() {
  HCClock.reset();
  window.resetOpticalEvent?.();
  window.resetNicEvent?.();
  const guardAll = document.getElementById("guard-all");
  if (guardAll) guardAll.hidden = true;
  document.querySelector("#home-metrics .hc-ribbon")?.activate?.("resource", 0, true);
  window.HCStory?.start?.();
  window.restartMascotEntrance?.();
}
