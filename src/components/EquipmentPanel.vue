<template>
  <div class="space-y-6">
    <div v-if="tip.show" class="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-lg" :class="tip.type === 'success' ? 'bg-success text-white' : 'bg-danger text-white'">
      {{ tip.msg }}
    </div>
    <div class="card">
      <h2 class="text-primary text-xl font-bold mb-4 text-center">穿戴装备</h2>
      <div class="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-3">
        <div
          v-for="part in EQUIPMENT_CONFIG.parts"
          :key="part.id"
          class="card p-3 text-center flex flex-col items-center"
        >
          <p class="text-light/70 text-xs mb-2">{{ part.name }}</p>
          <div
            v-if="equippedEquipments[part.id]"
            class="w-full aspect-square rounded-lg border-2 flex flex-col items-center justify-center mb-2 cursor-pointer hover:scale-105 transition-all"
            :class="equippedEquipments[part.id].qualityColor"
            @click="selectEquipment(equippedEquipments[part.id])"
          >
            <p class="text-xs font-bold line-clamp-1">{{ equippedEquipments[part.id].name }}</p>
            <p class="text-[10px] opacity-80">{{ equippedEquipments[part.id].qualityName }}</p>
          </div>
          <div v-else class="w-full aspect-square rounded-lg border-2 border-dashed border-light/20 flex items-center justify-center mb-2">
            <span class="text-light/30 text-xs">空</span>
          </div>
          <p class="text-[10px] text-light/50">Lv.{{ equippedEquipments[part.id]?.level || 0 }}</p>
        </div>
      </div>
    </div>
    <div v-if="selectedEquipment" class="card">
      <h2 class="text-primary text-xl font-bold mb-4 text-center">装备详情</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <div class="rounded-lg border-2 p-4 text-center mb-4" :class="selectedEquipment.qualityColor">
            <h3 class="text-xl font-bold">{{ selectedEquipment.name }}</h3>
            <p class="text-sm">{{ selectedEquipment.qualityName }} · {{ selectedEquipment.partName }}</p>
            <div class="flex justify-center gap-4 mt-2 text-sm">
              <span>Lv.{{ selectedEquipment.level }}</span>
              <span>+{{ selectedEquipment.strengthenLevel }} 强化</span>
              <span>{{ selectedEquipment.star }}★</span>
            </div>
            <p class="text-xs mt-2" :class="isCurrentEquipped ? 'text-primary' : 'text-light/70'">
              {{ isCurrentEquipped ? '【当前已穿戴】' : compareTipText }}
            </p>
          </div>
          <div class="bg-dark/50 rounded-lg p-3 mb-4">
            <h4 class="text-light/80 font-semibold mb-2">
              装备属性
              <span v-if="!isCurrentEquipped" class="text-xs text-light/60 ml-2">（与当前穿戴对比）</span>
            </h4>
            <div class="space-y-2">
              <div
                v-for="(value, key) in equipmentFinalAttr"
                :key="key"
                class="flex justify-between items-center"
              >
                <span class="text-light/70 text-sm">{{ attrNameMap[key] }}</span>
                <div class="flex items-center gap-2">
                  <span class="text-primary font-semibold">+{{ formatNumber(value) }}</span>
                  <span
                    v-if="!isCurrentEquipped"
                    class="text-xs font-bold"
                    :class="attrDifference[key] >= 0 ? 'text-green-400' : 'text-red-400'"
                  >
                    {{ attrDifference[key] >= 0 ? '+' : '' }}{{ formatNumber(attrDifference[key]) }}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div class="flex gap-2">
            <button
              v-if="!isCurrentEquipped"
              @click="handleWearEquipment"
              class="flex-1 btn-primary"
            >
              穿戴
            </button>
            <button
              v-else
              @click="handleUnwearEquipment"
              class="flex-1 btn-secondary"
            >
              卸下
            </button>
            <button @click="handleDecomposeEquipment" class="btn-danger">
              分解
            </button>
          </div>
        </div>
        <div class="space-y-4">
          <div class="bg-dark/50 rounded-lg p-3">
            <h4 class="text-light/80 font-semibold mb-2">强化（当前 +{{ selectedEquipment.strengthenLevel }} / {{ EQUIPMENT_CONFIG.strengthen.maxLevel }}）</h4>
            <p class="text-light/60 text-xs mb-2">每级强化增加10%基础属性，强化等级不随装备升级重置</p>
            <div class="flex justify-between items-center mb-2">
              <span class="text-sm text-light/70">消耗：</span>
              <span class="text-sm" :class="strengthenStone >= strengthenCost ? 'text-light' : 'text-danger'">
                强化石 x{{ strengthenCost }}（当前：{{ strengthenStone }}）
              </span>
            </div>
            <button
              @click="handleStrengthenEquipment"
              class="w-full btn-primary"
              :disabled="selectedEquipment.strengthenLevel >= EQUIPMENT_CONFIG.strengthen.maxLevel || strengthenStone < strengthenCost"
            >
              强化装备
            </button>
          </div>
          <div class="bg-dark/50 rounded-lg p-3">
            <h4 class="text-light/80 font-semibold mb-2">升级（当前 Lv.{{ selectedEquipment.level }}）</h4>
            <p class="text-light/60 text-xs mb-2">提升装备等级，增加基础属性上限</p>
            <div class="flex justify-between items-center mb-2">
              <span class="text-sm text-light/70">消耗：</span>
              <span class="text-sm" :class="upgradeStone >= upgradeCost ? 'text-light' : 'text-danger'">
                升级石 x{{ upgradeCost }}（当前：{{ upgradeStone }}）
              </span>
            </div>
            <button
              @click="handleUpgradeEquipment"
              class="w-full btn-primary"
              :disabled="upgradeStone < upgradeCost"
            >
              升级装备
            </button>
          </div>
          <div class="bg-dark/50 rounded-lg p-3">
            <h4 class="text-light/80 font-semibold mb-2">升星（当前 {{ selectedEquipment.star }}★ / {{ EQUIPMENT_CONFIG.starUp.maxStar }}★）</h4>
            <p class="text-light/60 text-xs mb-2">每星增加15%总属性，提升巨大</p>
            <div class="flex justify-between items-center mb-2">
              <span class="text-sm text-light/70">消耗：</span>
              <span class="text-sm" :class="starStone >= starCost ? 'text-light' : 'text-danger'">
                升星石 x{{ starCost }}（当前：{{ starStone }}）
              </span>
            </div>
            <button
              @click="handleStarUpEquipment"
              class="w-full btn-primary"
              :disabled="selectedEquipment.star >= EQUIPMENT_CONFIG.starUp.maxStar || starStone < starCost"
            >
              升星装备
            </button>
          </div>
        </div>
      </div>
    </div>
    <div class="card">
      <h2 class="text-primary text-xl font-bold mb-4 text-center">背包装备</h2>
      <div v-if="bagEquipments.length === 0" class="text-center py-8 text-light/60">
        <p>背包暂无装备，打怪可掉落装备</p>
      </div>
      <div v-else class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <div
          v-for="equipment in bagEquipments"
          :key="equipment.id"
          class="rounded-lg border-2 p-2 cursor-pointer hover:scale-105 transition-all"
          :class="selectedEquipment?.id === equipment.id ? 'border-primary bg-primary/10' : equipment.qualityColor"
          @click="selectEquipment(equipment)"
        >
          <p class="text-sm font-bold line-clamp-1">{{ equipment.name }}</p>
          <p class="text-[10px] opacity-80">{{ equipment.qualityName }}</p>
          <div class="flex justify-between text-[10px] mt-1">
            <span>Lv.{{ equipment.level }}</span>
            <span>+{{ equipment.strengthenLevel }}</span>
            <span>{{ equipment.star }}★</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, computed } from 'vue'
