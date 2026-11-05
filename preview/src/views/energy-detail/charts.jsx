// charts.jsx —— 节能详情图表层（ECharts 版）
// 全部为纯函数 option 构建器：数据采样与数值算法沿用 legacy 原样，渲染交给 ECharts（SVG renderer）
// 交互语义保留：列悬浮 tooltip（formatter 复用 .hc-energy-tooltip 的行样式）、
// 节点图调频点标记与 per-bar 提示、月报三图联动由 echart-box 的 linkGroup 承担
import { snapshot, time, nodeState, nodeSeries, runtimeWindow } from "../../shared/energy-state.js";

// 月报/策略卡片用到的图标（与源码 energy.js reportIcons 同源；全部为 assets/uploads 下既有文件，
// 与源码 base64 逐字节一致（MD5 已核对），按相对路径引用，避免 base64 撑大源码；
// “下载月报”导出的 HTML 会注入 <base> 指向本页目录，保证导出文件内图标可解析）
export const REPORT_ICONS = {
  "energy-total": "./assets/uploads/149-129774.png",
  "energy-gain": "./assets/uploads/149-129806.png",
  "energy-leaf": "./assets/uploads/149-129790.png",
  "energy-report": "./assets/uploads/149-129722.png",
  "good-arrow": "./assets/uploads/149-129458.png",
  "strategy-1": "./assets/uploads/149-129557.png",
  "strategy-2": "./assets/uploads/149-129560.png",
  "strategy-3": "./assets/uploads/149-129562.png",
};

// 叶子图标经 CSS mask 按状态染色（灰/绿/紫），本环境下 mask 加载外部文件不生效
// （原版源码的 reportIcons 也因此对 mask 图标内联 base64）。仅这一个 mask 图标
// 保留 data URI（由 assets/uploads/149-129790.png 生成）；其余图标均走文件引用。
export const LEAF_MASK_URI = "url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAAEpElEQVR4Ae3gAZAkSZIkSRKLqpm7R0REZmZmVlVVVVV3d3d3d/fMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMdHd3d3dXV1VVVVVmZkZGRIS7m5kKz0xmV3d1d3dPz8zMzMxMovifDfE/G+J/NsT/bIj/2RDPx0/91E8df5u3eZtd/vshnstP/dRPHbd9EfhrSW/zNm/zNrfy3wfxXH78x3/8rSPip7hiV9JnA9/zNm/zNrv810M8l5/6qZ/6KNtfzXPalfTbwK3ArbZ3bT8EICJeyvZx4MHAceA4sAvsArdK+utpmn7mHd7hHX6bfz3Ec/mJn/iJz5b0WfzH27X9NW/3dm/32bzoEM/lp37qp77K9kfzn+evJb3N27zN29zKvwzxXH7qp37qu2y/N/+5bpX0Om/zNm9zKy8c4rn8xE/8xGdL+iz+8936tm/7tg/hhUM8l5/6qZ/6KNtfzQu3Cxzn38n2+7zd273dd/OCIZ7LT/7kT74X8N28YLdKehngs2x/NP8+f/22b/u2L8MLhnguP/ZjP/bapZTf4oWw/T5v93Zv990/9mM/9tq11vey/dbAcf4NJD3kbd7mbW7l+UM8Hz/5kz9pXrjdaZpe5x3f8R3/GuCnfuqnjk/T9NK11pcCXho4bvulgQfzL2itvc47vMM7/DbPH+L5+Mmf/MnfAl6bF27X9tdExFe/zdu8zS7Px0/91E8dBx4MvJbttwZem+f13m/7tm/7PTx/iOfjJ37iJz5b0mfxotmV9NO2f1vS77zN27zNrbwAP/VTP/XSwEfZfm+eyfbnvN3bvd1n8/whno+f+qmferDtp/Nvsyvpt4FbW2u/U0r57bd5m7fZ5QF+7Md+7LVLKd8FPFjSR7/N27zN1/D8IV6An/qpn/ou2+/Nf4zftv07EfHVb/M2b7ML8FM/9VPHge8ax/Fz3vEd3/Gvef4QL8BP/dRPPdj20/mPtWv7ayLiq9/mbd5ml38Z4oX4iZ/4ic+W9Fn8x9ttrb3NO7zDO/w2LxziX/CTP/mTTwcezH8C2x/zdm/3dl/NC4b4F/zUT/3Ug23/FvBg/hPY/pi3e7u3+2qeP8SL4Kd+6qcebPu3gAfzH+NW4ME80zRNL/OO7/iOf83zQryIfuqnfurBtr8LeG3+ff5a0usAX2X7vbniVkmv8zZv8za38pwQ/0o/9mM/9tqllO8CHsy/ku3Pebu3e7vPBvipn/qpB9t+Os8k6bvf5m3e5n14Toh/ox/7sR977VrrW9l+b+A4L9itkn4b+Jy3eZu3uZUH+Kmf+qnvsv3ePJOkh7zN27zNrTwb4j/AT/3UTz0YON5ae3BEHANorT2j1vrXb/M2b7PLC/BTP/VTL237r3gmSR/9Nm/zNl/DsyH+m/3kT/7k04EHA0j66rd5m7f5GJ4N8d/sJ37iJz5a0lcBtNZe5x3e4R1+m2dD/A/wkz/5k+8l6Xfe5m3e5laeE+J/NsT/bIj/2RD/syH+Z0P8z4b4n41/BGFqajjoZEseAAAAAElFTkSuQmCC)";

