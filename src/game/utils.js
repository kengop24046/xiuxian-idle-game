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

export const generateEquipment = (level, qualityMin = 0, qualityMax = 7, mapMultiplier = 1) => {
  const { parts, quality, namePrefix, nameSuffix } = EQUIPMENT_CONFIG
  
  let targetQuality
  const qualityList = quality.slice(qualityMin, qualityMax + 1)
  const totalRate = qualityList.reduce((sum, q) => sum + q.dropRate, 0)
  let random = randomFloat(0, totalRate)
  let currentRate = 0
  for (const q of qualityList) {
    currentRate += q.dropRate
    if (random <= currentRate) {
      targetQuality = q
      break
    }
  }
  if (!targetQuality) targetQuality = qualityList[0]

  const part = parts[randomInt(0, parts.length - 1)]
  
  const prefix = namePrefix[randomInt(0, namePrefix.length - 1)]
  const suffixList = nameSuffix[part.id]
  const suffix = suffixList[randomInt(0, suffixList.length - 1)]
  const name = `${prefix}${suffix}`

  const baseLevel = Math.max(1, level)
  const baseAttrValue = baseLevel * 10 * targetQuality.baseMultiplier * mapMultiplier
  
  const mainAttr = {}
  switch (part.mainAttr) {
    case 'attack':
      mainAttr.attack = Math.floor(baseAttrValue * 1.2)
      break
    case 'hp':
      mainAttr.hp = Math.floor(baseAttrValue * 5)
      break
    case 'defense':
      mainAttr.defense = Math.floor(baseAttrValue * 0.8)
      break
    case 'power':
      mainAttr.power = Math.floor(baseAttrValue * 0.5)
      break
    case 'constitution':
      mainAttr.constitution = Math.floor(baseAttrValue * 0.5)
      break
    case 'agility':
      mainAttr.agility = Math.floor(baseAttrValue * 0.5)
      break
    case 'comprehension':
      mainAttr.comprehension = Math.floor(baseAttrValue * 0.5)
      break
    case 'luck':
      mainAttr.luck = Math.floor(baseAttrValue * 0.5)
      break
  }

  const extraAttrs = {}
  const attrKeys = ['attack', 'hp', 'defense', 'power', 'constitution', 'agility', 'comprehension', 'luck']
  const extraAttrCount = targetQuality.attrCount - 1
  for (let i = 0; i < extraAttrCount; i++) {
    const randomAttr = attrKeys[randomInt(0, attrKeys.length - 1)]
    const attrValue = Math.floor(baseAttrValue * randomFloat(0.3, 0.8))
    extraAttrs[randomAttr] = (extraAttrs[randomAttr] || 0) + attrValue
  }

  const attrs = { ...mainAttr, ...extraAttrs }

  const id = Date.now() + randomInt(0, 10000)

  return {
    id,
    name,
    partId: part.id,
    partName: part.name,
    qualityId: targetQuality.id,
    qualityName: targetQuality.name,
    qualityColor: targetQuality.color,
    level: baseLevel,
    strengthenLevel: 0,
    star: 0,
    attrs,
  }
}

export const exportSave = () => {
  try {
    const saveData = JSON.stringify(gameState)
    const blob = new Blob([saveData], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `修仙挂机录_存档_${new Date().toLocaleDateString().replace(/\//g, '-')}.json`
    a.click()
    URL.revokeObjectURL(url)
    return true
  } catch (e) {
    console.error('导出存档失败', e)
    return false
  }
}

export const importSave = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const saveData = JSON.parse(e.target.result)
        if (!saveData.currentRealmId || saveData.gold === undefined) {
          reject(new Error('存档格式错误'))
          return
        }
        Object.assign(gameState, saveData)
        localStorage.setItem('xianxia_game_save', JSON.stringify(gameState))
        resolve(true)
      } catch (err) {
        reject(new Error('存档解析失败'))
      }
    }
    reader.onerror = () => reject(new Error('文件读取失败'))
    reader.readAsText(file)
  })
}

export const checkMapUnlocked = (map) => {
  const playerRealmId = gameState.currentRealmId
  const playerLevel = gameState.currentLevel
  if (playerRealmId > map.unlockRealmId) return true
  if (playerRealmId === map.unlockRealmId && playerLevel >= map.unlockLevel) return true
  return false
}

export const checkRealmBreakable = () => {
  const { currentExp, realmKillCount } = gameState
  const expNeed = currentRealmExpNeed.value
  const killNeed = currentRealmKillNeed.value
  return currentExp >= expNeed && realmKillCount >= killNeed
}