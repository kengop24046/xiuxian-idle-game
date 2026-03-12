<template>
  <div class="card">
    <h2 class="text-primary text-xl font-bold mb-4 text-center">怪物图鉴</h2>
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
      <div
        v-for="monster in MONSTER_CONFIG"
        :key="monster.monsterId"
        class="bg-dark/50 rounded-lg p-3"
      >
        <h3 class="font-semibold mb-1" :class="monster.isRare ? 'text-purple-400' : monster.isElite ? 'text-red-400' : 'text-light'">
          {{ monster.name }}
        </h3>
        <p class="text-light/60 text-xs mb-2">所在地图：{{ getMapName(monster.mapId) }}</p>
        <div class="mb-2">
          <div class="flex justify-between text-xs text-light/70 mb-1">
            <span>击杀数：{{ killCount[monster.monsterId] || 0 }}</span>
            <span>最高阶段：{{ currentStage(monster.monsterId).name }}</span>
          </div>
          <div class="progress-bar h-1.5">
            <div 
              class="progress-fill bg-gradient-to-r from-blue-500 to-primary" 
              :style="{ width: progressPercent(monster.monsterId) + '%' }"
            ></div>
          </div>
        </div>
        <div class="space-y-1 text-xs">
          <div
            v-for="(stage, index) in ILLUSTRATION_CONFIG.killStages"
            :key="index"
            class="flex justify-between"
            :class="(killCount[monster.monsterId] || 0) >= stage.count ? 'text-green-400' : 'text-light/50'"
          >
            <span>{{ stage.count }}只：{{ stage.name }}</span>
            <span>{{ stage.unlockDesc }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { MONSTER_CONFIG, MAP_CONFIG, ILLUSTRATION_CONFIG } from '@/game/config.js'
import { gameState } from '@/game/state.js'

const killCount = computed(() => gameState.monsterKillCount)

const getMapName = (mapId) => {
  const map = MAP_CONFIG.find(m => m.id === mapId)
  return map ? map.name : '未知地图'
}

const currentStage = (monsterId) => {
  const count = killCount.value[monsterId] || 0
  const stages = ILLUSTRATION_CONFIG.killStages
  for (let i = stages.length - 1; i >= 0; i--) {
    if (count >= stages[i].count) {
      return stages[i]
    }
  }
  return { name: '未解锁', count: 0 }
}

const progressPercent = (monsterId) => {
  const count = killCount.value[monsterId] || 0
  const maxCount = ILLUSTRATION_CONFIG.killStages[ILLUSTRATION_CONFIG.killStages.length - 1].count
  return Math.min((count / maxCount) * 100, 100)
}
</script>