// tooltip 外观复用 .hc-energy-tooltip 的 CSS（行布局/圆点/配色）；
// extraCssText 压过 ECharts 写在 tooltip div 上的内联默认（背景/边框/内边距）
// 定位用 ECharts 默认（跟随指针、贴边自动翻转），confine 限制在图表容器内
const TIP_CSS = "background:#393939 !important;border:0 !important;box-shadow:0 8px 18px rgba(0,0,0,.4);border-radius:8px;pointer-events:none;";
const tipHtml = (date, rows) =>
  `<div class="hc-energy-tooltip-date">${date}</div>` +
  rows.map(([label, value]) => `<div class="hc-energy-tooltip-row"><span>${label}</span><strong>${value}</strong></div>`).join("");

const tooltip = (extra, formatter) => ({
  trigger: "axis",
  axisPointer: { type: "shadow", shadowStyle: { color: "rgba(255,255,255,.06)" } },
  className: "hc-energy-tooltip",
  backgroundColor: "rgba(0,0,0,0)",
  borderColor: "rgba(0,0,0,0)",
  borderWidth: 0,
  padding: 0,
  confine: true,
  extraCssText: TIP_CSS + extra,
  formatter,
});

// ---------------------------------------------------------------------------
// 运行态趋势图（节能优化效果）
// 坐标换算沿用 legacy 像素几何：x = 646 + t*1292/30；功耗 y = 47-(p-44)*2.8（轴域 22.93~57.21）；
// 请求柱 y = 93-(r-1720)*33/240（轴域 1625.5~2323.6），柱底落在 x 轴刻度带上沿
// ---------------------------------------------------------------------------
export function runtimeChartOption(s) {
  const now = 0;
  const samples = Array.from({ length: 65 }, (_, i) => {
    const second = Math.floor(now * 2) / 2 - 16 + i * .5;
    const d = snapshot({ ...s, elapsed: second * 86400, liveTick: second * 3 });
    return { second, ...d, power: second >= -15 ? d.optimizedPower : d.baselinePower };
  });
  const dateLabel = (t) => {
    const d = new Date(Date.UTC(2026, 8, 9) + t / 3 * 86400000);
    return String(d.getUTCMonth() + 1).padStart(2, "0") + "." + String(d.getUTCDate()).padStart(2, "0");
  };
  // 功耗曲线逐 0.1 天采样（与 legacy 相同的平滑窗口）
  const actualPts = [], basePts = [], optPts = [];
  for (let t = now - 15; t <= now + 15 + 1e-9; t += .1) {
    const fixed = Number(t.toFixed(4));
    const d = snapshot({ ...s, elapsed: fixed * 86400, liveTick: fixed * 3 });
    if (fixed <= now) actualPts.push([fixed, d.optimizedPower]);
    if (fixed >= now) { basePts.push([fixed, d.baselinePower]); optPts.push([fixed, d.optimizedPower]); }
  }
  const barData = samples.map((d) => ({
    value: [d.second, d.request],
    // 过去实色 / 未来斜纹：还原 legacy pattern（3px 条纹、8px 周期、旋转 110°）
    itemStyle: d.second <= now
      ? { color: "#5c9edc", borderRadius: 3 }
      : {
        color: "rgba(92,158,220,.12)", borderRadius: 3,
        decal: { symbol: "rect", symbolSize: 1, dashArrayX: [3, 5], dashArrayY: [1, 0], rotation: (110 * Math.PI) / 180, color: "#5c9edc" },
      },
  }));
  const formatter = (params) => {
    // custom 系列（now 标记）也会进 axis 触发参数，按名字锁定柱系列
    const first = Array.isArray(params) ? (params.find((p) => p.seriesName === "平均请求量") || params[0]) : params;
    const t = first?.axisValue;
    if (t == null) return "";
    const i = Math.max(0, Math.min(samples.length - 1, Math.round((t + 16) * 2)));
    const d = samples[i];
    const rows = d.second <= now
      ? [["当前平均请求量", d.request + " 个/s"], ["实际功耗", d.power + " kW"]]
      : [["预测平均请求量", d.request + " 个/s"], ["基线预测功耗", d.baselinePower + " kW"], ["策略后预测功耗", d.optimizedPower.toFixed(1) + " kW"]];
    return tipHtml(dateLabel(d.second), rows);
  };
  const option = {
    animation: false,
    grid: { left: 0, top: 10, right: 0, bottom: "28.4%", show: true, backgroundColor: "#232323", borderColor: "transparent", borderWidth: 0 },
    // 策略启动标注固定在左上角（legacy x=5,y=22）；挂在左边缘 markLine 上会被裁掉一半
    graphic: s.effectiveAt ? [{ type: "text", left: 5, top: 12, silent: true, z: 100, style: { text: "策略启动 · 09.04", fill: "#71c7a6", fontSize: 10 } }] : [],
    tooltip: { ...tooltip("padding:16px !important;min-width:196px;font-size:12px;line-height:20px;color:#eee;", formatter), axisPointer: { type: "none" } },
    xAxis: {
      type: "value", min: -15, max: 15, interval: 3,
      // 首末刻度标签交给 custom 系列按 legacy 钳位规则绘制（x∈[28,1264]），避免贴边被画布裁掉一半
      axisLabel: { formatter: dateLabel, color: "#999", fontSize: 12, margin: 16, showMinLabel: false, showMaxLabel: false },
      axisLine: { show: false }, axisTick: { show: false }, splitLine: { show: false },
    },
    yAxis: [
      // interval 锁定 5 等分 → 与 legacy 的 6 条等距横线一致（ECharts 默认会取整导致错位）
      { type: "value", min: 22.93, max: 57.21, interval: (57.21 - 22.93) / 5, show: false, splitLine: { show: true, lineStyle: { color: "#393939", width: 0.7 } } },
      { type: "value", min: 1625.5, max: 2323.6, show: false, splitLine: { show: false } },
    ],
    series: [
      { name: "平均请求量", type: "bar", yAxisIndex: 1, data: barData, barWidth: 12, z: 1 },
      { name: "实际功耗", type: "line", data: actualPts, symbol: "none", z: 2, lineStyle: { color: "#bdbdbd", width: 1 } },
      { name: "基线预测功耗", type: "line", data: basePts, symbol: "none", z: 2, lineStyle: { color: "#aaa", width: 1, type: [1.5, 2.5] } },
      { name: "策略后预测功耗", type: "line", data: optPts, symbol: "none", z: 2, lineStyle: { color: "#20aa78", width: 1, type: [1.5, 2] } },
      {
        // 像素级装饰按容器尺寸直绘（resize 自动重算），复刻 legacy SVG 几何（viewBox 1292×148）：
        // 1) now 标记（M646 0V120 M640 0H652）：从容器顶画到 120/148 处，T 形横帽在最顶端
        // 2) 策略启动虚线（M0 14V106，dasharray 3 3，#53c49c）：贴左边缘，仅 s.effectiveAt 存在时绘制
        // 3) 首末日期标签：legacy 钳位 x∈[28,1264] 居中绘制，避免 ECharts 轴标签贴边被裁一半
        name: "now标记", type: "custom", silent: true, clip: false, z: 10,
        renderItem: (params, api) => {
          const w = api.getWidth(), h = api.getHeight(), cx = w / 2, cap = (6 / 1292) * w;
          const style = { stroke: "#6a94ff", lineWidth: 2 };
          const children = [
            { type: "line", shape: { x1: cx, y1: 0, x2: cx, y2: (120 / 148) * h }, style },
            { type: "line", shape: { x1: cx - cap, y1: 0, x2: cx + cap, y2: 0 }, style },
          ];
          if (s.effectiveAt) {
            children.push({
              type: "line",
              shape: { x1: 0, y1: (14 / 148) * h, x2: 0, y2: (106 / 148) * h },
              style: { stroke: "#53c49c", lineWidth: 1, lineDash: [(3 / 148) * h, (3 / 148) * h] },
            });
          }
          // 与轴标签同一基线（grid 下缘 + margin 16），字号颜色一致
          const labelY = h * (1 - 0.284) + 16;
          const edge = (t, px) => ({
            type: "text", silent: true,
            style: { text: dateLabel(t), x: (px / 1292) * w, y: labelY, fill: "#999", fontSize: 12, textAlign: "center", textVerticalAlign: "top" },
          });
          children.push(edge(-15, 28), edge(15, 1264));
          return { type: "group", children };
        },
        data: [0],
      },
    ],
  };
  return { option, width: 1292, height: 148, label: "实际和预测请求量、功耗趋势" };
}

