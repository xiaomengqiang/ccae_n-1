import { CONTOUR_TEMPLATE } from "./contour-template.js";

export function prepareContour(imgEl) {
  const source = decodeURIComponent(escape(atob(imgEl.src.split(",")[1])));
  const doc = new DOMParser().parseFromString(source, "image/svg+xml");
  const outline = doc.querySelector("clipPath path").getAttribute("d");
  const svg = new DOMParser().parseFromString(CONTOUR_TEMPLATE, "image/svg+xml").documentElement;
  svg.querySelectorAll("g[mask]").forEach((el) => el.remove());
  svg.querySelectorAll("[data-contour][stroke]").forEach((el) => el.remove());
  const ns = "http://www.w3.org/2000/svg";
  const root = svg;
  const defs = root.querySelector("defs");
  const gradient = document.createElementNS(ns, "linearGradient");
  gradient.id = "home-native-rim";
  gradient.setAttribute("x1", "0"); gradient.setAttribute("y1", "0"); gradient.setAttribute("x2", "1"); gradient.setAttribute("y2", "0");
  gradient.innerHTML = '<stop stop-color="#fe9466" stop-opacity=".45"/><stop offset=".48" stop-color="#ad66ff" stop-opacity=".25"/><stop offset="1" stop-color="#66a0ff" stop-opacity=".5"/>';
  defs.append(gradient);
  const fade = document.createElementNS(ns, "linearGradient");
  fade.id = "home-native-rim-fade";
  fade.setAttribute("x1", "0"); fade.setAttribute("y1", "0"); fade.setAttribute("x2", "0"); fade.setAttribute("y2", "1");
  fade.innerHTML = '<stop stop-color="white"/><stop offset=".3" stop-color="white"/><stop offset="1" stop-color="black"/>';
  defs.append(fade);
  const mask = document.createElementNS(ns, "mask");
  mask.id = "home-native-fade-mask";
  mask.innerHTML = '<rect width="474" height="786" fill="url(#home-native-rim-fade)"/>';
  defs.append(mask);
  const rim = document.createElementNS(ns, "path");
  rim.setAttribute("data-contour", "");
  rim.setAttribute("fill", "none");
  rim.setAttribute("stroke", "url(#home-native-rim)");
  rim.setAttribute("stroke-width", "1.5");
  rim.setAttribute("stroke-linejoin", "round");
  rim.setAttribute("mask", "url(#home-native-fade-mask)");
  root.append(rim);
  return { outline, inner: root.innerHTML, width: root.getAttribute("width") || "474.000000" };
}

export function computeFit(outline, eventsEl) {
  const bottom = Math.max(880, eventsEl.parentElement.clientHeight - 78, eventsEl.offsetTop + eventsEl.offsetHeight + 22);
  const shift = bottom - 109 - 755.23;
  let axis = 0;
  const d = outline.replace(/[A-Za-z]|-?\d*\.?\d+/g, (t) => {
    if (/^[A-Za-z]$/.test(t)) { axis = 0; return t; }
    const value = Number(t);
    return String(axis++ % 2 === 1 && value > 700 ? value + shift : value);
  });
  return { d, rimBottom: 755.23 + shift };
}

export function applyFit(svgEl, geometry) {
  const { d, rimBottom } = geometry;
  svgEl.querySelectorAll("[data-contour]").forEach((p) => p.setAttribute("d", d));
  svgEl.querySelectorAll("clipPath rect").forEach((el) => el.setAttribute("height", rimBottom));
  svgEl.querySelectorAll("#home-native-fade-mask rect").forEach((el) => el.setAttribute("height", rimBottom));
  svgEl.querySelectorAll('foreignObject[x="8.000000"]').forEach((el) => el.setAttribute("height", rimBottom - 6));
  svgEl.querySelectorAll('linearGradient[y1="683.22998"]').forEach((el) => el.setAttribute("data-bottom-gradient", ""));
  svgEl.querySelectorAll("[data-bottom-gradient]").forEach((el) => el.setAttribute("y1", rimBottom));
}
