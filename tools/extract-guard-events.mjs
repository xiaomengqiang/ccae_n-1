import { readFileSync, writeFileSync } from "node:fs";

const legacy = readFileSync("preview/src/views/guard-events-table/legacy.js", "utf8");

function sliceBetween(start, end) {
  const s = legacy.indexOf(start);
  const e = legacy.indexOf(end, s);
  if (s === -1 || e === -1) throw new Error(`marker not found: ${start} .. ${end}`);
  return legacy.slice(s, e).trim().replace(/;$/, "").replace(/=$/, "=");
}

const baseFault = sliceBetween("const baseFaultEvents=[", "const historicalEvents=");
const historical = sliceBetween("const historicalEvents=", "const energyServiceNames=");
const energyNames = sliceBetween("const energyServiceNames=", "const energyEvents=");
const energyEvents = sliceBetween("const energyEvents=", "window.getProcessingEnergyEvents");
const states = sliceBetween("const states=[", "let list=");

const out = `import { HOME_WORKLOADS } from "../workloads.js";

export const BASE_FAULT_EVENTS = ${baseFault.slice(baseFault.indexOf("=") + 1)};

export function buildHistoricalEvents() {
  return ${historical.slice(historical.indexOf("=") + 1)};
}

export const ENERGY_SERVICE_NAMES = ${energyNames.slice(energyNames.indexOf("=") + 1)};

export function buildEnergyEvents() {
  return ${energyEvents.slice(energyEvents.indexOf("=") + 1)};
}

export const STATES = ${states.slice(states.indexOf("=") + 1)};

export function buildInitialRecords() {
  const historical = buildHistoricalEvents();
  const energy = buildEnergyEvents();
  return [...BASE_FAULT_EVENTS, ...historical, ...energy];
}
`;

writeFileSync("preview/src/mock/guard-events.js", out, "utf8");
console.log(`guard-events data module: ${out.length} chars`);
