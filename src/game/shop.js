import { SHOP_CONFIG } from './config.js'
import { gameState, currentRealmExpNeed, saveGame } from './state.js'
import { generateEquipment } from './utils.js'

export const initShop = () => {
  if (gameState.shopItems.length === 0) {
    refreshShop(false)
  }
}

export const refreshShop = (costGold = true) => {
  const { refreshCost, baseItemCount, items } = SHOP_CONFIG
  if (costGold && gameState.gold < refreshCost) {
    return { success: false, msg: '金币不足，无法刷新商店' }
  }
  if (costGold) gameState.gold -= refreshCost

  const newShopItems = []
  const itemPool = [...items]
  const totalRefreshRate = itemPool.reduce((sum, item) => sum + item.refreshRate, 0)
  const selectedItemIds = new Set()

  while (newShopItems.length < baseItemCount && selectedItemIds.size < itemPool.length) {
    const random = Math.random() * totalRefreshRate
    let currentRate = 0
    let selectedItem = null

    for (const item of itemPool) {
      currentRate += item.refreshRate
      if (random <= currentRate && !selectedItemIds.has(item.id)) {
        selectedItem = item
        break
      }
    }

    if (selectedItem) {
      selectedItemIds.add(selectedItem.id)
      newShopItems.push({
        ...selectedItem,
        currentStock: selectedItem.limit,
      })
    }
  }

  gameState.shopItems = newShopItems
  saveGame()
  return { success: true, msg: '商店刷新成功' }
}

export const buyShopItem = (itemId, count = 1) => {
  const shopItem = gameState.shopItems.find(item => item.id === itemId)
  if (!shopItem) return { success: false, msg: '商品不存在' }
  if (shopItem.currentStock < count) return { success: false, msg: '商品库存不足' }

  const totalPrice = shopItem.price * count
  if (gameState.gold < totalPrice) return { success: false, msg: '金币不足' }

  gameState.gold -= totalPrice
  shopItem.currentStock -= count

  let resultMsg = `成功购买${count}个${shopItem.name}`
  switch (shopItem.type) {
    case 'strengthenStone':
    case 'upgradeStone':
    case 'starStone':
      gameState.items[shopItem.type] += count
      break
    case 'expPill':
      const totalExp = shopItem.effect * count
      gameState.currentExp += totalExp
      if (gameState.currentExp > currentRealmExpNeed.value) {
        gameState.currentExp = currentRealmExpNeed.value
      }
      resultMsg += `，获得${totalExp}修为`
      break
    case 'resetPill':
      gameState.items.resetPill = (gameState.items.resetPill || 0) + count
      break
    case 'equipBox':
      for (let i = 0; i < count; i++) {
        const equipment = generateEquipment(
          gameState.currentLevel * 2,
          shopItem.qualityMin,
          shopItem.qualityMax,
          1
        )
        gameState.bagEquipments.push(equipment)
      }
      resultMsg += `，获得${count}件装备`
      break
  }

  saveGame()
  return { success: true, msg: resultMsg }
}