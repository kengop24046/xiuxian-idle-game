import { gameState } from './state.js'
import { EQUIPMENT_CONFIG, ITEM_TYPE } from './config.js'

const addItem = (itemId, count = 1, extraData = {}) => {
  if (!itemId || count <= 0) return false
  
  if (extraData.itemType === ITEM_TYPE.EQUIP && extraData.equipData) {
    gameState.bagEquipments = gameState.bagEquipments || []
    gameState.bagEquipments.push({ ...extraData.equipData })
    return true
  }
  
  gameState.items = gameState.items || {}
  gameState.items[itemId] = (gameState.items[itemId] || 0) + count
  return true
}

const removeItem = (itemType, itemId, count = 1) => {
  if (!itemId || count <= 0) return false
  
  if (itemType === ITEM_TYPE.EQUIP) {
    gameState.bagEquipments = gameState.bagEquipments || []
    const index = gameState.bagEquipments.findIndex(e => e.id === itemId)
    if (index !== -1) {
      gameState.bagEquipments.splice(index, count)
      return true
    }
    return false
  }
  
  gameState.items = gameState.items || {}
  if (!gameState.items[itemId] || gameState.items[itemId] < count) return false
  gameState.items[itemId] -= count
  if (gameState.items[itemId] <= 0) delete gameState.items[itemId]
  return true
}

export const calculateTotalEquipAttr = () => {
  const { equippedEquipments } = gameState
  const totalAttr = {
    attack: 0, hp: 0, defense: 0,
    power: 0, constitution: 0, agility: 0, comprehension: 0, luck: 0,
    critRate: 0, critDamage: 1, expRate: 1, dropRate: 0
  }

  for (const partId in equippedEquipments) {
    const equipment = equippedEquipments[partId]
    if (!equipment) continue
    const equipAttr = calculateEquipmentAttr(equipment)
    
    Object.keys(totalAttr).forEach(key => {
      if (key === 'critDamage' || key === 'expRate') {
        totalAttr[key] *= equipAttr[key]
      } else {
        totalAttr[key] += equipAttr[key]
      }
    })
  }

  return totalAttr
}

export const calculateEquipmentAttr = (equipment) => {
  if (!equipment || typeof equipment !== 'object') {
    return {
      attack: 0, hp: 0, defense: 0, power: 0,
      constitution: 0, agility: 0, comprehension: 0, luck: 0,
      critRate: 0, critDamage: 1, expRate: 1, dropRate: 0
    }
  }

  const baseAttr = {
    attack: Number(equipment.baseAttack) || 0,
    hp: Number(equipment.baseHp) || 0,
    defense: Number(equipment.baseDefense) || 0,
    power: Number(equipment.basePower) || 0,
    constitution: Number(equipment.baseConstitution) || 0,
    agility: Number(equipment.baseAgility) || 0,
    comprehension: Number(equipment.baseComprehension) || 0,
    luck: Number(equipment.baseLuck) || 0,
    critRate: Number(equipment.baseCritRate) || 0,
    critDamage: Number(equipment.baseCritDamage) || 1,
    expRate: Number(equipment.baseExpRate) || 1,
    dropRate: Number(equipment.baseDropRate) || 0
  }

  const level = Math.max(1, Number(equipment.level) || 1)
  const strengthenLevel = Math.max(0, Number(equipment.strengthenLevel) || 0)
  const star = Math.max(1, Number(equipment.star) || 1)
  const qualityId = Math.max(1, Number(equipment.qualityId) || 1)

  const levelMulti = 1 + (level - 1) * 0.1
  const qualityMulti = 1 + (qualityId - 1) * 0.2
  const strengthenMulti = 1 + strengthenLevel * 0.1
  const starMulti = 1 + (star - 1) * 0.15

  const finalMulti = levelMulti * qualityMulti * strengthenMulti * starMulti

  const finalAttr = {
    attack: Math.floor(baseAttr.attack * finalMulti),
    hp: Math.floor(baseAttr.hp * finalMulti),
    defense: Math.floor(baseAttr.defense * finalMulti),
    power: Math.floor(baseAttr.power * finalMulti),
    constitution: Math.floor(baseAttr.constitution * finalMulti),
    agility: Math.floor(baseAttr.agility * finalMulti),
    comprehension: Math.floor(baseAttr.comprehension * finalMulti),
    luck: Math.floor(baseAttr.luck * finalMulti),
    critRate: Number((baseAttr.critRate * finalMulti).toFixed(3)),
    critDamage: Number((baseAttr.critDamage * finalMulti).toFixed(2)),
    expRate: Number((baseAttr.expRate * finalMulti).toFixed(2)),
    dropRate: Number((baseAttr.dropRate * finalMulti).toFixed(3))
  }

  const displayAttr = {}
  Object.entries(finalAttr).forEach(([key, val]) => {
    if (
      (['attack', 'hp', 'defense', 'power', 'constitution', 'agility', 'comprehension', 'luck'].includes(key) && val > 0) ||
      (key === 'critRate' && val > 0) ||
      (key === 'critDamage' && val !== 1) ||
      (key === 'expRate' && val !== 1) ||
      (key === 'dropRate' && val > 0)
    ) {
      displayAttr[key] = val
    }
  })

  return displayAttr
}

