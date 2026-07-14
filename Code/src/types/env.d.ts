/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** DeepSeek API Key */
  readonly VITE_DEEPSEEK_API_KEY?: string
  /** DeepSeek API Base URL，默认 https://api.deepseek.com */
  readonly VITE_DEEPSEEK_BASE_URL?: string
  /** 模型名称，默认 deepseek-chat */
  readonly VITE_DEEPSEEK_MODEL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
