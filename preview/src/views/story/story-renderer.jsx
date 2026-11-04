import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { HC_ASSETS } from "../../mock/hc-assets.js";
import { HOME_WORKLOADS } from "../../mock/workloads.js";
import StoryGuardPanelContainer from "./story-guard-container.jsx";
import TimelineMarkers from "./timeline-markers.jsx";

const createPortal2 = (node, host) => ReactDOM.createPortal(node, host);

const STORY_COPY = {
  optical: ["", "发现链路闪断告警", "30条告警聚合，生成链路闪断 issue", "正在分析链路指标与设备日志", "定位根因：光链路脏污", "优雅隔离异常链路", "光链路待清污", "链路复核完成，已清污", "关闭光链路清污待办", "光链路隔离已取消"],
  qwen: ["", "发现 Qwen-1.5B 服务劣化告警", "定位 D实例01 异常退出", "无可替换节点，自动恢复受阻", "分析 BMC、OS 与 vmcore 日志", "定位根因：hinic3 网卡驱动版本过低", "服务劣化，待人工升级网卡驱动", "人工已确认，正在升级网卡驱动", "驱动已升级，正在核查节点与服务健康", "网卡升级与健康核查通过，服务恢复并闭环"],
};
const NAMES = { optical: "光链路脏污，待清污", qwen: "Qwen-1.5B服务劣化：网卡驱动版本低，待升级" };

export const HCEventTitle = (key, p) =>
  p === 6 ? NAMES[key]
  : key === "qwen" && p >= 7 ? "网卡升级与服务恢复"
  : key === "qwen" && p >= 4 ? "网卡驱动故障诊断"
  : STORY_COPY[key]?.[1] || NAMES[key];

const stateOf = (p) => (p === 9 ? "closed" : p === 6 ? "manual" : "auto");

// 设置全局变量（HCStoryCopy / HCEventTitle）
window.HCStoryCopy = STORY_COPY;
window.HCEventTitle = HCEventTitle;

// TimeNowSlot —— 时间轴当前时间标记（直接更新已有 <b> 的文本，不 portal）
function TimeNowSlot({ storyState }) {
  useEffect(() => {
    const b = document.querySelector(".time-now b");
    if (b) b.textContent = window.HCClock?.format(600) || "12:00:00";
  }, [storyState]);
  return null;
}

// HealthMetricsSlot —— 健康指标数字
function HealthMetricsSlot({ storyState }) {
  const s = storyState || { optical: 0, qwen: 0 };
  const deviceLocated = s.qwen >= 5 && s.qwen < 9;
  const pendingCount = ["optical", "qwen"].filter((k) => s[k] >= 6 && s[k] < 9).length;
  const totalItems = 12 + Number(s.optical > 0) + Number(s.optical >= 6) + Number(s.qwen > 0);
  return (
    <>
      <CabinetVisible className="cabinet-fault-link" visible={s.optical > 0 && s.optical < 9} />
      <CabinetVisible className="cabinet-red" visible={deviceLocated} />
    </>
  );
}

// CabinetVisible —— 控制机柜图上的故障连线/红色标记的显隐
function CabinetVisible({ className, visible }) {
  useEffect(() => {
    const el = document.querySelector("." + className);
    if (el) el.hidden = !visible;
  }, [className, visible]);
  return null;
}

// FaultTips —— 故障提示气泡（从 render.js 提取，改为 React 管理）
function FaultTip({ eventKey, phase, state, deviceLocated }) {
  const deviceLocatedOk = eventKey !== "qwen" || deviceLocated;
  if (state === "closed" || phase >= 9 || !deviceLocatedOk) return null;
  const title = HCEventTitle(eventKey, phase);
  const isOptical = eventKey === "optical";
  return (
    <div className={"hc-fault-tip " + (state === "auto" ? "auto" : "manual") + " " + eventKey}>
      {state !== "auto" && <img className="hc-icon" src={HC_ASSETS.icons["红色的故障"]} alt="" width={14} />}
      <span>{title}</span>
      {state === "auto" ? (
        <>
          <i className="hc-flow-halo"><i /></i>
          <i className="hc-flow-base" />
          <i className="hc-flow-ring" />
          <span className="fault-status-flags" aria-label={eventKey === "qwen" ? "自动处理中，影响业务" : "自动处理中"}>
            <span className="tip-auto-state">◌</span>
            {eventKey === "qwen" && <b className="business-impact-symbol" aria-label="影响业务">✱</b>}
            <span className="tip-state-label">自动处理中</span>
            {eventKey === "qwen" && <span className="tip-impact-label">影响业务</span>}
          </span>
        </>
      ) : (
        <span className="fault-status-flags" aria-label={eventKey === "qwen" ? "待人工处理，影响业务" : "待人工处理"}>
          <img src={HC_ASSETS.icons["红色小手"]} alt="待人工处理" />
          {eventKey === "qwen" && <b className="business-impact-symbol" aria-label="影响业务">✱</b>}
          <span className="tip-state-label">待人工处理</span>
          {eventKey === "qwen" && <span className="tip-impact-label">影响业务</span>}
        </span>
      )}
      <small className="hc-tip-device">
        {isOptical ? "计算柜11 · L1交换板02" : "计算柜13 · 112.34.23.1 · CPU02"}
      </small>
      <div className="hc-tip-detail">
        <strong>{title}</strong>
        <p>故障对象：{isOptical ? "计算柜11 · L1交换板02" : "计算柜13 · 112.34.23.1 · CPU02"}</p>
        <p>
          {isOptical
            ? phase >= 5 ? "光模块端面脏污，异常链路已优雅隔离，健康通道承载业务" : "检测到光链路闪断，正在分析链路指标与设备日志"
            : "hinic3 驱动版本 V11.8，需升级至 V13.1；无可替换节点，Qwen-1.5B 服务劣化"}
        </p>
        <p>当前状态：{state === "manual" ? "待人工处理" : "自动处理中"}</p>
        <p>点击查看处理详情</p>
      </div>
    </div>
  );
}

