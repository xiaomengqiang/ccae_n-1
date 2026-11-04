import { useEffect, useState } from "react";
import { runBoot } from "./src/boot.js";
import AgentPanel from "./src/views/agent-panel/index.jsx";
import EnergyDetail from "./src/views/energy-detail/index.jsx";
import GuardEventsTable from "./src/views/guard-events-table/index.jsx";
import HomeScreen from "./src/views/home-screen/index.jsx";
import NicEvent from "./src/views/nic-event/index.jsx";
import OpticalEvent from "./src/views/optical-event/index.jsx";
import RoomOverview from "./src/views/room-overview/index.jsx";
import { SCREEN_ATTRS, SKELETON_INNER } from "./src/legacy/screen-skeleton.js";
import "./src/styles/legacy.css";
// energy-detail 页面专属样式（自 legacy.css 抽出）；必须排在其后引入，保持原层叠顺序
import "./src/views/energy-detail/energy-detail.css";

export default function App() {
  const [booted, setBooted] = useState(false);
  useEffect(() => {
    runBoot();
    setBooted(true);
  }, []);
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
