"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SocialCenter } from "./social";
import { EverhomeWorldEngine } from "./world-engine";
import { ArcadeGame } from "./arcade-game";

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
  model?: "feminine" | "masculine" | "robot";
  hairStyle?: string;
  accessory?: string;
  back?: string;
  effect?: string;
  topItem?: string;
  topStyle?: "tee" | "hoodie" | "jacket" | "sweater";
  bottomStyle?: "trousers" | "skirt" | "shorts" | "wide";
  shoeStyle?: "sneakers" | "boots" | "flats";
  shoeColor?: string;
  hatColor?: string;
  accessoryColor?: string;
  backColor?: string;
  effectColor?: string;
};
const worlds: World[] = [
  {
    id: "campfire",
    name: "Campfire Commons",
    icon: "🔥",
    theme: "forest",
    players: 284,
    kind: "Social",
    description: "The heart of EVERHOME. Meet new people beneath the pines.",
  },
  {
    id: "lake",
    name: "The Lake",
    icon: "🎣",
    theme: "lake",
    players: 196,
    kind: "Fishing",
    description:
      "Cast from the dock, fill your collection, and chase legendary catches.",
  },
  {
    id: "coast",
    name: "Sunset Marina",
    icon: "⛵",
    theme: "coast",
    players: 142,
    kind: "Hangout",
    description: "Sail, fish, and watch the sun set with friends.",
  },
  {
    id: "neon",
    name: "Neon District",
    icon: "🌃",
    theme: "neon",
    players: 89,
    kind: "Adventure",
    description: "A glowing city of rooftop games and hidden alleys.",
  },
  {
    id: "sky",
    name: "Cloud Academy",
    icon: "☁️",
    theme: "sky",
    players: 64,
    kind: "Learn",
    description: "Learn to build while hopping between floating islands.",
  },
  {
    id: "cafe",
    name: "Mochi Café",
    icon: "☕",
    theme: "cafe",
    players: 37,
    kind: "Roleplay",
    description: "Serve treats, decorate tables, and host a cozy party.",
  },
  {
    id: "arcade",
    name: "Pixel Palace",
    icon: "🕹️",
    theme: "arcade",
    players: 118,
    kind: "Games",
    description: "Classic minigames, high scores, and weekly tournaments.",
  },
  {
    id: "suika",
    name: "Fruit Drop Test",
    icon: "🍉",
    theme: "arcade",
    players: 42,
    kind: "Games",
    description: "Drop, merge, and climb the full EVERHOME Arcade leaderboard.",
  },
];
const friends: {
  name: string;
  world: string;
  face: string;
  online: boolean;
}[] = [];
const events = [
  {
    day: "18",
    month: "AUG",
    name: "Campfire Story Night",
    time: "7:00 PM",
    world: "Campfire Commons",
    going: 342,
    icon: "🔥",
  },
  {
    day: "20",
    month: "AUG",
    name: "Creator Build Jam",
    time: "6:30 PM",
    world: "Cloud Academy",
    going: 186,
    icon: "⚒️",
  },
  {
    day: "23",
    month: "AUG",
    name: "Neon Rooftop Party",
    time: "8:00 PM",
    world: "Neon District",
    going: 521,
    icon: "🎵",
  },
];
const shop = [
  {
    id: "beanie",
    name: "Campfire Beanie",
    icon: "🧢",
    price: 120,
    kind: "Hat",
  },
  { id: "wings", name: "Cloud Wings", icon: "🪽", price: 450, kind: "Back" },
  {
    id: "hoodie",
    name: "Evergreen Hoodie",
    icon: "🥼",
    price: 280,
    kind: "Top",
  },
  { id: "spark", name: "Pocket Spark", icon: "✨", price: 90, kind: "Effect" },
  {
    id: "glasses",
    name: "Round Glasses",
    icon: "👓",
    price: 160,
    kind: "Face",
  },
  { id: "boat", name: "Tiny Sailboat", icon: "⛵", price: 600, kind: "Toy" },
];
const badges = [
  { icon: "🔥", name: "First Flame", text: "Visit Campfire Commons", goal: 1 },
  { icon: "💬", name: "Chatterbox", text: "Send 5 messages", goal: 5 },
  { icon: "🧭", name: "Wanderer", text: "Visit 3 worlds", goal: 3 },
  { icon: "🤝", name: "Friendly Face", text: "Add a friend", goal: 1 },
  { icon: "⚒️", name: "Maker", text: "Save your first world", goal: 1 },
  { icon: "🛍️", name: "Collector", text: "Own 3 items", goal: 3 },
];
const nav = [
  ["⌂", "Home"],
  ["◎", "Worlds"],
  ["◌", "Events"],
  ["♙", "Friends"],
  ["💬", "Messages"],
  ["✦", "Avatar"],
  ["🐾", "Pets"],
  ["⚒", "Create"],
  ["◇", "Shop"],
  ["⬡", "Badges"],
];
const defaultAvatar: Avatar = {
  skin: "#d8a078",
  hair: "#40332e",
  top: "#ed5d75",
  bottom: "#33486d",
  face: "•‿•",
  hat: "none",
  model: "feminine",
  hairStyle: "soft",
  accessory: "none",
  back: "none",
  effect: "none",
  topItem: "none",
  topStyle: "tee",
  bottomStyle: "trousers",
  shoeStyle: "sneakers",
  shoeColor: "#f4f7fb",
  hatColor: "#f05291",
  accessoryColor: "#24385e",
  backColor: "#67dfff",
  effectColor: "#ffd45e",
};

function AvatarFigure({
  avatar,
  small = false,
}: {
  avatar: Avatar;
  small?: boolean;
}) {
  const model = avatar.model || "feminine";
  return (
    <div
      className={`avatarFigure rig-${model} hair-${avatar.hairStyle || "soft"} top-${avatar.topStyle || "tee"} bottom-${avatar.bottomStyle || "trousers"} shoes-${avatar.shoeStyle || "sneakers"} outfit-${avatar.topItem || "none"} ${small ? "small" : ""}`}
    >
      <div
        className="avEffect"
        style={{ color: avatar.effectColor || "#ffd45e" }}
      >
        {avatar.effect === "spark" ? "✦" : ""}
      </div>
      <div
        className={`avBack item-${avatar.back || "none"}`}
        style={
          {
            "--item-color": avatar.backColor || "#67dfff",
          } as React.CSSProperties
        }
      />
      <div
        className={`avHat item-${avatar.hat || "none"}`}
        style={
          {
            "--item-color": avatar.hatColor || "#f05291",
          } as React.CSSProperties
        }
      />
      <div className="avHair" style={{ background: avatar.hair }} />
      <div className="avEar left" style={{ background: avatar.skin }} />
      <div className="avEar right" style={{ background: avatar.skin }} />
      <div className="avNeck" style={{ background: avatar.skin }} />
      <div className="avHead" style={{ background: avatar.skin }}>
        <div className="avVisor" />
        <div className={`avEyes ${avatar.face === "^‿^" ? "squint" : ""}`}>
          <i />
          <i />
        </div>
        <div className="avMouth">
          {avatar.face === "•ᴗ•" ? "ᴗ" : avatar.face === "•◡•" ? "◡" : "⌣"}
        </div>
        {avatar.accessory === "glasses" && (
          <span
            className="avGlasses"
            style={{ color: avatar.accessoryColor || "#24385e" }}
          >
            ◉　◉
          </span>
        )}
      </div>
      <div className="avArm left" style={{ background: avatar.skin }} />
      <div className="avArm right" style={{ background: avatar.skin }} />
      <div className="avBody" style={{ background: avatar.top }}>
        <i className="avChest">{model === "robot" ? "⌄" : ""}</i>
        {avatar.topItem === "hoodie" && <span className="avStrings">││</span>}
      </div>
      <div className="avSkirt" style={{ background: avatar.bottom }} />
      <div className="avLeg left" style={{ background: avatar.bottom }} />
      <div className="avLeg right" style={{ background: avatar.bottom }} />
      <div
        className="avShoe left"
        style={{ background: avatar.shoeColor || "#f4f7fb" }}
      />
      <div
        className="avShoe right"
        style={{ background: avatar.shoeColor || "#f4f7fb" }}
      />
    </div>
  );
}

