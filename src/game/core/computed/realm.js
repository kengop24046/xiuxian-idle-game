import { computed } from 'vue'
import { gameState } from '../gameState.js'
import { REALM_CONFIG } from '../../config.js'

export const currentRealm = computed(() => REALM_CONFIG.find(realm => realm.id === gameState.currentRealmId) || REALM_CONFIG[0])
export const currentRealmExpNeed = computed(() => currentRealm.value.baseExp * Math.pow(1.5, gameState.currentLevel - 1))
export const currentRealmKillNeed = computed(() => Math.min(Math.floor(currentRealm.value.baseKillNeed * Math.pow(1.8, gameState.currentLevel - 1)), 100000))
export const levelExpProgress = computed(() => Math.min((gameState.levelExp / gameState.levelMaxExp) * 100, 100))
export const expProgress = computed(() => Math.min((gameState.currentExp / currentRealmExpNeed.value) * 100, 100))
export const killProgress = computed(() => Math.min((gameState.realmKillCount / currentRealmKillNeed.value) * 100, 100))