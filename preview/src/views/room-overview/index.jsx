import { useEffect, useRef, useState } from "react";
import { HC_ASSETS } from "../../mock/hc-assets.js";

const createPortal = (node, host) => ReactDOM.createPortal(node, host);

const SCENE_SRC = "./assets/scenes/multi-cabinet-scene.html";

function sendStateTo(frame) {
  const story = window.HCStory;
  if (!story || !frame) return;
  const state = story.get();
  frame.contentWindow?.postMessage({
    type: "ccae-story-state",
    state: {
      ...state,
      titles: Object.fromEntries(["optical", "qwen"].map((k) => [k, window.HCEventTitle(k, state[k])])),
      hand: HC_ASSETS.icons["红色小手"],
    },
  }, "*");
}

export default function RoomOverview() {
  const [host, setHost] = useState(null);
  useEffect(() => setHost(document.getElementById("screen")), []);
  if (!host) return null;
  return createPortal(<RoomOverviewBody />, host);
}

function RoomOverviewBody() {
  const frameRef = useRef(null);
  const [overview, setOverview] = useState(true);
  const [selection, setSelection] = useState({ fault: true, normal: false });
  const [category, setCategory] = useState(() => document.getElementById("screen")?.dataset.category);
  const resource = category !== "training" && category !== "inference";

  useEffect(() => {
    const id = setTimeout(() => {
      if (frameRef.current) frameRef.current.src = SCENE_SRC;
    }, 300);
    return () => clearTimeout(id);
  }, []);

  useEffect(() => {
    const send = () => sendStateTo(frameRef.current);
    const unsubscribe = window.HCStory?.subscribe(send);
    const frame = frameRef.current;
    frame?.addEventListener("load", send);
    return () => {
      unsubscribe?.();
      frame?.removeEventListener("load", send);
    };
  }, []);

  useEffect(() => {
    const screen = document.getElementById("screen");
    const obs = new MutationObserver(() => setCategory(screen.dataset.category));
    obs.observe(screen, { attributes: true, attributeFilter: ["data-category"] });
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const onMessage = (e) => {
      const frame = frameRef.current;
      if (!frame || e.source !== frame.contentWindow) return;
      const data = e.data || {};
      if (data.type === "ccae-device-filter") {
        setSelection((prev) => ({ ...prev, ...data.selection }));
      } else if (data.type === "ccae-room-fullscreen") {
        if (document.fullscreenElement) document.exitFullscreen();
        else frame.parentElement?.requestFullscreen?.().catch(() => { });
      } else if (data.type === "ccae-room-ready") {
        sendStateTo(frame);
      } else if (data.type === "ccae-room-enter" && data.index === 0) {
        setOverview(false);
      }
    };
    addEventListener("message", onMessage);
    return () => removeEventListener("message", onMessage);
  }, []);

  useEffect(() => {
    const screen = document.getElementById("screen");
    screen.classList.toggle("cabinet-hide-normal", !selection.normal);
    screen.classList.toggle("cabinet-hide-fault", !selection.fault);
  }, [selection]);

  useEffect(() => {
    const screen = document.getElementById("screen");
    const showRoom = overview && resource;
    screen.classList.toggle("room-overview-active", showRoom);
    screen.classList.toggle("room-detail-active", !overview && resource);
    frameRef.current?.contentWindow?.postMessage({ type: "ccae-room-visible", visible: showRoom }, "*");
  }, [overview, resource]);

  const onLegendChange = (e) => {
    const key = e.target.dataset.state;
    const next = { ...selection, [key]: e.target.checked };
    setSelection(next);
    frameRef.current?.contentWindow?.postMessage({ type: "ccae-device-filter", selection: next }, "*");
  };

  const onLocate = (ev) => {
    ev.preventDefault();
    const q = ev.target.querySelector("input").value.trim();
    setOverview(true);
    frameRef.current?.contentWindow?.postMessage({ type: "ccae-room-locate", query: q }, "*");
  };

  return (
    <>
      <section id="home-room-overview" aria-label="多机柜总览" hidden={!overview || !resource}>
        <iframe ref={frameRef} title="3D 多机柜总览" sandbox="allow-scripts" />
      </section>
      <div id="home-room-back" hidden={overview || !resource}>
        <nav aria-label="机柜层级">
          <button type="button" onClick={() => setOverview(true)}>上海推理模型B5集群</button>
          <span aria-hidden="true">›</span>
          <strong aria-current="page">超节点 A</strong>
        </nav>
        <form onSubmit={onLocate}>
          <label>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="10" cy="10" r="6" />
              <path d="m15 15 6 6" />
            </svg>
            <input aria-label="定位柜位" placeholder="定位柜位，如 A-03 / 超节点 A" />
          </label>
        </form>
      </div>
      <div id="cabinet-device-legend" hidden={overview || !resource}>
        <span>设备状态</span>
        <label>
          <input type="checkbox" data-state="fault" checked={selection.fault} onChange={onLegendChange} />
          <i className="fault" />故障
        </label>
        <label>
          <input type="checkbox" data-state="normal" checked={selection.normal} onChange={onLegendChange} />
          <i className="normal" />正常
        </label>
      </div>
    </>
  );
}
