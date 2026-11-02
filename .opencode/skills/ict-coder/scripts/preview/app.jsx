// App entry — ICT React page
// Layering convention (one folder per component, kebab-case + index.jsx/index.css):
//   Layer 1 global state  → src/context.jsx        (AppProvider: global state + dark mode toggle)
//   Layer 2 mock data     → src/mock/              (per-domain files, e.g. device.js / alarm.js)
//   Layer 3 reusable      → src/components/{name}/ (cross-view, e.g. status-tag / section-card)
//   Layer 4 views         → src/views/{name}/      (one per tab/section, e.g. device-table / header-bar)
//   Layer 5 layout        → app.jsx                (Provider + root container assembly)
//
//   Support modules (horizontal, not layered):
//     src/utils/       pure function utilities (formatNumber, debounce, etc.)
//     src/hooks/       custom React hooks (useDebounce, useTableData, etc.)
//     src/constants/   enums and config constants (STATUS_MAP, PAGE_SIZE, etc.)
//     src/styles/      cross-view shared CSS (utility classes, keyframes; not antd overrides)
//
// Styling: custom styles in component folder's index.css; prefer tokens for visual values.

import { ConfigProvider, Empty } from "antd";
import zhCN from "./assets/shared/antd-zh.js";
import { AppProvider } from "./src/context.jsx";
import "./app.css";


export default function App() {
  return (
    <AppProvider>
      <ConfigProvider
        locale={zhCN}
        wave={{ disabled: true }}
        renderEmpty={() => <Empty style={{ padding: "2rem 0" }} />}
        empty={{ image: "./assets/uploads/empty.svg" }}
        spin={{ indicator: <img src="./assets/uploads/loading.svg" alt="" className="custom-spin-indicator" /> }}
      >
        <div className="app-root">
          {/* view mount point */}
        </div>
      </ConfigProvider>
    </AppProvider>
  );
}
