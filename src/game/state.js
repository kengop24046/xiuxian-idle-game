import { reactive, computed, watch } from 'vue'
import { 
  REALM_CONFIG, MAP_CONFIG, REINCARNATION_CONFIG, LEVEL_ATTR_CONFIG, 
  REALM_LEVEL_ATTR, BIG_REALM_BONUS, EQUIPMENT_SET_CONFIG, 
  ILLUSTRATION_CONFIG, ACHIEVEMENT_CONFIG, PILL_CONFIG, 
  SKILL_CONFIG, SECT_CONFIG, CAVE_CONFIG, ROOT_CONFIG, 
  MERIDIAN_CONFIG, SECRET_CONFIG, LEVEL_UP_ATTR, REALM_UP_ATTR,
  ASCEND_CONFIG, IMMORTAL_REALM_CONFIG, PET_CONFIG, 
  SKY_TOWER_CONFIG, ARENA_CONFIG, BATTLE_SPEED_CONFIG,
  ITEM_TYPE, ITEM_CONFIG, BACKPACK_CONFIG, EQUIPMENT_CONFIG,
  MONSTER_CONFIG, IMMORTAL_MONSTER_CONFIG
} from './config.js'
import { formatNumber, randomInt, randomChance, generateUUID } from './utils.js'
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
    arenaCoin: 0,
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
  shield: 0,
  isAscended: false,
  immortalRealmId: 0,
  immortalLevel: 1,
  immortalExp: 0,
  lastOfflineTime: Date.now(),
  offlineReward: null,
  pets: [],
  currentPetId: null,
  petHatchProgress: null,
  skyTowerCurrentLayer: 1,
  skyTowerMaxLayer: 1,
  skyTowerMonster: null,
  skyTowerDebuff: null,
  arenaRank: ARENA_CONFIG.baseRank,
  arenaChallengeTimes: ARENA_CONFIG.challengeTimes,
  arenaLastResetTime: Date.now(),
  arenaSeason: 1,
  arenaSeasonEndTime: Date.now() + ARENA_CONFIG.seasonDays * 86400000,
  battleSpeed: 1,
  backpack: {
    slots: Array(BACKPACK_CONFIG.initCapacity).fill(null),
    capacity: BACKPACK_CONFIG.initCapacity,
    maxUnlockedCapacity: BACKPACK_CONFIG.initCapacity,
  }
})

export const gameState = reactive(initState())

let ageTimer, hpRegenTimer, meditateTimer, onlineTimer, buffTimer, caveTimer, petHealTimer

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

const startPetHealTimer = () => {
  if(petHealTimer) return
  petHealTimer = setInterval(()=>{
    const pet = currentPet.value
    if(!pet || pet.config.skill.effect !== 'heal') return
    const heal = Math.floor(playerMaxHp.value * 0.02)
    gameState.currentHp = Math.min(gameState.currentHp + heal, playerMaxHp.value)
    saveGame()
  }, 5000)
}

window.addEventListener('beforeunload', () => {
  gameState.lastOfflineTime = Date.now()
  saveGame()
})

export const backpackUsedCount = computed(() => {
  return gameState.backpack.slots.filter(slot => slot !== null).length
})

export const isBackpackFull = computed(() => {
  return backpackUsedCount.value >= gameState.backpack.capacity
})

export const backpackEmptySlots = computed(() => {
  const emptyIndex = []
  gameState.backpack.slots.forEach((slot, index) => {
    if (slot === null) emptyIndex.push(index)
  })
  return emptyIndex
})

export const backpackItemsByType = computed(() => {
  const result = {
    [ITEM_TYPE.EQUIP]: [],
    [ITEM_TYPE.MATERIAL]: [],
    [ITEM_TYPE.PILL]: [],
    [ITEM_TYPE.PET_EGG]: [],
    [ITEM_TYPE.FABAO]: [],
    [ITEM_TYPE.TASK]: [],
    [ITEM_TYPE.OTHER]: [],
    all: []
  }
  gameState.backpack.slots.forEach(slot => {
    if (!slot) return
    result.all.push(slot)
    result[slot.itemType] ? result[slot.itemType].push(slot) : result[ITEM_TYPE.OTHER].push(slot)
  })
  return result
})

