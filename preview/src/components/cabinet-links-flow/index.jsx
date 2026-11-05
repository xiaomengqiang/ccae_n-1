import { useEffect, useRef } from "react";
import { HOME_LINKS_SVG } from "../../mock/hc-assets.js";

// 机柜链路 SVG 替换 + 流光动画（原 #screen img.cabinet-links → SVG + HCOpticalFlow）
export default function CabinetLinksFlow() {
  const replaced = useRef(false);
  useEffect(() => {
    if (replaced.current) return;
    const original = document.querySelector("#screen img.cabinet-links");
    if (!original) return;
    replaced.current = true;
    const svg = new DOMParser().parseFromString(HOME_LINKS_SVG, "image/svg+xml").documentElement;
    svg.removeAttribute("width");
    svg.removeAttribute("height");
    svg.setAttribute("class", "cabinet-links hc-home-flow");
    svg.setAttribute("aria-hidden", "true");
    svg.querySelectorAll("path").forEach((n) => {
      n.style.opacity = "0";
      if (
        n.getAttribute("d") === "M0 72.9998C0 72.9998 74.1541 0.00011598 226.513 1.3952e-10C378.872 -0.00011598 408.537 72.3088 408.537 72.3088" &&
        n.getAttribute("transform") === "matrix(-1,0,0,1,1369.23,593.536)"
      ) {
        n.classList.add("evt-fault-link");
      }
    });
    original.after(svg);
    try {
      window.HCOpticalFlow?.(svg);
    } catch { }
  }, []);
  return null;
}
