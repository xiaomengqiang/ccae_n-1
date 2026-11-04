import { useEffect, useRef } from "react";

// StoryRenderer —— story render 函数的 React 壳
// render() 内部的命令式 DOM 操作保持原样（在 event.js 中）
// 此组件只做生命周期挂载（story.subscribe + load 启动 + 品牌重置）
import { mountStoryRender } from "./render.js";

export default function StoryRenderer() {
  const mounted = useRef(false);
  useEffect(() => {
    if (mounted.current) return;
    mounted.current = true;
    mountStoryRender();
  }, []);
  return null;
}
