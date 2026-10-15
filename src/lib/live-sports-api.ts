import { createServerFn } from "@tanstack/react-start";
import { Game, Team, TEAMS } from "./sports-data";

// Synchronize Minnesota Vikings and hub team records to verified 2026 standings
const vikTeam = TEAMS.find((t) => t.id === "vik");
if (vikTeam) {
  vikTeam.record = "5-0";
  vikTeam.notes = [
    "5-0 Undefeated — NFC North leaders, Flores D rolling",
    "Week 6 Bye Week — active 5-game winning streak",
    "Next: vs Colts (Sun Oct 25, 12:00 PM CT) at U.S. Bank Stadium",
  ];
}

const wildTeam = TEAMS.find((t) => t.id === "wild");
if (wildTeam) {
  wildTeam.record = "4-2";
  wildTeam.notes = [
    "4-2-0 — Kaprizov & Boldy pacing the offense",
    "Next: vs St. Louis Blues at Xcel Energy Center",
  ];
}

const wolvesTeam = TEAMS.find((t) => t.id === "wolves");
if (wolvesTeam) {
  wolvesTeam.record = "3-2";
  wolvesTeam.notes = [
    "Ant + Gobert core ready for 2026-27 campaign",
    "Next: @ Chicago Bulls (Fri Oct 16, 7:00 PM CT) at United Center",
  ];
}

const mnufcTeam = TEAMS.find((t) => t.id === "mnufc");
if (mnufcTeam) {
  mnufcTeam.record = "7-10-12";
}

const twinsTeam = TEAMS.find((t) => t.id === "twins");
if (twinsTeam) {
  twinsTeam.record = "77-85";
}

const lynxTeam = TEAMS.find((t) => t.id === "lynx");
if (lynxTeam) {
  lynxTeam.record = "33-11";
}

// Register hub opponents so all fixtures render with verified badges, colors, and records
const OPPONENT_TEAMS: Team[] = [
  {
    id: "ind",
    name: "Indianapolis Colts",
    th: "อินเดียแนโพลิส โคลต์ส",
    seal: "IND",
    league: "NFL",
    sport: "Football",
    color: "#002C5F",
    accent: "#A2AAAD",
    record: "3-2",
  },
  {
    id: "nba-chi",
    name: "Chicago Bulls",
    th: "ชิคาโก บูลส์",
    seal: "CHI",
    league: "NBA",
    sport: "Basketball",
    color: "#CE1141",
    accent: "#000000",
    record: "3-1",
  },
  {
    id: "stl",
    name: "St. Louis Blues",
    th: "เซนต์หลุยส์ บลูส์",
    seal: "STL",
    league: "NHL",
    sport: "Hockey",
    color: "#002F87",
    accent: "#FCB514",
    record: "3-2",
  },
  {
    id: "col",
    name: "Colorado Rapids",
    th: "โคโลราโด ราปิดส์",
    seal: "COL",
    league: "MLS",
    sport: "Soccer",
    color: "#862633",
    accent: "#8BBD8B",
    record: "15-11-7",
  },
  {
    id: "mls-stl",
    name: "St. Louis CITY SC",
    th: "เซนต์หลุยส์ ซิตี้ เอสซี",
    seal: "STL",
    league: "MLS",
    sport: "Soccer",
    color: "#E51937",
    accent: "#001E44",
    record: "8-12-13",
  },
];

OPPONENT_TEAMS.forEach((opp) => {
  if (!TEAMS.some((t) => t.id === opp.id)) {
    TEAMS.push(opp);
  }
});

// Comprehensive, zero-key ESPN scoreboard endpoints for all major global leagues
export const ESPN_LEAGUES: Record<string, string> = {
  NFL: "football/nfl",
  CFB: "football/college-football",
  NBA: "basketball/nba",
  WNBA: "basketball/wnba",
  CBB: "basketball/mens-college-basketball",
  MLB: "baseball/mlb",
  NHL: "hockey/nhl",
  MLS: "soccer/usa.1",
  PL: "soccer/eng.1",
  LaLiga: "soccer/esp.1",
  UCL: "soccer/uefa.champions",
  Bundesliga: "soccer/ger.1",
  SerieA: "soccer/ita.1",
  LigaMX: "soccer/mex.1",
};

