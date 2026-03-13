<template>
  <footer class="tabbar-footer">
    <div class="tab-scroll-container">
      <div class="tab-list">
        <button
          v-for="tab in tabList"
          :key="tab.value"
          class="tab-item"
          :class="modelValue === tab.value ? 'tab-active' : 'tab-inactive'"
          @click="handleTabChange(tab.value)"
        >
          <span class="tab-icon">{{ tab.icon }}</span>
          <span class="tab-name">{{ tab.name }}</span>
        </button>
      </div>
    </div>
    <div class="scroll-tip"></div>
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
  { name: '功法', value: 'skill', icon: '📜' },
  { name: '丹药', value: 'pill', icon: '💊' },
  { name: '套装', value: 'set', icon: '🎒' },
  { name: '宗门', value: 'sect', icon: '🏛️' },
  { name: '洞府', value: 'cave', icon: '🏡' },
  { name: '灵根', value: 'root', icon: '💠' },
  { name: '秘境', value: 'secret', icon: '🌀' },
  { name: '试炼', value: 'trial', icon: '🏯' },
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
}
</script>

<style scoped>
.tabbar-footer {
  position: sticky;
  bottom: 0;
  left: 0;
  width: 100%;
  z-index: 999;
  background: rgba(18, 18, 24, 0.98);
  border-top: 1px solid rgba(139, 92, 246, 0.3);
  box-sizing: border-box;
  overflow: hidden;
}

.tab-scroll-container {
  width: 100%;
  overflow-x: auto;
  overflow-y: hidden;
  box-sizing: border-box;
  padding: 0.5rem 0.75rem;
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
  gap: 0.25rem;
  min-width: max-content;
  width: fit-content;
}

.tab-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 3.8rem;
  flex-shrink: 0;
  padding: 0.5rem 0.35rem;
  border-radius: 0.5rem;
  border: none;
  background: transparent;
  transition: all 0.2s ease;
  cursor: pointer;
}

.tab-active {
  color: #8b5cf6;
  background: rgba(139, 92, 246, 0.12);
}
.tab-inactive {
  color: rgba(255, 255, 255, 0.55);
}
.tab-inactive:hover {
  color: rgba(255, 255, 255, 0.9);
}

.tab-icon {
  font-size: 1.15rem;
  line-height: 1;
  margin-bottom: 0.25rem;
}
.tab-name {
  font-size: 0.7rem;
  line-height: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

.scroll-tip {
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 2rem;
  background: linear-gradient(90deg, transparent, rgba(18, 18, 24, 0.9));
  pointer-events: none;
  z-index: 10;
}
</style>