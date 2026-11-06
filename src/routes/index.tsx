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
    topPriorities: Array<{ en: string; th: string }>;
  };
}

export const SEASON_OUTLOOKS: Record<string, SeasonOutlook> = {
  vik: {
    teamId: "vik",
    seasonYear: "2026-27",
    currentPhase: "regular",
    phaseLabel: { en: "Week 7 • Regular Season", th: "สัปดาห์ที่ 7 • ฤดูกาลปกติ" },
    summary: {
      en: "Brian Flores' top-ranked blitz-heavy defense sets the pace alongside Justin Jefferson's historic receiving pace as Minnesota targets the NFC North crown.",
      th: "เกมรับสายบลิตซ์สุดดุดันของ Brian Flores นำทัพร่วมกับ Justin Jefferson ที่กำลังสร้างสถิติประวัติศาสตร์เพื่อลุ้นแชมป์ NFC North",
    },
    projectedRecord: "12-5 • NFC North Champions",
    championshipOdds: "+1400 (Top 5 NFC Contender)",
    championshipTarget: "Super Bowl LXI Champions",
    championshipProbability: 78,
    preseason: {
      status: "completed",
      dates: "Aug 8 - Aug 28, 2026",
      record: "3-0 (Undefeated)",
      focus: {
        en: "Installed redzone disguise packages and established interior defensive line rotation.",
        th: "ติดตั้งระบบป้องกันเรดโซนและหมุนเวียนผู้เล่นแนวรับด้านใน",
      },
      milestones: [
        { date: "Aug 10", title: "Roster Trim", note: "Finalized 53-man depth chart" },
        { date: "Aug 24", title: "Redzone Drill", note: "Flores defense allowed 0 preseason TDs" },
      ],
      keyPlayers: [
        { name: "Justin Jefferson", role: "WR1", highlight: "100% route win rate in redzone" },
        { name: "Andrew Van Ginkel", role: "EDGE", highlight: "Dominant blindside pressure" },
      ],
    },
    regularSeason: {
      status: "in_progress",
      dates: "Sept 10, 2026 - Jan 10, 2027",
      standing: "5-1 • 1st in NFC North",
      focus: {
        en: "Dominating divisional road battles and maximizing turnover differential.",
        th: "เน้นคว้าชัยชนะเกมนอกบ้านในดิวิชั่นและสร้างความได้เปรียบจากเทิร์นโอเวอร์",
      },
      keyMatchups: [
        { opponent: "Green Bay Packers", date: "Nov 22, 2026", venue: "U.S. Bank Stadium", note: "Rivalry clash for division tiebreaker" },
        { opponent: "Detroit Lions", date: "Dec 13, 2026", venue: "Ford Field", note: "Battle for NFC playoff seeding" },
        { opponent: "Chicago Bears", date: "Jan 3, 2027", venue: "Soldier Field", note: "Regular season division finale" },
      ],
      milestones: [
        { date: "Week 4", title: "Dublin Victory", note: "Won international matchup at Croke Park" },
        { date: "Week 12", title: "Thanksgiving Slate", note: "Primetime national spotlight" },
      ],
    },
    playoffs: {
      status: "upcoming",
      dates: "Jan 16 - Feb 14, 2027",
      championshipTarget: "Super Bowl LXI Champions",
      focus: {
        en: "Secure home-field advantage at U.S. Bank Stadium and advance to the Super Bowl.",
        th: "คว้าสิทธิ์เล่นในบ้านรอบเพลย์ออฟและเดินหน้าสู่ซูเปอร์โบวล์",
      },
      path: {
        en: "NFC Divisional Round host -> NFC Championship Game -> Super Bowl LXI in Los Angeles.",
        th: "เป็นเจ้าภาพรอบดิวิชันนอล -> ชิงแชมป์สาย NFC -> เข้าสู่ซูเปอร์โบวล์ LXI ที่ลอสแอนเจลิส",
      },
      clinchScenario: {
        en: "Win 4 of final 6 games to secure division; win 5 to clinch #1 conference seed.",
        th: "ชนะ 4 จาก 6 เกมสุดท้ายเพื่อการันตีแชมป์กลุ่ม หรือชนะ 5 เกมเพื่อคว้ามือ 1 ของสาย",
      },
      milestones: [
        { date: "Jan 16", title: "Wild Card Weekend", note: "Potential first-round bye" },
        { date: "Jan 31", title: "NFC Championship", note: "Targeting conference title" },
        { date: "Feb 14", title: "Super Bowl LXI", note: "Championship coronation" },
      ],
    },
    offseason: {
      status: "upcoming",
      dates: "Feb 15 - July 2027",
      capOrBudget: "$28.4M Projected Cap Space",
      focus: {
        en: "Lock down long-term contracts for core defensive secondary and secure draft capital.",
        th: "ต่อสัญญาระยะยาวกลุ่มผู้เล่นกองหลังตัวหลักและบริหารสิทธิ์ดราฟต์",
      },
      topPriorities: [
        { en: "Extend starting safety & cornerback core", th: "ต่อสัญญาเซฟตีและคอร์เนอร์แบ็กตัวหลัก" },
        { en: "Target interior offensive line in 2027 NFL Draft", th: "ดราฟต์แนวป้องกันฝั่งในในศึก NFL Draft 2027" },
        { en: "Maintain defensive continuity under Brian Flores", th: "รักษาโครงสร้างแผนเกมรับของ Brian Flores" },
      ],
      milestones: [
        { date: "March 2027", title: "NFL Free Agency", note: "Veteran pass-rusher additions" },
        { date: "April 2027", title: "NFL Draft", note: "Consolidate defensive depth" },
      ],
    },
  },
  wolves: {
    teamId: "wolves",
    seasonYear: "2026-27",
    currentPhase: "regular",
    phaseLabel: { en: "Opening Month • NBA Regular Season", th: "เดือนแรก • ฤดูกาลปกติ NBA" },
    summary: {
      en: "Anthony Edwards enters MVP contention alongside Rudy Gobert's rim deterrence and Julius Randle's interior scoring as Minnesota pursues the Western Conference title.",
      th: "Anthony Edwards ก้าวสู่การลุ้น MVP เต็มตัว ร่วมกับเกมรับใต้แป้นของ Rudy Gobert และพลังบุกของ Julius Randle สู่เป้าหมายแชมป์สายตะวันตก",
    },
    projectedRecord: "56-26 • 2nd Seed Western Conference",
    championshipOdds: "+850 (Western Conference Favorites)",
    championshipTarget: "Larry O'Brien Championship Trophy",
    championshipProbability: 82,
    preseason: {
      status: "completed",
      dates: "Oct 4 - Oct 18, 2026",
      record: "4-1",
      focus: {
        en: "Integrated Julius Randle into high-low offensive sets and sharpened clutch floor spacing.",
        th: "ปรับระบบบุกร่วมกับ Julius Randle และเพิ่มประสิทธิภาพการยิงพื้นที่ว่างในจังหวะชี้ขาด",
      },
      milestones: [
        { date: "Oct 10", title: "Target Center Debut", note: "Full starting unit logged 26+ minutes" },
        { date: "Oct 16", title: "Defensive Rating #1", note: "Held preseason opponents to 98.4 PPG" },
      ],
      keyPlayers: [
        { name: "Anthony Edwards", role: "SG/Guard", highlight: "Averaged 28.5 PPG in preseason action" },
        { name: "Rudy Gobert", role: "Center", highlight: "Defensive anchor with 3.2 BPG" },
      ],
    },
    regularSeason: {
      status: "in_progress",
      dates: "Oct 22, 2026 - April 14, 2027",
      standing: "5-2 • 2nd in Western Conference",
      focus: {
        en: "Stacking home victories at Target Center and earning the #1 or #2 Western seed.",
        th: "เก็บชัยชนะในบ้าน Target Center และคว้าอันดับท็อป 2 ของสายตะวันตก",
      },
      keyMatchups: [
        { opponent: "Denver Nuggets", date: "Nov 18, 2026", venue: "Target Center", note: "Jokic vs Gobert playoff rematch" },
        { opponent: "Dallas Mavericks", date: "Dec 25, 2026", venue: "Target Center", note: "Christmas Day Western showcase" },
        { opponent: "Oklahoma City Thunder", date: "Jan 14, 2027", venue: "Paycom Center", note: "Clash for Northwest Division lead" },
      ],
      milestones: [
        { date: "Dec 2026", title: "NBA Cup Quarterfinals", note: "Knockout tournament run" },
        { date: "Feb 2027", title: "NBA All-Star Weekend", note: "Multiple Timberwolves selections" },
      ],
    },
    playoffs: {
      status: "upcoming",
      dates: "April 18 - June 20, 2027",
      championshipTarget: "Larry O'Brien Trophy",
      focus: {
        en: "Advance past the Western Conference Finals and secure Minnesota's first NBA title.",
        th: "ก้าวผ่านรอบชิงแชมป์สายตะวันตกและคว้าแชมป์ NBA ประวัติศาสตร์ให้รัฐมินนิโซตา",
      },
      path: {
        en: "Western First Round -> Western Semifinals -> Conference Finals -> NBA Finals.",
        th: "รอบแรกสายตะวันตก -> รอบรองชนะเลิศสาย -> ชิงแชมป์สาย -> รอบชิงชนะเลิศ NBA Finals",
      },
      clinchScenario: {
        en: "Reach 50 wins to guarantee home court in First Round; 54 wins for Top 2 seed.",
        th: "เก็บ 50 ชัยชนะการันตีความได้เปรียบเล่นในบ้านรอบแรก และ 54 ชัยชนะสำหรับท็อป 2",
      },
      milestones: [
        { date: "May 2027", title: "Western Finals", note: "Targeting Western Conference crown" },
        { date: "June 2027", title: "NBA Finals", note: "Battle for Larry O'Brien Trophy" },
      ],
    },
    offseason: {
      status: "upcoming",
      dates: "June 25 - Oct 2027",
      capOrBudget: "Second Apron Luxury Tax Roster",
      focus: {
        en: "Maintain championship roster continuity and sign key 3-and-D bench contributors.",
        th: "รักษาแกนหลักของทีมและเสริมผู้เล่นสำรองสไตล์ 3-and-D ที่แม่นยำ",
      },
      topPriorities: [
        { en: "Sign veteran shooters via mid-level exceptions", th: "เซ็นสัญญามือปืนประสบการณ์ด้วยข้อยกเว้นกลาง" },
        { en: "Retain key defensive reserves", th: "ต่อสัญญาตัวสำรองเกมรับคนสำคัญ" },
      ],
      milestones: [
        { date: "June 2027", title: "NBA Draft", note: "Draft development talent" },
        { date: "July 2027", title: "Free Agency", note: "Round out championship depth" },
      ],
    },
  },
  wild: {
    teamId: "wild",
    seasonYear: "2026-27",
    currentPhase: "regular",
    phaseLabel: { en: "Regular Season • Central Division", th: "ฤดูกาลปกติ • ดิวิชั่นเซ็นทรัล" },
    summary: {
      en: "Kirill Kaprizov and Matt Boldy power Minnesota's attack as the Wild leverage their physical home fortress at Xcel Energy Center to mount a Stanley Cup run.",
      th: "Kirill Kaprizov และ Matt Boldy นำแนวรุกสุดอันตรายของมินนิโซตา โดยอาศัยความแข็งแกร่งในบ้าน Xcel Energy Center เพื่อลุยศึกสแตนลีย์คัพ",
    },
    projectedRecord: "48-24-10 • 106 Points (Top 3 Central)",
    championshipOdds: "+1800 (Stanley Cup Contender)",
    championshipTarget: "Lord Stanley Cup Trophy",
    championshipProbability: 71,
    preseason: {
      status: "completed",
      dates: "Sept 20 - Oct 5, 2026",
      record: "5-1-0",
      focus: {
        en: "Fine-tuned 1-3-1 power play formation and cemented defensive pairings.",
        th: "ปรับระบบเพาเวอร์เพลย์ 1-3-1 และจับคู่แนวรับตัวจริง",
      },
      milestones: [
        { date: "Sept 25", title: "Preseason Rivalry", note: "4-1 road win over Chicago Blackhawks" },
      ],
      keyPlayers: [
        { name: "Kirill Kaprizov", role: "LW1", highlight: "8 points in 4 preseason games" },
        { name: "Matt Boldy", role: "RW1", highlight: "Unstoppable net-front presence" },
      ],
    },
    regularSeason: {
      status: "in_progress",
      dates: "Oct 8, 2026 - April 15, 2027",
      standing: "6-2-2 • 2nd in Central Division",
      focus: {
        en: "Locking down high-danger chances and maintaining top-5 penalty kill percentage.",
        th: "จำกัดโอกาสยิงอันตรายของคู่แข่งและรักษาเปอร์เซ็นต์เกมรับช่วงโทษติดท็อป 5",
      },
      keyMatchups: [
        { opponent: "Dallas Stars", date: "Nov 28, 2026", venue: "American Airlines Center", note: "Crucial division tiebreaker" },
        { opponent: "Colorado Avalanche", date: "Dec 18, 2026", venue: "Xcel Energy Center", note: "High-octane Central rivalry" },
        { opponent: "Edmonton Oilers", date: "Jan 22, 2027", venue: "Xcel Energy Center", note: "Kaprizov vs McDavid marquee battle" },
      ],
      milestones: [
        { date: "Jan 2027", title: "Midseason Standings", note: "Securing playoff cushion" },
      ],
    },
    playoffs: {
      status: "upcoming",
      dates: "April 18 - June 16, 2027",
      championshipTarget: "Lord Stanley Cup",
      focus: {
        en: "Break through to Western Conference Finals and bring the Stanley Cup to Minnesota.",
        th: "ฝ่าด่านสู่รอบชิงแชมป์สายตะวันตกและนำถ้วยสแตนลีย์คัพมาสู่แดนฮอกกี้มินนิโซตา",
      },
      path: {
        en: "Central First Round -> Central Division Finals -> Western Finals -> Stanley Cup Finals.",
        th: "รอบแรกเซ็นทรัล -> รอบชิงแชมป์ดิวิชั่น -> ชิงแชมป์สายตะวันตก -> สแตนลีย์คัพ ไฟนอลส์",
      },
      clinchScenario: {
        en: "Reach 98 points to clinch Stanley Cup Playoff berth.",
        th: "เก็บแต้มรวม 98 แต้มเพื่อการันตีตั๋วเพลย์ออฟอย่างเป็นทางการ",
      },
      milestones: [
        { date: "May 2027", title: "Second Round", note: "Central Division Championship" },
        { date: "June 2027", title: "Stanley Cup Finals", note: "Lord Stanley coronation" },
      ],
    },
    offseason: {
      status: "upcoming",
      dates: "June 20 - Sept 2027",
      capOrBudget: "$14.6M Clean Cap Flexibility",
      focus: {
        en: "Dead cap penalties expire; capitalize on full cap freedom to add marquee forwards.",
        th: "ภาระเดดแคปหมดลง ใช้เพดานเงินเดือนเต็มพิกัดเพื่อดึงกองหน้าระดับซูเปอร์สตาร์",
      },
      topPriorities: [
        { en: "Sign premium scoring center in free agency", th: "เซ็นสัญญาเซ็นเตอร์ตัวจบสกอร์ระดับท็อป" },
        { en: "Lock up young blue-line talent long-term", th: "ขยายสัญญากองหลังดาวรุ่งระยะยาว" },
      ],
      milestones: [
        { date: "July 1, 2027", title: "Free Agency Frenzy", note: "Major cap space deployment" },
      ],
    },
  },
  twins: {
    teamId: "twins",
    seasonYear: "2027",
    currentPhase: "offseason",
    phaseLabel: { en: "Hot Stove • AL Central Contenders", th: "ช่วงพักฤดูกาล • ตัวเต็ง AL Central" },
    summary: {
      en: "After clinching an AL postseason berth, Minnesota retools pitching depth and power bats to dominate the American League Central.",
      th: "หลังผ่านเข้าสู่โพสต์ซีซัน AL มินนิโซตาเสริมแกร่งขุมกำลังพิตเชอร์และไม้ตีทรงพลังเพื่อเป้าหมายแชมป์ AL Central",
    },
    projectedRecord: "89-73 • AL Central Division Leaders",
    championshipOdds: "+2400 (AL Contender)",
    championshipTarget: "World Series Commissioner's Trophy",
    championshipProbability: 64,
    preseason: {
      status: "upcoming",
      dates: "Feb 14 - March 26, 2027",
      focus: {
        en: "Spring Training in Fort Myers, Florida: establish 5-man rotation and batting order.",
        th: "สปริงเทรนนิ่งที่ฟอร์ตไมเออร์ส ฟลอริดา: จัดระเบียบ 5 มือขว้างตัวจริงและไลน์อัปการตี",
      },
      milestones: [
        { date: "Feb 14", title: "Pitchers & Catchers Report", note: "Lee County Sports Complex" },
        { date: "Feb 28", title: "Grapefruit League Opener", note: "Spring action begins" },
      ],
      keyPlayers: [
        { name: "Royce Lewis", role: "3B", highlight: "Postseason grand slam specialist" },
        { name: "Pablo Lopez", role: "Ace SP", highlight: "Frontline rotation leader" },
      ],
    },
    regularSeason: {
      status: "upcoming",
      dates: "March 27 - Sept 28, 2027",
      standing: "Targeting AL Central Title",
      focus: {
        en: "Dominating divisional series against Cleveland and Detroit; protecting home field at Target Field.",
        th: "เก็บชัยชนะในซีรีส์ร่วมดิวิชั่นกับคลีฟแลนด์และดีทรอยต์ และรักษาชัยชนะในบ้าน Target Field",
      },
      keyMatchups: [
        { opponent: "Cleveland Guardians", date: "April 16, 2027", venue: "Target Field", note: "Division rivalry series" },
        { opponent: "New York Yankees", date: "May 21, 2027", venue: "Yankee Stadium", note: "National AL benchmark test" },
      ],
      milestones: [
        { date: "July 2027", title: "MLB All-Star Break", note: "Midsummer Classic" },
        { date: "July 31, 2027", title: "Trade Deadline", note: "Targeting bullpen arms" },
      ],
    },
    playoffs: {
      status: "upcoming",
      dates: "Oct 1 - Oct 30, 2027",
      championshipTarget: "World Series Trophy",
      focus: {
        en: "Win American League Pennant and hoist the Commissioner's Trophy.",
        th: "คว้าแชมป์อเมริกันลีกและชูถ้วยเวิลด์ซีรีส์",
      },
      path: {
        en: "AL Wild Card/Division Series -> ALCS -> World Series.",
        th: "รอบไวลด์การ์ด/ดิวิชันนอล -> ALCS -> เวิลด์ซีรีส์",
      },
      clinchScenario: {
        en: "Reach 88 wins to clinch AL Central title or Wild Card spot.",
        th: "เก็บ 88 ชัยชนะเพื่อการันตีแชมป์กลุ่มหรือตั๋วไวลด์การ์ด",
      },
      milestones: [
        { date: "Oct 2027", title: "ALCS", note: "American League Pennant" },
        { date: "Late Oct 2027", title: "World Series", note: "Championship coronation" },
      ],
    },
    offseason: {
      status: "in_progress",
      dates: "Nov 1, 2026 - Feb 10, 2027",
      capOrBudget: "Targeting $135M Payroll Floor",
      focus: {
        en: "Acquiring swing-and-miss bullpen arms and a reliable middle-of-the-order right-handed bat.",
        th: "ดึงพิตเชอร์ตัวปิดเกมประเภทสไตรก์เอาต์และผู้เล่นตีขวาพลังสูงกลางไลน์อัป",
      },
      topPriorities: [
        { en: "Sign high-leverage late-inning reliever", th: "เซ็นสัญญาตัวขว้างปิดเกมช่วงอินนิ่งท้าย" },
        { en: "Acquire starting pitcher with rotation depth", th: "เสริมมือขว้างตัวจริงเสริมแกร่งโรเตชัน" },
      ],
      milestones: [
        { date: "Dec 2026", title: "MLB Winter Meetings", note: "Trade & free agent negotiations" },
      ],
    },
  },
  lynx: {
    teamId: "lynx",
    seasonYear: "2027",
    currentPhase: "offseason",
    phaseLabel: { en: "WNBA Title Quest • 5th Championship", th: "ล่าแชมป์ WNBA • สมัยที่ 5 ในประวัติศาสตร์" },
    summary: {
      en: "Napheesa Collier and Cheryl Reeve's Commissioner's Cup champion squad return with championship hunger after reaching the WNBA Finals.",
      th: "Napheesa Collier และโค้ช Cheryl Reeve พาทีมแชมป์ Commissioner's Cup คืนสังเวียนด้วยความกระหายหลังทะลุเข้าชิงชนะเลิศ WNBA",
    },
    projectedRecord: "34-10 • WNBA #1 Seed Favorites",
    championshipOdds: "+280 (WNBA Title Favorites)",
    championshipTarget: "WNBA Championship Trophy",
    championshipProbability: 92,
    preseason: {
      status: "upcoming",
      dates: "April 20 - May 10, 2027",
      focus: {
        en: "Training camp at Target Center: defense-first rotations and transitional spacing.",
        th: "เทรนนิ่งแคมป์ที่ Target Center: เน้นระบบเกมรับที่เหนียวแน่นและเกมสวนกลับเร็ว",
      },
      milestones: [
        { date: "April 28", title: "Preseason Opener", note: "Exhibition matchup" },
      ],
      keyPlayers: [
        { name: "Napheesa Collier", role: "Forward", highlight: "Defensive Player of the Year & MVP finalist" },
        { name: "Courtney Williams", role: "Guard", highlight: "Clutch floor general" },
      ],
    },
    regularSeason: {
      status: "upcoming",
      dates: "May 14 - Sept 18, 2027",
      standing: "Targeting #1 Overall WNBA Seed",
      focus: {
        en: "Maintain league-leading defensive rating and defend the Commissioner's Cup crown.",
        th: "รักษาอันดับหนึ่งของลีกด้านเกมรับและป้องกันแชมป์ Commissioner's Cup",
      },
      keyMatchups: [
        { opponent: "New York Liberty", date: "June 12, 2027", venue: "Target Center", note: "WNBA Finals heavyweight rematch" },
        { opponent: "Las Vegas Aces", date: "July 8, 2027", venue: "Michelob ULTRA Arena", note: "Premier Western showdown" },
      ],
      milestones: [
        { date: "June 2027", title: "Commissioner's Cup Final", note: "Defending in-season championship" },
        { date: "July 2027", title: "WNBA All-Star Game", note: "Multiple Lynx All-Stars" },
      ],
    },
    playoffs: {
      status: "upcoming",
      dates: "Sept 20 - Oct 20, 2027",
      championshipTarget: "WNBA Championship Trophy",
      focus: {
        en: "Capture franchise's historic 5th WNBA Championship banner.",
        th: "คว้าแชมป์ WNBA สมัยที่ 5 ในประวัติศาสตร์สโมสร",
      },
      path: {
        en: "First Round (Best-of-3) -> Semifinals (Best-of-5) -> WNBA Finals (Best-of-5).",
        th: "รอบแรก (ชนะ 2 ใน 3) -> รอบรองชนะเลิศ (ชนะ 3 ใน 5) -> WNBA Finals (ชนะ 3 ใน 5)",
      },
      clinchScenario: {
        en: "Win 28 games to clinch home-court advantage throughout the postseason.",
        th: "ชนะ 28 นัดเพื่อการันตีสิทธิ์เล่นในบ้านตลอดรอบเพลย์ออฟ",
      },
      milestones: [
        { date: "Oct 2027", title: "WNBA Finals Game 5", note: "Championship crowning" },
      ],
    },
    offseason: {
      status: "in_progress",
      dates: "Oct 22, 2026 - April 15, 2027",
      capOrBudget: "WNBA Salary Cap Compliant",
      focus: {
        en: "Re-sign core free agents and identify floor-spacing wing talent.",
        th: "ต่อสัญญากลุ่มผู้เล่นแกนหลักและเสริมนักกีฬาตำแหน่งปีกที่ยิงแม่นยำ",
      },
      topPriorities: [
        { en: "Extend starting backcourt tandem", th: "ต่อสัญญาการ์ดตัวจริงทั้งสองคน" },
        { en: "Add 3-point shooting specialist off the bench", th: "ดึงตัวยิง 3 แต้มตัวสำรองชั้นนำ" },
      ],
      milestones: [
        { date: "Jan 2027", title: "WNBA Free Agency", note: "Roster finalization" },
      ],
    },
  },
  frost: {
    teamId: "frost",
    seasonYear: "2026-27",
    currentPhase: "regular",
    phaseLabel: { en: "Regular Season • Back-to-Back Walter Cup Champions", th: "ฤดูกาลปกติ • แชมป์ Walter Cup 2 สมัยซ้อน" },
    summary: {
      en: "The Minnesota Frost enter as back-to-back Walter Cup Champions, blending elite goaltending with physical forechecking to defend their PWHL dynasty.",
      th: "Minnesota Frost ลงสนามในฐานะแชมป์ Walter Cup สองสมัยซ้อน ด้วยเกมรับของผู้รักษาประตูระดับโลกและเกมบดบี้แดนหน้าเพื่อสร้างยุคทอง PWHL",
    },
    projectedRecord: "22-6-2 • 1st Seed PWHL",
    championshipOdds: "+190 (Championship Favorites)",
    championshipTarget: "Walter Cup Trophy",
    championshipProbability: 95,
    preseason: {
      status: "completed",
      dates: "Nov 1 - Nov 24, 2026",
      record: "3-0-0",
      focus: {
        en: "Training camp at Xcel Energy Center: solidified special teams and forecheck pressure.",
        th: "เทรนนิ่งแคมป์ที่ Xcel Energy Center: เสริมแกร่งทีมพิเศษและเกมบีบพื้นที่แดนหน้า",
      },
      milestones: [
        { date: "Nov 15", title: "Camp Scrimmage", note: "Roster depth finalized" },
      ],
      keyPlayers: [
        { name: "Taylor Heise", role: "Center", highlight: "Playoff MVP & dynamic scorer" },
        { name: "Kendall Coyne Schofield", role: "Forward", highlight: "Speedster captain" },
      ],
    },
    regularSeason: {
      status: "in_progress",
      dates: "Nov 30, 2026 - May 2, 2027",
      standing: "1st in PWHL Standings",
      focus: {
        en: "Locking up the #1 overall seed to earn home ice advantage throughout the playoffs.",
        th: "คว้าอันดับหนึ่งของตารางเพื่อสิทธิ์เล่นในบ้านตลอดการแข่งขันรอบเพลย์ออฟ",
      },
      keyMatchups: [
        { opponent: "Boston Fleet", date: "Dec 14, 2026", venue: "Xcel Energy Center", note: "Walter Cup Finals rematch" },
        { opponent: "Montreal Victoire", date: "Jan 9, 2027", venue: "Place Bell", note: "Classic rivalry test" },
      ],
      milestones: [
        { date: "Jan 2027", title: "Midseason Showcase", note: "PWHL spotlight tour" },
      ],
    },
    playoffs: {
      status: "upcoming",
      dates: "May 8 - May 28, 2027",
      championshipTarget: "Walter Cup Trophy",
      focus: {
        en: "Complete the historic 3-peat as Walter Cup Champions.",
        th: "คว้าแชมป์ Walter Cup 3 สมัยติดต่อกันเพื่อสร้างประวัติศาสตร์",
      },
      path: {
        en: "PWHL Semifinals (Best-of-5) -> Walter Cup Finals (Best-of-5).",
        th: "รอบรองชนะเลิศ PWHL (ชนะ 3 ใน 5) -> Walter Cup Finals (ชนะ 3 ใน 5)",
      },
      clinchScenario: {
        en: "Earn 42 points in standings to clinch top postseason seed.",
        th: "เก็บ 42 คะแนนในตารางการแข่งขันเพื่อการันตีอันดับหนึ่งรอบเพลย์ออฟ",
      },
      milestones: [
        { date: "Late May 2027", title: "Walter Cup Finals", note: "Dynasty 3-peat target" },
      ],
    },
    offseason: {
      status: "upcoming",
      dates: "June 1 - Oct 2027",
      capOrBudget: "PWHL Salary Cap Compliant",
      focus: {
        en: "Retain championship core and draft collegiate standouts.",
        th: "รักษาแกนหลักของทีมแชมป์และดราฟต์นักกีฬาระดับมหาวิทยาลัยชั้นนำ",
      },
      topPriorities: [
        { en: "Sign long-term extensions for top defensive pairings", th: "ต่อสัญญาระยะยาวคู่กองหลังตัวจริง" },
      ],
      milestones: [
        { date: "June 2027", title: "PWHL Draft", note: "College prospects addition" },
      ],
    },
  },
  mnufc: {
    teamId: "mnufc",
    seasonYear: "2026-27",
    currentPhase: "regular",
    phaseLabel: { en: "Audi MLS Cup Playoffs • Western Conference", th: "เพลย์ออฟ Audi MLS Cup • สายตะวันตก" },
    summary: {
      en: "The Loons defend Allianz Field behind a disciplined counter-attacking framework, dynamic wing play, and partisan St. Paul supporters.",
      th: "เดอะลูนส์ลงสนามที่ Allianz Field ด้วยระบบโต้กลับอย่างมีวินัย เกมรุกริมเส้นที่ดุดัน และพลังเสียงเชียร์ของแฟนบอลเซนต์พอล",
    },
    projectedRecord: "15-11-8 • 53 Points (MLS Cup Contender)",
    championshipOdds: "+2200 (MLS Cup Dark Horse)",
    championshipTarget: "Philip F. Anschutz Trophy (MLS Cup)",
    championshipProbability: 61,
    preseason: {
      status: "completed",
      dates: "Jan 18 - Feb 20, 2026",
      record: "4-1-1",
      focus: {
        en: "Desert Friendlies in Tucson, AZ: solidified 5-3-2 tactical defensive structure.",
        th: "เกมอุ่นเครื่องที่ทูซอน แอริโซนา: ปรับโครงสร้างแท็กติกเกมรับ 5-3-2 ให้ลงตัว",
      },
      milestones: [
        { date: "Feb 14", title: "Preseason Finale", note: "Clean-sheet victory" },
      ],
      keyPlayers: [
        { name: "Dayne St. Clair", role: "Goalkeeper", highlight: "Penalty kick specialist" },
        { name: "Robin Lod", role: "Midfielder", highlight: "Playmaking maestro" },
      ],
    },
    regularSeason: {
      status: "completed",
      dates: "Feb 28 - Oct 18, 2026",
      standing: "4th in Western Conference (Home-Field Playoff Spot)",
      focus: {
        en: "Turning Allianz Field into an impenetrable fortress with 10+ home victories.",
        th: "สร้างความแข็งแกร่งในบ้าน Allianz Field ด้วยชัยชนะเกิน 10 นัด",
      },
      keyMatchups: [
        { opponent: "LA Galaxy", date: "Sept 12, 2026", venue: "Allianz Field", note: "Western top-four battle" },
        { opponent: "Seattle Sounders", date: "Oct 4, 2026", venue: "Lumen Field", note: "Decision Day seeding test" },
      ],
      milestones: [
        { date: "July 2026", title: "Leagues Cup", note: "Knockout phase run" },
      ],
    },
    playoffs: {
      status: "in_progress",
      dates: "Oct 24 - Dec 6, 2026",
      championshipTarget: "MLS Cup Trophy",
      focus: {
        en: "Advance past Round One Best-of-3 Series and capture the Western Conference crown.",
        th: "ผ่านรอบแรกระบบชนะ 2 ใน 3 และก้าวไปสู่แชมป์สายตะวันตก",
      },
      path: {
        en: "Round One (Best-of-3) -> Conference Semifinals -> Conference Final -> MLS Cup.",
        th: "รอบแรก (ชนะ 2 ใน 3) -> รอบรองชนะเลิศสาย -> ชิงแชมป์สาย -> MLS Cup",
      },
      clinchScenario: {
        en: "Win decisive Game 3 at Allianz Field to reach Conference Semifinals.",
        th: "คว้าชัยชนะนัดตัดสินเกม 3 ที่ Allianz Field เพื่อเข้าสู่รอบตัดเชือกของสาย",
      },
      milestones: [
        { date: "Nov 2026", title: "Western Semifinal", note: "Single-elimination thriller" },
        { date: "Dec 6, 2026", title: "MLS Cup Final", note: "Battle for Philip F. Anschutz Trophy" },
      ],
    },
    offseason: {
      status: "upcoming",
      dates: "Dec 10, 2026 - Jan 14, 2027",
      capOrBudget: "$6.2M GAM/TAM Allocation Flexibility",
      focus: {
        en: "Target marquee Designated Player striker and shore up central midfield passing depth.",
        th: "ดึงกองหน้าตัวเป้าระดับ Designated Player และเสริมมิดฟิลด์ตัวกลางที่ผ่านบอลแม่นยำ",
      },
      topPriorities: [
        { en: "Sign DP striker with international pedigree", th: "เซ็นสัญญากองหน้า DP ระดับทีมชาติ" },
        { en: "Exercise contract options for young domestic core", th: "ใช้ออปชันต่อสัญญากลุ่มผู้เล่นดาวรุ่งท้องถิ่น" },
      ],
      milestones: [
        { date: "Dec 2026", title: "MLS Re-Entry Draft", note: "Domestic depth additions" },
      ],
    },
  },
  rbfc: {
    teamId: "rbfc",
    seasonYear: "2026-27",
    currentPhase: "regular",
    phaseLabel: { en: "Matchday 10 • Thai League 1", th: "นัดที่ 10 • รีโว่ ไทยลีก 1" },
    summary: {
      en: "Ratchaburi FC turns Dragon Solar Park into a vibrant fortress with aggressive high-pressing football, eye-catching transitions, and AFC Champions League qualification aspirations.",
      th: "ราชบุรี เอฟซี เปลี่ยน ดราก้อน โซลาร์ ปาร์ค เป็นป้อมปราการสุดแกร่ง ด้วยเกมเพรสซิ่งดุดัน เกมโต้กลับรวดเร็ว และเป้าหมายคว้าตั๋วฟุตบอลถ้วยเอเชีย AFC Champions League",
    },
    projectedRecord: "16-8-6 • 56 Points (Top 3 Thai League 1)",
    championshipOdds: "+750 (Title Contenders & Chang FA Cup Favorites)",
    championshipTarget: "Thai League 1 Trophy & Chang FA Cup",
    championshipProbability: 80,
    preseason: {
      status: "completed",
      dates: "July 1 - Aug 6, 2026",
      record: "5-0-1",
      focus: {
        en: "Preseason camp at Dragon Solar Park: integrated international signings and high-octane 4-3-3 pressing shape.",
        th: "ปรีซีซันแคมป์ที่ ดราก้อน โซลาร์ ปาร์ค: ปรับจูนผู้เล่นโควตาต่างชาติและระบบเพรสซิ่ง 4-3-3",
      },
      milestones: [
        { date: "July 24", title: "Dragon Solar Cup", note: "3-1 victory in international friendly" },
        { date: "Aug 2", title: "Team Presentation Day", note: "Official 2026-27 kit launch" },
      ],
      keyPlayers: [
        { name: "Dragons Striker", role: "Center Forward", highlight: "Prolific finisher & target man" },
        { name: "Captain Playmaker", role: "Attacking Midfielder", highlight: "Set-piece master & team leader" },
      ],
    },
    regularSeason: {
      status: "in_progress",
      dates: "Aug 14, 2026 - May 10, 2027",
      standing: "3rd in Thai League 1 (Chasing Title Lead)",
      focus: {
        en: "Protecting Dragon Solar Park home record and collecting maximum points against top-four rivals.",
        th: "รักษาฟอร์มแกร่งไร้พ่ายในบ้าน ดราก้อน โซลาร์ ปาร์ค และเก็บแต้มสำคัญในเกมบิ๊กแมตช์",
      },
      keyMatchups: [
        { opponent: "Buriram United", date: "Nov 29, 2026", venue: "Dragon Solar Park", note: "Massive Thai League title clash" },
        { opponent: "Bangkok United", date: "Dec 20, 2026", venue: "True Stadium", note: "Direct battle for AFC Champions League qualification" },
        { opponent: "Port FC", date: "Feb 14, 2027", venue: "PAT Stadium", note: "Crucial away challenge" },
      ],
      milestones: [
        { date: "Dec 2026", title: "Leg 1 Conclusion", note: "Targeting top-two standing" },
        { date: "Jan 2027", title: "Chang FA Cup Round of 16", note: "Cup campaign kickoff" },
      ],
    },
    playoffs: {
      status: "upcoming",
      dates: "March 1 - May 24, 2027",
      championshipTarget: "Chang FA Cup & Revo Cup Champions",
      focus: {
        en: "Secure AFC Champions League continental qualification and lift silverware at National Stadium.",
        th: "คว้าตั๋วไปเล่นฟุตบอลถ้วยเอเชีย AFC Champions League และชูถ้วยแชมป์ฟุตบอลถ้วยในประเทศ",
      },
      path: {
        en: "Chang FA Cup Quarterfinals -> Semifinals -> Chang FA Cup Final at Supachalasai Stadium.",
        th: "ช้าง เอฟเอ คัพ รอบ 8 ทีม -> รอบรองชนะเลิศ -> นัดชิงชนะเลิศ ที่สนามศุภชลาศัย",
      },
      clinchScenario: {
        en: "Reach 55+ league points and win 4 consecutive cup fixtures.",
        th: "เก็บ 55 แต้มในลีกและชนะรวด 4 นัดในฟุตบอลถ้วย",
      },
      milestones: [
        { date: "April 2027", title: "FA Cup Semifinal", note: "High-stakes knockout battle" },
        { date: "May 2027", title: "FA Cup Final", note: "Championship coronation at Supachalasai" },
      ],
    },
    offseason: {
      status: "upcoming",
      dates: "June 1 - July 2027",
      capOrBudget: "Thai League 1 Salary Cap Structure",
      focus: {
        en: "Strengthen depth for dual continental AFC and domestic Thai League campaign.",
        th: "เสริมขุมกำลังเชิงลึกเพื่อรับมือสองรายการทั้งศึกเอเชียและไทยลีก",
      },
      topPriorities: [
        { en: "Sign proven Asian-quota defensive midfielder", th: "เซ็นสัญญากองกลางตัวรับโควตาเอเชีย" },
        { en: "Retain high-impact Brazilian attacking core", th: "ต่อสัญญาแนวรุกบราซิลตัวหลัก" },
      ],
      milestones: [
        { date: "June 2027", title: "AFC Draw Ceremony", note: "Discover continental group opponents" },
      ],
    },
  },
};

