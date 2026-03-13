import { reactive, computed, watch } from 'vue'
import { REALM_CONFIG, MAP_CONFIG, REINCARNATION_CONFIG, LEVEL_ATTR_CONFIG, REALM_LEVEL_ATTR, BIG_REALM_BONUS, EQUIPMENT_SET_CONFIG, ILLUSTRATION_CONFIG, ACHIEVEMENT_CONFIG, PILL_CONFIG, SKILL_CONFIG, SECT_CONFIG, CAVE_CONFIG, ROOT_CONFIG, MERIDIAN_CONFIG, SECRET_CONFIG, LEVEL_UP_ATTR, REALM_UP_ATTR } from './config.js'
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
  skills: {
    passive: [],
    active: [],
    equippedPassive: [],
    equippedActive: null,
    cd: {}
  },
  sect: {
    id: 0,
    name: '',
    rank: 0,
    contrib: 0,
    dailyTask: null,
    taskProgress: 0
  },
  cave: {
    spiritArrayLv: 1,
    spiritField: [],
    refineStoveLv: 1,
    pillStoveLv: 1
  },
  root: { grade: 0, quality: 0 },
  meridian: { unlocked: 0, lit: 0 },
  secret: {
    unlockCount: 0,
    available: false
  },
  heartDevilTest: false,
  shield: 0
})
export const gameState = reactive(initState())
let ageTimer, hpRegenTimer, meditateTimer, onlineTimer, buffTimer, caveTimer
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
    gameState.currentHp = Math.min(gameState.currentHp + regenHp, maxHp)
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
    const expFull = gameState.currentExp >= currentRealmExpNeed.value
    const hpFull = gameState.currentHp === playerMaxHp.value
    if (expFull && hpFull) {
      stopMeditateTimer()
      gameState.autoMeditate = false
      saveGame()
      return
    }
    if (expFull) {
      stopMeditateTimer()
      gameState.autoMeditate = false
      saveGame()
      return
    }
    const playerAttr = playerTotalAttribute.value
    const baseExp = 10
    const spiritArrayBonus = 1 + (gameState.cave.spiritArrayLv - 1) * 0.1
    const expGain = Math.floor(baseExp * playerAttr.expRate * spiritArrayBonus)
    gameState.currentExp = Math.min(gameState.currentExp + expGain, currentRealmExpNeed.value)
    saveGame()
  }, 1500)
}
export const stopMeditateTimer = () => {
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
const startCaveTimer = () => {
  if (caveTimer) return
  caveTimer = setInterval(() => {
    gameState.cave.spiritField.forEach(plant => {
      if (plant.endTime && Date.now() >= plant.endTime && !plant.ready) {
        plant.ready = true
      }
    })
    saveGame()
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
export const playerTotalAttribute = computed(() => {
  const baseAttr = gameState.baseAttribute
  const levelBonus = {
    power: LEVEL_UP_ATTR.power * gameState.level,
    constitution: LEVEL_UP_ATTR.constitution * gameState.level,
    agility: LEVEL_UP_ATTR.agility * gameState.level,
    comprehension: LEVEL_UP_ATTR.comprehension * gameState.level,
    luck: LEVEL_UP_ATTR.luck * gameState.level
  }
  const realmBonus = {
    power: REALM_UP_ATTR.power * gameState.currentRealmId,
    constitution: REALM_UP_ATTR.constitution * gameState.currentRealmId,
    agility: REALM_UP_ATTR.agility * gameState.currentRealmId,
    comprehension: REALM_UP_ATTR.comprehension * gameState.currentRealmId,
    luck: REALM_UP_ATTR.luck * gameState.currentRealmId
  }
  const equipAttr = calculateTotalEquipAttr()
  const rootConfig = ROOT_CONFIG[gameState.root.grade] || ROOT_CONFIG[0]
  const meridianBonus = 1 + (gameState.meridian.lit / (MERIDIAN_CONFIG.nodes || 20)) * (MERIDIAN_CONFIG.totalBonus?.allAttr || 0.5)
  let passiveBonus = { lifesteal: 0, defenseMulti: 1, dodgeAdd: 0, critAdd: 0 }
  gameState.skills.equippedPassive.forEach(sid => {
    const skill = SKILL_CONFIG.passive.find(s => s.id === sid)
    if (!skill) return
    const lv = gameState.skills.passive.find(x => x.id === sid)?.lv || 1
    if (skill.effect === 'lifesteal') passiveBonus.lifesteal += skill.lv1 * lv
    if (skill.effect === 'defenseBoost') passiveBonus.defenseMulti *= (1 + skill.lv1 * lv)
    if (skill.effect === 'dodgeBoost') passiveBonus.dodgeAdd += skill.lv1 * lv
    if (skill.effect === 'critBoost') passiveBonus.critAdd += skill.lv1 * lv
  })
  const setBonus = setBonusAttr.value
  const illustrationBonusVal = illustrationBonus.value
  const reincarnationMulti = reincarnationBonus.value
  const pillBuffBonusVal = pillBuffBonus.value
  const totalPower = (baseAttr.power + levelBonus.power + realmBonus.power + equipAttr.power) * rootConfig.attr * meridianBonus
  const totalConstitution = (baseAttr.constitution + levelBonus.constitution + realmBonus.constitution + equipAttr.constitution) * rootConfig.attr * meridianBonus
  const totalAgility = (baseAttr.agility + levelBonus.agility + realmBonus.agility + equipAttr.agility) * rootConfig.attr * meridianBonus
  const totalComprehension = (baseAttr.comprehension + levelBonus.comprehension + realmBonus.comprehension + equipAttr.comprehension) * rootConfig.attr * meridianBonus
  const totalLuck = (baseAttr.luck + levelBonus.luck + realmBonus.luck + equipAttr.luck) * rootConfig.attr * meridianBonus
  const baseAttack = (totalPower * 2 + equipAttr.attack)
    * bigRealmBonus.value.multiplier
    * setBonus.attack
    * illustrationBonusVal.attackMulti
    * pillBuffBonusVal.attackMulti
    * reincarnationMulti.attackMulti
    * passiveBonus.defenseMulti
  const baseHp = (totalConstitution * 20 + equipAttr.hp)
    * bigRealmBonus.value.multiplier
    * setBonus.hp
    * illustrationBonusVal.hpMulti
    * reincarnationMulti.hpMulti
    * passiveBonus.defenseMulti
  const baseDefense = (totalConstitution * 1 + equipAttr.defense)
    * bigRealmBonus.value.multiplier
    * setBonus.defense
    * illustrationBonusVal.defenseMulti
    * pillBuffBonusVal.defenseMulti
    * reincarnationMulti.defenseMulti
    * passiveBonus.defenseMulti
  return {
    attack: baseAttack,
    hp: baseHp,
    defense: baseDefense,
    critRate: totalAgility * 0.1 + setBonus.critRate + passiveBonus.critAdd,
    dodgeRate: totalAgility * 0.1 + passiveBonus.dodgeAdd,
    expRate: (1 + totalComprehension * 0.005) * rootConfig.rate * reincarnationMulti.expMulti * setBonus.expRate * illustrationBonusVal.expMulti,
    dropRate: totalLuck * 0.002 * reincarnationMulti.dropMulti + setBonus.dropRate + illustrationBonusVal.dropMulti - 1,
    critDamage: 1.3 + totalLuck * 0.003 * setBonus.critDamage,
    lifesteal: passiveBonus.lifesteal
  }
})
export const baseAttrBonus = computed(() => gameState.baseAttribute)
export const equipAttrBonus = computed(() => calculateTotalEquipAttr())
export const levelExpProgress = computed(() => {
  return Math.min((gameState.levelExp / gameState.levelMaxExp) * 100, 100)
})
export const currentRealm = computed(() => REALM_CONFIG.find(realm => realm.id === gameState.currentRealmId) || REALM_CONFIG[0])
export const currentRealmExpNeed = computed(() => currentRealm.value.baseExp * Math.pow(1.5, gameState.currentLevel - 1))
export const currentRealmKillNeed = computed(() => Math.min(Math.floor(currentRealm.value.baseKillNeed * Math.pow(1.8, gameState.currentLevel - 1)), 100000))
export const currentMap = computed(() => MAP_CONFIG.find(map => map.id === gameState.currentMapId) || MAP_CONFIG[0])
export const playerMaxHp = computed(() => playerTotalAttribute.value.hp)
export const hpProgress = computed(() => Math.min((gameState.currentHp / playerMaxHp.value) * 100, 100))
export const expProgress = computed(() => Math.min((gameState.currentExp / currentRealmExpNeed.value) * 100, 100))
export const killProgress = computed(() => Math.min((gameState.realmKillCount / currentRealmKillNeed.value) * 100, 100))
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
  const expFull = gameState.currentExp >= currentRealmExpNeed.value
  const hpFull = gameState.currentHp === playerMaxHp.value
  if (!gameState.autoMeditate && expFull && hpFull) {
    return { success: false, msg: '修为已满且气血已满，无需打坐' }
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
export const castActiveSkill = (sid) => {
  const skill = SKILL_CONFIG.active.find(s => s.id === sid)
  if (!skill || gameState.skills.cd[sid] > Date.now()) {
    return { success: false, msg: '技能冷却中或不存在' }
  }
  gameState.skills.cd[sid] = Date.now() + skill.cd
  gameState.skills.equippedActive = sid
  if (skill.effect === 'shield') {
    gameState.shield = 1
  }
  saveGame()
  return { success: true, skill, msg: `释放${skill.name}成功！` }
}

export const usePill = (pillId) => {
  const pillConfig = PILL_CONFIG[pillId]
  if (!pillConfig) {
    return { success: false, msg: '丹药不存在' }
  }
  if (!gameState.pills || gameState.pills[pillId] <= 0) {
    return { success: false, msg: '丹药数量不足' }
  }

  gameState.pills[pillId] -= 1

  if (pillConfig.type === 'instant') {
    if (pillConfig.effect?.exp) {
      gameState.currentExp = Math.min(
        gameState.currentExp + pillConfig.effect.exp,
        currentRealmExpNeed.value
      )
    }
  }

  if (pillConfig.type === 'buff') {
    const now = Date.now()
    const currentEndTime = gameState.buffData?.[pillId]?.endTime || 0
    const finalEndTime = currentEndTime > now ? currentEndTime : now
    if (!gameState.buffData[pillId]) {
      gameState.buffData[pillId] = { endTime: 0 }
    }
    gameState.buffData[pillId].endTime = finalEndTime + pillConfig.duration
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

export const checkRealmBreakable = () => {
  const { currentExp, realmKillCount } = gameState
  const expNeed = currentRealmExpNeed.value
  const killNeed = currentRealmKillNeed.value
  return currentExp >= expNeed && realmKillCount >= killNeed
}
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
        const mergedData = {
          ...defaultState,
          ...parsedData,
          items: mergedItems,
          pills: mergedPills,
          bagEquipments: Array.isArray(parsedData.bagEquipments) ? parsedData.bagEquipments : [],
          skills: { ...defaultState.skills, ...parsedData.skills },
          sect: { ...defaultState.sect, ...parsedData.sect },
          cave: { ...defaultState.cave, ...parsedData.cave },
          root: { ...defaultState.root, ...parsedData.root },
          meridian: { ...defaultState.meridian, ...parsedData.meridian },
          secret: { ...defaultState.secret, ...parsedData.secret },
          isContinuousAttacking: false,
          continuousAttackTimerId: null,
          currentHp: Math.min(Number(parsedData.currentHp) || defaultState.currentHp, playerMaxHp.value),
          isPlayerDead: Boolean(parsedData.isPlayerDead) || false,
          autoMeditate: false,
          autoBattle: false,
          shield: 0
        }
        Object.assign(gameState, mergedData)
        startAgeTimer()
        startHpRegenTimer()
        startOnlineTimer()
        startBuffTimer()
        startCaveTimer()
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
    startCaveTimer()
    return false
  } catch (e) {
    console.warn('存档加载失败，已自动重置为新游戏', e)
    localStorage.removeItem('xianxia_game_save')
    Object.assign(gameState, initState())
    startAgeTimer()
    startHpRegenTimer()
    startOnlineTimer()
    startBuffTimer()
    startCaveTimer()
    return false
  }
}
export const resetGame = () => {
  stopMeditateTimer()
  if (ageTimer) clearInterval(ageTimer)
  if (hpRegenTimer) clearInterval(hpRegenTimer)
  if (onlineTimer) clearInterval(onlineTimer)
  if (buffTimer) clearInterval(buffTimer)
  if (caveTimer) clearInterval(caveTimer)
  Object.assign(gameState, initState())
  localStorage.removeItem('xianxia_game_save')
  startAgeTimer()
  startHpRegenTimer()
  startOnlineTimer()
  startBuffTimer()
  startCaveTimer()
}
loadGame()