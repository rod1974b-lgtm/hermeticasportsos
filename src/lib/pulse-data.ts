import { Team, Lang, TEAMS, teamById } from "@/lib/sports-data";

export type PulseTrend = "surging" | "steady" | "cooling";
export type SeasonPhase = "regular" | "playoffs" | "champions" | "offseason" | "bye";

export interface YearRoundPulse {
  teamId: string;
  name: string;
  league: string;
  score: number; // 0-100 Auto-ranked
  trend: PulseTrend;
  phase: SeasonPhase;
  phaseBadge: { en: string; th: string };
  metric: { en: string; th: string };
  summary: { en: string; th: string };
  catalysts: Array<{ label: { en: string; th: string }; value: { en: string; th: string } }>;
}

export const YEAR_ROUND_PULSE: Record<string, YearRoundPulse> = {
  lynx: {
    teamId: "lynx",
    name: "Minnesota Lynx",
    league: "WNBA",
    score: 94,
    trend: "surging",
    phase: "playoffs",
    phaseBadge: {
      en: "Postseason Chase • #1 Seed",
      th: "ลุ้นแชมป์เพลย์ออฟ • เต็ง 1",
    },
    metric: {
      en: "32-10 Record • Top Defensive Rating • +8.4 Net Margin",
      th: "สถิติ 32-10 • ทีมรับอันดับหนึ่ง • ผลต่างแต้ม +8.4",
    },
    summary: {
      en: "Coming off a dominant 32-10 regular season and pushing for top-seed supremacy, the Lynx are operating at peak efficiency under head coach Cheryl Reeve. Their defensive communication and perimeter spacing have set the league standard, generating elite turnover-to-fastbreak conversion rates. With veteran leadership commanding late-game execution and the Target Center crowd rallying behind their title chase, the locker room pulse is running on pure championship conviction.",
      th: "หลังจากจบฤดูกาลปกติอันยอดเยี่ยมด้วยสถิติ 32-10 และกำลังขับเคี่ยวแย่งชิงมือวางอันดับ 1 ของลีก มินนิโซตา ลิงซ์ ภายใต้การคุมทัพของโค้ช เชอริล รีฟ กำลังเล่นด้วยฟอร์มที่สมบูรณ์แบบ ทั้งระบบเกมรับที่เหนียวแน่นและการโจมตีวงนอกที่แม่นยำ ด้วยความเก๋าของแกนหลักและความฮึกเหิมของแฟนคลับในทาร์เก็ต เซ็นเตอร์ ส่งผลให้ชีพจรความมั่นใจในห้องแต่งตัวพุ่งแตะระดับลุ้นแชมป์สูงสุด",
    },
    catalysts: [
      {
        label: { en: "Head Coach Focus", th: "การคุมทีม" },
        value: { en: "Cheryl Reeve playoff rotation discipline", th: "การจัดตัวผู้เล่นช่วงเพลย์ออฟที่รัดกุม" },
      },
      {
        label: { en: "Core Strength", th: "จุดแข็งหลัก" },
        value: { en: "Perimeter lockdown & fastbreak points", th: "การปิดพื้นที่วงนอกและการเปลี่ยนจังหวะทำแต้มเร็ว" },
      },
      {
        label: { en: "Immediate Milestone", th: "เป้าหมายเร่งด่วน" },
        value: { en: "Lock down Finals home-court advantage", th: "การันตีสิทธิ์เล่นในบ้านตลอดรอบชิงชนะเลิศ" },
      },
    ],
  },

  vik: {
    teamId: "vik",
    name: "Minnesota Vikings",
    league: "NFL",
    score: 92,
    trend: "surging",
    phase: "regular",
    phaseBadge: {
      en: "Regular Season • NFC North Contender",
      th: "ฤดูกาลปกติ • ผู้ท้าชิงสาย NFC North",
    },
    metric: {
      en: "Top-3 Scoring Defense • League-Leading Pressure Rate",
      th: "ทีมรับเสียแต้มน้อยท็อป 3 • สถิติกดดันควอเตอร์แบ็กอันดับ 1",
    },
    summary: {
      en: "Under defensive coordinator Brian Flores, Minnesota's defense has developed into a relentless turnover engine, throwing complex disguise packages at opposing quarterbacks and dictating field position. The offense has paired efficient situational red-zone play with Justin Jefferson's gravitational pull on secondaries to close out one-possession battles. Approaching high-stakes divisional clashes, the organization is carrying true postseason urgency and intense fan backing at U.S. Bank Stadium.",
      th: "ภายใต้แผนการเล่นอันดุดันของ ไบรอัน ฟลอเรส ทีมรับของมินนิโซตา ไวกิ้งส์ ได้กลายเป็นเครื่องจักรแย่งเทิร์นโอเวอร์ชั้นยอดที่สร้างแรงกดดันใส่ควอเตอร์แบ็กคู่แข่งได้อย่างต่อเนื่อง ขณะที่เกมบุกสามารถประคองจังหวะเรดโซนได้อย่างเฉียบคมโดยมี จัสติน เจฟเฟอร์สัน เป็นหัวใจหลัก เมื่อเข้าสู่ช่วงโปรแกรมสำคัญในดิวิชั่น บรรยากาศของทีมและแรงใจจากแฟนบอลยูเอส แบงก์ สเตเดียม จึงเต็มไปด้วยความมุ่งมั่นสู่รอบเพลย์ออฟ",
    },
    catalysts: [
      {
        label: { en: "Defensive Catalyst", th: "หัวใจเกมรับ" },
        value: { en: "Brian Flores exotic blitz and disguise packages", th: "การหลอกทางบุกและบลิตซ์อันซับซ้อนของฟลอเรส" },
      },
      {
        label: { en: "Offensive Engine", th: "หัวใจเกมบุก" },
        value: { en: "Justin Jefferson coverage manipulation", th: "การดึงตัวประกบคู่แข่งของ จัสติน เจฟเฟอร์สัน" },
      },
      {
        label: { en: "Next Hurdle", th: "ด่านถัดไป" },
        value: { en: "Crucial divisional battles for division lead", th: "ศึกตัดแต้มดิวิชันนัดสำคัญเพื่อยึดหัวตาราง" },
      },
    ],
  },

  frost: {
    teamId: "frost",
    name: "Minnesota Frost",
    league: "PWHL",
    score: 90,
    trend: "steady",
    phase: "champions",
    phaseBadge: {
      en: "Defending Champions • Walter Cup Dynasty",
      th: "แชมป์เก่า • เจ้าของถ้วยวอลเตอร์ คัพ",
    },
    metric: {
      en: "Back-to-Back Champions • 93.4% Penalty Kill",
      th: "แชมป์สองสมัยซ้อน • สถิติป้องกันพาวเวอร์เพลย์ 93.4%",
    },
    summary: {
      en: "The reigning back-to-back Walter Cup champions remain the gold standard of professional women's hockey, returning their shutdown defensive pairings and championship netminding core. Even during the transition into new seasonal training blocks, team cohesion remains exceptionally high as season-ticket demand hits new franchise milestones. The group enters the upcoming calendar year with the target on their back and unwavering poise.",
      th: "ในฐานะแชมป์วอลเตอร์ คัพ สองสมัยซ้อน มินนิโซตา ฟรอสต์ ยังคงเป็นมาตรฐานสูงสุดของวงการฮอกกี้น้ำแข็งหญิงอาชีพ ด้วยการรักษาแกนหลักแนวรับและผู้รักษาประตูชุดแชมป์ไว้ได้อย่างครบถ้วน แม้จะอยู่ในช่วงเตรียมความพร้อมของโปรแกรมใหม่ แต่ความผูกพันในทีมและกระแสตอบรับจากแฟนคลับยังคงร้อนแรงต่อเนื่อง พร้อมลงป้องกันตำแหน่งด้วยความนิ่งและประสบการณ์ระดับแชมเปียน",
    },
    catalysts: [
      {
        label: { en: "Title Defense", th: "การป้องกันแชมป์" },
        value: { en: "Intact blue-line & proven playoff netminding", th: "แผงแนวรับและผู้รักษาประตูชุดแชมป์ที่ครบเครื่อง" },
      },
      {
        label: { en: "Fan Atmosphere", th: "บรรยากาศแฟนคลับ" },
        value: { en: "Xcel Energy Center record season ticket base", th: "ยอดจองตั๋วฤดูกาลถล่มทลายที่เอ็กเซล เอนเนอร์จี เซ็นเตอร์" },
      },
      {
        label: { en: "Goal", th: "เป้าหมายสูงสุด" },
        value: { en: "Historic three-peat championship run", th: "สร้างประวัติศาสตร์คว้าแชมป์สมัยที่ 3 ติดต่อกัน" },
      },
    ],
  },

  wolves: {
    teamId: "wolves",
    name: "Minnesota Timberwolves",
    league: "NBA",
    score: 86,
    trend: "surging",
    phase: "regular",
    phaseBadge: {
      en: "Regular Season • Western Contender",
      th: "ฤดูกาลปกติ • ทีมเต็งสายตะวันตก",
    },
    metric: {
      en: "Top-5 Defensive Net Rating • Edwards 28+ PPG",
      th: "เรตติ้งเกมรับท็อป 5 • เอ็ดเวิร์ดส์เฉลี่ย 28+ แต้ม",
    },
    summary: {
      en: "Built around Anthony Edwards' high-octane scoring and Rudy Gobert's interior rim deterrence, Minnesota is firmly cemented in the Western Conference contenders tier. Head coach Chris Finch has cultivated deeper bench wing production, allowing the squad to sustain defensive intensity across full 48-minute rotations. Target Center crowds are bringing playoff-tier energy, expecting nothing short of a deep Western Conference Finals run.",
      th: "ด้วยการนำของ แอนโธนี เอ็ดเวิร์ดส์ ที่ระเบิดฟอร์มทำแต้มรอบทิศทาง ผสานกับ รูดี้ โกแบร์ ที่คุมพื้นที่ใต้แป้นได้อย่างแข็งแกร่ง ทิมเบอร์วูล์ฟส์ ยืนหยัดอย่างมั่นคงในกลุ่มหัวตารางของสายตะวันตก การหมุนเวียนผู้เล่นสำรองที่ลงตัวช่วยรักษามาตรฐานเกมรับได้ตลอดทั้งเกม ส่งผลให้แฟนบาสเกตบอลในมินนิโซตามีความหวังเต็มเปี่ยมที่จะเห็นทีมทะลุเข้าสู่รอบชิงแชมป์สายอีกครั้ง",
    },
    catalysts: [
      {
        label: { en: "Franchise Star", th: "ผู้เล่นคนสำคัญ" },
        value: { en: "Anthony Edwards elite clutch shot-making", th: "การทำแต้มช่วงเวลาชี้ชะตาของ แอนโธนี เอ็ดเวิร์ดส์" },
      },
      {
        label: { en: "Defensive Anchor", th: "แกนหลักเกมรับ" },
        value: { en: "Rudy Gobert paint denial & rim protection", th: "การป้องกันพื้นที่ใต้แป้นของ รูดี้ โกแบร์" },
      },
      {
        label: { en: "Benchmark", th: "เป้าหมายทีม" },
        value: { en: "Secure home-court advantage in Round 1", th: "ยึดมือวางกลุ่มบนเพื่อความได้เปรียบในบ้านรอบแรก" },
      },
    ],
  },

  rbfc: {
    teamId: "rbfc",
    name: "Ratchaburi FC",
    league: "Thai League 1",
    score: 82,
    trend: "surging",
    phase: "regular",
    phaseBadge: {
      en: "Regular Season • Home Fortress",
      th: "ฤดูกาลปกติ • ป้อมปราการไร้พ่ายในบ้าน",
    },
    metric: {
      en: "Top-4 Table Pressure • 6 Home Match Unbeaten Run",
      th: "เกาะกลุ่มท็อป 4 • สถิติไร้พ่ายในบ้าน 6 นัดติด",
    },
    summary: {
      en: "Dragon Solar Park has transformed into an intimidating home fortress, where Ratchaburi FC's aggressive pressing and rapid vertical transitions have disrupted higher-budget opponents across Thai League 1. Tactical discipline in defensive transition has stabilized their clean sheet record, while energetic forward runs create constant chances. Local supporter sentiment is soaring with the Dragons actively challenging for continental qualification spots.",
      th: "ดราก้อน โซล่าร์ ปาร์ค กลายเป็นสังเวียนเหย้าที่ยากจะเจาะทะลวง โดย ราชบุรี เอฟซี ใช้สไตล์การไล่บีบพื้นที่สูงและการเปลี่ยนจังหวะสวนกลับเร็วได้อย่างมีประสิทธิภาพจนสามารถต่อกรกับทีมชั้นนำในไทยลีกได้อย่างสูสี วินัยในเกมรับที่ดีขึ้นช่วยเก็บคลีนชีตสำคัญต่อเนื่อง ขณะที่ศรัทธาของแฟนบอล 'ราชันมังกร' กำลังคึกคักอย่างยิ่งเมื่อทีมมีลุ้นขยับขึ้นไปเกาะกลุ่มหัวตารางเพื่อแย่งโควตาถ้วยเอเชีย",
    },
    catalysts: [
      {
        label: { en: "Home Advantage", th: "ความได้เปรียบในบ้าน" },
        value: { en: "Dragon Solar Park climate & passionate ultras", th: "ความคุ้นเคยสภาพอากาศดราก้อน โซล่าร์ ปาร์ค และเสียงเชียร์" },
      },
      {
        label: { en: "Tactical Identity", th: "แท็กติกการเล่น" },
        value: { en: "Compact pressing & rapid vertical counter-attacks", th: "การเพรสซิ่งแดนกลางและโจมตีฉับพลันในแนวลึก" },
      },
      {
        label: { en: "Season Objective", th: "เป้าหมายฤดูกาล" },
        value: { en: "Continental qualification (ACL Two berth)", th: "คว้าโควตาไปเล่นฟุตบอลสโมสรเอเชีย (ACL Two)" },
      },
    ],
  },

  wild: {
    teamId: "wild",
    name: "Minnesota Wild",
    league: "NHL",
    score: 78,
    trend: "steady",
    phase: "regular",
    phaseBadge: {
      en: "Regular Season • Central Division Fight",
      th: "ฤดูกาลปกติ • ศึกเดือดดิวิชันเซ็นทรัล",
    },
    metric: {
      en: "+0.45 Goal Differential • Top-10 Power Play %",
      th: "ผลต่างประตู +0.45 • เปอร์เซ็นต์พาวเวอร์เพลย์ท็อป 10",
    },
    summary: {
      en: "The Wild continue to lean heavily on the offensive firepower of Kirill Kaprizov and Matt Boldy, whose chemistry has made the team's primary power-play unit one of the division's sharpest weapons. While consistent goaltending has kept them within striking distance of a Central Division playoff seed, sustaining secondary scoring and staying disciplined on penalty kills remain the pivotal factors in stabilizing their seasonal pulse.",
      th: "มินนิโซตา ไวลด์ ยังคงพึ่งพาความสามารถเฉพาะตัวในการทำประตูของ คิริลล์ คาปริซอฟ และ แมตต์ โบลดี้ ซึ่งประสานงานกันได้อย่างลงตัวในจังหวะพาวเวอร์เพลย์ แม้ผลงานการป้องกันหน้าปากประตูจะช่วยให้ทีมเกาะกลุ่มลุ้นตั๋วเพลย์ออฟในดิวิชั่นเซ็นทรัลได้ แต่การยกระดับเกมรุกของแถวสองและการลดการเสียแต้มขณะเล่นช็อตแฮนด์ยังคงเป็นกุญแจสำคัญในการรักษาโมเมนตัมตลอดฤดูกาล",
    },
    catalysts: [
      {
        label: { en: "Offensive Duo", th: "คู่หูตัวความหวัง" },
        value: { en: "Kaprizov & Boldy driving 42% of goals", th: "คาปริซอฟ และ โบลดี้ มีส่วนร่วมกับประตูทีมถึง 42%" },
      },
      {
        label: { en: "Critical Need", th: "จุดที่ต้องปรับปรุง" },
        value: { en: "Secondary depth scoring on road trips", th: "การเติมแต้มของชุดรองยามต้องออกไปเล่นเกมเยือน" },
      },
      {
        label: { en: "Playoff Line", th: "เป้าหมายหลัก" },
        value: { en: "Clinch top-3 seed in grueling Central Division", th: "จบ 3 อันดับแรกในสายเซ็นทรัลสุดหิน" },
      },
    ],
  },

  mnufc: {
    teamId: "mnufc",
    name: "Minnesota United FC",
    league: "MLS",
    score: 74,
    trend: "steady",
    phase: "regular",
    phaseBadge: {
      en: "Playoff Push • Western Mid-Table",
      th: "ลุ้นตั๋วเพลย์ออฟ • กลางตารางสายตะวันตก",
    },
    metric: {
      en: "Solid Transition Shape • Allianz Field Resilience",
      th: "โครงสร้างเกมสวนกลับแน่น • ความเหนียวแน่นที่อัลลิอันซ์ ฟิลด์",
    },
    summary: {
      en: "Minnesota United FC has established a resilient defensive baseline at Allianz Field, frustrating opponents with a compact mid-block and disciplined counter-attacks. While transition finishing can fluctuate between matches, their organization on defensive set pieces has kept point totals steadily climbing toward Western Conference postseason qualification. The squad's pulse remains composed and workmanlike.",
      th: "มินนิโซตา ยูไนเต็ด เอฟซี วางรากฐานการเล่นที่เน้นความรัดกุมที่ อัลลิอันซ์ ฟิลด์ โดยใช้บล็อกเกมรับแดนกลางที่เหนียวแน่นและหาจังหวะสวนกลับเร็วเพื่อโจมตี แม้ความเฉียบคมในการจบสกอร์ยังต้องลุ้นในบางนัด แต่วินัยในการป้องกันลูกตั้งเตะช่วยให้ทีมเก็บแต้มสำคัญได้อย่างสม่ำเสมอในศึกแย่งชิงพื้นที่เพลย์ออฟสายตะวันตก",
    },
    catalysts: [
      {
        label: { en: "Home Base", th: "รังเหย้า" },
        value: { en: "Allianz Field disciplined defensive structure", th: "ระบบเกมรับที่เน้นวินัย ณ สนามอัลลิอันซ์ ฟิลด์" },
      },
      {
        label: { en: "Key Dynamic", th: "ปัจจัยชี้ขาด" },
        value: { en: "Set-piece conversion & transitional speed", th: "ความเด็ดขาดจากลูกตั้งเตะและการโต้กลับเร็ว" },
      },
      {
        label: { en: "Target", th: "เป้าหมาย" },
        value: { en: "Lock in Round 1 home-field playoff fixture", th: "การันตีสิทธิ์เล่นเกมเหย้าในรอบเพลย์ออฟรอบแรก" },
      },
    ],
  },

  twins: {
    teamId: "twins",
    name: "Minnesota Twins",
    league: "MLB",
    score: 58,
    trend: "cooling",
    phase: "offseason",
    phaseBadge: {
      en: "Offseason • Hot Stove & Rotation Rehab",
      th: "ช่วงพักฤดูกาล • ตลาดซื้อขายและฟื้นฟูผู้เล่น",
    },
    metric: {
      en: "Front Office Evaluation • Pitching Depth Assessment",
      th: "ประเมินงบประมาณบริหาร • เสริมความลึกตำแหน่งพิตเชอร์",
    },
    summary: {
      en: "Following a turbulent conclusion to their season, the Twins have pivoted full focus toward the winter offseason, emphasizing starting rotation stability, bullpen reinforcements, and health regimens for their core lineup. Front-office payroll parameters and roster decisions are under active scrutiny, leaving fan sentiment cautious as supporters await tangible upgrades before spring camp convenes in Florida.",
      th: "หลังจากปิดฉากฤดูกาลด้วยความท้าทาย มินนิโซตา ทวินส์ ได้เข้าสู่ช่วงพักฤดูกาลเพื่อประเมินโครงสร้างทีม โดยมุ่งเน้นการเสริมความลึกของตำแหน่งพิตเชอร์ตัวจริง การขันน็อตบูลเพน และการฟื้นฟูสภาพร่างกายของตัวตีแกนหลัก นโยบายการบริหารงบประมาณและตลาดซื้อขายกำลังถูกจับตามองอย่างใกล้ชิด ขณะที่แฟนเบสยังคงสงวนท่าทีและรอคอยการเสริมทัพที่เป็นรูปธรรมก่อนเข้าสู่แคมป์สปริงเทรนนิ่ง",
    },
    catalysts: [
      {
        label: { en: "Front Office Priority", th: "โจทย์ฝ่ายบริหาร" },
        value: { en: "Bullpen depth & payroll flexibility management", th: "การเสริมบูลเพนและการบริหารงบประมาณอย่างยืดหยุ่น" },
      },
      {
        label: { en: "Player Health", th: "สภาพร่างกายผู้เล่น" },
        value: { en: "Rehabilitation programs for key sluggers", th: "โปรแกรมฟื้นฟูกล้ามเนื้อของตัวตีตัวหลัก" },
      },
      {
        label: { en: "Next Milestone", th: "หมุดหมายถัดไป" },
        value: { en: "Fort Myers, Florida Spring Training report date", th: "วันรายงานตัวเข้าแคมป์สปริงเทรนนิ่งที่ฟลอริดา" },
      },
    ],
  },
};

