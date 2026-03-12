<template>
  <div class="space-y-6">
    <div v-if="tip.show" class="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-lg" :class="tip.type === 'success' ? 'bg-success text-white' : 'bg-danger text-white'">
      {{ tip.msg }}
    </div>

    <div class="card">
      <h2 class="text-primary text-xl font-bold mb-4 text-center">存档管理</h2>
      <div class="bg-dark/50 rounded-lg p-4 mb-6">
        <p class="text-light/70 mb-2">上次保存时间</p>
        <p class="text-primary font-semibold">{{ new Date(lastSaveTime).toLocaleString() }}</p>
        <p class="text-light/60 text-sm mt-2">游戏默认每30秒自动保存一次，也可手动点击保存</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <button @click="handleManualSave" class="btn-primary py-4 text-lg">
          手动保存存档
        </button>
        <button @click="handleExportSave" class="btn-secondary py-4 text-lg">
          导出存档文件
        </button>
      </div>

      <div class="card mb-6">
        <h3 class="text-light/80 font-semibold mb-3">导入存档</h3>
        <p class="text-light/60 text-sm mb-3">选择之前导出的.json存档文件，导入后将覆盖当前游戏进度，请谨慎操作</p>
        <div class="flex flex-col md:flex-row gap-3">
          <input
            ref="importInput"
            type="file"
            accept=".json"
            class="file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-primary/20 file:text-primary hover:file:bg-primary/30 cursor-pointer"
            @change="handleImportSave"
          />
          <button @click="importInput.click()" class="btn-secondary flex-1">
            选择存档文件
          </button>
        </div>
      </div>

      <div class="card">
        <h3 class="text-danger font-semibold mb-3">重置游戏</h3>
        <p class="text-light/60 text-sm mb-3">此操作将清除所有游戏进度，包括境界、装备、道具、金币等，无法恢复，请谨慎操作</p>
        <button @click="handleResetGame" class="w-full btn-danger py-3">
          重置游戏，重新开始
        </button>
      </div>
    </div>

    <div class="card">
      <h3 class="text-primary text-lg font-semibold mb-3">游戏信息</h3>
      <div class="space-y-2">
        <div class="flex justify-between">
          <span class="text-light/70">游戏名称</span>
          <span class="text-light">修仙挂机录</span>
        </div>
        <div class="flex justify-between">
          <span class="text-light/70">游戏版本</span>
          <span class="text-light">1.1.0</span>
        </div>
        <div class="flex justify-between">
          <span class="text-light/70">技术栈</span>
          <span class="text-light">Vue3 + Vite + TailwindCSS</span>
        </div>
        <div class="flex justify-between">
          <span class="text-light/70">当前境界</span>
          <span class="text-primary">{{ currentRealm.name }} {{ currentLevel }}层</span>
        </div>
        <div class="flex justify-between">
          <span class="text-light/70">转生次数</span>
          <span class="text-purple-400">{{ reincarnationCount }} 转</span>
        </div>
        <div class="flex justify-between">
          <span class="text-light/70">总击杀怪物</span>
          <span class="text-red-400">{{ formatNumber(totalKillCount) }} 只</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { saveGame, resetGame, gameState, currentRealm } from '@/game/state.js'
import { exportSave, importSave } from '@/game/utils.js'
import { formatNumber } from '@/game/utils.js'

const tip = ref({ show: false, msg: '', type: '' })
const importInput = ref(null)
const lastSaveTime = computed(() => gameState.lastSaveTime)
const currentLevel = computed(() => gameState.currentLevel)
const reincarnationCount = computed(() => gameState.reincarnationCount)
const totalKillCount = computed(() => gameState.totalKillCount)

const showTip = (success, msg) => {
  tip.value = { show: true, msg, type: success ? 'success' : 'error' }
  setTimeout(() => tip.value.show = false, 3000)
}

const handleManualSave = () => {
  const result = saveGame()
  result ? showTip(true, '存档保存成功') : showTip(false, '存档保存失败')
}

const handleExportSave = () => {
  const result = exportSave()
  result ? showTip(true, '存档导出成功') : showTip(false, '存档导出失败')
}

const handleImportSave = async (e) => {
  const file = e.target.files[0]
  if (!file) return
  if (!confirm('导入存档将覆盖当前游戏进度，是否继续？')) {
    e.target.value = ''
    return
  }
  try {
    await importSave(file)
    showTip(true, '存档导入成功，游戏将刷新')
    setTimeout(() => window.location.reload(), 1000)
  } catch (err) {
    showTip(false, err.message)
  }
  e.target.value = ''
}

const handleResetGame = () => {
  if (!confirm('确定要重置游戏吗？所有进度将被清除，无法恢复！')) return
  resetGame()
  showTip(true, '游戏已重置，即将刷新页面')
  setTimeout(() => window.location.reload(), 1000)
}
</script>