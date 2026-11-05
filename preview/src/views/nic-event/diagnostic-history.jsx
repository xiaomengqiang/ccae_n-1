import { useEffect, useRef } from "react";
import { OPTICAL_ASSETS } from "../../mock/hc-assets.js";
import DiagnosticStep from "../../components/diagnostic-step/index.jsx";
import CauseChain from "../../components/cause-chain/index.jsx";

// 左侧诊断历史面板（原 renderHistory 命令式构建的 React 版）
// 事件摘要 + 诊断步骤列表；展开状态/选中联动由 event.js 状态机以 props 推送。
// i===3/5 的自定义取证（HCOpticalEvidence）保持命令式——effect 注入（幂等）。

const CHAIN_ICONS = {
  biz: ["系统-0910", "实例-0910", "实例-0910"],
  res: ["网卡-0910", "内存-0910", "指针-0910", "服务-0910", "实例-0910", "实例-0910"],
};

function chainItems(s, i) {
  return s.chain.map((title, j) => {
    const badge = i === 1 ? (j === 0 ? "直接原因" : "业务影响") : j === 3 ? "直接原因" : j >= 4 ? "业务影响" : null;
    return {
      title,
      description: j === 0 ? "OS IP 112.34.23.1" : "",
      icon: (i === 1 ? CHAIN_ICONS.biz : CHAIN_ICONS.res)[j],
      root: i === 3 && j === 0,
      badge,
      badgeTone: badge === "直接原因" ? "degraded" : "impact",
    };
  });
}

function ManualCard({ v, journeySecond, selected, onAuthorize }) {
  const rows = ["12:06:06 待人工确认执行网卡升级，升级后核查驱动版本、D-08 实例和 Qwen-1.5B 服务"];
  if (v >= 7) rows.push("12:06:12 已人工授权，开始执行网卡驱动升级");
  if (v >= 8) rows.push("12:06:20 驱动升级至 V13.1，正在检查节点与实例健康");
  if (v === 9) rows.push("12:06:35 节点和实例健康核查通过，Qwen-1.5B 服务恢复，事件已闭环");
  const dimRow = (j) => selected !== null && selected >= 9 && j !== selected - 9;
  return (
    <div className="nic-manual-copy">
      <ol className="nic-upgrade-results">
        <li className={dimRow(0) ? "evt-focus-dim" : ""}>
          {rows[0]}
          <div className="nic-upgrade-card">
            <strong className="nic-upgrade-object">hinic3 网卡驱动</strong>
            <div className="nic-upgrade-device">112.34.23.1 · CPU02</div>
            <div className="nic-upgrade-versions" aria-label={v >= 8 ? "网卡驱动已从 V11.8 升级至 V13.1" : "当前版本 V11.8，待升级版本 V13.1"}>
              <div className="nic-version-before">
                <small>{v >= 8 ? "升级前版本" : "当前版本"}</small>
                <strong>V11.8</strong>
              </div>
              <span className="nic-version-arrow">→</span>
              <div className="nic-version-after">
                <small>{v >= 8 ? "当前版本 · 已升级" : "待升级版本"}</small>
                <strong>V13.1</strong>
              </div>
            </div>
            {v === 6 && journeySecond === null && (
              <button type="button" className="nic-confirm-execute" onClick={onAuthorize}>授权升级网卡</button>
            )}
          </div>
        </li>
        {rows.slice(1).map((row, j) => (
          <li key={j + 1} className={dimRow(j + 1) ? "evt-focus-dim" : ""}>{row}</li>
        ))}
      </ol>
    </div>
  );
}

