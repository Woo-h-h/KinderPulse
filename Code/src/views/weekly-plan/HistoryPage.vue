<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { WeeklyPlan } from '@/types/weeklyPlan'
import { getSavedPlans, deletePlan } from '@/api/weeklyPlan'

const router = useRouter()
const plans = ref<WeeklyPlan[]>([])
const loading = ref(true)

onMounted(() => {
  loadPlans()
})

function loadPlans() {
  loading.value = true
  // 模拟加载延迟
  setTimeout(() => {
    plans.value = getSavedPlans()
    loading.value = false
  }, 300)
}

function handleDelete(id: string, themeName: string) {
  ElMessageBox.confirm(`确定要删除"${themeName}"吗？`, '确认删除', {
    type: 'warning',
    confirmButtonText: '删除',
    cancelButtonText: '取消',
  }).then(() => {
    deletePlan(id)
    ElMessage.success('已删除')
    loadPlans()
  }).catch(() => {})
}

function handleExport(plan: WeeklyPlan) {
  // 延迟导入以支持代码分割
  import('@/utils/export-doc').then(({ exportToDoc }) => {
    exportToDoc(plan).then(() => {
      ElMessage.success('导出成功！')
    }).catch(() => {
      ElMessage.error('导出失败')
    })
  })
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleString('zh-CN')
}
</script>

<template>
  <div class="history-page">
    <div class="page-header">
      <h1>历史周计划</h1>
      <p>查看、管理已生成和已保存的周计划</p>
    </div>

    <div class="page-card">
      <el-table v-loading="loading" :data="plans" empty-text="暂无历史记录，快去创建第一个周计划吧！" stripe>
        <el-table-column prop="themeName" label="主题名称" min-width="140">
          <template #default="{ row }">
            <span class="theme-name">{{ row.themeName }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="className" label="班级" width="80" align="center" />
        <el-table-column prop="weekNumber" label="周次" width="70" align="center">
          <template #default="{ row }">
            第 {{ row.weekNumber }} 周
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="日期" width="170">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button size="small" text type="primary" @click="handleExport(row as WeeklyPlan)">
              <el-icon><Download /></el-icon> 导出
            </el-button>
            <el-button size="small" text type="danger" @click="handleDelete(row.id, row.themeName)">
              <el-icon><Delete /></el-icon> 删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<style scoped>
.theme-name {
  font-weight: 600;
  color: #409EFF;
}
</style>
