export { gameState } from './core/gameState.js'

export {
  backpackUsedCount,
  isBackpackFull,
  backpackEmptySlots,
  backpackItemsByType,
  equipSetCount,
  setBonusAttr,
  illustrationBonus,
  pillBuffBonus,
  reincarnationBonus,
  levelAttrBonus,
  realmLevelAttrBonus,
  bigRealmBonus,
  currentPet,
  petAttrBonus,
  currentImmortalRealm,
  immortalRealmExpNeed,
  canAscend,
  currentMap,
  allMapConfig,
  allMonsterConfig,
  playerTotalAttribute,
  baseAttrBonus,
  equipAttrBonus,
  playerMaxHp,
  levelExpProgress,
  currentRealm,
  currentRealmExpNeed,
  currentRealmKillNeed,
  hpProgress,
  expProgress,
  killProgress
} from './core/computed/index.js'

export {
  playerRevive,
  checkLevelUp,
  addLevelExp,
  toggleAutoMeditate,
  checkRealmBreakable,
  setBattleSpeed,
  castActiveSkill,
  autoCastActiveSkill,
  usePill,
  oneKeyUseExpPills,
  addItem,
  removeItem,
  expandBackpack,
  claimOfflineReward,
  wearEquip,
  unwearEquip,
  oneKeyDecomposeEquip,
  oneKeySellItems,
  hatchPetEgg,
  levelUpPet,
  setCurrentPet,
  ascendToImmortal,
  saveGame,
  loadGame,
  resetGame,
  startAutoSave
} from './core/services/index.js'

import { loadGame, startAutoSave } from './core/services/index.js'
import { initAllWatchers } from './core/watchers.js'


loadGame()
initAllWatchers()
startAutoSave()