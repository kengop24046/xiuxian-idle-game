export const REALM_CONFIG = [
  { id: 1, name: '炼气境', maxLevel: 10, baseExp: 100, baseKillNeed: 10, attributePoint: 1, bigRealmPoint: 10 },
  { id: 2, name: '筑基境', maxLevel: 10, baseExp: 500, baseKillNeed: 30, attributePoint: 1, bigRealmPoint: 10 },
  { id: 3, name: '金丹境', maxLevel: 10, baseExp: 2000, baseKillNeed: 80, attributePoint: 1, bigRealmPoint: 10 },
  { id: 4, name: '元婴境', maxLevel: 10, baseExp: 8000, baseKillNeed: 200, attributePoint: 1, bigRealmPoint: 10 },
  { id: 5, name: '化神境', maxLevel: 10, baseExp: 30000, baseKillNeed: 400, attributePoint: 1, bigRealmPoint: 10 },
  { id: 6, name: '炼虚境', maxLevel: 10, baseExp: 120000, baseKillNeed: 800, attributePoint: 1, bigRealmPoint: 10 },
  { id: 7, name: '合体境', maxLevel: 10, baseExp: 500000, baseKillNeed: 1500, attributePoint: 1, bigRealmPoint: 10 },
  { id: 8, name: '大乘境', maxLevel: 10, baseExp: 2000000, baseKillNeed: 3000, attributePoint: 1, bigRealmPoint: 10 },
  { id: 9, name: '渡劫境', maxLevel: 10, baseExp: 10000000, baseKillNeed: 5000, attributePoint: 1, bigRealmPoint: 10 },
  { id: 10, name: '真仙境', maxLevel: 10, baseExp: 50000000, baseKillNeed: 8000, attributePoint: 1, bigRealmPoint: 10 },
  { id: 11, name: '金仙境', maxLevel: 10, baseExp: 200000000, baseKillNeed: 12000, attributePoint: 1, bigRealmPoint: 10 },
  { id: 12, name: '太乙金仙境', maxLevel: 10, baseExp: 1000000000, baseKillNeed: 18000, attributePoint: 1, bigRealmPoint: 10 },
  { id: 13, name: '大罗金仙境', maxLevel: 10, baseExp: 5000000000, baseKillNeed: 25000, attributePoint: 1, bigRealmPoint: 10 },
  { id: 14, name: '道祖境', maxLevel: 10, baseExp: 100000000000, baseKillNeed: 35000, attributePoint: 1, bigRealmPoint: 10 },
]

export const ATTRIBUTE_CONFIG = {
  power: { name: '力量', desc: '每点增加2点攻击力' },
  constitution: { name: '体质', desc: '每点增加10点气血、1点防御力' },
  agility: { name: '身法', desc: '每点增加0.1%暴击率、0.1%闪避率' },
  comprehension: { name: '悟性', desc: '每点增加0.5%修为获取速度' },
  luck: { name: '福缘', desc: '每点增加0.2%掉落概率、0.5%暴击伤害' },
}

export const EQUIPMENT_CONFIG = {
  parts: [
    { id: 'weapon', name: '武器', mainAttr: 'attack' },
    { id: 'helmet', name: '头盔', mainAttr: 'defense' },
    { id: 'armor', name: '铠甲', mainAttr: 'hp' },
    { id: 'belt', name: '腰带', mainAttr: 'hp' },
    { id: 'shoes', name: '鞋子', mainAttr: 'agility' },
    { id: 'necklace', name: '项链', mainAttr: 'comprehension' },
    { id: 'ring', name: '戒指', mainAttr: 'luck' },
    { id: 'bracers', name: '护腕', mainAttr: 'power' },
  ],
  quality: [
    { id: 'common', name: '凡品', color: 'quality-common', attrCount: 1, baseMultiplier: 1, dropRate: 60 },
    { id: 'good', name: '良品', color: 'quality-good', attrCount: 2, baseMultiplier: 1.5, dropRate: 20 },
    { id: 'fine', name: '上品', color: 'quality-fine', attrCount: 3, baseMultiplier: 2.2, dropRate: 10 },
    { id: 'excellent', name: '精品', color: 'quality-excellent', attrCount: 4, baseMultiplier: 3.2, dropRate: 5 },
    { id: 'epic', name: '极品', color: 'quality-epic', attrCount: 5, baseMultiplier: 4.5, dropRate: 3 },
    { id: 'spirit', name: '灵品', color: 'quality-spirit', attrCount: 6, baseMultiplier: 6.5, dropRate: 1.2 },
    { id: 'immortal', name: '仙品', color: 'quality-immortal', attrCount: 7, baseMultiplier: 10, dropRate: 0.5 },
    { id: 'god', name: '神品', color: 'quality-god', attrCount: 8, baseMultiplier: 16, dropRate: 0.3 },
  ],
  namePrefix: ['青钢', '流云', '聚灵', '破界', '焚天', '镇岳', '逐月', '惊鸿', '玄冰', '赤焰', '紫电', '圣光', '幽冥', '龙凤', '鸿蒙', '昆仑', '蓬莱', '瑶池', '兜率', '紫霄', '混沌', '道源'],
  nameSuffix: {
    weapon: ['剑', '刀', '枪', '戟', '斧', '杖', '弓', '鞭'],
    helmet: ['盔', '冠', '帽', '巾'],
    armor: ['甲', '铠', '袍', '衣'],
    belt: ['带', '腰', '绦'],
    shoes: ['靴', '鞋', '履'],
    necklace: ['链', '佩', '坠'],
    ring: ['戒', '环'],
    bracers: ['腕', '护臂'],
  },
  strengthen: {
    maxLevel: 20,
    baseCost: 1,
    attrMultiplier: 0.1,
  },
  starUp: {
    maxStar: 10,
    baseCost: 2,
    attrMultiplier: 0.15,
  },
}

