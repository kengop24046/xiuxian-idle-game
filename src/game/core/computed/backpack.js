import { computed } from 'vue'
import { gameState } from '../gameState.js'
import { ITEM_TYPE } from '../../config.js'

export const backpackUsedCount = computed(() => {
  return gameState.backpack.slots.filter(slot => slot !== null).length
})
export const isBackpackFull = computed(() => {
  return backpackUsedCount.value >= gameState.backpack.capacity
})
export const backpackEmptySlots = computed(() => {
  const emptyIndex = []
  gameState.backpack.slots.forEach((slot, index) => {
    if (slot === null) emptyIndex.push(index)
  })
  return emptyIndex
})
export const backpackItemsByType = computed(() => {
  const result = {
    [ITEM_TYPE.EQUIP]: [],
    [ITEM_TYPE.MATERIAL]: [],
    [ITEM_TYPE.PILL]: [],
    [ITEM_TYPE.PET_EGG]: [],
    [ITEM_TYPE.FABAO]: [],
    [ITEM_TYPE.TASK]: [],
    [ITEM_TYPE.OTHER]: [],
    all: []
  }
  gameState.backpack.slots.forEach(slot => {
    if (!slot) return
    result.all.push(slot)
    result[slot.itemType] ? result[slot.itemType].push(slot) : result[ITEM_TYPE.OTHER].push(slot)
  })
  return result
})