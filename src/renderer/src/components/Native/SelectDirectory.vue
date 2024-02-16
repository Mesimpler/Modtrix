<script setup>
const emit = defineEmits(['selected'])

async function openSelectDirectoryDialog() {
  const dir = await window.api.openDirectory()
  if (dir !== undefined) emit('selected', dir)
}
</script>

<template>
  <el-button icon="FolderOpened" size="small" @click="openSelectDirectoryDialog">
    <slot></slot>
  </el-button>
</template>