function WorldView({
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
  const [pos, setPos] = useState({ x: 50, y: 64 }),
    [input, setInput] = useState(""),
    [bubble, setBubble] = useState(""),
    [log, setLog] = useState<string[]>([]),
    [showPeople, setShowPeople] = useState(false),
    [chatOpen, setChatOpen] = useState(false);
  const [casting, setCasting] = useState(false),
    [catchText, setCatchText] = useState(""),
    [fishBag, setFishBag] = useState<
      { name: string; icon: string; size: number }[]
    >([]);
  const [unreadChat, setUnreadChat] = useState(2);
  const held = useRef(new Set<string>()),
    frame = useRef<number | null>(null),
    last = useRef(0);
  const move = useCallback(
    (dx: number, dy: number) =>
      setPos((p) => ({
        x: Math.max(6, Math.min(92, p.x + dx)),
        y: Math.max(18, Math.min(82, p.y + dy)),
      })),
    [],
  );
  useEffect(() => {
    onVisit(world.id);
    const down = (e: KeyboardEvent) => {
        if ((e.target as HTMLElement).tagName === "INPUT") return;
        held.current.add(e.key.toLowerCase());
      },
      up = (e: KeyboardEvent) => held.current.delete(e.key.toLowerCase());
    const tick = (t: number) => {
      if (t - last.current > 16) {
        const k = held.current,
          s = 0.72;
        move(
          (k.has("d") || k.has("arrowright") ? s : 0) -
            (k.has("a") || k.has("arrowleft") ? s : 0),
          (k.has("s") || k.has("arrowdown") ? s : 0) -
            (k.has("w") || k.has("arrowup") ? s : 0),
        );
        last.current = t;
      }
      frame.current = requestAnimationFrame(tick);
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    frame.current = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      if (frame.current) cancelAnimationFrame(frame.current);
    };
  }, [move, onVisit, world.id]);
  function send(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;
    setBubble(input.trim());
    setLog((l) => [...l.slice(-3), `${username}: ${input.trim()}`]);
    setInput("");
    onChat();
    setTimeout(() => setBubble(""), 5000);
  }
  function castLine() {
    if (casting) return;
    setCasting(true);
    setCatchText("Your float bobs on the water...");
    const catches = [
      { name: "Bluegill", icon: "🐟" },
      { name: "Largemouth Bass", icon: "🐠" },
      { name: "Golden Koi", icon: "✨" },
      { name: "Old Boot", icon: "🥾" },
      { name: "Lake Sturgeon", icon: "🐡" },
    ];
    setTimeout(() => {
      const fish = catches[Math.floor(Math.random() * catches.length)],
        size = Math.round((12 + Math.random() * 76) * 10) / 10;
      setFishBag((b) => [...b, { ...fish, size }]);
      setCatchText(`Caught ${fish.icon} ${fish.name} · ${size} cm!`);
      setBubble(`I caught a ${fish.name}! 🎣`);
      setCasting(false);
      setTimeout(() => setBubble(""), 4000);
    }, 1800);
  }
  return (
    <div className={`worldView ${world.theme}`}>
      <header className="worldHud">
        <button onClick={onExit}>← Leave</button>
        <div>
          <b>
            {world.icon} {world.name}
          </b>
          <small>● 1 player on this device</small>
        </div>
        <button onClick={() => setShowPeople(!showPeople)}>♙ People</button>
      </header>
      <div
        className="worldGround"
        onClick={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          setPos({
            x: ((e.clientX - r.left) / r.width) * 100,
            y: ((e.clientY - r.top) / r.height) * 100,
          });
        }}
      >
        <div className="worldSky">
          <i />
          <i />
          <i />
        </div>
        {world.id === "campfire" && (
          <>
            <div className="pond" />
            <div className="campfire">
              <i>🔥</i>
              <span />
              <span />
              <span />
            </div>
            <div className="log l1" />
            <div className="log l2" />
            <div className="tent">⛺</div>
            <div className="sign">
              EVERHOME
              <br />
              <small>Campfire Commons</small>
            </div>
          </>
        )}
        {world.id === "coast" && (
          <>
            <div className="water" />
            <div className="dock" />
            <div className="boat">⛵</div>
          </>
        )}
        {world.id === "lake" && (
          <>
            <div className="lakeWater">
              <i>🐟</i>
              <i>🐠</i>
              <i>🐟</i>
            </div>
            <div className="lakeDock" />
            <div className="baitShop">
              🛖<small>BAIT & TACKLE</small>
            </div>
            <div className="fishingSign">
              🎣 THE LAKE
              <br />
              <small>Walk to the dock and cast a line</small>
            </div>
          </>
        )}
        {!["campfire", "coast", "lake"].includes(world.id) && (
          <>
            <div className="worldMonument">{world.icon}</div>
            <div className="portal">
              EVERHOME
              <br />
              <small>{world.kind} portal</small>
            </div>
          </>
        )}
        {[12, 25, 76, 88].map((x, i) => (
          <div
            className="tree"
            key={x}
            style={{ left: `${x}%`, top: `${25 + (i % 2) * 43}%` }}
          >
            ♠
          </div>
        ))}

        <div
          className="myPlayer"
          style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
        >
          {bubble && <div className="speechBubble">{bubble}</div>}
          <AvatarFigure avatar={avatar} small />
          <b>{username}</b>
        </div>
      </div>
      <button
        className="fishChatChip"
        onClick={() => {
          setChatOpen(!chatOpen);
          setUnreadChat(0);
        }}
        title="World Chat"
      >
        💬{unreadChat > 0 && <span className="fishUnread">{unreadChat}</span>}
        <span className="fishOnline">1</span>
      </button>
      {chatOpen && (
        <section className="fishChatPanel">
          <header>
            <b>💬 World Chat</b>
            <span>🟢 1 player online</span>
            <button onClick={() => setChatOpen(false)} aria-label="Close">
              ✕
            </button>
          </header>
          <div className="fishChatLog">
            {log.map((m, i) => {
              const split = m.indexOf(":");
              const name = split > 0 ? m.slice(0, split) : "EVERHOME",
                text = split > 0 ? m.slice(split + 1).trim() : m,
                mine = name === username;
              return (
                <p className={mine ? "mine" : ""} key={i}>
                  <b
                    style={{
                      color: mine ? "#46e0a0" : i % 2 ? "#c58cff" : "#3ee0ff",
                    }}
                  >
                    {name}
                  </b>{" "}
                  <span>{text}</span>
                </p>
              );
            })}
          </div>
          <form onSubmit={send}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              maxLength={120}
              placeholder="Say something… (Enter to send)"
              autoFocus
            />
            <button aria-label="Send">➤</button>
          </form>
        </section>
      )}
      <div className="movePad">
        <button onPointerDown={() => move(0, -4)}>▲</button>
        <button onPointerDown={() => move(-4, 0)}>◀</button>
        <button onPointerDown={() => move(4, 0)}>▶</button>
        <button onPointerDown={() => move(0, 4)}>▼</button>
      </div>
      <div className="controlHint">WASD / arrows · click or tap to walk</div>
      {world.id === "lake" && (
        <aside className="fishingHud" onClick={(e) => e.stopPropagation()}>
          <div>
            <span>🎒</span>
            <b>Fish bag</b>
            <small>{fishBag.length} caught</small>
          </div>
          {catchText && <p>{catchText}</p>}
          <button disabled={casting} onClick={castLine}>
            {casting ? "〰 Waiting for a bite..." : "🎣 Cast line"}
          </button>
          {fishBag.length > 0 && (
            <section>
              {fishBag
                .slice(-4)
                .reverse()
                .map((f, i) => (
                  <span key={i}>
                    {f.icon} <b>{f.name}</b> {f.size} cm
                  </span>
                ))}
            </section>
          )}
        </aside>
      )}
      {showPeople && (
        <aside className="peoplePanel">
          <h3>People here</h3>
          {friends.slice(0, 3).map((f) => (
            <div key={f.name}>
              <span>{f.face}</span>
              <b>{f.name}</b>
              <button
                onClick={() => {
                  setBubble(`Friend request sent to ${f.name}!`);
                  setShowPeople(false);
                }}
              >
                ＋
              </button>
            </div>
          ))}
        </aside>
      )}
    </div>
  );
}

