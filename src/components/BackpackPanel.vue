<template>
  <div class="card">
    <h2 class="text-primary text-xl font-bold mb-4 text-center">背包</h2>
    <div class="bg-primary/10 rounded-lg p-3 mb-4">
      <div class="flex justify-between items-center mb-2">
        <span class="font-bold">背包容量</span>
        <span class="text-sm">{{ backpackUsedCount }} / {{ gameState.backpack.capacity }}</span>
      </div>
      <div class="progress-bar h-2">
        <div class="progress-fill bg-primary" :style="{ width: (backpackUsedCount / gameState.backpack.capacity) * 100 + '%' }"></div>
      </div>
      <button 
        class="btn-secondary text-xs w-full mt-2 leading-relaxed" 
        @click="handleExpandBackpack" 
        :disabled="expandConfig.currentCapacity >= expandConfig.maxCapacity || !expandConfig.isEnough"
        :class="(!expandConfig.isEnough && expandConfig.currentCapacity < expandConfig.maxCapacity) ? 'opacity-70' : ''"
      >
        <template v-if="expandConfig.currentCapacity >= expandConfig.maxCapacity">
          已达最大容量（{{ expandConfig.maxCapacity }}格）
        </template>
        <template v-else>
          扩容背包（+{{ expandConfig.expandStep }}格 → {{ expandConfig.nextCapacity }}格）
          <br>
          需{{ expandConfig.itemName }}x{{ expandConfig.needCount }}（当前持有：{{ expandConfig.currentCount }}）
        </template>
      </button>
    </div>
    <div class="flex gap-1 overflow-x-auto no-scrollbar mb-4">
      <button
        v-for="tab in tabList"
        :key="tab.type"
        class="btn-secondary text-xs whitespace-nowrap flex-shrink-0"
        :class="activeTab === tab.type ? 'bg-primary/20 text-primary' : ''"
        @click="activeTab = tab.type"
      >
        {{ tab.name }}
      </button>
    </div>
    <div class="flex gap-2 mb-4">
      <select v-model="filterQuality" class="bg-dark/50 border border-primary/30 rounded-lg px-2 py-1 text-sm flex-1">
        <option value="0">全部品质</option>
        <option v-for="(quality, id) in ITEM_QUALITY" :key="id" :value="id">
          {{ quality.name }}
        </option>
      </select>
      <select v-model="sortType" class="bg-dark/50 border border-primary/30 rounded-lg px-2 py-1 text-sm flex-1">
        <option value="quality">按品质排序</option>
        <option value="count">按数量排序</option>
        <option value="time">按获取时间排序</option>
      </select>
    </div>
    <div class="grid grid-cols-3 gap-2 mb-4">
      <button class="btn-secondary text-xs" @click="handleDecompose">一键分解</button>
      <button class="btn-secondary text-xs" @click="handleSell">一键出售</button>
      <button class="btn-secondary text-xs" @click="handleUseExpPills">一键用丹</button>
    </div>

    <div class="grid grid-cols-5 gap-2">
      <div
        v-for="slotId in allSlotIds"
        :key="slotId"
        class="aspect-square rounded-lg border flex flex-col items-center justify-between p-1 cursor-pointer transition-all hover:scale-105"
        :class="getSlotClass(slotId)"
        @click="handleSlotClick(slotId)"
      >
        <template v-if="slotItemMap[slotId]">
          <span class="text-lg">{{ slotItemMap[slotId].config.icon || '📦' }}</span>
          <span class="text-xs text-center w-full truncate">{{ slotItemMap[slotId].itemName }}</span>
          <span v-if="slotItemMap[slotId].count > 1" class="text-[10px] text-light/70">x{{ slotItemMap[slotId].count }}</span>
        </template>
        <template v-else>
          <span class="text-xs text-light/30">空</span>
        </template>
      </div>
    </div>

    <div v-if="currentDetailItem" class="fixed inset-0 bg-black/70 flex items-center justify-center z-50" @click.self="closeDetail">
      <div class="card w-11/12 max-w-md">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-xl font-bold" :class="ITEM_QUALITY[currentDetailItem.quality]?.color">
            {{ currentDetailItem.itemName }}
          </h3>
          <button class="text-light/60" @click="closeDetail">✕</button>
        </div>
        <div class="flex items-center gap-3 mb-4">
          <div class="w-16 h-16 rounded-lg flex items-center justify-center text-3xl" :class="ITEM_QUALITY[currentDetailItem.quality]?.borderColor + ' border ' + ITEM_QUALITY[currentDetailItem.quality]?.bg">
            {{ currentDetailItem.config.icon || '📦' }}
          </div>
          <div>
            <p class="text-sm text-light/70">品质：{{ ITEM_QUALITY[currentDetailItem.quality]?.name || '普通' }}</p>
            <p class="text-sm text-light/70">类型：{{ typeNameMap[currentDetailItem.itemType] || '其他' }}</p>
            <p class="text-sm text-light/70">数量：{{ currentDetailItem.count }} / {{ currentDetailItem.stackMax }}</p>
          </div>
        </div>
        <p class="text-sm mb-4">{{ currentDetailItem.config.desc || '暂无描述' }}</p>
        <div v-if="currentDetailItem.itemType === ITEM_TYPE.EQUIP && currentDetailItem.equipData" class="bg-dark/50 rounded-lg p-3 mb-4 text-sm">
          <p class="font-bold mb-2">装备属性</p>
          <div class="grid grid-cols-2 gap-1">
            <p v-if="currentDetailItem.equipData.attack">攻击：{{ currentDetailItem.equipData.attack }}</p>
            <p v-if="currentDetailItem.equipData.hp">气血：{{ currentDetailItem.equipData.hp }}</p>
            <p v-if="currentDetailItem.equipData.defense">防御：{{ currentDetailItem.equipData.defense }}</p>
            <p v-if="currentDetailItem.equipData.critRate">暴击：{{ (currentDetailItem.equipData.critRate*100).toFixed(1) }}%</p>
            <p>品质：{{ EQUIPMENT_CONFIG.qualityList?.[currentDetailItem.equipData.qualityId-1]?.name || '普通' }}</p>
            <p>强化：+{{ currentDetailItem.equipData.strengthenLevel || 0 }}</p>
          </div>
        </div>
        <div class="grid grid-cols-2 gap-2">
          <button
            v-if="currentDetailItem.config.canUse"
            class="btn-primary"
            @click="handleUseItem"
          >
            使用
          </button>
          <button
            v-if="currentDetailItem.itemType === ITEM_TYPE.EQUIP"
            class="btn-primary"
            @click="handleWearEquip"
          >
            穿戴
          </button>
          <button
            v-if="currentDetailItem.config.canSell && !currentDetailItem.isBind"
            class="btn-secondary"
            @click="handleSellItem"
          >
            出售
          </button>
          <button
            v-if="currentDetailItem.itemType === ITEM_TYPE.EQUIP && !currentDetailItem.isBind"
            class="btn-secondary"
            @click="handleDecomposeItem"
          >
            分解
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, computed } from 'vue'
import { 
  gameState, backpackUsedCount, backpackItemsByType, 
  usePill, hatchPetEgg, 
  removeItem, wearEquip, oneKeyDecomposeEquip, 
  oneKeySellItems, oneKeyUseExpPills, expandBackpack, addItem 
} from '@/game/state.js'
import { BACKPACK_CONFIG, ITEM_QUALITY, EQUIPMENT_CONFIG, ITEM_CONFIG, ITEM_TYPE } from '@/game/config.js'

