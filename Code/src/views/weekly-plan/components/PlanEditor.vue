<script setup lang="ts">
import { ref } from 'vue'
import type { WeeklyPlan } from '@/types/weeklyPlan'
import AiChatPanel from './AiChatPanel.vue'
import ExportToolbar from './ExportToolbar.vue'

const props = defineProps<{
  plan: WeeklyPlan
}>()

const emit = defineEmits<{
  'update:plan': [plan: WeeklyPlan]
  'save': []
}>()

// ========== 编辑状态 ==========
const editingCell = ref<string | null>(null)
const editingValue = ref('')

// 表格列定义
const columns = [
  { prop: 'day', label: '时间', width: '80' },
  { prop: 'collectiveLearning', label: '集体学习', minWidth: '180' },
  { prop: 'regionalGames', label: '区域游戏', minWidth: '180' },
  { prop: 'dailyLife', label: '日常生活', minWidth: '180' },
  { prop: 'outdoorSports', label: '户外运动', minWidth: '180' },
]

// ========== 编辑逻辑 ==========
function startEdit(rowIndex: number, colProp: string) {
  if (colProp === 'day') return // 星期不可编辑
  const key = `${rowIndex}.${colProp}`
  editingCell.value = key
  const row = tableData.value[rowIndex] as Record<string, string>
  editingValue.value = row[colProp] || ''
}

function confirmEdit(rowIndex: number, colProp: string) {
  const newPlan = JSON.parse(JSON.stringify(props.plan)) as WeeklyPlan
  if (rowIndex === 0) {
    // 编辑周工作重点
    newPlan.weeklyFocus = editingValue.value
  } else if (rowIndex === 6) {
    // 编辑实施建议
    newPlan.suggestions = editingValue.value
  } else {
    // 编辑每日计划 (rowIndex 1-5 对应 dailyPlans[0-4])
    const dayIdx = rowIndex - 1
    const dp = newPlan.dailyPlans[dayIdx]
    if (colProp === 'collectiveLearning') dp.collectiveLearning = editingValue.value
    else if (colProp === 'regionalGames') dp.regionalGames = editingValue.value
    else if (colProp === 'dailyLife') dp.dailyLife = editingValue.value
    else if (colProp === 'outdoorSports') dp.outdoorSports = editingValue.value
  }
  editingCell.value = null
  emit('update:plan', newPlan)
}

function cancelEdit() {
  editingCell.value = null
}

function handlePlanUpdate(updatedPlan: WeeklyPlan) {
  emit('update:plan', updatedPlan)
}

// ========== 表格数据构建 ==========
const tableData = ref<any[]>([])

function buildTableData(plan: WeeklyPlan) {
  const rows: any[] = []

  // Row 0: 周工作重点（跨4列）
  rows.push({
    id: 'weeklyFocus',
    day: '周工作\n重点',
    collectiveLearning: plan.weeklyFocus,
    regionalGames: '',
    dailyLife: '',
    outdoorSports: '',
    _isMerged: true,
  })

  // Row 1: 表头
  rows.push({
    id: 'header',
    day: '时间',
    collectiveLearning: '集体学习',
    regionalGames: '区域游戏',
    dailyLife: '日常生活',
    outdoorSports: '户外运动',
    _isHeader: true,
  })

  // Row 2-6: 周一~周五
  plan.dailyPlans.forEach((dp) => {
    rows.push({
      id: dp.day,
      day: dp.day,
      collectiveLearning: dp.collectiveLearning,
      regionalGames: dp.regionalGames,
      dailyLife: dp.dailyLife,
      outdoorSports: dp.outdoorSports,
    })
  })

  // Row 7: 实施建议（跨4列）
  rows.push({
    id: 'suggestions',
    day: '实施\n建议',
    collectiveLearning: plan.suggestions,
    regionalGames: '',
    dailyLife: '',
    outdoorSports: '',
    _isMerged: true,
  })

  return rows
}

// 监听 plan 变化重建表格数据
import { watch } from 'vue'
watch(
  () => props.plan,
  (newPlan) => {
    tableData.value = buildTableData(newPlan)
  },
  { immediate: true }
)

// ========== 单元格合并 ==========
function spanMethod({ row, column, rowIndex }: { row: any; column: any; rowIndex: number }) {
  if (row._isMerged) {
    if (column.property === 'day') {
      return { rowspan: 1, colspan: 1 }
    }
    if (column.property === 'collectiveLearning') {
      return { rowspan: 1, colspan: 4 }
    }
    return { rowspan: 0, colspan: 0 }
  }
  return { rowspan: 1, colspan: 1 }
}

function getCellClass({ row, column }: { row: any; column: any }) {
  if (row._isHeader) return 'table-header-row'
  if (row._isMerged && column.property === 'day') return 'table-label-cell'
  if (column.property === 'day') return 'table-day-cell'
  return 'table-content-cell'
}