// ---------------------------------------------------------------------------
// 节点卡片模型 + 负载图（近 N 小时，30 分钟采样，调频点与运行日志对应）
// ---------------------------------------------------------------------------
export function nodeCardModel(s, i, hoverKind) {
  const count = Math.max(1, Math.ceil(Number(s.data.npu) / 8));
  const clock = runtimeWindow(s).now;
  const type = i % (count === 6 ? 3 : 4) === 0 ? "P" : "D";
  const ip = `112.34.${i % 2 ? 14 : 13}.${i + 2}`;
  const frequency = nodeState(s, i, clock);
  // 累计节能按固定节点权重分配（演示值）
  const weights = Array.from({ length: count }, (_, k) => [2.60, 1.85, 1.95, 2.59, 1.85, 1.95][k % 6]);
  const weightSum = weights.reduce((a, b) => a + b, 0), savedCents = Math.round(parseFloat(s.data.energySaved) * 100);
  const before = weights.slice(0, i).reduce((a, b) => a + b, 0);
  const cumulative = (Math.round(savedCents * (before + weights[i]) / weightSum) - Math.round(savedCents * before / weightSum)) / 100;
  const activeLog = s.history !== null ? s.logs[s.history] : s.logs.filter((log) => log.second <= clock).at(-1);
  const savingRaw = [2.60, 1.85, 1.95, 2.59, 1.85, 1.95][i] * Number(s.nodeRange || 4) / 4;
  const total = Number(savingRaw.toFixed(2));
  const series = nodeSeries(s, i, clock, Number(s.nodeRange || 4));
  const { start, end } = series, samples = series.points;
  // 将已完成的调频锚定到最近的 30 分钟采样列
  const frequencySamples = series.events.map((event) => {
    const sample = samples.reduce((best, p) => Math.abs(p.at - event.at) < Math.abs(best.at - event.at) ? p : best);
    sample.request = event.request; sample.kind = "medium"; sample.saving = 0;
    return { event, sample };
  });
  const sampleSaving = samples.reduce((sum, p) => sum + p.saving, 0);
  if (sampleSaving) samples.forEach((p) => p.saving *= savingRaw / sampleSaving);
  const lightWeight = samples.filter((p) => p.kind === "light").reduce((n, p) => n + p.saving, 0);
  const mediumWeight = samples.filter((p) => p.kind === "medium").reduce((n, p) => n + p.saving, 0);
  const weight = lightWeight + mediumWeight;
  const light = weight ? Number((total * lightWeight / weight).toFixed(2)) : 0;
  const medium = weight ? Number((total - light).toFixed(2)) : 0;
  return {
    type, ip, frequency, cumulative, savingRaw, light, medium,
    chart: nodeLoadChartOption(s, { nodeIndex: i, start, end, samples, frequencySamples, activeLog, hoverKind }),
    linked: !!(activeLog && activeLog.nodeIndex === i && frequency.status !== "稳定运行"),
  };
}

