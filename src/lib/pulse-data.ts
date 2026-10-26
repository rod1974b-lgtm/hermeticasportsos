import { Team, Lang, TEAMS, teamById } from "@/lib/sports-data";

export type PulseTrend = "surging" | "steady" | "cooling" | "critical";

export interface CatalystItem {
  type: "win_streak" | "championship" | "injury" | "draft" | "offseason" | "signing";
  headline: { en: string; th: string };
  date: string;
}

export interface YearRoundPulse {
  teamId: string;
  pulseScore: number; // 0 to 100
  trend: PulseTrend;
  phase: {
    en: string;
    th: string;
  };
  narrative: {
    en: string;
    th: string;
  };
  catalysts: CatalystItem[];
  focusPill: {
    en: string;
    th: string;
  };
  lastUpdated: string;
}

export const YEAR_ROUND_PULSE: Record<string, YearRoundPulse> = {
  vik: {
    teamId: "vik",
    pulseScore: 94,
    trend: "surging",
    phase: {
      en: "Regular Season • Undefeated Bye Week (5-0)",
      th: "ฤดูกาลปกติ • สัปดาห์พักแข่ง ไร้พ่าย 5-0",
    },
    narrative: {
      en: "The Minnesota Vikings enter their Week 6 bye standing as one of the NFL's premier defensive and tactical juggernauts at an unblemished 5-0. Brian Flores' defense leads the entire league in takeaways, disguised coverage packages, and pressure rate, utterly suffocating opposing franchise quarterbacks. Meanwhile, Kevin O'Connell's offensive schematics have transformed Sam Darnold into an MVP-contending orchestrator with Justin Jefferson and Jordan Addison commanding the perimeter. With Aaron Jones spearheading balance in the backfield, Minnesota has transformed from an offseason question mark into the consensus betting darling to claim the NFC North crown.",
      th: "มินนิโซตา ไวกิงส์ เข้าสู่สัปดาห์พักการแข่งขันวีก 6 ในฐานะหนึ่งในทีมที่ร้อนแรงที่สุดในเอ็นเอฟแอลด้วยสถิติ 5-0 ไร้พ่าย ภายใต้การวางหมากเกมรับของ ไบรอัน ฟลอเรส ที่นำสถิติการแย่งบอลและกดดันควอเตอร์แบ็กคู่แข่งจนขึ้นแท่นเกมรับเบอร์หนึ่ง ขณะที่ เควิน โอคอนเนลล์ ปรับจูนแท็กติกจน แซม ดาร์โนลด์ ก้าวสู่ฟอร์มระดับแถวหน้า ประสานงานกับ จัสติน เจฟเฟอร์สัน ได้อย่างเฉียบขาด ส่งผลให้กระแสความเชื่อมั่นของแฟนบอลพุ่งทะยานสู่ระดับสูงสุดในการลุ้นแชมป์สาย NFC North",
    },
    catalysts: [
      {
        type: "win_streak",
        headline: {
          en: "5-0 start before the London bye week",
          th: "เปิดตัวสวยหรู 5 นัดรวดก่อนสัปดาห์พักแข่งลอนดอนเกมส์",
        },
        date: "Oct 2026",
      },
      {
        type: "signing",
        headline: {
          en: "Flores defense ranked #1 in EPA per drive",
          th: "ระบบเกมรับของฟลอเรสครองอันดับ 1 ของลีกในค่าความคุ้มค่าเกมรับ",
        },
        date: "Oct 2026",
      },
    ],
    focusPill: {
      en: "Super Bowl Contender",
      th: "ผู้ท้าชิงซูเปอร์โบวล์",
    },
    lastUpdated: "2026-10-26T08:00:00Z",
  },
  wolves: {
    teamId: "wolves",
    pulseScore: 91,
    trend: "surging",
    phase: {
      en: "Regular Season • Western Title Hunt",
      th: "ฤดูกาลปกติ • ล่าแชมป์สายตะวันตก",
    },
    narrative: {
      en: "Anthony Edwards has firmly established himself as a certified global megastar, elevating his offensive efficiency and late-game shot creation while commanding the Timberwolves into the upper echelon of the Western Conference. Defensively, Rudy Gobert and Jaden McDaniels continue to form an impenetrable twin-tower lockdown core that strangles transition offenses. The Target Center faithful are treated to title-caliber basketball every night, with depth from Naz Reid and Julius Randle providing secondary scoring punches that make Minnesota a lethal matchup over a seven-game postseason marathon.",
      th: "แอนโธนี เอ็ดเวิร์ดส์ ยกระดับตนเองสู่ซูเปอร์สตาร์ระดับโลกอย่างเต็มตัว ด้วยทักษะการทำแต้มช่วงท้ายเกมและการเล่นเพลย์เมกเกอร์ที่เฉียบคม พา มินนิโซตา ทิมเบอร์วูล์ฟส์ ยืนหยัดบนหัวตารางสายตะวันตกอย่างแข็งแกร่ง ประสานกับเกมรับระดับเพชฌฆาตของ รูดี โกแบร์ต และ เจเดน แม็กแดเนียลส์ ที่หยุดยั้งคู่แข่งได้อย่างเบ็ดเสร็จ อีกทั้งการสนับสนุนจาก แนซ รีด และ จูเลียส แรนเดิล ทำให้ทัพหมาป่ากลายเป็นเต็งหามในการชิงแชมป์ NBA อย่างแท้จริง",
    },
    catalysts: [
      {
        type: "win_streak",
        headline: {
          en: "Dominant 118-112 conquest at home",
          th: "เปิดบ้านคว้าชัยเหนือแอลเอ 118-112 ด้วยฟอร์มสุดแกร่ง",
        },
        date: "Oct 2026",
      },
    ],
    focusPill: {
      en: "Western Conference Finals Favorite",
      th: "เต็งแชมป์สายตะวันตก",
    },
    lastUpdated: "2026-10-26T08:00:00Z",
  },
  wild: {
    teamId: "wild",
    pulseScore: 84,
    trend: "steady",
    phase: {
      en: "NHL Regular Season • Central Division Push",
      th: "ฤดูกาลปกติ NHL • ไล่ล่าพื้นที่เพลย์ออฟดิวิชันกลาง",
    },
    narrative: {
      en: "Kirill Kaprizov and Matt Boldy continue to anchor the Wild's elite offensive engine at Xcel Energy Center. With Jesper Wallstedt and Filip Gustavsson providing steady goaltending, the Wild are poised to make significant noise in the Central Division playoff chase as the heavy dead-cap burdens officially begin to recede.",
      th: "คิริล คาปริซอฟ และ แมตต์ โบลดี ยังคงเป็นหัวใจสำคัญในเกมรุกของ มินนิโซตา ไวลด์ ณ สังเวียน เอ็กเซล เอนเนอร์จี เซ็นเตอร์ โดยมีผู้รักษาประตูฟอร์มหนึบช่วยเสริมความมั่นใจ ทำให้ทีมพร้อมเต็มสูบในการลุยศึกเพลย์ออฟดิวิชันกลาง",
    },
    catalysts: [
      {
        type: "win_streak",
        headline: {
          en: "Kaprizov multipoint surge opens home stand",
          th: "คาปริซอฟระเบิดฟอร์มกดหลายแต้มในเกมเหย้าเปิดหัวฤดูกาล",
        },
        date: "Oct 2026",
      },
    ],
    focusPill: {
      en: "Stanley Cup Playoff Contender",
      th: "ลุ้นตั๋วสแตนลีย์คัพ",
    },
    lastUpdated: "2026-10-26T08:00:00Z",
  },
  frost: {
    teamId: "frost",
    pulseScore: 96,
    trend: "surging",
    phase: {
      en: "PWHL Champions • Three-Peat Campaign",
      th: "แชมป์ PWHL • ภารกิจป้องกันแชมป์ 3 สมัยซ้อน",
    },
    narrative: {
      en: "The Minnesota Frost sit atop the women's hockey world as back-to-back Walter Cup Champions, now setting their sights on an unprecedented three-peat. Taylor Heise and Kendall Coyne Schofield headline a roster steeped in championship pedigree and tactical execution.",
      th: "มินนิโซตา ฟรอสต์ ยืนหนึ่งในวงการฮอกกี้น้ำแข็งหญิงโลกหลังครองถ้วย วอลเตอร์ คัพ สองปีซ้อน พร้อมเดินหน้าล่าแชมป์สมัยที่สาม นำโดย เทย์เลอร์ ไฮซี และ เคนดัลล์ คอยน์ สโคฟิลด์ ในการสร้างประวัติศาสตร์หน้าใหม่",
    },
    catalysts: [
      {
        type: "championship",
        headline: {
          en: "Back-to-back Walter Cup Champions",
          th: "ป้องกันแชมป์ถ้วยวอลเตอร์คัพสองสมัยติดต่อกัน",
        },
        date: "2026",
      },
    ],
    focusPill: {
      en: "Dynasty in the Making",
      th: "สร้างประวัติศาสตร์ราชวงศ์น้ำแข็ง",
    },
    lastUpdated: "2026-10-26T08:00:00Z",
  },
  lynx: {
    teamId: "lynx",
    pulseScore: 89,
    trend: "steady",
    phase: {
      en: "WNBA Contenders • Elite Core Retention",
      th: "ผู้ท้าชิง WNBA • รักษาขุมกำลังตัวหลักชั้นยอด",
    },
    narrative: {
      en: "Napheesa Collier and Cheryl Reeve's tactical mastery drove the Lynx to a dominant 32-10 regular season record and the top seed in the WNBA. With Courtney Williams and Alanna Smith locking down the court, the Target Center remains an impenetrable fortress.",
      th: "นาฟีซา คอลเลียร์ ร่วมกับแท็กติกของโค้ช เชอริล รีฟ นำ ลินซ์ ทำสถิติหรู 32-10 คว้าอันดับ 1 ของลีก พร้อมขุมกำลังที่เหนียวแน่นและพร้อมสู้เพื่อโทรฟีแชมป์ WNBA ทุกฤดูกาล",
    },
    catalysts: [
      {
        type: "win_streak",
        headline: {
          en: "32-10 regular season #1 seed finish",
          th: "คว้าสถิติ 32-10 จบอันดับ 1 ในฤดูกาลปกติ",
        },
        date: "2026",
      },
    ],
    focusPill: {
      en: "Championship Caliber",
      th: "ทีมระดับลุ้นแชมป์",
    },
    lastUpdated: "2026-10-26T08:00:00Z",
  },
  rbfc: {
    teamId: "rbfc",
    pulseScore: 86,
    trend: "surging",
    phase: {
      en: "Thai League 1 • Dragon Solar Park Fortress",
      th: "ไทยลีก 1 • ดราก้อน โซลาร์ พาร์ค ป้อมปราการไร้พ่าย",
    },
    narrative: {
      en: "Ratchaburi FC continues to electrify Dragon Solar Park with high-intensity pressing and swift attacking football. With partisan home support and tactical resilience against perennial giants like Buriram United and Bangkok United, the Dragons are a fixture in the Thai League title race.",
      th: "ราชบุรี เอฟซี สานต่อความร้อนแรง ณ ดราก้อน โซลาร์ พาร์ค ด้วยสไตล์การเพรสซิ่งดุดันและเกมรุกที่เฉียบขาด ท่ามกลางเสียงเชียร์กึกก้องของแฟนบอลราชันมังกร พร้อมท้าชนยักษ์ใหญ่อย่าง บุรีรัมย์ และ ทรู แบงค็อก อย่างสมศักดิ์ศรี",
    },
    catalysts: [
      {
        type: "win_streak",
        headline: {
          en: "Top-flight clash with Buriram United at Dragon Solar Park",
          th: "ศึกบิ๊กแมตช์ไทยลีกเปิดบ้านรับมือบุรีรัมย์ ยูไนเต็ด",
        },
        date: "Oct 2026",
      },
    ],
    focusPill: {
      en: "Thai League 1 Title Race",
      th: "ลุ้นบัลลังก์แชมป์ไทยลีก",
    },
    lastUpdated: "2026-10-26T08:00:00Z",
  },
  twins: {
    teamId: "twins",
    pulseScore: 72,
    trend: "cooling",
    phase: {
      en: "MLB Offseason • Hot Stove Roster Reset",
      th: "MLB ช่วงปิดฤดูกาล • ตลาดซื้อขายและปรับทัพผู้เล่น",
    },
    narrative: {
      en: "The Minnesota Twins transition into offseason roster construction following a hard-fought AL Central race. Front office focus centers on pitching depth alongside core hitters Royce Lewis, Matt Wallner, and emerging prospects ready for Target Field spring training.",
      th: "มินนิโซตา ทวินส์ ก้าวเข้าสู่ช่วงปิดฤดูกาลเพื่อเสริมทัพและปรับโครงสร้างทีม โดยโฟกัสที่การเติมความลึกของตำแหน่งพิตเชอร์ ควบคู่ไปกับตัวตีแกนหลักอย่าง รอยซ์ ลูอิส และ แมตต์ วอลเนอร์ เพื่อเตรียมพร้อมสำหรับสปริงเทรนนิ่ง",
    },
    catalysts: [
      {
        type: "offseason",
        headline: {
          en: "Target Field offseason player arbitration & pitching targets",
          th: "การเจรจาสัญญานักกีฬาและการเล็งเป้าหมายพิตเชอร์ช่วงปิดฤดูกาล",
        },
        date: "Oct 2026",
      },
    ],
    focusPill: {
      en: "AL Central Roster Rebuild",
      th: "ปรับทัพท้าชิง AL Central",
    },
    lastUpdated: "2026-10-26T08:00:00Z",
  },
  mnufc: {
    teamId: "mnufc",
    pulseScore: 81,
    trend: "steady",
    phase: {
      en: "MLS Cup Playoffs • Allianz Field Nights",
      th: "เพลย์ออฟ MLS คัพ • ค่ำคืนสุดมันส์ ณ อัลลิอันซ์ ฟิลด์",
    },
    narrative: {
      en: "Minnesota United FC brings high-octane transitional soccer into the MLS Cup Playoffs at Allianz Field. Under strategic tactical direction, the Loons lean on disciplined counterattacks, Robin Lod's orchestration, and an energized Wonderwall crowd to advance.",
      th: "มินนิโซตา ยูไนเต็ด เอฟซี เปิดบ้าน อัลลิอันซ์ ฟิลด์ ลุยศึกเพลย์ออฟ MLS คัพ ด้วยระบบการเล่นที่รัดกุมและเกมสวนกลับที่เฉียบขาด โดยมี โรบิน ล็อด บัญชาการเกมรุก พร้อมแรงหนุนหลังมหาศาลจากแฟนคลับเดอะวันเดอร์วอลล์",
    },
    catalysts: [
      {
        type: "win_streak",
        headline: {
          en: "Allianz Field playoff berth secured",
          th: "การันตีตั๋วเพลย์ออฟในบ้านอัลลิอันซ์ฟิลด์สำเร็จ",
        },
        date: "Oct 2026",
      },
    ],
    focusPill: {
      en: "MLS Cup Contender",
      th: "ลุ้นแชมป์ MLS Cup",
    },
    lastUpdated: "2026-10-26T08:00:00Z",
  },
};

