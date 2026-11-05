import { useEffect, useMemo, useRef, useState } from "react";
import { OPTICAL_ASSETS } from "../../mock/hc-assets.js";
import { useEvidence } from "../../components/evidence-context/index.jsx";

// 经验沉淀卡（原 ExperienceSummary 工厂的 React 版）
// 反馈状态（experienceFeedback/Correction/Rating）写回外部可变 state 引用（跨开关保留）；
// 重新生成 = 本地 key 重挂载；打字流式动画（streamExperience 语义）保留命令式 effect。
// reportText/知识图谱点阵为纯数据。

const LESSONS = [
  ["识别光链路隐患", "结合接收光功率与错误计数识别异常。通道4持续低功率且错误计数异常时，应关联检查光模块端面脏污，不能只依赖链路通断状态"],
  ["串联故障因果关系", "将光模块脏污、接收功率劣化、链路闪断及伴随告警关联分析，结合计算侧排查结果缩小故障范围"],
  ["沉淀处置与核验流程", "先优雅隔离异常链路，再由人工清污；清污后核验光功率恢复与错误计数归零，确认通过后解除隔离"],
];

const REPORT_TEXT = "故障对象：计算柜11·L1交换板02光链路。\n故障表现：链路闪断，通道4接收光功率异常，伴随错误计数异常。\n根因：光链路端面脏污。\n处置过程：异常链路优雅隔离 → 人工清污 → 恢复核验 → 解除隔离。\n核验结果：通道4光功率恢复至0～−1 dBm，错误计数降为0，通道1～3保持正常。\n\n" + LESSONS.map(([title, copy], i) => (i + 1) + "、" + title + "：" + copy).join("\n");

const GRAPH_REPORT_TEXT = "本次新增经验：光模块脏污。\n故障类型：业务劣化。\n识别特征：通道4接收光功率持续偏低，伴随错误计数异常。\n处置路径：优雅隔离异常链路 → 人工清污 → 监控核验 → 解除隔离。\n" + LESSONS.map(([title, copy]) => title + "：" + copy).join("\n");

// 知识图谱点阵（纯数据计算：7 环粒子）
const GRAPH_DOTS = (() => {
  const dots = [];
  for (let ring = 0; ring < 7; ring++) {
    const count = 24 + ring * 7, r = 24 + ring * 7;
    for (let i = 0; i < count; i++) {
      const a = i / count * Math.PI * 2 + ring * .17;
      dots.push({ cx: (32 + Math.cos(a) * r).toFixed(2), cy: (130 + Math.sin(a) * r).toFixed(2), r: ring < 3 ? 1.8 : 1.3, fill: ring < 3 ? "#a59ae9" : "#79c3cd", opacity: (.85 - ring * .07).toFixed(2) });
    }
  }
  return dots;
})();

const TOOL_ICONS = {
  refresh: '<path d="M20 7v5h-5M19 12a7 7 0 1 0-2 5"/>',
  copy: '<rect x="8" y="8" width="12" height="13" rx="2"/><path d="M16 8V3H3v13h5"/>',
  like: '<path d="M8 21H3V10h5m0 11h10l3-11h-7l1-6-3-2-4 8z"/>',
  dislike: '<path d="M8 3H3v11h5M8 3h10l3 11h-7l1 6-3 2-4-8z"/>',
};

function ToolButton({ name, icon, onClick, pressed }) {
  return (
    <button
      type="button" title={name} aria-label={name}
      aria-pressed={pressed === undefined ? undefined : String(pressed)}
      onClick={onClick}
      dangerouslySetInnerHTML={{ __html: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + TOOL_ICONS[icon] + "</svg>" }}
    />
  );
}

