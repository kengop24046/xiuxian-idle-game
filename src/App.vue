<template>
  <div class="min-h-screen flex flex-col max-w-7xl mx-auto">
    <Header />
    <main class="flex-1 p-4 md:p-6">
      <CultivationPanel v-if="activeTab === 'cultivation'" />
      <CombatPanel v-else-if="activeTab === 'combat'" />
      <MapPanel v-else-if="activeTab === 'map'" />
      <EquipmentPanel v-else-if="activeTab === 'equipment'" />
      <AttributePanel v-else-if="activeTab === 'attribute'" />
      <TrialPanel v-else-if="activeTab === 'trial'" />
      <ShopPanel v-else-if="activeTab === 'shop'" />
      <ReincarnationPanel v-else-if="activeTab === 'reincarnation'" />
      <SavePanel v-else-if="activeTab === 'save'" />
    </main>
    <TabBar v-model:activeTab="activeTab" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import Header from '@/components/Header.vue'
import TabBar from '@/components/TabBar.vue'
import CultivationPanel from '@/components/CultivationPanel.vue'
import CombatPanel from '@/components/CombatPanel.vue'
import MapPanel from '@/components/MapPanel.vue'
import EquipmentPanel from '@/components/EquipmentPanel.vue'
import AttributePanel from '@/components/AttributePanel.vue'
import TrialPanel from '@/components/TrialPanel.vue'
import ShopPanel from '@/components/ShopPanel.vue'
import ReincarnationPanel from '@/components/ReincarnationPanel.vue'
import SavePanel from '@/components/SavePanel.vue'
import { initShop } from '@/game/shop.js'

const activeTab = ref('cultivation')
onMounted(() => initShop())
</script>