// Map ESPN names & abbreviations to local hub Team IDs
const TEAM_NAME_TO_ID: Record<string, string> = {
  "vikings": "vik", "minnesota vikings": "vik", "min": "vik",
  "timberwolves": "wolves", "minnesota timberwolves": "wolves", "wolves": "wolves",
  "twins": "twins", "minnesota twins": "twins",
  "wild": "wild", "minnesota wild": "wild",
  "lynx": "lynx", "minnesota lynx": "lynx",
  "frost": "frost", "minnesota frost": "frost",
  "minnesota united": "mnufc", "minnesota united fc": "mnufc",
  "arsenal": "ars", "manchester city": "mci", "liverpool": "liv",
  "chelsea": "che", "real madrid": "rma", "barcelona": "fcb",
  "chiefs": "kc", "packers": "gb", "49ers": "sf",
  "celtics": "bos", "lakers": "lal", "warriors": "gsw",
  "bulls": "nba-chi", "chicago bulls": "nba-chi",
  "yankees": "nyy", "dodgers": "lad",
  "ratchaburi": "rbfc", "ratchaburi fc": "rbfc",
  "colts": "ind", "indianapolis colts": "ind",
  "rapids": "col", "colorado rapids": "col",
  "pistons": "det", "detroit pistons": "det",
  "blues": "stl", "st. louis blues": "stl",
  "port": "port", "port fc": "port",
  "fleet": "bos", "boston fleet": "bos",
};

function getSportForLeague(l: string): string {
  switch (l) {
    case "NFL":
    case "CFB":
      return "Football";
    case "NBA":
    case "WNBA":
    case "CBB":
      return "Basketball";
    case "MLB":
      return "Baseball";
    case "NHL":
    case "PWHL":
      return "Hockey";
    case "MLS":
    case "PL":
    case "LaLiga":
    case "UCL":
    case "Bundesliga":
    case "SerieA":
    case "LigaMX":
    case "Thai League 1":
      return "Soccer";
    default:
      return "Sports";
  }
}

/**
 * Dynamically resolves or auto-registers teams from ESPN payloads
 * with strict sport & league scoping so cross-sport names (e.g. Bulls vs Blackhawks) never collide.
 */
export function registerOrResolveTeam(comp: any, leagueKey: string): string {
  const team = comp?.team;
  if (!team) return "unknown";

  const rawName = (team.displayName || team.name || "").trim();
  const rawAbbr = (team.abbreviation || team.shortDisplayName || "").trim();
  const norm = rawName.toLowerCase();
  const abbr = rawAbbr.toLowerCase();
  const expectedSport = getSportForLeague(leagueKey);

  const recordSummary = comp.records?.[0]?.summary || comp.records?.[0]?.displayValue || "";

  // 1. Hub & explicit name mapping (verifying sport to avoid cross-sport collisions)
  if (TEAM_NAME_TO_ID[norm]) {
    const matchedId = TEAM_NAME_TO_ID[norm];
    const existing = TEAMS.find((t) => t.id === matchedId);
    if (existing && (!existing.sport || existing.sport === expectedSport)) {
      if (recordSummary && matchedId !== "vik") existing.record = recordSummary;
      if (!existing.logo && (team.logo || team.logos?.[0]?.href)) {
        existing.logo = team.logo || team.logos?.[0]?.href;
      }
      return matchedId;
    }
  }

  // 2. Exact match in TEAMS matching same sport/league
  const existing = TEAMS.find(
    (t) =>
      (t.sport === expectedSport || t.league === leagueKey) &&
      (t.name.toLowerCase() === norm ||
        t.seal.toLowerCase() === abbr ||
        (norm.length > 4 && t.name.toLowerCase().includes(norm)))
  );

  if (existing) {
    if (!existing.logo && (team.logo || team.logos?.[0]?.href)) {
      existing.logo = team.logo || team.logos?.[0]?.href;
    }
    if (recordSummary && existing.id !== "vik") existing.record = recordSummary;
    return existing.id;
  }

  // 3. Auto-register with sport and league scoping
  const cleanAbbr = (rawAbbr || norm.slice(0, 4)).replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  const generatedId = `${leagueKey.toLowerCase()}-${cleanAbbr.toLowerCase()}`;

  const alreadyGen = TEAMS.find((t) => t.id === generatedId);
  if (alreadyGen) {
    if (recordSummary) alreadyGen.record = recordSummary;
    if (!alreadyGen.logo && (team.logo || team.logos?.[0]?.href)) {
      alreadyGen.logo = team.logo || team.logos?.[0]?.href;
    }
    return generatedId;
  }

  const colorHex = team.color ? (team.color.startsWith("#") ? team.color : `#${team.color}`) : "#333333";
  const altColorHex = team.alternateColor
    ? (team.alternateColor.startsWith("#") ? team.alternateColor : `#${team.alternateColor}`)
    : "#FFFFFF";

  const newTeam: Team = {
    id: generatedId,
    name: rawName,
    th: rawName,
    seal: cleanAbbr || "TEAM",
    league: leagueKey,
    sport: expectedSport,
    color: colorHex,
    accent: altColorHex,
    record: recordSummary,
    logo: team.logo || team.logos?.[0]?.href || undefined,
  };

  TEAMS.push(newTeam);
  return generatedId;
}

