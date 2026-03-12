import { reactive, computed } from 'vue'
import { REALM_CONFIG, MAP_CONFIG, REINCARNATION_CONFIG, LEVEL_ATTR_CONFIG, REALM_LEVEL_ATTR, BIG_REALM_BONUS } from './config.js'
import { formatNumber } from './utils.js'
import { calculateTotalEquipAttr } from './equipment.js'

const initState = () => ({
  playerName: '修仙者',
  currentRealmId: 1,
  currentLevel: 1,
  currentExp: 0,
  level: 1,
  levelExp: 0,
  levelMaxExp: 120,
  totalKillCount: 0,
  realmKillCount: 0,
  currentHp: 200,
  isPlayerDead: false,
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
let hpRegenTimer = null
let meditateTimer = null

const startAgeTimer = () => {
  if (ageTimer) return
  ageTimer = setInterval(() => {
    gameState.age++
    saveGame()
  }, 80000)
}

const startHpRegenTimer = () => {
  if (hpRegenTimer) return
  hpRegenTimer = setInterval(() => {
    if (gameState.isPlayerDead) return
    const maxHp = playerMaxHp.value
    const regenRate = gameState.autoMeditate ? 0.02 : 0.01
    const regenHp = Math.floor(maxHp * regenRate)
    
    if (gameState.currentHp < maxHp) {
      gameState.currentHp = Math.min(gameState.currentHp + regenHp, maxHp)
    }
  }, 2000)
}

const startMeditateTimer = () => {
  if (meditateTimer) return
  meditateTimer = setInterval(() => {
    if (gameState.isPlayerDead) {
      stopMeditateTimer()
      gameState.autoMeditate = false
      return
    }

    if (gameState.currentExp >= currentRealmExpNeed.value) {
      stopMeditateTimer()
      gameState.autoMeditate = false
      saveGame()
      return
    }

    const playerAttr = playerTotalAttribute.value
    const baseExp = 10
    const expGain = Math.floor(baseExp * playerAttr.expRate)
    gameState.currentExp = Math.min(gameState.currentExp + expGain, currentRealmExpNeed.value)
    saveGame()
  }, 1500)
}

const stopMeditateTimer = () => {
  if (meditateTimer) {
    clearInterval(meditateTimer)
    meditateTimer = null
  }
}

const toggleMeditateState = (newVal) => {
  if (newVal) {
    if (gameState.currentExp >= currentRealmExpNeed.value) {
      gameState.autoMeditate = false
      return
    }
    gameState.autoBattle = false
    startMeditateTimer()
  } else {
    stopMeditateTimer()
  }
}

export const levelAttrBonus = computed(() => {
  const level = gameState.level
  return {
    power: LEVEL_ATTR_CONFIG.power * level,
    constitution: LEVEL_ATTR_CONFIG.constitution * level,
    agility: LEVEL_ATTR_CONFIG.agility * level,
    comprehension: LEVEL_ATTR_CONFIG.comprehension * level,
    luck: LEVEL_ATTR_CONFIG.luck * level
  }
})

export const realmLevelAttrBonus = computed(() => {
  const realmLevel = gameState.currentLevel
  return {
    power: REALM_LEVEL_ATTR.power * realmLevel,
    constitution: REALM_LEVEL_ATTR.constitution * realmLevel,
    agility: REALM_LEVEL_ATTR.agility * realmLevel,
    comprehension: REALM_LEVEL_ATTR.comprehension * realmLevel,
    luck: REALM_LEVEL_ATTR.luck * realmLevel
  }
})

export const bigRealmBonus = computed(() => {
  const realmId = gameState.currentRealmId
  return BIG_REALM_BONUS[realmId] || BIG_REALM_BONUS[1]
})

export const baseAttrBonus = computed(() => gameState.baseAttribute)
export const equipAttrBonus = computed(() => calculateTotalEquipAttr())

export const reincarnationBonus = computed(() => {
  const { baseBonus } = REINCARNATION_CONFIG
  const count = gameState.reincarnationCount
  return {
    attackMulti: 1 + count * baseBonus.attack,
    hpMulti: 1 + count * baseBonus.hp,
    defenseMulti: 1 + count * baseBonus.defense,
    expMulti: 1 + count * baseBonus.expRate,
    dropMulti: 1 + count * baseBonus.dropRate
  }
})

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

export const playerMaxHp = computed(() => {
  return playerTotalAttribute.value.hp
})

export const hpProgress = computed(() => {
  return Math.min((gameState.currentHp / playerMaxHp.value) * 100, 100)
})

export const playerTotalAttribute = computed(() => {
  const baseAttr = baseAttrBonus.value
  const levelBonus = levelAttrBonus.value
  const realmLevelBonus = realmLevelAttrBonus.value
  const realmBonus = bigRealmBonus.value
  const equipAttr = equipAttrBonus.value
  const reincarnationMulti = reincarnationBonus.value

  const totalPower = baseAttr.power + levelBonus.power + realmLevelBonus.power + realmBonus.baseAttr.power + equipAttr.power
  const totalConstitution = baseAttr.constitution + levelBonus.constitution + realmLevelBonus.constitution + realmBonus.baseAttr.constitution + equipAttr.constitution
  const totalAgility = baseAttr.agility + levelBonus.agility + realmLevelBonus.agility + realmBonus.baseAttr.agility + equipAttr.agility
  const totalComprehension = baseAttr.comprehension + levelBonus.comprehension + realmLevelBonus.comprehension + realmBonus.baseAttr.comprehension + equipAttr.comprehension
  const totalLuck = baseAttr.luck + levelBonus.luck + realmLevelBonus.luck + realmBonus.baseAttr.luck + equipAttr.luck

  const baseAttack = (totalPower * 2 + equipAttr.attack) * realmBonus.multiplier
  const baseHp = (totalConstitution * 20 + equipAttr.hp) * realmBonus.multiplier
  const baseDefense = (totalConstitution * 1 + equipAttr.defense) * realmBonus.multiplier

  return {
    attack: baseAttack * reincarnationMulti.attackMulti,
    hp: baseHp * reincarnationMulti.hpMulti,
    defense: baseDefense * reincarnationMulti.defenseMulti,
    critRate: totalAgility * 0.1,
    dodgeRate: totalAgility * 0.1,
    expRate: (1 + totalComprehension * 0.005) * reincarnationMulti.expMulti,
    dropRate: (totalLuck * 0.002) * reincarnationMulti.dropMulti,
    critDamage: 1.3 + totalLuck * 0.003,
  }
})

export const playerRevive = () => {
  gameState.currentHp = playerMaxHp.value
  gameState.isPlayerDead = false
  gameState.autoBattle = false
  gameState.autoMeditate = false
  gameState.isContinuousAttacking = false
  saveGame()
}

export const checkLevelUp = () => {
  let hasLevelUp = false
  while (gameState.levelExp >= gameState.levelMaxExp) {
    hasLevelUp = true
    const overflow = gameState.levelExp - gameState.levelMaxExp
    gameState.level += 1
    gameState.levelExp = overflow
    gameState.levelMaxExp = Math.floor(gameState.levelMaxExp * 1.2)
    gameState.freeAttributePoint += 1
    gameState.currentHp = playerMaxHp.value
  }
  if (hasLevelUp) saveGame()
  return hasLevelUp
}

export const addLevelExp = (exp) => {
  gameState.levelExp += exp
  const isLevelUp = checkLevelUp()
  saveGame()
  return isLevelUp
}

export const toggleAutoMeditate = () => {
  if (gameState.isPlayerDead) {
    return { success: false, msg: '你已死亡，无法打坐' }
  }
  if (!gameState.autoMeditate && gameState.currentExp >= currentRealmExpNeed.value) {
    return { success: false, msg: '修为已满，无需打坐' }
  }

  gameState.autoMeditate = !gameState.autoMeditate
  toggleMeditateState(gameState.autoMeditate)
  saveGame()
  
  return {
    success: true,
    msg: gameState.autoMeditate ? '自动打坐已开启' : '自动打坐已关闭'
  }
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
        const defaultState = initState()
        const mergedItems = {
          strengthenStone: Number(parsedData.items?.strengthenStone) || 0,
          upgradeStone: Number(parsedData.items?.upgradeStone) || 0,
          starStone: Number(parsedData.items?.starStone) || 0,
          resetPill: Number(parsedData.items?.resetPill) || 0,
        }
        const mergedData = {
          ...defaultState,
          ...parsedData,
          items: mergedItems,
          isContinuousAttacking: false,
          continuousAttackTimerId: null,
          currentHp: Math.min(Number(parsedData.currentHp) || defaultState.currentHp, playerMaxHp.value),
          isPlayerDead: Boolean(parsedData.isPlayerDead) || false,
          autoMeditate: false
        }
        Object.assign(gameState, mergedData)
        startAgeTimer()
        startHpRegenTimer()
        if (parsedData.autoMeditate && gameState.currentExp < currentRealmExpNeed.value) {
          gameState.autoMeditate = true
          startMeditateTimer()
        }
        return true
      }
    }
    startAgeTimer()
    startHpRegenTimer()
    return false
  } catch (e) {
    console.warn('存档加载失败，已自动重置为新游戏', e)
    localStorage.removeItem('xianxia_game_save')
    Object.assign(gameState, initState())
    startAgeTimer()
    startHpRegenTimer()
    return false
  }
}

export const resetGame = () => {
  stopMeditateTimer()
  Object.assign(gameState, initState())
  localStorage.removeItem('xianxia_game_save')
  startAgeTimer()
  startHpRegenTimer()
}

loadGame()