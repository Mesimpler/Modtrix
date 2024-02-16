<script setup>
import _ from 'lodash'
import { ref, reactive, computed } from 'vue'

import SelectDirectory from '@renderer/components/Native/SelectDirectory.vue'
import SelectExeFile from '@renderer/components/Native/SelectExeFile.vue'

import { MODREPO_DEFAULT_CONFIGS } from '@shared/config'

import { useGameStore } from '@renderer/stores/game'
import { ElMessage } from 'element-plus'

import { useModStore } from '@renderer/stores/mod'
const modStore = useModStore()

const props = defineProps({
  formData: {
    type: Object,
    default: () => {
      return {}
    }
  },
  activeTabName: {
    type: String,
    required: true
  }
})

const dialogVisible = ref(false)
const _activeTabName = ref('GameSetting')
const formRef = ref(null)
const form = ref({
  modRepoSetting: MODREPO_DEFAULT_CONFIGS
})
const isEdit = computed(() => !_.isEmpty(props.formData))
const showAdvanced = ref(false)
const gameStore = useGameStore()
const GameSettingFormItemLabelWidth = 120
const ModRepoSettingFormItemLabelWidth = 150

const emptyValid = { required: true, message: 'can not empty', trigger: 'blur' }
const rules = reactive({
  gameRoot: [emptyValid],
  gameExe: [emptyValid],
  gameName: [emptyValid]
})

function openDialog() {
  _activeTabName.value = _.cloneDeep(props.activeTabName)
  if (!_.isEmpty(props.formData)) {
    form.value = props.formData
  }
  dialogVisible.value = true
}

function closeDialog() {
  dialogVisible.value = false
}

function resetDialog() {
  if (formRef.value) {
    formRef.value.resetFields()
    form.value = {
      modRepoSetting: {
        ...MODREPO_DEFAULT_CONFIGS
      }
    }
  }
}

async function handleGameRootSelected(dir) {
  form.value.gameRoot = dir.path
  form.value.gameName = dir.path.split('\\').pop()
  form.value.gameIno = dir.stats.ino.toString()
}
async function handleGameExeSelected(file) {
  form.value.gameExe = file.path
  form.value.gameIcon = file.icon
}

function handleModRepoSelected(dir) {
  form.value.modRepoSetting.repoRoot = dir.path
}

function handleFormSubmit() {
  const submitFn = isEdit.value ? gameStore.modifyGame : gameStore.addGame
  try {
    submitFn(_.cloneDeep(form.value))
    if (isEdit) modStore.loadGameMods(_.cloneDeep(form.value), { force: true })
    closeDialog()
  } catch (error) {
    ElMessage({
      type: 'error',
      message: error
    })
  }
}
</script>

