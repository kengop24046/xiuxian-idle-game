<template>
  <div class="card">
    <h2 class="text-primary text-xl font-bold mb-4 text-center">功法神通</h2>

    <div class="flex gap-2 mb-4">
      <button
        class="btn-primary flex-1"
        :class="tab === 'passive' ? 'bg-primary/30' : ''"
        @click="tab = 'passive'"
      >
        被动功法
      </button>
      <button
        class="btn-primary flex-1"
        :class="tab === 'active' ? 'bg-primary/30' : ''"
        @click="tab = 'active'"
      >
        主动神通
      </button>
    </div>

    <div v-if="tab === 'passive'" class="space-y-3">
      <div
        v-for="s in SKILL_CONFIG.passive"
        :key="s.id"
        class="bg-dark/50 rounded-lg p-3"
      >
        <div class="flex justify-between">
          <span class="font-bold">{{ s.name }}</span>
          <span class="text-xs text-light/60">Lv.{{ getLv(s.id) }}</span>
        </div>
        <p class="text-xs text-light/70 my-1">{{ s.desc }}</p>
        <div class="flex gap-2 mt-2">
          <button
            class="btn-secondary text-xs flex-1"
            @click="equipPassive(s.id)"
          >
            {{ isEquipped(s.id) ? '已装备' : '装备' }}
          </button>
          <button class="btn-primary text-xs flex-1" @click="upgradeSkill(s.id)">
            升级
          </button>
        </div>
      </div>
    </div>

    <div v-else class="space-y-3">
      <div
        v-for="s in SKILL_CONFIG.active"
        :key="s.id"
        class="bg-dark/50 rounded-lg p-3"
      >
        <div class="flex justify-between">
          <span class="font-bold">{{ s.name }}</span>
          <span class="text-xs text-light/60">CD:{{ s.cd / 1000 }}s</span>
        </div>
        <p class="text-xs text-light/70 my-1">{{ s.desc }}</p>
        <button
          class="btn-primary w-full mt-2"
          @click="castSkill(s.id)"
          :disabled="cdRemain(s.id) > 0"
        >
          {{ cdRemain(s.id) > 0 ? `冷却(${cdRemain(s.id)})` : '释放' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { gameState, saveGame, castActiveSkill } from '@/game/state.js'
import { SKILL_CONFIG } from '@/game/config.js'

const tab = ref('passive')

const getLv = (id) => {
  return gameState.skills.passive.find(x => x.id === id)?.lv || 1
}

const isEquipped = (id) => {
  return gameState.skills.equippedPassive.includes(id)
}

const equipPassive = (id) => {
  const list = gameState.skills.equippedPassive
  if (list.includes(id)) {
    gameState.skills.equippedPassive = list.filter(x => x !== id)
  } else {
    if (list.length >= 3) list.shift()
    gameState.skills.equippedPassive = [...list, id]
  }
  saveGame()
}

const upgradeSkill = (id) => {
  const s = gameState.skills.passive.find(x => x.id === id)
  if (!s) {
    gameState.skills.passive.push({ id, lv: 1 })
  } else {
    s.lv += 1
  }
  saveGame()
}

const castSkill = (id) => {
  castActiveSkill(id)
}

const cdRemain = (id) => {
  const cd = gameState.skills.cd[id] || 0
  return Math.max(0, Math.ceil((cd - Date.now()) / 1000))
}
</script>

<style scoped>
</style>