export const MAP_CONFIG = [
  {
    id: 1,
    name: '青竹山',
    unlockRealmId: 1,
    unlockLevel: 1,
    monsterLevel: 1,
    desc: '新手修士入门修炼之地，遍布低阶妖兽',
    dropMultiplier: 1,
    goldMultiplier: 1,
    expMultiplier: 1,
  },
  {
    id: 2,
    name: '黑风岭',
    unlockRealmId: 1,
    unlockLevel: 5,
    monsterLevel: 5,
    desc: '山贼与黑熊精盘踞之地，危险程度中等',
    dropMultiplier: 1.5,
    goldMultiplier: 1.5,
    expMultiplier: 1.5,
  },
  {
    id: 3,
    name: '流沙河',
    unlockRealmId: 2,
    unlockLevel: 1,
    monsterLevel: 10,
    desc: '水妖横行的大河，深处藏有强大的河伯',
    dropMultiplier: 2.2,
    goldMultiplier: 2.2,
    expMultiplier: 2.2,
  },
  {
    id: 4,
    name: '白骨洞',
    unlockRealmId: 2,
    unlockLevel: 8,
    monsterLevel: 18,
    desc: '白骨精修炼之地，阴气森森，危机四伏',
    dropMultiplier: 3,
    goldMultiplier: 3,
    expMultiplier: 3,
  },
  {
    id: 5,
    name: '火焰山',
    unlockRealmId: 3,
    unlockLevel: 1,
    monsterLevel: 25,
    desc: '终年烈火焚烧的山脉，火属性妖兽聚集',
    dropMultiplier: 4.5,
    goldMultiplier: 4.5,
    expMultiplier: 4.5,
  },
  {
    id: 6,
    name: '东海龙宫',
    unlockRealmId: 4,
    unlockLevel: 1,
    monsterLevel: 40,
    desc: '东海龙王的宫殿，藏有无数珍宝与水族妖兽',
    dropMultiplier: 7,
    goldMultiplier: 7,
    expMultiplier: 7,
  },
  {
    id: 7,
    name: '万妖谷',
    unlockRealmId: 5,
    unlockLevel: 1,
    monsterLevel: 60,
    desc: '天下妖族聚集之地，大妖横行，凶险无比',
    dropMultiplier: 11,
    goldMultiplier: 11,
    expMultiplier: 11,
  },
  {
    id: 8,
    name: '九重天',
    unlockRealmId: 7,
    unlockLevel: 1,
    monsterLevel: 100,
    desc: '天庭所在之地，天兵天将镇守，仙气缭绕',
    dropMultiplier: 18,
    goldMultiplier: 18,
    expMultiplier: 18,
  },
  {
    id: 9,
    name: '幽冥地府',
    unlockRealmId: 8,
    unlockLevel: 1,
    monsterLevel: 150,
    desc: '轮回之所，阴差鬼将遍布，怨气冲天',
    dropMultiplier: 28,
    goldMultiplier: 28,
    expMultiplier: 28,
  },
  {
    id: 10,
    name: '洪荒秘境',
    unlockRealmId: 9,
    unlockLevel: 1,
    monsterLevel: 200,
    desc: '上古洪荒遗留的秘境，藏有鸿蒙至宝与洪荒巨兽',
    dropMultiplier: 50,
    goldMultiplier: 50,
    expMultiplier: 50,
  },
  {
    id: 11,
    name: '昆仑仙山',
    unlockRealmId: 10,
    unlockLevel: 1,
    monsterLevel: 250,
    desc: '真仙修士修行圣地，西王母居所，仙气浓郁，精英仙兽遍布，高阶装备掉落概率极高',
    dropMultiplier: 60,
    goldMultiplier: 60,
    expMultiplier: 60,
    specialTag: 'elite_rate_up',
    equipDropUp: 0.5,
  },
  {
    id: 12,
    name: '蓬莱仙岛',
    unlockRealmId: 10,
    unlockLevel: 5,
    monsterLevel: 300,
    desc: '海外三仙山之首，散仙聚集之地，天地灵气汇聚，修为获取速度翻倍',
    dropMultiplier: 75,
    goldMultiplier: 75,
    expMultiplier: 120,
    specialTag: 'exp_up',
  },
  {
    id: 13,
    name: '瑶池圣地',
    unlockRealmId: 11,
    unlockLevel: 1,
    monsterLevel: 380,
    desc: '金仙境修士方可进入的仙界圣地，瑶池圣水滋养万物，是刷强化材料的绝佳之地',
    dropMultiplier: 95,
    goldMultiplier: 95,
    expMultiplier: 95,
    specialTag: 'strengthen_stone_up',
    stoneDropUp: 1,
  },
  {
    id: 14,
    name: '方丈仙山',
    unlockRealmId: 11,
    unlockLevel: 6,
    monsterLevel: 450,
    desc: '上古金仙道场，禁制遍布，掉落装备保底良品，分解收益大幅提升',
    dropMultiplier: 120,
    goldMultiplier: 120,
    expMultiplier: 120,
    specialTag: 'equip_decompose_up',
    equipQualityMin: 1,
  },
  {
    id: 15,
    name: '兜率天',
    unlockRealmId: 12,
    unlockLevel: 1,
    monsterLevel: 550,
    desc: '太上老君道场，三十三天之上的仙宫，丹道至尊之地，升级石掉落翻倍',
    dropMultiplier: 150,
    goldMultiplier: 150,
    expMultiplier: 150,
    specialTag: 'upgrade_stone_up',
    stoneDropUp: 1,
  },
  {
    id: 16,
    name: '紫霄宫',
    unlockRealmId: 12,
    unlockLevel: 7,
    monsterLevel: 650,
    desc: '鸿钧道祖讲道之地，太乙金仙的终极修行秘境，BOSS必掉落升星石',
    dropMultiplier: 190,
    goldMultiplier: 190,
    expMultiplier: 190,
    specialTag: 'star_stone_up',
    stoneDropUp: 1,
  },
  {
    id: 17,
    name: '三十三天外',
    unlockRealmId: 13,
    unlockLevel: 1,
    monsterLevel: 750,
    desc: '大罗金仙方可踏足的域外之地，脱离三界五行，稀有怪刷新概率翻倍，惊喜不断',
    dropMultiplier: 240,
    goldMultiplier: 240,
    expMultiplier: 240,
    specialTag: 'rare_monster_up',
  },
  {
    id: 18,
    name: '混沌边缘',
    unlockRealmId: 13,
    unlockLevel: 8,
    monsterLevel: 880,
    desc: '开天辟地之前的混沌之地，高风险高收益，所有材料掉落+80%，怪物攻击大幅提升',
    dropMultiplier: 300,
    goldMultiplier: 300,
    expMultiplier: 300,
    specialTag: 'high_risk_high_reward',
    allStoneUp: 0.8,
    monsterAttackUp: 0.5,
  },
  {
    id: 19,
    name: '鸿蒙秘境',
    unlockRealmId: 14,
    unlockLevel: 1,
    monsterLevel: 1000,
    desc: '道祖境修士的终极试炼地，诞生于鸿蒙初判之前，神品装备掉落概率翻倍',
    dropMultiplier: 380,
    goldMultiplier: 380,
    expMultiplier: 380,
    specialTag: 'god_equip_up',
    equipDropUp: 1,
  },
  {
    id: 20,
    name: '万界道源',
    unlockRealmId: 14,
    unlockLevel: 10,
    monsterLevel: 1500,
    desc: '修仙之路的终点，万道之源，所有掉落倍率拉满，终极BOSS必掉仙品以上装备',
    dropMultiplier: 600,
    goldMultiplier: 600,
    expMultiplier: 600,
    specialTag: 'final_map',
    equipQualityMin: 4,
  },
]

