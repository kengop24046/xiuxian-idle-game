<template>
  <div class="space-y-6">
    <div v-if="tip.show" class="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-lg" :class="tip.type === 'success' ? 'bg-success text-white' : 'bg-danger text-white'">
      {{ tip.msg }}
    </div>

    <div class="card">
      <h2 class="text-primary text-xl font-bold mb-4 text-center">属性加点</h2>
      <div class="bg-dark/50 rounded-lg p-4 mb-6 text-center">
        <p class="text-light/80">剩余可分配属性点</p>
        <p class="text-primary text-4xl font-bold mt-2">{{ freeAttributePoint }}</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          v-for="attr in allAttributes"
          :key="attr.key"
          class="card flex flex-col"
        >
          <div class="flex justify-between items-center mb-2">
            <div>
              <h3 class="text-lg font-semibold text-light">{{ attr.name }}</h3>
              <p class="text-light/60 text-xs">{{ attr.desc }}</p>
            </div>
            <p class="text-primary text-2xl font-bold">{{ attr.value }}</p>
          </div>
          <div class="flex gap-2 mt-auto">
            <button
              @click="handleAssignPoint(attr.key, 1)"
              class="flex-1 btn-primary"
              :disabled="freeAttributePoint < 1"
            >
              +1点
            </button>
            <button
              @click="handleAssignPoint(attr.key, 5)"
              class="flex-1 btn-primary"
              :disabled="freeAttributePoint < 5"
            >
              +5点
            </button>
            <button
              @click="handleAssignPoint(attr.key, 10)"
              class="flex-1 btn-primary"
              :disabled="freeAttributePoint < 10"
            >
              +10点
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="card">
      <h2 class="text-primary text-xl font-bold mb-4 text-center">属性重置</h2>
      <div class="bg-dark/50 rounded-lg p-4">
        <div class="flex justify-between items-center mb-4">
          <div>
            <p class="text-light/80">洗点水数量</p>
            <p class="text-blue-400 font-semibold">{{ resetPillCount }} 个</p>
          </div>
          <button @click="$emit('update:activeTab', 'shop')" class="btn-secondary text-sm">
            去商店购买
          </button>
        </div>
        <p class="text-light/60 text-sm mb-4">使用洗点水可重置所有已分配的属性点，重新进行分配</p>
        <button
          @click="handleResetAttribute"
          class="w-full btn-danger"
          :disabled="resetPillCount < 1 || totalAssignedPoint < 1"
        >
          {{ totalAssignedPoint < 1 ? '暂无已分配属性点' : resetPillCount < 1 ? '洗点水不足' : '重置所有属性点' }}
        </button>
      </div>
    </div>

    <div class="card">
      <h2 class="text-primary text-xl font-bold mb-4 text-center">属性总览</h2>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div class="bg-dark/50 rounded-lg p-3">
          <p class="text-light/70 text-xs">攻击力</p>
          <p class="text-red-400 font-semibold">{{ formatNumber(playerAttr.attack) }}</p>
        </div>
        <div class="bg-dark/50 rounded-lg p-3">
          <p class="text-light/70 text-xs">防御力</p>
          <p class="text-blue-400 font-semibold">{{ formatNumber(playerAttr.defense) }}</p>
        </div>
        <div class="bg-dark/50 rounded-lg p-3">
          <p class="text-light/70 text-xs">暴击率</p>
          <p class="text-orange-400 font-semibold">{{ playerAttr.critRate.toFixed(2) }}%</p>
        </div>
        <div class="bg-dark/50 rounded-lg p-3">
          <p class="text-light/70 text-xs">闪避率</p>
          <p class="text-green-400 font-semibold">{{ playerAttr.dodgeRate.toFixed(2) }}%</p>
        </div>
        <div class="bg-dark/50 rounded-lg p-3">
          <p class="text-light/70 text-xs">暴击伤害</p>
          <p class="text-red-500 font-semibold">{{ (playerAttr.critDamage * 100).toFixed(0) }}%</p>
        </div>
        <div class="bg-dark/50 rounded-lg p-3">
          <p class="text-light/70 text-xs">修为加成</p>
          <p class="text-primary font-semibold">+{{ ((playerAttr.expRate - 1) * 100).toFixed(2) }}%</p>
        </div>
        <div class="bg-dark/50 rounded-lg p-3">
          <p class="text-light/70 text-xs">掉落加成</p>
          <p class="text-yellow-400 font-semibold">+{{ (playerAttr.dropRate * 100).toFixed(2) }}%</p>
        </div>
        <div class="bg-dark/50 rounded-lg p-3">
          <p class="text-light/70 text-xs">转生次数</p>
          <p class="text-purple-400 font-semibold">{{ reincarnationCount }} 转</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { getAllAttributes, assignAttributePoint, resetAttributePoints } from '@/game/attribute.js'
import { gameState, playerTotalAttribute } from '@/game/state.js'
import { formatNumber } from '@/game/utils.js'

const tip = ref({ show: false, msg: '', type: '' })
const allAttributes = getAllAttributes()

const freeAttributePoint = computed(() => gameState.freeAttributePoint)
const resetPillCount = computed(() => gameState.items.resetPill || 0)
const reincarnationCount = computed(() => gameState.reincarnationCount)
const playerAttr = computed(() => playerTotalAttribute.value)
const totalAssignedPoint = computed(() => allAttributes.reduce((sum, attr) => sum + attr.value, 0))

const showTip = (success, msg) => {
  tip.value = { show: true, msg, type: success ? 'success' : 'error' }
  setTimeout(() => tip.value.show = false, 3000)
}

const handleAssignPoint = (attrKey, count) => {
  const result = assignAttributePoint(attrKey, count)
  result.success ? showTip(true, result.msg) : showTip(false, result.msg)
}

const handleResetAttribute = () => {
  const result = resetAttributePoints()
  result.success ? showTip(true, result.msg) : showTip(false, result.msg)
}
</script>