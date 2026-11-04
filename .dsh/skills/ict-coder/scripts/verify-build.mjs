#!/usr/bin/env node
// verify-build.mjs — 对构建产物 index.page.html 的无头验证(无需浏览器)。
//
// 用与页面相同的本地 UMD 库(React → ReactDOM → dayjs → antd → Babel)在 Node 中
// 重建运行时:提取产物内的 text/babel 脚本,用 Babel 按浏览器方式编译,在带 DOM
// stub 的沙箱中执行,断言 ReactDOM.createRoot(...).render(<App/>) 恰好执行一次。
//
// Usage:  node verify-build.mjs --dir "<scaffold path>"

import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

// --- parse --dir argument (the scaffold path to verify) ---
const args = process.argv.slice(2);
const dirIdx = args.findIndex((a) => a === "--dir" || a === "-d");
if (dirIdx === -1 || !args[dirIdx + 1]) {
  console.error('FAIL  Missing --dir <scaffold path>. Usage: node verify-build.mjs --dir "<path>"');
  process.exit(1);
}
const ROOT = resolve(args[dirIdx + 1]);

const HTML = resolve(ROOT, "index.page.html");
const LIB = (name) => resolve(ROOT, "assets/library", name);

// --- minimal DOM/browser stubs (enough for UMD module initialization) ---
let stubDocument; // 先声明(stubElement 在其初始化期间即被调用,此时为 undefined)

function stubElement() {
  const el = {
    nodeType: 1,
    style: { setProperty() {}, getPropertyValue() { return ""; }, removeProperty() {} },
    sheet: { insertRule() {}, cssRules: [] },
    setAttribute() {},
    getAttribute() { return null; },
    removeAttribute() {},
    appendChild(child) { return child; },
    removeChild(child) { return child; },
    remove() {},
    insertBefore(child) { return child; },
    insertAdjacentElement(_pos, child) { return child; },
    append(...children) { return children[children.length - 1]; },
    prepend() {},
    replaceChild(child) { return child; },
    cloneNode() { return stubElement(); },
    addEventListener() {},
    removeEventListener() {},
    dispatchEvent() { return true; },
    classList: { add() {}, remove() {}, contains() { return false; }, toggle() {} },
    dataset: {},
    attachShadow() { return stubElement(); },
    shadowRoot: null,
    querySelector() { return null; },
    querySelectorAll() { return []; },
    getElementsByTagName() { return []; },
    getElementsByClassName() { return []; },
    matches() { return false; },
    closest() { return null; },
    contains() { return false; },
    hasAttribute() { return false; },
    getBoundingClientRect() { return { top: 0, left: 0, right: 0, bottom: 0, width: 0, height: 0, x: 0, y: 0 }; },
    scrollIntoView() {},
    focus() {},
    blur() {},
    click() {},
    childNodes: [],
    children: [],
    firstChild: null,
    lastChild: null,
    parentNode: null,
    parentElement: null,
    nextSibling: null,
    previousSibling: null,
    offsetWidth: 0,
    offsetHeight: 0,
    clientWidth: 0,
    clientHeight: 0,
    textContent: "",
    innerHTML: "",
    tagName: "DIV",
    ownerDocument: null,
  };
  el.ownerDocument = stubDocument;
  return el;
}

