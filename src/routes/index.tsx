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

// App navigation tabs including the full Seasons tab
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
  championshipProbability: number; // 0-100
  preseason: PhaseDetail;
  regularSeason: PhaseDetail & {
    standing: string;
    keyMatchups: Array<{ opponent: string; date: string; venue: string; note: string }>;
  };
  playoffs: PhaseDetail & {
    path: { en: string; th: string };
    clinchScenario: { en: string; th: string };
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
      en: "Regular Season • Week 6 Bye Week (5-0)",
      th: "ฤดูกาลปกติ • สัปดาห์พักแข่ง วีก 6 (5-0 ไร้พ่าย)",
    },
    summary: {
      en: "5-0 undefeated start leading the NFC North. Brian Flores defense leads the NFL in takeaways and simulated pressures, while Kevin O'Connell offensive scheme masterclass has Sam Darnold operating at career-high efficiency.",
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
        { date: "Feb 14", title: "Super Bowl LXI", note: "Lombardi Trophy goal" },
      ],
    },
    offseason: {
      status: "upcoming",
      dates: "Feb 15 - July 25, 2027",
      focus: {
        en: "Cornerback depth reinforcement, interior offensive line contract extensions, franchise QB decision.",
        th: "เสริมคอร์เนอร์แบ็ก, ต่อสัญญาแนวป้องกันกลาง และตัดสินใจสัญญาระยะยาวควอเตอร์แบ็ก",
      },
      capOrBudget: "Projected $38.5M Salary Cap Space",
      priorities: [
        { area: "Secondary Depth", details: "Retain Byron Murphy Jr. and draft developmental press corners" },
        { area: "Defensive Tackle", details: "Acquire run-stuffing 0-technique tackle for Flores front" },
      ],
      draftOutlook: {
        en: "Full slate of 2027 draft picks; focus on premium defensive value and complementary speed on offense.",
        th: "มีดราฟต์รอบต้นครบถ้วน มุ่งเป้าผู้เล่นเกมรับแถวหน้าและความเร็วเกมรุก",
      },
      milestones: [
        { date: "March 2027", title: "NFL Free Agency Opening", note: "Target veteran defensive additions" },
        { date: "April 2027", title: "2027 NFL Draft", note: "3-day rookie selection" },
      ],
    },
  },

  wolves: {
    teamId: "wolves",
    seasonYear: "2026-2027 NBA Season",
    currentPhase: "regular",
    phaseLabel: {
      en: "Regular Season • Western Conference Grind",
      th: "ฤดูกาลปกติ • ตะลุยสายตะวันตก",
    },
    summary: {
      en: "Championship window wide open. Anthony Edwards emerging as an undisputed MVP candidate alongside 4-time DPOY Rudy Gobert and the versatile integration of Julius Randle and Donte DiVincenzo.",
      th: "โอกาสลุ้นแชมป์เปิดกว้างเต็มที่ แอนโทนี เอ็ดเวิร์ดส์ ก้าวสู่แคนดิเดต MVP ร่วมกับ รูดี โกแบร์ และการเสริมทัพอย่าง จูเลียส แรนเดิล และ ดอนเต ดิวินเชนโซ",
    },
    projectedRecord: "54-28 (Top 3 Western Conference)",
    championshipOdds: "+750 (Western Conference Favorites)",
    championshipTarget: "Larry O'Brien Trophy (NBA Finals)",
    championshipProbability: 82,
    preseason: {
      status: "completed",
      dates: "Oct 1 - Oct 18, 2026",
      record: "4-1 (Preseason)",
      focus: {
        en: "New frontcourt spacing with Julius Randle and bench shooting unit chemistry.",
        th: "การปรับสเปซแดนหน้ากับ จูเลียส แรนเดิล และจังหวะยิงของชุดสำรอง",
      },
      milestones: [
        { date: "Oct 8", title: "Target Center Scrimmage", note: "DiVincenzo hit 6 threes off the bench" },
      ],
      keyPlayers: [
        { name: "Anthony Edwards", role: "SG/Primary Scorer", highlight: "Averaging 28+ PPG with lethal pull-up three" },
        { name: "Rudy Gobert", role: "Center", highlight: "Defensive paint anchor, rebound vacuum" },
      ],
    },
    regularSeason: {
      status: "in_progress",
      dates: "Oct 22, 2026 - April 14, 2027",
      record: "3-2 (Central homestand underway)",
      standing: "3rd in Western Conference",
      focus: {
        en: "Protect home court at Target Center, dominate glass, build offensive flow for clutch time.",
        th: "เก็บชัยชนะในบ้าน Target Center, คุมรีบาวด์ และพัฒนาเกมบุกช่วงท้ายเกม",
      },
      keyMatchups: [
        { opponent: "Chicago Bulls", date: "Oct 16, 2026", venue: "United Center", note: "Road test vs dynamic guard rotation" },
        { opponent: "Denver Nuggets", date: "Nov 20, 2026", venue: "Target Center", note: "Rivalry playoff rematch clash" },
        { opponent: "Dallas Mavericks", date: "Dec 25, 2026", venue: "American Airlines Center", note: "Christmas Day national showcase" },
      ],
      milestones: [
        { date: "Dec 2026", title: "NBA Cup In-Season Tournament", note: "Las Vegas Final Four quest" },
        { date: "Feb 2027", title: "All-Star Weekend", note: "Ant Edwards All-Star starter bid" },
      ],
    },
    playoffs: {
      status: "upcoming",
      dates: "April 18 - June 22, 2027",
      championshipTarget: "NBA Champions",
      focus: {
        en: "Secure Top 2 seed for home-court advantage through Western Conference Finals.",
        th: "คว้าท็อป 2 สายตะวันตกเพื่อสิทธิ์เล่นในบ้านตลอดรอบชิงแชมป์สาย",
      },
      path: {
        en: "First Round (4-1) -> Western Conference Semis -> Western Conference Finals -> NBA Finals.",
        th: "รอบแรก -> รอบรองชนะเลิศสาย -> ชิงแชมป์สายตะวันตก -> เอ็นบีเอ ไฟนอลส์",
      },
      clinchScenario: {
        en: "Targeting 52+ wins to lock up top-4 home court seed in ultra-competitive West.",
        th: "ตั้งเป้าชนะ 52 นัดขึ้นไปเพื่อยึดท็อป 4 สายตะวันตก",
      },
      milestones: [
        { date: "April 2027", title: "Round 1 Game 1", note: "Target Center playoff kickoff" },
        { date: "June 2027", title: "NBA Finals", note: "First championship in franchise history" },
      ],
    },
    offseason: {
      status: "upcoming",
      dates: "June 25 - Sept 28, 2027",
      focus: {
        en: "Maintain championship roster core under luxury tax second apron constraints.",
        th: "รักษาขุมกำลังหลักพร้อมบริหารเพดานเงินเดือน Luxury Tax",
      },
      capOrBudget: "Operating above tax line; Mid-Level Exception available",
      priorities: [
        { area: "Contract Extensions", details: "Lock in core wing rotation and veteran bench pieces" },
        { area: "Player Development", details: "Terrence Shannon Jr. & Rob Dillingham sophomore progression" },
      ],
      draftOutlook: {
        en: "Late first-round selection targeting 3-and-D wing depth.",
        th: "ดราฟต์รอบแรกช่วงท้าย มุ่งเป้าปีกยิง 3 แต้มและป้องกันเหนียว",
      },
      milestones: [
        { date: "June 2027", title: "2027 NBA Draft", note: "Rookie additions" },
        { date: "July 2027", title: "NBA Summer League", note: "Young talent showcase in Vegas" },
      ],
    },
  },

  wild: {
    teamId: "wild",
    seasonYear: "2026-2027 NHL Season",
    currentPhase: "regular",
    phaseLabel: {
      en: "Regular Season • Central Division Fight",
      th: "ฤดูกาลปกติ • ศึกสายเซ็นทรัล",
    },
    summary: {
      en: "Kirill 'The Thrill' Kaprizov playing at Hart Trophy caliber. Young core of Brock Faber, Matt Boldy, and Jesper Wallstedt entering their prime with major salary cap relief arriving this summer.",
      th: "คิริลล์ คาปริซอฟ อยู่ในฟอร์มลุ้นรางวัล Hart Trophy ประสานงานกับดาวรุ่งอย่าง บร็อค เฟเบอร์ และ แมตต์ โบลดี พร้อมปลดล็อกเพดานเงินเดือนก้อนโตช่วงซัมเมอร์",
    },
    projectedRecord: "47-27-8 (102 Pts, 2nd in Central)",
    championshipOdds: "+1400 (Stanley Cup Playoff Lock)",
    championshipTarget: "Stanley Cup Champions",
    championshipProbability: 75,
    preseason: {
      status: "completed",
      dates: "Sept 20 - Oct 5, 2026",
      record: "5-1-0",
      focus: {
        en: "Power play unit precision, Brock Faber top-pairing leadership, goaltending tandem balance.",
        th: "ความเฉียบคมของเพาเวอร์เพลย์, การนำทีมของ บร็อค เฟเบอร์ และจังหวะของผู้รักษาประตู",
      },
      milestones: [
        { date: "Oct 2", title: "Xcel Preseason Finale", note: "Kaprizov hat trick vs Blackhawks" },
      ],
    },
    regularSeason: {
      status: "in_progress",
      dates: "Oct 8, 2026 - April 15, 2027",
      record: "4-2-0 (8 Pts)",
      standing: "3rd in Central Division",
      focus: {
        en: "Dominate division tilts vs Avalanche, Stars, and Blues; stay top-3 to avoid wildcard scramble.",
        th: "เก็บแต้มจากเกมสายเซ็นทรัลเพื่อเกาะท็อป 3 เลี่ยงการตัดแต้มรอบไวลด์การ์ด",
      },
      keyMatchups: [
        { opponent: "St. Louis Blues", date: "Tonight Oct 15, 2026", venue: "Xcel Energy Center", note: "Central Division showdown" },
        { opponent: "Colorado Avalanche", date: "Nov 28, 2026", venue: "Ball Arena", note: "Rivalry test against MacKinnon" },
      ],
      milestones: [
        { date: "Jan 1, 2027", title: "NHL Winter Classic", note: "Outdoor hockey celebration" },
      ],
    },
    playoffs: {
      status: "upcoming",
      dates: "April 20 - June 20, 2027",
      championshipTarget: "Stanley Cup",
      focus: {
        en: "Break through Round 1 hump and ride elite goaltending deep into Western Conference Finals.",
        th: "ทะลุผ่านรอบแรก และอาศัยเกมรับที่แข็งแกร่งมุ่งสู่รอบชิงแชมป์สาย",
      },
      path: {
        en: "Central Division Semifinals -> Central Finals -> Western Conference Finals -> Stanley Cup Finals.",
        th: "รอบรองสายเซ็นทรัล -> รอบชิงสายเซ็นทรัล -> ชิงแชมป์สายตะวันตก -> สแตนลีย์คัพ ไฟนอลส์",
      },
      clinchScenario: {
        en: "Projected 96+ points required to punch Stanley Cup playoff ticket in Central.",
        th: "ต้องการราว 96 แต้มเพื่อการันตีตั๋วเพลย์ออฟ",
      },
      milestones: [
        { date: "April 2027", title: "Game 1 Round 1", note: "Xcel Energy Center playoff whiteout" },
      ],
    },
    offseason: {
      status: "upcoming",
      dates: "June 25 - Sept 15, 2027",
      focus: {
        en: "Historic moment: Parise & Suter buyouts expire, unlocking $14.7M in pure cap space!",
        th: "หมุดหมายประวัติศาสตร์: ภาระบายเอาต์ ปาริเซ และ ซูเตอร์ หมดลง ปลดล็อกเพดานเงินเดือน $14.7 ล้านดอลลาร์!",
      },
      capOrBudget: "$14.7M freed up + $88M projected total cap space",
      priorities: [
        { area: "Kirill Kaprizov Extension", details: "Finalize long-term megamax contract" },
        { area: "Top-6 Center Signing", details: "Pursue marquee free agent playmaking center" },
      ],
      draftOutlook: {
        en: "High-end pipeline already ranked top-5 in NHL; drafting best available player.",
        th: "ระบบเยาวชนติดท็อป 5 ของลีก มุ่งเน้นเลือกผู้เล่นพรสวรรค์สูงสุด",
      },
      milestones: [
        { date: "July 1, 2027", title: "NHL Free Agency Frenzy", note: "Minnesota enters as major buyers" },
      ],
    },
  },

  twins: {
    teamId: "twins",
    seasonYear: "2026-2027 MLB Season",
    currentPhase: "offseason",
    phaseLabel: {
      en: "Offseason Evaluation • Winter Meetings Prep",
      th: "ช่วงปิดฤดูกาล • เตรียมความพร้อมตลาดฤดูหนาว",
    },
    summary: {
      en: "Following a 77-85 campaign, front office is overhauling bullpen depth and corner outfield power. Top prospects Luke Keaschall and Zebby Matthews poised for full-season roles alongside Royce Lewis.",
      th: "หลังจบสถิติ 77-85 ทีมเร่งปรับปรุงแนวขว้างบูลเพนและเกมรุกริมสนาม ดาวรุ่งอย่าง ลุค คีชชอลล์ และ เซบบี แมทธิวส์ พร้อมก้าวขึ้นเป็นแกนหลัก",
    },
    projectedRecord: "86-76 (AL Central Wild Card Contender)",
    championshipOdds: "+2800 (AL Central Contender)",
    championshipTarget: "American League Pennant & World Series",
    championshipProbability: 55,
    preseason: {
      status: "upcoming",
      dates: "Feb 15 - March 26, 2027",
      focus: {
        en: "Fort Myers Spring Training, healthy starting rotation build-up for Pablo López and Joe Ryan.",
        th: "สปริงเทรนนิงที่ ฟอร์ตไมเออร์ส เสริมความฟิต พับโล โลเปซ และ โจ ไรอัน",
      },
      milestones: [
        { date: "Feb 19, 2027", title: "Grapefruit League Opener", note: "vs Tampa Bay Rays in Florida" },
      ],
    },
    regularSeason: {
      status: "upcoming",
      dates: "March 30 - Oct 3, 2027",
      record: "77-85 (2026 Final Record)",
      standing: "4th in AL Central (Rebound planned)",
      focus: {
        en: "Win 85+ games, recapture Target Field home advantage, keep Royce Lewis healthy for 140+ games.",
        th: "ชนะ 85 เกมขึ้นไป ทวงความได้เปรียบในบ้าน Target Field และดูแลความฟิตของ รอยซ์ ลูอิส",
      },
      keyMatchups: [
        { opponent: "Cleveland Guardians", date: "April 2027", venue: "Target Field", note: "Division supremacy test" },
        { opponent: "Kansas City Royals", date: "May 2027", venue: "Kauffman Stadium", note: "Key AL Central road series" },
      ],
      milestones: [
        { date: "March 30, 2027", title: "Opening Day", note: "Target Field banner celebration" },
      ],
    },
    playoffs: {
      status: "upcoming",
      dates: "Oct 5 - Nov 2, 2027",
      championshipTarget: "World Series Champions",
      focus: {
        en: "Secure AL Wild Card berth and snap postseason drought with dominant ace starting pitching.",
        th: "คว้าตั๋วไวลด์การ์ด และอาศัยการขว้างระดับหัวแถวพาทีมลึกสู่เวิลด์ซีรีส์",
      },
      path: {
        en: "Wild Card Series -> ALDS -> ALCS -> World Series.",
        th: "ไวลด์การ์ดซีรีส์ -> ดิวิชันซีรีส์ -> ชิงแชมป์สาย -> เวิลด์ซีรีส์",
      },
      clinchScenario: {
        en: "86 wins projected threshold for AL Wildcard spot.",
        th: "คาดการณ์ 86 ชัยชนะเพื่อตั๋วไวลด์การ์ดสายอเมริกันลีก",
      },
      milestones: [
        { date: "Oct 2027", title: "Postseason Baseball", note: "Target Field playoff atmosphere" },
      ],
    },
    offseason: {
      status: "in_progress",
      dates: "Oct 2026 - Feb 2027",
      focus: {
        en: "Target Field payroll clarity, leverage arbitration, acquire high-leverage late-inning bullpen arms.",
        th: "บริหารงบประมาณ คว้าตัวผู้เล่นตำแหน่งพิตเชอร์ปิดเกม และเสริมความลึกในม้านั่งสำรอง",
      },
      capOrBudget: "Targeting $135M Payroll Floor",
      priorities: [
        { area: "High-Leverage Bullpen", details: "Sign two strikeout-heavy setup relievers" },
        { area: "Corner Outfield Power", details: "Add right-handed power bat with high on-base percentage" },
      ],
      draftOutlook: {
        en: "Top-15 2027 MLB Draft pick; replenish middle infield depth.",
        th: "สิทธิ์ดราฟต์ท็อป 15 ของปี 2027 เติมเต็มตำแหน่งอินฟิลด์",
      },
      milestones: [
        { date: "Dec 2026", title: "MLB Winter Meetings", note: "Trade talks and free agent meetings" },
      ],
    },
  },

  lynx: {
    teamId: "lynx",
    seasonYear: "2026-2027 WNBA Season",
    currentPhase: "offseason",
    phaseLabel: {
      en: "Offseason Strategy • Championship Core Locked",
      th: "ช่วงปิดฤดูกาล • ล็อกขุมกำลังลุ้นแชมป์",
    },
    summary: {
      en: "Fresh off a 33-11 season and WNBA Finals appearance. Napheesa Collier enters 2027 as the reigning DPOY and top MVP frontrunner under coach Cheryl Reeve.",
      th: "หลังผลงาน 33-11 ทะลุชิงแชมป์ WNBA นาฟีซา คอลลิเออร์ เตรียมนำทัพลุ้นแชมป์สมัยที่ 5 ภายใต้การคุมทีมของ เชอริล รีฟ",
    },
    projectedRecord: "34-10 (1st in WNBA)",
    championshipOdds: "+220 (Co-Favorites for Title)",
    championshipTarget: "5th WNBA Championship Trophy",
    championshipProbability: 90,
    preseason: {
      status: "upcoming",
      dates: "April 25 - May 10, 2027",
      focus: {
        en: "Defensive scheme refinement and rookie integration at Mayo Clinic Square.",
        th: "ขัดเกลาแท็กติกเกมรับและเสริมผู้เล่นหน้าใหม่ที่ Mayo Clinic Square",
      },
      milestones: [
        { date: "May 2, 2027", title: "Preseason Scrimmage", note: "Target Center exhibition" },
      ],
    },
    regularSeason: {
      status: "upcoming",
      dates: "May 14 - Sept 18, 2027",
      record: "33-11 (2026 Record)",
      standing: "#1 Seed contender",
      focus: {
        en: "Defend Commissioner's Cup crown, earn home-court advantage throughout entire postseason.",
        th: "ป้องกันแชมป์ Commissioner's Cup และยึดความได้เปรียบในบ้านตลอดเพลย์ออฟ",
      },
      keyMatchups: [
        { opponent: "New York Liberty", date: "June 2027", venue: "Target Center", note: "Finals rematch battle" },
        { opponent: "Las Vegas Aces", date: "July 2027", venue: "Michelob ULTRA Arena", note: "Showdown of MVPs" },
      ],
      milestones: [
        { date: "July 2027", title: "Commissioner's Cup Championship", note: "In-season silverware quest" },
      ],
    },
    playoffs: {
      status: "upcoming",
      dates: "Sept 20 - Oct 20, 2027",
      championshipTarget: "WNBA Champions",
      focus: {
        en: "Hang 5th championship banner from Target Center rafters.",
        th: "คว้าแชมป์สมัยที่ 5 แขวนแบนเนอร์ประวัติศาสตร์ใน Target Center",
      },
      path: {
        en: "Round 1 (2-0) -> WNBA Semifinals (3-1) -> WNBA Finals (3-2 win).",
        th: "รอบแรก -> รอบรองชนะเลิศ -> ชิงแชมป์ WNBA ไฟนอลส์",
      },
      clinchScenario: {
        en: "Magic number 25 wins to lock up top-2 postseason seed.",
        th: "ต้องการ 25 ชัยชนะเพื่อล็อกหัวแถวเพลย์ออฟ",
      },
      milestones: [
        { date: "Oct 2027", title: "WNBA Finals Game 5", note: "Target Center sellout crowd" },
      ],
    },
    offseason: {
      status: "in_progress",
      dates: "Nov 2026 - April 2027",
      focus: {
        en: "Protect core championship assets in expansion draft; secure veteran shooting guard.",
        th: "ปกป้องตัวหลักใน Expansion Draft และเสริมชู้ตติ้งการ์ดมากประสบการณ์",
      },
      capOrBudget: "Operating within hard cap; Designated Core tag applied",
      priorities: [
        { area: "Core Retention", details: "Extend Kayla McBride and Bridget Carleton" },
        { area: "Expansion Draft Strategy", details: "Safeguard starting 5 roster spots" },
      ],
      draftOutlook: {
        en: "1st round draft pick targeting versatile 3-and-D forward.",
        th: "ดราฟต์รอบแรกเล็งผู้เล่นตำแหน่งฟอร์เวิร์ดยิง 3 และเกมรับ",
      },
      milestones: [
        { date: "April 2027", title: "2027 WNBA Draft", note: "Prime draft additions" },
      ],
    },
  },

  frost: {
    teamId: "frost",
    seasonYear: "2026-2027 PWHL Season",
    currentPhase: "preseason",
    phaseLabel: {
      en: "Preseason Camp • 3-Peat Walter Cup Defense",
      th: "แคมป์ปรีซีซัน • ภารกิจป้องกันแชมป์ 3 สมัยซ้อน",
    },
    summary: {
      en: "Back-to-back Walter Cup Champions! Taylor Heise, Kendall Coyne Schofield, and Grace Zumwinkle lead a dynastic squad aiming for an unprecedented three-peat in the PWHL.",
      th: "แชมป์ถ้วย Walter Cup สองสมัยซ้อน เทย์เลอร์ ไฮซี และ เคนดัลล์ คอยน์ นำทัพสร้างตำนานแชมป์ 3 ปีติดต่อกัน",
    },
    projectedRecord: "20-4-0 (1st in PWHL)",
    championshipOdds: "+150 (Title Favorites)",
    championshipTarget: "Walter Cup Three-Peat",
    championshipProbability: 92,
    preseason: {
      status: "in_progress",
      dates: "Nov 1 - Nov 28, 2026",
      record: "Training Camp Active",
      focus: {
        en: "Roster cuts at Xcel Energy Center, power play continuity, rookie acclimation.",
        th: "คัดเลือกขุมกำลังที่ Xcel Energy Center ขัดเกลาเพาเวอร์เพลย์ และปรับตัวผู้เล่นใหม่",
      },
      milestones: [
        { date: "Nov 15", title: "Banner Unveiling Rehearsal", note: "2nd Walter Cup banner ready" },
      ],
      keyPlayers: [
        { name: "Taylor Heise", role: "Center/MVP", highlight: "Playoff MVP, dominant 200-foot center" },
        { name: "Nicole Hensley", role: "Goaltender", highlight: ".945 postseason save percentage" },
      ],
    },
    regularSeason: {
      status: "upcoming",
      dates: "Dec 1, 2026 - May 8, 2027",
      record: "0-0 (Opening Dec 1)",
      standing: "Defending Champions (#1 Seed)",
      focus: {
        en: "Dominate rivalry games vs Boston Fleet and Montreal Victoire.",
        th: "เก็บชัยชนะแมตช์ใหญ่พบ บอสตัน ฟลีท และ มอนทรีออล วิกตัวร์",
      },
      keyMatchups: [
        { opponent: "Boston Fleet", date: "Dec 5, 2026", venue: "Xcel Energy Center", note: "Walter Cup Finals rematch" },
        { opponent: "Toronto Sceptres", date: "Jan 12, 2027", venue: "Coca-Cola Coliseum", note: "Battle for top of table" },
      ],
      milestones: [
        { date: "Dec 1, 2026", title: "Season Opener", note: "Banner celebration game" },
      ],
    },
    playoffs: {
      status: "upcoming",
      dates: "May 12 - June 5, 2027",
      championshipTarget: "Walter Cup",
      focus: {
        en: "Complete the historic 3-peat championship run.",
        th: "คว้าแชมป์ถ้วยวอลเตอร์คัพ 3 สมัยติดต่อกันเป็นประวัติศาสตร์",
      },
      path: {
        en: "PWHL Semifinals (3-0 sweep) -> Walter Cup Finals (3-1 victory).",
        th: "รอบรองชนะเลิศ -> รอบชิงแชมป์ Walter Cup",
      },
      clinchScenario: {
        en: "Top 4 finish in 6-team league guarantees playoff spot.",
        th: "ติดท็อป 4 ของตารางการันตีตั๋วเพลย์ออฟทันที",
      },
      milestones: [
        { date: "June 2027", title: "Walter Cup Celebration", note: "Parade down West 7th Street" },
      ],
    },
    offseason: {
      status: "completed",
      dates: "June - Oct 2026",
      focus: {
        en: "Retained entire top-6 forward corps, re-signed head coaching staff.",
        th: "ต่อสัญญา 6 กองหน้าตัวจริงครบชุด และขยายสัญญาทีมโค้ช",
      },
      capOrBudget: "PWHL Max Contract limits met",
      priorities: [
        { area: "Defense Depth", details: "Added top NCAA blue line talent" },
      ],
      draftOutlook: {
        en: "Added top college goal scorer with #6 overall pick.",
        th: "คว้าดาวยิงระดับมหาวิทยาลัยด้วยสิทธิ์ดราฟต์อันดับ 6",
      },
      milestones: [
        { date: "June 2026", title: "2026 PWHL Draft", note: "Elite collegiate picks secured" },
      ],
    },
  },

  mnufc: {
    teamId: "mnufc",
    seasonYear: "2026-2027 MLS Season",
    currentPhase: "regular",
    phaseLabel: {
      en: "Regular Season • Audi MLS Cup Playoff Push",
      th: "ฤดูกาลปกติ • ลุยศึกเพลย์ออฟ MLS Cup",
    },
    summary: {
      en: "Eric Ramsay's tactical identity taking firm root at Allianz Field. High-pressing transitions, lethal set pieces, and a push for Western Conference postseason placement.",
      th: "ระบบการเล่นของ เอริก แรมซีย์ เริ่มลงตัวที่ อัลลิอันซ์ ฟิลด์ การเพรสซิ่งสูง จังหวะสวนกลับ และลูกตั้งเตะอันตราย พร้อมชิงตั๋วเพลย์ออฟ",
    },
    projectedRecord: "12-11-11 (47 Pts, 7th in West)",
    championshipOdds: "+3300 (MLS Cup Dark Horse)",
    championshipTarget: "MLS Cup & US Open Cup",
    championshipProbability: 48,
    preseason: {
      status: "completed",
      dates: "Jan 15 - Feb 20, 2026",
      record: "3-1-1",
      focus: {
        en: "Coachella Valley Invitational camp, high press conditioning.",
        th: "เข้าแคมป์ที่ Coachella Valley พัฒนาความฟิตการเพรสแดนบน",
      },
      milestones: [
        { date: "Feb 10", title: "Desert Cup", note: "Clean sheet win over LA Galaxy" },
      ],
    },
    regularSeason: {
      status: "in_progress",
      dates: "Feb 28 - Oct 19, 2026",
      record: "7-10-12 (31 Pts)",
      standing: "9th in Western Conference (Playoff line)",
      focus: {
        en: "Win remaining home matches at Allianz Field to lock up Wild Card spot.",
        th: "เก็บชัยชนะเกมในบ้านที่ อัลลิอันซ์ ฟิลด์ เพื่อยึดโควตาไวลด์การ์ด",
      },
      keyMatchups: [
        { opponent: "St. Louis CITY SC", date: "Oct 18, 2026", venue: "Allianz Field", note: "Decision Day clash" },
      ],
      milestones: [
        { date: "Oct 19", title: "Decision Day", note: "Final playoff qualification match" },
      ],
    },
    playoffs: {
      status: "upcoming",
      dates: "Oct 24 - Dec 6, 2026",
      championshipTarget: "MLS Cup",
      focus: {
        en: "Survive Wild Card match and challenge higher seeds with transition counter-attacks.",
        th: "ผ่านรอบไวลด์การ์ด และใช้จังหวะโต้กลับเล่นงานทีมวางอันดับสูง",
      },
      path: {
        en: "Wild Card Match -> Round One Best-of-3 -> Conference Semis -> MLS Cup.",
        th: "รอบไวลด์การ์ด -> รอบแรก Best-of-3 -> รอบรองชนะเลิศสาย -> รอบชิง MLS Cup",
      },
      clinchScenario: {
        en: "Win on Decision Day vs St. Louis guarantees Audi MLS Cup Playoff berth.",
        th: "ชนะนัดสุดท้ายการันตีตั๋วเพลย์ออฟทันที",
      },
      milestones: [
        { date: "Oct 26", title: "Audi MLS Cup Wild Card", note: "Single-elimination knockout" },
      ],
    },
    offseason: {
      status: "upcoming",
      dates: "Dec 10, 2026 - Jan 20, 2027",
      focus: {
        en: "Designated Player creative playmaker signing, young international winger additions.",
        th: "คว้าตัวผู้เล่น Designated Player ตำแหน่งเพลย์เมกเกอร์ และปีกดาวรุ่งต่างชาติ",
      },
      capOrBudget: "Open DP Spot + Max TAM available",
      priorities: [
        { area: "Attacking Midfielder", details: "Acquire creative #10 to unlock low blocks" },
      ],
      draftOutlook: {
        en: "MLS SuperDraft priority on athletic collegiate fullbacks.",
        th: "ดราฟต์ SuperDraft เล็งฟูลแบ็กที่มีความเร็วสูง",
      },
      milestones: [
        { date: "Dec 2026", title: "MLS SuperDraft", note: "Collegiate talent additions" },
      ],
    },
  },

  rbfc: {
    teamId: "rbfc",
    seasonYear: "2026-2027 Thai League 1",
    currentPhase: "regular",
    phaseLabel: {
      en: "Regular Season • Dragon Solar Park Fortress",
      th: "ฤดูกาลปกติ • ป้อมปราการ ดราก้อน โซลาร์ พาร์ค",
    },
    summary: {
      en: "Ratchaburi FC (The Dragons) competing at the top of Thai League 1. Clashing with Port FC this Sunday at Dragon Solar Park with eyes on AFC Champions League 2 qualification and Thai FA Cup glory.",
      th: "ราชบุรี เอฟซี (ราชันมังกร) กำลังทำผลงานเกาะกลุ่มหัวตารางไทยลีก 1 นัดสำคัญพบ การท่าเรือ เอฟซี อาทิตย์นี้ พร้อมเป้าหมายตั๋วเอเอฟซี แชมเปียนส์ลีก 2",
    },
    projectedRecord: "16-8-6 (56 Pts, Top-4 Finish)",
    championshipOdds: "+500 (Thai FA Cup Contender)",
    championshipTarget: "Thai FA Cup & AFC Continental Qualification",
    championshipProbability: 78,
    preseason: {
      status: "completed",
      dates: "July 1 - Aug 10, 2026",
      record: "4-1-0",
      focus: {
        en: "Summer training camp at Dragon Solar Park, foreign striker chemistry, fitness conditioning.",
        th: "แคมป์ฝึกซ้อมช่วงปิดฤดูกาลที่ ดราก้อน โซลาร์ พาร์ค จูนความเข้าขากองหน้าบราซิล",
      },
      milestones: [
        { date: "Aug 5", title: "Preseason Friendly", note: "3-1 win over regional rivals" },
      ],
      keyPlayers: [
        { name: "Clement Depres", role: "Striker", highlight: "Clinical aerial finisher and focal point" },
        { name: "Jakkaphan Kaewprom", role: "Captain/Midfielder", highlight: "Legendary midfield general and vision" },
      ],
    },
    regularSeason: {
      status: "in_progress",
      dates: "Aug 15, 2026 - May 2, 2027",
      record: "4-2-2 (14 Pts, 5th place)",
      standing: "5th in Thai League 1 (3 pts from 2nd)",
      focus: {
        en: "Turn Dragon Solar Park into an impenetrable fortress; challenge Buriram and Bangkok United.",
        th: "รักษาฟอร์มแกร่งในบ้านที่ ดราก้อน โซลาร์ พาร์ค ท้าชิงกลุ่มหัวตารางกับ บุรีรัมย์ และ แบงค็อก",
      },
      keyMatchups: [
        { opponent: "Port FC", date: "Sunday Oct 18, 2026 6:00 PM ICT", venue: "Dragon Solar Park", note: "Huge home derby clash" },
        { opponent: "Buriram United", date: "Nov 22, 2026", venue: "Chang Arena", note: "Away test vs champions" },
      ],
      milestones: [
        { date: "Oct 18", title: "Port FC Match", note: "Sold-out crowd expected at Dragon Solar Park" },
      ],
    },
    playoffs: {
      status: "upcoming",
      dates: "Feb - May 2027",
      championshipTarget: "Thai FA Cup Winners",
      focus: {
        en: "Lift the Thai FA Cup trophy to secure direct entry into the AFC Champions League 2 group stage.",
        th: "คว้าแชมป์ ช้าง เอฟเอ คัพ เพื่อคว้าตั๋วเข้าสู่รอบแบ่งกลุ่ม เอเอฟซี แชมเปียนส์ลีก 2 ทันที",
      },
      path: {
        en: "Thai FA Cup Round of 16 -> Quarterfinals -> Semifinals -> National Stadium Final.",
        th: "ช้าง เอฟเอ คัพ รอบ 16 ทีม -> 8 ทีม -> ตัดเชือก -> นัดชิงชนะเลิศ สนามศุภชลาศัย",
      },
      clinchScenario: {
        en: "Top 3 Thai League finish or FA Cup triumph guarantees AFC continental football.",
        th: "จบอันดับท็อป 3 ไทยลีก หรือ คว้าแชมป์เอฟเอคัพ การันตีตั๋วเอเชีย",
      },
      milestones: [
        { date: "May 2027", title: "Thai FA Cup Final", note: "Championship showdown" },
      ],
    },
    offseason: {
      status: "upcoming",
      dates: "May 15 - July 20, 2027",
      focus: {
        en: "Asian-quota defensive midfielder signing, contract extensions for key Thai national players.",
        th: "เสริมโควตาเอเชียตำแหน่งมิดฟิลด์ตัวรับ และต่อสัญญาแข้งหลักดีกรีทีมชาติ",
      },
      capOrBudget: "Stable budget with corporate backing",
      priorities: [
        { area: "Asian Quota", details: "Sign box-to-box midfielder with continental experience" },
      ],
      draftOutlook: {
        en: "Promote 3 academy stars from Ratchaburi U-23 squad.",
        th: "ดัน 3 ดาวรุ่งจากชุดอะคาเดมี่ U-23 ขึ้นสู่ทีมชุดใหญ่",
      },
      milestones: [
        { date: "June 2027", title: "Thai Transfer Window", note: "Squad reinforcement for continental play" },
      ],
    },
  },
};

