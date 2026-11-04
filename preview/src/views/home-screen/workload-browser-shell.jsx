import { useEffect, useRef, useState } from "react";

// 工作负载浏览器外壳 —— 排序/浏览控件框架的 JSX 渲染
// 卡片列表（workload-list）与滚动轨道（segments）内容仍由 workload-browser.js
// 命令式填充（虚拟滚动 + 卡片缓存 + pointermove 交互密集，不适合声明式）。
// onReady 在挂载后把所有 ref 节点 + setCategory API 交给命令式控制器。
export default function WorkloadBrowserShell({ onReady }) {
  const [category, setCategory] = useState("training");
  const view = useRef(null), controls = useRef(null), select = useRef(null), browser = useRef(null);
  const track = useRef(null), segments = useRef(null), windowBox = useRef(null), range = useRef(null);
  const left = useRef(null), position = useRef(null), right = useRef(null), reverse = useRef(null);
  const prev = useRef(null), next = useRef(null), list = useRef(null);

  useEffect(() => {
    onReady?.({
      setCategory,
      view: view.current, controls: controls.current, select: select.current, browser: browser.current,
      track: track.current, segments: segments.current, windowBox: windowBox.current, range: range.current,
      left: left.current, position: position.current, right: right.current, reverse: reverse.current,
      prev: prev.current, next: next.current, list: list.current,
    });
  }, []);

  const heading = category === "training" ? "训练作业" : "推理服务";

  return (
    <section id="home-workloads" ref={view} className="windowed-workloads" hidden data-filter="0">
      <div className="workload-controls" ref={controls} aria-label={heading + "排序与浏览"}>
        <div className="workload-sort">
          <select aria-label="对象排序" ref={select}>
            <option value="status">按状态排序</option>
            <option value="quality">{category === "training" ? "按可用度排序" : "按成功率排序"}</option>
            <option value="npu">按卡数排序</option>
          </select>
        </div>
        <div className="workload-browser" ref={browser}>
          <div className="workload-browser-track" ref={track}>
            <div className="workload-browser-segments" ref={segments} />
            <div className="workload-browser-window" ref={windowBox} />
            <input
              type="range" min={0} step={1} className="workload-browser-keyboard"
              aria-label="浏览当前屏对象，方向键移动范围" ref={range}
            />
          </div>
          <div className="workload-browser-captions">
            <span ref={left} />
            <button type="button" className="workload-browser-reverse" aria-label="反转排序方向" aria-pressed="false" title="反转排序方向" ref={reverse}>⇄</button>
            <span ref={position} hidden />
            <span ref={right} />
          </div>
          <div className="workload-browser-pages">
            <button type="button" className="workload-browser-page" aria-label="上一页" ref={prev}>‹</button>
            <button type="button" className="workload-browser-page" aria-label="下一页" ref={next}>›</button>
          </div>
        </div>
      </div>
      <div className="workload-list" ref={list} />
    </section>
  );
}
