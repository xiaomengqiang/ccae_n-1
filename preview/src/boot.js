import { initEvidenceOrig } from "./views/evidence/legacy.js";
import { initMotionRuntime } from "./shared/motion-runtime.js";
import { initHCComponents } from "./shared/hc-components.js";
import { initClock } from "./utils/clock.js";
import { initHomeScreen } from "./views/home-screen/legacy.js";
import { initEnhancements } from "./views/home-screen/enhancements.js";
import { initOpticalEvent } from "./views/optical-event/legacy.js";
import { initStory } from "./views/story/legacy.js";
import { initEnergyDetail } from "./views/energy-detail/legacy.js";

export function runBoot() {
  initEvidenceOrig();
  initMotionRuntime();
  initHCComponents();
  initClock();
  initHomeScreen();
  initEnhancements();
  initOpticalEvent();
  initStory();
  initEnergyDetail();
}