import { wearEquipment, unwearEquipment, decomposeEquipment, strengthenEquipment, upgradeEquipment, starUpEquipment, calculateEquipmentAttr } from '@/game/equipment.js'
import { gameState } from '@/game/state.js'
import { EQUIPMENT_CONFIG } from '@/game/config.js'
import { formatNumber } from '@/game/utils.js'

const attrNameMap = {
  attack: '攻击力', hp: '气血上限', defense: '防御力', power: '力量',
  constitution: '体质', agility: '身法', comprehension: '悟性', luck: '福缘',
}

const tip = ref({ show: false, msg: '', type: '' })
const selectedEquipment = ref(null)

const equippedEquipments = computed(() => gameState.equippedEquipments)
const bagEquipments = computed(() => gameState.bagEquipments)
const strengthenStone = computed(() => Number(gameState.items.strengthenStone) || 0)
const upgradeStone = computed(() => Number(gameState.items.upgradeStone) || 0)
const starStone = computed(() => Number(gameState.items.starStone) || 0)

const isCurrentEquipped = computed(() => {
  if (!selectedEquipment.value) return false
  const equip = equippedEquipments.value[selectedEquipment.value.partId]
  return equip?.id === selectedEquipment.value.id
})

const currentEquippedCompare = computed(() => {
  if (!selectedEquipment.value) return null
  return equippedEquipments.value[selectedEquipment.value.partId] || null
})

