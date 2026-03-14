<template>
  <div class="space-y-6">
    <div v-if="tip.show" class="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-lg" :class="tip.type === 'success' ? 'bg-success text-white' : 'bg-danger text-white'">
      {{ tip.msg }}
    </div>
    <div class="card">
      <h2 class="text-primary text-xl font-bold mb-4 text-center">野外打怪</h2>
      
      <div class="bg-dark/50 rounded-lg p-3 mb-4">
        <div class="flex justify-between items-center">
          <div>
            <p class="text-light/70 text-sm">当前地图</p>
            <p class="text-primary font-semibold">{{ currentMap?.name || '未知地图' }}</p>
          </div>
          <button @click="$emit('update:activeTab', 'map')" class="btn-secondary text-sm">
            切换地图
          </button>
        </div>
        <p class="text-light/60 text-xs mt-1">{{ currentMap?.desc || '' }}</p>
      </div>
      <div v-if="currentMonster" class="mb-6">
        <div class="flex justify-between items-center mb-2">
          <h3 class="text-xl font-bold" :class="currentMonster.isElite ? 'text-red-500' : currentMonster.isRare ? 'text-purple-400' : 'text-light'">
            {{ currentMonster.name }}
            <span v-if="currentMonster.isElite" class="text-xs bg-red-500/20 text-red-500 px-2 py-0.5 rounded-full ml-2">精英</span>
            <span v-if="currentMonster.isRare" class="text-xs bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded-full ml-2">稀有</span>
          </h3>
        </div>
        <div class="mb-2">
          <div class="flex justify-between text-xs text-light/70 mb-1">
            <span>气血</span>
            <span>{{ formatNumber(currentMonster.currentHp) }} / {{ formatNumber(currentMonster.maxHp) }}</span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill bg-gradient-to-r from-red-600 to-red-400" :style="{ width: monsterHpPercent + '%' }"></div>
          </div>
        </div>
        <div class="grid grid-cols-3 gap-2 mb-4">
          <div class="bg-dark/30 rounded p-2 text-center">
            <p class="text-light/60 text-xs">攻击</p>
            <p class="text-red-400 font-semibold">{{ formatNumber(currentMonster.attack) }}</p>
          </div>
          <div class="bg-dark/30 rounded p-2 text-center">
            <p class="text-light/60 text-xs">防御</p>
            <p class="text-blue-400 font-semibold">{{ formatNumber(currentMonster.defense) }}</p>
          </div>
          <div class="bg-dark/30 rounded p-2 text-center">
            <p class="text-light/60 text-xs">掉落倍率</p>
            <p class="text-yellow-400 font-semibold">x{{ currentMap?.dropMultiplier || 1 }}</p>
          </div>
        </div>
      </div>
      <div v-else class="text-center py-8 text-light/60">
        <p>{{ isPlayerDead ? '你已死亡，请复活后再战' : '当前地图暂无怪物，请切换地图' }}</p>
      </div>
      <div class="flex gap-2 mb-4">
        <button
          v-for="speed in BATTLE_SPEED_CONFIG"
          :key="speed"
          class="btn-secondary flex-1"
          :class="gameState.battleSpeed === speed ? 'bg-primary/20 border-primary text-primary' : ''"
          @click="setBattleSpeed(speed)"
        >
          {{ speed }}x
        </button>
      </div>
      <div class="flex flex-col md:flex-row gap-4">
        <button
          @click="handleAttack"
          class="flex-1 btn-primary text-xl py-4"
          :disabled="isAttacking || !currentMonster || isPlayerDead"
        >
          {{ isAttacking ? '攻击中...' : '攻击怪物' }}
        </button>
        <button
          @click="handleToggleAutoBattle"
          class="btn-secondary text-xl py-4"
          :class="autoBattle ? 'bg-success/20 border-success text-success' : ''"
          :disabled="isPlayerDead || !currentMonster"
        >
          {{ autoBattle ? '关闭自动打怪' : '开启自动打怪' }}
        </button>
      </div>
      <div class="mt-4">
        <h4 class="text-light/80 font-semibold mb-2">战斗记录</h4>
        <div class="bg-dark/50 rounded-lg p-3 max-h-40 overflow-y-auto">
          <p
            v-for="(log, index) in combatLogs"
            :key="index"
            class="text-sm mb-1"
            :class="log.type === 'player' ? 'text-blue-400' : log.type === 'monster' ? 'text-red-400' : log.type === 'drop' ? 'text-yellow-400' : log.type === 'skill' ? 'text-purple-400' : 'text-light/60'"
          >
            {{ log.content }}
          </p>
        </div>
      </div>
    </div>
    <div v-if="selectedEquipment" class="card">
      <h2 class="text-primary text-xl font-bold mb-4 text-center">装备详情</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <div class="rounded-lg border-2 p-4 text-center mb-4" :class="selectedEquipment.qualityColor">
            <h3 class="text-xl font-bold">{{ selectedEquipment.name }}</h3>
            <p class="text-sm">{{ selectedEquipment.qualityName }} · {{ selectedEquipment.partName }}</p>
            <div class="flex justify-center gap-4 mt-2 text-sm">
              <span>Lv.{{ selectedEquipment.level }}</span>
              <span>+{{ selectedEquipment.strengthenLevel }} 强化</span>
              <span>{{ selectedEquipment.star }}★</span>
            </div>
            <p class="text-xs mt-2" :class="isCurrentEquipped ? 'text-primary' : 'text-light/70'">
              {{ isCurrentEquipped ? '【当前已穿戴】' : compareTipText }}
            </p>
          </div>
          <div class="bg-dark/50 rounded-lg p-3 mb-4">
            <h4 class="text-light/80 font-semibold mb-2">
              装备属性
              <span v-if="!isCurrentEquipped" class="text-xs text-light/60 ml-2">（与当前穿戴对比）</span>
            </h4>
            <div class="space-y-2">
              <div
                v-for="(value, key) in equipmentFinalAttr"
                :key="key"
                class="flex justify-between items-center"
              >
                <span class="text-light/70 text-sm">{{ attrNameMap[key] }}</span>
                <div class="flex items-center gap-2">
                  <span class="text-primary font-semibold">+{{ formatNumber(value) }}</span>
                  <span
                    v-if="!isCurrentEquipped"
                    class="text-xs font-bold"
                    :class="attrDifference[key] >= 0 ? 'text-green-400' : 'text-red-400'"
                  >
                    {{ attrDifference[key] >= 0 ? '+' : '' }}{{ formatNumber(attrDifference[key]) }}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div class="flex gap-2">
            <button
              v-if="!isCurrentEquipped"
              @click="handleWearEquipment"
              class="flex-1 btn-primary"
            >
              穿戴
            </button>
            <button
              v-else
              @click="handleUnwearEquipment"
              class="flex-1 btn-secondary"
            >
              卸下
            </button>
            <button @click="handleDecomposeEquipment" class="btn-danger">
              分解
            </button>
          </div>
        </div>
        <div class="space-y-4">
          <div class="bg-dark/50 rounded-lg p-3">
            <h4 class="text-light/80 font-semibold mb-2">强化（当前 +{{ selectedEquipment.strengthenLevel }} / {{ EQUIPMENT_CONFIG.strengthen.maxLevel }}）</h4>
            <p class="text-light/60 text-xs mb-2">每级强化增加10%基础属性，强化等级不随装备升级重置</p>
            <div class="flex justify-between items-center mb-2">
              <span class="text-sm text-light/70">消耗：</span>
              <span class="text-sm" :class="strengthenStone >= strengthenCost ? 'text-light' : 'text-danger'">
                强化石 x{{ strengthenCost }}（当前：{{ strengthenStone }}）
              </span>
            </div>
            <button
              @click="handleStrengthenEquipment"
              class="w-full btn-primary"
              :disabled="selectedEquipment.strengthenLevel >= EQUIPMENT_CONFIG.strengthen.maxLevel || strengthenStone < strengthenCost"
            >
              强化装备
            </button>
          </div>
          <div class="bg-dark/50 rounded-lg p-3">
            <h4 class="text-light/80 font-semibold mb-2">升级（当前 Lv.{{ selectedEquipment.level }}）</h4>
            <p class="text-light/60 text-xs mb-2">提升装备等级，增加基础属性上限</p>
            <div class="flex justify-between items-center mb-2">
              <span class="text-sm text-light/70">消耗：</span>
              <span class="text-sm" :class="upgradeStone >= upgradeCost ? 'text-light' : 'text-danger'">
                升级石 x{{ upgradeCost }}（当前：{{ upgradeStone }}）
              </span>
            </div>
            <button
              @click="handleUpgradeEquipment"
              class="w-full btn-primary"
              :disabled="upgradeStone < upgradeCost"
            >
              升级装备
            </button>
          </div>
          <div class="bg-dark/50 rounded-lg p-3">
            <h4 class="text-light/80 font-semibold mb-2">升星（当前 {{ selectedEquipment.star }}★ / {{ EQUIPMENT_CONFIG.starUp.maxStar }}★）</h4>
            <p class="text-light/60 text-xs mb-2">每星增加15%总属性，提升巨大</p>
            <div class="flex justify-between items-center mb-2">
              <span class="text-sm text-light/70">消耗：</span>
              <span class="text-sm" :class="starStone >= starCost ? 'text-light' : 'text-danger'">
                升星石 x{{ starCost }}（当前：{{ starStone }}）
              </span>
            </div>
            <button
              @click="handleStarUpEquipment"
              class="w-full btn-primary"
              :disabled="selectedEquipment.star >= EQUIPMENT_CONFIG.starUp.maxStar || starStone < starCost"
            >
              升星装备
            </button>
          </div>
        </div>
      </div>
    </div>
    <div class="card">
      <h2 class="text-primary text-xl font-bold mb-4 text-center">背包装备</h2>
      <div v-if="bagEquipments.length === 0" class="text-center py-8 text-light/60">
        <p>背包暂无装备，打怪可掉落装备</p>
      </div>
      <div v-else class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <div
          v-for="equipment in bagEquipments"
          :key="equipment.id"
          class="rounded-lg border-2 p-2 cursor-pointer hover:scale-105 transition-all"
          :class="selectedEquipment?.id === equipment.id ? 'border-primary bg-primary/10' : equipment.qualityColor"
          @click="selectEquipment(equipment)"
        >
          <p class="text-sm font-bold line-clamp-1">{{ equipment.name }}</p>
          <p class="text-[10px] opacity-80">{{ equipment.qualityName }}</p>
          <div class="flex justify-between text-[10px] mt-1">
            <span>Lv.{{ equipment.level }}</span>
            <span>+{{ equipment.strengthenLevel }}</span>
            <span>{{ equipment.star }}★</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, computed, onMounted, watch, onUnmounted } from 'vue'
