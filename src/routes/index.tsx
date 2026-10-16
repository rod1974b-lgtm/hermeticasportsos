import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Activity,
  Flame,
  Radio,
  Share2,
  Calendar,
  Sparkles,
  Trophy,
  Compass,
  Zap,
  Globe,
  Shield,
  Star,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import {
  Game,
  Team,
  Tab,
  Hub,
  Lang,
  TEAMS,
  MN_IDS,
  LEAGUES,
  T,
  teamById,
  fmtTime,
} from "@/lib/sports-data";
import {
  ESPN_LEAGUES,
  UPCOMING_HUB_FIXTURES,
  fetchLiveESPNLeague,
  fetchDualWeather,
} from "@/lib/live-sports-api";

export const Route = createFileRoute("/")({
  component: App,
});

function useLocal<T>(key: string, init: T): [T, (val: T) => void] {
  const [val, setVal] = useState<T>(() => {
    if (typeof window === "undefined") return init;
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : init;
    } catch {
      return init;
    }
  });

  const update = useCallback(
    (newVal: T) => {
      setVal(newVal);
      try {
        localStorage.setItem(key, JSON.stringify(newVal));
      } catch {
        /* ignore storage write failures */
      }
    },
    [key]
  );

  return [val, update];
}

const tabs = (t: (typeof T)["en"], lang: Lang) =>
  [
    ["live", t.live, Radio],
    ["pulse", lang === "th" ? "ชีพจรกีฬา" : "Pulse", Activity],
    ["my", t.myTeams, Star],
    ["explore", t.explore, Compass],
    ["leagues", t.leagues, Trophy],
    ["fantasy", t.fantasy, Sparkles],
  ] as const;

