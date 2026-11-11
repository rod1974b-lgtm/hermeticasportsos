import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Hub,
  Lang,
  Team,
  Game,
  SPORTS_THEMES,
  TEAMS,
  LEAGUES,
  MN_IDS,
  T,
  teamById,
  fmtTime,
} from "@/lib/sports-data";
import {
  fetchLiveESPNLeague,
  ESPN_LEAGUES,
  fetchDualWeather,
  UPCOMING_HUB_FIXTURES,
} from "@/lib/live-sports-api";
import { HermitcaGamecast } from "@/components/HermitcaGamecast";
import {
  Radio,
  Star,
  Compass,
  Trophy,
  Sparkles,
  Flame,
  Search,
  Calendar,
  Share2,
  TrendingUp,
  RotateCcw,
  Clock,
  MapPin,
  ChevronRight,
  Shield,
  Activity,
  Award,
  Zap,
  Globe,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Target,
  BarChart3,
  Percent,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/")({
  head: () => ({
    title: "Hermetica Sports OS | Ratchaburi & Minnesota Twin Cities Live Sports",
    meta: [
      {
        name: "description",
        content:
          "Bilingual real-time Sports OS tracking Ratchaburi FC, all 7 Minnesota professional teams (Vikings, Timberwolves, Twins, Wild, Lynx, Frost, MNUFC), and global leagues with live scores, momentum radar, and year-round team pulse.",
      },
      {
        property: "og:title",
        content: "Hermetica Sports OS | Global & Hub Sports Command Center",
      },
      {
        property: "og:description",
        content:
          "Real-time dual-timezone sports tracking for Dragon Solar Park, Minnesota Twin Cities, and 14 international leagues.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: App,
});

// =========================================================================
// DATA MODELS & SEASON OUTLOOK
// =========================================================================

export type AppTab =
  | "live"
  | "pulse"
  | "my"
  | "seasons"
  | "explore"
  | "leagues"
  | "fantasy";

export type SeasonPhase =
  | "preseason"
  | "regular"
  | "playoffs"
  | "championship"
  | "offseason";

export interface KeyDate {
  date: string;
  label: { en: string; th: string };
  phase: SeasonPhase;
  highlight?: boolean;
}

export interface SeasonOutlook {
  teamId: string;
  seasonYear: string;
  currentPhase: SeasonPhase;
  phaseLabel: { en: string; th: string };
  summary: { en: string; th: string };
  keyDates: KeyDate[];
  playoffOdds?: string;
  championshipOdds?: string;
  projectedRecord?: string;
  milestones?: { en: string; th: string }[];
}

export const SEASON_OUTLOOKS: Record<string, SeasonOutlook> = {
  vik: {
    teamId: "vik",
    seasonYear: "2026-27",
    currentPhase: "regular",
    phaseLabel: { en: "Regular Season", th: "ฤดูกาลปกติ" },
    summary: {
      en: "Following a scorching 2-0 kickoff fueled by Brian Flores' aggressive blitz scheme, the Vikings aim for the NFC North crown. With high-efficiency quarterback play and Justin Jefferson stretching coverages, Minnesota is primed for a deep January playoff run.",
      th: "ออกสตาร์ทสุดร้อนแรงด้วยสถิติ 2-0 จากแผนเกมรับบุกแหลกของ ไบรอัน ฟลอเรส มินนิโซตา ไวกิ้งส์ ตั้งเป้าล่าแชมป์กลุ่ม NFC North การขับเคลื่อนเกมรุกที่มีประสิทธิภาพร่วมกับ จัสติน เจฟเฟอร์สัน พร้อมพาทีมลุยศึกเพลย์ออฟเดือนมกราคม",
    },
    projectedRecord: "11-6",
    playoffOdds: "82%",
    championshipOdds: "+1800",
    keyDates: [
      {
        date: "2026-08-08",
        label: { en: "Training Camp & Preseason Opener", th: "เปิดแคมป์ฝึกซ้อม & พรีซีซัน" },
        phase: "preseason",
      },
      {
        date: "2026-09-10",
        label: { en: "NFL Kickoff Weekend", th: "เปิดฤดูกาลปกติ NFL" },
        phase: "regular",
        highlight: true,
      },
      {
        date: "2026-09-28",
        label: { en: "Dublin Classic @ Croke Park vs Steelers", th: "ดับลิน คลาสสิก @ โครก พาร์ก พบ สตีลเลอร์ส" },
        phase: "regular",
        highlight: true,
      },
      {
        date: "2027-01-10",
        label: { en: "Regular Season Finale", th: "นัดปิดฤดูกาลปกติ" },
        phase: "regular",
      },
      {
        date: "2027-01-16",
        label: { en: "NFL Wild Card Weekend", th: "รอบไวลด์การ์ด NFL" },
        phase: "playoffs",
      },
      {
        date: "2027-02-14",
        label: { en: "Super Bowl LXI", th: "ซูเปอร์โบวล์ ครั้งที่ 61" },
        phase: "championship",
        highlight: true,
      },
      {
        date: "2027-03-15",
        label: { en: "NFL Free Agency & Draft Prep", th: "ตลาดฟรีเอเยนต์ & เตรียมการดราฟต์" },
        phase: "offseason",
      },
    ],
    milestones: [
      { en: "Top-5 NFL Scoring Defense ranking", th: "อันดับท็อป 5 เกมรับเสียแต้มน้อยที่สุดใน NFL" },
      { en: "Over 1,400 receiving yards projected for WR1", th: "เป้าหมายรับบอลทะลุ 1,400 หลาของปีกเบอร์ 1" },
    ],
  },
  wolves: {
    teamId: "wolves",
    seasonYear: "2026-27",
    currentPhase: "preseason",
    phaseLabel: { en: "Preseason / Training Camp", th: "พรีซีซัน & เทรนนิ่งแคมป์" },
    summary: {
      en: "Anthony Edwards steps into MVP contention surrounded by Rudy Gobert's interior deterrence and an upgraded perimeter arsenal. After deep Western Conference Finals runs, the target is the NBA Finals stage.",
      th: "แอนโทนี เอ็ดเวิร์ดส์ ก้าวสู่แคนดิเดต MVP เต็มตัว ผนึกกำลังกับเกมป้องกันวงในของ รูดี โกแบร์ หลังเข้าชิงแชมป์สายตะวันตก เป้าหมายเดียวคือการคว้าตั๋วเข้าสู่ NBA ไฟนอลส์",
    },
    projectedRecord: "53-29",
    playoffOdds: "91%",
    championshipOdds: "+950",
    keyDates: [
      {
        date: "2026-10-02",
        label: { en: "NBA Preseason Tip-off @ Target Center", th: "เปิดศึกพรีซีซัน @ ทาร์เก็ต เซ็นเตอร์" },
        phase: "preseason",
      },
      {
        date: "2026-10-22",
        label: { en: "Regular Season Home Opener", th: "เปิดฤดูกาลปกติเกมแรกในบ้าน" },
        phase: "regular",
        highlight: true,
      },
      {
        date: "2026-12-15",
        label: { en: "NBA Emirates Cup Knockouts", th: "เอมิเรตส์ เอ็นบีเอ คัพ รอบน็อกเอาต์" },
        phase: "regular",
      },
      {
        date: "2027-04-18",
        label: { en: "NBA Playoffs Round 1", th: "เปิดศึก NBA เพลย์ออฟ รอบแรก" },
        phase: "playoffs",
        highlight: true,
      },
      {
        date: "2027-06-03",
        label: { en: "NBA Finals Game 1", th: "NBA ไฟนอลส์ นัดแรก" },
        phase: "championship",
        highlight: true,
      },
      {
        date: "2027-06-25",
        label: { en: "NBA Draft & Free Agency Window", th: "งานดราฟต์ผู้เล่น & ตลาดฟรีเอเยนต์" },
        phase: "offseason",
      },
    ],
    milestones: [
      { en: "Defensive Rating ranking in league top-3", th: "เรตติ้งเกมรับติด 3 อันดับแรกของลีก" },
      { en: "Home court advantage through at least Round 2", th: "คว้าสิทธิ์เจ้าบ้านอย่างน้อยจนถึงรอบสอง" },
    ],
  },
  wild: {
    teamId: "wild",
    seasonYear: "2026-27",
    currentPhase: "regular",
    phaseLabel: { en: "Regular Season", th: "ฤดูกาลปกติ" },
    summary: {
      en: "Kaprizov and Boldy anchor one of the NHL's most dynamic scoring tandems. Freed from past buyout salary constraints, the Wild have deepened their blueline and enter the Central Division arms race as a true Stanley Cup dark horse.",
      th: "คิริลล์ คาปริซอฟ และ แมตต์ โบลดี นำทัพคู่แนวรุกอันตรายที่สุดใน NHL การพ้นเพดานค่าเหนื่อยช่วยเสริมแนวรับแกร่ง พร้อมท้าชิงแชมป์ดิวิชันเซ็นทรัลและลุ้นถ้วยสแตนลีย์คัพ",
    },
    projectedRecord: "48-25-9",
    playoffOdds: "79%",
    championshipOdds: "+2200",
    keyDates: [
      {
        date: "2026-09-21",
        label: { en: "NHL Preseason Training Camp", th: "พรีซีซัน & เทรนนิ่งแคมป์ฮอกกี้" },
        phase: "preseason",
      },
      {
        date: "2026-10-10",
        label: { en: "Home Opener vs Chicago Blackhawks", th: "เปิดบ้านพบ ชิคาโก แบล็กฮอว์กส์" },
        phase: "regular",
        highlight: true,
      },
      {
        date: "2027-01-01",
        label: { en: "NHL Winter Classic Showcase", th: "ศึกกลางแจ้ง วินเทอร์ คลาสสิก" },
        phase: "regular",
      },
      {
        date: "2027-04-14",
        label: { en: "Regular Season Conclusion", th: "ปิดฤดูกาลปกติ NHL" },
        phase: "regular",
      },
      {
        date: "2027-04-19",
        label: { en: "Stanley Cup Playoffs Begin", th: "เปิดศึกสแตนลีย์ คัพ เพลย์ออฟ" },
        phase: "playoffs",
        highlight: true,
      },
      {
        date: "2027-06-10",
        label: { en: "Stanley Cup Finals", th: "สแตนลีย์ คัพ รอบชิงชนะเลิศ" },
        phase: "championship",
        highlight: true,
      },
    ],
  },
  twins: {
    teamId: "twins",
    seasonYear: "2026",
    currentPhase: "offseason",
    phaseLabel: { en: "Offseason & Hot Stove", th: "ช่วงปิดฤดูกาล & ตลาดซื้อขาย" },
    summary: {
      en: "After a season testing young talent like Emmanuel Rodriguez and young bullpen arms, the Twins pivot toward pitching acquisitions and roster re-tooling ahead of Fort Myers Spring Training.",
      th: "หลังเปิดโอกาสให้ดาวรุ่งอย่าง เอ็มมานูเอล โรดริเกซ ฉายแวว มินนิโซตา ทวินส์ เดินหน้าเสริมพิชเชอร์และปรับโครงสร้างทีมเพื่อเตรียมความพร้อมสู่สปริงเทรนนิ่งที่ฟอร์ตไมเออร์ส",
    },
    projectedRecord: "84-78",
    playoffOdds: "48%",
    championshipOdds: "+4500",
    keyDates: [
      {
        date: "2026-11-05",
        label: { en: "MLB Free Agency & Trade Meetings", th: "เปิดตลาดฟรีเอเยนต์ & ประชุมเทรดผู้เล่น" },
        phase: "offseason",
      },
      {
        date: "2027-02-14",
        label: { en: "Pitchers & Catchers Report (Fort Myers)", th: "พิชเชอร์ & แคชเชอร์ รายงานตัวสปริงเทรนนิ่ง" },
        phase: "preseason",
        highlight: true,
      },
      {
        date: "2027-03-27",
        label: { en: "MLB Opening Day 2027", th: "วันเปิดฤดูกาลเบสบอล MLB 2027" },
        phase: "regular",
        highlight: true,
      },
      {
        date: "2027-10-01",
        label: { en: "Postseason AL Wild Card Series", th: "รอบไวลด์การ์ด อเมริกันลีก" },
        phase: "playoffs",
      },
    ],
  },
  lynx: {
    teamId: "lynx",
    seasonYear: "2026",
    currentPhase: "championship",
    phaseLabel: { en: "WNBA Finals / Title Chase", th: "รอบชิงชนะเลิศ WNBA" },
    summary: {
      en: "Led by Napheesa Collier's historic MVP-caliber season and Courtney Williams' playmaking, the Lynx sit on the precipice of securing franchise championship banner #5.",
      th: "นำโดย นาฟีซา คอลเลียร์ ที่ระเบิดฟอร์มระดับ MVP มินนิโซตา ลิงซ์ ยืนหยัดอยู่บนเส้นทางล่าแชมป์ WNBA สมัยที่ 5 ของประวัติศาสตร์สโมสร",
    },
    projectedRecord: "33-7",
    playoffOdds: "100%",
    championshipOdds: "+140",
    keyDates: [
      {
        date: "2026-05-15",
        label: { en: "WNBA Season Tip-Off", th: "เปิดฉากฤดูกาล WNBA" },
        phase: "regular",
      },
      {
        date: "2026-09-20",
        label: { en: "WNBA Playoffs Round 1", th: "เพลย์ออฟ รอบแรก" },
        phase: "playoffs",
      },
      {
        date: "2026-10-10",
        label: { en: "WNBA Finals Game 1", th: "WNBA ไฟนอลส์ นัดแรก" },
        phase: "championship",
        highlight: true,
      },
      {
        date: "2026-10-22",
        label: { en: "WNBA Trophy Presentation & Parade", th: "พิธีมอบแชมป์และขบวนพาเหรด" },
        phase: "championship",
      },
    ],
  },
  frost: {
    teamId: "frost",
    seasonYear: "2026-27",
    currentPhase: "preseason",
    phaseLabel: { en: "Preseason / Defense of the Cup", th: "เตรียมป้องกันแชมป์วอลเตอร์ คัพ" },
    summary: {
      en: "The back-to-back Walter Cup Champions return with Taylor Heise, Kendall Coyne Schofield, and Nicole Hensley. The Frost represent the premier dynasty in professional women's ice hockey.",
      th: "แชมป์วอลเตอร์ คัพ 2 สมัยซ้อน กลับมาพร้อม เทย์เลอร์ ไฮซี และ เคนดัลล์ คอยน์ ทัพฟรอสต์ยืนหยัดในฐานะทีมเต็งหนึ่งแห่งวงการฮอกกี้น้ำแข็งหญิงอาชีพโลก",
    },
    projectedRecord: "20-6-4",
    playoffOdds: "94%",
    championshipOdds: "+160",
    keyDates: [
      {
        date: "2026-11-15",
        label: { en: "PWHL Training Camps Open", th: "เปิดแคมป์ฝึกซ้อม PWHL" },
        phase: "preseason",
      },
      {
        date: "2026-12-01",
        label: { en: "Championship Banner Raising @ Xcel", th: "พิธีแขวนแบนเนอร์แชมป์ @ เอ็กเซล เซ็นเตอร์" },
        phase: "regular",
        highlight: true,
      },
      {
        date: "2027-05-02",
        label: { en: "Walter Cup Playoffs Commence", th: "เปิดศึกวอลเตอร์ คัพ เพลย์ออฟ" },
        phase: "playoffs",
        highlight: true,
      },
    ],
  },
  mnufc: {
    teamId: "mnufc",
    seasonYear: "2026",
    currentPhase: "regular",
    phaseLabel: { en: "MLS Decision Day Push", th: "โค้งสุดท้ายลุ้นตั๋วเพลย์ออฟ MLS" },
    summary: {
      en: "The Loons are battling down to the wire for Audi MLS Cup Playoff seeding. High-pressing transitions and set-piece mastery under the Allianz Field lights are key to their knockout ambitions.",
      th: "เดอะ ลูนส์ กำลังสู้สุดชีวิตเพื่อคว้าโควตาเพลย์ออฟ เมเจอร์ลีก ซอกเกอร์ สไตล์การเพรสซิ่งสูงและการเล่นลูกตั้งเตะที่ อลิอันซ์ ฟิลด์ คือกุญแจสำคัญสู่รอบน็อกเอาต์",
    },
    projectedRecord: "13-11-10",
    playoffOdds: "64%",
    championshipOdds: "+3300",
    keyDates: [
      {
        date: "2026-02-28",
        label: { en: "MLS Season Opener", th: "เปิดฤดูกาล MLS" },
        phase: "regular",
      },
      {
        date: "2026-10-18",
        label: { en: "MLS Decision Day Finale", th: "ศึกตัดสินวันสุดท้าย MLS Decision Day" },
        phase: "regular",
        highlight: true,
      },
      {
        date: "2026-10-25",
        label: { en: "Audi MLS Cup Playoffs Round 1", th: "รอบแรก อาวดี้ เอ็มแอลเอส คัพ เพลย์ออฟ" },
        phase: "playoffs",
      },
    ],
  },
  rbfc: {
    teamId: "rbfc",
    seasonYear: "2026-27",
    currentPhase: "regular",
    phaseLabel: { en: "Thai League 1 Campaign", th: "ศึกรีโว่ ไทยลีก 1" },
    summary: {
      en: "The Dragons have turned Dragon Solar Park into an impenetrable fortress in Thai League 1. Backed by explosive counter-attacking football and fierce local pride, Ratchaburi is hunting for top-3 honors and an AFC Champions League berth.",
      th: "ราชันมังกร เปลี่ยนสนาม ดราก้อน โซลาร์ พาร์ค ให้เป็นปราการไร้พ่ายในไทยลีก 1 ด้วยแท็กติกเกมสวนกลับที่เฉียบคมและพลังใจจากแฟนบอลท้องถิ่น ราชบุรี มุ่งมั่นจบอันดับท็อป 3 เพื่อคว้าตั๋วลุยศึกสโมสรเอเชีย AFC Champions League",
    },
    projectedRecord: "W17 D8 L5",
    playoffOdds: "Top 3: 72%",
    championshipOdds: "+600",
    keyDates: [
      {
        date: "2026-08-14",
        label: { en: "Thai League 1 Season Opener", th: "เปิดฉาก รีโว่ ไทยลีก 1" },
        phase: "regular",
      },
      {
        date: "2026-11-01",
        label: { en: "Derby vs Buriram United @ Home", th: "บิ๊กแมตช์พบ บุรีรัมย์ ยูไนเต็ด ในบ้าน" },
        phase: "regular",
        highlight: true,
      },
      {
        date: "2027-02-20",
        label: { en: "FA Cup Quarter-Finals", th: "ช้าง เอฟเอ คัพ รอบ 8 ทีมสุดท้าย" },
        phase: "playoffs",
      },
      {
        date: "2027-05-15",
        label: { en: "Thai League 1 Final Matchday", th: "นัดปิดฤดูกาล ไทยลีก 1" },
        phase: "regular",
        highlight: true,
      },
    ],
  },
};

export function getTeamSeasonOutlook(team: Team): SeasonOutlook {
  const found = SEASON_OUTLOOKS[team.id];
  if (found) {
    return found;
  }

  return {
    teamId: team.id,
    seasonYear: "2026-27",
    currentPhase: "regular",
    phaseLabel: { en: "Competitive Season", th: "ฤดูกาลแข่งขันปัจจุบัน" },
    summary: {
      en: `${team.name} continues their campaign in ${team.league || "Global Sports"}, focusing on tactical execution, roster depth, and championship contention.`,
      th: `${team.th || team.name} เดินหน้าแข่งขันในลีก ${team.league || "กีฬาอาชีพ"} มุ่งมั่นสร้างฟอร์มเพื่อลุ้นตั๋วเพลย์ออฟและเกียรติยศสูงสุด`,
    },
    keyDates: [
      {
        date: "2026-10-01",
        label: { en: "Mid-Season Pivotal Stretch", th: "ช่วงชี้ชะตากลางฤดูกาล" },
        phase: "regular",
      },
      {
        date: "2027-04-15",
        label: { en: "Championship Knockout Phase", th: "รอบน็อกเอาต์ชิงแชมป์" },
        phase: "playoffs",
        highlight: true,
      },
    ],
    projectedRecord: team.record || "Contender",
    playoffOdds: "60%",
    championshipOdds: "+2500",
  };
}

// Year-round Pulse Score Calculator
export function calculateYearRoundPulseScore(team: Team, outlook: SeasonOutlook): number {
  let score = 50;

  switch (outlook.currentPhase) {
    case "championship":
      score += 38;
      break;
    case "playoffs":
      score += 28;
      break;
    case "regular":
      score += 18;
      break;
    case "preseason":
      score += 10;
      break;
    case "offseason":
      score += 4;
      break;
  }

  if (team.sentiment) {
    const boost = Math.round((team.sentiment.pct - 50) * 0.3);
    score += boost;
  }

  if (team.hub === "ratchaburi" || team.hub === "minnesota") {
    score += 5;
  }

  return Math.max(10, Math.min(99, score));
}

// =========================================================================
// HOOKS & UTILITIES
// =========================================================================

function useLocal<T>(
  key: string,
  init: T
): [T, (val: T | ((prev: T) => T)) => void] {
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
    (newVal: T | ((prev: T) => T)) => {
      setVal((prev) => {
        const next =
          typeof newVal === "function" ? (newVal as (prev: T) => T)(prev) : newVal;
        try {
          localStorage.setItem(key, JSON.stringify(next));
        } catch (err) {
          console.error("Failed to save to localStorage:", err);
        }
        return next;
      });
    },
    [key]
  );

  return [val, update];
}

const tabs = (t: (typeof T)["en"], lang: Lang) =>
  [
    { key: "live", label: t.live, icon: Radio },
    { key: "pulse", label: lang === "th" ? "สปอร์ต เพลส์" : "Pulse", icon: Activity },
    { key: "my", label: t.my, icon: Star },
    { key: "seasons", label: lang === "th" ? "ซีซันส์" : "Seasons", icon: Calendar },
    { key: "explore", label: t.explore, icon: Compass },
    { key: "leagues", label: t.leagues, icon: Trophy },
    { key: "fantasy", label: t.fantasy, icon: Sparkles },
  ] as const;

// =========================================================================
// MAIN APP COMPONENT
// =========================================================================

export default function App() {
  const [hub, setHub] = useLocal<Hub>("sos-hub", "all");
  const [tab, setTab] = useLocal<AppTab>("sos-tab", "live");
  const [lang, setLang] = useLocal<Lang>("sos-lang", "en");
  const [favs, setFavs] = useLocal<string[]>("sos-favs", ["vik", "wolves", "rbfc"]);
  const [preds, setPreds] = useLocal<Record<string, string>>("sos-preds", {});
  const [now, setNow] = useState<Date>(() => new Date());
  const [mounted, setMounted] = useState<boolean>(false);
  const [games, setGames] = useState<Game[]>(() => UPCOMING_HUB_FIXTURES);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(() => new Date());
  const [dualWeather, setDualWeather] = useState<{
    ratchaburi?: { tempC?: number; condition?: string; rainChance?: number } | null;
    minnesota?: { tempF?: number; humidity?: number; windMph?: number } | null;
  }>({});
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);

  const t = T[lang];

  useEffect(() => {
    setMounted(true);
  }, []);

  // Tick clock every second
  useEffect(() => {
    const i = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(i);
  }, []);

  // Fetch Dual Weather
  useEffect(() => {
    let active = true;
    const loadWeather = async () => {
      try {
        const data = await fetchDualWeather();
        if (active && data) {
          setDualWeather(data);
        }
      } catch (err) {
        console.error("Failed to load dual weather:", err);
      }
    };
    loadWeather();
    const wInterval = setInterval(loadWeather, 60000);
    return () => clearInterval(wInterval);
  }, []);

  // Refresh live scoreboards across 14 leagues
  const refreshLiveScores = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const settled = await Promise.allSettled(
        Object.entries(ESPN_LEAGUES).map(([leagueKey, endpoint]) =>
          fetchLiveESPNLeague(leagueKey, endpoint)
        )
      );

      const allLiveGames: Game[] = [];
      for (const res of settled) {
        if (res.status === "fulfilled" && Array.isArray(res.value)) {
          allLiveGames.push(...res.value);
        }
      }

      if (allLiveGames.length > 0) {
        const liveOrUpcoming = allLiveGames.filter(
          (g) => g.status === "LIVE" || g.status === "UPCOMING"
        );
        const combined = [...liveOrUpcoming, ...UPCOMING_HUB_FIXTURES];

        // Deduplicate games
        const seen = new Set<string>();
        const unique = combined.filter((g) => {
          const key = `${g.home}-${g.away}-${(g.kickoff || "").slice(0, 10)}`;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });

        // Sort: LIVE first, then UPCOMING by kickoff time
        unique.sort((a, b) => {
          if (a.status === "LIVE" && b.status !== "LIVE") return -1;
          if (b.status === "LIVE" && a.status !== "LIVE") return 1;
          return new Date(a.kickoff).getTime() - new Date(b.kickoff).getTime();
        });

        setGames(unique);
      }
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Error refreshing live sports:", err);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  // Initial fetch and 30-second live polling interval
  useEffect(() => {
    refreshLiveScores();
    const interval = setInterval(refreshLiveScores, 30000);
    return () => clearInterval(interval);
  }, [refreshLiveScores]);

  const toggleFav = (id: string) => {
    setFavs((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const addAllMN = () => {
    setFavs((prev) => Array.from(new Set([...prev, ...MN_IDS])));
    toast.success(
      lang === "th" ? "เพิ่มทุกทีมมินนิโซตาแล้ว" : "All Minnesota teams added to favorites!"
    );
  };

  const hubGames = useMemo(() => {
    if (hub === "all") return games;
    if (hub === "ratchaburi") {
      return games.filter(
        (g) => g.home === "rbfc" || g.away === "rbfc" || g.league === "Thai League 1"
      );
    }
    if (hub === "minnesota") {
      return games.filter(
        (g) => MN_IDS.includes(g.home) || MN_IDS.includes(g.away)
      );
    }
    return games;
  }, [games, hub]);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-primary selection:text-primary-foreground pb-20 md:pb-6">
      {/* Top Header & Command Center */}
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground font-black text-xl shadow-lg shadow-primary/25">
              H
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display text-lg font-bold tracking-tight">
                  HERMETICA <span className="text-primary">SPORTS OS</span>
                </h1>
                <span className="hidden sm:inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/20">
                  <span className="mr-1 h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  RADAR ACTIVE
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground font-medium">
                Dragon Solar Park 🇹🇭 ⇄ Minnesota Twin Cities 🇺🇸
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Hub Selector */}
            <div className="flex rounded-xl bg-secondary/80 p-1 border border-border/50 text-xs font-semibold">
              <button
                onClick={() => setHub("all")}
                className={`rounded-lg px-2.5 py-1 transition cursor-pointer ${
                  hub === "all"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {lang === "th" ? "ทุกฮับ" : "All Hubs"}
              </button>
              <button
                onClick={() => setHub("ratchaburi")}
                className={`rounded-lg px-2.5 py-1 transition cursor-pointer flex items-center gap-1 ${
                  hub === "ratchaburi"
                    ? "bg-[#FF6600] text-white shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <span>🐉</span> Ratchaburi
              </button>
              <button
                onClick={() => setHub("minnesota")}
                className={`rounded-lg px-2.5 py-1 transition cursor-pointer flex items-center gap-1 ${
                  hub === "minnesota"
                    ? "bg-[#4F2683] text-[#FFC62F] shadow-sm font-bold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <span>⭐</span> Minnesota
              </button>
            </div>

            {/* Language Toggle */}
            <button
              onClick={() => setLang(lang === "en" ? "th" : "en")}
              className="rounded-xl border border-border/60 bg-secondary/80 px-2.5 py-1.5 text-xs font-bold transition hover:bg-secondary cursor-pointer"
            >
              {lang === "en" ? "ไทย" : "EN"}
            </button>

            {/* Refresh Live Button */}
            <button
              onClick={refreshLiveScores}
              disabled={isRefreshing}
              title="Poll live scoreboard feeds"
              className="rounded-xl border border-border/60 bg-secondary/80 p-2 text-xs transition hover:bg-secondary cursor-pointer disabled:opacity-50"
            >
              <RotateCcw
                className={`h-4 w-4 ${isRefreshing ? "animate-spin text-primary" : ""}`}
              />
            </button>
          </div>
        </div>

        {/* Global Live Ticker */}
        <Ticker games={games} lang={lang} onSelectGame={setSelectedGame} />
      </header>

      {/* Main Content Area */}
      <main className="mx-auto max-w-6xl px-4 py-5 space-y-5">
        <HubInfo
          hub={hub}
          lang={lang}
          now={now}
          weather={dualWeather}
          onAddAllMN={addAllMN}
        />

        {tab === "live" && (
          <LiveTab
            games={games}
            hub={hub}
            lang={lang}
            favs={favs}
            toggleFav={toggleFav}
            preds={preds}
            setPreds={setPreds}
            onSelectGame={setSelectedGame}
            isRefreshing={isRefreshing}
            onRefresh={refreshLiveScores}
            lastUpdated={lastUpdated}
          />
        )}

        {tab === "pulse" && (
          <PulseTab
            hub={hub}
            lang={lang}
            favs={favs}
            toggleFav={toggleFav}
            onSelectTeam={(teamId) => {
              setSelectedTeamId(teamId);
              setTab("seasons");
            }}
          />
        )}

        {tab === "my" && (
          <MyTab
            favs={favs}
            toggleFav={toggleFav}
            lang={lang}
            games={games}
            onAddAllMN={addAllMN}
            onSelectGame={setSelectedGame}
            onSelectTeam={(teamId) => {
              setSelectedTeamId(teamId);
              setTab("seasons");
            }}
          />
        )}

        {tab === "seasons" && (
          <SeasonsTab
            lang={lang}
            hub={hub}
            favs={favs}
            toggleFav={toggleFav}
            selectedTeamId={selectedTeamId}
            onSelectTeamId={setSelectedTeamId}
          />
        )}

        {tab === "explore" && (
          <ExploreTab
            lang={lang}
            favs={favs}
            toggleFav={toggleFav}
            onAddAllMN={addAllMN}
            onSelectTeam={(teamId) => {
              setSelectedTeamId(teamId);
              setTab("seasons");
            }}
          />
        )}

        {tab === "leagues" && (
          <LeaguesTab
            games={games}
            lang={lang}
            onSelectLeague={() => setTab("live")}
          />
        )}

        {tab === "fantasy" && (
          <FantasyTab
            lang={lang}
            favs={favs}
            games={games}
            preds={preds}
            setPreds={setPreds}
          />
        )}
      </main>

      {/* Floating Gamecast Modal */}
      {selectedGame && (
        <HermitcaGamecast
          game={selectedGame}
          onClose={() => setSelectedGame(null)}
          onSelectGame={setSelectedGame}
          lang={lang}
        />
      )}

      {/* Bottom Floating Navigation Bar */}
      <nav className="fixed bottom-3 left-1/2 -translate-x-1/2 z-40 w-[95%] max-w-lg rounded-2xl border border-white/10 bg-card/90 p-1.5 shadow-2xl backdrop-blur-xl">
        <div className="flex items-center justify-around">
          {tabs(t, lang).map((item) => {
            const Icon = item.icon;
            const active = tab === item.key;
            return (
              <button
                key={item.key}
                onClick={() => setTab(item.key as AppTab)}
                className={`relative flex flex-col items-center justify-center rounded-xl px-3 py-1.5 text-[11px] font-bold transition cursor-pointer ${
                  active
                    ? "text-primary bg-primary/10 shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className={`h-4 w-4 ${active ? "scale-110" : ""}`} />
                <span className="mt-0.5">{item.label}</span>
                {item.key === "live" && games.some((g) => g.status === "LIVE") && (
                  <span className="absolute top-1 right-2 h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

// =========================================================================
// SUBCOMPONENTS
// =========================================================================

export function Seal({ t, size = 36 }: { t: Team; size?: number }) {
  const [imgError, setImgError] = useState(false);
  const logoUrl = t.logo;

  if (logoUrl && !imgError) {
    return (
      <div
        style={{ width: size, height: size }}
        className="relative flex items-center justify-center rounded-xl bg-white/5 border border-white/10 p-1 select-none shrink-0 overflow-hidden shadow-sm backdrop-blur-xs"
      >
        <img
          src={logoUrl}
          alt={t.name}
          className="w-full h-full object-contain drop-shadow-sm transition-transform duration-200 hover:scale-105"
          onError={() => setImgError(true)}
          loading="lazy"
        />
      </div>
    );
  }

  return (
    <div
      style={{
        backgroundColor: t.color,
        color: t.accent,
        width: size,
        height: size,
        boxShadow: `0 2px 8px ${t.color}40`,
      }}
      className="flex items-center justify-center rounded-xl font-display font-bold tracking-wider text-xs border border-white/20 select-none shrink-0"
    >
      {t.seal}
    </div>
  );
}

function HubInfo({
  hub,
  lang,
  now,
  weather,
  onAddAllMN,
}: {
  hub: Hub;
  lang: Lang;
  now: Date;
  weather: any;
  onAddAllMN: () => void;
}) {
  const ictTime = now.toLocaleTimeString("en-US", {
    timeZone: "Asia/Bangkok",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const ctTime = now.toLocaleTimeString("en-US", {
    timeZone: "America/Chicago",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  return (
    <div className="relative overflow-hidden rounded-3xl border border-border/70 bg-gradient-to-r from-card/90 via-card/50 to-card/90 p-5 shadow-xl backdrop-blur-md">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">
              {hub === "ratchaburi" ? "🐉" : hub === "minnesota" ? "⭐" : "🌐"}
            </span>
            <h2 className="font-display text-xl font-bold tracking-tight">
              {hub === "ratchaburi"
                ? "Ratchaburi FC Dragon Solar Park"
                : hub === "minnesota"
                ? "Minnesota Twin Cities 7-Team Hub"
                : "Global Sports Command Center"}
            </h2>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {lang === "th"
              ? "ระบบติดตามการแข่งขันสดแบบเรียลไทม์ เชื่อมโยงสนามราชบุรีและมินนิโซตา"
              : "Live fixture tracker, attack radar, and year-round season pulse."}
          </p>
        </div>

        {/* Dual Clocks & Weather */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Bangkok / Ratchaburi Clock */}
          <div className="rounded-2xl border border-border/80 bg-background/60 px-3.5 py-2 shadow-sm">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase">
              <span>🇹🇭 ICT Bangkok</span>
            </div>
            <div className="font-mono text-sm font-bold text-[#FF6600]">{ictTime}</div>
            <div className="text-[10px] text-muted-foreground">
              {weather.ratchaburi?.tempC !== undefined
                ? `${weather.ratchaburi.tempC}°C • ${weather.ratchaburi.condition || "Fair"}`
                : "Dragon Solar Park"}
            </div>
          </div>

          {/* Minneapolis Twin Cities Clock */}
          <div className="rounded-2xl border border-border/80 bg-background/60 px-3.5 py-2 shadow-sm">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase">
              <span>🇺🇸 CT Minneapolis</span>
            </div>
            <div className="font-mono text-sm font-bold text-[#FFC62F]">{ctTime}</div>
            <div className="text-[10px] text-muted-foreground">
              {weather.minnesota?.tempF !== undefined
                ? `${weather.minnesota.tempF}°F • Twin Cities`
                : "Target Field / US Bank"}
            </div>
          </div>

          {/* Quick Add MN Button */}
          {hub !== "ratchaburi" && (
            <button
              onClick={onAddAllMN}
              className="rounded-2xl border border-primary/30 bg-primary/10 px-3.5 py-2 text-xs font-bold text-primary transition hover:bg-primary hover:text-primary-foreground shadow-sm cursor-pointer"
            >
              ★ {lang === "th" ? "+7 ทีมมินนิโซตา" : "+All 7 MN Teams"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Ticker({
  games,
  lang,
  onSelectGame,
}: {
  games: Game[];
  lang: Lang;
  onSelectGame: (g: Game) => void;
}) {
  const tickerItems = games.slice(0, 15);

  return (
    <div className="relative overflow-hidden border-t border-border/40 bg-card/60 py-2 text-xs select-none">
      <div
        className="flex w-max gap-8 animate-marquee"
        style={{ animationDuration: "90s" }}
      >
        {tickerItems.map((g, idx) => {
          const home = teamById(g.home);
          const away = teamById(g.away);
          const isLive = g.status === "LIVE";

          return (
            <div
              key={`${g.id}-${idx}`}
              onClick={() => onSelectGame(g)}
              className="flex items-center gap-2 cursor-pointer transition hover:text-primary shrink-0"
            >
              <span className="font-mono text-[10px] font-bold text-muted-foreground uppercase">
                {g.league}
              </span>
              {isLive ? (
                <span className="flex items-center gap-1 text-red-500 font-bold">
                  <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                  {g.clock}
                </span>
              ) : (
                <span className="text-muted-foreground">
                  {fmtTime(g.kickoff, "Asia/Bangkok", lang)}
                </span>
              )}
              <div className="flex items-center gap-1.5 font-semibold">
                <Seal t={away} size={18} />
                <span>{away.seal}</span>
                <span className="font-mono text-muted-foreground">
                  {isLive ? g.as : ""}
                </span>
                <span className="text-muted-foreground/60">@</span>
                <Seal t={home} size={18} />
                <span>{home.seal}</span>
                <span className="font-mono text-muted-foreground">
                  {isLive ? g.hs : ""}
                </span>
              </div>
              <span className="text-border/80">|</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// =========================================================================
// TAB: LIVE GAMES & ACTIVE RADAR
// =========================================================================

function LiveTab({
  games,
  hub,
  lang,
  favs,
  toggleFav,
  preds,
  setPreds,
  onSelectGame,
  isRefreshing,
  onRefresh,
  lastUpdated,
}: {
  games: Game[];
  hub: Hub;
  lang: Lang;
  favs: string[];
  toggleFav: (id: string) => void;
  preds: Record<string, string>;
  setPreds: (p: Record<string, string>) => void;
  onSelectGame: (g: Game) => void;
  isRefreshing: boolean;
  onRefresh: () => void;
  lastUpdated: Date;
}) {
  const [filter, setFilter] = useState<"all" | "hub" | "favs">("all");

  const filtered = useMemo(() => {
    if (filter === "favs") {
      return games.filter((g) => favs.includes(g.home) || favs.includes(g.away));
    }
    if (filter === "hub") {
      if (hub === "ratchaburi") {
        return games.filter(
          (g) => g.home === "rbfc" || g.away === "rbfc" || g.league === "Thai League 1"
        );
      }
      if (hub === "minnesota") {
        return games.filter(
          (g) => MN_IDS.includes(g.home) || MN_IDS.includes(g.away)
        );
      }
    }
    return games;
  }, [games, filter, favs, hub]);

  const liveGames = filtered.filter((g) => g.status === "LIVE");
  const upcomingGames = filtered.filter((g) => g.status === "UPCOMING");
  const allLiveCount = games.filter((g) => g.status === "LIVE").length;

  return (
    <div className="space-y-6">
      {/* Live Radar Status Banner */}
      <div className="rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/10 via-card/70 to-card/90 p-4 shadow-sm backdrop-blur-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-primary/20 text-primary">
              <Radio className="h-5 w-5 animate-pulse" />
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display text-sm font-bold tracking-wide">
                  GLOBAL SPORTS RADAR
                </span>
                <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/20">
                  14 LEAGUES CONNECTED
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {allLiveCount > 0
                  ? `${allLiveCount} games currently active in real-time`
                  : `0 games live right now • Monitoring slates across NFL, NBA, MLB, NHL, EPL, & Thai League`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
            <span>
              Updated: {lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
            </span>
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="rounded-lg border border-border/60 bg-secondary/80 px-2.5 py-1 font-sans font-bold hover:bg-secondary cursor-pointer"
            >
              {isRefreshing ? "Polling..." : "Refresh"}
            </button>
          </div>
        </div>
      </div>

      {/* Scope Filter Tabs */}
      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setFilter("all")}
            className={`rounded-xl px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
              filter === "all"
                ? "bg-primary text-primary-foreground"
                : "border border-border bg-card text-muted-foreground"
            }`}
          >
            All Monitored Games ({games.length})
          </button>
          {hub !== "all" && (
            <button
              onClick={() => setFilter("hub")}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                filter === "hub"
                  ? "bg-primary text-primary-foreground"
                  : "border border-border bg-card text-muted-foreground"
              }`}
            >
              {hub === "ratchaburi" ? "🐉 Ratchaburi Focus" : "⭐ Minnesota Focus"}
            </button>
          )}
          <button
            onClick={() => setFilter("favs")}
            className={`rounded-xl px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
              filter === "favs"
                ? "bg-primary text-primary-foreground"
                : "border border-border bg-card text-muted-foreground"
            }`}
          >
            ★ My Teams Only ({favs.length})
          </button>
        </div>
      </div>

      {/* Live Active Games */}
      {liveGames.length > 0 ? (
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse" />
            <h2 className="font-display text-lg tracking-wide text-red-500">
              LIVE RIGHT NOW ({liveGames.length})
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {liveGames.map((game) => (
              <GameCard
                key={game.id}
                game={game}
                lang={lang}
                isFav={favs.includes(game.home) || favs.includes(game.away)}
                toggleFav={() => toggleFav(game.home)}
                pred={preds[game.id]}
                setPred={(tId) => setPreds({ ...preds, [game.id]: tId })}
                onSelect={() => onSelectGame(game)}
              />
            ))}
          </div>
        </section>
      ) : (
        <div className="rounded-2xl border border-dashed border-border/80 bg-card/40 p-6 text-center space-y-2">
          <div className="flex justify-center text-muted-foreground">
            <Clock className="h-8 w-8 text-primary/60" />
          </div>
          <h3 className="font-display text-base font-bold">
            {lang === "th" ? "ไม่มีการแข่งขันสดในขณะนี้" : "No Games In Progress Right Now"}
          </h3>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            {lang === "th"
              ? "ระบบเรดาร์เชื่อมต่อพร้อม 14 ลีกทั่วโลก โปรแกรมการแข่งขันจะอัปเดตสถานะสดทันทีเมื่อเริ่มเขี่ยบอล"
              : "All 14 ESPN endpoints are connected and monitoring. Scheduled games for today's slate are queued below."}
          </p>
        </div>
      )}

      {/* Upcoming Games */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            <h2 className="font-display text-lg tracking-wide">
              {lang === "th" ? "โปรแกรมการแข่งขันถัดไป" : "UPCOMING GAMES"}
            </h2>
          </div>
          <span className="text-xs text-muted-foreground font-mono">
            {upcomingGames.length} scheduled
          </span>
        </div>

        {upcomingGames.length === 0 ? (
          <div className="rounded-2xl border border-border/60 bg-card/40 p-6 text-center text-xs text-muted-foreground">
            No upcoming games found for the selected view.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {upcomingGames.map((game) => (
              <GameCard
                key={game.id}
                game={game}
                lang={lang}
                isFav={favs.includes(game.home) || favs.includes(game.away)}
                toggleFav={() => toggleFav(game.home)}
                pred={preds[game.id]}
                setPred={(tId) => setPreds({ ...preds, [game.id]: tId })}
                onSelect={() => onSelectGame(game)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

// =========================================================================
// TAB: PULSE (YEAR-ROUND INTENSITY & NARRATIVES)
// =========================================================================

function PulseTab({
  hub,
  lang,
  favs,
  toggleFav,
  onSelectTeam,
}: {
  hub: Hub;
  lang: Lang;
  favs: string[];
  toggleFav: (id: string) => void;
  onSelectTeam: (id: string) => void;
}) {
  const [pulseFilter, setPulseFilter] = useState<"all" | "hub" | "favs">("all");

  const rankedTeams = useMemo(() => {
    let pool = TEAMS;
    if (pulseFilter === "favs") {
      pool = pool.filter((t) => favs.includes(t.id));
    } else if (pulseFilter === "hub") {
      if (hub === "ratchaburi") {
        pool = pool.filter((t) => t.hub === "ratchaburi" || t.league === "Thai League 1");
      } else if (hub === "minnesota") {
        pool = pool.filter((t) => t.hub === "minnesota");
      }
    }

    const items = pool.map((t) => {
      const outlook = getTeamSeasonOutlook(t);
      const score = calculateYearRoundPulseScore(t, outlook);
      return { team: t, outlook, score };
    });

    items.sort((a, b) => b.score - a.score);
    return items;
  }, [pulseFilter, hub, favs]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold tracking-tight">
            {lang === "th" ? "สปอร์ต เพลส์ ประจำปี" : "YEAR-ROUND SPORTS PULSE"}
          </h2>
          <p className="text-xs text-muted-foreground">
            {lang === "th"
              ? "ดัชนีวัดความเข้มข้น โมเมนตัม และบทวิเคราะห์เชิงลึกของทุกทีมตลอดทั้ง 365 วัน"
              : "Dynamic 0-100 intensity ranking evaluating competitive phase, fan sentiment, and championship pursuit."}
          </p>
        </div>

        <div className="flex gap-1.5">
          <button
            onClick={() => setPulseFilter("all")}
            className={`rounded-xl px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
              pulseFilter === "all"
                ? "bg-primary text-primary-foreground"
                : "border border-border bg-card text-muted-foreground"
            }`}
          >
            All Teams ({TEAMS.length})
          </button>
          {hub !== "all" && (
            <button
              onClick={() => setPulseFilter("hub")}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                pulseFilter === "hub"
                  ? "bg-primary text-primary-foreground"
                  : "border border-border bg-card text-muted-foreground"
              }`}
            >
              {hub === "ratchaburi" ? "Dragon Hub" : "MN Twin Cities"}
            </button>
          )}
          <button
            onClick={() => setPulseFilter("favs")}
            className={`rounded-xl px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
              pulseFilter === "favs"
                ? "bg-primary text-primary-foreground"
                : "border border-border bg-card text-muted-foreground"
            }`}
          >
            ★ Favorites
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {rankedTeams.map(({ team, outlook, score }, idx) => {
          const isFav = favs.includes(team.id);

          return (
            <div
              key={team.id}
              className="relative overflow-hidden rounded-3xl border border-border/70 bg-card/70 p-5 shadow-sm transition hover:border-primary/50 space-y-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm font-black text-muted-foreground/60 w-5">
                    #{idx + 1}
                  </span>
                  <Seal t={team} size={44} />
                  <div>
                    <h3 className="font-display text-base font-bold leading-tight">
                      {lang === "th" ? team.th : team.name}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                      <span>{team.league}</span>
                      <span>•</span>
                      <span className="font-mono">{team.record}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex flex-col items-end">
                    <span className="font-mono text-xl font-black text-primary">
                      {score}
                    </span>
                    <span className="text-[9px] font-bold text-muted-foreground uppercase">
                      PULSE SCORE
                    </span>
                  </div>
                  <button
                    onClick={() => toggleFav(team.id)}
                    className="p-1.5 text-muted-foreground transition hover:text-amber-400 cursor-pointer"
                  >
                    <Star
                      className={`h-4 w-4 ${isFav ? "fill-amber-400 text-amber-400" : ""}`}
                    />
                  </button>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-secondary/80 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-primary h-full transition-all duration-500 rounded-full"
                  style={{ width: `${score}%` }}
                />
              </div>

              {/* Phase Badge */}
              <div className="flex items-center justify-between text-xs">
                <span className="rounded-lg bg-secondary px-2.5 py-0.5 font-bold uppercase text-[10px] text-muted-foreground">
                  {outlook.phaseLabel[lang]}
                </span>
                <span className="text-muted-foreground font-mono">
                  {outlook.seasonYear}
                </span>
              </div>

              {/* Paragraph Narrative */}
              <p className="text-xs leading-relaxed text-muted-foreground/90 border-t border-border/40 pt-3">
                {outlook.summary[lang]}
              </p>

              <div className="flex items-center justify-between border-t border-border/40 pt-3 text-xs">
                <span className="text-muted-foreground">
                  Odds: <strong className="text-foreground">{outlook.championshipOdds || "N/A"}</strong>
                </span>
                <button
                  onClick={() => onSelectTeam(team.id)}
                  className="flex items-center gap-1 font-bold text-primary transition hover:underline cursor-pointer"
                >
                  <span>Season Road Map</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// =========================================================================
// TAB: SEASONS (COMPREHENSIVE OUTLOOK & TIMELINES)
// =========================================================================

function SeasonsTab({
  lang,
  hub,
  favs,
  toggleFav,
  selectedTeamId,
  onSelectTeamId,
}: {
  lang: Lang;
  hub: Hub;
  favs: string[];
  toggleFav: (id: string) => void;
  selectedTeamId: string | null;
  onSelectTeamId: (id: string) => void;
}) {
  const eligibleTeams = useMemo(() => {
    if (hub === "ratchaburi") {
      return TEAMS.filter((t) => t.hub === "ratchaburi" || t.league === "Thai League 1");
    }
    if (hub === "minnesota") {
      return TEAMS.filter((t) => t.hub === "minnesota");
    }
    return TEAMS;
  }, [hub]);

  const activeTeamId = selectedTeamId || eligibleTeams[0]?.id || "vik";
  const currentTeam = teamById(activeTeamId);
  const outlook = getTeamSeasonOutlook(currentTeam);

  return (
    <div className="space-y-6">
      {/* Team Ribbon Selector */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        {eligibleTeams.map((t) => {
          const active = t.id === activeTeamId;
          return (
            <button
              key={t.id}
              onClick={() => onSelectTeamId(t.id)}
              className={`flex items-center gap-2 rounded-2xl border px-3.5 py-2 transition shrink-0 cursor-pointer ${
                active
                  ? "border-primary bg-primary/20 text-foreground font-bold shadow-md"
                  : "border-border/60 bg-card/60 text-muted-foreground hover:bg-card"
              }`}
            >
              <Seal t={t} size={24} />
              <span className="text-xs">{lang === "th" ? t.th : t.name}</span>
            </button>
          );
        })}
      </div>

      {/* Main Team Outlook Dossier */}
      <div className="rounded-3xl border border-border/70 bg-card/80 p-6 shadow-xl backdrop-blur-md space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/50 pb-5">
          <div className="flex items-center gap-4">
            <Seal t={currentTeam} size={64} />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display text-2xl font-bold tracking-tight">
                  {lang === "th" ? currentTeam.th : currentTeam.name}
                </h2>
                <button
                  onClick={() => toggleFav(currentTeam.id)}
                  className="p-1 text-muted-foreground hover:text-amber-400 cursor-pointer"
                >
                  <Star
                    className={`h-5 w-5 ${
                      favs.includes(currentTeam.id) ? "fill-amber-400 text-amber-400" : ""
                    }`}
                  />
                </button>
              </div>
              <p className="text-xs text-muted-foreground">
                {currentTeam.league} • {currentTeam.sport} • Venue: {currentTeam.venue || "Stadium"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-2xl bg-secondary/80 p-3 text-center">
              <span className="text-[10px] text-muted-foreground uppercase font-bold block">
                PLAYOFF PROB
              </span>
              <span className="font-mono text-base font-bold text-primary">
                {outlook.playoffOdds || "—"}
              </span>
            </div>
            <div className="rounded-2xl bg-secondary/80 p-3 text-center">
              <span className="text-[10px] text-muted-foreground uppercase font-bold block">
                TITLE ODDS
              </span>
              <span className="font-mono text-base font-bold text-accent">
                {outlook.championshipOdds || "—"}
              </span>
            </div>
            <div className="rounded-2xl bg-secondary/80 p-3 text-center">
              <span className="text-[10px] text-muted-foreground uppercase font-bold block">
                PROJ RECORD
              </span>
              <span className="font-mono text-base font-bold">
                {outlook.projectedRecord || currentTeam.record}
              </span>
            </div>
          </div>
        </div>

        {/* Narrative Paragraph */}
        <div className="space-y-2">
          <h3 className="font-display text-xs font-bold tracking-wider text-muted-foreground uppercase">
            {lang === "th" ? "บทวิเคราะห์ฤดูกาล & ทิศทางสโมสร" : "SEASON NARRATIVE & OUTLOOK"}
          </h3>
          <p className="text-sm leading-relaxed text-foreground/90 bg-secondary/30 p-4 rounded-2xl border border-border/40">
            {outlook.summary[lang]}
          </p>
        </div>

        {/* Timeline of Key Milestones */}
        <div className="space-y-3">
          <h3 className="font-display text-xs font-bold tracking-wider text-muted-foreground uppercase">
            {lang === "th" ? "หมุดหมายสำคัญตลอดทั้งปี" : "ANNUAL TIMELINE & CRITICAL MILESTONES"}
          </h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {outlook.keyDates.map((kd, idx) => (
              <div
                key={idx}
                className={`flex items-start gap-3 rounded-2xl border p-3.5 transition ${
                  kd.highlight
                    ? "border-primary/50 bg-primary/10 shadow-sm"
                    : "border-border/60 bg-card/60"
                }`}
              >
                <div className="rounded-xl bg-secondary px-2.5 py-1 text-center font-mono text-[11px] font-bold shrink-0">
                  {kd.date}
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-primary block">
                    {kd.phase}
                  </span>
                  <span className="text-xs font-semibold leading-tight text-foreground">
                    {kd.label[lang]}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// =========================================================================
// TAB: MY TEAMS (FAVORITES HUB)
// =========================================================================

function MyTab({
  favs,
  toggleFav,
  lang,
  games,
  onAddAllMN,
  onSelectGame,
  onSelectTeam,
}: {
  favs: string[];
  toggleFav: (id: string) => void;
  lang: Lang;
  games: Game[];
  onAddAllMN: () => void;
  onSelectGame: (g: Game) => void;
  onSelectTeam: (id: string) => void;
}) {
  const favoriteTeams = useMemo(
    () => favs.map((id) => teamById(id)).filter((t) => t !== undefined),
    [favs]
  );

  const favoriteGames = useMemo(
    () => games.filter((g) => favs.includes(g.home) || favs.includes(g.away)),
    [games, favs]
  );

  if (favoriteTeams.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-border p-12 text-center space-y-4">
        <Star className="mx-auto h-12 w-12 text-muted-foreground/40" />
        <h3 className="font-display text-lg font-bold">
          {lang === "th" ? "ยังไม่มีทีมโปรด" : "No Favorite Teams Saved"}
        </h3>
        <p className="text-xs text-muted-foreground max-w-sm mx-auto">
          {lang === "th"
            ? "แตะดาวที่ทีมที่คุณชื่นชอบ หรือกดปุ่มด้านล่างเพื่อเพิ่ม 7 ทีมมินนิโซตาทันที"
            : "Tap the star on any team card or quickly add all 7 Minnesota Twin Cities squads."}
        </p>
        <button
          onClick={onAddAllMN}
          className="rounded-2xl bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground shadow-lg shadow-primary/25 transition hover:opacity-90 cursor-pointer"
        >
          {lang === "th" ? "เพิ่มทุกทีมมินนิโซตา" : "Add All Minnesota Teams"}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold tracking-tight">
            {lang === "th" ? "ทีมโปรดของฉัน" : "MY FAVORITES HQ"}
          </h2>
          <p className="text-xs text-muted-foreground">
            {favoriteTeams.length} teams pinned • Next fixtures & annual status
          </p>
        </div>
        <button
          onClick={onAddAllMN}
          className="rounded-xl border border-primary/40 bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary transition hover:bg-primary hover:text-primary-foreground cursor-pointer"
        >
          ★ Add All MN
        </button>
      </div>

      {/* Favorite Team Dossiers */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {favoriteTeams.map((team) => {
          const outlook = getTeamSeasonOutlook(team);
          return (
            <div
              key={team.id}
              className="rounded-2xl border border-border/70 bg-card/70 p-4 transition hover:border-primary/50 space-y-3 cursor-pointer"
              onClick={() => onSelectTeam(team.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Seal t={team} size={40} />
                  <div>
                    <h3 className="font-display text-sm font-bold">
                      {lang === "th" ? team.th : team.name}
                    </h3>
                    <span className="text-xs text-muted-foreground">
                      {team.league} • {team.record}
                    </span>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFav(team.id);
                  }}
                  className="p-1 text-amber-400 hover:text-muted-foreground cursor-pointer"
                >
                  <Star className="h-4 w-4 fill-amber-400" />
                </button>
              </div>

              <p className="text-xs text-muted-foreground line-clamp-2">
                {outlook.summary[lang]}
              </p>

              <div className="flex items-center justify-between border-t border-border/40 pt-2 text-xs">
                <span className="font-mono text-primary font-bold">
                  {outlook.phaseLabel[lang]}
                </span>
                <span className="text-muted-foreground">Details →</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Matches for Favorite Teams */}
      {favoriteGames.length > 0 && (
        <section className="space-y-3">
          <h3 className="font-display text-sm font-bold tracking-wider text-muted-foreground uppercase">
            {lang === "th" ? "ตารางแข่งของทีมโปรด" : "FAVORITE TEAM FIXTURES"}
          </h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {favoriteGames.map((game) => (
              <GameCard
                key={game.id}
                game={game}
                lang={lang}
                isFav={true}
                toggleFav={() => toggleFav(game.home)}
                onSelect={() => onSelectGame(game)}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

// =========================================================================
// TAB: EXPLORE (SEARCH & CATALOGUE)
// =========================================================================

function ExploreTab({
  lang,
  favs,
  toggleFav,
  onAddAllMN,
  onSelectTeam,
}: {
  lang: Lang;
  favs: string[];
  toggleFav: (id: string) => void;
  onAddAllMN: () => void;
  onSelectTeam: (id: string) => void;
}) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return TEAMS;
    return TEAMS.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.th.toLowerCase().includes(q) ||
        t.seal.toLowerCase().includes(q) ||
        t.league.toLowerCase().includes(q)
    );
  }, [query]);

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={lang === "th" ? "ค้นหาทุกทีม (EN / ภาษาไทย)..." : "Search any team (Vikings, Dragons, Arsenal)..."}
          className="w-full rounded-2xl border border-border bg-card/80 py-3.5 pl-12 pr-4 text-sm font-medium placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary shadow-sm"
        />
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Showing {filtered.length} teams across all sports</span>
        <button
          onClick={onAddAllMN}
          className="font-bold text-primary hover:underline cursor-pointer"
        >
          ★ Add All 7 MN Teams
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((team) => {
          const isFav = favs.includes(team.id);

          return (
            <div
              key={team.id}
              onClick={() => onSelectTeam(team.id)}
              className="flex items-center justify-between rounded-2xl border border-border/70 bg-card/60 p-3.5 transition hover:border-primary/50 cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <Seal t={team} size={36} />
                <div>
                  <h4 className="font-display text-sm font-bold">
                    {lang === "th" ? team.th : team.name}
                  </h4>
                  <span className="text-[11px] text-muted-foreground">
                    {team.league} • {team.record}
                  </span>
                </div>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFav(team.id);
                }}
                className="p-1.5 text-muted-foreground hover:text-amber-400 cursor-pointer"
              >
                <Star
                  className={`h-4 w-4 ${isFav ? "fill-amber-400 text-amber-400" : ""}`}
                />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// =========================================================================
// TAB: LEAGUES (MULTI-SPORT DASHBOARD)
// =========================================================================

function LeaguesTab({
  games,
  lang,
  onSelectLeague,
}: {
  games: Game[];
  lang: Lang;
  onSelectLeague: () => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold tracking-tight">
          {lang === "th" ? "ศูนย์กลางการแข่งขันทุกทุกลีก" : "GLOBAL LEAGUES HUB"}
        </h2>
        <p className="text-xs text-muted-foreground">
          Real-time scoreboards monitored across 11 premier domestic and global sports leagues.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {LEAGUES.map((l) => {
          const leagueGames = games.filter((g) => g.league === l.key);

          return (
            <div
              key={l.key}
              onClick={onSelectLeague}
              className="group rounded-2xl border border-border bg-card/70 p-5 transition hover:border-primary/50 cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <span className="rounded-lg bg-primary/20 px-2 py-0.5 text-xs font-bold text-primary uppercase">
                  {l.sport}
                </span>
                <span className="text-xs text-muted-foreground font-mono">
                  {leagueGames.length} games
                </span>
              </div>

              <h3 className="mt-3 font-display text-xl font-bold group-hover:text-primary transition">
                {l.name}
              </h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Public scoreboard endpoint connected via ESPN & Hermetica API.
              </p>

              <div className="mt-4 flex items-center justify-between border-t border-border/40 pt-3 text-xs font-semibold text-primary">
                <span>View Matches</span>
                <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// =========================================================================
// TAB: FANTASY & PICKS
// =========================================================================

function FantasyTab({
  lang,
  favs,
  games,
  preds,
  setPreds,
}: {
  lang: Lang;
  favs: string[];
  games: Game[];
  preds: Record<string, string>;
  setPreds: (p: Record<string, string>) => void;
}) {
  const predictionCount = Object.keys(preds).length;

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-primary/30 bg-gradient-to-r from-primary/10 via-card/60 to-card/90 p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <span className="rounded-full bg-primary/20 px-3 py-1 text-xs font-bold text-primary">
              PREDICTION ENGINE
            </span>
            <h2 className="mt-2 font-display text-2xl font-bold">
              {lang === "th" ? "ทายผลและสะสมแต้มแฟนตาซี" : "Sports OS Game Predictor"}
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              Select winners for active slates. Earn 10 PTS for each correct prediction.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-secondary/80 px-4 py-2 text-center">
              <span className="text-[10px] text-muted-foreground uppercase font-bold block">
                TOTAL PTS
              </span>
              <span className="font-mono text-2xl font-bold text-primary">
                {predictionCount * 10} PTS
              </span>
            </div>
            <div className="rounded-xl bg-secondary/80 px-4 py-2 text-center">
              <span className="text-[10px] text-muted-foreground uppercase font-bold block">
                ACTIVE PICKS
              </span>
              <span className="font-mono text-2xl font-bold text-accent">
                {predictionCount}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {games.slice(0, 8).map((game) => {
          const home = teamById(game.home);
          const away = teamById(game.away);
          const currentPick = preds[game.id];

          return (
            <div
              key={game.id}
              className="rounded-2xl border border-border bg-card/70 p-4 space-y-3"
            >
              <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold">
                <span>{game.league}</span>
                <span>{fmtTime(game.kickoff, "Asia/Bangkok", lang)}</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setPreds({ ...preds, [game.id]: away.id })}
                  className={`flex flex-col items-center justify-center rounded-xl border p-3 transition cursor-pointer ${
                    currentPick === away.id
                      ? "border-primary bg-primary/20 text-foreground font-bold shadow-sm"
                      : "border-border bg-card hover:bg-secondary text-muted-foreground"
                  }`}
                >
                  <Seal t={away} size={36} />
                  <span className="mt-2 text-xs font-bold">{away.name}</span>
                </button>

                <button
                  onClick={() => setPreds({ ...preds, [game.id]: home.id })}
                  className={`flex flex-col items-center justify-center rounded-xl border p-3 transition cursor-pointer ${
                    currentPick === home.id
                      ? "border-primary bg-primary/20 text-foreground font-bold shadow-sm"
                      : "border-border bg-card hover:bg-secondary text-muted-foreground"
                  }`}
                >
                  <Seal t={home} size={36} />
                  <span className="mt-2 text-xs font-bold">{home.name}</span>
                </button>
              </div>

              {currentPick && (
                <div className="flex items-center justify-between border-t border-border/40 pt-2 text-xs font-semibold text-accent">
                  <span>Picked: {teamById(currentPick).name}</span>
                  <CheckCircle2 className="h-4 w-4" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// =========================================================================
// GAME CARD (MATCHUP ROW)
// =========================================================================

export function GameCard({
  game,
  lang,
  isFav,
  toggleFav,
  pred,
  setPred,
  onSelect,
}: {
  game: Game;
  lang: Lang;
  isFav: boolean;
  toggleFav: () => void;
  pred?: string | undefined;
  setPred?: ((teamId: string) => void) | undefined;
  onSelect?: (() => void) | undefined;
}) {
  const home = teamById(game.home);
  const away = teamById(game.away);
  const isLive = game.status === "LIVE";

  return (
    <div
      onClick={onSelect}
      className={`relative overflow-hidden rounded-3xl border p-5 transition shadow-sm hover:shadow-md cursor-pointer ${
        isLive
          ? "border-red-500/40 bg-gradient-to-b from-red-500/5 via-card to-card"
          : "border-border/80 bg-card/70 hover:border-primary/50"
      }`}
    >
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <span className="rounded-lg bg-secondary px-2 py-0.5 font-bold uppercase text-[10px]">
            {game.league}
          </span>
          {isLive ? (
            <span className="flex items-center gap-1 font-bold text-red-500 animate-pulse">
              <span className="h-2 w-2 rounded-full bg-red-500" />
              {game.clock}
            </span>
          ) : (
            <span className="font-mono">
              {fmtTime(game.kickoff, "Asia/Bangkok", lang)}
            </span>
          )}
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleFav();
          }}
          className="p-1 text-muted-foreground hover:text-amber-400 cursor-pointer"
        >
          <Star
            className={`h-4 w-4 ${isFav ? "fill-amber-400 text-amber-400" : ""}`}
          />
        </button>
      </div>

      {/* Matchup Grid */}
      <div className="mt-4 grid grid-cols-2 gap-4">
        {/* Away Team */}
        <div className="flex items-center gap-3">
          <Seal t={away} size={42} />
          <div>
            <h4 className="font-display text-sm font-bold leading-tight">
              {lang === "th" ? away.th : away.name}
            </h4>
            <span className="text-[11px] text-muted-foreground">{away.record}</span>
          </div>
          {isLive && (
            <span className="ml-auto font-mono text-2xl font-black">{game.as}</span>
          )}
        </div>

        {/* Home Team */}
        <div className="flex items-center gap-3">
          <Seal t={home} size={42} />
          <div>
            <h4 className="font-display text-sm font-bold leading-tight">
              {lang === "th" ? home.th : home.name}
            </h4>
            <span className="text-[11px] text-muted-foreground">{home.record}</span>
          </div>
          {isLive && (
            <span className="ml-auto font-mono text-2xl font-black">{game.hs}</span>
          )}
        </div>
      </div>

      {/* Footer Info: Venue & Odds */}
      <div className="mt-4 flex items-center justify-between border-t border-border/40 pt-3 text-xs text-muted-foreground">
        <div className="flex items-center gap-1 truncate max-w-[65%]">
          <MapPin className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">{game.venue || "Stadium Arena"}</span>
        </div>
        <div className="font-mono text-foreground font-semibold">
          {game.odds || "—"}
        </div>
      </div>
    </div>
  );
}