const equippedCompareAttr = computed(() => {
  if (!currentEquippedCompare.value) return {}
  return calculateEquipmentAttr(currentEquippedCompare.value)
})

const attrDifference = computed(() => {
  const diff = {}
  const selectAttr = equipmentFinalAttr.value
  const equipAttr = equippedCompareAttr.value

  Object.keys(attrNameMap).forEach(key => {
    const selectValue = selectAttr[key] || 0
    const equipValue = equipAttr[key] || 0
    diff[key] = selectValue - equipValue
  })
  return diff
})

const compareTipText = computed(() => {
  if (!currentEquippedCompare.value) return '【该部位暂无穿戴装备】'
  const selectAttack = equipmentFinalAttr.value.attack || 0
  const equipAttack = equippedCompareAttr.value.attack || 0
  if (selectAttack > equipAttack) return '【攻击提升，推荐穿戴】'
  if (selectAttack < equipAttack) return '【攻击下降，谨慎穿戴】'
  return '【属性持平】'
})

const selectEquipment = (equipment) => {
  selectedEquipment.value = equipment ? JSON.parse(JSON.stringify(equipment)) : null
}

const equipmentFinalAttr = computed(() => {
  if (!selectedEquipment.value) return {}
  return calculateEquipmentAttr(selectedEquipment.value)
})

const strengthenCost = computed(() => {
  if (!selectedEquipment.value) return 0
  const { strengthen } = EQUIPMENT_CONFIG
  const { strengthenLevel, qualityId } = selectedEquipment.value
  return Math.floor(strengthen.baseCost * (qualityId + 1) * Math.pow(1.5, strengthenLevel))
})
const upgradeCost = computed(() => {
  if (!selectedEquipment.value) return 0
  const { qualityId, level } = selectedEquipment.value
  return Math.floor(2 * (qualityId + 1) * Math.pow(1.6, level - 1))
})
const starCost = computed(() => {
  if (!selectedEquipment.value) return 0
  const { starUp } = EQUIPMENT_CONFIG
  const { star, qualityId } = selectedEquipment.value
  return Math.floor(starUp.baseCost * (qualityId + 1) * Math.pow(2, star))
})

const showTip = (success, msg) => {
  tip.value = { show: true, msg, type: success ? 'success' : 'error' }
  setTimeout(() => tip.value.show = false, 3000)
}

const handleWearEquipment = () => {
  if (!selectedEquipment.value) return
  const result = wearEquipment(selectedEquipment.value)
  if (result) {
    showTip(true, '装备穿戴成功')
    selectEquipment(equippedEquipments.value[selectedEquipment.value.partId])
  } else {
    showTip(false, '装备穿戴失败')
  }
}

const handleUnwearEquipment = () => {
  if (!selectedEquipment.value) return
  const result = unwearEquipment(selectedEquipment.value.partId)
  if (result) {
    showTip(true, '装备卸下成功')
    selectedEquipment.value = null
  } else {
    showTip(false, '装备卸下失败')
  }
}

const handleDecomposeEquipment = () => {
  if (!selectedEquipment.value) return
  const result = decomposeEquipment(selectedEquipment.value.id)
  if (result.success) {
    let rewardMsg = '分解成功，获得'
    if (result.reward.strengthenStone > 0) rewardMsg += `强化石x${result.reward.strengthenStone} `
    if (result.reward.upgradeStone > 0) rewardMsg += `升级石x${result.reward.upgradeStone} `
    if (result.reward.starStone > 0) rewardMsg += `升星石x${result.reward.starStone}`
    showTip(true, rewardMsg)
    selectedEquipment.value = null
  } else {
    showTip(false, result.msg)
  }
}

const handleStrengthenEquipment = () => {
  if (!selectedEquipment.value) return
  const result = strengthenEquipment(selectedEquipment.value)
  if (result.success) {
    showTip(true, `强化成功！强化等级+${result.newLevel}`)
    selectEquipment(result.updatedEquipment)
  } else {
    showTip(false, result.msg)
  }
}

const handleUpgradeEquipment = () => {
  if (!selectedEquipment.value) return
  const result = upgradeEquipment(selectedEquipment.value)
  if (result.success) {
    showTip(true, `升级成功！装备等级提升至${result.newLevel}级`)
    selectEquipment(result.updatedEquipment)
  } else {
    showTip(false, result.msg)
  }
}

const handleStarUpEquipment = () => {
  if (!selectedEquipment.value) return
  const result = starUpEquipment(selectedEquipment.value)
  if (result.success) {
    showTip(true, `升星成功！装备星级提升至${result.newStar}星`)
    selectEquipment(result.updatedEquipment)
  } else {
    showTip(false, result.msg)
  }
}
</script>