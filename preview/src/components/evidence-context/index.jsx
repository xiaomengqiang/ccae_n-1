import { createContext, useCallback, useContext, useMemo, useState } from "react";

// 取证面板 Context（原 hco-evidence.js 全局 store 的 React 版）
// 每个事件面板一个 Provider（nic/optical 各自隔离）；步骤证据链接 / 经验卡报告按钮
// 通过 useEvidence() 直接调 show/select/close（不再 window 全局 + origin 反查）。
// 报告内容 EvidenceReport 组件化渲染（替代原 reportHtml 字符串 + innerHTML）。

const EvidenceContext = createContext(null);

// 报告结构（原 reportHtml：small/h2/dl/h3/pre/footer）
export function EvidenceReport({ title, tool, stage, text }) {
  return (
    <>
      <small>处理依据 · 演示数据</small>
      <h2>{title}</h2>
      <dl>
        <dt>所属环节</dt><dd>{stage}</dd>
        <dt>来源能力</dt><dd>{tool}（演示名称）</dd>
        <dt>数据来源</dt><dd>当前子步骤的处理记录</dd>
      </dl>
      <h3>相关处理记录</h3>
      <pre>{text}</pre>
      <footer>本页为演示依据，未连接真实工具服务，不包含原始日志或真实调用编号</footer>
    </>
  );
}

export function EvidenceProvider({ children }) {
  // entries: Map<key, {label, stage, tool, text}>；activeKey 选中态
  const [entries, setEntries] = useState(() => new Map());
  const [activeKey, setActiveKey] = useState(null);

  const show = useCallback((label, stage, tool, text) => {
    const key = stage + "|" + label;
    setEntries((prev) => {
      const next = new Map(prev);
      next.set(key, { label, stage, tool, text });
      return next;
    });
    setActiveKey(key);
  }, []);

  const select = useCallback((key) => setActiveKey(key), []);

  const closeEntry = useCallback((key) => {
    setEntries((prev) => {
      if (!prev.has(key)) return prev;
      const next = new Map(prev);
      next.delete(key);
      return next;
    });
    setActiveKey((current) => (current === key ? null : current));
  }, []);

  const clear = useCallback(() => {
    setEntries(new Map());
    setActiveKey(null);
  }, []);

  const value = useMemo(() => ({ entries, activeKey, show, select, closeEntry, clear }), [entries, activeKey, show, select, closeEntry, clear]);
  return <EvidenceContext.Provider value={value}>{children}</EvidenceContext.Provider>;
}

export function useEvidence() {
  return useContext(EvidenceContext);
}
