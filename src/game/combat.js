import { gameState, currentMap, playerTotalAttribute, saveGame, currentRealmExpNeed } from './state.js'
import { MONSTER_CONFIG, TRIAL_CONFIG, EQUIPMENT_CONFIG, MAP_CONFIG } from './config.js'
import { randomInt, randomChance, generateEquipment } from './utils.js'

export const generateMonster = () => {
  const mapId = gameState.currentMapId
  const currentMap = MAP_CONFIG.find(map => map.id === mapId)
  const mapMonsters = MONSTER_CONFIG.filter(monster => monster.mapId === mapId)
  if (mapMonsters.length === 0) return null

  let eliteRate = 20
  if (currentMap.specialTag === 'elite_rate_up') eliteRate = 50

  let rareRate = 5
  if (currentMap.specialTag === 'rare_monster_up') rareRate = 10
  const rareMonsters = mapMonsters.filter(m => m.isRare)
  const normalMonsters = mapMonsters.filter(m => !m.isElite && !m.isRare)
  const eliteMonsters = mapMonsters.filter(m => m.isElite)

  if (rareMonsters.length > 0 && randomChance(rareRate)) {
    const targetMonster = rareMonsters[randomInt(0, rareMonsters.length - 1)]
    const levelMultiplier = Math.pow(1.1, gameState.reincarnationCount)
    return {
      ...targetMonster,
      maxHp: Math.floor(targetMonster.baseHp * levelMultiplier),
      currentHp: Math.floor(targetMonster.baseHp * levelMultiplier),
      attack: Math.floor(targetMonster.baseAttack * levelMultiplier * (currentMap.monsterAttackUp ? 1 + currentMap.monsterAttackUp : 1)),
      defense: Math.floor(targetMonster.baseDefense * levelMultiplier),
      gold: Math.floor(targetMonster.baseGold * currentMap.goldMultiplier * levelMultiplier),
      exp: Math.floor(targetMonster.baseExp * currentMap.expMultiplier * levelMultiplier),
    }
  }

  let targetMonster
  if (eliteMonsters.length > 0 && randomChance(eliteRate)) {
    targetMonster = eliteMonsters[randomInt(0, eliteMonsters.length - 1)]
  } else {
    targetMonster = normalMonsters[randomInt(0, normalMonsters.length - 1)]
  }

  const levelMultiplier = Math.pow(1.1, gameState.reincarnationCount)
  return {
    ...targetMonster,
    maxHp: Math.floor(targetMonster.baseHp * levelMultiplier),
    currentHp: Math.floor(targetMonster.baseHp * levelMultiplier),
    attack: Math.floor(targetMonster.baseAttack * levelMultiplier * (currentMap.monsterAttackUp ? 1 + currentMap.monsterAttackUp : 1)),
    defense: Math.floor(targetMonster.baseDefense * levelMultiplier),
    gold: Math.floor(targetMonster.baseGold * currentMap.goldMultiplier * levelMultiplier),
    exp: Math.floor(targetMonster.baseExp * currentMap.expMultiplier * levelMultiplier),
  }
}

export const generateTrialMonster = (layer) => {
  const { baseHpMultiplier, baseAttackMultiplier, baseDefenseMultiplier, bossLayers } = TRIAL_CONFIG
  const isBoss = bossLayers.includes(layer)
  const levelMultiplier = Math.pow(1.15, layer - 1) * Math.pow(1.2, gameState.reincarnationCount)

  const baseMonster = MONSTER_CONFIG[Math.min(Math.floor(layer / 10), MONSTER_CONFIG.length - 1)]
  const name = isBoss ? `试炼·第${layer}层·镇守BOSS` : `试炼·第${layer}层·妖兽`

  return {
    layer,
    name,
    isBoss,
    maxHp: Math.floor(baseMonster.baseHp * baseHpMultiplier * levelMultiplier * (isBoss ? 5 : 1)),
    currentHp: Math.floor(baseMonster.baseHp * baseHpMultiplier * levelMultiplier * (isBoss ? 5 : 1)),
    attack: Math.floor(baseMonster.baseAttack * baseAttackMultiplier * levelMultiplier * (isBoss ? 3 : 1)),
    defense: Math.floor(baseMonster.baseDefense * baseDefenseMultiplier * levelMultiplier * (isBoss ? 3 : 1)),
  }
}

