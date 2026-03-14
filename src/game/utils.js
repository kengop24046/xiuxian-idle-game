import { gameState } from './state.js'
import { currentRealmExpNeed, currentRealmKillNeed } from './state.js'
import { EQUIPMENT_CONFIG, REALM_CONFIG } from './config.js'

export const formatNumber = (num) => {
  if (num < 10000) return Math.floor(num).toString()
  if (num < 100000000) return (num / 10000).toFixed(2) + '万'
  if (num < 1000000000000) return (num / 100000000).toFixed(2) + '亿'
  return (num / 1000000000000).toFixed(2) + '兆'
}

export const randomInt = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export const randomFloat = (min, max) => {
  return Math.random() * (max - min) + min
}

export const randomChance = (rate) => {
  return Math.random() * 100 <= rate
}

export function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

export function generateEquipment(level, minQuality = 1, maxQuality = 5, multiplier = 1) {
  level = Math.max(1, Number(level) || 1)
  minQuality = Math.max(1, Math.min(Number(minQuality) || 1, EQUIPMENT_CONFIG.quality.length))
  maxQuality = Math.max(minQuality, Math.min(Number(maxQuality) || 5, EQUIPMENT_CONFIG.quality.length))
  multiplier = Math.max(1, Number(multiplier) || 1)
  const parts = EQUIPMENT_CONFIG.parts
  const randomPart = parts[randomInt(0, parts.length - 1)]
  const qualityWeights = {
    1: 100,
    2: 80,
    3: 50,
    4: 25,
    5: 10,
    6: 3
  }
  let totalWeight = 0
  const validQualities = []
  for (let q = minQuality; q <= maxQuality; q++) {
    totalWeight += qualityWeights[q]
    validQualities.push({ quality: q, weight: qualityWeights[q] })
  }
  let randomNum = randomInt(1, totalWeight)
  let currentWeight = 0
  let selectedQuality = minQuality
  for (let q of validQualities) {
    currentWeight += q.weight
    if (randomNum <= currentWeight) {
      selectedQuality = q.quality
      break
    }
  }
  const qualityInfo = EQUIPMENT_CONFIG.quality[selectedQuality - 1]
  const baseAttrMulti = level * multiplier * qualityInfo.baseMultiplier
  const basePower = Math.floor(randomInt(1, 3) * baseAttrMulti)
  const baseConstitution = Math.floor(randomInt(1, 3) * baseAttrMulti)
  const baseAgility = Math.floor(randomInt(1, 3) * baseAttrMulti)
  const baseComprehension = Math.floor(randomInt(0, 2) * baseAttrMulti)
  const baseLuck = Math.floor(randomInt(0, 2) * baseAttrMulti)
  let baseAttack = 0
  let baseHp = 0
  let baseDefense = 0
  if (randomPart.id === 'weapon') {
    baseAttack = Math.floor(randomInt(3, 6) * baseAttrMulti)
  } else if (['armor', 'helmet', 'shoes', 'belt', 'bracers'].includes(randomPart.id)) {
    baseHp = Math.floor(randomInt(10, 20) * baseAttrMulti)
    baseDefense = Math.floor(randomInt(2, 4) * baseAttrMulti)
  } else {
    baseAttack = Math.floor(randomInt(1, 3) * baseAttrMulti)
    baseHp = Math.floor(randomInt(5, 10) * baseAttrMulti)
    baseDefense = Math.floor(randomInt(1, 2) * baseAttrMulti)
  }
  const prefixList = ['破损的', '普通的', '精良的', '优质的', '史诗的', '传说的', '逆天的']
  const prefix = prefixList[Math.min(selectedQuality, prefixList.length - 1)]
  const equipName = `${prefix}${randomPart.name}`
  return {
    id: Date.now() + '-' + randomInt(1000, 9999),
    name: equipName,
    partId: randomPart.id,
    partName: randomPart.name,
    qualityId: selectedQuality,
    qualityName: qualityInfo.name,
    qualityColor: qualityInfo.color,
    level: level,
    strengthenLevel: 0,
    star: 1,
    setId: null,
    setName: '',
    baseAttack: baseAttack,
    baseHp: baseHp,
    baseDefense: baseDefense,
    power: basePower,
    constitution: baseConstitution,
    agility: baseAgility,
    comprehension: baseComprehension,
    luck: baseLuck
  }
}

export function exportSave(gameState) {
  const saveData = JSON.parse(JSON.stringify({
    ...gameState,
    continuousAttackTimerId: null,
    isContinuousAttacking: false
  }))

  const blob = new Blob([JSON.stringify(saveData, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `xiuxian-save-${new Date().toLocaleDateString()}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
  return true
}

export async function importSave(file, gameState) {
  if (!file.name.endsWith('.json')) {
    throw new Error('请选择JSON格式的存档文件')
  }

  const text = await file.text()
  const parsedData = JSON.parse(text)

  if (!parsedData.currentRealmId || parsedData.gold === undefined) {
    throw new Error('无效的存档文件，缺少核心数据')
  }

  Object.assign(gameState, parsedData)
  return true
}