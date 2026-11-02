import { useEffect } from "react";
import { runBoot } from "./src/boot.js";
import { SCREEN_ATTRS, SKELETON_INNER } from "./src/legacy/screen-skeleton.js";
import "./src/styles/legacy.css";

export default function App() {
  useEffect(() => {
    runBoot();
  }, []);
  return (
    <main
      id={SCREEN_ATTRS.id}
      className={SCREEN_ATTRS.class}
      aria-label={SCREEN_ATTRS["aria-label"]}
      dangerouslySetInnerHTML={{ __html: SKELETON_INNER }}
    />
  );
}
