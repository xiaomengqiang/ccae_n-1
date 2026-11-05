import { Fragment, useEffect, useLayoutEffect, useRef, useState } from "react";
import { OPTICAL_ASSETS } from "../../mock/hc-assets.js";

// 处理环节流程图 —— 视口/节点/刻度 JSX 渲染；连线与定位依赖 offsetHeight 实测，
// 在 useLayoutEffect 中计算（与原 drawFlowLines 同一套数学），测量结果进 state 渲染 SVG 连线。
// stage 用 viewStage（节点可见性 f[4]），rawStage 用于 nic-waiting/待处理态（原实现即用原始 stage）。

const LINKS = [[0, 1], [1, 2], [2, 3], [1, 4], [4, 5], [5, 6], [6, 7], [7, 8], [8, 9], [9, 10], [10, 11], [11, 12]];

export default function ProcessFlow({ flow, stage, rawStage, selected, hidden, onSelectStep }) {
  const viewportRef = useRef(null);
  const listRef = useRef(null);
  const lastStageRef = useRef(null);
  const [lines, setLines] = useState({ paths: [], w: 0, h: 0 });

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const onScroll = () => viewport.classList.toggle("has-earlier", viewport.scrollLeft > 1);
    viewport.addEventListener("scroll", onScroll, { passive: true });
    return () => viewport.removeEventListener("scroll", onScroll);
  }, []);

  useLayoutEffect(() => {
    const list = listRef.current, viewport = viewportRef.current;
    if (!list || !viewport || hidden || !list.isConnected) return;
    const gap = 12;
    const width = Math.max(138, (viewport.clientWidth - 7 * gap) / 8);
    const visibleCount = flow.filter((f) => stage >= f[4]).length;
    const columns = Math.max(8, visibleCount - 2);
    list.style.width = (columns * (width + gap) - gap) + "px";
    const nodes = new Map();
    list.querySelectorAll(".nic-flow-node").forEach((n) => {
      const i = +n.dataset.flowIndex, c = +n.dataset.column;
      n.style.width = width + "px";
      n.style.left = c * (width + gap) + "px";
      n.style.top = ((i < 2 ? 103 : i < 4 ? 69 : 141) - n.offsetHeight / 2) + "px";
      nodes.set(i, n);
    });
    list.querySelectorAll(".nic-flow-tick").forEach((t) => {
      const n = nodes.get(+t.dataset.flowIndex);
      Object.assign(t.style, { left: n.style.left, width: n.offsetWidth + "px", top: n.offsetTop + n.offsetHeight + "px" });
    });
    const paths = [];
    LINKS.forEach(([a, b]) => {
      if (!nodes.has(a) || !nodes.has(b)) return;
      const p = nodes.get(a), q = nodes.get(b);
      const x = p.offsetLeft + p.offsetWidth, y = p.offsetTop + p.offsetHeight / 2;
      const xx = q.offsetLeft, yy = q.offsetTop + q.offsetHeight / 2;
      const mid = (x + xx) / 2;
      paths.push(`M${x} ${y} H${mid} V${yy} H${xx}`);
    });
    setLines({ paths, w: list.clientWidth, h: list.clientHeight });
    // 视口滚动管理（与原实现一致：选中滚入视野；阶段变化才滚到最新，普通重渲染保持滚动位置）
    if (selected !== null) {
      const n = nodes.get(selected);
      if (n) {
        const l = n.offsetLeft, r = l + n.offsetWidth;
        if (l < viewport.scrollLeft) viewport.scrollLeft = Math.max(0, l - 12);
        else if (r > viewport.scrollLeft + viewport.clientWidth) viewport.scrollLeft = r - viewport.clientWidth + 12;
      }
    } else if (lastStageRef.current !== stage) {
      viewport.scrollLeft = list.scrollWidth;
      lastStageRef.current = stage;
    }
    viewport.classList.toggle("has-earlier", viewport.scrollLeft > 1);
  }, [stage, rawStage, selected, hidden, flow]);

  return (
    <div className="nic-flow-viewport" ref={viewportRef} hidden={hidden}>
      <div className="nic-flow" ref={listRef} role="tablist">
        {lines.paths.length > 0 && (
          <svg className="nic-flow-lines" viewBox={"0 0 " + lines.w + " " + lines.h} aria-hidden="true">
            {lines.paths.map((d, i) => <path key={i} d={d} />)}
          </svg>
        )}
        {flow.map((f, i) => {
          if (stage < f[4]) return null;
          const manual = i === 9 && rawStage === 6;
          const iconName = i === 10 ? "人工处理-绿色" : manual ? "红色小手" : "故障诊断-圆-原稿绿色";
          const description = f[1].replaceAll("／", "\n");
          const dim = selected !== null && selected !== i;
          return (
            <Fragment key={i}>
              <button
                type="button"
                className={"evt-process-card nic-flow-node" + (manual ? " evt-pending" : "")
                  + (manual ? " nic-waiting" : "")
                  + (dim ? " evt-focus-dim" : "")}
                role="tab"
                aria-selected={String(selected === i)}
                aria-label={description.replace(/\n/g, "")}
                data-flow-index={i}
                data-column={i < 4 ? i : i - 2}
                onClick={() => onSelectStep?.(i)}
              >
                <img className="evt-icon" src={OPTICAL_ASSETS.icons[iconName]} alt="" width={32} height={32} />
                <span>
                  <span className="evt-process-title">{f[0]}</span>
                  <span className="evt-process-description">{description}</span>
                </span>
              </button>
              {(i < 2 || i >= 4) && (
                <div
                  className={"evt-process-tick nic-flow-tick" + (selected === i ? " evt-current" : "")}
                  data-flow-index={i}
                >
                  <span>{f[3]}</span>
                </div>
              )}
            </Fragment>
          );
        })}
      </div>
    </div>
  );
}
