import { useEffect, useState, useCallback } from "react";
import { fetchLiveESPNLeague, fetchDualWeather, ESPN_LEAGUES } from "@/lib/live-sports-api";
import { INITIAL_GAMES, Game } from "@/lib/sports-data";
import { toast } from "sonner";

export function useLiveSportsSync(isLiveEnabled: boolean, favTeamIds: string[]) {
  const [games, setGames] = useState<Game[]>(INITIAL_GAMES);
  const [dualWeather, setDualWeather] = useState<{
    ratchaburi: { tempC: number; humidity: number; windKmh: number } | null;
    minnesota: { tempF: number; humidity: number; windMph: number } | null;
  }>({ ratchaburi: null, minnesota: null });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const syncAllFeeds = useCallback(async () => {
    setIsRefreshing(true);
    try {
      // 1. Fetch dual weather
      const weather = await fetchDualWeather();
      setDualWeather(weather);

      // 2. Fetch all leagues in parallel from ESPN
      const leaguePromises = Object.entries(ESPN_LEAGUES).map(([leagueKey, endpoint]) =>
        fetchLiveESPNLeague(leagueKey, endpoint)
      );
      const results = await Promise.all(leaguePromises);
      const liveGames = results.flat();

      if (liveGames.length > 0) {
        setGames((prev) => {
          // Detect score changes for notifications
          liveGames.forEach((newGame) => {
            const old = prev.find((g) => g.id === newGame.id);
            if (old && (old.hs !== newGame.hs || old.as !== newGame.as)) {
              const isFav = favTeamIds.includes(newGame.home) || favTeamIds.includes(newGame.away);
              if (isFav) {
                toast.success(`⚡ Score Alert: ${newGame.hs} - ${newGame.as}!`);
                if (typeof navigator !== "undefined" && navigator.vibrate) {
                  navigator.vibrate([100, 50, 100]);
                }
              }
            }
          });

          // Merge live games with baseline games (Ratchaburi FC, PWHL, etc.)
          const baseline = prev.filter((g) => !g.id.startsWith("espn-"));
          return [...liveGames, ...baseline];
        });
      }
      setLastUpdated(new Date());
    } catch (e) {
      console.error("Live sync failed", e);
    } finally {
      setIsRefreshing(false);
    }
  }, [favTeamIds]);

  // Initial load
  useEffect(() => {
    syncAllFeeds();
  }, [syncAllFeeds]);

  // 20-second background poll when live toggle is ON
  useEffect(() => {
    if (!isLiveEnabled) return;
    const interval = setInterval(syncAllFeeds, 20_000);
    return () => clearInterval(interval);
  }, [isLiveEnabled, syncAllFeeds]);

  return { games, dualWeather, isRefreshing, lastUpdated, manualRefresh: syncAllFeeds };
}
