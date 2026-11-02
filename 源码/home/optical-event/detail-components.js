/* 事件详情候选组件：只管理展示，不推断或推进业务状态。 */
window.HCEventUI = (() => {
  const el = (tag, className = '', text) => {
    const node = document.createElement(tag);
    node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  };
  const icon = (name, size = 16) => {
    const node = el('img', 'evt-icon');
    node.src = OPTICAL_ASSETS.icons[name];
    node.alt = '';
    node.width = node.height = size;
    return node;
  };
  const button = (label, className = '', onClick) => {
    const node = el('button', className, label);
    node.type = 'button';
    if (onClick) node.addEventListener('click', onClick);
    return node;
  };
  const place = (node, x, y, width, height) => {
    Object.assign(node.style, {position: 'absolute', left: `${x}px`, top: `${y}px`});
    if (width !== undefined) node.style.width = `${width}px`;
    if (height !== undefined) node.style.height = `${height}px`;
    return node;
  };
  function Badge(text, tone = 'done') {
    return el('span', `evt-badge evt-badge-${text==='已闭环'?'closed':tone}`, text);
  }
  function DiagnosticStep({title, time, badge, tone, content, expanded = true, onToggle, onSelect}) {
    const node = el('section', 'evt-step');
    const header = el('div', 'evt-step-header');
    const select = button('', 'evt-step-select', onSelect);
    select.setAttribute('aria-label', `查看${title}环节`);
    const processing=tone==='processing'||tone==='manual';
    const status=processing?el('i','story-step-icon working'):icon('对勾',16);status.setAttribute('aria-label',processing?'进行中':'已完成');select.append(status, el('strong', '', title));
    if (time) select.append(el('time', '', time));
    header.append(select);
    if (badge) header.append(Badge(badge, tone));
    const toggle = button('', 'evt-collapse', () => onToggle?.(!expanded));
    toggle.setAttribute('aria-label', `${expanded ? '收起' : '展开'}${title}`);
    toggle.setAttribute('aria-expanded', String(expanded));
    toggle.append(el('i', 'evt-chevron'));
    header.append(toggle);
    const body = el('div', 'evt-step-body');
    body.append(content);
    window.HCEvidence?.attach(body,title,badge!=='待处理' && tone!=='processing');
    body.hidden = !expanded;
    node.append(header, body);
    return node;
  }
  function CauseChain(items) {
    const card = el('div', 'evt-card evt-cause');
    card.append(el('h3', '', '故障因果链'));
    const list = el('ol', 'evt-cause-list');
    for (const item of items) {
      const row = el('li', item.root ? 'evt-root-cause' : '');
      row.append(icon(item.icon, 14));
      const content = el('div');
      const title = el('div', 'evt-cause-title', item.title);
      if (item.root) title.append(Badge('根因', 'manual'));
      content.append(title, el('p', '', item.description));
      row.append(content);
      list.append(row);
    }
    card.append(list);
    return card;
  }
  function MetricComparison({label, before, after, unit, changeLabel,direction='up'}) {
    const row = el('div', 'evt-metric-compare');
    if(label==='带宽' && direction==='down')row.classList.add('evt-metric-degraded');
    for (const [index, value] of [before, after].entries()) {
      if (index) {
        const arrow=icon('箭头',20);arrow.classList.add('evt-metric-arrow');
        arrow.width=19.671875;arrow.height=12.992676;row.append(arrow);
      }
      const col = el('div');
      col.append(el('small', '', `${index ? '当前' : '隔离前'}${label} ${unit}`));
      const values=el('div','evt-metric-values');
      values.append(el('b', index ? 'evt-after' : 'evt-before', value));
      if(index && changeLabel){
        const growth=el('span','evt-metric-growth');
        const arrow=icon('箭头2',8);arrow.width=7.464844;arrow.height=8.914551;if(direction==='down')arrow.style.transform='rotate(180deg)';arrow.alt=direction==='down'?'下降':'上升';
        growth.append(arrow,el('span','',changeLabel));values.append(growth);
      }
      col.append(values);
      row.append(col);
    }
    return row;
  }
  function TopologyNode({label, subtitle, count, number, kind = 'device', x, y, width, height}) {
    const node = el('div', `evt-topo-node evt-node-${kind}`);
    node.dataset.node = label;
    node.append(el('span', 'evt-node-label', label));
    if (number) node.append(el('small', 'evt-node-number', number));
    if (subtitle) {
      const line = el('span', 'evt-node-subtitle', subtitle);
      line.append(el('b', '', count));
      node.append(line);
    }
    place(node, x, y, width, height);
    return node;
  }
  function ProcessTimeline({steps, current, onSelect}) {
    const node = el('section', 'evt-process');
    node.setAttribute('aria-label', '处理环节时间轴');
    node.append(el('h2', '', '处理环节'));
    const list = el('div', `evt-process-list${steps.length > 6 ? ' evt-process-extended' : ''}`);
    list.setAttribute('role', 'tablist');
    const widths = [132, 165, 132, 120, 156, 192];
    const offsets = [16, 223, 462, 669, 852, 1083];
    steps.forEach((step, i) => {
      const item = el('div', 'evt-process-item');
      if (steps.length <= 6) {
        item.style.left = steps.length===5 ? `calc(${i*25}% + ${82*(1-i/4)-78*i/4-widths[i]/2}px)` : `${offsets[i]}px`;
        item.style.width = `${widths[i]}px`;
      }
      const card = button('', `evt-process-card${step.manual ? ' evt-pending' : ''}`, () => onSelect(i));
      card.setAttribute('role', 'tab');
      card.setAttribute('aria-selected', String(current === i));
      card.setAttribute('aria-label', step.description.replace(/\n/g, ''));
      if(step.iconName==='红色小手'&&!step.manual)card.classList.add('manual-completed');
      card.append(icon(step.iconName || (step.manual ? '红色小手' : '故障诊断-圆-原稿绿色'), 32));
      const text = el('span');
      const title = el('span', 'evt-process-title', step.title);
      if (step.manual) title.append(el('em', '', '待处理'));
      text.append(title, el('span', 'evt-process-description', step.description));
      card.append(text);
      const tick = el('div', `evt-process-tick${current === i ? ' evt-current' : ''}`);
      tick.append(el('span', '', step.time));
      item.append(card, tick);
      list.append(item);
    });
    node.append(list);
    return node;
  }
  return {el, icon, button, place, Badge, DiagnosticStep, CauseChain, MetricComparison, TopologyNode, ProcessTimeline};
})();
