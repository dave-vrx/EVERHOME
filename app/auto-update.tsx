"use client";
import {useEffect,useState} from "react";

const STORED_VERSION="everhome-live-version";

export function AutoUpdate(){
 const [updating,setUpdating]=useState(false);
 useEffect(()=>{
  let stopped=false;
  const root=window.location.pathname.replace(/\/[^/]*$/,"").replace(/\/$/,"");
  async function check(){
   if(stopped)return;
   try{
    const response=await fetch(`${root}/version.json?check=${Date.now()}`,{cache:"no-store",headers:{Accept:"application/json"}});
    if(!response.ok)return;
    const {version}=await response.json() as {version?:string};
    if(!version)return;
    const current=sessionStorage.getItem(STORED_VERSION);
    if(!current){sessionStorage.setItem(STORED_VERSION,version);return}
    if(current!==version){
     sessionStorage.setItem(STORED_VERSION,version);
     setUpdating(true);
     window.setTimeout(()=>window.location.reload(),650);
    }
   }catch{/* Stay on the current working build while offline. */}
  }
  check();
  const timer=window.setInterval(check,15000);
  const visible=()=>{if(document.visibilityState==="visible")check()};
  document.addEventListener("visibilitychange",visible);
  return()=>{stopped=true;window.clearInterval(timer);document.removeEventListener("visibilitychange",visible)};
 },[]);
 return updating?<div className="liveUpdate" role="status"><i>↻</i><div><b>EVERHOME just updated</b><span>Loading the newest version…</span></div></div>:null;
}
