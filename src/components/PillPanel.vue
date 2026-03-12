<template>
  <div class="card">
    <h2 class="text-primary text-xl font-bold mb-4 text-center">丹药系统</h2>
    <div v-if="activeBuffList.length > 0" class="bg-primary/10 rounded-lg p-3 mb-4">
      <h4 class="text-light/80 font-semibold mb-2">生效中的buff</h4>
      <div class="flex gap-3 flex-wrap">
        <div
          v-for="buff in activeBuffList"
          :key="buff.id"
          class="bg-dark/50 rounded-lg p-2 text-center"
        >
          <p class="text-sm font-semibold">{{ buff.name }}</p>
          <p class="text-xs text-light/60">{{ buff.desc }}</p>
          <p class="text-xs text-primary mt-1">{{ buff.remainTime }}</p>
        </div>
      </div>
    </div>
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
      <div
        v-for="pill in pillList"
        :key="pill.id"
        class="bg-dark/50 rounded-lg p-3 flex flex-col justify-between"
      >
        <div>
          <h3 class="font-semibold mb-1">{{ pill.name }}</h3>
          <p class="text-light/60 text-sm mb-3">{{ pill.desc }}</p>
          <p class="text-primary text-sm mb-3">当前数量：{{ pillCount[pill.id] || 0 }}</p>
        </div>
        <div class="flex gap-2">
          <button
            class="flex-1 btn-primary"
            :disabled="pillCount[pill.id] <= 0"
            @click="usePill(pill.id, 1)"
          >
            使用1个
          </button>
          <button
            class="flex-1 btn-secondary"
            :disabled="pillCount[pill.id] <= 0"
            @click="usePill(pill.id, pillCount[pill.id])"
          >
            全部使用
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { PILL_CONFIG } from '@/game/config.js'
import { gameState, usePill } from '@/game/state.js'

const pillList = Object.values(PILL_CONFIG)
const pillCount = computed(() => gameState.pills)
const buffData = computed(() => gameState.buffData)
let timer = null

const activeBuffList = computed(() => {
  const now = Date.now()
  const list = []
  Object.keys(buffData.value).forEach(key => {
    const buff = buffData.value[key]
    if (buff.endTime > now) {
      const pillConfig = PILL_CONFIG[key]
      const remainTime = Math.floor((buff.endTime - now) / 1000)
      const minute = Math.floor(remainTime / 60)
      const second = remainTime % 60
      list.push({
        id: key,
        name: pillConfig.name,
        desc: pillConfig.desc,
        remainTime: `${minute}分${second}秒`
      })
    }
  })
  return list
})

const usePillHandler = (pillId, count) => {
  for (let i = 0; i < count; i++) {
    const res = usePill(pillId)
    if (!res.success) break
  }
}

onMounted(() => {
  timer = setInterval(() => {}, 1000)
  return () => clearInterval(timer)
})
</script>