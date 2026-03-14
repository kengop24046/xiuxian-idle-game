import { computed } from 'vue'
import { gameState } from '../gameState.js'
import { calculateTotalEquipAttr } from '../../equipment.js'
import { ROOT_CONFIG, MERIDIAN_CONFIG, SKILL_CONFIG, ASCEND_CONFIG } from '../../config.js'
import { 
  setBonusAttr, illustrationBonus, reincarnationBonus, 
  pillBuffBonus, bigRealmBonus 
} from './bonus.js'
import { currentPet, petAttrBonus } from './pet.js'

export const baseAttrBonus = computed(() => gameState.baseAttribute)
export const equipAttrBonus = computed(() => calculateTotalEquipAttr() || {
  attack: 0, hp: 0, defense: 0,
  power: 0, constitution: 0, agility: 0, comprehension: 0, luck: 0,
  critRate: 0, critDamage: 0, expRate: 1, dropRate: 0
})

export const playerTotalAttribute = computed(() => {
  const baseAttr = gameState.baseAttribute
  const levelBonus = {
    power: 2 * gameState.level,
    constitution: 2 * gameState.level,
    agility: 2 * gameState.level,
    comprehension: 2 * gameState.level,
    luck: 2 * gameState.level
  }
  const realmBonus = {
    power: 5 * gameState.currentRealmId,
    constitution: 5 * gameState.currentRealmId,
    agility: 5 * gameState.currentRealmId,
    comprehension: 5 * gameState.currentRealmId,
    luck: 5 * gameState.currentRealmId
  }
  const equipAttr = equipAttrBonus.value
  const rootConfig = ROOT_CONFIG[gameState.root.grade] || ROOT_CONFIG[0]
  const meridianBonus = 1 + (gameState.meridian.lit / (MERIDIAN_CONFIG.nodes || 20)) * 0.5
  
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

  const totalPower = (baseAttr.power + levelBonus.power + realmBonus.power + Number(equipAttr.power || 0)) * rootConfig.attr * meridianBonus
  const totalConstitution = (baseAttr.constitution + levelBonus.constitution + realmBonus.constitution + Number(equipAttr.constitution || 0)) * rootConfig.attr * meridianBonus
  const totalAgility = (baseAttr.agility + levelBonus.agility + realmBonus.agility + Number(equipAttr.agility || 0)) * rootConfig.attr * meridianBonus
  const totalComprehension = (baseAttr.comprehension + levelBonus.comprehension + realmBonus.comprehension + Number(equipAttr.comprehension || 0)) * rootConfig.attr * meridianBonus
  const totalLuck = (baseAttr.luck + levelBonus.luck + realmBonus.luck + Number(equipAttr.luck || 0)) * rootConfig.attr * meridianBonus

  let baseAttack = (totalPower * 2 + Number(equipAttr.attack || 0))
    * bigRealmBonusVal.multiplier
    * setBonus.attack
    * illustrationBonusVal.attackMulti
    * pillBuffBonusVal.attackMulti
    * reincarnationMulti.attackMulti
    * passiveBonus.defenseMulti
    * petBonus.attackMulti
    * ascendBonus
  let baseHp = (totalConstitution * 20 + Number(equipAttr.hp || 0))
    * bigRealmBonusVal.multiplier
    * setBonus.hp
    * illustrationBonusVal.hpMulti
    * reincarnationMulti.hpMulti
    * passiveBonus.defenseMulti
    * petBonus.hpMulti
    * ascendBonus
  let baseDefense = (totalConstitution * 1 + Number(equipAttr.defense || 0))
    * bigRealmBonusVal.multiplier
    * setBonus.defense
    * illustrationBonusVal.defenseMulti
    * pillBuffBonusVal.defenseMulti
    * reincarnationMulti.defenseMulti
    * passiveBonus.defenseMulti
    * petBonus.defenseMulti
    * ascendBonus
  let critRate = totalAgility * 0.1 + Number(setBonus.critRate || 0) + passiveBonus.critAdd + Number(equipAttr.critRate || 0)
  let dodgeRate = totalAgility * 0.1 + passiveBonus.dodgeAdd
  let critDamage = 1.3 + totalLuck * 0.003 * Number(setBonus.critDamage || 1) + (Number(equipAttr.critDamage || 1) - 1)

  if(skyTowerDebuff.effect?.attackMulti) baseAttack *= skyTowerDebuff.effect.attackMulti
  if(skyTowerDebuff.effect?.dodgeMulti) dodgeRate *= skyTowerDebuff.effect.dodgeMulti
  if(skyTowerDebuff.effect?.critRate === 0) critRate = 0

  return {
    attack: baseAttack,
    hp: baseHp,
    defense: baseDefense,
    critRate: critRate,
    dodgeRate: dodgeRate,
    expRate: (1 + totalComprehension * 0.005) * rootConfig.rate * reincarnationMulti.expMulti * setBonus.expRate * illustrationBonusVal.expMulti * ascendBonus * Number(equipAttr.expRate || 1),
    dropRate: totalLuck * 0.002 * reincarnationMulti.dropMulti + setBonus.dropRate + illustrationBonusVal.dropMulti - 1 + Number(equipAttr.dropRate || 0),
    critDamage: critDamage,
    lifesteal: passiveBonus.lifesteal
  }
})

export const playerMaxHp = computed(() => playerTotalAttribute.value.hp)
export const hpProgress = computed(() => Math.min((gameState.currentHp / playerMaxHp.value) * 100, 100))