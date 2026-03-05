<template>
  <nav class="border-t border-primary/30 bg-dark/90">
    <div class="max-w-7xl mx-auto grid grid-cols-5 md:grid-cols-10 gap-1 p-2">
      <button
        v-for="tab in tabList"
        :key="tab.key"
        @click="$emit('update:activeTab', tab.key)"
        class="flex flex-col items-center justify-center py-2 px-1 rounded transition-all"
        :class="activeTab === tab.key ? 'bg-primary/20 text-primary' : 'text-light/60 hover:text-light hover:bg-primary/10'"
      >
        <span class="text-lg md:text-xl">{{ tab.icon }}</span>
        <span class="text-[10px] md:text-xs mt-1">{{ tab.name }}</span>
      </button>
    </div>
  </nav>
</template>

<script setup>
const props = defineProps({ activeTab: { type: String, default: 'cultivation' } })
defineEmits(['update:activeTab'])

const tabList = [
  { key: 'cultivation', name: '修炼', icon: '🧘' },
  { key: 'combat', name: '打怪', icon: '⚔️' },
  { key: 'map', name: '地图', icon: '🗺️' },
  { key: 'equipment', name: '装备', icon: '🛡️' },
  { key: 'attribute', name: '属性', icon: '📊' },
  { key: 'trial', name: '试炼', icon: '🏆' },
  { key: 'shop', name: '商店', icon: '🏪' },
  { key: 'reincarnation', name: '转生', icon: '🔄' },
  { key: 'save', name: '存档', icon: '💾' },
]
</script>