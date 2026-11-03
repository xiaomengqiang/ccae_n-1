import { useEffect } from "react";
import { mountMascot } from "./mascot.js";
import { mountEntrance } from "./entrance.js";
import { mountContour } from "./contour.js";

export default function AgentPanel() {
  useEffect(() => {
    mountMascot();
  }, []);
  useEffect(() => {
    mountEntrance();
  }, []);
  useEffect(() => {
    mountContour();
  }, []);
  return null;
}
