export type LiveChat={id:string;name:string;text:string;world:string;at:number};
export type LiveDm={id:string;from:string;to:string;text:string;gift?:string;at:number};
export type LivePresence={id:string;name:string;world:string;x:number;y:number;head:number;color:string;at:number};
const ROOT="https://mantledb.sh/v2/everhome";
async function read<T>(path:string,key:string):Promise<T[]>{try{const r=await fetch(`${ROOT}/${path}?t=${Date.now()}`,{cache:"no-store"});if(!r.ok)return[];const d=await r.json();return Array.isArray(d?.[key])?d[key]:[]}catch{return[]}}
async function append<T extends {id:string;at:number}>(path:string,key:string,item:T,limit=120){const current=await read<T>(path,key),now=Date.now(),items=current.filter(x=>x?.id&&x.id!==item.id&&now-(x.at||0)<86400000).slice(-(limit-1));items.push(item);try{await fetch(`${ROOT}/${path}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({[key]:items,updated:now})})}catch{}}
export const liveChat={read:()=>read<LiveChat>("chat","messages"),send:(m:LiveChat)=>append("chat","messages",m)};
export const liveDm={read:()=>read<LiveDm>("social","messages"),send:(m:LiveDm)=>append("social","messages",m,200)};
export const livePresence={read:()=>read<LivePresence>("presence","players"),send:async(p:LivePresence)=>{const now=Date.now(),current=await read<LivePresence>("presence","players"),players=current.filter(x=>x?.id&&x.id!==p.id&&now-x.at<22000).slice(-79);players.push(p);try{await fetch(`${ROOT}/presence`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({players,updated:now})})}catch{}}};
export function liveId(prefix="e"){let id="";try{id=localStorage.getItem("everhome-live-id")||""}catch{}if(!id){id=prefix+Math.random().toString(36).slice(2,10);try{localStorage.setItem("everhome-live-id",id)}catch{}}return id}
