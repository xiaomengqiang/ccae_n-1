import { useEffect, useState } from "react";
import { useFitScale } from "../../hooks/use-fit-scale.js";
import { useHealthMetrics } from "../../hooks/use-health-metrics.js";
import { useLinkedEvent } from "../../hooks/use-linked-event.js";
import StoryRenderer from "../story/story-renderer.jsx";
import MetricRibbon from "../../components/metric-ribbon/index.jsx";
import GuardEvents from "../../components/guard-events/index.jsx";
import Composer from "../../components/composer/index.jsx";
import Header from "../../components/header/index.jsx";
import Sidebar from "../../components/sidebar/index.jsx";
import { HC_ASSETS } from "../../mock/hc-assets.js";
import { initWorkloadBrowser, initWorkloadBrowserWindowAPI } from "./workload-browser.js";
import { initCompactStatus } from "./compact-status.js";

const createPortal = (node, host) => ReactDOM.createPortal(node, host);

// home-screen 装配层
// StoryRenderer 统一管理 story 状态驱动的全页联动
export default function HomeScreen() {
  useFitScale();
  useHealthMetrics();
  useLinkedEvent();

  return (
    <>
      <SlotPortal slotId="home-metrics">
        <MetricRibbon onChange={(cat, idx) => window.showWorkloads?.(cat, idx)} />
      </SlotPortal>
      <StoryRenderer />
      <TicksSlot />
      <InitEffects />
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
    initWorkloadBrowser();
    initWorkloadBrowserWindowAPI();
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