export function getTeamSeasonOutlook(team: Team): SeasonOutlook {
  if (SEASON_OUTLOOKS[team.id]) {
    return SEASON_OUTLOOKS[team.id];
  }

  return {
    teamId: team.id,
    seasonYear: "2026-27",
    currentPhase: "regular",
    phaseLabel: { en: "Competitive Season", th: "ฤดูกาลแข่งขันปัจจุบัน" },
    summary: {
      en: `${team.name} continues their campaign in ${team.league || "Global Sports"}, focusing on tactical execution and playoff contention.`,
      th: `${team.th || team.name} เดินหน้าแข่งขันในลีก ${team.league || "กีฬาอาชีพ"} มุ่งมั่นสร้างฟอร์มเพื่อลุ้นตั๋วเพลย์ออฟ`,
    },
    projectedRecord: "Championship Contenders",
    championshipOdds: "+2500",
    championshipTarget: `${team.league || "League"} Championship`,
    championshipProbability: 55,
    preseason: {
      status: "completed",
      dates: "Preseason Window",
      record: "Completed",
      focus: {
        en: "Established roster conditioning and foundational tactical systems.",
        th: "เตรียมความพร้อมร่างกายและติดตั้งระบบแท็กติกพื้นฐาน",
      },
      milestones: [
        { date: "Opening Camp", title: "Training Camp", note: "Depth chart established" },
      ],
    },
    regularSeason: {
      status: "in_progress",
      dates: "Active Campaign",
      standing: "Contending Roster",
      focus: {
        en: "Securing conference victories and advancing standing.",
        th: "เน้นคว้าชัยชนะเพื่อไต่อันดับในตาราง",
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
        en: "Win playoff series and hoist championship trophy.",
        th: "เอาชนะในรอบเพลย์ออฟเพื่อชูถ้วยแชมป์เกียรติยศ",
      },
      path: {
        en: "First Round -> Semifinals -> Finals.",
        th: "รอบแรก -> รอบรองชนะเลิศ -> รอบชิงชนะเลิศ",
      },
      clinchScenario: {
        en: "Stack conference victories in remaining fixtures.",
        th: "เก็บชัยชนะในเกมที่เหลือเพื่อการันตีตั๋ว",
      },
      milestones: [
        { date: "Postseason", title: "Playoff Round", note: "Championship bracket" },
      ],
    },
    offseason: {
      status: "upcoming",
      dates: "Summer 2027",
      capOrBudget: "Standard League Cap Space",
      focus: {
        en: "Draft development talent and secure veteran leaders.",
        th: "ดราฟต์ผู้เล่นดาวรุ่งและเสริมผู้เล่นประสบการณ์",
      },
      topPriorities: [
        { en: "Upgrade roster depth", th: "เสริมความลึกของขุมกำลัง" },
        { en: "Retain foundational core", th: "รักษากลุ่มผู้เล่นแกนหลัก" },
      ],
      milestones: [
        { date: "Offseason", title: "Roster Review", note: "Signings & extensions" },
      ],
    },
  };
}

