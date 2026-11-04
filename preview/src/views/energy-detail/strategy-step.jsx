// strategy-step.jsx —— “节能机会识别并下发策略”的子步骤
// 每步为 details.hc-energy-step；激活步骤带打字机逐字显示，完成步骤挂接 HCEvidence 证据链
import { useEffect, useRef } from "react";
import { time } from "../../shared/energy-state.js";
import { HC_ASSETS } from "../../mock/hc-assets.js";
import { REPORT_ICONS } from "./charts.jsx";
import { getCurrent } from "./session-store.js";

export const STEP_NAMES = ["节能机会识别", "生成节能策略", "方案决策", "方案下发"];

export function StepIcon({ status }) {
  if (status === "done") return <img className="hc-energy-step-icon" src={HC_ASSETS.icons["对勾"]} alt="" aria-label="已完成" />;
  return (
    <i
      className={"hc-energy-step-icon " + (status === "working" ? "hc-energy-loading" : "hc-energy-step-pending")}
      aria-label={status === "working" ? "自动处理中" : "待执行"}
    />
  );
}

// 策略预测卡片（均衡/深度节能/性能优先三档对比）
function StrategyForecast({ title, gain, s, recommended = false }) {
  // 策略预测采用同一服务基线，演示不同模式下的能耗与时延取舍。
  const data = s.data, ratio = title === "深度节能" ? 1.04 : title === "性能优先" ? .97 : 1;
  const daily = (parseFloat(data.energyTotal) * (1 - parseFloat(gain) / 100)).toFixed(2) + " kWh";
  const rows = [
    ["预测单日能耗", daily],
    ["预测节能增益", gain],
    ["预测TTFT", (parseFloat(data.ttft) * ratio).toFixed(1) + " ms"],
    ["预测TPOT", (parseFloat(data.tpot) * ratio).toFixed(1) + " ms"],
  ];
  return (
    <div className={"hc-energy-strategy hc-energy-forecast" + (recommended ? " recommended" : "")}>
      <h3>{title}</h3>
      <dl>
        {rows.map(([k, v], index) => {
          const direction = index === 0 ? "down" : index === 1 ? "up" : ratio > 1 ? "up" : ratio < 1 ? "down" : "flat";
          const main = v.split(" ↑ ")[0], tail = v.includes(" ↑ ") ? v.split(" ↑ ")[1] : "";
          return (
            <div key={k}>
              <dt>{k}</dt>
              <dd>
                {main}
                <small className="hc-energy-delta">
                  <img
                    className="hc-energy-change-arrow"
                    src={REPORT_ICONS["good-arrow"]}
                    alt={direction === "down" ? "下降" : direction === "up" ? "上升" : "持平"}
                    style={{
                      transform: direction === "down" ? "rotate(180deg)" : direction === "flat" ? "rotate(90deg)" : "",
                      filter: index > 1 && ratio > 1 ? "hue-rotate(230deg)" : "",
                    }}
                  />
                  {tail}
                </small>
              </dd>
            </div>
          );
        })}
      </dl>
      <div className="hc-energy-strategy-art">
        <img src={REPORT_ICONS["strategy-" + (title === "深度节能" ? 2 : title === "性能优先" ? 3 : 1)]} alt="" />
      </div>
    </div>
  );
}

export default function StrategyStep({ s, i }) {
  const ref = useRef(null);
  const status = i < s.stage ? "done" : i === s.stage ? "working" : "waiting";

  // 打字机：步骤激活时逐字显示（每会话每步只跑一次，面板关闭/切换时放弃）
  useEffect(() => {
    const d = ref.current;
    if (!d || !(i === s.stage && s.stage < 4)) return;
    s.typedSteps ||= new Set();
    if (s.typedSteps.has(i)) return;
    s.typedSteps.add(i);
    const walker = document.createTreeWalker(d, NodeFilter.SHOW_TEXT), parts = [];
    while (walker.nextNode()) {
      const node = walker.currentNode;
      if (node.textContent.trim() && !node.parentElement.closest("time,.hc-energy-state")) parts.push({ node, text: node.textContent });
    }
    let total = 0;
    parts.forEach((p) => { p.offset = total; total += p.text.length; });
    // 面板与其装饰只在各自的文案开始显示时才出现
    const gates = [...d.querySelectorAll("summary,p,.hc-energy-strategy,.hc-energy-strategy dl>div,img,.hc-energy-step-icon")].map((node) => {
      const host = node.matches("img,.hc-energy-step-icon") ? (node.closest("summary,dd,.hc-energy-strategy") || node.parentElement) : node;
      const first = parts.find((p) => host.contains(p.node));
      return { node, offset: first?.offset ?? total, visibility: node.style.visibility };
    });
    gates.forEach((g) => { g.node.style.visibility = "hidden"; });
    parts.forEach((p) => { p.node.textContent = ""; });
    let start;
    const reveal = (now) => {
      if (!d.isConnected || d.closest("#hc-energy-root")?.hidden || getCurrent() !== s) { s.typedSteps.delete(i); return; }
      start ??= now;
      const shown = Math.floor(Math.min(1, (now - start) / 2400) * total);
      gates.forEach((g) => { g.node.style.visibility = shown > g.offset || shown === total ? g.visibility : "hidden"; });
      let remaining = shown;
      for (const p of parts) { p.node.textContent = p.text.slice(0, Math.max(0, remaining)); remaining -= p.text.length; }
      if (now - start < 2400) requestAnimationFrame(reveal);
    };
    requestAnimationFrame(reveal);
  }, [s.stage]);

  // 证据链：步骤完成后在 summary 后挂接 HCEvidence（重挂前先移除旧块）
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    d.querySelector(":scope > .evt-diagnostic-operations")?.remove();
    if (i < s.stage) window.HCEvidence?.attach(d, STEP_NAMES[i], true);
  }, [s.stage, i]);

  return (
    <details className="hc-energy-step" data-state={status} open ref={ref}>
      <summary onClick={(e) => e.preventDefault()}>
        <StepIcon status={status} />
        {STEP_NAMES[i]}
        <time className="hc-energy-step-time">{time(i * 4, s.base)}</time>
        <span className={"hc-energy-state " + status}>{i < s.stage ? "已完成" : i === s.stage ? "自动处理中" : "待执行"}</span>
      </summary>
      {i === 0 && <p>识别到请求存在如下特征：凌晨 1 点到 6 点请求量较低，最低 0.1 次/秒，符合轻度负载特征</p>}
      {i === 1 && (
        <>
          <StrategyForecast title="均衡模式" gain="11.3% ↑ 4.8%" s={s} recommended />
          <StrategyForecast title="深度节能" gain="14.8% ↑ 8.3%" s={s} />
          <StrategyForecast title="性能优先" gain="9.1% ↑ 2.6%" s={s} />
        </>
      )}
      {i === 2 && (
        <>
          <p>均衡模式满足业务性能约束，按以下配置自动执行</p>
          <div className="hc-energy-strategy hc-energy-config">
            <h3>节能策略配置</h3>
            <dl>
              <div><dt>优先模式</dt><dd>均衡模式</dd></div>
              <div><dt>执行方式</dt><dd>自动下发</dd></div>
            </dl>
          </div>
        </>
      )}
      {i === 3 && (
        <p>{i < s.stage ? "已向目标服务器下发均衡模式配置，开启运行态节能，并与空闲态策略协同运行" : "向目标服务器下发均衡模式配置，开启运行态节能，并与空闲态策略协同运行"}</p>
      )}
    </details>
  );
}
