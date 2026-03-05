import { TRIAL_CONFIG } from './config.js'
import { gameState, saveGame } from './state.js'
import { generateTrialMonster } from './combat.js'

export const getTrialMaxLayer = () => TRIAL_CONFIG.maxLayer

export const checkTrialLayerUnlocked = (layer) => layer <= gameState.trialMaxLayer

export const enterTrialLayer = (layer) => {
  if (!checkTrialLayerUnlocked(layer)) {
    return { success: false, msg: '该试炼层未解锁，通关前一层即可解锁' }
  }
  if (layer > TRIAL_CONFIG.maxLayer) {
    return { success: false, msg: '已达到试炼最高层数' }
  }

  const monster = generateTrialMonster(layer)
  gameState.trialMonster = monster
  gameState.trialCurrentLayer = layer
  saveGame()
  return { success: true, monster }
}

export const exitTrial = () => {
  gameState.trialMonster = null
  saveGame()
  return { success: true, msg: '已退出试炼' }
}

export const getTrialLayerRewardPreview = (layer) => {
  const { baseReward, bossReward, rewardMultiplier, bossLayers } = TRIAL_CONFIG
  const isBoss = bossLayers.includes(layer)
  const multiplier = Math.pow(rewardMultiplier, layer - 1)

  return {
    gold: Math.floor(baseReward.gold * multiplier * (isBoss ? bossReward.goldMultiplier : 1)),
    strengthenStone: Math.floor(baseReward.strengthenStone * multiplier * (isBoss ? bossReward.strengthenStone : 1)),
    upgradeStone: Math.floor(baseReward.upgradeStone * multiplier * (isBoss ? bossReward.upgradeStone : 1)),
    starStone: Math.floor(baseReward.starStone * multiplier * (isBoss ? bossReward.starStone : 1)),
    equipQualityMin: isBoss ? bossReward.equipQualityMin : Math.max(0, Math.floor(layer / 10) - 1),
    equipQualityMax: Math.min(7, Math.floor(layer / 10) + 2),
    isBoss,
  }
}

export const getTrialHighestClearedLayer = () => gameState.trialMaxLayer - 1