const listeners = {};
stubDocument = {
  nodeType: 9,
  createElement: stubElement,
  createTextNode: () => ({ nodeType: 3, textContent: "" }),
  createDocumentFragment: stubElement,
  createComment: () => ({ nodeType: 8, textContent: "" }),
  getElementById: () => stubElement(),
  querySelector: () => null,
  querySelectorAll: () => [],
  getElementsByTagName: () => [],
  getElementsByClassName: () => [],
  addEventListener(type, fn) { (listeners[type] = listeners[type] || []).push(fn); },
  removeEventListener() {},
  dispatchEvent() { return true; },
  documentElement: stubElement(),
  head: stubElement(),
  body: stubElement(),
  contains() { return false; },
  importNode(node) { return node; },
  adoptNode(node) { return node; },
  implementation: { hasFeature() { return true; }, createHTMLDocument() { return stubDocument; } },
  visibilityState: "visible",
  hidden: false,
  currentScript: null,
  fonts: { check: () => true },
};
const raf = (cb) => setTimeout(() => cb(Date.now()), 0);
const stubWindow = {
  document: stubDocument,
  addEventListener: stubDocument.addEventListener,
  removeEventListener() {},
  dispatchEvent() { return true; },
  navigator: { userAgent: "node", platform: process.platform, language: "zh-CN", languages: ["zh-CN"], vendor: "" },
  location: { href: "file:///index.page.html", protocol: "file:", host: "", hostname: "", origin: "null", pathname: "/", search: "", hash: "" },
  history: { pushState() {}, replaceState() {}, go() {}, back() {}, forward() {} },
  getComputedStyle: () => ({ getPropertyValue: () => "", removeProperty() {}, setProperty() {} }),
  matchMedia: () => ({ matches: false, media: "", addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {}, dispatchEvent() { return false; } }),
  requestAnimationFrame: raf,
  cancelAnimationFrame: (id) => clearTimeout(id),
  requestIdleCallback: raf,
  cancelIdleCallback: (id) => clearTimeout(id),
  setTimeout, clearTimeout, setInterval, clearInterval,
  MutationObserver: class { observe() {} disconnect() {} takeRecords() { return []; } },
  ResizeObserver: class { observe() {} unobserve() {} disconnect() {} },
  IntersectionObserver: class { observe() {} unobserve() {} disconnect() {} takeRecords() { return []; } },
  CustomEvent: class { constructor(t, o) { this.type = t; this.detail = o?.detail; } },
  Event: class { constructor(t) { this.type = t; } },
  MessageChannel: class { constructor() { this.port1 = {}; this.port2 = {}; } },
  devicePixelRatio: 1,
  innerWidth: 1920,
  innerHeight: 1080,
  opener: null,
  closed: false,
};
stubWindow.self = stubWindow;
stubWindow.top = stubWindow;
stubWindow.parent = stubWindow;
stubWindow.window = stubWindow;

function loadUmd(code, sandboxRequire, globalTarget) {
  const module = { exports: {} };
  const fn = new Function(
    "module", "exports", "require", "window", "document", "self", "navigator", "location", "history", "matchMedia", "requestAnimationFrame", "MutationObserver", "ResizeObserver", "getComputedStyle", "CustomEvent", "Event", "MessageChannel", "devicePixelRatio",
    code
  );
  // UMD 头部通过 this / e 传入全局对象;new Function 内非严格模式 this === globalThis
  fn.call(
    globalTarget || globalThis,
    module, module.exports,
    sandboxRequire || (() => { throw new Error("unexpected require"); }),
    stubWindow, stubDocument, stubWindow, stubWindow.navigator, stubWindow.location, stubWindow.history,
    stubWindow.matchMedia, stubWindow.requestAnimationFrame, stubWindow.MutationObserver, stubWindow.ResizeObserver,
    stubWindow.getComputedStyle, stubWindow.CustomEvent, stubWindow.Event, stubWindow.MessageChannel, stubWindow.devicePixelRatio
  );
  return module.exports;
}

const React = loadUmd(await readFile(LIB("react.production.min.js"), "utf8"));
globalThis.React = React; // react-intl 离线包的 require shim 消费全局 React
const ReactDOM = loadUmd(await readFile(LIB("react-dom.production.min.js"), "utf8"), (name) => {
  if (name === "react") return React;
  throw new Error(`unexpected require: ${name}`);
});
const dayjs = loadUmd(await readFile(LIB("dayjs.min.js"), "utf8"));
let antd = loadUmd(
  await readFile(LIB("antd.min.js"), "utf8"),
  (name) => {
    if (name === "react") return React;
    if (name === "react-dom") return ReactDOM;
    if (name === "dayjs") return dayjs;
    throw new Error(`unexpected require: ${name}`);
  },
  stubWindow // antd UMD 以 window 作为全局根(e.antd = t(e.React, ...))
);
// antd 组件多为 React.forwardRef 产物 — typeof 是 "object" 而非 "function",
// 以 version 字符串 + 关键组件存在性判断加载是否成功
function antdLoadedOk(a) {
  return !!(a && typeof a.version === "string" && a.Button && a.ConfigProvider);
}
if (!antdLoadedOk(antd) && stubWindow.antd && antdLoadedOk(stubWindow.antd)) {
  antd = stubWindow.antd; // UMD 走了浏览器分支时挂到 window.antd
}
if (!antdLoadedOk(antd)) {
  const keys = antd ? Object.keys(antd).slice(0, 30) : [];
  console.error(`FAIL  antd UMD did not expose components (typeof=${typeof antd}, keys=${keys.length}: ${keys.join(", ")})`);
  process.exit(1);
}
console.log(`PASS  antd ${antd.version} loaded (Button/ConfigProvider present)`);

