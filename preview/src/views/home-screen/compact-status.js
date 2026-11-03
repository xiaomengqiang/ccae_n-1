import { HC_ASSETS } from "../../mock/hc-assets.js";

// 健康态图标更新 + 能耗等级标签 —— 从 initHomeScreen 提取的独立模块
// updateCompactStatusIcons 被 story.js 调用（每次阶段变化后刷新指标带健康状态）
// energyGradeTag 被 energy-detail / guard-events-table 调用

window.updateCompactStatusIcons = () => {
  document.querySelectorAll(".hc-metric-group").forEach((group) => {
    const compact = group.querySelector(".hc-metric-compact"), key = group.dataset.category;
    const values = [...group.querySelectorAll(".hc-metric-row .hc-metric-content>b")].map((b) => Number(b.firstChild.textContent));
    const count = key === "resource" ? values[0] + values[1] : values.slice(1, 4).reduce((a, b) => a + b, 0);
    const known = Number.isFinite(count), bad = known && count > 0;
    group.dataset.health = known ? (bad ? "abnormal" : "normal") : "unknown";
    group.dataset.severity = !bad ? "normal" : key === "resource" ? (values[0] > 0 ? "interrupted" : "stuck") : values[1] > 0 ? "interrupted" : values[2] > 0 ? "stuck" : "degraded";
    let orbit = compact.querySelector(".hc-health-orbit");
    if (!orbit) {
      orbit = document.createElement("span"); orbit.className = "hc-health-orbit";
      orbit.innerHTML = '<span class="hc-health-ring" aria-hidden="true"></span><span class="hc-health-copy"><span class="hc-health-label"></span><span class="hc-health-total"></span></span>';
      compact.append(orbit);
    }
    let glyphs = orbit.querySelector(".hc-summary-glyphs");
    if (!glyphs) {
      glyphs = document.createElement("span"); glyphs.className = "hc-summary-glyphs"; glyphs.setAttribute("aria-hidden", "true");
      (key === "resource" ? ["故障数", "隐患数", "NPU利用率", "更多"] : ["中断", "卡死", "劣化", "正常运行"]).forEach((name) => {
        if (name === "更多") { const more = document.createElement("span"); more.className = "hc-summary-more"; more.textContent = "…"; more.title = "更多指标"; glyphs.append(more); }
        else { const img = document.createElement("img"); img.src = HC_ASSETS.icons[name]; img.alt = ""; glyphs.append(img); }
      });
      orbit.prepend(glyphs);
    }
    glyphs.querySelectorAll("img").forEach((img, i) => {
      const active = key === "resource" ? (i < 2 && values[i] > 0) : (values[i + 1] > 0);
      img.classList.toggle("is-active", active);
    });
    orbit.querySelector(".hc-health-ring").textContent = known ? (bad ? count : "正常") : "—";
    orbit.querySelector(".hc-health-label").textContent = known ? (bad ? "项异常" : "") : "待检测";
    orbit.querySelector(".hc-health-total").textContent = key === "resource" ? "NPU 1024 卡" : "总数 " + (Number.isFinite(values[0]) ? values[0] : "—") + " 个";
    const label = group.querySelector(".hc-metric-title").textContent;
    compact.setAttribute("aria-label", label + "，" + (known ? (bad ? count + "异常" : "正常") : "待检测") + "，展开指标");
    compact.querySelector(".hc-compact-statuses")?.remove();
  });
};

window.energyGradeTag = (data) => {
  const size = Number((data.name || "").match(/-(\d+(?:\.\d+)?)B/i)?.[1] || 0);
  const limits = size >= 70 ? [12, 30] : size >= 14 ? [3, 8] : [1, 2.5];
  const value = Number(data.energyUnit ?? 1.82);
  const grade = data.energySaving ? 1 : value < limits[0] ? 0 : value <= limits[1] ? 1 : 2;
  const tag = document.createElement("span");
  tag.className = "hc-ept-grade";
  tag.textContent = ["绿算", "正常", "未达标"][grade];
  tag.style.setProperty("--ept-grade-color", ["#26b9b0", "#3ac58d", "#ef535b"][grade]);
  return tag;
};

export function initCompactStatus() {
  window.updateCompactStatusIcons();
}
