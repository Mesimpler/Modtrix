<script setup>
import ConfigDialog from '@renderer/components/Dialogs/ConfigDialog/Index.vue'

import { useGameStore } from '@renderer/stores/game'

const gameStore = useGameStore()
</script>

<template>
  <ConfigDialog
    active-tab-name="ModRepoSetting"
    :formData="gameStore.currentGame"
    v-slot="slotProps"
  >
    <el-icon @click="slotProps.openDialog">
      <Setting />
    </el-icon>
  </ConfigDialog>
</template>
