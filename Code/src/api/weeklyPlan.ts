import type {
  WeeklyPlan,
  CreateWeeklyPlanRequest,
  AiModifyRequest,
  ChatMessage,
} from '@/types/weeklyPlan'
import { mockGenerateWeeklyPlan, mockAiModify } from '@/mock/weeklyPlan'

/** 生成周计划 */
export async function createWeeklyPlan(req: CreateWeeklyPlanRequest): Promise<WeeklyPlan> {
  return mockGenerateWeeklyPlan(req.themeName, req.className, req.weekNumber, req.fileNames)
}

/** AI 对话修改 */
export async function aiModifyPlan(req: AiModifyRequest): Promise<{
  message: string
  updatedPlan: WeeklyPlan
}> {
  return mockAiModify(req.instruction, req.currentPlan, req.chatHistory)
}

/** 保存周计划到 localStorage */
export function saveWeeklyPlan(plan: WeeklyPlan): void {
  const plans = getSavedPlans()
  const idx = plans.findIndex((p) => p.id === plan.id)
  const toSave = { ...plan, status: 'saved' as const, createdAt: new Date().toISOString() }
  if (idx >= 0) {
    plans[idx] = toSave
  } else {
    plans.push(toSave)
  }
  localStorage.setItem('weekly_plans', JSON.stringify(plans))
}

/** 获取所有已保存的周计划 */
export function getSavedPlans(): WeeklyPlan[] {
  try {
    return JSON.parse(localStorage.getItem('weekly_plans') || '[]')
  } catch {
    return []
  }
}

/** 根据 ID 获取周计划 */
export function getPlanById(id: string): WeeklyPlan | undefined {
  return getSavedPlans().find((p) => p.id === id)
}

/** 删除周计划 */
export function deletePlan(id: string): void {
  const plans = getSavedPlans().filter((p) => p.id !== id)
  localStorage.setItem('weekly_plans', JSON.stringify(plans))
}
