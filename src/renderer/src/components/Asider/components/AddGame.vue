<script setup>
import ConfigDialog from '@renderer/components/Dialogs/ConfigDialog/Index.vue'
</script>

<template>
  <ConfigDialog active-tab-name="GameSetting" v-slot="slotProps">
    <el-icon @click="slotProps.openDialog">
      <CirclePlus />
    </el-icon>
  </ConfigDialog>
</template>
