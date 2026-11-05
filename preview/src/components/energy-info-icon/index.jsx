import { useEffect, useRef } from "react";
import { HC_ASSETS } from "../../mock/hc-assets.js";

// 能耗信息区域添加图标（.energy-info 前置 tips 图标）
export default function EnergyInfoIcon() {
  const done = useRef(false);
  useEffect(() => {
    if (done.current) return;
    const info = document.querySelector(".energy-info");
    if (!info) return;
    done.current = true;
    info.firstChild.textContent = "";
    const img = document.createElement("img");
    img.src = HC_ASSETS.icons["tips-0909"];
    img.alt = "";
    info.prepend(img);
  }, []);
  return null;
}
