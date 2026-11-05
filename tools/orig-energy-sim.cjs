#!/usr/bin/env node
/* 原版源码节能详情模拟器：虚拟时钟 + DOM 桩,跑 源码/home/energy/{state,energy}.js,
   输出打开→需要→报告全程的左栏内容出现顺序与时机(地面真值)。 */
'use strict';
const fs = require('fs');
const path = require('path');

/* ---------------- 虚拟时钟 ---------------- */
let NOW = 0;
const TIMERS = new Map();
let TIMER_ID = 1;
function setIntervalShim(fn, ms) { const id = TIMER_ID++; TIMERS.set(id, { id, fn, ms: ms || 0, next: NOW + (ms || 0), once: false }); return id; }
function setTimeoutShim(fn, ms) { const id = TIMER_ID++; TIMERS.set(id, { id, fn, ms: ms || 0, next: NOW + (ms || 0), once: true }); return id; }
function clearTimerShim(id) { TIMERS.delete(id); }
function advance(ms) {
  const target = NOW + ms;
  for (;;) {
    let due = null;
    for (const t of TIMERS.values()) if (t.next <= target && (!due || t.next < due.next)) due = t;
    if (!due) break;
    NOW = due.next;
    if (due.once) TIMERS.delete(due.id); else due.next += due.ms;
    try { due.fn(); } catch (e) { console.log('[timer error] ' + e.message); }
  }
  NOW = target;
}
function clockStr() { return 't=' + (NOW / 1000).toFixed(2) + 's'; }

