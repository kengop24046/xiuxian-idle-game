import { gameState } from './gameState.js'
import { playerMaxHp, currentRealmExpNeed, currentPet } from './computed/index.js'
import { saveGame } from './services/saveService.js'

let ageTimer, hpRegenTimer, meditateTimer, onlineTimer, buffTimer, caveTimer, petHealTimer

export const startAgeTimer = () => {
  if (ageTimer) return
  ageTimer = setInterval(() => {
    gameState.age++
    saveGame()
  }, 80000)
}

export const startHpRegenTimer = () => {
  if (hpRegenTimer) return
  hpRegenTimer = setInterval(() => {
    if (gameState.isPlayerDead) return
    const maxHp = playerMaxHp.value
    const regenRate = gameState.autoMeditate ? 0.02 : 0.01
    const regenHp = Math.floor(maxHp * regenRate)
    gameState.currentHp = Math.min(gameState.currentHp + regenHp, maxHp)
  }, 2000)
}

export const startMeditateTimer = () => {
  if (meditateTimer) return
  meditateTimer = setInterval(() => {
    if (gameState.isPlayerDead) {
      stopMeditateTimer()
      gameState.autoMeditate = false
      return
    }
    const expFull = gameState.currentExp >= currentRealmExpNeed.value
    const hpFull = gameState.currentHp === playerMaxHp.value
    if (expFull && hpFull) {
      stopMeditateTimer()
      gameState.autoMeditate = false
      saveGame()
      return
    }
    if (expFull) {
      stopMeditateTimer()
      gameState.autoMeditate = false
      saveGame()
      return
    }
    const baseExp = 10
    const spiritArrayBonus = 1 + (gameState.cave.spiritArrayLv - 1) * 0.1
    const expGain = Math.floor(baseExp * spiritArrayBonus)
    gameState.currentExp = Math.min(gameState.currentExp + expGain, currentRealmExpNeed.value)
    saveGame()
  }, 1500)
}

export const stopMeditateTimer = () => {
  if (meditateTimer) {
    clearInterval(meditateTimer)
    meditateTimer = null
  }
}

export const startOnlineTimer = () => {
  if (onlineTimer) return
  onlineTimer = setInterval(() => {
    const now = Date.now()
    const diff = now - gameState.onlineData.lastOnlineTime
    if (diff >= 1000) {
      const addMinute = Math.floor(diff / 60000)
      if (addMinute > 0) {
        gameState.onlineData.totalOnlineTime += addMinute
        gameState.onlineData.todayOnlineTime += addMinute
      }
      gameState.onlineData.lastOnlineTime = now
      saveGame()
    }
  }, 1000)
}

export const startBuffTimer = () => {
  if (buffTimer) return
  buffTimer = setInterval(() => {
    const now = Date.now()
    Object.keys(gameState.buffData).forEach(key => {
      if (gameState.buffData[key]?.endTime > 0 && now >= gameState.buffData[key].endTime) {
        gameState.buffData[key].endTime = 0
      }
    })
  }, 1000)
}

export const startCaveTimer = () => {
  if (caveTimer) return
  caveTimer = setInterval(() => {
    gameState.cave.spiritField.forEach(plant => {
      if (plant.endTime && Date.now() >= plant.endTime && !plant.ready) {
        plant.ready = true
      }
    })
    saveGame()
  }, 1000)
}

export const startPetHealTimer = () => {
  if(petHealTimer) return
  petHealTimer = setInterval(()=>{
    const pet = currentPet.value
    if(!pet || pet.config.skill.effect !== 'heal') return
    const heal = Math.floor(playerMaxHp.value * 0.02)
    gameState.currentHp = Math.min(gameState.currentHp + heal, playerMaxHp.value)
    saveGame()
  }, 5000)
}

export const stopAllTimers = () => {
  stopMeditateTimer()
  if (ageTimer) clearInterval(ageTimer)
  if (hpRegenTimer) clearInterval(hpRegenTimer)
  if (onlineTimer) clearInterval(onlineTimer)
  if (buffTimer) clearInterval(buffTimer)
  if (caveTimer) clearInterval(caveTimer)
  if (petHealTimer) clearInterval(petHealTimer)
  ageTimer = hpRegenTimer = onlineTimer = buffTimer = caveTimer = petHealTimer = null
}

window.addEventListener('beforeunload', () => {
  gameState.lastOfflineTime = Date.now()
  saveGame()
})