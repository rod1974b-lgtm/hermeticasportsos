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
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  Search,
  ExternalLink,
  ChevronDown,
  ChevronUp,
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

export type AppTab = Tab | "seasons";

// =========================================================================
// SEASON OUTLOOK DATA MODELS & CURATED TIMELINES
// =========================================================================
export type SeasonPhase = "preseason" | "regular" | "playoffs" | "offseason";

export interface PhaseDetail {
  status: "completed" | "in_progress" | "upcoming";
  dates: string;
  record?: string;
  focus: { en: string; th: string };
  milestones: Array<{ date: string; title: string; note: string }>;
  keyPlayers?: Array<{ name: string; role: string; highlight: string }>;
  championshipTarget?: string;
}

export interface SeasonOutlook {
  teamId: string;
  seasonYear: string;
  currentPhase: SeasonPhase;
  phaseLabel: { en: string; th: string };
  summary: { en: string; th: string };
  projectedRecord: string;
  championshipOdds: string;
  championshipTarget: string;
  championshipProbability: number;
  preseason: PhaseDetail;
  regularSeason: PhaseDetail & {
    standing: string;
    keyMatchups: Array<{ opponent: string; date: string; venue: string; note: string }>;
  };
  playoffs: PhaseDetail & {
    path: { en: string; th: string };
    clinchScenario: { en: string; th: string };
    championshipTarget?: string;
  };
  offseason: PhaseDetail & {
    capOrBudget: string;
    priorities: Array<{ area: string; details: string }>;
    draftOutlook: { en: string; th: string };
  };
}