export const MONSTER_CONFIG = [
  // 青竹山怪物
  { monsterId: 1, id: 1, name: '青竹蛇', mapId: 1, baseHp: 50, baseAttack: 5, baseDefense: 1, baseGold: 5, baseExp: 10 },
  { monsterId: 2, id: 2, name: '野狼', mapId: 1, baseHp: 80, baseAttack: 8, baseDefense: 2, baseGold: 8, baseExp: 15 },
  { monsterId: 3, id: 3, name: '山精', mapId: 1, baseHp: 120, baseAttack: 10, baseDefense: 3, baseGold: 12, baseExp: 20 },
  { monsterId: 4, id: 4, name: '树妖', mapId: 1, baseHp: 200, baseAttack: 15, baseDefense: 5, baseGold: 20, baseExp: 35, isElite: true },
  // 黑风岭怪物
  { monsterId: 5, id: 5, name: '黑风狼', mapId: 2, baseHp: 200, baseAttack: 18, baseDefense: 6, baseGold: 18, baseExp: 30 },
  { monsterId: 6, id: 6, name: '山贼', mapId: 2, baseHp: 250, baseAttack: 22, baseDefense: 8, baseGold: 22, baseExp: 40 },
  { monsterId: 7, id: 7, name: '黑熊精', mapId: 2, baseHp: 400, baseAttack: 30, baseDefense: 12, baseGold: 35, baseExp: 60 },
  { monsterId: 8, id: 8, name: '黑风大王', mapId: 2, baseHp: 800, baseAttack: 50, baseDefense: 20, baseGold: 80, baseExp: 150, isElite: true },
  // 流沙河怪物
  { monsterId: 9, id: 9, name: '水鬼', mapId: 3, baseHp: 500, baseAttack: 45, baseDefense: 18, baseGold: 40, baseExp: 80 },
  { monsterId: 10, id: 10, name: '河虾精', mapId: 3, baseHp: 650, baseAttack: 55, baseDefense: 22, baseGold: 50, baseExp: 100 },
  { monsterId: 11, id: 11, name: '蟹将', mapId: 3, baseHp: 900, baseAttack: 70, baseDefense: 30, baseGold: 70, baseExp: 150 },
  { monsterId: 12, id: 12, name: '流沙河水伯', mapId: 3, baseHp: 2000, baseAttack: 120, baseDefense: 50, baseGold: 180, baseExp: 350, isElite: true },
  // 白骨洞怪物
  { monsterId: 13, id: 13, name: '骷髅兵', mapId: 4, baseHp: 1200, baseAttack: 100, baseDefense: 40, baseGold: 90, baseExp: 180 },
  { monsterId: 14, id: 14, name: '僵尸', mapId: 4, baseHp: 1600, baseAttack: 130, baseDefense: 55, baseGold: 120, baseExp: 250 },
  { monsterId: 15, id: 15, name: '鬼将', mapId: 4, baseHp: 2500, baseAttack: 180, baseDefense: 75, baseGold: 180, baseExp: 380 },
  { monsterId: 16, id: 16, name: '白骨夫人', mapId: 4, baseHp: 5000, baseAttack: 300, baseDefense: 120, baseGold: 400, baseExp: 800, isElite: true },
  // 火焰山怪物
  { monsterId: 17, id: 17, name: '火鼠', mapId: 5, baseHp: 3000, baseAttack: 250, baseDefense: 100, baseGold: 220, baseExp: 450 },
  { monsterId: 18, id: 18, name: '火牛', mapId: 5, baseHp: 4500, baseAttack: 350, baseDefense: 150, baseGold: 320, baseExp: 650 },
  { monsterId: 19, id: 19, name: '炎魔', mapId: 5, baseHp: 7000, baseAttack: 500, baseDefense: 220, baseGold: 500, baseExp: 1000 },
  { monsterId: 20, id: 20, name: '牛魔王', mapId: 5, baseHp: 15000, baseAttack: 800, baseDefense: 350, baseGold: 1200, baseExp: 2500, isElite: true },
  // 东海龙宫怪物
  { monsterId: 21, id: 21, name: '鱼精', mapId: 6, baseHp: 8000, baseAttack: 650, baseDefense: 300, baseGold: 700, baseExp: 1500 },
  { monsterId: 22, id: 22, name: '虾兵', mapId: 6, baseHp: 12000, baseAttack: 900, baseDefense: 400, baseGold: 1000, baseExp: 2200 },
  { monsterId: 23, id: 23, name: '龟丞相', mapId: 6, baseHp: 20000, baseAttack: 1200, baseDefense: 600, baseGold: 1600, baseExp: 3500 },
  { monsterId: 24, id: 24, name: '东海龙王', mapId: 6, baseHp: 40000, baseAttack: 2000, baseDefense: 1000, baseGold: 3500, baseExp: 8000, isElite: true },
  // 万妖谷怪物
  { monsterId: 25, id: 25, name: '狐妖', mapId: 7, baseHp: 25000, baseAttack: 1800, baseDefense: 800, baseGold: 2200, baseExp: 5000 },
  { monsterId: 26, id: 26, name: '狼妖', mapId: 7, baseHp: 35000, baseAttack: 2500, baseDefense: 1200, baseGold: 3200, baseExp: 7500 },
  { monsterId: 27, id: 27, name: '虎妖王', mapId: 7, baseHp: 60000, baseAttack: 3500, baseDefense: 1800, baseGold: 5000, baseExp: 12000 },
  { monsterId: 28, id: 28, name: '万妖谷主', mapId: 7, baseHp: 120000, baseAttack: 6000, baseDefense: 3000, baseGold: 12000, baseExp: 28000, isElite: true },
  // 九重天怪物
  { monsterId: 29, id: 29, name: '天兵', mapId: 8, baseHp: 80000, baseAttack: 4500, baseDefense: 2500, baseGold: 8000, baseExp: 18000 },
  { monsterId: 30, id: 30, name: '天将', mapId: 8, baseHp: 120000, baseAttack: 6500, baseDefense: 3500, baseGold: 12000, baseExp: 28000 },
  { monsterId: 31, id: 31, name: '四大天王', mapId: 8, baseHp: 200000, baseAttack: 9000, baseDefense: 5000, baseGold: 20000, baseExp: 45000 },
  { monsterId: 32, id: 32, name: '玉皇大帝', mapId: 8, baseHp: 400000, baseAttack: 15000, baseDefense: 8000, baseGold: 45000, baseExp: 100000, isElite: true },
  // 幽冥地府怪物
  { monsterId: 33, id: 33, name: '阴差', mapId: 9, baseHp: 250000, baseAttack: 12000, baseDefense: 7000, baseGold: 25000, baseExp: 60000 },
  { monsterId: 34, id: 34, name: '鬼判', mapId: 9, baseHp: 400000, baseAttack: 18000, baseDefense: 10000, baseGold: 40000, baseExp: 95000 },
  { monsterId: 35, id: 35, name: '十殿阎罗', mapId: 9, baseHp: 700000, baseAttack: 25000, baseDefense: 15000, baseGold: 70000, baseExp: 160000 },
  { monsterId: 36, id: 36, name: '酆都大帝', mapId: 9, baseHp: 1500000, baseAttack: 40000, baseDefense: 25000, baseGold: 160000, baseExp: 350000, isElite: true },
  // 洪荒秘境怪物
  { monsterId: 37, id: 37, name: '凶兽', mapId: 10, baseHp: 1000000, baseAttack: 35000, baseDefense: 20000, baseGold: 120000, baseExp: 250000 },
  { monsterId: 38, id: 38, name: '上古巨兽', mapId: 10, baseHp: 1800000, baseAttack: 50000, baseDefense: 30000, baseGold: 200000, baseExp: 450000 },
  { monsterId: 39, id: 39, name: '龙凤神兽', mapId: 10, baseHp: 3000000, baseAttack: 75000, baseDefense: 45000, baseGold: 350000, baseExp: 800000 },
  { monsterId: 40, id: 40, name: '盘古残魂', mapId: 10, baseHp: 8000000, baseAttack: 120000, baseDefense: 80000, baseGold: 800000, baseExp: 2000000, isElite: true },
  // 11.昆仑仙山怪物
  { monsterId: 41, id: 41, name: '瑶池仙鹿', mapId: 11, baseHp: 12000000, baseAttack: 180000, baseDefense: 120000, baseGold: 150000, baseExp: 3500000, trait: 'high_dodge', traitDesc: '高闪避，闪避率+20%' },
  { monsterId: 42, id: 42, name: '昆仑守山仙将', mapId: 11, baseHp: 18000000, baseAttack: 250000, baseDefense: 180000, baseGold: 220000, baseExp: 5000000, trait: 'high_defense', traitDesc: '高防御，受到伤害减免20%' },
  { monsterId: 43, id: 43, name: '昆仑上古灵兽', mapId: 11, baseHp: 28000000, baseAttack: 350000, baseDefense: 250000, baseGold: 350000, baseExp: 8000000, trait: 'normal', traitDesc: '无特殊特性' },
  { monsterId: 44, id: 44, name: '瑶池西王母', mapId: 11, baseHp: 60000000, baseAttack: 600000, baseDefense: 400000, baseGold: 1000000, baseExp: 20000000, isElite: true, trait: 'heal', traitDesc: '每回合恢复5%最大气血' },
  { monsterId: 45, id: 45, name: '五彩凤凰', mapId: 11, baseHp: 45000000, baseAttack: 500000, baseDefense: 350000, baseGold: 2000000, baseExp: 35000000, isRare: true, trait: 'double_drop', traitDesc: '稀有隐藏怪，死亡必掉2件装备' },
  // 12.蓬莱仙岛怪物
  { monsterId: 46, id: 46, name: '蓬莱仙龟', mapId: 12, baseHp: 20000000, baseAttack: 280000, baseDefense: 200000, baseGold: 250000, baseExp: 6000000, trait: 'high_hp', traitDesc: '高血量，气血上限+30%' },
  { monsterId: 47, id: 47, name: '蓬莱散仙', mapId: 12, baseHp: 30000000, baseAttack: 380000, baseDefense: 280000, baseGold: 380000, baseExp: 9000000, trait: 'exp_bonus', traitDesc: '击杀后额外获得50%修为' },
  { monsterId: 48, id: 48, name: '深海蛟龙', mapId: 12, baseHp: 45000000, baseAttack: 500000, baseDefense: 380000, baseGold: 550000, baseExp: 14000000, trait: 'high_crit', traitDesc: '高暴击，暴击率+15%' },
  { monsterId: 49, id: 49, name: '蓬莱岛主', mapId: 12, baseHp: 100000000, baseAttack: 850000, baseDefense: 600000, baseGold: 1600000, baseExp: 35000000, isElite: true, trait: 'exp_steal', traitDesc: '击杀后额外获得100%修为' },
  { monsterId: 50, id: 50, name: '万年玄龟', mapId: 12, baseHp: 200000000, baseAttack: 400000, baseDefense: 800000, baseGold: 3000000, baseExp: 50000000, isRare: true, trait: 'super_defense', traitDesc: '稀有隐藏怪，超高防御，击杀必掉大型修为丹' },
  // 13.瑶池圣地怪物
  { monsterId: 51, id: 51, name: '瑶池圣水精灵', mapId: 13, baseHp: 35000000, baseAttack: 450000, baseDefense: 350000, baseGold: 450000, baseExp: 11000000, trait: 'normal', traitDesc: '无特殊特性' },
  { monsterId: 52, id: 52, name: '瑶池仙兵', mapId: 13, baseHp: 50000000, baseAttack: 600000, baseDefense: 450000, baseGold: 650000, baseExp: 16000000, trait: 'stone_drop', traitDesc: '死亡额外掉落1-2个强化石' },
  { monsterId: 53, id: 53, name: '瑶池仙官', mapId: 13, baseHp: 75000000, baseAttack: 800000, baseDefense: 600000, baseGold: 950000, baseExp: 25000000, trait: 'stone_drop', traitDesc: '死亡额外掉落1-2个强化石' },
  { monsterId: 54, id: 54, name: '瑶池金母', mapId: 13, baseHp: 160000000, baseAttack: 1300000, baseDefense: 950000, baseGold: 2800000, baseExp: 60000000, isElite: true, trait: 'stone_bonus', traitDesc: '击杀必掉10-20个强化石' },
  { monsterId: 55, id: 55, name: '九色鹿王', mapId: 13, baseHp: 120000000, baseAttack: 1000000, baseDefense: 800000, baseGold: 5000000, baseExp: 80000000, isRare: true, trait: 'massive_stone', traitDesc: '稀有隐藏怪，击杀必掉30-50个强化石' },
  // 14.方丈仙山怪物
  { monsterId: 56, id: 56, name: '方丈山护山灵', mapId: 14, baseHp: 55000000, baseAttack: 650000, baseDefense: 500000, baseGold: 600000, baseExp: 15000000, trait: 'normal', traitDesc: '无特殊特性' },
  { monsterId: 57, id: 57, name: '上古金仙残魂', mapId: 14, baseHp: 80000000, baseAttack: 850000, baseDefense: 650000, baseGold: 850000, baseExp: 22000000, trait: 'high_attack', traitDesc: '高攻击，攻击力+20%' },
  { monsterId: 58, id: 58, name: '方丈山禁制之灵', mapId: 14, baseHp: 120000000, baseAttack: 1100000, baseDefense: 850000, baseGold: 1300000, baseExp: 35000000, trait: 'reflect', traitDesc: '反弹10%受到的伤害' },
  { monsterId: 59, id: 59, name: '方丈金仙老祖', mapId: 14, baseHp: 250000000, baseAttack: 1800000, baseDefense: 1300000, baseGold: 3800000, baseExp: 85000000, isElite: true, trait: 'forbidden', traitDesc: '开局降低玩家20%闪避率，持续整场战斗' },
  { monsterId: 60, id: 60, name: '先天道体', mapId: 14, baseHp: 180000000, baseAttack: 1500000, baseDefense: 1000000, baseGold: 6000000, baseExp: 120000000, isRare: true, trait: 'equip_guarantee', traitDesc: '稀有隐藏怪，击杀必掉1件上品及以上装备' },
  // 15.兜率天怪物
  { monsterId: 61, id: 61, name: '兜率宫炼丹童子', mapId: 15, baseHp: 90000000, baseAttack: 1000000, baseDefense: 750000, baseGold: 1000000, baseExp: 25000000, trait: 'stone_drop', traitDesc: '死亡额外掉落1-2个升级石' },
  { monsterId: 62, id: 62, name: '兜率宫守炉仙将', mapId: 15, baseHp: 130000000, baseAttack: 1300000, baseDefense: 1000000, baseGold: 1400000, baseExp: 36000000, trait: 'stone_drop', traitDesc: '死亡额外掉落1-2个升级石' },
  { monsterId: 63, id: 63, name: '兜率天丹火之灵', mapId: 15, baseHp: 190000000, baseAttack: 1700000, baseDefense: 1300000, baseGold: 2100000, baseExp: 55000000, trait: 'burn', traitDesc: '攻击附带燃烧效果，每回合额外造成5%伤害' },
  { monsterId: 64, id: 64, name: '太上老君分身', mapId: 15, baseHp: 400000000, baseAttack: 2600000, baseDefense: 2000000, baseGold: 6000000, baseExp: 130000000, isElite: true, trait: 'stone_bonus', traitDesc: '击杀必掉10-20个升级石' },
  { monsterId: 65, id: 65, name: '八卦炉器灵', mapId: 15, baseHp: 300000000, baseAttack: 2000000, baseDefense: 1500000, baseGold: 10000000, baseExp: 200000000, isRare: true, trait: 'massive_stone', traitDesc: '稀有隐藏怪，击杀必掉30-50个升级石' },
  // 16.紫霄宫怪物
  { monsterId: 66, id: 66, name: '紫霄宫听道仙神', mapId: 16, baseHp: 150000000, baseAttack: 1600000, baseDefense: 1200000, baseGold: 1600000, baseExp: 40000000, trait: 'normal', traitDesc: '无特殊特性' },
  { monsterId: 67, id: 67, name: '紫霄宫法则之灵', mapId: 16, baseHp: 220000000, baseAttack: 2100000, baseDefense: 1600000, baseGold: 2300000, baseExp: 58000000, trait: 'ignore_defense', traitDesc: '攻击无视玩家10%防御力' },
  { monsterId: 68, id: 68, name: '紫霄宫守门道君', mapId: 16, baseHp: 320000000, baseAttack: 2700000, baseDefense: 2100000, baseGold: 3400000, baseExp: 90000000, trait: 'stone_drop', traitDesc: '死亡额外掉落1-2个升星石' },
  { monsterId: 69, id: 69, name: '鸿钧道祖投影', mapId: 16, baseHp: 650000000, baseAttack: 4200000, baseDefense: 3200000, baseGold: 9500000, baseExp: 210000000, isElite: true, trait: 'stone_bonus', traitDesc: '击杀必掉5-10个升星石' },
  { monsterId: 70, id: 70, name: '造化玉碟残灵', mapId: 16, baseHp: 500000000, baseAttack: 3500000, baseDefense: 2500000, baseGold: 15000000, baseExp: 300000000, isRare: true, trait: 'massive_stone', traitDesc: '稀有隐藏怪，击杀必掉20-30个升星石' },
  // 17.三十三天外怪物
  { monsterId: 71, id: 71, name: '域外天魔', mapId: 17, baseHp: 250000000, baseAttack: 2600000, baseDefense: 2000000, baseGold: 2500000, baseExp: 65000000, trait: 'high_crit', traitDesc: '高暴击，暴击率+20%' },
  { monsterId: 72, id: 72, name: '时空乱流之灵', mapId: 17, baseHp: 380000000, baseAttack: 3400000, baseDefense: 2600000, baseGold: 3600000, baseExp: 95000000, trait: 'dodge', traitDesc: '高闪避，闪避率+25%' },
  { monsterId: 73, id: 73, name: '先天神魔残躯', mapId: 17, baseHp: 550000000, baseAttack: 4400000, baseDefense: 3500000, baseGold: 5200000, baseExp: 145000000, trait: 'super_attack', traitDesc: '超高攻击，攻击力+30%' },
  { monsterId: 74, id: 74, name: '域外天魔主', mapId: 17, baseHp: 1100000000, baseAttack: 6800000, baseDefense: 5200000, baseGold: 15000000, baseExp: 350000000, isElite: true, trait: 'devour', traitDesc: '每次攻击恢复自身3%气血' },
  { monsterId: 75, id: 75, name: '世界之蛇', mapId: 17, baseHp: 800000000, baseAttack: 5500000, baseDefense: 4000000, baseGold: 25000000, baseExp: 500000000, isRare: true, trait: 'box_drop', traitDesc: '稀有隐藏怪，击杀必掉2-3个装备宝箱' },
  // 18.混沌边缘怪物
  { monsterId: 76, id: 76, name: '混沌之气', mapId: 18, baseHp: 400000000, baseAttack: 6000000, baseDefense: 3200000, baseGold: 4000000, baseExp: 100000000, trait: 'chaos_attack', traitDesc: '高攻击，攻击力+50%' },
  { monsterId: 77, id: 77, name: '混沌魔虫', mapId: 18, baseHp: 600000000, baseAttack: 7800000, baseDefense: 4000000, baseGold: 5800000, baseExp: 150000000, trait: 'poison', traitDesc: '攻击附带剧毒，每回合造成8%最大气血伤害' },
  { monsterId: 78, id: 78, name: '混沌巨兽', mapId: 18, baseHp: 1200000000, baseAttack: 5000000, baseDefense: 7800000, baseGold: 8500000, baseExp: 230000000, trait: 'super_hp', traitDesc: '超高血量，气血上限+50%' },
  { monsterId: 79, id: 79, name: '混沌祖龙', mapId: 18, baseHp: 1800000000, baseAttack: 10500000, baseDefense: 8000000, baseGold: 24000000, baseExp: 550000000, isElite: true, trait: 'shield', traitDesc: '开局获得自身20%最大气血的护盾' },
  { monsterId: 80, id: 80, name: '混沌麒麟', mapId: 18, baseHp: 1500000000, baseAttack: 9000000, baseDefense: 7000000, baseGold: 40000000, baseExp: 800000000, isRare: true, trait: 'all_stone', traitDesc: '稀有隐藏怪，击杀必掉大量强化石、升级石、升星石' },
  // 19.鸿蒙秘境怪物
  { monsterId: 81, id: 81, name: '鸿蒙紫气之灵', mapId: 19, baseHp: 700000000, baseAttack: 7500000, baseDefense: 6000000, baseGold: 7000000, baseExp: 180000000, trait: 'normal', traitDesc: '无特殊特性' },
  { monsterId: 82, id: 82, name: '鸿蒙先天神魔', mapId: 19, baseHp: 1000000000, baseAttack: 9500000, baseDefense: 7500000, baseGold: 10000000, baseExp: 260000000, trait: 'ignore_defense', traitDesc: '攻击无视玩家20%防御力' },
  { monsterId: 83, id: 83, name: '鸿蒙至宝器灵', mapId: 19, baseHp: 1500000000, baseAttack: 12500000, baseDefense: 9500000, baseGold: 15000000, baseExp: 400000000, trait: 'equip_drop', traitDesc: '死亡必掉1件装备' },
  { monsterId: 84, id: 84, name: '鸿蒙老祖', mapId: 19, baseHp: 3000000000, baseAttack: 19000000, baseDefense: 15000000, baseGold: 42000000, baseExp: 950000000, isElite: true, trait: 'god_equip', traitDesc: '击杀有概率掉落神品装备' },
  { monsterId: 85, id: 85, name: '开天盘古残魂', mapId: 19, baseHp: 2500000000, baseAttack: 16000000, baseDefense: 12000000, baseGold: 80000000, baseExp: 1500000000, isRare: true, trait: 'god_equip_guarantee', traitDesc: '稀有隐藏怪，击杀必掉1件仙品装备，概率出神品' },
  // 20.万界道源怪物
  { monsterId: 86, id: 86, name: '万界星辰之灵', mapId: 20, baseHp: 2000000000, baseAttack: 18000000, baseDefense: 15000000, baseGold: 20000000, baseExp: 500000000, trait: 'high_all', traitDesc: '全属性提升20%' },
  { monsterId: 87, id: 87, name: '宇宙破灭巨兽', mapId: 20, baseHp: 3000000000, baseAttack: 23000000, baseDefense: 18500000, baseGold: 28000000, baseExp: 720000000, trait: 'destroy', traitDesc: '攻击有概率暴击，造成300%伤害' },
  { monsterId: 88, id: 88, name: '万界轮回守护者', mapId: 20, baseHp: 4500000000, baseAttack: 29000000, baseDefense: 23000000, baseGold: 40000000, baseExp: 1100000000, trait: 'cycle', traitDesc: '气血低于20%时，恢复50%最大气血，仅触发1次' },
  { monsterId: 89, id: 89, name: '大道本源之主', mapId: 20, baseHp: 5000000000, baseAttack: 30000000, baseDefense: 24000000, baseGold: 70000000, baseExp: 1600000000, isElite: true, trait: 'dao_source', traitDesc: '全属性提升30%，每回合恢复10%气血' },
  { monsterId: 90, id: 90, name: '万界至尊道祖', mapId: 20, baseHp: 10000000000, baseAttack: 45000000, baseDefense: 36000000, baseGold: 120000000, baseExp: 3000000000, isRare: true, trait: 'final_boss', traitDesc: '终极隐藏BOSS，击杀必掉1件神品装备' },
]
// 仙境试炼配置
export const TRIAL_CONFIG = {
  maxLayer: 100,
  baseHpMultiplier: 2,
  baseAttackMultiplier: 1.8,
  baseDefenseMultiplier: 1.5,
  rewardMultiplier: 1.2,
  // BOSS层配置
  bossLayers: [10,20,30,40,50,60,70,80,90,100],
  // 每层基础奖励
  baseReward: {
    gold: 100,
    strengthenStone: 1,
    upgradeStone: 0.5,
    starStone: 0.2,
  },
  // BOSS层额外奖励
  bossReward: {
    goldMultiplier: 10,
    strengthenStone: 10,
    upgradeStone: 5,
    starStone: 3,
    equipQualityMin: 4,
  }
}

