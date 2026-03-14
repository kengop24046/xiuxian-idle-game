import { watch } from 'vue'
import { gameState } from './gameState.js'
import { ITEM_TYPE, ACHIEVEMENT_CONFIG } from '../config.js'
import { saveGame } from './services/saveService.js'

export const initBackpackWatch = () => {
  watch(() => gameState.backpack.slots, () => {
    const newItems = { strengthenStone:0, upgradeStone:0, starStone:0, resetPill:0, arenaCoin:0 }
    const newPills = { expPill:0, superExpPill:0, attackPill:0, defensePill:0, resetPill:0 }
    const newPetEggs = { normal:0, rare:0, legendary:0 }
    const newBagEquipments = []

    gameState.backpack.slots.forEach(slot => {
      if (!slot) return
      if (slot.itemType === ITEM_TYPE.EQUIP && slot.equipData) {
        newBagEquipments.push({ ...slot.equipData })
      }
      if (newItems[slot.itemId] !== undefined) newItems[slot.itemId] += slot.count
      if (newPills[slot.itemId] !== undefined) newPills[slot.itemId] += slot.count
    })

    Object.assign(gameState.items, newItems)
    Object.assign(gameState.pills, newPills)
    gameState.bagEquipments = newBagEquipments

    saveGame()
  }, { deep: true, immediate: true })
}

export const initAchievementWatch = () => {
  const check = () => {
    ACHIEVEMENT_CONFIG.forEach(ach => {
      if (gameState.achievementState?.[ach.id]?.isFinished) return
      if ((gameState[ach.currentKey] || 0) >= ach.target) {
        gameState.achievementState ||= {}
        gameState.achievementState[ach.id] = { isFinished: true, isClaimed: false }
      }
    })
  }

  watch([
    () => gameState.level,
    () => gameState.gold,
    () => gameState.totalKillCount
  ], () => {
    check()
    saveGame()
  }, { deep: true, immediate: true })
}

export const initAllWatchers = () => {
  initBackpackWatch()
  initAchievementWatch()
}