watch(() => gameState.backpack.slots, () => {
  const newItems = { strengthenStone: 0, upgradeStone: 0, starStone: 0, resetPill: 0, arenaCoin: 0 }
  const newPills = { expPill: 0, superExpPill: 0, attackPill: 0, defensePill: 0, resetPill: 0 }
  const newPetEggs = { normal: 0, rare: 0, legendary: 0 }
  const newBagEquipments = []
  gameState.backpack.slots.forEach(slot => {
    if (!slot) return
    if (slot.itemType === ITEM_TYPE.EQUIP) newBagEquipments.push(slot.equipData)
    if (newItems[slot.itemId] !== undefined) newItems[slot.itemId] += slot.count
    if (newPills[slot.itemId] !== undefined) newPills[slot.itemId] += slot.count
    if (slot.itemType === ITEM_TYPE.PET_EGG) {
      const eggType = ITEM_CONFIG[slot.itemId]?.useEffect?.eggType
      if (eggType && newPetEggs[eggType] !== undefined) newPetEggs[eggType] += slot.count
    }
  })
  Object.assign(gameState.items, newItems)
  Object.assign(gameState.pills, newPills)
  gameState.bagEquipments = newBagEquipments
}, { deep: true, immediate: true })

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

export const currentPet = computed(() => {
  if(!gameState.currentPetId) return null
  const pet = gameState.pets.find(p=>p.id===gameState.currentPetId)
  if(!pet) return null
  const config = PET_CONFIG[pet.configId]
  return { ...pet, config, atk: config.baseAtk * pet.quality * pet.level, hp: config.baseHp * pet.quality * pet.level, def: config.baseDef * pet.quality * pet.level }
})

export const petAttrBonus = computed(() => {
  const pet = currentPet.value
  if(!pet) return { attackMulti:1, hpMulti:1, defenseMulti:1 }
  return { attackMulti: 1 + pet.atk * 0.0001, hpMulti: 1 + pet.hp * 0.00005, defenseMulti: 1 + pet.def * 0.0001 }
})

export const currentImmortalRealm = computed(() => IMMORTAL_REALM_CONFIG.find(r=>r.id===gameState.immortalRealmId) || IMMORTAL_REALM_CONFIG[0])
export const immortalRealmExpNeed = computed(() => gameState.isAscended ? currentImmortalRealm.value.baseExp * Math.pow(1.8, gameState.immortalLevel-1) : 0)
export const canAscend = computed(() => gameState.currentRealmId >= ASCEND_CONFIG.unlockRealmId && !gameState.isAscended)
export const allMapConfig = computed(() => gameState.isAscended ? [...MAP_CONFIG, ...IMMORTAL_MAP_CONFIG] : MAP_CONFIG)
export const allMonsterConfig = computed(() => gameState.isAscended ? [...MONSTER_CONFIG, ...IMMORTAL_MONSTER_CONFIG] : MONSTER_CONFIG)

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
  const petBonus = petAttrBonus.value
  const bigRealmBonusVal = bigRealmBonus.value
  const skyTowerDebuff = gameState.skyTowerDebuff || {}
  const ascendBonus = gameState.isAscended ? ASCEND_CONFIG.ascendAttrMulti : 1
  const totalPower = (baseAttr.power + levelBonus.power + realmBonus.power + equipAttr.power) * rootConfig.attr * meridianBonus
  const totalConstitution = (baseAttr.constitution + levelBonus.constitution + realmBonus.constitution + equipAttr.constitution) * rootConfig.attr * meridianBonus
  const totalAgility = (baseAttr.agility + levelBonus.agility + realmBonus.agility + equipAttr.agility) * rootConfig.attr * meridianBonus
  const totalComprehension = (baseAttr.comprehension + levelBonus.comprehension + realmBonus.comprehension + equipAttr.comprehension) * rootConfig.attr * meridianBonus
  const totalLuck = (baseAttr.luck + levelBonus.luck + realmBonus.luck + equipAttr.luck) * rootConfig.attr * meridianBonus
  let baseAttack = (totalPower * 2 + equipAttr.attack)
    * bigRealmBonusVal.multiplier
    * setBonus.attack
    * illustrationBonusVal.attackMulti
    * pillBuffBonusVal.attackMulti
    * reincarnationMulti.attackMulti
    * passiveBonus.defenseMulti
    * petBonus.attackMulti
    * ascendBonus
  let baseHp = (totalConstitution * 20 + equipAttr.hp)
    * bigRealmBonusVal.multiplier
    * setBonus.hp
    * illustrationBonusVal.hpMulti
    * reincarnationMulti.hpMulti
    * passiveBonus.defenseMulti
    * petBonus.hpMulti
    * ascendBonus
  let baseDefense = (totalConstitution * 1 + equipAttr.defense)
    * bigRealmBonusVal.multiplier
    * setBonus.defense
    * illustrationBonusVal.defenseMulti
    * pillBuffBonusVal.defenseMulti
    * reincarnationMulti.defenseMulti
    * passiveBonus.defenseMulti
    * petBonus.defenseMulti
    * ascendBonus
  let critRate = totalAgility * 0.1 + setBonus.critRate + passiveBonus.critAdd
  let dodgeRate = totalAgility * 0.1 + passiveBonus.dodgeAdd
  if(skyTowerDebuff.effect?.attackMulti) baseAttack *= skyTowerDebuff.effect.attackMulti
  if(skyTowerDebuff.effect?.dodgeMulti) dodgeRate *= skyTowerDebuff.effect.dodgeMulti
  if(skyTowerDebuff.effect?.critRate === 0) critRate = 0
  return {
    attack: baseAttack,
    hp: baseHp,
    defense: baseDefense,
    critRate: critRate,
    dodgeRate: dodgeRate,
    expRate: (1 + totalComprehension * 0.005) * rootConfig.rate * reincarnationMulti.expMulti * setBonus.expRate * illustrationBonusVal.expMulti * ascendBonus,
    dropRate: totalLuck * 0.002 * reincarnationMulti.dropMulti + setBonus.dropRate + illustrationBonusVal.dropMulti - 1,
    critDamage: 1.3 + totalLuck * 0.003 * setBonus.critDamage,
    lifesteal: passiveBonus.lifesteal
  }
})

