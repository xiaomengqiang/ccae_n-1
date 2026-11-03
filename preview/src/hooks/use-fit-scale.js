import { useEffect, useState } from "react";

// 1920×1080 固定画布等比缩放 —— 监听窗口 resize，设置 --home-scale CSS 变量和 transform
export function useFitScale() {
  useEffect(() => {
    const screen = document.getElementById("screen");
    if (!screen) return;
    function fit() {
      const s = Math.min(window.innerWidth / 1920, window.innerHeight / 1080);
      screen.style.setProperty("--home-scale", s);
      screen.style.transform = `scale(${s})`;
      screen.style.left = (window.innerWidth - 1920 * s) / 2 + "px";
      screen.style.top = (window.innerHeight - 1080 * s) / 2 + "px";
    }
    window.addEventListener("resize", fit);
    fit();
    return () => window.removeEventListener("resize", fit);
  }, []);
}