// 商店配置
export const SHOP_CONFIG = {
  refreshCost: 1000,
  baseItemCount: 8,
  items: [
    { id: 1, name: '初级强化石', type: 'strengthenStone', price: 200, desc: '装备强化所需材料', limit: 999, refreshRate: 100 },
    { id: 2, name: '初级升级石', type: 'upgradeStone', price: 500, desc: '装备升级所需材料', limit: 999, refreshRate: 80 },
    { id: 3, name: '初级升星石', type: 'starStone', price: 1000, desc: '装备升星所需材料', limit: 999, refreshRate: 60 },
    { id: 4, name: '小型修为丹', type: 'expPill', price: 1000, desc: '使用后获得10000修为', effect: 10000, limit: 99, refreshRate: 70 },
    { id: 5, name: '中型修为丹', type: 'expPill', price: 5000, desc: '使用后获得60000修为', effect: 60000, limit: 99, refreshRate: 40 },
    { id: 6, name: '大型修为丹', type: 'expPill', price: 20000, desc: '使用后获得300000修为', effect: 300000, limit: 99, refreshRate: 20 },
    { id: 7, name: '洗点水', type: 'resetPill', price: 50000, desc: '重置所有属性点，重新分配', limit: 10, refreshRate: 10 },
    { id: 8, name: '凡品装备宝箱', type: 'equipBox', price: 1000, desc: '开启后获得一件凡品~上品装备', qualityMin: 0, qualityMax: 2, limit: 99, refreshRate: 60 },
    { id: 9, name: '良品装备宝箱', type: 'equipBox', price: 5000, desc: '开启后获得一件良品~精品装备', qualityMin: 1, qualityMax: 3, limit: 99, refreshRate: 40 },
    { id: 10, name: '上品装备宝箱', type: 'equipBox', price: 20000, desc: '开启后获得一件上品~极品装备', qualityMin: 2, qualityMax: 4, limit: 99, refreshRate: 20 },
    { id: 11, name: '灵品装备宝箱', type: 'equipBox', price: 100000, desc: '开启后获得一件精品~灵品装备', qualityMin: 3, qualityMax: 5, limit: 10, refreshRate: 5 },
    { id: 12, name: '仙品装备宝箱', type: 'equipBox', price: 500000, desc: '开启后获得一件极品~仙品装备', qualityMin: 4, qualityMax: 6, limit: 5, refreshRate: 1 },
  ]
}

