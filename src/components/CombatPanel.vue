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
        <p>暂无怪物，点击攻击按钮刷新怪物并开始战斗</p>
      </div>

      <div class="flex flex-col md:flex-row gap-4">
        <button
          @click="handleAttack"
          class="flex-1 btn-primary text-xl py-4"
          :disabled="isAttacking || autoBattle"
        >
          {{ isAttacking ? '攻击中...' : '攻击怪物' }}
        </button>

        <button
          @click="handleStopContinuousAttack"
          class="btn-secondary text-xl py-4 bg-orange-500/20 border-orange-500 text-orange-400"
          :disabled="!isContinuousAttacking"
        >
          停止攻击
        </button>
        <button
          @click="handleToggleAutoBattle"
          class="btn-secondary text-xl py-4"
          :class="autoBattle ? 'bg-success/20 border-success text-success' : ''"
          :disabled="isAttacking"
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
            :class="log.type === 'player' ? 'text-blue-400' : log.type === 'monster' ? 'text-red-400' : log.type === 'drop' ? 'text-yellow-400' : log.type === 'levelUp' ? 'text-green-400' : 'text-light/60'"
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
import { attackMonster, toggleAutoBattle, generateMonster, startContinuousAttack, stopContinuousAttack } from '@/game/combat.js'
import { gameState, currentMap, playerTotalAttribute } from '@/game/state.js'
import { formatNumber } from '@/game/utils.js'

const tip = ref({ show: false, msg: '', type: '' })
const isAttacking = ref(false)
const combatLogs = ref([])
let autoBattleTimer = null

const currentMonster = computed(() => gameState.currentMonster)
const autoBattle = computed(() => gameState.autoBattle)
const isContinuousAttacking = computed(() => gameState.isContinuousAttacking)
const reincarnationCount = computed(() => gameState.reincarnationCount)
const playerAttr = computed(() => playerTotalAttribute.value)
const monsterHpPercent = computed(() => {
  if (!currentMonster.value) return 0
  return Math.max(0, (currentMonster.value.currentHp / currentMonster.value.maxHp) * 100)
})

const showTip = (success, msg) => {
  tip.value = { show: true, msg, type: success ? 'success' : 'error' }
  setTimeout(() => tip.value.show = false, 3000)
}

const addCombatLog = (type, content) => {
  combatLogs.value.unshift({ type, content })
  if (combatLogs.value.length > 50) combatLogs.value.pop()
}

const handleAttack = async () => {
  if (isAttacking.value || autoBattle.value) return
  isAttacking.value = true

  try {
    if (!currentMonster.value) {
      const newMonster = generateMonster()
      if (!newMonster) {
        addCombatLog('system', '当前地图无怪物，请切换地图')
        showTip(false, '当前地图无怪物')
        isAttacking.value = false
        return
      }
      gameState.currentMonster = newMonster
      addCombatLog('system', `遭遇了【${newMonster.name}】！`)
    }

    const res = startContinuousAttack(200)
    if (res.success) {
      showTip(true, res.msg)
    } else {
      showTip(false, res.msg)
    }
  } catch (e) {
    console.error('攻击失败：', e)
    addCombatLog('system', '攻击异常，请重试')
    showTip(false, '攻击异常')
  } finally {
    isAttacking.value = false
  }
}

const handleStopContinuousAttack = () => {
  stopContinuousAttack()
  showTip(true, '已停止连续攻击')
  addCombatLog('system', '手动停止连续攻击')
}

const handleToggleAutoBattle = () => {
  const res = toggleAutoBattle()
  showTip(res.success, res.msg)
  if (res.success) {
    addCombatLog('system', res.msg)
  }
}

const startGlobalAutoBattle = () => {
  if (autoBattleTimer) clearInterval(autoBattleTimer)
  autoBattleTimer = setInterval(() => {
    if (!isAttacking.value && autoBattle.value) {
      handleAttack()
    }
  }, 500)
}

const stopGlobalAutoBattle = () => {
  if (autoBattleTimer) {
    clearInterval(autoBattleTimer)
    autoBattleTimer = null
  }
}

watch(autoBattle, (newVal) => {
  newVal ? startGlobalAutoBattle() : stopGlobalAutoBattle()
}, { immediate: true })

onUnmounted(() => {
  stopGlobalAutoBattle()
  stopContinuousAttack()
})
</script>