// 打字流式动画（命令式保留）—— 内容真实逐字增长，不预留完整卡片高度
function streamCard(card, delayStart = 0) {
  const timers = new Set();
  const safeLater = (fn, ms) => { const id = setTimeout(() => { timers.delete(id); if (card.isConnected) fn(); }, Math.max(0, ms)); timers.add(id); };
  const intro = card.querySelector(".evt-experience-intro");
  const list = card.querySelector(".evt-experience-lessons");
  const items = Array.from(list.children);
  const tail = Array.from(card.children).filter((node) => node !== intro && node !== list);
  const blocks = [intro, ...items];
  const texts = blocks.map((block) => (Array.from(block.querySelectorAll("strong,p")).length ? Array.from(block.querySelectorAll("strong,p")) : [block]));
  const originals = new Map(); texts.flat().forEach((node) => { originals.set(node, Array.from(node.textContent)); node.textContent = ""; });
  blocks.forEach((node) => { node.hidden = true; }); tail.forEach((node) => { node.hidden = true; }); list.hidden = true; card.hidden = true;
  const active = () => card.isConnected;
  const revealTail = (index) => {
    if (!active()) return;
    const node = tail[index]; if (!node) { card.removeAttribute("aria-busy"); return; }
    node.hidden = false;
    if (node.animate) { const height = node.offsetHeight; node.animate([{ height: "0px", opacity: 0, overflow: "hidden" }, { height: height + "px", opacity: 1, overflow: "hidden" }], { duration: 360, easing: "ease-out" }); }
    safeLater(() => revealTail(index + 1), 400);
  };
  const writeBlock = (index) => {
    if (!active()) return;
    if (index >= blocks.length) { revealTail(0); return; }
    blocks[index].hidden = false; if (index > 0) list.hidden = false;
    let part = 0, offset = 0;
    const tick = () => {
      if (!active()) return;
      const node = texts[index][part], chars = originals.get(node);
      offset = Math.min(offset + 2, chars.length); node.textContent = chars.slice(0, offset).join("");
      if (offset < chars.length) { safeLater(tick, 24); return; }
      if (++part < texts[index].length) { offset = 0; safeLater(tick, 60); } else safeLater(() => writeBlock(index + 1), 120);
    };
    tick();
  };
  card.setAttribute("aria-busy", "true");
  safeLater(() => { if (!active()) return; card.hidden = false; writeBlock(0); }, Math.max(0, delayStart));
}

