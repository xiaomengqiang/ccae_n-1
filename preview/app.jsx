import { useEffect, useState } from "react";
import AgentPanel from "./src/views/agent-panel/index.jsx";
import EnergyDetail from "./src/views/energy-detail/index.jsx";
import GuardEventsTable from "./src/views/guard-events-table/index.jsx";
import HomeScreen from "./src/views/home-screen/index.jsx";
import WorkloadBrowser from "./src/views/home-screen/workload-browser.jsx";
import NicEvent from "./src/views/nic-event/index.jsx";
import OpticalEvent from "./src/views/optical-event/index.jsx";
import RoomOverview from "./src/views/room-overview/index.jsx";
import { SCREEN_ATTRS, SKELETON_INNER } from "./src/constants/screen-skeleton.js";
// 共享引擎副作用注册（模块顶层 window 挂载，供命令式引擎消费方使用）：
// HCMotion（动效）/ HCEvidence（取证规则引擎）/ HCStory（故事状态机）/
// HCOpticalFlow（流光动画）/ HCClock（业务时钟）
import "./src/utils/motion-runtime.js";
import "./src/utils/evidence.js";
import "./src/utils/story-state.js";
import "./src/utils/enhancement-animations.js";
import "./src/utils/clock.js";
import "./src/styles/legacy.css";
// energy-detail 页面专属样式（自 legacy.css 抽出）；必须排在其后引入，保持原层叠顺序
import "./src/views/energy-detail/energy-detail.css";

export default function App() {
  const [booted, setBooted] = useState(false);
  useEffect(() => { setBooted(true); }, []);
  return (
    <>
      <main
        id={SCREEN_ATTRS.id}
        className={SCREEN_ATTRS.class}
        aria-label={SCREEN_ATTRS["aria-label"]}
        dangerouslySetInnerHTML={{ __html: SKELETON_INNER }}
      />
      {booted && (
        <>
          <HomeScreen />
          <WorkloadBrowser />
          <AgentPanel />
          <GuardEventsTable />
          <EnergyDetail />
          <NicEvent />
          <OpticalEvent />
          <RoomOverview />
        </>
      )}
    </>
  );
}
