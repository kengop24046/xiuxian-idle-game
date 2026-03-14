import { computed } from 'vue'
import { gameState } from '../gameState.js'
import { ASCEND_CONFIG, IMMORTAL_REALM_CONFIG, REALM_CONFIG } from '../../config.js'

export const currentImmortalRealm = computed(() => IMMORTAL_REALM_CONFIG.find(r=>r.id===gameState.immortalRealmId) || IMMORTAL_REALM_CONFIG[0])
export const immortalRealmExpNeed = computed(() => gameState.isAscended ? currentImmortalRealm.value.baseExp * Math.pow(1.8, gameState.immortalLevel-1) : 0)
export const canAscend = computed(() => gameState.currentRealmId >= ASCEND_CONFIG.unlockRealmId && !gameState.isAscended)
export const ascendNeedRealmName = computed(() => {
  const unlockRealm = REALM_CONFIG.find(r => r.id === ASCEND_CONFIG.unlockRealmId)
  return unlockRealm?.name || '指定境界'
})