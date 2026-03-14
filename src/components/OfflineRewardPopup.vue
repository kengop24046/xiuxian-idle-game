<template>
  <div v-if="gameState.offlineReward" class="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
    <div class="card w-11/12 max-w-md">
      <h3 class="text-primary text-xl font-bold mb-4 text-center">离线收益</h3>
      <p class="text-center mb-4">离线时长：{{ gameState.offlineReward.timeHours }}小时</p>
      <div class="space-y-2 mb-4">
        <div class="flex justify-between">
          <span>金币</span>
          <span class="text-primary font-bold">{{ formatNumber(gameState.offlineReward.gold) }}</span>
        </div>
        <div class="flex justify-between">
          <span>修为</span>
          <span class="text-primary font-bold">{{ formatNumber(gameState.offlineReward.exp) }}</span>
        </div>
        <div class="flex justify-between">
          <span>强化石</span>
          <span class="text-primary font-bold">{{ gameState.offlineReward.strengthenStone }}</span>
        </div>
      </div>
      <button class="btn-primary w-full py-3" @click="claimReward">领取收益</button>
    </div>
  </div>
</template>
<script setup>
import { gameState, claimOfflineReward } from '@/game/state.js'
import { formatNumber } from '@/game/utils.js'

const claimReward = () => {
  claimOfflineReward()
}
</script>