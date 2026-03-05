import { gameState, saveGame } from './state.js'
import { EQUIPMENT_CONFIG } from './config.js'

export const wearEquipment = (equipment) => {
  const { partId } = equipment
  if (gameState.equippedEquipments[partId]) {
    unwearEquipment(partId)
  }
  gameState.equippedEquipments[partId] = equipment
  gameState.bagEquipments = gameState.bagEquipments.filter(item => item.id !== equipment.id)
  saveGame()
  return true
}

export const unwearEquipment = (partId) => {
  const equipment = gameState.equippedEquipments[partId]
  if (!equipment) return false
  gameState.bagEquipments.push(equipment)
  gameState.equippedEquipments[partId] = null
  saveGame()
  return true
}

export const decomposeEquipment = (equipmentId) => {
  const equipmentIndex = gameState.bagEquipments.findIndex(item => item.id === equipmentId)
  if (equipmentIndex === -1) return { success: false, msg: '装备不存在' }

  const equipment = gameState.bagEquipments[equipmentIndex]
  const { qualityId, level, strengthenLevel, star } = equipment
  const reward = {
    strengthenStone: Math.floor((level + strengthenLevel * 2 + star * 5) * (qualityId + 1) * 0.5),
    upgradeStone: Math.floor((level + strengthenLevel) * (qualityId + 1) * 0.2),
    starStone: Math.floor(star * (qualityId + 1) * 0.5),
  }

  gameState.items.strengthenStone += reward.strengthenStone
  gameState.items.upgradeStone += reward.upgradeStone
  gameState.items.starStone += reward.starStone

  gameState.bagEquipments.splice(equipmentIndex, 1)
  saveGame()
  return { success: true, reward }
}

export const strengthenEquipment = (equipment) => {
  const { strengthen } = EQUIPMENT_CONFIG
  const { strengthenLevel, qualityId } = equipment
  if (strengthenLevel >= strengthen.maxLevel) return { success: false, msg: '装备已强化到满级' }

  const cost = Math.floor(strengthen.baseCost * (qualityId + 1) * Math.pow(1.5, strengthenLevel))
  if (gameState.items.strengthenStone < cost) return { success: false, msg: '强化石不足' }

  gameState.items.strengthenStone -= cost
  equipment.strengthenLevel += 1
  saveGame()
  return { success: true, newLevel: equipment.strengthenLevel, cost }
}

export const upgradeEquipment = (equipment) => {
  const { qualityId, level } = equipment
  const cost = Math.floor(2 * (qualityId + 1) * Math.pow(1.6, level - 1))
  if (gameState.items.upgradeStone < cost) return { success: false, msg: '升级石不足' }

  gameState.items.upgradeStone -= cost
  equipment.level += 1
  saveGame()
  return { success: true, newLevel: equipment.level, cost }
}

export const starUpEquipment = (equipment) => {
  const { starUp } = EQUIPMENT_CONFIG
  const { star, qualityId } = equipment
  if (star >= starUp.maxStar) return { success: false, msg: '装备已升星到满级' }

  const cost = Math.floor(starUp.baseCost * (qualityId + 1) * Math.pow(2, star))
  if (gameState.items.starStone < cost) return { success: false, msg: '升星石不足' }

  gameState.items.starStone -= cost
  equipment.star += 1
  saveGame()
  return { success: true, newStar: equipment.star, cost }
}

export const calculateEquipmentAttr = (equipment) => {
  const { strengthen, starUp } = EQUIPMENT_CONFIG
  const { attrs, strengthenLevel, star } = equipment

  const strengthenMultiplier = 1 + strengthenLevel * strengthen.attrMultiplier
  const starMultiplier = 1 + star * starUp.attrMultiplier

  const finalAttrs = {}
  for (const key in attrs) {
    finalAttrs[key] = Math.floor(attrs[key] * strengthenMultiplier * starMultiplier)
  }

  return finalAttrs
}

export const calculateTotalEquipAttr = () => {
  const { equippedEquipments } = gameState
  const totalAttr = {
    attack: 0,
    hp: 0,
    defense: 0,
    power: 0,
    constitution: 0,
    agility: 0,
    comprehension: 0,
    luck: 0,
  }

  for (const partId in equippedEquipments) {
    const equipment = equippedEquipments[partId]
    if (!equipment) continue
    const equipAttr = calculateEquipmentAttr(equipment)
    for (const key in equipAttr) {
      totalAttr[key] += equipAttr[key]
    }
  }

  return totalAttr
}