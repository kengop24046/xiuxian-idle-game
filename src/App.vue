<template>
  <div class="min-h-screen flex flex-col max-w-7xl mx-auto bg-dark text-light">
    <Header />
    <OfflineRewardPopup />
    <main class="flex-1 p-4 md:p-6 pb-16 md:pb-18">
      <CultivationPanel v-if="activeTab === 'cultivation'" />
      <CombatPanel v-else-if="activeTab === 'combat'" @update:activeTab="activeTab = $event" />
      <MapPanel v-else-if="activeTab === 'map'" @update:activeTab="activeTab = 'combat'" />
      <EquipmentPanel v-else-if="activeTab === 'equipment'" />
      <BackpackPanel v-else-if="activeTab === 'backpack'" />
      <SetPanel v-else-if="activeTab === 'set'" />
      <PillPanel v-else-if="activeTab === 'pill'" />
      <SkillPanel v-else-if="activeTab === 'skill'" />
      <SectPanel v-else-if="activeTab === 'sect'" />
      <CavePanel v-else-if="activeTab === 'cave'" />
      <RootPanel v-else-if="activeTab === 'root'" />
      <SecretPanel v-else-if="activeTab === 'secret'" />
      <PetPanel v-else-if="activeTab === 'pet'" />
      <SkyTowerPanel v-else-if="activeTab === 'skyTower'" />
      <ArenaPanel v-else-if="activeTab === 'arena'" />
      <AscendPanel v-else-if="activeTab === 'ascend'" />
      <TrialPanel v-else-if="activeTab === 'trial'" />
      <IllustrationPanel v-else-if="activeTab === 'illustration'" />
      <AchievementPanel v-else-if="activeTab === 'achievement'" />
      <SignInPanel v-else-if="activeTab === 'signin'" />
      <ShopPanel v-else-if="activeTab === 'shop'" />
      <AttributePanel v-else-if="activeTab === 'attribute'" />
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
import OfflineRewardPopup from '@/components/OfflineRewardPopup.vue'
import CultivationPanel from '@/components/CultivationPanel.vue'
import CombatPanel from '@/components/CombatPanel.vue'
import MapPanel from '@/components/MapPanel.vue'
import EquipmentPanel from '@/components/EquipmentPanel.vue'
import BackpackPanel from '@/components/BackpackPanel.vue'
import SetPanel from '@/components/SetPanel.vue'
import PillPanel from '@/components/PillPanel.vue'
import SkillPanel from '@/components/SkillPanel.vue'
import SectPanel from '@/components/SectPanel.vue'
import CavePanel from '@/components/CavePanel.vue'
import RootPanel from '@/components/RootPanel.vue'
import SecretPanel from '@/components/SecretPanel.vue'
import PetPanel from '@/components/PetPanel.vue'
import SkyTowerPanel from '@/components/SkyTowerPanel.vue'
import ArenaPanel from '@/components/ArenaPanel.vue'
import AscendPanel from '@/components/AscendPanel.vue'
import TrialPanel from '@/components/TrialPanel.vue'
import IllustrationPanel from '@/components/IllustrationPanel.vue'
import AchievementPanel from '@/components/AchievementPanel.vue'
import SignInPanel from '@/components/SignInPanel.vue'
import ShopPanel from '@/components/ShopPanel.vue'
import AttributePanel from '@/components/AttributePanel.vue'
import ReincarnationPanel from '@/components/ReincarnationPanel.vue'
import SavePanel from '@/components/SavePanel.vue'
import { initShop } from '@/game/shop.js'

const activeTab = ref('cultivation')

onMounted(() => initShop())
</script>