import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { toast } from "sonner";
import {
  Activity,
  CalendarPlus,
  Cloud,
  Compass,
  Flame,
  Heart,
  Radio,
  RefreshCw,
  Search,
  Share2,
  Sparkles,
  Star,
  TrendingUp,
  Trophy,
  Tv,
  Users,
  Zap,
} from "lucide-react";
import {
  INITIAL_GAMES,
  LEAGUES,
  T,
  TEAMS,
  fmtTime,
  teamById,
  type Game,
  type Hub,
  type Lang,
  type Team,
} from "@/lib/sports-data";
import { fetchDualWeather, fetchLiveESPNLeague, ESPN_LEAGUES } from "@/lib/live-sports-api";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Ultimate Sports OS — Ratchaburi FC & Minnesota Hub (LIVE)" },
      {
        name: "description",
        content:
          "Live scores, dual CT/ICT times, player ratings, predictions and fantasy for Ratchaburi FC, all 7 Minnesota teams and every major league.",
      },
      { property: "og:title", content: "Ultimate Sports OS — Ratchaburi FC & Minnesota Hub" },
      {
        property: "og:description",
        content: "Any sport, any team. Live ticker, Thai/English, calendar export and LINE sharing.",
      },
    ],
  }),
  component: App,
});

type Tab = "live" | "pulse" | "my" | "explore" | "leagues" | "fantasy";
const MN_IDS = TEAMS.filter((t) => t.hub === "minnesota").map((t) => t.id);

function useLocal<T>(key: string, init: T) {
  const [v, setV] = useState<T>(init);
  useEffect(() => {
    const raw = localStorage.getItem(key);
    if (raw)
      try {
        setV(JSON.parse(raw));
      } catch {
        /* ignore */
      }
  }, [key]);
  const set = (n: T) => {
    setV(n);
    localStorage.setItem(key, JSON.stringify(n));
  };
  return [v, set] as const;
}

