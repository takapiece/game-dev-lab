// Data-driven Player Roster & Attribute Definitions

export const ROSTER_PLAYERS = [
  {
    id: 'mamba_24',
    name: 'Kobe "Mamba"',
    number: '24',
    team: 'Lakers Gold',
    jerseyColor: 0xfdb927,
    trimColor: 0x552583,
    skinTone: 0x7c4922,
    rarity: 'gold',
    stats: {
      threePt: 92,   // Shot meter green sweetspot width & arc consistency
      speed: 88,     // Base movement & sprint speed
      defense: 86,   // Contest resistance & on-ball defensive lock
    },
    role: 'オールラウンド・エース',
    desc: '内外どこからでも決められる精密なシュート力と高水準のスピードを併せ持つ伝説のエース。',
  },
  {
    id: 'king_23',
    name: 'LeBron "King"',
    number: '23',
    team: 'Lakers Purple',
    jerseyColor: 0x552583,
    trimColor: 0xfdb927,
    skinTone: 0x683d1c,
    rarity: 'gold',
    stats: {
      threePt: 80,
      speed: 94,
      defense: 92,
    },
    role: 'パワー・スラッシャー',
    desc: '圧倒的な突進スピードとフィジカルでゴール下へ切り込む万能ポイントフォワード。',
  },
  {
    id: 'chef_30',
    name: 'Steph "Chef"',
    number: '30',
    team: 'Warriors Royal',
    jerseyColor: 0x1d428a,
    trimColor: 0xffc72c,
    skinTone: 0x9b673c,
    rarity: 'diamond',
    stats: {
      threePt: 99,
      speed: 87,
      defense: 72,
    },
    role: '超長距離スナイパー',
    desc: '広大なグリーンリリースゾーンを持つ歴代最高シューター。ディープスリーもお手の物。',
  },
  {
    id: 'worm_91',
    name: 'Dennis "Worm"',
    number: '91',
    team: 'Bulls Crimson',
    jerseyColor: 0xba131a,
    trimColor: 0x111111,
    skinTone: 0x5a3317,
    rarity: 'silver',
    stats: {
      threePt: 55,
      speed: 89,
      defense: 98,
    },
    role: '鉄壁ディフェンス職人',
    desc: '相手のエースを完全に封じ込める超高強度コンテストと神出鬼没のスティール能力。',
  },
];

export const OPPONENT_TEAMS = [
  {
    name: 'Chicago Bulls Duo',
    defender1: {
      name: 'Jordan #23',
      number: '23',
      jerseyColor: 0xba131a,
      trimColor: 0x111111,
      stats: { speed: 94, defense: 95 },
    },
    defender2: {
      name: 'Pippen #33',
      number: '33',
      jerseyColor: 0xba131a,
      trimColor: 0xffffff,
      stats: { speed: 92, defense: 94 },
    },
  },
];