export default function EverhomeApp() {
  const [ready, setReady] = useState(false),
    [username, setUsername] = useState(""),
    [draftName, setDraftName] = useState(""),
    [active, setActive] = useState("Home"),
    [playing, setPlaying] = useState<World | null>(null),
    [search, setSearch] = useState(""),
    [coins, setCoins] = useState(1240),
    [avatar, setAvatar] = useState<Avatar>(defaultAvatar),
    [owned, setOwned] = useState<string[]>([]),
    [visits, setVisits] = useState<string[]>([]),
    [chatCount, setChatCount] = useState(0),
    [friendCount, setFriendCount] = useState(0),
    [built, setBuilt] = useState(0),
    [favoriteWorlds, setFavoriteWorlds] = useState<string[]>([]),
    [lastWorld, setLastWorld] = useState<string>(""),
    [rsvps, setRsvps] = useState<number[]>([]),
    [toast, setToast] = useState(""),
    [code, setCode] = useState(""),
    [builderItems, setBuilderItems] = useState<
      { x: number; y: number; item: string }[]
    >([]),
    [buildItem, setBuildItem] = useState("🌲");
  const [sessionEarned,setSessionEarned]=useState(0);
  const [mobileMenu, setMobileMenu] = useState(false);
  useEffect(() => {
    const raw = localStorage.getItem("everhome-profile");
    if (raw) {
      try {
        const p = JSON.parse(raw);
        setUsername(p.username || "");
        setCoins(p.coins ?? 1240);
        setAvatar(p.avatar || defaultAvatar);
        setOwned(p.owned || []);
        setVisits(p.visits || []);
        setChatCount(p.chatCount || 0);
        setBuilt(p.built || 0);
        setFavoriteWorlds(p.favoriteWorlds || []);
        setLastWorld(p.lastWorld || "");
      } catch {}
    }
    setReady(true);
  }, []);
  useEffect(() => {
    if (!ready || !username) return;
    localStorage.setItem(
      "everhome-profile",
      JSON.stringify({
        username,
        coins,
        avatar,
        owned,
        visits,
        chatCount,
        built,
        favoriteWorlds,
        lastWorld,
      }),
    );
  }, [ready, username, coins, avatar, owned, visits, chatCount, built, favoriteWorlds, lastWorld]);
  useEffect(()=>{if(!ready||!username)return;const timer=setInterval(()=>{setCoins(c=>c+2);setSessionEarned(n=>n+2)},30000);return()=>clearInterval(timer)},[ready,username]);
  function notify(t: string) {
    setToast(t);
    setTimeout(() => setToast(""), 2600);
  }
  function createProfile(e: React.FormEvent) {
    e.preventDefault();
    const n = draftName
      .trim()
      .replace(/[^a-zA-Z0-9_ -]/g, "")
      .slice(0, 18);
    if (n.length < 3) {
      notify("Choose at least 3 characters");
      return;
    }
    setUsername(n);
    notify(`Welcome home, ${n}!`);
  }
  const visit = useCallback(
    (id: string) => setVisits((v) => (v.includes(id) ? v : [...v, id])),
    [],
  );
  const enterWorld = useCallback((world: World) => {
    setLastWorld(world.id);
    setPlaying(world);
  }, []);
  const toggleFavorite = useCallback((id: string) => {
    setFavoriteWorlds((current) =>
      current.includes(id) ? current.filter((worldId) => worldId !== id) : [...current, id],
    );
  }, []);
  const progress = [
    visits.includes("campfire") ? 1 : 0,
    chatCount,
    visits.length,
    friendCount,
    built,
    owned.length,
  ];
  const filtered = useMemo(
    () =>
      worlds.filter((w) =>
        (w.name + w.kind).toLowerCase().includes(search.toLowerCase()),
      ),
    [search],
  );
  function buy(id: string, price: number) {
    if (owned.includes(id)) {
      notify("You already own this");
      return;
    }
    if (coins < price) {
      notify("Not enough Homecoins");
      return;
    }
    setCoins((c) => c - price);
    setOwned((o) => [...o, id]);
    notify("Item added to your inventory!");
  }
  function redeem(e: React.FormEvent) {
    e.preventDefault();
    const c = code.trim().toUpperCase();
    if (c === "WELCOMEHOME") {
      if (!owned.includes("crown")) {
        setOwned((o) => [...o, "crown"]);
        setCoins((n) => n + 250);
        notify("Unlocked Founder's Crown + 250 coins!");
      } else notify("Code already redeemed");
    } else if (c === "CAMPFIRE") {
      if (!owned.includes("beanie")) {
        setOwned((o) => [...o, "beanie"]);
        notify("Campfire Beanie unlocked!");
      } else notify("Code already redeemed");
    } else if (c === "WITCHY") {
      const witchItems = ["witch_hat", "witch_outfit"];
      if (!witchItems.every((item) => owned.includes(item))) {
        setOwned((current) => [...new Set([...current, ...witchItems])]);
        setAvatar({
          ...avatar,
          model: "feminine",
          hair: "#171218",
          hairStyle: "long",
          top: "#17131f",
          bottom: "#211a2b",
          hat: "witch_hat",
          hatColor: "#7d4bb5",
          topItem: "witch_outfit",
          topStyle: "jacket",
          bottomStyle: "wide",
          shoeStyle: "boots",
          shoeColor: "#100d16",
        });
        notify("Witchy Chick unlocked and equipped!");
      } else notify("Code already redeemed");
    } else notify("That code wasn’t found");
    setCode("");
  }
  if (!ready) return <div className="loading">EVERHOME</div>;
  if (!username)
    return (
      <main className="welcome">
        <div className="welcomeArt">
          <img className="welcomeBrand" src="everhome-logo.png" alt="EVERHOME"/>
          <div className="welcomeWorld">🔥</div>
          <AvatarFigure avatar={avatar} />
          <div className="welcomeBubble">A new world starts with a name.</div>
        </div>
        <section>
          <small>WELCOME TO EVERHOME</small>
          <h1>Who will you be?</h1>
          <p>
            Choose a username to start exploring. No password, no fuss—you can
            change it later.
          </p>
          <form onSubmit={createProfile}>
            <label>YOUR USERNAME</label>
            <input
              autoFocus
              value={draftName}
              onChange={(e) => setDraftName(e.target.value)}
              placeholder="e.g. StarGazer"
              maxLength={18}
            />
            <span>{draftName.length}/18 · letters, numbers, spaces and _</span>
            <button className="primary">Create my explorer →</button>
          </form>
          <footer>
            By continuing, you agree to be kind and keep EVERHOME welcoming.
          </footer>
        </section>
        {toast && <div className="toast">{toast}</div>}
      </main>
    );
  if (playing?.id === "suika")
    return <ArcadeGame username={username} onExit={() => setPlaying(null)} />;
  if (playing)
    return (
      <EverhomeWorldEngine
        world={playing}
        username={username}
        avatar={avatar}
        onExit={() => setPlaying(null)}
        onVisit={visit}
        onChat={() => setChatCount((c) => c + 1)}
      />
    );
  return (
    <main className="app">
      <aside className="sidebar">
        <button className="brand" onClick={() => setActive("Home")}>
          <img src="everhome-logo.png" alt="EVERHOME"/>
        </button>
        <nav>
          {nav.map(([i, n]) => (
            <button
              key={n}
              className={active === n ? "active" : ""}
              onClick={() => setActive(n)}
            >
              <i>{i}</i>
              {n}
              {n === "Events" && <em>3</em>}
            </button>
          ))}
        </nav>
        <div className="sidebarFoot">
          <button onClick={() => setActive("Codes")}>⌁ Redeem code</button>
        </div>
      </aside>
      <section className="content">
        <header>
          <button className="mobileLogo" onClick={() => setActive("Home")}>
            E
          </button>
          <label className="search">
            ⌕
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onFocus={() => setActive("Worlds")}
              placeholder="Search EVERHOME..."
            />
          </label>
          <div className="headerTools">
            <span className="idlePill" title="Earn 2 Homecoins every 30 seconds while playing">✦ +{sessionEarned} session</span>
            <button className="coins" onClick={() => setActive("Shop")}>
              ◇ <b>{coins.toLocaleString()}</b>
            </button>
            <button
              className="fishHeaderChip"
              onClick={() => setActive("Messages")}
              title="World chat"
            >
              💬<i className="fishOnline">1</i>
            </button>
            <button
              className="fishHeaderChip"
              onClick={() => setActive("Messages")}
              title="Friends and private messages"
            >
              👥
            </button>
            <button className="profile" onClick={() => setActive("Avatar")}>
              <AvatarFigure avatar={avatar} small />
            </button>
          </div>
        </header>
        <div className="page">
          {active === "Home" && (
            <Home
              username={username}
              worlds={worlds}
              setPlaying={enterWorld}
              setActive={setActive}
              events={events}
              avatar={avatar}
              coins={coins}
              reward={(amount)=>{setCoins(c=>c+amount);notify(`Daily reward: +${amount} Homecoins!`)}}
              visits={visits}
              chatCount={chatCount}
              built={built}
              lastWorld={lastWorld}
            />
          )}{" "}
          {active === "Worlds" && (
            <WorldBrowser2 worlds={filtered} setPlaying={enterWorld} favorites={favoriteWorlds} toggleFavorite={toggleFavorite} />
          )}{" "}
          {active === "Events" && <Events rsvps={rsvps} setRsvps={setRsvps} />}{" "}
          {active === "Friends" && (
            <Friends
              onJoin={(w) =>
                enterWorld(worlds.find((x) => x.name === w) || worlds[0])
              }
              friendCount={friendCount}
              add={() => {
                setFriendCount(1);
                notify("Friend request sent!");
              }}
            />
          )}{" "}
          {active === "Messages" && (
            <SocialCenter
              username={username}
              owned={owned}
              onGift={(id) => {
                setOwned((o) => o.filter((x) => x !== id));
                notify("Gift sent!");
              }}
            />
          )}{" "}
          {active === "Avatar" && (
            <AvatarStudio
              avatar={avatar}
              setAvatar={setAvatar}
              owned={owned}
              notify={notify}
              onStart={() => setActive("Worlds")}
            />
          )}{" "}
          {active === "Pets" && <PetHome notify={notify}/>} {" "}
          {active === "Create" && (
            <Builder
              items={builderItems}
              setItems={setBuilderItems}
              tool={buildItem}
              setTool={setBuildItem}
              save={() => {
                setBuilt(1);
                notify("World saved to My Worlds!");
              }}
            />
          )}{" "}
          {active === "Shop" && (
            <Shop
              coins={coins}
              owned={owned}
              buy={buy}
              code={() => setActive("Codes")}
            />
          )}{" "}
          {active === "Badges" && <Badges progress={progress} />}{" "}
          {active === "Codes" && (
            <Codes code={code} setCode={setCode} redeem={redeem} />
          )}
        </div>
      </section>
      <nav className="mobileNav">
        {[
          ["⌂", "Home"],
          ["◎", "Worlds"],
          ["💬", "Messages"],
          ["✦", "Avatar"],
        ].map(([i, n]) => (
          <button
            key={n}
            className={active === n ? "active" : ""}
            onClick={() => {
              setActive(n);
              setMobileMenu(false);
            }}
          >
            <i>{i}</i>
            <span>{n}</span>
          </button>
        ))}
        <button
          className={mobileMenu ? "active" : ""}
          onClick={() => setMobileMenu(!mobileMenu)}
        >
          <i>☰</i>
          <span>More</span>
        </button>
      </nav>
      {mobileMenu && (
        <div className="mobileMore">
          <header>
            <b>More in EVERHOME</b>
            <button onClick={() => setMobileMenu(false)}>×</button>
          </header>
          {[
            ["◌", "Events"],
            ["♙", "Friends"],
            ["🐾", "Pets"],
            ["⚒", "Create"],
            ["◇", "Shop"],
            ["⬡", "Badges"],
            ["⌁", "Codes"],
          ].map(([i, n]) => (
            <button
              key={n}
              onClick={() => {
                setActive(n);
                setMobileMenu(false);
              }}
            >
              <i>{i}</i>
              <span>{n}</span>
              <b>›</b>
            </button>
          ))}
        </div>
      )}
      {toast && <div className="toast">{toast}</div>}
    </main>
  );
}