export const SEASON_OUTLOOKS: Record<string, SeasonOutlook> = {
  vik: {
    teamId: "vik",
    seasonYear: "2026-2027 NFL Season",
    currentPhase: "regular",
    phaseLabel: {
      en: "Regular Season • Bye Week (5-0)",
      th: "ฤดูกาลปกติ • สัปดาห์พักแข่ง วีก 6 (5-0 ไร้พ่าย)",
    },
    summary: {
      en: "5-0 undefeated start leading the NFC North. Brian Flores defense leads the NFL in takeaways and simulated pressures, while Kevin O'Connell's offense operates at elite efficiency.",
      th: "เปิดฤดูกาล 5-0 ไร้พ่าย นำจ่าฝูง NFC North เกมรับของ ไบรอัน ฟลอเรส กดดันคู่แข่งและสร้างเทิร์นโอเวอร์สูงสุดในลีก ส่วนแผนรุกของ เควิน โอคอนเนลล์ กำลังยอดเยี่ยม",
    },
    projectedRecord: "13-4 (NFC North Champions)",
    championshipOdds: "+900 (Top 3 Super Bowl LXI Contender)",
    championshipTarget: "Lombardi Trophy (Super Bowl LXI)",
    championshipProbability: 88,
    preseason: {
      status: "completed",
      dates: "Aug 1 - Aug 28, 2026",
      record: "3-0 (Preseason)",
      focus: {
        en: "Sam Darnold QB1 adaptation, Dallas Turner edge development, Aaron Jones integration.",
        th: "ปรับจูน แซม ดาร์โนลด์ ในบทบาทควอเตอร์แบ็กตัวจริง, ดัลลัส เทอร์เนอร์ ตัวรุกขอบสนาม และ แอรอน โจนส์",
      },
      milestones: [
        { date: "Aug 10", title: "Camp Showcase", note: "Defense forced 4 turnovers in live scrimmage" },
        { date: "Aug 22", title: "Final Cutdown", note: "53-man roster finalized with league-leading secondary depth" },
      ],
      keyPlayers: [
        { name: "Justin Jefferson", role: "WR1", highlight: "Undisputed #1 receiver, elite separation" },
        { name: "Aaron Jones", role: "RB1", highlight: "Dynamic dual-threat ground and screen weapon" },
      ],
    },
    regularSeason: {
      status: "in_progress",
      dates: "Sept 8, 2026 - Jan 10, 2027",
      record: "5-0 (Active 5-Game Winning Streak)",
      standing: "#1 in NFC North (1st overall NFC seed contention)",
      focus: {
        en: "Maintain turnover margin (+8), manage player health through Week 6 bye, stack conference victories.",
        th: "รักษาอัตราเทิร์นโอเวอร์ (+8), ดูแลความฟิตช่วงบายวีก และเก็บชัยชนะเกมสาย NFC",
      },
      keyMatchups: [
        { opponent: "Indianapolis Colts", date: "Oct 25, 2026", venue: "U.S. Bank Stadium", note: "Next active game after bye week" },
        { opponent: "Detroit Lions", date: "Nov 15, 2026", venue: "Ford Field", note: "Crucial divisional clash for NFC North pole position" },
        { opponent: "Green Bay Packers", date: "Dec 27, 2026", venue: "Lambeau Field", note: "Border battle rivalry on prime time" },
      ],
      milestones: [
        { date: "Oct 14", title: "Bye Week R&R", note: "Undefeated through first 5 weeks of season" },
        { date: "Nov 26", title: "Thanksgiving Showcase", note: "National broadcast tilt" },
      ],
    },
    playoffs: {
      status: "upcoming",
      dates: "Jan 16 - Feb 14, 2027",
      championshipTarget: "Super Bowl LXI Champions",
      focus: {
        en: "Secure #1 NFC seed for home-field playoff advantage at U.S. Bank Stadium through NFC Championship.",
        th: "แย่งชิงอันดับ 1 สาย NFC เพื่อสิทธิ์เล่นในบ้านที่ U.S. Bank Stadium ตลอดรอบเพลย์ออฟ",
      },
      path: {
        en: "Win NFC North division -> Secure First-Round Bye -> Host Divisional & NFC Championship rounds in Minneapolis.",
        th: "คว้าแชมป์ดิวิชัน NFC North -> คว้าสิทธิ์บายรอบแรก -> เล่นรอบดิวิชันและชิงแชมป์สายในบ้าน",
      },
      clinchScenario: {
        en: "Magic number to clinch postseason berth: 6 combined wins and division rival losses.",
        th: "ต้องการชัยชนะหรือคู่แข่งร่วมสายแพ้อีก 6 นัดเพื่อการันตีตั๋วเพลย์ออฟ",
      },
      milestones: [
        { date: "Jan 16", title: "Wild Card Weekend", note: "Targeting first-round bye" },
        { date: "Feb 14", title: "Super Bowl LXI", note: "Championship showcase" },
      ],
    },
    offseason: {
      status: "upcoming",
      dates: "Feb 15 - July 2027",
      capOrBudget: "$28.4M Projected Cap Space",
      focus: {
        en: "Extend young defensive core, fortify interior offensive line, prepare J.J. McCarthy QB timeline.",
        th: "ต่อสัญญาแกนหลักแนวรับดาวรุ่ง, เสริมเกมบล็อกแดนกลาง และวางแผนพัฒนา เจ.เจ. แม็กคาร์ธี",
      },
      priorities: [
        { area: "Offensive Guard", details: "Acquire elite pass-protecting interior lineman via free agency" },
        { area: "Defensive Cornerback", details: "Retain Byron Murphy Jr. or draft top-tier perimeter cover specialist" },
      ],
      draftOutlook: {
        en: "Projected 30th-32nd overall pick: Target interior pass rusher or hybrid safety.",
        th: "อันดับดราฟต์รอบแรกคาดการณ์อันดับ 30-32: เล็งตัวกดดันควอเตอร์แบ็กตรงกลาง",
      },
      milestones: [
        { date: "March 2027", title: "NFL Free Agency Frenzy", note: "Targeting defensive reinforcements" },
        { date: "April 2027", title: "2027 NFL Draft", note: "Adding premium championship depth" },
      ],
    },
  },

  wolves: {
    teamId: "wolves",
    seasonYear: "2026-2027 NBA Season",
    currentPhase: "regular",
    phaseLabel: {
      en: "Regular Season • Target Center Defense (4-1)",
      th: "ฤดูกาลปกติ • ปราการเกมรับ ทาร์เก็ต เซ็นเตอร์ (4-1)",
    },
    summary: {
      en: "Anthony Edwards ascending into MVP favorite status, paired with Rudy Gobert anchor defense and Julius Randle dynamic scoring. Target Center is a fortress in the Western Conference.",
      th: "แอนโธนี เอ็ดเวิร์ดส์ กำลังก้าวสู่ระดับตัวเต็ง MVP ร่วมกับ รูดี โกแบร์ คุมเกมรับใต้แป้น และ จูเลียส แรนเดิล เติมเต็มการทำแต้ม",
    },
    projectedRecord: "56-26 (Top 2 Western Conference Seed)",
    championshipOdds: "+750 (Western Conference Favorites)",
    championshipTarget: "Larry O'Brien Trophy",
    championshipProbability: 84,
    preseason: {
      status: "completed",
      dates: "Oct 4 - Oct 18, 2026",
      record: "4-1 (Preseason)",
      focus: {
        en: "Randle and DiVincenzo half-court spacing, Rob Dillingham backup point guard development.",
        th: "ปรับสเปซซิ่งการเล่นเกมบุกของ แรนเดิล และ ดิวินเชนโซ, พัฒนา ร็อบ ดิลลิงแฮม",
      },
      milestones: [
        { date: "Oct 8", title: "Abu Dhabi Showcase", note: "Edwards 28 pts in 22 mins display" },
        { date: "Oct 18", title: "Final Tuneup", note: "Starting 5 posted +24.6 net rating" },
      ],
      keyPlayers: [
        { name: "Anthony Edwards", role: "SG / Franchise Star", highlight: "Top 3 MVP candidate, 29.4 PPG pace" },
        { name: "Rudy Gobert", role: "C / Rim Protector", highlight: "Defensive Player of the Year favorite" },
      ],
    },
    regularSeason: {
      status: "in_progress",
      dates: "Oct 22, 2026 - April 14, 2027",
      record: "4-1 (West #2)",
      standing: "#2 in Western Conference (0.5 GB of Thunder)",
      focus: {
        en: "Establish #1 defensive rating in NBA, manage veteran minutes, secure home-court through conference finals.",
        th: "รักษาเกมรับอันดับ 1 ของลีก, บริหารความฟิตผู้เล่นหลัก, ชิงความได้เปรียบเกมในบ้าน",
      },
      keyMatchups: [
        { opponent: "Oklahoma City Thunder", date: "Nov 20, 2026", venue: "Target Center", note: "Clash for #1 Western Seed" },
        { opponent: "Boston Celtics", date: "Dec 25, 2026", venue: "TD Garden", note: "Christmas Day NBA Showcase" },
        { opponent: "Denver Nuggets", date: "Jan 18, 2027", venue: "Ball Arena", note: "Western semifinal rematch" },
      ],
      milestones: [
        { date: "Dec 15", title: "NBA Cup Championship", note: "Vegas Final Four target" },
        { date: "Feb 14", title: "All-Star Weekend", note: "Ant Edwards All-Star Starter" },
      ],
    },
    playoffs: {
      status: "upcoming",
      dates: "April 18 - June 20, 2027",
      championshipTarget: "Larry O'Brien Trophy",
      focus: {
        en: "Western Conference Championship and NBA Finals breakthrough.",
        th: "คว้าแชมป์สายตะวันตกและเข้าสู่รอบชิงแชมป์ NBA ไฟนอลส์",
      },
      path: {
        en: "Top 2 Seed -> First Round matchup -> Western Semifinals -> Western Finals -> NBA Finals.",
        th: "มือวางอันดับ 1-2 -> ผ่านรอบแรก -> ตัดเชือกสาย -> ชิงสายตะวันตก -> ชิงชนะเลิศ NBA",
      },
      clinchScenario: {
        en: "Secure 50+ wins to lock in top 3 Western seed and bypass play-in tournament.",
        th: "เก็บชัยชนะ 50 นัดขึ้นไปเพื่อการันตีท็อป 3 เลี่ยงรอบเพลย์อิน",
      },
      milestones: [
        { date: "May 1", title: "Conference Semifinals", note: "Advancing past round 1" },
        { date: "June 5", title: "NBA Finals Game 1", note: "Ultimate championship quest" },
      ],
    },
    offseason: {
      status: "upcoming",
      dates: "June 25 - Oct 2027",
      capOrBudget: "Second Apron Luxury Tax Roster",
      focus: {
        en: "Preserve championship core, draft developmental wings with late picks, retain key bench specialists.",
        th: "รักษาแกนแชมป์, คัดเลือกผู้เล่นปีกดาวรุ่ง และต่อสัญญาตัวสำรองคนสำคัญ",
      },
      priorities: [
        { area: "Naz Reid Extension", details: "Lock in beloved Sixth Man of the Year to long-term deal" },
        { area: "3-and-D Wing Depth", details: "Veteran minimum sniper signing" },
      ],
      draftOutlook: {
        en: "Late first-round pick: Select defensive stopper wing with 40%+ corner 3PT acumen.",
        th: "อันดับดราฟต์รอบแรกช่วงปลาย: คัดผู้เล่นปีกเกมรับที่ยิง 3 แต้มแม่นยำ",
      },
      milestones: [
        { date: "June 2027", title: "NBA Draft", note: "Adding rotation bench youth" },
        { date: "July 2027", title: "Free Agency Signings", note: "Solidifying championship depth" },
      ],
    },
  },

  wild: {
    teamId: "wild",
    seasonYear: "2026-2027 NHL Season",
    currentPhase: "regular",
    phaseLabel: {
      en: "Regular Season • Central Division Hunt (3-1-0)",
      th: "ฤดูกาลปกติ • ล่าแชมป์ดิวิชัน เซ็นทรัล (3-1-0)",
    },
    summary: {
      en: "Kirill Kaprizov in Hart Trophy form alongside Matt Boldy and Brock Faber. With dead cap penalties finally expired, the State of Hockey has its strongest Stanley Cup window in a decade.",
      th: "คิริลล์ คาปริซอฟ ฟอร์มระดับล่ารางวัล MVP ฮาร์ท โทรฟี ประสานงานกับ แมตต์ โบลดี และ บร็อค เฟเบอร์ สภาพคล่องการเงินกลับมาพร้อมไล่ล่าแชมป์ สแตนลีย์ คัพ",
    },
    projectedRecord: "48-24-10 (106 Pts, Central Division Top 2)",
    championshipOdds: "+1400 (Lord Stanley Cup Contender)",
    championshipTarget: "Lord Stanley Cup",
    championshipProbability: 76,
    preseason: {
      status: "completed",
      dates: "Sept 20 - Oct 4, 2026",
      record: "4-1-1 (Preseason)",
      focus: {
        en: "Special teams power play setup, Jesper Wallstedt NHL goaltending rotation, Brock Faber top-pair minutes.",
        th: "เซ็ตระบบพาวเวอร์เพลย์, หมุนเวียนผู้รักษาประตู แยสเปอร์ วอลสเตดท์",
      },
      milestones: [
        { date: "Sept 28", title: "Xcel Energy Opener", note: "Boldy scored hat-trick in preseason tilt" },
        { date: "Oct 2", title: "Goaltending Tandem Set", note: "Gustavsson and Wallstedt confirmed as 1A/1B" },
      ],
      keyPlayers: [
        { name: "Kirill Kaprizov", role: "LW / Superstar", highlight: "Elite playmaking winger, 100+ point pace" },
        { name: "Brock Faber", role: "D / Blue Line Anchor", highlight: "25+ minutes TOI defensive cornerstone" },
      ],
    },
    regularSeason: {
      status: "in_progress",
      dates: "Oct 8, 2026 - April 15, 2027",
      record: "3-1-0 (6 Pts)",
      standing: "#2 in Central Division (1 Pt behind Dallas)",
      focus: {
        en: "Establish dominant home record at Xcel Energy Center, secure special teams top-5 ranking, manage goalie starts.",
        th: "สร้างสถิติชนะในบ้านที่ เซล เอเนอร์จี เซ็นเตอร์, ยกระดับเกมพิเศษติดท็อป 5",
      },
      keyMatchups: [
        { opponent: "Dallas Stars", date: "Nov 12, 2026", venue: "Xcel Energy Center", note: "Battle for Central Division pole" },
        { opponent: "Colorado Avalanche", date: "Dec 18, 2026", venue: "Ball Arena", note: "Central rivalry grudge match" },
        { opponent: "Edmonton Oilers", date: "Jan 22, 2027", venue: "Xcel Energy Center", note: "Kaprizov vs McDavid marquee battle" },
      ],
      milestones: [
        { date: "Jan 1", title: "NHL Winter Classic", note: "Outdoor game spectacle" },
        { date: "March 8", title: "NHL Trade Deadline", note: "Adding top-6 rental forward" },
      ],
    },
    playoffs: {
      status: "upcoming",
      dates: "April 18 - June 16, 2027",
      championshipTarget: "Lord Stanley Cup",
      focus: {
        en: "Break through first round and capture Western Conference title.",
        th: "ผ่านรอบแรกเพลย์ออฟและคว้าแชมป์สายตะวันตก",
      },
      path: {
        en: "Central Division Semifinal -> Central Final -> Western Conference Final -> Stanley Cup Final.",
        th: "รอบตัดเชือกดิวิชัน -> ชิงแชมป์ดิวิชัน -> ชิงแชมป์สาย -> รอบชิงสแตนลีย์คัพ",
      },
      clinchScenario: {
        en: "Reach 98+ points to mathematically secure Stanley Cup Playoffs berth.",
        th: "สะสมคะแนนแตะ 98 แต้มเพื่อการันตีตั๋วเพลย์ออฟสแตนลีย์คัพ",
      },
      milestones: [
        { date: "April 20", title: "Round 1 Game 1", note: "Postseason kickoff" },
        { date: "June 8", title: "Stanley Cup Finals", note: "Quest for hockey ultimate prize" },
      ],
    },
    offseason: {
      status: "upcoming",
      dates: "June 20 - Sept 2027",
      capOrBudget: "$14.6M Clean Cap Flexibility",
      focus: {
        en: "Sign Kirill Kaprizov to historic max extension, fortify center spine, sign top-4 puck-moving defenseman.",
        th: "ต่อสัญญาระยะยาว คาปริซอฟ, เติมเซ็นเตอร์แถวหน้า และกองหลังบิลด์อัพเกม",
      },
      priorities: [
        { area: "Kirill Kaprizov Extension", details: "8-year mega contract extension as top priority" },
        { area: "Top-6 Center", details: "UFA bidding for premier playmaking pivot" },
      ],
      draftOutlook: {
        en: "Mid-to-late 1st round pick: Focus on high-hockey-IQ Scandinavian center or right-shot blueliner.",
        th: "ดราฟต์รอบแรกอันดับกลาง-ท้าย: เน้นเซ็นเตอร์สแกนดิเนเวียหรือกองหลังยิงขวา",
      },
      milestones: [
        { date: "July 1", title: "Free Agent Frenzy", note: "Aggressive bidding in UFA market" },
        { date: "July 15", title: "Kaprizov Extension Signing", note: "Franchise player locked up" },
      ],
    },
  },

  twins: {
    teamId: "twins",
    seasonYear: "2026-2027 MLB Season",
    currentPhase: "offseason",
    phaseLabel: {
      en: "Offseason • Target Field Roster Overhaul",
      th: "ปิดฤดูกาล • ยกเครื่องขุมกำลัง ทาร์เก็ต ฟิลด์",
    },
    summary: {
      en: "Following an 82-80 campaign, the Twins enter a critical winter. Focus is on securing rotation durability behind Pablo López, developing young core bats, and aggressively upgrading the bullpen.",
      th: "จบฤดูกาลด้วยสถิติ 82-80 กำลังเข้าสู่ช่วงปรับทัพฤดูหนาว เน้นหาพิชเชอร์สตาร์ทเตอร์มาช่วย ปาโบล โลเปซ และอัปเกรดบูลเพน",
    },
    projectedRecord: "88-74 (AL Central Contenders)",
    championshipOdds: "+2200 (AL Pennant Contender)",
    championshipTarget: "World Series Trophy",
    championshipProbability: 64,
    preseason: {
      status: "upcoming",
      dates: "Feb 14 - March 26, 2027",
      focus: {
        en: "Fort Myers Spring Training: Rotation arms workload buildup, Walker Jenkins outfield debut.",
        th: "สปริงเทรนนิ่งที่ ฟอร์ตไมเออร์ส: เพิ่มเวิร์กล็อดตัวขว้าง และเปิดตัว วอล์กเกอร์ เจนกินส์",
      },
      milestones: [
        { date: "Feb 14", title: "Pitchers & Catchers Report", note: "Hammond Stadium workouts commence" },
        { date: "March 15", title: "Grapefruit League Showcase", note: "Prospects exhibition games" },
      ],
      keyPlayers: [
        { name: "Royce Lewis", role: "3B / Power Slugger", highlight: "Elite postseason power hitter" },
        { name: "Pablo López", role: "SP / Ace", highlight: "Workhorse starter with strikeout dominance" },
      ],
    },
    regularSeason: {
      status: "upcoming",
      dates: "March 27 - Sept 28, 2027",
      standing: "Targeting AL Central Title",
      focus: {
        en: "Reclaim AL Central crown from Cleveland and Detroit, win 50+ home games at Target Field.",
        th: "ทวงบัลลังก์แชมป์ AL Central จาก คลีฟแลนด์ และ ดีทรอยต์, ชนะในบ้าน 50 เกมขึ้นไป",
      },
      keyMatchups: [
        { opponent: "Cleveland Guardians", date: "April 10, 2027", venue: "Target Field", note: "Divisional home opener series" },
        { opponent: "New York Yankees", date: "May 22, 2027", venue: "Yankee Stadium", note: "Postseason demons test" },
        { opponent: "Detroit Tigers", date: "Aug 14, 2027", venue: "Target Field", note: "Pivotal late-summer pennant race" },
      ],
      milestones: [
        { date: "March 27", title: "MLB Opening Day", note: "First pitch of 2027 campaign" },
        { date: "July 13", title: "MLB All-Star Game", note: "Midsummer classic representation" },
      ],
    },
    playoffs: {
      status: "upcoming",
      dates: "Oct 1 - Oct 30, 2027",
      championshipTarget: "World Series Trophy",
      focus: {
        en: "ALDS victory and American League Pennant run.",
        th: "เก็บชัยชนะใน ALDS และก้าวไปสู่การคว้าแชมป์อเมริกันลีก",
      },
      path: {
        en: "AL Central Crown -> AL Wild Card Bye / ALDS -> ALCS -> World Series.",
        th: "แชมป์ดิวิชัน -> รอบแบ่งสาย ALDS -> ชิงแชมป์อเมริกันลีก ALCS -> เวิลด์ซีรีส์",
      },
      clinchScenario: {
        en: "Targeting 88+ regular season wins to secure divisional crown.",
        th: "ต้องการ 88 ชัยชนะขึ้นไปเพื่อการันตีแชมป์ดิวิชัน",
      },
      milestones: [
        { date: "Oct 2", title: "Wild Card Round", note: "Opening postseason clash" },
        { date: "Oct 22", title: "World Series Game 1", note: "Championship showdown" },
      ],
    },
    offseason: {
      status: "in_progress",
      dates: "Nov 1, 2026 - Feb 12, 2027",
      capOrBudget: "$145M Opening Day Payroll Target",
      focus: {
        en: "Acquire #2 starting pitcher behind Pablo López, add veteran high-leverage bullpen arm, extend core bats.",
        th: "เซ็นสัญญาพิชเชอร์สตาร์ทเตอร์มือ 2, เติมตัวขว้างบูลเพนจังหวะวิกฤต และต่อสัญญานักหวด",
      },
      priorities: [
        { area: "Starting Pitching", details: "Targeting veteran free agent starter for 170+ innings" },
        { area: "Right-Handed Power Outfield", details: "Corner outfield bat with 25+ HR capability" },
      ],
      draftOutlook: {
        en: "Top-15 overall pick: Focus on college-polished starting pitcher with plus-command fastball.",
        th: "ดราฟต์รอบแรกท็อป 15: เล็งพิชเชอร์ระดับมหาวิทยาลัยที่คุมบอลแม่นยำ",
      },
      milestones: [
        { date: "Dec 8", title: "MLB Winter Meetings", note: "Active in trade talks and free agency" },
        { date: "Jan 15", title: "Arbitration Filings", note: "Locking in core player salary figures" },
      ],
    },
  },

  lynx: {
    teamId: "lynx",
    seasonYear: "2026 WNBA Season & 2027 Defense",
    currentPhase: "offseason",
    phaseLabel: {
      en: "Offseason • WNBA Championship Title Defense",
      th: "ปิดฤดูกาล • เตรียมแผนป้องกันแชมป์ WNBA",
    },
    summary: {
      en: "Napheesa Collier led the Lynx to a 32-10 dominant regular season and a historic WNBA Finals run. Head coach Cheryl Reeve has established the league standard for defense and unselfish passing.",
      th: "นาฟีซา คอลลิเออร์ พาทีมคว้าชัย 32-10 ในฤดูกาลปกติและเข้าชิง WNBA ไฟนอลส์ โค้ช เชอริล รีฟ สร้างระบบทีมเวิร์กและเกมรับอันดับ 1 ของลีก",
    },
    projectedRecord: "34-6 (WNBA #1 Seed & Champions)",
    championshipOdds: "+240 (WNBA Title Favorites)",
    championshipTarget: "WNBA Championship Trophy",
    championshipProbability: 92,
    preseason: {
      status: "upcoming",
      dates: "April 20 - May 10, 2027",
      focus: {
        en: "Integrating first-round draft selections, defensive rotation continuity, 3PT shooting drills.",
        th: "ผสมผสานผู้เล่นดราฟต์รอบแรก, ต่อยอดความต่อเนื่องเกมรับ และซ้อมยิง 3 แต้ม",
      },
      milestones: [
        { date: "April 22", title: "Lynx Training Camp Opens", note: "Championship ring celebration at Mayo Clinic Square" },
      ],
      keyPlayers: [
        { name: "Napheesa Collier", role: "F / MVP Finalist", highlight: "Defensive Player of the Year, clutch leader" },
        { name: "Courtney Williams", role: "PG / Playmaker", highlight: "Playoff midrange maestro and tempo controller" },
      ],
    },
    regularSeason: {
      status: "upcoming",
      dates: "May 14 - Sept 18, 2027",
      standing: "Targeting #1 Overall WNBA Seed",
      focus: {
        en: "Maintain #1 defensive rating in WNBA, secure home-court advantage at Target Center.",
        th: "รักษาเกมรับอันดับ 1 ใน WNBA, ชิงความได้เปรียบเกมในบ้านที่ ทาร์เก็ต เซ็นเตอร์",
      },
      keyMatchups: [
        { opponent: "New York Liberty", date: "June 2, 2027", venue: "Target Center", note: "WNBA Finals heavyweight rematch" },
        { opponent: "Las Vegas Aces", date: "July 12, 2027", venue: "Michelob ULTRA Arena", note: "Collier vs A'ja Wilson superstar showdown" },
      ],
      milestones: [
        { date: "May 14", title: "WNBA Season Tipoff", note: "Home opener banner raising" },
        { date: "July 24", title: "WNBA All-Star Game", note: "Collier and Williams starting nods" },
      ],
    },
    playoffs: {
      status: "upcoming",
      dates: "Sept 20 - Oct 20, 2027",
      championshipTarget: "WNBA Championship Trophy",
      focus: {
        en: "Capture 5th WNBA Championship banner in franchise history.",
        th: "คว้าแชมป์ WNBA สมัยที่ 5 ในประวัติศาสตร์สโมสร",
      },
      path: {
        en: "First Round (Best of 3) -> Semifinals (Best of 5) -> WNBA Finals (Best of 5).",
        th: "รอบแรก (ชนะ 2 ใน 3) -> รอบตัดเชือก (ชนะ 3 ใน 5) -> รอบชิงชนะเลิศ (ชนะ 3 ใน 5)",
      },
      clinchScenario: {
        en: "Clinch #1 seed with 30+ victories in 40-game regular season schedule.",
        th: "เก็บชัยชนะ 30 เกมขึ้นไปเพื่อการันตีทีมวางอันดับ 1",
      },
      milestones: [
        { date: "Sept 22", title: "WNBA Playoffs Round 1", note: "Postseason run launch" },
        { date: "Oct 12", title: "WNBA Finals Game 1", note: "Championship target" },
      ],
    },
    offseason: {
      status: "in_progress",
      dates: "Oct 22, 2026 - April 15, 2027",
      capOrBudget: "Hard Cap Salary Retention Structure",
      focus: {
        en: "Re-sign core free agents, preserve championship chemistry, scout NCAA tournament perimeter talent.",
        th: "ต่อสัญญาผู้เล่นฟรีเอเยนต์ตัวหลัก, รักษาความเข้าขารู้ใจ และคัดสรรดาวรุ่งจากลีกมหาวิทยาลัย",
      },
      priorities: [
        { area: "Retain Courtney Williams & Alanna Smith", details: "Lock in primary ball-handler and interior defensive anchor" },
        { area: "Perimeter 3PT Depth", details: "Targeting lethal catch-and-shoot sharpshooter" },
      ],
      draftOutlook: {
        en: "Late 1st round pick: Select high-motor 3-and-D wing from NCAA Final Four team.",
        th: "ดราฟต์รอบแรกปลายตาราง: คัดผู้เล่นปีกเกมรับ-ยิง 3 แต้มจากทีมไฟนอลโฟร์",
      },
      milestones: [
        { date: "Jan 15", title: "WNBA Free Agency Opens", note: "Confirming core roster returns" },
        { date: "April 14", title: "2027 WNBA Draft", note: "Drafting collegiate stars" },
      ],
    },
  },

  frost: {
    teamId: "frost",
    seasonYear: "2026-2027 PWHL Season",
    currentPhase: "regular",
    phaseLabel: {
      en: "Regular Season • Back-to-Back Walter Cup Defense",
      th: "ฤดูกาลปกติ • ป้องกันแชมป์ วอลเตอร์ คัพ สองสมัยซ้อน",
    },
    summary: {
      en: "Minnesota Frost are reigning back-to-back Walter Cup Champions. Kendall Coyne Schofield, Taylor Heise, and Kelly Pannek form the deepest forward corps in women's pro hockey.",
      th: "มินนิโซตา ฟรอสต์ เจ้าของแชมป์ วอลเตอร์ คัพ สองสมัยซ้อน นำโดย เคนดัลล์ คอยน์ สโคฟิลด์, เทย์เลอร์ ไฮซี และ เคลลี แพนเน็ก เป็นทีมเต็งแชมป์อันดับ 1",
    },
    projectedRecord: "22-5-3 (Walter Cup Favorites)",
    championshipOdds: "+200 (Back-to-Back-to-Back Hunt)",
    championshipTarget: "Walter Cup Trophy",
    championshipProbability: 90,
    preseason: {
      status: "completed",
      dates: "Nov 5 - Nov 24, 2026",
      record: "3-0-0 (Preseason)",
      focus: {
        en: "Roster integration of draft picks, Nicole Hensley goaltending rhythm, power play tactics.",
        th: "ปรับจูนผู้เล่นดราฟต์ใหม่, จังหวะเซฟของ นิโคล เฮนสลีย์ และเกมพาวเวอร์เพลย์",
      },
      milestones: [
        { date: "Nov 12", title: "Xcel Energy Camp", note: "Defense allowed 0 goals in exhibition scrimmage" },
      ],
      keyPlayers: [
        { name: "Taylor Heise", role: "C / Playoff MVP", highlight: "Generational scoring center, elite wrist shot" },
        { name: "Kendall Coyne Schofield", role: "LW / Captain", highlight: "Blazing speed and transition scoring" },
      ],
    },
    regularSeason: {
      status: "in_progress",
      dates: "Nov 28, 2026 - May 2, 2027",
      record: "2-0-0 (6 Pts)",
      standing: "#1 in PWHL Standings",
      focus: {
        en: "Lock down #1 seed to ensure home-ice advantage through the Walter Cup Playoffs.",
        th: "ครองจ่าฝูงเพื่อคว้าสิทธิ์เล่นในบ้านตลอดรอบเพลย์ออฟ วอลเตอร์ คัพ",
      },
      keyMatchups: [
        { opponent: "Boston Fleet", date: "Dec 6, 2026", venue: "Xcel Energy Center", note: "Walter Cup Finals rematch" },
        { opponent: "Montreal Victoire", date: "Jan 14, 2027", venue: "Place Bell", note: "Road battle for #1 PWHL seed" },
      ],
      milestones: [
        { date: "Jan 28", title: "PWHL Takeover Tour", note: "Outdoor neutral site showcase" },
        { date: "May 2", title: "Regular Season Finale", note: "Final tuneup before playoffs" },
      ],
    },
    playoffs: {
      status: "upcoming",
      dates: "May 8 - May 28, 2027",
      championshipTarget: "Walter Cup Trophy",
      focus: {
        en: "Capture three consecutive Walter Cup championships in PWHL history.",
        th: "คว้าแชมป์ วอลเตอร์ คัพ 3 สมัยติดต่อกันเป็นทีมแรกในประวัติศาสตร์",
      },
      path: {
        en: "PWHL Semifinals (Best of 5) -> Walter Cup Finals (Best of 5).",
        th: "รอบตัดเชือก (ชนะ 3 ใน 5) -> วอลเตอร์ คัพ ไฟนอลส์ (ชนะ 3 ใน 5)",
      },
      clinchScenario: {
        en: "Secure 18 regulation wins to lock up #1 postseason seed.",
        th: "ชนะในเวลาปกติ 18 นัดเพื่อคว้าทีมวางอันดับ 1",
      },
      milestones: [
        { date: "May 10", title: "Semifinal Game 1", note: "Playoff defense begins" },
        { date: "May 24", title: "Walter Cup Game 4", note: "Targeting championship sweep" },
      ],
    },
    offseason: {
      status: "upcoming",
      dates: "June 1 - Oct 2027",
      capOrBudget: "PWHL Salary Cap Compliant",
      focus: {
        en: "Retain Olympic medalists, secure college free agents, extend core defensemen.",
        th: "รั้งตัวนักกีฬาเหรียญทองโอลิมปิก, ดึงดาวรุ่งจากลีกมหาวิทยาลัย และต่อสัญญากองหลัง",
      },
      priorities: [
        { area: "Top-Pair Defense", details: "Lock in Lee Stecklein and Sophie Jaques to long-term pacts" },
      ],
      draftOutlook: {
        en: "PWHL Draft: Target collegiate goal-scoring power forward.",
        th: "PWHL ดราฟต์: เล็งกองหน้าตัวจบสกอร์จากลีกมหาวิทยาลัย",
      },
      milestones: [
        { date: "June 10", title: "PWHL Draft", note: "Injecting elite collegiate talent" },
      ],
    },
  },

  mnufc: {
    teamId: "mnufc",
    seasonYear: "2026-2027 MLS Campaign",
    currentPhase: "regular",
    phaseLabel: {
      en: "Regular Season • Allianz Field Playoff Push",
      th: "ฤดูกาลปกติ • ล่าตั๋วเพลย์ออฟ อัลลิอันซ์ ฟิลด์",
    },
    summary: {
      en: "Minnesota United FC under Eric Ramsay playing aggressive pressing football at Allianz Field. Robin Lod and Kelvin Yeboah form a dangerous attacking tandem.",
      th: "มินเนโซตา ยูไนเต็ด ภายใต้การคุมทีมของ เอริก แรมซีย์ เล่นบอลเพรสซิ่งดุดันที่ อัลลิอันซ์ ฟิลด์ โรบิน ล็อด และ เคลวิน เยบัวห์ กำลังเข้าฟอร์ม",
    },
    projectedRecord: "16-9-9 (57 Pts, Top 4 West)",
    championshipOdds: "+1800 (MLS Cup Playoff Dark Horse)",
    championshipTarget: "MLS Cup & US Open Cup",
    championshipProbability: 66,
    preseason: {
      status: "completed",
      dates: "Jan 15 - Feb 18, 2026",
      record: "4-1-0 (Preseason)",
      focus: {
        en: "High-pressing transition tactical drills, defensive shape integration.",
        th: "ฝึกซ้อมแท็กติกเพรสซิ่งสูงและการยืนโซนแนวรับ",
      },
      milestones: [
        { date: "Feb 5", title: "Coachella Valley Invitational", note: "Undefeated in exhibition friendlies" },
      ],
      keyPlayers: [
        { name: "Kelvin Yeboah", role: "ST / Goal Scorer", highlight: "Clinical Designated Player striker" },
        { name: "Robin Lod", role: "MF / Playmaker", highlight: "All-time club assists and goals maestro" },
      ],
    },
    regularSeason: {
      status: "in_progress",
      dates: "Feb 22 - Oct 19, 2026",
      record: "15-12-7 (52 Pts)",
      standing: "#5 in Western Conference (Locked in for Playoffs)",
      focus: {
        en: "Secure Top-4 seed for home-field advantage in Round One Best-of-3 series at Allianz Field.",
        th: "เก็บแต้มติดท็อป 4 เพื่อสิทธิ์เล่นในบ้านรอบแรกที่ อัลลิอันซ์ ฟิลด์",
      },
      keyMatchups: [
        { opponent: "LAFC", date: "Oct 24, 2026", venue: "BMO Stadium", note: "MLS Cup Playoffs Round 1 Game 1" },
      ],
      milestones: [
        { date: "Oct 19", title: "Decision Day", note: "Postseason spot sealed" },
      ],
    },
    playoffs: {
      status: "in_progress",
      dates: "Oct 24 - Dec 6, 2026",
      championshipTarget: "MLS Cup & US Open Cup",
      focus: {
        en: "Navigate Western Conference playoffs and reach first MLS Cup Final.",
        th: "ฝ่าฟันเพลย์ออฟสายตะวันตกเพื่อเข้าชิงถ้วย MLS Cup",
      },
      path: {
        en: "Round 1 (Best-of-3) -> Conference Semifinals -> Conference Final -> MLS Cup Final.",
        th: "รอบแรก (ชนะ 2 ใน 3) -> รอบรองชนะเลิศสาย -> ชิงแชมป์สาย -> รอบชิง MLS Cup",
      },
      clinchScenario: {
        en: "Defeat LAFC in Round 1 Best-of-3 series to advance.",
        th: "เอาชนะ LAFC ในระบบชนะ 2 ใน 3 เกมเพื่อผ่านเข้ารอบรองชนะเลิศสาย",
      },
      milestones: [
        { date: "Oct 24", title: "Playoffs Round 1", note: "Series opener vs LAFC" },
        { date: "Dec 6", title: "MLS Cup Final", note: "Championship target" },
      ],
    },
    offseason: {
      status: "upcoming",
      dates: "Dec 10, 2026 - Jan 14, 2027",
      capOrBudget: "$6.2M GAM/TAM Allocation Flexibility",
      focus: {
        en: "Acquire Designated Player box-to-box central midfielder, retain defensive spine.",
        th: "เสริมกองกลางบ็อกซ์ทูบ็อกซ์ระดับ Designated Player และรักษากองหลังตัวหลัก",
      },
      priorities: [
        { area: "Box-to-Box Midfielder", details: "Prime South American/European midfielder to partner Dotson" },
      ],
      draftOutlook: {
        en: "MLS SuperDraft: Target collegiate athletic center-back.",
        th: "MLS ซูเปอร์ดราฟต์: คัดเลือกเซ็นเตอร์แบ็กรูปร่างสูงใหญ่",
      },
      milestones: [
        { date: "Dec 18", title: "MLS SuperDraft", note: "Scouting young domestic talent" },
      ],
    },
  },

  rbfc: {
    teamId: "rbfc",
    seasonYear: "2026-2027 Thai League 1",
    currentPhase: "regular",
    phaseLabel: {
      en: "Regular Season • Dragon Solar Park Fortress (4-1-2)",
      th: "ฤดูกาลปกติ • ปราการ ดราก้อน โซล่าร์ ปาร์ค (4-1-2)",
    },
    summary: {
      en: "Ratchaburi FC (The Dragons) in fierce contention in Thai League 1. Dragon Solar Park is rocking in Ratchaburi with fiery home performances and AFC continental ambitions.",
      th: "ราชบุรี เอฟซี (ราชันมังกร) กำลังโชว์ฟอร์มร้อนแรงในไทยลีก 1 เกมในบ้านที่ ดราก้อน โซล่าร์ ปาร์ค แข็งแกร่งพร้อมเป้าหมายคว้าตั๋วลุยฟุตบอลถ้วยเอเชีย AFC",
    },
    projectedRecord: "17-7-6 (58 Pts, Top 3 Finish)",
    championshipOdds: "+550 (Thai FA Cup & League 1 Contenders)",
    championshipTarget: "Thai League 1 & Chang FA Cup",
    championshipProbability: 72,
    preseason: {
      status: "completed",
      dates: "July 1 - Aug 8, 2026",
      record: "4-0-1 (Preseason)",
      focus: {
        en: "Physical conditioning in Ratchaburi heat, integration of Brazilian front line.",
        th: "ฟื้นฟูความฟิตท่ามกลางอากาศร้อนราชบุรี และปรับจูนแนวรุกชาวบราซิล",
      },
      milestones: [
        { date: "Aug 2", title: "Dragon Solar Park Launch", note: "Preseason friendly victory in front of 9,000 fans" },
      ],
      keyPlayers: [
        { name: "Clément Depres", role: "FW / Target Man", highlight: "Physical aerial powerhouse and clinical finisher" },
        { name: "Jesse Curran", role: "MF / Dynamic Wing", highlight: "Versatile wing-back with pinpoint crossing" },
      ],
    },
    regularSeason: {
      status: "in_progress",
      dates: "Aug 15, 2026 - May 10, 2027",
      record: "4-1-2 (13 Pts)",
      standing: "#4 in Thai League 1 (3 Pts off Leader)",
      focus: {
        en: "Preserve undefeated home record at Dragon Solar Park, secure top-3 finish for AFC Champions League 2 qualification.",
        th: "รักษาสถิติไร้พ่ายในบ้านที่ ดราก้อน โซล่าร์ ปาร์ค และจบอันดับท็อป 3 เพื่อตั๋วเอเอฟซี แชมเปียนส์ลีก 2",
      },
      keyMatchups: [
        { opponent: "Buriram United", date: "Nov 22, 2026", venue: "Dragon Solar Park", note: "Giant clash vs league champions" },
        { opponent: "Bangkok United", date: "Dec 14, 2026", venue: "Thammasat Stadium", note: "Capital road showdown" },
        { opponent: "Port FC", date: "Feb 7, 2027", venue: "Dragon Solar Park", note: "Fierce rivalry battle" },
      ],
      milestones: [
        { date: "Nov 22", title: "Buriram Tilt", note: "Sold-out Dragon Solar Park" },
        { date: "Jan 10", title: "Second Leg Restart", note: "Championship sprint starts" },
      ],
    },
    playoffs: {
      status: "upcoming",
      dates: "March 1 - May 24, 2027",
      championshipTarget: "Chang FA Cup & Revo Cup Champions",
      focus: {
        en: "Win Chang FA Cup to guarantee direct AFC Champions League group stage berth.",
        th: "คว้าแชมป์ ช้าง เอฟเอ คัพ เพื่อการันตีตั๋วรอบแบ่งกลุ่ม เอเอฟซี แชมเปียนส์ลีก",
      },
      path: {
        en: "FA Cup Round of 16 -> Quarterfinals -> Semifinals -> Final at Rajamangala Stadium.",
        th: "รอบ 16 ทีม -> รอบ 8 ทีม -> รอบรองชนะเลิศ -> นัดชิงชนะเลิศ ที่สนามราชมังคลากีฬาสถาน",
      },
      clinchScenario: {
        en: "Reach 55+ league points and win 4 consecutive cup fixtures.",
        th: "เก็บ 55 แต้มในลีกและชนะรวด 4 นัดในฟุตบอลถ้วย",
      },
      milestones: [
        { date: "April 18", title: "FA Cup Semifinal", note: "Neutral venue clash" },
        { date: "May 24", title: "Chang FA Cup Final", note: "Targeting continental glory" },
      ],
    },
    offseason: {
      status: "upcoming",
      dates: "June 1 - July 2027",
      capOrBudget: "Thai League 1 Salary Cap Structure",
      focus: {
        en: "Retain key foreign player spine, recruit top Thai national team prospects, upgrade training grounds.",
        th: "ต่อสัญญาแข้งต่างชาติคนสำคัญ, ดึงนักเตะทีมชาติไทยเสริมทัพ และพัฒนาศูนย์ฝึกซ้อม",
      },
      priorities: [
        { area: "Foreign Attacker Slot", details: "Prolific Asian-quota attacking midfielder" },
        { area: "Domestic Defensive Midfield", details: "Thai national team defensive anchor" },
      ],
      draftOutlook: {
        en: "Academy Promotion: Elevate three top U-23 academy graduates to senior first-team roster.",
        th: "ดันดาวรุ่งอะคาเดมี่ U-23 ขึ้นสู่ทีมชุดใหญ่ 3 ราย",
      },
      milestones: [
        { date: "June 2027", title: "Thai Transfer Window", note: "Squad reinforcement for continental play" },
      ],
    },
  },
};

