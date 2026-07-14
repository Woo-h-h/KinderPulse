import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { WeeklyPlan, ClassType, ChatMessage, TeachingPlan } from '@/types/weeklyPlan'
import { createWeeklyPlan, saveWeeklyPlan, aiModifyPlan, isApiConfigured } from '@/api/weeklyPlan'
import { parseDocxFiles } from '@/utils/parse-docx'

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

  // ========== 输入方式 ==========
  const inputMode = ref<'upload' | 'select'>('upload')
  const selectedPlans = ref<TeachingPlan[]>([])

  const formValid = computed(() => {
    const baseValid = themeName.value.trim() && className.value && weekNumber.value && weekNumber.value > 0
    if (inputMode.value === 'upload') {
      return baseValid && uploadedFiles.value.length > 0
    }
    return baseValid && selectedPlans.value.length > 0
  })

  // ========== 生成 ==========
  const isGenerating = ref(false)
  const currentPlan = ref<WeeklyPlan | null>(null)
  const isModified = ref(false)
  const apiConfigured = ref(isApiConfigured())

  async function generatePlan() {
    if (!formValid.value) return

    isGenerating.value = true
    try {
      let fileContents: { name: string; content: string }[] = []
      let plansForApi: TeachingPlan[] | undefined

      if (inputMode.value === 'upload') {
        // 上传模式：解析 .docx 文件内容
        fileContents = await parseDocxFiles(uploadedFiles.value)
      } else {
        // 选择模式：传递选中的教案
        plansForApi = selectedPlans.value
      }

      const plan = await createWeeklyPlan({
        themeName: themeName.value.trim(),
        className: className.value as ClassType,
        weekNumber: weekNumber.value!,
        fileNames: uploadedFiles.value.map((f) => f.name),
        fileContents,
        notes: notes.value.trim() || undefined,
        selectedPlans: plansForApi,
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
    selectedPlans.value = []
  }

  return {
    // 文件
    uploadedFiles, uploadError, addFiles, removeFile, clearFiles,
    // 输入方式
    inputMode, selectedPlans,
    // 表单
    themeName, className, weekNumber, notes, formValid,
    // 生成
    isGenerating, currentPlan, isModified, apiConfigured, generatePlan, updatePlanField,
    // AI
    chatHistory, isAiModifying, sendAiInstruction,
    // 保存
    savePlan,
    // 重置
    resetAll,
  }
})
