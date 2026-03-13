<template>
  <div class="card">
    <h2 class="text-primary text-xl font-bold mb-4 text-center">洞府</h2>

    <div class="space-y-4">
      <div class="bg-dark/50 rounded-lg p-3">
        <div class="font-bold">聚灵阵 Lv.{{ gameState.cave.spiritArrayLv }}</div>
        <p class="text-xs text-light/70 my-1">打坐修为 +{{ (gameState.cave.spiritArrayLv - 1) * 10 }}%</p>
        <button class="btn-primary w-full mt-2" @click="upgradeSpiritArray">
          升级
        </button>
      </div>

      <div class="bg-dark/50 rounded-lg p-3">
        <div class="font-bold">灵田</div>
        <div
          v-for="(p, i) in gameState.cave.spiritField"
          :key="i"
          class="text-xs mt-1 flex justify-between"
        >
          <span>灵草</span>
          <span>{{ p.ready ? '可收获' : '生长中' }}</span>
        </div>
        <button class="btn-primary w-full mt-2" @click="plant">种植</button>
        <button class="btn-secondary w-full mt-2" @click="harvest">收获</button>
      </div>

      <div class="bg-dark/50 rounded-lg p-3">
        <div class="font-bold">炼丹炉 Lv.{{ gameState.cave.pillStoveLv }}</div>
        <button class="btn-primary w-full mt-2" @click="upgradePillStove">
          升级
        </button>
      </div>

      <div class="bg-dark/50 rounded-lg p-3">
        <div class="font-bold">炼器炉 Lv.{{ gameState.cave.refineStoveLv }}</div>
        <button class="btn-primary w-full mt-2" @click="upgradeRefineStove">
          升级
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { gameState, saveGame } from '@/game/state.js'

const upgradeSpiritArray = () => {
  gameState.cave.spiritArrayLv += 1
  saveGame()
}

const upgradePillStove = () => {
  gameState.cave.pillStoveLv += 1
  saveGame()
}

const upgradeRefineStove = () => {
  gameState.cave.refineStoveLv += 1
  saveGame()
}

const plant = () => {
  gameState.cave.spiritField.push({ ready: false, endTime: Date.now() + 300000 })
  saveGame()
}

const harvest = () => {
  gameState.cave.spiritField = gameState.cave.spiritField.filter(p => !p.ready)
  gameState.pills.expPill += 1
  saveGame()
}
</script>

<style scoped>
</style>