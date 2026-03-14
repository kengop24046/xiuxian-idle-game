import { gameState } from './state.js'
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
  level = Math.max(1, Number(level) || gameState.currentLevel || 1)
  minQuality = Math.max(1, Math.min(Number(minQuality) || 1, 5))
  maxQuality = Math.max(minQuality, Math.min(Number(maxQuality) || 5, 5))
  multiplier = Math.max(1, Number(multiplier) || 1)

  const parts = [
    { id: 'weapon', name: '武器', mainAttr: 'baseAttack' },
    { id: 'helmet', name: '头盔', mainAttr: 'baseDefense' },
    { id: 'armor', name: '铠甲', mainAttr: 'baseHp' },
    { id: 'belt', name: '腰带', mainAttr: 'baseHp' },
    { id: 'shoes', name: '鞋子', mainAttr: 'baseAgility' },
    { id: 'necklace', name: '项链', mainAttr: 'baseCritRate' },
    { id: 'ring', name: '戒指', mainAttr: 'baseAttack' },
    { id: 'bracers', name: '护腕', mainAttr: 'baseDefense' }
  ]

  const randomPart = parts[randomInt(0, parts.length - 1)]
  const qualityId = randomInt(minQuality, maxQuality)
  const qualityConfig = {
    1: { name: '普通', color: 'border-gray-400' },
    2: { name: '精良', color: 'border-green-400' },
    3: { name: '优质', color: 'border-blue-400' },
    4: { name: '史诗', color: 'border-purple-400' },
    5: { name: '传说', color: 'border-orange-400' }
  }
  const quality = qualityConfig[qualityId] || qualityConfig[1]

  const levelBase = Math.pow(1.2, level - 1) * multiplier
  const qualityBase = 1 + (qualityId - 1) * 0.3
  const mainAttrValue = Math.max(10, Math.floor(10 * levelBase * qualityBase))

  const baseAttr = {
    baseAttack: 0,
    baseHp: 0,
    baseDefense: 0,
    baseAgility: 0,
    baseCritRate: 0,
    basePower: 0,
    baseConstitution: 0,
    baseComprehension: 0,
    baseLuck: 0,
    baseCritDamage: 1,
    baseExpRate: 1,
    baseDropRate: 0
  }

  if (randomPart.mainAttr === 'baseAttack') {
    baseAttr.baseAttack = Math.max(1, mainAttrValue * 2)
  } else if (randomPart.mainAttr === 'baseHp') {
    baseAttr.baseHp = Math.max(100, mainAttrValue * 20)
  } else if (randomPart.mainAttr === 'baseDefense') {
    baseAttr.baseDefense = Math.max(1, mainAttrValue)
  } else if (randomPart.mainAttr === 'baseAgility') {
    baseAttr.baseAgility = Math.max(1, mainAttrValue)
  } else if (randomPart.mainAttr === 'baseCritRate') {
    baseAttr.baseCritRate = Math.max(0.01, mainAttrValue * 0.005)
  }

  const subAttrCount = qualityId >= 5 ? 4 : qualityId >= 3 ? 3 : 2
  const subAttrKeys = ['basePower', 'baseConstitution', 'baseAgility', 'baseComprehension', 'baseLuck']
  const addedSubAttrs = new Set()

  let addedCount = 0
  while (addedCount < subAttrCount && addedSubAttrs.size < subAttrKeys.length) {
    const randomKey = subAttrKeys[randomInt(0, subAttrKeys.length - 1)]
    if (!addedSubAttrs.has(randomKey)) {
      const addValue = Math.max(1, Math.floor(mainAttrValue * 0.3 * randomInt(8, 12) / 10))
      baseAttr[randomKey] += addValue
      addedSubAttrs.add(randomKey)
      addedCount++
    }
  }

  const prefixList = ['破损的', '普通的', '精良的', '优质的', '史诗的', '传说的', '神话的']
  const prefix = prefixList[Math.min(qualityId - 1, prefixList.length - 1)]
  const equipName = `${prefix}${randomPart.name}`

  const equipment = {
    id: generateUUID(),
    name: equipName,
    partId: randomPart.id,
    partName: randomPart.name,
    qualityId: qualityId,
    qualityName: quality.name,
    qualityColor: quality.color,
    level: level,
    strengthenLevel: 0,
    star: 1,
    setId: null,
    setName: null,
    generateTime: Date.now(),
    ...baseAttr
  }

  return equipment
}