// 转生配置
export const REINCARNATION_CONFIG = {
  unlockRealmId: 9,
  unlockLevel: 10,
  baseBonus: {
    attack: 0.1,
    hp: 0.1,
    defense: 0.1,
    expRate: 0.2,
    dropRate: 0.05,
  },
  extraAttributePoint: 20,
}

// 道具配置
export const ITEM_CONFIG = {
  strengthenStone: { name: '初级强化石', desc: '装备强化所需材料' },
  upgradeStone: { name: '初级升级石', desc: '装备升级所需材料' },
  starStone: { name: '初级升星石', desc: '装备升星所需材料' },
  resetPill: { name: '洗点水', desc: '重置所有属性点，重新分配' },
  expPill: { name: '修为丹', desc: '使用后获得大量修为' },
}

export const LEVEL_ATTR_CONFIG = {
  power: 1,
  constitution: 1,
  agility: 1,
  comprehension: 0.5,
  luck: 0.5
}

export const REALM_LEVEL_ATTR = {
  power: 2,
  constitution: 2,
  agility: 2,
  comprehension: 1,
  luck: 1
}

export const BIG_REALM_BONUS = {
  1: {
    baseAttr: { power: 5, constitution: 5, agility: 5, comprehension: 3, luck: 3 },
    multiplier: 1.0
  },
  2: {
    baseAttr: { power: 15, constitution: 15, agility: 15, comprehension: 10, luck: 10 },
    multiplier: 1.05
  },
  3: {
    baseAttr: { power: 30, constitution: 30, agility: 30, comprehension: 20, luck: 20 },
    multiplier: 1.12
  },
  4: {
    baseAttr: { power: 50, constitution: 50, agility: 50, comprehension: 35, luck: 35 },
    multiplier: 1.2
  },
  5: {
    baseAttr: { power: 80, constitution: 80, agility: 80, comprehension: 60, luck: 60 },
    multiplier: 1.3
  },
  6: {
    baseAttr: { power: 120, constitution: 120, agility: 120, comprehension: 90, luck: 90 },
    multiplier: 1.42
  },
  7: {
    baseAttr: { power: 180, constitution: 180, agility: 180, comprehension: 130, luck: 130 },
    multiplier: 1.55
  },
  8: {
    baseAttr: { power: 250, constitution: 250, agility: 250, comprehension: 180, luck: 180 },
    multiplier: 1.7
  },
  9: {
    baseAttr: { power: 350, constitution: 350, agility: 350, comprehension: 250, luck: 250 },
    multiplier: 1.9
  },
  10: {
    baseAttr: { power: 500, constitution: 500, agility: 500, comprehension: 400, luck: 400 },
    multiplier: 2.2
  }
}

