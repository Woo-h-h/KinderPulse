<script setup lang="ts">
import { onBeforeUnmount } from 'vue'
import { ElMessage } from 'element-plus'
import FileUploadCard from './components/FileUploadCard.vue'
import ClassSelector from './components/ClassSelector.vue'
import WeeklyPlanForm from './components/WeeklyPlanForm.vue'
import PlanEditor from './components/PlanEditor.vue'
import { useWeeklyPlanStore } from '@/stores/weeklyPlan'

const store = useWeeklyPlanStore()

// ========== 生成 ==========
async function handleGenerate() {
  if (!store.formValid) {
    ElMessage.warning('请先完成必填项：上传文件、选择班级、填写主题名称和周次')
    return
  }
  if (store.uploadedFiles.length === 0) {
    ElMessage.warning('请先上传日计划文件')
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
      <p>上传日计划文件 → 选择班级 → 填写信息 → AI 生成 → 编辑 → 导出</p>
    </div>

    <!-- 步骤1-3: 输入区 -->
    <div v-if="!store.currentPlan" class="input-section">
      <!-- 步骤指示器 -->
      <el-steps :active="store.formValid ? 3 : 1" align-center style="margin-bottom: 24px">
        <el-step title="上传文件" description="上传日计划文件" />
        <el-step title="选择班级" description="小班/中班/大班" />
        <el-step title="填写信息" description="主题 & 周次" />
        <el-step title="AI 生成" description="一键生成周计划" />
      </el-steps>

      <el-row :gutter="16">
        <!-- 左列：上传 -->
        <el-col :span="12">
          <FileUploadCard v-model="store.uploadedFiles" />
        </el-col>

        <!-- 右列：班级 + 表单 -->
        <el-col :span="12">
          <ClassSelector v-model="store.className" style="margin-bottom: 16px" />
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
          :disabled="!store.formValid || store.uploadedFiles.length === 0"
          @click="handleGenerate"
        >
          <el-icon><MagicStick /></el-icon>
          {{ store.isGenerating ? 'AI 正在生成周计划...' : '🚀 生成周计划' }}
        </el-button>
        <p v-if="store.uploadedFiles.length === 0" class="hint-text">
          请先上传日计划文件
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
