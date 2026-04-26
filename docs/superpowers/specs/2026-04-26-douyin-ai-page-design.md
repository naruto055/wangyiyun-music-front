# 通用 AI 流式解析页设计文档

## 1. 目标

新增一个独立页面，对接后端 `POST /api/ai/chat/stream` 流式接口，提供以下能力：

- 输入自然语言消息，支持粘贴多平台视频链接或分享文案
- 实时展示 AI 流式回复与过程状态
- 在收到结构化解析结果后展示视频结果卡
- 基于 `shareUrl` 统一触发视频/音频下载
- 保留 `sessionId`，支持当前页面内的连续对话

页面命名与文案按“通用 AI 解析页”设计，为后续接入更多视频平台预留产品层面的扩展空间。

本次实现层面仍然只对接当前已提供的这套 AI 流式解析能力，不提前引入平台选择器、平台配置中心或多套协议适配。

## 2. 范围

### 2.1 包含

- 新增独立页面，例如 `/ai-parser`
- 新增 AI 流式接口 API 封装
- 新增 SSE 文本块解析逻辑
- 新增结果卡、过程区、下载按钮
- 新增 Header 导航入口
- 新增最小必要测试，覆盖 SSE 事件块解析

### 2.2 不包含

- 不替换现有 `VideoParser.vue`
- 不改造为通用 AI 聊天系统
- 不引入 Pinia Store 管理会话
- 不实现完整多轮消息历史列表
- 不直接使用 `parsedData.videoUrl` / `parsedData.audioUrl` 作为下载入口

## 3. 实现方案

采用 `方案 A：单页内聚实现`。

原因：

- 与当前项目页面内状态管理模式一致，符合 KISS
- 当前只有一个页面使用流式 AI，抽 composable 或 store 都偏重
- 便于控制改动面，避免为了“未来复用”提前抽象

## 4. 页面布局

页面采用“结果优先”结构。

### 4.1 左侧主区

- 页面标题与说明
- 输入区
  - 多行输入框
  - 发送按钮
  - 当前会话状态展示
- 结果区
  - 封面图
  - 标题
  - 作者
  - 时长
  - `toolStatus.status`
  - `toolStatus.warnings`
- 下载区
  - 下载视频
  - 下载音频
  - 风险提示

### 4.2 右侧侧栏

- `progress` 阶段提示
- `reply_delta` 聚合后的 AI 回复正文
- `thinking_delta` 聚合内容

其中 `thinking_delta` 默认弱化展示，不与最终回复正文混合。

页面不暴露平台切换控件。平台识别由后端 AI 和工具调用结果决定；前端只消费结构化结果并展示。

## 5. 数据流设计

### 5.1 请求

- 地址：`POST /api/ai/chat/stream`
- Header：
  - `Accept: text/event-stream`
  - `Content-Type: application/json`
- Body：
- `message`
- `sessionId`（可选）

### 5.2 响应事件处理

- `session`
  - 保存 `sessionId`
- `progress`
  - 更新状态文案
- `thinking_delta`
  - 追加思考文本
- `reply_delta`
  - 追加回复文本
- `tool_result`
  - 更新结果卡
  - 若有 `parsedData`，状态切换到 `tool_ready`
- `done`
  - 用最终结果覆盖前面的增量态
  - 解锁输入框
  - 状态切换到 `completed`
- `error`
  - 记录错误信息
  - 状态切换到 `error`

## 6. 页面状态模型

页面内维护以下状态：

```ts
type PageStatus = 'idle' | 'connecting' | 'streaming' | 'tool_ready' | 'completed' | 'error'

interface ToolStatus {
  status: 'resolved' | 'suspect'
  warnings: string[]
}

interface ParseResult {
  source?: string
  title?: string
  author?: string
  cover?: string
  duration?: number
  videoUrl?: string
  audioUrl?: string
  audioReady?: boolean
  shareUrl?: string
}
```

核心状态字段：

- `message`
- `sessionId`
- `status`
- `progressMessage`
- `thinkingText`
- `replyText`
- `parsedData`
- `toolStatus`
- `errorMessage`
- `downloadingType`

## 7. API 与工具函数设计

### 7.1 `src/api/ai.js`

新增以下能力：

- `streamAiChat(payload, handlers)`
  - 使用 `fetch + ReadableStream` 消费 SSE
  - 负责按事件名分发 payload
- `buildDownloadUrl(params)`
  - 基于 `shareUrl` 构造 `/api/download`
- `downloadParsedMedia(params)`
  - 使用 `fetch + blob` 触发下载
  - 兼容 JSON 错误响应

### 7.2 SSE 解析

提取一个最小工具函数：

- `parseSseBlocks(buffer)`

职责：

- 将 buffer 按 `\n\n` 切成完整事件块
- 忽略注释心跳行
- 提取 `event:` 和 `data:`
- 安全解析 JSON

不额外做复杂协议抽象。

## 8. 下载策略

下载按钮展示规则：

- 存在 `parsedData.shareUrl` 才允许下载
- 视频下载按钮默认展示
- 音频按钮文案：
  - `audioReady === true`：`下载原声音频`
  - 否则：`提取并下载音频`

下载统一走：

- 视频：`GET /api/download?type=video&url=${shareUrl}&title=${title}`
- 音频：`GET /api/download?type=audio&url=${shareUrl}&title=${title}`

## 9. 错误与边界处理

### 9.1 建连前错误

- `response.ok === false` 时优先按 JSON 读取 `message`

### 9.2 流中错误

- 收到 `event: error` 后标记失败
- 保留当前已收到文本，不清空页面

### 9.3 风险提示

- `toolStatus.status === 'suspect'`
  - 显示醒目提示：解析结果可能不完整，请确认链接后再下载
- `warnings` 包含 `placeholder_share_url`
  - 不隐藏下载区域，但提示用户二次确认
- `shareUrl` 为空
  - 禁用下载按钮
  - 提示：当前解析结果缺少可下载链接，请重新解析

### 9.4 并发保护

- 流式请求进行中禁用发送按钮
- 下载中只禁用当前下载按钮，不影响结果阅读

## 10. 文件变更清单

### 10.1 新增

- `src/api/ai.js`
- `src/views/AiParser.vue`
- 测试文件（路径依项目现有测试组织方式确定）

### 10.2 修改

- `src/router/index.js`
- `src/components/layout/Header.vue`

## 11. 验证方式

1. 路由接入
   - verify: 访问新页面路径可正常渲染
2. 流式事件处理
   - verify: `session/progress/reply_delta/tool_result/done/error` 能正确驱动 UI 状态
3. 下载行为
   - verify: 按钮构造的下载请求基于 `shareUrl`，而非 `videoUrl/audioUrl`
4. 边界状态
   - verify: `suspect`、`shareUrl` 缺失、建连失败、流中错误时 UI 提示正确
5. 单元测试
   - verify: SSE 事件块解析测试通过

## 12. 设计取舍

- 不抽 Store：避免过度设计
- 不抽通用聊天组件：当前只有一个明确页面使用
- 不保留完整对话消息列表：本次需求核心是“解析工作台”，不是聊天产品
- 保留 `sessionId`：兼顾当前页面连续追问能力
- 页面命名保持通用：先解决产品入口和信息架构问题，但不提前做技术上的“多平台抽象层”

## 13. 后续可扩展点

若后续确认需要多轮消息历史或多平台 AI 解析，可在不破坏本次实现的前提下扩展：

- 抽离 `useAiStreamChat`
- 抽离消息列表组件
- 在后端协议稳定后，再评估是否增加平台标签、平台筛选或平台提示文案
- 使用 Store 保存会话
