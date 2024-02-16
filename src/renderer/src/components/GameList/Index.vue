<script setup>
import _ from 'lodash'
import { useGameStore } from '@renderer/stores/game'

const gameStore = useGameStore()

function handleClickGame(game) {
  gameStore.setCurrentGame(game)
}

function handleRightClickGame(game) {
  gameStore.removeGame(game)
}
</script>

<template>
  <el-aside id="game-list" width="200px">
    <h2 class="game-list-tittle">Game List</h2>
    <ul class="game-list-inner">
      <li
        v-for="game in gameStore.games"
        :key="game.gameIno"
        @click="handleClickGame(game)"
        @click.right="handleRightClickGame(game)"
        class="game-list-item"
        :class="{ active: game.isCurrent }"
      >
        <img v-if="!_.isEmpty(game.gameIcon)" :src="game.gameIcon" />
        <span v-else>
          <el-icon><DocumentDelete /></el-icon>
        </span>
        <p>{{ game.gameName }}</p>
      </li>
    </ul>
  </el-aside>
</template>

<style scoped lang="scss">
#game-list {
  padding: 0 16px;
  background-color: var(--game-list-bg-color);
}

.game-list-tittle {
  font-size: 16px;
  font-weight: 400;
  line-height: 24px;
  margin-top: 44px;
  margin-bottom: 28px;
}

.game-list-inner {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.game-list-item {
  display: flex;
  align-items: center;
  border-radius: 3px;
  padding: 8px 10px;
  gap: 8px;
  cursor: pointer;
  > img {
    width: 24px;
    height: 24px;
    border-radius: 3px;
  }
  > span {
    width: 24px;
    height: 24px;
    display: grid;
    place-items: center;
    .el-icon {
      font-size: 16px;
    }
  }
  > p {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
  &.active {
    color: var(--el-color-primary);
    background-color: var(--game-list-item-hover-color);
  }
  &:hover {
    color: var(--el-color-primary);
    background-color: var(--game-list-item-hover-color);
  }
}
</style>
