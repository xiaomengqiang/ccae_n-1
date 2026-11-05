import { OPTICAL_ASSETS } from "../../mock/hc-assets.js";

// 机柜三维展开详情 —— SVG 等距投影（无 3D 引擎，投影函数纯计算）
// 结构与坐标和原 RackDetailView 逐一对齐；端口方块可聚焦（onPort 回调 → 2D 拓扑联动选中）。

const project = (x, y, z) => [340 + (x * .78 + y * .48) * .82, 395 + (-x * .23 + y * .40 - z) * .82];
// 抽屉坐标偏移（原 trayCoordinates 标志位的显式形式）
const projectTray = (x, y, z) => project(x - 145, y, z + 150);

const points = (vertices, proj = project) => vertices.map((v) => proj(...v).join(",")).join(" ");

function Box({ x, y, z, w, d, h, top = "#647984", front = "#344954", side = "#263b46", proj = project }) {
  const a = [x, y, z + h], b = [x + w, y, z + h], c = [x + w, y + d, z + h], dd = [x, y + d, z + h];
  return (
    <>
      <polygon points={points([a, dd, [x, y + d, z], [x, y, z]], proj)} fill={side} />
      <polygon points={points([a, b, c, dd], proj)} fill={top} />
      <polygon points={points([dd, c, [x + w, y + d, z], [x, y + d, z]], proj)} fill={front} />
      <polygon points={points([b, [x + w, y, z], [x + w, y + d, z], c], proj)} fill={side} />
    </>
  );
}

function Label({ x, y, z, text, cls = "", proj = project }) {
  const q = proj(x, y, z);
  return <text x={q[0]} y={q[1]} className={cls}>{text}</text>;
}

// 机柜主体：透明外壳 + 立柱 + 六层抽屉（第五层抽出为导轨）
function RackShell() {
  const parts = [];
  parts.push(<g key="shell" opacity=".18"><Box x={80} y={100} z={-100} w={240} d={220} h={440} top="#c4d9dd" front="#526872" side="#6a818c" /></g>);
  for (const x of [80, 310]) for (const y of [100, 310])
    parts.push(<Box key={`col-${x}-${y}`} x={x} y={y} z={-100} w={10} d={10} h={440} top="#b7cbd0" front="#627984" side="#425a68" />);
  for (let i = 0; i < 6; i++) {
    const z = -85 + i * 70;
    parts.push(
      <g key={`drawer-${i}`} opacity={i === 4 ? 1 : .32}>
        <Box x={90} y={110} z={z} w={220} d={200} h={6} top="#8ba1aa" front="#4a606d" side="#354b57" />
        {i !== 4 ? (
          <>
            <Box x={92} y={115} z={z + 6} w={216} d={194} h={56} top="#8ca2ad" front="#485f6c" side="#354d5b" />
            {Array.from({ length: 6 }, (_, j) => (
              <Box key={j} x={102 + j * 33} y={309} z={z + 16} w={24} d={5} h={34} top="#78909b" front="#233641" side="#536b77" />
            ))}
          </>
        ) : (
          <>
            {[90, 302].map((x) => <Box key={x} x={x} y={200} z={z} w={8} d={260} h={6} top="#d3e0e3" front="#829aa4" side="#627b89" />)}
            <Label x={82} y={325} z={z + 25} text="02" />
          </>
        )}
      </g>
    );
  }
  return <g className="evt-rack-shell">{parts}</g>;
}

