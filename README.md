# 🏫 幼儿园信息平台智能体 (KinderPulse)

AI 驱动的智慧教学助手，为幼儿园教师提供周计划智能生成、教案库选择、在线编辑与导出的一站式服务。

## ✨ 核心功能

### 🤖 周计划智能生成
- **文件上传模式**：拖拽上传 .docx/.doc 日计划文件，mammoth.js 自动解析文本内容
- **教案选择模式**：从预置教案库中勾选教案（5 份），支持多选，按领域筛选
- 接入 **DeepSeek 大模型 API**，根据文件内容/选中教案智能生成标准化周计划表
- 无 API Key 时自动降级为 Mock 演示数据

### 📊 可编辑周计划表格
- 8 行 × 5 列表格渲染（合并单元格），完全还原幼儿园周日计划模板
- **双击单元格** 内联编辑文字
- **AI 对话修改**：侧边抽屉发送修改指令，AI 根据指令调整周计划内容

### 💾 保存与导出
- 生成的周计划保存到 localStorage，历史记录中可查看/删除
- 导出 **DOC 格式**（docx 库生成标准 Word 文档，支持再编辑）
- 导出 **PDF 格式**（HTML 表格 → 浏览器打印）

### 📚 教案预置库（5 份）
| 教案 | 领域 | 适用班级 |
|------|------|----------|
| 好宝宝爱图书 | 语言、社会 | 小班 |
| 小兔和狼 | 艺术（音乐游戏） | 小班 |
| 植物园之旅 | 社会、健康 | 小班 |
| 奇妙的蔬菜 | 科学 | 小班 |
| 小老鼠的旅行 | 语言、科学 | 小班 |

## 🛠 技术栈

| 层 | 选型 |
|----|------|
| 框架 | Vue 3.5+ (Composition API + `<script setup>`) |
| 语言 | TypeScript 6.0 |
| 构建 | Vite 8.x |
| UI 库 | Element Plus 2.x + @element-plus/icons-vue |
| 状态管理 | Pinia 3.x |
| 路由 | Vue Router 4.x |
| AI 接入 | DeepSeek API（OpenAI 兼容格式，fetch 直连） |
| DOC 解析 | mammoth.js |
| DOC 生成 | docx |
| PDF 导出 | 浏览器 window.print() |

## 🚀 快速开始

```bash
cd Code

# 1. 安装依赖
npm install

# 2. 配置 API Key（可选，不配则使用 Mock 演示数据）
cp .env.example .env
# 编辑 .env 填入 DeepSeek API Key

# 3. 启动开发服务器
npm run dev
# → http://localhost:5173

# 4. 生产构建
npm run build
```

## 📁 项目结构

```
KinderPulse/
├── README.md                          # 本文件
├── Code/                              # 前端项目
│   ├── src/
│   │   ├── types/weeklyPlan.ts        # TS 类型定义（周计划/教案/请求）
│   │   ├── types/env.d.ts             # 环境变量类型
│   │   ├── router/index.ts            # 路由配置（5 条路由）
│   │   ├── stores/weeklyPlan.ts       # Pinia Store — 全部状态管理
│   │   ├── services/llm.ts            # DeepSeek API 客户端 + JSON 校验 + Mock 降级
│   │   ├── services/prompts.ts        # System/User Prompt 模板（含幼儿园课程理念）
│   │   ├── api/weeklyPlan.ts          # API 封装 + localStorage 持久化
│   │   ├── data/teachingPlans.ts      # 5 份预置教案数据
│   │   ├── mock/weeklyPlan.ts         # Mock 降级数据
│   │   ├── utils/parse-docx.ts        # .docx 文本解析（mammoth.js）
│   │   ├── utils/export-doc.ts        # 导出 .docx（docx 库，标准表格）
│   │   ├── utils/export-pdf.ts        # 导出 PDF（浏览器打印）
│   │   ├── components/layout/
│   │   │   └── AppLayout.vue          # 侧边栏 + 顶栏 + 内容区布局
│   │   └── views/
│   │       ├── Dashboard.vue          # 首页 — 功能导航卡片
│   │       ├── weekly-plan/
│   │       │   ├── CreatePage.vue     # 🔥 创建周计划（主页面）
│   │       │   ├── HistoryPage.vue    # 历史记录列表
│   │       │   └── components/
│   │       │       ├── FileUploadCard.vue   # 拖拽上传组件
│   │       │       ├── PlanSelector.vue     # 教案选择器（卡片多选）
│   │       │       ├── ClassSelector.vue    # 班级选择
│   │       │       ├── WeeklyPlanForm.vue   # 信息表单
│   │       │       ├── PlanEditor.vue       # 可编辑周计划表格
│   │       │       ├── AiChatPanel.vue      # AI 对话修改面板
│   │       │       └── ExportToolbar.vue    # 导出 DOC/PDF 下拉菜单
│   │       ├── curriculum/IndexPage.vue     # 课程资源库（占位）
│   │       └── research/IndexPage.vue       # 教研档案（占位）
│   ├── .env.example                   # 环境变量模板
│   └── package.json
├── 周日计划/                           # 原始教案文件（5份 .docx + 1份周计划模板）
├── Example/                            # 教案解析示例文本
├── 附幼周计划表智能体SOP.docx          # 周计划智能体操作规范
├── 信息平台智能体的推进.docx           # 平台建设规划文档
└── 信息化背景下幼儿习惯自主养成课程的实践研究_李阿慧.pdf  # 课题研究论文
```

## 🔄 数据流

```
上传 .docx 文件 ──→ mammoth 解析文本 ──┐
                                      ├──→ Prompt 拼装 ──→ DeepSeek API ──→ JSON 解析
从教案库勾选教案 ──→ 教案内容提取 ────┘                                        │
                                                                              ↓
保存 ←── localStorage ←── 在线编辑 ←── 双击单元格 / AI 对话 ←── 周计划表格渲染
  ↓
导出 DOC / PDF
```

## 📝 页面路由

| 路径 | 页面 | 说明 |
|------|------|------|
| `/` | Dashboard | 功能导航卡片入口 |
| `/weekly-plan/create` | 创建周计划 | 主功能页面 |
| `/weekly-plan/history` | 历史记录 | 已保存的周计划管理 |
| `/curriculum` | 课程资源库 | 待开发 |
| `/research` | 教研档案 | 待开发 |

## 🔧 环境变量

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `VITE_DEEPSEEK_API_KEY` | DeepSeek API Key | —（留空使用 Mock） |
| `VITE_DEEPSEEK_BASE_URL` | API 地址 | `https://api.deepseek.com` |
| `VITE_DEEPSEEK_MODEL` | 模型名称 | `deepseek-chat` |
