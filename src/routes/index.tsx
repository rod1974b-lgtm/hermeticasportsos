import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Activity, CalendarPlus, Cloud, Compass, Heart, Search, Share2, Star, Trophy, Tv, Users, Zap } from "lucide-react";
import { INITIAL_GAMES, LEAGUES, T, TEAMS, fmtTime, teamById, type Game, type Hub, type Lang, type Team } from "@/lib/sports-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Ultimate Sports OS — Ratchaburi FC & Minnesota Hub" },
      { name: "description", content: "Live scores, dual CT/ICT times, player ratings, predictions and fantasy for Ratchaburi FC, all 7 Minnesota teams and every major league." },
      { property: "og:title", content: "Ultimate Sports OS — Ratchaburi FC & Minnesota Hub" },
      { property: "og:description", content: "Any sport, any team. Live ticker, Thai/English, calendar export and LINE sharing." },
    ],
  }),
  component: App,
});

type Tab = "live" | "my" | "explore" | "leagues" | "fantasy";
const MN_IDS = TEAMS.filter((t) => t.hub === "minnesota").map((t) => t.id);

function useLocal<T>(key: string, init: T) {
  const [v, setV] = useState<T>(init);
  useEffect(() => {
    const raw = localStorage.getItem(key);
    if (raw) try { setV(JSON.parse(raw)); } catch { /* ignore */ }
  }, [key]);
  const set = (n: T) => { setV(n); localStorage.setItem(key, JSON.stringify(n)); };
  return [v, set] as const;
}

function Seal({ t, size = 44 }: { t: Team; size?: number }) {
  return (
    <div className="grid shrink-0 place-items-center rounded-xl font-display tracking-wide ring-2"
      style={{ width: size, height: size, background: `linear-gradient(135deg, ${t.color}, ${t.color}cc)`, color: t.accent, fontSize: size / (t.seal.length > 4 ? 4.2 : 2.8), boxShadow: `0 0 0 2px ${t.accent}55` }}>
      {t.seal}
    </div>
  );
}

