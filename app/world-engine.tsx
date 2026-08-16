"use client";
import { useEffect, useRef, useState } from "react";
import {
  liveChat,
  liveId,
  livePresence,
  type LiveChat,
  type LivePresence,
} from "./realtime";
import { activeNpcsForWorld } from "./npc-system";

type World = {
  id: string;
  name: string;
  icon: string;
  theme: string;
  players: number;
  kind: string;
  description: string;
};
type Avatar = {
  skin: string;
  hair: string;
  top: string;
  bottom: string;
  face: string;
  hat: string;
  model?: string;
  hairStyle?: string;
  topStyle?: string;
  bottomStyle?: string;
  shoeStyle?: string;
  shoeColor?: string;
};
type SmoothedPresence = LivePresence & {displayX?:number;displayY?:number;displayHead?:number};
type Companion = {kind:string;name:string;hunger?:number;happy?:number;energy?:number};
type Catch = { name: string; icon: string; size: number; rare: string };
type FishState = "idle" | "waiting" | "reeling" | "caught";
type Hotspot = {
  x: number;
  y: number;
  r: number;
  icon: string;
  label: string;
  result: string;
};
const TAU = Math.PI * 2,
  clamp = (n: number, a: number, b: number) => Math.max(a, Math.min(b, n));
const palettes: Record<
  string,
  {
    sky: string;
    far: string;
    ground: string;
    edge: string;
    path: string;
    water?: string;
    glow: string;
  }
> = {
  forest: {
    sky: "#8de7dc",
    far: "#61bba2",
    ground: "#52a86b",
    edge: "#28664b",
    path: "#e5c987",
    glow: "#ffd36b",
  },
  lake: {
    sky: "#8bdcff",
    far: "#438ec7",
    ground: "#3c9563",
    edge: "#195f65",
    path: "#d9b674",
    water: "#1477b8",
    glow: "#67e8ff",
  },
  coast: {
    sky: "#ffc797",
    far: "#d77783",
    ground: "#61a36f",
    edge: "#276b69",
    path: "#f3c983",
    water: "#167db1",
    glow: "#ffbe69",
  },
  neon: {
    sky: "#161738",
    far: "#37236d",
    ground: "#292455",
    edge: "#171331",
    path: "#6752a4",
    glow: "#41e5dd",
  },
  sky: {
    sky: "#a6e5ff",
    far: "#74bce8",
    ground: "#8fcf83",
    edge: "#527e86",
    path: "#f4e7bf",
    glow: "#ffffff",
  },
  cafe: {
    sky: "#ffd7d0",
    far: "#d88686",
    ground: "#bf8f78",
    edge: "#754e4d",
    path: "#ffe2b6",
    glow: "#ff869b",
  },
  arcade: {
    sky: "#251642",
    far: "#54266e",
    ground: "#293667",
    edge: "#151733",
    path: "#7158a8",
    glow: "#ff4fa7",
  },
};
const props = [
  [-430, -280, "🌲"],
  [-210, -390, "🌲"],
  [350, -320, "🌲"],
  [480, -50, "🌲"],
  [-500, 190, "🌲"],
  [-260, 360, "🌲"],
  [290, 350, "🌲"],
  [520, 220, "🌲"],
  [-80, -280, "🪨"],
  [210, 120, "🌼"],
  [0, 260, "🪵"],
] as const;
const WORLD_W = 4000,
  WORLD_H = 2700;
