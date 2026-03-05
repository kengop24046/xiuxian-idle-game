import { REINCARNATION_CONFIG, REALM_CONFIG } from './config.js'
import { gameState, saveGame } from './state.js'

export const checkCanReincarnate = () => {
  const { unlockRealmId, unlockLevel } = REINCARNATION_CONFIG
  const currentRealmId = gameState.currentRealmId
  const currentLevel = gameState.currentLevel

  if (currentRealmId < unlockRealmId) return { can: false, msg: `需达到${REALM_CONFIG[unlockRealmId-1].name}才可转生` }
  if (currentRealmId === unlockRealmId && currentLevel < unlockLevel) return { can: false, msg: `需达到${REALM_CONFIG[unlockRealmId-1].name}${unlockLevel}层才可转生` }
  return { can: true, msg: '可进行转生' }
}

export const getReincarnationBonusPreview = () => {
  const { baseBonus, extraAttributePoint } = REINCARNATION_CONFIG
  const nextCount = gameState.reincarnationCount + 1

  return {
    attackBonus: baseBonus.attack * nextCount * 100,
    hpBonus: baseBonus.hp * nextCount * 100,
    defenseBonus: baseBonus.defense * nextCount * 100,
    expRateBonus: baseBonus.expRate * nextCount * 100,
    dropRateBonus: baseBonus.dropRate * nextCount * 100,
    extraAttributePoint: extraAttributePoint * nextCount,
  }
}

export const doReincarnation = () => {
  const checkResult = checkCanReincarnate()
  if (!checkResult.can) return { success: false, msg: checkResult.msg }

  const { extraAttributePoint } = REINCARNATION_CONFIG
  gameState.reincarnationCount += 1
  gameState.currentRealmId = 1
  gameState.currentLevel = 1
  gameState.currentExp = 0
  gameState.realmKillCount = 0
  gameState.freeAttributePoint += extraAttributePoint
  gameState.trialCurrentLayer = 1
  gameState.currentMapId = 1
  gameState.currentMonster = null
  gameState.autoBattle = false

  saveGame()
  return {
    success: true,
    msg: `恭喜完成第${gameState.reincarnationCount}次转生！获得全局属性加成与额外属性点，境界已重置为炼气境1层`,
    bonus: getReincarnationBonusPreview()
  }
}