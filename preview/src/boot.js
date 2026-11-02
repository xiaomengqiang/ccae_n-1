import { initEvidenceOrig } from "./views/evidence/legacy.js";
import { initMotionRuntime } from "./shared/motion-runtime.js";
import { initHCComponents } from "./shared/hc-components.js";
import { initClock } from "./utils/clock.js";
import { initHomeScreen } from "./views/home-screen/legacy.js";
import { initGuardEventsTable } from "./views/guard-events-table/legacy.js";
import { initEnhancements } from "./views/home-screen/enhancements.js";
import { initOpticalEvent } from "./views/optical-event/legacy.js";
import { initNicEvent } from "./views/nic-event/legacy.js";
import { initStory } from "./views/story/legacy.js";
import { initAgentPanel } from "./views/agent-panel/legacy.js";
import { initEnergyDetail } from "./views/energy-detail/legacy.js";
import { initRoomOverview } from "./views/room-overview/legacy.js";

export function runBoot() {
  initEvidenceOrig();
  initMotionRuntime();
  initHCComponents();
  initClock();
  initHomeScreen();
  initGuardEventsTable();
  initEnhancements();
  initOpticalEvent();
  initNicEvent();
  initStory();
  initAgentPanel();
  initEnergyDetail();
  initRoomOverview();
}