function App() {
  const [hub, setHub] = useLocal<Hub>("sos-hub", "ratchaburi");
  const [lang, setLang] = useLocal<Lang>("sos-lang", "en");
  const [favs, setFavs] = useLocal<string[]>("sos-favs", ["rbfc", "vik"]);
  const [preds, setPreds] = useLocal<Record<string, { h: number; a: number }>>("sos-preds", {});
  const [tab, setTab] = useState<Tab>("live");
  const [games, setGames] = useState<Game[]>(INITIAL_GAMES);
  const [liveOn, setLiveOn] = useState(true);
  const [now, setNow] = useState<Date | null>(null);
  const [weather, setWeather] = useState<{ t: number; h: number; w: number } | null>(null);
  const t = T[lang];

  useEffect(() => { setNow(new Date()); const i = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(i); }, []);
  useEffect(() => {
    fetch("https://api.open-meteo.com/v1/forecast?latitude=13.5283&longitude=99.8125&current=temperature_2m,relative_humidity_2m,wind_speed_10m&timezone=Asia/Bangkok")
      .then((r) => r.json()).then((d) => setWeather({ t: d.current.temperature_2m, h: d.current.relative_humidity_2m, w: d.current.wind_speed_10m })).catch(() => {});
  }, []);
  useEffect(() => {
    if (!liveOn) return;
    const i = setInterval(() => {
      setGames((gs) => gs.map((g) => {
        if (g.status !== "LIVE") return g;
        const r = Math.random();
        const n = { ...g, stats: g.stats ? { ...g.stats, momentum: [...g.stats.momentum.slice(-14), Math.round((Math.random() - 0.45) * 16)] } : g.stats };
        const pts = g.league === "NFL" ? (Math.random() > 0.5 ? 7 : 3) : 1;
        if (r < 0.12) { n.hs += pts; if (favs.includes(g.home)) { toast.success(`${teamById(g.home).seal} ${pts > 1 ? "SCORE" : "GOAL"}! ${n.hs}-${n.as}`); navigator.vibrate?.([50, 50, 50]); } }
        else if (r < 0.2) { n.as += pts; if (favs.includes(g.away)) toast.success(`${teamById(g.away).seal} scores! ${n.hs}-${n.as}`); }
        if (/^\d+'$/.test(g.clock)) { const m = parseInt(g.clock) + 1; n.clock = m >= 90 ? "90+'" : `${m}'`; }
        return n;
      }));
    }, 4000);
    return () => clearInterval(i);
  }, [liveOn, favs]);

  const toggleFav = (id: string) => {
    const has = favs.includes(id);
    setFavs(has ? favs.filter((f) => f !== id) : [...favs, id]);
    navigator.vibrate?.(30);
    toast(has ? `Removed ${teamById(id).name}` : `★ Added ${teamById(id).name}`);
  };
  const addAllMN = () => { setFavs(Array.from(new Set([...favs, ...MN_IDS]))); toast.success("All 7 Minnesota teams added"); navigator.vibrate?.([40, 30, 40]); };

  const inHub = (g: Game) => hub === "all" || teamById(g.home).hub === hub || teamById(g.away).hub === hub;
  const hubGames = games.filter(inHub);

  return (
    <div data-hub={hub} className="min-h-screen bg-background font-sans text-foreground">
      <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur">
        <div className="mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3">
          <div className="min-w-0">
            <h1 className="truncate font-display text-2xl tracking-wider text-primary sm:text-3xl">ULTIMATE SPORTS OS</h1>
            <HubInfo hub={hub} now={now} weather={weather} lang={lang} />
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button onClick={() => setLang(lang === "en" ? "th" : "en")} className="rounded-lg border border-border px-2.5 py-1.5 text-sm font-semibold hover:bg-muted">{lang === "en" ? "ไทย" : "EN"}</button>
            <button onClick={() => setLiveOn(!liveOn)} className="flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-sm font-semibold hover:bg-muted" aria-label={t.simulate}>
              <span className={`h-2 w-2 rounded-full ${liveOn ? "animate-pulse bg-live" : "bg-muted-foreground"}`} />{hubGames.filter((g) => g.status === "LIVE").length}
            </button>
          </div>
        </div>
        <div className="mx-auto flex max-w-6xl gap-2 px-4 pb-3">
          {([["ratchaburi", "🐉 Ratchaburi FC"], ["minnesota", "⭐ Minnesota Hub"], ["all", `🌐 ${t.all}`]] as const).map(([h, label]) => (
            <button key={h} onClick={() => setHub(h)} className={`flex-1 rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-wide transition sm:flex-none sm:text-sm ${hub === h ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"}`}>{label}</button>
          ))}
        </div>
        <Ticker games={games} />
        <nav className="mx-auto hidden max-w-6xl gap-1 px-4 py-2 md:flex">
          {tabs(t).map(([k, label, Icon]) => (
            <button key={k} onClick={() => setTab(k)} className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold ${tab === k ? "bg-secondary text-primary" : "text-muted-foreground hover:text-foreground"}`}><Icon className="h-4 w-4" />{label}</button>
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-28 pt-5 md:pb-10">
        {tab === "live" && <LiveTab games={hubGames} lang={lang} preds={preds} setPreds={setPreds} />}
        {tab === "my" && <MyTab favs={favs} toggle={toggleFav} addAll={addAllMN} games={games} lang={lang} />}
        {tab === "explore" && <ExploreTab hub={hub} favs={favs} toggle={toggleFav} addAll={addAllMN} lang={lang} />}
        {tab === "leagues" && <LeaguesTab favs={favs} toggle={toggleFav} lang={lang} />}
        {tab === "fantasy" && <FantasyTab lang={lang} preds={preds} />}
      </main>

      <nav className="pb-safe fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-border bg-background/95 pt-2 backdrop-blur md:hidden">
        {tabs(t).map(([k, label, Icon]) => (
          <button key={k} onClick={() => setTab(k)} className={`flex flex-col items-center gap-0.5 text-[11px] font-semibold ${tab === k ? "text-primary" : "text-muted-foreground"}`}><Icon className="h-5 w-5" />{label}</button>
        ))}
      </nav>
    </div>
  );
}

const tabs = (t: (typeof T)["en"]) => [["live", t.live, Tv], ["my", t.my, Heart], ["explore", t.explore, Compass], ["leagues", t.leagues, Trophy], ["fantasy", t.fantasy, Star]] as const;

function HubInfo({ hub, now, weather, lang }: { hub: Hub; now: Date | null; weather: { t: number; h: number; w: number } | null; lang: Lang }) {
  const f = (tz: string) => now ? now.toLocaleTimeString(lang === "th" ? "th-TH" : "en-US", { timeZone: tz, hour: "2-digit", minute: "2-digit", second: "2-digit" }) : "--:--";
  return (
    <p className="truncate text-xs text-muted-foreground">
      {hub === "minnesota" ? <>Twin Cities • CT {f("America/Chicago")} • ICT {f("Asia/Bangkok")}</>
        : <>Dragon Solar Park, Ratchaburi • ICT {f("Asia/Bangkok")}{hub === "all" && <> • CT {f("America/Chicago")}</>}
          {weather && <> • <Cloud className="inline h-3 w-3" /> {Math.round(weather.t)}°C {weather.h}% {Math.round(weather.w)}km/h</>}</>}
    </p>
  );
}

function Ticker({ games }: { games: Game[] }) {
  const items = games.map((g) => `${g.status === "LIVE" ? "🔴" : g.status === "FINAL" ? "✅" : "🕒"} ${teamById(g.away).seal} ${g.status === "UPCOMING" ? "@" : `${g.as}-${g.hs}`} ${teamById(g.home).seal} ${g.clock} • ${g.odds}`);
  return (
    <div className="overflow-hidden border-y border-border bg-card py-1.5 text-xs font-semibold">
      <div className="animate-marquee flex w-max gap-10 whitespace-nowrap">
        {[...items, ...items].map((s, i) => <span key={i}>{s}</span>)}
      </div>
    </div>
  );
}

const isMN = (g: Game) => teamById(g.home).hub === "minnesota" || teamById(g.away).hub === "minnesota";

function GameTimes({ g, lang }: { g: Game; lang: Lang }) {
  return (
    <div className="flex flex-wrap gap-x-3 text-xs text-muted-foreground">
      {isMN(g) && <span>🇺🇸 CT {fmtTime(g.kickoff, "America/Chicago", lang)}</span>}
      <span>🇹🇭 ICT {fmtTime(g.kickoff, "Asia/Bangkok", lang)}</span>
    </div>
  );
}

function calendarLinks(g: Game) {
  const h = teamById(g.home), a = teamById(g.away);
  const s = new Date(g.kickoff), e = new Date(s.getTime() + 2 * 3600e3);
  const z = (d: Date) => d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  const title = `${a.name} @ ${h.name}`;
  const gcal = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${z(s)}/${z(e)}&location=${encodeURIComponent(g.venue)}`;
  const ics = () => {
    const body = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//UltimateSportsOS//EN", "BEGIN:VEVENT", `UID:${g.id}@sportsos`, `DTSTAMP:${z(new Date())}`, `DTSTART:${z(s)}`, `DTEND:${z(e)}`, `SUMMARY:${title}`, `LOCATION:${g.venue}`, "END:VEVENT", "END:VCALENDAR"].join("\r\n");
    const url = URL.createObjectURL(new Blob([body], { type: "text/calendar" }));
    const el = document.createElement("a"); el.href = url; el.download = `${h.seal}-vs-${a.seal}.ics`; el.click(); URL.revokeObjectURL(url);
  };
  return { gcal, ics, title };
}

async function shareCard(g: Game) {
  const h = teamById(g.home), a = teamById(g.away);
  const c = document.createElement("canvas"); c.width = 1080; c.height = 1350;
  const x = c.getContext("2d")!;
  const grd = x.createLinearGradient(0, 0, 1080, 1350); grd.addColorStop(0, h.color); grd.addColorStop(1, a.color);
  x.fillStyle = grd; x.fillRect(0, 0, 1080, 1350);
  x.fillStyle = "rgba(0,0,0,.45)"; x.fillRect(60, 60, 960, 1230);
  x.textAlign = "center"; x.fillStyle = "#fff";
  x.font = "bold 56px sans-serif"; x.fillText("ULTIMATE SPORTS OS", 540, 180);
  x.font = "bold 40px sans-serif"; x.fillText(g.league + " • " + g.venue, 540, 260);
  x.font = "bold 150px sans-serif"; x.fillStyle = a.accent; x.fillText(a.seal, 540, 520); x.fillStyle = h.accent; x.fillText(h.seal, 540, 900);
  x.fillStyle = "#fff"; x.font = "bold 120px sans-serif"; x.fillText(g.status === "UPCOMING" ? "VS" : `${g.as} - ${g.hs}`, 540, 715);
  x.font = "36px sans-serif"; x.fillText(`ICT ${fmtTime(g.kickoff, "Asia/Bangkok", "en")}`, 540, 1050);
  if (isMN(g)) x.fillText(`CT ${fmtTime(g.kickoff, "America/Chicago", "en")}`, 540, 1105);
  x.fillText(g.odds, 540, 1180);
  const blob: Blob = await new Promise((r) => c.toBlob((b) => r(b!), "image/png"));
  const file = new File([blob], `${a.seal}-${h.seal}.png`, { type: "image/png" });
  if (navigator.canShare?.({ files: [file] })) { await navigator.share({ files: [file], title: `${a.name} @ ${h.name}` }).catch(() => {}); }
  else { const u = URL.createObjectURL(blob); const el = document.createElement("a"); el.href = u; el.download = file.name; el.click(); toast("Match card downloaded"); }
}

const lineShare = (text: string) => window.open(`https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(location.href)}&text=${encodeURIComponent(text)}`, "_blank");

function GameCard({ g, lang, pred, onPredict }: { g: Game; lang: Lang; pred?: { h: number; a: number } | undefined; onPredict?: ((h: number, a: number) => void) | undefined }) {
  const t = T[lang]; const h = teamById(g.home), a = teamById(g.away);
  const [ph, setPh] = useState(pred?.h ?? 0), [pa, setPa] = useState(pred?.a ?? 0);
  const cal = calendarLinks(g);
  const name = (x: Team) => lang === "th" ? x.th : x.name;
  return (
    <article className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="h-1.5" style={{ background: `linear-gradient(90deg, ${a.color}, ${h.color})` }} />
      <div className="space-y-3 p-4">
        <div className="flex items-center justify-between gap-2 text-xs">
          <span className="font-semibold text-muted-foreground">{g.league} • {g.venue}</span>
          <span className={`shrink-0 rounded-full px-2 py-0.5 font-bold ${g.status === "LIVE" ? "animate-pulse bg-live text-foreground" : "bg-muted text-muted-foreground"}`}>{g.status === "LIVE" ? `LIVE ${g.clock}` : g.status === "FINAL" ? t.final : t.next}</span>
        </div>
        <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3">
          <div className="flex min-w-0 items-center gap-2"><Seal t={a} /><span className="truncate text-sm font-semibold">{name(a)}</span></div>
          <div className="font-display text-4xl tabular-nums">{g.status === "UPCOMING" ? "VS" : `${g.as}-${g.hs}`}</div>
          <div className="flex min-w-0 flex-row-reverse items-center gap-2 text-right"><Seal t={h} /><span className="truncate text-sm font-semibold">{name(h)}</span></div>
        </div>
        <GameTimes g={g} lang={lang} />
        <p className="text-xs font-semibold text-accent">💰 {g.odds}</p>
        {g.stats && (
          <div className="space-y-2 rounded-xl bg-muted p-3 text-xs">
            <div className="flex justify-between"><span>{t.possession}</span><span>{100 - g.stats.possession}% – {g.stats.possession}%</span></div>
            <div className="flex h-1.5 overflow-hidden rounded-full bg-secondary"><div className="bg-foreground/30" style={{ width: `${100 - g.stats.possession}%` }} /><div className="bg-primary" style={{ width: `${g.stats.possession}%` }} /></div>
            <div className="flex justify-between"><span>{t.shots}</span><span>{g.stats.shotsA} – {g.stats.shotsH}</span></div>
            <div>
              <div className="mb-1 text-muted-foreground">{t.momentum}</div>
              <div className="flex h-12 items-center gap-0.5">
                {g.stats.momentum.map((m, i) => (
                  <div key={i} className="flex h-full flex-1 flex-col justify-center">
                    <div className={m > 0 ? "rounded-t-sm bg-primary" : "invisible"} style={{ height: `${Math.abs(m) * 3}px` }} />
                    <div className={m < 0 ? "rounded-b-sm bg-foreground/40" : "invisible"} style={{ height: `${Math.abs(m) * 3}px` }} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        {g.ratings && (
          <div className="text-xs">
            <div className="mb-1 text-muted-foreground">{t.ratings}</div>
            <div className="flex flex-wrap gap-1.5">
              {g.ratings.map((r) => <span key={r.name} className="flex items-center gap-1 rounded-md bg-muted px-2 py-1"><b className={`rounded px-1 ${r.r >= 8 ? "bg-primary text-primary-foreground" : "bg-accent text-accent-foreground"}`}>{r.r.toFixed(1)}</b>{r.name}</span>)}
            </div>
          </div>
        )}
        {onPredict && g.status !== "FINAL" && (
          <div className="flex items-center gap-2 text-xs">
            <span className="font-semibold">{t.predict}:</span>
            <input aria-label="away" type="number" min={0} value={pa} onChange={(e) => setPa(+e.target.value)} className="w-12 rounded-md border border-input bg-background px-2 py-1" />
            <span>-</span>
            <input aria-label="home" type="number" min={0} value={ph} onChange={(e) => setPh(+e.target.value)} className="w-12 rounded-md border border-input bg-background px-2 py-1" />
            <button onClick={() => { onPredict(ph, pa); toast.success(`${t.predict} ✓ ${a.seal} ${pa}-${ph} ${h.seal}`); }} className="rounded-md bg-primary px-3 py-1 font-bold text-primary-foreground">OK</button>
            {pred && <span className="text-muted-foreground">✓ {pred.a}-{pred.h}</span>}
          </div>
        )}
        <div className="flex flex-wrap gap-2 border-t border-border pt-3 text-xs font-semibold">
          <a href={cal.gcal} target="_blank" rel="noreferrer" className="flex items-center gap-1 rounded-md bg-muted px-2.5 py-1.5 hover:bg-secondary"><CalendarPlus className="h-3.5 w-3.5" />{t.gcal}</a>
          <button onClick={cal.ics} className="rounded-md bg-muted px-2.5 py-1.5 hover:bg-secondary">{t.ics}</button>
          <button onClick={() => shareCard(g)} className="flex items-center gap-1 rounded-md bg-muted px-2.5 py-1.5 hover:bg-secondary"><Share2 className="h-3.5 w-3.5" />{t.share}</button>
          <button onClick={() => lineShare(`${cal.title} ${g.status === "UPCOMING" ? "" : `${g.as}-${g.hs}`} • Ultimate Sports OS`)} className="rounded-md bg-line px-2.5 py-1.5 text-background">LINE</button>
          <a href={`https://www.youtube.com/results?search_query=${encodeURIComponent(`${h.name} ${a.name} highlights`)}`} target="_blank" rel="noreferrer" className="rounded-md bg-muted px-2.5 py-1.5 hover:bg-secondary">▶ Highlights</a>
        </div>
      </div>
    </article>
  );
}

function LiveTab({ games, lang, preds, setPreds }: { games: Game[]; lang: Lang; preds: Record<string, { h: number; a: number }>; setPreds: (p: Record<string, { h: number; a: number }>) => void }) {
  const order = { LIVE: 0, UPCOMING: 1, FINAL: 2 };
  const sorted = [...games].sort((x, y) => order[x.status] - order[y.status]);
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {sorted.map((g) => <GameCard key={g.id} g={g} lang={lang} pred={preds[g.id]} onPredict={(h, a) => setPreds({ ...preds, [g.id]: { h, a } })} />)}
    </div>
  );
}

function TeamCard({ team, fav, toggle, lang }: { team: Team; fav: boolean; toggle: () => void; lang: Lang }) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const long = useRef(false);
  const t = T[lang];
  return (
    <div onPointerDown={() => { long.current = false; timer.current = setTimeout(() => { long.current = true; toggle(); }, 500); }}
      onPointerUp={() => timer.current && clearTimeout(timer.current)} onPointerLeave={() => timer.current && clearTimeout(timer.current)}
      className="select-none overflow-hidden rounded-2xl border border-border bg-card" style={{ backgroundImage: `linear-gradient(135deg, ${team.color}40, transparent 60%)` }}>
      <div className="flex items-center gap-3 p-4">
        <Seal t={team} size={52} />
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-semibold">{lang === "th" ? team.th : team.name}</h3>
          <p className="truncate text-xs text-muted-foreground">{team.league} • {team.record}{team.venue && ` • ${team.venue}`}</p>
        </div>
        <button onClick={() => { if (!long.current) toggle(); }} aria-label="favorite" className={`shrink-0 rounded-full p-2 ${fav ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}><Heart className={`h-4 w-4 ${fav ? "fill-current" : ""}`} /></button>
      </div>
      {team.notes && <ul className="space-y-1 px-4 pb-3 text-xs text-muted-foreground">{team.notes.map((n) => <li key={n}>• {n}</li>)}</ul>}
      {team.sentiment && (
        <div className="px-4 pb-4 text-xs">
          <div className="mb-1 flex justify-between"><span>{t.fanMood}</span><b className={team.sentiment.label === "Frustrated" ? "text-destructive" : "text-primary"}>{team.sentiment.pct}% {team.sentiment.label}</b></div>
          <div className="h-1.5 overflow-hidden rounded-full bg-muted"><div className={team.sentiment.label === "Frustrated" ? "h-full bg-destructive" : "h-full bg-primary"} style={{ width: `${team.sentiment.pct}%` }} /></div>
        </div>
      )}
    </div>
  );
}

function MyTab({ favs, toggle, addAll, games, lang }: { favs: string[]; toggle: (id: string) => void; addAll: () => void; games: Game[]; lang: Lang }) {
  const t = T[lang];
  const mine = games.filter((g) => favs.includes(g.home) || favs.includes(g.away));
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-3xl tracking-wide">{t.my} ({favs.length})</h2>
        <button onClick={addAll} className="rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground">⭐ {t.addAllMN}</button>
      </div>
      {favs.length === 0 ? <p className="text-muted-foreground">{t.empty}</p> : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">{favs.map((id) => <TeamCard key={id} team={teamById(id)} fav toggle={() => toggle(id)} lang={lang} />)}</div>
      )}
      {mine.length > 0 && <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">{mine.map((g) => <GameCard key={g.id} g={g} lang={lang} />)}</div>}
    </div>
  );
}

function ExploreTab({ hub, favs, toggle, addAll, lang }: { hub: Hub; favs: string[]; toggle: (id: string) => void; addAll: () => void; lang: Lang }) {
  const t = T[lang];
  const [q, setQ] = useState(""); const [sport, setSport] = useState("All"); const [league, setLeague] = useState("All");
  const sports = ["All", ...Array.from(new Set(TEAMS.map((x) => x.sport)))];
  const match = (x: Team) => !q || `${x.name} ${x.th} ${x.seal} ${x.league}`.toLowerCase().includes(q.toLowerCase());
  const list = TEAMS.filter((x) => (sport === "All" || x.sport === sport) && (league === "All" || x.league === league) && match(x))
    .sort((a, b) => Number(b.hub === hub) - Number(a.hub === hub));
  const suggestions = q ? TEAMS.filter(match).slice(0, 5) : [];
  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t.search} className="w-full rounded-xl border border-input bg-card py-2.5 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring" />
        {suggestions.length > 0 && (
          <div className="absolute inset-x-0 top-full z-20 mt-1 overflow-hidden rounded-xl border border-border bg-popover shadow-xl">
            {suggestions.map((s) => (
              <button key={s.id} onClick={() => { if (!favs.includes(s.id)) toggle(s.id); setQ(""); }} className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-muted">
                <Seal t={s} size={32} /><div className="min-w-0 flex-1"><div className="truncate text-sm font-semibold">{s.name} <span className="text-muted-foreground">{s.th}</span></div><div className="text-xs text-muted-foreground">{s.league} • {s.record}</div></div>
                <span className="shrink-0 rounded-md bg-primary px-2 py-0.5 text-xs font-bold text-primary-foreground">{favs.includes(s.id) ? "✓" : "+ ADD"}</span>
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="flex flex-wrap gap-2">{sports.map((s) => <Chip key={s} on={sport === s} onClick={() => setSport(s)}>{s}</Chip>)}</div>
      <div className="flex flex-wrap gap-2">{["All", ...LEAGUES].map((l) => <Chip key={l} on={league === l} onClick={() => setLeague(l)}>{l}</Chip>)}</div>
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-card p-3">
        <span className="text-sm text-muted-foreground"><Zap className="inline h-4 w-4 text-primary" /> Long-press any card to add instantly</span>
        <button onClick={addAll} className="rounded-full bg-primary px-4 py-1.5 text-sm font-bold text-primary-foreground">⭐ {t.addAllMN}</button>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">{list.map((x) => <TeamCard key={x.id} team={x} fav={favs.includes(x.id)} toggle={() => toggle(x.id)} lang={lang} />)}</div>
    </div>
  );
}

function Chip({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return <button onClick={onClick} className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${on ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"}`}>{children}</button>;
}

function LeaguesTab({ favs, toggle, lang }: { favs: string[]; toggle: (id: string) => void; lang: Lang }) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {LEAGUES.map((l) => {
        const teams = TEAMS.filter((x) => x.league === l);
        return (
          <section key={l} className="rounded-2xl border border-border bg-card p-4">
            <h3 className="mb-3 font-display text-2xl tracking-wide text-primary">{l}</h3>
            <ul className="space-y-2">
              {teams.map((x, i) => (
                <li key={x.id} className="flex items-center gap-3">
                  <span className="w-5 text-xs text-muted-foreground">{i + 1}</span><Seal t={x} size={30} />
                  <span className="min-w-0 flex-1 truncate text-sm font-semibold">{lang === "th" ? x.th : x.name}</span>
                  <span className="shrink-0 text-xs text-muted-foreground">{x.record}</span>
                  <button onClick={() => toggle(x.id)} aria-label="favorite" className={favs.includes(x.id) ? "text-primary" : "text-muted-foreground"}><Heart className={`h-4 w-4 ${favs.includes(x.id) ? "fill-current" : ""}`} /></button>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}

const ROSTER = [
  { name: "Justin Jefferson", pos: "WR", team: "vik", pts: 24.6 }, { name: "Anthony Edwards", pos: "G", team: "wolves", pts: 41.3 },
  { name: "Napheesa Collier", pos: "F", team: "lynx", pts: 38.9 }, { name: "Kirill Kaprizov", pos: "LW", team: "wild", pts: 12.5 },
  { name: "Dennis Murillo", pos: "FW", team: "rbfc", pts: 15.0 }, { name: "Taylor Heise", pos: "C", team: "frost", pts: 11.0 },
];

function FantasyTab({ lang, preds }: { lang: Lang; preds: Record<string, unknown> }) {
  const t = T[lang];
  const mePts = Object.keys(preds).length * 3 + 12;
  const board = useMemo(() => [
    { n: "Somchai 🐉", p: 48 }, { n: "Ole from Edina", p: 41 }, { n: "Nong Fah", p: 33 }, { n: "SKOL_Sara", p: 27 }, { n: lang === "th" ? "คุณ" : "You", p: mePts, me: true },
  ].sort((a, b) => b.p - a.p), [mePts, lang]);
  const total = ROSTER.reduce((s, r) => s + r.pts, 0);
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <section className="rounded-2xl border border-border bg-card p-4">
        <div className="mb-3 flex items-center justify-between"><h3 className="font-display text-2xl tracking-wide"><Users className="mr-2 inline h-5 w-5" />{t.roster}</h3><span className="font-display text-3xl text-primary">{total.toFixed(1)}</span></div>
        <p className="mb-3 text-xs text-muted-foreground">Week record 4-1 • Rank #2 • {t.scoring}</p>
        <ul className="space-y-2">{ROSTER.map((r) => (
          <li key={r.name} className="flex items-center gap-3 rounded-lg bg-muted p-2"><Seal t={teamById(r.team)} size={32} /><div className="min-w-0 flex-1"><div className="truncate text-sm font-semibold">{r.name}</div><div className="text-xs text-muted-foreground">{r.pos}</div></div><b className="text-primary">{r.pts}</b></li>
        ))}</ul>
      </section>
      <section className="rounded-2xl border border-border bg-card p-4">
        <h3 className="mb-3 font-display text-2xl tracking-wide"><Activity className="mr-2 inline h-5 w-5" />🏆 {t.leaderboard}</h3>
        <ol className="space-y-2">{board.map((b, i) => (
          <li key={b.n} className={`flex items-center gap-3 rounded-lg p-2 ${b.me ? "bg-primary text-primary-foreground" : "bg-muted"}`}><span className="w-6">{["🥇", "🥈", "🥉"][i] ?? i + 1}</span><span className="flex-1 font-semibold">{b.n}</span><b>{b.p} {t.points}</b></li>
        ))}</ol>
        <button onClick={() => lineShare(`My prediction score: ${mePts} pts on Ultimate Sports OS 🏆`)} className="mt-4 w-full rounded-lg bg-line py-2 font-bold text-background">LINE {t.share}</button>
      </section>
    </div>
  );
}
