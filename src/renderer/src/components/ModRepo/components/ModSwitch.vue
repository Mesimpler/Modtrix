<script setup>
import _ from 'lodash'
import { ref, watchEffect } from 'vue'
import { ElMessage } from 'element-plus'

import { useModStore } from '@renderer/stores/mod'
import { useGameStore } from '@renderer/stores/game'

import ResultFilesDialog from '@renderer/components/Dialogs/ResultDialog/Index.vue'

const props = defineProps({
  mod: {
    type: Object,
    required: true
  }
})

const value = ref(false)
const modStore = useModStore()
const gameStore = useGameStore()

const lodaing = ref(false)
const ResultFilesDialogRef = ref(null)

async function switchModStatus() {
  lodaing.value = true
  const operationFn = props.mod.modStatus ? modStore.deActiveMod : modStore.activeMod
  const result = await operationFn(gameStore.currentGame, _.cloneDeep(props.mod))

  return new Promise((resolve, reject) => {
    setTimeout(() => {
      lodaing.value = false
      if (result.code === 100) {
        ElMessage({
          message: 'operation success',
          type: 'success'
        })
        return resolve(true)
      } else {
        ResultFilesDialogRef.value.showDialog(result)
        return reject()
      }
    }, 500)
  })
}
</script>

<template>
  <el-switch v-bind="$attrs" size="small" :before-change="switchModStatus" :loading="lodaing" />
  <ResultFilesDialog ref="ResultFilesDialogRef" />
</template>

<style scoped lang="scss"></style>
