import type { WeeklyPlan, ClassType, ChatMessage, DayPlan, TeachingPlan } from '@/types/weeklyPlan'
import {
  buildGenerateSystemPrompt,
  buildGenerateUserMessage,
  buildModifySystemPrompt,
  buildModifyUserMessage,
} from './prompts'
import { mockGenerateWeeklyPlan, mockAiModify } from '@/mock/weeklyPlan'

// ==================== 配置 ====================

function getConfig() {
  return {
    apiKey: import.meta.env.VITE_DEEPSEEK_API_KEY || '',
    baseUrl: import.meta.env.VITE_DEEPSEEK_BASE_URL || 'https://api.deepseek.com',
    model: import.meta.env.VITE_DEEPSEEK_MODEL || 'deepseek-chat',
  }
}

/** 是否已配置 API Key */
export function isApiConfigured(): boolean {
  const key = getConfig().apiKey
  return !!key && key !== 'sk-your-key-here'
}

// ==================== 通用 API 调用 ====================

interface ChatMessagePayload {
  role: 'system' | 'user' | 'assistant'
  content: string
}

async function chatCompletion(
  messages: ChatMessagePayload[],
  options?: { temperature?: number }
): Promise<string> {
  const { apiKey, baseUrl, model } = getConfig()

  const response = await fetch(`${baseUrl}/v1/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: options?.temperature ?? 0.7,
      max_tokens: 4096,
      response_format: { type: 'json_object' },
    }),
  })

  if (!response.ok) {
    const errBody = await response.text().catch(() => '')
    throw new Error(`API 请求失败 (${response.status}): ${errBody.slice(0, 200)}`)
  }

  const data = await response.json()
  const content = data.choices?.[0]?.message?.content

  if (!content) {
    throw new Error('API 返回内容为空')
  }

  return content
}

// ==================== JSON 提取与校验 ====================

function extractJson(text: string): string {
  // 尝试直接解析
  try {
    JSON.parse(text)
    return text
  } catch {
    // 尝试提取 ```json ... ``` 包裹的内容
    const codeBlock = text.match(/```(?:json)?\s*([\s\S]*?)```/)
    if (codeBlock) {
      return codeBlock[1].trim()
    }
    // 尝试提取 { ... } 最外层
    const brace = text.match(/\{[\s\S]*\}/)
    if (brace) {
      return brace[0]
    }
  }
  return text
}

// ==================== 类型守卫 ====================

const VALID_DAYS = ['周一', '周二', '周三', '周四', '周五'] as const

function isValidDayPlan(obj: unknown): obj is DayPlan {
  if (!obj || typeof obj !== 'object') return false
  const dp = obj as Record<string, unknown>
  return (
    typeof dp.day === 'string' &&
    VALID_DAYS.includes(dp.day as (typeof VALID_DAYS)[number]) &&
    typeof dp.collectiveLearning === 'string' &&
    typeof dp.regionalGames === 'string' &&
    typeof dp.dailyLife === 'string' &&
    typeof dp.outdoorSports === 'string'
  )
}

function isValidWeeklyPlan(obj: unknown): obj is WeeklyPlan {
  if (!obj || typeof obj !== 'object') return false
  const wp = obj as Record<string, unknown>
  return (
    typeof wp.weeklyFocus === 'string' &&
    Array.isArray(wp.dailyPlans) &&
    wp.dailyPlans.length === 5 &&
    wp.dailyPlans.every((dp: unknown) => isValidDayPlan(dp)) &&
    typeof wp.suggestions === 'string'
  )
}

// ==================== 生成周计划 ====================

export async function generateWeeklyPlan(params: {
  fileContents: { name: string; content: string }[]
  themeName: string
  className: ClassType
  weekNumber: number
  notes?: string
  selectedPlans?: TeachingPlan[]
}): Promise<WeeklyPlan> {
  // 未配置 API Key → 降级 Mock
  if (!isApiConfigured()) {
    console.warn('[LLM] 未配置 API Key，使用 Mock 数据')
    return mockGenerateWeeklyPlan(
      params.themeName,
      params.className,
      params.weekNumber,
      params.fileContents.map((f) => f.name)
    )
  }

  const systemPrompt = buildGenerateSystemPrompt()
  const userMessage = buildGenerateUserMessage(params)

  try {
    // 第一次尝试
    const content = await chatCompletion([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage },
    ])

    const json = extractJson(content)
    const result = JSON.parse(json)

    if (isValidWeeklyPlan(result)) {
      return {
        id: `plan_${Date.now()}`,
        themeName: params.themeName,
        className: params.className,
        weekNumber: params.weekNumber,
        weeklyFocus: result.weeklyFocus,
        dailyPlans: result.dailyPlans,
        suggestions: result.suggestions,
        createdAt: new Date().toISOString(),
        status: 'draft',
      }
    }

    console.warn('[LLM] 返回 JSON 格式不符合预期，重试一次...', result)

    // 重试：降低温度，强化格式要求
    const retryContent = await chatCompletion(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
        {
          role: 'user',
          content:
            '你上一次的返回格式不正确。请严格只输出 JSON，确保 dailyPlans 是有5个元素（周一到周五）的数组。',
        },
      ],
      { temperature: 0.3 }
    )

    const retryJson = extractJson(retryContent)
    const retryResult = JSON.parse(retryJson)

    if (isValidWeeklyPlan(retryResult)) {
      return {
        id: `plan_${Date.now()}`,
        themeName: params.themeName,
        className: params.className,
        weekNumber: params.weekNumber,
        weeklyFocus: retryResult.weeklyFocus,
        dailyPlans: retryResult.dailyPlans,
        suggestions: retryResult.suggestions,
        createdAt: new Date().toISOString(),
        status: 'draft',
      }
    }

    throw new Error('LLM 返回格式两次均不合法，请重试')
  } catch (err) {
    console.error('[LLM] 生成失败:', err)
    throw err
  }
}

// ==================== AI 对话修改 ====================

export async function modifyWeeklyPlan(params: {
  currentPlan: WeeklyPlan
  instruction: string
  chatHistory: ChatMessage[]
}): Promise<{ message: string; updatedPlan: WeeklyPlan }> {
  // 未配置 API Key → 降级 Mock
  if (!isApiConfigured()) {
    console.warn('[LLM] 未配置 API Key，使用 Mock 数据')
    return mockAiModify(params.instruction, params.currentPlan, params.chatHistory)
  }

  const systemPrompt = buildModifySystemPrompt(params.currentPlan)
  const userMessage = buildModifyUserMessage(params.instruction, params.chatHistory)

  try {
    const content = await chatCompletion([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage },
    ])

    const json = extractJson(content)
    const result = JSON.parse(json)

    if (
      typeof result.message === 'string' &&
      result.updatedPlan &&
      isValidWeeklyPlan(result.updatedPlan)
    ) {
      return {
        message: result.message,
        updatedPlan: {
          ...result.updatedPlan,
          id: params.currentPlan.id,
          themeName: params.currentPlan.themeName,
          className: params.currentPlan.className,
          weekNumber: params.currentPlan.weekNumber,
          createdAt: new Date().toISOString(),
          status: 'draft' as const,
        },
      }
    }

    throw new Error('LLM 修改返回格式不合法')
  } catch (err) {
    console.error('[LLM] 修改失败:', err)
    throw err
  }
}
