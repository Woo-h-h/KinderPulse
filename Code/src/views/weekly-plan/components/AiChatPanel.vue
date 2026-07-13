<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import type { WeeklyPlan, ChatMessage } from '@/types/weeklyPlan'
import { useWeeklyPlanStore } from '@/stores/weeklyPlan'

const props = defineProps<{
  plan: WeeklyPlan
}>()

const emit = defineEmits<{
  'update:plan': [plan: WeeklyPlan]
}>()

const store = useWeeklyPlanStore()
const inputText = ref('')
const chatContainer = ref<HTMLElement | null>(null)

const quickCommands = [
  '帮我把户外运动改成适合下雨天的室内运动',
  '加强安全教育内容',
  '优化区域游戏的多样性',
  '调整周五的活动内容',
]

function scrollToBottom() {
  nextTick(() => {
    if (chatContainer.value) {
      chatContainer.value.scrollTop = chatContainer.value.scrollHeight
    }
  })
}

async function sendMessage() {
  const text = inputText.value.trim()
  if (!text || store.isAiModifying) return
  inputText.value = ''

  await store.sendAiInstruction(text)
  emit('update:plan', store.currentPlan!)
  scrollToBottom()
}

function sendQuickCommand(cmd: string) {
  inputText.value = cmd
  sendMessage()
}

watch(
  () => store.chatHistory.length,
  () => scrollToBottom()
)
</script>

<template>
  <div class="chat-panel">
    <!-- 快捷指令 -->
    <div class="quick-commands">
      <p class="quick-title">快捷修改指令：</p>
      <el-tag
        v-for="cmd in quickCommands"
        :key="cmd"
        class="quick-tag"
        type="info"
        @click="sendQuickCommand(cmd)"
      >
        {{ cmd }}
      </el-tag>
    </div>

    <!-- 对话消息 -->
    <div ref="chatContainer" class="chat-messages">
      <div v-if="store.chatHistory.length === 0" class="chat-empty">
        <el-icon :size="40" color="#C0C4CC"><ChatDotRound /></el-icon>
        <p>描述你想要的修改，AI 帮你自动调整周计划</p>
        <p class="hint">例如："把户外运动改成适合下雨天的室内运动"</p>
      </div>

      <div
        v-for="(msg, idx) in store.chatHistory"
        :key="idx"
        class="chat-message"
        :class="msg.role"
      >
        <div class="msg-avatar">
          {{ msg.role === 'user' ? '👩‍🏫' : '🤖' }}
        </div>
        <div class="msg-bubble">
          <div class="msg-text">{{ msg.content }}</div>
          <div class="msg-time">{{ new Date(msg.timestamp).toLocaleTimeString('zh-CN') }}</div>
        </div>
      </div>

      <div v-if="store.isAiModifying" class="chat-message assistant">
        <div class="msg-avatar">🤖</div>
        <div class="msg-bubble typing">
          <span class="dot-pulse"></span>
        </div>
      </div>
    </div>

    <!-- 输入框 -->
    <div class="chat-input">
      <el-input
        v-model="inputText"
        type="textarea"
        :rows="2"
        placeholder="输入修改指令，如：把户外运动改成适合下雨天的室内运动..."
        :disabled="store.isAiModifying"
        @keydown.enter.exact.prevent="sendMessage"
      />
      <el-button
        type="primary"
        :loading="store.isAiModifying"
        :disabled="!inputText.trim()"
        style="margin-top: 8px; width: 100%"
        @click="sendMessage"
      >
        {{ store.isAiModifying ? 'AI 思考中...' : '发送指令' }}
      </el-button>
    </div>
  </div>
</template>

<style scoped>
.chat-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.quick-commands {
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #EBEEF5;
}

.quick-title {
  font-size: 13px;
  color: #909399;
  margin: 0 0 8px;
}

.quick-tag {
  margin: 0 8px 8px 0;
  cursor: pointer;
  transition: all 0.2s;
}

.quick-tag:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding-right: 4px;
}

.chat-empty {
  text-align: center;
  padding: 40px 16px;
  color: #C0C4CC;
}

.chat-empty p {
  margin: 8px 0;
  font-size: 14px;
}

.chat-empty .hint {
  font-size: 12px;
  color: #DCDFE6;
}

.chat-message {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.chat-message.user {
  flex-direction: row-reverse;
}

.msg-avatar {
  width: 32px;
  height: 32px;
  flex-shrink: 0;
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.msg-bubble {
  max-width: 80%;
  padding: 10px 14px;
  border-radius: 12px;
  font-size: 13px;
  line-height: 1.6;
}

.chat-message.user .msg-bubble {
  background: #409EFF;
  color: #fff;
  border-bottom-right-radius: 4px;
}

.chat-message.assistant .msg-bubble {
  background: #F2F6FC;
  color: #303133;
  border-bottom-left-radius: 4px;
}

.msg-text {
  white-space: pre-line;
}

.msg-time {
  font-size: 11px;
  margin-top: 4px;
  opacity: 0.7;
}

.typing {
  padding: 16px 20px;
}

.dot-pulse {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #909399;
  animation: pulse 1.4s infinite ease-in-out;
}

@keyframes pulse {
  0%, 80%, 100% { opacity: 0.3; transform: scale(1); }
  40% { opacity: 1; transform: scale(1.3); }
}

.chat-input {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #EBEEF5;
}
</style>
