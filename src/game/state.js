import { reactive, computed, watch } from 'vue'
import { REALM_CONFIG, MAP_CONFIG, REINCARNATION_CONFIG, LEVEL_ATTR_CONFIG, REALM_LEVEL_ATTR, BIG_REALM_BONUS, EQUIPMENT_SET_CONFIG, ILLUSTRATION_CONFIG, ACHIEVEMENT_CONFIG, PILL_CONFIG } from './config.js'
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
  continuousAttackTimerId: null,

  maxSetCount: 0,

  monsterKillCount: {},
  eliteKillCount: 0,
  rareKillCount: 0,

  achievementState: {},
  maxStrengthenLevel: 0,
  maxStarLevel: 0,
  totalGoldGet: 0,

  signInData: {
    lastSignDate: '',
    totalSignDays: 0,
    cycleSignDays: 0,
  },
  onlineData: {
    totalOnlineTime: 0,
    todayOnlineTime: 0,
    claimedRewards: [],
    lastOnlineTime: Date.now(),
  },

  pills: {
    expPill: 0,
    superExpPill: 0,
    attackPill: 0,
    defensePill: 0,
    resetPill: 0,
  },
  buffData: {
    attackPill: { endTime: 0 },
    defensePill: { endTime: 0 },
  },
})

export const gameState = reactive(initState())

let ageTimer = null
let hpRegenTimer = null
let meditateTimer = null
let onlineTimer = null
let buffTimer = null

