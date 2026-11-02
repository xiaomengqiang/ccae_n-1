
export function initClock() {
window.HCClock=(()=>{let origin=Date.now();const base=Date.UTC(2026,8,9,12);const seconds=()=>Math.floor((Date.now()-origin)/1000);const format=(offset=seconds(),date=false)=>new Date(base+offset*1000).toISOString().slice(date?0:11,19).replace('T',' ');return{seconds,format,reset(){origin=Date.now()}}})();}
