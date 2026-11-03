import { HC_ASSETS } from "../../mock/hc-assets.js";
import Mode from "../mode/index.jsx";

export default function Header({ onReset }) {
  return (
    <header className="hc-header">
      <img className="hc-icon" src={HC_ASSETS.icons["header"]} alt="" width={1920} />
      <button type="button" aria-label="iMaster CCAE" onClick={onReset} style={{ position: "absolute", left: "32px", top: "8px", width: "215px", height: "32px" }} />
      <div style={{ position: "absolute", left: "230px", top: "12px" }}>
        <Mode onChange={() => {}} />
      </div>
    </header>
  );
}
