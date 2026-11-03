export default function FlowBorder({ children }) {
  return (
    <>
      {children}
      <i className="hc-flow-halo"><i /></i>
      <i className="hc-flow-base" />
      <i className="hc-flow-ring" />
    </>
  );
}