// =========================================================================
// HELPER HOOKS & TABS
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

  // Refresh live ESPN scoreboards across 14 leagues
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
      console.error("Live scores refresh failed:", err);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  // Initial and 15s interval sync
  useEffect(() => {
    refreshLiveScores();
    const interval = setInterval(refreshLiveScores, 15000);
    return () => clearInterval(interval);
  }, [refreshLiveScores]);

  const toggleFav = (id: string) => {
    setFavs((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const addAllMN = () => {
    setFavs((prev) => Array.from(new Set([...prev, ...MN_IDS])));
    toast.success(lang === "th" ? "เพิ่มทุกทีมมินนิโซตาแล้ว" : "All Minnesota teams added to favorites!");
  };

  const hubGames = useMemo(() => {
    if (hub === "all") return games;
    if (hub === "ratchaburi") {
      return games.filter((g) => g.home === "rbfc" || g.away === "rbfc" || g.league === "THAI1");
    }
    if (hub === "minnesota") {
      return games.filter(
        (g) => MN_IDS.includes(g.home) || MN_IDS.includes(g.away)
      );
    }
    return games;
  }, [games, hub]);

  return (
    <div
      data-hub={hub}
      className="min-h-screen bg-background text-foreground transition-colors duration-300 pb-20 sm:pb-8"
    >
      {/* Top Header & Ticker */}
      <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-2.5">
          {/* Brand */}
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md shadow-primary/20">
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-display text-xl tracking-wider font-bold">
                  HERMETICA
                </span>
                <span className="rounded-full bg-accent/20 px-2 py-0.5 text-[10px] font-bold text-accent">
                  SPORTS OS
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                {lang === "th" ? "ฮับกีฬาถ่ายทอดสดแบบรวมศูนย์" : "Unified Global Sports Operating System"}
              </p>
            </div>
          </div>

          {/* Quick Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => refreshLiveScores()}
              disabled={isRefreshing}
              className="flex items-center gap-1 rounded-lg border border-border bg-card px-2.5 py-1 text-xs font-semibold text-muted-foreground transition hover:border-primary hover:text-foreground cursor-pointer"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin text-primary" : ""}`} />
              <span className="hidden sm:inline">
                {isRefreshing ? "Syncing…" : "Sync"}
              </span>
            </button>

            <button
              onClick={() => setLang(lang === "en" ? "th" : "en")}
              className="flex items-center gap-1 rounded-lg border border-border bg-card px-2.5 py-1 text-xs font-semibold transition hover:border-primary cursor-pointer"
            >
              <Globe className="h-3.5 w-3.5 text-primary" />
              <span>{lang === "en" ? "TH" : "EN"}</span>
            </button>
          </div>
        </div>

        {/* Hub Selector Pills */}
        <div className="mx-auto flex max-w-6xl gap-1.5 overflow-x-auto px-4 py-2 scrollbar-none">
          <button
            onClick={() => setHub("all")}
            className={`rounded-full px-3 py-1 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
              hub === "all"
                ? "bg-primary text-primary-foreground shadow-sm shadow-primary/30"
                : "border border-border bg-card/60 text-muted-foreground hover:bg-secondary"
            }`}
          >
            {t.all}
          </button>
          <button
            onClick={() => setHub("minnesota")}
            className={`rounded-full px-3 py-1 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
              hub === "minnesota"
                ? "bg-[#4F2683] text-[#FFC62F] shadow-sm shadow-[#4F2683]/50"
                : "border border-border bg-card/60 text-muted-foreground hover:bg-secondary"
            }`}
          >
            ★ Twin Cities Hub (7 Teams)
          </button>
          <button
            onClick={() => setHub("ratchaburi")}
            className={`rounded-full px-3 py-1 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
              hub === "ratchaburi"
                ? "bg-[#FF6600] text-white shadow-sm shadow-[#FF6600]/50"
                : "border border-border bg-card/60 text-muted-foreground hover:bg-secondary"
            }`}
          >
            🐉 Ratchaburi FC (Dragon Solar Park)
          </button>
        </div>

        {/* Live Score Ticker (90 Seconds Speed) */}
        <Ticker games={games} lang={lang} />

        {/* Desktop Navigation */}
        <nav className="mx-auto hidden max-w-6xl gap-1 px-4 sm:flex overflow-x-auto">
          {tabs(t, lang).map((item) => {
            const Icon = item.icon;
            const active = tab === item.key;
            return (
              <button
                key={item.key}
                onClick={() => setTab(item.key as AppTab)}
                className={`flex items-center gap-1.5 border-b-2 px-3.5 py-2.5 text-xs font-bold tracking-wide transition cursor-pointer whitespace-nowrap ${
                  active
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </header>

      {/* Main Content Area */}
      <main className="mx-auto max-w-6xl px-4 py-5 space-y-5">
        <HubInfo hub={hub} lang={lang} now={now} weather={dualWeather} onAddAllMN={addAllMN} />

        {tab === "live" && (
          <LiveTab
            games={hubGames}
            lang={lang}
            favs={favs}
            toggleFav={toggleFav}
            preds={preds}
            setPreds={setPreds}
            onSelectGame={setSelectedGame}
          />
        )}

        {tab === "pulse" && (
          <PulseTab
            hub={hub}
            lang={lang}
            games={games}
            favs={favs}
            weather={dualWeather}
            onSelectTeam={setSelectedTeamId}
          />
        )}

        {tab === "my" && (
          <MyTab
            favs={favs}
            games={games}
            lang={lang}
            toggleFav={toggleFav}
            onAddAllMN={addAllMN}
            onSelectTeam={setSelectedTeamId}
          />
        )}

        {tab === "seasons" && (
          <SeasonsTab
            lang={lang}
            favs={favs}
            selectedTeamId={selectedTeamId}
            onSelectTeam={setSelectedTeamId}
          />
        )}

        {tab === "explore" && (
          <ExploreTab
            lang={lang}
            favs={favs}
            toggleFav={toggleFav}
            onSelectTeam={setSelectedTeamId}
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
            games={games}
            lang={lang}
            preds={preds}
            setPreds={setPreds}
          />
        )}
      </main>

      {/* Mobile Safe-Area Bottom Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around border-t border-border bg-background/95 backdrop-blur-lg px-2 py-1.5 pb-safe sm:hidden">
        {tabs(t, lang).map((item) => {
          const Icon = item.icon;
          const active = tab === item.key;
          return (
            <button
              key={item.key}
              onClick={() => setTab(item.key as AppTab)}
              className={`flex flex-col items-center justify-center p-1 text-[10px] font-bold transition cursor-pointer ${
                active ? "text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span className="mt-0.5">{item.label}</span>
            </button>
          );
        })}
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
    <div className="rounded-2xl border border-border bg-card/70 p-4 shadow-sm backdrop-blur-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Clocks */}
        <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-1.5">
            <span className="rounded bg-primary/20 px-1.5 py-0.5 font-bold text-primary">
              ICT (Bangkok)
            </span>
            <span className="font-bold text-foreground text-sm">{ictTime}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="rounded bg-secondary px-1.5 py-0.5 font-bold text-muted-foreground">
              CT (Twin Cities)
            </span>
            <span className="font-bold text-foreground text-sm">{ctTime}</span>
          </div>
        </div>

        {/* Weather & Quick Action */}
        <div className="flex items-center gap-3 text-xs">
          {weather?.ratchaburi?.tempC !== undefined && (
            <span className="text-muted-foreground">
              🐉 DSP: <strong className="text-foreground">{Math.round(weather.ratchaburi.tempC)}°C</strong>
            </span>
          )}
          {weather?.minnesota?.tempF !== undefined && (
            <span className="text-muted-foreground">
              ❄️ MN: <strong className="text-foreground">{Math.round(weather.minnesota.tempF)}°F</strong>
            </span>
          )}
          {hub === "minnesota" && (
            <button
              onClick={onAddAllMN}
              className="rounded-lg bg-primary/20 px-2.5 py-1 font-bold text-primary text-[11px] hover:bg-primary/30 transition cursor-pointer"
            >
              + Add All 7 MN Teams
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Ticker({ games, lang }: { games: Game[]; lang: Lang }) {
  if (!games || games.length === 0) return null;

  return (
    <div className="border-t border-border/40 bg-card/60 overflow-hidden py-1.5">
      <div
        className="flex items-center gap-6 animate-marquee whitespace-nowrap text-xs"
        style={{ animationDuration: "90s" }}
      >
        {games.slice(0, 10).map((g) => {
          const home = teamById(g.home);
          const away = teamById(g.away);
          const isLive = g.status === "LIVE";

          return (
            <div key={g.id} className="inline-flex items-center gap-2 px-2">
              <span className="font-bold text-[10px] text-muted-foreground uppercase">
                {g.league}
              </span>
              <span className="font-bold text-foreground">
                {away.seal}
              </span>
              {isLive ? (
                <span className="font-bold text-red-500 font-mono">
                  {g.as} - {g.hs}
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
                  ({fmtTime(g.kickoff, "Asia/Bangkok", lang)})
                  {g.odds && ` • ${typeof g.odds === "object" ? g.odds.spread || "" : g.odds}`}
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
  const home = teamById(g.home);
  const away = teamById(g.away);
  const title = `${away.name} vs ${home.name} (${g.league})`;
  const start = new Date(g.kickoff).toISOString().replace(/-|:|\.\d+/g, "");
  const end = new Date(new Date(g.kickoff).getTime() + 3 * 3600 * 1000)
    .toISOString()
    .replace(/-|:|\.\d+/g, "");

  const googleUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
    title
  )}&dates=${start}/${end}&details=${encodeURIComponent(
    `Live broadcast on Hermetica Sports OS. Venue: ${g.venue || "TBD"}`
  )}&location=${encodeURIComponent(g.venue || "")}`;

  return { googleUrl };
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
  const home = teamById(game.home);
  const away = teamById(game.away);
  const isLive = game.status === "LIVE";
  const cal = calendarLinks(game);

  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm transition hover:border-primary/50 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider">
          <span className="rounded bg-secondary px-2 py-0.5 text-[10px] text-foreground">
            {game.league}
          </span>
          {isLive ? (
            <span className="flex items-center gap-1 rounded bg-red-500/20 px-2 py-0.5 text-[10px] font-bold text-red-500">
              <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
              {game.clock}
            </span>
          ) : (
            <span>Upcoming</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleFav}
            className={`transition cursor-pointer ${
              isFav ? "text-yellow-400" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Star className={`h-4 w-4 ${isFav ? "fill-yellow-400" : ""}`} />
          </button>
          <a
            href={cal.googleUrl}
            target="_blank"
            rel="noreferrer"
            title="Add to Google Calendar"
            className="text-muted-foreground hover:text-foreground transition"
          >
            <Calendar className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>

      {/* Matchup */}
      <div className="grid grid-cols-12 items-center gap-2 py-1">
        {/* Away */}
        <div className="col-span-5 flex items-center gap-2.5">
          <Seal t={away} size={38} />
          <div className="min-w-0">
            <h4 className="font-bold text-sm text-foreground truncate">{away.name}</h4>
            <p className="text-[11px] text-muted-foreground">{away.record || "Contender"}</p>
          </div>
        </div>

        {/* Scores or Kickoff */}
        <div className="col-span-2 text-center">
          {isLive ? (
            <div className="font-mono text-xl font-bold text-red-500">
              {game.as} - {game.hs}
            </div>
          ) : (
            <span className="text-xs font-bold text-muted-foreground">VS</span>
          )}
        </div>

        {/* Home */}
        <div className="col-span-5 flex items-center justify-end gap-2.5 text-right">
          <div className="min-w-0">
            <h4 className="font-bold text-sm text-foreground truncate">{home.name}</h4>
            <p className="text-[11px] text-muted-foreground">{home.record || "Host"}</p>
          </div>
          <Seal t={home} size={38} />
        </div>
      </div>

      {/* Times / Venue */}
      <div className="flex items-center justify-between border-t border-border/40 pt-2 text-xs">
        <span className="text-muted-foreground truncate max-w-[160px]">
          📍 {game.venue || "Stadium"}
        </span>
        <GameTimes time={game.kickoff} lang={lang} />
      </div>

      {/* Odds or Mini-Prediction */}
      {game.odds && (
        <div className="rounded-xl bg-secondary/50 px-2.5 py-1.5 text-[11px] text-muted-foreground flex items-center justify-between">
          <span className="font-bold">ODDS</span>
          <span className="font-mono">
            {typeof game.odds === "object"
              ? `${game.odds.spread || ""} • O/U ${game.odds.overUnder || ""} • ML ${game.odds.moneyline || ""}`
              : game.odds}
          </span>
        </div>
      )}

      {/* Interactive Predict Winner */}
      <div className="flex items-center justify-between pt-1">
        <span className="text-[11px] font-semibold text-muted-foreground">Predict Winner:</span>
        <div className="flex gap-1.5">
          <button
            onClick={() => setPred(away.id)}
            className={`rounded-lg px-2.5 py-1 text-xs font-bold transition cursor-pointer ${
              pred === away.id
                ? "bg-primary text-primary-foreground"
                : "border border-border bg-card hover:bg-secondary text-muted-foreground"
            }`}
          >
            {away.seal}
          </button>
          <button
            onClick={() => setPred(home.id)}
            className={`rounded-lg px-2.5 py-1 text-xs font-bold transition cursor-pointer ${
              pred === home.id
                ? "bg-primary text-primary-foreground"
                : "border border-border bg-card hover:bg-secondary text-muted-foreground"
            }`}
          >
            {home.seal}
          </button>
        </div>
      </div>
    </div>
  );
}

// =========================================================================
// TAB COMPONENTS
// =========================================================================

function LiveTab({
  games,
  lang,
  favs,
  toggleFav,
  preds,
  setPreds,
  onSelectGame,
}: {
  games: Game[];
  lang: Lang;
  favs: string[];
  toggleFav: (id: string) => void;
  preds: Record<string, string>;
  setPreds: (p: Record<string, string>) => void;
  onSelectGame: (g: Game) => void;
}) {
  const [filter, setFilter] = useState<"all" | "favs">("all");

  const filtered = useMemo(() => {
    if (filter === "favs") {
      return games.filter((g) => favs.includes(g.home) || favs.includes(g.away));
    }
    return games;
  }, [games, filter, favs]);

  const liveGames = filtered.filter((g) => g.status === "LIVE");
  const upcomingGames = filtered.filter((g) => g.status === "UPCOMING");

  return (
    <div className="space-y-6">
      {/* Filter Tabs */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1.5">
          <button
            onClick={() => setFilter("all")}
            className={`rounded-xl px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
              filter === "all"
                ? "bg-primary text-primary-foreground"
                : "border border-border bg-card text-muted-foreground"
            }`}
          >
            All Live & Upcoming ({games.length})
          </button>
          <button
            onClick={() => setFilter("favs")}
            className={`rounded-xl px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
              filter === "favs"
                ? "bg-primary text-primary-foreground"
                : "border border-border bg-card text-muted-foreground"
            }`}
          >
            ★ My Teams Only
          </button>
        </div>
      </div>

      {/* Live Active Games */}
      {liveGames.length > 0 && (
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
      )}

      {/* Upcoming Games Section */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            <h2 className="font-display text-lg tracking-wide">
              {lang === "th" ? "โปรแกรมการแข่งขันถัดไป" : "UPCOMING GAMES"} ({upcomingGames.length})
            </h2>
          </div>
        </div>

        {upcomingGames.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-8 text-center text-muted-foreground">
            <p>No upcoming games found for the selected hub.</p>
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

function PulseTab({
  hub,
  lang,
  games,
  favs,
  weather,
  onSelectTeam,
}: {
  hub: Hub;
  lang: Lang;
  games: Game[];
  favs: string[];
  weather: any;
  onSelectTeam: (id: string) => void;
}) {
  const rankedTeams = useMemo(() => {
    return TEAMS.map((t) => {
      const activeGame = games.find((g) => g.home === t.id || g.away === t.id);
      const isLive = activeGame?.status === "LIVE";
      const isFav = favs.includes(t.id);

      // Dynamic Pulse Score (0 - 100)
      let score = isLive ? 92 : isFav ? 84 : 72;
      if (t.id === "vik") score = 96;
      if (t.id === "wolves") score = 94;
      if (t.id === "rbfc") score = 91;

      return {
        team: t,
        score,
        isLive,
        activeGame,
      };
    }).sort((a, b) => b.score - a.score);
  }, [games, favs]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl tracking-wide flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            SPORTS PULSE (HIGHEST TO LOWEST INTENSITY)
          </h2>
          <p className="text-xs text-muted-foreground">
            Year-round algorithmic sentiment, momentum radar, and key storylines.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {rankedTeams.map((item, idx) => {
          const outlook = getTeamSeasonOutlook(item.team);

          return (
            <div
              key={item.team.id}
              onClick={() => onSelectTeam(item.team.id)}
              className="rounded-2xl border border-border bg-card/70 p-4 transition hover:border-primary/50 cursor-pointer space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-lg font-bold text-muted-foreground w-6">
                    #{idx + 1}
                  </span>
                  <Seal t={item.team} size={40} />
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-foreground">
                        {lang === "th" ? item.team.th || item.team.name : item.team.name}
                      </h4>
                      <span className="rounded bg-secondary px-2 py-0.5 text-[10px] font-bold text-muted-foreground">
                        {item.team.league}
                      </span>
                      {item.isLive && (
                        <span className="rounded bg-red-500/20 px-2 py-0.5 text-[10px] font-bold text-red-500 animate-pulse">
                          LIVE
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {outlook.phaseLabel[lang]} • {outlook.projectedRecord}
                    </p>
                  </div>
                </div>

                {/* Score Dial */}
                <div className="text-right">
                  <span className="font-mono text-2xl font-bold text-primary">
                    {item.score}
                  </span>
                  <span className="block text-[10px] text-muted-foreground uppercase font-bold">
                    PULSE
                  </span>
                </div>
              </div>

              {/* Year-Round Narrative Summary */}
              <div className="rounded-xl bg-secondary/40 p-3 text-xs text-muted-foreground leading-relaxed">
                <p className="line-clamp-2">{outlook.summary[lang]}</p>
              </div>

              {/* Championship Odds & Targets */}
              <div className="flex items-center justify-between text-xs pt-1 border-t border-border/40">
                <span className="font-semibold text-accent">
                  Target: {outlook.championshipTarget}
                </span>
                <span className="font-mono text-muted-foreground">
                  Odds: {outlook.championshipOdds}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MyTab({
  favs,
  games,
  lang,
  toggleFav,
  onAddAllMN,
  onSelectTeam,
}: {
  favs: string[];
  games: Game[];
  lang: Lang;
  toggleFav: (id: string) => void;
  onAddAllMN: () => void;
  onSelectTeam: (id: string) => void;
}) {
  const favoriteTeams = TEAMS.filter((t) => favs.includes(t.id));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl tracking-wide flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
            MY FAVORITE TEAMS ({favoriteTeams.length})
          </h2>
          <p className="text-xs text-muted-foreground">
            Custom roster with instant gamecast access and season outlooks.
          </p>
        </div>

        <button
          onClick={onAddAllMN}
          className="rounded-xl border border-primary/50 bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary hover:bg-primary/20 transition cursor-pointer"
        >
          + Add All 7 MN Teams
        </button>
      </div>

      {favoriteTeams.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center space-y-3">
          <Star className="mx-auto h-8 w-8 text-muted-foreground" />
          <h3 className="font-display text-lg font-bold">No Favorites Selected</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Click the star icon on any team card or use the quick action above to monitor all Twin Cities and Ratchaburi teams.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {favoriteTeams.map((team) => {
            const nextGame = games.find(
              (g) => g.home === team.id || g.away === team.id
            );
            const outlook = getTeamSeasonOutlook(team);

            return (
              <div
                key={team.id}
                className="rounded-2xl border border-border bg-card p-4 space-y-3 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div
                    onClick={() => onSelectTeam(team.id)}
                    className="flex items-center gap-3 cursor-pointer group"
                  >
                    <Seal t={team} size={42} />
                    <div>
                      <h4 className="font-bold text-sm group-hover:text-primary transition">
                        {lang === "th" ? team.th || team.name : team.name}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        {team.league} • {team.record || "Contender"}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => toggleFav(team.id)}
                    className="text-yellow-400 p-1 hover:opacity-80 transition cursor-pointer"
                  >
                    <Star className="h-5 w-5 fill-yellow-400" />
                  </button>
                </div>

                {/* Brief Season Summary */}
                <div className="rounded-xl bg-secondary/40 p-2.5 text-xs text-muted-foreground">
                  <p className="line-clamp-2">{outlook.summary[lang]}</p>
                </div>

                {/* Next Game Status */}
                <div className="flex items-center justify-between border-t border-border/40 pt-2 text-xs">
                  <span className="text-muted-foreground font-semibold">
                    {nextGame
                      ? nextGame.status === "LIVE"
                        ? "🔴 LIVE NOW"
                        : `Next: ${fmtTime(nextGame.kickoff, "Asia/Bangkok", lang)}`
                      : "No active game in window"}
                  </span>

                  <button
                    onClick={() => onSelectTeam(team.id)}
                    className="font-bold text-primary hover:underline cursor-pointer"
                  >
                    View Season Outlook →
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
  lang,
  favs,
  selectedTeamId,
  onSelectTeam,
}: {
  lang: Lang;
  favs: string[];
  selectedTeamId: string | null;
  onSelectTeam: (id: string) => void;
}) {
  const activeId = selectedTeamId || favs[0] || "vik";
  const activeTeam = teamById(activeId);
  const outlook = getTeamSeasonOutlook(activeTeam);

  return (
    <div className="space-y-6">
      {/* Team Switcher Header */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {TEAMS.map((t) => {
          const selected = t.id === activeId;
          return (
            <button
              key={t.id}
              onClick={() => onSelectTeam(t.id)}
              className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                selected
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                  : "border border-border bg-card text-muted-foreground hover:bg-secondary"
              }`}
            >
              <Seal t={t} size={24} />
              <span>{lang === "th" ? t.th || t.name : t.name}</span>
            </button>
          );
        })}
      </div>

      {/* Season Hub Hero Banner */}
      <div className="rounded-2xl border border-border bg-card/80 p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3.5">
            <Seal t={activeTeam} size={50} />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display text-2xl font-bold">
                  {lang === "th" ? activeTeam.th || activeTeam.name : activeTeam.name}
                </h2>
                <span className="rounded-full bg-accent/20 px-2 py-0.5 text-xs font-bold text-accent">
                  {outlook.seasonYear}
                </span>
              </div>
              <p className="text-xs text-muted-foreground font-semibold">
                {outlook.phaseLabel[lang]} • {outlook.projectedRecord}
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="font-mono text-2xl font-bold text-primary">
              {outlook.championshipProbability}%
            </span>
            <span className="block text-[10px] text-muted-foreground uppercase font-bold">
              TITLE PROBABILITY
            </span>
          </div>
        </div>

        {/* Narrative Paragraph */}
        <p className="text-sm text-foreground/90 leading-relaxed bg-secondary/30 p-3.5 rounded-xl border border-border/40">
          {outlook.summary[lang]}
        </p>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 pt-1">
          <div className="rounded-xl bg-card border border-border p-3">
            <span className="text-[10px] text-muted-foreground uppercase font-bold block">
              CHAMPIONSHIP TARGET
            </span>
            <span className="font-bold text-xs text-accent mt-0.5 block truncate">
              {outlook.championshipTarget}
            </span>
          </div>
          <div className="rounded-xl bg-card border border-border p-3">
            <span className="text-[10px] text-muted-foreground uppercase font-bold block">
              MARKET ODDS
            </span>
            <span className="font-mono font-bold text-xs text-foreground mt-0.5 block">
              {outlook.championshipOdds}
            </span>
          </div>
          <div className="rounded-xl bg-card border border-border p-3">
            <span className="text-[10px] text-muted-foreground uppercase font-bold block">
              PROJECTION
            </span>
            <span className="font-bold text-xs text-foreground mt-0.5 block truncate">
              {outlook.projectedRecord}
            </span>
          </div>
          <div className="rounded-xl bg-card border border-border p-3">
            <span className="text-[10px] text-muted-foreground uppercase font-bold block">
              SALARY / CAP SPACE
            </span>
            <span className="font-mono font-bold text-xs text-primary mt-0.5 block truncate">
              {outlook.offseason.capOrBudget}
            </span>
          </div>
        </div>
      </div>

      {/* 4 Phases Breakdown: Preseason, Regular, Playoffs, Offseason */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Preseason */}
        <div className="rounded-2xl border border-border bg-card p-4 space-y-2.5">
          <div className="flex items-center justify-between border-b border-border/40 pb-2">
            <span className="font-display text-sm tracking-wide text-muted-foreground uppercase font-bold">
              1. PRESEASON & CAMP
            </span>
            <span className="rounded bg-secondary px-2 py-0.5 text-[10px] font-bold text-muted-foreground">
              {outlook.preseason.dates}
            </span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {outlook.preseason.focus[lang]}
          </p>
          {outlook.preseason.milestones.length > 0 && (
            <div className="pt-1 space-y-1">
              {outlook.preseason.milestones.map((m, i) => (
                <div key={i} className="text-[11px] flex justify-between text-muted-foreground">
                  <span>• {m.title}</span>
                  <span className="font-mono">{m.note}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Regular Season */}
        <div className="rounded-2xl border border-border bg-card p-4 space-y-2.5">
          <div className="flex items-center justify-between border-b border-border/40 pb-2">
            <span className="font-display text-sm tracking-wide text-primary uppercase font-bold">
              2. REGULAR SEASON CAMPAIGN
            </span>
            <span className="rounded bg-primary/20 px-2 py-0.5 text-[10px] font-bold text-primary">
              {outlook.regularSeason.standing}
            </span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {outlook.regularSeason.focus[lang]}
          </p>
          <div className="pt-1 space-y-1">
            <span className="text-[10px] uppercase font-bold text-muted-foreground block">
              Key Matchups:
            </span>
            {outlook.regularSeason.keyMatchups.map((km, i) => (
              <div key={i} className="text-[11px] flex justify-between text-foreground">
                <span className="font-semibold">{km.opponent}</span>
                <span className="text-muted-foreground font-mono">{km.date}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Playoffs */}
        <div className="rounded-2xl border border-border bg-card p-4 space-y-2.5">
          <div className="flex items-center justify-between border-b border-border/40 pb-2">
            <span className="font-display text-sm tracking-wide text-accent uppercase font-bold">
              3. PLAYOFFS & CHAMPIONSHIP
            </span>
            <span className="rounded bg-accent/20 px-2 py-0.5 text-[10px] font-bold text-accent">
              {outlook.playoffs.dates}
            </span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {outlook.playoffs.path[lang]}
          </p>
          <div className="rounded-xl bg-secondary/50 p-2.5 text-[11px] text-muted-foreground">
            <strong>Clinch Scenario:</strong> {outlook.playoffs.clinchScenario[lang]}
          </div>
        </div>

        {/* Offseason */}
        <div className="rounded-2xl border border-border bg-card p-4 space-y-2.5">
          <div className="flex items-center justify-between border-b border-border/40 pb-2">
            <span className="font-display text-sm tracking-wide text-muted-foreground uppercase font-bold">
              4. OFFSEASON & ROSTER BUILDING
            </span>
            <span className="rounded bg-secondary px-2 py-0.5 text-[10px] font-bold text-muted-foreground">
              {outlook.offseason.dates}
            </span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Cap Status: <strong className="text-foreground">{outlook.offseason.capOrBudget}</strong>
          </p>
          <div className="pt-1 space-y-1">
            <span className="text-[10px] uppercase font-bold text-muted-foreground block">
              Top Priorities:
            </span>
            {outlook.offseason.topPriorities.map((p, i) => (
              <div key={i} className="text-[11px] text-muted-foreground">
                • {p[lang]}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ExploreTab({
  lang,
  favs,
  toggleFav,
  onSelectTeam,
}: {
  lang: Lang;
  favs: string[];
  toggleFav: (id: string) => void;
  onSelectTeam: (id: string) => void;
}) {
  const [q, setQ] = useState("");

  const results = useMemo(() => {
    if (!q.trim()) return TEAMS;
    const l = q.toLowerCase();
    return TEAMS.filter(
      (t) =>
        t.name.toLowerCase().includes(l) ||
        (t.th && t.th.includes(l)) ||
        t.league.toLowerCase().includes(l) ||
        t.sport.toLowerCase().includes(l)
    );
  }, [q]);

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search any team or sport… (EN / ภาษาไทย)"
          className="w-full rounded-2xl border border-border bg-card/80 py-2.5 pl-10 pr-4 text-xs font-semibold placeholder:text-muted-foreground focus:border-primary focus:outline-none"
        />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
        {results.map((team) => {
          const isFav = favs.includes(team.id);

          return (
            <div
              key={team.id}
              className="flex items-center justify-between rounded-2xl border border-border bg-card p-3.5 transition hover:border-primary/50"
            >
              <div
                onClick={() => onSelectTeam(team.id)}
                className="flex items-center gap-3 cursor-pointer min-w-0"
              >
                <Seal t={team} size={36} />
                <div className="min-w-0">
                  <h4 className="font-bold text-xs truncate">
                    {lang === "th" ? team.th || team.name : team.name}
                  </h4>
                  <p className="text-[11px] text-muted-foreground">
                    {team.league} • {team.sport}
                  </p>
                </div>
              </div>

              <button
                onClick={() => toggleFav(team.id)}
                className={`p-1.5 transition cursor-pointer ${
                  isFav ? "text-yellow-400" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Star className={`h-4 w-4 ${isFav ? "fill-yellow-400" : ""}`} />
              </button>
            </div>
          );
        })}
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
    <div className="space-y-4">
      <div>
        <h2 className="font-display text-xl tracking-wide flex items-center gap-2">
          <Trophy className="h-5 w-5 text-primary" />
          GLOBAL SPORTS LEAGUES (14 CONNECTED ENDPOINTS)
        </h2>
        <p className="text-xs text-muted-foreground">
          Live scoreboards across NFL, NBA, MLB, NHL, MLS, Thai League 1, Premier League, WNBA, and PWHL.
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
                <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition" />
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
  lang,
  preds,
  setPreds,
}: {
  games: Game[];
  lang: Lang;
  preds: Record<string, string>;
  setPreds: (p: Record<string, string>) => void;
}) {
  const predictionCount = Object.keys(preds).length;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border bg-card/80 p-5 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-2xl font-bold flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-accent" />
              PREDICTION LEADERBOARD & MINI-GAME
            </h2>
            <p className="text-xs text-muted-foreground">
              Predict winners across upcoming matchups. Earn +10 points for each correct pick.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-secondary/80 px-4 py-2 text-center">
              <span className="text-[10px] text-muted-foreground uppercase font-bold block">
                TOTAL SCORE
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
