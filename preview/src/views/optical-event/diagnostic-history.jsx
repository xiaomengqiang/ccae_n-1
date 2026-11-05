import { useEffect, useRef, useState } from "react";
import { OPTICAL_ASSETS } from "../../mock/hc-assets.js";
import EvtBadge from "../../components/evt-badge/index.jsx";
import DiagnosticStep from "../../components/diagnostic-step/index.jsx";
import CauseChain from "../../components/cause-chain/index.jsx";
import IsolationAnimation from "./isolation-animation.jsx";
import { TrendChartMount, TrendSnapshotMount, ExperienceMount } from "./legacy-mounts.jsx";

// 左侧诊断历史（原 renderHistory/renderOverview 命令式构建的 React 版）
// 摘要（含关联事件卡）+ 四步骤（感知/分析/决策/恢复）；恢复行含隔离动画、指标对比、
// 清污示意、实时趋势图、经验沉淀。evidence 条目随 liveStage/cleanedAt 推导。

function MetricComparison({ label, before, after, unit, changeLabel, direction }) {
  const down = direction === "down";
  return (
    <div className="evt-metric-comparison">
      <span className="evt-comparison-label">{label}</span>
      <div className="evt-comparison-values">
        <span className="evt-comparison-before">{before}<small>{unit}</small></span>
        <span className="evt-comparison-arrow" aria-hidden="true">→</span>
        <span className="evt-comparison-after">{after}<small>{unit}</small></span>
        <span className={"evt-comparison-growth " + (down ? "down" : "up")}>
          <i aria-hidden="true">{down ? "↓" : "↑"}</i>{changeLabel}
        </span>
      </div>
    </div>
  );
}

function RecoveryTitle({ text, time }) {
  return <strong className="evt-recovery-row-title">{text}<time className="evt-recovery-time">{time}</time></strong>;
}

function BodyText({ text, className = "" }) {
  return <p className={className}>{text}</p>;
}

