<template>
  <div class="card">
    <h2 class="text-primary text-xl font-bold mb-4 text-center">灵根灵脉</h2>

    <div class="bg-primary/10 rounded-lg p-3 mb-4 text-center">
      <div class="font-bold text-lg">{{ rootName }}</div>
      <p class="text-xs text-light/70 mt-1">修为速度 ×{{ rootRate.toFixed(1) }}</p>
      <button class="btn-primary mt-2" @click="washRoot">洗髓（重置）</button>
    </div>

    <div class="font-bold mb-2">灵脉（{{ gameState.meridian.lit }}/{{ totalNodes }}）</div>
    <div class="grid grid-cols-5 gap-2">
      <div
        v-for="n in totalNodes"
        :key="n"
        class="h-8 rounded-lg flex items-center justify-center text-xs"
        :class="n <= gameState.meridian.lit ? 'bg-primary' : 'bg-dark/50'"
      >
        {{ n }}
      </div>
    </div>
    <button class="btn-primary w-full mt-4" @click="lightNode">点亮节点</button>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { gameState, saveGame } from '@/game/state.js'
import { ROOT_CONFIG, MERIDIAN_CONFIG } from '@/game/config.js'

const rootName = computed(() => {
  return ROOT_CONFIG[gameState.root.grade]?.grade || '凡根'
})

const rootRate = computed(() => {
  return ROOT_CONFIG[gameState.root.grade]?.rate || 1
})

const totalNodes = MERIDIAN_CONFIG.nodes

const washRoot = () => {
  gameState.root.grade = Math.floor(Math.random() * 4)
  saveGame()
}

const lightNode = () => {
  if (gameState.meridian.lit >= totalNodes) return
  gameState.meridian.lit += 1
  saveGame()
}
</script>

<style scoped>
</style>