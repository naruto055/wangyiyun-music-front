# AI Parser Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 新增一个通用 AI 流式解析页，接入 `/api/ai/chat/stream` 与 `/api/download`，支持流式回复、结构化结果展示和媒体下载。

**Architecture:** 采用单页内聚实现。`src/api/ai.js` 负责 SSE 解析与下载工具，`src/views/AiParser.vue` 负责页面状态与交互，路由和导航只做最小接入，不提前抽象成通用聊天框架或 Store。

**Tech Stack:** Vue 3、Vite、Vue Router、Fetch + ReadableStream、Node `node:test`

---

### Task 1: SSE 解析与下载工具

**Files:**
- Create: `src/api/ai.js`
- Test: `tests/ai.test.js`

- [ ] **Step 1: 写失败测试，覆盖 SSE 事件块解析**

```js
import test from 'node:test'
import assert from 'node:assert/strict'

import { parseSseBlocks, buildDownloadUrl } from '../src/api/ai.js'

test('parseSseBlocks 解析完整事件并保留残余 buffer', () => {
  const input = [
    'event: session',
    'data: {"sessionId":"abc"}',
    '',
    'event: reply_delta',
    'data: {"delta":"你好"}',
    '',
    'event: progress',
  ].join('\n')

  const result = parseSseBlocks(input)

  assert.deepEqual(result.events, [
    { event: 'session', data: { sessionId: 'abc' } },
    { event: 'reply_delta', data: { delta: '你好' } }
  ])
  assert.equal(result.rest, 'event: progress')
})

test('buildDownloadUrl 基于 shareUrl 构造下载地址', () => {
  assert.equal(
    buildDownloadUrl({
      type: 'audio',
      shareUrl: 'https://v.douyin.com/abc/',
      title: '示例标题'
    }),
    '/api/download?type=audio&url=https%3A%2F%2Fv.douyin.com%2Fabc%2F&title=%E7%A4%BA%E4%BE%8B%E6%A0%87%E9%A2%98'
  )
})
```

- [ ] **Step 2: 运行测试，确认红灯**

Run: `node --test tests/ai.test.js`

Expected: FAIL，报错 `Cannot find module` 或缺少导出函数

- [ ] **Step 3: 写最小实现**

```js
export function parseSseBlocks(buffer) {
  const blocks = buffer.split('\n\n')
  const completeBlocks = blocks.slice(0, -1)
  const rest = blocks.at(-1) || ''

  const events = completeBlocks
    .map((block) => block.split('\n').map((line) => line.trim()))
    .map((lines) => {
      const eventLine = lines.find((line) => line.startsWith('event:'))
      const dataLine = lines.find((line) => line.startsWith('data:'))
      if (!eventLine || !dataLine || eventLine.startsWith(':')) return null

      return {
        event: eventLine.slice(6).trim(),
        data: JSON.parse(dataLine.slice(5).trim())
      }
    })
    .filter(Boolean)

  return { events, rest }
}

export function buildDownloadUrl({ type, shareUrl, title }) {
  const search = new URLSearchParams({ type, url: shareUrl })
  if (title) search.set('title', title)
  return `/api/download?${search.toString()}`
}
```

- [ ] **Step 4: 运行测试，确认绿灯**

Run: `node --test tests/ai.test.js`

Expected: PASS，2 个测试通过

- [ ] **Step 5: 扩展为完整工具函数**

补全：
- `streamAiChat(payload, handlers, signal?)`
- `downloadParsedMedia(params)`
- `getFilenameFromDisposition(disposition, fallback)`

并保持 `parseSseBlocks` 可单测。

### Task 2: AI 解析页

**Files:**
- Create: `src/views/AiParser.vue`
- Modify: `src/api/ai.js`

- [ ] **Step 1: 先梳理页面状态与事件映射**

页面状态：

```js
const message = ref('')
const sessionId = ref('')
const status = ref('idle')
const progressMessage = ref('')
const thinkingText = ref('')
const replyText = ref('')
const parsedData = ref(null)
const toolStatus = ref(null)
const errorMessage = ref('')
const downloadingType = ref('')
```

- [ ] **Step 2: 搭页面骨架**

页面包含：
- Header
- 左侧主区：标题、输入框、结果卡、下载按钮
- 右侧侧栏：阶段状态、AI 回复、思考内容

- [ ] **Step 3: 接入流式事件**

把 `streamAiChat` 的回调映射到页面状态：

```js
onSession: ({ sessionId: nextSessionId }) => {
  sessionId.value = nextSessionId
}
onProgress: ({ message }) => {
  progressMessage.value = message || ''
}
onThinkingDelta: ({ delta }) => {
  thinkingText.value += delta || ''
}
onReplyDelta: ({ delta }) => {
  status.value = 'streaming'
  replyText.value += delta || ''
}
onToolResult: ({ parsedData: nextParsedData, toolStatus: nextToolStatus }) => {
  parsedData.value = nextParsedData
  toolStatus.value = nextToolStatus
  if (nextParsedData) status.value = 'tool_ready'
}
onDone: (payload) => {
  sessionId.value = payload.sessionId || sessionId.value
  thinkingText.value = payload.thinking || thinkingText.value
  replyText.value = payload.reply || replyText.value
  parsedData.value = payload.parsedData
  toolStatus.value = payload.toolStatus
  status.value = 'completed'
}
onError: ({ error }) => {
  errorMessage.value = error || '流式请求失败'
  status.value = 'error'
}
```

- [ ] **Step 4: 接入下载按钮**

视频与音频按钮都走：

```js
await downloadParsedMedia({
  type: 'video',
  shareUrl: parsedData.value.shareUrl,
  title: parsedData.value.title
})
```

音频按钮文案依据 `audioReady` 切换。

- [ ] **Step 5: 处理风险态与禁用态**

规则：
- `status` 为 `connecting` / `streaming` 时禁用发送
- `shareUrl` 为空时禁用下载
- `toolStatus.status === 'suspect'` 时显示警告条

### Task 3: 路由与导航接入

**Files:**
- Modify: `src/router/index.js`
- Modify: `src/components/layout/Header.vue`

- [ ] **Step 1: 新增路由**

```js
{
  path: '/ai-parser',
  name: 'AiParser',
  component: () => import('@/views/AiParser.vue'),
  meta: {
    title: 'AI 解析'
  }
}
```

- [ ] **Step 2: 新增导航入口**

在 Header 中新增 `AI解析` 链接，激活态判断保持和现有导航一致。

- [ ] **Step 3: 保持默认入口不变**

首页重定向继续保留当前 `video-parser`，不额外调整产品默认流向。

### Task 4: 验证

**Files:**
- Modify: `package.json`（仅在需要时补测试脚本；优先不改）

- [ ] **Step 1: 运行单测**

Run: `node --test tests/ai.test.js`

Expected: PASS

- [ ] **Step 2: 运行构建**

Run: `npm run build`

Expected: exit 0，Vite build 成功

- [ ] **Step 3: 检查格式风险**

Run: `npx prettier --check "src/api/ai.js" "src/views/AiParser.vue" "src/router/index.js" "src/components/layout/Header.vue" "tests/ai.test.js"`

Expected: All matched files use Prettier code style
