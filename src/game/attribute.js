import { ATTRIBUTE_CONFIG } from './config.js'
import { gameState, saveGame } from './state.js'

export const getAllAttributes = () => {
  return Object.entries(ATTRIBUTE_CONFIG).map(([key, config]) => ({
    key,
    ...config,
    value: gameState.baseAttribute[key]
  }))
}

export const assignAttributePoint = (attrKey, count = 1) => {
  if (!ATTRIBUTE_CONFIG[attrKey]) return { success: false, msg: '属性不存在' }
  if (gameState.freeAttributePoint < count) return { success: false, msg: '剩余属性点不足' }

  gameState.baseAttribute[attrKey] += count
  gameState.freeAttributePoint -= count
  saveGame()
  return { success: true, msg: `成功分配${count}点属性到${ATTRIBUTE_CONFIG[attrKey].name}` }
}

export const batchAssignAttribute = (assignMap) => {
  let totalCount = 0
  for (const key in assignMap) {
    if (!ATTRIBUTE_CONFIG[key]) continue
    totalCount += assignMap[key]
  }
  if (gameState.freeAttributePoint < totalCount) return { success: false, msg: '剩余属性点不足' }

  for (const key in assignMap) {
    if (!ATTRIBUTE_CONFIG[key]) continue
    gameState.baseAttribute[key] += assignMap[key]
  }
  gameState.freeAttributePoint -= totalCount
  saveGame()
  return { success: true, msg: '属性点分配成功' }
}

export const resetAttributePoints = () => {
  if ((gameState.items.resetPill || 0) < 1) return { success: false, msg: '洗点水不足，可在商店购买' }

  let totalAssigned = 0
  for (const key in gameState.baseAttribute) {
    totalAssigned += gameState.baseAttribute[key]
    gameState.baseAttribute[key] = 0
  }
  gameState.freeAttributePoint += totalAssigned
  gameState.items.resetPill -= 1

  saveGame()
  return { success: true, msg: `成功重置所有属性点，返还${totalAssigned}点可分配属性点` }
}