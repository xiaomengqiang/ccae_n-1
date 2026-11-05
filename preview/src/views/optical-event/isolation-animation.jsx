import { useEffect, useRef } from "react";

// 优雅隔离演示动画 —— canvas 等距投影（L2 单口流量转移到 7 条健康通道后隔离 LPO01）
// 绘制循环/自适应缩放保持命令式（动画），结构 JSX 化；卸载时自动停帧断开监听。
export default function IsolationAnimation() {
  const canvasRef = useRef(null);
  const detailRef = useRef(null);
  const figureRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current, ctx = canvas.getContext("2d"), detail = detailRef.current, figure = figureRef.current;
    let elapsed = 0, last = 0, previousPhase = -1;
    const W = 620, H = 450;
    const p = (x, y, z = 0) => ({ x: 305 + x * .79 - y * .61, y: 45 + x * .32 + y * .52 - z });
    function poly(points, fill, stroke, width = 1) { ctx.beginPath(); points.forEach((q, i) => i ? ctx.lineTo(q.x, q.y) : ctx.moveTo(q.x, q.y)); ctx.closePath(); ctx.fillStyle = fill; ctx.fill(); if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = width; ctx.stroke(); } }
    function line(points, color, width = 1) { ctx.beginPath(); points.forEach((q, i) => i ? ctx.lineTo(q.x, q.y) : ctx.moveTo(q.x, q.y)); ctx.strokeStyle = color; ctx.lineWidth = width; ctx.lineCap = "round"; ctx.lineJoin = "round"; ctx.stroke(); }
    function face(x, y, w, d, z, color, edge) { poly([p(x, y, z), p(x + w, y, z), p(x + w, y + d, z), p(x, y + d, z)], color, edge); }
    function text(s, x, y, z, size, color) { const q = p(x, y, z); ctx.fillStyle = color; ctx.font = `500 ${size}px -apple-system,BlinkMacSystemFont,"PingFang SC",sans-serif`; ctx.fillText(s, q.x, q.y); }
    function box(x, y, w, d, h, top, front, side) { poly([p(x, y + d, 0), p(x + w, y + d, 0), p(x + w, y + d, h), p(x, y + d, h)], front, "#53616c", .7); poly([p(x + w, y, 0), p(x + w, y + d, 0), p(x + w, y + d, h), p(x + w, y, h)], side, "#44535e", .7); face(x, y, w, d, h, top, "#7d8d9960"); }
    const l2OutletX = 165;
    const ports = Array.from({ length: 8 }, (_, i) => 38 + i * 39);
    function device(y, l1) {
      const h = 24; ctx.save(); ctx.shadowColor = "#0009"; ctx.shadowBlur = 10; ctx.shadowOffsetY = 6; face(-15, y - 8, 360, 105, 0, "#080d11"); ctx.restore();
      let grad = ctx.createLinearGradient(250, 100, 530, 480); grad.addColorStop(0, l1 ? "#a4b3bf" : "#3c4a56"); grad.addColorStop(.55, l1 ? "#7c8f9d" : "#25313b"); grad.addColorStop(1, l1 ? "#445867" : "#18232c");
      box(0, y, 330, 76, h, grad, l1 ? "#5c6d79" : "#1e2831", "#1b2832");
      for (let k = 0; k < 14; k++) { line([p(14 + k * 7, y + 12, 25), p(14 + k * 7, y + 32, 25)], "#09151e85", 1.3); }
      if (!l1) { line([p(0, y + 76, 19), p(330, y + 76, 19)], "#a94e54", 1.3); }
      (l1 ? ports : [l2OutletX]).forEach((x, i) => {
        const py = l1 ? y : y + 76;
        face(x - 9, py - 5, 19, 10, 26, "#0b161c", "#8cabb5"); face(x - 6, py - 3, 13, 6, 27, "#223d49", "#87bac780");
        if (l1) { text("LPO", x - 11, y + 19, 28, 12, "#e4eef4"); text(String(i + 1).padStart(2, "0"), x - 7, y + 38, 28, 13, "#e4eef4"); }
      });
    }
    // A single L2 port feeds a short common trunk, then fans out to eight L1 ports.
    function route(i, t) { const u = Math.max(0, (t - .18) / .82), spread = u * u * (3 - 2 * u); return p(l2OutletX + (ports[i] - l2OutletX) * spread, 116 + t * 250, 26); }
    function routeLine(i, a, b, color, width) { line(Array.from({ length: 70 }, (_, j) => route(i, a + (b - a) * j / 69)), color, width); }
    function dot(q, color, r = 1.9, alpha = 1) { ctx.save(); ctx.globalAlpha = alpha; ctx.shadowColor = color; ctx.shadowBlur = 2; ctx.fillStyle = color; ctx.beginPath(); ctx.arc(q.x, q.y, r, 0, Math.PI * 2); ctx.fill(); ctx.restore(); }
    function draw(t) {
      ctx.clearRect(0, 0, W, H);
      let bg = ctx.createRadialGradient(420, 280, 20, 400, 300, 480); bg.addColorStop(0, "#273743"); bg.addColorStop(.6, "#17222c"); bg.addColorStop(1, "#10161c"); ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
      for (let k = -8; k < 20; k++) { line([p(k * 36, 0, -5), p(k * 36, 490, -5)], "#96b8cb06"); line([p(-130, k * 32, -5), p(490, k * 32, -5)], "#96b8cb06"); }
      const phase = t < 4.5 ? 0 : t < 6.8 ? 1 : 2;
      device(40, false);
      routeLine(0, 0, .18, "#8bc5d340", 11); routeLine(0, 0, .18, "#8fd4df88", 1);
      ports.forEach((_, i) => {
        routeLine(i, .18, 1, i === 0 ? "#92999f40" : "#8bc5d322", 9); routeLine(i, .18, 1, i === 0 ? "#dc697565" : "#66c8d445", 5); routeLine(i, .18, 1, i === 0 ? "#e07883" : "#8fd4df66", 1); routeLine(i, .18, .995, "#ddf6ff25", .6);
        if (i === 0) {
          // All positions increase from L2 (0) toward L1 (1). The queue never crosses the break.
          if (phase < 2) { const queueTime = Math.min(t, 4.5), alpha = phase === 0 ? 1 : Math.max(0, 1 - (t - 4.5) / 1.4); for (let j = 0; j < 10; j++) { const age = queueTime - j * .32; if (age < 0) continue; const s = Math.min(.52 - j * .028, age * .22); if (alpha > 0) dot(route(0, s), "#f3c77c", 1.9, alpha); } const q = route(0, .55); ctx.save(); ctx.shadowBlur = 12; ctx.shadowColor = "#ff6477"; line([{ x: q.x - 7, y: q.y - 6 }, { x: q.x + 6, y: q.y + 6 }], "#fd8997", 2); line([{ x: q.x - 4, y: q.y + 6 }, { x: q.x + 4, y: q.y - 6 }], "#fd8997", 2); ctx.restore(); }
          if (phase === 2) { routeLine(0, .22, 1, "#9ca6ad50", 10); routeLine(0, .22, 1, "#e0808b", 1); }
        } else { for (let j = 0; j < 9; j++) { const s = (t * .19 + j / 9 + i * .025) % 1; dot(route(i, s), "#9ee2ee", 1.7); } }
      });
      // One continuous journey: new traffic starts inside L2, reaches its healthy port,
      // then enters that same external route. No reverse motion or teleporting queue.
      if (phase > 0) {
        // Redistribute one yellow stream across seven routes; do not multiply it sevenfold.
        for (let k = 0; k < 40; k++) { const i = 1 + k % 7, age = t - 4.5 - k * .32; if (age < .8) continue; const s = (age - .8) * .19; if (s <= 1) dot(route(i, s), "#f3c77c", 1.8); }
      }
      device(366, true);
      // Draw the badge last so devices, tubes and particles cannot cover it.
      if (phase === 2) { const q = route(0, .55); ctx.fillStyle = "#323c44"; ctx.strokeStyle = "#9aa8b0"; ctx.lineWidth = .8; ctx.beginPath(); ctx.roundRect(q.x - 31, q.y - 12, 62, 24, 5); ctx.fill(); ctx.stroke(); ctx.fillStyle = "#e4ecef"; ctx.font = "12px sans-serif"; ctx.fillText("已隔离", q.x - 18, q.y + 4); }
      if (phase !== previousPhase) { previousPhase = phase; detail.textContent = ["LPO 01 闪断，流量在断点前积压", "流量转至 LPO 02–08 健康通道", "LPO 01 已隔离，健康通道持续承载业务"][phase]; }
    }
    function resize() { let width = canvas.clientWidth || canvas.getBoundingClientRect().width, dpr = Math.min(2, devicePixelRatio || 1); canvas.width = width * dpr; canvas.height = width * H / W * dpr; ctx.setTransform(canvas.width / W, 0, 0, canvas.height / H, 0, 0); }
    const observer = new ResizeObserver(resize); observer.observe(canvas); resize();
    let stopped = false, rafId = 0;
    function frame(now) {
      if (stopped || !figure.isConnected) { observer.disconnect(); return; }
      if (document.hidden || !figure.getClientRects().length) { last = 0; setTimeout(() => { if (!stopped) rafId = requestAnimationFrame(frame); }, 250); return; }
      if (last && now - last < 33) { rafId = requestAnimationFrame(frame); return; }
      if (last) elapsed += Math.min(now - last, 100) * 1.3 / 1000;
      last = now; draw(elapsed % 16); rafId = requestAnimationFrame(frame);
    }
    rafId = requestAnimationFrame(frame);
    return () => { stopped = true; cancelAnimationFrame(rafId); observer.disconnect(); };
  }, []);

  return (
    <figure className="evt-isolation-animation" ref={figureRef}>
      <div className="motion-footer"><span className="detail" aria-live="polite" ref={detailRef} /></div>
      <div className="motion-scene">
        <canvas role="img" aria-label="L2单口连接L1的LPO01至08；异常支路闪断后流量转移，随后隔离。" ref={canvasRef} />
        <span className="motion-device-label label-l2">灵衢L2-01</span>
        <span className="motion-device-label label-l1">计算柜11 · L1交换板02</span>
      </div>
      <div className="motion-legend"><span><b className="cyan-dot">●</b> 健康通道原有流量</span><span><b className="yellow-dot">●</b> 原 LPO 01 支路流量</span></div>
    </figure>
  );
}