const calculateDamage = (attackerAttack, defenderDefense, isCrit = false, critDamage = 1.5) => {
  const baseDamage = Math.max(1, attackerAttack - defenderDefense * 0.5)
  return isCrit ? Math.floor(baseDamage * critDamage) : Math.floor(baseDamage)
}

export const attackMonster = () => {
  const { currentMonster, autoBattle } = gameState
  const playerAttr = playerTotalAttribute.value
  if (!currentMonster) return { type: 'none', msg: '没有可攻击的怪物' }

  const isCrit = randomChance(playerAttr.critRate)
  const damage = calculateDamage(playerAttr.attack, currentMonster.defense, isCrit, playerAttr.critDamage)
  currentMonster.currentHp -= damage

  const result = {
    type: 'attack',
    damage,
    isCrit,
    monsterDead: false,
    playerHurt: 0,
    playerDead: false,
    drop: null,
  }

  if (currentMonster.currentHp <= 0) {
    result.monsterDead = true
    result.drop = handleMonsterDrop(currentMonster)
    gameState.totalKillCount += 1
    gameState.realmKillCount += 1
    gameState.currentMonster = null
    if (autoBattle) {
      gameState.currentMonster = generateMonster()
    }
    saveGame()
    return result
  }

  const isDodge = randomChance(playerAttr.dodgeRate)
  if (!isDodge) {
    const monsterDamage = calculateDamage(currentMonster.attack, playerAttr.defense)
    result.playerHurt = monsterDamage
  }

  return result
}

const handleMonsterDrop = (monster) => {
  const playerAttr = playerTotalAttribute.value
  const currentMap = MAP_CONFIG.find(map => map.id === gameState.currentMapId)
  const mapMultiplier = currentMap.dropMultiplier
  const dropRateBonus = playerAttr.dropRate * 100
  const drop = {
    gold: monster.gold,
    exp: monster.exp,
    items: [],
    equipment: null,
  }

  gameState.gold += monster.gold
  gameState.currentExp += monster.exp
  const expNeed = currentRealmExpNeed.value
  if (gameState.currentExp > expNeed) gameState.currentExp = expNeed

  const stoneMultiplier = 1 + (currentMap.stoneDropUp || 0) + (currentMap.allStoneUp || 0)

  if (randomChance(30 + dropRateBonus)) {
    const itemTypes = ['strengthenStone', 'upgradeStone', 'starStone']
    let weight = [1,1,1]
    if (currentMap.specialTag === 'strengthen_stone_up') weight = [3,1,1]
    if (currentMap.specialTag === 'upgrade_stone_up') weight = [1,3,1]
    if (currentMap.specialTag === 'star_stone_up') weight = [1,1,3]

    const randomNum = Math.random() * weight.reduce((a,b) => a+b, 0)
    let itemType = 'strengthenStone'
    if (randomNum < weight[0]) itemType = 'strengthenStone'
    else if (randomNum < weight[0]+weight[1]) itemType = 'upgradeStone'
    else itemType = 'starStone'

    const baseCount = randomInt(1, monster.isElite ? 5 : 2)
    const count = Math.max(1, Math.floor(baseCount * stoneMultiplier))
    gameState.items[itemType] += count
    drop.items.push({ type: itemType, count })
  }

  if (monster.trait === 'stone_drop' && randomChance(100)) {
    const itemType = monster.mapId === 13 ? 'strengthenStone' : monster.mapId === 15 ? 'upgradeStone' : 'starStone'
    const count = randomInt(1,2)
    gameState.items[itemType] += count
    drop.items.push({ type: itemType, count })
  }

  let baseEquipDropRate = monster.isElite ? 30 : 10
  if (monster.isRare) baseEquipDropRate = 100
  if (currentMap.equipDropUp) baseEquipDropRate *= (1 + currentMap.equipDropUp)
  if (randomChance(baseEquipDropRate + dropRateBonus)) {
    const equipLevel = Math.max(1, Math.floor(monster.maxHp / 50))
    let qualityMax = monster.isElite ? 6 : 5
    let qualityMin = currentMap.equipQualityMin || 0
    if (monster.isRare) qualityMin = Math.max(qualityMin, 3)
    const equipment = generateEquipment(equipLevel, qualityMin, qualityMax, mapMultiplier)
    gameState.bagEquipments.push(equipment)
    drop.equipment = equipment
    if (monster.trait === 'double_drop') {
      const extraEquip = generateEquipment(equipLevel, qualityMin, qualityMax, mapMultiplier)
      gameState.bagEquipments.push(extraEquip)
      drop.extraEquipment = extraEquip
    }
  }

  return drop
}

