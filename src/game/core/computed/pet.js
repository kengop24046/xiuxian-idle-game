import { computed } from 'vue'
import { gameState } from '../gameState.js'
import { PET_CONFIG } from '../../config.js'

export const currentPet = computed(() => {
  if(!gameState.currentPetId) return null
  const pet = gameState.pets.find(p=>p.id===gameState.currentPetId)
  if(!pet) return null
  const config = PET_CONFIG[pet.configId]
  return { 
    ...pet, 
    config, 
    atk: config.baseAtk * pet.quality * pet.level, 
    hp: config.baseHp * pet.quality * pet.level, 
    def: config.baseDef * pet.quality * pet.level 
  }
})

export const petAttrBonus = computed(() => {
  const pet = currentPet.value
  if(!pet) return { attackMulti:1, hpMulti:1, defenseMulti:1 }
  return { 
    attackMulti: 1 + pet.atk * 0.0001, 
    hpMulti: 1 + pet.hp * 0.00005, 
    defenseMulti: 1 + pet.def * 0.0001 
  }
})