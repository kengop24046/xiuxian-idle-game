<template>
  <div class="card">
    <h2 class="text-primary text-xl font-bold mb-4 text-center">飞升仙界</h2>
    <div v-if="!gameState.isAscended" class="space-y-4">
      <div class="bg-primary/10 rounded-lg p-3 text-center">
        <h3 class="font-bold text-lg">渡劫期圆满，可飞升仙界</h3>
        <p class="text-sm text-light/70 mt-1">飞升后开启全新仙界境界、地图、玩法，保留所有养成</p>
      </div>
      <div class="bg-dark/50 rounded-lg p-3">
        <h3 class="font-bold mb-2">飞升条件</h3>
        <div class="space-y-2 text-sm">
          <div class="flex justify-between">
            <span>境界达到渡劫期</span>
            <span :class="gameState.currentRealmId >=9 ? 'text-green-400' : 'text-red-400'">{{ gameState.currentRealmId >=9 ? '已达成' : '未达成' }}</span>
          </div>
          <div class="flex justify-between">
            <span>累计击杀10000只怪物</span>
            <span :class="gameState.totalKillCount >=10000 ? 'text-green-400' : 'text-red-400'">{{ gameState.totalKillCount }}/10000</span>
          </div>
          <div class="flex justify-between">
            <span>拥有100万金币</span>
            <span :class="gameState.gold >=1000000 ? 'text-green-400' : 'text-red-400'">{{ formatNumber(gameState.gold) }}/100万</span>
          </div>
        </div>
      </div>
      <button class="btn-primary w-full py-3" :disabled="!canAscend" @click="handleAscend">
        渡劫飞升
      </button>
    </div>
    <div v-else class="space-y-4">
      <div class="bg-primary/10 rounded-lg p-3 text-center">
        <h3 class="font-bold text-lg">已飞升仙界</h3>
        <p class="text-sm text-light/70 mt-1">当前仙界境界：{{ currentImmortalRealm.name }} · Lv.{{ gameState.immortalLevel }}</p>
      </div>
      <div class="bg-dark/50 rounded-lg p-3">
        <h3 class="font-bold mb-2">仙界修为</h3>
        <div class="progress-bar h-2 mb-1">
          <div class="progress-fill bg-primary" :style="{ width: immortalExpProgress + '%' }"></div>
        </div>
        <div class="flex justify-between text-xs text-light/70">
          <span>{{ formatNumber(gameState.immortalExp) }}</span>
          <span>{{ formatNumber(immortalRealmExpNeed) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { computed } from 'vue'
import { gameState, canAscend, ascendToImmortal, currentImmortalRealm, immortalRealmExpNeed } from '@/game/state.js'
import { formatNumber } from '@/game/utils.js'

const immortalExpProgress = computed(() => Math.min((gameState.immortalExp / immortalRealmExpNeed.value)*100, 100))
const handleAscend = () => {
  const res = ascendToImmortal()
  if(res.success) alert(res.msg)
  else alert(res.msg)
}
</script>