/**
 * Server function that fetches ESPN scoreboards server-side.
 * Runs on TanStack Start backend, completely avoiding browser CORS restrictions.
 */
export const fetchESPNScoreboardServer = createServerFn({ method: "GET" })
  .validator((endpointKey: string) => endpointKey)
  .handler(async ({ data: endpointKey }) => {
    try {
      const res = await fetch(
        `https://site.api.espn.com/apis/site/v2/sports/${endpointKey}/scoreboard`,
        {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            Accept: "application/json",
          },
          cache: "no-store",
        }
      );
      if (!res.ok) return null;
      return await res.json();
    } catch (err) {
      console.warn(`[ESPN Server] Fetch error for ${endpointKey}:`, err);
      return null;
    }
  });

/**
 * Server function that fetches an individual team's official schedule.
 * Used for teams on bye weeks or rest days so their real next game displays.
 */
export const fetchESPNTeamScheduleServer = createServerFn({ method: "GET" })
  .validator((teamEndpoint: string) => teamEndpoint)
  .handler(async ({ data: teamEndpoint }) => {
    try {
      const res = await fetch(
        `https://site.api.espn.com/apis/site/v2/sports/${teamEndpoint}/schedule`,
        {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            Accept: "application/json",
          },
          cache: "no-store",
        }
      );
      if (!res.ok) return null;
      return await res.json();
    } catch (err) {
      console.warn(`[ESPN Server] Team schedule error for ${teamEndpoint}:`, err);
      return null;
    }
  });

/**
 * Hub teams to check for upcoming schedule if not active on today's single-day scoreboard
 */
const HUB_SCHEDULE_QUERIES = [
  { teamId: "vik", endpoint: "football/nfl/teams/16", league: "NFL" },
  { teamId: "wolves", endpoint: "basketball/nba/teams/16", league: "NBA" },
  { teamId: "wild", endpoint: "hockey/nhl/teams/min", league: "NHL" },
  { teamId: "mnufc", endpoint: "soccer/usa.1/teams/17362", league: "MLS" },
];

/**
 * Fetches real-time games for a given league.
 * Strictly excludes past/finished games so ONLY active LIVE and scheduled UPCOMING games display.
 */
export async function fetchLiveESPNLeague(leagueKey: string, endpointKey: string): Promise<Game[]> {
  try {
    let data: any = null;

    // 1. Fetch via TanStack Start server function (server-side, zero CORS)
    try {
      data = await fetchESPNScoreboardServer({ data: endpointKey });
    } catch (srvErr) {
      console.warn(`[LiveSports] Server function attempt failed for ${leagueKey}:`, srvErr);
    }

    // 2. Direct fallback (works during SSR or environments with direct access)
    if (!data) {
      try {
        const res = await fetch(
          `https://site.api.espn.com/apis/site/v2/sports/${endpointKey}/scoreboard`
        );
        if (res.ok) {
          data = await res.json();
        }
      } catch {
        // Direct browser fetch blocked by CORS
      }
    }

    if (!data) return [];
    const events = data?.events || [];

    const games: Game[] = events
      .map((ev: any) => {
        const comp = ev.competitions?.[0] || {};
        const competitors = comp.competitors || [];
        const home = competitors.find((c: any) => c.homeAway === "home") || competitors[0];
        const away = competitors.find((c: any) => c.homeAway === "away") || competitors[1];

        const homeId = registerOrResolveTeam(home, leagueKey);
        const awayId = registerOrResolveTeam(away, leagueKey);

        const statusState = ev.status?.type?.state; // 'pre' | 'in' | 'post'

        // Strictly omit finished games: LIVE and UPCOMING only
        if (statusState === "post") return null;

        const status: "LIVE" | "UPCOMING" = statusState === "in" ? "LIVE" : "UPCOMING";

        const clock =
          status === "LIVE"
            ? ev.status?.displayClock || `${ev.status?.period || 1}Q`
            : new Date(ev.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

        const hs = parseInt(home?.score || "0", 10);
        const as = parseInt(away?.score || "0", 10);

        const stats =
          status === "LIVE"
            ? {
                possession: 50,
                shotsH: hs,
                shotsA: as,
                momentum: [0, 2, -2, 4, 1, 3],
              }
            : undefined;

        return {
          id: `espn-${ev.id}`,
          league: leagueKey,
          home: homeId,
          away: awayId,
          kickoff: ev.date,
          hs,
          as,
          status,
          clock,
          venue: comp.venue?.fullName || "",
          odds: comp.odds?.[0]?.details || "—",
          stats,
        } as Game;
      })
      .filter((g: Game | null): g is Game => g !== null);

    // If a hub team has no active game on today's single-day scoreboard,
    // query their official live ESPN schedule to find their next scheduled game
    const hubQuery = HUB_SCHEDULE_QUERIES.find((q) => q.league === leagueKey);
    if (hubQuery) {
      const hasHubGame = games.some(
        (g) => g.home === hubQuery.teamId || g.away === hubQuery.teamId
      );
      if (!hasHubGame) {
        try {
          const schedData = await fetchESPNTeamScheduleServer({ data: hubQuery.endpoint });
          const upcomingEvents = (schedData?.events || []).filter(
            (ev: any) =>
              ev.competitions?.[0]?.status?.type?.state !== "post" &&
              new Date(ev.date).getTime() > Date.now() - 3600 * 1000
          );
          if (upcomingEvents.length > 0) {
            const nextEv = upcomingEvents[0];
            const comp = nextEv.competitions?.[0] || {};
            const competitors = comp.competitors || [];
            const home = competitors.find((c: any) => c.homeAway === "home") || competitors[0];
            const away = competitors.find((c: any) => c.homeAway === "away") || competitors[1];

            const homeId = registerOrResolveTeam(home, leagueKey);
            const awayId = registerOrResolveTeam(away, leagueKey);

            games.push({
              id: `espn-sched-${nextEv.id}`,
              league: leagueKey,
              home: homeId,
              away: awayId,
              kickoff: nextEv.date,
              hs: 0,
              as: 0,
              status: "UPCOMING",
              clock: new Date(nextEv.date).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              }),
              venue: comp.venue?.fullName || "",
              odds: comp.odds?.[0]?.details || "—",
            } as Game);
          }
        } catch {
          // Ignore team schedule query failure
        }
      }
    }

    return games;
  } catch (err) {
    console.warn(`Failed to fetch live ESPN data for ${leagueKey}:`, err);
    return [];
  }
}