function Seal({ t, size = 44 }: { t: Team; size?: number }) {
  return (
    <div
      className="grid shrink-0 place-items-center rounded-xl font-display tracking-wide ring-2"
      style={{
        width: size,
        height: size,
        background: `linear-gradient(135deg, ${t.color}, ${t.color}cc)`,
        color: t.accent,
        fontSize: size / (t.seal.length > 4 ? 4.2 : 2.8),
        boxShadow: `0 0 0 2px ${t.accent}55`,
      }}
    >
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
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [now, setNow] = useState<Date | null>(null);
  const [dualWeather, setDualWeather] = useState<{
    ratchaburi: { tempC: number; humidity: number; windKmh: number } | null;
    minnesota: { tempF: number; humidity: number; windMph: number } | null;
  }>({ ratchaburi: null, minnesota: null });
  const t = T[lang];

  // 1-second live clock ticker for live ICT & CT clocks
  useEffect(() => {
    setNow(new Date());
    const i = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(i);
  }, []);

  // Fetch real-time dual weather (Ratchaburi + Twin Cities)
  const syncWeather = useCallback(async () => {
    try {
      const w = await fetchDualWeather();
      setDualWeather(w);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    syncWeather();
    const wInterval = setInterval(syncWeather, 60000); // refresh weather every 60s
    return () => clearInterval(wInterval);
  }, [syncWeather]);

  // Live real-time scores sync from ESPN public endpoints
  const syncLiveScores = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const leaguePromises = Object.entries(ESPN_LEAGUES).map(([leagueKey, endpoint]) =>
        fetchLiveESPNLeague(leagueKey, endpoint)
      );
      const results = await Promise.all(leaguePromises);
      const fetchedGames = results.flat();

      if (fetchedGames.length > 0) {
        setGames((prev) => {
          fetchedGames.forEach((newGame) => {
            const old = prev.find((g) => g.id === newGame.id);
            if (old && (old.hs !== newGame.hs || old.as !== newGame.as)) {
              if (favs.includes(newGame.home) || favs.includes(newGame.away)) {
                toast.success(
                  `⚡ Goal/Score Alert: ${teamById(newGame.away).seal} ${newGame.as} - ${newGame.hs} ${
                    teamById(newGame.home).seal
                  }`
                );
                navigator.vibrate?.([60, 40, 60]);
              }
            }
          });

          // Keep non-ESPN games (local curated derby matches like Ratchaburi vs Buriram or Vikings Dublin)
          const localGames = prev.filter((g) => !g.id.startsWith("espn-"));
          return [...fetchedGames, ...localGames];
        });
      }
    } catch (e) {
      console.warn("Live sports feed sync error:", e);
    } finally {
      setIsRefreshing(false);
    }
  }, [favs]);

  // Sync on startup and poll every 15 seconds when live is active
  useEffect(() => {
    syncLiveScores();
  }, [syncLiveScores]);

  useEffect(() => {
    if (!liveOn) return;
    const interval = setInterval(() => {
      syncLiveScores();
    }, 15000);
    return () => clearInterval(interval);
  }, [liveOn, syncLiveScores]);

  // Real-time Match Simulator: advances game clocks, swings momentum bars, fluctuates possession
  useEffect(() => {
    if (!liveOn) return;
    const i = setInterval(() => {
      setGames((gs) =>
        gs.map((g) => {
          if (g.status !== "LIVE") return g;

          // Realistic momentum swing (-16 to +16)
          const swing = Math.round((Math.random() - 0.48) * 16);
          const currentMomentum = g.stats?.momentum || [0, 2, -3, 5, 8, -4, 0, 7, -2, 10];
          const newMomentum = [...currentMomentum.slice(-14), swing];

          // Small random possession drift
          const currentPoss = g.stats?.possession || 50;
          const drift = Math.random() > 0.5 ? 1 : -1;
          const nextPoss = Math.min(75, Math.max(25, currentPoss + (Math.random() > 0.7 ? drift : 0)));

          // Occasional random shot count increase
          const addsHomeShot = Math.random() > 0.85 ? 1 : 0;
          const addsAwayShot = Math.random() > 0.85 ? 1 : 0;

          // Clock progression
          let nextClock = g.clock;
          if (/^\d+'$/.test(g.clock)) {
            const m = parseInt(g.clock, 10) + 1;
            nextClock = m >= 90 ? "90+'" : `${m}'`;
          } else if (g.clock.includes("Q")) {
            // Basketball/Football quarter simulation
            const [q] = g.clock.split(" ");
            const minLeft = Math.max(1, Math.floor(Math.random() * 11));
            const secLeft = Math.floor(Math.random() * 59).toString().padStart(2, "0");
            nextClock = `${q} ${minLeft}:${secLeft}`;
          }

          return {
            ...g,
            clock: nextClock,
            stats: {
              possession: nextPoss,
              shotsH: (g.stats?.shotsH || 6) + addsHomeShot,
              shotsA: (g.stats?.shotsA || 4) + addsAwayShot,
              momentum: newMomentum,
            },
          };
        })
      );
    }, 3000);
    return () => clearInterval(i);
  }, [liveOn]);

  const toggleFav = (id: string) => {
    const has = favs.includes(id);
    setFavs(has ? favs.filter((f) => f !== id) : [...favs, id]);
    navigator.vibrate?.(30);
    toast(has ? `Removed ${teamById(id).name}` : `★ Added ${teamById(id).name}`);
  };

  const addAllMN = () => {
    setFavs(Array.from(new Set([...favs, ...MN_IDS])));
    toast.success("All 7 Minnesota teams added to Favorites");
    navigator.vibrate?.([40, 30, 40]);
  };

  const inHub = (g: Game) => hub === "all" || teamById(g.home).hub === hub || teamById(g.away).hub === hub;
  const hubGames = games.filter(inHub);
  const liveCount = hubGames.filter((g) => g.status === "LIVE").length;

  return (
    <div data-hub={hub} className="min-h-screen bg-background font-sans text-foreground">
      <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur">
        <div className="mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3">
          <div className="min-w-0">
            <h1 className="truncate font-display text-2xl tracking-wider text-primary sm:text-3xl">
              ULTIMATE SPORTS OS
            </h1>
            <HubInfo hub={hub} now={now} dualWeather={dualWeather} lang={lang} />
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button
              onClick={() => syncLiveScores()}
              className="rounded-lg border border-border p-2 text-sm font-semibold hover:bg-muted"
              title="Refresh Live Data"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin text-primary" : "text-muted-foreground"}`} />
            </button>
            <button
              onClick={() => setLang(lang === "en" ? "th" : "en")}
              className="rounded-lg border border-border px-2.5 py-1.5 text-sm font-semibold hover:bg-muted"
            >
              {lang === "en" ? "ไทย" : "EN"}
            </button>
            <button
              onClick={() => {
                setLiveOn(!liveOn);
                toast(liveOn ? "Live polling paused" : "Live polling resumed");
              }}
              className="flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-sm font-semibold hover:bg-muted"
              aria-label={t.simulate}
            >
              <span className={`h-2 w-2 rounded-full ${liveOn ? "animate-pulse bg-live" : "bg-muted-foreground"}`} />
              {liveCount} LIVE
            </button>
          </div>
        </div>

        {/* Hub Switcher */}
        <div className="mx-auto flex max-w-6xl gap-2 px-4 pb-3">
          {(
            [
              ["ratchaburi", "🐉 Ratchaburi FC"],
              ["minnesota", "⭐ Minnesota Hub"],
              ["all", `🌐 ${t.all}`],
            ] as const
          ).map(([h, label]) => (
            <button
              key={h}
              onClick={() => setHub(h)}
              className={`flex-1 rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-wide transition sm:flex-none sm:text-sm ${
                hub === h ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Live Score Ticker */}
        <Ticker games={games} />

        {/* Desktop Tabs */}
        <nav className="mx-auto hidden max-w-6xl gap-1 px-4 py-2 md:flex">
          {tabs(t, lang).map(([k, label, Icon]) => (
            <button
              key={k}
              onClick={() => setTab(k)}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition ${
                tab === k ? "bg-secondary text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
              {k === "pulse" && (
                <span className="flex h-2 w-2 items-center justify-center">
                  <span className="h-1.5 w-1.5 rounded-full bg-live animate-ping" />
                </span>
              )}
            </button>
          ))}
        </nav>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-6xl px-4 pb-28 pt-5 md:pb-10">
        {tab === "live" && <LiveTab games={hubGames} lang={lang} preds={preds} setPreds={setPreds} />}
        {tab === "pulse" && (
          <PulseTab
            games={hubGames}
            hub={hub}
            lang={lang}
            favs={favs}
            toggleFav={toggleFav}
            dualWeather={dualWeather}
          />
        )}
        {tab === "my" && <MyTab favs={favs} toggle={toggleFav} addAll={addAllMN} games={games} lang={lang} />}
        {tab === "explore" && <ExploreTab hub={hub} favs={favs} toggle={toggleFav} addAll={addAllMN} lang={lang} />}
        {tab === "leagues" && <LeaguesTab favs={favs} toggle={toggleFav} lang={lang} />}
        {tab === "fantasy" && <FantasyTab lang={lang} preds={preds} />}
      </main>

      {/* Mobile Safe-Area Bottom Nav (6 Grid Columns with Pulse between Live and My Teams) */}
      <nav className="pb-safe fixed inset-x-0 bottom-0 z-30 grid grid-cols-6 border-t border-border bg-background/95 pt-2 backdrop-blur md:hidden">
        {tabs(t, lang).map(([k, label, Icon]) => (
          <button
            key={k}
            onClick={() => setTab(k)}
            className={`flex flex-col items-center gap-0.5 pb-1 text-[10px] font-semibold transition ${
              tab === k ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <div className="relative">
              <Icon className="h-5 w-5" />
              {k === "pulse" && (
                <span className="absolute -right-1 -top-0.5 flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-live opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-live" />
                </span>
              )}
            </div>
            <span className="truncate max-w-[50px]">{label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}

// Pulse placed between "live" and "my"
const tabs = (t: (typeof T)["en"], lang: Lang) =>
  [
    ["live", t.live, Tv],
    ["pulse", lang === "th" ? "ชีพจร" : "Pulse", Activity],
    ["my", t.my, Heart],
    ["explore", t.explore, Compass],
    ["leagues", t.leagues, Trophy],
    ["fantasy", t.fantasy, Star],
  ] as const;

function HubInfo({
  hub,
  now,
  dualWeather,
  lang,
}: {
  hub: Hub;
  now: Date | null;
  dualWeather: {
    ratchaburi: { tempC: number; humidity: number; windKmh: number } | null;
    minnesota: { tempF: number; humidity: number; windMph: number } | null;
  };
  lang: Lang;
}) {
  const f = (tz: string) =>
    now
      ? now.toLocaleTimeString(lang === "th" ? "th-TH" : "en-US", {
          timeZone: tz,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      : "--:--";

  return (
    <div className="flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
      {hub === "minnesota" ? (
        <>
          <span>Twin Cities</span>
          <span>• CT {f("America/Chicago")}</span>
          <span>• ICT {f("Asia/Bangkok")}</span>
          {dualWeather.minnesota && (
            <span className="text-secondary font-medium">
              • <Cloud className="inline h-3 w-3" /> {Math.round(dualWeather.minnesota.tempF)}°F (
              {dualWeather.minnesota.humidity}% hum)
            </span>
          )}
        </>
      ) : (
        <>
          <span>Dragon Solar Park, Ratchaburi</span>
          <span>• ICT {f("Asia/Bangkok")}</span>
          {hub === "all" && <span>• CT {f("America/Chicago")}</span>}
          {dualWeather.ratchaburi && (
            <span className="text-primary font-medium">
              • <Cloud className="inline h-3 w-3" /> {Math.round(dualWeather.ratchaburi.tempC)}°C (
              {dualWeather.ratchaburi.humidity}% hum)
            </span>
          )}
        </>
      )}
    </div>
  );
}

function Ticker({ games }: { games: Game[] }) {
  const items = games.map(
    (g) =>
      `${g.status === "LIVE" ? "🔴" : g.status === "FINAL" ? "✅" : "🕒"} ${teamById(g.away).seal} ${
        g.status === "UPCOMING" ? "@" : `${g.as}-${g.hs}`
      } ${teamById(g.home).seal} ${g.clock} • ${g.odds}`
  );
  return (
    <div className="overflow-hidden border-y border-border bg-card py-1.5 text-xs font-semibold">
      <div className="animate-marquee flex w-max gap-10 whitespace-nowrap">
        {[...items, ...items].map((s, i) => (
          <span key={i}>{s}</span>
        ))}
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
  const h = teamById(g.home),
    a = teamById(g.away);
  const s = new Date(g.kickoff),
    e = new Date(s.getTime() + 2 * 3600 * 1000);
  const iso = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const title = `${a.name} @ ${h.name} (${g.league})`;
  const gcal = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
    title
  )}&dates=${iso(s)}/${iso(e)}&location=${encodeURIComponent(g.venue)}&details=${encodeURIComponent(
    `Ultimate Sports OS • ${g.odds}`
  )}`;
  const ics = () => {
    const raw = `BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nSUMMARY:${title}\nDTSTART:${iso(s)}\nDTEND:${iso(
      e
    )}\nLOCATION:${g.venue}\nDESCRIPTION:Ultimate Sports OS • ${g.odds}\nEND:VEVENT\nEND:VCALENDAR`;
    const b = new Blob([raw], { type: "text/calendar;charset=utf-8" });
    const u = URL.createObjectURL(b);
    const el = document.createElement("a");
    el.href = u;
    el.download = `${a.seal}-at-${h.seal}.ics`;
    el.click();
    toast.success("ICS calendar downloaded");
  };
  return { gcal, ics, title };
}

async function shareCard(g: Game) {
  const h = teamById(g.home),
    a = teamById(g.away);
  const c = document.createElement("canvas");
  c.width = 1080;
  c.height = 1350;
  const x = c.getContext("2d")!;
  const grd = x.createLinearGradient(0, 0, 1080, 1350);
  grd.addColorStop(0, h.color);
  grd.addColorStop(1, a.color);
  x.fillStyle = grd;
  x.fillRect(0, 0, 1080, 1350);
  x.fillStyle = "rgba(0,0,0,.45)";
  x.fillRect(60, 60, 960, 1230);
  x.textAlign = "center";
  x.fillStyle = "#fff";
  x.font = "bold 56px sans-serif";
  x.fillText("ULTIMATE SPORTS OS", 540, 180);
  x.font = "bold 40px sans-serif";
  x.fillText(g.league + " • " + g.venue, 540, 260);
  x.font = "bold 150px sans-serif";
  x.fillStyle = a.accent;
  x.fillText(a.seal, 540, 520);
  x.fillStyle = h.accent;
  x.fillText(h.seal, 540, 900);
  x.fillStyle = "#fff";
  x.font = "bold 120px sans-serif";
  x.fillText(g.status === "UPCOMING" ? "VS" : `${g.as} - ${g.hs}`, 540, 715);
  x.font = "36px sans-serif";
  x.fillText(`ICT ${fmtTime(g.kickoff, "Asia/Bangkok", "en")}`, 540, 1050);
  if (isMN(g)) x.fillText(`CT ${fmtTime(g.kickoff, "America/Chicago", "en")}`, 540, 1105);
  x.fillText(g.odds, 540, 1180);
  const blob: Blob = await new Promise((r) => c.toBlob((b) => r(b!), "image/png"));
  const file = new File([blob], `${a.seal}-${h.seal}.png`, { type: "image/png" });
  if (navigator.canShare?.({ files: [file] })) {
    await navigator.share({ files: [file], title: `${a.name} @ ${h.name}` }).catch(() => {});
  } else {
    const u = URL.createObjectURL(blob);
    const el = document.createElement("a");
    el.href = u;
    el.download = file.name;
    el.click();
    toast("Match card downloaded");
  }
}

const lineShare = (text: string) =>
  window.open(
    `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(location.href)}&text=${encodeURIComponent(
      text
    )}`,
    "_blank"
  );

function GameCard({
  g,
  lang,
  pred,
  onPredict,
}: {
  g: Game;
  lang: Lang;
  pred?: { h: number; a: number } | undefined;
  onPredict?: ((h: number, a: number) => void) | undefined;
}) {
  const t = T[lang];
  const h = teamById(g.home),
    a = teamById(g.away);
  const [ph, setPh] = useState(pred?.h ?? 0),
    [pa, setPa] = useState(pred?.a ?? 0);
  const cal = calendarLinks(g);
  const name = (x: Team) => (lang === "th" ? x.th : x.name);

  return (
    <article className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="h-1.5" style={{ background: `linear-gradient(90deg, ${a.color}, ${h.color})` }} />
      <div className="space-y-3 p-4">
        <div className="flex items-center justify-between gap-2 text-xs">
          <span className="font-semibold text-muted-foreground">
            {g.league} • {g.venue}
          </span>
          <span
            className={`shrink-0 rounded-full px-2 py-0.5 font-bold ${
              g.status === "LIVE" ? "animate-pulse bg-live text-foreground" : "bg-muted text-muted-foreground"
            }`}
          >
            {g.status === "LIVE" ? `LIVE ${g.clock}` : g.status === "FINAL" ? t.final : t.next}
          </span>
        </div>
        <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <Seal t={a} />
            <span className="truncate text-sm font-semibold">{name(a)}</span>
          </div>
          <div className="font-display text-4xl tabular-nums">{g.status === "UPCOMING" ? "VS" : `${g.as}-${g.hs}`}</div>
          <div className="flex min-w-0 flex-row-reverse items-center gap-2 text-right">
            <Seal t={h} />
            <span className="truncate text-sm font-semibold">{name(h)}</span>
          </div>
        </div>
        <GameTimes g={g} lang={lang} />
        <p className="text-xs font-semibold text-accent">💰 {g.odds}</p>
        {g.stats && (
          <div className="space-y-2 rounded-xl bg-muted p-3 text-xs">
            <div className="flex justify-between">
              <span>{t.possession}</span>
              <span>
                {100 - g.stats.possession}% – {g.stats.possession}%
              </span>
            </div>
            <div className="flex h-1.5 overflow-hidden rounded-full bg-secondary">
              <div className="bg-foreground/30 transition-all duration-700" style={{ width: `${100 - g.stats.possession}%` }} />
              <div className="bg-primary transition-all duration-700" style={{ width: `${g.stats.possession}%` }} />
            </div>
            <div className="flex justify-between">
              <span>{t.shots}</span>
              <span>
                {g.stats.shotsA} – {g.stats.shotsH}
              </span>
            </div>
            <div>
              <div className="mb-1 text-muted-foreground">{t.momentum}</div>
              <div className="flex h-12 items-center gap-0.5">
                {g.stats.momentum.map((m, i) => (
                  <div key={i} className="flex h-full flex-1 flex-col justify-center">
                    <div
                      className={m > 0 ? "rounded-t-sm bg-primary transition-all duration-500" : "invisible"}
                      style={{ height: `${Math.abs(m) * 3}px` }}
                    />
                    <div
                      className={m < 0 ? "rounded-b-sm bg-foreground/40 transition-all duration-500" : "invisible"}
                      style={{ height: `${Math.abs(m) * 3}px` }}
                    />
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
              {g.ratings.map((r) => (
                <span key={r.name} className="flex items-center gap-1 rounded-md bg-muted px-2 py-1">
                  <b
                    className={`rounded px-1 ${
                      r.r >= 8 ? "bg-primary text-primary-foreground" : "bg-accent text-accent-foreground"
                    }`}
                  >
                    {r.r.toFixed(1)}
                  </b>
                  {r.name}
                </span>
              ))}
            </div>
          </div>
        )}
        {onPredict && g.status !== "FINAL" && (
          <div className="flex items-center gap-2 text-xs">
            <span className="font-semibold">{t.predict}:</span>
            <input
              aria-label="away"
              type="number"
              min={0}
              value={pa}
              onChange={(e) => setPa(+e.target.value)}
              className="w-12 rounded-md border border-input bg-background px-2 py-1"
            />
            <span>-</span>
            <input
              aria-label="home"
              type="number"
              min={0}
              value={ph}
              onChange={(e) => setPh(+e.target.value)}
              className="w-12 rounded-md border border-input bg-background px-2 py-1"
            />
            <button
              onClick={() => {
                onPredict(ph, pa);
                toast.success(`${t.predict} ✓ ${a.seal} ${pa}-${ph} ${h.seal}`);
              }}
              className="rounded-md bg-primary px-3 py-1 font-bold text-primary-foreground"
            >
              OK
            </button>
            {pred && (
              <span className="text-muted-foreground">
                ✓ {pred.a}-{pred.h}
              </span>
            )}
          </div>
        )}
        <div className="flex flex-wrap gap-2 border-t border-border pt-3 text-xs font-semibold">
          <a
            href={cal.gcal}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 rounded-md bg-muted px-2.5 py-1.5 hover:bg-secondary"
          >
            <CalendarPlus className="h-3.5 w-3.5" />
            {t.gcal}
          </a>
          <button onClick={cal.ics} className="rounded-md bg-muted px-2.5 py-1.5 hover:bg-secondary">
            {t.ics}
          </button>
          <button
            onClick={() => shareCard(g)}
            className="flex items-center gap-1 rounded-md bg-muted px-2.5 py-1.5 hover:bg-secondary"
          >
            <Share2 className="h-3.5 w-3.5" />
            {t.share}
          </button>
          <button
            onClick={() =>
              lineShare(`${cal.title} ${g.status === "UPCOMING" ? "" : `${g.as}-${g.hs}`} • Ultimate Sports OS`)
            }
            className="rounded-md bg-line px-2.5 py-1.5 text-background"
          >
            LINE
          </button>
          <a
            href={`https://www.youtube.com/results?search_query=${encodeURIComponent(`${h.name} ${a.name} highlights`)}`}
            target="_blank"
            rel="noreferrer"
            className="rounded-md bg-muted px-2.5 py-1.5 hover:bg-secondary"
          >
            ▶ Highlights
          </a>
        </div>
      </div>
    </article>
  );
}

function LiveTab({
  games,
  lang,
  preds,
  setPreds,
}: {
  games: Game[];
  lang: Lang;
  preds: Record<string, { h: number; a: number }>;
  setPreds: (p: Record<string, { h: number; a: number }>) => void;
}) {
  const order = { LIVE: 0, UPCOMING: 1, FINAL: 2 };
  const sorted = [...games].sort((x, y) => order[x.status] - order[y.status]);
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {sorted.map((g) => (
        <GameCard
          key={g.id}
          g={g}
          lang={lang}
          pred={preds[g.id]}
          onPredict={(h, a) => setPreds({ ...preds, [g.id]: { h, a } })}
        />
      ))}
    </div>
  );
}

// =========================================================================
// SPORTS PULSE TAB (Auto-sorted: In-Play Intensity & Fan Sentiment High->Low)
// =========================================================================
function PulseTab({
  games,
  hub,
  lang,
  favs,
  toggleFav,
  dualWeather,
}: {
  games: Game[];
  hub: Hub;
  lang: Lang;
  favs: string[];
  toggleFav: (id: string) => void;
  dualWeather: {
    ratchaburi: { tempC: number; humidity: number; windKmh: number } | null;
    minnesota: { tempF: number; humidity: number; windMph: number } | null;
  };
}) {
  const upcomingGames = games.filter((g) => g.status === "UPCOMING").slice(0, 4);
  const mnTeams = TEAMS.filter((t) => t.hub === "minnesota");
  const rbfc = teamById("rbfc");

  // Pulse intensity score calculator: 0-100 based on surge, momentum spike & shot activity
  const getGamePulse = (g: Game) => {
    if (!g.stats) return 40;
    const recent = g.stats.momentum.slice(-4);
    const maxSurge = Math.max(...recent.map((m) => Math.abs(m)), 0);
    const avgRecent = recent.reduce((sum, v) => sum + Math.abs(v), 0) / (recent.length || 1);
    const totalShots = (g.stats.shotsA || 0) + (g.stats.shotsH || 0);
    return Math.min(100, Math.round(maxSurge * 3.5 + avgRecent * 2.5 + Math.min(20, totalShots * 1.5)));
  };

  // Auto-sort live games: Highest intensity to lowest
  const sortedLiveGames = useMemo(() => {
    return games
      .filter((g) => g.status === "LIVE")
      .map((g) => ({ ...g, pulseScore: getGamePulse(g) }))
      .sort((a, b) => b.pulseScore - a.pulseScore);
  }, [games]);

  // Auto-sort fan sentiment: Happiest/Strongest positive down to frustrated
  const sortedSentimentTeams = useMemo(() => {
    const list = [rbfc, ...mnTeams.filter((t) => t.sentiment)];
    return list.sort((a, b) => {
      const sa = a.sentiment ? (a.sentiment.label === "Frustrated" || a.sentiment.label === "Anxious" ? -a.sentiment.pct : a.sentiment.pct) : 0;
      const sb = b.sentiment ? (b.sentiment.label === "Frustrated" || b.sentiment.label === "Anxious" ? -b.sentiment.pct : b.sentiment.pct) : 0;
      return sb - sa;
    });
  }, [rbfc, mnTeams]);

  return (
    <div className="space-y-6">
      {/* Pulse Banner */}
      <section className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-r from-card via-card to-secondary/30 p-5 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-md">
              <Activity className="h-6 w-6 animate-pulse" />
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-live opacity-75" />
                <span className="relative inline-flex h-3 w-3 rounded-full bg-live" />
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display text-2xl tracking-wide sm:text-3xl">
                  {lang === "th" ? "ชีพจรกีฬาเรียลไทม์" : "SPORTS PULSE RADAR"}
                </h2>
                <span className="rounded-full bg-live/20 px-2 py-0.5 text-[10px] font-bold text-live">
                  ● {sortedLiveGames.length} ACTIVE
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {lang === "th"
                  ? "ตรวจวัดโมเมนตัมเกมรุก สภาพอากาศสนาม และอารมณ์แฟนคลับสด"
                  : "Live attack momentum, venue atmospheres, and real-time team sentiment"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="rounded-lg bg-card/80 px-3 py-1.5 border border-border font-semibold flex items-center gap-1.5">
              <Flame className="h-3.5 w-3.5 text-primary" />
              <span>{lang === "th" ? "เรียงลำดับ: สูง → ต่ำ" : "Ranked: High → Low"}</span>
            </span>
          </div>
        </div>
      </section>

      {/* Real-time Match Intensity Radar (Auto-sorted Highest to Lowest) */}
      {sortedLiveGames.length > 0 ? (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-xl tracking-wide flex items-center gap-2 text-primary">
              <Radio className="h-5 w-5 animate-pulse text-live" />
              {lang === "th" ? "โมเมนตัมสนามสด (IN-PLAY PRESSURE)" : "LIVE IN-PLAY INTENSITY"}
            </h3>
            <span className="text-xs text-muted-foreground font-semibold">
              {lang === "th" ? "จัดอันดับความดุเดือด" : "Ranked by In-Game Surge"}
            </span>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {sortedLiveGames.map((g, rankIdx) => {
              const h = teamById(g.home);
              const a = teamById(g.away);
              const lastMomentum = g.stats?.momentum.slice(-1)[0] ?? 0;
              const pressureTeam = lastMomentum > 0 ? h : a;
              return (
                <div key={g.id} className="rounded-2xl border border-border bg-card p-4 space-y-3 relative overflow-hidden">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/20 text-[10px] font-bold text-primary">
                        #{rankIdx + 1}
                      </span>
                      <span className="font-bold text-muted-foreground">{g.league}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">
                        ⚡ Pulse {g.pulseScore}
                      </span>
                      <span className="rounded-full bg-live px-2 py-0.5 text-xs font-bold text-foreground animate-pulse">
                        {g.clock}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Seal t={a} size={36} />
                      <span className="font-bold text-sm">{a.seal}</span>
                    </div>
                    <div className="font-display text-3xl tabular-nums">
                      {g.as} - {g.hs}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm">{h.seal}</span>
                      <Seal t={h} size={36} />
                    </div>
                  </div>
                  {g.stats && (
                    <div className="rounded-xl bg-muted p-2.5 text-xs space-y-2">
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="text-muted-foreground">Surge Alert</span>
                        <span className="font-bold text-primary">
                          {pressureTeam.seal} {Math.abs(lastMomentum) > 8 ? "🔥 Dangerous Attack" : "Holding Shape"}
                        </span>
                      </div>
                      <div className="flex h-8 items-center gap-0.5">
                        {g.stats.momentum.map((m, i) => (
                          <div key={i} className="flex h-full flex-1 flex-col justify-center">
                            <div
                              className={m > 0 ? "rounded-t-sm bg-primary transition-all duration-300" : "invisible"}
                              style={{ height: `${Math.min(100, Math.abs(m) * 2.5)}%` }}
                            />
                            <div
                              className={m < 0 ? "rounded-b-sm bg-foreground/40 transition-all duration-300" : "invisible"}
                              style={{ height: `${Math.min(100, Math.abs(m) * 2.5)}%` }}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      ) : (
        <div className="rounded-2xl border border-dashed border-border bg-card/50 p-6 text-center">
          <Activity className="mx-auto h-8 w-8 text-muted-foreground opacity-60 mb-2" />
          <h4 className="font-semibold text-sm">
            {lang === "th" ? "ไม่มีเกมที่กำลังแข่งอยู่ขณะนี้" : "No live games in progress right now"}
          </h4>
          <p className="text-xs text-muted-foreground mt-1">
            {lang === "th"
              ? "ดูตารางถ่ายทอดสดและเวลาเตะของ Ratchaburi FC & Minnesota ด้านล่าง"
              : "Check upcoming match schedules and stadium atmospheres below"}
          </p>
        </div>
      )}

      {/* Twin Hub Pulse Cards: Ratchaburi Dragons vs. Minnesota 7 */}
      <section className="space-y-3">
        <h3 className="font-display text-xl tracking-wide flex items-center gap-2 text-primary">
          <Sparkles className="h-5 w-5" />
          {lang === "th" ? "ชีพจรสองถิ่น (TWIN HUB PULSE)" : "TWIN HUB ATMOSPHERE"}
        </h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Ratchaburi FC Hub Card */}
          <div className="rounded-2xl border border-border bg-card p-4 space-y-3 relative overflow-hidden">
            <div
              className="absolute -right-10 -bottom-10 h-36 w-36 rounded-full opacity-10 pointer-events-none"
              style={{ background: rbfc.color }}
            />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Seal t={rbfc} size={46} />
                <div>
                  <h4 className="font-display text-lg tracking-wide">{rbfc.name}</h4>
                  <p className="text-xs text-muted-foreground">{rbfc.venue}</p>
                </div>
              </div>
              <button
                onClick={() => toggleFav("rbfc")}
                className={`rounded-full p-2 text-xs font-semibold ${
                  favs.includes("rbfc") ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}
              >
                <Heart className={`h-4 w-4 ${favs.includes("rbfc") ? "fill-current" : ""}`} />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-xl bg-muted p-2.5">
                <span className="text-muted-foreground block text-[10px]">Dragon Solar Park</span>
                <span className="font-bold text-sm">
                  {dualWeather.ratchaburi ? `${Math.round(dualWeather.ratchaburi.tempC)}°C` : "32°C"} •{" "}
                  {dualWeather.ratchaburi?.humidity ?? 78}% Hum
                </span>
              </div>
              <div className="rounded-xl bg-muted p-2.5">
                <span className="text-muted-foreground block text-[10px]">Record</span>
                <span className="font-bold text-sm">{rbfc.record}</span>
              </div>
            </div>
            {rbfc.sentiment && (
              <div className="text-xs space-y-1">
                <div className="flex justify-between text-muted-foreground text-[11px]">
                  <span>Fan Mood</span>
                  <span className="font-bold text-primary">
                    {rbfc.sentiment.pct}% {rbfc.sentiment.label}
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                  <div className="h-full bg-primary" style={{ width: `${rbfc.sentiment.pct}%` }} />
                </div>
              </div>
            )}
          </div>

          {/* Minnesota Hub Card */}
          <div className="rounded-2xl border border-border bg-card p-4 space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-[#4F2683] text-[#FFC62F] font-display text-xl font-bold ring-2 ring-[#FFC62F]/40">
                  MN
                </div>
                <div>
                  <h4 className="font-display text-lg tracking-wide">Minnesota Hub (7 Teams)</h4>
                  <p className="text-xs text-muted-foreground">Vikings, Wolves, Twins, Wild, Lynx, Frost, MNUFC</p>
                </div>
              </div>
              <span className="rounded-md bg-secondary px-2 py-1 text-[11px] font-bold text-primary">
                Twin Cities
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-xl bg-muted p-2.5">
                <span className="text-muted-foreground block text-[10px]">Minneapolis Weather</span>
                <span className="font-bold text-sm">
                  {dualWeather.minnesota ? `${Math.round(dualWeather.minnesota.tempF)}°F` : "58°F"} •{" "}
                  {dualWeather.minnesota?.humidity ?? 62}% Hum
                </span>
              </div>
              <div className="rounded-xl bg-muted p-2.5">
                <span className="text-muted-foreground block text-[10px]">Next Big Showdown</span>
                <span className="font-bold text-sm">VIK @ PIT (Dublin)</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {mnTeams.map((m) => (
                <button
                  key={m.id}
                  onClick={() => toggleFav(m.id)}
                  className={`flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-semibold transition ${
                    favs.includes(m.id)
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <span className="font-bold">{m.seal}</span>
                  {favs.includes(m.id) && "✓"}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Fan Sentiment Index (Auto-sorted Positive to Negative) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-xl tracking-wide flex items-center gap-2 text-primary">
            <TrendingUp className="h-5 w-5" />
            {lang === "th" ? "ดัชนีอารมณ์แฟนคลับ (SENTIMENT PULSE)" : "FAN SENTIMENT INDEX"}
          </h3>
          <span className="text-xs text-muted-foreground font-semibold">
            {lang === "th" ? "เรียงตามความพึงพอใจ" : "Ranked by Fan Optimism"}
          </span>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {sortedSentimentTeams.map((team, rankIdx) => {
            const s = team.sentiment;
            if (!s) return null;
            const isNegative = s.label === "Frustrated" || s.label === "Anxious";
            return (
              <div key={team.id} className="rounded-xl border border-border bg-card p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-muted text-[9px] font-bold text-muted-foreground">
                      #{rankIdx + 1}
                    </span>
                    <Seal t={team} size={28} />
                    <span className="font-semibold text-xs truncate max-w-[100px]">{team.seal}</span>
                  </div>
                  <span
                    className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                      isNegative ? "bg-destructive/20 text-destructive" : "bg-primary/20 text-primary"
                    }`}
                  >
                    {s.pct}% {s.label}
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className={isNegative ? "h-full bg-destructive" : "h-full bg-primary"}
                    style={{ width: `${s.pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Upcoming Kickoff Countdown */}
      {upcomingGames.length > 0 && (
        <section className="space-y-3">
          <h3 className="font-display text-xl tracking-wide flex items-center gap-2 text-primary">
            <Zap className="h-5 w-5" />
            {lang === "th" ? "กำหนดการเตะใกล้ถึง" : "UPCOMING SCHEDULE PULSE"}
          </h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {upcomingGames.map((g) => {
              const h = teamById(g.home);
              const a = teamById(g.away);
              return (
                <div key={g.id} className="flex items-center justify-between rounded-xl border border-border bg-card p-3">
                  <div className="flex items-center gap-3">
                    <Seal t={a} size={32} />
                    <span className="text-xs font-semibold">@</span>
                    <Seal t={h} size={32} />
                    <div>
                      <div className="text-xs font-bold">
                        {a.seal} vs {h.seal}
                      </div>
                      <div className="text-[10px] text-muted-foreground">{g.league} • {g.venue}</div>
                    </div>
                  </div>
                  <div className="text-right text-xs">
                    <div className="font-bold text-primary">ICT {fmtTime(g.kickoff, "Asia/Bangkok", lang)}</div>
                    {isMN(g) && (
                      <div className="text-[10px] text-muted-foreground">
                        CT {fmtTime(g.kickoff, "America/Chicago", lang)}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}

function TeamCard({ team, fav, toggle, lang }: { team: Team; fav: boolean; toggle: () => void; lang: Lang }) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const long = useRef(false);
  const t = T[lang];
  return (
    <div
      onPointerDown={() => {
        long.current = false;
        timer.current = setTimeout(() => {
          long.current = true;
          toggle();
        }, 500);
      }}
      onPointerUp={() => timer.current && clearTimeout(timer.current)}
      onPointerLeave={() => timer.current && clearTimeout(timer.current)}
      className="select-none overflow-hidden rounded-2xl border border-border bg-card"
      style={{ backgroundImage: `linear-gradient(135deg, ${team.color}40, transparent 60%)` }}
    >
      <div className="flex items-center gap-3 p-4">
        <Seal t={team} size={52} />
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-semibold">{lang === "th" ? team.th : team.name}</h3>
          <p className="truncate text-xs text-muted-foreground">
            {team.league} • {team.record}
            {team.venue && ` • ${team.venue}`}
          </p>
        </div>
        <button
          onClick={() => {
            if (!long.current) toggle();
          }}
          aria-label="favorite"
          className={`shrink-0 rounded-full p-2 ${
            fav ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
          }`}
        >
          <Heart className={`h-4 w-4 ${fav ? "fill-current" : ""}`} />
        </button>
      </div>
      {team.notes && (
        <ul className="space-y-1 px-4 pb-3 text-xs text-muted-foreground">
          {team.notes.map((n) => (
            <li key={n}>• {n}</li>
          ))}
        </ul>
      )}
      {team.sentiment && (
        <div className="px-4 pb-4 text-xs">
          <div className="mb-1 flex justify-between">
            <span>{t.fanMood}</span>
            <b className={team.sentiment.label === "Frustrated" ? "text-destructive" : "text-primary"}>
              {team.sentiment.pct}% {team.sentiment.label}
            </b>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-muted">
            <div
              className={team.sentiment.label === "Frustrated" ? "h-full bg-destructive" : "h-full bg-primary"}
              style={{ width: `${team.sentiment.pct}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function MyTab({
  favs,
  toggle,
  addAll,
  games,
  lang,
}: {
  favs: string[];
  toggle: (id: string) => void;
  addAll: () => void;
  games: Game[];
  lang: Lang;
}) {
  const t = T[lang];
  const mine = games.filter((g) => favs.includes(g.home) || favs.includes(g.away));
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-3xl tracking-wide">
          {t.my} ({favs.length})
        </h2>
        <button onClick={addAll} className="rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground">
          ⭐ {t.addAllMN}
        </button>
      </div>
      {favs.length === 0 ? (
        <p className="text-muted-foreground">{t.empty}</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {favs.map((id) => (
            <TeamCard key={id} team={teamById(id)} fav toggle={() => toggle(id)} lang={lang} />
          ))}
        </div>
      )}
      {mine.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {mine.map((g) => (
            <GameCard key={g.id} g={g} lang={lang} />
          ))}
        </div>
      )}
    </div>
  );
}

function ExploreTab({
  hub,
  favs,
  toggle,
  addAll,
  lang,
}: {
  hub: Hub;
  favs: string[];
  toggle: (id: string) => void;
  addAll: () => void;
  lang: Lang;
}) {
  const t = T[lang];
  const [q, setQ] = useState("");
  const [sport, setSport] = useState("All");
  const [league, setLeague] = useState("All");
  const sports = ["All", ...Array.from(new Set(TEAMS.map((x) => x.sport)))];
  const match = (x: Team) => !q || `${x.name} ${x.th} ${x.seal} ${x.league}`.toLowerCase().includes(q.toLowerCase());
  const list = TEAMS.filter(
    (x) => (sport === "All" || x.sport === sport) && (league === "All" || x.league === league) && match(x)
  ).sort((a, b) => Number(b.hub === hub) - Number(a.hub === hub));
  const suggestions = q ? TEAMS.filter(match).slice(0, 5) : [];

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t.search}
          className="w-full rounded-xl border border-input bg-card py-2.5 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
        />
        {suggestions.length > 0 && (
          <div className="absolute inset-x-0 top-full z-20 mt-1 overflow-hidden rounded-xl border border-border bg-popover shadow-xl">
            {suggestions.map((s) => (
              <button
                key={s.id}
                onClick={() => {
                  if (!favs.includes(s.id)) toggle(s.id);
                  setQ("");
                }}
                className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-muted"
              >
                <Seal t={s} size={32} />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold">
                    {s.name} <span className="text-muted-foreground">{s.th}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {s.league} • {s.record}
                  </div>
                </div>
                <span className="shrink-0 rounded-md bg-primary px-2 py-0.5 text-xs font-bold text-primary-foreground">
                  {favs.includes(s.id) ? "✓" : "+ ADD"}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {sports.map((s) => (
          <Chip key={s} on={sport === s} onClick={() => setSport(s)}>
            {s}
          </Chip>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {["All", ...LEAGUES].map((l) => (
          <Chip key={l} on={league === l} onClick={() => setLeague(l)}>
            {l}
          </Chip>
        ))}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-card p-3">
        <span className="text-sm text-muted-foreground">
          <Zap className="inline h-4 w-4 text-primary" /> Long-press any card to add instantly
        </span>
        <button onClick={addAll} className="rounded-full bg-primary px-4 py-1.5 text-sm font-bold text-primary-foreground">
          ⭐ {t.addAllMN}
        </button>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((x) => (
          <TeamCard key={x.id} team={x} fav={favs.includes(x.id)} toggle={() => toggle(x.id)} lang={lang} />
        ))}
      </div>
    </div>
  );
}

function Chip({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${
        on ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
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
                  <span className="w-5 text-xs text-muted-foreground">{i + 1}</span>
                  <Seal t={x} size={30} />
                  <span className="min-w-0 flex-1 truncate text-sm font-semibold">{lang === "th" ? x.th : x.name}</span>
                  <span className="shrink-0 text-xs text-muted-foreground">{x.record}</span>
                  <button
                    onClick={() => toggle(x.id)}
                    aria-label="favorite"
                    className={favs.includes(x.id) ? "text-primary" : "text-muted-foreground"}
                  >
                    <Heart className={`h-4 w-4 ${favs.includes(x.id) ? "fill-current" : ""}`} />
                  </button>
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
  { name: "Justin Jefferson", pos: "WR", team: "vik", pts: 24.6 },
  { name: "Anthony Edwards", pos: "G", team: "wolves", pts: 41.3 },
  { name: "Napheesa Collier", pos: "F", team: "lynx", pts: 38.9 },
  { name: "Kirill Kaprizov", pos: "LW", team: "wild", pts: 12.5 },
  { name: "Dennis Murillo", pos: "FW", team: "rbfc", pts: 15.0 },
  { name: "Taylor Heise", pos: "C", team: "frost", pts: 11.0 },
];

function FantasyTab({ lang, preds }: { lang: Lang; preds: Record<string, unknown> }) {
  const t = T[lang];
  const mePts = Object.keys(preds).length * 3 + 12;
  const board = useMemo(
    () =>
      [
        { n: "Somchai 🐉", p: 48 },
        { n: "Ole from Edina", p: 41 },
        { n: "Nong Fah", p: 33 },
        { n: "SKOL_Sara", p: 27 },
        { n: lang === "th" ? "คุณ" : "You", p: mePts, me: true },
      ].sort((a, b) => b.p - a.p),
    [mePts, lang]
  );
  const total = ROSTER.reduce((s, r) => s + r.pts, 0);

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <section className="rounded-2xl border border-border bg-card p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-display text-2xl tracking-wide">
            <Users className="mr-2 inline h-5 w-5" />
            {t.roster}
          </h3>
          <span className="font-display text-3xl text-primary">{total.toFixed(1)}</span>
        </div>
        <p className="mb-3 text-xs text-muted-foreground">Week record 4-1 • Rank #2 • {t.scoring}</p>
        <ul className="space-y-2">
          {ROSTER.map((r) => (
            <li key={r.name} className="flex items-center gap-3 rounded-lg bg-muted p-2">
              <Seal t={teamById(r.team)} size={32} />
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold">{r.name}</div>
                <div className="text-xs text-muted-foreground">{r.pos}</div>
              </div>
              <b className="text-primary">{r.pts}</b>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-2xl border border-border bg-card p-4">
        <h3 className="mb-3 font-display text-2xl tracking-wide">
          <Activity className="mr-2 inline h-5 w-5" />🏆 {t.leaderboard}
        </h3>
        <ol className="space-y-2">
          {board.map((b, i) => (
            <li
              key={b.n}
              className={`flex items-center gap-3 rounded-lg p-2 ${
                b.me ? "bg-primary text-primary-foreground" : "bg-muted"
              }`}
            >
              <span className="w-6">{["🥇", "🥈", "🥉"][i] ?? i + 1}</span>
              <span className="flex-1 font-semibold">{b.n}</span>
              <b>
                {b.p} {t.points}
              </b>
            </li>
          ))}
        </ol>
        <button
          onClick={() => lineShare(`My prediction score: ${mePts} pts on Ultimate Sports OS 🏆`)}
          className="mt-4 w-full rounded-lg bg-line py-2 font-bold text-background"
        >
          LINE {t.share}
        </button>
      </section>
    </div>
  );
}
