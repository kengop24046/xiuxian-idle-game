import { MAP_CONFIG, MONSTER_CONFIG } from './config.js'
import { gameState, saveGame } from './state.js'

export const getAllMaps = () => {
  return MAP_CONFIG.sort((a, b) => a.id - b.id)
}

export const checkMapUnlocked = (map) => {
  const playerRealmId = gameState.currentRealmId
  const playerLevel = gameState.currentLevel
  if (playerRealmId > map.unlockRealmId) return true
  if (playerRealmId === map.unlockRealmId && playerLevel >= map.unlockLevel) return true
  return false
}

export const getUnlockedMaps = () => {
  return getAllMaps().filter(map => checkMapUnlocked(map))
}

export const switchMap = (mapId) => {
  const targetMap = MAP_CONFIG.find(map => map.id === mapId)
  if (!targetMap) return { success: false, msg: '地图不存在' }
  if (!checkMapUnlocked(targetMap)) return { success: false, msg: '地图未解锁，提升境界后可解锁' }

  gameState.currentMapId = mapId
  gameState.currentMonster = null
  gameState.autoBattle = false
  saveGame()
  return { success: true, msg: `已切换至${targetMap.name}` }
}

export const getCurrentMapMonsters = () => {
  return MONSTER_CONFIG.filter(monster => monster.mapId === gameState.currentMapId)
}