export function getTeamSeasonOutlook(team: Team): SeasonOutlook {
  const found = SEASON_OUTLOOKS[team.id];
  if (found) {
    return found;
  }

  return {
    teamId: team.id,
    seasonYear: "2026-2027 Season",
    currentPhase: "regular",
    phaseLabel: {
      en: "Regular Season • In Progress",
      th: "ฤดูกาลปกติ • กำลังแข่งขัน",
    },
    summary: {
      en: `${team.name} is in competitive action in ${team.league || team.sport}. Squad aiming for postseason contention and championship glory.`,
      th: `${team.name} กำลังแข่งขันในลีก ${team.league || team.sport} พร้อมเดินหน้าล่าตั๋วเพลย์ออฟและถ้วยรางวัล`,
    },
    projectedRecord: team.record || "In Postseason Hunt",
    championshipOdds: "+1200 (Playoff Contender)",
    championshipTarget: `${team.league || "Championship"} Trophy`,
    championshipProbability: 68,
    preseason: {
      status: "completed",
      dates: "Preseason Training Window",
      focus: {
        en: "Tactical conditioning and integration of summer additions.",
        th: "ปรับแท็กติกและความฟิตของผู้เล่นใหม่ช่วงปรีซีซัน",
      },
      milestones: [
        { date: "Preseason", title: "Training Camp", note: "Roster finalized" },
      ],
    },
    regularSeason: {
      status: "in_progress",
      dates: "Active Regular Campaign",
      record: team.record || "Active",
      standing: "Playoff Contender",
      focus: {
        en: "Collect crucial league points and preserve health for championship run.",
        th: "เก็บแต้มสำคัญในลีกและรักษาสภาพความฟิตสู่ช่วงชิงแชมป์",
      },
      keyMatchups: [
        { opponent: "Next League Matchup", date: "Upcoming", venue: "Home Stadium", note: "Key fixture" },
      ],
      milestones: [
        { date: "Midseason", title: "All-Star Break", note: "Key milestones evaluation" },
      ],
    },
    playoffs: {
      status: "upcoming",
      dates: "Postseason Window",
      championshipTarget: `${team.league || "Championship"} Title`,
      focus: {
        en: "Survive and advance in elimination rounds.",
        th: "เดินหน้าในรอบน็อกเอาต์เพื่อล่าแชมป์",
      },
      path: {
        en: "Secure qualifying seed -> Win postseason elimination series.",
        th: "คว้าอันดับการันตีตั๋ว -> คว้าชัยในรอบเพลย์ออฟ",
      },
      clinchScenario: {
        en: "Stack conference victories in remaining fixtures.",
        th: "เก็บชัยชนะในเกมที่เหลือเพื่อการันตีตั๋ว",
      },
      milestones: [
        { date: "Postseason", title: "Playoff Opening Round", note: "Championship quest" },
      ],
    },
    offseason: {
      status: "upcoming",
      dates: "Summer 2027",
      capOrBudget: "Standard League Cap Space",
      focus: {
        en: "Retain key core players and draft top available talent.",
        th: "รั้งผู้เล่นคนสำคัญและคัดเลือกผู้เล่นดาวรุ่ง",
      },
      priorities: [
        { area: "Roster Depth", details: "Upgrade bench depth and tactical flexibility" },
      ],
      draftOutlook: {
        en: "Focus on best player available.",
        th: "เน้นเลือกผู้เล่นที่ดีที่สุดในดราฟต์",
      },
      milestones: [
        { date: "Offseason", title: "Draft & Free Agency", note: "Squad retooling" },
      ],
    },
  };
}

