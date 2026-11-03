import { useCallback, useEffect, useRef, useState } from "react";

export function useMascotChoreography(stageEl) {
  const [active, setActive] = useState([]);
  const [ticks, setTicks] = useState({});
  const timers = useRef(new Set());
  const previous = useRef("");
  const idleRef = useRef(() => { });

  const later = useCallback((fn, ms) => {
    const id = setTimeout(() => { timers.current.delete(id); fn(); }, ms);
    timers.current.add(id);
  }, []);

  const clearTimers = useCallback(() => {
    timers.current.forEach((id) => clearTimeout(id));
    timers.current.clear();
  }, []);

  const replay = useCallback((name) => {
    setTicks((t) => ({ ...t, [name]: (t[name] || 0) + 1 }));
  }, []);

  const layerOn = useCallback((name) => {
    setActive((list) => (list.includes(name) ? list : [...list, name]));
  }, []);

  const layerOff = useCallback((name) => {
    setActive((list) => list.filter((n) => n !== name));
  }, []);

  const showIP = useCallback((key) => {
    replay(key);
    setActive((list) => [...list.filter((n) => !n.startsWith("ip-")), key]);
  }, [replay]);

  const idle = useCallback(() => {
    const key = previous.current === "ip-glasses" ? "ip-typing" : previous.current === "ip-typing" ? "ip-glasses" : Math.random() < .5 ? "ip-glasses" : "ip-typing";
    previous.current = key;
    showIP(key);
    replay("bg-ring");
    layerOn("bg-ring");
    later(() => layerOff("bg-ring"), 2805);
    later(idleRef.current, (key === "ip-glasses" ? 2805 : 3927) + 2000 + Math.random() * 1600);
  }, [later, layerOff, layerOn, replay, showIP]);
  idleRef.current = idle;

  const start = useCallback(() => {
    clearTimers();
    setActive([]);
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (stageEl) stageEl.classList.toggle("motion-static", reduced);
    if (reduced) return;
    previous.current = "";
    replay("bg-beam");
    layerOn("bg-beam");
    replay("bg-burst-in");
    layerOn("bg-burst-in");
    showIP("ip-wave");
    later(() => { replay("bg-particles"); layerOn("bg-particles"); layerOff("bg-burst-in"); }, 1780);
    later(idleRef.current, 6996 + 2400);
  }, [clearTimers, later, layerOff, layerOn, replay, showIP, stageEl]);

  useEffect(() => {
    if (!stageEl) return;
    start();
    window.restartMascotEntrance = start;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    reduced.addEventListener("change", start);
    return () => {
      clearTimers();
      reduced.removeEventListener("change", start);
      if (window.restartMascotEntrance === start) delete window.restartMascotEntrance;
    };
  }, [stageEl, start, clearTimers]);

  return { active, ticks };
}
