import { gameState } from '../gameState.js'

export function saveGame() {
  try {
    const data = JSON.parse(JSON.stringify(gameState))
    data.lastSaveTime = Date.now()
    localStorage.setItem('xiuxian_save', JSON.stringify(data))
    console.log('✅ 已保存到浏览器')
    return true
  } catch (e) {
    console.error('❌ 保存失败', e)
    return false
  }
}

export function loadGame() {
  try {
    const str = localStorage.getItem('xiuxian_save')
    if (!str) {
      console.log('ℹ️ 无存档')
      return false
    }

    const data = JSON.parse(str)
    for (const key in data) {
      if (gameState.hasOwnProperty(key) || gameState[key] !== undefined) {
        gameState[key] = data[key]
      }
    }

    console.log('✅ 读档成功！恢复到上次进度')
    return true
  } catch (e) {
    console.error('❌ 读档失败，清除坏存档')
    localStorage.removeItem('xiuxian_save')
    return false
  }
}

export function resetGame() {
  if (confirm('确定重置？所有进度消失！')) {
    localStorage.removeItem('xiuxian_save')
    location.reload()
  }
}

export function startAutoSave() {
  if (window.__autoSave) clearInterval(window.__autoSave)
  window.__autoSave = setInterval(() => {
    saveGame()
  }, 30000)
  console.log('ℹ️ 自动保存已开启')
}