export default function ExperienceSummary({ state, onReplace, delayStart = 0, stream = false }) {
  const evidenceCtx = useEvidence();
  const cardRef = useRef(null);
  const [regenKey, setRegenKey] = useState(0);
  const [feedback, setFeedback] = useState(state.experienceFeedback ?? null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const [rating, setRating] = useState(state.experienceRating);
  const fieldRef = useRef(null);

  // 反馈状态写回外部引用（跨开关保留）
  useEffect(() => { state.experienceFeedback = feedback; }, [feedback, state]);
  useEffect(() => { state.experienceRating = rating; }, [rating, state]);

  // 打字流式动画（仅 stream 模式执行一次；regenKey 变化重放）
  useEffect(() => {
    if (!stream || !cardRef.current) return;
    streamCard(cardRef.current, delayStart);
  }, [stream, delayStart, regenKey]);

  // 纠正编辑器聚焦
  useEffect(() => { if (editorOpen) fieldRef.current?.focus(); }, [editorOpen]);

  const confirmed = feedback === "accurate";
  const message = confirmed ? "用户反馈此次经验沉淀准确"
    : feedback === "corrected" ? "已记录你的纠正意见，供后续复盘参考"
    : "我的经验沉淀是否准确？";

  const copyReport = async () => {
    try { await navigator.clipboard.writeText(REPORT_TEXT); setNotice("已复制"); }
    catch {
      const text = document.createElement("textarea");
      text.value = REPORT_TEXT; document.body.append(text); text.select();
      const ok = document.execCommand("copy"); text.remove();
      setNotice(ok ? "已复制" : "复制失败，请重试");
    }
  };

  const regenerate = () => { setNotice("已根据本次处置记录重新整理"); setRegenKey((k) => k + 1); onReplace?.(null); };

  return (
    <section key={regenKey} className="evt-experience" aria-label="智能体经验沉淀" ref={cardRef}>
      <p className="evt-experience-intro">本次光链路故障已完成处置。我已整理处理过程，形成以下可复用经验</p>
      <ol className="evt-experience-lessons">
        {LESSONS.map(([title, copy]) => (
          <li key={title}><strong>{title}</strong><p>{copy}</p></li>
        ))}
      </ol>
      <button
        type="button" className="evt-experience-report"
        onClick={() => evidenceCtx?.show("光链路清污复盘报告", "经验沉淀", "故障复盘", REPORT_TEXT)}
      >
        <span className="evt-experience-file">▤</span>
        <strong>光链路清污复盘报告</strong>
        <span className="evt-experience-open">查看 ›</span>
      </button>
      <div className="evt-experience-graph">
        <div className="evt-experience-graph-title">
          <strong>经验图谱</strong>
          <button
            type="button" className="evt-knowledge-details"
            onClick={() => evidenceCtx?.show("经验图谱详情", "经验沉淀", "故障复盘", GRAPH_REPORT_TEXT)}
          >查看详情</button>
        </div>
        <svg className="evt-knowledge-map" viewBox="0 0 420 250" role="img" aria-label="经验图谱：故障类型分为业务劣化和业务失败，光模块脏污为本次新增经验">
          <g>{GRAPH_DOTS.map((dot, i) => <circle key={i} cx={dot.cx} cy={dot.cy} r={dot.r} fill={dot.fill} opacity={dot.opacity} />)}</g>
          <g fill="none" stroke="#747b82" strokeWidth="1.2">
            <path d="M92 130H127 M173 130C203 130 204 74 236 74 M173 130C203 130 204 196 236 196 M268 74C291 74 290 38 314 38 M268 74C291 74 290 108 314 108 M268 196C291 196 291 168 314 168 M268 196C291 196 291 226 314 226" />
          </g>
          <g fill="#dce0e4" fontSize="13" fontFamily="sans-serif">
            <text x="122" y="134">故障类型</text>
            <text x="219" y="70">业务劣化</text>
            <text x="219" y="192">业务失败</text>
            <text x="313" y="34">光模块脏污</text>
            <text x="313" y="104">NPU掉卡</text>
            <text x="313" y="164">实例异常</text>
            <text x="313" y="222">通信中断</text>
          </g>
          <rect x="316" y="43" width="70" height="20" rx="10" fill="#355e78" />
          <text x="351" y="57" textAnchor="middle" fontSize="11" fill="#b4e7ff">✦ 新经验</text>
        </svg>
      </div>
      <div className={"evt-experience-feedback" + (confirmed ? " is-accurate" : "")}>
        <p role="status">
          {confirmed && (
            <>
              <span className="evt-experience-confirmed-icon" aria-hidden="true">
                <svg viewBox="0 0 16 16" fill="none"><path d="m4 8 2.5 2.5L12 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </span>
              <span>用户反馈此次经验沉淀准确</span>
            </>
          )}
          {!confirmed && message}
        </p>
        {!confirmed && (
          <div className="evt-experience-actions">
            <button type="button" onClick={() => { setEditorOpen(false); setFeedback("accurate"); }}>准确</button>
            <button type="button" onClick={() => setEditorOpen(true)}>纠正</button>
          </div>
        )}
        <div className="evt-experience-editor" hidden={!editorOpen}>
          <textarea
            ref={fieldRef}
            placeholder="请填写需要纠正的经验内容" aria-label="经验纠正内容"
            defaultValue={state.experienceCorrection}
          />
          <button type="button" onClick={() => {
            const value = fieldRef.current?.value?.trim();
            if (!value) { fieldRef.current?.focus(); return; }
            state.experienceCorrection = value;
            setFeedback("corrected");
            setEditorOpen(false);
          }}>保存纠正</button>
        </div>
      </div>
      <div className="evt-experience-footer">
        <span className="evt-experience-notice" role="status">{notice}</span>
        <div className="evt-experience-tools">
          <ToolButton name="重新生成经验" icon="refresh" onClick={regenerate} />
          <ToolButton name="复制经验" icon="copy" onClick={copyReport} />
          <ToolButton name="有帮助" icon="like" pressed={rating === "like"} onClick={() => setRating("like") || setNotice("感谢反馈")} />
          <ToolButton name="没有帮助" icon="dislike" pressed={rating === "dislike"} onClick={() => { setRating("dislike"); setEditorOpen(true); }} />
        </div>
      </div>
    </section>
  );
}
