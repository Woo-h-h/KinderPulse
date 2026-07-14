<script setup lang="ts">
import { onBeforeUnmount } from 'vue'
import { ElMessage } from 'element-plus'
import FileUploadCard from './components/FileUploadCard.vue'
import ClassSelector from './components/ClassSelector.vue'
import WeeklyPlanForm from './components/WeeklyPlanForm.vue'
import PlanEditor from './components/PlanEditor.vue'
import PlanSelector from './components/PlanSelector.vue'
import { useWeeklyPlanStore } from '@/stores/weeklyPlan'

const store = useWeeklyPlanStore()

// ========== 生成 ==========
async function handleGenerate() {
  if (!store.formValid) {
    const msg = store.inputMode === 'upload'
      ? '请先完成必填项：上传文件、选择班级、填写主题名称和周次'
      : '请先完成必填项：选择教案、选择班级、填写主题名称和周次'
    ElMessage.warning(msg)
    return
  }
  await store.generatePlan()
}

// ========== 保存 ==========
function handleSave() {
  store.savePlan()
  ElMessage.success('周计划已保存！可在历史记录中查看')
}

// ========== 离开守卫 ==========
function handleBeforeUnload(e: BeforeUnloadEvent) {
  if (store.isModified) {
    e.preventDefault()
    e.returnValue = ''
  }
}

window.addEventListener('beforeunload', handleBeforeUnload)
onBeforeUnmount(() => {
  window.removeEventListener('beforeunload', handleBeforeUnload)
})
</script>

<template>
  <div class="create-page">
    <div class="page-header">
      <h1>新建周计划</h1>
      <p>上传文件或选择教案 → 选择班级 → 填写信息 → AI 生成 → 编辑 → 导出</p>
    </div>

    <!-- 步骤1-3: 输入区 -->
    <div v-if="!store.currentPlan" class="input-section">
      <!-- API 未配置提示 -->
      <el-alert
        v-if="!store.apiConfigured"
        title="未配置 API Key，当前使用演示数据"
        type="info"
        :closable="false"
        show-icon
        style="margin-bottom: 16px"
      >
        <template #default>
          创建 <code>.env</code> 文件并设置 <code>VITE_DEEPSEEK_API_KEY=sk-xxx</code> 即可接入 DeepSeek 大模型
        </template>
      </el-alert>

      <!-- 输入方式切换 -->
      <div class="mode-toggle">
        <el-radio-group v-model="store.inputMode" size="large">
          <el-radio-button value="upload">
            <el-icon><Upload /></el-icon> 上传文件
          </el-radio-button>
          <el-radio-button value="select">
            <el-icon><Collection /></el-icon> 选择教案
          </el-radio-button>
        </el-radio-group>
      </div>

      <!-- 上传模式 -->
      <div v-if="store.inputMode === 'upload'" class="mode-panel">
        <FileUploadCard v-model="store.uploadedFiles" />
      </div>

      <!-- 选择教案模式 -->
      <div v-else class="mode-panel">
        <PlanSelector v-model="store.selectedPlans" />
      </div>

      <!-- 班级 + 表单（两种模式共用） -->
      <el-row :gutter="16" style="margin-top: 16px">
        <el-col :span="12">
          <ClassSelector v-model="store.className" />
        </el-col>
        <el-col :span="12">
          <WeeklyPlanForm
            :model-value="{
              themeName: store.themeName,
              weekNumber: store.weekNumber,
              notes: store.notes,
            }"
            @update:theme-name="store.themeName = $event"
            @update:week-number="store.weekNumber = $event"
            @update:notes="store.notes = $event"
          />
        </el-col>
      </el-row>

      <!-- 生成按钮 -->
      <div class="generate-area">
        <el-button
          type="primary"
          size="large"
          :loading="store.isGenerating"
          :disabled="!store.formValid"
          @click="handleGenerate"
        >
          <el-icon><MagicStick /></el-icon>
          {{ store.isGenerating ? 'AI 正在生成周计划...' : '🚀 生成周计划' }}
        </el-button>
        <p v-if="store.inputMode === 'upload' && store.uploadedFiles.length === 0" class="hint-text">
          请先上传日计划文件
        </p>
        <p v-if="store.inputMode === 'select' && store.selectedPlans.length === 0" class="hint-text">
          请先从教案库中选择至少一个教案
        </p>
      </div>
    </div>

    <!-- 生成结果区 -->
    <div v-else class="result-section">
      <div class="back-row">
        <el-button text @click="store.resetAll()">
          <el-icon><ArrowLeft /></el-icon>
          返回重新创建
        </el-button>
      </div>
      <PlanEditor
        :plan="store.currentPlan"
        @update:plan="store.currentPlan = $event"
        @save="handleSave"
      />
    </div>
  </div>
</template>

<style scoped>
.input-section {
  background: #fff;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.generate-area {
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #EBEEF5;
  text-align: center;
}

.hint-text {
  margin-top: 8px;
  color: #909399;
  font-size: 13px;
}

.back-row {
  margin-bottom: 16px;
}
</style>
