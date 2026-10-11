import { Game, teamById, TEAMS } from "./sports-data";

// Free, CORS-friendly public ESPN scoreboard endpoints (no API key needed)
export const ESPN_LEAGUES: Record<string, string> = {
  NFL: "football/nfl",
  NBA: "basketball/nba",
  MLB: "baseball/mlb",
  NHL: "hockey/nhl",
  MLS: "soccer/usa.1",
  PL: "soccer/eng.1",
  WNBA: "basketball/wnba",
};

// Map ESPN abbreviations/names to your local Team IDs
const TEAM_NAME_TO_ID: Record<string, string> = {
  "vikings": "vik", "minnesota vikings": "vik", "min": "vik",
  "timberwolves": "twolves", "minnesota timberwolves": "twolves",
  "twins": "twins", "minnesota twins": "twins",
  "wild": "wild", "minnesota wild": "wild",
  "lynx": "lynx", "minnesota lynx": "lynx",
  "minnesota united": "mnufc", "minnesota united fc": "mnufc",
  "arsenal": "ars", "manchester city": "mci", "liverpool": "liv",
  "chelsea": "che", "real madrid": "rma", "barcelona": "fcb",
  "chiefs": "kc", "packers": "gb", "49ers": "sf",
  "celtics": "bos", "lakers": "lal", "warriors": "gsw",
  "yankees": "nyy", "dodgers": "lad",
  "ratchaburi": "rbfc", "ratchaburi fc": "rbfc",
};

export function resolveTeamId(rawName: string, rawAbbr: string, league: string): string {
  const norm = (rawName || "").toLowerCase().trim();
  const abbr = (rawAbbr || "").toLowerCase().trim();
  if (TEAM_NAME_TO_ID[norm]) return TEAM_NAME_TO_ID[norm];
  if (TEAM_NAME_TO_ID[abbr]) return TEAM_NAME_TO_ID[abbr];

  const found = TEAMS.find(
    (t) => t.name.toLowerCase().includes(norm) || norm.includes(t.name.toLowerCase())
  );
  return found ? found.id : `${league.toLowerCase()}-${abbr || "t"}`;
}

/**
 * Fetches real-time games from ESPN public scoreboards
 */
export async function fetchLiveESPNLeague(leagueKey: string, endpointKey: string): Promise<Game[]> {
  try {
    const res = await fetch(
      `https://site.api.espn.com/apis/site/v2/sports/${endpointKey}/scoreboard`,
      { cache: "no-store" }
    );
    if (!res.ok) return [];
    const data = await res.json();
    const events = data?.events || [];

    return events.map((ev: any) => {
      const comp = ev.competitions?.[0] || {};
      const competitors = comp.competitors || [];
      const home = competitors.find((c: any) => c.homeAway === "home") || competitors[0];
      const away = competitors.find((c: any) => c.homeAway === "away") || competitors[1];

      const homeId = resolveTeamId(home?.team?.name, home?.team?.abbreviation, leagueKey);
      const awayId = resolveTeamId(away?.team?.name, away?.team?.abbreviation, leagueKey);

      const statusState = ev.status?.type?.state; // 'pre' | 'in' | 'post'
      const status: "LIVE" | "UPCOMING" | "FINAL" =
        statusState === "in" ? "LIVE" : statusState === "post" ? "FINAL" : "UPCOMING";

      const clock =
        status === "LIVE"
          ? ev.status?.displayClock || `${ev.status?.period || 1}Q`
          : status === "FINAL"
          ? "FT"
          : new Date(ev.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

      return {
        id: `espn-${ev.id}`,
        league: leagueKey,
        home: homeId,
        away: awayId,
        hs: parseInt(home?.score || "0", 10),
        as: parseInt(away?.score || "0", 10),
        status,
        clock,
        tv: comp.broadcasts?.[0]?.names?.[0] || "ESPN / App",
        timeBKK: new Date(ev.date).toLocaleString("en-US", { timeZone: "Asia/Bangkok" }),
        timeCT: new Date(ev.date).toLocaleString("en-US", { timeZone: "America/Chicago" }),
        stats: {
          possession: [50, 50],
          shots: [Math.floor(Math.random() * 8) + 4, Math.floor(Math.random() * 8) + 4],
          xg: [1.2, 0.9],
          momentum: [0, 2, -3, 5, 8, -2, 6, 1],
        },
      } as Game;
    });
  } catch (err) {
    console.warn(`Failed to fetch live ESPN data for ${leagueKey}:`, err);
    return [];
  }
}

/**
 * Fetches live weather for both Ratchaburi and Minnesota
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
