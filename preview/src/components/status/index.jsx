const STATUS_NAMES = { degraded: "劣化", stuck: "卡死", interrupted: "中断", normal: "正常运行" };

export default function Status({ status = "normal" }) {
  return <span className={"hc-status " + status}>{STATUS_NAMES[status]}</span>;
}
