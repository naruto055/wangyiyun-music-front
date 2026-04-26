# AiParser Chat-First Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 `src/views/AiParser.vue` 重构为聊天优先的单列页面，让流式 AI 回复成为主视图，并将解析结果以内联结果卡形式展示在聊天流中。

**Architecture:** 继续复用现有 `src/api/ai.js` 的流式协议和下载接口，不引入 Store。页面内部新增最小消息模型，由单条 AI 消息承载文本、过程、结果卡和错误状态。测试只补最小必要基建，覆盖 `src/api/ai.js` 的 SSE 解析逻辑，页面行为主要通过构建与手动联调验证。

**Tech Stack:** Vue 3 Composition API、Vite 7、Tailwind CSS 4、Vitest

---

## 文件结构

### 需要修改

- `package.json`
  - 新增最小测试脚本与测试依赖。
- `vite.config.js`
  - 补充 Vitest 配置，使用 `node` 环境运行纯函数测试。
- `src/api/ai.js`
  - 保持现有接口签名，必要时只做小幅增强，确保测试覆盖 `parseSseBlocks` 与下载 URL 构造。
- `src/views/AiParser.vue`
  - 从双栏工作台改为单列聊天流。
  - 新增消息模型、当前 AI 消息写入逻辑、内联结果卡、折叠过程块、底部输入区。

### 需要新增

- `src/api/__tests__/ai.test.js`
  - 覆盖 SSE 事件块解析与下载 URL 生成。

## 任务拆分

### Task 1: 最小测试基建与 AI API 解析测试

**Files:**
- Modify: `package.json`
- Modify: `vite.config.js`
- Test: `src/api/__tests__/ai.test.js`

- [ ] **Step 1: 安装最小测试依赖并补测试脚本**

在 `package.json` 中新增以下内容：

```json
{
  "scripts": {
    "test": "vitest run"
  },
  "devDependencies": {
    "vitest": "^3.2.4"
  }
}
```

约束：

- 不改现有 `dev/build/format` 脚本名称
- 不引入 `jsdom`，本次测试只跑纯函数

- [ ] **Step 2: 给 Vite 增加 Vitest 最小配置**

在 `vite.config.js` 中新增 `test` 配置：

```js
export default defineConfig({
  plugins: [vue(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.js']
  },
  server: {
    // 保持现有代理不变
  }
})
```

要求：

- 只增加测试配置，不碰现有代理逻辑

- [ ] **Step 3: 先写失败的 AI API 单元测试**

创建 `src/api/__tests__/ai.test.js`，覆盖以下行为：

```js
import { describe, expect, it } from 'vitest'
import { buildDownloadUrl, parseSseBlocks } from '@/api/ai'

describe('parseSseBlocks', () => {
  it('parses complete event blocks and preserves rest buffer', () => {
    const input = [
      'event: session',
      'data: {"sessionId":"abc123"}',
      '',
      'event: reply_delta',
      'data: {"delta":"你好"}',
      '',
      'event: progress',
      'data: {"message":"正在解析"}'
    ].join('\n')

    const result = parseSseBlocks(input)

    expect(result.events).toEqual([
      { event: 'session', data: { sessionId: 'abc123' } },
      { event: 'reply_delta', data: { delta: '你好' } }
    ])
    expect(result.rest).toContain('event: progress')
  })

  it('ignores invalid json and comment heartbeat lines', () => {
    const input = [
      ': keep-alive',
      'event: reply_delta',
      'data: invalid-json',
      '',
      'event: thinking_delta',
      'data: {"delta":"思考中"}',
      '',
    ].join('\n')

    const result = parseSseBlocks(input)

    expect(result.events).toEqual([
      { event: 'thinking_delta', data: { delta: '思考中' } }
    ])
  })
})

describe('buildDownloadUrl', () => {
  it('builds encoded ai download url', () => {
    const url = buildDownloadUrl({
      type: 'audio',
      shareUrl: 'https://v.douyin.com/abc',
      title: '测试标题'
    })

    expect(url).toContain('/ai-api/download?')
    expect(url).toContain('type=audio')
    expect(url).toContain(encodeURIComponent('https://v.douyin.com/abc'))
    expect(url).toContain(encodeURIComponent('测试标题'))
  })
})
```

- [ ] **Step 4: 运行测试，确认基线通过**

Run:

```bash
npm install
npm run test
```

Expected:

- `src/api/__tests__/ai.test.js` 全部通过

### Task 2: 将 AiParser 状态模型迁移到聊天消息流

**Files:**
- Modify: `src/views/AiParser.vue`

- [ ] **Step 1: 先定义消息模型与最小状态字段**

在 `script setup` 中用最小模型替换当前按页面分区维护的结果状态：