// =========================================================================
// LOCAL STORAGE HOOK
// =========================================================================
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
      } catch (err) {
        console.error("Failed to save to localStorage:", err);
      }
    },
    [key]
  );

  return [val, update];
}

const tabs = (t: (typeof T)["en"], lang: Lang) =>
  [
    { key: "live", label: t.live, icon: Radio },
    { key: "pulse", label: lang === "th" ? "สปอร์ต เพลส์" : "Pulse", icon: Activity },
    { key: "my", label: t.myTeams, icon: Star },
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

  // Refresh live ESPN scoreboards across 14 leagues
  const refreshLiveScores = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const settled = await Promise.allSettled(
        ESPN_LEAGUES.map((l) => fetchLiveESPNLeague({ data: { leagueKey: l.key } }))
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
          const key = `${g.homeId}-${g.awayId}-${g.time.slice(0, 10)}`;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });

        // Sort: LIVE first, then UPCOMING by kickoff time
        unique.sort((a, b) => {
          if (a.status === "LIVE" && b.status !== "LIVE") return -1;
          if (b.status === "LIVE" && a.status !== "LIVE") return 1;
          return new Date(a.time).getTime() - new Date(b.time).getTime();
        });

        setGames(unique);
      }
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Live scores refresh failed:", err);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  // Poll live scores every 15 seconds
  useEffect(() => {
    refreshLiveScores();
    const interval = setInterval(refreshLiveScores, 15000);
    return () => clearInterval(interval);
  }, [refreshLiveScores]);

  const toggleFav = (id: string) => {
    if (favs.includes(id)) {
      setFavs(favs.filter((f) => f !== id));
      toast(lang === "th" ? "ลบออกจากทีมโปรดแล้ว" : "Removed from favorites");
    } else {
      setFavs([...favs, id]);
      toast(lang === "th" ? "เพิ่มในทีมโปรดแล้ว!" : "Added to favorites!");
    }
  };

  const addAllMN = () => {
    const combined = Array.from(new Set([...favs, ...MN_IDS]));
    setFavs(combined);
    toast.success(
      lang === "th"
        ? "เพิ่มทีมมินนิโซตาทั้ง 7 สโมสรเรียบร้อยแล้ว!"
        : "Added all 7 Minnesota franchises to favorites!"
    );
  };

  const liveCount = useMemo(
    () => games.filter((g) => g.status === "LIVE").length,
    [games]
  );

  return (
    <div
      data-hub={hub}
      className="min-h-screen bg-background text-foreground transition-colors duration-300"
    >
      {/* Top Header */}
      <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur-md">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-2 px-4 py-2.5 sm:grid-cols-2 sm:items-center sm:gap-4">
          <div className="min-w-0">
            <h1 className="flex items-center gap-2 font-display text-lg tracking-wider text-primary sm:text-xl">
              <Zap className="h-5 w-5 animate-pulse text-accent" />
              <span>{t.appTitle}</span>
              <span className="rounded-full bg-primary/20 px-2 py-0.5 text-[10px] font-sans font-bold text-primary">
                OS
              </span>
            </h1>
            <HubInfo
              hub={hub}
              now={now}
              mounted={mounted}
              dualWeather={dualWeather}
              lang={lang}
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 sm:justify-end">
            <button
              onClick={() => setLang(lang === "en" ? "th" : "en")}
              className="flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1 text-xs font-semibold hover:bg-secondary transition cursor-pointer"
              title="Toggle Language (EN / TH)"
            >
              <Globe className="h-3.5 w-3.5 text-primary" />
              <span>{lang === "en" ? "ไทย" : "English"}</span>
            </button>

            <button
              onClick={refreshLiveScores}
              disabled={isRefreshing}
              className="flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1 text-xs font-semibold hover:bg-secondary transition cursor-pointer disabled:opacity-50"
              title="Refresh Live Scores"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 text-primary ${isRefreshing ? "animate-spin" : ""}`}
              />
              <span className="hidden sm:inline">
                {isRefreshing ? "Syncing..." : "Live Sync"}
              </span>
            </button>

            {liveCount > 0 && (
              <span className="flex items-center gap-1 rounded-full bg-red-500/20 px-2.5 py-1 text-xs font-bold text-red-500">
                <span className="h-2 w-2 rounded-full bg-red-500 animate-ping" />
                {liveCount} {t.live}
              </span>
            )}
          </div>
        </div>

        {/* Hub Selector Pills */}
        <div className="mx-auto flex max-w-6xl gap-2 overflow-x-auto px-4 py-2 border-t border-border/50 text-xs font-semibold">
          <button
            onClick={() => setHub("all")}
            className={`rounded-full px-3 py-1 transition cursor-pointer whitespace-nowrap ${
              hub === "all"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-secondary text-secondary-foreground hover:bg-muted"
            }`}
          >
            {t.allTeams} ({TEAMS.length})
          </button>
          <button
            onClick={() => setHub("minnesota")}
            className={`rounded-full px-3 py-1 transition cursor-pointer whitespace-nowrap ${
              hub === "minnesota"
                ? "bg-[#4F2683] text-[#FFC62F] font-bold shadow-sm"
                : "bg-secondary text-secondary-foreground hover:bg-muted"
            }`}
          >
            {t.minnesotaHub} ({MN_IDS.length})
          </button>
          <button
            onClick={() => setHub("ratchaburi")}
            className={`rounded-full px-3 py-1 transition cursor-pointer whitespace-nowrap ${
              hub === "ratchaburi"
                ? "bg-[#FF6600] text-white font-bold shadow-sm"
                : "bg-secondary text-secondary-foreground hover:bg-muted"
            }`}
          >
            {t.ratchaburiHub}
          </button>
        </div>

        {/* Live Score Ticker */}
        <Ticker games={games} lang={lang} />

        {/* Desktop Navigation */}
        <nav className="mx-auto hidden max-w-6xl gap-1 px-4 sm:flex overflow-x-auto">
          {tabs(t, lang).map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => {
                setTab(key as AppTab);
                setSelectedGame(null);
              }}
              className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
                tab === key
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{label}</span>
              {key === "live" && liveCount > 0 && (
                <span className="rounded-full bg-red-500 px-1.5 py-0.2 text-[10px] text-white">
                  {liveCount}
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
            games={games}
            hub={hub}
            lang={lang}
            favs={favs}
            toggleFav={toggleFav}
            preds={preds}
            setPreds={setPreds}
            onSelectGame={(g) => setSelectedGame(g)}
          />
        )}

        {tab === "pulse" && (
          <PulseTab
            games={games}
            hub={hub}
            lang={lang}
            favs={favs}
            onSelectGame={(g) => {
              setSelectedGame(g);
              setTab("live");
            }}
            onSelectTeam={(t) => {
              setSelectedTeamId(t.id);
              setTab("seasons");
            }}
          />
        )}

        {tab === "my" && (
          <MyTab
            favs={favs}
            toggleFav={toggleFav}
            addAllMN={addAllMN}
            games={games}
            lang={lang}
            onSelectTeam={(t) => {
              setSelectedTeamId(t.id);
              setTab("seasons");
            }}
          />
        )}

        {tab === "seasons" && (
          <SeasonsTab
            favs={favs}
            toggleFav={toggleFav}
            addAllMN={addAllMN}
            lang={lang}
            selectedTeamId={selectedTeamId}
            onSelectTeam={(id) => setSelectedTeamId(id)}
          />
        )}

        {tab === "explore" && (
          <ExploreTab favs={favs} toggleFav={toggleFav} lang={lang} />
        )}

        {tab === "leagues" && (
          <LeaguesTab
            games={games}
            lang={lang}
            onSelectLeague={() => setTab("explore")}
          />
        )}

        {tab === "fantasy" && (
          <FantasyTab games={games} preds={preds} setPreds={setPreds} lang={lang} />
        )}
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="fixed right-0 bottom-0 left-0 z-40 border-t border-border bg-background/95 backdrop-blur-md sm:hidden">
        <div className="grid grid-cols-7 py-1">
          {tabs(t, lang).map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => {
                setTab(key as AppTab);
                setSelectedGame(null);
              }}
              className={`flex flex-col items-center justify-center py-1.5 text-[10px] transition cursor-pointer ${
                tab === key ? "font-bold text-primary" : "text-muted-foreground"
              }`}
            >
              <div className="relative">
                <Icon className="h-4 w-4" />
                {key === "live" && liveCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                )}
              </div>
              <span className="truncate max-w-[45px] text-[9px] mt-0.5">{label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}

// =========================================================================
// SUBCOMPONENTS
// =========================================================================
function Seal({ t, size = 36 }: { t: Team; size?: number }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        backgroundColor: t.color,
        color: t.accent || "#fff",
      }}
      className="flex shrink-0 items-center justify-center rounded-xl font-display font-black text-xs shadow-sm ring-1 ring-border/20 uppercase"
    >
      {t.seal}
    </div>
  );
}

function HubInfo({
  hub,
  now,
  mounted,
  dualWeather,
  lang,
}: {
  hub: Hub;
  now: Date;
  mounted: boolean;
  dualWeather: {
    ratchaburi?: { tempC?: number; condition?: string; rainChance?: number } | null;
    minnesota?: { tempF?: number; humidity?: number; windMph?: number } | null;
  };
  lang: Lang;
}) {
  const ctTime = mounted
    ? now.toLocaleTimeString("en-US", {
        timeZone: "America/Chicago",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
    : "12:00:00 PM";

  const ictTime = mounted
    ? now.toLocaleTimeString("en-US", {
        timeZone: "Asia/Bangkok",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
    : "12:00:00 AM";

  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
      <span className="font-mono text-[11px] font-semibold text-primary">
        CT {ctTime}
      </span>
      <span>•</span>
      <span className="font-mono text-[11px] font-semibold text-accent">
        ICT {ictTime}
      </span>
      <span>•</span>
      <span className="truncate">
        {hub === "minnesota"
          ? `Twin Cities ${dualWeather.minnesota?.tempF ? `• ${dualWeather.minnesota.tempF}°F` : ""}`
          : hub === "ratchaburi"
            ? `Dragon Solar Park ${dualWeather.ratchaburi?.tempC ? `• ${dualWeather.ratchaburi.tempC}°C` : ""}`
            : lang === "th"
              ? "ครอบคลุม 14 ลีกทั่วโลก"
              : "Global Sports Coverage (14 Leagues)"}
      </span>
    </div>
  );
}

function Ticker({ games, lang }: { games: Game[]; lang: Lang }) {
  if (!games || games.length === 0) return null;

  return (
    <div className="border-t border-border/40 bg-card/60 overflow-hidden py-1.5">
      <div className="flex items-center gap-6 animate-marquee whitespace-nowrap text-xs">
        {games.slice(0, 10).map((g) => {
          const home = teamById(g.homeId);
          const away = teamById(g.awayId);
          const isLive = g.status === "LIVE";

          return (
            <div key={g.id} className="inline-flex items-center gap-2 px-2">
              <span className="font-bold text-[10px] text-muted-foreground uppercase">
                {g.sport}
              </span>
              <span className="font-bold text-foreground">
                {away.seal}
              </span>
              {isLive ? (
                <span className="font-bold text-red-500 font-mono">
                  {g.score?.away} - {g.score?.home}
                </span>
              ) : (
                <span className="text-muted-foreground text-[11px]">vs</span>
              )}
              <span className="font-bold text-foreground">
                {home.seal}
              </span>
              {isLive ? (
                <span className="rounded bg-red-500/20 px-1 py-0.2 text-[9px] font-bold text-red-500">
                  {g.clock || "LIVE"}
                </span>
              ) : (
                <span className="text-muted-foreground text-[10px]">
                  ({fmtTime(g.time, "Asia/Bangkok", lang)})
                  {g.odds && ` • ${g.odds.spread}`}
                </span>
              )}
              <span className="text-border">|</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function GameTimes({ time, lang }: { time: string; lang: Lang }) {
  const ct = fmtTime(time, "America/Chicago", lang);
  const ict = fmtTime(time, "Asia/Bangkok", lang);

  return (
    <div className="flex flex-col gap-0.5 text-right font-mono text-[11px] text-muted-foreground">
      <span className="font-semibold text-foreground">CT: {ct}</span>
      <span className="text-accent font-semibold">ICT: {ict}</span>
    </div>
  );
}

function calendarLinks(g: Game) {
  const home = teamById(g.homeId);
  const away = teamById(g.awayId);
  const title = encodeURIComponent(`${away.name} vs ${home.name}`);
  const details = encodeURIComponent(
    `Live broadcast on Hermetica Sports OS. Venue: ${home.venue}`
  );
  const loc = encodeURIComponent(home.venue);
  const d = new Date(g.time);
  const start = d.toISOString().replace(/-|:|\.\d+/g, "");
  const end = new Date(d.getTime() + 3 * 3600000)
    .toISOString()
    .replace(/-|:|\.\d+/g, "");

  const gCal = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${end}&details=${details}&location=${loc}`;
  const lineShare = `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(
    window?.location?.href || ""
  )}&text=${title}`;

  return { gCal, lineShare };
}