export const wearEquipment = (equipment) => {
  if (!equipment || !equipment.partId) return false
  const currentEquip = gameState.equippedEquipments[equipment.partId]
  if (currentEquip) {
    unwearEquipment(equipment.partId)
  }
  gameState.equippedEquipments[equipment.partId] = JSON.parse(JSON.stringify(equipment))
  removeItem(ITEM_TYPE.EQUIP, equipment.id, 1)
  saveGame()
  return true
}

export const unwearEquipment = (partId) => {
  const equip = gameState.equippedEquipments[partId]
  if (!equip) return false
  addItem(equip.id, 1, {
    itemType: ITEM_TYPE.EQUIP,
    equipData: equip
  })
  gameState.equippedEquipments[partId] = null
  saveGame()
  return true
}

export const decomposeEquipment = (equipId) => {
  const equipIndex = gameState.bagEquipments.findIndex(e => e.id === equipId)
  if (equipIndex === -1) {
    return { success: false, msg: '未找到该装备' }
  }
  const equip = gameState.bagEquipments[equipIndex]
  gameState.bagEquipments.splice(equipIndex, 1)
  
  const qualityId = equip.qualityId || 1
  const reward = {
    strengthenStone: Math.floor(qualityId * 2 * (equip.level || 1)),
    upgradeStone: Math.floor(qualityId * 1 * (equip.level || 1)),
    starStone: equip.star > 1 ? Math.floor((equip.star - 1) * qualityId) : 0
  }
  
  addItem('strengthenStone', reward.strengthenStone)
  if (reward.upgradeStone > 0) addItem('upgradeStone', reward.upgradeStone)
  if (reward.starStone > 0) addItem('starStone', reward.starStone)
  
  saveGame()
  return { success: true, reward, msg: '装备分解成功' }
}

export const strengthenEquipment = (equipment) => {
  const maxLevel = EQUIPMENT_CONFIG.strengthen.maxLevel
  if (equipment.strengthenLevel >= maxLevel) {
    return { success: false, msg: '已达最高强化等级' }
  }
  const cost = Math.floor(EQUIPMENT_CONFIG.strengthen.baseCost * (equipment.qualityId + 1) * Math.pow(1.5, equipment.strengthenLevel))
  if (!gameState.items?.strengthenStone || gameState.items.strengthenStone < cost) {
    return { success: false, msg: '强化石数量不足' }
  }
  
  removeItem(ITEM_TYPE.ITEM, 'strengthenStone', cost)
  const updatedEquipment = JSON.parse(JSON.stringify(equipment))
  updatedEquipment.strengthenLevel += 1
  
  updateEquipmentInState(updatedEquipment)
  saveGame()
  return { success: true, newLevel: updatedEquipment.strengthenLevel, updatedEquipment }
}

export const upgradeEquipment = (equipment) => {
  const cost = Math.floor(2 * (equipment.qualityId + 1) * Math.pow(1.6, equipment.level - 1))
  if (!gameState.items?.upgradeStone || gameState.items.upgradeStone < cost) {
    return { success: false, msg: '升级石数量不足' }
  }
  
  removeItem(ITEM_TYPE.ITEM, 'upgradeStone', cost)
  const updatedEquipment = JSON.parse(JSON.stringify(equipment))
  updatedEquipment.level += 1
  
  updateEquipmentInState(updatedEquipment)
  saveGame()
  return { success: true, newLevel: updatedEquipment.level, updatedEquipment }
}

export const starUpEquipment = (equipment) => {
  const maxStar = EQUIPMENT_CONFIG.starUp.maxStar
  if (equipment.star >= maxStar) {
    return { success: false, msg: '已达最高星级' }
  }
  const cost = Math.floor(EQUIPMENT_CONFIG.starUp.baseCost * (equipment.qualityId + 1) * Math.pow(2, equipment.star))
  if (!gameState.items?.starStone || gameState.items.starStone < cost) {
    return { success: false, msg: '升星石数量不足' }
  }
  
  removeItem(ITEM_TYPE.ITEM, 'starStone', cost)
  const updatedEquipment = JSON.parse(JSON.stringify(equipment))
  updatedEquipment.star += 1
  
  updateEquipmentInState(updatedEquipment)
  saveGame()
  return { success: true, newStar: updatedEquipment.star, updatedEquipment }
}

const updateEquipmentInState = (equipment) => {
  const equippedPart = Object.keys(gameState.equippedEquipments).find(
    part => gameState.equippedEquipments[part]?.id === equipment.id
  )
  if (equippedPart) {
    gameState.equippedEquipments[equippedPart] = equipment
  }
  
  const bagIndex = gameState.bagEquipments.findIndex(e => e.id === equipment.id)
  if (bagIndex !== -1) {
    gameState.bagEquipments[bagIndex] = equipment
  }
}