<template>
  <div class="card">
    <h2 class="text-primary text-xl font-bold mb-4 text-center">成就系统</h2>
    <div class="flex gap-2 mb-4 overflow-x-auto pb-2">
      <button
        v-for="type in tabList"
        :key="type.value"
        class="btn-secondary whitespace-nowrap"
        :class="currentTab === type.value ? 'bg-primary/20 border-primary text-primary' : ''"
        @click="currentTab = type.value"
      >
        {{ type.name }}
      </button>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
      <div
        v-for="achievement in filteredAchievement"
        :key="achievement.id"
        class="bg-dark/50 rounded-lg p-3 flex flex-col justify-between"
      >
        <div>
          <div class="flex justify-between items-start mb-2">
            <h3 class="font-semibold" :class="getAchievementState(achievement.id).isFinished ? 'text-primary' : 'text-light'">
              {{ achievement.name }}
            </h3>
            <span
              v-if="getAchievementState(achievement.id).isClaimed"
              class="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full"
            >
              已领取
            </span>
          </div>
          <p class="text-light/60 text-sm mb-3">{{ achievement.desc }}</p>
          <div class="mb-2">
            <div class="flex justify-between text-xs text-light/70 mb-1">
              <span>进度：{{ getCurrentValue(achievement) }}/{{ achievement.target }}</span>
            </div>
            <div class="progress-bar h-1.5">
              <div 
                class="progress-fill bg-gradient-to-r from-yellow-500 to-orange-500" 
                :style="{ width: getProgressPercent(achievement) + '%' }"
              ></div>
            </div>
          </div>
        </div>
        <button
          v-if="getAchievementState(achievement.id).isFinished && !getAchievementState(achievement.id).isClaimed"
          class="btn-primary w-full mt-2"
          @click="claimReward(achievement)"
        >
          领取奖励
        </button>
        <button
          v-else-if="!getAchievementState(achievement.id).isFinished"
          class="btn-secondary w-full mt-2 opacity-50"
          disabled
        >
          未完成
        </button>
        <button
          v-else
          class="btn-secondary w-full mt-2 opacity-50"
          disabled
        >
          已领取
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ACHIEVEMENT_CONFIG } from '@/game/config.js'
import { gameState, saveGame } from '@/game/state.js'

const currentTab = ref('all')
const tabList = [
  { name: '全部', value: 'all' },
  { name: '成长', value: 'growth' },
  { name: '战斗', value: 'battle' },
  { name: '养成', value: 'develop' },
]

const filteredAchievement = computed(() => {
  if (currentTab.value === 'all') return ACHIEVEMENT_CONFIG
  return ACHIEVEMENT_CONFIG.filter(ach => ach.type === currentTab.value)
})

const getAchievementState = (achievementId) => {
  if (!gameState || !gameState.achievementState) {
    return { isFinished: false, isClaimed: false }
  }
  const state = gameState.achievementState[achievementId]
  return state || { isFinished: false, isClaimed: false }
}

const getCurrentValue = (achievement) => {
  if (!gameState) return 0
  const value = gameState[achievement.currentKey]
  return Math.min(Number(value) || 0, achievement.target)
}

const getProgressPercent = (achievement) => {
  const current = getCurrentValue(achievement)
  return Math.min((current / achievement.target) * 100, 100)
}

const claimReward = (achievement) => {
  const state = getAchievementState(achievement.id)
  if (!state.isFinished || state.isClaimed) return

  if (!gameState) return

  const reward = achievement.reward
  Object.keys(reward).forEach(key => {
    if (key === 'gold') {
      gameState.gold = (gameState.gold || 0) + reward[key]
    } else if (key === 'freeAttributePoint') {
      gameState.freeAttributePoint = (gameState.freeAttributePoint || 0) + reward[key]
    } else if (gameState.items && gameState.items[key] !== undefined) {
      gameState.items[key] = (Number(gameState.items[key]) || 0) + reward[key]
    } else if (gameState.pills && gameState.pills[key] !== undefined) {
      gameState.pills[key] = (Number(gameState.pills[key]) || 0) + reward[key]
    }
  })

  if (!gameState.achievementState) {
    gameState.achievementState = {}
  }
  gameState.achievementState[achievement.id] = {
    isFinished: true,
    isClaimed: true
  }
  saveGame()
}
</script>