function GameCard({
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
  pred?: string;
  setPred: (teamId: string) => void;
  onSelect?: () => void;
}) {
  const home = teamById(game.homeId);
  const away = teamById(game.awayId);
  const isLive = game.status === "LIVE";
  const { gCal, lineShare } = calendarLinks(game);

  return (
    <div
      onClick={onSelect}
      className={`group relative rounded-2xl border p-4 transition-all duration-200 cursor-pointer ${
        isLive
          ? "border-red-500/40 bg-card/90 shadow-md shadow-red-500/5 hover:border-red-500"
          : "border-border bg-card/60 hover:border-primary/50 hover:bg-card"
      }`}
    >
      <div className="flex items-center justify-between border-b border-border/40 pb-2.5">
        <div className="flex items-center gap-2">
          <span className="rounded-md bg-secondary px-2 py-0.5 text-[10px] font-bold text-muted-foreground uppercase">
            {game.sport}
          </span>
          {isLive ? (
            <span className="flex items-center gap-1.5 rounded-full bg-red-500/10 px-2.5 py-0.5 text-xs font-bold text-red-500">
              <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-ping" />
              {game.clock || "LIVE"}
            </span>
          ) : (
            <span className="text-xs text-muted-foreground font-medium">
              {home.venue}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleFav();
            }}
            className="p-1 rounded-full hover:bg-muted text-muted-foreground hover:text-accent transition"
            title="Favorite"
          >
            <Star
              className={`h-4 w-4 ${isFav ? "fill-accent text-accent" : ""}`}
            />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 items-center gap-2 py-4">
        <div className="flex flex-col items-center text-center">
          <Seal t={away} size={42} />
          <span className="mt-2 font-bold text-sm leading-tight">{away.name}</span>
          <span className="text-[11px] text-muted-foreground font-medium">
            {away.record}
          </span>
        </div>

        <div className="flex flex-col items-center justify-center text-center">
          {isLive ? (
            <div className="flex items-center gap-2 font-mono text-2xl font-black text-red-500">
              <span>{game.score?.away ?? 0}</span>
              <span className="text-muted-foreground text-sm">-</span>
              <span>{game.score?.home ?? 0}</span>
            </div>
          ) : (
            <span className="rounded-full bg-muted/80 px-2.5 py-1 text-xs font-bold text-muted-foreground">
              VS
            </span>
          )}
          <GameTimes time={game.time} lang={lang} />
        </div>

        <div className="flex flex-col items-center text-center">
          <Seal t={home} size={42} />
          <span className="mt-2 font-bold text-sm leading-tight">{home.name}</span>
          <span className="text-[11px] text-muted-foreground font-medium">
            {home.record}
          </span>
        </div>
      </div>

      {game.odds && (
        <div className="flex items-center justify-between border-t border-border/40 pt-2 text-xs text-muted-foreground font-medium">
          <span>Spread: {game.odds.spread}</span>
          <span>O/U: {game.odds.overUnder}</span>
          <span>ML: {game.odds.moneyline}</span>
        </div>
      )}

      <div className="mt-3 flex items-center justify-between border-t border-border/40 pt-2.5 text-xs">
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setPred(away.id);
            }}
            className={`rounded-lg px-2 py-1 text-[11px] font-semibold transition ${
              pred === away.id
                ? "bg-primary text-primary-foreground font-bold"
                : "bg-secondary text-secondary-foreground hover:bg-muted"
            }`}
          >
            Pick {away.seal}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setPred(home.id);
            }}
            className={`rounded-lg px-2 py-1 text-[11px] font-semibold transition ${
              pred === home.id
                ? "bg-primary text-primary-foreground font-bold"
                : "bg-secondary text-secondary-foreground hover:bg-muted"
            }`}
          >
            Pick {home.seal}
          </button>
        </div>

        <div className="flex items-center gap-2 text-muted-foreground">
          <a
            href={gCal}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="hover:text-primary transition"
            title="Export to Calendar"
          >
            <Calendar className="h-4 w-4" />
          </a>
          <a
            href={lineShare}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="hover:text-green-500 transition"
            title="Share via LINE"
          >
            <Share2 className="h-4 w-4" />
          </a>
        </div>
      </div>
    </div>
  );
}