const FISH_ISLANDS = [
  {
    id: "coconut",
    name: "Coconut Bay",
    x: 650,
    y: 620,
    r: 340,
    theme: "tropical",
    icon: "🌴",
  },
  {
    id: "crescent",
    name: "Crescent Isle",
    x: 1750,
    y: 480,
    r: 330,
    theme: "tropical",
    icon: "🌺",
  },
  {
    id: "volcanic",
    name: "Volcanic Depths",
    x: 430,
    y: 1800,
    r: 350,
    theme: "volcanic",
    icon: "🌋",
  },
  {
    id: "luxian",
    name: "Luxian Dunes",
    x: 1780,
    y: 1780,
    r: 370,
    theme: "desert",
    icon: "🏜️",
  },
  {
    id: "tanglewood",
    name: "Tanglewood",
    x: 2920,
    y: 1030,
    r: 330,
    theme: "swamp",
    icon: "🌿",
  },
  {
    id: "twilight",
    name: "Twilight Realm",
    x: 3250,
    y: 2050,
    r: 340,
    theme: "twilight",
    icon: "🌙",
  },
  {
    id: "altar",
    name: "The Altar",
    x: 2250,
    y: 330,
    r: 95,
    theme: "rock",
    icon: "💎",
  },
  {
    id: "lighthouse",
    name: "Lighthouse",
    x: 3670,
    y: 1110,
    r: 235,
    theme: "lighthouse",
    icon: "🗼",
  },
] as const;
const ISLAND_COLORS: Record<string, [string, string, string]> = {
  tropical: ["#f0d997", "#51ad65", "#2c7542"],
  volcanic: ["#493b37", "#3d3b40", "#ff7041"],
  desert: ["#ead49b", "#d0ae5c", "#9d7834"],
  swamp: ["#687151", "#38553a", "#1d3424"],
  twilight: ["#6c56a0", "#55417f", "#2e2454"],
  rock: ["#a9b0b7", "#777e87", "#4b535e"],
  lighthouse: ["#d9cfae", "#6f8d72", "#435e53"],
};
const WORLD_HOTSPOTS: Record<string, Hotspot[]> = {
  campfire: [
    {
      x: 2000,
      y: 1350,
      r: 190,
      icon: "🔥",
      label: "Warm hands",
      result: "You toast a marshmallow and warm your hands. 🔥",
    },
    {
      x: 1600,
      y: 1190,
      r: 150,
      icon: "🎸",
      label: "Play guitar",
      result: "You play a cozy campfire tune. 🎶",
    },
    {
      x: 2390,
      y: 1510,
      r: 150,
      icon: "📖",
      label: "Tell a story",
      result: "You share a story with everyone nearby. 📖",
    },
  ],
  coast: [
    {
      x: 1900,
      y: 1430,
      r: 180,
      icon: "⛵",
      label: "Ring boat bell",
      result: "Ding ding! The marina bell rings across the bay. ⛵",
    },
    {
      x: 2550,
      y: 1040,
      r: 160,
      icon: "🌅",
      label: "Watch sunset",
      result: "You stop to watch the golden sunset. 🌅",
    },
    {
      x: 1250,
      y: 1650,
      r: 150,
      icon: "🛟",
      label: "Feed the gulls",
      result: "A flock of happy gulls gathers around. 🐦",
    },
  ],
  neon: [
    {
      x: 2000,
      y: 1350,
      r: 230,
      icon: "🪩",
      label: "Dance",
      result: "You hit the glowing dance floor! 🕺",
    },
    {
      x: 2680,
      y: 1150,
      r: 150,
      icon: "🎧",
      label: "DJ booth",
      result: "You drop a sparkling EVERHOME beat. 🎧",
    },
    {
      x: 1260,
      y: 1540,
      r: 150,
      icon: "🥤",
      label: "Order mocktail",
      result: "You get a fizzy neon berry mocktail. 🥤",
    },
  ],
  sky: [
    {
      x: 2000,
      y: 1350,
      r: 170,
      icon: "📚",
      label: "Join class",
      result: "You learn a new world-building trick. 📚",
    },
    {
      x: 2750,
      y: 900,
      r: 160,
      icon: "🔭",
      label: "Use telescope",
      result: "You discover a tiny world between the clouds. 🔭",
    },
    {
      x: 1180,
      y: 1710,
      r: 160,
      icon: "🧪",
      label: "Try experiment",
      result: "Your cloud experiment makes a rainbow! 🌈",
    },
  ],
  cafe: [
    {
      x: 2300,
      y: 1150,
      r: 170,
      icon: "☕",
      label: "Make a drink",
      result: "You make a perfect heart-shaped latte. ☕",
    },
    {
      x: 1550,
      y: 1500,
      r: 160,
      icon: "🍰",
      label: "Eat cake",
      result: "The strawberry mochi cake is delicious! 🍰",
    },
    {
      x: 2700,
      y: 1650,
      r: 160,
      icon: "🎹",
      label: "Play piano",
      result: "A gentle café melody fills the room. 🎹",
    },
  ],
  arcade: [
    {
      x: 2000,
      y: 1350,
      r: 190,
      icon: "🕹️",
      label: "Play cabinet",
      result: "NEW HIGH SCORE! Your initials glow on screen. 🏆",
    },
    {
      x: 2750,
      y: 1120,
      r: 160,
      icon: "🎟️",
      label: "Collect tickets",
      result: "You win 25 prize tickets! 🎟️",
    },
    {
      x: 1280,
      y: 1600,
      r: 170,
      icon: "🏀",
      label: "Shoot hoops",
      result: "Swish! Three baskets in a row. 🏀",
    },
  ],
};
function drawFishTag(
  ctx: CanvasRenderingContext2D,
  sx: number,
  sy: number,
  name: string,
  title: string,
  badge: string,
  chatText = "",
) {
  ctx.save();
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  if (chatText) {
    ctx.font = "600 11px system-ui";
    const words = chatText.split(/\s+/),
      lines: string[] = [];
    let line = "";
    for (const word of words) {
      const next = line ? `${line} ${word}` : word;
      if (ctx.measureText(next).width > 190 && line) {
        lines.push(line);
        line = word;
      } else line = next;
    }
    if (line) lines.push(line);
    const cw = Math.max(
        60,
        Math.min(
          210,
          Math.max(...lines.map((x) => ctx.measureText(x).width)) + 18,
        ),
      ),
      ch = lines.length * 14 + 12,
      cy = sy - 142;
    ctx.fillStyle = "rgba(6,20,34,.9)";
    ctx.beginPath();
    ctx.roundRect(sx - cw / 2, cy - ch, cw, ch, 9);
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,.3)";
    ctx.stroke();
    ctx.fillStyle = "#eaf6ff";
    lines.forEach((l, i) => ctx.fillText(l, sx, cy - ch + 12 + i * 14));
    ctx.beginPath();
    ctx.moveTo(sx - 5, cy);
    ctx.lineTo(sx + 5, cy);
    ctx.lineTo(sx, cy + 6);
    ctx.closePath();
    ctx.fill();
  }
  ctx.font = "800 8px system-ui";
  const tw = Math.max(54, ctx.measureText(title).width + 18),
    ty = sy - 122;
  ctx.fillStyle = "rgba(12,8,0,.9)";
  ctx.beginPath();
  ctx.roundRect(sx - tw / 2, ty, tw, 14, 7);
  ctx.fill();
  ctx.strokeStyle = title === "CREATOR" ? "#8beaff" : "#ffd166";
  ctx.stroke();
  ctx.fillStyle = title === "CREATOR" ? "#8beaff" : "#ffd166";
  ctx.fillText(title, sx, ty + 7);
  ctx.font = "800 10.5px system-ui";
  const nw = Math.max(46, ctx.measureText(name.slice(0, 16)).width + 24),
    ny = sy - 103;
  ctx.fillStyle = "rgba(6,20,34,.9)";
  ctx.beginPath();
  ctx.roundRect(sx - nw / 2, ny, nw, 22, 11);
  ctx.fill();
  ctx.strokeStyle = "#74eaff";
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.fillStyle = "#eaf6ff";
  ctx.fillText(name.slice(0, 16), sx, ny + 8);
  ctx.fillStyle = "#74eaff";
  ctx.font = "800 8px system-ui";
  ctx.fillText("Lv1", sx, ny + 16);
  if (badge) {
    ctx.fillStyle = badge === "✧" ? "#f5fbff" : "#ffd166";
    ctx.strokeStyle = "#fff";
    ctx.beginPath();
    ctx.arc(sx + nw / 2, ny + 2, 7, 0, TAU);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#7a5500";
    ctx.font = "900 9px system-ui";
    ctx.fillText(badge, sx + nw / 2, ny + 2);
  }
  ctx.restore();
}