export default function App() {
  // Default to "all" so every user immediately sees all 60+ global and hub games
  const [hub, setHub] = useLocal<"ratchaburi" | "minnesota" | "all">("sos-hub", "all");
  const [lang, setLang] = useLocal<Lang>("sos-lang", "en");
  const [favs, setFavs] = useLocal<string[]>("sos-favs", ["rbfc", "vik", "wolves"]);
  const [preds, setPreds] = useLocal<Record<string, { h: number; a: number }>>(
    "sos-preds",
    {}
  );

  const [tab, setTab] = useState<Tab>("live");
  const [games, setGames] = useState<Game[]>(UPCOMING_HUB_FIXTURES);
  const [now, setNow] = useState(new Date());
  const [liveOn, setLiveOn] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [dualWeather, setDualWeather] = useState<{
    ratchaburi: { tempC: number; humidity: number; windKmh: number } | null;
    minnesota: { tempF: number; humidity: number; windMph: number } | null;
  }>({ ratchaburi: null, minnesota: null });

  const t = T[lang];

  // 1-second clock ticker for live ICT & CT times
  useEffect(() => {
    setNow(new Date());
    const i = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(i);
  }, []);

  // Real-time dual weather fetching
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

  // Live real-time scores sync from ESPN global scoreboards
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

        // Matchup comparator to prevent duplicate fixtures
        const isMatchupPresent = (g: Game, list: Game[]) =>
          list.some(
            (item) =>
              (item.home === g.home && item.away === g.away) ||
              (item.home === g.away && item.away === g.home)
          );

        // Discard local placeholders when real ESPN events exist for that matchup
        const nonEspn = prev
          .filter((g) => !g.id.startsWith("espn-"))
          .filter((g) => !isMatchupPresent(g, fetchedGames));

        // Strictly filter to LIVE and UPCOMING only (no FINAL games)
        const allMerged = [...fetchedGames, ...nonEspn].filter(
          (g) => g.status === "LIVE" || g.status === "UPCOMING"
        );

        // Deduplicate repeated matchups
        const seenMatchups = new Set<string>();
        return allMerged.filter((g) => {
          const key = [g.league, g.home, g.away].sort().join("::");
          if (seenMatchups.has(key)) return false;
          seenMatchups.add(key);
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

  const inHub = (g: Game) =>
    hub === "all" || teamById(g.home).hub === hub || teamById(g.away).hub === hub;
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
              <RefreshCw
                className={`h-4 w-4 ${isRefreshing ? "animate-spin text-primary" : "text-muted-foreground"}`}
              />
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
              <span
                className={`h-2 w-2 rounded-full ${liveOn ? "animate-pulse bg-live" : "bg-muted-foreground"}`}
              />
              {liveCount} LIVE
            </button>
          </div>
        </div>

        {/* Hub Switcher with crisp icons and counts */}
        <div className="mx-auto flex max-w-6xl gap-2 px-4 pb-3">
          {(
            [
              ["all", "ALL TEAMS", Globe, games.length],
              [
                "minnesota",
                "MINNESOTA HUB",
                Star,
                games.filter(
                  (g) =>
                    teamById(g.home).hub === "minnesota" ||
                    teamById(g.away).hub === "minnesota"
                ).length,
              ],
              [
                "ratchaburi",
                "RATCHABURI FC",
                Shield,
                games.filter(
                  (g) =>
                    teamById(g.home).hub === "ratchaburi" ||
                    teamById(g.away).hub === "ratchaburi"
                ).length,
              ],
            ] as const
          ).map(([h, label, Icon, count]) => (
            <button
              key={h}
              onClick={() => setHub(h)}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-wide transition sm:flex-none sm:text-sm ${
                hub === h
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="h-3.5 w-3.5 shrink-0" />
              <span>{label}</span>
              <span className="rounded-full bg-background/20 px-1.5 py-0.2 text-[10px] font-mono">
                {count}
              </span>
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
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-live opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-live" />
                </span>
              )}
            </button>
          ))}
        </nav>
      </header>

      {/* Main Content Area */}
      <main className="mx-auto max-w-6xl px-4 py-6 pb-24 sm:pb-8">
        {tab === "live" && (
          <LiveTab
            games={hubGames}
            allGames={games}
            hub={hub}
            setHub={setHub}
            lang={lang}
            preds={preds}
            setPreds={setPreds}
          />
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
            toggleFav={toggleFav}
            addAllMN={addAllMN}
            games={hubGames}
            lang={lang}
            preds={preds}
            setPreds={setPreds}
          />
        )}
        {tab === "explore" && (
          <ExploreTab favs={favs} toggleFav={toggleFav} lang={lang} />
        )}
        {tab === "leagues" && (
          <LeaguesTab
            games={games}
            lang={lang}
            preds={preds}
            setPreds={setPreds}
          />
        )}
        {tab === "fantasy" && (
          <FantasyTab preds={preds} games={hubGames} lang={lang} />
        )}
      </main>

      {/* Mobile Safe-Area Bottom Navigation */}
      <nav className="fixed right-0 bottom-0 left-0 z-40 border-t border-border bg-background/95 pb-safe backdrop-blur sm:hidden">
        <div className="grid grid-cols-6 text-center text-[10px]">
          {tabs(t, lang).map(([key, label, Icon]) => (
            <button
              key={key}
              onClick={() => setTab(key as Tab)}
              className={`relative flex flex-col items-center gap-1 py-2 ${
                tab === key ? "font-bold text-primary" : "text-muted-foreground"
              }`}
            >
              <Icon className="h-5 w-5" />
              <span>{label}</span>
              {key === "pulse" && (
                <span className="absolute top-1.5 right-2 h-2 w-2 rounded-full bg-live" />
              )}
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}

function Seal({ t, size = 36 }: { t: Team; size?: number }) {
  if (t.logo) {
    return (
      <img
        src={t.logo}
        alt={t.name}
        className="shrink-0 rounded-full object-contain shadow-sm"
        style={{ width: size, height: size }}
        onError={(e) => {
          e.currentTarget.style.display = "none";
        }}
      />
    );
  }

  return (
    <div
      className="grid shrink-0 place-items-center rounded-full font-display font-bold text-white shadow-sm"
      style={{
        width: size,
        height: size,
        backgroundColor: t.color || "#333333",
        fontSize: size * 0.36,
      }}
    >
      {t.seal}
    </div>
  );
}

function HubInfo({
  hub,
  now,
  dualWeather,
  lang,
}: {
  hub: Hub;
  now: Date;
  dualWeather: {
    ratchaburi: { tempC: number; humidity: number; windKmh: number } | null;
    minnesota: { tempF: number; humidity: number; windMph: number } | null;
  };
  lang: Lang;
}) {
  const ict = now.toLocaleTimeString("en-US", {
    timeZone: "Asia/Bangkok",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const ct = now.toLocaleTimeString("en-US", {
    timeZone: "America/Chicago",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
      {hub === "ratchaburi" && (
        <>
          <span className="font-semibold text-foreground">
            {lang === "th" ? "ดราก้อน โซลาร์ พาร์ค" : "Dragon Solar Park"}
          </span>
          <span>•</span>
          <span className="font-mono text-primary">ICT {ict}</span>
          <span>•</span>
          <span>
            {dualWeather.ratchaburi
              ? `${Math.round(dualWeather.ratchaburi.tempC)}°C, ${dualWeather.ratchaburi.humidity}% Hum`
              : "28°C, 82% Hum"}
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
          <span>Global Sports Coverage (14 Leagues)</span>
        </>
      )}
    </div>
  );
}

function Ticker({ games, lang }: { games: Game[]; lang: Lang }) {
  const active = games.filter((g) => g.status === "LIVE" || g.status === "UPCOMING");
  if (!active.length) return null;
  const tickerItems = active.length > 4 ? active : [...active, ...active];

  return (
    <div className="overflow-hidden border-b border-border bg-card/60 py-1.5 text-xs">
      <div className="flex animate-marquee gap-8 whitespace-nowrap">
        {tickerItems.map((g, i) => {
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

function GameTimes({
  kickoff,
  lang,
  showDual,
}: {
  kickoff: string;
  lang: Lang;
  showDual: boolean;
}) {
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
    `SUMMARY:${title}\nDESCRIPTION:Hermetica Sports OS Match\nLOCATION:${g.venue || ""}\n` +
    `DTSTART:${fmt(start)}\nDTEND:${fmt(end)}\nEND:VEVENT\nEND:VCALENDAR`;

  return { gcal, ics };
}

function GameCard({
  g,
  lang,
  pred,
  onPredict,
}: {
  g: Game;
  lang: Lang;
  pred?: { h: number; a: number };
  onPredict: (h: number, a: number) => void;
}) {
  const t = T[lang];
  const h = teamById(g.home);
  const a = teamById(g.away);
  const [ph, setPh] = useState(pred?.h ?? "");
  const [pa, setPa] = useState(pred?.a ?? "");
  const isMN = h.hub === "minnesota" || a.hub === "minnesota";
  const isRBFC = h.hub === "ratchaburi" || a.hub === "ratchaburi";
  const { gcal, ics } = calendarLinks(g);

  return (
    <div className="relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border bg-card p-4 shadow-sm transition hover:border-primary/50">
      {/* Card Header */}
      <div className="flex items-center justify-between border-b border-border/50 pb-2.5">
        <div className="flex items-center gap-2">
          <span className="rounded bg-muted px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            {g.league}
          </span>
          {g.status === "LIVE" ? (
            <span className="flex items-center gap-1 rounded-full bg-live/15 px-2 py-0.5 text-[11px] font-bold text-live">
              <span className="h-1.5 w-1.5 rounded-full bg-live animate-ping" />
              {g.clock}
            </span>
          ) : (
            <span className="text-[11px] text-muted-foreground">
              ⏱ {t.upcoming}
            </span>
          )}
        </div>
        <GameTimes kickoff={g.kickoff} lang={lang} showDual={isMN} />
      </div>

      {/* Matchup Teams & Score */}
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 py-4">
        {/* Away Team */}
        <div className="flex flex-col items-center text-center">
          <Seal t={a} size={48} />
          <div className="mt-2 text-sm font-bold leading-tight">
            {lang === "th" && a.th ? a.th : a.name}
          </div>
          {a.record && (
            <div className="text-[10px] text-muted-foreground">{a.record}</div>
          )}
        </div>

        {/* Score / VS Display */}
        <div className="flex flex-col items-center px-2">
          {g.status === "LIVE" ? (
            <div className="font-display text-3xl font-bold tracking-tight text-foreground">
              {g.as} : {g.hs}
            </div>
          ) : (
            <div className="font-display text-xl font-bold text-muted-foreground">
              VS
            </div>
          )}
        </div>

        {/* Home Team */}
        <div className="flex flex-col items-center text-center">
          <Seal t={h} size={48} />
          <div className="mt-2 text-sm font-bold leading-tight">
            {lang === "th" && h.th ? h.th : h.name}
          </div>
          {h.record && (
            <div className="text-[10px] text-muted-foreground">{h.record}</div>
          )}
        </div>
      </div>

      {/* Venue & Odds */}
      <div className="flex flex-wrap items-center justify-between gap-1 text-[11px] text-muted-foreground">
        <span>{g.venue || "Stadium"}</span>
        {g.odds && <span className="font-mono text-primary font-medium">{g.odds}</span>}
      </div>

      {/* In-play Stats (Momentum Bar) */}
      {g.status === "LIVE" && g.stats && (
        <div className="mt-3 space-y-1.5 border-t border-border/50 pt-2.5">
          <div className="flex justify-between text-[11px]">
            <span>Poss: {100 - g.stats.possession}%</span>
            <span className="font-semibold text-primary">Momentum Surge</span>
            <span>Poss: {g.stats.possession}%</span>
          </div>
          <div className="flex h-2 w-full gap-0.5 overflow-hidden rounded-full bg-muted">
            <div
              className="bg-primary transition-all duration-300"
              style={{ width: `${100 - g.stats.possession}%` }}
            />
            <div
              className="bg-accent transition-all duration-300"
              style={{ width: `${g.stats.possession}%` }}
            />
          </div>
        </div>
      )}

      {/* Action Footer: Prediction & Calendar Export */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-border/50 pt-3 text-xs">
        <div className="flex items-center gap-1">
          <span className="text-[11px] text-muted-foreground">{t.predict}:</span>
          <input
            type="number"
            value={pa}
            onChange={(e) => setPa(e.target.value)}
            placeholder={a.seal.slice(0, 2)}
            className="w-10 rounded border border-border bg-background px-1 py-0.5 text-center text-xs"
          />
          <span>-</span>
          <input
            type="number"
            value={ph}
            onChange={(e) => setPh(e.target.value)}
            placeholder={h.seal.slice(0, 2)}
            className="w-10 rounded border border-border bg-background px-1 py-0.5 text-center text-xs"
          />
          <button
            onClick={() => {
              if (ph !== "" && pa !== "") {
                onPredict(Number(ph), Number(pa));
                toast.success(
                  `${t.predictSaved}: ${a.seal} ${pa} - ${ph} ${h.seal}`
                );
              }
            }}
            className="rounded bg-primary px-2 py-0.5 font-bold text-primary-foreground hover:opacity-90"
          >
            ✓
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          <a
            href={gcal}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded bg-muted px-2 py-0.5 text-[11px] font-semibold text-muted-foreground hover:text-foreground"
          >
            +Google
          </a>
          <a
            href={ics}
            download={`${a.seal}-vs-${h.seal}.ics`}
            className="rounded bg-muted px-2 py-0.5 text-[11px] font-semibold text-muted-foreground hover:text-foreground"
          >
            .ics
          </a>
          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: `${a.name} vs ${h.name}`,
                  text: `Check out ${a.name} vs ${h.name} on Hermetica Sports OS! Kickoff: ${fmtTime(
                    g.kickoff,
                    "Asia/Bangkok",
                    lang
                  )}`,
                  url: window.location.href,
                });
              } else {
                navigator.clipboard.writeText(window.location.href);
                toast.success("Match link copied to clipboard");
              }
            }}
            className="rounded p-1 text-muted-foreground hover:text-foreground"
          >
            <Share2 className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => {
              const url = `https://line.me/R/msg/text/?${encodeURIComponent(
                `⚡ Hermetica Sports OS Match: ${a.name} vs ${h.name} (${g.league}) - ${fmtTime(
                  g.kickoff,
                  "Asia/Bangkok",
                  lang
                )}: ${window.location.href}`
              )}`;
              window.open(url, "_blank");
            }}
            className="rounded bg-[#06C755] px-2 py-0.5 text-[11px] font-bold text-white hover:opacity-90"
          >
            LINE
          </button>
        </div>
      </div>
    </div>
  );
}

// =========================================================================
// LIVE TAB
// =========================================================================
function LiveTab({
  games,
  allGames,
  hub,
  setHub,
  lang,
  preds,
  setPreds,
}: {
  games: Game[];
  allGames: Game[];
  hub: Hub;
  setHub: (h: Hub) => void;
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
      {liveGames.length > 0 ? (
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
      ) : (
        /* Prominent Status Banner when between match windows */
        <section className="rounded-2xl border border-border bg-gradient-to-r from-card via-card to-secondary/20 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Radio className="h-5 w-5 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-display text-lg tracking-wide">
                    {lang === "th" ? "ระบบตรวจจับแมตช์สดทำงานอยู่" : "LIVE RADAR ACTIVE"}
                  </span>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold text-muted-foreground">
                    0 IN PLAY RIGHT NOW
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {lang === "th"
                    ? "ไม่มีแมตช์แข่งอยู่ ณ ขณะนี้ — ตรวจสอบกำหนดการแข่งถัดไปด้านล่าง"
                    : "No matches actively on the pitch — next live action begins today below."}
                </p>
              </div>
            </div>

            {hub !== "all" && (
              <button
                onClick={() => setHub("all")}
                className="rounded-lg bg-primary/15 px-3 py-1.5 text-xs font-bold text-primary hover:bg-primary/25 transition"
              >
                🌐 View All Global Sports ({allGames.length})
              </button>
            )}
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
            {lang === "th"
              ? "ไม่มีการแข่งขันเร็ว ๆ นี้สำหรับตัวกรองนี้"
              : "No upcoming fixtures found for this filter."}
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
    const avgRecent =
      recent.reduce((sum, v) => sum + Math.abs(v), 0) / (recent.length || 1);
    const totalShots = (g.stats.shotsA || 0) + (g.stats.shotsH || 0);
    return Math.min(
      100,
      Math.round(maxSurge * 3.5 + avgRecent * 2.5 + Math.min(20, totalShots * 1.5))
    );
  };

  // Auto-sort live games: Highest intensity to lowest
  const sortedLiveGames = useMemo(() => {
    return games
      .filter((g) => g.status === "LIVE")
      .map((g) => ({ ...g, pulseScore: getGamePulse(g) }))
      .sort((a, b) => b.pulseScore - a.pulseScore);
  }, [games]);

  // Auto-sort fan sentiment: Positive down to frustrated
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
              <span>
                {lang === "th" ? "เรียงลำดับ: สูง → ต่ำ" : "Ranked: High → Low"}
              </span>
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
              {lang === "th"
                ? "โมเมนตัมสนามสด (IN-PLAY PRESSURE)"
                : "LIVE IN-PLAY INTENSITY"}
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
                <div
                  key={g.id}
                  className="rounded-2xl border border-border bg-card p-4 space-y-3 relative overflow-hidden"
                >
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
                          const heightPct = Math.min(
                            100,
                            Math.max(20, Math.abs(val) * 12)
                          );
                          return (
                            <div
                              key={idx}
                              className="flex h-full flex-1 items-center justify-center"
                            >
                              <div
                                className="w-full rounded-xs transition-all"
                                style={{
                                  height: `${heightPct}%`,
                                  backgroundColor: isHome
                                    ? h.color || "#888"
                                    : a.color || "#888",
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
          {lang === "th"
            ? "ไม่มีแมตช์สดที่กำลังแข่งขันในขณะนี้ — ตรวจสอบอัตราโมเมนตัมเมื่อเกมเริ่ม"
            : "No live games actively in play right now. Attack momentum bars will animate live once matches kick off."}
        </section>
      )}

      {/* Twin Hub Atmospheric Heartbeat */}
      <section className="space-y-3">
        <h3 className="font-display text-xl tracking-wide flex items-center gap-2 text-primary">
          <Activity className="h-5 w-5 text-primary" />
          {lang === "th"
            ? "สภาพแวดล้อมสนาม TWIN HUB"
            : "TWIN HUB ATMOSPHERIC HEARTBEAT"}
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Ratchaburi Hub Weather */}
          <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Seal t={rbfc} size={32} />
                <div>
                  <div className="font-bold text-sm">Dragon Solar Park</div>
                  <div className="text-[10px] text-muted-foreground">
                    Ratchaburi FC • ICT UTC+7
                  </div>
                </div>
              </div>
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">
                Home Turf
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 pt-1 text-center">
              <div className="rounded-xl bg-muted/40 p-2">
                <div className="text-[10px] text-muted-foreground">Temp</div>
                <div className="font-display text-xl font-bold text-primary">
                  {dualWeather.ratchaburi
                    ? `${Math.round(dualWeather.ratchaburi.tempC)}°C`
                    : "28°C"}
                </div>
              </div>
              <div className="rounded-xl bg-muted/40 p-2">
                <div className="text-[10px] text-muted-foreground">Humidity</div>
                <div className="font-display text-xl font-bold">
                  {dualWeather.ratchaburi?.humidity ?? 82}%
                </div>
              </div>
              <div className="rounded-xl bg-muted/40 p-2">
                <div className="text-[10px] text-muted-foreground">Wind</div>
                <div className="font-display text-xl font-bold">
                  {dualWeather.ratchaburi?.windKmh ?? 12} km/h
                </div>
              </div>
            </div>
          </div>

          {/* Minnesota Hub Weather */}
          <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-[#4F2683] grid place-items-center text-white font-bold text-xs">
                  MN
                </div>
                <div>
                  <div className="font-bold text-sm">Twin Cities Complex</div>
                  <div className="text-[10px] text-muted-foreground">
                    7 Pro Franchises • CT UTC-5
                  </div>
                </div>
              </div>
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">
                Twin Cities
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 pt-1 text-center">
              <div className="rounded-xl bg-muted/40 p-2">
                <div className="text-[10px] text-muted-foreground">Temp</div>
                <div className="font-display text-xl font-bold text-primary">
                  {dualWeather.minnesota
                    ? `${Math.round(dualWeather.minnesota.tempF)}°F`
                    : "58°F"}
                </div>
              </div>
              <div className="rounded-xl bg-muted/40 p-2">
                <div className="text-[10px] text-muted-foreground">Humidity</div>
                <div className="font-display text-xl font-bold">
                  {dualWeather.minnesota?.humidity ?? 62}%
                </div>
              </div>
              <div className="rounded-xl bg-muted/40 p-2">
                <div className="text-[10px] text-muted-foreground">Wind</div>
                <div className="font-display text-xl font-bold">
                  {dualWeather.minnesota?.windMph ?? 8} mph
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Fan Sentiment Leaderboard */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-xl tracking-wide flex items-center gap-2 text-primary">
            <Flame className="h-5 w-5 text-primary" />
            {lang === "th" ? "ดัชนีอารมณ์แฟนคลับสด" : "FAN SENTIMENT INDEX"}
          </h3>
          <span className="text-xs text-muted-foreground font-semibold">
            {lang === "th" ? "จัดอันดับ: เชิงบวก → กังวล" : "Ranked: Positive → Frustrated"}
          </span>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4">
          {sortedSentimentTeams.map((team, rankIdx) => {
            const isNegative =
              team.sentiment?.label === "Frustrated" ||
              team.sentiment?.label === "Anxious";
            return (
              <div
                key={team.id}
                className="rounded-2xl border border-border bg-card p-3.5 space-y-2 relative overflow-hidden"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/20 text-[10px] font-bold text-primary">
                      #{rankIdx + 1}
                    </span>
                    <Seal t={team} size={28} />
                    <span className="font-bold text-xs truncate max-w-[90px]">
                      {team.name}
                    </span>
                  </div>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      isNegative
                        ? "bg-destructive/15 text-destructive"
                        : "bg-primary/15 text-primary"
                    }`}
                  >
                    {team.sentiment?.pct}% {team.sentiment?.label}
                  </span>
                </div>
                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      isNegative ? "bg-destructive" : "bg-primary"
                    }`}
                    style={{ width: `${team.sentiment?.pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Upcoming Schedule Highlights */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-xl tracking-wide flex items-center gap-2 text-primary">
            <Zap className="h-5 w-5" />
            {lang === "th" ? "แมตช์ถัดไปในเรดาร์" : "UPCOMING ON RADAR"}
          </h3>
          <span className="text-xs text-muted-foreground font-semibold">
            {upcomingGames.length} scheduled
          </span>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {upcomingGames.map((g) => {
            const h = teamById(g.home);
            const a = teamById(g.away);
            return (
              <div
                key={g.id}
                className="flex items-center justify-between rounded-xl border border-border bg-card p-3 text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-bold uppercase text-muted-foreground">
                    {g.league}
                  </span>
                  <Seal t={a} size={24} />
                  <span className="font-bold">{a.seal}</span>
                  <span className="text-muted-foreground">vs</span>
                  <span className="font-bold">{h.seal}</span>
                  <Seal t={h} size={24} />
                </div>
                <div className="text-right">
                  <div className="font-semibold text-primary">
                    {fmtTime(g.kickoff, "Asia/Bangkok", lang)}
                  </div>
                  <div className="text-[10px] text-muted-foreground truncate max-w-[120px]">
                    {g.venue}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

// =========================================================================
// MY TEAMS TAB
// =========================================================================
function MyTab({
  favs,
  toggleFav,
  addAllMN,
  games,
  lang,
  preds,
  setPreds,
}: {
  favs: string[];
  toggleFav: (id: string) => void;
  addAllMN: () => void;
  games: Game[];
  lang: Lang;
  preds: Record<string, { h: number; a: number }>;
  setPreds: (p: Record<string, { h: number; a: number }>) => void;
}) {
  const t = T[lang];
  const myTeams = TEAMS.filter((tm) => favs.includes(tm.id));
  const myGames = games.filter((g) => favs.includes(g.home) || favs.includes(g.away));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl tracking-wide">{t.myTeams}</h2>
          <p className="text-xs text-muted-foreground">
            {myTeams.length} teams favorited
          </p>
        </div>
        <button
          onClick={addAllMN}
          className="rounded-lg bg-primary/20 px-3 py-1.5 text-xs font-bold text-primary hover:bg-primary/30"
        >
          {t.addAllMN}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {myTeams.map((tm) => (
          <TeamCard
            key={tm.id}
            t={tm}
            fav={favs.includes(tm.id)}
            onToggle={() => toggleFav(tm.id)}
            lang={lang}
          />
        ))}
      </div>

      <section className="space-y-3">
        <h3 className="font-display text-xl tracking-wide">{t.myUpcoming}</h3>
        {myGames.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            No games found for your favorite teams.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {myGames.map((g) => (
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

function TeamCard({
  t,
  fav,
  onToggle,
  lang,
}: {
  t: Team;
  fav: boolean;
  onToggle: () => void;
  lang: Lang;
}) {
  const [pressTimer, setPressTimer] = useState<any>(null);

  return (
    <div
      onMouseDown={() => {
        const timer = setTimeout(() => {
          onToggle();
          navigator.vibrate?.([50]);
        }, 500);
        setPressTimer(timer);
      }}
      onMouseUp={() => clearTimeout(pressTimer)}
      onTouchStart={() => {
        const timer = setTimeout(() => {
          onToggle();
          navigator.vibrate?.([50]);
        }, 500);
        setPressTimer(timer);
      }}
      onTouchEnd={() => clearTimeout(pressTimer)}
      className="group relative flex flex-col items-center justify-between rounded-2xl border border-border bg-card p-4 text-center transition hover:border-primary/40"
    >
      <button
        onClick={onToggle}
        className="absolute top-2 right-2 text-muted-foreground hover:text-primary"
      >
        <Star
          className={`h-4 w-4 ${fav ? "fill-primary text-primary" : "text-muted-foreground"}`}
        />
      </button>

      <Seal t={t} size={48} />
      <div className="mt-2 font-display text-base font-bold">
        {lang === "th" && t.th ? t.th : t.name}
      </div>
      <div className="text-[11px] text-muted-foreground">{t.sport}</div>
      {t.record && (
        <div className="mt-1 font-mono text-[11px] font-bold text-primary">
          {t.record}
        </div>
      )}
    </div>
  );
}

// =========================================================================
// EXPLORE TAB
// =========================================================================
function ExploreTab({
  favs,
  toggleFav,
  lang,
}: {
  favs: string[];
  toggleFav: (id: string) => void;
  lang: Lang;
}) {
  const [search, setSearch] = useState("");
  const [sportFilter, setSportFilter] = useState("All");

  const sports = ["All", "Football", "Basketball", "Hockey", "Baseball", "Soccer"];

  const filteredTeams = TEAMS.filter((tm) => {
    const matchesSearch =
      tm.name.toLowerCase().includes(search.toLowerCase()) ||
      tm.seal.toLowerCase().includes(search.toLowerCase()) ||
      (tm.th && tm.th.includes(search));
    const matchesSport = sportFilter === "All" || tm.sport === sportFilter;
    return matchesSearch && matchesSport;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search team, sport, or abbreviation..."
          className="w-full max-w-md rounded-xl border border-border bg-card px-4 py-2.5 text-sm focus:border-primary focus:outline-hidden"
        />
        <div className="flex gap-1.5 overflow-x-auto pb-1 text-xs">
          {sports.map((sp) => (
            <button
              key={sp}
              onClick={() => setSportFilter(sp)}
              className={`rounded-full px-3 py-1 font-semibold whitespace-nowrap transition ${
                sportFilter === sp
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {sp}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {filteredTeams.map((tm) => (
          <TeamCard
            key={tm.id}
            t={tm}
            fav={favs.includes(tm.id)}
            onToggle={() => toggleFav(tm.id)}
            lang={lang}
          />
        ))}
      </div>
    </div>
  );
}

// =========================================================================
// LEAGUES TAB
// =========================================================================
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
  const [activeLeague, setActiveLeague] = useState(LEAGUES[0]);

  const leagueGames = games.filter(
    (g) => g.league.toLowerCase() === activeLeague.toLowerCase()
  );

  return (
    <div className="space-y-6">
      <div className="flex gap-2 overflow-x-auto pb-2 text-xs">
        {LEAGUES.map((l) => (
          <button
            key={l}
            onClick={() => setActiveLeague(l)}
            className={`rounded-full px-4 py-1.5 font-bold uppercase tracking-wider whitespace-nowrap transition ${
              activeLeague === l
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            {l}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        <h3 className="font-display text-xl tracking-wide">{activeLeague} Fixtures</h3>
        {leagueGames.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            No active or upcoming fixtures currently scheduled for {activeLeague}.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {leagueGames.map((g) => (
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
    </div>
  );
}

// =========================================================================
// FANTASY TAB
// =========================================================================
function FantasyTab({
  preds,
  games,
  lang,
}: {
  preds: Record<string, { h: number; a: number }>;
  games: Game[];
  lang: Lang;
}) {
  const t = T[lang];
  const predCount = Object.keys(preds).length;

  const leaderboard = [
    { rank: 1, name: "Somchai (Ratchaburi)", pts: 1420 },
    { rank: 2, name: "SkolVikes55 (Minneapolis)", pts: 1380 },
    { rank: 3, name: "DragonFan_RB", pts: 1240 },
    { rank: 4, name: "TwinCitiesHero", pts: 1190 },
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-border bg-gradient-to-r from-card to-secondary/30 p-6 shadow-sm">
        <h2 className="font-display text-2xl tracking-wide sm:text-3xl">
          {t.fantasy}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Predict match outcomes to earn points and climb the weekly leaderboard.
        </p>

        <div className="mt-4 flex gap-4 text-center">
          <div className="rounded-2xl bg-muted/50 px-4 py-2">
            <div className="font-display text-2xl font-bold text-primary">
              {predCount}
            </div>
            <div className="text-xs text-muted-foreground">Your Predictions</div>
          </div>
          <div className="rounded-2xl bg-muted/50 px-4 py-2">
            <div className="font-display text-2xl font-bold text-accent">
              {predCount * 50}
            </div>
            <div className="text-xs text-muted-foreground">Est. Points</div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="font-display text-xl tracking-wide">{t.leaderboard}</h3>
            <p className="text-xs text-muted-foreground">
              Weekly Hermetica OS Fantasy League
            </p>
          </div>
          <button
            onClick={() => {
              const url = `https://line.me/R/msg/text/?${encodeURIComponent(
                "Join my Hermetica Sports OS Fantasy Leaderboard! " +
                  window.location.href
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