import { wearEquipment, unwearEquipment, decomposeEquipment, strengthenEquipment, upgradeEquipment, starUpEquipment, calculateEquipmentAttr } from '@/game/equipment.js'
import { attackMonster, toggleAutoBattle, generateMonster, startContinuousAttack, stopContinuousAttack } from '@/game/combat.js'
import { gameState, currentMap, playerTotalAttribute, setBattleSpeed, autoCastActiveSkill } from '@/game/state.js'
import { EQUIPMENT_CONFIG, BATTLE_SPEED_CONFIG } from '@/game/config.js'
import { formatNumber } from '@/game/utils.js'

const attrNameMap = {
  attack: '攻击力', hp: '气血上限', defense: '防御力', power: '力量',
  constitution: '体质', agility: '身法', comprehension: '悟性', luck: '福缘',
}

const tip = ref({ show: false, msg: '', type: '' })
const isAttacking = ref(false)
const combatLogs = ref([])
const selectedEquipment = ref(null)
let autoBattleTimer = null

const equippedEquipments = computed(() => gameState?.equippedEquipments || {})
const bagEquipments = computed(() => gameState?.bagEquipments || [])
const currentMonster = computed(() => gameState?.currentMonster || null)
const autoBattle = computed(() => gameState?.autoBattle || false)
const isPlayerDead = computed(() => gameState?.isPlayerDead || false)
const strengthenStone = computed(() => Number(gameState?.items?.strengthenStone) || 0)
const upgradeStone = computed(() => Number(gameState?.items?.upgradeStone) || 0)
const starStone = computed(() => Number(gameState?.items?.starStone) || 0)

