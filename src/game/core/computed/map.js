import { computed } from 'vue'
import { gameState } from '../gameState.js'
import { MAP_CONFIG, MONSTER_CONFIG, IMMORTAL_MAP_CONFIG, IMMORTAL_MONSTER_CONFIG } from '../../config.js'

export const currentMap = computed(() => MAP_CONFIG.find(map => map.id === gameState.currentMapId) || MAP_CONFIG[0])
export const allMapConfig = computed(() => gameState.isAscended ? [...MAP_CONFIG, ...IMMORTAL_MAP_CONFIG] : MAP_CONFIG)
export const allMonsterConfig = computed(() => gameState.isAscended ? [...MONSTER_CONFIG, ...IMMORTAL_MONSTER_CONFIG] : MONSTER_CONFIG)