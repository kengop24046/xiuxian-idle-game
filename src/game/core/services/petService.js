import { gameState } from '../gameState.js'
import { PET_CONFIG, ITEM_CONFIG, ITEM_TYPE } from '../../config.js'
import { generateUUID, randomInt, randomChance } from '../../utils.js'
import { removeItem, saveGame } from './index.js'

export const hatchPetEgg = (eggItemId, slotId = null) => {
  const eggConfig = ITEM_CONFIG[eggItemId]
  if (!eggConfig || eggConfig.type !== ITEM_TYPE.PET_EGG) {
    return { success: false, msg: '所选物品不是宠物蛋' }
  }
  const hasEgg = removeItem(eggItemId, 1, slotId)
  if (!hasEgg) {
    return { success: false, msg: '宠物蛋数量不足' }
  }

  const eggType = eggConfig.useEffect?.eggType || 'normal'
  const petConfigList = Object.values(PET_CONFIG).filter(config => config.eggType === eggType)
  if (petConfigList.length === 0) {
    return { success: false, msg: '暂无对应类型的宠物配置' }
  }

  let selectedPetConfig
  if (eggType === 'legendary') {
    const highQualityConfigs = petConfigList.filter(c => c.quality >= 3)
    selectedPetConfig = highQualityConfigs[randomInt(0, highQualityConfigs.length - 1)]
  } else if (eggType === 'rare') {
    selectedPetConfig = randomChance(70) 
      ? petConfigList.filter(c => c.quality >= 2)[randomInt(0, petConfigList.filter(c => c.quality >= 2).length - 1)]
      : petConfigList[randomInt(0, petConfigList.length - 1)]
  } else {
    selectedPetConfig = petConfigList[randomInt(0, petConfigList.length - 1)]
  }

  const newPet = {
    id: generateUUID(),
    configId: selectedPetConfig.id,
    name: selectedPetConfig.name,
    level: 1,
    exp: 0,
    maxExp: 100,
    quality: selectedPetConfig.quality,
    atk: selectedPetConfig.baseAtk * selectedPetConfig.quality,
    hp: selectedPetConfig.baseHp * selectedPetConfig.quality,
    def: selectedPetConfig.baseDef * selectedPetConfig.quality,
    skill: selectedPetConfig.skill,
    hatchTime: Date.now()
  }

  gameState.pets.push(newPet)
  if (!gameState.currentPetId) {
    gameState.currentPetId = newPet.id
  }

  saveGame()

  return {
    success: true,
    msg: `孵化成功！获得宠物【${newPet.name}】`,
    pet: newPet
  }
}

export const levelUpPet = (petId) => {
  const petIndex = gameState.pets.findIndex(pet => pet.id === petId)
  if (petIndex === -1) {
    return { success: false, msg: '所选宠物不存在' }
  }
  const pet = gameState.pets[petIndex]
  const petConfig = PET_CONFIG[pet.configId]
  if (!petConfig) {
    return { success: false, msg: '宠物配置不存在' }
  }

  const MAX_PET_LEVEL = 100
  if (pet.level >= MAX_PET_LEVEL) {
    return { success: false, msg: `宠物已达最大等级${MAX_PET_LEVEL}级` }
  }

  const LEVEL_UP_COST = {
    itemId: 'strengthenStone',
    count: pet.level * 10,
  }
  const costItemName = ITEM_CONFIG[LEVEL_UP_COST.itemId]?.name || '强化石'

  if (gameState.items[LEVEL_UP_COST.itemId] < LEVEL_UP_COST.count) {
    return { 
      success: false, 
      msg: `${costItemName}不足，升级需${LEVEL_UP_COST.count}个，当前仅${gameState.items[LEVEL_UP_COST.itemId]}个` 
    }
  }

  removeItem(LEVEL_UP_COST.itemId, LEVEL_UP_COST.count)
  pet.level += 1
  pet.maxExp = pet.level * 100
  pet.exp = 0
  pet.atk = petConfig.baseAtk * pet.quality * pet.level
  pet.hp = petConfig.baseHp * pet.quality * pet.level
  pet.def = petConfig.baseDef * pet.quality * pet.level

  gameState.pets[petIndex] = pet
  saveGame()

  return {
    success: true,
    msg: `【${pet.name}】升级成功！当前等级${pet.level}级`,
    pet: pet,
    newLevel: pet.level,
    cost: LEVEL_UP_COST
  }
}

export const setCurrentPet = (petId) => {
  if (petId === null || petId === undefined) {
    gameState.currentPetId = null
    saveGame()
    return { success: true, msg: '已取消宠物出战', currentPet: null }
  }

  const targetPet = gameState.pets.find(pet => pet.id === petId)
  if (!targetPet) {
    return { success: false, msg: '所选宠物不存在' }
  }

  if (gameState.currentPetId === petId) {
    return { success: false, msg: '该宠物已处于出战状态' }
  }

  gameState.currentPetId = petId
  saveGame()

  return {
    success: true,
    msg: `成功设置【${targetPet.name}】为出战宠物`,
    currentPet: targetPet
  }
}