// =========================================================================
// TABS IMPLEMENTATION
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
}: {
  games: Game[];
  hub: Hub;
  lang: Lang;
  favs: string[];
  toggleFav: (id: string) => void;
  preds: Record<string, string>;
  setPreds: (p: Record<string, string>) => void;
  onSelectGame: (g: Game) => void;
}) {
  const filtered = useMemo(() => {
    return games.filter((g) => {
      if (hub === "minnesota") {
        return MN_IDS.includes(g.homeId) || MN_IDS.includes(g.awayId);
      }
      if (hub === "ratchaburi") {
        return g.homeId === "rbfc" || g.awayId === "rbfc";
      }
      return true;
    });
  }, [games, hub]);

  const liveGames = filtered.filter((g) => g.status === "LIVE");
  const upcomingGames = filtered.filter((g) => g.status === "UPCOMING");

  return (
    <div className="space-y-6">
      {liveGames.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <Radio className="h-5 w-5 text-red-500 animate-pulse" />
            <h2 className="font-display text-lg tracking-wide text-red-500">
              {lang === "th" ? "กำลังถ่ายทอดสด" : "LIVE NOW"} ({liveGames.length})
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {liveGames.map((game) => (
              <GameCard
                key={game.id}
                game={game}
                lang={lang}
                isFav={favs.includes(game.homeId) || favs.includes(game.awayId)}
                toggleFav={() => toggleFav(game.homeId)}
                pred={preds[game.id]}
                setPred={(teamId) => setPreds({ ...preds, [game.id]: teamId })}
                onSelect={() => onSelectGame(game)}
              />
            ))}
          </div>
        </section>
      )}

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            <h2 className="font-display text-lg tracking-wide">
              {lang === "th" ? "โปรแกรมการแข่งขันถัดไป" : "UPCOMING SCHEDULE"} ({upcomingGames.length})
            </h2>
          </div>
        </div>

        {upcomingGames.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-8 text-center text-muted-foreground">
            <p>No upcoming matches found for the selected hub.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {upcomingGames.map((game) => (
              <GameCard
                key={game.id}
                game={game}
                lang={lang}
                isFav={favs.includes(game.homeId) || favs.includes(game.awayId)}
                toggleFav={() => toggleFav(game.homeId)}
                pred={preds[game.id]}
                setPred={(teamId) => setPreds({ ...preds, [game.id]: teamId })}
                onSelect={() => onSelectGame(game)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function PulseTab({
  games,
  hub,
  lang,
  favs,
  onSelectGame,
  onSelectTeam,
}: {
  games: Game[];
  hub: Hub;
  lang: Lang;
  favs: string[];
  onSelectGame: (g: Game) => void;
  onSelectTeam: (t: Team) => void;
}) {
  const [expandedTeamId, setExpandedTeamId] = useState<string | null>(null);

  const teamList = useMemo(() => {
    let list = TEAMS;
    if (hub === "minnesota") {
      list = TEAMS.filter((t) => MN_IDS.includes(t.id));
    } else if (hub === "ratchaburi") {
      list = TEAMS.filter((t) => t.id === "rbfc");
    }
    return list;
  }, [hub]);

  // Compute live intensity pulse score 0-100
  const scoredTeams = useMemo(() => {
    return teamList
      .map((t) => {
        const outlook = getTeamSeasonOutlook(t);
        const activeGame = games.find(
          (g) => g.homeId === t.id || g.awayId === t.id
        );
        let score = outlook.championshipProbability || 75;
        if (activeGame?.status === "LIVE") {
          score = Math.min(99, score + 12);
        }
        if (favs.includes(t.id)) {
          score = Math.min(100, score + 4);
        }
        return {
          team: t,
          score,
          activeGame,
          outlook,
        };
      })
      .sort((a, b) => b.score - a.score);
  }, [teamList, games, favs]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="flex items-center gap-2 font-display text-2xl tracking-wide text-primary">
            <Activity className="h-6 w-6 text-accent animate-pulse" />
            <span>{lang === "th" ? "ดัชนีสปอร์ต เพลส์ 365 วัน" : "SPORTS PULSE INDEX"}</span>
          </h2>
          <p className="text-xs text-muted-foreground">
            {lang === "th"
              ? "คำนวณจากโมเมนตัมสด, ความพึงพอใจของแฟนคลับ, และความพร้อมสู่แชมป์ เรียงจากสูงสุดไปต่ำสุด"
              : "Ranked High-to-Low based on live intensity, championship trajectory, and sentiment"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {scoredTeams.map(({ team, score, activeGame, outlook }, idx) => {
          const isExpanded = expandedTeamId === team.id;

          return (
            <div
              key={team.id}
              className="rounded-2xl border border-border bg-card/70 p-4 transition-all hover:border-primary/50"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="font-display text-lg font-bold text-muted-foreground w-6">
                    #{idx + 1}
                  </span>
                  <Seal t={team} size={42} />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-base">{team.name}</span>
                      <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-bold text-muted-foreground uppercase">
                        {team.league || team.sport}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {outlook.phaseLabel[lang]}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="flex items-center gap-1 font-mono text-2xl font-black text-primary">
                      <span>{score}</span>
                      <span className="text-xs text-muted-foreground">/100</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground uppercase font-bold">
                      {activeGame?.status === "LIVE" ? "IN PLAY" : "INDEX SCORE"}
                    </span>
                  </div>

                  <button
                    onClick={() => setExpandedTeamId(isExpanded ? null : team.id)}
                    className="p-1 rounded-lg border border-border hover:bg-secondary transition cursor-pointer"
                  >
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
                  style={{ width: `${score}%` }}
                />
              </div>

              {/* Summary paragraph */}
              <div className="mt-3 text-xs leading-relaxed text-muted-foreground">
                <p>{outlook.summary[lang]}</p>
              </div>

              {/* Expanded Season Outlook Details */}
              {isExpanded && (
                <div className="mt-4 border-t border-border/50 pt-3 space-y-3">
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 text-xs">
                    <div className="rounded-xl bg-secondary/50 p-2.5">
                      <span className="text-[10px] text-muted-foreground block font-semibold">
                        PROJECTED RECORD
                      </span>
                      <span className="font-bold text-foreground">
                        {outlook.projectedRecord}
                      </span>
                    </div>
                    <div className="rounded-xl bg-secondary/50 p-2.5">
                      <span className="text-[10px] text-muted-foreground block font-semibold">
                        CHAMPIONSHIP ODDS
                      </span>
                      <span className="font-bold text-accent">
                        {outlook.championshipOdds}
                      </span>
                    </div>
                    <div className="rounded-xl bg-secondary/50 p-2.5">
                      <span className="text-[10px] text-muted-foreground block font-semibold">
                        TARGET
                      </span>
                      <span className="font-bold text-primary truncate block">
                        {outlook.championshipTarget}
                      </span>
                    </div>
                    <div className="rounded-xl bg-secondary/50 p-2.5">
                      <span className="text-[10px] text-muted-foreground block font-semibold">
                        TITLE PROBABILITY
                      </span>
                      <span className="font-bold text-foreground">
                        {outlook.championshipProbability}%
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      onClick={() => onSelectTeam(team)}
                      className="flex items-center gap-1.5 rounded-xl bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground hover:bg-primary/90 transition cursor-pointer"
                    >
                      <span>{lang === "th" ? "ดูภาพรวมฤดูกาลแบบเต็ม" : "View Full Season Outlook"}</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MyTab({
  favs,
  toggleFav,
  addAllMN,
  games,
  lang,
  onSelectTeam,
}: {
  favs: string[];
  toggleFav: (id: string) => void;
  addAllMN: () => void;
  games: Game[];
  lang: Lang;
  onSelectTeam: (t: Team) => void;
}) {
  const favoriteTeams = TEAMS.filter((tm) => favs.includes(tm.id));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl tracking-wide">
            {lang === "th" ? "ทีมโปรดของฉัน" : "MY FAVORITE TEAMS"} ({favoriteTeams.length})
          </h2>
          <p className="text-xs text-muted-foreground">
            {lang === "th"
              ? "จัดการทีมโปรดและติดตามความเคลื่อนไหวตลอดทั้งฤดูกาล"
              : "Custom personalized hub for your favorite franchises"}
          </p>
        </div>

        {favoriteTeams.length < 7 && (
          <button
            onClick={addAllMN}
            className="rounded-xl bg-primary/20 px-3 py-1.5 text-xs font-bold text-primary hover:bg-primary/30 transition cursor-pointer"
          >
            + Add All 7 Minnesota Teams
          </button>
        )}
      </div>

      {favoriteTeams.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center">
          <Star className="mx-auto h-8 w-8 text-muted-foreground opacity-40 mb-2" />
          <p className="text-sm text-muted-foreground">
            {lang === "th"
              ? "คุณยังไม่มีทีมโปรด คลิกดาวเพื่อเพิ่มทีมของคุณ"
              : "No favorite teams selected yet. Tap the star on any team to add."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {favoriteTeams.map((team) => {
            const outlook = getTeamSeasonOutlook(team);
            const teamGames = games.filter(
              (g) => g.homeId === team.id || g.awayId === team.id
            );

            return (
              <div
                key={team.id}
                className="rounded-2xl border border-border bg-card/70 p-4 transition hover:border-primary/50"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Seal t={team} size={44} />
                    <div>
                      <h3 className="font-bold text-base leading-tight">
                        {team.name}
                      </h3>
                      <span className="text-xs text-muted-foreground font-medium">
                        {team.league || team.sport} • {team.venue}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => toggleFav(team.id)}
                    className="p-1.5 text-accent hover:text-muted-foreground transition cursor-pointer"
                  >
                    <Star className="h-5 w-5 fill-accent" />
                  </button>
                </div>

                <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                  {outlook.summary[lang]}
                </p>

                <div className="mt-4 flex items-center justify-between border-t border-border/50 pt-3 text-xs">
                  <span className="font-semibold text-primary">
                    {outlook.championshipOdds}
                  </span>
                  <button
                    onClick={() => onSelectTeam(team)}
                    className="flex items-center gap-1 font-bold text-accent hover:underline cursor-pointer"
                  >
                    <span>{lang === "th" ? "ดูภาพรวม" : "Season Outlook"}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function SeasonsTab({
  favs,
  addAllMN,
  lang,
  selectedTeamId,
  onSelectTeam,
}: {
  favs: string[];
  toggleFav: (id: string) => void;
  addAllMN: () => void;
  lang: Lang;
  selectedTeamId: string | null;
  onSelectTeam: (id: string) => void;
}) {
  const favoriteTeams = TEAMS.filter((tm) => favs.includes(tm.id));
  const activeTeamId = selectedTeamId || favoriteTeams[0]?.id || "vik";
  const currentTeam = teamById(activeTeamId);
  const outlook = getTeamSeasonOutlook(currentTeam);

  const [activePhase, setActivePhase] = useState<SeasonPhase>(outlook.currentPhase);

  useEffect(() => {
    setActivePhase(outlook.currentPhase);
  }, [outlook.currentPhase, activeTeamId]);

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <section className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-r from-card via-card to-secondary/30 p-6 shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-md">
              <Calendar className="h-6 w-6" />
            </div>
            <div>
              <h2 className="font-display text-2xl tracking-wide sm:text-3xl">
                {lang === "th" ? "มุมมองภาพรวมฤดูกาล" : "COMPLETE SEASON OUTLOOK"}
              </h2>
              <p className="text-xs text-muted-foreground">
                {lang === "th"
                  ? "เจาะลึก 4 ระยะสำคัญ: ปรีซีซัน • ฤดูกาลปกติ • เพลย์ออฟและล่าแชมป์ • ตลาดปิดฤดูกาล"
                  : "Tracking all phases: Preseason • Regular Season • Championships • Offseason"}
              </p>
            </div>
          </div>
          {favoriteTeams.length < 7 && (
            <button
              onClick={addAllMN}
              className="rounded-xl bg-primary/20 px-3 py-1.5 text-xs font-bold text-primary hover:bg-primary/30 transition cursor-pointer"
            >
              + Add All Minnesota Franchises
            </button>
          )}
        </div>

        {/* Team Selector Horizontal Strip */}
        <div className="mt-6 flex gap-2 overflow-x-auto pb-2">
          {TEAMS.map((tm) => {
            const isSelected = tm.id === activeTeamId;
            return (
              <button
                key={tm.id}
                onClick={() => onSelectTeam(tm.id)}
                className={`flex shrink-0 items-center gap-2 rounded-2xl border px-3 py-2 text-xs font-semibold transition cursor-pointer ${
                  isSelected
                    ? "border-primary bg-primary/10 text-primary shadow-sm"
                    : "border-border bg-card/60 text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                <Seal t={tm} size={24} />
                <span>{tm.name}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Selected Team Season Dashboard */}
      <section className="rounded-3xl border border-border bg-card/70 p-6 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/50 pb-4">
          <div className="flex items-center gap-4">
            <Seal t={currentTeam} size={56} />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display text-xl sm:text-2xl font-bold">
                  {currentTeam.name}
                </h3>
                <span className="rounded bg-primary/20 px-2 py-0.5 text-xs font-bold text-primary uppercase">
                  {outlook.seasonYear}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {outlook.phaseLabel[lang]}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[10px] text-muted-foreground uppercase font-bold block">
                CHAMPIONSHIP ODDS
              </span>
              <span className="font-mono text-lg font-bold text-accent">
                {outlook.championshipOdds}
              </span>
            </div>
          </div>
        </div>

        {/* 4 Phases Selector Tabs */}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {(
            [
              { id: "preseason", label: lang === "th" ? "1. ปรีซีซัน" : "1. Preseason" },
              { id: "regular", label: lang === "th" ? "2. ฤดูกาลปกติ" : "2. Regular Season" },
              { id: "playoffs", label: lang === "th" ? "3. เพลย์ออฟ" : "3. Playoffs & Title" },
              { id: "offseason", label: lang === "th" ? "4. ปิดฤดูกาล" : "4. Offseason" },
            ] as const
          ).map((p) => {
            const isCurrent = outlook.currentPhase === p.id;
            const isTabActive = activePhase === p.id;

            return (
              <button
                key={p.id}
                onClick={() => setActivePhase(p.id)}
                className={`relative flex flex-col items-center justify-center rounded-2xl border p-3 text-center transition cursor-pointer ${
                  isTabActive
                    ? "border-primary bg-primary/10 text-primary font-bold shadow-sm"
                    : "border-border bg-card/40 text-muted-foreground hover:bg-secondary"
                }`}
              >
                {isCurrent && (
                  <span className="absolute top-2 right-2 flex h-2 w-2">
                    <span className="h-full w-full rounded-full bg-accent animate-ping" />
                    <span className="h-full w-full rounded-full bg-accent" />
                  </span>
                )}
                <span className="text-xs">{p.label}</span>
                <span className="text-[10px] text-muted-foreground uppercase mt-1">
                  {isCurrent ? "Active Now" : "Phase View"}
                </span>
              </button>
            );
          })}
        </div>

        {/* Active Phase Content */}
        <div className="rounded-2xl border border-border/60 bg-background/50 p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/40 pb-3">
            <h4 className="font-display text-lg tracking-wide capitalize text-foreground">
              {activePhase === "preseason" && (lang === "th" ? "รายละเอียดช่วงปรีซีซัน" : "Preseason Phase")}
              {activePhase === "regular" && (lang === "th" ? "รายละเอียดช่วงฤดูกาลปกติ" : "Regular Season Phase")}
              {activePhase === "playoffs" && (lang === "th" ? "เส้นทางเพลย์ออฟและล่าแชมป์" : "Playoffs & Championship Quest")}
              {activePhase === "offseason" && (lang === "th" ? "แผนตลาดปิดฤดูกาลและดราฟต์" : "Offseason Retooling & Draft")}
            </h4>
            <span className="text-xs font-mono font-semibold text-muted-foreground">
              {activePhase === "preseason" && outlook.preseason.dates}
              {activePhase === "regular" && outlook.regularSeason.dates}
              {activePhase === "playoffs" && outlook.playoffs.dates}
              {activePhase === "offseason" && outlook.offseason.dates}
            </span>
          </div>

          {/* Phase Focus */}
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Strategic Focus
            </span>
            <p className="mt-1 text-sm leading-relaxed text-foreground">
              {activePhase === "preseason" && outlook.preseason.focus[lang]}
              {activePhase === "regular" && outlook.regularSeason.focus[lang]}
              {activePhase === "playoffs" && outlook.playoffs.focus[lang]}
              {activePhase === "offseason" && outlook.offseason.focus[lang]}
            </p>
          </div>

          {/* Regular Season Key Matchups */}
          {activePhase === "regular" && outlook.regularSeason.keyMatchups && (
            <div className="space-y-2 pt-2">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Key Marquee Matchups
              </span>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                {outlook.regularSeason.keyMatchups.map((m, idx) => (
                  <div key={idx} className="rounded-xl border border-border bg-card p-3 text-xs">
                    <span className="font-bold text-foreground block">{m.opponent}</span>
                    <span className="text-muted-foreground block text-[11px] mt-0.5">
                      {m.date} • {m.venue}
                    </span>
                    <span className="text-[10px] text-accent font-semibold block mt-1">
                      {m.note}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Playoff Path & Clinch Scenario */}
          {activePhase === "playoffs" && (
            <div className="space-y-3 pt-2">
              <div className="rounded-xl bg-primary/10 border border-primary/20 p-4 text-xs">
                <span className="font-bold text-primary block uppercase tracking-wider">
                  Championship Path
                </span>
                <p className="mt-1 text-foreground leading-relaxed">
                  {outlook.playoffs.path[lang]}
                </p>
              </div>

              <div className="rounded-xl bg-accent/10 border border-accent/20 p-4 text-xs">
                <span className="font-bold text-accent block uppercase tracking-wider">
                  Clinch Scenario
                </span>
                <p className="mt-1 text-foreground leading-relaxed">
                  {outlook.playoffs.clinchScenario[lang]}
                </p>
              </div>
            </div>
          )}

          {/* Offseason Priorities & Draft */}
          {activePhase === "offseason" && (
            <div className="space-y-3 pt-2 text-xs">
              <div className="flex items-center justify-between font-mono text-muted-foreground">
                <span>Cap Space / Budget:</span>
                <span className="font-bold text-foreground">
                  {outlook.offseason.capOrBudget}
                </span>
              </div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {outlook.offseason.priorities.map((pr, idx) => (
                  <div key={idx} className="rounded-xl border border-border bg-card p-3">
                    <span className="font-bold text-primary block">{pr.area}</span>
                    <span className="text-muted-foreground mt-0.5 block">
                      {pr.details}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
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
  const [query, setQuery] = useState("");
  const [selectedSport, setSelectedSport] = useState("all");

  const sports = useMemo(() => {
    return ["all", ...Array.from(new Set(TEAMS.map((t) => t.sport)))];
  }, []);

  const filteredTeams = useMemo(() => {
    return TEAMS.filter((t) => {
      const matchesSport = selectedSport === "all" || t.sport === selectedSport;
      const matchesQuery =
        !query ||
        t.name.toLowerCase().includes(query.toLowerCase()) ||
        (t.th && t.th.toLowerCase().includes(query.toLowerCase())) ||
        (t.league && t.league.toLowerCase().includes(query.toLowerCase())) ||
        t.venue.toLowerCase().includes(query.toLowerCase());
      return matchesSport && matchesQuery;
    });
  }, [query, selectedSport]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-2xl tracking-wide">
            {lang === "th" ? "สำรวจสโมสรทั้งหมด" : "EXPLORE ALL TEAMS"} ({filteredTeams.length})
          </h2>
          <p className="text-xs text-muted-foreground">
            {lang === "th"
              ? "ค้นหาทีมจากทั่วทุกมุมโลก พร้อมข้อมูลสนามและลีก"
              : "Search and discover sports franchises across all covered leagues"}
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={lang === "th" ? "ค้นหาชื่อทีม, ลีก, หรือสนาม..." : "Search teams, leagues, cities..."}
            className="w-full rounded-full border border-border bg-card py-2 pl-9 pr-4 text-xs focus:border-primary focus:outline-none"
          />
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 text-xs">
        {sports.map((sp) => (
          <button
            key={sp}
            onClick={() => setSelectedSport(sp)}
            className={`rounded-full px-3 py-1 font-semibold uppercase transition cursor-pointer whitespace-nowrap ${
              selectedSport === sp
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-muted"
            }`}
          >
            {sp}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filteredTeams.map((team) => (
          <div
            key={team.id}
            className="flex items-center justify-between rounded-2xl border border-border bg-card/60 p-3.5 transition hover:border-primary/50"
          >
            <div className="flex items-center gap-3">
              <Seal t={team} size={38} />
              <div>
                <h4 className="font-bold text-sm leading-tight">{team.name}</h4>
                <span className="text-[11px] text-muted-foreground">
                  {team.league || team.sport} • {team.venue}
                </span>
              </div>
            </div>

            <button
              onClick={() => toggleFav(team.id)}
              className="p-1 text-muted-foreground hover:text-accent transition cursor-pointer"
            >
              <Star
                className={`h-4 w-4 ${favs.includes(team.id) ? "fill-accent text-accent" : ""}`}
              />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

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
        <h2 className="font-display text-2xl tracking-wide">
          {lang === "th" ? "14 ลีกกีฬาชั้นนำ" : "14 GLOBAL SPORTS LEAGUES"}
        </h2>
        <p className="text-xs text-muted-foreground">
          {lang === "th"
            ? "เข้าถึงข้อมูลการแข่งขันจากลีกชั้นนำระดับโลก"
            : "Multi-sport coverage with live API feeds and scoreboards"}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ESPN_LEAGUES.map((l) => {
          const leagueGames = games.filter((g) => g.sport.toUpperCase() === l.sport.toUpperCase());

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
                  {leagueGames.length} fixtures
                </span>
              </div>

              <h3 className="mt-3 font-display text-xl font-bold group-hover:text-primary transition">
                {l.name}
              </h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Public scoreboard endpoint connected via ESPN & Hermetica API.
              </p>

              <div className="mt-4 flex items-center justify-between border-t border-border/40 pt-3 text-xs font-semibold text-primary">
                <span>View League Matches</span>
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function FantasyTab({
  games,
  preds,
  setPreds,
  lang,
}: {
  games: Game[];
  preds: Record<string, string>;
  setPreds: (p: Record<string, string>) => void;
  lang: Lang;
}) {
  const predictionCount = Object.keys(preds).length;

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-border bg-gradient-to-r from-card via-card to-secondary/30 p-6 shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent text-accent-foreground shadow-md">
              <Trophy className="h-6 w-6" />
            </div>
            <div>
              <h2 className="font-display text-2xl tracking-wide">
                {lang === "th" ? "มินิเกมทายผลกีฬา" : "HERMETICA PREDICTION MINI-GAME"}
              </h2>
              <p className="text-xs text-muted-foreground">
                {lang === "th"
                  ? "ทายผลผู้ชนะเพื่อสะสมแต้มและสถิติไร้พ่าย พร้อมแชร์ขึ้น LINE"
                  : "Pick game winners, build your win streak, and share picks on LINE"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
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
          const home = teamById(game.homeId);
          const away = teamById(game.awayId);
          const currentPick = preds[game.id];

          return (
            <div
              key={game.id}
              className="rounded-2xl border border-border bg-card/70 p-4 space-y-3"
            >
              <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold">
                <span>{game.sport}</span>
                <span>{fmtTime(game.time, "Asia/Bangkok", lang)}</span>
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
