import { gameState } from '../gameState.js'
import { playerMaxHp, currentRealmExpNeed, currentRealmKillNeed } from '../computed/index.js'
import { startMeditateTimer, stopMeditateTimer } from '../timers.js'
import { saveGame } from './saveService.js'

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

export const checkRealmBreakable = () => {
  const { currentExp, realmKillCount } = gameState
  const expNeed = currentRealmExpNeed.value
  const killNeed = currentRealmKillNeed.value
  return currentExp >= expNeed && realmKillCount >= killNeed
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

export const setBattleSpeed = (speed) => {
  const validSpeeds = [1, 2, 3, 5, 10]
  if (!validSpeeds.includes(speed)) {
    return { success: false, msg: `无效的战斗倍速，仅支持 ${validSpeeds.join(', ')}x` }
  }
  gameState.battleSpeed = speed
  saveGame()
  return { success: true, msg: `战斗倍速已设置为 ${speed}x` }
}