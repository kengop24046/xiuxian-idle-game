<template>
  <div class="card">
    <h2 class="text-primary text-xl font-bold mb-4 text-center">秘境奇遇</h2>

    <div class="bg-dark/50 rounded-lg p-3 mb-4">
      <div class="font-bold">当前秘境</div>
      <p class="text-xs mt-1">
        状态：{{ gameState.secret.available ? '可进入' : '未解锁' }}
      </p>
      <p class="text-xs text-light/70">
        击杀进度：{{ gameState.secret.unlockCount }}/100
      </p>
      <button
        class="btn-primary w-full mt-2"
        :disabled="!gameState.secret.available"
        @click="enterSecret"
      >
        进入秘境
      </button>
    </div>

    <div class="bg-dark/50 rounded-lg p-3">
      <div class="font-bold mb-2">奇遇记录</div>
      <div class="text-xs text-light/70">
        打怪、切换地图时有概率触发仙人赠礼、心魔、秘境入口
      </div>
    </div>
  </div>
</template>

<script setup>
import { gameState, saveGame } from '@/game/state.js'

const enterSecret = () => {
  if (!gameState.secret.available) return
  gameState.gold += 500
  gameState.items.strengthenStone += 5
  gameState.secret.available = false
  saveGame()
  alert('秘境通关！获得大量奖励')
}
</script>

<style scoped>
</style>