function nodeLoadChartOption(s, { nodeIndex, start, end, samples, frequencySamples, activeLog, hoverKind }) {
  const colors = { light: "#37c18d", medium: "#fcd72e", heavy: "#f4840c" };
  const stamp = (at) => time(Math.floor(at), 0).slice(0, 5);
  const maxRequest = Math.ceil(Math.max(...samples.map((p) => p.request), ...frequencySamples.map((fs) => fs.event.request)) * 10) / 10;
  const maxSaving = Math.max(.5, Math.ceil(Math.max(...samples.map((p) => p.saving)) * 2) / 2);
  const barWidth = Math.min(18, 313 / (samples.length - 1) * .48);
  // 图例悬浮时非对应时段的柱子压暗（legacy .hc-load-request:not(.kind){opacity:.35}）
  const barData = samples.map((p) => ({ value: [p.at, p.request], itemStyle: { color: colors[p.kind], borderRadius: 1, opacity: hoverKind && p.kind !== hoverKind ? .35 : 1 } }));
  // 已完成调频锚定列：虚线 + 圆点 + 顶部“已调频”标注；与运行日志选中态联动加粗
  const selected = (fs) => activeLog?.nodeIndex === nodeIndex && (activeLog.kind === 1 ? activeLog.second === fs.event.second : (activeLog.kind === 2 ? activeLog.second >= fs.event.second : activeLog.plannedSecond === fs.event.second));
  const option = {
    animation: false,
    // 节点负载图不需要悬浮提示（legacy 仅有柱上原生 <title> 小字）
    tooltip: { show: false },
    grid: { left: 35, right: 32, top: 28, bottom: 24 },
    xAxis: {
      type: "value", min: start, max: end, interval: (end - start) / 4,
      axisLabel: { formatter: (v) => stamp(v), color: "#aaa", fontSize: 10, margin: 6 },
      axisLine: { show: false }, axisTick: { show: false }, splitLine: { show: false },
    },
    yAxis: [
      {
        type: "value", min: 0, max: maxRequest, interval: maxRequest / 2,
        axisLabel: { formatter: (v) => String(Math.round(v * 1800)), color: "#aaa", fontSize: 9, margin: 6 },
        axisLine: { show: false }, axisTick: { show: false },
        splitLine: { show: true, lineStyle: { color: "#414141", width: 0.6 } },
      },
      {
        type: "value", min: 0, max: maxSaving, interval: maxSaving / 2, position: "right",
        axisLabel: { formatter: (v) => v.toFixed(1), color: "#aaa", fontSize: 9, margin: 6 },
        axisLine: { show: false }, axisTick: { show: false }, splitLine: { show: false },
      },
    ],
    series: [
      {
        name: "请求量", type: "bar", data: barData, barWidth,
        markLine: {
          silent: true, symbol: ["none", "none"], animation: false,
          data: frequencySamples.map((fs) => [{ coord: [fs.sample.at, fs.sample.request] }, { coord: [fs.sample.at, maxRequest], lineStyle: { color: "#55c6ad", width: selected(fs) ? 2 : 1, type: [3, 2] } }]),
        },
        markPoint: {
          silent: true, animation: false, symbol: "circle", symbolSize: 5,
          data: [
            // 数据点圆点（虚线底端）
            ...frequencySamples.map((fs) => ({
              coord: [fs.sample.at, fs.sample.request],
              itemStyle: { color: "#55c6ad" },
              label: { show: false },
            })),
            // “已调频”文字挂在虚线顶端上方（legacy text y=18 / 虚线顶 y=23）；
            // 近左右边缘时按 legacy clamp 规则翻转对齐（markX>288→end、<65→left），防止溢出
            ...frequencySamples.map((fs) => {
              const f = end > start ? (fs.sample.at - start) / (end - start) : 0.5;
              return {
                coord: [fs.sample.at, maxRequest],
                symbolSize: 0,
                label: {
                  show: true, formatter: stamp(fs.event.at) + " 已调频", position: "top", distance: 3,
                  color: "#55c6ad", fontSize: 9,
                  align: f > 0.86 ? "right" : f < 0.1 ? "left" : "center",
                },
              };
            }),
          ],
        },
      },
      { name: "节省能耗", type: "line", yAxisIndex: 1, silent: true, symbol: "none", data: samples.map((p) => [p.at, p.saving]), lineStyle: { color: "#45c49f", width: 1.7 } },
      {
        // 图例悬浮联动的时段底纹（legacy .hc-load-shade：绘图区全高、opacity 0→.18，垫在柱子下层）
        name: "时段底纹", type: "line", data: [], silent: true, z: 1,
        markArea: {
          silent: true, animation: false,
          itemStyle: { color: hoverKind ? colors[hoverKind] : "transparent", opacity: .18 },
          data: hoverKind ? samples.slice(0, -1).map((p, k) => (p.kind === hoverKind ? [{ xAxis: p.at }, { xAxis: samples[k + 1].at }] : null)).filter(Boolean) : [],
        },
      },
    ],
  };
  return { option, label: `近${s.nodeRange || 4}小时，每30分钟采样，调频点与运行日志对应` };
}

