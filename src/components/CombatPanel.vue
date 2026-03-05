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
            <p class="text-primary font-semibold">{{ currentMap.name }}</p>
          </div>
          <button @click="$emit('update:activeTab', 'map')" class="btn-secondary text-sm">
            切换地图
          </button>
        </div>
        <p class="text-light/60 text-xs mt-1">{{ currentMap.desc }}</p>
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
            <p class="text-yellow-400 font-semibold">x{{ currentMap.dropMultiplier }}</p>
          </div>
        </div>
        <div v-if="currentMonster.traitDesc" class="bg-dark/30 rounded-lg p-2 mb-4">
          <p class="text-light/70 text-xs">怪物特性：<span class="text-primary">{{ currentMonster.traitDesc }}</span></p>
        </div>
      </div>

      <div v-else class="text-center py-8 text-light/60">
        <p>暂无怪物，点击攻击按钮开始打怪</p>
      </div>

      <div class="flex flex-col md:flex-row gap-4">
        <button
          @click="handleAttack"
          class="flex-1 btn-primary text-xl py-4"
          :disabled="isAttacking"
        >
          {{ isAttacking ? '攻击中...' : '攻击怪物' }}
        </button>
        <button
          @click="toggleAutoBattle"
          class="btn-secondary text-xl py-4"
          :class="autoBattle ? 'bg-success/20 border-success text-success' : ''"
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
            :class="log.type === 'player' ? 'text-blue-400' : log.type === 'monster' ? 'text-red-400' : log.type === 'drop' ? 'text-yellow-400' : 'text-light/60'"
          >
            {{ log.content }}
          </p>
        </div>
      </div>
    </div>

    <div class="card">
      <h3 class="text-primary text-lg font-semibold mb-3">我的属性</h3>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div class="bg-dark/50 rounded-lg p-3">
          <p class="text-light/70 text-xs">攻击力</p>
          <p class="text-red-400 font-semibold">{{ formatNumber(playerAttr.attack) }}</p>
        </div>
        <div class="bg-dark/50 rounded-lg p-3">
          <p class="text-light/70 text-xs">防御力</p>
          <p class="text-blue-400 font-semibold">{{ formatNumber(playerAttr.defense) }}</p>
        </div>
        <div class="bg-dark/50 rounded-lg p-3">
          <p class="text-light/70 text-xs">暴击率</p>
          <p class="text-orange-400 font-semibold">{{ playerAttr.critRate.toFixed(2) }}%</p>
        </div>
        <div class="bg-dark/50 rounded-lg p-3">
          <p class="text-light/70 text-xs">闪避率</p>
          <p class="text-green-400 font-semibold">{{ playerAttr.dodgeRate.toFixed(2) }}%</p>
        </div>
        <div class="bg-dark/50 rounded-lg p-3">
          <p class="text-light/70 text-xs">暴击伤害</p>
          <p class="text-red-500 font-semibold">{{ (playerAttr.critDamage * 100).toFixed(0) }}%</p>
        </div>
        <div class="bg-dark/50 rounded-lg p-3">
          <p class="text-light/70 text-xs">修为加成</p>
          <p class="text-primary font-semibold">+{{ ((playerAttr.expRate - 1) * 100).toFixed(2) }}%</p>
        </div>
        <div class="bg-dark/50 rounded-lg p-3">
          <p class="text-light/70 text-xs">掉落加成</p>
          <p class="text-yellow-400 font-semibold">+{{ (playerAttr.dropRate * 100).toFixed(2) }}%</p>
        </div>
        <div class="bg-dark/50 rounded-lg p-3">
          <p class="text-light/70 text-xs">转生次数</p>
          <p class="text-purple-400 font-semibold">{{ reincarnationCount }} 转</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onUnmounted, watch } from 'vue'
import { attackMonster, toggleAutoBattle, generateMonster } from '@/game/combat.js'
import { gameState, currentMap, playerTotalAttribute } from '@/game/state.js'
import { formatNumber } from '@/game/utils.js'

const tip = ref({ show: false, msg: '', type: '' })
const isAttacking = ref(false)
const combatLogs = ref([])
const autoBattleTimer = ref(null)

const currentMonster = computed(() => gameState.currentMonster)
const autoBattle = computed(() => gameState.autoBattle)
const reincarnationCount = computed(() => gameState.reincarnationCount)
const playerAttr = computed(() => playerTotalAttribute.value)
const monsterHpPercent = computed(() => currentMonster.value ? Math.max(0, (currentMonster.value.currentHp / currentMonster.value.maxHp) * 100) : 0)

const showTip = (success, msg) => {
  tip.value = { show: true, msg, type: success ? 'success' : 'error' }
  setTimeout(() => tip.value.show = false, 3000)
}

const addCombatLog = (type, content) => {
  combatLogs.value.unshift({ type, content })
  if (combatLogs.value.length > 50) combatLogs.value.pop()
}

const handleAttack = async () => {
  if (isAttacking.value) return
  isAttacking.value = true

  if (!currentMonster.value) {
    const newMonster = generateMonster()
    if (!newMonster) {
      addCombatLog('system', '当前地图暂无怪物，请切换地图')
      isAttacking.value = false
      return
    }
    gameState.currentMonster = newMonster
    const monsterName = newMonster.name
    addCombatLog('system', `遭遇了${monsterName}！`)
  } else {
    const monsterName = currentMonster.value.name
    addCombatLog('system', `继续攻击${monsterName}！`)
  }

  while (currentMonster.value && currentMonster.value.currentHp > 0) {
    const result = attackMonster()
    if (result.type === 'attack') {
      const currentMonsterName = currentMonster.value?.name
      if (!currentMonsterName) break

      if (result.isCrit) {
        addCombatLog('player', `你触发暴击，对${currentMonsterName}造成${formatNumber(result.damage)}点伤害！`)
      } else {
        addCombatLog('player', `你对${currentMonsterName}造成${formatNumber(result.damage)}点伤害`)
      }

      if (result.monsterDead) {
        addCombatLog('system', `你击杀了${currentMonsterName}！`)
        if (result.drop) {
          addCombatLog('drop', `获得${formatNumber(result.drop.gold)}金币，${formatNumber(result.drop.exp)}修为`)
          result.drop.items.forEach(item => addCombatLog('drop', `获得${item.count}个${item.type === 'strengthenStone' ? '强化石' : item.type === 'upgradeStone' ? '升级石' : '升星石'}`))
          if (result.drop.equipment) addCombatLog('drop', `获得装备：${result.drop.equipment.qualityName}·${result.drop.equipment.name}`)
        }
        break
      }

      if (result.playerHurt > 0) {
        addCombatLog('monster', `${currentMonsterName}对你造成${formatNumber(result.playerHurt)}点伤害`)
      } else {
        addCombatLog('player', `你闪避了${currentMonsterName}的攻击！`)
      }
    }
    await new Promise(resolve => setTimeout(resolve, 200))
  }
  isAttacking.value = false
}

const startAutoBattle = () => {
  if (autoBattleTimer.value) return
  autoBattleTimer.value = setInterval(() => {
    if (!isAttacking.value) {
      handleAttack()
    }
  }, 500)
}

const stopAutoBattle = () => {
  if (autoBattleTimer.value) {
    clearInterval(autoBattleTimer.value)
    autoBattleTimer.value = null
  }
}

watch(autoBattle, (newVal) => {
  newVal ? startAutoBattle() : stopAutoBattle()
})

onUnmounted(() => stopAutoBattle())
</script>