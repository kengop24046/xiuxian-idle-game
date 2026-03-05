<template>
  <div class="space-y-6">
    <div v-if="tip.show" class="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-lg" :class="tip.type === 'success' ? 'bg-success text-white' : 'bg-danger text-white'">
      {{ tip.msg }}
    </div>

    <div class="card">
      <h2 class="text-primary text-xl font-bold mb-4 text-center">转生系统</h2>
      <div class="bg-dark/50 rounded-lg p-4 mb-6 text-center">
        <p class="text-light/80">当前转生次数</p>
        <p class="text-primary text-4xl font-bold mt-2">{{ reincarnationCount }} 转</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div class="card">
          <h3 class="text-light/80 font-semibold mb-3">转生条件</h3>
          <div class="space-y-3">
            <div class="flex justify-between items-center">
              <span class="text-light/70">最低境界</span>
              <span :class="canReincarnate ? 'text-success' : 'text-light/60'">
                渡劫境10层
              </span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-light/70">当前境界</span>
              <span :class="currentRealmId >= REINCARNATION_CONFIG.unlockRealmId && currentLevel >= REINCARNATION_CONFIG.unlockLevel ? 'text-success' : 'text-danger'">
                {{ currentRealm.name }} {{ currentLevel }}层
              </span>
            </div>
          </div>
        </div>

        <div class="card">
          <h3 class="text-light/80 font-semibold mb-3">转生效果</h3>
          <p class="text-light/60 text-sm mb-3">转生后将重置境界为炼气境1层，但获得永久全局属性加成，大幅提升修炼与打怪效率</p>
          <div class="space-y-2">
            <div class="flex justify-between">
              <span class="text-light/70">攻击力加成</span>
              <span class="text-primary font-semibold">+{{ bonusPreview.attackBonus }}%（每转+10%）</span>
            </div>
            <div class="flex justify-between">
              <span class="text-light/70">气血上限加成</span>
              <span class="text-primary font-semibold">+{{ bonusPreview.hpBonus }}%（每转+10%）</span>
            </div>
            <div class="flex justify-between">
              <span class="text-light/70">防御力加成</span>
              <span class="text-primary font-semibold">+{{ bonusPreview.defenseBonus }}%（每转+10%）</span>
            </div>
            <div class="flex justify-between">
              <span class="text-light/70">修为获取加成</span>
              <span class="text-primary font-semibold">+{{ bonusPreview.expRateBonus }}%（每转+20%）</span>
            </div>
            <div class="flex justify-between">
              <span class="text-light/70">掉落概率加成</span>
              <span class="text-primary font-semibold">+{{ bonusPreview.dropRateBonus }}%（每转+5%）</span>
            </div>
            <div class="flex justify-between">
              <span class="text-light/70">额外属性点</span>
              <span class="text-primary font-semibold">{{ bonusPreview.extraAttributePoint }}点（每转+20点）</span>
            </div>
          </div>
        </div>
      </div>

      <div class="text-center">
        <button
          @click="handleReincarnation"
          class="w-full max-w-md btn-primary text-xl py-4"
          :disabled="!canReincarnate"
        >
          {{ canReincarnate ? `进行第${reincarnationCount + 1}次转生` : '未达到转生条件' }}
        </button>
        <p class="text-light/60 text-sm mt-3">
          注意：转生后将重置境界、等级、修为，保留金币、道具、装备、试炼最高层数，获得永久全局属性加成
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { checkCanReincarnate, doReincarnation, getReincarnationBonusPreview } from '@/game/reincarnation.js'
import { gameState, currentRealm } from '@/game/state.js'
import { REINCARNATION_CONFIG } from '@/game/config.js'

const tip = ref({ show: false, msg: '', type: '' })
const reincarnationCount = computed(() => gameState.reincarnationCount)
const currentRealmId = computed(() => gameState.currentRealmId)
const currentLevel = computed(() => gameState.currentLevel)
const canReincarnate = computed(() => checkCanReincarnate().can)
const bonusPreview = computed(() => getReincarnationBonusPreview())

const showTip = (success, msg) => {
  tip.value = { show: true, msg, type: success ? 'success' : 'error' }
  setTimeout(() => tip.value.show = false, 3000)
}

const handleReincarnation = () => {
  if (!confirm(`确定要进行第${reincarnationCount.value + 1}次转生吗？转生后将重置境界为炼气境1层，保留装备与道具，获得永久属性加成！`)) {
    return
  }
  const result = doReincarnation()
  result.success ? showTip(true, result.msg) : showTip(false, result.msg)
}
</script>