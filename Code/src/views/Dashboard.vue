<script setup lang="ts">
import { useRouter } from 'vue-router'
import { Plus, Clock, Reading, DataAnalysis } from '@element-plus/icons-vue'

const router = useRouter()

const cards = [
  {
    title: '周计划生成',
    desc: '上传日计划文件，AI 智能生成标准化周计划表，支持在线编辑与导出',
    icon: Plus,
    color: '#409EFF',
    actions: [
      { label: '新建周计划', path: '/weekly-plan/create', type: 'primary' as const },
      { label: '历史记录', path: '/weekly-plan/history' },
    ],
  },
  {
    title: '课程资源库',
    desc: '五大领域教案入库，AI 辅助生成优质教案，智能筛选与搜索',
    icon: Reading,
    color: '#67C23A',
    actions: [
      { label: '进入资源库', path: '/curriculum', type: 'primary' as const },
    ],
  },
  {
    title: '教研档案',
    desc: '收纳教研案例、教学视频、成长档案，支撑教师专业发展',
    icon: DataAnalysis,
    color: '#E6A23C',
    actions: [
      { label: '进入档案', path: '/research', type: 'primary' as const },
    ],
  },
]

function navigateTo(path: string) {
  router.push(path)
}
</script>

<template>
  <div class="dashboard">
    <div class="page-header">
      <h1>幼儿园信息平台智能体</h1>
      <p>AI 驱动的智慧教学助手，助力教师减负提效</p>
    </div>

    <el-row :gutter="20">
      <el-col v-for="card in cards" :key="card.title" :xs="24" :sm="12" :lg="8" style="margin-bottom: 20px">
        <el-card shadow="hover" class="dash-card">
          <div class="card-header">
            <div class="card-icon" :style="{ background: card.color + '15', color: card.color }">
              <el-icon :size="28">
                <component :is="card.icon" />
              </el-icon>
            </div>
            <div class="card-meta">
              <h3>{{ card.title }}</h3>
              <p>{{ card.desc }}</p>
            </div>
          </div>
          <div class="card-actions">
            <el-button
              v-for="action in card.actions"
              :key="action.label"
              :type="action.type || 'default'"
              @click="navigateTo(action.path)"
            >
              {{ action.label }}
            </el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<style scoped>
.dash-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.card-header {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 16px;
}

.card-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.card-meta h3 {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 6px;
  color: #303133;
}

.card-meta p {
  font-size: 13px;
  color: #909399;
  line-height: 1.6;
  margin: 0;
}

.card-actions {
  margin-top: auto;
  display: flex;
  gap: 8px;
}
</style>
