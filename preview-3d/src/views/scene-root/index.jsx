// Layer 4 视图 — 3D 场景宿主（imperative island）
// React 职责止于：渲染骨架 DOM → 注入场景样式 → 按序装载引擎脚本。
// 骨架内部（#screen 之下）由引擎全权接管，React 不再 diff（dangerouslySetInnerHTML）。

import { useEffect, useLayoutEffect, useRef } from "react";
import {
  SCENE_SKELETON,
  RUNTIME_SCRIPTS,
  SCENE_STYLES,
  SCENE_TITLE,
  detectLightMode,
  loadRuntimeScripts,
} from "./scene-dom.js";

export default function SceneRoot() {
  const bootedRef = useRef(false);

  // 首帧绘制前：标题 / ccae-booting / 触屏探测 / 场景样式 —— 避免无样式闪烁
  useLayoutEffect(() => {
    if (bootedRef.current) return;
    bootedRef.current = true;
    document.title = SCENE_TITLE;

    const root = document.documentElement;
    root.classList.add("ccae-booting");

    // 原 <head> 脚本 1：抑制浏览器双击缩放（不拦截演示点击与捏合缩放）
    document.addEventListener(
      "dblclick",
      (event) => {
        if (event.cancelable) event.preventDefault();
      },
      { passive: false }
    );

    // 原 <head> 脚本 2：平板触屏轻量模式（减少持续重绘特效，拓扑与命中不变）
    window.CCAE_LIGHT = detectLightMode();
    root.classList.toggle("ccae-light", window.CCAE_LIGHT);

    // 场景样式 4 层（级联顺序 = 原页面 40 个 style 块顺序）
    for (const href of SCENE_STYLES) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = href;
      document.head.appendChild(link);
    }
  }, []);

  // 骨架就位后装载引擎（此时 window load 尚未触发，cluster 的 rAF 启动链不受影响）
  useEffect(() => {
    loadRuntimeScripts(RUNTIME_SCRIPTS);
  }, []);

  return (
    <div id="scene-root" dangerouslySetInnerHTML={{ __html: SCENE_SKELETON }} />
  );
}
