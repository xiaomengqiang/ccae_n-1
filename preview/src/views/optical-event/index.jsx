import { useEffect } from "react";

// optical-event React 壳子
// 命令式拓扑绘制逻辑保持在 event.js 中（6 个顶级模块：HCEventUI/HCEntrance/HCOpticalEventUI/HCEventModule/host）
// 此组件只做生命周期挂载 + window API 桥接
import { mountOpticalEvent, unmountOpticalEvent } from "./event.js";

export default function OpticalEvent() {
  useEffect(() => {
    mountOpticalEvent();
    return () => unmountOpticalEvent();
  }, []);
  return null;
}