```js
const message = ref('')
const sessionId = ref('')
const sendingState = ref('idle')
const messages = ref([])
const activeAssistantMessageId = ref('')
const downloadingType = ref('')

function createUserMessage(content) {
  return {
    id: `user-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
    role: 'user',
    content,
    createdAt: Date.now(),
  }
}

function createAssistantMessage() {
  return {
    id: `assistant-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
    role: 'assistant',
    content: '',
    createdAt: Date.now(),
    status: 'connecting',
    progressMessage: '正在建立连接...',
    thinkingText: '',
    thinkingExpanded: false,
    parsedData: null,
    toolStatus: null,
    errorMessage: '',
  }
}
```

要求：

- 删除 `replyText`、`thinkingText`、`parsedData`、`toolStatus` 这类页面级展示状态
- 保留 `sessionId`、`AbortController`、下载动作状态

- [ ] **Step 2: 增加按 ID 更新当前 AI 消息的工具函数**

在 `AiParser.vue` 中新增统一更新函数：

```js
function updateMessageById(messageId, updater) {
  const target = messages.value.find((item) => item.id === messageId)
  if (!target) return
  updater(target)
}

function appendConversationTurn(content) {
  const userMessage = createUserMessage(content)
  const assistantMessage = createAssistantMessage()
  messages.value.push(userMessage, assistantMessage)
  activeAssistantMessageId.value = assistantMessage.id
  return assistantMessage.id
}
```

要求：

- 所有流式回调都通过 `updateMessageById` 写入当前 AI 消息
- 不要并行维护一套页面级镜像状态，避免 DRY 破坏

- [ ] **Step 3: 重写 `handleSubmit`，让流式回调落到当前 AI 消息**

按下面的结构重写：

```js
async function handleSubmit() {
  const trimmedMessage = message.value.trim()
  if (!trimmedMessage) {
    toast.warning('请输入解析内容')
    return
  }

  if (activeController) {
    activeController.abort()
  }

  const assistantMessageId = appendConversationTurn(trimmedMessage)
  message.value = ''
  sendingState.value = 'connecting'
  activeController = new AbortController()

  try {
    await streamAiChat(
      {
        message: trimmedMessage,
        sessionId: sessionId.value || undefined,
      },
      {
        onSession: ({ sessionId: nextSessionId }) => {
          sessionId.value = nextSessionId || sessionId.value
        },
        onProgress: ({ message: nextMessage }) => {
          updateMessageById(assistantMessageId, (target) => {
            target.progressMessage = nextMessage || '正在处理...'
          })
        },
        onThinkingDelta: ({ delta }) => {
          updateMessageById(assistantMessageId, (target) => {
            target.thinkingText += delta || ''
          })
        },
        onReplyDelta: ({ delta }) => {
          sendingState.value = 'streaming'
          updateMessageById(assistantMessageId, (target) => {
            target.status = 'streaming'
            target.content += delta || ''
          })
        },
        onToolResult: ({ parsedData, toolStatus }) => {
          updateMessageById(assistantMessageId, (target) => {
            target.parsedData = parsedData || null
            target.toolStatus = toolStatus || null
          })
        },
        onDone: (payload) => {
          updateMessageById(assistantMessageId, (target) => {
            target.status = 'completed'
            target.content = payload.reply || target.content
            target.thinkingText = payload.thinking || target.thinkingText
            target.parsedData = payload.parsedData || target.parsedData
            target.toolStatus = payload.toolStatus || target.toolStatus
          })
        },
        onError: ({ error }) => {
          updateMessageById(assistantMessageId, (target) => {
            target.status = 'error'
            target.errorMessage = error || '流式请求失败'
          })
        },
      },
      activeController.signal
    )
  } catch (error) {
    if (error.name !== 'AbortError') {
      updateMessageById(assistantMessageId, (target) => {
        target.status = 'error'
        target.errorMessage = error.message || '流式请求失败'
      })
      toast.error(error.message || '流式请求失败')
    }
  } finally {
    sendingState.value = 'idle'
    activeController = null
  }
}
```

要求：

- 失败时不清空历史消息
- 每次发送都追加新对话轮次，而不是覆盖旧结果

- [ ] **Step 4: 增加过程折叠与对话清空行为**

新增：

```js
function toggleThinking(messageId) {
  updateMessageById(messageId, (target) => {
    target.thinkingExpanded = !target.thinkingExpanded
  })
}

function resetConversation() {
  if (activeController) {
    activeController.abort()
    activeController = null
  }

  messages.value = []
  message.value = ''
  sendingState.value = 'idle'
  downloadingType.value = ''
}
```

要求：

- “清空会话”只影响当前前端消息流，不重置 `sessionId`
- 允许用户清空界面后继续使用已有后端会话上下文

### Task 3: 将 AiParser 模板重构为聊天式单列界面

**Files:**
- Modify: `src/views/AiParser.vue`

- [ ] **Step 1: 删除双栏布局，改为单列消息流 + 底部输入区**

模板目标结构：

```vue
<main class="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-5xl flex-col px-4 pb-32 pt-6">
  <section class="mb-6">
    <h1 class="text-3xl font-semibold text-foreground">AI 解析</h1>
    <p class="mt-2 text-sm text-muted-foreground">
      输入链接或分享文案，让 AI 直接返回可操作的解析结果。
    </p>
  </section>

  <section class="flex-1 space-y-6 pb-6">
    <!-- 空状态 -->
    <!-- 消息流 -->
  </section>

  <section class="sticky bottom-24 mt-auto">
    <!-- 固定输入区 -->
  </section>
</main>
```

要求：

- 删除现有 `lg:grid-cols-[...]` 双栏布局
- 删除独立“解析结果”卡片与“AI 过程”侧栏

- [ ] **Step 2: 渲染聊天消息流**

按以下结构渲染：

```vue
<article
  v-for="item in messages"
  :key="item.id"
  class="mx-auto w-full max-w-4xl"
>
  <div v-if="item.role === 'user'" class="flex justify-end">
    <div class="max-w-[85%] rounded-3xl bg-foreground px-5 py-3 text-sm leading-7 text-background shadow-sm">
      {{ item.content }}
    </div>
  </div>

  <div v-else class="space-y-4">
    <div class="rounded-[28px] border border-border/70 bg-white px-5 py-4 shadow-sm">
      <div class="mb-3 flex items-center gap-3 text-xs text-muted-foreground">
        <span class="rounded-full bg-primary/8 px-3 py-1 font-medium text-primary">AI</span>
        <span>{{ assistantStatusLabel(item.status) }}</span>
      </div>
      <p class="whitespace-pre-wrap text-sm leading-7 text-foreground">
        {{ item.content || item.progressMessage }}
      </p>
    </div>
  </div>
</article>
```

要求：

- 用户消息与 AI 消息在视觉上明确区分
- AI 内容区域优先保证阅读性，避免堆太多统计块

- [ ] **Step 3: 在 AI 消息内联渲染结果卡和折叠过程块**

结果卡示例结构：

```vue
<div
  v-if="item.parsedData"
  class="overflow-hidden rounded-[28px] border border-primary/15 bg-linear-to-br from-white via-white to-primary/5 shadow-sm"
>
  <div
    v-if="showMessageWarning(item)"
    class="border-b border-amber-200 bg-amber-50 px-5 py-3 text-sm text-amber-900"
  >
    {{ getWarningText(item) }}
  </div>

  <div class="grid gap-4 p-5 md:grid-cols-[112px_minmax(0,1fr)]">
    <div class="overflow-hidden rounded-2xl bg-muted">
      <img
        v-if="item.parsedData.cover"
        :src="item.parsedData.cover"
        :alt="item.parsedData.title || '解析封面'"
        class="h-28 w-full object-cover md:h-full"
      />
      <div v-else class="flex h-28 items-center justify-center text-muted-foreground">暂无封面</div>
    </div>

    <div class="space-y-4">
      <div>
        <h3 class="text-lg font-semibold leading-7 text-foreground">
          {{ item.parsedData.title || '未返回标题' }}
        </h3>
        <p class="mt-1 text-sm text-muted-foreground">
          {{ item.parsedData.author || '未返回作者信息' }}
        </p>
      </div>

      <div class="flex flex-wrap gap-2 text-xs text-muted-foreground">
        <span class="rounded-full bg-muted px-3 py-1">时长 {{ formatMessageDuration(item.parsedData.duration) }}</span>
        <span class="rounded-full bg-muted px-3 py-1">来源 {{ item.parsedData.source || 'AI 工具解析' }}</span>
        <span class="rounded-full bg-muted px-3 py-1">{{ getToolStatusLabel(item.toolStatus) }}</span>
      </div>

      <div class="flex flex-col gap-3 sm:flex-row">
        <Button
          class="flex-1"
          :disabled="!canDownloadMessage(item) || downloadingType === `${item.id}:video`"
          @click="handleDownload(item, 'video')"
        >
          {{ downloadingType === `${item.id}:video` ? '下载中...' : '下载视频' }}
        </Button>
        <Button
          variant="outline"
          class="flex-1"
          :disabled="!canDownloadMessage(item) || downloadingType === `${item.id}:audio`"
          @click="handleDownload(item, 'audio')"
        >
          {{ getAudioButtonLabel(item, downloadingType) }}
        </Button>
      </div>
    </div>
  </div>
</div>
```

过程折叠块示例：

```vue
<div
  v-if="item.progressMessage || item.thinkingText"
  class="rounded-2xl border border-border/70 bg-muted/40 px-4 py-3"
>
  <button
    type="button"
    class="flex w-full items-center justify-between text-left text-sm font-medium text-foreground"
    @click="toggleThinking(item.id)"
  >
    <span>{{ item.progressMessage || '查看过程' }}</span>
    <span>{{ item.thinkingExpanded ? '收起' : '展开' }}</span>
  </button>
  <p
    v-if="item.thinkingExpanded"
    class="mt-3 whitespace-pre-wrap text-sm leading-6 text-muted-foreground"
  >
    {{ item.thinkingText || '暂无更多过程信息' }}
  </p>
</div>
```

要求：

- 过程信息默认折叠
- 结果卡内直接下载，不再引入弹窗
- 移动端按钮改为纵向堆叠

- [ ] **Step 4: 重写下载与计算属性，改为按消息对象工作**

新增或重写以下工具函数：

```js
function canDownloadMessage(item) {
  return Boolean(item.parsedData?.shareUrl)
}

function getAudioButtonLabel(item) {
  if (downloadingType.value === `${item.id}:audio`) {
    return '下载中...'
  }

  return item.parsedData?.audioReady ? '下载原声音频' : '提取并下载音频'
}

async function handleDownload(item, type) {
  if (!item.parsedData?.shareUrl) {
    toast.warning('当前解析结果缺少可下载链接，请重新解析')
    return
  }

  downloadingType.value = `${item.id}:${type}`
  try {
    await downloadParsedMedia({
      type,
      shareUrl: item.parsedData.shareUrl,
      title: item.parsedData.title,
    })
    toast.success(type === 'video' ? '视频下载已开始' : '音频下载已开始')
  } catch (error) {
    toast.error(error.message || '下载失败')
  } finally {
    downloadingType.value = ''
  }
}
```

要求：

- 下载 loading 粒度到单条消息的单个按钮
- 不再依赖页面级 `parsedData`

### Task 4: 样式收口与整体验证

**Files:**
- Modify: `src/views/AiParser.vue`

- [ ] **Step 1: 收口空状态、滚动与底部输入区间距**

空状态示例：

```vue
<div
  v-if="!messages.length"
  class="flex min-h-[48vh] flex-col items-center justify-center rounded-[32px] border border-dashed border-border bg-linear-to-br from-muted/40 via-white to-primary/5 px-6 text-center"
>
  <div class="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
    <!-- icon -->
  </div>
  <h2 class="text-xl font-semibold text-foreground">让 AI 帮你解析视频</h2>
  <p class="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
    粘贴抖音、B 站链接或分享文案，AI 会在对话中直接返回解析结果和下载操作。
  </p>
</div>
```

要求：

- 空状态文案围绕“聊天式解析”
- 输入区底部留足空间，避免被全局播放栏遮挡

- [ ] **Step 2: 运行格式化、测试、构建验证**

Run:

```bash
npm run format
npm run test
npm run build
```

Expected:

- Prettier 无报错
- Vitest 通过
- Vite 构建成功

- [ ] **Step 3: 手动联调 `AiParser` 页面**

手动验证要点：

- 打开 `/ai-parser` 后，主视图为单列聊天流
- 发送消息后立即出现用户消息和 AI 占位消息
- 流式回复持续追加到当前 AI 消息
- 有 `parsedData` 时结果卡出现在对应 AI 消息下方
- `thinking/progress` 默认折叠
- 下载按钮只锁定当前按钮
- 移动端窄宽度下结果卡为纵向排布

记录：

- 如果本地后端不可用，至少保留 `npm run build` 与 `npm run test` 结果，并在最终汇报中明确说明未完成联调原因

## 自检

### Spec 覆盖

- 聊天优先单列页面：Task 2 + Task 3
- 结果卡内联：Task 3
- 直接下载：Task 3 Step 4
- `thinking/progress` 默认折叠：Task 2 Step 4 + Task 3 Step 3
- 移动端适配：Task 3 Step 3 + Task 4 Step 1
- 解析工具函数测试：Task 1

### 占位检查

- 无 `TODO/TBD`
- 所有修改文件已显式列出
- 所有验证命令已给出

### 一致性检查

- 下载行为统一基于消息对象 `item.parsedData`
- 流式状态统一写入 `messages`
- 未引入与规格冲突的弹窗、抽屉、右侧栏

## 执行方式

用户已明确要求：`开启子代理来实施计划`。

执行策略：

1. 先由子代理完成测试基建与 `src/api/ai.js` 测试补齐
2. 再由子代理完成 `AiParser.vue` 的消息模型与模板重构
3. 主代理整合后运行 `format/test/build`

说明：

- 按用户要求，本次不执行 `git commit`、`git push`、建分支等 Git 写操作
