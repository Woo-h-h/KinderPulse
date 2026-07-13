import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { WeeklyPlan, ClassType, ChatMessage } from '@/types/weeklyPlan'
import { createWeeklyPlan, saveWeeklyPlan, aiModifyPlan } from '@/api/weeklyPlan'

export const useWeeklyPlanStore = defineStore('weeklyPlan', () => {
  // ========== 文件上传 ==========
  const uploadedFiles = ref<File[]>([])
  const uploadError = ref('')

  function addFiles(files: File[]) {
    uploadedFiles.value.push(...files)
    uploadError.value = ''
  }

  function removeFile(index: number) {
    uploadedFiles.value.splice(index, 1)
  }

  function clearFiles() {
    uploadedFiles.value = []
  }

  // ========== 表单 ==========
  const themeName = ref('')
  const className = ref<ClassType | ''>('')
  const weekNumber = ref<number | null>(null)
  const notes = ref('')

  const formValid = computed(() => {
    return themeName.value.trim() && className.value && weekNumber.value && weekNumber.value > 0
  })

  // ========== 生成 ==========
  const isGenerating = ref(false)
  const currentPlan = ref<WeeklyPlan | null>(null)
  const isModified = ref(false)

  async function generatePlan() {
    if (!formValid.value || uploadedFiles.value.length === 0) return

    isGenerating.value = true
    try {
      const plan = await createWeeklyPlan({
        themeName: themeName.value.trim(),
        className: className.value as ClassType,
        weekNumber: weekNumber.value!,
        fileNames: uploadedFiles.value.map((f) => f.name),
        notes: notes.value.trim() || undefined,
      })
      currentPlan.value = plan
      isModified.value = false
    } finally {
      isGenerating.value = false
    }
  }

  function updatePlanField(path: string, value: string) {
    if (!currentPlan.value) return
    const keys = path.split('.')
    if (keys.length === 1) {
      ;(currentPlan.value as Record<string, any>)[keys[0]] = value
    } else if (keys.length === 2) {
      const [arr, idx, field] = path.match(/(\w+)\[(\d+)\]\.(\w+)/)?.slice(1) || []
      if (arr && idx !== undefined && field) {
        ;(currentPlan.value as Record<string, any>)[arr][Number(idx)][field] = value
      }
    }
    isModified.value = true
  }

  // ========== AI 对话 ==========
  const chatHistory = ref<ChatMessage[]>([])
  const isAiModifying = ref(false)

  async function sendAiInstruction(instruction: string) {
    if (!currentPlan.value || !instruction.trim()) return

    chatHistory.value.push({
      role: 'user',
      content: instruction,
      timestamp: new Date().toISOString(),
    })

    isAiModifying.value = true
    try {
      const result = await aiModifyPlan({
        currentPlan: currentPlan.value,
        instruction,
        chatHistory: chatHistory.value,
      })
      currentPlan.value = result.updatedPlan
      isModified.value = true
      chatHistory.value.push({
        role: 'assistant',
        content: result.message,
        timestamp: new Date().toISOString(),
      })
    } finally {
      isAiModifying.value = false
    }
  }

  // ========== 保存 ==========
  function savePlan() {
    if (!currentPlan.value) return
    saveWeeklyPlan(currentPlan.value)
    isModified.value = false
  }

  // ========== 重置 ==========
  function resetAll() {
    uploadedFiles.value = []
    uploadError.value = ''
    themeName.value = ''
    className.value = ''
    weekNumber.value = null
    notes.value = ''
    currentPlan.value = null
    isModified.value = false
    chatHistory.value = []
  }

  return {
    // 文件
    uploadedFiles, uploadError, addFiles, removeFile, clearFiles,
    // 表单
    themeName, className, weekNumber, notes, formValid,
    // 生成
    isGenerating, currentPlan, isModified, generatePlan, updatePlanField,
    // AI
    chatHistory, isAiModifying, sendAiInstruction,
    // 保存
    savePlan,
    // 重置
    resetAll,
  }
})
