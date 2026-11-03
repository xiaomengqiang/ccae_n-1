export default function Gauge({ value = 0 }) {
  const percent = Math.max(0, Math.min(100, Number.isFinite(value) ? value : 0));
  return (
    <svg className="hc-gauge" viewBox="0 0 38 38" width="38" height="38" role="meter"
      aria-valuenow={percent} aria-valuemin="0" aria-valuemax="100" style={{ overflow: "visible" }}>
      <rect width="46" height="38" fill="#191919" />
      <path d="M7.19 30.81 A16.7 16.7 0 1 1 30.81 30.81" fill="none" stroke="#9a9a9a" strokeWidth="4.18" strokeLinecap="round" pathLength="100" opacity=".25" />
      <path d="M7.19 30.81 A16.7 16.7 0 1 1 30.81 30.81" fill="none" stroke="#36c18d" strokeWidth="4.18" strokeLinecap="round" pathLength="100"
        strokeDasharray={percent + " 100"} opacity={percent === 0 ? "0" : "1"} />
      <path d="M19 12 L21.3 16.7 L26 19 L21.3 21.3 L19 26 L16.7 21.3 L12 19 L16.7 16.7 Z" fill="#fff" />
    </svg>
  );
}
