// React 桥接层 —— 命令式消费者（optical-event / nic-event / workload-browser）与 React 组件之间的适配
// 模式：flushSync 渲染到脱离文档的容器 → 取出 DOM 节点交给命令式代码。
// 注意：节点移出 createRoot 容器后 React 合成事件失效，交互类组件必须原生绑定。
import { HC_ASSETS } from "../mock/hc-assets.js";
import EventTypeIcon from "../components/event-type-icon/index.jsx";
import WorkloadIcon from "../components/workload-icon/index.jsx";
import WorkloadCard from "../components/workload-card/index.jsx";
import Composer from "../components/composer/index.jsx";
import FlowBorder from "../components/flow-border/index.jsx";

// 无交互组件（纯展示）：直接取节点即可
export function bridgeNode(Component, props) {
  const host = document.createElement("div");
  ReactDOM.flushSync(() => {
    ReactDOM.createRoot(host).render(React.createElement(Component, props));
  });
  return host.firstElementChild;
}

export function bridgeEventTypeIcon(props) {
  return bridgeNode(EventTypeIcon, props);
}

export function bridgeWorkloadIcon(name = "") {
  return bridgeNode(WorkloadIcon, { name });
}

export function bridgeWorkloadCard(props) {
  return bridgeNode(WorkloadCard, props);
}

// FlowBorder（工厂版语义）：把流光边框元素注入既有节点（追加到末尾）
export function bridgeFlowBorderInto(node) {
  const host = document.createElement("div");
  ReactDOM.flushSync(() => {
    ReactDOM.createRoot(host).render(React.createElement(FlowBorder));
  });
  while (host.firstChild) node.append(host.firstChild);
  return node;
}

// React 岛 —— 把组件直接挂到既有容器元素上（不加包装层，CSS 直接子选择器安全），
// 返回 update(props)/unmount()。命令式状态机持有岛屿并按渲染周期推送 props。
export function mountIsland(host, Component, props) {
  const root = ReactDOM.createRoot(host);
  root.render(React.createElement(Component, props));
  return {
    update(next) { root.render(React.createElement(Component, next)); },
    unmount() { root.unmount(); },
  };
}

// 交互组件（输入框/发送按钮）：React 合成事件在节点移出容器后失效，
// 原生复刻工厂版 Composer 的 sync + submit 行为
export function bridgeComposer({ value = "", onSend } = {}) {
  const form = bridgeNode(Composer, { value, onSend: () => {} });
  const input = form.querySelector("input");
  const send = form.querySelector("button");
  const image = send.querySelector("img");
  const sync = () => {
    send.disabled = !input.value.trim();
    image.src = HC_ASSETS.icons[send.disabled ? "发送-禁用态" : "发送-正常态"];
  };
  input.addEventListener("input", sync);
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!input.value.trim()) return;
    onSend?.(input.value);
    input.value = "";
    sync();
  });
  sync();
  return form;
}