const startAgeTimer = () => {
  if (ageTimer) return
  ageTimer = setInterval(() => {
    gameState.age++
    saveGame()
  }, 60000)
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

const startOnlineTimer = () => {
  if (onlineTimer) return
  onlineTimer = setInterval(() => {
    const now = Date.now()
    const diff = now - gameState.onlineData.lastOnlineTime
    if (diff >= 1000) {
      const addMinute = Math.floor(diff / 60000)
      if (addMinute > 0) {
        gameState.onlineData.totalOnlineTime += addMinute
        gameState.onlineData.todayOnlineTime += addMinute
      }
      gameState.onlineData.lastOnlineTime = now
      saveGame()
    }
  }, 1000)
}

const startBuffTimer = () => {
  if (buffTimer) return
  buffTimer = setInterval(() => {
    const now = Date.now()
    Object.keys(gameState.buffData).forEach(key => {
      if (gameState.buffData[key]?.endTime > 0 && now >= gameState.buffData[key].endTime) {
        gameState.buffData[key].endTime = 0
      }
    })
  }, 1000)
}

export const equipSetCount = computed(() => {
  const countMap = {}
  Object.values(gameState.equippedEquipments).forEach(equip => {
    if (equip && equip.setId) {
      countMap[equip.setId] = (countMap[equip.setId] || 0) + 1
    }
  })
  return countMap
})

export const setBonusAttr = computed(() => {
  const bonus = {
    attack: 1,
    hp: 1,
    defense: 1,
    critRate: 0,
    critDamage: 1,
    expRate: 1,
    dropRate: 0,
  }
  const countMap = equipSetCount.value
  let maxCount = 0

  Object.keys(countMap).forEach(setId => {
    const setConfig = EQUIPMENT_SET_CONFIG.find(set => set.setId === Number(setId))
    if (!setConfig) return
    const currentCount = countMap[setId]
    maxCount = Math.max(maxCount, currentCount)

    setConfig.effects.forEach(effect => {
      if (currentCount >= effect.needCount) {
        Object.keys(effect.attr).forEach(key => {
          if (key === 'critRate' || key === 'dropRate') {
            bonus[key] += effect.attr[key]
          } else {
            bonus[key] *= effect.attr[key]
          }
        })
      }
    })
  })

  gameState.maxSetCount = Math.max(gameState.maxSetCount, maxCount)
  return bonus
})

export const illustrationBonus = computed(() => {
  const bonus = {
    attackMulti: 1,
    defenseMulti: 1,
    hpMulti: 1,
    dropMulti: 1,
    expMulti: 1,
  }
  const { stageBonus } = ILLUSTRATION_CONFIG
  const killCountMap = gameState.monsterKillCount

  if (killCountMap && typeof killCountMap === 'object') {
    Object.values(killCountMap).forEach(count => {
      if (count >= 50) bonus.attackMulti *= stageBonus[1].attackMulti
      if (count >= 100) bonus.dropMulti *= stageBonus[2].dropMulti
      if (count >= 500) {
        bonus.attackMulti *= stageBonus[3].allMulti
        bonus.defenseMulti *= stageBonus[3].allMulti
        bonus.hpMulti *= stageBonus[3].allMulti
      }
    })
  }
  return bonus
})

export const pillBuffBonus = computed(() => {
  const bonus = {
    attackMulti: 1,
    defenseMulti: 1,
  }
  const now = Date.now()
  const { buffData } = gameState

  if (buffData?.attackPill?.endTime > now) {
    bonus.attackMulti = PILL_CONFIG.attackPill.effect.attackMulti
  }
  if (buffData?.defensePill?.endTime > now) {
    bonus.defenseMulti = PILL_CONFIG.defensePill.effect.defenseMulti
  }
  return bonus
})

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
  const setBonus = setBonusAttr.value
  const illustrationBonusVal = illustrationBonus.value
  const pillBuffBonusVal = pillBuffBonus.value

  const totalPower = baseAttr.power + levelBonus.power + realmLevelBonus.power + realmBonus.baseAttr.power + equipAttr.power
  const totalConstitution = baseAttr.constitution + levelBonus.constitution + realmLevelBonus.constitution + realmBonus.baseAttr.constitution + equipAttr.constitution
  const totalAgility = baseAttr.agility + levelBonus.agility + realmLevelBonus.agility + realmBonus.baseAttr.agility + equipAttr.agility
  const totalComprehension = baseAttr.comprehension + levelBonus.comprehension + realmLevelBonus.comprehension + realmBonus.baseAttr.comprehension + equipAttr.comprehension
  const totalLuck = baseAttr.luck + levelBonus.luck + realmLevelBonus.luck + realmBonus.baseAttr.luck + equipAttr.luck

  const baseAttack = (totalPower * 2 + equipAttr.attack) * realmBonus.multiplier * setBonus.attack * illustrationBonusVal.attackMulti * pillBuffBonusVal.attackMulti
  const baseHp = (totalConstitution * 20 + equipAttr.hp) * realmBonus.multiplier * setBonus.hp * illustrationBonusVal.hpMulti * reincarnationMulti.hpMulti
  const baseDefense = (totalConstitution * 1 + equipAttr.defense) * realmBonus.multiplier * setBonus.defense * illustrationBonusVal.defenseMulti * pillBuffBonusVal.defenseMulti * reincarnationMulti.defenseMulti

  return {
    attack: baseAttack * reincarnationMulti.attackMulti,
    hp: baseHp,
    defense: baseDefense,
    critRate: totalAgility * 0.1 + setBonus.critRate,
    dodgeRate: totalAgility * 0.1,
    expRate: (1 + totalComprehension * 0.005) * reincarnationMulti.expMulti * setBonus.expRate * illustrationBonusVal.expMulti,
    dropRate: (totalLuck * 0.002) * reincarnationMulti.dropMulti + setBonus.dropRate + illustrationBonusVal.dropMulti - 1,
    critDamage: 1.3 + totalLuck * 0.003 * setBonus.critDamage,
  }
})

const checkAchievementFinish = () => {
  ACHIEVEMENT_CONFIG.forEach(achievement => {
    if (gameState.achievementState?.[achievement.id]?.isFinished) return
    let currentValue = gameState[achievement.currentKey] || 0
    if (currentValue >= achievement.target) {
      if (!gameState.achievementState) gameState.achievementState = {}
      gameState.achievementState[achievement.id] = {
        isFinished: true,
        isClaimed: false
      }
    }
  })
}

watch([
  () => gameState.level,
  () => gameState.currentRealmId,
  () => gameState.reincarnationCount,
  () => gameState.totalKillCount,
  () => gameState.eliteKillCount,
  () => gameState.rareKillCount,
  () => gameState.trialMaxLayer,
  () => gameState.maxStrengthenLevel,
  () => gameState.maxStarLevel,
  () => gameState.maxSetCount,
  () => gameState.totalGoldGet,
], () => {
  checkAchievementFinish()
}, { deep: true, immediate: true })

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
  if (gameState.autoMeditate) {
    gameState.autoBattle = false
    startMeditateTimer()
  } else {
    stopMeditateTimer()
  }
  saveGame()
  
  return {
    success: true,
    msg: gameState.autoMeditate ? '自动打坐已开启' : '自动打坐已关闭'
  }
}

