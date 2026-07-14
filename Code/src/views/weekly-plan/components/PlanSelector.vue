<script setup lang="ts">
import { computed, ref } from 'vue'
import type { TeachingPlan } from '@/types/weeklyPlan'
import { presetTeachingPlans, getAllDomains } from '@/data/teachingPlans'

defineProps<{
  modelValue: TeachingPlan[]
}>()

const emit = defineEmits<{
  'update:modelValue': [plans: TeachingPlan[]]
}>()

const activeDomain = ref('全部')
const domains = getAllDomains()

const filteredPlans = computed(() => {
  if (activeDomain.value === '全部') return presetTeachingPlans
  return presetTeachingPlans.filter((plan) =>
    plan.domain.includes(activeDomain.value)
  )
})

function isSelected(plan: TeachingPlan, selected: TeachingPlan[]): boolean {
  return selected.some((p) => p.id === plan.id)
}

function togglePlan(plan: TeachingPlan, selected: TeachingPlan[]) {
  if (isSelected(plan, selected)) {
    emit('update:modelValue', selected.filter((p) => p.id !== plan.id))
  } else {
    emit('update:modelValue', [...selected, plan])
  }
}
</script>

<template>
  <el-card shadow="never">
    <template #header>
      <div class="card-title">
        <el-icon color="#409EFF" :size="18"><Collection /></el-icon>
        <span>选择教案</span>
        <el-tag v-if="modelValue.length > 0" size="small" type="success">
          已选择 {{ modelValue.length }} 个
        </el-tag>
      </div>
    </template>

    <!-- 领域筛选 -->
    <div class="domain-filter">
      <el-radio-group v-model="activeDomain" size="small">
        <el-radio-button
          v-for="d in domains"
          :key="d"
          :value="d"
        >
          {{ d }}
        </el-radio-button>
      </el-radio-group>
    </div>

    <!-- 教案卡片网格 -->
    <div class="plan-grid">
      <div
        v-for="plan in filteredPlans"
        :key="plan.id"
        class="plan-card"
        :class="{ selected: isSelected(plan, modelValue) }"
        @click="togglePlan(plan, modelValue)"
      >
        <div class="plan-card-header">
          <h4>{{ plan.title }}</h4>
          <el-icon v-if="isSelected(plan, modelValue)" class="check-icon" color="#409EFF" :size="20">
            <CircleCheckFilled />
          </el-icon>
        </div>
        <div class="plan-tags">
          <el-tag
            v-for="d in plan.domain.split('、')"
            :key="d"
            size="small"
            type="info"
          >
            {{ d.trim() }}
          </el-tag>
          <el-tag size="small" type="warning">{{ plan.gradeLevel }}</el-tag>
        </div>
        <p class="plan-objectives">{{ plan.objectives.slice(0, 80) }}...</p>
      </div>
    </div>
  </el-card>
</template>

<style scoped>
.card-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  font-size: 15px;
}

.domain-filter {
  margin-bottom: 16px;
}

.plan-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 12px;
}

.plan-card {
  border: 2px solid #EBEEF5;
  border-radius: 8px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s;
}

.plan-card:hover {
  border-color: #C0C4CC;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.plan-card.selected {
  border-color: #409EFF;
  background: #ECF5FF;
}

.plan-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.plan-card-header h4 {
  font-size: 15px;
  font-weight: 600;
  margin: 0;
  color: #303133;
}

.plan-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-bottom: 8px;
}

.plan-objectives {
  font-size: 12px;
  color: #909399;
  line-height: 1.6;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
