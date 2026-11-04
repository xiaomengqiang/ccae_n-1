import { useEffect, useRef, useState } from "react";
import { HC_ASSETS } from "../../mock/hc-assets.js";

const createPortal = (node, host) => ReactDOM.createPortal(node, host);

const SCENE_SRC = "./assets/scenes/multi-cabinet-scene.html";
const RED_HAND_SVG = "PHN2ZyB2aWV3Qm94PSIwIDAgMTQgMTQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHdpZHRoPSIxNC4wMDAwMDAiIGhlaWdodD0iMTQuMDAwMDAwIiBmaWxsPSJub25lIj4KCTxyZWN0IGlkPSJpY19pY3RfYWlfY29tbWFuZHNfZmlsZSIgd2lkdGg9IjE0LjAwMDAwMCIgaGVpZ2h0PSIxNC4wMDAwMDAiIHg9IjAuMDAwMDAwIiB5PSIwLjAwMDAwMCIgLz4KCTxyZWN0IGlkPSLnn6nlvaIgNTUzNDIxIiB3aWR0aD0iMTQuMDAwMDAwIiBoZWlnaHQ9IjE0LjAwMDAwMCIgeD0iMC4wMDAwMDAiIHk9IjAuMDAwMDAwIiBmaWxsPSJyZ2IoMjUsMjUsMjUpIiBmaWxsLW9wYWNpdHk9IjAiIC8+Cgk8cGF0aCBpZD0icGF0aDUiIGQ9Ik03LjA3OTc4IDguMjU2NTdDNy4xMDc3NSA4LjI2MzcgNy4xMzcwMiA4LjI1MTEzIDcuMTUxMSA4LjIyNTkzTDcuODU1MyA2Ljk2NjA1QzguMTAyOTcgNi41MjI5NSA4LjY1ODAyIDYuMzU3MDMgOS4xMDgyMyA2LjU5MTUxQzkuNTU5NTIgNi44MjY1NCA5Ljc0NDMgNy4zNzYyNyA5LjUyNjYgNy44MzYxOEw4LjUyMjA2IDkuOTU4MzNDNy43Mjk5NCAxMi4wNTQ4IDYuMDI1ODEgMTMuMzk0OSA0LjE1MjAzIDEzLjM5NDlMMy43NzkyMyAxMy4zOTQ5QzEuODc2OTcgMTMuMzk0OSAwIDExLjQ5MTEgMCA5LjE0MjU4TDAgNi4zNzg1NEwwIDMuMzA0ODhDMCAyLjg4ODc2IDAuMzM3MzM4IDIuNTUxNDIgMC43NTM0NjUgMi41NTE0MkMxLjE2OTU5IDIuNTUxNDIgMS41MDY5MyAyLjg4ODc2IDEuNTA2OTMgMy4zMDQ4OEwxLjUwNjkzIDYuMjExMTFDMS41MDY5MyA2LjMwMzU4IDEuNTgxOSA2LjM3ODU0IDEuNjc0MzcgNi4zNzg1NEMxLjc2Njg0IDYuMzc4NTQgMS44NDE4IDYuMzAzNTggMS44NDE4IDYuMjExMTFMMS44NDE4IDEuNjAzOTRDMS44NDE4IDEuMTg3ODEgMi4xNzkxNCAwLjg1MDQ3MyAyLjU5NTI3IDAuODUwNDczQzMuMDExNCAwLjg1MDQ3MyAzLjM0ODc0IDEuMTg3ODEgMy4zNDg3NCAxLjYwMzk0TDMuMzQ4NzQgNS4zNjA2NEMzLjM0ODc0IDUuNDUzMTEgMy40MjM3IDUuNTI4MDcgMy41MTYxNyA1LjUyODA3QzMuNjA4NjUgNS41MjgwNyAzLjY4MzYxIDUuNDUzMTEgMy42ODM2MSA1LjM2MDY0TDMuNjgzNjEgMC43NTM0NjZDMy42ODM2MSAwLjMzNzMzOCA0LjAyMDk1IDcuNjQ0MTRlLTE3IDQuNDM3MDcgMS4yOTkxM2UtMzJDNC44NTMyIC03LjY0NDE0ZS0xNyA1LjE5MDU0IDAuMzM3MzM4IDUuMTkwNTQgMC43NTM0NjZMNS4xOTA1NCA1LjM2MDY0QzUuMTkwNTQgNS40NTMxMSA1LjI2NTUgNS41MjgwNyA1LjM1Nzk4IDUuNTI4MDdDNS40NTA0NSA1LjUyODA3IDUuNTI1NDEgNS40NTMxMSA1LjUyNTQxIDUuMzYwNjRMNS41MjU0MSAxLjYwMzk0QzUuNTI1NDEgMS4xODc4MSA1Ljg2Mjc1IDAuODUwNDczIDYuMjc4ODggMC44NTA0NzNDNi42OTUwMSAwLjg1MDQ3MyA3LjAzMjM0IDEuMTg3ODEgNy4wMzIzNCAxLjYwMzk0TDcuMDMyMzQgOC4xOTU1MkM3LjAzMjM0IDguMjI0MzIgNy4wNTE4NyA4LjI0OTQ1IDcuMDc5NzggOC4yNTY1N1oiIGZpbGw9InJnYigyMzEsNjcsNzQpIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiIHRyYW5zZm9ybT0ibWF0cml4KC0xLDAsMCwxLDExLjM0NCwwLjMwMjczNCkiIC8+Cjwvc3ZnPgo=";
const RED_HAND_DATA_URI = "data:image/svg+xml;base64," + RED_HAND_SVG;

function sendStateTo(frame) {
  const story = window.HCStory;
  if (!story || !frame) return;
  const state = story.get();
  frame.contentWindow?.postMessage({
    type: "ccae-story-state",
    state: {
      ...state,
      titles: Object.fromEntries(["optical", "qwen"].map((k) => [k, window.HCEventTitle(k, state[k])])),
      hand: RED_HAND_DATA_URI,
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
        <iframe ref={frameRef} aria-label="3D 多机柜总览" sandbox="allow-scripts" />
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
