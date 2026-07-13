<script setup lang="ts">
defineProps<{
  modelValue: {
    themeName: string
    weekNumber: number | null
    notes: string
  }
}>()

const emit = defineEmits<{
  'update:themeName': [value: string]
  'update:weekNumber': [value: number | null]
  'update:notes': [value: string]
}>()
</script>

<template>
  <el-card shadow="never">
    <template #header>
      <div class="card-title">
        <el-icon color="#409EFF" :size="18"><EditPen /></el-icon>
        <span>填写基本信息</span>
      </div>
    </template>

    <el-form label-position="top" :model="modelValue">
      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="主题名称" required>
            <el-input
              :model-value="modelValue.themeName"
              placeholder="如：亲亲自然"
              @update:model-value="emit('update:themeName', $event)"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="第几周" required>
            <el-input-number
              :model-value="modelValue.weekNumber"
              :min="1"
              :max="20"
              placeholder="第N周"
              style="width: 100%"
              @update:model-value="emit('update:weekNumber', $event as number | null)"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="备注（选填）">
        <el-input
          :model-value="modelValue.notes"
          type="textarea"
          :rows="2"
          placeholder="补充说明，如特殊活动安排、注意事项等"
          @update:model-value="emit('update:notes', $event)"
        />
      </el-form-item>
    </el-form>
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
</style>
