import { HC_ASSETS } from "../../mock/hc-assets.js";
import FlowBorder from "../flow-border/index.jsx";

const EVENT_STATES = {
  auto: "自动处理中",
  manual: "待人工处理",
  closed: "已闭环",
  energy: "待决策节能机会点",
  effective: "已生效机会点",
};

const MARKER_KEYS = { manual: "markerManual", closed: "markerClosed", energy: "markerEnergy", effective: "markerEffective" };

export default function TimelineMarker({ state = "manual" }) {
  const label = EVENT_STATES[state] || EVENT_STATES.manual;
  return (
    <button type="button" className={"hc-marker " + state} aria-label={label}>
      {state === "auto" ? (
        <FlowBorder>
          <img className="hc-icon" src={HC_ASSETS.icons["红色的故障"]} alt="" width={14} />
        </FlowBorder>
      ) : (
        <img className="hc-icon" src={HC_ASSETS.icons[MARKER_KEYS[state]]} alt="" style={{ width: "auto", height: "auto" }} />
      )}
      <span className="hc-marker-tooltip">{label}</span>
    </button>
  );
}
