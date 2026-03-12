<template>
  <footer class="border-t border-primary/30 bg-dark/95 py-2 px-4 sticky bottom-0 z-50">
    <div class="flex gap-1 overflow-x-auto no-scrollbar">
      <button
        v-for="tab in tabList"
        :key="tab.value"
        class="flex flex-col items-center justify-center min-w-[4.5rem] py-1 px-2 rounded-lg transition-all flex-shrink-0"
        :class="modelValue === tab.value ? 'text-primary bg-primary/10' : 'text-light/60 hover:text-light'"
        @click="handleTabChange(tab.value)"
      >
        <span class="text-lg mb-0.5">{{ tab.icon }}</span>
        <span class="text-xs whitespace-nowrap">{{ tab.name }}</span>
      </button>
    </div>
  </footer>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  activeTab: {
    type: String,
    default: 'cultivation'
  }
})
const emit = defineEmits(['update:activeTab'])

const modelValue = computed({
  get: () => props.activeTab,
  set: (val) => emit('update:activeTab', val)
})

const tabList = [
  { name: '境界', value: 'cultivation', icon: '✨' },
  { name: '打怪', value: 'combat', icon: '⚔️' },
  { name: '地图', value: 'map', icon: '🗺️' },
  { name: '装备', value: 'equipment', icon: '🛡️' },
  { name: '套装', value: 'set', icon: '🎒' },
  { name: '丹药', value: 'pill', icon: '💊' },
  { name: '签到', value: 'signin', icon: '📅' },
  { name: '成就', value: 'achievement', icon: '🏆' },
  { name: '图鉴', value: 'illustration', icon: '📖' },
  { name: '试炼', value: 'trial', icon: '🏯' },
  { name: '属性', value: 'attribute', icon: '📊' },
  { name: '商店', value: 'shop', icon: '🏪' },
  { name: '转生', value: 'reincarnation', icon: '🔄' },
  { name: '存档', value: 'save', icon: '💾' },
]

const handleTabChange = (val) => {
  modelValue.value = val
}
</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>