import { useEffect } from "react";

// nic-event React 壳子
// 命令式拓扑绘制逻辑保持在 event.js 中（硬编码坐标/连线，后续讨论框架化）
// 此组件只做生命周期挂载 + window API 桥接
import { mountNicEvent, unmountNicEvent } from "./event.js";

export default function NicEvent() {
  useEffect(() => {
    mountNicEvent();
    return () => unmountNicEvent();
  }, []);
  return null;
}