// ---------------------------------------------------------------------------
// 月报图表：每日能耗与节能趋势 / 推理请求量+SLA / NPU及CPU利用率
// ---------------------------------------------------------------------------
export function dailyEnergyChartOption(data) {
  const axisMax = (values) => {
    const raw = Math.max(...values) * 1.15, magnitude = 10 ** Math.floor(Math.log10(raw));
    return Math.ceil(raw / magnitude * 2) / 2 * magnitude;
  };
  const totalMax = axisMax(data.map((d) => d.total)), savedMax = axisMax(data.map((d) => d.saved));
  // 上下双零轴：总能耗向上、节省能耗向下（各占半幅，轴域对称使 0 线落在网格中线）
  const formatter = (params) => {
    const i = (Array.isArray(params) ? params[0] : params).dataIndex, d = data[i];
    return tipHtml(`2026年8月${d.day}日`, [["总能耗", d.total + " kWh"], ["节省能耗", d.saved + " kWh"]]);
  };
  const option = {
    animation: false,
    grid: { left: 48, right: 12, top: 32, bottom: 41 },
    tooltip: tooltip("padding:20px 22px !important;min-width:232px;border-radius:10px;font-size:14px;line-height:22px;color:#eee;", formatter),
    xAxis: {
      type: "category", data: data.map((d) => d.day),
      axisLabel: { interval: 4, formatter: (v) => "8." + v, color: "#939393", fontSize: 12 },
      axisLine: { show: false }, axisTick: { show: false }, splitLine: { show: false },
    },
    yAxis: [
      {
        type: "value", min: -totalMax, max: totalMax, interval: totalMax / 4,
        axisLabel: { formatter: (v) => (v >= 0 ? String(Number(v.toFixed(2))) : ""), color: "#939393", fontSize: 12 },
        splitLine: { lineStyle: { color: "#333" } },
        name: "总能耗 / kWh", nameLocation: "end", nameGap: 14, nameTextStyle: { color: "#c9c9c9", fontSize: 12 },
      },
      {
        type: "value", min: -savedMax, max: savedMax, interval: savedMax / 4,
        axisLabel: { formatter: (v) => (v < 0 ? String(Number((-v).toFixed(2))) : ""), color: "#939393", fontSize: 12 },
        splitLine: { show: false },
        name: "节省能耗 / kWh", nameLocation: "start", nameGap: 14, nameTextStyle: { color: "#c9c9c9", fontSize: 12 },
      },
    ],
    series: [
      { name: "总能耗", type: "bar", data: data.map((d) => d.total), barWidth: 14, itemStyle: { color: "#6899fb", borderRadius: [4, 4, 0, 0] } },
      // legacy 为斜纹 pattern；ECharts 以实色近似
      // 节省能耗柱：还原 legacy 斜纹 pattern（2px 条纹、6px 周期、旋转 70°、#70cdb6），与图例条纹色块一致
      { name: "节省能耗", type: "bar", yAxisIndex: 1, barGap: "-100%", data: data.map((d) => -d.saved), barWidth: 14, itemStyle: { color: "rgba(112,205,182,.12)", borderRadius: [0, 0, 4, 4], decal: { symbol: "rect", symbolSize: 1, dashArrayX: [2, 4], dashArrayY: [1, 0], rotation: (70 * Math.PI) / 180, color: "#70cdb6" } } },
    ],
  };
  return { option, width: 1292, height: 245, label: `每日能耗与节省能耗，上方0至${totalMax} kWh，下方0至${savedMax} kWh` };
}

