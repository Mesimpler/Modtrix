<script setup>
import { ElMessage } from 'element-plus'
import { ref, nextTick } from 'vue'

const props = defineProps(['tags'])
const emit = defineEmits(['updateTags'])

const inputValue = ref('')
const inputVisible = ref(false)
const InputRef = ref(null)

function showInput() {
  inputVisible.value = true
  nextTick(() => {
    InputRef.value?.input.focus()
  })
}

function addTag(tag) {
  emit('updateTags', props.tags.concat([tag]))
}

function removeTag(tag) {
  emit(
    'updateTags',
    props.tags.filter((t) => t !== tag)
  )
}

function handleClose(tag) {
  removeTag(tag)
}

function handleInputConfirm() {
  if (inputValue.value) {
    const hasExist = props.tags.includes(inputValue.value)
    if (!hasExist) {
      addTag(inputValue.value)
    } else {
      ElMessage({
        type: 'warning',
        message: 'tag has existed!'
      })
    }
  }
  inputVisible.value = false
  inputValue.value = ''
}
</script>

<template>
  <div class="tags-wrap">
    <el-tag
      v-for="tag in tags"
      :key="tag"
      closable
      :disable-transitions="false"
      @close="handleClose(tag)"
    >
      {{ tag }}
    </el-tag>
    <el-input
      v-if="inputVisible"
      ref="InputRef"
      v-model="inputValue"
      class="ml-1 w-20"
      size="small"
      @keyup.enter="handleInputConfirm"
      @blur="handleInputConfirm"
    />
    <el-button v-else size="small" @click="showInput" icon="Plus" />
  </div>
</template>

<style scoped lang="scss">
.tags-wrap {
  display: flex;
  gap: 6px;

  .el-button {
    font-size: 12.5px;
  }
}
</style>