function Home({
  username,
  worlds,
  setPlaying,
  setActive,
  events,
  avatar,
  coins,
  reward,
  visits,
  chatCount,
  built,
  lastWorld,
}: {
  username: string;
  worlds: World[];
  setPlaying: (w: World) => void;
  setActive: (s: string) => void;
  events: typeof globalThis extends never ? never : any[];
  avatar: Avatar;
  coins: number;
  reward:(amount:number)=>void;
  visits:string[];
  chatCount:number;
  built:number;
  lastWorld:string;
}) {
  const today=new Date().toISOString().slice(0,10),[claimed,setClaimed]=useState(()=>typeof window!=="undefined"&&localStorage.getItem("everhome-daily")==today);
  const [streak,setStreak]=useState(()=>{if(typeof window==="undefined")return 1;try{return JSON.parse(localStorage.getItem("everhome-streak")||"{}").count||1}catch{return 1}});
  const claim=()=>{if(claimed)return;let next=1;try{const saved=JSON.parse(localStorage.getItem("everhome-streak")||"{}");const yesterday=new Date(Date.now()-86400000).toISOString().slice(0,10);next=saved.date===yesterday?(saved.count||0)+1:saved.date===today?(saved.count||1):1}catch{};localStorage.setItem("everhome-daily",today);localStorage.setItem("everhome-streak",JSON.stringify({date:today,count:next}));setStreak(next);setClaimed(true);reward(Math.min(200,50+next*25))};
  const recent=worlds.find((world)=>world.id===lastWorld);
  const quests=[["Visit a social world",visits.includes("campfire")],["Explore two different worlds",visits.length>=2],["Send a friendly message",chatCount>0],["Save something in Builder",built>0]] as const;
  const questDone=quests.filter(([,done])=>done).length;
  return (
    <>
      <section className="v2Welcome"><div className="v2Greeting"><div className="v2Avatar"><AvatarFigure avatar={avatar}/></div><div><small>WELCOME BACK</small><h1>{username}</h1><p>Your worlds, friends and companion missed you.</p></div></div><div className="v2Wallet"><span>HOMECOINS</span><b>◇ {coins.toLocaleString()}</b><button onClick={()=>setActive("Shop")}>Visit shop</button></div></section>
      <section className="homeHero">
        <div>
          <small>WELCOME HOME, {username.toUpperCase()}</small>
          <h1>
            There&apos;s always
            <br />a place for you.
          </h1>
          <p>
            Walk into a world, meet someone new, or build a place of your own.
          </p>
          <button className="primary" onClick={() => setPlaying(worlds[0])}>
            🔥 Enter Campfire Commons
          </button>
        </div>
        <div className="heroCamp">
          <div className="moon" />
          <div className="heroFire">🔥</div>
          <span>“Meet us by the fire!”</span>
        </div>
      </section>
      <nav className="quickDock" aria-label="Quick actions">{[["🌍","Explore","Worlds"],["🐾","Companion","Pets"],["✦","New look","Avatar"],["⚒️","Create","Create"],["💬","Messages","Messages"],["🎉","Events","Events"]].map(([icon,label,page])=><button key={page} onClick={()=>setActive(page)}><i>{icon}</i><span>{label}</span></button>)}</nav>
      {recent&&<section className="continueJourney"><div><small>CONTINUE YOUR JOURNEY</small><h2>{recent.icon} {recent.name}</h2><p>Pick up where you left off, or discover somewhere completely new.</p></div><button onClick={()=>setPlaying(recent)}>Continue playing →</button></section>}
      <section className="todayGrid"><article className="dailyCard"><div><small>DAILY WELCOME · {streak} DAY STREAK</small><h2>A little something for coming home</h2><p>Keep returning to grow your reward. Your next welcome can be worth up to 200 Homecoins.</p></div><button disabled={claimed} onClick={claim}>{claimed?"✓ Collected":`◇ ${Math.min(200,50+streak*25)} · Collect`}</button></article><article className="questCard"><header><small>TODAY&apos;S PATH</small><b>{questDone} / {quests.length} complete</b></header>{quests.map(([q,done])=><p className={done?"done":""} key={q}><i>{done?"✓":"○"}</i><span>{q}</span></p>)}<button onClick={()=>setActive("Badges")}>See all progress →</button></article></section>
      <section className="sectionHead">
        <div>
          <small>JUMP IN</small>
          <h2>Popular right now</h2>
        </div>
        <button onClick={() => setActive("Worlds")}>All worlds →</button>
      </section>
      <div className="worldGrid">
        {worlds.slice(0, 4).map((w, i) => (
          <WorldCard
            key={w.id}
            w={w}
            play={() => setPlaying(w)}
            featured={i === 0}
          />
        ))}
      </div>
      <section className="dashboardRow">
        <div className="nextEvent">
          <small>NEXT EVENT · TODAY</small>
          <b>
            {events[0].icon} {events[0].name}
          </b>
          <span>
            {events[0].time} · {events[0].going} going
          </span>
          <button onClick={() => setActive("Events")}>View event</button>
        </div>
        <div className="buildCta">
          <b>⚒</b>
          <div>
            <small>MAKE SOMETHING</small>
            <h3>Your first world is waiting.</h3>
          </div>
          <button onClick={() => setActive("Create")}>Open Builder →</button>
        </div>
      </section>
    </>
  );
}
function WorldCard({
  w,
  play,
  featured = false,
  favorite,
  onFavorite,
}: {
  w: World;
  play: () => void;
  featured?: boolean;
  favorite?: boolean;
  onFavorite?:()=>void;
}) {
  return (
    <article className="worldCard" onClick={play}>
      <div className={`worldThumb ${w.theme}`}>
        <span>{w.icon}</span>
        <button>▶</button>
        {onFavorite&&<button className={`worldFavorite ${favorite?"saved":""}`} aria-label={favorite?`Remove ${w.name} from favorites`:`Save ${w.name} to favorites`} onClick={(event)=>{event.stopPropagation();onFavorite()}}>{favorite?"★":"☆"}</button>}
        <i>{w.kind}</i>
        {featured && <em>LOBBY</em>}
      </div>
      <div>
        <h3>{w.name}</h3>
        <p>{w.description}</p>
        <small>Enter world →</small>
      </div>
    </article>
  );
}
function WorldBrowser({
  worlds,
  setPlaying,
}: {
  worlds: World[];
  setPlaying: (w: World) => void;
}) {
  return (
    <>
      <PageTitle
        over="DISCOVER"
        title="Find your next world"
        text="Made by EVERHOME and creators like you."
      />
      <div className="filterPills">
        <button className="active">Featured</button>
        <button>Social</button>
        <button>Games</button>
        <button>Roleplay</button>
        <button>Learning</button>
      </div>
      <div className="worldGrid big">
        {worlds.map((w) => (
          <WorldCard key={w.id} w={w} play={() => setPlaying(w)} />
        ))}
      </div>
    </>
  );
}
function Events({
  rsvps,
  setRsvps,
}: {
  rsvps: number[];
  setRsvps: (v: number[]) => void;
}) {
  return (
    <>
      <PageTitle
        over="WHAT'S ON"
        title="Events bring us together"
        text="Parties, talks, tournaments, and community creations."
      />
      <div className="eventList">
        {events.map((e, i) => (
          <article key={e.name}>
            <time>
              <b>{e.day}</b>
              <span>{e.month}</span>
            </time>
            <div className="eventIcon">{e.icon}</div>
            <div>
              <small>{e.world}</small>
              <h3>{e.name}</h3>
              <p>
                {e.time} · {e.going + (rsvps.includes(i) ? 1 : 0)} people going
              </p>
            </div>
            <button
              className={rsvps.includes(i) ? "going" : ""}
              onClick={() =>
                setRsvps(
                  rsvps.includes(i)
                    ? rsvps.filter((x) => x !== i)
                    : [...rsvps, i],
                )
              }
            >
              {rsvps.includes(i) ? "✓ Going" : "I'm interested"}
            </button>
          </article>
        ))}
      </div>
    </>
  );
}
function Friends({
  onJoin,
  friendCount,
  add,
}: {
  onJoin: (w: string) => void;
  friendCount: number;
  add: () => void;
}) {
  return (
    <>
      <PageTitle
        over="YOUR PEOPLE"
        title="Friends make every world better"
        text={`${friends.filter((f) => f.online).length} friends are online now.`}
      />
      <div className="friendGrid">
        {friends.map((f) => (
          <article key={f.name}>
            <div className="friendFace">
              {f.face}
              <i className={f.online ? "on" : ""} />
            </div>
            <div>
              <h3>{f.name}</h3>
              <p>{f.world}</p>
            </div>
            {f.online ? (
              <button onClick={() => onJoin(f.world)}>Join</button>
            ) : (
              <button disabled>Offline</button>
            )}
          </article>
        ))}
        <article className="addFriend">
          <b>＋</b>
          <h3>Find people</h3>
          <p>Search by username</p>
          <button onClick={add}>
            {friendCount ? "Request sent" : "Add a friend"}
          </button>
        </article>
      </div>
    </>
  );
}
function LegacyAvatarEditor({
  avatar,
  setAvatar,
  owned,
  notify,
}: {
  avatar: Avatar;
  setAvatar: (a: Avatar) => void;
  owned: string[];
  notify: (s: string) => void;
}) {
  const colors = {
    skin: ["#f1c6a8", "#d8a078", "#a86f4f", "#6f4534"],
    hair: ["#292321", "#6c4630", "#d4a347", "#70415d"],
    top: ["#e16f4d", "#1a7967", "#5b63ad", "#e4b44f"],
    bottom: ["#315d69", "#493d55", "#7b5940", "#222f38"],
  };
  return (
    <div className="avatarPage">
      <div className="avatarStage">
        <span>YOUR AVATAR</span>
        <AvatarFigure avatar={avatar} />
        <div className="avatarShadow" />
        <p>Changes save automatically</p>
      </div>
      <section className="customizer">
        <PageTitle
          over="EXPRESS YOURSELF"
          title="Make it unmistakably you"
          text="Mix colors, faces, and items from your inventory."
        />
        {Object.entries(colors).map(([part, list]) => (
          <div className="optionRow" key={part}>
            <b>{part}</b>
            <div>
              {list.map((c) => (
                <button
                  aria-label={c}
                  onClick={() => setAvatar({ ...avatar, [part]: c })}
                  style={{ background: c }}
                  className={
                    avatar[part as keyof Avatar] === c ? "selected" : ""
                  }
                  key={c}
                />
              ))}
            </div>
          </div>
        ))}
        <div className="optionRow faces">
          <b>Face</b>
          <div>
            {["•‿•", "•ᴗ•", "^‿^", "•◡•"].map((f) => (
              <button
                onClick={() => setAvatar({ ...avatar, face: f })}
                className={avatar.face === f ? "selected" : ""}
                key={f}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
        <div className="optionRow hats">
          <b>Headwear</b>
          <div>
            <button onClick={() => setAvatar({ ...avatar, hat: "none" })}>
              None
            </button>
            {owned.includes("beanie") && (
              <button onClick={() => setAvatar({ ...avatar, hat: "beanie" })}>
                🧢 Beanie
              </button>
            )}
            {owned.includes("crown") && (
              <button onClick={() => setAvatar({ ...avatar, hat: "crown" })}>
                👑 Crown
              </button>
            )}
          </div>
        </div>
        <button className="primary" onClick={() => notify("Avatar saved!")}>
          ✓ Save look
        </button>
      </section>
    </div>
  );
}
function PetHome({notify}:{notify:(s:string)=>void}){
 const [pet,setPet]=useState(()=>{if(typeof window==="undefined")return{kind:"fox",name:"Nova",hunger:82,happy:76,energy:68};try{return JSON.parse(localStorage.getItem("everhome-pet")||"")||{kind:"fox",name:"Nova",hunger:82,happy:76,energy:68}}catch{return{kind:"fox",name:"Nova",hunger:82,happy:76,energy:68}}});
 useEffect(()=>{localStorage.setItem("everhome-pet",JSON.stringify(pet))},[pet]);
 const care=(key:"hunger"|"happy"|"energy",message:string)=>{setPet((p:any)=>({...p,[key]:Math.min(100,p[key]+18)}));notify(message)};
 const pets=[['fox','🦊','Fox'],['cat','🐱','Cat'],['dog','🐶','Pup'],['dragon','🐲','Dragon'],['robot','🤖','Bot']];
 return <><PageTitle over="COMPANION HOME" title="Your little forever friend" text="Care for a companion, raise your bond, and bring them into every world."/><div className="petHome"><section className="petStage"><div className="petRoom"><span className="petSprite">{pets.find(p=>p[0]===pet.kind)?.[1]||'🦊'}</span><i>♡</i></div><input aria-label="Pet name" value={pet.name} maxLength={12} onChange={e=>setPet({...pet,name:e.target.value})}/><b>Bond level {Math.floor((pet.hunger+pet.happy+pet.energy)/30)}</b></section><section className="petCare"><h2>Care & play</h2>{[['hunger','Full tummy',pet.hunger],['happy','Happiness',pet.happy],['energy','Energy',pet.energy]].map(([key,label,value])=><label key={String(key)}><span>{label}</span><b>{value}%</b><i><em style={{width:`${value}%`}}/></i></label>)}<div className="petActions"><button onClick={()=>care('hunger','Your companion loved the berry snack!')}>🍓 Feed</button><button onClick={()=>care('happy','You played together!')}>🧶 Play</button><button onClick={()=>care('energy','Your companion had a cozy nap.')}>🛏️ Nap</button></div><h3>Choose companion</h3><div className="petPicker">{pets.map(([id,icon,name])=><button className={pet.kind===id?'selected':''} key={id} onClick={()=>setPet({...pet,kind:id})}><i>{icon}</i><span>{name}</span></button>)}</div><div className="petQuest"><b>DAILY BOND QUEST</b><span>Visit two worlds together</span><em>0 / 2 · Reward ◇ 40</em></div></section></div></>
}

function Builder({
  items,
  setItems,
  tool,
  setTool,
  save,
}: {
  items: { x: number; y: number; item: string }[];
  setItems: (v: { x: number; y: number; item: string }[]) => void;
  tool: string;
  setTool: (s: string) => void;
  save: () => void;
}) {
  const tools = ["🌲", "🪨", "🔥", "⛺", "🪑", "🌼", "🏠", "💧"];
  const [builderTab,setBuilderTab]=useState<"world"|"logic">("world"),[nodes,setNodes]=useState(["When player enters","Show message"]);
  return (
    <>
      <PageTitle
        over="EVERHOME BUILDER"
        title="Build a place of your own"
        text="Pick an object, then tap the canvas to place it. Your world stays on this device."
      />
      <div className="builder">
        <aside>
          <div className="builderModes"><button className={builderTab==="world"?"active":""} onClick={()=>setBuilderTab("world")}>Build</button><button className={builderTab==="logic"?"active":""} onClick={()=>setBuilderTab("logic")}>Logic</button></div>
          <h3>Objects</h3>
          {tools.map((t) => (
            <button
              className={tool === t ? "active" : ""}
              onClick={() => setTool(t)}
              key={t}
            >
              {t}
            </button>
          ))}
          <hr />
          <button onClick={() => setItems(items.slice(0, -1))}>↶ Undo</button>
          <button onClick={() => setItems([])}>⌫ Clear</button>
        </aside>
        {builderTab==="world"?<div
          className="buildCanvas"
          onClick={(e) => {
            const r = e.currentTarget.getBoundingClientRect();
            setItems([
              ...items,
              {
                x: ((e.clientX - r.left) / r.width) * 100,
                y: ((e.clientY - r.top) / r.height) * 100,
                item: tool,
              },
            ]);
          }}
        >
          {items.map((o, i) => (
            <span key={i} style={{ left: `${o.x}%`, top: `${o.y}%` }}>
              {o.item}
            </span>
          ))}
          <div className="buildAvatar">
            🙂<small>Spawn</small>
          </div>
          <p>Tap anywhere to place {tool}</p>
        </div>:<div className="logicCanvas"><header><b>EVERCODE</b><span>Visual scripting · safe & synced</span></header><div className="logicFlow">{nodes.map((n,i)=><button key={i} className={i===0?"eventNode":"actionNode"}><small>{i===0?"EVENT":"ACTION"}</small><b>{n}</b><i>●</i></button>)}<span className="logicWire"/></div><footer>{["Play sound","Give coins","Open door","Start timer"].map(n=><button key={n} onClick={()=>setNodes([...nodes,n])}>＋ {n}</button>)}<button onClick={()=>setNodes(nodes.slice(0,-1))}>↶ Undo node</button></footer></div>}
        <section>
          <label>
            WORLD NAME
            <input defaultValue="My Cozy Corner" />
          </label>
          <label>
            DESCRIPTION
            <textarea defaultValue="A friendly place made in EVERHOME." />
          </label>
          <label>
            WHO CAN JOIN
            <select>
              <option>Everyone</option>
              <option>Friends</option>
              <option>Only me</option>
            </select>
          </label>
          <button className="primary" onClick={save}>
            Save & publish
          </button>
        </section>
      </div>
    </>
  );
}
function Shop({
  coins,
  owned,
  buy,
  code,
}: {
  coins: number;
  owned: string[];
  buy: (id: string, p: number) => void;
  code: () => void;
}) {
  return (
    <>
      <PageTitle
        over="MARKETPLACE"
        title="Make EVERHOME yours"
        text="Items from EVERHOME and community creators."
      />
      <div className="shopBar">
        <b>◇ {coins.toLocaleString()} Homecoins</b>
        <button onClick={code}>⌁ Redeem a code</button>
      </div>
      <div className="shopGrid">
        {shop.map((s) => (
          <article key={s.id}>
            <div>{s.icon}</div>
            <small>{s.kind}</small>
            <h3>{s.name}</h3>
            <button
              disabled={owned.includes(s.id)}
              onClick={() => buy(s.id, s.price)}
            >
              {owned.includes(s.id) ? "✓ Owned" : `◇ ${s.price}`}
            </button>
          </article>
        ))}
      </div>
    </>
  );
}
function Badges({ progress }: { progress: number[] }) {
  return (
    <>
      <PageTitle
        over="ACHIEVEMENTS"
        title="Your EVERHOME story"
        text={`${badges.filter((b, i) => progress[i] >= b.goal).length} of ${badges.length} badges earned.`}
      />
      <div className="badgeGrid">
        {badges.map((b, i) => {
          const done = progress[i] >= b.goal;
          return (
            <article className={done ? "earned" : ""} key={b.name}>
              <div>{b.icon}</div>
              <small>{done ? "EARNED" : "IN PROGRESS"}</small>
              <h3>{b.name}</h3>
              <p>{b.text}</p>
              <span>
                <i
                  style={{
                    width: `${Math.min(100, (progress[i] / b.goal) * 100)}%`,
                  }}
                />
              </span>
              <b>
                {Math.min(progress[i], b.goal)} / {b.goal}
              </b>
            </article>
          );
        })}
      </div>
    </>
  );
}
function Codes({
  code,
  setCode,
  redeem,
}: {
  code: string;
  setCode: (s: string) => void;
  redeem: (e: React.FormEvent) => void;
}) {
  return (
    <div className="codePage">
      <b>⌁</b>
      <small>SECRET REWARDS</small>
      <h1>Redeem a code</h1>
      <p>
        Found a hidden EVERHOME code? Enter it exactly as it appears to unlock
        special items.
      </p>
      <form onSubmit={redeem}>
        <input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="ENTER CODE"
        />
        <button className="primary">Redeem</button>
      </form>
      <div>
        Try the launch code: <strong>WELCOMEHOME</strong>
      </div>
    </div>
  );
}
function PageTitle({
  over,
  title,
  text,
}: {
  over: string;
  title: string;
  text: string;
}) {
  return (
    <section className="pageTitle">
      <small>{over}</small>
      <h1>{title}</h1>
      <p>{text}</p>
    </section>
  );
}

function AvatarStudio({
  avatar,
  setAvatar,
  owned,
  notify,
  onStart,
}: {
  avatar: Avatar;
  setAvatar: (a: Avatar) => void;
  owned: string[];
  notify: (s: string) => void;
  onStart: () => void;
}) {
  const palettes = {
    skin: ["#ffe0c8", "#f5c09b", "#d99b73", "#b97855", "#8b5943", "#633f34", "#402b29", "#231d22"],
    hair: ["#171415", "#3b2924", "#6c4230", "#a9633e", "#e1ad50", "#d8c5a5", "#8c3d73", "#3c7180", "#6550a5", "#e96278"],
    top: ["#fff4e8", "#ff5d7d", "#f28b3c", "#f5cf45", "#18a886", "#32a7dc", "#6558d3", "#a84f9c", "#242e49", "#171c28"],
    bottom: ["#d7c4a2", "#7d9ec0", "#344c78", "#513d63", "#936342", "#436554", "#35373d", "#171b24"],
  };
  const equip = (key: keyof Avatar, value: string) =>
    setAvatar({ ...avatar, [key]: value });
  const accentColors = [
    "#f4f7fb",
    "#24385e",
    "#32d8ff",
    "#f43d92",
    "#ffd45e",
    "#7f5cff",
    "#20c990",
    "#e65b45",
  ];
  const inventory = [
    { id: "beanie", slot: "hat", label: "Campfire Beanie", icon: "🧢" },
    { id: "crown", slot: "hat", label: "Founder Crown", icon: "👑" },
    { id: "witch_hat", slot: "hat", label: "Witchy Hat", icon: "🧙‍♀️" },
    { id: "witch_outfit", slot: "topItem", label: "Ritual Outfit", icon: "🌙" },
    { id: "wings", slot: "back", label: "Cloud Wings", icon: "🪽" },
    { id: "hoodie", slot: "topItem", label: "Evergreen Hoodie", icon: "🥼" },
    { id: "spark", slot: "effect", label: "Pocket Spark", icon: "✨" },
    { id: "glasses", slot: "accessory", label: "Round Glasses", icon: "👓" },
    { id: "boat", slot: "effect", label: "Sailboat Toy", icon: "⛵" },
  ];
  const randomize = () =>
    setAvatar({
      ...avatar,
      model: (["feminine", "masculine", "robot"] as const)[
        Math.floor(Math.random() * 3)
      ],
      skin: palettes.skin[Math.floor(Math.random() * palettes.skin.length)],
      hair: palettes.hair[Math.floor(Math.random() * palettes.hair.length)],
      top: palettes.top[Math.floor(Math.random() * palettes.top.length)],
      bottom:
        palettes.bottom[Math.floor(Math.random() * palettes.bottom.length)],
      hairStyle: ["soft", "crop", "long", "coils", "bob", "waves", "braids", "spikes"][
        Math.floor(Math.random() * 8)
      ],
      topStyle: (["tee", "hoodie", "jacket", "sweater"] as const)[Math.floor(Math.random()*4)],
      bottomStyle: (["trousers", "skirt", "shorts", "wide"] as const)[Math.floor(Math.random()*4)],
      shoeStyle: (["sneakers", "boots", "flats"] as const)[Math.floor(Math.random()*3)],
      shoeColor: accentColors[Math.floor(Math.random() * accentColors.length)],
      hatColor: accentColors[Math.floor(Math.random() * accentColors.length)],
      accessoryColor:
        accentColors[Math.floor(Math.random() * accentColors.length)],
      backColor: accentColors[Math.floor(Math.random() * accentColors.length)],
      effectColor:
        accentColors[Math.floor(Math.random() * accentColors.length)],
    });
  return (
    <div className="avatarStudio">
      <section
        className="avatarPreview"
        style={{
          backgroundImage:
            "linear-gradient(#071a3c22,#071a3c3d),url('avatar-studio-bg.png')",
        }}
      >
        <div className="previewGlow" />
        <span>EVERHOME AVATAR CREATOR</span>
        <AvatarFigure avatar={avatar} />
        <div className="turntable" />
        <p>Friendly proportions · one universal item fit</p>
      </section>
      <section className="avatarControls">
        <PageTitle
          over="AVATAR CREATOR"
          title="Make your EVERHOME self"
          text="Choose a body, hairstyle, colors, face details and anything you own."
        />
        <div className="modelPicker">
          {[
            ["masculine", "Male", "♂"],
            ["feminine", "Female", "♀"],
            ["robot", "Robot", "◆"],
          ].map(([id, label, icon]) => (
            <button
              key={id}
              className={(avatar.model || "feminine") === id ? "selected" : ""}
              onClick={() => equip("model", id)}
            >
              <i
                className={`bodyChoice body-${id}`}
                style={{ backgroundImage: "url('avatar-body-selector.png')" }}
              />
              <span>{label}</span>
              <small>{id === "robot" ? "Neutral" : "Human"}</small>
            </button>
          ))}
        </div>
        <div className="studioTabs">
          <b>CUSTOMIZE</b>
        </div>
        {Object.entries(palettes).map(([part, colors]) => (
          <div className="studioRow" key={part}>
            <label>{part}</label>
            <div>
              {colors.map((c) => (
                <button
                  key={c}
                  aria-label={`${part} ${c}`}
                  className={
                    avatar[part as keyof Avatar] === c ? "selected" : ""
                  }
                  style={{ background: c }}
                  onClick={() => equip(part as keyof Avatar, c)}
                />
              ))}
              <label className="customColor" title={`Custom ${part} colour`}>
                <input type="color" value={String(avatar[part as keyof Avatar]||colors[0])} onChange={(e)=>equip(part as keyof Avatar,e.target.value)}/><span>＋</span>
              </label>
            </div>
          </div>
        ))}
        <div className="studioRow">
          <label>Top style</label>
          <div className="styleButtons">
            {[
              ["tee", "T-shirt"],
              ["hoodie", "Hoodie"],
              ["jacket", "Jacket"],
              ["sweater", "Sweater"],
            ].map(([id, n]) => (
              <button
                key={id}
                className={(avatar.topStyle || "tee") === id ? "selected" : ""}
                onClick={() => equip("topStyle", id)}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
        <div className="studioRow"><label>Bottom style</label><div className="styleButtons">{[["trousers","Trousers"],["skirt","Skirt"],["shorts","Shorts"],["wide","Wide leg"]].map(([id,n])=><button key={id} className={(avatar.bottomStyle||"trousers")===id?"selected":""} onClick={()=>equip("bottomStyle",id)}>{n}</button>)}</div></div>
        <div className="studioRow"><label>Shoe style</label><div className="styleButtons">{[["sneakers","Sneakers"],["boots","Boots"],["flats","Flats"]].map(([id,n])=><button key={id} className={(avatar.shoeStyle||"sneakers")===id?"selected":""} onClick={()=>equip("shoeStyle",id)}>{n}</button>)}</div></div>
        <div className="studioTabs tintTitle">
          <b>ITEM COLOURS</b>
        </div>
        {[
          ["shoeColor", "Shoes"],
          ["hatColor", "Hat"],
          ["accessoryColor", "Eyewear"],
          ["backColor", "Back item"],
          ["effectColor", "Effect"],
        ].map(([key, label]) => (
          <div className="studioRow itemColorRow" key={key}>
            <label>{label}</label>
            <div>
              {accentColors.map((c) => (
                <button
                  key={c}
                  aria-label={`${label} ${c}`}
                  className={
                    avatar[key as keyof Avatar] === c ? "selected" : ""
                  }
                  style={{ background: c }}
                  onClick={() => equip(key as keyof Avatar, c)}
                />
              ))}
              <label className="customColor" title={`Custom ${label} colour`}><input type="color" value={String(avatar[key as keyof Avatar]||accentColors[0])} onChange={(e)=>equip(key as keyof Avatar,e.target.value)}/><span>＋</span></label>
            </div>
          </div>
        ))}
        <div className="studioRow">
          <label>Hair</label>
          <div className="styleButtons">
            {[
              ["soft", "Soft"],
              ["crop", "Crop"],
              ["long", "Long"],
              ["coils", "Coils"],
              ["bob", "Bob"],
              ["waves", "Waves"],
              ["braids", "Braids"],
              ["spikes", "Spikes"],
            ].map(([id, n]) => (
              <button
                key={id}
                className={
                  (avatar.hairStyle || "soft") === id ? "selected" : ""
                }
                onClick={() => equip("hairStyle", id)}
              >
                <i
                  className={`hairChoice hair-${id}`}
                  style={{ "--hair-color": avatar.hair } as React.CSSProperties}
                />
                <span>{n}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="studioRow">
          <label>Face</label>
          <div className="styleButtons">
            {["•‿•", "•ᴗ•", "^‿^", "•◡•"].map((f) => (
              <button
                key={f}
                className={avatar.face === f ? "selected" : ""}
                onClick={() => equip("face", f)}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
        <div className="studioTabs inventoryTitle">
          <b>OUTFIT & ITEMS</b>
          <small>{owned.length} owned</small>
        </div>
        <div className="inventoryShelf">
          <button
            onClick={() =>
              setAvatar({
                ...avatar,
                hat: "none",
                back: "none",
                effect: "none",
                accessory: "none",
                topItem: "none",
              })
            }
          >
            <i>∅</i>
            <span>Clear</span>
          </button>
          {inventory
            .filter((x) => owned.includes(x.id))
            .map((item) => (
              <button
                key={item.id}
                onClick={() => equip(item.slot as keyof Avatar, item.id)}
              >
                <i>{item.icon}</i>
                <span>{item.label}</span>
              </button>
            ))}
          {inventory.every((x) => !owned.includes(x.id)) && (
            <p>Buy or redeem items in the Shop and they&apos;ll appear here.</p>
          )}
        </div>
        <div className="avatarActions">
          <button onClick={randomize}>⤨ Randomize</button>
          <button
            className="primary saveAvatar"
            onClick={() => notify("Your new look is saved!")}
          >
            ✓ Save
          </button>
          <button className="startAvatar" onClick={onStart}>
            Start →
          </button>
        </div>
      </section>
    </div>
  );
}

function WorldBrowser2({
  worlds,
  setPlaying,
  favorites,
  toggleFavorite,
}: {
  worlds: World[];
  setPlaying: (w: World) => void;
  favorites:string[];
  toggleFavorite:(id:string)=>void;
}) {
  const [filter, setFilter] = useState("All");
  const groups = ["All", "Favorites", "Social", "Games", "Roleplay", "Learn", "Fishing"];
  const shown =
    filter === "All"
      ? worlds
      : filter === "Favorites"
        ? worlds.filter((w)=>favorites.includes(w.id))
      : worlds.filter(
          (w) =>
            w.kind === filter ||
            (filter === "Games" && ["Adventure", "Games"].includes(w.kind)),
        );
  return (
    <>
      <PageTitle
        over="DISCOVER"
        title="Find your next world"
        text="Every card opens a playable EVERHOME world."
      />
      <div className="filterPills">
        {groups.map((g) => (
          <button
            key={g}
            className={filter === g ? "active" : ""}
            onClick={() => setFilter(g)}
          >
            {g}
          </button>
        ))}
      </div>
      {shown.length ? (
        <div className="worldGrid big">
          {shown.map((w) => (
            <WorldCard key={w.id} w={w} play={() => setPlaying(w)} favorite={favorites.includes(w.id)} onFavorite={()=>toggleFavorite(w.id)} />
          ))}
        </div>
      ) : (
        <div className="emptyWorlds">
          <b>Nothing here yet</b>
          <p>Try another category.</p>
        </div>
      )}
    </>
  );
}
