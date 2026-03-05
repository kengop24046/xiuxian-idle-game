<template>
  <div class="space-y-6">
    <div v-if="tip.show" class="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-lg" :class="tip.type === 'success' ? 'bg-success text-white' : 'bg-danger text-white'">
      {{ tip.msg }}
    </div>

    <div class="card">
      <h2 class="text-primary text-xl font-bold mb-4 text-center">仙境试炼</h2>
      <div class="bg-dark/50 rounded-lg p-4 mb-6">
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <p class="text-light/70 text-sm">已通关最高层数</p>
            <p class="text-primary text-2xl font-bold">{{ highestClearedLayer }} 层</p>
          </div>
          <div>
            <p class="text-light/70 text-sm">当前可挑战层数</p>
            <p class="text-blue-400 text-2xl font-bold">{{ trialMaxLayer }} 层</p>
          </div>
          <div>
            <p class="text-light/70 text-sm">试炼总层数</p>
            <p class="text-light text-2xl font-bold">100 层</p>
          </div>
        </div>
        <p class="text-light/60 text-sm mt-3">
          仙境试炼共100层，每10层有一个镇守BOSS，通关可获得大量强化材料与稀有装备，层数越高奖励越丰厚
        </p>
      </div>

      <div v-if="trialMonster" class="mb-6">
        <div class="flex justify-between items-center mb-2">
          <h3 class="text-xl font-bold" :class="trialMonster.isBoss ? 'text-red-500' : 'text-light'">
            {{ trialMonster.name }}
            <span v-if="trialMonster.isBoss" class="text-xs bg-red-500/20 text-red-500 px-2 py-0.5 rounded-full ml-2">BOSS</span>
          </h3>
          <button @click="handleExitTrial" class="btn-secondary text-sm">
            退出试炼
          </button>
        </div>
        <div class="mb-2">
          <div class="flex justify-between text-xs text-light/70 mb-1">
            <span>气血</span>
            <span>{{ formatNumber(trialMonster.currentHp) }} / {{ formatNumber(trialMonster.maxHp) }}</span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill bg-gradient-to-r from-red-600 to-red-400" :style="{ width: monsterHpPercent + '%' }"></div>
          </div>
        </div>
        <div class="grid grid-cols-3 gap-2 mb-4">
          <div class="bg-dark/30 rounded p-2 text-center">
            <p class="text-light/60 text-xs">攻击</p>
            <p class="text-red-400 font-semibold">{{ formatNumber(trialMonster.attack) }}</p>
          </div>
          <div class="bg-dark/30 rounded p-2 text-center">
            <p class="text-light/60 text-xs">防御</p>
            <p class="text-blue-400 font-semibold">{{ formatNumber(trialMonster.defense) }}</p>
          </div>
          <div class="bg-dark/30 rounded p-2 text-center">
            <p class="text-light/60 text-xs">层数</p>
            <p class="text-primary font-semibold">第{{ trialMonster.layer }}层</p>
          </div>
        </div>
        <button
          @click="handleAttackTrial"
          class="w-full btn-primary text-xl py-4"
          :disabled="isAttacking"
        >
          {{ isAttacking ? '攻击中...' : '攻击' }}
        </button>
        <div class="mt-4">
          <h4 class="text-light/80 font-semibold mb-2">战斗记录</h4>
          <div class="bg-dark/50 rounded-lg p-3 max-h-40 overflow-y-auto">
            <p
              v-for="(log, index) in combatLogs"
              :key="index"
              class="text-sm mb-1"
              :class="log.type === 'player' ? 'text-blue-400' : log.type === 'monster' ? 'text-red-400' : log.type === 'reward' ? 'text-yellow-400' : 'text-light/60'"
            >
              {{ log.content }}
            </p>
          </div>
        </div>
      </div>

      <div v-else class="mb-6">
        <h3 class="text-light/80 font-semibold mb-3">选择挑战层数</h3>
        <div class="grid grid-cols-5 sm:grid-cols-10 gap-2 max-h-80 overflow-y-auto">
          <button
            v-for="layer in 100"
            :key="layer"
            @click="handleEnterTrial(layer)"
            class="aspect-square rounded-lg border transition-all"
            :class="
              layer > trialMaxLayer
                ? 'border-light/10 bg-dark/30 text-light/30 cursor-not-allowed'
                : layer <= highestClearedLayer
                ? 'border-primary/50 bg-primary/10 text-primary hover:bg-primary/20'
                : 'border-primary/30 bg-dark/50 text-light hover:border-primary hover:bg-primary/10'
            "
            :disabled="layer > trialMaxLayer"
          >
            <p class="text-sm font-bold">{{ layer }}</p>
            <p v-if="TRIAL_CONFIG.bossLayers.includes(layer)" class="text-[8px] text-red-400">BOSS</p>
          </button>
        </div>
      </div>
    </div>

    <div class="card">
      <h3 class="text-primary text-lg font-semibold mb-3">BOSS层奖励预览</h3>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-primary/30">
              <th class="text-left py-2 px-3">层数</th>
              <th class="text-left py-2 px-3">金币</th>
              <th class="text-left py-2 px-3">强化石</th>
              <th class="text-left py-2 px-3">升级石</th>
              <th class="text-left py-2 px-3">升星石</th>
              <th class="text-left py-2 px-3">装备品质</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="bossLayer in TRIAL_CONFIG.bossLayers" :key="bossLayer" class="border-b border-light/10">
              <td class="py-2 px-3 text-red-400 font-semibold">第{{ bossLayer }}层（BOSS）</td>
              <td class="py-2 px-3">{{ formatNumber(getTrialLayerRewardPreview(bossLayer).gold) }}</td>
              <td class="py-2 px-3">{{ getTrialLayerRewardPreview(bossLayer).strengthenStone }}</td>
              <td class="py-2 px-3">{{ getTrialLayerRewardPreview(bossLayer).upgradeStone }}</td>
              <td class="py-2 px-3">{{ getTrialLayerRewardPreview(bossLayer).starStone }}</td>
              <td class="py-2 px-3">
                {{ EQUIPMENT_CONFIG.quality[getTrialLayerRewardPreview(bossLayer).equipQualityMin].name }} ~
                {{ EQUIPMENT_CONFIG.quality[getTrialLayerRewardPreview(bossLayer).equipQualityMax].name }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { enterTrialLayer, exitTrial, getTrialLayerRewardPreview, getTrialHighestClearedLayer, getTrialMaxLayer } from '@/game/trial.js'
import { attackTrialMonster } from '@/game/combat.js'
import { gameState } from '@/game/state.js'
import { TRIAL_CONFIG, EQUIPMENT_CONFIG } from '@/game/config.js'
import { formatNumber } from '@/game/utils.js'

const tip = ref({ show: false, msg: '', type: '' })
const isAttacking = ref(false)
const combatLogs = ref([])

const trialMonster = computed(() => gameState.trialMonster)
const trialMaxLayer = computed(() => gameState.trialMaxLayer)
const highestClearedLayer = computed(() => getTrialHighestClearedLayer())
const monsterHpPercent = computed(() => trialMonster.value ? Math.max(0, (trialMonster.value.currentHp / trialMonster.value.maxHp) * 100) : 0)

const showTip = (success, msg) => {
  tip.value = { show: true, msg, type: success ? 'success' : 'error' }
  setTimeout(() => tip.value.show = false, 3000)
}

const addCombatLog = (type, content) => {
  combatLogs.value.unshift({ type, content })
  if (combatLogs.value.length > 50) combatLogs.value.pop()
}

const handleEnterTrial = (layer) => {
  const result = enterTrialLayer(layer)
  if (result.success) {
    addCombatLog('system', `进入试炼第${layer}层，遭遇了${result.monster.name}！`)
  } else {
    showTip(false, result.msg)
  }
}

const handleExitTrial = () => {
  const result = exitTrial()
  if (result.success) {
    showTip(true, result.msg)
    combatLogs.value = []
  }
}

const handleAttackTrial = async () => {
  if (isAttacking.value || !trialMonster.value) return
  isAttacking.value = true

  const result = attackTrialMonster()
  if (result.type === 'attack') {
    if (result.isCrit) {
      addCombatLog('player', `你触发暴击，对${trialMonster.value.name}造成${formatNumber(result.damage)}点伤害！`)
    } else {
      addCombatLog('player', `你对${trialMonster.value.name}造成${formatNumber(result.damage)}点伤害`)
    }

    if (result.monsterDead) {
      addCombatLog('system', `你击杀了${trialMonster.value.name}，成功通关第${trialMonster.value.layer}层！`)
      if (result.reward) {
        addCombatLog('reward', `获得${formatNumber(result.reward.gold)}金币`)
        result.reward.items.forEach(item => addCombatLog('reward', `获得${item.count}个${item.type === 'strengthenStone' ? '强化石' : item.type === 'upgradeStone' ? '升级石' : '升星石'}`))
        if (result.reward.equipment) addCombatLog('reward', `获得装备：${result.reward.equipment.qualityName}·${result.reward.equipment.name}`)
      }
    } else {
      if (result.playerHurt > 0) {
        addCombatLog('monster', `${trialMonster.value.name}对你造成${formatNumber(result.playerHurt)}点伤害`)
      } else {
        addCombatLog('player', `你闪避了${trialMonster.value.name}的攻击！`)
      }
    }
  }

  isAttacking.value = false
}
</script>