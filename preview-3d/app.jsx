// App entry — ICT React page · CCAE 智算集群数字地图（preview-3d 工程）
//
// 本页是 3D 场景的宿主页，采用 imperative island 模式（React 壳 + 经典脚本引擎）：
//   Layer 4  src/views/scene-root/   React 视图：渲染 #fit/#screen 静态骨架，
//                                    按执行清单装载 src/ 下的引擎经典脚本与样式
//   Layer 5  app.jsx                 Provider + 视图装配（本文件）
//
// 引擎拆解边界（为什么引擎不走 ES Module）：
//   引擎脚本共享一个全局词法环境（含 room↔cluster 双向引用），skill 的模块打包器
//   会把每个模块包进独立 IIFE —— 作用域直接断掉；three.js r147 源码还会命中构建器
//   禁用属性扫描。因此引擎保持经典脚本语义（与原页面执行模型完全一致），在
//   src/ 内按域拆为 61 个有序脚本（顺序由 scene-dom.js 的 RUNTIME_SCRIPTS 清单唯一定义）：
//     main/23    2D 场景引擎（原 main 脚本按章节拆分，拼接与原文件逐字节一致）
//     room/33    机房视图与逐版修饰层（原 room 脚本按顶层声明分组拆分）
//     core/1、cluster/1  自包含 IIFE 模块（整文件，内部含 7 个与 main/room 重名的
//                        顶层声明，解包需重命名，风险大于收益）
//     three.min.js（assets/library/）、src/scene-racktex.js、src/scene-fit.js、styles/4
//   场景内部状态（window.*）自管理；Layer 1 context 预留未用。
//
// 两种产物：
//   index.page.html      ict-coder 构建产物（本页），依赖同目录 assets/ + src/ —— 适合作
//                        页面直接打开；不能拷贝单文件走动、也不能进 sandbox="allow-scripts"
//                        的 iframe（不透明源会被 Chrome 拦截所有 file:// 子资源）//   multi-cabinet-scene.html  自包含单文件（node scripts/build-standalone.mjs 从 src/ 组装，
//                        骨架 + 内联样式/脚本 + data URI 资源，零外部依赖）—— 用于 iframe
//                        嵌入（对应原 multi-cabinet-scene.html 的用法），sandbox 无需放宽

import { ConfigProvider, Empty } from "antd";
import zhCN from "./assets/shared/antd-zh.js";
import SceneRoot from "./src/views/scene-root/index.jsx";
import "./app.css";

export default function App() {
  return (
    <ConfigProvider
      locale={zhCN}
      wave={{ disabled: true }}
      renderEmpty={() => <Empty style={{ padding: "2rem 0" }} />}
      empty={{ image: "./assets/uploads/empty.svg" }}
      spin={{ indicator: <img src="./assets/uploads/loading.svg" alt="" className="custom-spin-indicator" /> }}
    >
      <div className="app-root">
        <SceneRoot />
      </div>
    </ConfigProvider>
  );
}