function FaultTipsContainer({ storyState }) {
  const [host, setHost] = useState(null);
  useEffect(() => setHost(document.getElementById("home-tips")), []);
  if (!host) return null;
  const s = storyState || { optical: 0, qwen: 0, startedAt: 0 };
  const deviceLocated = s.qwen >= 5 && s.qwen < 9;
  const eventKeys = ["optical", "qwen"].filter((k) => s[k] > 0 && s[k] < 9);
  return createPortal2(
    <>
      {eventKeys.map((key) => {
        const p = s[key];
        const state = stateOf(p);
        if (key === "qwen" && !deviceLocated) return null;
        return <FaultTip key={key + "-" + s.startedAt} eventKey={key} phase={p} state={state} deviceLocated={deviceLocated} />;
      })}
    </>,
    host
  );
}

// MetricSync —— 把 story 状态同步到指标条数字（通过 DOM 更新 MetricRibbon）
function MetricSync({ storyState }) {
  useEffect(() => {
    const s = storyState || { optical: 0, qwen: 0 };
    const deviceLocated = s.qwen >= 5 && s.qwen < 9;
    const active = 2 + Number(s.optical > 0 && s.optical < 9) + Number(deviceLocated);
    updateMetricText("resource", 0, String(active));
    for (const category of ["training", "inference"]) {
      const data = window.storyWorkloads ? window.storyWorkloads(category) : HOME_WORKLOADS[category];
      const statuses = ["interrupted", "stuck", "degraded", "normal"];
      statuses.forEach((status, i) => updateMetricText(category, i + 1, String(data.filter((x) => x.status === status).length)));
      updateMetricText(category, 0, String(data.length));
    }
    // 健康指标
    const health = document.querySelector(".health-metrics .row-value p");
    if (health) {
      const pending = ["optical", "qwen"].filter((k) => s[k] >= 6 && s[k] < 9).length;
      health.firstChild.textContent = (2 + pending) + " ";
      const small = health.querySelector("small");
      if (small) small.textContent = "/ " + (12 + Number(s.optical > 0) + Number(s.optical >= 6) + Number(s.qwen > 0)) + "项";
    }
    const healthRow2 = document.querySelector(".health-row:nth-child(2) .row-value p");
    if (healthRow2) healthRow2.firstChild.textContent = "0 ";
    // screen dataset
    const screen = document.getElementById("screen");
    if (screen) {
      screen.dataset.storyOptical = s.optical;
      screen.dataset.storyQwen = s.qwen;
    }
  }, [storyState]);
  return null;
}

function updateMetricText(category, index, value) {
  const g = document.querySelector('.hc-metric-group[data-category="' + category + '"]');
  if (!g) return;
  const b = g.querySelectorAll(".hc-metric-content>b")[index];
  if (b && b.firstChild) b.firstChild.textContent = value;
  if (category === "resource" && index === 0) {
    const compact = g.querySelector(".hc-metric-compact b");
    if (compact) compact.textContent = value;
  }
}

