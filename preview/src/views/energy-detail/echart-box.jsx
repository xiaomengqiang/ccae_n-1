// echart-box.jsx —— ECharts 宿主组件
// SVG 渲染器：脱离文档也能按固定 width/height 同步渲染（月报导出直接序列化 SVG DOM）
// linkGroup：月报三图悬浮联动——本地 showTip/hideTip 事件按 dataIndex 广播给同组图表。
// 不用官方 echarts.connect：它转发的是像素 x/y，三图宽度不同（1292/590/590）会错位；
// 也不能监听 updateAxisPointer：mousemove 场景其载荷只有 {currTrigger,x,y}，拿不到 dataIndex。
// 对端收到 showTip{seriesIndex,dataIndex} 后 ECharts 内部转 updateAxisPointer，按自身几何定位。
import { useLayoutEffect, useRef } from "react";

const linkGroups = new Map();
// 广播期间置位：对端处理 showTip/hideTip 时自身也会触发同名事件，避免回声循环
let inMirror = false;

export default function EChart({ option, width, height, label, className, style, linkGroup, interactive = true }) {
  const hostRef = useRef(null);
  const chartRef = useRef(null);
  const optionRef = useRef(null);
  // 导出（interactive=false）时关闭 tooltip，静态序列化
  optionRef.current = interactive ? option : { ...option, tooltip: { show: false } };

  useLayoutEffect(() => {
    const host = hostRef.current;
    if (!host || typeof echarts === "undefined") return;
    // echarts SVG 渲染依赖真实浏览器的文本测量（getBBox/getBoundingClientRect）；
    // 无布局环境（jsdom 回归测试）下 init/setOption 内部会抛错，真实浏览器不受影响
    let chart;
    try {
      chart = echarts.init(host, null, { renderer: "svg", width: width || undefined, height: height || undefined });
      chart.setOption(optionRef.current);
    } catch {
      try { chart?.dispose?.(); } catch { /* noop */ }
      return;
    }
    chartRef.current = chart;
    // zrender 默认下一帧才绘制；导出路径需要同步出 DOM
    chart.getZr()?.flush?.();
    // ECharts 6 在初始化即创建 tooltip 容器（display:block、无定位、className 已贴上），
    // 页面 CSS 会让它以静态位置（图表左下角）露出——挂载后立刻置 visibility:hidden；
    // 之后 show() 会整体重写内联 cssText（不含 visibility），正常悬浮不受影响
    host.querySelector(":scope > .hc-energy-tooltip")?.style.setProperty("visibility", "hidden");

    let onShow = null, onHide = null, ro = null;
    if (linkGroup) {
      const peers = linkGroups.get(linkGroup) || new Set();
      linkGroups.set(linkGroup, peers);
      peers.add(chart);
      const broadcast = (payload) => {
        if (inMirror) return;
        inMirror = true;
        try {
          peers.forEach((peer) => { if (peer !== chart && !peer.isDisposed()) peer.dispatchAction(payload); });
        } finally {
          inMirror = false;
        }
      };
      // axisTrigger 派发的本地 showTip 载荷含 seriesDataIndices[0] 的 dataIndex（已从 bundle 源码确认）
      onShow = (params) => { if (params.dataIndex != null) broadcast({ type: "showTip", seriesIndex: 0, dataIndex: params.dataIndex }); };
      onHide = () => broadcast({ type: "hideTip" });
      chart.on("showTip", onShow);
      chart.on("hideTip", onHide);
      chart.on("globalout", onHide);
    }
    if (!width && typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(() => chart.resize());
      ro.observe(host);
    }
    return () => {
      ro?.disconnect();
      if (linkGroup) {
        const peers = linkGroups.get(linkGroup);
        peers?.delete(chart);
        if (peers && !peers.size) linkGroups.delete(linkGroup);
        if (onShow) chart.off("showTip", onShow);
        if (onHide) { chart.off("hideTip", onHide); chart.off("globalout", onHide); }
      }
      chart.dispose();
      chartRef.current = null;
    };
  }, []);

  useLayoutEffect(() => { try { chartRef.current?.setOption(optionRef.current); } catch { /* jsdom 无文本测量 */ } }, [option, interactive]);

  return (
    <div
      ref={hostRef}
      className={"hc-echart-host" + (className ? " " + className : "")}
      role="img"
      aria-label={label}
      style={style}
    />
  );
}
