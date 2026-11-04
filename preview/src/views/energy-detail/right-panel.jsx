// right-panel.jsx —— 右栏容器
// 内容页签（服务监控 / 月报）+ 视图切换 + 各页签滚动位置记忆
import { useEffect, useRef } from "react";
import { HC_ASSETS } from "../../mock/hc-assets.js";
import { REPORT_ICONS } from "./charts.jsx";
import ServicePanel from "./service-panel.jsx";
import ReportPanel from "./report-panel.jsx";
import { closeReportTab, registerRightScroll, switchTab } from "./session-store.js";

export default function EnergyRight({ s }) {
  const ref = useRef(null);

  useEffect(() => {
    registerRightScroll(ref.current);
    return () => registerRightScroll(null);
  }, []);

  // 页签切换后恢复该页签记忆的滚动位置（switchTab 已保存旧页签位置）
  useEffect(() => {
    if (ref.current) ref.current.scrollTop = s.rightScroll?.[s.tab] || 0;
  }, [s.tab]);

  return (
    <main className="hc-energy-right" data-mode={s.tab === "report" ? "report" : "monitor"} ref={ref}>
      {s.reportTabOpen && (
        <nav className="hc-energy-document-tabs" role="tablist" aria-label="右侧内容页签">
          <button type="button" role="tab" aria-selected={String(s.tab === "service")} onClick={() => switchTab("service")}>
            <img src={HC_ASSETS.icons["灰色叶子"]} alt="" />
            {s.name}节能监控
          </button>
          <div className="hc-energy-report-tab-group">
            <button type="button" role="tab" aria-selected={String(s.tab === "report")} onClick={() => switchTab("report")}>
              <img src={REPORT_ICONS["energy-report"]} alt="" />
              {s.name} 2026年8月节能月报
            </button>
            <button type="button" className="hc-energy-close-report-tab" aria-label="关闭月报页签" onClick={closeReportTab}>×</button>
          </div>
        </nav>
      )}
      {s.tab === "report" ? <ReportPanel s={s} /> : <ServicePanel s={s} />}
    </main>
  );
}