export const baseAttrBonus = computed(() => gameState.baseAttribute)
export const equipAttrBonus = computed(() => calculateTotalEquipAttr())
export const levelExpProgress = computed(() => Math.min((gameState.levelExp / gameState.levelMaxExp) * 100, 100))
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

export const autoCastActiveSkill = () => {
  const equippedActiveSid = gameState.skills.equippedActive
  if (!equippedActiveSid) {
    return { success: false, msg: '未装备主动神通', type: 'no_skill' }
  }

  const isOnCooldown = gameState.skills.cd[equippedActiveSid] > Date.now()
  if (isOnCooldown) {
    const remainingCd = Math.ceil((gameState.skills.cd[equippedActiveSid] - Date.now()) / 1000)
    return { 
      success: false, 
      msg: `主动神通冷却中，剩余${remainingCd}秒`, 
      type: 'cooldown',
      remainingCd 
    }
  }

  const castResult = castActiveSkill(equippedActiveSid)
  return {
    ...castResult,
    type: 'cast_success'
  }
}

export const usePill = (pillId, slotId = null) => {
  const pillConfig = PILL_CONFIG[pillId]
  if (!pillConfig) {
    return { success: false, msg: '丹药不存在' }
  }
  const hasItem = removeItem(pillId, 1, slotId)
  if (!hasItem) {
    return { success: false, msg: '丹药数量不足' }
  }

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
    gameState.buffData[pillId].endTime = finalEndTime + pillConfig.effect.duration
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

export const removeItem = (itemId, count, slotId = null) => {
  if (count <= 0) return false
  let removed = false
  if (slotId !== null) {
    const slot = gameState.backpack.slots[slotId]
    if (slot && slot.itemId === itemId) {
      if (slot.count > count) {
        slot.count -= count
        removed = true
      } else if (slot.count === count) {
        gameState.backpack.slots[slotId] = null
        removed = true
      }
    }
  } else {
    for (let i = 0; i < gameState.backpack.slots.length; i++) {
      const slot = gameState.backpack.slots[i]
      if (slot && slot.itemId === itemId && slot.count > 0) {
        if (slot.count > count) {
          slot.count -= count
          removed = true
          break
        } else if (slot.count === count) {
          gameState.backpack.slots[i] = null
          removed = true
          break
        } else {
          count -= slot.count
          gameState.backpack.slots[i] = null
          removed = true
        }
      }
    }
  }
  if (removed) saveGame()
  return removed
}

export const addItem = (itemId, count, data = null) => {
  if (count <= 0) return false
  const isEquipment = data?.itemType === ITEM_TYPE.EQUIP && data?.equipData
  let itemConfig = ITEM_CONFIG[itemId]

  if (isEquipment && !itemConfig) {
    const equip = data.equipData
    itemConfig = {
      id: itemId,
      name: equip.name || '未知装备',
      type: ITEM_TYPE.EQUIP,
      stackMax: 1,
      isBind: false,
      canSell: true,
      icon: data.config?.icon || '🛡️',
      desc: `${equip.qualityName || '普通'} ${equip.partName || '装备'}，Lv.${equip.level || 1}`
    }
  }

  if (!itemConfig) {
    console.warn(`物品配置不存在：${itemId}`)
    return false
  }

  const itemType = itemConfig.type || ITEM_TYPE.OTHER
  const stackMax = itemConfig.stackMax || 999

  for (let i = 0; i < gameState.backpack.slots.length; i++) {
    const slot = gameState.backpack.slots[i]
    if (slot && slot.itemId === itemId && slot.count < stackMax) {
      const addCount = Math.min(count, stackMax - slot.count)
      slot.count += addCount
      count -= addCount
      if (count <= 0) {
        saveGame()
        return true
      }
    }
  }

  const emptySlots = []
  for (let i = 0; i < gameState.backpack.slots.length; i++) {
    if (gameState.backpack.slots[i] === null) {
      emptySlots.push(i)
    }
  }

  if (emptySlots.length === 0) {
    console.warn(`背包已满，无法添加${itemConfig.name}x${count}`)
    return false
  }

  for (let i = 0; i < emptySlots.length && count > 0; i++) {
    const slotIndex = emptySlots[i]
    const addCount = Math.min(count, stackMax)
    gameState.backpack.slots[slotIndex] = {
      slotId: slotIndex,
      itemId,
      itemName: itemConfig.name,
      itemType,
      count: addCount,
      stackMax,
      config: itemConfig,
      getTime: Date.now(),
      isBind: itemConfig.isBind || false,
      ...data
    }
    count -= addCount
  }

  saveGame()
  return count <= 0
}

export const claimOfflineReward = () => {
  if (!gameState.offlineReward) {
    console.warn('无可用离线收益')
    return { success: false, msg: '无可用离线收益' }
  }

  gameState.gold += gameState.offlineReward.gold
  gameState.totalGoldGet += gameState.offlineReward.gold

  const maxExp = currentRealmExpNeed.value
  const addExp = gameState.offlineReward.exp
  gameState.currentExp = Math.min(gameState.currentExp + addExp, maxExp)

  gameState.items.strengthenStone += gameState.offlineReward.strengthenStone

  gameState.offlineReward = null

  saveGame()

  return { success: true, msg: '离线收益领取成功！' }
}

export const setBattleSpeed = (speed) => {
  const validSpeeds = Object.values(BATTLE_SPEED_CONFIG)
  if (!validSpeeds.includes(speed)) {
    console.warn(`无效的战斗倍速：${speed}，仅支持 ${validSpeeds.join(', ')}x`)
    return { success: false, msg: `无效倍速，仅支持 ${validSpeeds.join(', ')}x` }
  }

  gameState.battleSpeed = speed
  saveGame()

  return { success: true, msg: `战斗倍速已设置为 ${speed}x` }
}

export const expandBackpack = () => {
  const { maxCapacity, expandStep, expandCost } = BACKPACK_CONFIG
  const currentCapacity = gameState.backpack.capacity
  const currentMaxUnlocked = gameState.backpack.maxUnlockedCapacity

  if (currentMaxUnlocked >= maxCapacity) {
    return { success: false, msg: '背包已达最大容量，无法继续扩容' }
  }

  const costItemId = expandCost.itemId || 'strengthenStone'
  const costCount = expandCost.count || 50
  if (gameState.items[costItemId] < costCount) {
    const itemName = ITEM_CONFIG[costItemId]?.name || '强化石'
    return { success: false, msg: `${itemName}不足，扩容需${costCount}个` }
  }

  gameState.items[costItemId] -= costCount
  const newCapacity = Math.min(currentCapacity + expandStep, maxCapacity)
  gameState.backpack.capacity = newCapacity
  gameState.backpack.maxUnlockedCapacity = newCapacity

  const slotCountNeed = newCapacity - gameState.backpack.slots.length
  if (slotCountNeed > 0) {
    gameState.backpack.slots.push(...Array(slotCountNeed).fill(null))
  }

  saveGame()

  return { 
    success: true, 
    msg: `背包扩容成功！当前容量：${newCapacity}/${maxCapacity}格`,
    newCapacity,
    remainingMax: maxCapacity - newCapacity
  }
}

export const hatchPetEgg = (eggItemId, slotId = null) => {
  const eggConfig = ITEM_CONFIG[eggItemId]
  if (!eggConfig || eggConfig.type !== ITEM_TYPE.PET_EGG) {
    console.warn(`无效的宠物蛋：${eggItemId}`)
    return { success: false, msg: '所选物品不是宠物蛋' }
  }

  const hasEgg = removeItem(eggItemId, 1, slotId)
  if (!hasEgg) {
    return { success: false, msg: '宠物蛋数量不足' }
  }

  const eggType = eggConfig.useEffect?.eggType || 'normal'
  const petConfigList = Object.values(PET_CONFIG).filter(config => config.eggType === eggType)
  if (petConfigList.length === 0) {
    return { success: false, msg: '暂无对应类型的宠物配置' }
  }

  let selectedPetConfig
  if (eggType === 'legendary') {
    const highQualityConfigs = petConfigList.filter(c => c.quality >= 3)
    selectedPetConfig = highQualityConfigs[randomInt(0, highQualityConfigs.length - 1)]
  } else if (eggType === 'rare') {
    selectedPetConfig = randomChance(70) 
      ? petConfigList.filter(c => c.quality >= 2)[randomInt(0, petConfigList.filter(c => c.quality >= 2).length - 1)]
      : petConfigList[randomInt(0, petConfigList.length - 1)]
  } else {
    selectedPetConfig = petConfigList[randomInt(0, petConfigList.length - 1)]
  }

  const newPet = {
    id: generateUUID(),
    configId: selectedPetConfig.id,
    name: selectedPetConfig.name,
    level: 1,
    exp: 0,
    maxExp: 100,
    quality: selectedPetConfig.quality,
    atk: selectedPetConfig.baseAtk * selectedPetConfig.quality,
    hp: selectedPetConfig.baseHp * selectedPetConfig.quality,
    def: selectedPetConfig.baseDef * selectedPetConfig.quality,
    skill: selectedPetConfig.skill,
    hatchTime: Date.now()
  }

  gameState.pets.push(newPet)

  if (!gameState.currentPetId) {
    gameState.currentPetId = newPet.id
  }

  saveGame()

  return {
    success: true,
    msg: `孵化成功！获得宠物【${newPet.name}】（品质${newPet.quality}星）`,
    pet: newPet
  }
}

export const levelUpPet = (petId) => {
  const petIndex = gameState.pets.findIndex(pet => pet.id === petId)
  if (petIndex === -1) {
    console.warn(`不存在ID为${petId}的宠物`)
    return { success: false, msg: '所选宠物不存在' }
  }
  const pet = gameState.pets[petIndex]
  const petConfig = PET_CONFIG[pet.configId]
  if (!petConfig) {
    return { success: false, msg: '宠物配置不存在，无法升级' }
  }

  const MAX_PET_LEVEL = 100
  if (pet.level >= MAX_PET_LEVEL) {
    return { success: false, msg: `宠物已达最大等级${MAX_PET_LEVEL}级` }
  }

  const LEVEL_UP_COST = {
    itemId: 'strengthenStone',
    count: pet.level * 10,
  }
  const costItemName = ITEM_CONFIG[LEVEL_UP_COST.itemId]?.name || '强化石'

  if (gameState.items[LEVEL_UP_COST.itemId] < LEVEL_UP_COST.count) {
    return { 
      success: false, 
      msg: `${costItemName}不足，升级需${LEVEL_UP_COST.count}个，当前仅${gameState.items[LEVEL_UP_COST.itemId]}个` 
    }
  }

  removeItem(LEVEL_UP_COST.itemId, LEVEL_UP_COST.count)

  pet.level += 1
  pet.maxExp = pet.level * 100
  pet.exp = 0
  pet.atk = petConfig.baseAtk * pet.quality * pet.level
  pet.hp = petConfig.baseHp * pet.quality * pet.level
  pet.def = petConfig.baseDef * pet.quality * pet.level

  gameState.pets[petIndex] = pet

  saveGame()

  return {
    success: true,
    msg: `【${pet.name}】升级成功！当前等级${pet.level}级`,
    pet: pet,
    newLevel: pet.level,
    cost: LEVEL_UP_COST
  }
}

export const setCurrentPet = (petId) => {
  if (petId === null || petId === undefined) {
    gameState.currentPetId = null
    saveGame()
    return { success: true, msg: '已取消宠物出战', currentPet: null }
  }

  const targetPet = gameState.pets.find(pet => pet.id === petId)
  if (!targetPet) {
    console.warn(`不存在ID为${petId}的宠物，无法设置出战`)
    return { success: false, msg: '所选宠物不存在，无法设置出战' }
  }

  if (gameState.currentPetId === petId) {
    return { success: false, msg: '该宠物已处于出战状态' }
  }

  gameState.currentPetId = petId
  saveGame()

  return {
    success: true,
    msg: `成功设置【${targetPet.name}】为出战宠物`,
    currentPet: targetPet
  }
}

export const ascendToImmortal = () => {
  if (gameState.isAscended) {
    return { success: false, msg: '你已飞升仙界，无需重复飞升' }
  }

  if (!canAscend.value) {
    const unlockRealm = REALM_CONFIG.find(r => r.id === ASCEND_CONFIG.unlockRealmId)
    return { 
      success: false, 
      msg: `飞升条件不足！需达到【${unlockRealm?.name || '指定境界'}】才可飞升` 
    }
  }

  gameState.autoBattle = false
  gameState.autoMeditate = false
  stopMeditateTimer()

  gameState.isAscended = true
  gameState.immortalRealmId = 1
  gameState.immortalLevel = 1
  gameState.immortalExp = 0
  gameState.currentHp = playerMaxHp.value

  const ascendReward = ASCEND_CONFIG.firstAscendReward || {
    gold: 100000,
    items: [
      { itemId: 'strengthenStone', count: 100 },
      { itemId: 'upgradeStone', count: 50 },
      { itemId: 'starStone', count: 20 }
    ],
    freeAttributePoint: 50
  }

  if (ascendReward.gold && ascendReward.gold > 0) {
    gameState.gold += ascendReward.gold
    gameState.totalGoldGet += ascendReward.gold
  }

  if (ascendReward.freeAttributePoint && ascendReward.freeAttributePoint > 0) {
    gameState.freeAttributePoint += ascendReward.freeAttributePoint
  }

  if (ascendReward.items && Array.isArray(ascendReward.items)) {
    ascendReward.items.forEach(item => {
      if (item.itemId && item.count > 0) {
        addItem(item.itemId, item.count)
      }
    })
  }

  saveGame()

  return {
    success: true,
    msg: '恭喜！你已成功渡劫飞升，踏入仙界！全属性大幅提升，解锁仙界全新玩法！',
    reward: ascendReward,
    isAscended: true
  }
}

export const oneKeyDecomposeEquip = () => {
  const equipSlots = gameState.backpack.slots.filter(slot => 
    slot && slot.itemType === ITEM_TYPE.EQUIP && slot.equipData
  )
  if (equipSlots.length === 0) {
    return { success: false, msg: '背包中无可用装备可分解' }
  }

  const decomposeReward = {
    1: { strengthenStone: 1 },
    2: { strengthenStone: 2 },
    3: { strengthenStone: 3, upgradeStone: 1 },
    4: { strengthenStone: 5, upgradeStone: 2 },
    5: { strengthenStone: 8, upgradeStone: 3, starStone: 1 },
    6: { strengthenStone: 12, upgradeStone: 5, starStone: 2 }
  }

  const decomposedCount = equipSlots.length
  const totalRewards = { strengthenStone: 0, upgradeStone: 0, starStone: 0 }

  equipSlots.forEach(slot => {
    const slotIndex = gameState.backpack.slots.findIndex(s => s.slotId === slot.slotId)
    if (slotIndex !== -1) {
      gameState.backpack.slots[slotIndex] = null
    }

    const equipQuality = slot.equipData.qualityId || 1
    const reward = decomposeReward[Math.min(equipQuality, 6)] || decomposeReward[1]
    Object.keys(reward).forEach(itemId => {
      totalRewards[itemId] += reward[itemId]
    })
  })

  Object.keys(totalRewards).forEach(itemId => {
    const count = totalRewards[itemId]
    if (count > 0) {
      addItem(itemId, count)
    }
  })

  saveGame()

  return {
    success: true,
    msg: `一键分解成功！共分解${decomposedCount}件装备`,
    decomposedCount,
    rewards: totalRewards
  }
}

export const oneKeySellItems = () => {
  const sellableTypes = [ITEM_TYPE.MATERIAL, ITEM_TYPE.PILL, ITEM_TYPE.OTHER]
  const sellableSlots = gameState.backpack.slots.filter(slot => 
    slot && sellableTypes.includes(slot.itemType) && !slot.isBind
  )

  if (sellableSlots.length === 0) {
    return { success: false, msg: '背包中无可出售的物品' }
  }

  const getSellPrice = (itemId, itemType) => {
    const itemConfig = ITEM_CONFIG[itemId]
    if (itemConfig?.price) return itemConfig.price
    switch (itemType) {
      case ITEM_TYPE.MATERIAL:
        return itemId === 'strengthenStone' ? 5 : itemId === 'upgradeStone' ? 10 : itemId === 'starStone' ? 20 : 3
      case ITEM_TYPE.PILL:
        return itemId === 'expPill' ? 15 : itemId === 'superExpPill' ? 50 : itemId === 'attackPill' ? 25 : itemId === 'defensePill' ? 25 : 10
      default:
        return 2
    }
  }

  let totalGold = 0
  const soldItems = {}

  sellableSlots.forEach(slot => {
    const { itemId, itemType, count, itemName } = slot
    const unitPrice = getSellPrice(itemId, itemType)
    const itemTotal = unitPrice * count
    totalGold += itemTotal

    soldItems[itemId] = {
      name: itemName,
      count: (soldItems[itemId]?.count || 0) + count,
      unitPrice,
      total: (soldItems[itemId]?.total || 0) + itemTotal
    }

    const slotIndex = gameState.backpack.slots.findIndex(s => s.slotId === slot.slotId)
    if (slotIndex !== -1) {
      gameState.backpack.slots[slotIndex] = null
    }
  })

  gameState.gold += totalGold
  gameState.totalGoldGet += totalGold

  saveGame()

  return {
    success: true,
    msg: `一键出售成功！共获得${totalGold}金币`,
    totalGold,
    soldItemsCount: Object.keys(soldItems).length,
    soldItems
  }
}

export const oneKeyUseExpPills = () => {
  const expPillTypes = ['expPill', 'superExpPill']
  const expPillSlots = gameState.backpack.slots.filter(slot => 
    slot && expPillTypes.includes(slot.itemId) && slot.itemType === ITEM_TYPE.PILL
  )

  if (expPillSlots.length === 0) {
    return { success: false, msg: '背包中无经验丹可使用' }
  }

  const getPillExp = (pillId) => {
    const pillConfig = PILL_CONFIG[pillId]
    return pillConfig?.effect?.exp || (pillId === 'superExpPill' ? 500 : 100)
  }

  let totalExp = 0
  const usedPills = {}
  let remainingExpSpace = currentRealmExpNeed.value - gameState.currentExp

  const sortedPills = [...expPillSlots].sort((a, b) => 
    expPillTypes.indexOf(a.itemId) - expPillTypes.indexOf(b.itemId)
  )

  for (const slot of sortedPills) {
    const { itemId, count, itemName } = slot
    const singleExp = getPillExp(itemId)
    const maxUsableCount = Math.floor(remainingExpSpace / singleExp)
    const actualUseCount = Math.min(count, maxUsableCount)

    if (actualUseCount <= 0) break

    const batchExp = actualUseCount * singleExp
    totalExp += batchExp
    remainingExpSpace -= batchExp

    usedPills[itemId] = {
      name: itemName,
      count: (usedPills[itemId]?.count || 0) + actualUseCount,
      singleExp,
      totalExp: (usedPills[itemId]?.totalExp || 0) + batchExp
    }

    if (actualUseCount === count) {
      const slotIndex = gameState.backpack.slots.findIndex(s => s.slotId === slot.slotId)
      if (slotIndex !== -1) gameState.backpack.slots[slotIndex] = null
    } else {
      slot.count -= actualUseCount
    }
  }

  if (totalExp === 0) {
    return { success: false, msg: '当前境界经验已满，无法使用经验丹' }
  }

  gameState.currentExp += totalExp
  const isLevelUp = checkLevelUp()

  saveGame()

  return {
    success: true,
    msg: `一键使用经验丹成功！共获得${totalExp}修为${isLevelUp ? '，已自动升级' : ''}`,
    totalExp,
    usedPillsCount: Object.keys(usedPills).length,
    usedPills,
    isLevelUp
  }
}

export const wearEquip = (equipSlot, equipPart) => {
  if (!equipSlot || equipSlot.itemType !== ITEM_TYPE.EQUIP || !equipSlot.equipData) {
    console.warn('无效的装备数据')
    return { success: false, msg: '所选物品不是有效装备' }
  }
  const validParts = ['weapon', 'helmet', 'armor', 'belt', 'shoes', 'necklace', 'ring', 'bracers']
  if (!validParts.includes(equipPart)) {
    console.warn(`无效的装备部位：${equipPart}`)
    return { success: false, msg: '装备部位无效' }
  }

  const oldEquip = gameState.equippedEquipments[equipPart]
  gameState.equippedEquipments[equipPart] = equipSlot.equipData

  const slotIndex = gameState.backpack.slots.findIndex(slot => slot?.slotId === equipSlot.slotId)
  if (slotIndex !== -1) {
    gameState.backpack.slots[slotIndex] = null
  }

  if (oldEquip) {
    const oldEquipConfig = Object.values(EQUIPMENT_CONFIG).find(config => 
      config.id === oldEquip.id
    ) || { name: '旧装备', type: ITEM_TYPE.EQUIP, stackMax: 1 }
    addItem(`equip_${oldEquip.id}`, 1, {
      equipData: oldEquip,
      itemType: ITEM_TYPE.EQUIP,
      itemName: oldEquipConfig.name
    })
  }

  saveGame()

  return {
    success: true,
    msg: `成功穿戴【${equipSlot.itemName}】到${equipPart === 'weapon' ? '武器' : 
      equipPart === 'helmet' ? '头盔' : 
      equipPart === 'armor' ? '铠甲' : 
      equipPart === 'belt' ? '腰带' : 
      equipPart === 'shoes' ? '鞋子' : 
      equipPart === 'necklace' ? '项链' : 
      equipPart === 'ring' ? '戒指' : '护腕'}部位`,
    newEquip: equipSlot.equipData,
    oldEquip: oldEquip || null
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
        const mergedData = {
          ...defaultState,
          ...parsedData,
          items: { ...defaultState.items, ...parsedData.items },
          pills: { ...defaultState.pills, ...parsedData.pills },
          equippedEquipments: { ...defaultState.equippedEquipments, ...parsedData.equippedEquipments },
          backpack: { ...defaultState.backpack, ...parsedData.backpack },
          pets: Array.isArray(parsedData.pets) ? parsedData.pets : defaultState.pets,
          skills: { ...defaultState.skills, ...parsedData.skills },
          sect: { ...defaultState.sect, ...parsedData.sect },
          cave: { ...defaultState.cave, ...parsedData.cave },
          root: { ...defaultState.root, ...parsedData.root },
          meridian: { ...defaultState.meridian, ...parsedData.meridian },
          secret: { ...defaultState.secret, ...parsedData.secret },
          isAscended: Boolean(parsedData.isAscended) || defaultState.isAscended,
          immortalRealmId: parsedData.immortalRealmId || defaultState.immortalRealmId,
          immortalLevel: parsedData.immortalLevel || defaultState.immortalLevel,
          immortalExp: parsedData.immortalExp || defaultState.immortalExp,
          isContinuousAttacking: false,
          continuousAttackTimerId: null,
          currentHp: Math.min(Number(parsedData.currentHp) || defaultState.currentHp, playerMaxHp.value),
          isPlayerDead: Boolean(parsedData.isPlayerDead) || false,
          autoMeditate: false,
          autoBattle: false,
          shield: 0,
          battleSpeed: parsedData.battleSpeed || defaultState.battleSpeed
        }
        Object.assign(gameState, mergedData)
        startAgeTimer()
        startHpRegenTimer()
        startOnlineTimer()
        startBuffTimer()
        startCaveTimer()
        startPetHealTimer()
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
    startPetHealTimer()
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
    startPetHealTimer()
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
  if (petHealTimer) clearInterval(petHealTimer)
  Object.assign(gameState, initState())
  localStorage.removeItem('xianxia_game_save')
  startAgeTimer()
  startHpRegenTimer()
  startOnlineTimer()
  startBuffTimer()
  startCaveTimer()
  startPetHealTimer()
}

loadGame()