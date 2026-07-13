<script setup lang="ts">
import type { ClassType } from '@/types/weeklyPlan'

defineProps<{
  modelValue: ClassType | ''
}>()

const emit = defineEmits<{
  'update:modelValue': [value: ClassType]
}>()

const options: { label: string; value: ClassType; desc: string }[] = [
  { label: '小班', value: '小班', desc: '3-4岁' },
  { label: '中班', value: '中班', desc: '4-5岁' },
  { label: '大班', value: '大班', desc: '5-6岁' },
]

function handleSelect(value: ClassType) {
  emit('update:modelValue', value)
}
</script>

<template>
  <el-card shadow="never">
    <template #header>
      <div class="card-title">
        <el-icon color="#409EFF" :size="18"><Checked /></el-icon>
        <span>选择班级</span>
        <el-tag size="small" type="danger">必选</el-tag>
      </div>
    </template>

    <div class="class-options">
      <div
        v-for="opt in options"
        :key="opt.value"
        class="class-option"
        :class="{ active: modelValue === opt.value }"
        @click="handleSelect(opt.value)"
      >
        <div class="class-label">{{ opt.label }}</div>
        <div class="class-desc">{{ opt.desc }}</div>
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

.class-options {
  display: flex;
  gap: 12px;
}

.class-option {
  flex: 1;
  padding: 20px 16px;
  border: 2px solid #EBEEF5;
  border-radius: 8px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
}

.class-option:hover {
  border-color: #409EFF;
  background: #ECF5FF;
}

.class-option.active {
  border-color: #409EFF;
  background: #ECF5FF;
}

.class-label {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 4px;
}

.class-desc {
  font-size: 12px;
  color: #909399;
}
</style>
