<template>
  <div class="card">
    <h2 class="text-primary text-xl font-bold mb-4 text-center">虚拟竞技场</h2>
    <div class="bg-primary/10 rounded-lg p-3 mb-4 text-center">
      <h3 class="font-bold">当前排名：{{ gameState.arenaRank }}</h3>
      <p class="text-sm text-light/70 mt-1">剩余挑战次数：{{ gameState.arenaChallengeTimes }}/{{ ARENA_CONFIG.challengeTimes }}</p>
      <p class="text-xs text-light/60 mt-1">赛季结束时间：{{ new Date(gameState.arenaSeasonEndTime).toLocaleDateString() }}</p>
    </div>
    <div class="space-y-2 mb-4">
      <h3 class="font-bold">可挑战对手</h3>
      <div v-for="opp in opponentList" :key="opp.rank" class="bg-dark/50 rounded-lg p-3 flex justify-between items-center">
        <div>
          <p class="font-bold">排名：{{ opp.rank }} | {{ opp.name }}</p>
          <p class="text-xs text-light/70">Lv.{{ opp.level }} | {{ REALM_CONFIG[opp.realmId-1]?.name }}</p>
        </div>
        <button class="btn-primary text-sm" :disabled="gameState.arenaChallengeTimes<=0" @click="handleBattle(opp)">挑战</button>
      </div>
    </div>
    <div class="bg-dark/50 rounded-lg p-3">
      <h3 class="font-bold mb-2">竞技场商店 | 竞技场币：{{ gameState.items.arenaCoin }}</h3>
      <div class="grid grid-cols-2 gap-2">
        <div v-for="item in ARENA_CONFIG.shopItems" :key="item.id" class="border rounded-lg p-2">
          <p class="text-sm font-bold">{{ item.name }}</p>
          <p class="text-xs text-primary">消耗：{{ item.cost }} 币</p>
          <button class="btn-primary text-xs w-full mt-1" :disabled="gameState.items.arenaCoin < item.cost" @click="buyItem(item)">购买</button>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, computed, onMounted } from 'vue'
import { gameState } from '@/game/state.js'
import { REALM_CONFIG, ARENA_CONFIG } from '@/game/config.js'
import { generateArenaOpponent, arenaBattle } from '@/game/combat.js'

const opponentList = ref([])
const refreshOpponent = () => {
  const ranks = [
    Math.max(1, gameState.arenaRank - 50),
    Math.max(1, gameState.arenaRank - 20),
    Math.max(1, gameState.arenaRank - 10),
    Math.max(1, gameState.arenaRank - 5),
  ]
  opponentList.value = ranks.map(r=>generateArenaOpponent(r))
}
const handleBattle = (opp) => {
  const res = arenaBattle(opp)
  if(res.win){
    alert('挑战胜利！排名提升')
    refreshOpponent()
  }else{
    alert('挑战失败')
  }
}
const buyItem = (item) => {
  if(gameState.items.arenaCoin < item.cost) return
  gameState.items.arenaCoin -= item.cost
  if(item.type==='petEgg') gameState.petEggs[item.eggType] +=1
  if(item.type==='pill') gameState.pills[item.pillId] +=1
  alert('购买成功')
}
onMounted(()=>refreshOpponent())
</script>