<template>
  <div class="space-y-6">
    <div class="card">
      <h2 class="text-primary text-xl font-bold mb-4 text-center">每日签到</h2>
      <p class="text-center text-light/60 text-sm mb-4">累计签到天数：{{ signInData.totalSignDays }}天</p>
      <div class="grid grid-cols-7 gap-3">
        <div
          v-for="(reward, index) in SIGN_IN_CONFIG.rewardList"
          :key="index"
          class="bg-dark/50 rounded-lg p-3 text-center"
          :class="{
            'bg-primary/20 border-primary border': isToday(index + 1),
            'bg-green-500/20 border-green-500 border': isSigned(index + 1),
          }"
        >
          <p class="text-sm mb-2">第{{ index + 1 }}天</p>
          <div class="text-xs text-light/70 space-y-1 mb-3">
            <p v-for="(count, key) in reward.reward" :key="key">
              {{ itemNameMap[key] }} x{{ count }}
            </p>
          </div>
          <span
            v-if="isSigned(index + 1)"
            class="text-xs text-green-400"
          >
            已签到
          </span>
          <button
            v-else-if="isToday(index + 1) && !isSignedToday"
            class="btn-primary w-full text-xs py-1"
            @click="handleSignIn"
          >
            立即签到
          </button>
          <span v-else class="text-xs text-light/40">未解锁</span>
        </div>
      </div>
    </div>

    <div class="card">
      <h2 class="text-primary text-xl font-bold mb-4 text-center">在线奖励</h2>
      <p class="text-center text-light/60 text-sm mb-4">今日在线时长：{{ todayOnlineTime }}分钟</p>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div
          v-for="(reward, index) in ONLINE_REWARD_CONFIG"
          :key="index"
          class="bg-dark/50 rounded-lg p-3 text-center"
          :class="isRewardClaimed(index) ? 'bg-green-500/20 border-green-500 border' : ''"
        >
          <p class="font-semibold mb-2">{{ reward.minute }}分钟</p>
          <div class="text-xs text-light/70 space-y-1 mb-3">
            <p v-for="(count, key) in reward.reward" :key="key">
              {{ itemNameMap[key] }} x{{ count }}
            </p>
          </div>
          <button
            v-if="canClaimReward(index) && !isRewardClaimed(index)"
            class="btn-primary w-full text-xs py-1"
            @click="claimOnlineReward(index)"
          >
            领取
          </button>
          <button
            v-else-if="!canClaimReward(index)"
            class="btn-secondary w-full text-xs py-1 opacity-50"
            disabled
          >
            未达成
          </button>
          <span v-else class="text-xs text-green-400">已领取</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { SIGN_IN_CONFIG, ONLINE_REWARD_CONFIG } from '@/game/config.js'
import { gameState, saveGame } from '@/game/state.js'

const itemNameMap = {
  gold: '金币',
  strengthenStone: '强化石',
  upgradeStone: '升级石',
  starStone: '升星石',
  expPill: '修为丹',
  superExpPill: '超级修为丹',
  attackPill: '攻击丹',
  defensePill: '防御丹',
  resetPill: '洗髓丹',
}

const signInData = computed(() => gameState.signInData)
const onlineData = computed(() => gameState.onlineData)
const todayOnlineTime = computed(() => onlineData.value.todayOnlineTime)

const getTodayDate = () => {
  return new Date().toLocaleDateString()
}

const isToday = (day) => {
  return day === (signInData.value.cycleSignDays % 7) + 1
}

const isSigned = (day) => {
  return day <= signInData.value.cycleSignDays % 7 || (signInData.value.cycleSignDays >= 7 && day <= 7)
}

const isSignedToday = computed(() => {
  return signInData.value.lastSignDate === getTodayDate()
})

const handleSignIn = () => {
  if (isSignedToday.value) return
  const today = getTodayDate()
  gameState.signInData.lastSignDate = today
  gameState.signInData.totalSignDays += 1
  gameState.signInData.cycleSignDays += 1

  const day = (gameState.signInData.cycleSignDays - 1) % 7
  const reward = SIGN_IN_CONFIG.rewardList[day].reward
  Object.keys(reward).forEach(key => {
    if (key === 'gold') {
      gameState.gold += reward[key]
    } else if (gameState.items[key] !== undefined) {
      gameState.items[key] += reward[key]
    } else if (gameState.pills[key] !== undefined) {
      gameState.pills[key] += reward[key]
    }
  })

  saveGame()
}

const canClaimReward = (index) => {
  return todayOnlineTime.value >= ONLINE_REWARD_CONFIG[index].minute
}

const isRewardClaimed = (index) => {
  return onlineData.value.claimedRewards.includes(index)
}

const claimOnlineReward = (index) => {
  if (!canClaimReward(index) || isRewardClaimed(index)) return
  const reward = ONLINE_REWARD_CONFIG[index].reward

  Object.keys(reward).forEach(key => {
    if (key === 'gold') {
      gameState.gold += reward[key]
    } else if (gameState.items[key] !== undefined) {
      gameState.items[key] += reward[key]
    } else if (gameState.pills[key] !== undefined) {
      gameState.pills[key] += reward[key]
    }
  })

  gameState.onlineData.claimedRewards.push(index)
  saveGame()
}

onMounted(() => {
  const today = getTodayDate()
  if (signInData.value.lastSignDate !== today) {
    gameState.onlineData.todayOnlineTime = 0
    gameState.onlineData.claimedRewards = []
  }
})
</script>