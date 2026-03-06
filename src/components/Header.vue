<template>
  <header class="bg-dark/90 border-b border-primary/30 p-4">
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
      <div class="flex flex-col">
        <div class="flex items-center gap-2 flex-wrap">
          <h1 class="text-primary text-xl md:text-2xl font-bold">修仙挂机录</h1>
          <span class="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">
            修仙等级 {{ level }}
          </span>
          <span class="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full">
            {{ age }}岁
          </span>
          <span v-if="reincarnationCount > 0" class="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
            第{{ reincarnationCount }}转
          </span>
        </div>
        <p class="text-light/80 text-sm">当前境界：{{ currentRealm.name }} {{ currentLevel }}层</p>
      </div>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div class="flex flex-col">
          <span class="text-light/60 text-xs">金币</span>
          <span class="text-yellow-400 font-semibold">{{ formatNumber(gold) }}</span>
        </div>
        <div class="flex flex-col">
          <span class="text-light/60 text-xs">修为</span>
          <span class="text-blue-400 font-semibold">{{ formatNumber(currentExp) }} / {{ formatNumber(expNeed) }}</span>
        </div>
        <div class="flex flex-col">
          <span class="text-light/60 text-xs">总击杀</span>
          <span class="text-red-400 font-semibold">{{ formatNumber(totalKillCount) }}</span>
        </div>
        <div class="flex flex-col">
          <span class="text-light/60 text-xs">属性点</span>
          <span class="text-green-400 font-semibold">{{ freeAttributePoint > 0 ? freeAttributePoint : '无' }}</span>
        </div>
      </div>
    </div>

    <div class="mt-3">
      <div class="flex justify-between text-xs text-light/70 mb-1">
        <span>等级经验</span>
        <span>{{ formatNumber(levelExp) }} / {{ formatNumber(levelMaxExp) }}</span>
      </div>
      <div class="progress-bar">
        <div 
          class="progress-fill bg-gradient-to-r from-green-500 to-emerald-400" 
          :style="{ width: levelExpProgress + '%' }"
        ></div>
      </div>
    </div>

    <div class="mt-3">
      <div class="flex justify-between text-xs text-light/70 mb-1">
        <span>修为进度</span>
        <span>{{ expProgress.toFixed(2) }}%</span>
      </div>
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: expProgress + '%' }"></div>
      </div>
    </div>

    <div class="mt-2">
      <div class="flex justify-between text-xs text-light/70 mb-1">
        <span>突破击杀进度</span>
        <span>{{ realmKillCount }} / {{ killNeed }}</span>
      </div>
      <div class="progress-bar">
        <div class="progress-fill bg-gradient-to-r from-red-500 to-orange-500" :style="{ width: killProgress + '%' }"></div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue'
import { gameState, currentRealm, currentRealmExpNeed, currentRealmKillNeed, expProgress, killProgress, levelExpProgress } from '@/game/state.js'
import { formatNumber } from '@/game/utils.js'

const level = computed(() => gameState.level)
const levelExp = computed(() => gameState.levelExp)
const levelMaxExp = computed(() => gameState.levelMaxExp)
const age = computed(() => gameState.age)
const gold = computed(() => gameState.gold)
const currentExp = computed(() => gameState.currentExp)
const currentLevel = computed(() => gameState.currentLevel)
const totalKillCount = computed(() => gameState.totalKillCount)
const realmKillCount = computed(() => gameState.realmKillCount)
const freeAttributePoint = computed(() => gameState.freeAttributePoint)
const reincarnationCount = computed(() => gameState.reincarnationCount)
const expNeed = computed(() => currentRealmExpNeed.value)
const killNeed = computed(() => currentRealmKillNeed.value)
</script>