export function EverhomeWorldEngine({
  world,
  username,
  avatar,
  onExit,
  onVisit,
  onChat,
}: {
  world: World;
  username: string;
  avatar: Avatar;
  onExit: () => void;
  onVisit: (id: string) => void;
  onChat: () => void;
}) {
  const canvas = useRef<HTMLCanvasElement>(null),
    mapCanvas = useRef<HTMLCanvasElement>(null),
    actor = useRef({ x: 650, y: 620, head: 0, speed: 0, vx: 0, vy: 0 }),
    cam = useRef({ x: 650, y: 620 }),
    keys = useRef(new Set<string>()),
    joy = useRef({ x: 0, y: 0 }),
    hold = useRef(false),
    fishRef = useRef<{
      state: FishState;
      at: number;
      marker: number;
      zone: number;
      progress: number;
    }>({ state: "idle", at: 0, marker: 0.5, zone: 0.5, progress: 0 }),
    seenChat = useRef(new Set<string>()),
    chatChannel = useRef<BroadcastChannel | null>(null),
    presenceChannel = useRef<BroadcastChannel | null>(null),
    remotePlayers = useRef<SmoothedPresence[]>([]),
    companion = useRef<Companion>({kind:"fox",name:"Nova"}),
    companionPos = useRef({x:610,y:650});
  const [chat, setChat] = useState(false),
    [message, setMessage] = useState(""),
    [bubble, setBubble] = useState(""),
    [log, setLog] = useState<string[]>([]),
    [people, setPeople] = useState(false),
    [unread, setUnread] = useState(0),
    [liveReady, setLiveReady] = useState(false),
    [onlineCount, setOnlineCount] = useState(1),
    [near, setNear] = useState<Hotspot | null>(null),
    [activity, setActivity] = useState(""),
    [fishState, setFishState] = useState<FishState>("idle"),
    [status, setStatus] = useState("Sail to a fishing spot and cast."),
    [bag, setBag] = useState<Catch[]>(() => {
      if (typeof window === "undefined") return [];
      try {
        return JSON.parse(
          localStorage.getItem("everhome-lake-catches") || "[]",
        );
      } catch {
        return [];
      }
    }),
    [reel, setReel] = useState({ marker: 0.5, zone: 0.5, progress: 0 });
  const lake = world.id === "lake",
    theme = palettes[world.theme] || palettes.forest;
  useEffect(() => {
    onVisit(world.id);
  }, [onVisit, world.id]);
  useEffect(() => {
    try { companion.current = JSON.parse(localStorage.getItem("everhome-pet") || "null") || companion.current; } catch {}
    const spawn = lake ? { x: 650, y: 620 } : { x: 2000, y: 1350 };
    actor.current = { ...spawn, head: 0, speed: 0, vx: 0, vy: 0 };
    companionPos.current = {x:spawn.x-42,y:spawn.y+34};
    cam.current = { ...spawn };
    setNear(null);
    setActivity("");
  }, [lake, world.id]);
  useEffect(() => {
    const accept = (all: LiveChat[]) => {
      const fresh = all
        .filter(
          (m) => m?.id && m.world === world.id && Date.now() - m.at < 3600000,
        )
        .sort((a, b) => a.at - b.at);
      setLog(fresh.slice(-60).map((m) => `${m.name}: ${m.text}`));
      let added = 0;
      for (const m of fresh) {
        if (!seenChat.current.has(m.id)) {
          seenChat.current.add(m.id);
          if (m.name !== username) added++;
        }
      }
      if (added && !chat) setUnread((n) => n + added);
    };
    chatChannel.current =
      typeof BroadcastChannel !== "undefined"
        ? new BroadcastChannel(`everhome-world-${world.id}`)
        : null;
    chatChannel.current.onmessage = (e) => {
      const m = e.data as LiveChat;
      if (!m || m.world !== world.id || seenChat.current.has(m.id)) return;
      seenChat.current.add(m.id);
      setLog((l) => [...l.slice(-59), `${m.name}: ${m.text}`]);
      if (m.name !== username && !chat) setUnread((n) => n + 1);
    };
    let alive = true;
    const poll = async () => {
      const data = await liveChat.read();
      if (alive) {
        setLiveReady(true);
        accept(data);
      }
    };
    poll();
    const timer = setInterval(poll, 1400);
    return () => {
      alive = false;
      clearInterval(timer);
      chatChannel.current?.close();
    };
  }, [chat, username, world.id]);

  useEffect(() => {
    const id = liveId(),
      accept = (all: LivePresence[]) => {
        const now = Date.now(),
          byId = new Map<string, LivePresence>();
        for (const p of all)
          if (
            p?.id &&
            p.id !== id &&
            p.world === world.id &&
            now - p.at < 22000 &&
            (!byId.has(p.id) || byId.get(p.id)!.at < p.at)
          )
            byId.set(p.id, p);
        const previous = new Map(remotePlayers.current.map((p) => [p.id, p]));
        const fresh: SmoothedPresence[] = [...byId.values()].map((p) => {
          const old = previous.get(p.id);
          return {...p, displayX: old?.displayX ?? old?.x ?? p.x, displayY: old?.displayY ?? old?.y ?? p.y, displayHead: old?.displayHead ?? old?.head ?? p.head};
        });
        remotePlayers.current = fresh;
        setOnlineCount(1 + fresh.length);
      };
    presenceChannel.current =
      typeof BroadcastChannel !== "undefined"
        ? new BroadcastChannel(`everhome-presence-${world.id}`)
        : null;
    presenceChannel.current.onmessage = (e) =>
      accept([...(remotePlayers.current || []), e.data as LivePresence]);
    let alive = true;
    const sync = async () => {
      const a = actor.current,
        me: LivePresence = {
          id,
          name: username,
          world: world.id,
          x: Math.round(a.x),
          y: Math.round(a.y),
          head: a.head,
          color: "#32d8ff",
          avatar,
          companion: companion.current,
          at: Date.now(),
        };
      presenceChannel.current?.postMessage(me);
      void livePresence.send(me);
      const all = await livePresence.read();
      if (alive) accept(all);
    };
    sync();
    const timer = setInterval(sync, 500);
    return () => {
      alive = false;
      clearInterval(timer);
      presenceChannel.current?.close();
      remotePlayers.current = [];
    };
  }, [avatar, username, world.id]);

  useEffect(() => {
    localStorage.setItem("everhome-lake-catches", JSON.stringify(bag));
  }, [bag]);
  useEffect(() => {
    const movementCodes = new Set(["KeyW", "KeyA", "KeyS", "KeyD", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"]);
    const resetInput = () => {
      keys.current.clear();
      joy.current = { x: 0, y: 0 };
      hold.current = false;
      actor.current.vx = 0;
      actor.current.vy = 0;
      actor.current.speed = 0;
    };
    const down = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.matches("input,textarea")) return;
      if (movementCodes.has(e.code)) e.preventDefault();
      keys.current.add(e.code);
      if (e.code === "Space") {
        e.preventDefault();
        hold.current = true;
        if (lake && fishRef.current.state === "idle") cast();
      }
    };
    const up = (e: KeyboardEvent) => {
      keys.current.delete(e.code);
      if (e.code === "Space") hold.current = false;
    };
    const visibility = () => { if (document.hidden) resetInput(); };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("blur", resetInput);
    document.addEventListener("visibilitychange", visibility);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", resetInput);
      document.removeEventListener("visibilitychange", visibility);
      resetInput();
    };
  }, [lake]);
  function cast() {
    const f = fishRef.current;
    if (f.state !== "idle") return;
    f.state = "waiting";
    f.at = performance.now() + 1400 + Math.random() * 1700;
    setFishState("waiting");
    setStatus("Your float bobs on the water… wait for the bite!");
  }
  function finishCatch() {
    const pool = [
        { name: "Bluegill", icon: "🐟", rare: "Common" },
        { name: "Moon Koi", icon: "🐠", rare: "Uncommon" },
        { name: "Lake Sturgeon", icon: "🐡", rare: "Rare" },
        { name: "Homewater Spirit", icon: "✨", rare: "Legendary" },
      ],
      roll = Math.random(),
      pick = pool[roll > 0.96 ? 3 : roll > 0.78 ? 2 : roll > 0.42 ? 1 : 0],
      caught = {
        ...pick,
        size: Math.round((14 + Math.random() * 83) * 10) / 10,
      };
    setBag((b) => [...b, caught]);
    setBubble(`I caught a ${caught.name}! 🎣`);
    setTimeout(() => setBubble(""), 4000);
    fishRef.current.state = "caught";
    setFishState("caught");
    setStatus(
      `${caught.icon} ${caught.name} · ${caught.size} cm · ${caught.rare}!`,
    );
    setTimeout(() => {
      fishRef.current.state = "idle";
      setFishState("idle");
      setStatus("Great catch! Cast again when ready.");
    }, 1800);
  }
  useEffect(() => {
    const c = canvas.current;
    if (!c) return;
    const ctx = c.getContext("2d")!;
    let frame = 0,
      last = performance.now(),
      w = innerWidth,
      h = innerHeight,
      dpr = 1;
    const resize = () => {
      w = innerWidth;
      h = innerHeight;
      dpr = Math.min(2, devicePixelRatio || 1);
      c.width = w * dpr;
      c.height = h * dpr;
      c.style.width = w + "px";
      c.style.height = h + "px";
    };
    resize();
    addEventListener("resize", resize);
    const iso = (x: number, y: number, z = 0) => {
      const dx = x - cam.current.x,
        dy = y - cam.current.y;
      return {
        x: w / 2 + (dx - dy) * 0.72,
        y: h * 0.52 + (dx + dy) * 0.32 - z,
      };
    };
    const ellipse = (
      x: number,
      y: number,
      rx: number,
      ry: number,
      color: string,
    ) => {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.ellipse(x, y, rx, ry, 0, 0, TAU);
      ctx.fill();
    };
    const avatarDraw = (x: number, y: number, head: number, look: Avatar = avatar) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.fillStyle = "rgba(18,31,44,.22)";
      ctx.beginPath();
      ctx.ellipse(0, 7, 22, 8, 0, 0, TAU);
      ctx.fill();
      if (lake) {
        ctx.rotate(head - 0.78);
        ctx.fillStyle = "#9b6035";
        ctx.beginPath();
        ctx.moveTo(-29, 7);
        ctx.quadraticCurveTo(0, 23, 29, 7);
        ctx.lineTo(19, -9);
        ctx.lineTo(-19, -9);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = "#f4c258";
        ctx.fillRect(-3, -17, 6, 20);
        ctx.fillStyle = "#fff";
        ctx.beginPath();
        ctx.arc(0, -23, 8, 0, TAU);
        ctx.fill();
      } else {
        ctx.fillStyle = look.bottom;
        ctx.beginPath();
        if(look.bottomStyle==="skirt"){ctx.moveTo(-15,-20);ctx.lineTo(15,-20);ctx.lineTo(20,4);ctx.lineTo(-20,4);ctx.closePath()}else if(look.bottomStyle==="shorts"){ctx.roundRect(-13,-20,10,16,4);ctx.roundRect(3,-20,10,16,4)}else{const wide=look.bottomStyle==="wide"?12:9;ctx.roundRect(-wide-3,-20,wide,25,5);ctx.roundRect(3,-20,wide,25,5)}
        ctx.fill();
        ctx.fillStyle = look.topItem === "witch_outfit" ? "#17111f" : look.top;
        ctx.beginPath();
        ctx.roundRect(-17, -48, 34, 33, look.topStyle==="jacket"?5:look.topStyle==="hoodie"?15:10);
        ctx.fill();
        if(look.topStyle==="jacket"){ctx.strokeStyle="#fff9";ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(0,-47);ctx.lineTo(0,-17);ctx.stroke()}else if(look.topStyle==="hoodie"){ctx.strokeStyle="#fff";ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(-3,-44);ctx.lineTo(-3,-34);ctx.moveTo(3,-44);ctx.lineTo(3,-34);ctx.stroke()}
        ctx.fillStyle = look.skin;
        ctx.beginPath();
        ctx.roundRect(-22, -43, 7, 24, 5);
        ctx.roundRect(15, -43, 7, 24, 5);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(0, -64, 19, 0, TAU);
        ctx.fill();
        ctx.fillStyle = look.hair;
        ctx.beginPath();
        ctx.arc(0, -68, 19, Math.PI, TAU);
        ctx.quadraticCurveTo(19, -54, 15, -50);
        ctx.lineTo(10, -64);
        ctx.quadraticCurveTo(0, -57, -10, -64);
        ctx.lineTo(-15, -50);
        ctx.quadraticCurveTo(-19, -55, -19, -68);
        ctx.fill();
        if (look.hat === "witch_hat") {
          ctx.fillStyle = look.hatColor || "#7d4bb5";
          ctx.beginPath();
          ctx.moveTo(-24, -78);
          ctx.lineTo(3, -112);
          ctx.lineTo(12, -82);
          ctx.quadraticCurveTo(29, -78, 31, -72);
          ctx.quadraticCurveTo(0, -66, -31, -72);
          ctx.closePath();
          ctx.fill();
          ctx.fillStyle = "#ead39a";
          ctx.fillRect(-18, -78, 37, 3);
        }
        ctx.fillStyle = "#263241";
        ctx.beginPath();
        ctx.arc(-6, -64, 2.2, 0, TAU);
        ctx.arc(6, -64, 2.2, 0, TAU);
        ctx.fill();
        ctx.strokeStyle = "#b55b62";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(0, -59, 5, 0.2, Math.PI - 0.2);
        ctx.stroke();
        ctx.fillStyle = "rgba(255,126,130,.35)";
        ctx.beginPath();
        ctx.ellipse(-11, -59, 4, 2, 0, 0, TAU);
        ctx.ellipse(11, -59, 4, 2, 0, 0, TAU);
        ctx.fill();
        ctx.fillStyle=look.shoeColor||"#f4f7fb";ctx.beginPath();const boot=look.shoeStyle==="boots"?10:6;ctx.roundRect(-13,-2,11,boot,4);ctx.roundRect(2,-2,11,boot,4);ctx.fill();
      }
      ctx.restore();
    };
    const drawCompanion = (x:number,y:number,pet?:Companion) => {
      if (!pet) return;
      const icons:Record<string,string>={fox:"🦊",cat:"🐱",dog:"🐶",dragon:"🐲",robot:"🤖"};
      ctx.save();
      ctx.translate(x,y);
      ctx.fillStyle="rgba(10,20,38,.2)";
      ctx.beginPath();ctx.ellipse(0,5,16,6,0,0,TAU);ctx.fill();
      ctx.font="30px system-ui";ctx.textAlign="center";ctx.textBaseline="bottom";
      ctx.shadowColor="#10182a66";ctx.shadowBlur=7;ctx.fillText(icons[pet.kind]||"🦊",0,2);ctx.shadowBlur=0;
      ctx.font="800 8px system-ui";ctx.fillStyle="#fff";ctx.strokeStyle="#17233f";ctx.lineWidth=3;
      ctx.strokeText((pet.name||"Companion").slice(0,12),0,15);ctx.fillText((pet.name||"Companion").slice(0,12),0,15);
      ctx.restore();
    };
    const drawMap = () => {
      const mc = mapCanvas.current;
      if (!mc) return;
      const m = mc.getContext("2d")!,
        mw = mc.width,
        mh = mc.height,
        sx = mw / WORLD_W,
        sy = mh / WORLD_H;
      m.clearRect(0, 0, mw, mh);
      const g = m.createLinearGradient(0, 0, 0, mh);
      g.addColorStop(0, lake ? "#183f62" : theme.far);
      g.addColorStop(1, lake ? "#09243b" : theme.edge);
      m.fillStyle = g;
      m.fillRect(0, 0, mw, mh);
      if (lake)
        FISH_ISLANDS.forEach((i) => {
          const colors = ISLAND_COLORS[i.theme];
          m.fillStyle = colors[0];
          m.beginPath();
          m.ellipse(
            i.x * sx,
            i.y * sy,
            Math.max(3, i.r * sx),
            Math.max(2, i.r * sy),
            0,
            0,
            TAU,
          );
          m.fill();
          m.fillStyle = colors[1];
          m.beginPath();
          m.ellipse(
            i.x * sx,
            i.y * sy,
            Math.max(2, i.r * sx * 0.78),
            Math.max(1, i.r * sy * 0.78),
            0,
            0,
            TAU,
          );
          m.fill();
        });
      else {
        m.fillStyle = theme.ground;
        m.beginPath();
        if (world.id === "sky") {
          [
            [1100, 1700, 650],
            [2000, 1350, 760],
            [2900, 850, 610],
          ].forEach(([x, y, r]) =>
            m.ellipse(x * sx, y * sy, r * sx, r * sy * 0.55, 0, 0, TAU),
          );
        } else if (world.id === "coast")
          m.roundRect(430 * sx, 430 * sy, 3140 * sx, 1840 * sy, 28);
        else m.roundRect(520 * sx, 430 * sy, 2960 * sx, 1840 * sy, 28);
        m.fill();
        for (const h of WORLD_HOTSPOTS[world.id] || []) {
          m.fillStyle = "#ffe56b";
          m.beginPath();
          m.arc(h.x * sx, h.y * sy, 3.2, 0, TAU);
          m.fill();
        }
      }
      for (const p of remotePlayers.current) {
        m.fillStyle = p.color || "#ff78c8";
        m.beginPath();
        m.arc(p.x * sx, p.y * sy, 3.4, 0, TAU);
        m.fill();
        m.strokeStyle = "#fff";
        m.lineWidth = 1;
        m.stroke();
      }
      const a = actor.current,
        ax = a.x * sx,
        ay = a.y * sy;
      m.save();
      m.translate(ax, ay);
      m.rotate(a.head);
      m.fillStyle = "#ffe16b";
      m.strokeStyle = "#172c44";
      m.lineWidth = 1.5;
      m.beginPath();
      m.moveTo(0, -6);
      m.lineTo(4.5, 5);
      m.lineTo(0, 3);
      m.lineTo(-4.5, 5);
      m.closePath();
      m.fill();
      m.stroke();
      m.restore();
    };
    const drawWorld = (t: number) => {
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, "#b9ebff");
      grad.addColorStop(0.5, theme.sky);
      grad.addColorStop(1, "#51afd0");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);
      // Animated per-world atmosphere layer (canvas shader-style effects).
      if(world.id==="forest"||world.id==="campfire"){
        const glow=ctx.createRadialGradient(w*.52,h*.58,0,w*.52,h*.58,h*.7);glow.addColorStop(0,"rgba(255,191,93,.20)");glow.addColorStop(.45,"rgba(55,196,151,.08)");glow.addColorStop(1,"rgba(15,35,55,.16)");ctx.fillStyle=glow;ctx.fillRect(0,0,w,h);
      }else if(world.id==="neon"||world.id==="arcade"){
        ctx.globalAlpha=.12;for(let y=(t*.035)%42-42;y<h;y+=42){ctx.fillStyle=y%84<42?"#51efff":"#ff57cf";ctx.fillRect(0,y,w,2)}ctx.globalAlpha=1;
        const neon=ctx.createRadialGradient(w*.72,h*.32,0,w*.72,h*.32,w*.65);neon.addColorStop(0,"rgba(255,55,210,.22)");neon.addColorStop(.45,"rgba(65,225,255,.08)");neon.addColorStop(1,"rgba(18,10,55,.22)");ctx.fillStyle=neon;ctx.fillRect(0,0,w,h);
      }else if(world.id==="sky"){
        ctx.globalAlpha=.7;for(let i=0;i<22;i++){const x=(i*173+t*.018)%(w+30),y=(i*97+t*.009)%h;ctx.fillStyle=i%3?"#fff":"#ffe785";ctx.beginPath();ctx.arc(x,y,1.5+Math.sin(t*.004+i),0,TAU);ctx.fill()}ctx.globalAlpha=1;
      }else if(world.id==="cafe"){
        const warm=ctx.createRadialGradient(w*.5,h*.28,0,w*.5,h*.28,w*.75);warm.addColorStop(0,"rgba(255,226,159,.22)");warm.addColorStop(1,"rgba(151,65,81,.12)");ctx.fillStyle=warm;ctx.fillRect(0,0,w,h);
      }else if(world.id==="coast"||lake){
        const sun=ctx.createRadialGradient(w*.78,h*.15,0,w*.78,h*.15,h*.55);sun.addColorStop(0,"rgba(255,245,184,.36)");sun.addColorStop(.35,"rgba(255,170,115,.09)");sun.addColorStop(1,"transparent");ctx.fillStyle=sun;ctx.fillRect(0,0,w,h);
      }
      ctx.globalAlpha = 0.3;
      for (let i = 0; i < 7; i++) {
        ctx.fillStyle = "#fff";
        ctx.beginPath();
        ctx.ellipse(
          ((i * 241 + t * 0.008) % (w + 260)) - 130,
          70 + (i % 3) * 48,
          80,
          18,
          0,
          0,
          TAU,
        );
        ctx.ellipse(
          ((i * 241 + t * 0.008) % (w + 260)) - 95,
          65 + (i % 3) * 48,
          38,
          25,
          0,
          0,
          TAU,
        );
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      ctx.strokeStyle = "rgba(255,255,255,.16)";
      ctx.lineWidth = 2;
      for (let i = 0; i < 10; i++) {
        const wy = (i * 83 + t * 0.012) % h;
        ctx.beginPath();
        ctx.arc((i * 317) % w, wy, 18 + (i % 3) * 9, 0.1, Math.PI * 0.9);
        ctx.stroke();
      }
      ctx.textAlign = "center";
      if (lake)
        FISH_ISLANDS.forEach((island, index) => {
          const p = iso(island.x, island.y),
            colors = ISLAND_COLORS[island.theme],
            rx = island.r * 1.02,
            ry = island.r * 0.46;
          if (
            p.x + rx < -80 ||
            p.x - rx > w + 80 ||
            p.y + ry < 0 ||
            p.y - ry > h + 100
          )
            return;
          ellipse(p.x, p.y + 25, rx, ry, colors[2]);
          ellipse(p.x, p.y + 10, rx * 0.99, ry * 0.98, "#f7dda0");
          ellipse(p.x, p.y, rx * 0.84, ry * 0.8, colors[1]);
          ctx.strokeStyle = "rgba(255,255,255,.5)";
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.ellipse(p.x, p.y + 5, rx * 0.91, ry * 0.88, 0, 0, TAU);
          ctx.stroke();
          for (let n = 0; n < (island.r < 150 ? 1 : 7); n++) {
            const angle = n * 2.31 + index * 0.7,
              q = iso(
                island.x + Math.cos(angle) * island.r * 0.5,
                island.y + Math.sin(angle) * island.r * 0.5,
              ),
              decor =
                island.theme === "volcanic"
                  ? n === 0
                    ? "🌋"
                    : "🪨"
                  : island.theme === "twilight"
                    ? n % 2
                      ? "🍄"
                      : "✨"
                    : island.theme === "desert"
                      ? n % 2
                        ? "🌼"
                        : "🌵"
                      : island.theme === "swamp"
                        ? n % 2
                          ? "🌳"
                          : "🌿"
                        : island.theme === "lighthouse"
                          ? n === 0
                            ? "🗼"
                            : "🌲"
                          : n % 3 === 0
                            ? "🌸"
                            : "🌳";
            ctx.font = `${30 + (n % 3) * 4}px system-ui`;
            ctx.fillText(decor, q.x, q.y);
          }
          if (island.r > 200) {
            const home = iso(
              island.x - island.r * 0.13,
              island.y - island.r * 0.08,
            );
            ctx.font = "42px system-ui";
            ctx.fillText(
              index % 3 === 0 ? "🏡" : index % 3 === 1 ? "🏕️" : "🛖",
              home.x,
              home.y,
            );
          }
          ctx.font = "900 12px system-ui";
          ctx.fillStyle = "#fff";
          ctx.shadowColor = "#28485a";
          ctx.shadowBlur = 7;
          ctx.fillText(`${island.icon} ${island.name}`, p.x, p.y - ry * 0.68);
          ctx.shadowBlur = 0;
        });
      else {
        const center = iso(2000, 1350),
          sceneProps: Record<string, [number, number, string, string][]> = {
            campfire: [
              [2000, 1350, "🔥", "THE GREAT FIRE"],
              [1600, 1190, "🎸", "MUSIC LOG"],
              [2390, 1510, "📖", "STORY CIRCLE"],
              [1160, 820, "⛺", "CAMP"],
              [2860, 720, "🏡", "WELCOME LODGE"],
              [920, 1840, "🦆", "DUCK POND"],
              [3060, 1900, "🌲", "PINE TRAIL"],
            ],
            coast: [
              [1900, 1430, "⛵", "SAILBOAT PIER"],
              [2550, 1040, "🌅", "SUNSET LOOKOUT"],
              [1250, 1650, "🐦", "GULL BEACH"],
              [3050, 1480, "🗼", "LIGHTHOUSE"],
              [920, 900, "🏖️", "BEACH CLUB"],
              [2200, 1880, "🛥️", "BOATYARD"],
            ],
            neon: [
              [2000, 1350, "🪩", "DANCE FLOOR"],
              [2680, 1150, "🎧", "DJ BOOTH"],
              [1260, 1540, "🥤", "GLOW BAR"],
              [980, 880, "🎤", "KARAOKE"],
              [3100, 1780, "📸", "PHOTO WALL"],
              [1800, 1940, "🛋️", "VIP LOUNGE"],
            ],
            sky: [
              [2000, 1350, "🏫", "CREATOR CLASS"],
              [2750, 900, "🔭", "OBSERVATORY"],
              [1180, 1710, "🧪", "RAINBOW LAB"],
              [1180, 780, "📚", "CLOUD LIBRARY"],
              [2900, 1820, "🎨", "ART STUDIO"],
              [2050, 650, "🔔", "BELL TOWER"],
            ],
            cafe: [
              [2300, 1150, "☕", "COFFEE BAR"],
              [1550, 1500, "🍰", "MOCHI TABLE"],
              [2700, 1650, "🎹", "PIANO CORNER"],
              [1100, 850, "🥐", "BAKERY"],
              [3100, 800, "🌿", "GARDEN NOOK"],
              [1850, 1900, "🧋", "BOBA BAR"],
            ],
            arcade: [
              [2000, 1350, "🕹️", "HIGH SCORE"],
              [2750, 1120, "🎟️", "PRIZE COUNTER"],
              [1280, 1600, "🏀", "HOOP SHOT"],
              [1050, 850, "👾", "RETRO ROW"],
              [3000, 1760, "🏎️", "RACING PODS"],
              [1950, 700, "🎳", "BOWLING"],
            ],
          },
          items = sceneProps[world.id] || [];
        if (world.id === "sky") {
          [
            [1180, 1500, 670],
            [2000, 1350, 760],
            [2800, 1050, 650],
          ].forEach(([x, y, r]) => {
            const q = iso(x, y);
            ellipse(q.x, q.y + 24, r * 0.9, r * 0.34, "#8dbbc9");
            ellipse(q.x, q.y, r, r * 0.35, "#f7fdff");
          });
        } else {
          ellipse(center.x, center.y + 30, 1650, 760, theme.edge);
          ellipse(
            center.x,
            center.y,
            1600,
            730,
            world.id === "neon" || world.id === "arcade"
              ? "#272049"
              : world.id === "cafe"
                ? "#e9caa4"
                : theme.ground,
          );
          if (world.id === "coast") {
            ctx.fillStyle = "#2d91bd";
            ctx.fillRect(0, h * 0.62, w, h * 0.38);
            ctx.strokeStyle = "#e5b973";
            ctx.lineWidth = 32;
            ctx.beginPath();
            ctx.moveTo(center.x - 900, center.y + 100);
            ctx.lineTo(center.x + 900, center.y - 180);
            ctx.stroke();
          }
          if (world.id === "neon" || world.id === "arcade") {
            ctx.globalAlpha = 0.3;
            for (let n = -6; n <= 6; n++) {
              ctx.strokeStyle = n % 2 ? "#ff50c8" : "#43e8ff";
              ctx.lineWidth = 5;
              ctx.beginPath();
              ctx.moveTo(center.x + n * 110, center.y - 430);
              ctx.lineTo(center.x + n * 110, center.y + 430);
              ctx.stroke();
            }
            ctx.globalAlpha = 1;
          }
        }
        for (const [x, y, icon, label] of items) {
          const q = iso(x, y);
          ctx.font = "54px system-ui";
          ctx.fillText(icon, q.x, q.y);
          ctx.font = "900 10px system-ui";
          ctx.fillStyle = "#fff";
          ctx.shadowColor = "#17283d";
          ctx.shadowBlur = 5;
          ctx.fillText(label, q.x, q.y + 18);
          ctx.shadowBlur = 0;
        }
        for (const h of WORLD_HOTSPOTS[world.id] || []) {
          const q = iso(h.x, h.y);
          ctx.strokeStyle = "rgba(255,232,105,.8)";
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.ellipse(
            q.x,
            q.y + 8,
            42 + Math.sin(t * 0.005) * 5,
            17,
            0,
            0,
            TAU,
          );
          ctx.stroke();
        }
      }
      for (const other of remotePlayers.current) {
        other.displayX = (other.displayX ?? other.x) + (other.x - (other.displayX ?? other.x)) * 0.18;
        other.displayY = (other.displayY ?? other.y) + (other.y - (other.displayY ?? other.y)) * 0.18;
        let headDelta = other.head - (other.displayHead ?? other.head);
        while (headDelta > Math.PI) headDelta -= TAU;
        while (headDelta < -Math.PI) headDelta += TAU;
        other.displayHead = (other.displayHead ?? other.head) + headDelta * 0.22;
        const q = iso(other.displayX, other.displayY);
        drawCompanion(q.x - 34, q.y + 7, other.companion as Companion);
        avatarDraw(q.x, q.y, other.displayHead, (other.avatar as Avatar) || avatar);
        drawFishTag(ctx, q.x, q.y, other.name, "EXPLORER", "", "");
      }
      const p = iso(actor.current.x, actor.current.y),
        stepBob =
          actor.current.speed > 8 ? Math.abs(Math.sin(t * 0.011)) * 4 : 0;
      const petP=iso(companionPos.current.x,companionPos.current.y);
      drawCompanion(petP.x,petP.y+Math.sin(t*.004)*2,companion.current);
      avatarDraw(p.x, p.y - stepBob, actor.current.head);
      let title = "EXPLORER",
        badge = "";
      try {
        const profile = JSON.parse(
          localStorage.getItem("everhome-profile") || "{}",
        );
        if (username.toLowerCase().includes("dave")) {
          title = "CREATOR";
          badge = "✧";
        } else if ((profile.owned || []).includes("crown")) {
          title = "FOUNDER";
          badge = "✦";
        } else if ((profile.visits || []).length >= 5) {
          title = "WORLD WANDERER";
          badge = "◆";
        } else if ((profile.owned || []).length >= 3) {
          title = "COLLECTOR";
          badge = "★";
        }
      } catch {}
      drawFishTag(ctx, p.x, p.y - stepBob, username, title, badge, bubble);
      drawMap();
    };
    const loop = (t: number) => {
      const dt = Math.min(0.05, (t - last) / 1000);
      last = t;
      const k = keys.current,
        j = joy.current,
        ix =
          (k.has("KeyD") || k.has("ArrowRight") ? 1 : 0) -
          (k.has("KeyA") || k.has("ArrowLeft") ? 1 : 0) +
          j.x,
        iy =
          (k.has("KeyS") || k.has("ArrowDown") ? 1 : 0) -
          (k.has("KeyW") || k.has("ArrowUp") ? 1 : 0) +
          j.y,
        rawMag = Math.hypot(ix, iy),
        mag = Math.min(1, rawMag);
      const a = actor.current;
      if (mag > 0.04) {
        const target = Math.atan2(ix, -iy);
        let diff = target - a.head;
        while (diff > Math.PI) diff -= TAU;
        while (diff < -Math.PI) diff += TAU;
        a.head += diff * Math.min(1, dt * 9);
        const maxSpeed = lake ? 190 : 210,
          desiredX = (ix / rawMag) * maxSpeed * mag,
          desiredY = (iy / rawMag) * maxSpeed * mag,
          response = 1 - Math.exp(-(lake ? 16 : 22) * dt);
        a.vx += (desiredX - a.vx) * response;
        a.vy += (desiredY - a.vy) * response;
      } else {
        a.vx = 0;
        a.vy = 0;
      }
      a.speed = Math.hypot(a.vx, a.vy);
      a.x += a.vx * dt;
      a.y += a.vy * dt;
      const petTargetX=a.x-Math.sin(a.head)*48-Math.cos(a.head)*30,
        petTargetY=a.y+Math.cos(a.head)*48-Math.sin(a.head)*30,
        petFollow=1-Math.exp(-5.5*dt);
      companionPos.current.x+=(petTargetX-companionPos.current.x)*petFollow;
      companionPos.current.y+=(petTargetY-companionPos.current.y)*petFollow;
      a.x = clamp(a.x, 35, WORLD_W - 35);
      a.y = clamp(a.y, 35, WORLD_H - 35);
      cam.current.x += (a.x - cam.current.x) * Math.min(1, dt * 5);
      cam.current.y += (a.y - cam.current.y) * Math.min(1, dt * 5);
      const close =
        (WORLD_HOTSPOTS[world.id] || []).find(
          (h) => Math.hypot(a.x - h.x, a.y - h.y) < h.r,
        ) || null;
      setNear((n) => (n === close ? n : close));
      const f = fishRef.current;
      if (f.state === "waiting" && t >= f.at) {
        f.state = "reeling";
        f.progress = 0.12;
        f.zone = 0.2 + Math.random() * 0.6;
        setFishState("reeling");
        setStatus(
          "BITE! Hold REEL or Space — keep the fish in the glowing zone!",
        );
      } else if (f.state === "reeling") {
        f.marker = clamp(f.marker + (hold.current ? -0.62 : 0.43) * dt, 0, 1);
        f.zone = clamp(f.zone + Math.sin(t * 0.003) * 0.16 * dt, 0.16, 0.84);
        const good = Math.abs(f.marker - f.zone) < 0.16;
        f.progress = clamp(f.progress + (good ? 0.34 : -0.17) * dt, 0, 1);
        setReel({ marker: f.marker, zone: f.zone, progress: f.progress });
        if (f.progress >= 1) finishCatch();
        else if (f.progress <= 0) {
          f.state = "idle";
          setFishState("idle");
          setStatus("The fish escaped — cast again!");
        }
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      drawWorld(t);
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(frame);
      removeEventListener("resize", resize);
    };
  }, [
    avatar,
    bubble,
    lake,
    theme,
    username,
    world.icon,
    world.name,
    world.theme,
  ]);
  function send(e: React.FormEvent) {
    e.preventDefault();
    const text = message.trim();
    if (!text) return;
    const m: LiveChat = {
      id: `${liveId()}:${Date.now()}`,
      name: username,
      text: text.slice(0, 120),
      world: world.id,
      at: Date.now(),
    };
    seenChat.current.add(m.id);
    setLog((l) => [...l.slice(-59), `${username}: ${m.text}`]);
    chatChannel.current?.postMessage(m);
    void liveChat.send(m);
    setBubble(m.text);
    setMessage("");
    onChat();
    setTimeout(() => setBubble(""), 5000);
  }
  function interact() {
    if (!near) return;
    setActivity(near.result);
    setBubble(near.result);
    setTimeout(() => {
      setActivity("");
      setBubble("");
    }, 4200);
  }
  function joyStart(e: React.PointerEvent<HTMLDivElement>) {
    e.currentTarget.setPointerCapture(e.pointerId);
    const r = e.currentTarget.getBoundingClientRect(),
      move = (x: number, y: number) => {
        joy.current = {
          x: clamp((x - (r.left + r.width / 2)) / 48, -1, 1),
          y: clamp((y - (r.top + r.height / 2)) / 48, -1, 1),
        };
      };
    move(e.clientX, e.clientY);
  }
  return (
    <main className="ehEngine">
      <canvas ref={canvas} />
      <header className="ehWorldHud">
        <button onClick={onExit}>← Leave</button>
        <div>
          <b>
            {world.icon} {world.name}
          </b>
          <small>
            {lake ? "FISH ARCHIPELAGO" : "UNIQUE WORLD MAP"} · {onlineCount}{" "}
            ONLINE
          </small>
        </div>
        <button onClick={() => setPeople(!people)}>
          ♙ People {onlineCount}
        </button>
      </header>
      <canvas ref={mapCanvas} className="ehMinimap" width="260" height="176" />
      <div className="ehNameplate">
        <span>◆ EXPLORER</span>
        <b>{username}</b>
      </div>
      <div
        className="ehJoy"
        onPointerDown={joyStart}
        onPointerMove={(e) => {
          if (e.currentTarget.hasPointerCapture(e.pointerId)) joyStart(e);
        }}
        onPointerUp={(e) => {
          joy.current = { x: 0, y: 0 };
          e.currentTarget.releasePointerCapture(e.pointerId);
        }}
        onPointerCancel={() => (joy.current = { x: 0, y: 0 })}
      >
        <i
          style={{
            transform: `translate(calc(-50% + ${joy.current.x * 38}px),calc(-50% + ${joy.current.y * 38}px))`,
          }}
        />
      </div>
      <div className="ehHint">WASD / arrows · drag joystick to explore</div>
      {near && !lake && (
        <button className="ehInteract" onClick={interact}>
          <b>
            {near.icon} {near.label}
          </b>
          <small>Tap to interact</small>
        </button>
      )}
      {activity && <div className="ehActivity">{activity}</div>}
      {lake && (
        <aside className="ehFishing">
          <header>
            <div>
              <small>EVERHOME MINI GAME</small>
              <b>🎣 THE LAKE</b>
            </div>
            <span>🎒 {bag.length}</span>
          </header>
          <p>{status}</p>
          {fishState === "reeling" && (
            <div className="reelGame">
              <div className="reelTrack">
                <i style={{ top: `${reel.zone * 100}%` }} />
                <b style={{ top: `${reel.marker * 100}%` }}>🐟</b>
              </div>
              <div className="reelProgress">
                <i style={{ width: `${reel.progress * 100}%` }} />
              </div>
            </div>
          )}
          <button
            disabled={fishState === "waiting" || fishState === "caught"}
            onClick={() => (fishState === "idle" ? cast() : null)}
            onPointerDown={() => (hold.current = true)}
            onPointerUp={() => (hold.current = false)}
            onPointerCancel={() => (hold.current = false)}
          >
            {fishState === "idle"
              ? "🎣 CAST LINE"
              : fishState === "waiting"
                ? "〰 WAITING…"
                : "⬆ HOLD TO REEL"}
          </button>
          {bag.length > 0 && (
            <div className="catchStrip">
              {bag
                .slice(-3)
                .reverse()
                .map((f, i) => (
                  <span key={i}>
                    {f.icon} <b>{f.name}</b>
                    <small>{f.size} cm</small>
                  </span>
                ))}
            </div>
          )}
        </aside>
      )}
      <button
        className="fishChatChip ehChatButton"
        onClick={() => {
          setChat(!chat);
          setUnread(0);
        }}
      >
        💬
        {unread > 0 && (
          <span className="fishUnread">{unread > 9 ? "9+" : unread}</span>
        )}
        <span className="fishOnline">{liveReady ? "●" : "…"}</span>
      </button>
      {chat && (
        <section className="fishChatPanel ehChat">
          <header>
            <b>💬 World Chat</b>
            <span>{liveReady ? "🟢 Realtime connected" : "Connecting…"}</span>
            <button onClick={() => setChat(false)}>✕</button>
          </header>
          <div className="fishChatLog">
            {log.map((m, i) => {
              const n = m.split(":")[0],
                text = m.slice(m.indexOf(":") + 1);
              return (
                <p className={n === username ? "mine" : ""} key={i}>
                  <b>{n}</b> <span>{text}</span>
                </p>
              );
            })}
          </div>
          <form onSubmit={send}>
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Say something…"
              maxLength={120}
            />
            <button>➤</button>
          </form>
        </section>
      )}
      {people && (
        <aside className="ehPeople">
          <header>
            <b>People here · {onlineCount}</b>
            <button onClick={() => setPeople(false)}>×</button>
          </header>
          {activeNpcsForWorld(world.id).map((n) => (
            <p key={n.id}>
              {n.face} <b>{n.name}</b>
              <small>NPC</small>
            </p>
          ))}
          {remotePlayers.current.map((p) => (
            <p key={p.id}>
              🟢 <b>{p.name}</b>
              <small>
                {Math.round(p.x)}, {Math.round(p.y)}
              </small>
            </p>
          ))}
          <p>
            🙂 <b>{username}</b>
            <small>You</small>
          </p>
        </aside>
      )}
    </main>
  );
}
