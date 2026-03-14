import { gameState } from '../gameState.js'
import { ITEM_TYPE, ITEM_CONFIG, EQUIPMENT_CONFIG } from '../../config.js'
import { addItem, removeItem, saveGame } from './index.js'

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
    addItem(`equip_${oldEquip.id}`, 1, {
      equipData: oldEquip,
      itemType: ITEM_TYPE.EQUIP,
      itemName: oldEquip.name
    })
  }

  saveGame()

  return {
    success: true,
    msg: `成功穿戴【${equipSlot.itemName}】`,
    newEquip: equipSlot.equipData,
    oldEquip: oldEquip || null
  }
}

export const unwearEquip = (partId) => {
  if (!partId || !gameState.equippedEquipments[partId]) {
    return { success: false, msg: '该部位无装备' }
  }
  const equip = gameState.equippedEquipments[partId]
  const addSuccess = addItem(`equip_${equip.id}`, 1, {
    equipData: equip,
    itemType: ITEM_TYPE.EQUIP,
    itemName: equip.name
  })
  if (!addSuccess) {
    return { success: false, msg: '背包已满，无法卸下装备' }
  }
  gameState.equippedEquipments[partId] = null
  saveGame()
  return { success: true, msg: '装备卸下成功' }
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
    if (count > 0) addItem(itemId, count)
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