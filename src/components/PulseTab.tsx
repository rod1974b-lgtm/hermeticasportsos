import { useState, useMemo } from "react";
import {
  Activity,
  Flame,
  Radio,
  Zap,
  ChevronDown,
  ChevronUp,
  Shield,
  Star,
  TrendingUp,
  Minus,
  TrendingDown,
  Sparkles,
} from "lucide-react";
import { Game, Team, Hub, Lang, TEAMS, teamById, fmtTime } from "@/lib/sports-data";
import {
  YearRoundPulse,
  getSortedYearRoundPulse,
  PulseTrend,
} from "@/lib/pulse-data";

interface PulseTabProps {
  games: Game[];
  hub: Hub;
  lang: Lang;
  favs: string[];
  toggleFav: (id: string) => void;
  dualWeather: {
    ratchaburi: { tempC: number; humidity: number; windKmh: number } | null;
    minnesota: { tempF: number; humidity: number; windMph: number } | null;
  };
}

export function PulseTab({
  games,
  lang,
  favs,
  dualWeather,
}: PulseTabProps) {
  const [filter, setFilter] = useState<"all" | "minnesota" | "ratchaburi" | "favs">("all");
  const [expandedTeams, setExpandedTeams] = useState<Record<string, boolean>>({});
  const [allExpanded, setAllExpanded] = useState<boolean>(false);

  const upcomingGames = games.filter((g) => g.status === "UPCOMING").slice(0, 4);
  const rbfc = teamById("rbfc");

  // In-play momentum calculation (when matches are live)
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

  const sortedLiveGames = useMemo(() => {
    return games
      .filter((g) => g.status === "LIVE")
      .map((g) => ({ ...g, pulseScore: getGamePulse(g) }))
      .sort((a, b) => b.pulseScore - a.pulseScore);
  }, [games]);

  // 365-Day Auto-Ranked Year-Round Pulse Leaderboard
  const rankedPulseTeams = useMemo(() => {
    return getSortedYearRoundPulse(filter, favs);
  }, [filter, favs]);

  const toggleExpand = (teamId: string) => {
    setExpandedTeams((prev) => ({
      ...prev,
      [teamId]: !prev[teamId],
    }));
  };

  const toggleExpandAll = () => {
    const nextState = !allExpanded;
    setAllExpanded(nextState);
    const map: Record<string, boolean> = {};
    rankedPulseTeams.forEach((t) => {
      map[t.teamId] = nextState;
    });
    setExpandedTeams(map);
  };

  const renderTrendIcon = (trend: PulseTrend) => {
    if (trend === "surging") {
      return (
        <span className="flex items-center gap-1 text-emerald-500 font-bold text-xs">
          <TrendingUp className="h-3.5 w-3.5" />
          <span>{lang === "th" ? "ขาขึ้น ↑" : "Surging ↑"}</span>
        </span>
      );
    }
    if (trend === "cooling") {
      return (
        <span className="flex items-center gap-1 text-rose-500 font-bold text-xs">
          <TrendingDown className="h-3.5 w-3.5" />
          <span>{lang === "th" ? "ชะลอตัว ↓" : "Cooling ↓"}</span>
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1 text-amber-500 font-bold text-xs">
        <Minus className="h-3.5 w-3.5" />
        <span>{lang === "th" ? "คงที่ →" : "Steady →"}</span>
      </span>
    );
  };

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
                  {lang === "th" ? "ชีพจรกีฬา 365 วัน (SPORTS PULSE)" : "YEAR-ROUND SPORTS PULSE"}
                </h2>
                <span className="rounded-full bg-primary/15 px-2.5 py-0.5 text-[10px] font-bold text-primary">
                  365 RADAR ACTIVE
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {lang === "th"
                  ? "ตรวจวัดชีพจรทีมตลอดทั้งปี: ผลงาน, บรรยากาศห้องแต่งตัว และบทสรุปความพร้อมทุกทีม"
                  : "365-day team pulse tracking: competitive form, locker room urgency, and narrative summaries"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={toggleExpandAll}
              className="rounded-lg bg-card/80 hover:bg-card px-3 py-1.5 border border-border font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <span>
                {allExpanded
                  ? lang === "th"
                    ? "ย่อทั้งหมด"
                    : "Collapse All"
                  : lang === "th"
                  ? "ขยายอ่านสรุปทั้งหมด"
                  : "Expand All Narratives"}
              </span>
            </button>
            <span className="rounded-lg bg-muted/60 px-3 py-1.5 border border-border font-semibold flex items-center gap-1.5">
              <Flame className="h-3.5 w-3.5 text-primary" />
              <span>
                {lang === "th" ? "เรียงลำดับ: สูง → ต่ำ" : "Ranked: High → Low"}
              </span>
            </span>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-4">
          <span className="text-xs font-semibold text-muted-foreground mr-1">
            {lang === "th" ? "กรองตามฮับ:" : "Filter Hub:"}
          </span>
          <button
            onClick={() => setFilter("all")}
            className={`rounded-full px-3 py-1 text-xs font-bold transition-all ${
              filter === "all"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-muted/70 hover:bg-muted text-muted-foreground"
            }`}
          >
            {lang === "th" ? "ทุกทีมในฮับ (8 ทีม)" : "All Hub Teams (8)"}
          </button>
          <button
            onClick={() => setFilter("minnesota")}
            className={`rounded-full px-3 py-1 text-xs font-bold transition-all ${
              filter === "minnesota"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-muted/70 hover:bg-muted text-muted-foreground"
            }`}
          >
            {lang === "th" ? "มินนิโซตา 7 ทีม" : "Minnesota 7 Only"}
          </button>
          <button
            onClick={() => setFilter("ratchaburi")}
            className={`rounded-full px-3 py-1 text-xs font-bold transition-all ${
              filter === "ratchaburi"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-muted/70 hover:bg-muted text-muted-foreground"
            }`}
          >
            {lang === "th" ? "ราชบุรี เอฟซี" : "Ratchaburi Hub"}
          </button>
          <button
            onClick={() => setFilter("favs")}
            className={`rounded-full px-3 py-1 text-xs font-bold transition-all flex items-center gap-1 ${
              filter === "favs"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-muted/70 hover:bg-muted text-muted-foreground"
            }`}
          >
            <Star className="h-3 w-3" />
            <span>{lang === "th" ? "ทีมโปรดของฉัน" : "My Favorites"}</span>
          </button>
        </div>
      </section>

      {/* Real-time Match Intensity Radar (Shown when matches are live) */}
      {sortedLiveGames.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-xl tracking-wide flex items-center gap-2 text-primary">
              <Radio className="h-5 w-5 animate-pulse text-live" />
              {lang === "th"
                ? "โมเมนตัมสนามสด (IN-PLAY PRESSURE)"
                : "LIVE IN-PLAY PRESSURE"}
            </h3>
            <span className="text-xs text-muted-foreground font-semibold">
              ● {sortedLiveGames.length} Active Matches
            </span>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {sortedLiveGames.map((g, rankIdx) => {
              const h = teamById(g.home);
              const a = teamById(g.away);
              return (
                <div
                  key={g.id}
                  className="rounded-2xl border border-border bg-card p-4 space-y-3"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-muted-foreground">
                      #{rankIdx + 1} {g.league}
                    </span>
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">
                      ⚡ Match Pulse {g.pulseScore}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold">{a.seal} ({g.as})</span>
                    <span className="text-xs text-live font-bold animate-pulse">{g.clock}</span>
                    <span className="font-bold">{h.seal} ({g.hs})</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 365-Day Year-Round Pulse Leaderboard with Team Paragraph Summaries */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-xl tracking-wide flex items-center gap-2 text-primary">
            <Activity className="h-5 w-5 text-primary" />
            {lang === "th"
              ? "กระดานจัดอันดับชีพจรประจำปี (YEAR-ROUND RANKINGS)"
              : "YEAR-ROUND TEAM PULSE RADAR"}
          </h3>
          <span className="text-xs text-muted-foreground font-semibold">
            {rankedPulseTeams.length} {lang === "th" ? "ทีมที่ตรวจวัด" : "Teams Monitored"}
          </span>
        </div>

        <div className="space-y-3">
          {rankedPulseTeams.map((item, idx) => {
            const team = teamById(item.teamId);
            const isExpanded = expandedTeams[item.teamId] || allExpanded;

            return (
              <div
                key={item.teamId}
                className="rounded-2xl border border-border bg-card p-4 sm:p-5 transition-all shadow-sm hover:border-primary/40 space-y-3"
              >
                {/* Header row: Rank, Crest, Name, League, Score, Trend */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-primary/15 text-xs font-bold text-primary">
                      #{idx + 1}
                    </span>
                    <div
                      className="h-10 w-10 rounded-xl grid place-items-center text-white font-bold text-xs shadow-sm"
                      style={{ backgroundColor: team?.color || "#4F2683" }}
                    >
                      {team?.seal || item.teamId.toUpperCase().slice(0, 3)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-base sm:text-lg">
                          {lang === "th" && team?.th ? team.th : item.name}
                        </span>
                        <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-bold text-muted-foreground uppercase">
                          {item.league}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground font-medium">
                        {item.phaseBadge[lang]}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <span className="font-display text-2xl sm:text-3xl font-bold text-primary">
                          {item.score}
                        </span>
                        <span className="text-xs text-muted-foreground font-bold">/100</span>
                      </div>
                      <div>{renderTrendIcon(item.trend)}</div>
                    </div>

                    <button
                      onClick={() => toggleExpand(item.teamId)}
                      className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                      aria-label="Toggle Summary"
                    >
                      {isExpanded ? (
                        <ChevronUp className="h-5 w-5" />
                      ) : (
                        <ChevronDown className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Pulse Visual Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-muted-foreground">
                    <span>{item.metric[lang]}</span>
                    <span className="font-semibold text-primary">
                      Pulse Intensity {item.score}%
                    </span>
                  </div>
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700 bg-gradient-to-r from-primary/80 to-primary"
                      style={{ width: `${item.score}%` }}
                    />
                  </div>
                </div>

                {/* Team Paragraph Narrative Summary */}
                <div className="pt-2 border-t border-border/60">
                  <p className="text-sm leading-relaxed text-foreground/90">
                    {isExpanded
                      ? item.summary[lang]
                      : `${item.summary[lang].slice(0, 160)}...`}
                  </p>

                  <button
                    onClick={() => toggleExpand(item.teamId)}
                    className="mt-2 text-xs font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    {isExpanded ? (
                      <>
                        <span>{lang === "th" ? "ย่อรายละเอียด" : "Show Less"}</span>
                        <ChevronUp className="h-3.5 w-3.5" />
                      </>
                    ) : (
                      <>
                        <span>{lang === "th" ? "อ่านบทวิเคราะห์ฉบับเต็ม" : "Read Full Outlook"}</span>
                        <ChevronDown className="h-3.5 w-3.5" />
                      </>
                    )}
                  </button>
                </div>

                {/* Catalysts & Key Insights (Visible when expanded) */}
                {isExpanded && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 bg-muted/30 rounded-xl p-3 border border-border/50 text-xs">
                    {item.catalysts.map((cat, cIdx) => (
                      <div key={cIdx} className="space-y-0.5">
                        <div className="text-[10px] font-bold text-muted-foreground uppercase">
                          {cat.label[lang]}
                        </div>
                        <div className="font-medium text-foreground">
                          {cat.value[lang]}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Twin Hub Atmospheric Heartbeat */}
      <section className="space-y-3">
        <h3 className="font-display text-xl tracking-wide flex items-center gap-2 text-primary">
          <Activity className="h-5 w-5 text-primary" />
          {lang === "th" ? "สภาพแวดล้อมสนาม TWIN HUB" : "TWIN HUB ATMOSPHERIC HEARTBEAT"}
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Ratchaburi Hub Weather */}
          <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-bold text-sm">Dragon Solar Park</div>
                <div className="text-[10px] text-muted-foreground">
                  Ratchaburi FC • ICT UTC+7
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
                  {dualWeather.ratchaburi ? `${Math.round(dualWeather.ratchaburi.tempC)}°C` : "28°C"}
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
              <div>
                <div className="font-bold text-sm">Twin Cities Complex</div>
                <div className="text-[10px] text-muted-foreground">
                  7 Pro Franchises • CT UTC-5
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
                  {dualWeather.minnesota ? `${Math.round(dualWeather.minnesota.tempF)}°F` : "58°F"}
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
                  <span className="font-bold">{a.seal}</span>
                  <span className="text-muted-foreground">vs</span>
                  <span className="font-bold">{h.seal}</span>
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
