<template>
  <div class="space-y-6">
    <div v-if="tip.show" class="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-lg" :class="tip.type === 'success' ? 'bg-success text-white' : 'bg-danger text-white'">
      {{ tip.msg }}
    </div>

    <div class="card">
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
        <h2 class="text-primary text-xl font-bold">修仙商店</h2>
        <div class="flex items-center gap-3">
          <p class="text-yellow-400 font-semibold">金币：{{ formatNumber(gold) }}</p>
          <button
            @click="handleRefreshShop"
            class="btn-secondary text-sm"
          >
            刷新商店（{{ SHOP_CONFIG.refreshCost }}金币）
          </button>
        </div>
      </div>

      <div v-if="shopItems.length === 0" class="text-center py-8 text-light/60">
        <p>商店暂无商品，请刷新商店</p>
      </div>
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <div
          v-for="item in shopItems"
          :key="item.id"
          class="card flex flex-col"
        >
          <h3 class="text-lg font-semibold text-light mb-1">{{ item.name }}</h3>
          <p class="text-light/60 text-sm mb-3 flex-1">{{ item.desc }}</p>
          <div class="flex justify-between items-center mb-3">
            <span class="text-yellow-400 font-semibold">{{ item.price }} 金币</span>
            <span class="text-light/60 text-sm">库存：{{ item.currentStock }} / {{ item.limit }}</span>
          </div>
          <div class="flex gap-2">
            <button
              @click="handleBuyItem(item.id, 1)"
              class="flex-1 btn-primary"
              :disabled="item.currentStock < 1 || gold < item.price"
            >
              购买1个
            </button>
            <button
              @click="handleBuyItem(item.id, 10)"
              class="flex-1 btn-primary"
              :disabled="item.currentStock < 10 || gold < item.price * 10"
            >
              购买10个
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="card">
      <h2 class="text-primary text-xl font-bold mb-4">我的背包</h2>
      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        <div class="bg-dark/50 rounded-lg p-3">
          <p class="text-light/70 text-sm">强化石</p>
          <p class="text-primary text-2xl font-bold">{{ items.strengthenStone }}</p>
        </div>
        <div class="bg-dark/50 rounded-lg p-3">
          <p class="text-light/70 text-sm">升级石</p>
          <p class="text-blue-400 text-2xl font-bold">{{ items.upgradeStone }}</p>
        </div>
        <div class="bg-dark/50 rounded-lg p-3">
          <p class="text-light/70 text-sm">升星石</p>
          <p class="text-purple-400 text-2xl font-bold">{{ items.starStone }}</p>
        </div>
        <div class="bg-dark/50 rounded-lg p-3">
          <p class="text-light/70 text-sm">洗点水</p>
          <p class="text-green-400 text-2xl font-bold">{{ items.resetPill || 0 }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { refreshShop, buyShopItem } from '@/game/shop.js'
import { gameState } from '@/game/state.js'
import { SHOP_CONFIG } from '@/game/config.js'
import { formatNumber } from '@/game/utils.js'

const tip = ref({ show: false, msg: '', type: '' })
const shopItems = computed(() => gameState.shopItems)
const gold = computed(() => gameState.gold)
const items = computed(() => gameState.items)

const showTip = (success, msg) => {
  tip.value = { show: true, msg, type: success ? 'success' : 'error' }
  setTimeout(() => tip.value.show = false, 3000)
}

const handleRefreshShop = () => {
  const result = refreshShop()
  result.success ? showTip(true, result.msg) : showTip(false, result.msg)
}

const handleBuyItem = (itemId, count) => {
  const result = buyShopItem(itemId, count)
  result.success ? showTip(true, result.msg) : showTip(false, result.msg)
}
</script>