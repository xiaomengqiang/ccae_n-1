// Layer 4 helper — 场景静态骨架与运行时清单
// 骨架 = 原页面 <body> 的 #fit/#screen 结构原样搬运（引擎在该 DOM 上接管：
// main/boot-utils 查询 #screen/#fit 并填充 #modeseg/#tabs/#tree/#kpis 等容器）。
//
// RUNTIME_SCRIPTS 是引擎的「执行清单」——经典脚本共享全局词法环境，
// 顺序 = 原页面脚本顺序，不可打乱（文件名无编号，顺序由本清单唯一定义）。域目录：
//   src/main/     2D 场景引擎（原 main 脚本按章节横幅拆分，拼接与原文件逐字节一致）
//   src/room/     机房视图与逐版修饰层（原 room 脚本按顶层声明分组拆分）
//   src/core/     超节点选择（自包含 IIFE，整文件）
//   assets/library/three.min.js + src/scene-racktex.js   3D 库与机柜贴图索引
//   src/cluster/  集群 3D 视图（自包含 IIFE，整文件）
//   src/scene-fit.js  缩放收尾
//   src/styles/   场景样式 4 层（运行时 <link> 注入，级联顺序 = 原页面 40 个 style 块）

export const SCENE_SKELETON = `
<div id="fit"><div id="screen" data-theme="neon">

  <div id="top">
    <div class="toprow">
      <div class="brandcol">
        <div class="logo"></div>
        <div><h1>CCAE 智算集群数字地图</h1>
          <div class="b2">Atlas 950 超节点</div></div>
      </div>
      <div class="layerbox" style="margin-left:auto"><span class="lbl">叠加图层</span><div class="seg" id="modeseg"></div></div>
    </div>
  </div>

  <div id="body">
    <div class="pane" id="left">
      <div id="navwrap">
        <div class="navseg" id="navseg">
          <button data-nav="res" class="on">资源视角</button><button data-nav="biz">业务视角</button>
        </div>
        <div class="sub" id="treecnt" style="display:none"></div>
        <div id="srch"><span style="color:var(--tx3);font-size:21px">🔍</span><input id="q" placeholder="搜索对象，如 Pod-11 / Udie"></div>
        <div class="tabs" id="tabs"></div>
        <div id="tree"></div>
        <!-- v3.27：作业列表的状态筛选，与上面资源树的分类 tab 用同一套 .tabs / .tab 样式 -->
        <div class="tabs" id="biztabs" style="display:none"></div>
        <div id="bizlist" style="display:none"></div>
      </div>
    </div>

    <div class="pane" id="center">
      <div id="stage-bar">
        <div id="crumbs"></div>
        <button class="btn zoom" id="zoomBtn" style="display:none">⤢ 退出聚焦</button>
        <button class="btn" id="backBtn">← 返回</button>
        <div class="seg vseg" id="viewseg" style="display:none"></div>
      </div>
      <div id="stage"><div id="stageInner"></div>
        <div id="kpifloat"><div class="kpis" id="kpis"></div></div>
        <button id="flipBtn"><span class="fi">⟲</span><span class="ft"><b>翻转到背面</b></span><span class="fq"></span></button>
      </div>
    </div>
  </div>
  <div id="hcard"></div>
  <div id="toast"></div>

</div></div>
`;

// ── ① main：2D 场景引擎（数据 → 图层 → 视图 → 交互，按原脚本章节序） ──
const MAIN = [
  "boot-utils", "data-model", "fault-biz-tiers", "layer-bands-status",
  "top-kpi", "left-panels", "left-tree", "stage-geometry",
  "legends", "cabinet-parts", "view-cluster-front", "view-cluster-back",
  "view-chip-udie", "view-blade", "view-cpu", "view-sfu",
  "view-card-npu", "camera-render", "stage-interact-nav", "hover-card",
  "pinned-popup", "fault-drill", "clock-jitter",
];
// ── ② room：机房视图（基础捕获 → 0908 主题 → r2~r14 逐版修饰层 → 动效 → 演示故事线） ──
const ROOM = [
  "assets-base", "hf-utils", "hf-dom", "hf-0908-skin",
  "r2-rack-view", "r3-card-decor", "r4-metrics", "r5-svg-overlays",
  "r8-r14-overlays", "motion", "mode-device", "nav-electric",
  "rack-video", "story-status", "l2-legend", "telemetry",
  "legend-icons", "load-contrast", "unified-kpi", "review-tint",
  "review-fan", "review-distribution", "review-fan-layers", "review-supplied-art",
  "latest-legend", "focus-sfu", "neutral-legend", "green-review",
  "chip-shell", "interconnect-energy", "l2-power", "union-review",
  "room-boot",
];
export const RUNTIME_SCRIPTS = [
  ...MAIN.map((n) => `./src/main/${n}.js`),
  ...ROOM.map((n) => `./src/room/${n}.js`),
  "./src/core/core-select.js",       // ③ 超节点选择（IIFE 自包含）
  "./assets/library/three.min.js",   // ④ three.js r147 + BloomPass（vendor 库，与 react/antd 同库位）
  "./src/scene-racktex.js",          // ⑤ 机柜贴图索引
  "./src/cluster/cluster-view.js",   // ⑥ 集群 3D 视图（IIFE 自包含）
  "./src/scene-fit.js",              // ⑦ 缩放收尾
];

// 场景样式 4 层 —— 与原页面 40 个 <style> 块的级联顺序一致
// （CSS 位于 src/styles/，其中 url() 相对路径为 ../../assets/uploads/…）
export const SCENE_STYLES = [
  "./src/styles/head.css",
  "./src/styles/room-overrides.css",
  "./src/styles/cluster-popup.css",
  "./src/styles/tail-overrides.css",
];

export const SCENE_TITLE = "CCAE 智算集群数字地图 · Atlas 950 超节点 1024";

// 原页面 <head> 脚本：触屏轻量模式探测（main/boot-utils 读取 window.CCAE_LIGHT 降特效）
export function detectLightMode() {
  return (
    /Android|HarmonyOS|iPad|Tablet/i.test(navigator.userAgent) ||
    (navigator.maxTouchPoints > 1 && matchMedia("(pointer: coarse)").matches)
  );
}

// 按序装载经典脚本：async=false 保证「插入顺序 = 执行顺序」（等价原页面静态 script 顺序）
export function loadRuntimeScripts(urls) {
  return new Promise((resolve) => {
    let pending = urls.length;
    if (!pending) return resolve();
    for (const src of urls) {
      const el = document.createElement("script");
      el.src = src;
      el.async = false;
      el.onload = el.onerror = () => {
        if (--pending === 0) resolve();
      };
      document.head.appendChild(el);
    }
  });
}
