import { useEffect, useRef, useState } from "react";

// 快捷查询 · 引用（全 React 版，替代 quick-query.js 命令式引擎）
// contextmenu 在 document 捕获层识别引用目标（拓扑节点/图表卡/流程卡等）→ 弹层
// （portal 到 body，鼠标位置）→ 点击确认 → 引用环（portal 到目标节点内部）+ chip/
// 快捷查询条/对话区（面板 JSX 内）。Escape/点击外部/滚动/缩放关闭弹层。
// 引用目标可能为 React 树外的节点（SVG/画布），事件监听保持 document 捕获注册。

const createPortal = (node, host) => ReactDOM.createPortal(node, host);

// 引用话题（原 quickTopic 纯函数）
export function quickTopic(name) {
  if (/LPO|光模块/i.test(name)) return "发送/接收光功率";
  if (/NPU|计算刀片/i.test(name)) return "运行状态与关联链路";
  if (/Union|U[12]\./i.test(name)) return "端口状态与错误计数";
  if (/L2|互联|交换/i.test(name)) return "下联链路与告警";
  if (/趋势|功率|图表/.test(name)) return "异常趋势分析";
  if (/处理|环节/.test(name)) return "处置进度与结果";
  return "相关状态与异常";
}

// 答案文案（原 submit 内联分支的纯函数化）
export function answerFor(question, reference, cleaned) {
  const name = reference?.name;
  if (/光功率|发送|接收/.test(question)) {
    const object = name ? "“" + name + "”的关联光链路" : "当前光链路";
    return cleaned
      ? object + "清污后的监控显示：通道4接收光功率已恢复至0～−1 dBm，错误计数降为0，通道1～3保持正常。当前演示未提供发送光功率读数，可结合下方趋势图查看接收侧变化"
      : object + "当前监控显示：通道4接收光功率约为−12.9 dBm，低于图中的−3.2 dBm参考线；通道1～3保持正常。建议先完成光模块清污，再观察接收功率与错误计数。当前演示未提供发送光功率读数";
  }
  if (name) {
    return "我会围绕“" + name + "”分析" + (cleaned
      ? "本次光链路已完成清污和恢复核验，可以继续查看关联链路的光功率趋势与错误计数"
      : "当前故障链路已完成优雅隔离，光模块仍待人工清污。建议先查看该对象的上下游连接，再结合接收光功率和错误计数判断影响") + "你也可以通过上方快捷查询继续了解该对象";
  }
  return cleaned
    ? "当前光链路清污已完成，恢复核验通过。你可以右键引用具体模块，继续询问它的关联链路或光功率趋势"
    : "当前异常光链路已隔离，清污待办尚未完成。建议先完成现场清污，再确认恢复结果。你可以右键引用具体模块，我会围绕该对象继续说明";
}

