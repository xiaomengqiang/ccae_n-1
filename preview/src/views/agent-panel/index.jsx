import { useEffect, useRef, useState } from "react";
import { MASCOT_LAYERS } from "./mascot-layers.js";
import { useMascotChoreography } from "../../hooks/use-mascot-choreography.js";
import { useEntrance } from "../../hooks/use-entrance.js";
import { prepareContour, computeFit, applyFit } from "./contour.js";

const createPortal = (node, host) => ReactDOM.createPortal(node, host);

export default function AgentPanel() {
  useEntrance();
  return (
    <>
      <MascotMotion />
      <AgentPanelContour />
    </>
  );
}

function MascotMotion() {
  const [stage, setStage] = useState(null);
  useEffect(() => setStage(document.querySelector(".agent-motion")), []);
  const { active, ticks } = useMascotChoreography(stage);
  if (!stage) return null;
  return createPortal(
    MASCOT_LAYERS.map((layer) => (
      <img
        key={layer.motion}
        data-motion={layer.motion}
        alt=""
        src={layer.src + (ticks[layer.motion] ? "?r=" + ticks[layer.motion] : "")}
        className={active.includes(layer.motion) ? "on" : undefined}
      />
    )),
    stage
  );
}

function AgentPanelContour() {
  const [host, setHost] = useState(null);
  const [prepared, setPrepared] = useState(null);
  const [geom, setGeom] = useState(null);
  const svgRef = useRef(null);

  useEffect(() => {
    const events = document.getElementById("home-events");
    const img = document.querySelector(".agent-panel>.panel-contour");
    if (!events || !img) return;
    const prep = prepareContour(img);
    setPrepared(prep);
    setHost(img.parentElement);
    img.remove();
    const compute = () => setGeom(computeFit(prep.outline, events));
    const resizeObs = new ResizeObserver(compute);
    resizeObs.observe(events);
    const mutationObs = new MutationObserver(compute);
    mutationObs.observe(events, { childList: true, subtree: true });
    compute();
    return () => { resizeObs.disconnect(); mutationObs.disconnect(); };
  }, []);

  useEffect(() => {
    if (svgRef.current && prepared && prepared.nodes) {
      svgRef.current.replaceChildren();
      svgRef.current.append(...prepared.nodes);
    }
  }, [prepared]);

  useEffect(() => {
    if (svgRef.current && geom) applyFit(svgRef.current, geom);
  }, [prepared, geom]);

  if (!host || !prepared) return null;
  const rimBottom = geom ? geom.rimBottom : 755.23;
  return createPortal(
    <svg
      ref={svgRef}
      className="panel-contour"
      aria-hidden="true"
      width={prepared.width}
      fill="none"
      viewBox={`0 0 474 ${rimBottom + 8}`}
      style={{ height: rimBottom + 8 + "px", pointerEvents: "none" }}
    />,
    host
  );
}
