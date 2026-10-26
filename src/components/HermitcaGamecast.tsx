import React, { useState, useMemo } from "react";
import {
  ArrowLeft,
  ChevronRight,
  Share2,
  Tv,
  Volume2,
  Maximize2,
  Minimize2,
  Shield,
  Star,
  UserPlus,
  Check,
  Zap,
  Activity,
  Flame,
  Clock,
  Compass,
  Eye,
  Layers,
  Sparkles,
  BarChart3,
  TrendingUp,
  RotateCcw,
  Play,
  Pause,
  Info,
} from "lucide-react";
import { Game, Team, Lang, teamById, TEAMS } from "@/lib/sports-data";

export interface HermitcaGamecastProps {
  game?: Game | null;
  onBack?: () => void;
  lang?: Lang;
  onSelectGame?: (game: Game) => void;
}

type SportMode = "auto" | "mlb" | "nfl" | "nba" | "soccer";

interface PlayItem {
  id: string;
  time: string;
  desc: string;
  type: "score" | "highlight" | "turnover" | "neutral";
  team: string;
}

// Built-in presets matching the exact specification requirements
const DEMO_GAMES: Record<string, Partial<Game> & { sportMode: SportMode; title: string; subtitle: string }> = {
  mlb: {
    id: "g-mlb-cin-pit",
    home: "twins",
    away: "wolves",
    league: "MLB",
    kickoff: new Date().toISOString(),
    status: "LIVE",
    hs: 4,
    as: 2,
    clock: "Bot 7th",
    venue: "Great American Ball Park",
    odds: "CIN -135 • O/U 8.5",
    sportMode: "mlb",
    title: "Pirates @ Reds",
    subtitle: "NL Central Rivalry",
  },
  nfl: {
    id: "g-nfl-kc-sea",
    home: "vik",
    away: "rbfc",
    league: "NFL",
    kickoff: new Date().toISOString(),
    status: "LIVE",
    hs: 27,
    as: 24,
    clock: "Q4 3:12",
    venue: "Lumen Field, Seattle",
    odds: "KC -2.5 • O/U 48.5",
    sportMode: "nfl",
    title: "Chiefs @ Seahawks",
    subtitle: "Interconference Clash",
  },
  nba: {
    id: "g-nba-orl-nyk",
    home: "wolves",
    away: "lynx",
    league: "NBA",
    kickoff: new Date().toISOString(),
    status: "LIVE",
    hs: 100,
    as: 109,
    clock: "Q4 0:14.1",
    venue: "Madison Square Garden",
    odds: "NYK -4.5 • O/U 218.5",
    sportMode: "nba",
    title: "Magic @ Knicks",
    subtitle: "Eastern Conference",
  },
  soccer: {
    id: "g-thai-rbfc-brutd",
    home: "rbfc",
    away: "port",
    league: "Thai League 1",
    kickoff: new Date().toISOString(),
    status: "LIVE",
    hs: 1,
    as: 1,
    clock: "67'",
    venue: "Dragon Solar Park, Ratchaburi",
    odds: "RBFC +120 • D +230 • BUR +210",
    sportMode: "soccer",
    title: "Ratchaburi FC vs Buriram United",
    subtitle: "Thai League 1 Super Match",
  },
};

