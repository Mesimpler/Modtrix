<script setup>
import { useGameStore } from '@renderer/stores/game'
import { ElMessage } from 'element-plus'

const gameStore = useGameStore()

async function handleClickFloater() {
  let result
  if (gameStore.currentGame.gameSteamId) {
    result = await window.api.starBySteam(gameStore.currentGame.gameSteamId)
  } else {
    result = await window.api.starExe(gameStore.currentGame.gameExe)
  }
  if (result) {
    ElMessage({
      type: 'error',
      message: result
    })
  }
}
</script>

<template>
  <div id="floater" @click="handleClickFloater">
    <el-icon><Coordinate /></el-icon>
  </div>
</template>

<style scoped lang="scss">
#floater {
  bottom: 40px;
  right: 50px;
  position: absolute;
  display: grid;
  place-items: center;
  z-index: 1000;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: 1.4px solid var(--el-border-color);
  background-color: #fff;
  color: var(--el-text-color-secondary);
  cursor: pointer;
  &:hover {
    border: 1.4px solid var(--el-color-primary);
    color: var(--el-color-primary);
  }

  .el-icon {
    font-size: 24px;
    color: inherit;
  }
}
</style>