// echarts + hui-charts — 图表库(页面 import Chart 组件时使用)。
// echarts 在无头环境导入较重,加载失败(如 canvas 探测)不阻断验证 — 图表渲染本就需真实浏览器。
try {
  const echarts = loadUmd(await readFile(LIB("echarts.min.js"), "utf8"));
  globalThis.echarts = echarts;
  stubWindow.echarts = echarts; // 产物脚本执行时 window 参数是 stubWindow,需与浏览器语义对齐
  if (typeof echarts.init !== "function") throw new Error("echarts.init missing");
  console.log(`PASS  echarts loaded (init present)`);
  try {
    const mod = loadUmd(
      await readFile(LIB("hui-charts.umd.js"), "utf8"),
      (n) => {
        if (n === "echarts" || n.startsWith("echarts/")) return echarts;
        throw new Error(`unexpected require: ${n}`);
      }
    );
    const HUICharts = typeof mod === "function" ? mod : mod.default;
    globalThis.HUICharts = HUICharts;
    stubWindow.HUICharts = HUICharts;
    if (typeof HUICharts !== "function") throw new Error("HUICharts is not a constructor");
    console.log(`PASS  hui-charts loaded (HUICharts global present)`);
  } catch (e) {
    console.log(`NOTE  hui-charts headless load skipped: ${e.message}`);
  }
} catch (e) {
  console.log(`NOTE  echarts headless load skipped: ${e.message}`);
}

// react-intl offline bundle — 自挂 globalThis.ReactIntl(页面 import 时使用)
new Function(await readFile(LIB("react-intl.umd.js"), "utf8"))();
if (!globalThis.ReactIntl || typeof globalThis.ReactIntl.IntlProvider !== "function") {
  throw new Error("react-intl.umd.js did not expose ReactIntl");
}
console.log(`PASS  react-intl loaded (ReactIntl global present)`);

const Babel = loadUmd(await readFile(LIB("babel.min.js"), "utf8"));
if (typeof Babel.transform !== "function") {
  throw new Error("Babel standalone did not expose transform()");
}

const html = await readFile(HTML, "utf8");
const match = html.match(/<script type="text\/babel"[^>]*>([\s\S]*?)<\/script>/);
if (!match) throw new Error("No text/babel script found in index.page.html");
const script = match[1];

let compiled;
try {
  // classic 运行时 — 与产物 HTML 中注册的 react-classic preset 保持一致
  compiled = Babel.transform(script, { presets: [["react", { runtime: "classic" }]] }).code;
  console.log("PASS  Babel compiled the inline script (JSX syntax valid)");
} catch (err) {
  console.error("FAIL  Babel compilation error:");
  console.error(err.message);
  process.exit(1);
}

let renderedElement = null;
let renderCount = 0;
const realCreateRoot = ReactDOM.createRoot;
ReactDOM.createRoot = () => ({
  render: (el) => { renderedElement = el; renderCount++; },
});

try {
  const fn = new Function("React", "ReactDOM", "antd", "dayjs", "document", "window", compiled);
  fn(React, ReactDOM, antd, dayjs, stubDocument, stubWindow);
} catch (err) {
  console.error("FAIL  Runtime error while executing modules:");
  console.error(err.stack || err.message);
  process.exit(1);
} finally {
  ReactDOM.createRoot = realCreateRoot;
}

if (!renderedElement || renderCount !== 1) {
  console.error(`FAIL  Expected exactly 1 render call, got ${renderCount}`);
  process.exit(1);
}

const type = renderedElement && renderedElement.type;
const name = typeof type === "function" ? (type.name || "(anonymous)") : String(type);
console.log(`PASS  ReactDOM.createRoot().render() called once with <${name}/>`);
console.log(`OK    index.page.html verified`);