<template>
  <slot :openDialog="openDialog"></slot>
  <el-dialog v-model="dialogVisible" @closed="resetDialog" top="15vh" width="67vw" append-to-body>
    <el-form
      ref="formRef"
      :rules="rules"
      :model="form"
      label-position="left"
      :hide-required-asterisk="true"
    >
      <el-tabs v-model="_activeTabName">
        <el-tab-pane label="Game Setting" name="GameSetting">
          <el-form-item
            label="Game Root:"
            prop="gameRoot"
            :label-width="GameSettingFormItemLabelWidth"
          >
            <el-input v-model="form.gameRoot" :readonly="true" size="small" :disabled="isEdit">
              <template #append>
                <SelectDirectory
                  size="small"
                  @selected="handleGameRootSelected"
                  :disabled="isEdit"
                />
              </template>
            </el-input>
          </el-form-item>
          <el-form-item
            label="Game Exe:"
            :readonly="true"
            prop="gameExe"
            :label-width="GameSettingFormItemLabelWidth"
          >
            <el-input v-model="form.gameExe" size="small">
              <template #append>
                <SelectExeFile size="small" @selected="handleGameExeSelected" />
              </template>
            </el-input>
          </el-form-item>
          <el-form-item
            label="Game Name:"
            prop="gameName"
            :label-width="GameSettingFormItemLabelWidth"
          >
            <el-input v-model="form.gameName" size="small" :spellcheck="false" />
          </el-form-item>
          <div v-if="showAdvanced">
            <el-form-item prop="gameSteamId" :label-width="GameSettingFormItemLabelWidth">
              <template #label>
                <div class="form-item-wrap">
                  <span>SteamGameID</span>
                  <el-tooltip placement="bottom" :enterable="false" :hide-after="0">
                    <template #content>
                      when you set this item, modtrix will run game by steam.
                    </template>
                    <el-icon><InfoFilled /></el-icon>
                  </el-tooltip>
                  <span>:</span>
                </div>
              </template>
              <el-input v-model="form.gameSteamId" size="small" />
            </el-form-item>
          </div>
        </el-tab-pane>

        <el-tab-pane label="ModRepo Setting" name="ModRepoSetting">
          <el-form-item
            label="Mods Root:"
            prop="modRepoSetting.repoRoot"
            :label-width="ModRepoSettingFormItemLabelWidth"
          >
            <el-input v-model="form.modRepoSetting.repoRoot" :readonly="true" size="small">
              <template #append>
                <SelectDirectory size="small" @selected="handleModRepoSelected" />
              </template>
            </el-input>
          </el-form-item>
          <el-form-item
            label="Active Mode:"
            prop="modRepoSetting.activeMode"
            :label-width="ModRepoSettingFormItemLabelWidth"
          >
            <el-radio-group v-model="form.modRepoSetting.activeMode">
              <el-radio label="AM_ADD" size="small">add mode</el-radio>
              <el-radio label="AM_REPLACE" size="small">replace mode</el-radio>
            </el-radio-group>
          </el-form-item>
          <div v-if="showAdvanced">
            <el-form-item
              label="Clear Empty Floder:"
              prop="modRepoSetting.clearEmptyFloder"
              :label-width="ModRepoSettingFormItemLabelWidth"
            >
              <el-radio-group v-model="form.modRepoSetting.clearEmptyFloder">
                <el-radio :label="true" size="small">Yes</el-radio>
                <el-radio :label="false" size="small">No</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item
              label="File Dispatch Type"
              prop="modRepoSetting.dispatchMode"
              :label-width="ModRepoSettingFormItemLabelWidth"
            >
              <template #label>
                <div class="form-item-wrap">
                  <span>File Dispatch Type</span>
                  <el-tooltip placement="bottom" :enterable="false" :hide-after="0">
                    <template #content>
                      create link mode need run modtrix as administrators.</template
                    >
                    <el-icon><InfoFilled /></el-icon>
                  </el-tooltip>
                  <span>:</span>
                </div>
              </template>
              <el-radio-group v-model="form.modRepoSetting.dispatchMode">
                <el-radio label="DM_LINK" size="small">create link</el-radio>
                <el-radio label="DM_COPY" size="small">copy file</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item
              label="Exclude Files"
              prop="modRepoSetting.excludeFiles"
              :label-width="ModRepoSettingFormItemLabelWidth"
            >
              <template #label>
                <div class="form-item-wrap">
                  <span>Exclude Files</span>
                  <el-tooltip placement="bottom" :enterable="false" :hide-after="0">
                    <template #content>
                      those file will be ignore when active mods. use space split each.</template
                    >
                    <el-icon><InfoFilled /></el-icon>
                  </el-tooltip>
                  <span>:</span>
                </div>
              </template>
              <div class="inline-flex">
                <el-input
                  :spellcheck="false"
                  v-model="form.modRepoSetting.excludeFiles"
                  size="small"
                />
                <el-checkbox v-model="form.ignoreCase" label="Ignore Case" size="small" />
              </div>
            </el-form-item>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-checkbox v-model="showAdvanced" label="Advanced" />
        <div>
          <el-button @click="closeDialog">Cancel</el-button>
          <el-button type="primary" @click="handleFormSubmit">Confrim</el-button>
        </div>
      </div>
    </template>
  </el-dialog>
</template>

<style scoped lang="scss">
.form-item-wrap {
  display: flex;
  align-items: center;
  .el-icon {
    margin-top: 2px;
    color: #bbb;
    cursor: pointer;
  }
}

.inline-flex {
  width: 100%;
  display: flex;
  gap: 16px;
}

.dialog-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
</style>
