<script setup>
import { ref, watch, watchEffect } from 'vue'
import { filesize } from 'filesize'
import _ from 'lodash'

import RepoSetting from './components/RepoSetting.vue'
import ModTags from './components/ModTags.vue'
import ModSwitch from './components/ModSwitch.vue'

import { useModStore } from '@renderer/stores/mod'
import { useGameStore } from '@renderer/stores/game'

const modStore = useModStore()
const gameStore = useGameStore()

const search = ref('')
const tableData = ref([])

function filterMods() {
  const filterData = modStore.currentGameMods.filter((m) => {
    const modNameMatch =
      !search.value || m.modName.toLowerCase().includes(search.value.toLowerCase())
    const modTagsMatch =
      m.modTags && m.modTags.some((tag) => tag.toLowerCase().includes(search.value.toLowerCase()))
    return modNameMatch || modTagsMatch
  })
  tableData.value = filterData
}
const debouncedSearch = _.debounce(() => {
  filterMods()
}, 500)
watch(
  search,
  () => {
    debouncedSearch()
  },
  { immediate: true }
)
watch(
  () => modStore.currentGameMods,
  () => {
    filterMods()
  }
)

async function handleClickRefresh() {
  await modStore.loadGameMods(gameStore.currentGame, { force: true })
}

function updateModTags(mod, newTags) {
  modStore.modifyMod(gameStore.currentGame, mod, {
    ...mod,
    modTags: newTags
  })
}
</script>

<template>
  <el-main id="modrepo">
    <div class="modrepo-header">
      <h4 class="modrepo-header-tittle">Mod Repo</h4>
      <div class="modrepo-header-btns">
        <el-input
          v-model="search"
          clearable
          size="small"
          placeholder="Type to search"
          style="width: 150px"
        />
        <el-icon @click="handleClickRefresh"><Refresh /></el-icon>
        <RepoSetting />
      </div>
    </div>
    <el-table
      :data="tableData"
      :border="true"
      style="width: 100%"
      max-height="635px"
      v-loading="modStore.dataLoading"
    >
      <el-table-column prop="modName" label="Name" />
      <el-table-column prop="modSize" label="Size" width="120px">
        <template #default="{ row }">
          {{ filesize(row.modSize, { standard: 'jedec' }) }}
        </template>
      </el-table-column>
      <el-table-column prop="modTags" label="Tags">
        <template #default="{ row }">
          <ModTags
            :tags="row.modTags || []"
            @update-tags="(newTags) => updateModTags(row, newTags)"
          />
        </template>
      </el-table-column>
      <el-table-column prop="modStatus" label="Status" width="64px" :align="'center'">
        <template #default="{ row }">
          <ModSwitch :value="row.modStatus" size="small" :mod="row" />
        </template>
      </el-table-column>
    </el-table>
  </el-main>
</template>

<style scoped lang="scss">
#modrepo {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 0 16px;
}
.modrepo-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 44px 0 12px 0;
  border-bottom: 2px solid rgba(0, 0, 0, 0.1);
}
.modrepo-header-tittle {
  font-size: 16px;
  font-weight: 400;
  line-height: 24px;
}
.modrepo-header-btns {
  padding: 0 12px;
  display: flex;
  align-items: center;
  gap: 20px;
  :deep(.el-icon) {
    cursor: pointer;
    &:hover {
      color: var(--el-color-primary);
    }
  }
}

// :deep(.el-input__wrapper) {
//   position: relative;
//   .el-input__inner {
//     padding-right: 18px;
//   }
//   .el-input__suffix {
//     position: absolute;
//     right: 8px;
//     top: 50%;
//     transform: translateY(-50%);
//   }
// }
</style>
