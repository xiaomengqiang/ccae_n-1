// 从 preview/src/views/optical-event/event.js 机械提取命令式保留模块:
//   shared/entrance.js        (L151-210  HCEntrance)
//   optical-event/evidence.js (L211-293  HCOpticalEvidence)
//   optical-event/canvas-reference.js (L295-369 画布引用)
//   optical-event/parts.js    (L510-722  HCOpticalParts)
// 只做行切片 + 首行 window. 前缀改 export,其余逐字保留。
const fs = require("fs");
const path = require("path");

const SRC = path.join(__dirname, "..", "preview", "src", "views", "optical-event", "event.js");
const lines = fs.readFileSync(SRC, "utf8").split(/\r?\n/);
const slice = (a, b) => lines.slice(a - 1, b).join("\n").replace(/\s+$/, "");

function write(file, content) {
  const target = path.join(__dirname, "..", "preview", "src", file);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, content.replace(/\s*$/, "") + "\n", "utf8");
  console.log("written:", target, content.split("\n").length, "lines");
}

// 1) shared/entrance.js —— nic-event 也依赖 window.HCEntrance(原先靠 event.js 导入副作用)
{
  let body = slice(151, 210);
  const before = body;
  body = body.replace(/^window\.HCEntrance = function/m, "export const HCEntrance = function");
  if (body === before) throw new Error("entrance 首行未匹配");
  write(
    path.join("shared", "entrance.js"),
    [
      "// 入场控制器 —— 逐字提取自 optical-event/event.js（原 window.HCEntrance 模块）。",
      "// stream 打字机 / typeResponse / lines 交错入场 / chart·recovery 可视区一次性播放。",
      "// nic-event 与 optical-event 共用；window.HCEntrance 在模块顶层设置（不依赖 boot 调用时序）。",
      "",
      body,
      "",
      "window.HCEntrance = HCEntrance;",
    ].join("\n")
  );
}

// 2) optical-event/evidence.js —— HCOpticalEvidence
{
  let body = slice(211, 293);
  const before = body;
  body = body.replace(/^window\.HCOpticalEvidence = \(\(\) => \{/m, "export const HCOpticalEvidence = (() => {");
  if (body === before) throw new Error("evidence 首行未匹配");
  write(
    path.join("views", "optical-event", "evidence.js"),
    [
      "// 光模块事件取证（HCOpticalEvidence）—— 逐字提取自 event.js，命令式保留。",
      "// 依据规则匹配 + 诊断依据标签页（evt-evidence-tabs，注入右侧诊断详情工具栏）。",
      "// window.HCOpticalEvidence 在模块顶层设置（parts.js 的经验卡按钮通过全局引用 show）。",
      "",
      body,
      "",
      "window.HCOpticalEvidence = HCOpticalEvidence;",
    ].join("\n")
  );
}

// 3) optical-event/canvas-reference.js —— 画布引用（自安装 IIFE）
write(
  path.join("views", "optical-event", "canvas-reference.js"),
  [
    "// 画布引用 —— 逐字提取自 event.js（自安装 IIFE，import 即生效）。",
    "// 右键拓扑节点/图表/处理环节卡片 → 引用 chip + 快捷查询 + 智慧体对话（演示回复）。",
    "// MutationObserver 监听 #optical-event-root（挂载前 fallback #screen），React 渲染的 .hc-composer 同样可被捕获。",
    "",
    slice(295, 369),
  ].join("\n")
);

// 4) optical-event/parts.js —— HCOpticalParts（CleaningIllustration / ExperienceSummary / streamExperience / TrendChart）
{
  let body = slice(510, 722);
  const before = body;
  body = body.replace(/^window\.HCOpticalParts = \(\(\) => \{/m, "export const HCOpticalParts = (() => {");
  if (body === before) throw new Error("parts 首行未匹配");
  write(
    path.join("views", "optical-event", "parts.js"),
    [
      "// 命令式部件库（HCOpticalParts）—— 逐字提取自 event.js，命令式保留：",
      "//   TrendChart：实时趋势图引擎（update 每秒驱动 / setRecoveryTime / 悬浮联动）",
      "//   CleaningIllustration：清污示意图（crossfade 过渡只展示一次）",
      "//   ExperienceSummary：经验沉淀卡（打字流式动画；state 为外部可变引用，onReplace 回调换卡）",
      "//   streamExperience：经验卡流式入场",
      'import { OPTICAL_ASSETS } from "../../mock/hc-assets.js";',
      "",
      body,
    ].join("\n")
  );
}

console.log("done");
