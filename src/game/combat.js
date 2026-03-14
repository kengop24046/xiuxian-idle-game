import { 
  gameState, currentMap, playerTotalAttribute, saveGame, 
  currentRealmExpNeed, currentRealmKillNeed, addLevelExp, 
  playerMaxHp, playerRevive, addItem, currentPet, 
  allMapConfig, allMonsterConfig
} from './state.js'
import { 
  MONSTER_CONFIG, TRIAL_CONFIG, MAP_CONFIG, EQUIPMENT_CONFIG, 
  MONSTER_STRENGTH_CONFIG, EQUIPMENT_SET_CONFIG, PILL_CONFIG, 
  SKILL_CONFIG, SECRET_CONFIG, SECT_CONFIG, PET_CONFIG, 
  PET_EGG_CONFIG, SKY_TOWER_CONFIG, ARENA_CONFIG, 
  BATTLE_SPEED_CONFIG, IMMORTAL_MAP_CONFIG, IMMORTAL_MONSTER_CONFIG,
  REALM_CONFIG, ITEM_TYPE
} from './config.js'
import { randomInt, randomChance, generateEquipment, generateUUID } from './utils.js'

export function generateMonster() {
  const mid = gameState.currentMapId
  const currentMapData = allMapConfig.value.find(map => map.id === mid)
  const mapMonsters = allMonsterConfig.value.filter(monster => monster.mapId === mid)
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
  if (randomChance(5)) {
    const randomEvent = SECRET_CONFIG.events[randomInt(0, SECRET_CONFIG.events.length - 1)]
    if (randomEvent.effect === 'gift') {
      gameState.gold += 1000
      addItem('strengthenStone', 5)
      saveGame()
    }
    if (randomEvent.effect === 'test') {
      gameState.heartDevilTest = true
      saveGame()
    }
    if (randomEvent.effect === 'secret') {
      gameState.secret.available = true
      saveGame()
    }
  }
  gameState.secret.unlockCount++
  if (gameState.secret.unlockCount >= SECRET_CONFIG.unlockKill) {
    gameState.secret.available = true
    gameState.secret.unlockCount = 0
    saveGame()
  }
  if (randomChance(1)) addItem('normalPetEgg', 1)
  if (randomChance(0.3)) addItem('rarePetEgg', 1)
  if (randomChance(0.05)) addItem('legendaryPetEgg', 1)
  if (rareMonsters.length > 0 && randomChance(rareRate)) {
    const targetMonster = rareMonsters[randomInt(0, rareMonsters.length - 1)]
    const finalMulti = totalBaseMulti * rareBonus.hp
    const attackMulti = totalBaseMulti * rareBonus.attack
    const defenseMulti = totalBaseMulti * rareBonus.defense
    return {
      ...targetMonster,
      isRare: true,
      isElite: false,
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
      isElite: true,
      isRare: false,
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
      isElite: false,
      isRare: false,
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
  let totalDmg = 0
  let attackTimes = 1
  let finalCritRate = p.critRate
  const activeSkillId = gameState.skills.equippedActive
  const activeSkill = activeSkillId ? SKILL_CONFIG.active.find(s => s.id === activeSkillId) : null
  if (activeSkill && activeSkill.effect === 'multiAttack') attackTimes = activeSkill.param
  if (activeSkill && activeSkill.effect === 'critBoostActive' && gameState.skills.cd[activeSkillId] > Date.now()) finalCritRate = p.critRate * 2
  if (activeSkill && activeSkill.effect === 'shield') gameState.shield = 1
  gameState.skills.equippedActive = null
  let isCritFlag = false
  for (let i = 0; i < attackTimes; i++) {
    const isCrit = randomChance(finalCritRate)
    if (isCrit) isCritFlag = true
    const dmg = calcDamage(p.attack, m.defense, isCrit, p.critDamage)
    m.currentHp = Math.max(0, m.currentHp - dmg)
    totalDmg += dmg
    if (p.lifesteal > 0) {
      const healHp = Math.floor(dmg * p.lifesteal)
      gameState.currentHp = Math.min(gameState.currentHp + healHp, playerMaxHp.value)
    }
  }
  
  let petDmg = 0
  const pet = currentPet.value
  if (pet && pet.config.skill.dmgMulti) {
    petDmg = calcDamage(pet.atk, m.defense) * pet.config.skill.dmgMulti
    m.currentHp = Math.max(0, m.currentHp - petDmg)
  }
  const res = {
    damage: totalDmg,
    petDamage: petDmg,
    isCrit: isCritFlag,
    monsterDead: false,
    playerHurt: 0,
    playerDodged: false,
    playerDead: false,
    drop: null,
    reachKillNeed: false,
    levelUp: false,
    newMonster: null,
    heartDevilTest: gameState.heartDevilTest || false
  }
  
  if (m.currentHp <= 0) {
    res.monsterDead = true
    gameState.totalKillCount++
    gameState.realmKillCount++
    if (m.monsterId) {
      gameState.monsterKillCount[m.monsterId] = (gameState.monsterKillCount[m.monsterId] || 0) + 1
    }
    if (m.isElite) gameState.eliteKillCount++
    if (m.isRare) gameState.rareKillCount++
    if (gameState.sect.id !== 0 && gameState.sect.dailyTask?.type === 'kill') {
      gameState.sect.taskProgress = Math.min(
        gameState.sect.taskProgress + 1,
        gameState.sect.dailyTask.target
      )
    }
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
      items: [],
      equipment: null,
      pills: []
    }
    gameState.gold += m.gold
    gameState.totalGoldGet += m.gold
    gameState.currentExp += m.exp
    if (gameState.currentExp > currentRealmExpNeed.value) {
      gameState.currentExp = currentRealmExpNeed.value
    }
    
    const itemType = ['strengthenStone', 'upgradeStone', 'starStone'][randomInt(0, 2)]
    const itemCount = randomInt(1, 3)
    addItem(itemType, itemCount)
    drop.items.push({ type: itemType, count: itemCount })
    
    if (randomChance(15)) {
      const pillList = ['expPill', 'attackPill', 'defensePill']
      const pillId = pillList[randomInt(0, pillList.length - 1)]
      const pillCount = randomInt(1, 2)
      addItem(pillId, pillCount)
      drop.pills.push({ id: pillId, count: pillCount })
    }
    if (m.isRare && randomChance(30)) {
      addItem('superExpPill', 1)
      drop.pills.push({ id: 'superExpPill', count: 1 })
    }
    
    const equipDropRate = m.isRare ? 40 : m.isElite ? 20 : 10
    const equipLevel = Math.max(1, Math.floor(Number(m.maxHp) / 25) || 1)
    let minQuality = 1
    let maxQuality = 3
    if (m.isElite) { minQuality = 2; maxQuality = 5 }
    if (m.isRare) { minQuality = 3; maxQuality = 6 }
    
    if (randomChance(equipDropRate)) {
      const equipment = generateEquipment(equipLevel, minQuality, maxQuality, m.isRare ? 2 : 1.2)
      
      if (randomChance(m.isRare ? 40 : m.isElite ? 20 : 5)) {
        const availableSets = EQUIPMENT_SET_CONFIG.filter(set => 
          gameState.currentMapId >= set.minMapId && gameState.currentMapId <= set.maxMapId && equipment.qualityId >= set.minQuality
        )
        if (availableSets.length > 0) {
          const randomSet = availableSets[randomInt(0, availableSets.length - 1)]
          if (randomSet.parts.includes(equipment.partId)) {
            equipment.setId = randomSet.setId
            equipment.setName = randomSet.setName
          }
        }
      }
      
      const uniqueEquipId = `equip_${generateUUID()}`
      const addSuccess = addItem(uniqueEquipId, 1, {
        itemType: ITEM_TYPE.EQUIP,
        equipData: equipment,
        quality: equipment.qualityId || 1
      })
      
      if (addSuccess) {
        drop.equipment = equipment
      } else {
        console.warn('装备添加失败，背包已满或配置异常', equipment)
      }
    }
    
    res.drop = drop
    gameState.heartDevilTest = false
    
    let newMonster = null
    let retryCount = 0
    while (!newMonster && retryCount < 5) {
      newMonster = generateMonster()
      retryCount++
    }
    if (!newMonster) {
      newMonster = {
        name: '野外妖兽',
        isElite: false,
        isRare: false,
        maxHp: Math.floor(100 * Math.pow(1.1, gameState.currentMapId)),
        currentHp: Math.floor(100 * Math.pow(1.1, gameState.currentMapId)),
        attack: Math.floor(10 * Math.pow(1.1, gameState.currentMapId)),
        defense: Math.floor(5 * Math.pow(1.1, gameState.currentMapId)),
        gold: Math.floor(50 * Math.pow(1.1, gameState.currentMapId)),
        exp: Math.floor(20 * Math.pow(1.1, gameState.currentMapId)),
      }
    }
    gameState.currentMonster = newMonster
    res.newMonster = newMonster
    saveGame()
    stopContinuousAttack()
    return res
  }
  
  const isDodge = randomChance(p.dodgeRate)
  res.playerDodged = isDodge
  if (gameState.shield > 0) {
    gameState.shield--
    res.playerDodged = true
  } else if (!isDodge) {
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
  
  if (gameState.skyTowerDebuff?.effect?.monsterHeal) {
    m.currentHp = Math.min(m.currentHp + Math.floor(m.maxHp * gameState.skyTowerDebuff.effect.monsterHeal), m.maxHp)
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
  trialMonster.currentHp = Math.max(0, trialMonster.currentHp - damage)
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
  gameState.totalGoldGet += reward.gold
  const strengthenStone = Math.floor(baseReward.strengthenStone * multiplier * (isBoss ? bossReward.strengthenStone : 1))
  const upgradeStone = Math.floor(baseReward.upgradeStone * multiplier * (isBoss ? bossReward.upgradeStone : 1))
  if (strengthenStone > 0) {
    addItem('strengthenStone', strengthenStone)
    reward.items.push({ type: 'strengthenStone', count: strengthenStone })
  }
  if (upgradeStone > 0) {
    addItem('upgradeStone', upgradeStone)
    reward.items.push({ type: 'upgradeStone', count: upgradeStone })
  }
  if (isBoss) {
    const equipLevel = Math.max(1, layer * 2)
    let equipment = generateEquipment(equipLevel, 3, 6, 2)
    const uniqueEquipId = `trial_equip_${generateUUID()}`
    const equipAddData = {
      equipData: equipment,
      itemType: ITEM_TYPE.EQUIP,
      quality: equipment.qualityId || 3
    }
    const addSuccess = addItem(uniqueEquipId, 1, equipAddData)
    if (addSuccess) {
      reward.equipment = equipment
    }
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
  const speedInterval = Math.floor(interval / gameState.battleSpeed)
  gameState.isContinuousAttacking = true
  const attackLoop = () => {
    if (!gameState.currentMonster || gameState.autoBattle || !gameState.isContinuousAttacking || gameState.isPlayerDead) {
      stopContinuousAttack()
      return
    }
    attackMonster()
    gameState.continuousAttackTimerId = setTimeout(attackLoop, speedInterval)
  }
  attackMonster()
  gameState.continuousAttackTimerId = setTimeout(attackLoop, speedInterval)
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
    const mapMonsters = allMonsterConfig.value.filter(m => m.mapId === gameState.currentMapId)
    if (mapMonsters.length === 0) {
      return { success: false, msg: '当前地图无怪物' }
    }
    stopContinuousAttack()
    gameState.autoMeditate = false
  }
  gameState.autoBattle = !gameState.autoBattle
  if (gameState.autoBattle && !gameState.currentMonster) {
    let newMonster = generateMonster()
    if (!newMonster) {
      newMonster = {
        name: '自动战斗妖兽',
        isElite: false,
        isRare: false,
        maxHp: Math.floor(100 * Math.pow(1.1, gameState.currentMapId)),
        currentHp: Math.floor(100 * Math.pow(1.1, gameState.currentMapId)),
        attack: Math.floor(10 * Math.pow(1.1, gameState.currentMapId)),
        defense: Math.floor(5 * Math.pow(1.1, gameState.currentMapId)),
        gold: Math.floor(50 * Math.pow(1.1, gameState.currentMapId)),
        exp: Math.floor(20 * Math.pow(1.1, gameState.currentMapId)),
      }
    }
    gameState.currentMonster = newMonster
  }
  saveGame()
  
  return {
    success: true,
    msg: gameState.autoBattle ? '全局自动打怪已开启' : '全局自动打怪已关闭'
  }
}

export function generateSkyTowerMonster(layer) {
  const { baseHpMulti, baseAtkMulti, baseDefMulti, levelMulti, bossInterval, debuffList } = SKY_TOWER_CONFIG
  const isBoss = layer % bossInterval === 0
  const multi = Math.pow(levelMulti, layer - 1)
  const debuff = debuffList[randomInt(0, debuffList.length - 1)]
  gameState.skyTowerDebuff = debuff
  return {
    layer,
    name: isBoss ? `通天塔·第${layer}层·镇守BOSS` : `通天塔·第${layer}层·守卫`,
    isBoss,
    maxHp: Math.floor(100 * baseHpMulti * multi * (isBoss ? 5 : 1)),
    currentHp: Math.floor(100 * baseHpMulti * multi * (isBoss ? 5 : 1)),
    attack: Math.floor(10 * baseAtkMulti * multi * (isBoss ? 3 : 1)),
    defense: Math.floor(5 * baseDefMulti * multi * (isBoss ? 3 : 1)),
    debuff
  }
}

export function attackSkyTowerMonster() {
  const m = gameState.skyTowerMonster
  const p = playerTotalAttribute.value
  if (!m) return { type: 'none', msg: '没有可攻击的通天塔怪物' }
  const isCrit = randomChance(p.critRate)
  const dmg = calcDamage(p.attack, m.defense, isCrit, p.critDamage)
  m.currentHp = Math.max(0, m.currentHp - dmg)
  const res = {
    damage: dmg,
    isCrit,
    monsterDead: false,
    playerHurt: 0,
    reward: null
  }
  if (m.currentHp <= 0) {
    res.monsterDead = true
    const { baseReward, bossReward } = SKY_TOWER_CONFIG
    const reward = {
      gold: baseReward.gold * m.layer,
      strengthenStone: baseReward.strengthenStone * m.layer,
      arenaCoin: baseReward.arenaCoin * m.layer,
      petEgg: null,
      freeAttributePoint: 0
    }
    if (m.isBoss) {
      reward.petEgg = bossReward.petEgg
      reward.freeAttributePoint = bossReward.freeAttributePoint
      reward.arenaCoin += bossReward.arenaCoin
      addItem(`${reward.petEgg}PetEgg`, 1)
      gameState.freeAttributePoint += reward.freeAttributePoint
    }
    gameState.gold += reward.gold
    addItem('strengthenStone', reward.strengthenStone)
    addItem('arenaCoin', reward.arenaCoin)
    res.reward = reward
    if (m.layer >= gameState.skyTowerMaxLayer) {
      gameState.skyTowerMaxLayer = m.layer + 1
    }
    gameState.skyTowerCurrentLayer = m.layer + 1
    gameState.skyTowerMonster = null
    gameState.skyTowerDebuff = null
    saveGame()
  } else {
    const isDodge = randomChance(p.dodgeRate)
    if (!isDodge) {
      const dmg = calcDamage(m.attack, p.defense)
      res.playerHurt = dmg
      gameState.currentHp = Math.max(0, gameState.currentHp - dmg)
      if (gameState.currentHp <= 0) {
        gameState.skyTowerMonster = null
        gameState.skyTowerDebuff = null
      }
    }
  }
  saveGame()
  return res
}

export function generateArenaOpponent(rank) {
  const level = Math.max(1, Math.floor((ARENA_CONFIG.baseRank - rank) / 10))
  const realmId = Math.max(1, Math.floor(level / 10))
  return {
    rank,
    name: `修仙者${randomInt(1000, 9999)}`,
    level,
    realmId: REALM_CONFIG[realmId - 1]?.name || '炼气期',
    attack: Math.floor(100 * Math.pow(1.2, level)),
    hp: Math.floor(2000 * Math.pow(1.2, level)),
    defense: Math.floor(50 * Math.pow(1.2, level)),
  }
}

export function arenaBattle(opponent) {
  const p = playerTotalAttribute.value
  let playerHp = p.hp
  let opponentHp = opponent.hp
  let round = 0
  while (round < 100 && playerHp > 0 && opponentHp > 0) {
    const playerDmg = calcDamage(p.attack, opponent.defense)
    opponentHp = Math.max(0, opponentHp - playerDmg)
    if (opponentHp <= 0) break
    const opponentDmg = calcDamage(opponent.attack, p.defense)
    playerHp = Math.max(0, playerHp - opponentDmg)
    round++
  }
  const win = opponentHp <= 0
  if (win && opponent.rank < gameState.arenaRank) {
    gameState.arenaRank = opponent.rank
  }
  gameState.arenaChallengeTimes -= 1
  saveGame()
  return { win, playerHp, opponentHp }
}

export default {
  generateMonster,
  generateTrialMonster,
  attackMonster,
  attackTrialMonster,
  toggleAutoBattle,
  startContinuousAttack,
  stopContinuousAttack,
  generateSkyTowerMonster,
  attackSkyTowerMonster,
  generateArenaOpponent,
  arenaBattle
}