export const MONSTER_STRENGTH_CONFIG = {
  mapMultiplier: 1.15,
  realmMultiplier: 1.08,
  levelMultiplier: 1.005,
  reincarnationMultiplier: 1.2,
  eliteBonus: {
    hp: 2.5,
    attack: 1.8,
    defense: 1.5,
  },
  rareBonus: {
    hp: 4,
    attack: 2.5,
    defense: 2,
  },
  maxMultiplier: 15,
}

export const EQUIPMENT_SET_CONFIG = [
  {
    setId: 1,
    setName: "炼气套装",
    desc: "新手入门套装，适配炼气期",
    minMapId: 1,
    maxMapId: 3,
    minQuality: 2,
    parts: ["weapon", "helmet", "armor", "shoes", "belt", "ring"],
    effects: [
      { needCount: 2, attr: { attack: 1.05 }, desc: "2件套：攻击力+5%" },
      { needCount: 4, attr: { hp: 1.1 }, desc: "4件套：气血上限+10%" },
      { needCount: 6, attr: { critRate: 0.05 }, desc: "6件套：暴击率+5%" },
    ]
  },
  {
    setId: 2,
    setName: "筑基套装",
    desc: "筑基期专属套装，大幅提升战力",
    minMapId: 3,
    maxMapId: 6,
    minQuality: 3,
    parts: ["weapon", "helmet", "armor", "shoes", "belt", "necklace", "ring", "bracers"],
    effects: [
      { needCount: 2, attr: { attack: 1.08 }, desc: "2件套：攻击力+8%" },
      { needCount: 4, attr: { hp: 1.15, defense: 1.1 }, desc: "4件套：气血+15%、防御+10%" },
      { needCount: 6, attr: { critRate: 0.08, critDamage: 1.1 }, desc: "6件套：暴击率+8%、暴击伤害+10%" },
      { needCount: 8, attr: { expRate: 1.1 }, desc: "8件套：修为获取+10%" },
    ]
  },
  {
    setId: 3,
    setName: "金丹套装",
    desc: "金丹期核心套装，境界压制必备",
    minMapId: 6,
    maxMapId: 9,
    minQuality: 4,
    parts: ["weapon", "helmet", "armor", "shoes", "belt", "necklace", "ring", "bracers"],
    effects: [
      { needCount: 2, attr: { attack: 1.12 }, desc: "2件套：攻击力+12%" },
      { needCount: 4, attr: { hp: 1.2, defense: 1.15 }, desc: "4件套：气血+20%、防御+15%" },
      { needCount: 6, attr: { critRate: 0.12, critDamage: 1.15 }, desc: "6件套：暴击率+12%、暴击伤害+15%" },
      { needCount: 8, attr: { dropRate: 0.1, expRate: 1.15 }, desc: "8件套：掉落率+10%、修为获取+15%" },
    ]
  },
  {
    setId: 4,
    setName: "元婴套装",
    desc: "元婴期顶级套装，全属性大幅提升",
    minMapId: 9,
    maxMapId: 99,
    minQuality: 5,
    parts: ["weapon", "helmet", "armor", "shoes", "belt", "necklace", "ring", "bracers"],
    effects: [
      { needCount: 2, attr: { attack: 1.18 }, desc: "2件套：攻击力+18%" },
      { needCount: 4, attr: { hp: 1.25, defense: 1.2 }, desc: "4件套：气血+25%、防御+20%" },
      { needCount: 6, attr: { critRate: 0.15, critDamage: 1.25 }, desc: "6件套：暴击率+15%、暴击伤害+25%" },
      { needCount: 8, attr: { dropRate: 0.15, expRate: 1.25 }, desc: "8件套：掉落率+15%、修为获取+25%" },
    ]
  }
]