export default function DiagnosticHistory({
  liveStage, isolationOnly, cleanedAt, phase, view, focusIndex, expanded, state, monitorStartedAt,
  onSelectView, onToggle, onToggleAll,
}) {
  const scrollRef = useRef(null);
  const cleaned = cleanedAt !== null;
  const allOpen = expanded.every(Boolean);

  // ---- 摘要（renderOverview JSX 化） ----
  const conclusion = liveStage < 4 ? "光链路闪断，故障原因分析中"
    : isolationOnly ? "光链路脏污导致链路闪断，已完成优雅隔离"
    : cleaned ? "光链路清污完成，链路恢复正常" : "光链路脏污，已隔离异常链路，等待人工清污";
  const impact = liveStage < 4 ? "正在分析链路闪断的业务影响" : liveStage < 6 ? "引起 CQE 错误、实例异常，正在处置" : "异常链路已隔离，当前业务正常";
  const status = liveStage < 6 ? "诊断与处置随处理进度更新"
    : isolationOnly ? "异常链路已完成优雅隔离，事件已闭环"
    : cleaned ? "链路恢复核验完成，隔离已解除" : "等待人工清污，持续监控光链路状态";
  const relatedClosed = !isolationOnly || Boolean(window.HCStory?.get().optical >= 9);

  // ---- 步骤可见性与徽标（liveStage 阈值） ----
  const sectionDefs = [
    { title: "事件感知", time: "12:00:00", view: 0 },
    { title: "故障分析", time: "12:00:18", view: 2 },
    { title: "方案决策", time: "12:00:28", view: 3 },
    { title: "故障恢复", time: cleaned ? "19:19:25" : "12:00:40", view: isolationOnly ? 4 : 5 },
  ];

  // liveStage<6 时阶段中的覆盖文案/徽标
  const stepOverrides = (i) => {
    const thresholds = [1, 2, 5, 5];
    const done = [2, 4, 5, 6];
    if (liveStage >= 6) return null;
    return {
      badge: liveStage >= done[i] ? "已完成" : "进行中",
      tone: liveStage >= done[i] ? "done" : "processing",
      thresholds, done,
    };
  };

  // ---- 恢复行（recovery 内容） ----
  const manualText = cleanedAt === null
    ? "正在持续监控计算柜11-L1交换板02的光链路。1～3通道保持正常，通道4仍处于异常低功率状态，链路错误计数仍有异常，等待人工清污"
    : null;

  // 恢复行选中联动 dim（focusIndex>=4 时只亮对应 view）
  const rowDim = (rowView) => focusIndex !== null && focusIndex >= 4 && focusIndex !== rowView;
  const stepDim = (i) => focusIndex !== null && i !== [0, 1, 1, 2, 3, 3, 3, 3][focusIndex];

  return (
    <section className="nic-event-overview" aria-label="事件摘要与处理过程">
      <section className="nic-event-summary nic-summary-compact" aria-label="事件摘要">
        <div className="nic-summary-heading">事件摘要</div>
        <strong className="nic-summary-conclusion">{conclusion}</strong>
        <div className="nic-summary-facts">
          {[["故障对象", "计算柜11 · L1交换板02光链路"], ["业务影响", impact], ["处置状态", status]].map(([label, value]) => (
            <div className="nic-summary-fact" key={label}>
              <span className="nic-summary-caption">{label}</span>
              <span className="nic-summary-outcome">{value}</span>
            </div>
          ))}
        </div>
        {liveStage >= 6 && (
          <section className="nic-summary-relation" data-state={relatedClosed ? "closed" : "manual"}>
            <div className="nic-relation-label">{isolationOnly ? "关联待办" : "关联事件"}</div>
            <div className="nic-relation-line">
              <div className="nic-related-business-title">
                <strong className="nic-relation-name">{isolationOnly ? (relatedClosed ? "光链路清污已完成" : "光链路清污") : "光链路闪断，已完成优雅隔离"}</strong>
                <EvtBadge text={relatedClosed ? "已闭环" : "待人工处理"} tone={relatedClosed ? "closed" : "manual"}>
                  {!relatedClosed && <img className="evt-icon" src={OPTICAL_ASSETS.icons["红色小手"]} alt="" width={13} height={13} />}
                </EvtBadge>
              </div>
              <button
                type="button" className="nic-relation-action"
                onClick={() => { window.closeOpticalEvent(); window.openOpticalEvent({ mode: isolationOnly ? "full" : "isolation" }); }}
              >
                {relatedClosed ? "查看事件" : "去处理"}<i className="evt-jump-icon" />
              </button>
            </div>
          </section>
        )}
      </section>
      <div className="nic-event-process-body">
        <div className="nic-process-heading">
          <strong>处理过程</strong>
          <button
            type="button" className="evt-expand-all" aria-expanded={String(allOpen)}
            onClick={onToggleAll}
          >
            <img className="evt-icon" src={OPTICAL_ASSETS.icons["展开全部"]} alt="" width={12} height={12} />
            <span>{allOpen ? "收起全部" : "展开全部"}</span>
          </button>
        </div>

        {sectionDefs.map((s, i) => {
          if (liveStage < [1, 2, 5, 5][i]) return null;
          let badge = isolationOnly || cleaned ? "已完成" : "待人工处理";
          let tone = isolationOnly || cleaned ? "done" : "manual";
          if (liveStage < 6) {
            const done = [2, 4, 5, 6][i];
            badge = liveStage >= done ? "已完成" : "进行中";
            tone = badge === "进行中" ? "processing" : "done";
          }
          // ---- 各步骤内容 ----
          let content = null;
          let evidence = [];
          if (i === 0) {
            content = liveStage >= 6 && !isolationOnly ? (
              <BodyText text="12:00:00 感知光链路闪断告警，后续定位为光链路脏污" />
            ) : (
              <>
                <BodyText text="链路闪断告警  12:00:00-12:00:05" />
                <BodyText text="故障描述：计算柜11-L1交换板02上发生闪断3次" />
              </>
            );
            evidence = [{ verb: "读取", label: "告警与事件记录", tool: "事件监测", kind: "file", text: liveStage >= 6 && !isolationOnly ? "12:00:00 感知光链路闪断告警，后续定位为光链路脏污" : "链路闪断告警  12:00:00-12:00:05 故障描述：计算柜11-L1交换板02上发生闪断3次" }];
          }
          if (i === 1) {
            if (!isolationOnly && liveStage >= 6) {
              content = (
                <>
                  <BodyText text="12:00:28 完成光链路状态分析：通道4从12:00:00开始处于异常低功率状态，截至12:00:28已持续28秒，光功率约为−12.9dBm；同期通道1～3保持在0～−1dBm，错误计数持续异常" />
                  <TrendSnapshotMount />
                </>
              );
              evidence = [{ verb: "核对", label: "光功率与错误计数记录", tool: "链路监测", kind: "search", text: "12:00:28 完成光链路状态分析：通道4从12:00:00开始处于异常低功率状态，截至12:00:28已持续28秒，光功率约为−12.9dBm；同期通道1～3保持在0～−1dBm，错误计数持续异常" }];
            } else if (liveStage >= 4) {
              content = (
                <>
                  <BodyText text="12:00:18 完成故障分析：排除计算侧硬件故障，检测到根因为计算柜11-L1交换板02因“光链路脏污”，导致链路闪断，引起CQE错误、实例DOWN" />
                  <CauseChain
                    items={[
                      { title: "光模块脏污", description: "L1-L2 设备光链路端面脏污", icon: "光模块脏污", root: true },
                      { title: "接收功率劣化+FEC误码率异常", description: "lane4接收光功率<-3.2dBm", icon: "吸收功率劣化" },
                      { title: "L1- L2交换机链路多次闪断", description: "持续5s", icon: "链路多次闪断" },
                      { title: "伴随告警30条", description: "IPv6状态切换、光模块整体失效等", icon: "告警铃铛" },
                    ]}
                  />
                </>
              );
              evidence = [
                { verb: "分析", label: "链路故障分析记录", tool: "链路诊断", kind: "file", text: "12:00:18 完成故障分析：排除计算侧硬件故障，检测到根因为计算柜11-L1交换板02因“光链路脏污”，导致链路闪断，引起CQE错误、实例DOWN" },
                { verb: "关联", label: "链路故障因果链", tool: "告警关联分析", kind: "search", text: "光模块脏污 L1-L2 设备光链路端面脏污 接收功率劣化+FEC误码率异常 lane4接收光功率<-3.2dBm L1- L2交换机链路多次闪断 持续5s 伴随告警30条 IPv6状态切换、光模块整体失效等" },
              ];
            } else {
              const text = liveStage === 2 ? "30条告警聚合，生成链路闪断 issue" : "正在分析链路指标与设备日志";
              content = <BodyText text={text} />;
              evidence = [{ verb: "读取", label: "告警聚合记录", tool: "告警关联分析", kind: "file", text }];
            }
          }
          if (i === 2) {
            const text = isolationOnly ? "12:00:28 完成预案生成，管理员已授权给agent进行自动处置" : "12:00:40 已完成L1-L2异常链路优雅隔离，并生成清污待办事件，需人工清污";
            content = <BodyText className="evt-decision-copy" text={text} />;
            evidence = [{ verb: "生成", label: isolationOnly ? "链路隔离方案" : "光链路清污处置方案", tool: "方案生成", kind: "file", text }];
          }
          if (i === 3) {
            const recoveryRows = [];
            if (isolationOnly) {
              recoveryRows.push(
                <div className="evt-recovery-row" data-view="4" key="isolated">
                  <RecoveryTitle text="已完成L1-L2异常链路优雅隔离" time="12:00:40" />
                  <IsolationAnimation />
                  <MetricComparison label="带宽" before="3.2" after="2.4" unit="Tb/s" changeLabel="25%" direction="down" />
                  <MetricComparison label="流量" before="420" after="450" unit="Gb/s" changeLabel="7.14%" direction="up" />
                </div>,
                <div className="evt-recovery-row" data-view="5" key="closed">
                  <RecoveryTitle text="事件已关闭" time="12:00:48" />
                  <div className="evt-cleanup-related">
                    <span>关联事件：</span>
                    <button type="button" className="evt-isolation-link evt-cleanup-event-link" onClick={() => { window.closeOpticalEvent(); window.openOpticalEvent(); }}>
                      生成光链路清污待办事件<i className="evt-jump-icon" />
                    </button>
                  </div>
                </div>
              );
            } else {
              recoveryRows.push(
                <div className="evt-recovery-row" data-view="5" key="manual">
                  <RecoveryTitle text="持续监控光链路状态" time="12:00:40" />
                  {manualText && <BodyText text={manualText} />}
                  {liveStage >= 6 && cleanedAt === null && <CleaningIllustrationNode cleaned={false} />}
                  {liveStage >= 6 && (
                    <TrendChartMount cleanedAt={cleanedAt} recovery monitorStartedAt={monitorStartedAt} initialElapsed={window.HCClock?.seconds?.()} />
                  )}
                </div>
              );
              if (cleaned) {
                recoveryRows.push(
                  <div className="evt-recovery-row" data-view="6" key="done">
                    <RecoveryTitle text="链路恢复正常，核验已完成" time="19:19:25" />
                    <BodyText text="19:17:10，检测到计算柜11-L1交换板02的光链路清污后恢复正常：通道4光功率回升至0～−1dBm，错误计数降为0，通道1～3始终保持正常。持续观察后，于19:19:25完成链路恢复核验" />
                    <CleaningIllustrationNode cleaned />
                    <TrendChartMount cleanedAt={cleanedAt} recovery monitorStartedAt={monitorStartedAt} initialElapsed={window.HCClock?.seconds?.()} />
                  </div>,
                  <div className="evt-recovery-row" data-view="7" key="released">
                    <RecoveryTitle text="隔离状态解除" time="19:19:30" />
                    <BodyText text="光链路隔离已解除、业务链路运行正常" />
                  </div>
                );
              }
            }
            content = <div className="evt-card evt-recovery"><div className="evt-data-content">{recoveryRows}</div></div>;
            // 证据条目：恢复行文本
            evidence = [];
            if (isolationOnly) {
              evidence.push(
                { verb: "记录", label: "链路隔离执行记录", tool: "链路处置", kind: "run", text: "已完成L1-L2异常链路优雅隔离 12:00:40" },
                { verb: "读取", label: "链路处置进展", tool: "链路处置", kind: "file", text: "事件已关闭 12:00:48" }
              );
            } else {
              evidence.push({ verb: "读取", label: "光链路持续监控记录", tool: "链路监测", kind: "file", text: manualText || "持续监控光链路状态 12:00:40" });
              if (cleaned) {
                evidence.push(
                  { verb: "核验", label: "链路恢复核验记录", tool: "链路监测", kind: "search", text: "链路恢复正常，核验已完成 19:19:25 19:17:10，检测到计算柜11-L1交换板02的光链路清污后恢复正常：通道4光功率回升至0～−1dBm，错误计数降为0，通道1～3始终保持正常。持续观察后，于19:19:25完成链路恢复核验" },
                  { verb: "记录", label: "隔离解除记录", tool: "链路处置", kind: "run", text: "隔离状态解除 19:19:30 光链路隔离已解除、业务链路运行正常" }
                );
              }
            }
          }

          return (
            <DiagnosticStep
              key={i}
              title={s.title}
              time={null}
              badge={badge}
              tone={tone}
              expanded={expanded[i]}
              onToggle={(value) => onToggle(i, value)}
              onSelect={() => onSelectView(s.view)}
              evidence={evidence}
              dim={stepDim(i)}
              last={i === sectionDefs.length - 1}
            >
              {content}
            </DiagnosticStep>
          );
        })}

        {!isolationOnly && cleaned && (
          <ExperienceMount state={state} stream={false} />
        )}
      </div>
    </section>
  );
}