/* ---------------- 选择器引擎(子集) ---------------- */
function parseSimple(sel) {
  // 返回 {tag,id,classes[],attrs[[name,val|null]],anyStar}
  const m = { tag: null, id: null, classes: [], attrs: [] };
  let s = sel.trim();
  if (s === '*') { m.star = true; return m; }
  const star = /^\*/.test(s); if (star) { m.star = true; s = s.slice(1); }
  const idm = s.match(/^([a-zA-Z][\w-]*)?#([\w-]+)/);
  if (idm) { if (idm[1]) m.tag = idm[1].toLowerCase(); m.id = idm[2]; s = s.slice(idm[0].length); }
  else {
    const tm = s.match(/^[a-zA-Z][\w-]*/);
    if (tm) { m.tag = tm[0].toLowerCase(); s = s.slice(tm[0].length); }
  }
  for (;;) {
    const cm = s.match(/^\.([\w-]+)/);
    if (cm) { m.classes.push(cm[1]); s = s.slice(cm[0].length); continue; }
    const am = s.match(/^\[([\w-]+)(?:="([^"]*)")?\]/);
    if (am) { m.attrs.push([am[1], am[2] === undefined ? null : am[2]]); s = s.slice(am[0].length); continue; }
    break;
  }
  return m;
}
function matchesSimple(el, part) {
  if (part.star) { /* 通用 */ }
  else if (part.tag && el.tagName.toLowerCase() !== part.tag) return false;
  if (part.id && el.id !== part.id) return false;
  const cls = el.className ? el.className.split(/\s+/).filter(Boolean) : [];
  for (const c of part.classes) if (!cls.includes(c)) return false;
  for (const [name, val] of part.attrs) {
    const v = el.getAttribute(name);
    if (v === null || v === undefined) return false;
    if (val !== null && v !== val) return false;
  }
  return true;
}
function matchesCompound(el, compound) {
  // compound: {parts:[simple...], childOf:[...]} 由 > 分割
  let node = el, segIdx = compound.length - 1;
  if (!matchesSimple(node, compound[segIdx])) return false;
  segIdx--;
  while (segIdx >= 0) {
    // 向上找父级匹配(每段之间是 >)
    let p = node.parentNode;
    let found = false;
    while (p && p.nodeType !== 9) {
      if (matchesSimple(p, compound[segIdx])) { found = true; node = p; break; }
      if (compound.childStrict) { break; }
      p = p.parentNode;
    }
    if (!found) return false;
    segIdx--;
  }
  return true;
}
function compileSelector(sel) {
  // 处理组合: A>B C  → 按空白切(简化:先按 ' > ' / '>' 子级,再按空格后代)
  const groups = [];
  for (const g of sel.split(',')) {
    const seq = [];
    // tokenizer
    let rest = g.trim();
    while (rest) {
      const m = rest.match(/^([^.#\[\*]+)?((?:[.#][\w-]+|\[[^\]]+\]|\*)*)\s*([> ]?)\s*/);
      if (!m || (!m[1] && !m[2])) break;
      const simple = parseSimple((m[1] || '') + (m[2] || ''));
      seq.push({ simple, child: m[3] === '>' });
      rest = rest.slice(m[0].length);
    }
    groups.push(seq);
  }
  return groups;
}
function matchSeq(el, seq) {
  // 从右往左;最右 simple 必须匹配 el;其左逐段:child=直接父级,否则任意祖先
  let idx = seq.length - 1;
  if (!matchesSimple(el, seq[idx].simple)) return false;
  let node = el;
  for (idx = seq.length - 2; idx >= 0; idx--) {
    const wantChild = seq[idx].child;
    let p = node.parentNode;
    let hit = null;
    while (p && p.nodeType !== 9) {
      if (matchesSimple(p, seq[idx].simple)) { hit = p; break; }
      if (wantChild) break;
      p = p.parentNode;
    }
    if (!hit) return false;
    node = hit;
  }
  return true;
}
function selMatches(el, compiled) {
  for (const g of compiled) if (matchSeq(el, g)) return true;
  return false;
}

/* ---------------- DOM 桩 ---------------- */
const listenersKey = Symbol('listeners');
class Evt { constructor(type, opts = {}) { this.type = type; Object.assign(this, opts); } preventDefault() {} }
class CustomEventShim extends Evt {}
class Element {
  constructor(tag) {
    this.tagName = tag.toUpperCase();
    this.nodeType = 1;
    this.parentNode = null;
    this.children = [];
    this.attrs = new Map();
    this.className = '';
    this.id = '';
    this.dataset = {};
    this.style = { setProperty(k, v) { this['_p_' + k] = String(v); }, getPropertyValue(k) { return this['_p_' + k]; } };
    this[listenersKey] = {};
    this.textContentSet = false;
    this.value = ''; this.disabled = false; this.type = '';
    this.placeholder = ''; this.maxLength = -1;
    this.scrollTop = 0; this.scrollHeight = 0; this.clientHeight = 0;
    this.onclick = null; this.oninput = null; this.onchange = null; this.onsubmit = null; this.onkeydown = null;
  }
  get firstElementChild() { return this.children.find(c => c.nodeType === 1) || null; }
  get firstChild() { return this.children[0] || null; }
  get lastChild() { return this.children[this.children.length - 1] || null; }
  get isConnected() { let n = this; while (n.parentNode) n = n.parentNode; return n === document; }
  setAttribute(k, v) {
    this.attrs.set(k, String(v));
    if (k === 'class') this.className = String(v);
    if (k === 'id') this.id = String(v);
    if (k === 'hidden') this.hiddenProp = true;
  }
  getAttribute(k) { if (k === 'open') return this.openProp ? '' : null; if (k === 'hidden') return this.hiddenProp ? '' : null; return this.attrs.has(k) ? this.attrs.get(k) : null; }
  removeAttribute(k) {
    if (k === 'open') { this.openProp = false; return; }
    if (k === 'hidden') { this.hiddenProp = false; return; }
    this.attrs.delete(k);
    if (k === 'class') this.className = '';
    if (k === 'id') this.id = '';
  }
  hasAttribute(k) { return this.getAttribute(k) !== null; }
  get hidden() { return !!this.hiddenProp; }
  set hidden(v) { this.hiddenProp = !!v; }
  get open() { return !!this.openProp; }
  set open(v) { this.openProp = !!v; }
  get classList() {
    const self = this;
    return {
      add: (...cs) => { const set = new Set(self.className.split(/\s+/).filter(Boolean)); cs.forEach(c => set.add(c)); self.className = [...set].join(' '); },
      remove: (...cs) => { const set = new Set(self.className.split(/\s+/).filter(Boolean)); cs.forEach(c => set.delete(c)); self.className = [...set].join(' '); },
      contains: (c) => self.className.split(/\s+/).filter(Boolean).includes(c),
      toggle: (c, f) => { const has = self.className.split(/\s+/).includes(c); const want = f === undefined ? !has : !!f; const set = new Set(self.className.split(/\s+/).filter(Boolean)); if (want) set.add(c); else set.delete(c); self.className = [...set].join(' '); },
    };
  }
  get textContent() {
    if (this.textContentSet) return this._text;
    return this.children.map(c => c.textContent).join('');
  }
  set textContent(v) { this.children = []; this._text = String(v); this.textContentSet = true; }
  set innerHTML(v) { this.children = []; this._html = String(v); this.textContentSet = false; this._text = ''; }
  get innerHTML() { return this._html || this.children.map(c => c.innerHTML !== undefined ? c.innerHTML : '').join(''); }
  append(...nodes) { for (const n of nodes) this._appendChild(n); }
  prepend(...nodes) { for (const n of [...nodes].reverse()) { n.parentNode = this; this.children.unshift(n); } }
  _appendChild(n) { if (n.parentNode) { const i = n.parentNode.children.indexOf(n); if (i >= 0) n.parentNode.children.splice(i, 1); } n.parentNode = this; this.children.push(n); }
  appendChild(n) { this._appendChild(n); return n; }
  replaceChildren(...nodes) { this.children = []; for (const n of nodes) this._appendChild(n); this.textContentSet = false; }
  insertBefore(n, ref) { const i = this.children.indexOf(ref); n.parentNode = this; if (i < 0) this.children.push(n); else this.children.splice(i, 0, n); }
  remove() { if (this.parentNode) { const i = this.parentNode.children.indexOf(this); if (i >= 0) this.parentNode.children.splice(i, 1); this.parentNode = null; } }
  contains(n) { while (n) { if (n === this) return true; n = n.parentNode; } return false; }
  closest(sel) { const c = compileSelector(sel); let n = this; while (n && n.nodeType === 1) { if (selMatches(n, c)) return n; n = n.parentNode; } return null; }
  matches(sel) { return selMatches(this, compileSelector(sel)); }
  addEventListener(type, fn) { (this[listenersKey][type] = this[listenersKey][type] || []).push(fn); }
  removeEventListener(type, fn) { const l = this[listenersKey][type]; if (l) { const i = l.indexOf(fn); if (i >= 0) l.splice(i, 1); } }
  dispatchEvent(ev) { (this[listenersKey][ev.type] || []).slice().forEach(fn => fn(ev)); return true; }
  focus() {}
  click() { if (this.onclick) this.onclick(new Evt('click')); }
  setCustomValidity() {}
  reportValidity() {}
  querySelector(sel) { return this.querySelectorAll(sel)[0] || null; }
  querySelectorAll(sel) {
    const compiled = compileSelector(sel);
    const out = [];
    const walk = (n) => { for (const c of n.children) { if (c.nodeType !== 1) continue; if (selMatches(c, compiled)) out.push(c); walk(c); } };
    walk(this);
    return out;
  }
}
class TextNode {
  constructor(t) { this.nodeType = 3; this._t = String(t); this.parentNode = null; this.children = []; }
  get textContent() { return this._t; }
  set textContent(v) { this._t = String(v); }
  get parentElement() { return this.parentNode && this.parentNode.nodeType === 1 ? this.parentNode : null; }
}
class Document extends Element {
  constructor() { super('#document'); this.nodeType = 9; this.body = new Element('body'); this._appendChild(this.body); this.activeElement = this.body; }
  createElement(tag) { return new Element(tag); }
  createElementNS(ns, tag) { return new Element(tag); }
  createTextNode(t) { return new TextNode(t); }
  createTreeWalker(root) {
    const texts = [];
    const walk = (n) => { for (const c of n.children) { if (c.nodeType === 3) texts.push(c); else walk(c); } };
    walk(root);
    let i = 0;
    return { nextNode() { return i < texts.length ? texts[i++] : null; }, get currentNode() { return texts[Math.max(0, i - 1)] || null; } };
  }
  getElementById(id) { const out = []; const walk = (n) => { for (const c of n.children) { if (c.id === id) out.push(c); walk(c); } }; walk(this); return out[0] || null; }
  querySelector(sel) { return super.querySelector(sel); }
}
const document = new Document();

/* ---------------- window / 全局 ---------------- */
const window = {
  addEventListener(t, fn) { (this._l = this._l || {}); (this._l[t] = this._l[t] || []).push(fn); },
  removeEventListener() {},
  dispatchEvent(ev) { (this._l && this._l[ev.type] || []).slice().forEach(fn => fn(ev)); return true; },
  matchMedia: () => ({ matches: false }),
  HCStory: { get: () => ({ optical: 0, energy: 0, qwen: 0 }) },
  renderStoryGuard: function () {},
  refreshWorkloadCards: function () {},
};
class MutationObserverShim { observe() {} disconnect() {} unobserve() {} }
class ResizeObserverShim { observe() {} disconnect() {} unobserve() {} }

/* 预置 DOM */
const screenEl = document.createElement('div'); screenEl.id = 'screen'; document.body._appendChild(screenEl);
const guardAll = document.createElement('section'); guardAll.id = 'guard-all'; guardAll.hiddenProp = true; document.body._appendChild(guardAll);
const homeHeader = document.createElement('header'); homeHeader.id = 'home-header'; document.body._appendChild(homeHeader);
homeHeader._appendChild(document.createElement('button'));
const homeSidebar = document.createElement('nav'); homeSidebar.id = 'home-sidebar'; document.body._appendChild(homeSidebar);
const sbBtn = document.createElement('button'); sbBtn.setAttribute('aria-label', '首页'); homeSidebar._appendChild(sbBtn);
const homeEvents = document.createElement('section'); homeEvents.id = 'home-events'; document.body._appendChild(homeEvents);
const guardBox = document.createElement('div'); guardBox.className = 'hc-guard-events'; homeEvents._appendChild(guardBox);

/* ---------------- 加载原版 ---------------- */
const SRC = 'F:\\ccae_n-1\\源码\\home';
const workloads = JSON.parse(fs.readFileSync(path.join(SRC, 'workloads.json'), 'utf8'));
const stateSrc = fs.readFileSync(path.join(SRC, 'energy', 'state.js'), 'utf8');
let energySrc = fs.readFileSync(path.join(SRC, 'energy', 'energy.js'), 'utf8');
// 右栏/实时更新与本次验证的左栏编排无关,禁用其调用点避免重 DOM 依赖
energySrc = energySrc.replace(/renderRight\(\);/g, ';');
energySrc = energySrc.replace(/\bupdateLive\(\);/g, ';');
// 与 preview 恢复修改同步:eventSession 出生识别流程(stage 0)
energySrc = energySrc.replace("const eventSession = getSession('Qwen-14B', false);", "const eventSession = getSession('Qwen-14B', true);");
// 守卫仅拦服务卡入口(识别中允许事件表入口进入查看)
energySrc = energySrc.replace("if(name==='Qwen-14B'&&eventSession.stage<4)return;", "if(name==='Qwen-14B'&&!processing&&eventSession.stage<4)return;");
// 品牌重置:Qwen-14B 重置回识别第 1 步,其余会话恢复守护态
energySrc = energySrc.replace("s.stage=4;s.effectiveAt='10:17:14';", "const isEvent=s===eventSession;s.stage=isEvent?0:4;s.effectiveAt=isEvent?null:'10:17:14';if(isEvent)s.base=12*3600+6;");

const sandbox = {
  window, document,
  HOME_WORKLOADS: workloads,
  HC_ASSETS: { icons: {} },
  setInterval: setIntervalShim, clearInterval: clearTimerShim,
  setTimeout: setTimeoutShim, clearTimeout: clearTimerShim,
  requestAnimationFrame: (fn) => setTimeoutShim(fn, 16),
  CustomEvent: CustomEventShim, Event: Evt,
  MutationObserver: MutationObserverShim, ResizeObserver: ResizeObserverShim,
  matchMedia: window.matchMedia,
  NodeFilter: { SHOW_TEXT: 4 },
  module: undefined, exports: undefined, require: undefined,
  console, Math, JSON, Number, String, Array, Object, Set, Map, Date, Blob: class {}, URL: { createObjectURL: () => '', revokeObjectURL: () => {} },
};
new Function(...Object.keys(sandbox), stateSrc)(...Object.values(sandbox));
if (!window.HCEnergyState) throw new Error('HCEnergyState 未挂载');
new Function(...Object.keys(sandbox), energySrc)(...Object.values(sandbox));

/* ---------------- 序列化 ---------------- */
function brief(el, n = 26) {
  const t = ((el && el.textContent) || '').replace(/\s+/g, ' ').trim();
  return t.slice(0, n);
}
function snap(label) {
  const root = document.getElementById('hc-energy-root');
  console.log('\n===== [' + label + '] ' + clockStr() + ' =====');
  console.log('root: hidden=' + root.hidden + ' data-phase=' + (root.dataset.phase || '-'));
  const entries = root.querySelectorAll('.hc-energy-left-scroll>.hc-energy-step>summary,.hc-energy-left-scroll>.hc-energy-step[open]>.hc-energy-logs,.hc-energy-left-scroll>.hc-energy-step[open]>.hc-energy-substeps,.hc-energy-prompt,.hc-energy-chat>*');
  console.log('cascade entries: ' + entries.length);
  entries.forEach((e, i) => {
    const delay = e.style.getPropertyValue('--evt-enter-delay') || '(none)';
    const enter = e.classList.contains('hc-energy-left-enter') ? 'enter' : '-';
    console.log('  [' + i + '] ' + delay.padEnd(8) + enter.padEnd(6) + ' <' + e.tagName.toLowerCase() + ' class="' + e.className + '"> ' + brief(e, 34));
  });
  const groups = root.querySelectorAll('.hc-energy-left-scroll>.hc-energy-step');
  for (const g of groups) {
    const sum = g.querySelector(':scope>summary') || g.children[0];
    const state = g.dataset.state || '-';
    console.log((g.classList.contains('hc-energy-strategy-group') ? 'STRATEGY' : 'MONITOR ') + ' group: open=' + g.open + ' state=' + state + ' summary="' + brief(sum, 22) + '"');
    const subs = g.querySelectorAll('.hc-energy-substeps>.hc-energy-step');
    subs.forEach((d, i) => {
      const st = d.dataset.state;
      const tm = (d.querySelector('.hc-energy-step-time') || {}).textContent || '';
      const nm = brief(d.children[0], 12);
      console.log('    step' + i + ' state=' + st + ' time=' + tm + ' "' + nm + '" children=' + d.children.length);
    });
    const logs = g.querySelectorAll('.hc-energy-logs>.hc-energy-log');
    logs.forEach((b) => {
      const tm = (b.querySelector('time') || {}).textContent || '';
      const st = b.querySelector('strong');
      console.log('    log ' + tm + ' "' + brief(st, 40) + '"' + (b.classList.contains('selected') ? ' [selected]' : ''));
    });
    const la = g.querySelector('.hc-energy-log-actions');
    if (la) console.log('    log-actions children=' + la.children.length);
  }
  const prompt = root.querySelector('.hc-energy-prompt');
  console.log('prompt: ' + (prompt ? '"' + brief(prompt, 40) + '"' : '(无)'));
  const chat = root.querySelector('.hc-energy-chat');
  if (chat) {
    console.log('chat children=' + chat.children.length);
    chat.children.forEach((c, i) => {
      if (c.classList.contains('hc-energy-question')) console.log('  [' + i + '] Q: ' + brief(c, 34));
      else {
        const intro = c.querySelector('p');
        const steps = c.querySelectorAll('.hc-energy-progress>li');
        const card = c.querySelector('.hc-energy-report-card');
        console.log('  [' + i + '] A: intro="' + brief(intro, 24) + '" steps=' + steps.length + (card ? ' +card' : ''));
        steps.forEach((li, k) => console.log('       step' + k + ' ' + li.className + ' "' + brief(li, 24) + '"'));
      }
    });
  }
  const scroll = root.querySelector('.hc-energy-left-scroll');
  if (scroll) console.log('scroll: top=' + scroll.scrollTop + ' (height=' + scroll.scrollHeight + ')');
}

/* ---------------- 场景:恢复编排后(事件表 energy-wait 行)打开 → 策略阶段 → 需要 ---------------- */
console.log('### 事件表节能行(识别中 energy-wait)点击 → 策略阶段编排');
window.openEnergyEvent({ object: '推理服务 / Qwen-14B', stateClass: 'energy-wait' });
snap('打开瞬间(第1步)');
for (let k = 1; k <= 20; k++) { advance(1000); if ([1, 3, 4, 5, 7, 8, 9, 11, 12, 15, 16, 17, 20].includes(k)) snap('t+' + k + 's'); }
const root = document.getElementById('hc-energy-root');
const needBtn = root.querySelector('.hc-energy-prompt button');
if (needBtn) { console.log('\n### 点击"需要"'); needBtn.click(); snap('需要点击后'); }
advance(1000 * 2); snap('报告+2秒');
advance(1000 * 3); snap('报告+5秒(应完成)');
console.log('\n### 关闭后重开(恢复会话)');
window.closeEnergyDetail();
window.openEnergyEvent({ object: '推理服务 / Qwen-14B', stateClass: 'energy-done' });
snap('重开瞬间');
console.log('\n### 品牌重置后再开(应回到第1步)');
document.querySelector('#home-header button').dispatchEvent(new Evt('click'));
window.openEnergyEvent({ object: '推理服务 / Qwen-14B', stateClass: 'energy-wait' });
snap('重置后打开');
