import { gameState } from '../gameState.js'
import { PILL_CONFIG } from '../../config.js'
import { currentRealmExpNeed } from '../computed/index.js'
import { removeItem, saveGame } from './index.js'

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

export const oneKeyUseExpPills = () => {
  const expPillTypes = ['expPill', 'superExpPill']
  const expPillSlots = gameState.backpack.slots.filter(slot => 
    slot && expPillTypes.includes(slot.itemId) && slot.itemType === 'PILL'
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

const checkLevelUp = () => {
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