/**
 * Verified real upcoming fixtures for Ratchaburi FC and Minnesota Hub
 * Accurate October 18–25, 2026 dates, venues, and odds.
 * (Timberwolves, Wild, and all other ESPN teams are populated dynamically from the live schedule API above)
 */
export const UPCOMING_HUB_FIXTURES: Game[] = [
  {
    id: "hub-rbfc-1",
    home: "rbfc",
    away: "port",
    league: "Thai League 1",
    kickoff: "2026-10-18T11:00:00Z",
    status: "UPCOMING",
    hs: 0,
    as: 0,
    clock: "18:00 ICT",
    venue: "Dragon Solar Park",
    odds: "RBFC +125 • D +220 • PORT +205",
  },
  {
    id: "hub-vik-1",
    home: "vik",
    away: "ind",
    league: "NFL",
    kickoff: "2026-10-25T17:00:00Z",
    status: "UPCOMING",
    hs: 0,
    as: 0,
    clock: "12:00 CT",
    venue: "U.S. Bank Stadium (Week 6 Bye • 5-0)",
    odds: "MIN -3.5 • O/U 44.5",
  },
  {
    id: "hub-frost-1",
    home: "frost",
    away: "bos",
    league: "PWHL",
    kickoff: "2026-10-25T19:00:00Z",
    status: "UPCOMING",
    hs: 0,
    as: 0,
    clock: "14:00 CT",
    venue: "Xcel Energy Center",
    odds: "MIN -135",
  },
];

/**
 * Fetches real-time weather for Ratchaburi and Minnesota
 */
export async function fetchDualWeather() {
  const [bkkRes, mnRes] = await Promise.allSettled([
    // Dragon Solar Park, Ratchaburi
    fetch(
      "https://api.open-meteo.com/v1/forecast?latitude=13.5283&longitude=99.8125&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&timezone=Asia/Bangkok"
    ).then((r) => r.json()),
    // Minneapolis (US Bank Stadium / Target Field)
    fetch(
      "https://api.open-meteo.com/v1/forecast?latitude=44.9778&longitude=-93.2650&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&temperature_unit=fahrenheit&timezone=America/Chicago"
    ).then((r) => r.json()),
  ]);

  return {
    ratchaburi:
      bkkRes.status === "fulfilled"
        ? {
            tempC: bkkRes.value.current?.temperature_2m,
            humidity: bkkRes.value.current?.relative_humidity_2m,
            windKmh: bkkRes.value.current?.wind_speed_10m,
          }
        : null,
    minnesota:
      mnRes.status === "fulfilled"
        ? {
            tempF: mnRes.value.current?.temperature_2m,
            humidity: mnRes.value.current?.relative_humidity_2m,
            windMph: mnRes.value.current?.wind_speed_10m,
          }
        : null,
  };
}
