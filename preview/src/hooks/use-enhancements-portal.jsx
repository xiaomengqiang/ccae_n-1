import { useEffect, useRef, useState } from "react";
import { HC_ASSETS, HOME_LINKS_SVG } from "../mock/hc-assets.js";

const createPortal = (node, host) => ReactDOM.createPortal(node, host);

// CabinetLinksFlow —— 机柜链路 SVG 替换 + 流光动画
function CabinetLinksFlow() {
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

// EnergyInfoIcon —— 能耗信息区域添加图标
function EnergyInfoIcon() {
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

// SelectDecorator —— select 美化器
// trigger: portal 到 select 的 wrapper（absolute 覆盖）
// menu: portal 到 #screen（和原版一致，getBoundingClientRect 定位）
function SelectDecorator({ targetSelector, mode = false }) {
  const [wrapper, setWrapper] = useState(null);
  const [screen, setScreen] = useState(null);
  const [select, setSelect] = useState(null);
  const [open, setOpen] = useState(false);
  const [selectedText, setSelectedText] = useState("");
  const [menuPos, setMenuPos] = useState({ left: 0, top: 0 });
  const triggerRef = useRef(null);

  useEffect(() => {
    const scr = document.getElementById("screen");
    if (!scr) return;
    let el = null;
    let bound = false;
    let cleanup = null;
    const bind = (node) => {
      if (bound) return;
      bound = true;
      setWrapper(node.parentElement);
      setScreen(scr);
      setSelect(node);
      node.tabIndex = -1;
      node.setAttribute("aria-hidden", "true");
      node.style.pointerEvents = "none";
      setSelectedText(node.options[node.selectedIndex]?.textContent || "");
      const handleChange = () => {
        setSelectedText(node.options[node.selectedIndex]?.textContent || "");
      };
      node.addEventListener("change", handleChange);
      cleanup = () => node.removeEventListener("change", handleChange);
    };
    el = document.querySelector(targetSelector);
    if (el) {
      bind(el);
    } else {
      // 目标 select 可能由 React 异步渲染（如 #home-header 内），等待出现后再绑定
      const obs = new MutationObserver(() => {
        const found = document.querySelector(targetSelector);
        if (found) {
          obs.disconnect();
          bind(found);
        }
      });
      obs.observe(document.body, { childList: true, subtree: true });
      cleanup = () => obs.disconnect();
    }
    return () => { cleanup?.(); };
  }, [targetSelector]);

  useEffect(() => {
    if (!select || mode) return;
    select.style.opacity = "0";
    const span = select.parentElement?.querySelector("span");
    if (span) span.setAttribute("hidden", "");
  }, [select, mode]);

  useEffect(() => {
    if (!open || !wrapper || !screen) return;
    const wr = wrapper.getBoundingClientRect();
    const sr = screen.getBoundingClientRect();
    const scale = sr.width / 1920;
    setMenuPos({
      left: (wr.left - sr.left) / scale + "px",
      top: (wr.bottom - sr.top) / scale + 8 + "px",
    });
  }, [open, wrapper, screen]);

  useEffect(() => {
    if (!open) return;
    const close = (e) => {
      if (!e.target.closest(".hc-select-trigger") && !e.target.closest(".hc-select-menu")) {
        setOpen(false);
      }
    };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [open]);

  if (!wrapper || !select) return null;

  const options = [...select.options].map((opt) => ({ value: opt.value, text: opt.textContent }));

  const choose = (value) => {
    select.value = value;
    select.dispatchEvent(new Event("change", { bubbles: true }));
    setSelectedText(options.find((o) => o.value === value)?.text || "");
    setOpen(false);
    triggerRef.current?.focus();
  };

  const openMenu = () => {
    setOpen(true);
  };

  return (
    <>
      {createPortal(
        <button
          ref={triggerRef}
          type="button"
          className="hc-select-trigger"
          aria-label={select.getAttribute("aria-label") || ""}
          aria-haspopup="listbox"
          aria-expanded={String(open)}
          onClick={() => { if (open) setOpen(false); else openMenu(); }}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") { e.preventDefault(); openMenu(); }
            if (e.key === "Escape") setOpen(false);
          }}
        >
          {mode ? "" : selectedText}
        </button>,
        wrapper
      )}
      {open && screen && createPortal(
        <div className="hc-select-menu" role="listbox" style={{ left: menuPos.left, top: menuPos.top }}>
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              role="option"
              aria-selected={String(select.value === opt.value)}
              onClick={() => choose(opt.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape") { setOpen(false); triggerRef.current?.focus(); }
                if (e.key === "ArrowDown" || e.key === "ArrowUp") {
                  e.preventDefault();
                  const idx = options.findIndex((o) => o.value === opt.value);
                  const next = options[(idx + (e.key === "ArrowDown" ? 1 : -1) + options.length) % options.length];
                  choose(next.value);
                }
              }}
            >
              {opt.text}
            </button>
          ))}
        </div>,
        screen
      )}
    </>
  );
}

export default function EnhancementsPortal() {
  return (
    <>
      <CabinetLinksFlow />
      <EnergyInfoIcon />
      <SelectDecorator targetSelector="#home-header select" mode={true} />
      <SelectDecorator targetSelector="#range" />
    </>
  );
}