// ========== AI 对话抽屉 ==========
const chatDrawerVisible = ref(false)
</script>

<template>
  <el-card shadow="never">
    <template #header>
      <div class="editor-header">
        <div class="editor-title">
          <el-icon color="#67C23A" :size="18"><DocumentChecked /></el-icon>
          <span>周计划预览 & 编辑</span>
          <el-tag size="small" type="success">已生成</el-tag>
        </div>
        <div class="editor-actions">
          <el-button type="warning" plain @click="chatDrawerVisible = true">
            <el-icon><ChatDotRound /></el-icon>
            AI 对话修改
          </el-button>
          <ExportToolbar :plan="plan" />
          <el-button type="primary" @click="emit('save')">
            <el-icon><FolderChecked /></el-icon>
            保存
          </el-button>
        </div>
      </div>
    </template>

    <!-- 标题信息栏 -->
    <div class="plan-info-bar">
      <span class="plan-theme">{{ plan.themeName }}</span>
      <el-divider direction="vertical" />
      <span>{{ plan.className }}</span>
      <el-divider direction="vertical" />
      <span>第 {{ plan.weekNumber }} 周</span>
    </div>

    <!-- 可编辑表格 -->
    <div class="table-wrapper">
      <el-table
        :data="tableData"
        :span-method="spanMethod"
        :cell-class-name="getCellClass"
        border
        style="width: 100%"
        :key="plan.id"
      >
        <el-table-column
          v-for="col in columns"
          :key="col.prop"
          :prop="col.prop"
          :label="col.label"
          :width="col.width"
          :min-width="col.minWidth"
        >
          <template #default="{ row, $index }">
            <div
              v-if="editingCell === `${$index}.${col.prop}`"
              class="cell-editing"
            >
              <el-input
                v-model="editingValue"
                type="textarea"
                :autosize="{ minRows: 2, maxRows: 6 }"
                autofocus
                @blur="confirmEdit($index, col.prop)"
                @keydown.enter.ctrl="confirmEdit($index, col.prop)"
                @keydown.escape="cancelEdit"
              />
              <span class="edit-hint">Ctrl+Enter 确认 / Esc 取消</span>
            </div>
            <div
              v-else
              class="cell-display"
              :class="{ editable: !row._isHeader && col.prop !== 'day' }"
              @dblclick="startEdit($index, col.prop)"
            >
              <template v-if="row._isHeader">
                <strong>{{ row[col.prop] }}</strong>
              </template>
              <template v-else>
                <span v-if="(row._isMerged && col.prop === 'day') || (!row._isMerged && col.prop === 'day')">
                  {{ row.day }}
                </span>
                <span v-else-if="row._isMerged">
                  {{ col.prop === 'collectiveLearning' ? row.collectiveLearning : '' }}
                </span>
                <span v-else class="cell-text">{{ row[col.prop] }}</span>
              </template>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- AI 对话修改抽屉 -->
    <el-drawer
      v-model="chatDrawerVisible"
      title="AI 对话修改"
      direction="rtl"
      size="420px"
    >
      <AiChatPanel
        :plan="plan"
        @update:plan="handlePlanUpdate"
      />
    </el-drawer>
  </el-card>
</template>

<style scoped>
.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}

.editor-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  font-size: 15px;
}

.editor-actions {
  display: flex;
  gap: 8px;
}

.plan-info-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  margin-bottom: 16px;
  background: #ECF5FF;
  border-radius: 6px;
  font-size: 14px;
}

.plan-theme {
  font-weight: 600;
  color: #409EFF;
  font-size: 15px;
}

.table-wrapper {
  overflow-x: auto;
}

.cell-display {
  min-height: 28px;
  cursor: default;
  white-space: pre-line;
  font-size: 13px;
  line-height: 1.6;
  padding: 4px 0;
}

.cell-display.editable {
  cursor: pointer;
}

.cell-display.editable:hover {
  background: #ECF5FF;
  border-radius: 4px;
}

.cell-editing {
  position: relative;
}

.cell-editing .edit-hint {
  font-size: 11px;
  color: #C0C4CC;
  margin-top: 4px;
  display: block;
}

.cell-text {
  font-size: 13px;
  line-height: 1.7;
}

:deep(.table-header-row) {
  background-color: #F5F7FA;
  text-align: center;
  font-weight: 600;
}

:deep(.table-day-cell) {
  text-align: center;
  font-weight: 600;
  background-color: #FAFAFA;
  white-space: pre-line;
}

:deep(.table-label-cell) {
  text-align: center;
  font-weight: 600;
  background-color: #F5F7FA;
  vertical-align: middle;
  white-space: pre-line;
}

:deep(.table-content-cell) {
  vertical-align: top;
}
</style>