/**
 * Retrieves the year-round pulse for any team, dynamically generating a 365-day model
 * if the team is an external global club.
 */
export function getYearRoundPulse(team: Team): YearRoundPulse {
  const existing = YEAR_ROUND_PULSE[team.id];
  if (existing) {
    return existing;
  }

  // Fallback calculation for global favorited teams
  const sentimentScore = team.sentiment
    ? team.sentiment.label === "Loved"
      ? 80 + Math.round(team.sentiment.pct * 0.15)
      : team.sentiment.label === "Hyped"
      ? 75 + Math.round(team.sentiment.pct * 0.15)
      : 65 + Math.round(team.sentiment.pct * 0.1)
    : 70;

  const trend: PulseTrend =
    sentimentScore >= 85 ? "surging" : sentimentScore >= 75 ? "steady" : "cooling";

  return {
    teamId: team.id,
    pulseScore: sentimentScore,
    trend,
    phase: {
      en: `${team.league} Active Season Track`,
      th: `ติดตามฤดูกาลแข่งขัน ${team.league}`,
    },
    narrative: {
      en: `${team.name} continues its competitive campaign in the ${team.league}. The roster remains focused on tactical consistency, player fitness, and achieving prime postseason seeding. Fan sentiment remains steady as the club navigates their upcoming fixture schedule with high expectations.`,
      th: `${team.th || team.name} ยังคงเดินหน้าแข่งขันอย่างต่อเนื่องในลีก ${team.league} ขุมกำลังเน้นความสม่ำเสมอในแท็กติกและความฟิตของนักกีฬาเพื่อเป้าหมายในการจบอันดับหัวตาราง เสียงเชียร์และกระแสแฟนบอลยังคงเหนียวแน่นในทุกแมตช์การแข่งขัน`,
    },
    catalysts: [
      {
        type: "win_streak",
        headline: {
          en: `Competitive form in ${team.league}`,
          th: `ฟอร์มการแข่งขันต่อเนื่องใน ${team.league}`,
        },
        date: "2026",
      },
    ],
    focusPill: {
      en: "Active Competitor",
      th: "สู้ศึกต่อเนื่อง",
    },
    lastUpdated: new Date().toISOString(),
  };
}

/**
 * Returns year-round pulses sorted strictly from highest score to lowest score (100 -> 0).
 */
export function getSortedYearRoundPulse(
  favIds: string[],
  activeHub: "all" | "ratchaburi" | "minnesota"
): YearRoundPulse[] {
  let teamsToConsider: Team[] = [];

  if (activeHub === "minnesota") {
    teamsToConsider = TEAMS.filter((t) => t.hub === "minnesota");
  } else if (activeHub === "ratchaburi") {
    teamsToConsider = TEAMS.filter((t) => t.hub === "ratchaburi");
  } else {
    const defaultIds = ["vik", "wolves", "frost", "lynx", "rbfc", "wild", "mnufc", "twins"];
    const combinedIds = Array.from(new Set([...favIds, ...defaultIds]));
    teamsToConsider = combinedIds.map((id) => teamById(id));
  }

  const pulses = teamsToConsider.map((t) => getYearRoundPulse(t));

  return pulses.sort((a, b) => b.pulseScore - a.pulseScore);
}
