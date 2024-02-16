<script setup>
const emit = defineEmits(['selected'])

async function openSelectExeFileDialog() {
  const file = await window.api.openExeFile()
  if (file !== undefined) emit('selected', file)
}
</script>

<template>
  <el-button icon="FolderOpened" v-bind="$attrs" @click="openSelectExeFileDialog" />
</template>