export const usePill = (pillId) => {
  const pillConfig = PILL_CONFIG[pillId]
  if (!pillConfig || !gameState.pills || gameState.pills[pillId] <= 0) {
    return { success: false, msg: '丹药数量不足' }
  }

  gameState.pills[pillId] -= 1

  if (pillConfig.type === 'instant') {
    if (pillConfig.effect.exp) {
      gameState.currentExp = Math.min(gameState.currentExp + pillConfig.effect.exp, currentRealmExpNeed.value)
    }
  }

  if (pillConfig.type === 'buff') {
    const now = Date.now()
    const endTime = gameState.buffData?.[pillId]?.endTime > now ? gameState.buffData[pillId].endTime : now
    if (!gameState.buffData[pillId]) gameState.buffData[pillId] = {}
    gameState.buffData[pillId].endTime = endTime + pillConfig.duration
  }

  if (pillConfig.type === 'special') {
    if (pillConfig.effect === 'resetAttribute') {
      Object.keys(gameState.baseAttribute).forEach(key => {
        gameState.freeAttributePoint += gameState.baseAttribute[key]
        gameState.baseAttribute[key] = 0
      })
    }
  }

  saveGame()
  return { success: true, msg: `使用${pillConfig.name}成功！` }
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

        const mergedPills = { ...defaultState.pills }
        if (parsedData.pills && typeof parsedData.pills === 'object') {
          Object.keys(defaultState.pills).forEach(key => {
            mergedPills[key] = Number(parsedData.pills[key]) || 0
          })
        }

        const mergedAchievement = { ...defaultState.achievementState, ...parsedData.achievementState }
        const mergedSignIn = { ...defaultState.signInData, ...parsedData.signInData }

        const mergedOnline = { 
          ...defaultState.onlineData, 
          ...parsedData.onlineData, 
          lastOnlineTime: Date.now() 
        }

        const mergedBuff = { ...defaultState.buffData, ...parsedData.buffData }

        const mergedMonsterKill = { ...defaultState.monsterKillCount, ...parsedData.monsterKillCount }
        const mergedData = {
          ...defaultState,
          ...parsedData,
          items: mergedItems,
          pills: mergedPills,
          achievementState: mergedAchievement,
          signInData: mergedSignIn,
          onlineData: mergedOnline,
          buffData: mergedBuff,
          monsterKillCount: mergedMonsterKill,
          bagEquipments: Array.isArray(parsedData.bagEquipments) ? parsedData.bagEquipments : [],
          isContinuousAttacking: false,
          continuousAttackTimerId: null,
          currentHp: Math.min(Number(parsedData.currentHp) || defaultState.currentHp, playerMaxHp.value),
          isPlayerDead: Boolean(parsedData.isPlayerDead) || false,
          autoMeditate: false,
          autoBattle: false
        }
        Object.assign(gameState, mergedData)

        startAgeTimer()
        startHpRegenTimer()
        startOnlineTimer()
        startBuffTimer()

        if (parsedData.autoMeditate && gameState.currentExp < currentRealmExpNeed.value) {
          gameState.autoMeditate = true
          startMeditateTimer()
        }
        return true
      }
    }
    startAgeTimer()
    startHpRegenTimer()
    startOnlineTimer()
    startBuffTimer()
    return false
  } catch (e) {
    console.warn('存档加载失败，已自动重置为新游戏', e)
    localStorage.removeItem('xianxia_game_save')
    Object.assign(gameState, initState())
    startAgeTimer()
    startHpRegenTimer()
    startOnlineTimer()
    startBuffTimer()
    return false
  }
}

export const resetGame = () => {
  stopMeditateTimer()
  Object.assign(gameState, initState())
  localStorage.removeItem('xianxia_game_save')
  startAgeTimer()
  startHpRegenTimer()
  startOnlineTimer()
  startBuffTimer()
}

loadGame()