const tabList = [
  { type: 'all', name: '全部' },
  { type: ITEM_TYPE.EQUIP, name: '装备' },
  { type: ITEM_TYPE.MATERIAL, name: '材料' },
  { type: ITEM_TYPE.PILL, name: '丹药' },
  { type: ITEM_TYPE.PET_EGG, name: '灵兽蛋' },
  { type: ITEM_TYPE.OTHER, name: '其他' },
]

const typeNameMap = {
  [ITEM_TYPE.EQUIP]: '装备',
  [ITEM_TYPE.MATERIAL]: '材料',
  [ITEM_TYPE.PILL]: '丹药',
  [ITEM_TYPE.PET_EGG]: '灵兽蛋',
  [ITEM_TYPE.FABAO]: '法宝',
  [ITEM_TYPE.TASK]: '任务道具',
  [ITEM_TYPE.OTHER]: '其他',
}

const activeTab = ref('all')
const filterQuality = ref(0)
const sortType = ref('quality')
const currentDetailItem = ref(null)

const expandConfig = computed(() => {
  const expandCost = BACKPACK_CONFIG.expandCost || { itemId: 'strengthenStone', count: 50 }
  const expandStep = BACKPACK_CONFIG.expandStep || 10
  const maxCapacity = BACKPACK_CONFIG.maxCapacity || 200
  const currentCapacity = gameState.backpack.capacity
  const itemConfig = ITEM_CONFIG[expandCost.itemId] || { name: '强化石' }
  const currentCount = Number(gameState.items[expandCost.itemId]) || 0
  const nextCapacity = Math.min(currentCapacity + expandStep, maxCapacity)
  return {
    expandStep,
    maxCapacity,
    currentCapacity,
    nextCapacity,
    itemId: expandCost.itemId,
    itemName: itemConfig.name,
    needCount: expandCost.count,
    currentCount,
    isEnough: currentCount >= expandCost.count
  }
})

const allSlotIds = computed(() => {
  return Array.from({ length: gameState.backpack.capacity }, (_, i) => i)
})