export default function DiagnosticHistory({ v, journeySecond, expanded, selected, flow, sections, onToggle, onStepSelect, onSummaryClick, onAuthorize, onToggleAll }) {
  const body3 = useRef(null);
  const body5 = useRef(null);
  const visible = sections.map((s, i) => (v >= s.at ? i : -1)).filter((i) => i >= 0);
  const allExpanded = visible.length > 0 && visible.every((i) => expanded[i]);

  // 步骤 3/5 取证条目（v 阈值控制注入时机；null = 跳过）
  const evidence3 = v >= 5 ? [
    { verb: "生成", label: "BMC 日志分析结果", tool: "BMC 日志分析", kind: "file", text: "分析对象：112.34.23.1 · CPU02\n分析结论：关联节点重启记录，确认故障发生于 D-08 实例所在节点\n关联事件：12:05:06 操作系统崩溃重启" },
    { verb: "生成", label: "OS 日志分析结果", tool: "OS 日志分析", kind: "file", text: "分析对象：112.34.23.1 · 操作系统\n分析结论：操作系统内存耗尽并崩溃重启，导致 D-08 实例异常退出\n业务影响：Qwen-1.5B 请求成功率降至 77.5%" },
    { verb: "生成", label: "vmcore 分析结果", tool: "vmcore 分析", kind: "file", text: "分析对象：112.34.23.1 · 内核转储\n分析结论：发现内核空指针异常；结合 OS 日志与 hinic3 驱动版本信息，定位根因为网卡驱动版本过低\n当前版本：V11.8\n处置建议：升级至 V13.1，随后核查节点、D-08 实例及 Qwen-1.5B 服务" },
  ] : null;
  const evidence5 = v >= 7 ? [
    { verb: "记录", label: "人工确认记录", tool: "人工授权", kind: "run" },
  ] : null;

  // 步骤 3 取证展开 + 摘要改名（注入后的命令式后处理）
  useEffect(() => {
    const b3 = body3.current;
    if (!b3) return;
    const results = b3.querySelector("details.evt-diagnostic-operations");
    if (results) {
      results.open = true;
      results.querySelector("summary > span:not(.evt-operation-icon)").textContent = "诊断分析结果";
    }
  }, [v]);

  // 诊断分析操作行的选中联动 dim（取证注入的命令式 DOM）
  useEffect(() => {
    const b3 = body3.current;
    if (!b3) return;
    const inRange = selected !== null && selected >= 4 && selected <= 6;
    b3.querySelectorAll(".evt-operation-list > li").forEach((row, j) => {
      row.classList.toggle("evt-focus-dim", inRange && j !== selected - 4);
    });
  }, [v, selected]);

  const facts = [
    ["故障对象", "112.34.23.1 · CPU02 · hinic3 网卡驱动"],
    ["业务影响", v === 9 ? "Qwen-1.5B 已恢复，请求成功率99.94%" : v > 0 ? "Qwen-1.5B 请求成功率降至77.5%" : "暂无业务影响"],
    ["处置状态", v === 9 ? "驱动已升级至 V13.1，节点、实例及服务健康核查通过" : v === 8 ? "驱动已升级，正在核查节点、实例及服务健康" : v === 7 ? "人工已确认，正在执行网卡升级" : v >= 3 ? "无可替换节点，无法自动恢复，待人工升级网卡" : "正在诊断并评估恢复方案"],
  ];

  return (
    <>
      <section className="nic-event-overview">
        <section className="nic-event-summary nic-summary-compact" aria-label="事件摘要" data-recovered={String(v === 9)}>
          <div className="nic-summary-heading">事件摘要</div>
          <button
            type="button"
            className="nic-summary-conclusion"
            onClick={() => { if (v > 0) onSummaryClick(v >= 5 ? 7 : v >= 2 ? 1 : 0); }}
          >
            {v >= 5 ? "网卡驱动版本低导致系统崩溃、D-08 实例退出，影响 Qwen-1.5B 服务" : v >= 2 ? "节点操作系统崩溃重启，导致 D-08 实例异常退出" : v > 0 ? "Qwen-1.5B 服务劣化，正在定位故障" : "故障发生前，节点和服务运行正常"}
          </button>
          <div className="nic-summary-facts">
            {facts.map(([name, value]) => (
              <div className="nic-summary-fact" key={name}>
                <span className="nic-summary-caption">{name}</span>
                <span className="nic-summary-outcome">{value}</span>
              </div>
            ))}
          </div>
        </section>
        <div className="nic-event-process-body">
          <div className="nic-process-heading">
            <strong>处理过程</strong>
            <button type="button" className="evt-expand-all" aria-expanded={String(allExpanded)} onClick={onToggleAll}>
              <img className="evt-icon" src={OPTICAL_ASSETS.icons["展开全部"]} alt="" width={12} height={12} />
              <span>{allExpanded ? "收起全部" : "展开全部"}</span>
            </button>
          </div>
          {sections.map((s, i) => {
            if (v < s.at) return null;
            const waiting = i === 5 && v === 6;
            const working = (i === 5 && v >= 7 && v < 9) || (i === 3 && v === 4);
            const tone = waiting ? "manual" : working ? "processing" : "done";
            const badge = waiting ? "待人工处理" : working ? "处理中" : i === 2 ? "无可用方案" : "已完成";
            const badgeTone = i === 2 ? "manual" : undefined;
            const dim = selected !== null && flow[selected] && flow[selected][2] !== i;
            const chainVisible = s.chain && (i !== 3 || v >= 5);
            return (
              <DiagnosticStep
                key={i}
                title={s.title}
                time={null}
                badge={badge}
                tone={tone}
                badgeTone={badgeTone}
                expanded={expanded[i]}
                onToggle={(val) => onToggle(i, val)}
                onSelect={() => onStepSelect(i)}
                statusIcon={waiting ? "红色小手" : undefined}
                dim={dim}
                section={i}
                evidence={i === 3 ? evidence3 : i === 5 ? evidence5 : undefined}
                bodyRef={i === 3 ? body3 : i === 5 ? body5 : undefined}
              >
                <p className="nic-section-copy">
                  {i === 3 && v === 4 ? "12:05:48 正在采集并分析 BMC、OS 日志与 vmcore，定位资源故障根因" : s.text}
                </p>
                {chainVisible && (
                  <CauseChain title={i === 1 ? "业务故障因果链" : "故障因果链"} items={chainItems(s, i)} />
                )}
                {s.manual && (
                  <ManualCard v={v} journeySecond={journeySecond} selected={selected} onAuthorize={onAuthorize} />
                )}
              </DiagnosticStep>
            );
          })}
        </div>
      </section>
    </>
  );
}