export const ILLUSTRATION_CONFIG = {
  killStages: [
    { count: 10, name: "初遇", unlockDesc: "解锁怪物基础信息" },
    { count: 50, name: "熟稔", unlockDesc: "攻击力+1%" },
    { count: 100, name: "精通", unlockDesc: "掉落率+1%" },
    { count: 500, name: "屠灭", unlockDesc: "全属性+2%" },
  ],
  stageBonus: {
    1: { attackMulti: 1.01 },
    2: { dropMulti: 1.01 },
    3: { allMulti: 1.02 },
  }
}

// 成就系统配置
export const ACHIEVEMENT_CONFIG = [
  // 成长类成就
  {
    id: 1001,
    type: "growth",
    typeName: "成长",
    name: "初入仙途",
    desc: "角色等级达到10级",
    target: 10,
    currentKey: "level",
    reward: { gold: 1000, strengthenStone: 5, freeAttributePoint: 1 },
  },
  {
    id: 1002,
    type: "growth",
    typeName: "成长",
    name: "炼气圆满",
    desc: "突破至筑基期",
    target: 2,
    currentKey: "currentRealmId",
    reward: { gold: 5000, upgradeStone: 10, resetPill: 1 },
  },
  {
    id: 1003,
    type: "growth",
    typeName: "成长",
    name: "金丹大道",
    desc: "突破至金丹期",
    target: 3,
    currentKey: "currentRealmId",
    reward: { gold: 20000, starStone: 5, freeAttributePoint: 3 },
  },
  {
    id: 1004,
    type: "growth",
    typeName: "成长",
    name: "转生重修",
    desc: "完成第1次转生",
    target: 1,
    currentKey: "reincarnationCount",
    reward: { gold: 100000, strengthenStone: 50, upgradeStone: 50, starStone: 20 },
  },
  // 战斗类成就
  {
    id: 2001,
    type: "battle",
    typeName: "战斗",
    name: "初斩妖魔",
    desc: "累计击杀100只怪物",
    target: 100,
    currentKey: "totalKillCount",
    reward: { gold: 2000, strengthenStone: 3 },
  },
  {
    id: 2002,
    type: "battle",
    typeName: "战斗",
    name: "屠魔勇士",
    desc: "累计击杀1000只怪物",
    target: 1000,
    currentKey: "totalKillCount",
    reward: { gold: 20000, upgradeStone: 10, starStone: 2 },
  },
  {
    id: 2003,
    type: "battle",
    typeName: "战斗",
    name: "精英猎手",
    desc: "累计击杀100只精英怪物",
    target: 100,
    currentKey: "eliteKillCount",
    reward: { gold: 50000, starStone: 10, attackPill: 5 },
  },
  {
    id: 2004,
    type: "battle",
    typeName: "战斗",
    name: "稀有克星",
    desc: "累计击杀50只稀有怪物",
    target: 50,
    currentKey: "rareKillCount",
    reward: { gold: 100000, starStone: 20, superExpPill: 3 },
  },
  {
    id: 2005,
    type: "battle",
    typeName: "战斗",
    name: "试炼先锋",
    desc: "通关试炼塔第20层",
    target: 20,
    currentKey: "trialMaxLayer",
    reward: { gold: 80000, upgradeStone: 30, defensePill: 10 },
  },
  // 养成类成就
  {
    id: 3001,
    type: "develop",
    typeName: "养成",
    name: "强化入门",
    desc: "单件装备强化至+5",
    target: 5,
    currentKey: "maxStrengthenLevel",
    reward: { gold: 5000, strengthenStone: 10 },
  },
  {
    id: 3002,
    type: "develop",
    typeName: "养成",
    name: "强化大师",
    desc: "单件装备强化至+10",
    target: 10,
    currentKey: "maxStrengthenLevel",
    reward: { gold: 30000, strengthenStone: 30, starStone: 5 },
  },
  {
    id: 3003,
    type: "develop",
    typeName: "养成",
    name: "升星达人",
    desc: "单件装备升星至5星",
    target: 5,
    currentKey: "maxStarLevel",
    reward: { gold: 50000, starStone: 15, superExpPill: 2 },
  },
  {
    id: 3004,
    type: "develop",
    typeName: "养成",
    name: "套装收集者",
    desc: "激活任意一套6件套装效果",
    target: 6,
    currentKey: "maxSetCount",
    reward: { gold: 100000, starStone: 20, freeAttributePoint: 5 },
  },
  {
    id: 3005,
    type: "develop",
    typeName: "养成",
    name: "富甲一方",
    desc: "累计获得100万金币",
    target: 1000000,
    currentKey: "totalGoldGet",
    reward: { gold: 200000, strengthenStone: 100, upgradeStone: 100 },
  },
]