export function HermitcaGamecast({
  game: propGame,
  onBack,
  lang: initialLang = "en",
  onSelectGame,
}: HermitcaGamecastProps) {
  const [lang, setLang] = useState<Lang>(initialLang);
  const [selectedDemoKey, setSelectedDemoKey] = useState<string>("nfl");
  const [activeTab, setActiveTab] = useState<"field" | "plays" | "stats" | "probability">("field");

  // MLB Specific State
  const [mlbView, setMlbView] = useState<"batter" | "field">("batter");
  const [is3DMode, setIs3DMode] = useState<boolean>(true);
  const [selectedPitch, setSelectedPitch] = useState<number>(3);

  // NFL Specific State
  const [followedPlayers, setFollowedPlayers] = useState<Record<string, boolean>>({
    "jaxon-11": true,
    "darnold-14": false,
  });

  // NBA Specific State
  const [isPipOpen, setIsPipOpen] = useState<boolean>(false);
  const [selectedPin, setSelectedPin] = useState<string | null>("steal-47");

  // Share Feedback State
  const [shareToast, setShareToast] = useState<string | null>(null);

  // Determine current active game data
  const currentGame = useMemo(() => {
    if (propGame) return propGame;
    const demo = DEMO_GAMES[selectedDemoKey] || DEMO_GAMES.nfl;
    return {
      id: demo.id || "demo-game",
      home: demo.home || "vik",
      away: demo.away || "rbfc",
      league: demo.league || "NFL",
      kickoff: demo.kickoff || new Date().toISOString(),
      status: demo.status || "LIVE",
      hs: demo.hs ?? 27,
      as: demo.as ?? 24,
      clock: demo.clock || "Q4 3:12",
      venue: demo.venue || "Lumen Field",
      odds: demo.odds || "EVEN",
      stats: {
        possession: 54,
        shotsH: 14,
        shotsA: 11,
        momentum: [52, 48, 65, 59, 72, 80, 68, 77, 85],
      },
    } as Game;
  }, [propGame, selectedDemoKey]);

  // Determine active sport mode
  const currentSport = useMemo<SportMode>(() => {
    const l = (currentGame.league || "").toUpperCase();
    if (l.includes("MLB") || l.includes("BASEBALL")) return "mlb";
    if (l.includes("NFL") || l.includes("FOOTBALL")) return "nfl";
    if (l.includes("NBA") || l.includes("WNBA") || l.includes("BASKETBALL")) return "nba";
    if (
      l.includes("THAI") ||
      l.includes("SOCCER") ||
      l.includes("MLS") ||
      l.includes("PREMIER") ||
      currentGame.home === "rbfc" ||
      currentGame.away === "rbfc"
    ) {
      return "soccer";
    }
    return "soccer";
  }, [currentGame]);

  const homeTeam = teamById(currentGame.home);
  const awayTeam = teamById(currentGame.away);

  const toggleFollow = (id: string) => {
    setFollowedPlayers((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const showShareFeedback = (msg: string) => {
    setShareToast(msg);
    setTimeout(() => setShareToast(null), 2500);
  };

  return (
    <div className="w-full min-h-screen bg-[#0A1F1C] text-white font-sans selection:bg-[#00FF88] selection:text-black pb-24">
      {/* Toast Alert */}
      {shareToast && (
        <div className="fixed top-4 right-4 z-50 bg-[#00FF88] text-black font-semibold text-xs px-4 py-2.5 rounded-full shadow-2xl flex items-center gap-2 border border-white/40 animate-in fade-in slide-in-from-top-2">
          <Check className="w-4 h-4" />
          <span>{shareToast}</span>
        </div>
      )}

      {/* TOP TICKER & NAV BAR */}
      <header className="sticky top-0 z-40 bg-[#0A1F1C]/95 backdrop-blur-md border-b border-white/10 px-4 py-3">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Back & Title */}
          <div className="flex items-center gap-3">
            {onBack ? (
              <button
                onClick={onBack}
                className="cursor-pointer px-3 py-1.5 rounded-lg bg-white/5 hover:bg-[#00FF88]/20 border border-white/10 hover:border-[#00FF88]/40 transition text-xs flex items-center gap-1.5 text-[#00FF88] font-medium"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{lang === "th" ? "กลับไปที่ผลสด" : "Back to Games"}</span>
              </button>
            ) : null}

            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#00FF88] animate-ping" />
              <span className="font-mono text-xs font-bold tracking-widest text-[#00FF88] uppercase">
                HERMITCA GAMECAST
              </span>
              <span className="hidden sm:inline text-xs text-white/40">•</span>
              <span className="hidden sm:inline text-xs text-white/70 font-semibold uppercase">
                {currentSport.toUpperCase()} BEST-OF-BREED
              </span>
            </div>
          </div>

          {/* Quick Archetype Switchers */}
          <div className="flex items-center gap-1.5 bg-black/40 p-1 rounded-xl border border-white/10 overflow-x-auto max-w-full">
            <span className="text-[10px] text-white/40 uppercase font-mono px-2 hidden md:inline">
              Archetypes:
            </span>
            <button
              onClick={() => setSelectedDemoKey("mlb")}
              className={`cursor-pointer px-2.5 py-1 rounded-lg text-xs font-semibold transition whitespace-nowrap ${
                selectedDemoKey === "mlb"
                  ? "bg-[#00FF88] text-black shadow-lg shadow-[#00FF88]/20"
                  : "text-white/70 hover:text-white hover:bg-white/5"
              }`}
            >
              ⚾ MLB Gameday
            </button>
            <button
              onClick={() => setSelectedDemoKey("nfl")}
              className={`cursor-pointer px-2.5 py-1 rounded-lg text-xs font-semibold transition whitespace-nowrap ${
                selectedDemoKey === "nfl"
                  ? "bg-[#00FF88] text-black shadow-lg shadow-[#00FF88]/20"
                  : "text-white/70 hover:text-white hover:bg-white/5"
              }`}
            >
              🏈 NFL ESPN Drive
            </button>
            <button
              onClick={() => setSelectedDemoKey("nba")}
              className={`cursor-pointer px-2.5 py-1 rounded-lg text-xs font-semibold transition whitespace-nowrap ${
                selectedDemoKey === "nba"
                  ? "bg-[#00FF88] text-black shadow-lg shadow-[#00FF88]/20"
                  : "text-white/70 hover:text-white hover:bg-white/5"
              }`}
            >
              🏀 NBA 365Scores
            </button>
            <button
              onClick={() => setSelectedDemoKey("soccer")}
              className={`cursor-pointer px-2.5 py-1 rounded-lg text-xs font-semibold transition whitespace-nowrap ${
                selectedDemoKey === "soccer"
                  ? "bg-[#00FF88] text-black shadow-lg shadow-[#00FF88]/20"
                  : "text-white/70 hover:text-white hover:bg-white/5"
              }`}
            >
              ⚽ Thai Ratchaburi Pitch
            </button>
          </div>

          {/* Language Toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setLang(lang === "en" ? "th" : "en")}
              className="cursor-pointer px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/15 text-xs font-mono font-medium text-white transition flex items-center gap-1.5"
            >
              <Compass className="w-3.5 h-3.5 text-[#00FF88]" />
              <span>{lang === "en" ? "TH / ไทย" : "EN"}</span>
            </button>
          </div>
        </div>
      </header>

      {/* TOP LIVE SCORE BANNER */}
      <section className="bg-gradient-to-b from-[#0F2E29] to-[#0A1F1C] border-b border-white/10 px-4 py-5">
        <div className="max-w-7xl mx-auto">
          {/* League, Status, Venue & Broadcast Chips */}
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4 text-xs">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full bg-[#00FF88]/15 border border-[#00FF88]/40 text-[#00FF88] font-mono font-bold uppercase text-[11px]">
                {currentGame.league} • {currentGame.clock}
              </span>
              <span className="text-white/60 text-[11px] flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {currentGame.venue}
              </span>
            </div>

            {/* Broadcast Badges */}
            <div className="flex items-center gap-1.5">
              {currentSport === "soccer" ? (
                <>
                  <span className="cursor-pointer px-2 py-0.5 rounded bg-blue-600/30 text-blue-300 border border-blue-500/40 text-[10px] font-bold">
                    TrueVisions NOW Ch98
                  </span>
                  <span className="cursor-pointer px-2 py-0.5 rounded bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold">
                    AIS PLAY
                  </span>
                </>
              ) : currentSport === "nba" ? (
                <>
                  <span className="cursor-pointer px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold flex items-center gap-1">
                    <Tv className="w-2.5 h-2.5" /> NBA League Pass
                  </span>
                  <span className="cursor-pointer px-2 py-0.5 rounded bg-white/10 text-white/80 text-[10px] font-mono">
                    SUN OCT 25 Q4:14.1
                  </span>
                </>
              ) : currentSport === "nfl" ? (
                <>
                  <span className="cursor-pointer px-2 py-0.5 rounded bg-red-600/30 text-red-300 border border-red-500/40 text-[10px] font-bold">
                    ESPN Gamecast
                  </span>
                  <span className="cursor-pointer px-2 py-0.5 rounded bg-white/10 text-white/80 text-[10px] font-mono">
                    KC 24 @ SEA 27
                  </span>
                </>
              ) : (
                <>
                  <span className="cursor-pointer px-2 py-0.5 rounded bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 text-[10px] font-bold">
                    MLB Gameday 3D
                  </span>
                  <span className="cursor-pointer px-2 py-0.5 rounded bg-white/10 text-white/80 text-[10px] font-mono">
                    Statcast Live
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Big Score Header */}
          <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-6 bg-[#071816]/70 p-5 rounded-2xl border border-white/10 backdrop-blur-md">
            {/* Away Team */}
            <div className="flex items-center justify-start md:justify-end gap-4 cursor-pointer hover:opacity-90 transition">
              <div className="text-left md:text-right">
                <div className="text-sm md:text-base font-bold text-white flex items-center gap-2 md:justify-end">
                  <span>{currentSport === "mlb" ? "Pittsburgh Pirates" : currentSport === "nfl" ? "Kansas City Chiefs" : currentSport === "nba" ? "Orlando Magic" : awayTeam.name}</span>
                </div>
                <div className="text-xs text-white/50 font-mono">
                  {currentSport === "mlb" ? "76-86 • NL Central" : currentSport === "nfl" ? "11-3 • AFC West" : currentSport === "nba" ? "47-35 • 5th East" : awayTeam.record}
                </div>
              </div>
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-lg text-white shadow-xl border border-white/20"
                style={{ backgroundColor: currentSport === "nfl" ? "#E31837" : currentSport === "nba" ? "#0077C0" : awayTeam.color }}
              >
                {currentSport === "mlb" ? "PIT" : currentSport === "nfl" ? "KC" : currentSport === "nba" ? "ORL" : awayTeam.seal}
              </div>
              <div className="text-3xl md:text-4xl font-black font-mono tracking-tight text-white/95">
                {currentSport === "mlb" ? 2 : currentSport === "nfl" ? 24 : currentSport === "nba" ? 109 : currentGame.as}
              </div>
            </div>

            {/* Center Status / Clock / Situational Pill */}
            <div className="flex flex-col items-center justify-center text-center px-2 py-1">
              <div className="text-xs font-mono font-bold text-[#00FF88] px-3 py-1 rounded-full bg-[#00FF88]/10 border border-[#00FF88]/30 mb-1 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#00FF88] animate-pulse" />
                {currentGame.clock} • {currentSport === "nfl" ? "1st & 10 at KC 20" : currentSport === "mlb" ? "Balls 3 • Strikes 2 • Outs 2" : "ACTIVE PLAY"}
              </div>
              <div className="text-[11px] text-white/40 font-mono">
                {currentGame.odds}
              </div>
            </div>

            {/* Home Team */}
            <div className="flex items-center justify-end md:justify-start gap-4 cursor-pointer hover:opacity-90 transition">
              <div className="text-3xl md:text-4xl font-black font-mono tracking-tight text-[#00FF88]">
                {currentSport === "mlb" ? 4 : currentSport === "nfl" ? 27 : currentSport === "nba" ? 100 : currentGame.hs}
              </div>
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-lg text-white shadow-xl border border-white/20"
                style={{ backgroundColor: currentSport === "nfl" ? "#002244" : currentSport === "nba" ? "#006BB6" : currentSport === "soccer" ? "#FF6600" : homeTeam.color }}
              >
                {currentSport === "mlb" ? "CIN" : currentSport === "nfl" ? "SEA" : currentSport === "nba" ? "NYK" : homeTeam.seal}
              </div>
              <div className="text-left">
                <div className="text-sm md:text-base font-bold text-white flex items-center gap-2">
                  <span>{currentSport === "mlb" ? "Cincinnati Reds" : currentSport === "nfl" ? "Seattle Seahawks" : currentSport === "nba" ? "New York Knicks" : homeTeam.name}</span>
                </div>
                <div className="text-xs text-white/50 font-mono">
                  {currentSport === "mlb" ? "82-80 • NL Central" : currentSport === "nfl" ? "10-4 • NFC West" : currentSport === "nba" ? "50-32 • 2nd East" : homeTeam.record}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SUB-NAV TABS */}
      <nav className="bg-[#0A1F1C] border-b border-white/10 px-4">
        <div className="max-w-7xl mx-auto flex items-center gap-4 overflow-x-auto py-2.5">
          <button
            onClick={() => setActiveTab("field")}
            className={`cursor-pointer flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === "field"
                ? "bg-[#00FF88] text-black shadow-md shadow-[#00FF88]/20"
                : "text-white/60 hover:text-white hover:bg-white/5"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{currentSport === "mlb" ? "Gameday Strike Zone" : currentSport === "nfl" ? "Field & Drive" : currentSport === "nba" ? "365 Court" : "Pitch View"}</span>
          </button>
          <button
            onClick={() => setActiveTab("plays")}
            className={`cursor-pointer flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === "plays"
                ? "bg-[#00FF88] text-black shadow-md shadow-[#00FF88]/20"
                : "text-white/60 hover:text-white hover:bg-white/5"
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>{lang === "th" ? "เพลย์ต่อเพลย์" : "Play-by-Play"}</span>
          </button>
          <button
            onClick={() => setActiveTab("stats")}
            className={`cursor-pointer flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === "stats"
                ? "bg-[#00FF88] text-black shadow-md shadow-[#00FF88]/20"
                : "text-white/60 hover:text-white hover:bg-white/5"
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>{lang === "th" ? "สถิติทีมและ xG" : "Box Score & Stats"}</span>
          </button>
          <button
            onClick={() => setActiveTab("probability")}
            className={`cursor-pointer flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === "probability"
                ? "bg-[#00FF88] text-black shadow-md shadow-[#00FF88]/20"
                : "text-white/60 hover:text-white hover:bg-white/5"
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{lang === "th" ? "โมเดลโอกาสชนะ" : "Win Probability"}</span>
          </button>
        </div>
      </nav>

      {/* MAIN CONTENT AREA */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT 8 COLS: PRIMARY SPORT VISUALIZER */}
          <div className="lg:col-span-8 space-y-6">
            {/* SPORT SPECIFIC VISUALIZER */}
            {currentSport === "mlb" && (
              <MLBVisualizer
                view={mlbView}
                setView={setMlbView}
                is3D={is3DMode}
                setIs3D={setIs3DMode}
                selectedPitch={selectedPitch}
                setSelectedPitch={setSelectedPitch}
                lang={lang}
              />
            )}

            {currentSport === "nfl" && (
              <NFLVisualizer
                followedPlayers={followedPlayers}
                toggleFollow={toggleFollow}
                lang={lang}
              />
            )}

            {currentSport === "nba" && (
              <NBAVisualizer
                isPipOpen={isPipOpen}
                setIsPipOpen={setIsPipOpen}
                selectedPin={selectedPin}
                setSelectedPin={setSelectedPin}
                onSelectGame={onSelectGame}
                lang={lang}
              />
            )}

            {currentSport === "soccer" && (
              <SoccerVisualizer
                lang={lang}
                homeTeam={homeTeam}
                awayTeam={awayTeam}
                showShareFeedback={showShareFeedback}
              />
            )}

            {/* TAB-DEPENDENT SUPPLEMENTARY PANEL */}
            {activeTab === "plays" && (
              <PlayByPlayPanel sport={currentSport} lang={lang} />
            )}

            {activeTab === "stats" && (
              <StatsPanel sport={currentSport} lang={lang} />
            )}

            {activeTab === "probability" && (
              <WinProbPanel sport={currentSport} lang={lang} />
            )}
          </div>

          {/* RIGHT 4 COLS: UNIVERSAL PREDICTOR DONUT & STATS WIDGETS */}
          <div className="lg:col-span-4 space-y-6">
            {/* UNIVERSAL MATCHUP PREDICTOR DONUT */}
            <MatchupPredictorDonut
              currentSport={currentSport}
              lang={lang}
              onShare={showShareFeedback}
            />

            {/* 365SCORES SCOREBOARD FEED LIST (FOR NBA OR MULTI-GAMES) */}
            <SideScoreboardList
              activeSport={currentSport}
              onSelectDemo={setSelectedDemoKey}
              lang={lang}
            />

            {/* VENUE & WEATHER PULSE */}
            <div className="bg-[#0D2421] rounded-2xl p-4 border border-white/10">
              <div className="text-xs font-mono font-bold text-white/50 uppercase tracking-wider mb-2 flex items-center justify-between">
                <span>{lang === "th" ? "สภาพสนามและบรรยากาศ" : "Atmospheric Conditions"}</span>
                <Compass className="w-3.5 h-3.5 text-[#00FF88]" />
              </div>
              <div className="text-sm font-semibold text-white">
                {currentGame.venue}
              </div>
              <div className="text-xs text-white/60 mt-1 flex items-center gap-3">
                <span>🌡️ 29°C / 84°F</span>
                <span>💧 62% Humidity</span>
                <span>💨 8 mph Wind</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

/* =========================================================================
 * 1. MLB GAMEDAY + ESPN LAYER COMPONENT
 * ========================================================================= */
function MLBVisualizer({
  view,
  setView,
  is3D,
  setIs3D,
  selectedPitch,
  setSelectedPitch,
  lang,
}: {
  view: "batter" | "field";
  setView: (v: "batter" | "field") => void;
  is3D: boolean;
  setIs3D: React.Dispatch<React.SetStateAction<boolean>>;
  selectedPitch: number;
  setSelectedPitch: (p: number) => void;
  lang: Lang;
}) {
  return (
    <div className="bg-[#0D2421] rounded-2xl p-5 border border-white/10 relative overflow-hidden shadow-2xl">
      {/* Header bar: Pitcher vs Batter + Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/10">
        <div>
          <div className="text-xs font-mono text-[#00FF88] uppercase tracking-wider">
            MLB GAMEDAY 3D STATCAST
          </div>
          <div className="text-sm font-bold text-white flex items-center gap-2">
            <span>Bailey Falter LHP • 24P</span>
            <span className="text-white/40">vs</span>
            <span className="text-amber-300">Jonathan India 2B</span>
          </div>
          <div className="text-xs text-white/50">
            On Deck: <span className="text-white/80 font-medium">Elly De La Cruz SS</span>
          </div>
        </div>

        {/* View toggles */}
        <div className="flex items-center gap-2">
          <div className="bg-black/40 p-1 rounded-lg border border-white/10 flex items-center">
            <button
              onClick={() => setView("batter")}
              className={`cursor-pointer px-2 py-1 rounded text-xs font-semibold transition ${
                view === "batter" ? "bg-[#00FF88] text-black" : "text-white/60 hover:text-white"
              }`}
            >
              Batter
            </button>
            <button
              onClick={() => setView("field")}
              className={`cursor-pointer px-2 py-1 rounded text-xs font-semibold transition ${
                view === "field" ? "bg-[#00FF88] text-black" : "text-white/60 hover:text-white"
              }`}
            >
              Field
            </button>
          </div>
          <button
            onClick={() => setIs3D(!is3D)}
            className={`cursor-pointer px-2.5 py-1 rounded-lg text-xs font-bold border transition ${
              is3D
                ? "bg-purple-600/30 border-purple-400 text-purple-200"
                : "bg-white/5 border-white/15 text-white/60"
            }`}
          >
            {is3D ? "3D ON" : "3D OFF"}
          </button>
        </div>
      </div>

      {/* ESPN COUNT DOTS BAR */}
      <div className="flex items-center justify-between py-3 px-4 my-3 bg-black/30 rounded-xl border border-white/5">
        <div className="flex items-center gap-6 text-xs font-mono">
          <div className="flex items-center gap-1.5">
            <span className="text-white/50">BALLS</span>
            <div className="flex gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#00FF88]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#00FF88]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#00FF88]" />
              <span className="w-2.5 h-2.5 rounded-full bg-white/20" />
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-white/50">STRIKES</span>
            <div className="flex gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FF3366]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#FF3366]" />
              <span className="w-2.5 h-2.5 rounded-full bg-white/20" />
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-white/50">OUTS</span>
            <div className="flex gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <span className="w-2.5 h-2.5 rounded-full bg-white/20" />
            </div>
          </div>
        </div>

        <div className="text-xs text-white/70 font-mono">
          Inning: <span className="text-white font-bold">Bot 7th • 2 On, 2 Out</span>
        </div>
      </div>

      {/* MAIN GRAPHIC CANVAS: 9-BOX STRIKE ZONE + PURPLE TRAILS OR ISOMETRIC DIAMOND */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        {/* Strike Zone SVG (Batter view) */}
        <div className="md:col-span-7 bg-[#071714] p-4 rounded-xl border border-white/10 relative flex flex-col items-center justify-center min-h-[280px]">
          <div className="absolute top-2 left-3 text-[10px] font-mono text-white/40">
            {view === "batter" ? "CATCHER PERSPECTIVE • 9-BOX ZONE" : "FIELD PERSPECTIVE"}
          </div>

          <svg viewBox="0 0 300 240" className="w-full max-w-[280px] h-auto overflow-visible">
            {/* Home Plate */}
            <polygon
              points="110,215 190,215 205,225 150,238 95,225"
              fill="#FFFFFF"
              stroke="#666"
              strokeWidth="2"
              opacity="0.85"
            />

            {/* 3D Purple Pitch Trails */}
            <path
              d="M 150,20 Q 140,90 125,125"
              fill="none"
              stroke="#A855F7"
              strokeWidth="3.5"
              strokeDasharray="4 3"
              opacity="0.9"
            />
            <path
              d="M 150,20 Q 165,110 190,165"
              fill="none"
              stroke="#A855F7"
              strokeWidth="3.5"
              strokeDasharray="4 3"
              opacity="0.9"
            />
            <path
              d="M 150,20 Q 145,100 160,110"
              fill="none"
              stroke="#A855F7"
              strokeWidth="4"
              opacity="0.95"
            />

            {/* 9-Box Strike Zone Grid (Outer border) */}
            <rect
              x="90"
              y="60"
              width="120"
              height="140"
              fill="#0E2823"
              fillOpacity="0.6"
              stroke="#00FF88"
              strokeWidth="2.5"
              rx="4"
            />
            {/* Grid Lines */}
            <line x1="130" y1="60" x2="130" y2="200" stroke="#00FF88" strokeWidth="1" strokeOpacity="0.4" />
            <line x1="170" y1="60" x2="170" y2="200" stroke="#00FF88" strokeWidth="1" strokeOpacity="0.4" />
            <line x1="90" y1="106" x2="210" y2="106" stroke="#00FF88" strokeWidth="1" strokeOpacity="0.4" />
            <line x1="90" y1="153" x2="210" y2="153" stroke="#00FF88" strokeWidth="1" strokeOpacity="0.4" />

            {/* Pitch 1: Red (Strike Looking) */}
            <circle
              cx="125"
              cy="125"
              r="11"
              fill="#FF3366"
              stroke="#FFF"
              strokeWidth="2"
              className="cursor-pointer hover:scale-125 transition"
              onClick={() => setSelectedPitch(1)}
            />
            <text x="125" y="129" fill="#FFF" fontSize="10" fontWeight="bold" textAnchor="middle">
              1
            </text>

            {/* Pitch 2: Green (Ball Low Outside) */}
            <circle
              cx="225"
              cy="185"
              r="11"
              fill="#00FF88"
              stroke="#FFF"
              strokeWidth="2"
              className="cursor-pointer hover:scale-125 transition"
              onClick={() => setSelectedPitch(2)}
            />
            <text x="225" y="189" fill="#000" fontSize="10" fontWeight="bold" textAnchor="middle">
              2
            </text>

            {/* Pitch 3: Blue (In Play - Sac Fly) */}
            <circle
              cx="160"
              cy="110"
              r="13"
              fill="#00E5FF"
              stroke="#FFF"
              strokeWidth="2.5"
              className="cursor-pointer animate-pulse hover:scale-125 transition"
              onClick={() => setSelectedPitch(3)}
            />
            <text x="160" y="114" fill="#000" fontSize="11" fontWeight="black" textAnchor="middle">
              3
            </text>
          </svg>

          <div className="flex items-center gap-4 text-[10px] font-mono mt-1">
            <span className="flex items-center gap-1 text-[#FF3366]">● 1: Strike Looking</span>
            <span className="flex items-center gap-1 text-[#00FF88]">● 2: Ball Outside</span>
            <span className="flex items-center gap-1 text-[#00E5FF]">● 3: In Play</span>
          </div>
        </div>

        {/* Isometric Diamond & Play Detail (ESPN Layer) */}
        <div className="md:col-span-5 space-y-3">
          {/* Diamond graphic with arc to RF */}
          <div className="bg-[#071714] p-3 rounded-xl border border-white/10 flex flex-col items-center">
            <div className="text-[10px] font-mono text-white/50 mb-1">
              ISOMETRIC DIAMOND • HIT TRAJECTORY
            </div>
            <svg viewBox="0 0 200 160" className="w-full max-w-[200px] h-auto">
              {/* Field Grass */}
              <path d="M 100,140 L 170,70 L 100,10 L 30,70 Z" fill="#0B2620" stroke="#1D4B3E" strokeWidth="1.5" />
              {/* Infield dirt */}
              <polygon points="100,130 145,85 100,40 55,85" fill="#1C382F" />
              {/* Bases */}
              <rect x="140" y="80" width="10" height="10" fill="#FFF" transform="rotate(45 145 85)" />
              <rect x="95" y="35" width="10" height="10" fill="#00FF88" transform="rotate(45 100 40)" />
              <rect x="50" y="80" width="10" height="10" fill="#FFF" transform="rotate(45 55 85)" />
              <polygon points="96,132 104,132 100,138" fill="#FFF" />

              {/* Batted-ball arc to Right Field (RF) */}
              <path
                d="M 100,130 Q 140,60 165,45"
                fill="none"
                stroke="#00E5FF"
                strokeWidth="2.5"
                strokeDasharray="3 2"
              />
              <circle cx="165" cy="45" r="4.5" fill="#00E5FF" />
              <text x="165" y="35" fill="#00E5FF" fontSize="9" fontWeight="bold" textAnchor="middle">
                RF (Catch)
              </text>
            </svg>
          </div>

          {/* Sac Fly Play Card */}
          <div className="bg-black/40 p-3.5 rounded-xl border border-[#00E5FF]/30">
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-8 h-8 rounded-full bg-[#00E5FF]/20 border border-[#00E5FF] flex items-center justify-center text-xs font-bold text-[#00E5FF]">
                JI
              </div>
              <div>
                <div className="text-xs font-bold text-white">Jonathan India • Sac Fly to RF</div>
                <div className="text-[10px] text-white/50">Score: CIN 4, PIT 2 • 1 Run Scored</div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono bg-black/50 p-2 rounded-lg">
              <div>
                <div className="text-[10px] text-white/40">EXIT VELO</div>
                <div className="font-bold text-[#00FF88]">101.4 mph</div>
              </div>
              <div>
                <div className="text-[10px] text-white/40">LAUNCH</div>
                <div className="font-bold text-white">28°</div>
              </div>
              <div>
                <div className="text-[10px] text-white/40">DISTANCE</div>
                <div className="font-bold text-amber-300">382 ft</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
 * 2. NFL ESPN DRIVECAST COMPONENT (CHIEFS VS SEAHAWKS / VIKINGS)
 * ========================================================================= */
function NFLVisualizer({
  followedPlayers,
  toggleFollow,
  lang,
}: {
  followedPlayers: Record<string, boolean>;
  toggleFollow: (id: string) => void;
  lang: Lang;
}) {
  return (
    <div className="bg-[#0D2421] rounded-2xl p-5 border border-white/10 relative overflow-hidden shadow-2xl space-y-4">
      {/* ESPN CURRENT DRIVE BANNER */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-black/40 rounded-xl border border-white/10">
        <div>
          <div className="text-[11px] font-mono text-[#00FF88] uppercase tracking-wider">
            CURRENT DRIVE • SEAHAWKS
          </div>
          <div className="text-sm font-bold text-white">
            10 plays • 73 yards • 5:29 duration
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-[10px] text-white/40 font-mono">SITUATION</div>
            <div className="text-xs font-mono font-bold text-amber-300">
              Down 1st & 10 • Ball on KC 20
            </div>
          </div>
          <div className="px-2.5 py-1 rounded bg-[#002244] border border-blue-400/40 text-blue-200 text-xs font-bold font-mono">
            SEA 27 - KC 24
          </div>
        </div>
      </div>

      {/* FOOTBALL FIELD GRAPHIC */}
      <div className="bg-[#071714] p-4 rounded-xl border border-white/10 relative overflow-x-auto">
        <div className="min-w-[620px]">
          {/* Field Header */}
          <div className="flex justify-between text-[10px] font-mono text-white/40 mb-1 px-8">
            <span className="text-red-400 font-bold">CHIEFS ENDZONE (RED)</span>
            <span>LINE OF SCRIMMAGE: KC 20</span>
            <span className="text-blue-400 font-bold">SEAHAWKS ENDZONE (BLUE)</span>
          </div>

          <svg viewBox="0 0 700 160" className="w-full h-auto">
            {/* Field Turf */}
            <rect x="0" y="0" width="700" height="160" fill="#0C2B22" rx="6" />

            {/* Left Endzone (Chiefs Red) */}
            <rect x="0" y="0" width="60" height="160" fill="#E31837" rx="6" />
            <text x="30" y="85" fill="#FFF" fontSize="13" fontWeight="900" transform="rotate(-90 30 85)" textAnchor="middle">
              CHIEFS
            </text>

            {/* Right Endzone (Seahawks Blue) */}
            <rect x="640" y="0" width="60" height="160" fill="#002244" rx="6" />
            <text x="670" y="85" fill="#69BE28" fontSize="13" fontWeight="900" transform="rotate(90 670 85)" textAnchor="middle">
              SEAHAWKS
            </text>

            {/* Yard Lines (10 to 50 to 10) */}
            {[100, 150, 200, 250, 300, 350, 400, 450, 500, 550, 600].map((x, i) => (
              <g key={x}>
                <line x1={x} y1="0" x2={x} y2="160" stroke="#FFFFFF" strokeWidth="1" strokeOpacity="0.25" />
                <text x={x} y="20" fill="#FFF" fontSize="9" opacity="0.4" textAnchor="middle" fontFamily="monospace">
                  {i < 5 ? (i + 1) * 10 : (10 - i) * 10}
                </text>
                <text x={x} y="150" fill="#FFF" fontSize="9" opacity="0.4" textAnchor="middle" fontFamily="monospace">
                  {i < 5 ? (i + 1) * 10 : (10 - i) * 10}
                </text>
              </g>
            ))}

            {/* Line of Scrimmage (KC 20 -> blue line at x=200) */}
            <line x1="200" y1="0" x2="200" y2="160" stroke="#00E5FF" strokeWidth="3" />

            {/* Yellow 1st Down Line (KC 10 -> yellow line at x=150) */}
            <line x1="150" y1="0" x2="150" y2="160" stroke="#FFC62F" strokeWidth="3.5" />

            {/* Dotted Passing Arc: from QB at x=240 to Catch at x=430 */}
            <path
              d="M 230,80 Q 320,25 430,70"
              fill="none"
              stroke="#00FF88"
              strokeWidth="3"
              strokeDasharray="4 3"
            />

            {/* 22 YAC Pill badge */}
            <g transform="translate(360, 45)">
              <rect x="0" y="0" width="56" height="18" rx="9" fill="#00FF88" />
              <text x="28" y="13" fill="#000" fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                22 YAC
              </text>
            </g>

            {/* Seahawks helmet logo pin at tackle spot (x=430, y=70) */}
            <circle cx="430" cy="70" r="14" fill="#002244" stroke="#69BE28" strokeWidth="2.5" />
            <text x="430" y="74" fill="#69BE28" fontSize="10" fontWeight="black" textAnchor="middle">
              SEA
            </text>
          </svg>

          {/* Play Highlight Detail Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 mt-2 pt-2 border-t border-white/5 text-xs">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-[#00FF88] font-mono font-bold text-[11px]">
                33-yd Pass
              </span>
              <span className="text-white/80">
                S. Darnold deep middle to J. Smith-Njigba to KC 20 (22 YAC)
              </span>
            </div>
            <div className="font-mono text-[11px] text-[#00FF88] font-bold">
              Win% 59.3 Last Play (+4.8%)
            </div>
          </div>
        </div>
      </div>

      {/* FEATURED PLAYER CARDS WITH FOLLOW BUTTONS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Jaxon Smith-Njigba WR #11 */}
        <div className="bg-black/30 p-3 rounded-xl border border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#002244] border border-[#69BE28] flex items-center justify-center font-bold text-xs text-[#69BE28]">
              #11
            </div>
            <div>
              <div className="text-xs font-bold text-white">Jaxon Smith-Njigba</div>
              <div className="text-[10px] text-white/50 font-mono">WR • Seahawks • 6 Rec, 94 Yds, 1 TD</div>
            </div>
          </div>
          <button
            onClick={() => toggleFollow("jaxon-11")}
            className={`cursor-pointer px-2.5 py-1 rounded-lg text-[11px] font-semibold transition flex items-center gap-1 ${
              followedPlayers["jaxon-11"]
                ? "bg-[#00FF88] text-black"
                : "bg-white/10 hover:bg-white/20 text-white"
            }`}
          >
            {followedPlayers["jaxon-11"] ? (
              <>
                <Check className="w-3 h-3" /> Following
              </>
            ) : (
              <>
                <UserPlus className="w-3 h-3" /> Follow
              </>
            )}
          </button>
        </div>

        {/* Sam Darnold QB #14 */}
        <div className="bg-black/30 p-3 rounded-xl border border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-purple-900 border border-amber-400 flex items-center justify-center font-bold text-xs text-amber-300">
              #14
            </div>
            <div>
              <div className="text-xs font-bold text-white">Sam Darnold</div>
              <div className="text-[10px] text-white/50 font-mono">QB • 18/24, 238 Yds, 2 TD, 0 INT</div>
            </div>
          </div>
          <button
            onClick={() => toggleFollow("darnold-14")}
            className={`cursor-pointer px-2.5 py-1 rounded-lg text-[11px] font-semibold transition flex items-center gap-1 ${
              followedPlayers["darnold-14"]
                ? "bg-[#00FF88] text-black"
                : "bg-white/10 hover:bg-white/20 text-white"
            }`}
          >
            {followedPlayers["darnold-14"] ? (
              <>
                <Check className="w-3 h-3" /> Following
              </>
            ) : (
              <>
                <UserPlus className="w-3 h-3" /> Follow
              </>
            )}
          </button>
        </div>
      </div>

      {/* SITUATIONAL FOOTER */}
      <div className="p-3 bg-[#071714] rounded-xl border border-white/5 flex items-center justify-between text-xs font-mono">
        <span className="text-amber-300 font-bold">NEXT SNAP: 3rd & Goal at KC 7</span>
        <span className="text-white/50">Chiefs Timeout Remaining: 1 • Seahawks: 2</span>
      </div>
    </div>
  );
}

/* =========================================================================
 * 3. NBA / WNBA 365SCORES COURT + NBA.COM LAYER
 * ========================================================================= */
function NBAVisualizer({
  isPipOpen,
  setIsPipOpen,
  selectedPin,
  setSelectedPin,
  onSelectGame,
  lang,
}: {
  isPipOpen: boolean;
  setIsPipOpen: React.Dispatch<React.SetStateAction<boolean>>;
  selectedPin: string | null;
  setSelectedPin: (p: string | null) => void;
  onSelectGame?: (g: Game) => void;
  lang: Lang;
}) {
  return (
    <div className="bg-[#0D2421] rounded-2xl p-5 border border-white/10 relative overflow-hidden shadow-2xl space-y-4">
      {/* NBA.COM TOP TICKER */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-black/50 rounded-xl border border-white/10">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded bg-blue-600/30 text-blue-300 text-[10px] font-mono font-bold">
            NBA.COM LIVE
          </span>
          <span className="text-xs font-mono text-white/90">
            SUN OCT 25 • Q4 0:14.1 • Magic 109, Knicks 100
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPipOpen(!isPipOpen)}
            className="cursor-pointer px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 text-xs font-semibold text-[#00FF88] flex items-center gap-1 transition"
          >
            <Tv className="w-3 h-3" />
            <span>{isPipOpen ? "Close PIP" : "League Pass PIP"}</span>
          </button>
        </div>
      </div>

      {/* MAIN TWO-COLUMN: 365SCORES HARDWOOD BASKETBALL COURT */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Realistic Hardwood Court Canvas */}
        <div className="md:col-span-12 bg-[#120D08] p-4 rounded-xl border border-amber-900/40 relative overflow-hidden">
          {/* Top Court Controls */}
          <div className="flex justify-between items-center text-[10px] font-mono text-amber-200/60 mb-2">
            <span>365SCORES LIVE HARDWOOD COURT TRACKER</span>
            <span className="text-white/40">INTERACTIVE EVENT PINS ON FLOOR</span>
          </div>

          <svg viewBox="0 0 600 320" className="w-full h-auto rounded-lg shadow-inner">
            {/* Hardwood floor parquet planks */}
            <defs>
              <pattern id="hardwood" width="30" height="15" patternUnits="userSpaceOnUse">
                <rect width="30" height="15" fill="#C28847" />
                <line x1="0" y1="0" x2="30" y2="0" stroke="#A96F33" strokeWidth="1" />
                <line x1="0" y1="15" x2="30" y2="15" stroke="#7A4B1A" strokeWidth="1" />
                <line x1="15" y1="0" x2="15" y2="15" stroke="#A96F33" strokeWidth="0.8" opacity="0.6" />
              </pattern>
            </defs>

            {/* Base court floor */}
            <rect x="0" y="0" width="600" height="320" fill="url(#hardwood)" rx="8" />

            {/* 365Scores Watermark center */}
            <text
              x="300"
              y="165"
              fill="#FFFFFF"
              fillOpacity="0.08"
              fontSize="38"
              fontWeight="900"
              letterSpacing="6"
              textAnchor="middle"
            >
              365SCORES • HERMITCA
            </text>

            {/* Court boundary */}
            <rect x="15" y="15" width="570" height="290" fill="none" stroke="#FFFFFF" strokeWidth="2.5" />

            {/* Half court line & Center Circle */}
            <line x1="300" y1="15" x2="300" y2="305" stroke="#FFFFFF" strokeWidth="2" />
            <circle cx="300" cy="160" r="45" fill="none" stroke="#FFFFFF" strokeWidth="2" />

            {/* Left Paint / Free Throw / 3-Point Arc */}
            <rect x="15" y="110" width="120" height="100" fill="#B36B2B" fillOpacity="0.4" stroke="#FFFFFF" strokeWidth="2" />
            <circle cx="135" cy="160" r="35" fill="none" stroke="#FFFFFF" strokeWidth="2" />
            <path d="M 15,35 L 75,35 A 140,140 0 0,1 75,285 L 15,285" fill="none" stroke="#FFFFFF" strokeWidth="2" />

            {/* Right Paint / Free Throw / 3-Point Arc */}
            <rect x="465" y="110" width="120" height="100" fill="#006BB6" fillOpacity="0.4" stroke="#FFFFFF" strokeWidth="2" />
            <circle cx="465" cy="160" r="35" fill="none" stroke="#FFFFFF" strokeWidth="2" />
            <path d="M 585,35 L 525,35 A 140,140 0 0,0 525,285 L 585,285" fill="none" stroke="#FFFFFF" strokeWidth="2" />

            {/* Pin 1: Blue - Steal 47' James LeBron SF (Left court) */}
            <g
              transform="translate(180, 90)"
              className="cursor-pointer hover:scale-110 transition"
              onClick={() => setSelectedPin("steal-47")}
            >
              <rect x="-6" y="-12" width="140" height="24" rx="12" fill="#0066FF" stroke="#FFF" strokeWidth="1.5" />
              <text x="64" y="4" fill="#FFF" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">
                Steal 47' James LeBron SF
              </text>
            </g>

            {/* Pin 2: Red - Bad pass 4 Turnovers Cunningham Cade PG (Right court) */}
            <g
              transform="translate(340, 210)"
              className="cursor-pointer hover:scale-110 transition"
              onClick={() => setSelectedPin("turnover-cade")}
            >
              <rect x="-6" y="-12" width="185" height="24" rx="12" fill="#E31837" stroke="#FFF" strokeWidth="1.5" />
              <text x="86" y="4" fill="#FFF" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">
                Bad pass 4 TOs Cunningham PG
              </text>
            </g>

            {/* Active Live Ball Position Dot: White Pulsing Dot */}
            <circle cx="270" cy="140" r="7" fill="#FFFFFF" stroke="#00FF88" strokeWidth="3" className="animate-ping" />
            <circle cx="270" cy="140" r="5" fill="#FFFFFF" />
          </svg>

          {/* Active Pin Detail Note */}
          <div className="mt-3 p-2.5 bg-black/60 rounded-lg border border-white/10 flex items-center justify-between text-xs">
            <span className="text-[#00FF88] font-mono">
              {selectedPin === "steal-47"
                ? "🎯 Highlight Event: LeBron James intercepted errant pass at perimeter (47:12)"
                : "⚠️ Turnover Alert: Cade Cunningham lost ball on double team in paint"}
            </span>
            <span className="text-white/40 font-mono text-[11px]">Position: Court X:45 Y:28</span>
          </div>
        </div>
      </div>

      {/* LEAD TRACKER BLUE AREA CHART (NBA.COM LAYER) */}
      <div className="bg-[#071714] p-4 rounded-xl border border-white/10 space-y-3">
        <div className="flex items-center justify-between text-xs">
          <div className="font-mono text-[#00FF88] font-bold">
            NBA LEAD TRACKER • 30 TO 35 MIN GAME TIME
          </div>
          <div className="font-mono text-white/50 text-[11px]">
            Scale: +35 Magic / -15 Knicks
          </div>
        </div>

        {/* SVG Area Chart */}
        <div className="w-full h-24 relative">
          <svg viewBox="0 0 500 90" className="w-full h-full">
            {/* Zero Axis */}
            <line x1="0" y1="45" x2="500" y2="45" stroke="#FFFFFF" strokeWidth="1" strokeOpacity="0.2" />

            {/* Quarter Markers */}
            <line x1="125" y1="0" x2="125" y2="90" stroke="#FFF" strokeWidth="0.5" strokeOpacity="0.1" />
            <line x1="250" y1="0" x2="250" y2="90" stroke="#FFF" strokeWidth="0.5" strokeOpacity="0.1" />
            <line x1="375" y1="0" x2="375" y2="90" stroke="#FFF" strokeWidth="0.5" strokeOpacity="0.1" />

            <text x="60" y="85" fill="#FFF" opacity="0.3" fontSize="9">Q1</text>
            <text x="185" y="85" fill="#FFF" opacity="0.3" fontSize="9">Q2</text>
            <text x="310" y="85" fill="#FFF" opacity="0.3" fontSize="9">Q3</text>
            <text x="435" y="85" fill="#FFF" opacity="0.3" fontSize="9">Q4</text>

            {/* Shaded Area */}
            <polygon
              points="0,45 50,42 100,50 150,38 200,30 250,22 300,18 350,15 400,20 450,14 500,12 500,45"
              fill="#0077C0"
              fillOpacity="0.4"
            />
            {/* Blue Trend Line */}
            <polyline
              points="0,45 50,42 100,50 150,38 200,30 250,22 300,18 350,15 400,20 450,14 500,12"
              fill="none"
              stroke="#00E5FF"
              strokeWidth="2.5"
            />
          </svg>
        </div>

        {/* Biggest Lead Footer Bar */}
        <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs font-mono">
          <span className="text-white/60">Biggest Lead Comparison:</span>
          <span className="font-bold text-amber-300">Knicks: 1 pt • Magic: 32 pts</span>
        </div>
      </div>

      {/* VIDEO PIP MODAL PREVIEW (WHEN TOGGLED) */}
      {isPipOpen && (
        <div className="p-3 bg-black/80 rounded-xl border border-[#00FF88]/40 animate-in fade-in flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-20 h-12 bg-neutral-900 rounded-lg border border-white/20 flex items-center justify-center relative overflow-hidden">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping absolute top-1 left-1" />
              <Tv className="w-5 h-5 text-white/50" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">Live Broadcast Feed • Ch 1</div>
              <div className="text-[10px] text-white/50 font-mono">1080p60 • Stream Latency 1.2s</div>
            </div>
          </div>
          <button
            onClick={() => setIsPipOpen(false)}
            className="cursor-pointer text-xs font-mono text-white/60 hover:text-white px-2 py-1"
          >
            Minimize
          </button>
        </div>
      )}
    </div>
  );
}

/* =========================================================================
 * 4. THAI RATCHABURI FC SOCCER PITCH COMPONENT
 * ========================================================================= */
function SoccerVisualizer({
  lang,
  homeTeam,
  awayTeam,
  showShareFeedback,
}: {
  lang: Lang;
  homeTeam: Team;
  awayTeam: Team;
  showShareFeedback: (msg: string) => void;
}) {
  return (
    <div className="bg-[#0D2421] rounded-2xl p-5 border border-white/10 relative overflow-hidden shadow-2xl space-y-4">
      {/* Header bar: Dragon Solar Park & Broadcast badging */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/10">
        <div>
          <div className="text-xs font-mono text-[#FF6600] uppercase tracking-wider font-bold">
            DRAGON SOLAR PARK • LIVE TURF RADAR
          </div>
          <div className="text-sm font-bold text-white">
            {lang === "th" ? "ราชบุรี เอฟซี พบ บุรีรัมย์ ยูไนเต็ด" : "Ratchaburi FC vs Buriram United"}
          </div>
          <div className="text-xs text-white/50">
            {lang === "th" ? "ไทยลีก 1 นัดที่ 8 • บรรยากาศสด 31°C" : "Thai League 1 Matchday 8 • 31°C Pitch Temp"}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded bg-[#FF6600]/20 border border-[#FF6600]/40 text-[#FF6600] text-xs font-bold">
            🇹🇭 TrueVisions Ch98
          </span>
          <span className="px-2.5 py-1 rounded bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-bold">
            AIS PLAY
          </span>
        </div>
      </div>

      {/* FULL SOCCER PITCH SVG (365SCORES STYLE) */}
      <div className="bg-[#091F18] p-3 rounded-xl border border-white/10 relative">
        <svg viewBox="0 0 600 340" className="w-full h-auto rounded-lg">
          {/* Turf Stripes pattern */}
          <defs>
            <pattern id="turf-stripes" width="60" height="340" patternUnits="userSpaceOnUse">
              <rect x="0" y="0" width="30" height="340" fill="#0E382B" />
              <rect x="30" y="0" width="30" height="340" fill="#0B2F24" />
            </pattern>
          </defs>

          {/* Grass Field */}
          <rect x="0" y="0" width="600" height="340" fill="url(#turf-stripes)" rx="6" />

          {/* Touchlines */}
          <rect x="20" y="20" width="560" height="300" fill="none" stroke="#FFFFFF" strokeWidth="2.5" opacity="0.8" />

          {/* Halfway line & Center Circle */}
          <line x1="300" y1="20" x2="300" y2="320" stroke="#FFFFFF" strokeWidth="2" opacity="0.8" />
          <circle cx="300" cy="170" r="50" fill="none" stroke="#FFFFFF" strokeWidth="2" opacity="0.8" />
          <circle cx="300" cy="170" r="3" fill="#FFFFFF" />

          {/* Left Penalty Area (Ratchaburi) */}
          <rect x="20" y="80" width="90" height="180" fill="none" stroke="#FFFFFF" strokeWidth="2" opacity="0.8" />
          <rect x="20" y="120" width="35" height="100" fill="none" stroke="#FFFFFF" strokeWidth="1.5" opacity="0.8" />
          <path d="M 110,135 A 45,45 0 0,1 110,205" fill="none" stroke="#FFFFFF" strokeWidth="1.5" opacity="0.8" />

          {/* Right Penalty Area (Buriram) */}
          <rect x="490" y="80" width="90" height="180" fill="none" stroke="#FFFFFF" strokeWidth="2" opacity="0.8" />
          <rect x="545" y="120" width="35" height="100" fill="none" stroke="#FFFFFF" strokeWidth="1.5" opacity="0.8" />
          <path d="M 490,135 A 45,45 0 0,0 490,205" fill="none" stroke="#FFFFFF" strokeWidth="1.5" opacity="0.8" />

          {/* LIVE TURF PIN 1: Goal 18' (Ratchaburi) */}
          <g transform="translate(525, 150)" className="cursor-pointer">
            <circle cx="0" cy="0" r="12" fill="#FF6600" stroke="#FFFFFF" strokeWidth="2" />
            <text x="0" y="4" fill="#FFF" fontSize="10" fontWeight="bold" textAnchor="middle">⚽</text>
            <rect x="-40" y="16" width="80" height="16" rx="4" fill="#000" fillOpacity="0.8" />
            <text x="0" y="28" fill="#FF6600" fontSize="9" fontWeight="bold" textAnchor="middle">18' Tana (1-0)</text>
          </g>

          {/* LIVE TURF PIN 2: Goal 55' (Buriram) */}
          <g transform="translate(75, 175)" className="cursor-pointer">
            <circle cx="0" cy="0" r="12" fill="#0066FF" stroke="#FFFFFF" strokeWidth="2" />
            <text x="0" y="4" fill="#FFF" fontSize="10" fontWeight="bold" textAnchor="middle">⚽</text>
            <rect x="-40" y="16" width="80" height="16" rx="4" fill="#000" fillOpacity="0.8" />
            <text x="0" y="28" fill="#00E5FF" fontSize="9" fontWeight="bold" textAnchor="middle">55' Bissoli (1-1)</text>
          </g>

          {/* ACTIVE BALL RADAR */}
          <circle cx="340" cy="120" r="8" fill="#FFFFFF" stroke="#00FF88" strokeWidth="3" className="animate-ping" />
          <circle cx="340" cy="120" r="5" fill="#FFFFFF" />
        </svg>

        <div className="flex justify-between items-center text-[10px] font-mono text-white/50 mt-2 px-1">
          <span>{lang === "th" ? "ราชบุรี บุกจากซ้ายไปขวา" : "Ratchaburi attacking left to right"}</span>
          <span className="text-[#00FF88]">{lang === "th" ? "ครองบอล 54% • โมเมนตัมพุ่งสูง" : "54% Possession • Surging Pressure"}</span>
        </div>
      </div>

      {/* POSSESSION & xG BARS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        {/* Possession */}
        <div className="bg-black/30 p-3 rounded-xl border border-white/5">
          <div className="flex justify-between font-mono mb-1.5">
            <span className="text-[#FF6600] font-bold">54% Ratchaburi</span>
            <span className="text-white/40">POSSESSION</span>
            <span className="text-blue-400 font-bold">46% Buriram</span>
          </div>
          <div className="w-full h-2 rounded-full bg-white/10 flex overflow-hidden">
            <div style={{ width: "54%" }} className="h-full bg-[#FF6600]" />
            <div style={{ width: "46%" }} className="h-full bg-blue-500" />
          </div>
        </div>

        {/* Expected Goals (xG) */}
        <div className="bg-black/30 p-3 rounded-xl border border-white/5">
          <div className="flex justify-between font-mono mb-1.5">
            <span className="text-[#00FF88] font-bold">1.42 xG</span>
            <span className="text-white/40">EXPECTED GOALS</span>
            <span className="text-white font-bold">1.18 xG</span>
          </div>
          <div className="w-full h-2 rounded-full bg-white/10 flex overflow-hidden">
            <div style={{ width: "55%" }} className="h-full bg-[#00FF88]" />
            <div style={{ width: "45%" }} className="h-full bg-white/40" />
          </div>
        </div>
      </div>

      {/* MATCH EVENT TIMELINE */}
      <div className="bg-[#071714] p-3 rounded-xl border border-white/10 space-y-2">
        <div className="text-[10px] font-mono text-white/40 uppercase">
          {lang === "th" ? "ไทม์ไลน์การแข่งขันสด" : "Live Match Timeline"}
        </div>
        <div className="space-y-1.5 text-xs">
          <div className="flex items-center gap-2 p-1.5 rounded bg-black/40 border border-white/5">
            <span className="font-mono text-[#FF6600] font-bold">18'</span>
            <span>⚽</span>
            <span className="font-medium text-white">Goal! Ratchaburi FC — Tana curls into top-right</span>
          </div>
          <div className="flex items-center gap-2 p-1.5 rounded bg-black/40 border border-white/5">
            <span className="font-mono text-amber-400 font-bold">34'</span>
            <span>🟨</span>
            <span className="text-white/70">Yellow Card: Buriram United (Tactical Foul)</span>
          </div>
          <div className="flex items-center gap-2 p-1.5 rounded bg-black/40 border border-white/5">
            <span className="font-mono text-blue-400 font-bold">55'</span>
            <span>⚽</span>
            <span className="font-medium text-white">Goal! Buriram United — G. Bissoli tap-in</span>
          </div>
          <div className="flex items-center gap-2 p-1.5 rounded bg-black/40 border border-white/5">
            <span className="font-mono text-[#00FF88] font-bold">67'</span>
            <span>🔄</span>
            <span className="text-white/70">Sub: Ratchaburi brings on fresh striker</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
 * 5. UNIVERSAL MATCHUP PREDICTOR DONUT (ALL SPORTS)
 * ========================================================================= */
function MatchupPredictorDonut({
  currentSport,
  lang,
  onShare,
}: {
  currentSport: SportMode;
  lang: Lang;
  onShare: (msg: string) => void;
}) {
  const pHome = currentSport === "soccer" ? 48.2 : 54.3;
  const pAway = currentSport === "soccer" ? 51.8 : 45.7;

  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffsetHome = circumference - (pHome / 100) * circumference;

  return (
    <div className="bg-[#0D2421] rounded-2xl p-5 border border-white/10 shadow-xl space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-white/10">
        <div>
          <div className="text-[10px] font-mono text-[#00FF88] uppercase tracking-wider font-bold">
            MATCHUP PREDICTOR
          </div>
          <div className="text-xs text-white/60">
            ESPN Analytics • Hermitca Engine
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onShare("Link copied for X / LINE Share!")}
            className="cursor-pointer px-2 py-1 rounded bg-white/5 hover:bg-white/15 text-[11px] font-mono text-white/80 border border-white/10 transition"
          >
            X / LINE
          </button>
          <button
            onClick={() => onShare("Opening Facebook Match Share...")}
            className="cursor-pointer px-2 py-1 rounded bg-blue-600/30 hover:bg-blue-600/50 text-[11px] font-mono text-blue-200 border border-blue-500/40 transition"
          >
            FB
          </button>
        </div>
      </div>

      {/* DONUT SVG WITH STRIPES & TEAL */}
      <div className="flex flex-col items-center justify-center py-2 relative">
        <svg viewBox="0 0 160 160" className="w-44 h-44">
          <defs>
            <pattern id="donut-stripes" width="8" height="8" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="0" y2="8" stroke="#FF4D6D" strokeWidth="4" />
              <line x1="4" y1="0" x2="4" y2="8" stroke="#1A2D29" strokeWidth="4" />
            </pattern>
          </defs>

          {/* Background Ring */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            fill="none"
            stroke="url(#donut-stripes)"
            strokeWidth="16"
          />

          {/* Active Home Ring (Teal / Neon) */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            fill="none"
            stroke="#00FF88"
            strokeWidth="16"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffsetHome}
            strokeLinecap="round"
            transform="rotate(-90 80 80)"
            className="transition-all duration-1000 ease-out"
          />

          {/* Center Text */}
          <text x="80" y="72" fill="#FFFFFF" fontSize="18" fontWeight="900" textAnchor="middle" fontFamily="monospace">
            {pHome}%
          </text>
          <text x="80" y="90" fill="#00FF88" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">
            WIN CHANCE
          </text>
          <text x="80" y="104" fill="#FFFFFF" opacity="0.4" fontSize="8" textAnchor="middle">
            VS {pAway}%
          </text>
        </svg>

        {/* Legend */}
        <div className="flex items-center justify-between w-full px-4 text-xs font-mono mt-1">
          <div className="flex items-center gap-1.5 text-red-300">
            <span className="w-3 h-3 rounded-full bg-red-500/80 border border-white/20" />
            <span>AWAY: {pAway}%</span>
          </div>
          <div className="flex items-center gap-1.5 text-[#00FF88]">
            <span className="w-3 h-3 rounded-full bg-[#00FF88] border border-black/40" />
            <span>HOME: {pHome}%</span>
          </div>
        </div>
      </div>

      <div className="text-[10px] text-white/40 text-center font-mono pt-1 border-t border-white/5">
        Calculated using live play pacing, EPA per snap, and historical weather indices.
      </div>
    </div>
  );
}

/* =========================================================================
 * 6. SIDE SCOREBOARD FEED LIST (365SCORES STYLE)
 * ========================================================================= */
function SideScoreboardList({
  activeSport,
  onSelectDemo,
  lang,
}: {
  activeSport: SportMode;
  onSelectDemo: (k: string) => void;
  lang: Lang;
}) {
  return (
    <div className="bg-[#0D2421] rounded-2xl p-4 border border-white/10 space-y-3">
      <div className="text-xs font-mono font-bold text-white/50 uppercase tracking-wider flex items-center justify-between">
        <span>365Scores Live Match Feed</span>
        <span className="w-2 h-2 rounded-full bg-[#00FF88] animate-pulse" />
      </div>

      <div className="space-y-2">
        {/* Brooklyn Nets @ Indiana Pacers */}
        <div
          onClick={() => onSelectDemo("nba")}
          className="cursor-pointer p-2.5 rounded-xl bg-black/30 hover:bg-[#00FF88]/10 border border-white/5 hover:border-[#00FF88]/30 transition"
        >
          <div className="flex justify-between items-center text-[10px] font-mono text-white/40 mb-1">
            <span>NBA • FINAL</span>
            <span className="text-amber-300 font-bold">136-109</span>
          </div>
          <div className="flex justify-between text-xs font-semibold text-white">
            <span>Brooklyn Nets</span>
            <span className="text-white/60">109</span>
          </div>
          <div className="flex justify-between text-xs font-semibold text-[#00FF88]">
            <span>Indiana Pacers</span>
            <span>136</span>
          </div>
        </div>

        {/* Orlando Magic @ New York Knicks */}
        <div
          onClick={() => onSelectDemo("nba")}
          className="cursor-pointer p-2.5 rounded-xl bg-black/30 hover:bg-[#00FF88]/10 border border-white/5 hover:border-[#00FF88]/30 transition"
        >
          <div className="flex justify-between items-center text-[10px] font-mono text-white/40 mb-1">
            <span className="text-red-400 font-bold">LIVE Q4 0:14</span>
            <span className="text-[#00FF88] font-bold">109-100</span>
          </div>
          <div className="flex justify-between text-xs font-semibold text-[#00FF88]">
            <span>Orlando Magic</span>
            <span>109</span>
          </div>
          <div className="flex justify-between text-xs font-semibold text-white">
            <span>New York Knicks</span>
            <span className="text-white/60">100</span>
          </div>
        </div>

        {/* Kansas City @ Seattle */}
        <div
          onClick={() => onSelectDemo("nfl")}
          className="cursor-pointer p-2.5 rounded-xl bg-black/30 hover:bg-[#00FF88]/10 border border-white/5 hover:border-[#00FF88]/30 transition"
        >
          <div className="flex justify-between items-center text-[10px] font-mono text-white/40 mb-1">
            <span className="text-red-400 font-bold">LIVE Q4 3:12</span>
            <span className="text-[#00FF88] font-bold">24-27</span>
          </div>
          <div className="flex justify-between text-xs font-semibold text-white">
            <span>Kansas City Chiefs</span>
            <span className="text-white/60">24</span>
          </div>
          <div className="flex justify-between text-xs font-semibold text-[#00FF88]">
            <span>Seattle Seahawks</span>
            <span>27</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
 * 7. PLAY-BY-PLAY PANEL
 * ========================================================================= */
function PlayByPlayPanel({ sport, lang }: { sport: SportMode; lang: Lang }) {
  return (
    <div className="bg-[#0D2421] rounded-2xl p-5 border border-white/10 space-y-3">
      <div className="text-xs font-mono font-bold text-[#00FF88] uppercase">
        {lang === "th" ? "ลำดับเหตุการณ์เพลย์ล่าสุด" : "Detailed Play Log"}
      </div>
      <div className="space-y-2 text-xs">
        <div className="p-3 bg-black/40 rounded-xl border border-white/5 flex items-start gap-3 cursor-pointer hover:bg-white/5 transition">
          <span className="font-mono text-[#00FF88] font-bold whitespace-nowrap">3:12 Q4</span>
          <div>
            <div className="font-bold text-white">33-yd Pass completion from S. Darnold to J. Smith-Njigba</div>
            <div className="text-white/50 text-[11px]">Tackled at KC 20 • First Down SEA • +4.8% Win Prob</div>
          </div>
        </div>
        <div className="p-3 bg-black/40 rounded-xl border border-white/5 flex items-start gap-3 cursor-pointer hover:bg-white/5 transition">
          <span className="font-mono text-white/50 whitespace-nowrap">3:48 Q4</span>
          <div>
            <div className="font-bold text-white">K. Walker III rush right tackle for 4 yards</div>
            <div className="text-white/50 text-[11px]">Ball on SEA 47 • Tackle by C. Jones</div>
          </div>
        </div>
        <div className="p-3 bg-black/40 rounded-xl border border-white/5 flex items-start gap-3 cursor-pointer hover:bg-white/5 transition">
          <span className="font-mono text-white/50 whitespace-nowrap">4:25 Q4</span>
          <div>
            <div className="font-bold text-white">S. Darnold pass short left to N. Fant for 12 yards</div>
            <div className="text-white/50 text-[11px]">First Down SEA • Out of bounds stops clock</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
 * 8. BOX SCORE & STATS PANEL
 * ========================================================================= */
function StatsPanel({ sport, lang }: { sport: SportMode; lang: Lang }) {
  return (
    <div className="bg-[#0D2421] rounded-2xl p-5 border border-white/10 space-y-4">
      <div className="text-xs font-mono font-bold text-[#00FF88] uppercase">
        {lang === "th" ? "การเปรียบเทียบสถิติเชิงลึก" : "Head-to-Head Advanced Analytics"}
      </div>
      <div className="space-y-3 text-xs font-mono">
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-white/60">Total Yards / Offense</span>
            <span className="text-[#00FF88] font-bold">384 vs 326</span>
          </div>
          <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden flex">
            <div style={{ width: "54%" }} className="h-full bg-[#00FF88]" />
            <div style={{ width: "46%" }} className="h-full bg-red-500" />
          </div>
        </div>
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-white/60">Third Down Efficiency</span>
            <span className="text-[#00FF88] font-bold">7/12 (58%) vs 4/11 (36%)</span>
          </div>
          <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden flex">
            <div style={{ width: "62%" }} className="h-full bg-[#00FF88]" />
            <div style={{ width: "38%" }} className="h-full bg-red-500" />
          </div>
        </div>
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-white/60">Time of Possession</span>
            <span className="text-[#00FF88] font-bold">32:15 vs 24:33</span>
          </div>
          <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden flex">
            <div style={{ width: "57%" }} className="h-full bg-[#00FF88]" />
            <div style={{ width: "43%" }} className="h-full bg-red-500" />
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
 * 9. WIN PROBABILITY PANEL
 * ========================================================================= */
function WinProbPanel({ sport, lang }: { sport: SportMode; lang: Lang }) {
  return (
    <div className="bg-[#0D2421] rounded-2xl p-5 border border-white/10 space-y-4">
      <div className="flex justify-between items-center">
        <div className="text-xs font-mono font-bold text-[#00FF88] uppercase">
          WIN PROBABILITY LINE CHART (Q1 - Q4)
        </div>
        <div className="text-xs font-mono text-white/60">
          Red Dotted (Chiefs) vs Blue Solid (Seahawks)
        </div>
      </div>

      <div className="w-full h-36 bg-[#071714] p-3 rounded-xl border border-white/10">
        <svg viewBox="0 0 500 120" className="w-full h-full">
          {/* 50% equilibrium line */}
          <line x1="0" y1="60" x2="500" y2="60" stroke="#FFF" strokeWidth="1" strokeDasharray="3 3" opacity="0.3" />

          {/* Quarters grid lines */}
          <line x1="125" y1="0" x2="125" y2="120" stroke="#FFF" strokeWidth="0.5" opacity="0.1" />
          <line x1="250" y1="0" x2="250" y2="120" stroke="#FFF" strokeWidth="0.5" opacity="0.1" />
          <line x1="375" y1="0" x2="375" y2="120" stroke="#FFF" strokeWidth="0.5" opacity="0.1" />

          <text x="60" y="115" fill="#FFF" opacity="0.3" fontSize="9">Q1</text>
          <text x="185" y="115" fill="#FFF" opacity="0.3" fontSize="9">Q2</text>
          <text x="310" y="115" fill="#FFF" opacity="0.3" fontSize="9">Q3</text>
          <text x="435" y="115" fill="#FFF" opacity="0.3" fontSize="9">Q4</text>

          {/* Away Team (Red Dotted) */}
          <polyline
            points="0,60 80,45 150,70 230,85 300,50 380,68 450,55 500,48"
            fill="none"
            stroke="#FF3366"
            strokeWidth="2.5"
            strokeDasharray="4 3"
          />

          {/* Home Team (Blue/Neon Solid) */}
          <polyline
            points="0,60 80,75 150,50 230,35 300,70 380,52 450,65 500,72"
            fill="none"
            stroke="#00FF88"
            strokeWidth="3"
          />
        </svg>
      </div>

      <div className="flex justify-between text-xs font-mono text-white/70">
        <span className="text-red-400">Chiefs Equity: 45.7%</span>
        <span className="text-[#00FF88] font-bold">Seahawks Equity: 54.3%</span>
      </div>
    </div>
  );
}
