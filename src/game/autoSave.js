import { saveGame, gameState } from './state.js'

let autoSaveTimer = null

export const initAutoSave = () => {
  autoSaveTimer = setInterval(() => {
    saveGame()
  }, 30 * 1000)

  window.addEventListener('beforeunload', () => {
    saveGame()
  })

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      saveGame()
    }
  })
}

export const stopAutoSave = () => {
  if (autoSaveTimer) {
    clearInterval(autoSaveTimer)
    autoSaveTimer = null
  }
}