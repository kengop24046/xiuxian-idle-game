import { gameState, currentRealm, currentRealmExpNeed, currentRealmKillNeed, saveGame } from './state.js'
import { REALM_CONFIG } from './config.js'
import { playerTotalAttribute } from './state.js'

export const meditate = () => {
  const expRate = playerTotalAttribute.value.expRate
  const baseExp = currentRealm.value.baseExp * 0.01 * expRate
  gameState.currentExp += baseExp
  if (gameState.currentExp > currentRealmExpNeed.value) {
    gameState.currentExp = currentRealmExpNeed.value
  }
  return baseExp
}

export const breakRealm = () => {
  const currentRealmData = currentRealm.value
  const currentLevel = gameState.currentLevel
  const currentRealmId = gameState.currentRealmId

  if (gameState.currentExp < currentRealmExpNeed.value) return { success: false, msg: '修为不足，无法突破' }
  if (gameState.realmKillCount < currentRealmKillNeed.value) return { success: false, msg: '击杀怪物数量不足，无法突破' }

  if (currentLevel < currentRealmData.maxLevel) {
    gameState.currentLevel += 1
    gameState.currentExp = 0
    gameState.realmKillCount = 0
    gameState.freeAttributePoint += currentRealmData.attributePoint
    saveGame()
    return {
      success: true,
      msg: `突破成功！当前境界：${currentRealmData.name}${gameState.currentLevel}层`,
      isBigBreak: false
    }
  }

  const nextRealm = REALM_CONFIG.find(realm => realm.id === currentRealmId + 1)
  if (!nextRealm) return { success: false, msg: '已达到当前最高境界，可进行转生' }

  gameState.currentRealmId = nextRealm.id
  gameState.currentLevel = 1
  gameState.currentExp = 0
  gameState.realmKillCount = 0
  gameState.freeAttributePoint += currentRealmData.bigRealmPoint
  saveGame()
  return {
    success: true,
    msg: `恭喜突破大境界！当前境界：${nextRealm.name}1层`,
    isBigBreak: true
  }
}

export const toggleAutoMeditate = () => {
  gameState.autoMeditate = !gameState.autoMeditate
  saveGame()
}