// ---- 引用控制器：contextmenu 识别 + 弹层 + 引用环 + 状态 ----
export function useQuickReference(panelRef) {
  const [popup, setPopup] = useState(null);      // { x, y, name, reference, target }
  const [reference, setReference] = useState(null); // { name, type, content, target }
  const targetRef = useRef(null);

  const closePopup = () => setPopup(null);
  const clearReference = () => {
    if (targetRef.current && targetRef.current.style) {
      targetRef.current.classList.remove("hc-reference-target");
      if (targetRef.current.dataset.positionPatched) {
        targetRef.current.style.position = "";
        delete targetRef.current.dataset.positionPatched;
      }
    }
    targetRef.current = null;
    setReference(null);
  };
  const confirmReference = (item) => {
    // 引用环改为 portal 渲染（目标节点由 React 临时接管 class）
    if (targetRef.current?.classList) targetRef.current.classList.remove("hc-reference-target");
    targetRef.current = item.target;
    if (item.target.classList) {
      item.target.classList.add("hc-reference-target");
      if (getComputedStyle(item.target).position === "static") {
        item.target.style.position = "relative";
        item.target.dataset.positionPatched = "1";
      }
    }
    setReference({ name: item.reference.name, type: item.reference.type, content: item.reference.content, target: item.target });
    setPopup(null);
  };

  // contextmenu 识别（document 捕获层；目标可能是 React 树外节点）
  useEffect(() => {
    const onContextMenu = (event) => {
      if (event.target.closest(".optical-reference-popup,.hc-composer")) return;
      setPopup(null);
      const canvas = event.target.closest("#optical-event-root .evt-right");
      if (!canvas) return;
      const target = event.target.closest(".evt-topo-node,.evt-chart-card,.evt-evidence-panel,.evt-process-card,.evt-topo-group");
      if (!target || !canvas.contains(target) || event.target.closest(".evt-evidence-tabs,button,a,input")) return;
      const module = canvas.closest(".hc-event-module");
      if (!module) return;
      event.preventDefault();
      const name = (target.dataset.hcHint || target.getAttribute("title") || target.querySelector(".evt-node-label,h2,h3,.evt-process-title")?.textContent || target.getAttribute("aria-label") || target.textContent).trim().replace(/\s+/g, " ").slice(0, 100);
      const ref = { name, type: target.classList.contains("evt-topo-node") ? "拓扑模块" : "画布内容", content: target.textContent.trim().slice(0, 2000) };
      setPopup({
        x: Math.max(8, Math.min(window.innerWidth - 90, event.clientX + 12)),
        y: Math.max(8, Math.min(window.innerHeight - 46, event.clientY + 12)),
        name,
        reference: ref,
        target,
      });
    };
    const onClick = (event) => { if (!event.target.closest(".optical-reference-popup")) setPopup(null); };
    const onKey = (event) => { if (event.key === "Escape") setPopup(null); };
    const onScroll = () => setPopup(null);
    document.addEventListener("contextmenu", onContextMenu, true);
    document.addEventListener("click", onClick, true);
    document.addEventListener("keydown", onKey);
    document.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onScroll);
    return () => {
      document.removeEventListener("contextmenu", onContextMenu, true);
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  // 卸载时还原目标节点（class/inline position）
  useEffect(() => () => clearReference(), []);

  return { popup, reference, confirmReference, clearReference, closePopup };
}

// 引用弹层 —— portal 到 body（鼠标位置，缩放适配）
export function ReferencePopup({ popup, onConfirm, onClose }) {
  if (!popup) return null;
  const module = popup.target.closest(".hc-event-module");
  const scale = module ? (module.getBoundingClientRect().width / module.offsetWidth || 1) : 1;
  return createPortal(
    <button
      type="button"
      className="optical-reference-popup"
      aria-label={"引用“" + popup.name + "”"}
      style={{
        left: popup.x + "px",
        top: popup.y + "px",
        fontSize: (12 * scale) + "px",
        padding: (7 * scale) + "px " + (12 * scale) + "px",
      }}
      onClick={(e) => { e.stopPropagation(); onConfirm(popup); }}
    >引用</button>,
    document.body
  );
}

// 引用环 —— portal 到目标节点内部（React 管理挂载/卸载）
export function ReferenceOutline({ reference }) {
  if (!reference?.target) return null;
  return createPortal(
    <span className="hc-reference-outline" aria-hidden="true" />,
    reference.target
  );
}

// chip + 快捷查询条 —— 渲染进 Composer 的 form 内（overlay 槽）
export function QuickQueryOverlay({ reference, onQuickAsk, onClear }) {
  if (!reference) return null;
  return (
    <>
      <div className="hc-quick-query">
        <span>快捷查询</span>
        <button type="button" onClick={() => onQuickAsk("查询" + quickTopic(reference.name))}>{quickTopic(reference.name)}</button>
      </div>
      <div className="hc-reference-chip">
        <span>引用“{reference.name}”</span>
        <button type="button" aria-label="取消引用" onClick={onClear}>×</button>
      </div>
    </>
  );
}

// 对话状态区 —— 渲染在 evt-diagnostic-scroll 尾部（CSS 锚定 scroll 布局）
export function QuickChatStatus({ messages }) {
  const statusRef = useRef(null);
  useEffect(() => {
    const parent = statusRef.current?.parentElement;
    if (parent) parent.scrollTop = parent.scrollHeight;
  }, [messages]);
  const empty = messages.length === 0;
  return (
    <div
      className="hc-reference-status" role="log" aria-label="智慧体对话" aria-live="polite"
      hidden={empty} ref={statusRef}
    >
      {messages.map((m, i) => (
        <div key={i} className={"hc-chat-message " + m.role} aria-label={m.role === "user" ? "用户消息" : "智慧体回复"}>
          <p>{m.text}</p>
        </div>
      ))}
    </div>
  );
}