// 抽出部分：板卡塔 + 服务器托盘 + L1交换板（含 8 个可聚焦 LPO 端口）+ 连线
function Extracted({ onPort }) {
  const parts = [];
  // 右后方密集银白板卡塔，以薄金属层和暗色间隙表达真实机箱。
  for (let i = 0; i < 19; i++) {
    const z = -100 + i * 23;
    parts.push(<g key={`board-${i}`}>
      <Box x={360} y={100} z={z} w={215} d={220} h={14} top="#bac9cd" front="#82979f" side="#596f7b" />
      <Box x={368} y={106} z={z + 14} w={198} d={202} h={2} top="#dce5e5" front="#9dafb5" side="#80969f" />
      {Array.from({ length: 10 }, (_, j) => (
        <Box key={j} x={372 + j * 19} y={316} z={z + 3} w={12} d={3} h={4} top="#748892" front="#263c49" side="#354b55" />
      ))}
    </g>);
  }
  parts.push(<Label key="l2" x={360} y={85} z={365} text="灵衢互联柜01 · L2-01" />);
  parts.push(<Label key="cab" x={70} y={90} z={360} text="计算柜11" />);

  const tray = [];
  // 狭长服务器托盘从前方抽出，金属边框包围主板和散热器。
  tray.push(<Box key="tray-base" x={235} y={330} z={45} w={240} d={290} h={14} top="#bccbd0" front="#8198a2" side="#5c737f" proj={projectTray} />);
  tray.push(<Box key="tray-board" x={245} y={340} z={59} w={220} d={270} h={4} top="#315e54" front="#284c45" side="#203e3a" proj={projectTray} />);
  for (const x of [235, 465]) tray.push(<Box key={`edge-${x}`} x={x} y={330} z={59} w={10} d={290} h={35} top="#d2dfe0" front="#9cafb5" side="#69828e" proj={projectTray} />);
  for (let i = 0; i < 4; i++) {
    const x = 255 + (i % 2) * 100, y = 365 + Math.floor(i / 2) * 90;
    tray.push(<g key={`npu-${i}`}>
      <Box x={x} y={y} z={63} w={70} d={65} h={13} top="#a3b7bf" front="#627e8c" side="#425d6d" proj={projectTray} />
      {Array.from({ length: 9 }, (_, f) => (
        <Box key={f} x={x + 3 + f * 7} y={y + 3} z={76} w={3} d={58} h={8} top="#d1dee0" front="#8fa5af" side="#617d8c" proj={projectTray} />
      ))}
    </g>);
  }
  for (let i = 0; i < 8; i++) tray.push(<Box key={`fan-${i}`} x={250 + i * 25} y={345} z={64} w={15} d={12} h={12} top="#c6d2d1" front="#4b666e" side="#324c58" proj={projectTray} />);
  tray.push(<Label key="tray-label" x={235} y={322} z={105} text="NPU计算刀片01 · NPU卡 8" proj={projectTray} />);

  // L1 交换板 + 8 个 LPO 端口方块（可聚焦，点击联动 2D 拓扑）
  tray.push(<g key="l1-board" className="evt-rack-board">
    <Box x={260} y={570} z={80} w={190} d={150} h={7} top="#398a70" front="#25614f" side="#1b493f" proj={projectTray} />
    {Array.from({ length: 4 }, (_, i) => (
      <Box key={i} x={274 + i * 42} y={590} z={87} w={28} d={38} h={10} top="#304b46" front="#182b29" side="#203832" proj={projectTray} />
    ))}
    {Array.from({ length: 8 }, (_, i) => {
      const q = projectTray(268 + i * 22, 725, 100);
      return (
        <g
          key={i}
          className={"evt-rack-port" + (i === 0 ? " evt-rack-fault-port" : "")}
          data-port={i} role="button" tabIndex={0}
          aria-label={"聚焦 LPO光模块" + String(i + 1).padStart(2, "0")}
          onClick={(e) => { e.stopPropagation(); onPort(i); }}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onPort(i); } }}
        >
          <Box x={264 + i * 22} y={675} z={87} w={18} d={64} h={23} top={i === 0 ? "#e89994" : "#c8d9d8"} front={i === 0 ? "#ae4b52" : "#7c969a"} side="#536e77" proj={projectTray} />
          <text x={q[0]} y={q[1] + 25} className="evt-rack-port-number">{String(i + 1).padStart(2, "0")}</text>
        </g>
      );
    })}
  </g>);
  tray.push(<Label key="l1-label" x={260} y={560} z={115} text="L1交换板02" proj={projectTray} />);
  tray.push(<Label key="lpo-label" x={260} y={785} z={95} text="LPO 01—08" proj={projectTray} />);

  // L2 → L1 端口贝塞尔连线（第一条为故障链路）
  const source = project(370, 105, 350);
  const links = Array.from({ length: 8 }, (_, i) => {
    const target = project(128 + i * 22, 725, 260);
    return <path key={i} className={"evt-rack-wire" + (i === 0 ? " evt-rack-fault-wire" : "")}
      d={`M${source} C${source[0] + 65} ${source[1] + 70} ${target[0] + 90} ${target[1] - 80} ${target}`} />;
  });

  return <g className="evt-rack-extracted">{parts}<g className="evt-rack-drawer">{tray}</g>{links}</g>;
}

export default function Rack3D({ onPort, hidden = false }) {
  return (
    <div className="evt-rack-detail" hidden={hidden}>
      <svg viewBox="0 0 1332 660" role="img" aria-label="机柜三维展开详情：互联柜L2连接抽出刀片上的L1光模块">
        <defs>
          <radialGradient id="rack-floor">
            <stop stopColor="#303030" />
            <stop offset="1" stopColor="#191919" stopOpacity="0" />
          </radialGradient>
        </defs>
        <ellipse cx="610" cy="435" rx="520" ry="215" fill="url(#rack-floor)" />
        <RackShell />
        <Extracted onPort={onPort} />
      </svg>
    </div>
  );
}
