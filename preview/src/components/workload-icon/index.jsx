import { HC_ASSETS } from "../../mock/hc-assets.js";

const KEY = { qwen: "千问", deepseek: "DeepSeek" };

export default function WorkloadIcon({ name = "" }) {
  const key = /qwen|千问/i.test(name) ? "千问" : /deepseek/i.test(name) ? "DeepSeek" : "AI";
  return (
    <img
      className="hc-icon"
      src={HC_ASSETS.icons[key]}
      alt=""
      width={24}
      style={key === "AI" ? { filter: "brightness(0) invert(.84)" } : undefined}
    />
  );
}
