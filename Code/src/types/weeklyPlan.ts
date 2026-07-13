// ==================== 班级类型 ====================
export type ClassType = '大班' | '中班' | '小班'

// ==================== 周计划表结构 ====================
// 基于幼儿园周日计划模板（8行×5列表格）

/** 每天的日计划 */
export interface DayPlan {
  day: '周一' | '周二' | '周三' | '周四' | '周五'
  /** 集体学习 */
  collectiveLearning: string
  /** 区域游戏 */
  regionalGames: string
  /** 日常生活 */
  dailyLife: string
  /** 户外运动 */
  outdoorSports: string
}

/** 完整的周计划 */
export interface WeeklyPlan {
  id: string
  /** 主题名称，如"亲亲自然" */
  themeName: string
  /** 班级 */
  className: ClassType
  /** 第N周 */
  weekNumber: number
  /** 周工作重点 */
  weeklyFocus: string
  /** 周一~周五，5条 */
  dailyPlans: DayPlan[]
  /** 实施建议 */
  suggestions: string
  /** 创建时间 */
  createdAt: string
  /** 生成状态 */
  status: 'draft' | 'saved'
}

// ==================== 创建请求 ====================
export interface CreateWeeklyPlanRequest {
  /** 上传的文件名列表（由 Mock 使用） */
  fileNames: string[]
  /** 主题名称 */
  themeName: string
  /** 班级 */
  className: ClassType
  /** 第N周 */
  weekNumber: number
  /** 额外备注 */
  notes?: string
}

// ==================== AI 对话修改 ====================
export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

export interface AiModifyRequest {
  currentPlan: WeeklyPlan
  instruction: string
  chatHistory: ChatMessage[]
}