/**
 * Retrieves the year-round pulse for any team, dynamically generating a 365-day model
 * if the team is an external global club.
 */
export function getYearRoundPulse(team: Team): YearRoundPulse {
  if (YEAR_ROUND_PULSE[team.id]) {
    return YEAR_ROUND_PULSE[team.id];
  }

  // Fallback calculation for global favorited teams
  const sentimentScore = team.sentiment
    ? team.sentiment.label === "Loved"
      ? 80 + Math.round(team.sentiment.pct * 0.15)
      : team.sentiment.label === "Hyped"
      ? 75 + Math.round(team.sentiment.pct * 0.15)
      : 55
    : 70;

  return {
    teamId: team.id,
    name: team.name,
    league: team.league,
    score: Math.min(99, Math.max(50, sentimentScore)),
    trend: sentimentScore >= 80 ? "surging" : sentimentScore >= 65 ? "steady" : "cooling",
    phase: "regular",
    phaseBadge: {
      en: `${team.league} • In-Season Radar`,
      th: `${team.league} • เรดาร์ประจำฤดูกาล`,
    },
    metric: {
      en: `${team.record || "Active"} • Tracked 24/7`,
      th: `${team.record || "กำลังแข่งขัน"} • ตรวจวัดตลอด 24 ชั่วโมง`,
    },
    summary: {
      en: `${team.name} maintains an active operational pulse across ${team.league}. The roster continues daily training and competition routines, backed by committed global supporters tracking their trajectory throughout the year.`,
      th: `${team.name} ยังคงรักษาความพร้อมอย่างต่อเนื่องในลีก ${team.league} ผู้เล่นในทีมฝึกซ้อมและลงแข่งขันตามโปรแกรมปกติ โดยมีแฟนคลับทั่วโลกคอยติดตามความเคลื่อนไหวตลอดทั้งปี`,
    },
    catalysts: [
      {
        label: { en: "League Presence", th: "สถานะในลีก" },
        value: { en: `Active competitor in ${team.league}`, th: `สโมสรหลักใน ${team.league}` },
      },
      {
        label: { en: "Tracking Status", th: "การตรวจวัด" },
        value: { en: "Full 365-day seasonal monitoring", th: "ระบบตรวจวัดความพร้อมตลอดทั้งปี" },
      },
    ],
  };
}

/**
 * Returns teams sorted strictly by Pulse Score (High -> Low: 100 down to 0)
 */
export function getSortedYearRoundPulse(
  filterHub: "all" | "minnesota" | "ratchaburi" | "favs",
  favs: string[]
): YearRoundPulse[] {
  let list: Team[] = [];

  if (filterHub === "minnesota") {
    list = TEAMS.filter((t) => t.hub === "minnesota");
  } else if (filterHub === "ratchaburi") {
    const rb = teamById("rbfc");
    list = rb ? [rb] : [];
  } else if (filterHub === "favs") {
    list = TEAMS.filter((t) => favs.includes(t.id));
    if (list.length === 0) {
      list = TEAMS.filter((t) => t.hub === "minnesota" || t.id === "rbfc");
    }
  } else {
    // All Hub Teams
    const core = ["lynx", "vik", "frost", "wolves", "rbfc", "wild", "mnufc", "twins"];
    list = core.map((id) => teamById(id)).filter(Boolean) as Team[];
  }

  const pulseList = list.map((t) => getYearRoundPulse(t));
  return pulseList.sort((a, b) => b.score - a.score);
}
