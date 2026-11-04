import "./shared/motion-runtime.js";
import "./shared/evidence.js";
import "./shared/story-state.js";
import "./shared/enhancement-animations.js";
import "./utils/clock.js";
import { mountOpticalEvent } from "./views/optical-event/event.js";
import { mountStoryRender } from "./views/story/render.js";

export function runBoot() {
  mountOpticalEvent();
  mountStoryRender();
}
