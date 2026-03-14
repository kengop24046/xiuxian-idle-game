<template>
  <div class="card">
    <h2 class="text-primary text-xl font-bold mb-4 text-center">灵兽系统</h2>
    <div class="bg-dark/50 rounded-lg p-3 mb-4">
      <h3 class="font-bold mb-2">灵兽蛋</h3>
      <div class="grid grid-cols-3 gap-2">
        <div v-for="(count, type) in gameState.petEggs" :key="type" class="text-center">
          <p class="text-sm">{{ PET_EGG_CONFIG[type].name }}</p>
          <p class="text-primary font-bold">x{{ count }}</p>
          <button class="btn-primary text-xs w-full mt-1" :disabled="count<=0" @click="hatchEgg(type)">孵化</button>
        </div>
      </div>
    </div>
    <div v-if="currentPet" class="bg-primary/10 rounded-lg p-3 mb-4 text-center">
      <h3 class="font-bold">当前出战：{{ currentPet.config.name }}</h3>
      <p class="text-xs text-light/70 mt-1">类型：{{ petTypeMap[currentPet.config.type] }} | 资质：{{ currentPet.quality }}</p>
      <p class="text-xs mt-1">攻击：{{ formatNumber(currentPet.atk) }} | 气血：{{ formatNumber(currentPet.hp) }}</p>
      <p class="text-xs text-light/60 mt-1">技能：{{ currentPet.config.skill.name }} - {{ currentPet.config.skill.desc }}</p>
      <button class="btn-secondary text-sm mt-2" @click="setCurrentPet(null)">收回</button>
    </div>
    <div class="space-y-2">
      <h3 class="font-bold">我的灵兽</h3>
      <div v-if="gameState.pets.length===0" class="text-center py-4 text-light/60">暂无灵兽，孵化灵兽蛋获得</div>
      <div v-for="pet in gameState.pets" :key="pet.id" class="bg-dark/50 rounded-lg p-3 flex justify-between items-center">
        <div>
          <p class="font-bold">{{ PET_CONFIG[pet.configId].name }} · Lv.{{ pet.level }}</p>
          <p class="text-xs text-light/70">资质：{{ pet.quality }} | 类型：{{ petTypeMap[PET_CONFIG[pet.configId].type] }}</p>
        </div>
        <div class="flex gap-2">
          <button class="btn-primary text-xs" @click="setCurrentPet(pet.id)">出战</button>
          <button class="btn-secondary text-xs" @click="levelUpPet(pet.id)">升级</button>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { computed } from 'vue'
import { gameState, currentPet, hatchPetEgg, levelUpPet, setCurrentPet } from '@/game/state.js'
import { PET_CONFIG, PET_EGG_CONFIG } from '@/game/config.js'
import { formatNumber } from '@/game/utils.js'

const petTypeMap = { attack: '攻击', defense: '防御', support: '辅助' }
const hatchEgg = (type) => {
  const res = hatchPetEgg(type)
  if(res.success) alert(`孵化成功！获得${PET_CONFIG[res.pet.configId].name}`)
}
</script>