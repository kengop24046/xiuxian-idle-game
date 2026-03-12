import { gameState, currentMap, playerTotalAttribute, saveGame, currentRealmExpNeed, currentRealmKillNeed, addLevelExp, playerMaxHp, playerRevive } from './state.js'
import { MONSTER_CONFIG, TRIAL_CONFIG, MAP_CONFIG, EQUIPMENT_CONFIG, MONSTER_STRENGTH_CONFIG } from './config.js'
import { randomInt, randomChance, generateEquipment } from './utils.js'

export function generateMonster() {
  const mid = gameState.currentMapId
  const currentMapData = MAP_CONFIG.find(map => map.id === mid)
  const mapMonsters = MONSTER_CONFIG.filter(monster => monster.mapId === mid)
  if (mapMonsters.length === 0) return null

  let eliteRate = 20
  if (currentMapData.specialTag === 'elite_rate_up') eliteRate = 50
  let rareRate = 5
  if (currentMapData.specialTag === 'rare_monster_up') rareRate = 10

  const rareMonsters = mapMonsters.filter(m => m.isRare)
  const normalMonsters = mapMonsters.filter(m => !m.isElite && !m.isRare)
  const eliteMonsters = mapMonsters.filter(m => m.isElite)

  const { 
    mapMultiplier, 
    realmMultiplier, 
    levelMultiplier, 
    reincarnationMultiplier,
    eliteBonus,
    rareBonus,
    maxMultiplier
  } = MONSTER_STRENGTH_CONFIG

  const mapBaseMulti = Math.pow(mapMultiplier, mid - 1)
  const realmBaseMulti = Math.pow(realmMultiplier, gameState.currentRealmId - 1)
  const levelBaseMulti = Math.pow(levelMultiplier, gameState.level - 1)
  const reincarnationBaseMulti = Math.pow(reincarnationMultiplier, gameState.reincarnationCount)

  let totalBaseMulti = mapBaseMulti * realmBaseMulti * levelBaseMulti * reincarnationBaseMulti
  totalBaseMulti = Math.min(totalBaseMulti, maxMultiplier)

  if (rareMonsters.length > 0 && randomChance(rareRate)) {
    const targetMonster = rareMonsters[randomInt(0, rareMonsters.length - 1)]
    const finalMulti = totalBaseMulti * rareBonus.hp
    const attackMulti = totalBaseMulti * rareBonus.attack
    const defenseMulti = totalBaseMulti * rareBonus.defense

    return {
      ...targetMonster,
      maxHp: Math.floor(targetMonster.baseHp * finalMulti),
      currentHp: Math.floor(targetMonster.baseHp * finalMulti),
      attack: Math.floor(targetMonster.baseAttack * attackMulti * (currentMapData.monsterAttackUp ? 1 + currentMapData.monsterAttackUp : 1)),
      defense: Math.floor(targetMonster.baseDefense * defenseMulti),
      gold: Math.floor(targetMonster.baseGold * currentMapData.goldMultiplier * totalBaseMulti),
      exp: Math.floor(targetMonster.baseExp * currentMapData.expMultiplier * totalBaseMulti),
    }
  }

  let targetMonster
  if (eliteMonsters.length > 0 && randomChance(eliteRate)) {
    targetMonster = eliteMonsters[randomInt(0, eliteMonsters.length - 1)]
    const finalMulti = totalBaseMulti * eliteBonus.hp
    const attackMulti = totalBaseMulti * eliteBonus.attack
    const defenseMulti = totalBaseMulti * eliteBonus.defense

    return {
      ...targetMonster,
      maxHp: Math.floor(targetMonster.baseHp * finalMulti),
      currentHp: Math.floor(targetMonster.baseHp * finalMulti),
      attack: Math.floor(targetMonster.baseAttack * attackMulti * (currentMapData.monsterAttackUp ? 1 + currentMapData.monsterAttackUp : 1)),
      defense: Math.floor(targetMonster.baseDefense * defenseMulti),
      gold: Math.floor(targetMonster.baseGold * currentMapData.goldMultiplier * totalBaseMulti),
      exp: Math.floor(targetMonster.baseExp * currentMapData.expMultiplier * totalBaseMulti),
    }
  } else {
    targetMonster = normalMonsters[randomInt(0, normalMonsters.length - 1)]
    return {
      ...targetMonster,
      maxHp: Math.floor(targetMonster.baseHp * totalBaseMulti),
      currentHp: Math.floor(targetMonster.baseHp * totalBaseMulti),
      attack: Math.floor(targetMonster.baseAttack * totalBaseMulti * (currentMapData.monsterAttackUp ? 1 + currentMapData.monsterAttackUp : 1)),
      defense: Math.floor(targetMonster.baseDefense * totalBaseMulti),
      gold: Math.floor(targetMonster.baseGold * currentMapData.goldMultiplier * totalBaseMulti),
      exp: Math.floor(targetMonster.baseExp * currentMapData.expMultiplier * totalBaseMulti),
    }
  }
}

