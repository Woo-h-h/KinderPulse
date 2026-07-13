<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import type { WeeklyPlan } from '@/types/weeklyPlan'
import { exportToDoc } from '@/utils/export-doc'
import { exportToPdf } from '@/utils/export-pdf'

const props = defineProps<{
  plan: WeeklyPlan
}>()

const isExportingDoc = ref(false)
const isExportingPdf = ref(false)

async function handleExportDoc() {
  isExportingDoc.value = true
  try {
    await exportToDoc(props.plan)
    ElMessage.success('DOC 文件导出成功！')
  } catch (e) {
    ElMessage.error('导出 DOC 失败，请重试')
    console.error(e)
  } finally {
    isExportingDoc.value = false
  }
}

async function handleExportPdf() {
  isExportingPdf.value = true
  try {
    await exportToPdf(props.plan)
    ElMessage.success('PDF 文件导出成功！')
  } catch (e) {
    ElMessage.error('导出 PDF 失败，请重试')
    console.error(e)
  } finally {
    isExportingPdf.value = false
  }
}
</script>

<template>
  <el-dropdown trigger="click">
    <el-button type="success" plain>
      <el-icon><Download /></el-icon>
      导出
      <el-icon class="el-icon--right"><ArrowDown /></el-icon>
    </el-button>
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item @click="handleExportDoc" :disabled="isExportingDoc">
          <el-icon><Document /></el-icon>
          {{ isExportingDoc ? '导出中...' : '导出 DOC 格式' }}
          <span style="color:#909399;font-size:12px;margin-left:8px">推荐，可再编辑</span>
        </el-dropdown-item>
        <el-dropdown-item @click="handleExportPdf" :disabled="isExportingPdf">
          <el-icon><Printer /></el-icon>
          {{ isExportingPdf ? '导出中...' : '导出 PDF 格式' }}
          <span style="color:#909399;font-size:12px;margin-left:8px">存档 / 打印</span>
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>
