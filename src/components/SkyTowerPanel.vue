<template>
  <div class="card">
    <h2 class="text-primary text-xl font-bold mb-4 text-center">通天塔</h2>
    <div class="bg-primary/10 rounded-lg p-3 mb-4 text-center">
      <h3 class="font-bold">当前层数：{{ gameState.skyTowerCurrentLayer }} | 最高记录：{{ gameState.skyTowerMaxLayer }}</h3>
    </div>
    <div v-if="gameState.skyTowerMonster" class="bg-dark/50 rounded-lg p-3 mb-4">
      <h3 class="font-bold text-center mb-2">{{ gameState.skyTowerMonster.name }}</h3>
      <div class="flex justify-between text-sm mb-1">
        <span>气血</span>
        <span>{{ formatNumber(gameState.skyTowerMonster.currentHp) }}/{{ formatNumber(gameState.skyTowerMonster.maxHp) }}</span>
      </div>
      <div class="progress-bar h-2 mb-2">
        <div class="progress-fill bg-red-500" :style="{ width: (gameState.skyTowerMonster.currentHp / gameState.skyTowerMonster.maxHp)*100 + '%' }"></div>
      </div>
      <p class="text-xs text-light/70 mb-2">debuff：{{ gameState.skyTowerDebuff.name }} - {{ gameState.skyTowerDebuff.desc }}</p>
      <button class="btn-primary w-full" @click="attackSkyTower">攻击</button>
    </div>
    <div v-else class="space-y-3">
      <button class="btn-primary w-full py-3" @click="startChallenge">开始挑战第{{ gameState.skyTowerCurrentLayer }}层</button>
      <div class="bg-dark/50 rounded-lg p-3">
        <h3 class="font-bold mb-2">奖励预览</h3>
        <p class="text-sm text-light/70">每层：金币、强化石、竞技场币</p>
        <p class="text-sm text-light/70">每10层BOSS：稀有灵兽蛋、自由属性点</p>
      </div>
    </div>
  </div>
</template>
<script setup>
import { gameState } from '@/game/state.js'
import { generateSkyTowerMonster, attackSkyTowerMonster } from '@/game/combat.js'

const startChallenge = () => {
  gameState.skyTowerMonster = generateSkyTowerMonster(gameState.skyTowerCurrentLayer)
}
const attackSkyTower = () => {
  attackSkyTowerMonster()
}
</script>