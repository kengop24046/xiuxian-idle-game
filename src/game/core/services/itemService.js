import { gameState } from '../gameState.js'
import { backpackEmptySlots, currentRealmExpNeed } from '../computed/index.js'
import { ITEM_TYPE, ITEM_CONFIG, BACKPACK_CONFIG } from '../../config.js'
import { saveGame } from './saveService.js'

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

  const emptySlots = backpackEmptySlots.value
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
  } 
  else {
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