const monsterHpPercent = computed(() => {
  if (!currentMonster.value) return 0
  return Math.max(0, (currentMonster.value.currentHp / currentMonster.value.maxHp) * 100)
})

onMounted(() => {
  if (!currentMonster.value && !isPlayerDead.value) {
    const newMonster = generateMonster()
    if (newMonster) {
      gameState.currentMonster = newMonster
      addCombatLog('system', `遭遇了【${newMonster.name}】！`)
    }
  }
})

watch(() => gameState?.currentMapId, () => {
  if (isPlayerDead.value) return
  const newMonster = generateMonster()
  if (newMonster) {
    gameState.currentMonster = newMonster
    combatLogs.value = []
    addCombatLog('system', `进入【${currentMap.value?.name || '未知地图'}】，遭遇了【${newMonster.name}】！`)
  }
})

watch(isPlayerDead, (newVal) => {
  if (!newVal && !currentMonster.value) {
    const newMonster = generateMonster()
    if (newMonster) {
      gameState.currentMonster = newMonster
      addCombatLog('system', `复活成功，遭遇了【${newMonster.name}】！`)
    }
  }
})

watch(currentMonster, (newMonster, oldMonster) => {
  if (newMonster && oldMonster?.id !== newMonster.id) {
    addCombatLog('system', `遭遇了【${newMonster.name}】！`)
  }
}, { deep: true })

