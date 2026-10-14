import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import {
  Activity,
  Calendar,
  Clock,
  Compass,
  Flame,
  Heart,
  Radio,
  RefreshCw,
  Search,
  Share2,
  Shield,
  Sparkles,
  TrendingUp,
  Trophy,
  Users,
  Zap,
} from "lucide-react";
import {
  Game,
  Hub,
  Lang,
  Tab,
  Team,
  TEAMS,
  teamById,
  LEAGUES,
  T,
  fmtTime,
  MN_IDS,
} from "@/lib/sports-data";
import {
  ESPN_LEAGUES,
  fetchLiveESPNLeague,
  fetchDualWeather,
  UPCOMING_HUB_FIXTURES,
} from "@/lib/live-sports-api";
import { toast } from "sonner";

export const Route = createFileRoute("/")({
  component: App,
  head: () => ({
    title: "Hermetica Sports OS • Ratchaburi & Minnesota Live Hub",
    meta: [
      {
        name: "description",
        content:
          "Multi-sport operations hub: live and upcoming games, dual-clock schedules (CT & ICT), real-time weather, and fan sentiment.",
      },
      { property: "og:title", content: "Hermetica Sports OS" },
      {
        property: "og:description",
        content: "Live scores and upcoming fixtures across all major leagues.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

// Simple hook for localStorage
function useLocal<T>(key: string, initial: T): [T, (val: T | ((prev: T) => T)) => void] {
  const [val, setVal] = useState<T>(() => {
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : initial;
    } catch {
      return initial;
    }
  });
  const update = (v: T | ((prev: T) => T)) => {
    setVal((prev) => {
      const next = typeof v === "function" ? (v as (p: T) => T)(prev) : v;
      try {
        localStorage.setItem(key, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  };
  return [val, update];
}

const isMN = (g: Game) =>
  teamById(g.home).hub === "minnesota" || teamById(g.away).hub === "minnesota";

function Seal({ t, size = 40 }: { t: Team; size?: number }) {
  if (t.logo) {
    return (
      <img
        src={t.logo}
        alt={t.name}
        className="shrink-0 object-contain"
        style={{ width: size, height: size }}
        onError={(e) => {
          (e.currentTarget as HTMLElement).style.display = "none";
        }}
      />
    );
  }
  return (
    <div
      className="grid shrink-0 place-items-center rounded-xl font-display font-bold tracking-wider text-white shadow-sm"
      style={{
        width: size,
        height: size,
        backgroundColor: t.color || "#333",
        fontSize: Math.max(10, Math.floor(size * 0.3)),
        border: `2px solid ${t.accent || "#fff"}40`,
      }}
      title={t.name}
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
  const [games, setGames] = useState<Game[]>(UPCOMING_HUB_FIXTURES);
  const [liveOn, setLiveOn] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [now, setNow] = useState<Date | null>(null);
  const [dualWeather, setDualWeather] = useState<{
    ratchaburi: { tempC: number; humidity: number; windKmh: number } | null;
    minnesota: { tempF: number; humidity: number; windMph: number } | null;
  }>({ ratchaburi: null, minnesota: null });
  const t = T[lang];

  // 1-second clock ticker for live ICT & CT time
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
    const wInterval = setInterval(syncWeather, 60000);
    return () => clearInterval(wInterval);
  }, [syncWeather]);

  // Live real-time scores sync from ESPN public scoreboards
  const syncLiveScores = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const leaguePromises = Object.entries(ESPN_LEAGUES).map(([leagueKey, endpoint]) =>
        fetchLiveESPNLeague(leagueKey, endpoint)
      );
      const results = await Promise.all(leaguePromises);
      const fetchedGames = results.flat();

      setGames((prev) => {
        // Notification on favorite team score changes
        fetchedGames.forEach((newGame) => {
          const old = prev.find((g) => g.id === newGame.id);
          if (old && (old.hs !== newGame.hs || old.as !== newGame.as)) {
            if (favs.includes(newGame.home) || favs.includes(newGame.away)) {
              toast.success(
                `⚡ Score Alert: ${teamById(newGame.away).seal} ${newGame.as} - ${newGame.hs} ${
                  teamById(newGame.home).seal
                }`
              );
              navigator.vibrate?.([60, 40, 60]);
            }
          }
        });

        // Keep local upcoming hub fixtures if not returned by ESPN
        const nonEspn = prev.filter((g) => !g.id.startsWith("espn-"));
        // Strictly filter to LIVE and UPCOMING only (no FINAL games)
        const allMerged = [...fetchedGames, ...nonEspn].filter(
          (g) => g.status === "LIVE" || g.status === "UPCOMING"
        );

        const seen = new Set<string>();
        return allMerged.filter((g) => {
          if (seen.has(g.id)) return false;
          seen.add(g.id);
          return true;
        });
      });
    } catch (e) {
      console.warn("Live sports feed sync error:", e);
    } finally {
      setIsRefreshing(false);
    }
  }, [favs]);

  // Sync on startup and poll every 15 seconds
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

  const toggleFav = (id: string) => {
    const has = favs.includes(id);
    setFavs(has ? favs.filter((x) => x !== id) : [...favs, id]);
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
        <Ticker games={hubGames} lang={lang} />

        {/* Desktop Tabs */}
        <nav className="mx-auto hidden max-w-6xl gap-1 px-4 sm:flex">
          {tabs(t, lang).map(([key, label, Icon]) => (
            <button
              key={key}
              onClick={() => setTab(key as Tab)}
              className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-semibold transition ${
                tab === key
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
              {key === "pulse" && (
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-live opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-live" />
                </span>
              )}
            </button>
          ))}
        </nav>
      </header>

      {/* Main Content Area */}
      <main className="mx-auto max-w-6xl px-4 py-6 pb-28 sm:pb-12">
        {tab === "live" && (
          <LiveTab games={hubGames} lang={lang} preds={preds} setPreds={setPreds} />
        )}
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
        {tab === "my" && (
          <MyTab
            favs={favs}
            games={games}
            toggleFav={toggleFav}
            addAllMN={addAllMN}
            lang={lang}
            preds={preds}
            setPreds={setPreds}
          />
        )}
        {tab === "explore" && <ExploreTab favs={favs} toggleFav={toggleFav} lang={lang} />}
        {tab === "leagues" && (
          <LeaguesTab games={games} lang={lang} preds={preds} setPreds={setPreds} />
        )}
        {tab === "fantasy" && <FantasyTab favs={favs} lang={lang} />}
      </main>

      {/* Mobile Safe-Area Bottom Nav */}
      <nav className="fixed right-0 bottom-0 left-0 z-30 border-t border-border bg-background/95 backdrop-blur pb-safe sm:hidden">
        <div className="grid grid-cols-6">
          {tabs(t, lang).map(([key, label, Icon]) => (
            <button
              key={key}
              onClick={() => setTab(key as Tab)}
              className={`flex flex-col items-center py-2 text-[10px] font-semibold transition relative ${
                tab === key ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="mt-0.5">{label}</span>
              {key === "pulse" && (
                <span className="absolute top-1.5 right-3 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-live opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-live" />
                </span>
              )}
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}

function tabs(t: (typeof T)["en"], lang: Lang): [Tab, string, any][] {
  return [
    ["live", t.live, Radio],
    ["pulse", lang === "th" ? "ชีพจร" : "Pulse", Activity],
    ["my", t.my, Heart],
    ["explore", t.explore, Search],
    ["leagues", t.leagues, Trophy],
    ["fantasy", t.fantasy, Users],
  ];
}

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
  if (!now) return null;
  const timeOpts: Intl.DateTimeFormatOptions = {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  };
  const ict = now.toLocaleTimeString(lang === "th" ? "th-TH" : "en-US", {
    ...timeOpts,
    timeZone: "Asia/Bangkok",
  });
  const ct = now.toLocaleTimeString("en-US", {
    ...timeOpts,
    timeZone: "America/Chicago",
  });

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
      {hub === "ratchaburi" && (
        <>
          <span className="font-semibold text-foreground">Dragon Solar Park</span>
          <span>•</span>
          <span className="font-mono text-primary">ICT {ict}</span>
          <span>•</span>
          <span>
            {dualWeather.ratchaburi
              ? `${Math.round(dualWeather.ratchaburi.tempC)}°C, ${dualWeather.ratchaburi.humidity}% Hum`
              : "32°C, 78% Hum"}
          </span>
        </>
      )}
      {hub === "minnesota" && (
        <>
          <span className="font-semibold text-foreground">Twin Cities (7 Teams)</span>
          <span>•</span>
          <span className="font-mono text-primary">CT {ct}</span>
          <span>•</span>
          <span className="font-mono">ICT {ict}</span>
          <span>•</span>
          <span>
            {dualWeather.minnesota
              ? `${Math.round(dualWeather.minnesota.tempF)}°F, ${dualWeather.minnesota.humidity}% Hum`
              : "58°F, 62% Hum"}
          </span>
        </>
      )}
      {hub === "all" && (
        <>
          <span className="font-mono text-primary">CT {ct}</span>
          <span>•</span>
          <span className="font-mono text-primary">ICT {ict}</span>
          <span>•</span>
          <span>Global Sports Coverage</span>
        </>
      )}
    </div>
  );
}

function Ticker({ games, lang }: { games: Game[]; lang: Lang }) {
  const active = games.filter((g) => g.status === "LIVE" || g.status === "UPCOMING");
  if (!active.length) return null;
  return (
    <div className="overflow-hidden border-b border-border bg-card/60 py-1.5 text-xs">
      <div className="flex animate-marquee gap-8 whitespace-nowrap">
        {[...active, ...active].map((g, i) => {
          const h = teamById(g.home);
          const a = teamById(g.away);
          return (
            <div key={`${g.id}-${i}`} className="inline-flex items-center gap-2">
              <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                {g.league}
              </span>
              <span className="font-semibold">
                {a.seal} {g.status === "LIVE" ? g.as : ""}
              </span>
              <span className="text-muted-foreground">
                {g.status === "LIVE" ? (
                  <span className="font-bold text-live">● {g.clock}</span>
                ) : (
                  <span>vs</span>
                )}
              </span>
              <span className="font-semibold">
                {g.status === "LIVE" ? g.hs : ""} {h.seal}
              </span>
              {g.status === "UPCOMING" && (
                <span className="text-[11px] text-muted-foreground">
                  ({fmtTime(g.kickoff, "Asia/Bangkok", lang)})
                </span>
              )}
              {g.odds && <span className="text-[10px] text-primary/80">• {g.odds}</span>}
              <span className="text-border">|</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function GameTimes({ kickoff, lang, showDual }: { kickoff: string; lang: Lang; showDual: boolean }) {
  const ict = fmtTime(kickoff, "Asia/Bangkok", lang);
  const ct = fmtTime(kickoff, "America/Chicago", lang);
  return (
    <div className="text-right text-xs">
      <div className="font-bold text-foreground">ICT {ict}</div>
      {showDual && <div className="text-[11px] text-primary">CT {ct}</div>}
    </div>
  );
}

function calendarLinks(g: Game) {
  const h = teamById(g.home);
  const a = teamById(g.away);
  const title = `${a.name} @ ${h.name} (${g.league})`;
  const start = new Date(g.kickoff);
  const end = new Date(start.getTime() + 2.5 * 3600 * 1000);
  const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  const gcal = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
    title
  )}&dates=${fmt(start)}/${fmt(end)}&details=${encodeURIComponent(
    `Hermetica Sports OS: ${g.venue || "Stadium"}. Odds: ${g.odds || "N/A"}`
  )}&location=${encodeURIComponent(g.venue || "")}`;

  const ics =
    `data:text/calendar;charset=utf8,BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\n` +
    `SUMMARY:${title}\nDESCRIPTION:Hermetica Sports OS Match\nLOCATION:${g.venue}\n` +
    `DTSTART:${fmt(start)}\nDTEND:${fmt(end)}\nEND:VEVENT\nEND:VCALENDAR`;

  return { gcal, ics };
}

function shareCard(g: Game) {
  const h = teamById(g.home);
  const a = teamById(g.away);
  const text =
    g.status === "LIVE"
      ? `🚨 LIVE: ${a.name} ${g.as} - ${g.hs} ${h.name} (${g.clock}) on Hermetica Sports OS!`
      : `📅 UPCOMING: ${a.name} @ ${h.name} • Kickoff ${g.kickoff} • Venue: ${g.venue}`;
  if (navigator.share) {
    navigator.share({ title: "Hermetica Sports OS", text, url: window.location.href }).catch(() => {});
  } else {
    navigator.clipboard.writeText(text);
    toast.success("Match card copied to clipboard!");
  }
}

function lineShare(g: Game) {
  const h = teamById(g.home);
  const a = teamById(g.away);
  const text = `${a.name} vs ${h.name} • ${g.status === "LIVE" ? `LIVE ${g.as}-${g.hs}` : "Upcoming Match"}`;
  const url = `https://line.me/R/msg/text/?${encodeURIComponent(text + " " + window.location.href)}`;
  window.open(url, "_blank");
}

function GameCard({
  g,
  lang,
  pred,
  onPredict,
}: {
  g: Game;
  lang: Lang;
  pred?: { h: number; a: number } | undefined;
  onPredict: (h: number, a: number) => void;
}) {
  const h = teamById(g.home);
  const a = teamById(g.away);
  const t = T[lang];
  const [ph, setPh] = useState(pred ? String(pred.h) : "");
  const [pa, setPa] = useState(pred ? String(pred.a) : "");
  const { gcal, ics } = calendarLinks(g);
  const showDual = isMN(g);

  return (
    <article className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition hover:border-primary/50">
      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-border/60 bg-muted/40 px-4 py-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="rounded bg-primary/10 px-2 py-0.5 font-bold uppercase tracking-wider text-primary">
            {g.league}
          </span>
          {g.status === "LIVE" && (
            <span className="flex items-center gap-1 font-bold text-live">
              <span className="h-2 w-2 animate-pulse rounded-full bg-live" />
              LIVE {g.clock}
            </span>
          )}
          {g.status === "UPCOMING" && (
            <span className="flex items-center gap-1 font-semibold text-muted-foreground">
              <Clock className="h-3 w-3" />
              {t.next}
            </span>
          )}
        </div>
        <GameTimes kickoff={g.kickoff} lang={lang} showDual={showDual} />
      </div>

      {/* Matchup row */}
      <div className="grid grid-cols-7 items-center gap-2 p-4">
        {/* Away */}
        <div className="col-span-3 flex items-center gap-3">
          <Seal t={a} size={44} />
          <div className="min-w-0">
            <h3 className="truncate font-semibold">{lang === "th" ? a.th : a.name}</h3>
            <p className="truncate text-xs text-muted-foreground">{a.record}</p>
          </div>
        </div>

        {/* Score / Center */}
        <div className="col-span-1 text-center">
          {g.status === "LIVE" ? (
            <div className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
              {g.as} : {g.hs}
            </div>
          ) : (
            <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground">VS</div>
          )}
        </div>

        {/* Home */}
        <div className="col-span-3 flex items-center justify-end gap-3 text-right">
          <div className="min-w-0">
            <h3 className="truncate font-semibold">{lang === "th" ? h.th : h.name}</h3>
            <p className="truncate text-xs text-muted-foreground">{h.record}</p>
          </div>
          <Seal t={h} size={44} />
        </div>
      </div>

      {/* Venue & Odds */}
      {(g.venue || g.odds) && (
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/50 bg-muted/20 px-4 py-2 text-xs text-muted-foreground">
          <span className="truncate">{g.venue}</span>
          {g.odds && <span className="font-mono font-medium text-primary">{g.odds}</span>}
        </div>
      )}

      {/* SofaScore-Style Attack Momentum Bars */}
      {g.stats?.momentum && (
        <div className="border-t border-border/50 px-4 py-3">
          <div className="mb-1.5 flex justify-between text-xs text-muted-foreground">
            <span>{t.momentum}</span>
            <span>
              {a.seal} vs {h.seal}
            </span>
          </div>
          <div className="flex h-8 items-center gap-0.5 rounded bg-muted/50 p-1">
            {g.stats.momentum.map((val, i) => {
              const isH = val > 0;
              const hPct = Math.min(100, Math.abs(val) * 10);
              return (
                <div key={i} className="flex h-full flex-1 items-center justify-center">
                  <div
                    className="w-full rounded-xs transition-all"
                    style={{
                      height: `${hPct}%`,
                      backgroundColor: isH ? h.color || "#888" : a.color || "#888",
                    }}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Possession & Shots */}
      {g.stats && (
        <div className="grid grid-cols-2 gap-4 border-t border-border/50 px-4 py-2.5 text-xs">
          <div>
            <div className="mb-1 flex justify-between text-muted-foreground">
              <span>{t.possession}</span>
              <span>
                {100 - g.stats.possession}% - {g.stats.possession}%
              </span>
            </div>
            <div className="flex h-1.5 overflow-hidden rounded-full bg-muted">
              <div style={{ width: `${100 - g.stats.possession}%`, backgroundColor: a.color || "#666" }} />
              <div style={{ width: `${g.stats.possession}%`, backgroundColor: h.color || "#FF6600" }} />
            </div>
          </div>
          <div>
            <div className="mb-1 flex justify-between text-muted-foreground">
              <span>{t.shots}</span>
              <span>
                {g.stats.shotsA} - {g.stats.shotsH}
              </span>
            </div>
            <div className="flex h-1.5 overflow-hidden rounded-full bg-muted">
              <div
                style={{
                  width: `${(g.stats.shotsA / ((g.stats.shotsA + g.stats.shotsH) || 1)) * 100}%`,
                  backgroundColor: a.color || "#666",
                }}
              />
              <div
                style={{
                  width: `${(g.stats.shotsH / ((g.stats.shotsA + g.stats.shotsH) || 1)) * 100}%`,
                  backgroundColor: h.color || "#FF6600",
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Player Ratings */}
      {g.ratings && g.ratings.length > 0 && (
        <div className="border-t border-border/50 px-4 py-2.5">
          <p className="mb-1.5 text-xs text-muted-foreground">{t.ratings}</p>
          <div className="flex flex-wrap gap-2">
            {g.ratings.map((r, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/60 px-2.5 py-0.5 text-xs font-semibold"
              >
                <span>{r.name}</span>
                <span
                  className="rounded px-1 text-[10px] font-bold text-white"
                  style={{
                    backgroundColor: r.r >= 8 ? "#10B981" : r.r >= 7 ? "#3B82F6" : "#F59E0B",
                  }}
                >
                  {r.r.toFixed(1)}
                </span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Action / Prediction / Share Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/60 bg-muted/30 px-4 py-2.5 text-xs">
        {/* Prediction Input */}
        <div className="flex items-center gap-1.5">
          <span className="font-semibold text-muted-foreground">{t.predict}:</span>
          <input
            type="number"
            min="0"
            placeholder={a.seal}
            value={pa}
            onChange={(e) => setPa(e.target.value)}
            className="w-11 rounded border border-border bg-background px-1.5 py-0.5 text-center font-bold"
          />
          <span>-</span>
          <input
            type="number"
            min="0"
            placeholder={h.seal}
            value={ph}
            onChange={(e) => setPh(e.target.value)}
            className="w-11 rounded border border-border bg-background px-1.5 py-0.5 text-center font-bold"
          />
          <button
            onClick={() => {
              const hNum = parseInt(ph, 10);
              const aNum = parseInt(pa, 10);
              if (!isNaN(hNum) && !isNaN(aNum)) {
                onPredict(hNum, aNum);
                toast.success(`Prediction saved: ${a.seal} ${aNum} - ${hNum} ${h.seal}`);
              }
            }}
            className="rounded bg-primary px-2 py-0.5 font-bold text-primary-foreground hover:opacity-90"
          >
            ✓
          </button>
        </div>

        {/* Calendar & Share Actions */}
        <div className="flex items-center gap-2">
          {g.status === "UPCOMING" && (
            <>
              <a
                href={gcal}
                target="_blank"
                rel="noreferrer"
                className="rounded border border-border bg-background px-2 py-1 font-semibold hover:bg-muted"
                title="Add to Google Calendar"
              >
                +Google
              </a>
              <a
                href={ics}
                download={`${g.id}.ics`}
                className="rounded border border-border bg-background px-2 py-1 font-semibold hover:bg-muted"
                title="Download .ics Calendar"
              >
                .ics
              </a>
            </>
          )}
          <button
            onClick={() => shareCard(g)}
            className="rounded border border-border bg-background p-1.5 hover:bg-muted"
            title="Share match card"
          >
            <Share2 className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => lineShare(g)}
            className="rounded border border-border bg-[#06C755] px-2 py-1 font-bold text-white hover:opacity-90"
            title="Share via LINE"
          >
            LINE
          </button>
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
  const liveGames = games.filter((g) => g.status === "LIVE");
  const upcomingGames = [...games.filter((g) => g.status === "UPCOMING")].sort(
    (a, b) => new Date(a.kickoff).getTime() - new Date(b.kickoff).getTime()
  );

  return (
    <div className="space-y-6">
      {/* Live Now Section */}
      {liveGames.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-display text-2xl tracking-wide text-live">
              <span className="relative flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-live opacity-75" />
                <span className="relative inline-flex h-3 w-3 rounded-full bg-live" />
              </span>
              {lang === "th" ? "การแข่งขันสดตอนนี้" : "LIVE IN PLAY"}
            </h2>
            <span className="rounded-full bg-live/20 px-2.5 py-0.5 text-xs font-bold text-live">
              ● {liveGames.length} ACTIVE
            </span>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {liveGames.map((g) => (
              <GameCard
                key={g.id}
                g={g}
                lang={lang}
                pred={preds[g.id]}
                onPredict={(h, a) => setPreds({ ...preds, [g.id]: { h, a } })}
              />
            ))}
          </div>
        </section>
      )}

      {/* Upcoming Fixtures Section */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-display text-2xl tracking-wide text-primary">
            <Zap className="h-5 w-5" />
            {lang === "th" ? "กำหนดการแข่งขันถัดไป" : "UPCOMING FIXTURES"}
          </h2>
          <span className="text-xs font-semibold text-muted-foreground">
            {upcomingGames.length} {lang === "th" ? "แมตช์" : "matches scheduled"}
          </span>
        </div>
        {upcomingGames.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            {lang === "th" ? "ไม่มีการแข่งขันเร็ว ๆ นี้" : "No upcoming fixtures found for this filter."}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {upcomingGames.map((g) => (
              <GameCard
                key={g.id}
                g={g}
                lang={lang}
                pred={preds[g.id]}
                onPredict={(h, a) => setPreds({ ...preds, [g.id]: { h, a } })}
              />
            ))}
          </div>
        )}
      </section>
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

  // Pulse intensity score calculator: 0-100 based on surge & shot activity
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
      const sa = a.sentiment
        ? a.sentiment.label === "Frustrated" || a.sentiment.label === "Anxious"
          ? -a.sentiment.pct
          : a.sentiment.pct
        : 0;
      const sb = b.sentiment
        ? b.sentiment.label === "Frustrated" || b.sentiment.label === "Anxious"
          ? -b.sentiment.pct
          : b.sentiment.pct
        : 0;
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

      {/* Real-time Match Intensity Radar */}
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
                      <span className="flex items-center gap-1 font-bold text-live">
                        <span className="h-2 w-2 rounded-full bg-live animate-ping" />
                        {g.clock}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between py-1">
                    <div className="flex items-center gap-3">
                      <Seal t={a} size={40} />
                      <div>
                        <div className="font-bold">{a.seal}</div>
                        <div className="text-[10px] text-muted-foreground">{a.name}</div>
                      </div>
                    </div>
                    <div className="font-display text-2xl font-bold tracking-tight px-3 py-1 bg-muted/60 rounded-xl">
                      {g.as} : {g.hs}
                    </div>
                    <div className="flex items-center gap-3 text-right">
                      <div>
                        <div className="font-bold">{h.seal}</div>
                        <div className="text-[10px] text-muted-foreground">{h.name}</div>
                      </div>
                      <Seal t={h} size={40} />
                    </div>
                  </div>

                  {g.stats?.momentum && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] text-muted-foreground">
                        <span className="flex items-center gap-1 font-semibold text-primary">
                          <Flame className="h-3 w-3" />
                          Surge: {pressureTeam.seal}
                        </span>
                        <span>{g.stats.possession}% Poss</span>
                      </div>
                      <div className="flex h-5 items-center gap-0.5 rounded bg-muted/40 p-1">
                        {g.stats.momentum.slice(-10).map((val, idx) => {
                          const isHome = val > 0;
                          const heightPct = Math.min(100, Math.max(20, Math.abs(val) * 12));
                          return (
                            <div key={idx} className="flex h-full flex-1 items-center justify-center">
                              <div
                                className="w-full rounded-xs transition-all"
                                style={{
                                  height: `${heightPct}%`,
                                  backgroundColor: isHome ? h.color || "#888" : a.color || "#888",
                                }}
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      ) : (
        <section className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
          <Radio className="mx-auto h-6 w-6 text-muted-foreground/60 mb-2 animate-pulse" />
          <p className="font-semibold text-foreground">No matches in play at this moment</p>
          <p className="text-xs mt-1">Live scoreboard polling active — games update automatically when kickoff occurs.</p>
        </section>
      )}

      {/* Twin Hub Heartbeat */}
      <section className="space-y-3">
        <h3 className="font-display text-xl tracking-wide flex items-center gap-2 text-primary">
          <Shield className="h-5 w-5" />
          {lang === "th" ? "สัญญาณชีพสองศูนย์กลาง (TWIN HUB HEARTBEAT)" : "TWIN HUB HEARTBEAT"}
        </h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Ratchaburi FC Card */}
          <div className="rounded-2xl border border-border bg-card p-4 space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Seal t={rbfc} size={44} />
                <div>
                  <h4 className="font-display text-lg tracking-wide">{rbfc.name}</h4>
                  <p className="text-xs text-muted-foreground">{rbfc.league} • Dragon Solar Park</p>
                </div>
              </div>
              <button
                onClick={() => toggleFav("rbfc")}
                className={`rounded-full p-2 ${
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

      {/* Fan Sentiment Index */}
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
  games,
  toggleFav,
  addAllMN,
  lang,
  preds,
  setPreds,
}: {
  favs: string[];
  games: Game[];
  toggleFav: (id: string) => void;
  addAllMN: () => void;
  lang: Lang;
  preds: Record<string, { h: number; a: number }>;
  setPreds: (p: Record<string, { h: number; a: number }>) => void;
}) {
  const t = T[lang];
  const favTeams = favs.map(teamById);
  const favGames = games.filter((g) => favs.includes(g.home) || favs.includes(g.away));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl tracking-wide">{t.my}</h2>
          <p className="text-xs text-muted-foreground">
            {favTeams.length} {lang === "th" ? "ทีมที่คุณติดตาม" : "favorited teams"}
          </p>
        </div>
        <button
          onClick={addAllMN}
          className="flex items-center gap-1.5 rounded-full bg-[#4F2683] px-3.5 py-1.5 text-xs font-bold text-[#FFC62F] shadow-sm hover:opacity-90"
        >
          <Sparkles className="h-3.5 w-3.5" />
          {t.addAllMN}
        </button>
      </div>

      {favTeams.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          {t.empty}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {favTeams.map((team) => (
              <TeamCard key={team.id} team={team} fav={true} toggle={() => toggleFav(team.id)} lang={lang} />
            ))}
          </div>

          <div className="pt-4">
            <h3 className="mb-3 font-display text-xl tracking-wide">{lang === "th" ? "โปรแกรมทีมโปรด" : "Favorites Match Schedule"}</h3>
            {favGames.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                {lang === "th" ? "ไม่มีแมตช์สดหรือเร็ว ๆ นี้สำหรับทีมโปรด" : "No live or scheduled upcoming games for your favorites right now."}
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {favGames.map((g) => (
                  <GameCard
                    key={g.id}
                    g={g}
                    lang={lang}
                    pred={preds[g.id]}
                    onPredict={(h, a) => setPreds({ ...preds, [g.id]: { h, a } })}
                  />
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function ExploreTab({
  favs,
  toggleFav,
  lang,
}: {
  favs: string[];
  toggleFav: (id: string) => void;
  lang: Lang;
}) {
  const [q, setQ] = useState("");
  const [sportFilter, setSportFilter] = useState<string>("all");
  const t = T[lang];

  const sports = useMemo(() => ["all", ...Array.from(new Set(TEAMS.map((x) => x.sport)))], []);

  const results = useMemo(() => {
    const query = q.toLowerCase().trim();
    return TEAMS.filter((tm) => {
      const matchSport = sportFilter === "all" || tm.sport === sportFilter;
      const matchQ =
        !query ||
        tm.name.toLowerCase().includes(query) ||
        tm.th.toLowerCase().includes(query) ||
        tm.seal.toLowerCase().includes(query) ||
        tm.league.toLowerCase().includes(query);
      return matchSport && matchQ;
    });
  }, [q, sportFilter]);

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t.search}
          className="w-full rounded-2xl border border-border bg-card py-3 pr-4 pl-10 text-sm shadow-sm outline-none focus:border-primary"
        />
      </div>

      {/* Sport Category Pills */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {sports.map((sp) => (
          <button
            key={sp}
            onClick={() => setSportFilter(sp)}
            className={`rounded-full px-3 py-1 text-xs font-semibold capitalize whitespace-nowrap transition ${
              sportFilter === sp
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            {sp === "all" ? (lang === "th" ? "ทั้งหมด" : "All Sports") : sp}
          </button>
        ))}
      </div>

      {/* Grid of Teams */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {results.map((team) => (
          <TeamCard
            key={team.id}
            team={team}
            fav={favs.includes(team.id)}
            toggle={() => toggleFav(team.id)}
            lang={lang}
          />
        ))}
      </div>
    </div>
  );
}

function LeaguesTab({
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
  const [sel, setSel] = useState<string>("All");

  const filtered = sel === "All" ? games : games.filter((g) => g.league === sel);

  return (
    <div className="space-y-4">
      <div className="flex gap-2 overflow-x-auto pb-2">
        {["All", ...LEAGUES].map((lg) => (
          <button
            key={lg}
            onClick={() => setSel(lg)}
            className={`rounded-full px-3.5 py-1 text-xs font-bold whitespace-nowrap transition ${
              sel === lg
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            {lg}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((g) => (
          <GameCard
            key={g.id}
            g={g}
            lang={lang}
            pred={preds[g.id]}
            onPredict={(h, a) => setPreds({ ...preds, [g.id]: { h, a } })}
          />
        ))}
      </div>
    </div>
  );
}

function FantasyTab({ favs, lang }: { favs: string[]; lang: Lang }) {
  const t = T[lang];
  const roster = favs.map(teamById);

  const leaderboard = [
    { rank: 1, name: "Somchai (Bangkok)", pts: 342 },
    { rank: 2, name: "SkolVikes55 (Minneapolis)", pts: 318 },
    { rank: 3, name: "DragonFan_RB", pts: 295 },
    { rank: 4, name: "TwinCitiesHero", pts: 274 },
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border bg-card p-5">
        <h2 className="mb-1 font-display text-2xl tracking-wide">{t.roster}</h2>
        <p className="mb-4 text-xs text-muted-foreground">{t.scoring}</p>
        <div className="flex flex-wrap gap-2">
          {roster.map((tm) => (
            <span
              key={tm.id}
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-muted/60 px-3 py-1.5 text-xs font-semibold"
            >
              <Seal t={tm} size={24} />
              <span>{tm.name}</span>
            </span>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="font-display text-xl tracking-wide">{t.leaderboard}</h3>
            <p className="text-xs text-muted-foreground">Weekly Hermetica OS Fantasy League</p>
          </div>
          <button
            onClick={() => {
              const url = `https://line.me/R/msg/text/?${encodeURIComponent(
                "Join my Hermetica Sports OS Fantasy Leaderboard! " + window.location.href
              )}`;
              window.open(url, "_blank");
            }}
            className="rounded-lg bg-[#06C755] px-3 py-1 text-xs font-bold text-white hover:opacity-90"
          >
            LINE Invite
          </button>
        </div>
        <div className="space-y-2">
          {leaderboard.map((u) => (
            <div
              key={u.rank}
              className="flex items-center justify-between rounded-xl border border-border/60 bg-muted/30 px-3 py-2 text-xs"
            >
              <div className="flex items-center gap-3">
                <span className="grid h-6 w-6 place-items-center rounded-full bg-primary/20 font-bold text-primary">
                  {u.rank}
                </span>
                <span className="font-semibold">{u.name}</span>
              </div>
              <span className="font-mono font-bold text-primary">
                {u.pts} {t.points}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
