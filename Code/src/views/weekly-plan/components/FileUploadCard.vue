<script setup lang="ts">
import { ref } from 'vue'
import { UploadFilled } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import type { UploadFile, UploadRawFile } from 'element-plus'

const props = defineProps<{
  modelValue: File[]
}>()

const emit = defineEmits<{
  'update:modelValue': [files: File[]]
}>()

const fileList = ref<UploadFile[]>([])

function handleChange(_file: UploadFile, fileListRef: UploadFile[]) {
  const rawFiles = fileListRef
    .filter((f) => f.raw)
    .map((f) => f.raw as File)
  emit('update:modelValue', rawFiles)
}

function beforeUpload(rawFile: UploadRawFile) {
  const isValidType = rawFile.name.endsWith('.docx') || rawFile.name.endsWith('.doc')
  if (!isValidType) {
    ElMessage.error('仅支持 .docx 和 .doc 格式的文件')
    return false
  }
  const isLt10M = rawFile.size / 1024 / 1024 < 10
  if (!isLt10M) {
    ElMessage.error('文件大小不能超过 10MB')
    return false
  }
  return true
}

function handleRemove(_file: UploadFile, fileListRef: UploadFile[]) {
  const rawFiles = fileListRef
    .filter((f) => f.raw)
    .map((f) => f.raw as File)
  emit('update:modelValue', rawFiles)
}
</script>

<template>
  <el-card shadow="never" class="upload-card">
    <template #header>
      <div class="card-title">
        <el-icon color="#409EFF" :size="18"><UploadFilled /></el-icon>
        <span>上传日计划文件</span>
        <el-tag size="small" type="info">支持 .docx / .doc</el-tag>
      </div>
    </template>

    <el-upload
      v-model:file-list="fileList"
      drag
      multiple
      :auto-upload="false"
      :before-upload="beforeUpload"
      :on-change="handleChange"
      :on-remove="handleRemove"
      accept=".docx,.doc"
    >
      <el-icon :size="48" color="#C0C4CC"><UploadFilled /></el-icon>
      <div class="upload-text">
        <p>将日计划文件拖拽到此处，或 <em>点击上传</em></p>
        <p class="upload-hint">建议将本周所有日计划文件一次性上传</p>
      </div>
    </el-upload>

    <div v-if="modelValue.length > 0" class="file-count">
      <el-tag type="success">已选择 {{ modelValue.length }} 个文件</el-tag>
    </div>
  </el-card>
</template>

<style scoped>
.upload-card {
  margin-bottom: 0;
}

.card-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  font-size: 15px;
}

.upload-text {
  margin-top: 12px;
}

.upload-text p {
  margin: 4px 0;
  color: #606266;
  font-size: 14px;
}

.upload-text em {
  color: #409EFF;
  font-style: normal;
  cursor: pointer;
}

.upload-hint {
  font-size: 12px !important;
  color: #C0C4CC !important;
}

.file-count {
  margin-top: 12px;
  text-align: center;
}
</style>
