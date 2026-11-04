// left-panel.jsx —— 节能详情左栏
// 标题区（返回/叶子图标/会话标题）+ 步骤组 + 运行监控 + 报告对话 + 输入框
// 打开时的入场动画与返回按钮聚焦在挂载 effect 中执行（父级按 openSeq key 重建本组件）
import { Fragment, useEffect, useLayoutEffect, useRef } from "react";
import { HC_ASSETS } from "../../mock/hc-assets.js";
import StrategyStep, { StepIcon, STEP_NAMES } from "./strategy-step.jsx";
import { downloadReport } from "./report-panel.jsx";
import { askReport, closeSession, consumeFollow, openReportTab, registerLeftScroll, setComposerText, setHistory, setMonitorOpen, setStrategyGroupOpen } from "./session-store.js";

const REPORT_STEPS = ["汇总8月服务能耗与运行数据", "核对节能策略执行记录", "计算节省能耗与节能收益", "生成8月节能月报"];

export default function EnergyLeft({ s }) {
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  useLayoutEffect(() => {
    // 打开时左栏内容级联入场（prefers-reduced-motion 下降级跳过）
    if (!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      const root = document.getElementById("hc-energy-root");
      const entries = [...root.querySelectorAll(
        ".hc-energy-left-scroll>.hc-energy-step>summary,.hc-energy-left-scroll>.hc-energy-step[open]>.hc-energy-logs," +
        ".hc-energy-left-scroll>.hc-energy-step[open]>.hc-energy-substeps,.hc-energy-prompt,.hc-energy-chat>*"
      )];
      entries.forEach((node, i) => {
        node.style.setProperty("--evt-enter-delay", `${i * 70}ms`);
        node.classList.add("hc-energy-left-enter");
      });
    }
    document.querySelector("#hc-energy-root .hc-energy-back")?.focus({ preventScroll: true });
  }, []);

  useEffect(() => {
    registerLeftScroll(scrollRef.current);
    return () => registerLeftScroll(null);
  }, []);

  // 报告对话自动跟随滚动（在 askReport/tick 里捕获的跟随标记）
  useEffect(() => {
    if (consumeFollow() && scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  });

  const groupState = s.stage === 4 ? "done" : "working";
  const fileName = s.name + "_2026年8月节能月报";

  const onSubmit = (e) => {
    e.preventDefault();
    const text = inputRef.current.value.trim();
    if (!text) return;
    if (/报告|月报|节能|能耗/.test(text)) askReport(text);
    else {
      inputRef.current.setCustomValidity("请输入节能、能耗或报告相关问题");
      inputRef.current.reportValidity();
    }
  };

  return (
    <aside className="hc-energy-left">
      <div className="hc-energy-heading">
        <button type="button" className="hc-energy-back" aria-label="返回" onClick={closeSession}>
          <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M9.1 2.35 1.45 10l7.65 7.65M1.5 10h18" stroke="#dfdfdf" strokeWidth="2.08" strokeLinejoin="round" />
          </svg>
        </button>
        <span className="hc-energy-heading-icon"><img src={HC_ASSETS.icons["叶子-圆底托"]} alt="" /></span>
        <div>
          <h1>{s.stage < 4 ? "节能策略自动优化" : s.name}</h1>
          <p>{s.stage < 4 ? s.name + " · 自动处理中" : "均衡策略守护中 · 生效时间 " + s.effectiveAt}</p>
        </div>
      </div>

      <div className="hc-energy-left-scroll" ref={scrollRef}>
        <details
          className="hc-energy-step hc-energy-strategy-group"
          data-state={groupState}
          open={s.strategyGroupOpen ?? s.stage < 4}
          onToggle={(e) => setStrategyGroupOpen(e.target.open)}
        >
          <summary>
            <StepIcon status={groupState} />
            节能机会识别并下发策略
            <span className={"hc-energy-state " + groupState}>{s.stage === 4 ? "已完成" : "自动处理中"}</span>
          </summary>
          <div className="hc-energy-substeps">
            {STEP_NAMES.slice(0, Math.min(s.stage + 1, STEP_NAMES.length)).map((_, i) => (
              <StrategyStep key={i} s={s} i={i} />
            ))}
          </div>
        </details>

        {s.stage === 4 && (
          <details className="hc-energy-step" data-state="working" open={s.monitorOpen} onToggle={(e) => setMonitorOpen(e.target.open)}>
            <summary>
              <StepIcon status="working" />
              运行监控
              <span className="hc-energy-state working hc-energy-watching">守护中</span>
            </summary>
            <div className="hc-energy-logs" aria-label="运行日志">
              {s.logs.map((log, i) => (
                <button
                  type="button"
                  key={i}
                  className={"hc-energy-log" + (s.history === i ? " selected" : "")}
                  aria-pressed={String(s.history === i)}
                  onClick={() => setHistory(i)}
                >
                  <time>{log.metrics.time}</time>
                  <strong>
                    {log.kind === 2 ? log.title.replace("：无异常", "") : log.title}
                    {(log.kind === 1 || log.kind === 2) && <span className="hc-energy-log-result">{log.kind === 1 ? "调频成功" : "无异常"}</span>}
                  </strong>
                  <p>{log.description}</p>
                </button>
              ))}
            </div>
            <div className="hc-energy-log-actions" />
          </details>
        )}

        <div className="hc-energy-chat">
          {s.reports.map((report, idx) => (
            <Fragment key={idx}>
              <div className="hc-energy-question">{report.question}</div>
              <div className="hc-energy-answer" aria-live="polite">
                {!report.done && (
                  <p className={report.step === 0 ? "hc-energy-typewriter-intro" : ""}>好的，正在基于当前服务生成2026年8月能耗与节能报告</p>
                )}
                {!report.done && (
                  <ol className="hc-energy-progress">
                    {REPORT_STEPS.map((text, i) => {
                      if (i > report.step) return null;
                      const done = report.done || i < report.step;
                      return (
                        <li key={i} className={done ? "done" : i === report.step ? "working" : ""}>
                          {done
                            ? <img className="hc-energy-report-step-icon" src={HC_ASSETS.icons["对勾"]} alt="" />
                            : <span className="hc-energy-progress-dot hc-energy-loading hc-energy-report-step-icon" />}
                          <span className={done ? "" : "hc-energy-typewriter"} style={{ "--typing-steps": String(text.length) }}>{text}</span>
                        </li>
                      );
                    })}
                  </ol>
                )}
                {report.done && (
                  <div className="hc-energy-report-card">
                    <span className="hc-energy-file-icon"><img src={HC_ASSETS.icons["报告图标"]} alt="" /></span>
                    <div className="hc-energy-file-label" title={fileName}>
                      <strong>{fileName}</strong>
                      <small>HTML · 2.4M</small>
                    </div>
                    <div className="hc-energy-file-actions">
                      <button type="button" onClick={openReportTab}>
                        <img src={HC_ASSETS.icons["查看详情"]} alt="" />查看
                      </button>
                      <button type="button" onClick={() => downloadReport(s)}>
                        <img src={HC_ASSETS.icons["下载"]} alt="" />下载
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </Fragment>
          ))}
        </div>
      </div>

      {s.prompt && s.stage === 4 && (
        <div className="hc-energy-prompt">
          <span>需要帮你统计 8 月集群节能情况并生成报告吗？</span>
          <button type="button" onClick={() => askReport("请统计 8 月集群节能情况并生成报告")}>需要</button>
        </div>
      )}

      <form className="hc-energy-composer" onSubmit={onSubmit}>
        <div className="hc-energy-input-row">
          <input
            ref={inputRef}
            placeholder='输入问题或输入"/"触发提示词'
            aria-label="报告问题"
            maxLength={2000}
            value={s.composerText}
            onChange={(e) => {
              inputRef.current.setCustomValidity("");
              setComposerText(e.target.value);
            }}
          />
          <button type="submit" aria-label="发送报告问题" disabled={!s.composerText.trim()}>
            <img src={HC_ASSETS.icons[s.composerText.trim() ? "发送-正常态" : "发送-禁用态"]} alt="" />
          </button>
        </div>
      </form>
    </aside>
  );
}
