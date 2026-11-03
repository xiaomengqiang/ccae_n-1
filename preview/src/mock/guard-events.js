import { HOME_WORKLOADS } from "./workloads.js";

export const BASE_FAULT_EVENTS = [
      {name:'光链路脏污，待清污',state:'待人工处理',stateClass:'manual',type:'故障',icon:'fa-exclamation-triangle',iconClass:'fault',object:'计算柜11-L1交换板02',root:'L1-L2 光模块端面脏污',start:'今天 12:00:40',clear:'—',action:'link'},
      {name:'Qwen-1.5B 服务劣化',state:'待人工处理',stateClass:'manual',type:'故障',icon:'fa-exclamation-triangle',iconClass:'fault',object:'推理服务 / D-08 实例',root:'hinic3 驱动版本过低',start:'今天 12:05:00',clear:'—',action:'qwen'},
      {name:'训练集群 RoCE 丢包波动',state:'已闭环',stateClass:'auto-closed',type:'隐患',icon:'fa-shield',iconClass:'hazard',object:'训练作业 / Group18',root:'PFC 水线配置不均衡',start:'今天 11:18:42',clear:'今天 11:19:36',action:''},
      {name:'NPU 节点温度持续偏高',state:'已闭环',stateClass:'auto-closed',type:'隐患',icon:'fa-thermometer-half',iconClass:'hazard',object:'计算节点 112.34.11.12',root:'风道回流导致散热效率下降',start:'今天 11:20:08',clear:'今天 11:21:02',action:''},
      {name:'OSFP 光功率劣化',state:'已闭环',stateClass:'auto-closed',type:'隐患',icon:'fa-wrench',iconClass:'hazard',object:'灵衢互联柜02-L2交换机01',root:'光模块瞬时功率抖动',start:'今天 09:35:12',clear:'今天 09:36:04',action:''},
      {name:'推理实例异常退出',state:'已闭环',stateClass:'auto-closed',type:'隐患',icon:'fa-wrench',iconClass:'hazard',object:'Qwen2.5 / D实例03',root:'容器内存瞬时越限',start:'昨天 23:18:09',clear:'昨天 23:18:42',action:''},
      {name:'交换机配置漂移',state:'已闭环',stateClass:'human-closed',type:'隐患',icon:'fa-user',iconClass:'hazard',object:'计算柜07-L1交换板01',root:'配置模板版本不一致',start:'昨天 20:06:31',clear:'昨天 20:07:18',action:''}
    ];

export function buildHistoricalEvents() {
  return Array.from({length:22},(_,i)=>{
      const closed=i<20,stateClass=closed?'auto-closed':'human-closed';
      return {name:['交换网络瞬时拥塞','光模块温漂告警','NPU 端口误码波动','训练队列链路抖动','推理实例连接闪断'][i%5]+` #${String(i+1).padStart(2,'0')}`,state:closed?'已闭环':'已闭环',stateClass,type:i%3===0?'故障':'隐患',object:`${i%2?'计算节点':'灵衢互联柜'} ${String(i+3).padStart(2,'0')}`,root:['流量突发触发拥塞保护','光功率短时偏离基线','历史配置残留导致漂移'][i%3],start:`${i<8?'今天':'昨天'} ${String(8+i%12).padStart(2,'0')}:${String((i*7)%60).padStart(2,'0')}:18`,clear:`${i<8?'今天':'昨天'} ${String(8+i%12).padStart(2,'0')}:${String((i*7+2)%60).padStart(2,'0')}:06`,action:''}
    });
}

export const ENERGY_SERVICE_NAMES = ["Qwen-14B", "Qwen-1.5B 在线服务", "视觉理解服务-3B", "代码生成 Copilot-1.5B", "Embedding 检索服务-0.5B", "数字人实时推理-1.5B", "视觉理解服务 · 07-3B", "代码生成 Copilot · 08-1.5B", "Embedding 检索服务 · 09-0.5B", "数字人实时推理 · 10-1.5B", "DeepSeek-R1-32B", "视觉理解服务 · 12-3B", "代码生成 Copilot · 13-1.5B", "Embedding 检索服务 · 14-0.5B", "数字人实时推理 · 15-1.5B", "Llama-3-70B"];

export function buildEnergyEvents() {
  const energyServiceNames = ENERGY_SERVICE_NAMES;
  return energyServiceNames.map(name=>{const enabled=HOME_WORKLOADS.inference.some(x=>x.data.name===name&&x.data.energySaving),none=name==='Embedding 检索服务-0.5B';return {name:name+(enabled?' 节能策略执行中':none?' 节能策略优化':' 节能机会识别中'),result:enabled?'已开启节能':none?'暂无节能空间':'—',state:enabled?'自动节能中':none?'无节能空间':'节能机会识别中',stateClass:enabled?'energy-done':none?'energy-none':'energy-wait',type:'节能',object:'推理服务 / '+name,root:enabled?'均衡节能策略已生效，持续监控业务影响':none?'连续 4 个识别周期未发现明显的业务请求变化规律，本轮识别已结束':'正在分析业务请求变化，当前第 1/4 个识别周期',start:'今天 09:00:00',clear:enabled?('今天 10:17:14'):none?'今天 10:00:00':'—',action:name==='Qwen-14B'?'energy':'energy-none'};});
}

export const STATES = [['manual','待人工处理','待人工处理'],['processing','自动处理中','自动处理中-方块'],['auto-closed','已闭环','已自动闭环-方块'],['human-closed','已闭环','已人工闭环-方块'],['energy-wait','节能机会识别中','识别节能-彩色方底'],['energy-done','自动节能中','自动节能-绿色方底'],['energy-none','无节能空间','已生效节能机会点']];

export function buildInitialRecords() {
  const historical = buildHistoricalEvents();
  const energy = buildEnergyEvents();
  return [...BASE_FAULT_EVENTS, ...historical, ...energy];
}
