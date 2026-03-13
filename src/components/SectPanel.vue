<template>
  <div class="card">
    <h2 class="text-primary text-xl font-bold mb-4 text-center">宗门</h2>

    <div v-if="gameState.sect.id === 0" class="space-y-3">
      <p class="text-center text-light/70">请选择一个宗门加入</p>
      <div
        v-for="s in SECT_CONFIG"
        :key="s.id"
        class="bg-dark/50 rounded-lg p-3"
      >
        <div class="font-bold">{{ s.name }}</div>
        <p class="text-xs text-light/70 my-1">类型：{{ SECT_TYPE_MAP[s.type] }}</p>
        <p class="text-xs text-light/60 mb-2">解锁要求：{{ s.unlockRealm }} 境界</p>
        <button
          class="btn-primary w-full mt-2"
          :disabled="gameState.currentRealmId < s.unlockRealm"
          @click="joinSect(s.id)"
        >
          {{ gameState.currentRealmId < s.unlockRealm ? '境界不足' : '加入宗门' }}
        </button>
      </div>
    </div>

    <div v-else class="space-y-3">
      <div class="bg-primary/10 rounded-lg p-3 text-center">
        <div class="font-bold text-lg">{{ gameState.sect.name }}</div>
        <div class="text-xs mt-1">宗门类型：{{ currentSectType }}</div>
        <div class="text-xs mt-1">宗门职位：{{ SECT_RANK[gameState.sect.rank] }}</div>
        <div class="text-xs mt-1">宗门贡献：{{ gameState.sect.contrib }}</div>
      </div>

      <div class="bg-dark/50 rounded-lg p-3">
        <div class="font-bold mb-2">每日任务</div>
        <div class="text-xs">
          {{ taskDesc }} ({{ gameState.sect.taskProgress }}/{{ taskTarget }})
        </div>
        <button
          class="btn-primary w-full mt-2"
          :disabled="gameState.sect.taskProgress < taskTarget"
          @click="getTaskReward"
        >
          领取奖励
        </button>
      </div>

      <button class="btn-secondary w-full" @click="leaveSect">退出宗门</button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { gameState, saveGame } from '@/game/state.js'
import { SECT_CONFIG, SECT_RANK } from '@/game/config.js'

const SECT_TYPE_MAP = {
  attack: '攻击',
  pill: '丹药',
  defense: '防御'
}

const currentSectType = computed(() => {
  const currentSect = SECT_CONFIG.find(s => s.id === gameState.sect.id)
  if (!currentSect) return ''
  return SECT_TYPE_MAP[currentSect.type] || ''
})

const joinSect = (id) => {
  const sect = SECT_CONFIG.find(x => x.id === id)
  if (gameState.currentRealmId < sect.unlockRealm) {
    alert(`境界不足，需要达到${sect.unlockRealm}境界才能加入${sect.name}`)
    return
  }
  gameState.sect = {
    id,
    name: sect.name,
    rank: 0,
    contrib: 0,
    dailyTask: sect.tasks[0],
    taskProgress: 0
  }
  saveGame()
}

const leaveSect = () => {
  if (!confirm('确定要退出宗门吗？退出后贡献和任务进度将清空')) return
  gameState.sect = { id: 0, name: '', rank: 0, contrib: 0, dailyTask: null, taskProgress: 0 }
  saveGame()
}

const taskDesc = computed(() => {
  const t = gameState.sect.dailyTask
  if (!t) return '无任务'
  return t.type === 'kill' ? '击杀怪物' : '提交材料'
})

const taskTarget = computed(() => {
  return gameState.sect.dailyTask?.target || 0
})

const getTaskReward = () => {
  const task = gameState.sect.dailyTask
  if (!task || gameState.sect.taskProgress < task.target) return
  const addContrib = task.reward?.sectContrib || 20
  gameState.sect.contrib += addContrib
  gameState.sect.taskProgress = 0
  saveGame()
  alert(`领取成功！获得宗门贡献 x${addContrib}`)
}
</script>

<style scoped>
</style>