<script setup>
import { ref } from 'vue'

import { RES_CODE } from '@shared/rescode.js'

const files = ref([])
const errorMsg = ref('')
const dialogVisible = ref(false)

function showDialog(result) {
  files.value = result.files
  errorMsg.value = RES_CODE[result.code]
  dialogVisible.value = true
}

function clickFloder(path) {
  window.api.showItemInFolder(path)
}

defineExpose({ showDialog })
</script>

<template>
  <el-dialog
    v-model="dialogVisible"
    title="Shipping address"
    class="dialog"
    width="68%"
    append-to-body
  >
    <el-alert
      title="Operation Faild..."
      :description="errorMsg"
      type="warning"
      class="dialog-alert"
      :closable="false"
      show-icon
    />

    <el-table :data="files" style="width: 100%" :border="true" size="small" max-height="400px">
      <el-table-column property="name" label="Name" />
      <el-table-column property="destPath" label="Path" show-overflow-tooltip />
      <el-table-column property="error" label="Error" show-overflow-tooltip>
        <template #default="{ row }">
          {{ row.error }}
        </template>
      </el-table-column>
      <el-table-column label="ope" width="50" align="center">
        <template #default="{ row }">
          <div class="btns-wrap">
            <el-icon @click="clickFloder(row.destPath)"><FolderOpened /></el-icon>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <template #footer>
      <span class="dialog-footer">
        <el-button type="primary" @click="dialogVisible = false"> Back </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<style scoped lang="scss">
.dialog-alert {
  margin-bottom: 15px;
}

.btns-wrap {
  :deep(.el-icon) {
    width: 24px;
    height: 24px;
    cursor: pointer;
    &:hover {
      color: darkcyan;
    }
  }
}
</style>
