"use client";
import {useMemo,useState} from "react";

const worlds=[
 {title:"Coastal Haven",maker:"Mira",players:142,tag:"SOCIAL",art:"coast",icon:"🌊"},
 {title:"Neon District",maker:"Kairo",players:89,tag:"ADVENTURE",art:"neon",icon:"🌃"},
 {title:"Skybound Academy",maker:"Orbit",players:64,tag:"LEARN",art:"sky",icon:"☁️"},
 {title:"Tiny Café",maker:"Pip",players:37,tag:"ROLEPLAY",art:"cafe",icon:"☕"},
];
const nav=[["⌂","Home"],["◉","Discover"],["✦","Avatar"],["⚒","Create"],["▣","Market"]];

export default function Home(){
 const [active,setActive]=useState("Home"),[search,setSearch]=useState(""),[selected,setSelected]=useState<(typeof worlds)[number]|null>(null),[joined,setJoined]=useState(false),[chat,setChat]=useState(""),[messages,setMessages]=useState(["Welcome to EVERHOME! ✨"]);
 const filtered=useMemo(()=>worlds.filter(w=>w.title.toLowerCase().includes(search.toLowerCase())),[search]);
 function send(e:React.FormEvent){e.preventDefault();if(chat.trim()){setMessages(m=>[...m.slice(-2),chat.trim()]);setChat("")}}
 return <main className="shell">
  <aside><button className="brand"><b>E</b><strong>EVERHOME</strong></button><nav>{nav.map(([i,n])=><button className={active===n?"active":""} onClick={()=>setActive(n)} key={n}><i>{i}</i>{n}</button>)}</nav><div className="asideBottom"><button>♙ Friends <em>8</em></button><button>⚙ Settings</button><div className="me"><span>🙂</span><p><b>Guest_4821</b><small>● Online</small></p></div></div></aside>
  <section className="content"><header><div className="mobileLogo">E</div><label><span>⌕</span><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search worlds, people, items..."/><kbd>⌘ K</kbd></label><div className="tools"><button>◈ 1,240</button><button>♧</button><button className="face">🙂</button></div></header>
   <div className="page"><section className="hero"><div className="heroText"><small>THE WORLD IS YOURS</small><h1>Imagine it.<br/><em>Make it real.</em></h1><p>Build places, create games, and hang out with people from everywhere. No limits. No downloads.</p><div><button className="primary" onClick={()=>setSelected(worlds[0])}>▶ Start playing</button><button className="secondary" onClick={()=>setActive("Create")}>⚒ Start creating</button></div><footer><b>●</b> 2,847 people exploring now</footer></div><div className="scene"><div className="sun"/><div className="cloud"/><div className="island"><i>♠</i><i>♠</i></div><div className="person"><div className="hair"/><div className="head">•‿•</div><div className="body"/><div className="legs"/></div><div className="speech">Hey! Come explore 👋</div></div></section>
    <section className="worlds"><div className="heading"><div><small>JUMP IN</small><h2>{search?"Search results":"Popular right now"}</h2></div><button onClick={()=>setActive("Discover")}>See all worlds →</button></div><div className="grid">{filtered.map((w,i)=><article key={w.title} onClick={()=>setSelected(w)} tabIndex={0}><div className={`art ${w.art}`}><span>{w.icon}</span><b className="play">▶</b><small className="tag">{w.tag}</small>{i===0&&<small className="featured">FEATURED</small>}</div><div className="info"><div><h3>{w.title}</h3><p>By {w.maker}</p></div><small>● {w.players}</small></div></article>)}</div></section>
    <section className="studio"><b>⚒</b><div><small>YOUR IDEAS, ALIVE</small><h2>Build a world. Make a game.</h2><p>Easy tools to start. Powerful enough to go anywhere.</p></div><button onClick={()=>setActive("Create")}>Open EVERHOME Studio →</button></section>
   </div>
  </section>
  <nav className="mobileNav">{nav.map(([i,n])=><button className={active===n?"active":""} onClick={()=>setActive(n)} key={n}><i>{i}</i><span>{n}</span></button>)}</nav>
  {active!=="Home"&&<div className="overlay"><section className="panel"><button className="x" onClick={()=>setActive("Home")}>×</button><small>EVERHOME / {active.toUpperCase()}</small><h2>{active==="Create"?"What will you make today?":active==="Avatar"?"Make it unmistakably you.":active==="Market"?"Find your next favorite thing.":"A universe worth exploring."}</h2><p>{active==="Create"?"Shape worlds together with terrain, logic, sound, and community-made assets. Your first space is already waiting.":"A beautiful home for every part of the EVERHOME community."}</p><button className="primary">{active==="Create"?"+ Create a new world":`Explore ${active}`}</button></section></div>}
  {selected&&<div className="overlay" onMouseDown={()=>{setSelected(null);setJoined(false)}}><section className="modal" onMouseDown={e=>e.stopPropagation()}><button className="x" onClick={()=>setSelected(null)}>×</button><div className={`modalArt ${selected.art}`}><span>{selected.icon}</span><div className="player">🙂</div>{messages.map((m,i)=><div className="bubble" style={{bottom:105+i*34}} key={m+i}>{m}</div>)}</div><div className="modalText"><small>{selected.tag} · {selected.players} ONLINE</small><h2>{selected.title}</h2><p>By {selected.maker} · Explore with friends, discover hidden places, and make this world your own.</p>{!joined?<button className="primary wide" onClick={()=>setJoined(true)}>▶ Join as Guest_4821</button>:<><div className="joined">● You’re in the world</div><form onSubmit={send}><input value={chat} onChange={e=>setChat(e.target.value)} placeholder="Say something..." maxLength={80}/><button>Send</button></form></>}</div></section></div>}
 </main>
}
