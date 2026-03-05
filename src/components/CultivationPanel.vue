<template>
  <div class="space-y-6">
    <div class="card">
      <h2 class="text-primary text-xl font-bold mb-4 text-center">修炼打坐</h2>
      <div class="flex flex-col items-center gap-6">
        <button
          @click="handleMeditate"
          class="w-full max-w-md h-32 md:h-40 bg-gradient-to-br from-primary to-yellow-500 text-dark font-bold text-2xl rounded-xl shadow-lg hover:scale-105 transition-all active:scale-95"
        >
          打坐修炼
        </button>
        <p class="text-light/80 text-center">
          单次打坐可获得 <span class="text-primary font-semibold">{{ formatNumber(meditateGain) }}</span> 修为
          <br>
          悟性加成：<span class="text-blue-400">+{{ (expRate - 1) * 100 }}%</span>
        </p>
        
        <button
          @click="toggleAutoMeditate"
          class="w-full max-w-md btn-secondary text-xl py-4"
          :class="autoMeditate ? 'bg-success/20 border-success text-success' : ''"
        >
          {{ autoMeditate ? '关闭自动打坐' : '开启自动打坐' }}
        </button>

        <button
          @click="handleBreakRealm"
          class="w-full max-w-md btn-primary"
          :disabled="!canBreak"
        >
          {{ canBreak ? '突破境界' : `修为/击杀不足，无法突破` }}
        </button>
        <p v-if="breakResult.msg" class="text-center" :class="breakResult.success ? 'text-success' : 'text-danger'">
          {{ breakResult.msg }}
        </p>
      </div>
    </div>

    <div class="card">
      <h3 class="text-primary text-lg font-semibold mb-3">境界信息</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="bg-dark/50 rounded-lg p-3">
          <p class="text-light/70 text-sm">当前境界</p>
          <p class="text-primary text-xl font-bold">{{ currentRealm.name }} {{ currentLevel }}层</p>
        </div>
        <div class="bg-dark/50 rounded-lg p-3">
          <p class="text-light/70 text-sm">下一级所需修为</p>
          <p class="text-blue-400 font-semibold">{{ formatNumber(currentRealmExpNeed) }}</p>
        </div>
        <div class="bg-dark/50 rounded-lg p-3">
          <p class="text-light/70 text-sm">下一级所需击杀</p>
          <p class="text-red-400 font-semibold">{{ currentRealmKillNeed }} 只怪物</p>
        </div>
        <div class="bg-dark/50 rounded-lg p-3">
          <p class="text-light/70 text-sm">当前境界已击杀</p>
          <p class="text-green-400 font-semibold">{{ realmKillCount }} / {{ currentRealmKillNeed }} 只</p>
        </div>
      </div>
    </div>

    <div class="card">
      <h3 class="text-primary text-lg font-semibold mb-3">境界总览</h3>
      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-60 overflow-y-auto">
        <div
          v-for="realm in REALM_CONFIG"
          :key="realm.id"
          class="rounded-lg p-2 text-center border"
          :class="
            currentRealmId > realm.id
              ? 'border-primary/50 bg-primary/10 text-primary'
              : currentRealmId === realm.id
              ? 'border-primary bg-primary/20 text-primary font-bold'
              : 'border-light/10 bg-dark/30 text-light/40'
          "
        >
          <p class="text-sm">{{ realm.name }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onUnmounted, watch } from 'vue'
import { meditate, breakRealm, toggleAutoMeditate } from '@/game/cultivation.js'
import { gameState, currentRealm, currentRealmExpNeed, currentRealmKillNeed, playerTotalAttribute } from '@/game/state.js'
import { formatNumber } from '@/game/utils.js'
import { REALM_CONFIG } from '@/game/config.js'

const breakResult = ref({ success: false, msg: '' })
const autoMeditateTimer = ref(null)
const currentRealmId = computed(() => gameState.currentRealmId)
const currentLevel = computed(() => gameState.currentLevel)
const realmKillCount = computed(() => gameState.realmKillCount)
const expRate = computed(() => playerTotalAttribute.value.expRate)
const autoMeditate = computed(() => gameState.autoMeditate)

const meditateGain = computed(() => currentRealm.value.baseExp * 0.01 * expRate.value)
const canBreak = computed(() => gameState.currentExp >= currentRealmExpNeed.value && gameState.realmKillCount >= currentRealmKillNeed.value)

const handleMeditate = () => meditate()
const handleBreakRealm = () => {
  breakResult.value = breakRealm()
  setTimeout(() => breakResult.value = { success: false, msg: '' }, 3000)
}

const startAutoMeditate = () => {
  if (autoMeditateTimer.value) return
  autoMeditateTimer.value = setInterval(() => {
    if (!canBreak.value) {
      meditate()
    }
  }, 500)
}

const stopAutoMeditate = () => {
  if (autoMeditateTimer.value) {
    clearInterval(autoMeditateTimer.value)
    autoMeditateTimer.value = null
  }
}

watch(autoMeditate, (newVal) => {
  newVal ? startAutoMeditate() : stopAutoMeditate()
})

onUnmounted(() => stopAutoMeditate())
</script>