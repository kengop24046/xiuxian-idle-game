<template>
  <footer class="tabbar-footer">
    <div class="tab-scroll-container" ref="scrollContainerRef">
      <div class="tab-list">
        <button
          v-for="tab in tabList"
          :key="tab.value"
          :ref="el => tabRefs[tab.value] = el"
          class="tab-item"
          :class="modelValue === tab.value ? 'tab-active' : 'tab-inactive'"
          @click="handleTabChange(tab.value)"
        >
          <span class="tab-icon">{{ tab.icon }}</span>
          <span class="tab-name">{{ tab.name }}</span>
        </button>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { computed, ref, watch, nextTick } from 'vue'

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

const scrollContainerRef = ref(null)
const tabRefs = ref({})

const tabList = [
  { name: '境界', value: 'cultivation', icon: '✨' },
  { name: '打怪', value: 'combat', icon: '⚔️' },
  { name: '地图', value: 'map', icon: '🗺️' },
  { name: '装备', value: 'equipment', icon: '🛡️' },
  { name: '背包', value: 'backpack', icon: '🎒' },
  { name: '灵兽', value: 'pet', icon: '🐉' },
  { name: '功法', value: 'skill', icon: '📜' },
  { name: '丹药', value: 'pill', icon: '💊' },
  { name: '套装', value: 'set', icon: '📦' },
  { name: '宗门', value: 'sect', icon: '🏛️' },
  { name: '洞府', value: 'cave', icon: '🏡' },
  { name: '灵根', value: 'root', icon: '💠' },
  { name: '秘境', value: 'secret', icon: '🌀' },
  { name: '通天塔', value: 'skyTower', icon: '🏯' },
  { name: '竞技场', value: 'arena', icon: '🏟️' },
  { name: '飞升', value: 'ascend', icon: '☁️' },
  { name: '试炼', value: 'trial', icon: '🗼' },
  { name: '签到', value: 'signin', icon: '📅' },
  { name: '成就', value: 'achievement', icon: '🏆' },
  { name: '图鉴', value: 'illustration', icon: '📖' },
  { name: '属性', value: 'attribute', icon: '📊' },
  { name: '商店', value: 'shop', icon: '🏪' },
  { name: '转生', value: 'reincarnation', icon: '🔄' },
  { name: '存档', value: 'save', icon: '💾' },
]

const handleTabChange = (val) => {
  modelValue.value = val
  scrollToActiveTab(val)
}

const scrollToActiveTab = async (tabValue) => {
  await nextTick()
  const targetTab = tabRefs.value[tabValue]
  const container = scrollContainerRef.value
  if (!targetTab || !container) return

  targetTab.scrollIntoView({
    behavior: 'smooth',
    block: 'nearest',
    inline: 'center'
  })
}

watch(
  () => modelValue.value,
  (newVal) => {
    scrollToActiveTab(newVal)
  },
  { immediate: true }
)
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.tabbar-footer {
  position: relative;
  width: 100%;
  z-index: 999;
  background: rgba(18, 18, 24, 0.98);
  border-top: 1px solid rgba(139, 92, 246, 0.3);
  margin-top: 1rem;
  overflow: visible;
}

.tab-scroll-container {
  width: 100%;
  overflow-x: auto;
  overflow-y: hidden;
  touch-action: pan-x;
  scroll-behavior: smooth;
  padding: 0.4rem 0.8rem;
  overflow-anchor: none;
}

.tab-scroll-container::-webkit-scrollbar {
  display: none;
}
.tab-scroll-container {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.tab-list {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  flex-shrink: 0;
  flex-wrap: nowrap;
  min-width: max-content;
  width: fit-content;
  gap: 0.2rem;
}

.tab-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 3.2rem;
  flex-shrink: 0;
  padding: 0.35rem 0.25rem;
  border-radius: 0.4rem;
  border: none;
  background: transparent;
  transition: all 0.2s ease;
  cursor: pointer;
  white-space: nowrap;
}

.tab-active {
  color: #8b5cf6;
  background: rgba(139, 92, 246, 0.12);
  transform: scale(1.05);
}

.tab-inactive {
  color: rgba(255, 255, 255, 0.55);
}

.tab-inactive:hover {
  color: rgba(255, 255, 255, 0.9);
  background: rgba(255, 255, 255, 0.05);
}

.tab-icon {
  font-size: 1rem;
  line-height: 1;
  margin-bottom: 0.15rem;
  flex-shrink: 0;
}

.tab-name {
  font-size: 0.6rem;
  line-height: 1.1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

@media (max-width: 768px) {
  .tab-item {
    min-width: 3rem;
    padding: 0.3rem 0.2rem;
  }
  .tab-icon {
    font-size: 0.95rem;
  }
  .tab-name {
    font-size: 0.55rem;
  }
  .tab-list {
    gap: 0.15rem;
  }
}

@media (min-width: 768px) and (max-width: 1200px) {
  .tab-item {
    min-width: 3.4rem;
  }
  .tab-icon {
    font-size: 1rem;
  }
  .tab-name {
    font-size: 0.62rem;
  }
}

@media (min-width: 1200px) {
  .tab-item {
    min-width: 3.5rem;
  }
  .tab-icon {
    font-size: 1.05rem;
  }
  .tab-name {
    font-size: 0.65rem;
  }
  .tab-list {
    gap: 0.3rem;
  }
}
</style>