// StoryEventDispatcher —— 派发 story 事件给非 React 模块
function StoryEventDispatcher({ storyState }) {
  useEffect(() => {
    window.updateCompactStatusIcons?.();
    window.updateStoryRecords?.((rows) => {
      const s = storyState || { optical: 0, qwen: 0 };
      const records = rows.filter((r) => r.action !== "qwen" && (r.action !== "link" || s.optical > 0)).map((r) => {
        if (r.action === "link") {
          const status = stateOf(s.optical);
          r.stateClass = status === "closed" ? "human-closed" : status === "manual" ? "manual" : "processing";
          r.state = { processing: "自动处理中", manual: "待人工处理", "human-closed": "已闭环" }[r.stateClass];
          r.clear = status === "closed" ? "今天 19:19:30" : "—";
          r.start = "今天 12:00:40";
          if (status !== "manual") r.name = "光链路脏污";
        }
        return r;
      });
      if (s.optical > 0) {
        records.push({
          name: "光链路脏污，已自动优雅隔离",
          state: s.optical >= 6 ? "已闭环" : "自动处理中",
          stateClass: s.optical >= 6 ? "auto-closed" : "processing",
          type: "故障", object: "计算柜11-L1交换板02",
          root: "优雅隔离异常链路；清污待办转交人工处理",
          start: "今天 12:00:00", clear: s.optical >= 6 ? "今天 12:00:48" : "—", action: "link-auto",
        });
      }
      if (s.qwen > 0) {
        const status = stateOf(s.qwen);
        const stateClass = status === "closed" ? "human-closed" : status === "manual" ? "manual" : "processing";
        records.unshift({
          name: status === "closed" ? "网卡驱动升级完成，Qwen-1.5B服务已恢复" : "网卡驱动版本低导致Qwen-1.5B服务劣化",
          state: { processing: "自动处理中", manual: "待人工处理", "human-closed": "已闭环" }[stateClass],
          stateClass, type: "故障", object: "112.34.23.1 · CPU02 / Qwen-1.5B",
          root: s.qwen >= 5 ? "hinic3 驱动版本低；无可替换节点，需人工升级至V13.1" : "正在诊断业务故障",
          start: "今天 12:05:12", clear: status === "closed" ? "今天 12:06:35" : "—", action: "qwen",
        });
      }
      return records;
    });
    if (!document.getElementById("home-workloads")?.hidden) window.refreshWorkloadCards?.();
    // 派发 hc-story-change 事件
    window.dispatchEvent(new CustomEvent("hc-story-change", { detail: storyState }));
  }, [storyState]);
  return null;
}

// BrandReset —— 品牌重置按钮
function BrandReset() {
  useEffect(() => {
    const brand = document.querySelector("#home-header button");
    if (!brand) return;
    const handleClick = () => {
      window.HCClock?.reset();
      window.resetOpticalEvent?.();
      window.resetNicEvent?.();
      const guardAll = document.getElementById("guard-all");
      if (guardAll) guardAll.hidden = true;
      const ribbon = document.querySelector("#home-metrics .hc-ribbon");
      ribbon?.activate?.("resource", 0, true);
      window.HCStory?.start();
      window.restartMascotEntrance?.();
    };
    brand.addEventListener("click", handleClick);
    brand.title = "重新演示";
    return () => brand.removeEventListener("click", handleClick);
  }, []);
  return null;
}

// StoryLoadTrigger —— window load 时启动 story
function StoryLoadTrigger() {
  useEffect(() => {
    const start = () => window.HCStory?.start();
    if (document.readyState === "complete") setTimeout(start, 0);
    else window.addEventListener("load", start, { once: true });
    return () => window.removeEventListener("load", start);
  }, []);
  return null;
}

// RunModeSync —— 运行模式切换（select 可能晚于本组件渲染，MutationObserver 等待）
function RunModeSync() {
  useEffect(() => {
    let bound = false;
    let cleanup = null;
    const bind = (select) => {
      if (bound) return;
      bound = true;
      const handleChange = (e) => {
        document.documentElement.dataset.runMode = e.target.value;
      };
      select.addEventListener("change", handleChange);
      cleanup = () => select.removeEventListener("change", handleChange);
    };
    const el = document.querySelector("#home-header select");
    if (el) {
      bind(el);
    } else {
      const obs = new MutationObserver(() => {
        const found = document.querySelector("#home-header select");
        if (found) {
          obs.disconnect();
          bind(found);
        }
      });
      obs.observe(document.body, { childList: true, subtree: true });
      cleanup = () => obs.disconnect();
    }
    return () => cleanup?.();
  }, []);
  return null;
}

// OpticalCompleteBridge —— 光链路完成桥接
function OpticalCompleteBridge() {
  useEffect(() => {
    const handler = () => window.HCStory?.complete("optical");
    window.addEventListener("hc-optical-complete", handler);
    return () => window.removeEventListener("hc-optical-complete", handler);
  }, []);
  return null;
}

// StoryRenderer —— 顶层组件：订阅 HCStory，派发状态给所有子组件
// 替代 render.js 中 render(s) 的全部功能
export default function StoryRenderer() {
  const [storyState, setStoryState] = useState(() => window.HCStory?.get() || { optical: 0, qwen: 0, startedAt: 0 });

  useEffect(() => {
    const unsubscribe = window.HCStory?.subscribe((s) => setStoryState(s));
    return () => { unsubscribe?.(); };
  }, []);

  return (
    <>
      <StoryGuardPanelContainer />
      <TimelineMarkers />
      <TimeNowSlot storyState={storyState} />
      <FaultTipsContainer storyState={storyState} />
      <HealthMetricsSlot storyState={storyState} />
      <MetricSync storyState={storyState} />
      <StoryEventDispatcher storyState={storyState} />
      <BrandReset />
      <StoryLoadTrigger />
      <RunModeSync />
      <OpticalCompleteBridge />
    </>
  );
}
