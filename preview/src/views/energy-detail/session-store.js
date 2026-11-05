// session-store.js —— 节能详情会话仓库（模块级单例，纯 JS）
// 职责：sessions 注册表、open/close/reset、每秒 tick、识别定时器、
//      hc-energy-change/reset 事件桥、渲染订阅（notify）
// 对外契约与 legacy.js 完全一致：window API 由 index.jsx 注册到本模块动作上
import { create, advance, appendLog, requestReport } from "../../utils/energy-state.js";
import { HOME_WORKLOADS } from "../../mock/workloads.js";

const service = (name) => HOME_WORKLOADS.inference.find((x) => x.data.name === name)?.data || { name, npu: "128", energyTotal: "1280 kWh", energySaved: "163 kWh", energyGain: "11.3 %", ttft: "2.5 ms", tpot: "12.3 ms" };

const sessions = new Map();
function ensureSession(name, processing = false) {
  if (!sessions.has(name)) sessions.set(name, create(name, service(name), processing));
  return sessions.get(name);
}

// ---- 渲染订阅 -------------------------------------------------------------
const listeners = new Set();
export function subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); }
function notify() { listeners.forEach((fn) => fn()); }

// ---- 全局状态 -------------------------------------------------------------
let current = null;          // 当前打开的会话（null = 面板关闭）
let visible = false;         // 对应 legacy 的 root.hidden 取反
let openSeq = 0;             // 每次 open 自增，React 用作 key 触发整树重建
let tickTimer = null;
let recognitionTimer = null;
let lastFocus = null;
let homeSync = null;         // augmentHome 桥（index.jsx 注册）
let leftScrollEl = null;     // 左栏滚动容器（chat 跟随滚动用）
let rightScrollEl = null;    // 右栏滚动容器（页签切换保存/恢复滚动位置用）
let pendingFollow = false;

export function registerHomeSync(fn) { homeSync = fn; }
export function registerLeftScroll(el) { leftScrollEl = el; }
export function registerRightScroll(el) { rightScrollEl = el; }
export function getCurrent() { return current; }
export function getOpenSeq() { return openSeq; }
export function getSessionByName(name) { return sessions.get(name) || null; }

// ---- 首页指标联动 ---------------------------------------------------------
function syncSavingServices() {
  const data = HOME_WORKLOADS.inference.find((x) => x.data.name === "Qwen-14B").data;
  data.energySaving = eventSession.stage === 4;
  const count = HOME_WORKLOADS.inference.filter((x) => x.data.energySaving).length;
  const value = document.querySelector('.hc-metric-group[data-category="inference"]')?.querySelectorAll(".hc-metric-content>b")[5];
  if (value) value.textContent = count;
  window.refreshWorkloadCards?.();
}

function notifyEvents() {
  syncSavingServices();
  for (const session of sessions.values()) window.dispatchEvent(new CustomEvent("hc-energy-change", { detail: { name: session.name, done: session.stage === 4, time: session.effectiveAt } }));
  window.renderStoryGuard?.();
  homeSync?.();
}

// 模块初始化：Qwen-14B 演示会话（守护态 stage 4，事件表首行即"节能策略执行中/已开启节能"，
// 打开详情即完成态：策略组完成收起、运行监控自动推进），并同步 workloads 的 energySaving 标记
const eventSession = ensureSession("Qwen-14B", false);
syncSavingServices();

// ---- 打开 / 关闭 ---------------------------------------------------------
function stopTimer() { clearInterval(tickTimer); tickTimer = null; }

export function openSession(name, processing = false) {
  if (name === "Qwen-14B" && eventSession.stage < 4) return;
  stopTimer();
  window.closeOpticalEvent?.();
  window.closeNicEvent?.();
  lastFocus = document.activeElement;
  current = ensureSession(name, processing);
  visible = true;
  if (current.stage === 4 && !current.logs.length) appendLog(current);
  openSeq++;
  notify();
  tickTimer = setInterval(tick, 1000);
}

export function closeSession() {
  stopTimer();
  visible = false;
  current = null;
  notify();
}

export function getLastFocus() { return lastFocus; }

// 首页 header（iMaster CCAE logo）重置：关闭面板并恢复所有会话的守护态
export function resetAll() {
  closeSession();
  for (const s of sessions.values()) {
    s.elapsed = 0; s.liveTick = 0; s.chartTick = 0; s.logElapsed = 0; s.logs = []; s.history = null;
    s.report = null; s.reports = []; s.prompt = true; s.tab = "service"; s.reportTabOpen = false;
    s.rightScroll = {}; s.expanded = false; s.expandedSteps.clear(); s.stage = 4; s.effectiveAt = "10:17:14";
    s.stageElapsed = 0; s.strategyGroupOpen = undefined; s.typedSteps = new Set(); s.monitorOpen = true;
    s.composerText = ""; s.reportElapsed = 0;
  }
  window.dispatchEvent(new CustomEvent("hc-energy-reset"));
  notifyEvents();
  notify();
}

// ---- 每秒 tick -----------------------------------------------------------
function tick() {
  if (!current || !visible) return;
  const changed = advance(current);
  if (changed.stage) notifyEvents();
  if (changed.report) captureFollow();
  notify();
}

// 识别定时器：节能故事线激活时推进 Qwen-14B 会话（面板打开显示它时暂停）
export function startRecognition() {
  if (recognitionTimer) return;
  recognitionTimer = setInterval(() => {
    const story = window.HCStory?.get();
    if (!story || !story.energy || eventSession.stage === 4 || (current === eventSession && visible)) return;
    const changed = advance(eventSession);
    if (changed.stage) notifyEvents();
  }, 187.5);
}

export function clearTimers() {
  stopTimer();
  clearInterval(recognitionTimer);
  recognitionTimer = null;
}

// ---- 左栏交互动作 ---------------------------------------------------------
export function setHistory(i) { if (current) { current.history = current.history === i ? null : i; notify(); } }
export function setMonitorOpen(open) { if (current) current.monitorOpen = open; }
export function setStrategyGroupOpen(open) { if (current) current.strategyGroupOpen = open; }
export function setNodeRange(v) { if (current) { current.nodeRange = v; notify(); } }
export function setComposerText(t) { if (current) current.composerText = t; }

export function askReport(question) {
  const s = current;
  if (!s || !requestReport(s, question)) return;
  // legacy requestReport：点击"需要"后无条件滚到会话底部（问题/回答立即进入视野），
  // 后续每秒进度才按"距底 <40px 跟随"规则（captureFollow）
  pendingFollow = true;
  notify();
}

function captureFollow() {
  pendingFollow = !!(leftScrollEl && leftScrollEl.scrollHeight - leftScrollEl.clientHeight - leftScrollEl.scrollTop < 40);
}
export function consumeFollow() { const v = pendingFollow; pendingFollow = false; return v; }

// ---- 右栏页签动作 ---------------------------------------------------------
export function switchTab(tab) {
  const s = current;
  if (!s) return;
  s.rightScroll ||= {};
  s.rightScroll[s.tab] = rightScrollEl?.scrollTop ?? 0;
  s.tab = tab;
  notify();
}
export function openReportTab() { if (current) { current.reportTabOpen = true; switchTab("report"); } }
export function closeReportTab() { if (current) { current.reportTabOpen = false; switchTab("service"); } }
