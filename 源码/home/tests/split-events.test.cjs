/* Local DOM/state regression only: no browser, URL load, network, or visual-layout claims.
 * Default: current exported HTML. --source: current source assembled in memory.
 * HC_JSDOM_PATH can override the existing read-only DOM dependency; no install occurs.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const {JSDOM, VirtualConsole} = require(process.env.HC_JSDOM_PATH || '/Users/mac/Documents/codex/2026-09-27/wo-x/work/onboarding-v4-tests/node_modules/jsdom');
const root = path.resolve(__dirname, '../..');
const fromSource = process.argv.includes('--source');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const transparent = 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=';

function sourceDocument() {
  const iconMap = file => ({icons: Object.fromEntries(Object.keys(JSON.parse(read(file)).icons).map(key => [key, transparent]))});
  const scripts = [
    read('home/evidence.js'),
    `const HOME_WORKLOADS=${read('home/workloads.json')};`,
    `const HC_ASSETS=${JSON.stringify(iconMap('components/data.json'))};`,
    ...['components/motion-runtime.js', 'components/components.js', 'home/demo-clock.js', 'home/main.js', 'home/events.js'].map(read),
    `const HOME_LINKS_SVG=${JSON.stringify(read('assets/cabinet-links.svg'))};`,
    read('home/reference-0909/enhancements.js'),
    `const OPTICAL_ASSETS=${JSON.stringify(iconMap('home/optical-event/assets.json'))};`,
    ...['home/optical-event/detail-components.js', 'home/optical-event/entrance.js', 'home/optical-event/event.js',
      'home/optical-host.js', 'home/nic-event/event.js', 'home/story-state.js', 'home/story.js',
      'home/guardian-metrics.js', 'home/mascot-motion.js', 'home/panel-entrance.js'].map(read),
    `const ENERGY_CABINET=${JSON.stringify(transparent)};`,
    ...['home/energy/state.js', 'home/energy/energy.js'].map(read)
  ];
  const panelAsset = 'data:image/svg+xml;base64,' + Buffer.from(read('assets/agent-panel-opaque.svg')).toString('base64');
  return read('home/page.html').replace('@@CSS@@', '').replace('@@JS@@', scripts.join('\n')).replaceAll('@@PANEL@@', panelAsset).replace(/@@[^@]+@@/g, transparent);
}

function installPlatform(w) {
  let time = 0, sequence = 0;
  const queue = new Map();
  const schedule = (fn, delay = 0, args = [], interval = 0) => {
    const id = ++sequence;
    queue.set(id, {fn, at: time + Math.max(0, Number(delay) || 0), args, interval});
    return id;
  };
  w.setTimeout = (fn, delay, ...args) => schedule(fn, delay, args);
  w.clearTimeout = id => queue.delete(id);
  w.setInterval = (fn, delay, ...args) => schedule(fn, Math.max(1, Number(delay) || 1), args, Math.max(1, Number(delay) || 1));
  w.clearInterval = w.clearTimeout;
  w.requestAnimationFrame = fn => schedule(() => fn(time), 16);
  w.cancelAnimationFrame = w.clearTimeout;
  w.Date.now = () => time;
  Object.defineProperty(w.performance, 'now', {value: () => time});
  Object.defineProperty(w.document, 'timeline', {value: {get currentTime() { return time; }}});
  w.matchMedia = query => ({media: query, matches: query.includes('prefers-reduced-motion'), addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {}});
  w.ResizeObserver = class { observe() {} unobserve() {} disconnect() {} };
  w.MutationObserver = class { observe() {} disconnect() {} takeRecords() { return []; } };
  w.DOMMatrixReadOnly = class { constructor(value) { this.m41 = Number(String(value).match(/translateX\(([-.\d]+)px\)/)?.[1] || 0); } };
  w.Element.prototype.scrollIntoView = function() {};
  w.Element.prototype.scrollTo = function() {};
  w.Element.prototype.getAnimations = function() { return []; };
  w.Element.prototype.animate = function(_frames, options = {}) {
    const settings = typeof options === 'number' ? {duration: options} : options;
    let complete;
    const animation = {onfinish: null, playState: 'running', currentTime: 0, finished: new Promise(resolve => { complete = resolve; })};
    const finish = () => { animation.playState = 'finished'; complete(animation); animation.onfinish?.(); };
    const timer = settings.iterations === Infinity ? null : schedule(finish, (settings.delay || 0) + (settings.duration || 0));
    animation.cancel = () => { queue.delete(timer); animation.playState = 'idle'; complete(animation); };
    animation.finish = finish;
    animation.pause = () => { animation.playState = 'paused'; };
    animation.play = () => { animation.playState = 'running'; };
    animation.addEventListener = (type, fn) => { if (type === 'finish') animation.onfinish = fn; };
    return animation;
  };
  // Stable synthetic geometry prevents division by zero. It is not layout verification.
  for (const [key, value] of [['offsetWidth', 100], ['clientWidth', 100], ['offsetHeight', 30], ['clientHeight', 30]]) {
    Object.defineProperty(w.HTMLElement.prototype, key, {configurable: true, get() { return parseFloat(this.style[key.includes('Width') ? 'width' : 'height']) || value; }});
  }
  w.Element.prototype.getBoundingClientRect = function() { return {x: 0, y: 0, left: 0, top: 0, right: this.offsetWidth || 100, bottom: this.offsetHeight || 30, width: this.offsetWidth || 100, height: this.offsetHeight || 30}; };
  w.SVGElement.prototype.getTotalLength = () => 100;
  w.SVGElement.prototype.getBBox = () => ({x: 0, y: 0, width: 100, height: 30});
  w.SVGElement.prototype.getComputedTextLength = () => 50;
  Object.defineProperty(w.document, 'fonts', {value: {ready: Promise.resolve(), addEventListener() {}}});
  w.fetch = () => { throw new Error('Network access is disabled in this local test'); };
  w.XMLHttpRequest = class { constructor() { throw new Error('Network access is disabled in this local test'); } };
  return {
    now: () => time,
    advanceTo(until) {
      assert.ok(until >= time, 'Clock cannot move backwards');
      let callbacks = 0;
      while (true) {
        const next = [...queue].filter(([, job]) => job.at <= until).sort((a, b) => a[1].at - b[1].at || a[0] - b[0])[0];
        if (!next) break;
        assert.ok(++callbacks < 100000, 'Unexpected unbounded timer loop');
        const [id, job] = next;
        time = job.at;
        if (job.interval) job.at += job.interval;
        else queue.delete(id);
        assert.equal(typeof job.fn, 'function', 'Only function timers are permitted');
        job.fn(...job.args);
      }
      time = until;
    }
  };
}

async function main() {
  const source = fromSource ? sourceDocument() : fs.readFileSync(path.resolve(root, '../演示导出/AgentDemo-当前演示.html'), 'utf8');
  const errors = [], virtualConsole = new VirtualConsole();
  virtualConsole.on('jsdomError', error => errors.push(error));
  const dom = new JSDOM(source, {runScripts: 'outside-only', virtualConsole});
  const w = dom.window, d = w.document;
  // Wait for the parser's load before attaching the application's once-only load listener.
  if (d.readyState !== 'complete') await new Promise(resolve => w.addEventListener('load', resolve, {once: true}));
  const clock = installPlatform(w);
  vm.runInContext([...d.scripts].map(n => n.textContent).join('\n'), dom.getInternalVMContext(), {filename: fromSource ? 'assembled-source.js' : 'current-export.js'});
  w.dispatchEvent(new w.Event('load'));
  assert.ok(w.HCStory, 'Story initialized');
  for(const domain of ['training','inference','resource'])for(const type of ['fault','risk','energy'])for(const closed of [false,true]){
    const mark=w.HCComponents.EventTypeIcon({domain,type,closed});
    if(type==='fault'){
      assert.ok(mark.classList.contains('hc-unified-fault'));
      assert.equal(mark.querySelectorAll('img').length,1);
      assert.equal(mark.querySelectorAll('svg,.hc-event-model,.hc-event-type-mark').length,0);
      assert.equal(mark.dataset.closed,String(closed));
      assert.equal(mark.querySelector('img').src,vm.runInContext('HC_ASSETS',dom.getInternalVMContext()).icons[closed?'灰色的故障':'红色的故障']);
      continue;
    }
    assert.equal(mark.dataset.domain,type==='energy'?'inference':domain);
    assert.equal(mark.dataset.closed,String(closed));
    assert.equal(mark.querySelectorAll('.hc-event-type-mark').length,1);
    assert.ok(mark.querySelector('svg,.hc-event-model'));
  }

  const checkErrors = () => assert.deepEqual(errors.map(e => e.message), [], 'No script errors');
  const panel = () => d.querySelector('.hc-nic-module');
  const click = node => { assert.ok(node, 'Expected a clickable element'); node.click(); checkErrors(); };
  const mode = expected => { assert.ok(panel(), 'NIC detail opens'); assert.equal(panel().dataset.detailMode, expected, 'NIC event mode'); };
  const compactCheck = abnormal => {
    const group = d.querySelector('.hc-metric-group[data-category="inference"]');
    const orbit = group.querySelector('.hc-health-orbit');
    assert.ok(orbit, 'Inference compact health anchor exists');
    assert.equal(group.dataset.health, abnormal ? 'abnormal' : 'normal');
    assert.equal(orbit.querySelector('.hc-health-ring').textContent, abnormal ? '1' : '');
    assert.equal(orbit.querySelector('.hc-health-label').textContent, abnormal ? '项异常' : '正常');
    assert.equal(!!orbit.querySelector('[alt*="节能"],[title*="节能"],.energy-label-leaf'), false);
  };
  const qwenMarks = () => d.querySelector('#home-timeline-markers [data-event-key="qwen"]');
  const sharedPopoverCheck = stage => {
    const anchor = qwenMarks(), buttons = [...anchor.querySelectorAll('button.story-marker')];
    assert.equal(buttons.length, 2);
    const ids = buttons.map(button => button.getAttribute('aria-describedby'));
    assert.ok(ids[0], 'Recovery marker describes its full shared progress');
    assert.equal(ids[1], ids[0], 'Both Qwen markers describe the same tooltip');
    const popover = d.getElementById(ids[0]);
    assert.ok(popover && anchor.contains(popover), 'Shared tooltip belongs to the Qwen marker pair');
    assert.equal(popover.getAttribute('role'), 'tooltip');
    const samePopover = () => {
      assert.equal(anchor.querySelectorAll('.story-popover').length, 1, 'The pair has one complete tooltip');
      assert.equal(d.querySelectorAll(`[id="${ids[0]}"]`).length, 1, 'The shared tooltip ID is unique');
      assert.equal(d.getElementById(buttons[0].getAttribute('aria-describedby')), popover);
      assert.equal(d.getElementById(buttons[1].getAttribute('aria-describedby')), popover);
    };
    samePopover();
    assert.equal(popover.querySelectorAll('.story-popover-section').length,2);
    buttons[0].dispatchEvent(new w.Event('pointerenter'));
    assert.equal(popover.dataset.activePart,'completed');
    buttons[1].dispatchEvent(new w.Event('pointerenter'));
    assert.equal(popover.dataset.activePart,'followup');
    buttons[0].dispatchEvent(new w.Event('focus'));
    assert.equal(popover.dataset.activePart,'completed');
    samePopover();
    const rows = [...popover.querySelectorAll('.story-popover-row')];
    const texts = rows.map(row => row.textContent.trim());
    const expectedBusiness = [
      /^发现.*Qwen-1\.5B.*劣化/,
      /^操作系统.*D\s*实例.*异常退出/,
      /^生成.*(节点迁移|切换节点).*方案/,
      /^节点迁移完成.*业务劣化已恢复/
    ];
    expectedBusiness.forEach((expected, index) => {
      assert.match(texts[index], expected, `Business stage ${index + 1} remains in full chronological progress`);
      assert.ok(rows[index].classList.contains('done'), `Business stage ${index + 1} remains completed while driver work continues`);
      assert.equal(rows[index].querySelector('.story-step-icon')?.getAttribute('aria-label'), '已完成');
    });
    assert.match(texts[4], /BMC.*OS.*vmcore.*日志/, 'Resource diagnosis follows all four business stages');
    if (stage >= 6) {
      const rootIndex = texts.findIndex(text => /根因.*网卡驱动.*版本过低/.test(text));
      assert.ok(rootIndex > 4, 'Driver root cause follows resource log analysis');
      if (stage === 6) assert.match(texts.at(-1), /网卡驱动待升级/, 'The pending upgrade remains in the complete tooltip');
      else {
        const confirmed = texts.findIndex(text => /已确认.*网卡驱动升级完成/.test(text));
        const healthy = texts.findIndex(text => /节点健康检查通过/.test(text));
        const pooled = texts.findIndex(text => /节点重新加入资源池/.test(text));
        assert.ok(confirmed > rootIndex && healthy > confirmed && pooled > healthy, 'Upgrade confirmation, health check and resource return remain chronological');
      }
    }
    assert.ok(rows.at(-1).classList.contains(stage === 4 ? 'working' : stage === 6 ? 'manual' : 'done'), 'Driver progress keeps its own state');
    // Simulate pointer entry through either child, including the ancestor pointerenter
    // that a browser dispatches. Crossing between children must not create a new tooltip.
    anchor.dispatchEvent(new w.MouseEvent('pointerenter'));
    buttons[0].dispatchEvent(new w.MouseEvent('pointerover', {bubbles: true}));
    assert.ok(anchor.classList.contains('story-visible'));
    samePopover();
    buttons[0].dispatchEvent(new w.MouseEvent('pointerout', {bubbles: true, relatedTarget: buttons[1]}));
    buttons[1].dispatchEvent(new w.MouseEvent('pointerover', {bubbles: true, relatedTarget: buttons[0]}));
    assert.ok(anchor.classList.contains('story-visible'));
    samePopover();
    anchor.dispatchEvent(new w.MouseEvent('pointerleave'));
    clock.advanceTo(clock.now() + 181);
    if (stage >= 6) assert.equal(anchor.classList.contains('story-visible'), false, 'Settled progress hides after pointer exit');
    buttons[0].focus();
    assert.ok(anchor.classList.contains('story-visible'), 'Recovery marker focus reveals shared progress');
    samePopover();
    buttons[1].focus();
    clock.advanceTo(clock.now() + 181);
    assert.ok(anchor.classList.contains('story-visible'), 'Moving focus to the driver marker retains shared progress');
    samePopover();
    buttons[1].blur();
    clock.advanceTo(clock.now() + 181);
    if (stage >= 6) assert.equal(anchor.classList.contains('story-visible'), false, 'Settled progress hides after focus leaves the pair');
    checkErrors();
  };
  const businessOnlyCheck = () => {
    assert.equal(panel().querySelector('.nic-confirm-execute'), null);
    const headings = [...panel().querySelectorAll('.evt-diagnostic-scroll .evt-step-select strong')].map(n => n.textContent);
    assert.ok(headings.every(text => !/资源故障|网卡驱动|节点健康核查|重新加入资源池/.test(text)), 'Business detail omits resource work');
  };
  const fourBusinessStagesCheck = () => {
    mode('recovery');
    businessOnlyCheck();
    const heading = panel().querySelector('.evt-heading-copy h1');
    assert.match(heading.textContent, /Qwen-1\.5B服务劣化，已恢复/);
    assert.match(heading.textContent, /已闭环/);
    assert.doesNotMatch(heading.textContent, /已自动闭环/);
    assert.equal(panel().querySelector('.evt-diagnosis-intro .nic-related-event'), null);
    const todo = panel().querySelector('.nic-event-summary .nic-summary-relation');
    assert.ok(todo, 'Related follow-up belongs to summary');
    assert.equal(panel().querySelectorAll('.nic-related-event').length, 1, 'Related event is not duplicated');
    assert.ok(todo.querySelector('button.evt-isolation-link'), 'Todo retains driver-detail navigation');
    const stages = [...panel().querySelectorAll('.evt-diagnostic-scroll .nic-event-process-body > .evt-step')];
    const titles = stages.map(node => node.querySelector('.evt-step-select strong')?.textContent);
    const expected = [/感知/, /分析|诊断/, /决策/, /恢复/];
    assert.equal(stages.length, 4, 'Recovery detail has four large stages');
    expected.forEach((expression, i) => assert.match(titles[i], expression, `Left-side business stage ${i + 1}`));
    assert.match(stages[2].querySelector('.evt-step-body').textContent, /节点迁移|切换.*节点|节点切换/, 'Decision has its own node migration proposal');
    assert.match(stages[3].querySelector('.evt-step-body').textContent, /已恢复|恢复.*完成|已完成D实例迁移.*业务劣化恢复/);
    assert.match(stages[3].querySelector('.evt-step-body').textContent, /闭环/, 'Business closure is part of recovery');
    assert.ok(stages.every(node => node.querySelector('.evt-step-header .evt-badge-done')), 'All four business stages remain complete during driver follow-up');
    const nodes = [...panel().querySelectorAll('.nic-flow-node')];
    assert.equal(nodes.length, 4, 'The recovery flow has four nodes, without a fifth closure node');
    expected.forEach((expression, i) => assert.match(nodes[i].querySelector('.evt-process-title').textContent, expression, `Business flow node ${i + 1}`));
    assert.match(nodes[3].textContent, /业务劣化恢复/, 'Recovery flow node describes recovery');
    assert.doesNotMatch(nodes[3].textContent, /已闭环/, 'Recovery flow omits redundant closure wording');
    assert.ok(nodes.every(node => !/资源故障|网卡驱动/.test(node.textContent)), 'Recovery flow excludes driver processing');
    assert.ok(nodes.every(node => !/^事件闭环$/.test(node.querySelector('.evt-process-title').textContent)), 'Closure is not an extra flow node');
    // A dedicated decision node selects a distinct left-side stage from recovery.
    click(nodes[2]);
    assert.match(panel().querySelector('.nic-flow-node[aria-selected="true"] .evt-process-title').textContent, /决策/);
    const selectedDecision = panel().querySelector('.evt-diagnostic-scroll .nic-event-process-body > .evt-step:last-child .evt-step-select strong');
    assert.match(selectedDecision.textContent, /决策/);
    assert.equal(panel().querySelectorAll('.nic-event-process-body > .evt-step').length,3,'Future recovery stays hidden during decision replay');
    assert.equal(panel().querySelectorAll('.nic-event-process-body > .evt-step.evt-focus-dim').length,0,'Reached steps stay bright');
    assert.equal(panel().querySelector('.nic-instance-topology').dataset.phase, 'proposal', 'Decision review shows the proposed node migration');
    const recoveryNode = [...panel().querySelectorAll('.nic-flow-node')][3];
    click(recoveryNode);
    const selectedRecovery = panel().querySelector('.evt-diagnostic-scroll .nic-event-process-body > .evt-step:last-child .evt-step-select strong');
    assert.match(selectedRecovery.textContent, /恢复/);
    assert.equal(panel().querySelector('.nic-instance-topology').dataset.phase, 'swapped', 'Recovery review shows the migrated node');
  };
  const qwenRows = () => [...d.querySelectorAll('#guard-all tbody tr')].filter(row => /Qwen-1\.5B业务劣化|网卡驱动/.test(row.cells[0]?.textContent || ''));
  const recordsCheck = (count, driverStatus) => {
    w.openGuardEvents();
    const rows = qwenRows();
    assert.equal(rows.length, count, 'Business and resource events are separate records');
    if (count === 2) {
      assert.ok(rows.some(row => /Qwen-1\.5B业务劣化/.test(row.cells[0].textContent) && /已闭环/.test(row.cells[1].textContent)));
      assert.ok(rows.some(row => /网卡驱动/.test(row.cells[0].textContent) && row.cells[1].textContent.includes(driverStatus)));
    }
    return rows;
  };
  compactCheck(false);
  for (const [elapsed, stage] of [[12000, 1], [26000, 3]]) {
    clock.advanceTo(elapsed);
    assert.equal(w.HCStory.get().qwen, stage);
    compactCheck(true);
    assert.equal(d.querySelector('.cabinet-red').hidden,true);
    assert.equal(d.querySelector('#home-tips .qwen'),null);
    assert.equal(w.storyWorkloads('inference').find(x=>/^Qwen-1.5B/.test(x.data.name)).status,'degraded');
    assert.equal(qwenMarks().querySelectorAll('button.story-marker').length, 1);
    recordsCheck(1);
    click(qwenMarks().querySelector('button'));
    mode('recovery');
    businessOnlyCheck();
    w.closeNicEvent();
  }
  for (const [elapsed, stage, state, status] of [[30000, 4, 'auto', '自动处理中'], [39000, 6, 'manual', '待人工处理']]) {
    clock.advanceTo(elapsed);
    assert.equal(w.HCStory.get().qwen, stage);
    compactCheck(false);
    const anchor = qwenMarks();
    assert.ok(anchor.querySelector('[data-part=recovery] .hc-event-type-icon').classList.contains('hc-unified-fault'));
    assert.equal(anchor.querySelector('[data-part=recovery] .hc-event-type-icon').dataset.closed,'true');
    assert.ok(anchor.querySelector('[data-part=driver] .hc-event-type-icon').classList.contains('hc-unified-fault'));
    assert.equal(!!anchor.querySelector('[data-part=driver] .hc-event-manual-hand'),state==='manual');
    const tip=d.querySelector('#home-tips .qwen');
    if(stage<5){assert.equal(tip,null);}else{
    assert.ok(tip.querySelector('img')); 
    assert.ok(tip.querySelector('span').textContent.trim());
    assert.equal(!!tip.querySelector('.fault-status-flags'),state==='manual');}
    assert.equal(d.querySelector('.cabinet-red').hidden,stage<5);
    assert.equal(!!anchor.querySelector('.story-marker > .fault-status-flags'),state==='manual');
    const recovered=anchor.querySelector('[data-part=recovery]'),driver=anchor.querySelector('[data-part=driver]');
    recovered.dispatchEvent(new w.Event('pointerover',{bubbles:true}));
    assert.ok(recovered.classList.contains('story-linked-target'));
    assert.ok(!driver.classList.contains('story-linked-target'));
    assert.ok(!d.querySelector('#home-tips .qwen.story-linked-target'));
    if(stage<5)assert.equal(d.querySelector('.story-linked-location'),null);
    recovered.dispatchEvent(new w.Event('pointerout',{bubbles:true}));
    if(tip){tip.dispatchEvent(new w.Event('pointerover',{bubbles:true}));assert.ok(driver.classList.contains('story-linked-target'));assert.ok(!recovered.classList.contains('story-linked-target'));tip.dispatchEvent(new w.Event('pointerout',{bubbles:true}));assert.equal(d.querySelector('.story-linked-location'),null);}


    assert.equal(anchor.querySelectorAll('button.story-marker').length, 2);
    assert.ok(anchor.querySelector('[data-part="recovery"]').classList.contains('closed'));
    assert.ok(anchor.querySelector('[data-part="driver"]').classList.contains(state));
    sharedPopoverCheck(stage);
    const rows = recordsCheck(2, status);
    click(rows.find(row => /Qwen-1\.5B业务劣化/.test(row.cells[0].textContent)).querySelector('button.record-detail'));
    mode('recovery');
    assert.match(panel().textContent, /已闭环|已闭环/);
    fourBusinessStagesCheck();
    w.closeNicEvent();
    click(anchor.querySelector('[data-part="recovery"]'));
    mode('recovery');
    click(panel().querySelector('.nic-related-event button'));
    mode('driver');
    assert.deepEqual([...panel().querySelectorAll('.evt-step-select strong')].map(n=>n.textContent),stage<6?['事件感知','故障分析']:['事件感知','故障分析','方案决策','故障恢复']);
    assert.ok(panel().querySelector('.nic-event-summary').textContent.includes('处置状态'));
    assert.equal(panel().querySelector('.nic-service-journey'),null);
    assert.equal(panel().querySelectorAll('.nic-view-tab').length,0);
    click(panel().querySelector('.nic-related-event button'));
    mode('recovery');
    w.closeNicEvent();
    click(qwenRows().find(row => /网卡驱动/.test(row.cells[0].textContent)).querySelector('button.record-detail'));
    mode('driver');
    assert.equal(!!panel().querySelector('.nic-confirm-execute'), stage === 6, 'Confirmation appears only when the upgrade is ready');
    if(stage===6){const step=panel().querySelector('[data-section="4"]');assert.equal(step.querySelector('.evt-step-body').hidden,false);assert.equal(step.querySelector('.evt-step-select').firstElementChild.getAttribute('aria-label'),'待人工处理');}
    assert.ok(panel().querySelector('.nic-related-business-title .evt-badge'));
    w.closeNicEvent();
    click(qwenMarks().querySelector('[data-part="driver"]'));
    mode('driver');
    if (stage === 4) w.closeNicEvent();
  }
  click(panel().querySelector('.nic-confirm-execute'));
  assert.equal(w.HCStory.get().qwen, 9);
  compactCheck(false);
  assert.ok([...qwenMarks().querySelectorAll('button.story-marker')].every(n => n.classList.contains('closed')));
  sharedPopoverCheck(9);
  assert.equal(panel().querySelector('.nic-confirm-execute'), null);
  w.closeNicEvent();
  w.openNicEvent({mode: 'driver'});
  mode('driver');
  assert.equal(panel().querySelector('.nic-confirm-execute'), null, 'Reopening preserves completed upgrade');
  assert.match(panel().textContent, /已完成|已闭环|已闭环/);
  w.closeNicEvent();
  w.openNicEvent({mode: 'recovery'});
  fourBusinessStagesCheck();
  const viewTabs=panel().querySelectorAll('.nic-view-tab');
  assert.equal(viewTabs.length,2);
  click(viewTabs[0]);
  assert.equal(panel().querySelector('.nic-service-journey').hidden,false);
  const overlaySelect=panel().querySelector('.nic-journey-metric');
  const journeySvg=panel().querySelector('.nic-service-journey svg');
  assert.equal(journeySvg.querySelectorAll('.journey-event').length,3);
  assert.equal(journeySvg.querySelector('.journey-event').dataset.second,'10');
  const initialCurve=journeySvg.querySelector('.journey-line-degraded').getAttribute('d');
  overlaySelect.value='success';overlaySelect.dispatchEvent(new w.Event('change'));
  assert.equal(journeySvg.dataset.metric,'success');
  assert.notEqual(journeySvg.querySelector('.journey-line-degraded').getAttribute('d'),initialCurve);
  overlaySelect.value='tpot';overlaySelect.dispatchEvent(new w.Event('change'));
  assert.equal(journeySvg.dataset.metric,'tpot');
  assert.ok(journeySvg.getAttribute('aria-label').includes('TPOT'));
  journeySvg.getBoundingClientRect=()=>({left:0,width:1280});
  for(const [x,time,status] of [[0,'12:05:00','正常'],[410,'12:05:12','服务劣化'],[840,'12:05:38','服务正常']]){
    journeySvg.dispatchEvent(new w.MouseEvent('pointermove',{clientX:x}));
    const hover=panel().querySelector('.nic-journey-hover');assert.equal(hover.hidden,false);assert.ok(hover.textContent.includes(time));assert.ok(hover.textContent.includes(status));assert.equal(hover.querySelectorAll('dd').length,2);
  }
  for(const point of journeySvg.querySelectorAll('.journey-event')){
    point.dispatchEvent(new w.MouseEvent('pointermove',{bubbles:true,clientX:0}));
    const hover=panel().querySelector('.nic-journey-hover');
    assert.ok(hover.querySelector('.journey-event-card').textContent.includes(point.dataset.name));
    assert.equal(hover.querySelector('.nic-journey-hover-heading>span').textContent,Number(point.dataset.second)<12?'服务正常':'服务劣化');
    if(point.dataset.type==='operation'){assert.equal(point.dataset.second,'36');assert.ok(hover.textContent.includes('5 秒'));}
  }
  for(const [second,phase,normal] of [[0,'initial',true],[10,'initial',true],[11,'initial',true],[12,'initial',false],[31,'proposal',false],[36,'swapped',false],[38,'swapped',true]]){
    const x=second<12?second/12*410:second<38?410+(second-12)/26*430:840+(second-38)/22*440;
    journeySvg.dispatchEvent(new w.MouseEvent('click',{bubbles:true,clientX:x}));
    assert.equal(panel().querySelector('.nic-instance-topology').dataset.phase,phase);
    assert.equal(panel().querySelector('.nic-service').classList.contains('nic-service-recovered'),normal);
    assert.ok(panel().querySelector('.nic-journey-replay').textContent.includes('12:05:'+String(second).padStart(2,'0')));
  }
  click(viewTabs[1]);click(viewTabs[0]);
  assert.ok(panel().querySelector('.nic-journey-replay').textContent.includes('12:05:38'));
  click(panel().querySelector('.nic-journey-replay button'));
  assert.equal(panel().querySelector('.nic-journey-replay').hidden,true);
  journeySvg.dispatchEvent(new w.Event('pointerleave'));
  assert.equal(panel().querySelector('.nic-journey-hover').hidden,true);
  assert.equal(panel().querySelector('.nic-flow').hidden,true);
  click(viewTabs[1]);
  assert.equal(panel().querySelector('.nic-flow').hidden,false);
  assert.equal(panel().querySelector('.nic-service-journey').hidden,true);
  w.closeNicEvent();
  recordsCheck(2, '已闭环');
  click(d.querySelector('#home-header button'));
  assert.equal(w.HCStory.get().qwen, 0);
  assert.equal(qwenMarks(), null);
  compactCheck(false);
  recordsCheck(0);
  clock.advanceTo(clock.now() + 39000);
  w.openNicEvent({mode: 'driver'});
  mode('driver');
  assert.ok(panel().querySelector('.nic-confirm-execute'), 'Replay clears the prior completion');
  w.closeNicEvent();
  for(const mode of ['full','isolation']){
    w.openOpticalEvent({mode});
    const heading=d.querySelector('#optical-event-root .evt-event-heading');
    assert.equal(heading.querySelectorAll(':scope > .hc-event-type-icon.evt-icon').length,1,'Composite optical icon retains positioned header slot');
    assert.equal(heading.querySelectorAll(':scope > .evt-back').length,1);
    assert.ok(heading.querySelector('.hc-event-type-icon').classList.contains('hc-unified-fault'));
    if(mode==='isolation')assert.equal(heading.querySelector('.hc-event-type-icon').dataset.closed,'true');
    w.closeOpticalEvent();
  }
  checkErrors();
  clock.advanceTo(clock.now()+5000);
  assert.equal(w.HCStory.get().thermal,1);
  assert.equal(d.querySelectorAll('.thermal-map-tip').length,1);
  assert.equal(d.querySelectorAll('.thermal-anchor').length,1);
  assert.equal(d.querySelectorAll('.thermal-anchor > .story-marker.manual').length,2);
  assert.equal(d.querySelectorAll('.thermal-anchor .hc-event-manual-hand').length,2);
  assert.ok(d.querySelector('.thermal-anchor [data-part=business]').getAttribute('aria-label').includes('业务未恢复'));
  assert.equal(d.querySelectorAll('.thermal-event').length,1);
  const thermalMarker=d.querySelector('.thermal-anchor [data-part=resource]');
  thermalMarker.dispatchEvent(new w.Event('pointerover',{bubbles:true}));
  assert.ok(d.querySelector('.thermal-npu-highlight'));
  assert.ok(d.querySelector('.thermal-map-tip').classList.contains('story-linked-target'));
  thermalMarker.dispatchEvent(new w.Event('pointerout',{bubbles:true}));
  assert.equal(d.querySelector('.thermal-npu-highlight'),null);
  assert.ok(d.querySelector('.thermal-popover').textContent.includes('可用节点不足'));
  assert.ok(w.storyWorkloads('inference').some(x=>x.data.name==='Qwen-14B'&&x.status==='degraded'));
  checkErrors();
  dom.window.close();
  console.log(`PASS (${fromSource ? 'source' : 'current exported HTML'}): inference badges; stages 1/3/4/6/9; split timeline; unique shared full-progress tooltip and pointer/focus; four business stages/nodes with closure in recovery; separate records/routes; scoped details; cross-navigation; confirmation persistence; replay reset. DOM/state only, not visual verification.`);
}
main().catch(error => { console.error(error); process.exitCode = 1; });