export function reportChartOption(data, kind) {
  const rows = (d) => kind === "requests"
    ? [["推理请求量", d.requests + " 万个"], ["SLA 达标率", d.slo + "%"]]
    : [["NPU 利用率", d.npu + "%"], ["CPU 利用率", d.cpu + "%"]];
  const formatter = (params) => {
    const i = (Array.isArray(params) ? params[0] : params).dataIndex, d = data[i];
    return tipHtml(`2026年8月${d.day}日`, rows(d));
  };
  const option = {
    animation: false,
    grid: { left: 48, right: kind === "requests" ? 46 : 18, top: 34, bottom: 32 },
    tooltip: tooltip("padding:20px 22px !important;min-width:232px;border-radius:10px;font-size:14px;line-height:22px;color:#eee;", formatter),
    xAxis: {
      type: "category", data: data.map((d) => d.day),
      axisLabel: { interval: 4, formatter: (v) => "8." + v, color: "#aaa", fontSize: 12 },
      axisLine: { show: false }, axisTick: { show: false }, splitLine: { show: false },
    },
    yAxis: [
      {
        type: "value", min: 0, max: kind === "requests" ? 40 : 100, interval: kind === "requests" ? 10 : 25,
        axisLabel: { color: "#aaa", fontSize: 12 },
        splitLine: { lineStyle: { color: "#333" } },
        name: kind === "requests" ? "请求量（万个）" : "利用率（%）", nameLocation: "end", nameGap: 12, nameTextStyle: { color: "#aaa", fontSize: 12 },
      },
      ...(kind === "requests" ? [{
        type: "value", min: 99, max: 100, interval: .25, position: "right",
        axisLabel: { formatter: (v) => (v === 100 ? "100" : v.toFixed(2) + "%"), color: "#aaa", fontSize: 12 },
        splitLine: { show: false },
        name: "SLA达标率（%）", nameLocation: "end", nameGap: 12, nameTextStyle: { color: "#aaa", fontSize: 12, align: "right" },
      }] : []),
    ],
    series: kind === "requests"
      ? [
        { name: "推理请求量", type: "bar", data: data.map((d) => d.requests), barWidth: 7.6, itemStyle: { color: "#3285f8", borderRadius: 2 } },
        { name: "SLA达标率", type: "line", yAxisIndex: 1, symbol: "none", data: data.map((d) => d.slo), lineStyle: { color: "#81b83c", width: 2 } },
      ]
      : [
        { name: "NPU", type: "line", symbol: "none", data: data.map((d) => d.npu), lineStyle: { color: "#3386ff", width: 2 } },
        { name: "CPU", type: "line", symbol: "none", data: data.map((d) => d.cpu), lineStyle: { color: "#23b8c1", width: 2 } },
      ],
  };
  return { option, width: 590, height: 240, label: kind === "requests" ? "推理请求量与SLA达标率" : "NPU及CPU利用率" };
}
