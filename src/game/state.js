import { reactive, computed } from 'vue'
import { REALM_CONFIG, MAP_CONFIG, REINCARNATION_CONFIG } from './config.js'
import { formatNumber } from './utils.js'
import { calculateTotalEquipAttr } from './equipment.js'

const initState = () => ({
  playerName: '修仙者',
  currentRealmId: 1,
  currentLevel: 1,
  currentExp: 0,
  level: 1,
  levelExp: 0,
  levelMaxExp: 100,
  totalKillCount: 0,
  realmKillCount: 0,
  baseAttribute: {
    power: 0,
    constitution: 0,
    agility: 0,
    comprehension: 0,
    luck: 0,
  },
  freeAttributePoint: 0,
  reincarnationCount: 0,
  gold: 1000,
  items: {
    strengthenStone: 0,
    upgradeStone: 0,
    starStone: 0,
    resetPill: 0,
  },
  bagEquipments: [],
  equippedEquipments: {
    weapon: null,
    helmet: null,
    armor: null,
    belt: null,
    shoes: null,
    necklace: null,
    ring: null,
    bracers: null,
  },
  currentMapId: 1,
  currentMonster: null,
  autoBattle: false,
  autoMeditate: false,
  trialCurrentLayer: 1,
  trialMaxLayer: 1,
  trialMonster: null,
  shopItems: [],
  lastSaveTime: Date.now(),
  age: 16,
  isContinuousAttacking: false,
  continuousAttackTimerId: null
})

export const gameState = reactive(initState())

let ageTimer = null
const startAgeTimer = () => {
  if (ageTimer) return
  ageTimer = setInterval(() => {
    gameState.age++
    saveGame()
  }, 60000)
}

export const currentRealm = computed(() => {
  return REALM_CONFIG.find(realm => realm.id === gameState.currentRealmId) || REALM_CONFIG[0]
})

export const currentRealmExpNeed = computed(() => {
  const realm = currentRealm.value
  return realm.baseExp * Math.pow(1.5, gameState.currentLevel - 1)
})

export const currentRealmKillNeed = computed(() => {
  const realm = currentRealm.value
  const currentLevel = gameState.currentLevel
  let multiplier = 1.8
  if (realm.id >= 3 && realm.id <= 4) multiplier = 1.6
  if (realm.id >= 5 && realm.id <= 6) multiplier = 1.4
  if (realm.id >= 7 && realm.id <= 8) multiplier = 1.3
  if (realm.id >= 9 && realm.id <= 11) multiplier = 1.2
  if (realm.id >= 12) multiplier = 1.15
  const needCount = Math.floor(realm.baseKillNeed * Math.pow(multiplier, currentLevel - 1))
  return Math.min(needCount, 100000)
})

export const currentMap = computed(() => {
  return MAP_CONFIG.find(map => map.id === gameState.currentMapId) || MAP_CONFIG[0]
})

export const expProgress = computed(() => {
  return Math.min((gameState.currentExp / currentRealmExpNeed.value) * 100, 100)
})

export const killProgress = computed(() => {
  return Math.min((gameState.realmKillCount / currentRealmKillNeed.value) * 100, 100)
})

export const levelExpProgress = computed(() => {
  return Math.min((gameState.levelExp / gameState.levelMaxExp) * 100, 100)
})

export const playerTotalAttribute = computed(() => {
  const { baseAttribute, reincarnationCount } = gameState
  const { baseBonus } = REINCARNATION_CONFIG
  const equipAttr = calculateTotalEquipAttr()
  const reincarnationMultiplier = 1 + reincarnationCount * baseBonus.expRate
  const attackMultiplier = 1 + reincarnationCount * baseBonus.attack
  const hpMultiplier = 1 + reincarnationCount * baseBonus.hp
  const defenseMultiplier = 1 + reincarnationCount * baseBonus.defense
  const dropMultiplier = 1 + reincarnationCount * baseBonus.dropRate
  const totalPower = baseAttribute.power + equipAttr.power
  const totalConstitution = baseAttribute.constitution + equipAttr.constitution
  const totalAgility = baseAttribute.agility + equipAttr.agility
  const totalComprehension = baseAttribute.comprehension + equipAttr.comprehension
  const totalLuck = baseAttribute.luck + equipAttr.luck
  const baseAttack = totalPower * 2 + equipAttr.attack
  const baseHp = totalConstitution * 20 + equipAttr.hp
  const baseDefense = totalConstitution * 1 + equipAttr.defense
  const baseCritRate = totalAgility * 0.1
  const baseDodgeRate = totalAgility * 0.1
  const baseExpRate = 1 + totalComprehension * 0.005
  const baseDropRate = totalLuck * 0.002
  const baseCritDamage = 1.3 + totalLuck * 0.003
  return {
    attack: baseAttack * attackMultiplier,
    hp: baseHp * hpMultiplier,
    defense: baseDefense * defenseMultiplier,
    critRate: baseCritRate,
    dodgeRate: baseDodgeRate,
    expRate: baseExpRate * reincarnationMultiplier,
    dropRate: baseDropRate * dropMultiplier,
    critDamage: baseCritDamage,
  }
})

export const checkLevelUp = () => {
  while (gameState.levelExp >= gameState.levelMaxExp) {
    const overflow = gameState.levelExp - gameState.levelMaxExp
    gameState.level += 1
    gameState.levelExp = overflow
    gameState.levelMaxExp = Math.floor(gameState.levelMaxExp * 1.2)
    gameState.freeAttributePoint += 1
    saveGame()
    return true
  }
  return false
}

export const addLevelExp = (exp) => {
  gameState.levelExp += exp
  const isLevelUp = checkLevelUp()
  saveGame()
  return isLevelUp
}

export const saveGame = () => {
  try {
    const saveData = JSON.stringify(gameState)
    localStorage.setItem('xianxia_game_save', saveData)
    gameState.lastSaveTime = Date.now()
    return true
  } catch (e) {
    console.error('保存游戏失败', e)
    return false
  }
}

export const loadGame = () => {
  try {
    const saveData = localStorage.getItem('xianxia_game_save')
    if (saveData) {
      const parsedData = JSON.parse(saveData)
      if (parsedData.currentRealmId && parsedData.gold !== undefined) {
        // 兼容旧存档：如果没有连打字段，手动添加默认值
        const mergedData = {
          ...parsedData,
          isContinuousAttacking: parsedData.isContinuousAttacking || false,
          continuousAttackTimerId: parsedData.continuousAttackTimerId || null
        }
        Object.assign(gameState, mergedData)
        startAgeTimer()
        return true
      }
    }
    startAgeTimer()
    return false
  } catch (e) {
    console.warn('存档加载失败，已自动重置为新游戏', e)
    localStorage.removeItem('xianxia_game_save')
    startAgeTimer()
    return false
  }
}

export const resetGame = () => {
  Object.assign(gameState, initState())
  localStorage.removeItem('xianxia_game_save')
  startAgeTimer()
}

loadGame()