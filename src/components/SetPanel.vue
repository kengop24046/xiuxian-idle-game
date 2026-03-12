<template>
  <div class="card">
    <h2 class="text-primary text-xl font-bold mb-4 text-center">装备套装</h2>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div
        v-for="set in EQUIPMENT_SET_CONFIG"
        :key="set.setId"
        class="bg-dark/50 rounded-lg p-3"
      >
        <h3 class="text-lg font-semibold mb-2" :class="currentSetCount[set.setId] > 0 ? 'text-primary' : 'text-light/70'">
          {{ set.setName }}
          <span class="text-sm ml-2 text-light/60">（{{ currentSetCount[set.setId] || 0 }}/8件）</span>
        </h3>
        <p class="text-light/60 text-sm mb-3">{{ set.desc }}</p>
        <div class="space-y-2">
          <div
            v-for="effect in set.effects"
            :key="effect.needCount"
            class="text-sm"
            :class="(currentSetCount[set.setId] || 0) >= effect.needCount ? 'text-green-400' : 'text-light/50'"
          >
            ✅ {{ effect.desc }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { EQUIPMENT_SET_CONFIG } from '@/game/config.js'
import { equipSetCount } from '@/game/state.js'

const currentSetCount = computed(() => equipSetCount.value)
</script>