const isCurrentEquipped = computed(() => {
  if (!selectedEquipment.value) return false
  const equip = equippedEquipments.value[selectedEquipment.value.partId]
  return equip?.id === selectedEquipment.value.id
})

const currentEquippedCompare = computed(() => {
  if (!selectedEquipment.value) return null
  return equippedEquipments.value[selectedEquipment.value.partId] || null
})

const equippedCompareAttr = computed(() => {
  if (!currentEquippedCompare.value) return {}
  return calculateEquipmentAttr(currentEquippedCompare.value)
})

const equipmentFinalAttr = computed(() => {
  if (!selectedEquipment.value) return {}
  return calculateEquipmentAttr(selectedEquipment.value)
})

const attrDifference = computed(() => {
  const diff = {}
  const selectAttr = equipmentFinalAttr.value
  const equipAttr = equippedCompareAttr.value
  Object.keys(attrNameMap).forEach(key => {
    const selectValue = selectAttr[key] || 0
    const equipValue = equipAttr[key] || 0
    diff[key] = selectValue - equipValue
  })
  return diff
})

const compareTipText = computed(() => {
  if (!currentEquippedCompare.value) return '【该部位暂无穿戴装备】'
  const selectAttack = equipmentFinalAttr.value.attack || 0
  const equipAttack = equippedCompareAttr.value.attack || 0
  if (selectAttack > equipAttack) return '【攻击提升，推荐穿戴】'
  if (selectAttack < equipAttack) return '【攻击下降，谨慎穿戴】'
  return '【属性持平】'
})

const selectEquipment = (equipment) => {
  selectedEquipment.value = equipment ? JSON.parse(JSON.stringify(equipment)) : null
}

const showTip = (success, msg) => {
  tip.value = { show: true, msg, type: success ? 'success' : 'error' }
  setTimeout(() => tip.value.show = false, 3000)
}

const addCombatLog = (type, content) => {
  combatLogs.value.unshift({ type, content })
  if (combatLogs.value.length > 50) combatLogs.value.pop()
}

const handleAttack = async () => {
  if (isAttacking.value || !currentMonster.value || isPlayerDead.value) return
  isAttacking.value = true

  const targetMonster = currentMonster.value
  const monsterName = targetMonster.name

  while (
    currentMonster.value && 
    currentMonster.value.id === targetMonster.id && 
    !isPlayerDead.value && 
    !autoBattle.value
  ) {
    const skillResult = autoCastActiveSkill()
    if (skillResult?.success && skillResult?.skill) {
      addCombatLog('skill', `你释放了【${skillResult.skill.name}】！`)
    }

    const res = attackMonster()
    if (!res || res.type === 'none') break

    if (res.damage) {
      addCombatLog('player', `你对${monsterName}造成${formatNumber(res.damage)}点伤害${res.isCrit ? '（暴击！）' : ''}`)
    }

    if (res.playerHurt > 0) {
      addCombatLog('monster', `${monsterName}对你造成${formatNumber(res.playerHurt)}点伤害`)
    } else if (res.playerDodged) {
      addCombatLog('system', `你闪避了${monsterName}的攻击！`)
    }

    if (res.playerDead) {
      addCombatLog('monster', '你被怪物击杀了！')
      showTip(false, '你已死亡，请复活')
      break
    }

    if (res.monsterDead) {
      addCombatLog('system', `你击杀了【${monsterName}】，获得${formatNumber(res.drop?.gold || 0)}金币、${formatNumber(res.drop?.exp || 0)}修为！`)
      
      res.drop?.items?.forEach?.(item => {
        const itemName = item.type === 'strengthenStone' ? '强化石' : item.type === 'upgradeStone' ? '升级石' : '升星石'
        addCombatLog('drop', `获得${itemName} x${item.count}`)
      })

      if (res.drop?.equipment?.name) {
        addCombatLog('drop', `获得装备【${res.drop.equipment.name}】！`)
      }

      if (res.reachKillNeed) {
        showTip(true, '击杀数已达标，可突破境界')
      }
      break
    }

    const attackInterval = 200 / (gameState?.battleSpeed || 1)
    await new Promise(r => setTimeout(r, attackInterval))
  }

  isAttacking.value = false
}

