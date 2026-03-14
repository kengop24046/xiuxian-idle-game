import { computed } from 'vue'
import { gameState } from '../gameState.js'
import { 
  EQUIPMENT_SET_CONFIG, ILLUSTRATION_CONFIG, PILL_CONFIG, 
  REINCARNATION_CONFIG, LEVEL_ATTR_CONFIG, REALM_LEVEL_ATTR, 
  BIG_REALM_BONUS 
} from '../../config.js'

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