// 每日签到+在线奖励
export const SIGN_IN_CONFIG = {
  cycleDays: 7,
  rewardList: [
    { day: 1, reward: { gold: 1000, strengthenStone: 3, expPill: 2 } },
    { day: 2, reward: { gold: 2000, strengthenStone: 5, expPill: 3 } },
    { day: 3, reward: { gold: 3000, upgradeStone: 3, attackPill: 1 } },
    { day: 4, reward: { gold: 4000, upgradeStone: 5, defensePill: 1 } },
    { day: 5, reward: { gold: 5000, starStone: 1, expPill: 5 } },
    { day: 6, reward: { gold: 8000, starStone: 2, attackPill: 2, defensePill: 2 } },
    { day: 7, reward: { gold: 15000, starStone: 3, resetPill: 1, superExpPill: 1 } },
  ]
}

export const ONLINE_REWARD_CONFIG = [
  { minute: 5, reward: { gold: 500, strengthenStone: 1 } },
  { minute: 15, reward: { gold: 1000, upgradeStone: 1, expPill: 1 } },
  { minute: 30, reward: { gold: 2000, strengthenStone: 3, upgradeStone: 2 } },
  { minute: 60, reward: { gold: 5000, starStone: 1, expPill: 3 } },
]

// 丹药系统
export const PILL_CONFIG = {
  expPill: {
    id: "expPill",
    name: "修为丹",
    desc: "使用后立即获得1000点修为",
    type: "instant",
    effect: { exp: 1000 },
    stackLimit: 999,
  },
  superExpPill: {
    id: "superExpPill",
    name: "超级修为丹",
    desc: "使用后立即获得10000点修为",
    type: "instant",
    effect: { exp: 10000 },
    stackLimit: 999,
  },
  attackPill: {
    id: "attackPill",
    name: "攻击丹",
    desc: "使用后10分钟内，攻击力提升10%",
    type: "buff",
    duration: 10 * 60 * 1000,
    effect: { attackMulti: 1.1 },
    stackLimit: 99,
  },
  defensePill: {
    id: "defensePill",
    name: "防御丹",
    desc: "使用后10分钟内，防御力提升10%",
    type: "buff",
    duration: 10 * 60 * 1000,
    effect: { defenseMulti: 1.1 },
    stackLimit: 99,
  },
  resetPill: {
    id: "resetPill",
    name: "洗髓丹",
    desc: "重置所有自由属性点，可重新分配",
    type: "special",
    effect: "resetAttribute",
    stackLimit: 99,
  },
}