// Fallback dynamic season outlook generator for any other favorited team
export function getTeamSeasonOutlook(team: Team): SeasonOutlook {
  if (SEASON_OUTLOOKS[team.id]) {
    return SEASON_OUTLOOKS[team.id];
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
        { date: "Midseason", title: "Key Fixture Stretch", note: "Crucial conference tests" },
      ],
    },
    playoffs: {
      status: "upcoming",
      dates: "Postseason Phase",
      championshipTarget: `${team.league || "League"} Title`,
      focus: {
        en: "Lock down high seed and advance through elimination rounds.",
        th: "คว้าอันดับหัวแถวเพื่อกรุยทางสู่รอบชิงชนะเลิศ",
      },
      path: {
        en: "Regular Season -> Postseason Qualification -> Championship Finals.",
        th: "ฤดูกาลปกติ -> เข้ารอบเพลย์ออฟ -> ชิงชนะเลิศ",
      },
      clinchScenario: {
        en: "Consistent winning form to clinch postseason berth.",
        th: "รักษามาตรฐานชัยชนะเพื่อการันตีพื้นที่เพลย์ออฟ",
      },
      milestones: [
        { date: "Playoffs", title: "Knockout Round", note: "Championship quest" },
      ],
    },
    offseason: {
      status: "upcoming",
      dates: "Summer Offseason Window",
      focus: {
        en: "Roster building, draft selections, and contract management.",
        th: "เสริมทัพผู้เล่น การดราฟต์ และบริหารสัญญา",
      },
      capOrBudget: "Under League Regulations",
      priorities: [
        { area: "Squad Depth", details: "Reinforce key positions for next campaign" },
      ],
      draftOutlook: {
        en: "Target elite young talent in draft and transfer window.",
        th: "มองหานักเตะพรสวรรค์สูงในตลาดซื้อขาย",
      },
      milestones: [
        { date: "Offseason", title: "Free Agency / Transfers", note: "Squad upgrades" },
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
    ["my", lang === "th" ? "ทีมของฉัน" : "My Teams", Star],
    ["seasons", lang === "th" ? "ฤดูกาล" : "Seasons", Calendar],
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

  const [tab, setTab] = useState<AppTab>("live");
  const [games, setGames] = useState<Game[]>(UPCOMING_HUB_FIXTURES);
  const [now, setNow] = useState(new Date());
  const [liveOn, setLiveOn] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedSeasonTeamId, setSelectedSeasonTeamId] = useState<string | null>(null);

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
        <nav className="mx-auto hidden max-w-6xl gap-1 px-4 sm:flex overflow-x-auto">
          {tabs(t, lang).map(([key, label, Icon]) => (
            <button
              key={key}
              onClick={() => setTab(key as AppTab)}
              className={`flex items-center gap-2 border-b-2 px-3.5 py-2.5 text-sm font-semibold transition whitespace-nowrap ${
                tab === key
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{label}</span>
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
            onOpenSeasons={(teamId) => {
              setSelectedSeasonTeamId(teamId);
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
            selectedTeamId={selectedSeasonTeamId}
            onSelectTeam={setSelectedSeasonTeamId}
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
        <div className="grid grid-cols-7 text-center text-[9px] px-1 py-1">
          {tabs(t, lang).map(([key, label, Icon]) => (
            <button
              key={key}
              onClick={() => setTab(key as AppTab)}
              className={`relative flex flex-col items-center gap-1 py-1.5 ${
                tab === key ? "font-bold text-primary" : "text-muted-foreground"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="truncate max-w-[48px]">{label}</span>
              {key === "pulse" && (
                <span className="absolute top-1 right-2 h-1.5 w-1.5 rounded-full bg-live" />
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
  pred?: { h: number; a: number } | undefined;
  onPredict: (h: number, a: number) => void;
}) {
  const t = T[lang];
  const h = teamById(g.home);
  const a = teamById(g.away);
  const [ph, setPh] = useState(pred ? String(pred.h) : "");
  const [pa, setPa] = useState(pred ? String(pred.a) : "");
  const isMN = h.hub === "minnesota" || a.hub === "minnesota";
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
              ⏱ {t.next}
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
                  `${lang === "th" ? "บันทึกการทายผลแล้ว" : "Prediction saved"}: ${a.seal} ${pa} - ${ph} ${h.seal}`
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
  lang,
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
// MY TEAMS TAB WITH CONCISE SEASON OUTLOOKS
// =========================================================================
function MyTab({
  favs,
  toggleFav,
  addAllMN,
  games,
  lang,
  preds,
  setPreds,
  onOpenSeasons,
}: {
  favs: string[];
  toggleFav: (id: string) => void;
  addAllMN: () => void;
  games: Game[];
  lang: Lang;
  preds: Record<string, { h: number; a: number }>;
  setPreds: (p: Record<string, { h: number; a: number }>) => void;
  onOpenSeasons: (teamId: string) => void;
}) {
  const t = T[lang];
  const myTeams = TEAMS.filter((tm) => favs.includes(tm.id));
  const myGames = games.filter((g) => favs.includes(g.home) || favs.includes(g.away));

  return (
    <div className="space-y-8">
      {/* Header and Quick Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl tracking-wide">
            {lang === "th" ? "ทีมโปรดของฉัน" : t.my}
          </h2>
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

      {/* Favorited Team Cards */}
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

      {/* Concise Season Outlook Snapshots */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            <h3 className="font-display text-xl tracking-wide">
              {lang === "th" ? "ภาพรวมฤดูกาลทีมโปรด" : "SEASON OUTLOOK SNAPSHOTS"}
            </h3>
          </div>
          <span className="text-xs font-semibold text-muted-foreground">
            Preseason → Championships → Offseason
          </span>
        </div>

        {myTeams.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            {t.empty}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {myTeams.map((team) => {
              const outlook = getTeamSeasonOutlook(team);
              return (
                <div
                  key={team.id}
                  className="rounded-2xl border border-border bg-card p-4 space-y-3 shadow-xs hover:border-primary/50 transition flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <Seal t={team} size={36} />
                        <div>
                          <div className="font-bold text-sm leading-tight">
                            {lang === "th" && team.th ? team.th : team.name}
                          </div>
                          <div className="text-[11px] text-muted-foreground">
                            {team.sport} • {outlook.seasonYear}
                          </div>
                        </div>
                      </div>
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary uppercase whitespace-nowrap">
                        {outlook.currentPhase.replace("_", " ")}
                      </span>
                    </div>

                    <div className="rounded-xl bg-muted/40 p-2.5 text-xs space-y-1">
                      <div className="font-semibold text-primary">
                        {lang === "th" ? outlook.phaseLabel.th : outlook.phaseLabel.en}
                      </div>
                      <p className="text-muted-foreground text-[11px] line-clamp-2">
                        {lang === "th" ? outlook.summary.th : outlook.summary.en}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div className="rounded-lg bg-background/60 border border-border/50 p-2">
                        <div className="text-muted-foreground text-[10px]">Projected Finish</div>
                        <div className="font-semibold text-foreground">{outlook.projectedRecord}</div>
                      </div>
                      <div className="rounded-lg bg-background/60 border border-border/50 p-2">
                        <div className="text-muted-foreground text-[10px]">Championship Odds</div>
                        <div className="font-semibold text-primary">{outlook.championshipOdds}</div>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => onOpenSeasons(team.id)}
                    className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-primary/10 hover:bg-primary/20 py-2 text-xs font-bold text-primary transition"
                  >
                    <span>{lang === "th" ? "ดูภาพรวมฤดูกาลแบบเต็ม" : "View Full Season Outlook"}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Upcoming Games for Favorites */}
      <section className="space-y-3">
        <h3 className="font-display text-xl tracking-wide">
          {lang === "th" ? "เกมถัดไปของทีมโปรด" : "UPCOMING MATCHES"}
        </h3>
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

// =========================================================================
// SEASONS TAB (Preseason -> Championships -> Offseason)
// =========================================================================
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

  // Sync activePhase when switching teams
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
              className="rounded-xl bg-primary/20 px-3 py-1.5 text-xs font-bold text-primary hover:bg-primary/30 transition"
            >
              + Add All Minnesota Franchises
            </button>
          )}
        </div>
      </section>

      {/* Team Selector Pills */}
      <div className="flex gap-2 overflow-x-auto pb-2 text-xs">
        {favoriteTeams.map((tm) => {
          const isSelected = tm.id === activeTeamId;
          return (
            <button
              key={tm.id}
              onClick={() => onSelectTeam(tm.id)}
              className={`flex items-center gap-2 rounded-full px-3.5 py-1.5 font-bold whitespace-nowrap transition ${
                isSelected
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-card border border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              <Seal t={tm} size={22} />
              <span>{lang === "th" && tm.th ? tm.th : tm.name}</span>
            </button>
          );
        })}
      </div>

      {/* Active Team Headline Card */}
      <div className="rounded-3xl border border-border bg-card p-6 space-y-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/60 pb-4">
          <div className="flex items-center gap-4">
            <Seal t={currentTeam} size={56} />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display text-2xl font-bold sm:text-3xl">
                  {lang === "th" && currentTeam.th ? currentTeam.th : currentTeam.name}
                </h3>
                <span className="rounded-full bg-primary/15 px-2.5 py-0.5 text-xs font-bold text-primary">
                  {outlook.seasonYear}
                </span>
              </div>
              <div className="text-xs text-muted-foreground">
                {currentTeam.sport} • {currentTeam.league} • {outlook.projectedRecord}
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-1">
            <span className="text-xs text-muted-foreground">Championship Probability</span>
            <div className="flex items-center gap-2">
              <div className="w-32 h-2.5 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-700"
                  style={{ width: `${outlook.championshipProbability}%` }}
                />
              </div>
              <span className="font-mono text-sm font-bold text-primary">
                {outlook.championshipProbability}%
              </span>
            </div>
            <span className="text-[11px] font-semibold text-muted-foreground">
              Target: {outlook.championshipTarget}
            </span>
          </div>
        </div>

        {/* Phase Switcher Navigation */}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 pt-1">
          {(
            [
              ["preseason", "1. Preseason & Camp", outlook.preseason.status],
              ["regular", "2. Regular Season", outlook.regularSeason.status],
              ["playoffs", "3. Playoffs & Trophy", outlook.playoffs.status],
              ["offseason", "4. Offseason & Draft", outlook.offseason.status],
            ] as const
          ).map(([phaseKey, label, status]) => {
            const isActive = activePhase === phaseKey;
            return (
              <button
                key={phaseKey}
                onClick={() => setActivePhase(phaseKey)}
                className={`flex flex-col items-start gap-1 rounded-2xl border p-3 text-left transition ${
                  isActive
                    ? "border-primary bg-primary/10 shadow-xs"
                    : "border-border/60 bg-muted/20 hover:border-primary/40"
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className={`text-xs font-bold ${isActive ? "text-primary" : "text-foreground"}`}>
                    {label}
                  </span>
                  <span
                    className={`rounded-full px-1.5 py-0.2 text-[9px] font-bold uppercase ${
                      status === "in_progress"
                        ? "bg-live/20 text-live animate-pulse"
                        : status === "completed"
                        ? "bg-primary/20 text-primary"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {status.replace("_", " ")}
                  </span>
                </div>
                <div className="text-[11px] text-muted-foreground">
                  {phaseKey === "preseason" && outlook.preseason.dates}
                  {phaseKey === "regular" && outlook.regularSeason.dates}
                  {phaseKey === "playoffs" && outlook.playoffs.dates}
                  {phaseKey === "offseason" && outlook.offseason.dates}
                </div>
              </button>
            );
          })}
        </div>

        {/* Phase Detailed Content Box */}
        <div className="rounded-2xl border border-border/80 bg-background/50 p-5 space-y-5">
          {/* PRESEASON DETAILS */}
          {activePhase === "preseason" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-border/50 pb-3">
                <div>
                  <h4 className="font-display text-xl tracking-wide flex items-center gap-2 text-primary">
                    <CheckCircle2 className="h-5 w-5" />
                    Preseason Foundation & Training Camp
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    {lang === "th" ? outlook.preseason.focus.th : outlook.preseason.focus.en}
                  </p>
                </div>
                {outlook.preseason.record && (
                  <span className="font-mono text-xs font-bold rounded-lg bg-card px-2.5 py-1 border border-border">
                    Form: {outlook.preseason.record}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Key Milestones & Roster Battles
                  </span>
                  <div className="space-y-2">
                    {outlook.preseason.milestones.map((m, idx) => (
                      <div
                        key={idx}
                        className="rounded-xl border border-border/60 bg-card p-3 text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-foreground">{m.title}</span>
                          <span className="text-muted-foreground font-mono text-[10px]">{m.date}</span>
                        </div>
                        <p className="text-muted-foreground text-[11px]">{m.note}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {outlook.preseason.keyPlayers && (
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      Camp Standouts
                    </span>
                    <div className="space-y-2">
                      {outlook.preseason.keyPlayers.map((kp, idx) => (
                        <div
                          key={idx}
                          className="rounded-xl border border-border/60 bg-card p-3 text-xs flex items-center justify-between"
                        >
                          <div>
                            <div className="font-bold text-foreground">{kp.name}</div>
                            <div className="text-[10px] text-muted-foreground">{kp.highlight}</div>
                          </div>
                          <span className="rounded bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                            {kp.role}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* REGULAR SEASON DETAILS */}
          {activePhase === "regular" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-border/50 pb-3">
                <div>
                  <h4 className="font-display text-xl tracking-wide flex items-center gap-2 text-primary">
                    <TrendingUp className="h-5 w-5" />
                    Regular Season Grind & Standings
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    {lang === "th" ? outlook.regularSeason.focus.th : outlook.regularSeason.focus.en}
                  </p>
                </div>
                <span className="font-mono text-xs font-bold rounded-lg bg-primary/20 text-primary px-2.5 py-1">
                  {outlook.regularSeason.record}
                </span>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Crucial Upcoming Matchups
                  </span>
                  <div className="space-y-2">
                    {outlook.regularSeason.keyMatchups.map((km, idx) => (
                      <div
                        key={idx}
                        className="rounded-xl border border-border/60 bg-card p-3 text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-foreground">vs {km.opponent}</span>
                          <span className="text-primary font-mono text-[11px]">{km.date}</span>
                        </div>
                        <div className="text-[11px] text-muted-foreground">{km.venue}</div>
                        <div className="text-[10px] text-muted-foreground italic">{km.note}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Standing & Projection
                  </span>
                  <div className="rounded-xl border border-border/60 bg-card p-4 text-xs space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Current Standing:</span>
                      <span className="font-bold text-foreground">{outlook.regularSeason.standing}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Projected Regular Finish:</span>
                      <span className="font-bold text-primary font-mono">{outlook.projectedRecord}</span>
                    </div>
                    <div className="rounded-lg bg-muted/40 p-2.5 text-[11px] text-muted-foreground">
                      {lang === "th" ? outlook.summary.th : outlook.summary.en}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* PLAYOFFS & CHAMPIONSHIP DETAILS */}
          {activePhase === "playoffs" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-border/50 pb-3">
                <div>
                  <h4 className="font-display text-xl tracking-wide flex items-center gap-2 text-primary">
                    <Trophy className="h-5 w-5" />
                    Playoffs & Championship Hunt
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Target: {outlook.playoffs.championshipTarget}
                  </p>
                </div>
                <span className="font-mono text-xs font-bold rounded-lg bg-card px-2.5 py-1 border border-border text-primary">
                  Odds: {outlook.championshipOdds}
                </span>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Postseason Road & Bracket Path
                  </span>
                  <div className="rounded-xl border border-border/60 bg-card p-4 text-xs space-y-2">
                    <div className="font-semibold text-foreground">Playoff Path:</div>
                    <p className="text-muted-foreground text-[11px] leading-relaxed">
                      {lang === "th" ? outlook.playoffs.path.th : outlook.playoffs.path.en}
                    </p>
                    <div className="font-semibold text-primary pt-1">Clinching Scenario:</div>
                    <p className="text-muted-foreground text-[11px]">
                      {lang === "th" ? outlook.playoffs.clinchScenario.th : outlook.playoffs.clinchScenario.en}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Championship Target Metrics
                  </span>
                  <div className="rounded-xl border border-border/60 bg-card p-4 text-xs space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Championship Window:</span>
                      <span className="font-bold text-live">Active / Peak</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Trophy Target:</span>
                      <span className="font-bold text-primary">{outlook.championshipTarget}</span>
                    </div>
                    <div className="space-y-1 pt-1">
                      <div className="flex justify-between text-[11px]">
                        <span>Title Probability</span>
                        <span className="font-bold text-primary">{outlook.championshipProbability}%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full bg-primary"
                          style={{ width: `${outlook.championshipProbability}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* OFFSEASON & DRAFT DETAILS */}
          {activePhase === "offseason" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-border/50 pb-3">
                <div>
                  <h4 className="font-display text-xl tracking-wide flex items-center gap-2 text-primary">
                    <Clock className="h-5 w-5" />
                    Offseason Strategy, Free Agency & Draft
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    {lang === "th" ? outlook.offseason.focus.th : outlook.offseason.focus.en}
                  </p>
                </div>
                <span className="font-mono text-xs font-bold rounded-lg bg-card px-2.5 py-1 border border-border">
                  {outlook.offseason.capOrBudget}
                </span>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Roster Overhaul Priorities
                  </span>
                  <div className="space-y-2">
                    {outlook.offseason.priorities.map((p, idx) => (
                      <div
                        key={idx}
                        className="rounded-xl border border-border/60 bg-card p-3 text-xs space-y-1"
                      >
                        <div className="font-bold text-foreground">{p.area}</div>
                        <p className="text-muted-foreground text-[11px]">{p.details}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Draft Capital & Academy Outlook
                  </span>
                  <div className="rounded-xl border border-border/60 bg-card p-4 text-xs space-y-3">
                    <p className="text-muted-foreground text-[11px] leading-relaxed">
                      {lang === "th" ? outlook.offseason.draftOutlook.th : outlook.offseason.draftOutlook.en}
                    </p>
                    <div className="rounded-lg bg-muted/40 p-2.5 text-[10px] text-muted-foreground space-y-1">
                      <div className="font-semibold text-foreground">Timeline:</div>
                      <div>• Winter Free Agency & Contract Windows</div>
                      <div>• Rookie Combine & Scouting Combine</div>
                      <div>• Annual Entry Draft & Summer Training Camp</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
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
  const [activeLeague, setActiveLeague] = useState<string>(LEAGUES[0] ?? "NFL");

  const leagueGames = games.filter(
    (g) => g.league.toLowerCase() === (activeLeague || "").toLowerCase()
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