// 清污示意图（原 CleaningIllustration 的轻量 JSX 化；crossfade 只在 cleaned 且首次）
const CLEANING_ART = { dirty: "./assets/uploads/dirty.png", clean: "./assets/uploads/clean.png" };
let cleanArtTransitionShown = false;

function CleaningIllustrationNode({ cleaned }) {
  const frameRef = useRef(null);
  const imgRef = useRef(null);
  const [showPrevious, setShowPrevious] = useState(cleaned && !cleanArtTransitionShown);
  const reveal = () => frameRef.current?.classList.add("evt-cleaning-crossfade");
  useEffect(() => {
    if (cleaned && !cleanArtTransitionShown) cleanArtTransitionShown = true;
    if (imgRef.current?.complete && imgRef.current?.naturalWidth) reveal();
  }, [cleaned]);
  return (
    <figure className="evt-cleaning-illustration" data-state={cleaned ? "clean" : "dirty"}>
      <div className="evt-cleaning-frame" ref={frameRef}>
        <img
          ref={imgRef}
          src={cleaned ? CLEANING_ART.clean : CLEANING_ART.dirty}
          alt={cleaned ? "清污完成：居中展示干净的光模块，无手套和清洁笔" : "双手佩戴防静电手套，左手握持光模块外壳，右手使用MPO清洁笔对准光口清洁"}
          width={1899} height={829}
          onLoad={showPrevious ? reveal : undefined}
        />
        {showPrevious && (
          <img
            className="evt-cleaning-previous"
            src={CLEANING_ART.dirty} alt="" aria-hidden="true"
            onAnimationEnd={(e) => e.currentTarget.remove()}
          />
        )}
      </div>
      <figcaption>{cleaned ? "清污已完成" : "光模块脏污，待人工清污"}</figcaption>
    </figure>
  );
}
