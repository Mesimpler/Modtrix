<script setup>
import { onMounted } from 'vue'

import TittleBar from '@renderer/components/Native/TittleBar.vue'
import Asider from '@renderer/components/Asider/Index.vue'
import GameList from '@renderer/components/GameList/Index.vue'
import ModRepo from '@renderer/components/ModRepo/Index.vue'
import Floater from '@renderer/components/Floater/Index.vue'

import { useGameStore } from '@renderer/stores/game'
import { useModStore } from './stores/mod'

const gameStore = useGameStore()
const modStore = useModStore()

onMounted(async () => {
  await modStore.load({ autoSave: true, autoLoad: true })
  await gameStore.load({ autoSave: true })
})
</script>

<template>
  <TittleBar />
  <el-container>
    <Asider />
    <el-main>
      <el-container>
        <GameList />
        <ModRepo />
      </el-container>
    </el-main>
    <Floater />
  </el-container>
</template>