const filteredItems = computed(() => {
  let list = activeTab.value === 'all' 
    ? backpackItemsByType.value.all 
    : backpackItemsByType.value[activeTab.value] || []
  
  list = list.map(item => {
    const newItem = { ...item }
    if (newItem.itemType === ITEM_TYPE.EQUIP && newItem.equipData) {
      newItem.quality = newItem.equipData.qualityId || 1
    } 
    else if (newItem.config?.quality) {
      newItem.quality = newItem.config.quality
    } 
    else {
      newItem.quality = 1
    }
    return newItem
  })

  if (filterQuality.value > 0) {
    list = list.filter(item => item.quality === Number(filterQuality.value))
  }

  list = [...list].sort((a, b) => {
    if (sortType.value === 'quality') {
      return (b.quality || 1) - (a.quality || 1)
    } else if (sortType.value === 'count') {
      return (b.count || 1) - (a.count || 1)
    } else if (sortType.value === 'time') {
      return (b.getTime || 0) - (a.getTime || 0)
    }
    return 0
  })

  return list
})

const slotItemMap = computed(() => {
  const map = {}
  filteredItems.value.forEach(item => {
    map[item.slotId] = item
  })
  return map
})

const getSlotClass = (slotId) => {
  const item = slotItemMap.value[slotId]
  if (!item) {
    return 'bg-dark/30 border-dashed border-light/20'
  }
  return `${ITEM_QUALITY[item.quality]?.borderColor} ${ITEM_QUALITY[item.quality]?.bg}`
}

const handleSlotClick = (slotId) => {
  const item = slotItemMap.value[slotId]
  if (item) {
    currentDetailItem.value = item
  }
}

const emptySlotCount = computed(() => {
  return Math.max(0, gameState.backpack.capacity - filteredItems.value.length)
})

const handleExpandBackpack = () => {
  const res = expandBackpack()
  alert(res.msg)
}

const handleDecompose = () => {
  const res = oneKeyDecomposeEquip()
  if (res.success) {
    alert(`分解成功！分解${res.decomposedCount}件装备，获得强化石x${res.rewards.strengthenStone}、升级石x${res.rewards.upgradeStone}${res.rewards.starStone > 0 ? '、升星石x' + res.rewards.starStone : ''}`)
  } else {
    alert(res.msg)
  }
}

const handleSell = () => {
  const res = oneKeySellItems()
  if (res.success) {
    alert(`出售成功！获得金币x${res.totalGold}`)
  } else {
    alert(res.msg)
  }
}

const handleUseExpPills = () => {
  const res = oneKeyUseExpPills()
  if (res.success) {
    alert(`使用成功！消耗${res.usedPillsCount}个修为丹，获得修为x${res.totalExp}`)
  } else {
    alert(res.msg)
  }
}

const closeDetail = () => {
  currentDetailItem.value = null
}

const handleUseItem = () => {
  const item = currentDetailItem.value
  if (!item || !item.config.canUse) return
  if (item.itemType === ITEM_TYPE.PILL) {
    const res = usePill(item.itemId, item.slotId)
    if (res.success) {
      alert(`使用${item.itemName}成功！`)
    } else {
      alert(res.msg)
    }
  }
  if (item.itemType === ITEM_TYPE.PET_EGG) {
    const res = hatchPetEgg(item.itemId, item.slotId)
    if (res.success) {
      alert(`孵化成功！获得${res.pet.name}`)
    } else {
      alert(res.msg)
    }
  }
  closeDetail()
}

const handleWearEquip = () => {
  const item = currentDetailItem.value
  if (!item || item.itemType !== ITEM_TYPE.EQUIP || !item.equipData) return
  const res = wearEquip(item, item.equipData.partId)
  if (res.success) {
    alert('穿戴成功！')
  } else {
    alert(res.msg || '穿戴失败！可能是背包已满')
  }
  closeDetail()
}

const handleSellItem = () => {
  const item = currentDetailItem.value
  if (!item || !item.config.canSell) return
  const totalGold = (item.config.sellPrice || 0) * item.count
  if (!confirm(`确定出售${item.itemName}x${item.count}，获得金币x${totalGold}？`)) return
  removeItem(item.itemId, item.count, item.slotId)
  gameState.gold += totalGold
  alert(`出售成功！获得金币x${totalGold}`)
  closeDetail()
}

const handleDecomposeItem = () => {
  const item = currentDetailItem.value
  if (!item || item.itemType !== ITEM_TYPE.EQUIP || !item.equipData) return
  if (!confirm(`确定分解${item.itemName}？`)) return
  const equip = item.equipData
  const reward = {
    strengthenStone: (equip.qualityId || 1) * 2,
    upgradeStone: (equip.qualityId || 1),
    starStone: equip.star > 1 ? equip.star : 0
  }
  removeItem(item.itemId, 1, item.slotId)
  Object.keys(reward).forEach(itemId => {
    if (reward[itemId] > 0) addItem(itemId, reward[itemId])
  })
  alert(`分解成功！获得强化石x${reward.strengthenStone}${reward.upgradeStone > 0 ? '、升级石x' + reward.upgradeStone : ''}${reward.starStone > 0 ? '、升星石x' + reward.starStone : ''}`)
  closeDetail()
}
</script>
<style scoped>
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
.progress-bar { width: 100%; background: rgba(255,255,255,0.1); border-radius: 999px; overflow: hidden; }
.progress-fill { height: 100%; transition: width 0.3s ease; border-radius: 999px; }
</style>