export function generateTrialMonster(layer) {
  const { baseHpMultiplier, baseAttackMultiplier, baseDefenseMultiplier, bossLayers } = TRIAL_CONFIG
  const isBoss = bossLayers.includes(layer)
  const levelMultiplier = Math.pow(1.15, layer - 1) * Math.pow(1.2, gameState.reincarnationCount)
  const monsterIndex = Math.min(Math.floor(layer / 10), MONSTER_CONFIG.length - 1)
  const baseMonster = MONSTER_CONFIG[monsterIndex] || { baseHp: 100, baseAttack: 10, baseDefense: 5 }
  
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

function calcDamage(atk, def, isCrit = false, critDamage = 1.5) {
  const baseDamage = Math.max(1, Math.floor(atk - def * 0.5))
  return isCrit ? Math.floor(baseDamage * critDamage) : baseDamage
}

export function attackMonster() {
  const p = playerTotalAttribute.value
  const m = gameState.currentMonster
  if (!m || gameState.isPlayerDead) return { type: 'none' }

  const isCrit = randomChance(p.critRate)
  const dmg = calcDamage(p.attack, m.defense, isCrit, p.critDamage)
  m.currentHp -= dmg

  const res = {
    damage: dmg,
    isCrit,
    monsterDead: false,
    playerHurt: 0,
    playerDodged: false,
    playerDead: false,
    drop: null,
    reachKillNeed: false,
    levelUp: false
  }

  if (m.currentHp <= 0) {
    res.monsterDead = true
    gameState.totalKillCount++
    gameState.realmKillCount++

    const levelExpGained = Math.floor(m.exp / 5)
    const isLevelUp = addLevelExp(levelExpGained)
    res.levelUp = isLevelUp

    const reach = gameState.realmKillCount >= currentRealmKillNeed.value
    res.reachKillNeed = reach
    if (reach) gameState.autoBattle = false

    const drop = {
      gold: m.gold,
      exp: m.exp,
      levelExp: levelExpGained,
      items: []
    }
    gameState.gold += m.gold
    gameState.currentExp += m.exp
    
    if (gameState.currentExp > currentRealmExpNeed.value) {
      gameState.currentExp = currentRealmExpNeed.value
    }

    const itemType = ['strengthenStone', 'upgradeStone', 'starStone'][randomInt(0, 2)]
    const itemCount = randomInt(1, 3)
    gameState.items[itemType] = (Number(gameState.items[itemType]) || 0) + itemCount
    drop.items.push({ type: itemType, count: itemCount })

    if ((m.isElite || m.isRare) && randomChance(30 + p.dropRate * 100)) {
      const equipLevel = Math.max(1, Math.floor(m.maxHp / 50))
      const equipment = generateEquipment(equipLevel, 2, 5, 1.5)
      gameState.bagEquipments.push(equipment)
      drop.equipment = equipment
    }

    res.drop = drop
    gameState.currentMonster = null
    saveGame()
    stopContinuousAttack()
    return res
  }

  const isDodge = randomChance(p.dodgeRate)
  res.playerDodged = isDodge
  if (!isDodge) {
    const monsterDamage = calcDamage(m.attack, p.defense)
    res.playerHurt = monsterDamage
    gameState.currentHp = Math.max(0, gameState.currentHp - monsterDamage)
    
    if (gameState.currentHp <= 0) {
      gameState.isPlayerDead = true
      res.playerDead = true
      gameState.autoBattle = false
      gameState.isContinuousAttacking = false
      gameState.currentMonster = null
      stopContinuousAttack()
    }
  }

  saveGame()
  return res
}

export function attackTrialMonster() {
  const { trialMonster } = gameState
  const playerAttr = playerTotalAttribute.value
  if (!trialMonster) return { type: 'none', msg: '没有可攻击的试炼怪物' }

  const isCrit = randomChance(playerAttr.critRate)
  const damage = calcDamage(playerAttr.attack, trialMonster.defense, isCrit, playerAttr.critDamage)
  trialMonster.currentHp -= damage

  const result = {
    type: 'attack',
    damage,
    isCrit,
    monsterDead: false,
    playerHurt: 0,
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
  } else {
    const isDodge = randomChance(playerAttr.dodgeRate)
    if (!isDodge) {
      result.playerHurt = calcDamage(trialMonster.attack, playerAttr.defense)
    }
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
  if (strengthenStone > 0) {
    gameState.items.strengthenStone = (Number(gameState.items.strengthenStone) || 0) + strengthenStone
    reward.items.push({ type: 'strengthenStone', count: strengthenStone })
  }
  if (upgradeStone > 0) {
    gameState.items.upgradeStone = (Number(gameState.items.upgradeStone) || 0) + upgradeStone
    reward.items.push({ type: 'upgradeStone', count: upgradeStone })
  }

  if (isBoss) {
    const equipLevel = layer * 2
    reward.equipment = generateEquipment(equipLevel, 3, 6, 2)
    gameState.bagEquipments.push(reward.equipment)
  }

  return reward
}

export function stopContinuousAttack() {
  if (gameState.continuousAttackTimerId) {
    clearTimeout(gameState.continuousAttackTimerId)
    gameState.continuousAttackTimerId = null
  }
  gameState.isContinuousAttacking = false
}

export function startContinuousAttack(interval = 200) {
  if (!gameState.currentMonster || gameState.isPlayerDead) {
    return { success: false, msg: gameState.isPlayerDead ? '你已死亡，请复活' : '暂无怪物目标' }
  }
  if (gameState.isContinuousAttacking) {
    return { success: false, msg: '已在连续攻击中' }
  }
  if (gameState.autoBattle) {
    return { success: false, msg: '已开启全局自动打怪' }
  }

  gameState.isContinuousAttacking = true
  const attackLoop = () => {
    if (!gameState.currentMonster || gameState.autoBattle || !gameState.isContinuousAttacking || gameState.isPlayerDead) {
      stopContinuousAttack()
      return
    }
    attackMonster()
    gameState.continuousAttackTimerId = setTimeout(attackLoop, interval)
  }

  attackMonster()
  gameState.continuousAttackTimerId = setTimeout(attackLoop, interval)
  return { success: true, msg: '开始连续攻击' }
}

export function toggleAutoBattle() {
  if (gameState.isPlayerDead) {
    return { success: false, msg: '你已死亡，无法开启自动打怪' }
  }
  if (!gameState.autoBattle) {
    if (gameState.realmKillCount >= currentRealmKillNeed.value) {
      return { success: false, msg: '当前境界击杀数已达标' }
    }
    const mapMonsters = MONSTER_CONFIG.filter(m => m.mapId === gameState.currentMapId)
    if (mapMonsters.length === 0) {
      return { success: false, msg: '当前地图无怪物' }
    }
    stopContinuousAttack()
    gameState.autoMeditate = false
  }

  gameState.autoBattle = !gameState.autoBattle
  if (gameState.autoBattle && !gameState.currentMonster) {
    gameState.currentMonster = generateMonster()
  }
  saveGame()
  
  return {
    success: true,
    msg: gameState.autoBattle ? '全局自动打怪已开启' : '全局自动打怪已关闭'
  }
}

export default {
  generateMonster,
  generateTrialMonster,
  attackMonster,
  attackTrialMonster,
  toggleAutoBattle,
  startContinuousAttack,
  stopContinuousAttack
}