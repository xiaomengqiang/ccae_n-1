import { HC_ASSETS } from "../../mock/hc-assets.js";
import Status from "../status/index.jsx";
import FaultTip from "../fault-tip/index.jsx";

// 工作负载卡片（原 hc-components 工厂 WorkloadCard 的 React 版）
// 训练/推理两种布局，字段为绝对定位标签；结构与类名和工厂版逐一对齐 ——
// workload-browser 的 drawList 会命令式更新 .hc-quality/.hc-request-counts
// 的文本节点（firstChild.nodeValue），故这两个标签的文本必须为首子节点。

function Label({ x, y, size = 12, color = "#b3b3b3", className, nowrap, children }) {
  return (
    <span
      className={"hc-label" + (className ? " " + className : "")}
      style={{ position: "absolute", left: x + "px", top: y + "px", fontSize: size + "px", color, whiteSpace: nowrap ? "nowrap" : undefined }}
    >
      {children}
    </span>
  );
}

function ModelIcon({ name }) {
  const key = /qwen|千问/i.test(name) ? "千问" : /deepseek/i.test(name) ? "DeepSeek" : "AI";
  return (
    <img
      className="hc-icon"
      src={HC_ASSETS.icons[key]}
      alt=""
      width={24}
      height={24}
      style={{ position: "absolute", left: "20px", top: "20px", filter: key === "AI" ? "brightness(0) invert(.84)" : undefined }}
    />
  );
}

// 数值单位拆分（TTFT/TPOT/Token 数：'182 ms' → '182 ' + <span class=hc-unit>ms</span>）
function UnitValue({ value }) {
  const match = String(value).match(/^(.*?)\s*(ms|M)$/);
  if (!match) return String(value);
  return (
    <>
      {match[1]} <span className="hc-unit">{match[2]}</span>
    </>
  );
}

export default function WorkloadCard({ kind = "training", status, data = {} }) {
  const inference = kind === "inference";
  const st = status ?? (kind === "training" ? "interrupted" : "degraded");
  const name = data.name ?? (inference ? "Qwen-1.5B 在线服务" : "MoE专家并行实验");
  const guardTotal = data.guardTotal ?? (16 + Array.from(data.name || "").reduce((sum, c) => sum + c.charCodeAt(0), 0) % (inference ? 31 : 29));
  const quality = (inference && Number(data.total) > 0
    ? 100 * Number(data.ok) / Number(data.total)
    : parseFloat(data.quality ?? "99.50")).toFixed(2);

  const headerLabels = inference
    ? [["请求成功率", 52, 60], ["总请求数/成功/失败", 195, 84], ["NPU卡数", 490, 84], ["TTFT", 52, 163], ["TPOT", 195, 163], ["生成Token数", 338, 163], ["待人工处理/守护总数", 490, 163]]
    : [["作业可用度", 53, 60], ["NPU卡数", 245, 84], ["待人工处理/守护总数", 355, 84], ["最近一次中断时间", 505, 84]];

  // 字段红字规则（与工厂版逐字对齐）：训练态 355 列且待人工>0 时整列红字
  const fieldRed = (x) => (!inference && x === 355 && Number(data.pendingManual || 0) !== 0) ||
    (inference && ((x === 560) || (x === 583)));

  const fields = inference
    ? [
        { x: 195, y: 105, red: fieldRed(195), className: "hc-request-counts", children: <>{(data.total ?? "123860") + " / " + (data.ok ?? "123237") + " / "}<span style={{ color: "#e7434a" }}>{data.fail ?? "1623"}</span></> },
        { x: 490, y: 105, red: fieldRed(490), children: String(data.npu ?? "32").replace(/\s*卡$/, "") },
        { x: 52, y: 184, red: fieldRed(52), children: <UnitValue value={data.ttft ?? "182 ms"} /> },
        { x: 195, y: 184, red: fieldRed(195), children: <UnitValue value={data.tpot ?? "23.6 ms"} /> },
        { x: 338, y: 184, red: fieldRed(338), children: <UnitValue value={data.tokens ?? "8.42 M"} /> },
        { x: 490, y: 184, red: fieldRed(490), children: (data.pendingManual ?? (data.processingManual ? 1 : 0)) + " / " + guardTotal },
      ]
    : [
        { x: 245, y: 105, red: fieldRed(245), children: String(data.npu ?? "64") },
        { x: 355, y: 105, red: fieldRed(355), children: (data.pendingManual ?? 0) + " / " + guardTotal },
        { x: 505, y: 105, red: fieldRed(505), children: data.lastInterrupted ?? "无中断记录" },
      ];

  return (
    <article
      className={"hc-workload " + kind}
      aria-label={inference ? "推理服务卡片" : "训练作业卡片"}
      style={{ backgroundImage: "none", backgroundColor: "#191919" }}
    >
      <ModelIcon name={name} />
      <div className="hc-workload-title" style={{ position: "absolute", left: "52px", top: "20px" }}>
        <span className="hc-workload-name">{name}</span>
        <Status status={st} />
        {inference && data.processingText && (
          <FaultTip
            state={data.processingManual ? "qwen" : "auto"}
            text={data.processingText}
            hideArrow={data.processingManual ? true : false}
            className="hc-workload-progress"
          />
        )}
        {data.energySaving && (
          <span className="hc-status normal hc-energy-saving">
            <img className="energy-label-leaf" src={HC_ASSETS.icons["绿色叶子"]} alt="" width={12} height={12} />
            节能中
          </span>
        )}
      </div>
      <Label x={inference ? 549 : 566} y={22} size={12} color="#999" nowrap>
        {data.start ?? (inference ? "08-22 09:02:00" : "08-22 03:02")}
      </Label>
      <Label x={inference ? 52 : 53} y={88} size={32} color="#fafafa" className="hc-quality">
        {quality}<span className="hc-percent">%</span>
      </Label>
      {headerLabels.map(([text, x, y]) => (
        <Label key={text} x={x} y={y} size={12} color="#999">{text}</Label>
      ))}
      {inference && (
        <div style={{ position: "absolute", left: "52px", top: "144px", width: "582px", height: "1px", background: "#383838" }} />
      )}
      {fields.map((f) => (
        <Label key={f.x + "-" + f.y} x={f.x} y={f.y} size={f.x === 505 ? 16 : 18} color={f.red ? "#e7434a" : "#ececec"} className={f.className}>
          {f.children}
        </Label>
      ))}
    </article>
  );
}
