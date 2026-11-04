import { useState } from "react";
import { HC_ASSETS } from "../../mock/hc-assets.js";

const createPortal = (node, host) => ReactDOM.createPortal(node, host);

// StoryPopoverRow —— 单条步骤（已完成/处理中/待人工处理）
export function PopoverRow({ text, kind, isLast = false }) {
  const showHand = kind === "manual";
  return (
    <p className={"story-popover-row " + kind}>
      <i className={"story-step-icon " + kind} aria-label={kind === "done" ? "已完成" : kind === "manual" ? "待人工处理" : "处理中"}>
        {showHand && <img src={HC_ASSETS.icons["红色小手"]} alt="" />}
      </i>
      <span>{text}</span>
    </p>
  );
}

// StoryPopoverHeading —— popover 分组标题
export function PopoverHeading({ title, status }) {
  return (
    <div className="story-popover-heading">
      <strong>{title}</strong>
      <small>{status}</small>
    </div>
  );
}

// StoryPopoverSection —— popover 中的分组（已完成/后续）
export function PopoverSection({ part, state, title, status, isActive = false, children }) {
  return (
    <section className={"story-popover-section" + (isActive ? " is-active" : "")} data-part={part} data-state={state}>
      <PopoverHeading title={title} status={status} />
      {children}
    </section>
  );
}

// StoryRecordToggle —— 展开全部/收起 按钮
export function RecordToggle({ count, expanded, onToggle }) {
  return (
    <button
      type="button"
      className="story-record-toggle"
      aria-expanded={String(expanded)}
      onClick={(e) => { e.stopPropagation(); onToggle(!expanded); }}
    >
      {expanded ? "收起" : `展开全部（${count}条）`}
    </button>
  );
}

// StoryPopover —— 完整的事件步骤 popover
// 根据 key + phase + state 生成步骤列表 + 分组 + 展开收起
export default function StoryPopover({ eventKey, phase, state, expandedRecords, onToggleExpand }) {
  const copy = window.HCStoryCopy;
  if (!copy) return null;

  const split = eventKey === "optical" && phase >= 6;
  const isQwen = eventKey === "qwen";

  // 计算步骤列表
  let rows;
  if (isQwen) {
    rows = copy.qwen.slice(1, Math.min(phase, 9) + 1);
  } else {
    rows = copy.optical.slice(1, Math.min(phase, 5) + 1);
    if (phase === 6) rows = [...copy.optical.slice(1, 5), copy.optical[6]];
    if (phase >= 7) rows = [...copy.optical.slice(1, 5), copy.optical[phase]];
  }
  if (eventKey === "optical") {
    rows = rows.map((t) =>
      t === "30条告警聚合，生成链路闪断 issue" ? "30条告警聚合，生成链路闪断issue"
      : t === "正在分析链路指标与设备日志" ? "分析链路指标与设备日志"
      : t
    );
  }

  const stateLabel = { manual: "待人工处理", auto: "自动处理中", closed: "已闭环" }[state];

  // 计算每行的 kind
  const rowKinds = rows.map((_, i) => {
    const last = i === rows.length - 1;
    return last && state !== "closed" ? (state === "manual" ? "manual" : "working") : "done";
  });

  const expanded = expandedRecords?.get(eventKey) || false;

  // 原版逻辑：auto 状态下超过 3 条记录时显示展开/收起
  // 展开时显示全部，收起时只显示最近 3 条（较旧的隐藏）
  const autoRows = state === "auto" && rows.length > 3 ? rows : null;
  const visibleRows = autoRows && !expanded ? autoRows.slice(-3) : rows;
  const hiddenCount = autoRows && !expanded ? autoRows.length - 3 : 0;

  return (
    <div
      className={"story-popover" + (split || isQwen ? " story-popover-grouped" : "")}
      id={"story-popover-" + eventKey}
      role="tooltip"
    >
      {split ? (
        <>
          <PopoverSection part="completed" state="closed" title={isQwen ? "Qwen-1.5B服务劣化，已恢复" : "光链路闪断，已完成优雅隔离"} status="已闭环">
            {rows.slice(0, 4).map((text, i) => (
              <PopoverRow key={i} text={text} kind="done" />
            ))}
            {!isQwen && <PopoverRow text="异常链路已优雅隔离" kind="done" />}
          </PopoverSection>
          <PopoverSection
            part="followup"
            state={state}
            title={isQwen ? (state === "closed" ? "网卡驱动版本低，已升级" : "网卡驱动版本待升级") : "光链路脏污，待清污"}
            status={stateLabel}
            isActive
          >
            {rows.slice(4).map((text, i) => (
              <PopoverRow key={i + 4} text={text} kind={rowKinds[i + 4]} />
            ))}
          </PopoverSection>
        </>
      ) : isQwen ? (
        <PopoverSection
          part="current"
          state={state}
          title={state === "closed" ? "Qwen-1.5B服务已恢复，网卡驱动已升级" : "Qwen-1.5B服务劣化：网卡驱动版本低"}
          status={stateLabel}
          isActive
        >
          {visibleRows.map((text, i) => (
            <PopoverRow key={i} text={text} kind={rowKinds[rows.indexOf(text)] || "done"} />
          ))}
          {autoRows && (
            <RecordToggle
              count={rows.length}
              expanded={expanded}
              onToggle={(v) => onToggleExpand?.(eventKey, v)}
            />
          )}
        </PopoverSection>
      ) : (
        <>
          {state === "auto" && (
            <PopoverHeading title="光链路闪断" status="自动处理中" />
          )}
          {visibleRows.map((text, i) => (
            <PopoverRow key={i} text={text} kind={rowKinds[rows.indexOf(text)] || "done"} />
          ))}
          {autoRows && (
            <RecordToggle
              count={rows.length}
              expanded={expanded}
              onToggle={(v) => onToggleExpand?.(eventKey, v)}
            />
          )}
        </>
      )}
    </div>
  );
}
