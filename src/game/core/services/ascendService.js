import { gameState } from '../gameState.js'
import { canAscend, ascendNeedRealmName, playerMaxHp } from '../computed/index.js'
import { stopMeditateTimer } from '../timers.js'
import { addItem, saveGame } from './index.js'
import { ASCEND_CONFIG } from '../../config.js'

export const ascendToImmortal = () => {
  if (gameState.isAscended) {
    return { success: false, msg: '你已飞升仙界，无需重复飞升' }
  }

  if (!canAscend.value) {
    return { 
      success: false, 
      msg: `飞升条件不足！需达到【${ascendNeedRealmName.value}】才可飞升` 
    }
  }

  gameState.autoBattle = false
  gameState.autoMeditate = false
  stopMeditateTimer()

  gameState.isAscended = true
  gameState.immortalRealmId = 1
  gameState.immortalLevel = 1
  gameState.immortalExp = 0
  gameState.currentHp = playerMaxHp.value

  const ascendReward = ASCEND_CONFIG.firstAscendReward || {
    gold: 100000,
    items: [
      { itemId: 'strengthenStone', count: 100 },
      { itemId: 'upgradeStone', count: 50 },
      { itemId: 'starStone', count: 20 }
    ],
    freeAttributePoint: 50
  }

  if (ascendReward.gold && ascendReward.gold > 0) {
    gameState.gold += ascendReward.gold
    gameState.totalGoldGet += ascendReward.gold
  }
  if (ascendReward.freeAttributePoint && ascendReward.freeAttributePoint > 0) {
    gameState.freeAttributePoint += ascendReward.freeAttributePoint
  }
  if (ascendReward.items && Array.isArray(ascendReward.items)) {
    ascendReward.items.forEach(item => {
      if (item.itemId && item.count > 0) {
        addItem(item.itemId, item.count)
      }
    })
  }

  saveGame()

  return {
    success: true,
    msg: '恭喜！你已成功渡劫飞升，踏入仙界！全属性大幅提升，解锁仙界全新玩法！',
    reward: ascendReward,
    isAscended: true
  }
}