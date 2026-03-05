<template>
  <div class="space-y-6">
    <div v-if="tip.show" class="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-lg" :class="tip.type === 'success' ? 'bg-success text-white' : 'bg-danger text-white'">
      {{ tip.msg }}
    </div>

    <div class="card">
      <h2 class="text-primary text-xl font-bold mb-4 text-center">地图选择</h2>
      <p class="text-light/70 text-center mb-6">提升境界解锁更多地图，更高等级地图掉落更好的装备与更多金币</p>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          v-for="map in allMaps"
          :key="map.id"
          class="card border-2 transition-all hover:scale-[1.02]"
          :class="
            currentMapId === map.id
              ? 'border-primary bg-primary/10'
              : isMapUnlocked(map)
              ? 'border-primary/30 hover:border-primary/60'
              : 'border-light/10 opacity-60'
          "
        >
          <div class="flex justify-between items-start mb-2">
            <h3 class="text-lg font-bold" :class="currentMapId === map.id ? 'text-primary' : 'text-light'">
              {{ map.name }}
            </h3>
            <span v-if="currentMapId === map.id" class="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
              当前
            </span>
          </div>
          <p class="text-light/70 text-sm mb-3">{{ map.desc }}</p>
          <div class="grid grid-cols-3 gap-2 mb-4 text-xs">
            <div class="bg-dark/30 rounded p-2 text-center">
              <p class="text-light/60">怪物等级</p>
              <p class="text-red-400 font-semibold">{{ map.monsterLevel }}级</p>
            </div>
            <div class="bg-dark/30 rounded p-2 text-center">
              <p class="text-light/60">金币倍率</p>
              <p class="text-yellow-400 font-semibold">x{{ map.goldMultiplier }}</p>
            </div>
            <div class="bg-dark/30 rounded p-2 text-center">
              <p class="text-light/60">掉落倍率</p>
              <p class="text-primary font-semibold">x{{ map.dropMultiplier }}</p>
            </div>
          </div>
          <div v-if="!isMapUnlocked(map)" class="text-center text-light/60 text-sm mb-3">
            解锁条件：{{ REALM_CONFIG[map.unlockRealmId-1].name }} {{ map.unlockLevel }}层
          </div>
          <button
            @click="handleSwitchMap(map.id)"
            class="w-full btn-primary"
            :disabled="!isMapUnlocked(map) || currentMapId === map.id"
          >
            {{ currentMapId === map.id ? '当前地图' : isMapUnlocked(map) ? '切换地图' : '未解锁' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { getAllMaps, checkMapUnlocked, switchMap } from '@/game/map.js'
import { gameState } from '@/game/state.js'
import { REALM_CONFIG } from '@/game/config.js'

const tip = ref({ show: false, msg: '', type: '' })
const allMaps = getAllMaps()
const currentMapId = computed(() => gameState.currentMapId)

const isMapUnlocked = (map) => checkMapUnlocked(map)
const handleSwitchMap = (mapId) => {
  const result = switchMap(mapId)
  tip.value = { show: true, msg: result.msg, type: result.success ? 'success' : 'error' }
  setTimeout(() => tip.value.show = false, 3000)
}
</script>