export const attackTrialMonster = () => {
  const { trialMonster } = gameState
  const playerAttr = playerTotalAttribute.value
  if (!trialMonster) return { type: 'none', msg: '没有可攻击的试炼怪物' }

  const isCrit = randomChance(playerAttr.critRate)
  const damage = calculateDamage(playerAttr.attack, trialMonster.defense, isCrit, playerAttr.critDamage)
  trialMonster.currentHp -= damage

  const result = {
    type: 'attack',
    damage,
    isCrit,
    monsterDead: false,
    playerHurt: 0,
    playerDead: false,
    reward: null,
  }

  if (trialMonster.currentHp <= 0) {
    result.monsterDead = true
    result.reward = handleTrialReward(trialMonster)
    if (trialMonster.layer >= gameState.trialMaxLayer) {
      gameState.trialMaxLayer = trialMonster.layer + 1
    }
    gameState.trialCurrentLayer = trialMonster.layer + 1
    gameState.trialMonster = null
    saveGame()
    return result
  }

  const isDodge = randomChance(playerAttr.dodgeRate)
  if (!isDodge) {
    const monsterDamage = calculateDamage(trialMonster.attack, playerAttr.defense)
    result.playerHurt = monsterDamage
  }

  return result
}

const handleTrialReward = (monster) => {
  const { baseReward, bossReward, rewardMultiplier } = TRIAL_CONFIG
  const layer = monster.layer
  const multiplier = Math.pow(rewardMultiplier, layer - 1)
  const isBoss = monster.isBoss

  const reward = {
    gold: Math.floor(baseReward.gold * multiplier * (isBoss ? bossReward.goldMultiplier : 1)),
    items: [],
    equipment: null,
  }

  gameState.gold += reward.gold

  const strengthenStone = Math.floor(baseReward.strengthenStone * multiplier * (isBoss ? bossReward.strengthenStone : 1))
  const upgradeStone = Math.floor(baseReward.upgradeStone * multiplier * (isBoss ? bossReward.upgradeStone : 1))
  const starStone = Math.floor(baseReward.starStone * multiplier * (isBoss ? bossReward.starStone : 1))

  if (strengthenStone > 0) {
    gameState.items.strengthenStone += strengthenStone
    reward.items.push({ type: 'strengthenStone', count: strengthenStone })
  }
  if (upgradeStone > 0) {
    gameState.items.upgradeStone += upgradeStone
    reward.items.push({ type: 'upgradeStone', count: upgradeStone })
  }
  if (starStone > 0) {
    gameState.items.starStone += starStone
    reward.items.push({ type: 'starStone', count: starStone })
  }

  const qualityMin = isBoss ? bossReward.equipQualityMin : Math.max(0, Math.floor(layer / 10) - 1)
  const qualityMax = Math.min(7, Math.floor(layer / 10) + 2)
  const equipLevel = layer * 2
  const equipment = generateEquipment(equipLevel, qualityMin, qualityMax, multiplier)
  gameState.bagEquipments.push(equipment)
  reward.equipment = equipment

  return reward
}

export const toggleAutoBattle = () => {
  gameState.autoBattle = !gameState.autoBattle
  if (gameState.autoBattle && !gameState.currentMonster) {
    gameState.currentMonster = generateMonster()
  }
  saveGame()
}