const handleToggleAutoBattle = () => {
  const res = toggleAutoBattle()
  showTip(res.success, res.msg)
  if (!res.success) return
  if (res.success && gameState.autoBattle) {
    addCombatLog('system', '开启自动打怪模式')
  } else {
    addCombatLog('system', '关闭自动打怪模式')
  }
}

watch(autoBattle, (val) => {
  if (autoBattleTimer) {
    clearInterval(autoBattleTimer)
    autoBattleTimer = null
  }
  if (val) {
    autoBattleTimer = setInterval(() => {
      if (!isAttacking.value && !isPlayerDead.value && currentMonster.value) {
        handleAttack()
      }
    }, 300 / (gameState?.battleSpeed || 1))
  }
}, { immediate: true })

const handleWearEquipment = () => {
  if (!selectedEquipment.value) return
  const result = wearEquipment(selectedEquipment.value)
  if (result) {
    showTip(true, '装备穿戴成功')
    selectEquipment(equippedEquipments.value[selectedEquipment.value.partId])
  } else {
    showTip(false, '装备穿戴失败')
  }
}

const handleUnwearEquipment = () => {
  if (!selectedEquipment.value) return
  const result = unwearEquipment(selectedEquipment.value.partId)
  if (result) {
    showTip(true, '装备卸下成功')
    selectedEquipment.value = null
  } else {
    showTip(false, '装备卸下失败')
  }
}

const handleDecomposeEquipment = () => {
  if (!selectedEquipment.value) return
  const result = decomposeEquipment(selectedEquipment.value.id)
  if (result?.success) {
    let rewardMsg = '分解成功，获得'
    if (result.reward?.strengthenStone > 0) rewardMsg += `强化石x${result.reward.strengthenStone} `
    if (result.reward?.upgradeStone > 0) rewardMsg += `升级石x${result.reward.upgradeStone} `
    if (result.reward?.starStone > 0) rewardMsg += `升星石x${result.reward.starStone}`
    showTip(true, rewardMsg)
    selectedEquipment.value = null
  } else {
    showTip(false, result?.msg || '分解失败')
  }
}

const handleStrengthenEquipment = () => {
  if (!selectedEquipment.value) return
  const result = strengthenEquipment(selectedEquipment.value)
  if (result?.success) {
    showTip(true, `强化成功！强化等级+${result.newLevel}`)
    selectEquipment(result.updatedEquipment)
  } else {
    showTip(false, result?.msg || '强化失败')
  }
}

const handleUpgradeEquipment = () => {
  if (!selectedEquipment.value) return
  const result = upgradeEquipment(selectedEquipment.value)
  if (result?.success) {
    showTip(true, `升级成功！装备等级提升至${result.newLevel}级`)
    selectEquipment(result.updatedEquipment)
  } else {
    showTip(false, result?.msg || '升级失败')
  }
}

const handleStarUpEquipment = () => {
  if (!selectedEquipment.value) return
  const result = starUpEquipment(selectedEquipment.value)
  if (result?.success) {
    showTip(true, `升星成功！装备星级提升至${result.newStar}星`)
    selectEquipment(result.updatedEquipment)
  } else {
    showTip(false, result?.msg || '升星失败')
  }
}

onUnmounted(() => {
  if (autoBattleTimer) {
    clearInterval(autoBattleTimer)
    autoBattleTimer = null
  }
  stopContinuousAttack()
})
</script>