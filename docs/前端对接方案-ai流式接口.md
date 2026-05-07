# AI 对话流接口前端对接文档

## 1. 文档范围

本文档仅针对后端控制器：

- `D:/JavaCodeStudy/wangyiyun-music/src/main/java/com/naruto/wangyiyunmusic/controller/AiChatController.java`

对应接口：

- `POST /api/ai/chat/stream`

文档目标：

- 说明接口真实请求/响应协议
- 说明 SSE 事件结构
- 说明前端接入注意事项
- 给出贴合当前项目的实现意见

本文结论以当前后端源码实现为准，不以旧版前端草稿或历史文档为准。

---

## 2. 接口概览

### 2.1 接口用途

该接口用于 AI 流式对话，支持两类输出同时返回：

- AI 文本增量回复
- 视频链接解析后的结构化结果

当用户消息中包含 URL 时，后端会先尝试提取第一条链接并调用视频解析工具，再结合解析结果生成 AI 回复。

### 2.2 路由定义

```http
POST /api/ai/chat/stream
```

控制器声明：

- `@RequestMapping("/api/ai")`
- `@PostMapping(value = "/chat/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)`

### 2.3 超时时间

当前控制器创建的 `SseEmitter` 超时时间固定为：

```text
120000ms（120秒）
```

注意：

- 当前 `AiChatController` 使用的是控制器内常量 `SSE_TIMEOUT_MS = 120000L`
- 虽然 `AiChatProperties` 中也有 `sseTimeoutMs` 配置项，但当前控制器实现并未使用它

---

## 3. 请求定义

### 3.1 请求头

```http
Accept: text/event-stream
Content-Type: application/json
```

### 3.2 请求体

```json
{
	"message": "帮我解析这个 B 站链接 https://www.bilibili.com/video/BV1xxxxxx",
	"sessionId": "b2dcab66-d3b4-4a44-9699-24c73ef04ae1"
}
```

### 3.3 字段说明

| 字段        | 类型     | 必填 | 说明                               |
| ----------- | -------- | ---- | ---------------------------------- |
| `message`   | `string` | 是   | 用户输入内容。后端要求非空白字符串 |
| `sessionId` | `string` | 否   | 会话 ID。不传时由后端生成 UUID     |

### 3.4 参数校验

控制器只做了最小校验：

- `requestDTO == null` 或 `message` 为空时，直接返回 `400`

错误响应示例：

```json
{
	"code": 400,
	"message": "message is required",
	"data": null
}
```

注意：

- 这是普通 JSON 响应，不是 SSE 事件
- 所以前端必须先判断 HTTP 状态和 `Content-Type`，不能默认所有返回都是流

---

## 4. 响应协议

### 4.1 成功响应

正常情况下，接口返回：

```http
Content-Type: text/event-stream;charset=UTF-8
```

并通过 SSE 持续推送事件。

### 4.2 失败响应

该接口存在两种失败模式：

1. 建连前失败：直接返回普通 JSON 错误
2. 建连后失败：返回 SSE `error` 事件

### 4.3 与全局响应封装的关系

虽然项目有 `GlobalResponseAdvice` 统一包装 `Result<T>`，但对本接口：

- `SseEmitter` 类型不会再包装
- `text/event-stream` 响应也不会再包装

这意味着：

- SSE 正常事件体不是 `{ code, message, data }`
- 只有建连前参数错误等情况，才可能收到 `Result` 风格 JSON

---

## 5. 事件时序

根据 `AiChatStreamServiceImpl` 当前实现，一次正常请求的典型事件顺序如下：

### 5.1 不包含视频链接时

```text
session
progress(model_start)
reply_delta（0..n次）
done
```

### 5.2 包含视频链接时

```text
session
progress(model_start)
progress(tool_start)
tool_result
reply_delta（0..n次）
done
```

### 5.3 异常时

```text
session? -> progress? -> error
```

注意：

- `session` 基本会最先发出
- `tool_result` 只在识别到 URL 且解析成功时发送
- 当前后端实现不会发送 `thinking_delta`
- `done` 事件是本轮会话结束的最终信号

---

## 6. SSE 事件定义

## 6.1 `session`

用途：

- 告知前端当前会话 ID
- 便于前端下一轮继续携带上下文

示例：

```text
event: session
data: {"sessionId":"b2dcab66-d3b4-4a44-9699-24c73ef04ae1"}
```

字段定义：

| 字段        | 类型     | 说明        |
| ----------- | -------- | ----------- |
| `sessionId` | `string` | 当前会话 ID |

---

## 6.2 `progress`

用途：

- 给前端展示“当前处理到哪一步”

当前已确认阶段值：

| stage         | 含义                 |
| ------------- | -------------------- |
| `model_start` | AI 开始分析输入      |
| `tool_start`  | 开始调用视频解析工具 |

示例：

```text
event: progress
data: {"stage":"model_start","message":"AI 正在分析输入"}
```

```text
event: progress
data: {"stage":"tool_start","message":"正在调用视频解析工具"}
```

字段定义：

| 字段      | 类型     | 说明                       |
| --------- | -------- | -------------------------- |
| `stage`   | `string` | 当前处理阶段               |
| `message` | `string` | 可直接展示给用户的提示文案 |

前端建议：

- 优先展示 `message`
- `stage` 只作为状态标记，不要写死过多分支

---

## 6.3 `tool_result`

用途：

- 返回视频解析工具结果
- 提供结构化卡片数据

示例：

```text
event: tool_result
data: {
  "toolStatus": {
    "status": "resolved",
    "warnings": []
  },
  "parsedData": {
    "title": "示例标题",
    "coverUrl": "https://i2.hdslb.com/bfs/archive/xxx.jpg",
    "duration": 1234,
    "platform": "BILIBILI",
    "normalizedVideoUrl": "https://www.bilibili.com/video/BV1Yv6EBkEJ3",
    "availableActions": ["AUDIO_PREPARE", "VIDEO_DOWNLOAD"],
    "audioSupported": true,
    "videoSupported": true,
    "sourceVideoId": "BV1Yv6EBkEJ3",
    "message": "音频可直接准备，视频下载需手动触发"
  }
}
```

### `toolStatus` 字段

| 字段       | 类型       | 说明         |
| ---------- | ---------- | ------------ |
| `status`   | `string`   | 工具执行状态 |
| `warnings` | `string[]` | 警告信息列表 |

当前源码已明确支持的状态值：

- `resolved`
- `failed`

注意：

- `AiToolStatusVO` 注释中提到 `unresolved`、`partial`
- 但当前实际工厂方法只构建 `resolved`、`failed`
- 前端可以保留兼容兜底分支，但不要假设当前一定会收到其他值

### `parsedData` 字段

`parsedData` 实际结构复用了 `VideoParseResultVO`，字段如下：

| 字段                 | 类型       | 说明                    |
| -------------------- | ---------- | ----------------------- |
| `title`              | `string`   | 视频标题                |
| `coverUrl`           | `string`   | 封面图                  |
| `duration`           | `number`   | 时长，单位秒            |
| `platform`           | `string`   | 平台代码，如 `BILIBILI` |
| `normalizedVideoUrl` | `string`   | 规范化后的视频链接      |
| `availableActions`   | `string[]` | 当前可执行动作          |
| `audioSupported`     | `boolean`  | 是否支持音频能力        |
| `videoSupported`     | `boolean`  | 是否支持视频下载能力    |
| `sourceVideoId`      | `string`   | 原始视频 ID，如 `BV号`  |
| `message`            | `string`   | 后端提示信息            |

重要说明：

- 当前真实字段是 `coverUrl`，不是 `cover`
- 当前真实字段是 `normalizedVideoUrl`，不是 `shareUrl`
- 当前真实字段中没有 `author`、`audioUrl`、`videoUrl`、`audioReady`
- 前端不能继续按旧字段模型消费

---

## 6.4 `reply_delta`

用途：

- AI 文本增量输出
- 用于聊天气泡实时渲染

示例：

```text
event: reply_delta
data: {"delta":"解析完成，这个视频标题是《示例标题》。"}
```

字段定义：

| 字段    | 类型     | 说明             |
| ------- | -------- | ---------------- |
| `delta` | `string` | 本次新增文本片段 |

前端建议：

- 将多个 `delta` 依次拼接到当前回复文本
- 不要假设一次只收到一段完整句子

---

## 6.5 `done`

用途：

- 表示本轮流式对话结束
- 返回最终汇总结果

示例：

```text
event: done
data: {
  "thinking": "识别到用户输入中包含视频链接，已调用视频解析工具。",
  "reply": "解析完成，这个视频标题是《示例标题》。你可以继续准备音频或按需下载视频。",
  "sessionId": "b2dcab66-d3b4-4a44-9699-24c73ef04ae1",
  "toolStatus": {
    "status": "resolved",
    "warnings": []
  },
  "parsedData": {
    "title": "示例标题",
    "coverUrl": "https://i2.hdslb.com/bfs/archive/xxx.jpg",
    "duration": 1234,
    "platform": "BILIBILI",
    "normalizedVideoUrl": "https://www.bilibili.com/video/BV1Yv6EBkEJ3",
    "availableActions": ["AUDIO_PREPARE", "VIDEO_DOWNLOAD"],
    "audioSupported": true,
    "videoSupported": true,
    "sourceVideoId": "BV1Yv6EBkEJ3",
    "message": "音频可直接准备，视频下载需手动触发"
  }
}
```

字段定义：

| 字段         | 类型             | 说明                         |
| ------------ | ---------------- | ---------------------------- |
| `thinking`   | `string`         | 本轮处理摘要，不是逐字推理流 |
| `reply`      | `string`         | 最终完整回复                 |
| `sessionId`  | `string`         | 当前会话 ID                  |
| `toolStatus` | `object \| null` | 工具执行状态                 |
| `parsedData` | `object \| null` | 视频解析结果                 |

注意：

- 当前后端不会发 `thinking_delta`
- `thinking` 只会在 `done` 里一次性给出摘要

---

## 6.6 `error`

用途：

- 表示 SSE 建立后，服务端处理过程中发生异常

示例：

```text
event: error
data: {"error":"AI 对话能力未启用"}
```

字段定义：

| 字段    | 类型     | 说明     |
| ------- | -------- | -------- |
| `error` | `string` | 错误信息 |

前端建议：

- 收到该事件后，立刻结束当前轮次等待
- 将当前消息标记为失败态
- 给用户展示可重试入口

---

## 7. 当前后端处理逻辑说明

## 7.1 URL 识别逻辑

后端当前使用正则：

```text
https?://\S+
```

并且：

- 只提取 `message` 中第一条 URL
- 如果消息没有 URL，则不触发视频解析工具

这意味着前端需要注意：

- 用户输入多条链接时，当前只会处理第一条
- 如果是纯 `BV号`、纯关键字、无协议分享文案，当前控制器这层不一定能命中工具解析

## 7.2 平台识别逻辑

工具服务当前根据 URL 域名识别平台：

- `bilibili.com` / `b23.tv` -> `BILIBILI`
- `douyin.com` -> `DOUYIN`
- `youtube.com` / `youtu.be` -> `YOUTUBE`

无法识别时，会抛出业务异常。

## 7.3 AI 模型兜底逻辑

如果 Spring AI 模型不可用或流式生成失败：

- 后端不会直接报错结束
- 会构造兜底回复

兜底回复分两种：

1. 没有解析结果时：
   - `我已收到你的消息。你可以发送 B站、抖音或 YouTube 视频链接，我会帮你解析视频信息。`
2. 有解析结果时：
   - `解析完成，这个视频标题是《xxx》。你可以继续准备音频或按需下载视频。`

这意味着：

- 前端不能把“收到 `reply_delta` 很少”直接视为失败
- 有时模型流失败，但仍会有可用 `done` 结果

## 7.4 会话能力边界

后端确实保存了会话消息：

- 默认最近 10 轮
- 仅保存在内存中
- 不做持久化
- 不做分布式同步

这意味着：

- 服务重启后会话丢失
- 多实例部署时会话上下文不稳定
- 当前更适合单机开发环境或轻量场景

---

## 8. 前端对接注意事项

## 8.1 不能使用原生 `EventSource`

原因：

- `EventSource` 只支持 GET
- 当前接口是 `POST`
- 当前接口必须携带 JSON body

正确方式：

- 使用 `fetch`
- 通过 `response.body.getReader()` 消费流

## 8.2 不能走现有通用 Axios `request` 封装

原因：

- `src/utils/request.js` 会假设后端响应是 `{ code, message, data }`
- SSE 流并不符合这个结构

正确方式：

- 单独实现 `src/api/ai.js`
- 使用原生 `fetch` 处理流

## 8.3 不能按旧版字段渲染

当前项目里已有的 `AiParser.vue` / `src/api/ai.js` 使用了旧字段假设，例如：

- `thinking_delta`
- `shareUrl`
- `cover`
- `author`
- `audioReady`
- `videoUrl`
- `audioUrl`

这些字段与当前后端实现不一致。

建议前端尽快统一为真实结构：

- `coverUrl`
- `normalizedVideoUrl`
- `availableActions`
- `audioSupported`
- `videoSupported`
- `message`

## 8.4 `done` 才是本轮结束信号

不要使用以下条件判断一轮完成：

- 连接关闭前没有新内容了
- 收到 `tool_result`
- 收到某一段 `reply_delta`

正确做法：

- 以 `done` 为完成信号
- 以 `error` 为失败信号

## 8.5 `tool_result` 可能为空

当用户消息中没有 URL 时：

- 不会收到 `tool_result`
- `done.parsedData` 也通常为 `null`

前端必须兼容普通文本对话场景。

## 8.6 当前没有下载直出接口信息

从 `AiChatController` 及其关联 VO 来看，当前 AI 对话流只负责：

- 给出结构化元数据
- 告知可用动作
- 生成自然语言回复

它不直接返回：

- 音频下载文件流
- 视频下载文件流

因此前端实现上应当把“AI 对话流”和“后续资源准备/下载接口”拆开。

## 8.7 用户输入预校验建议

虽然服务端会校验 `message` 非空，但前端仍建议先校验：

- 非空白
- 长度限制
- 避免重复点击发送

这样可以减少无效流连接。

---

## 9. 推荐的前端实现意见

## 9.1 API 层实现意见

建议在：

- `D:/JavaCodeStudy/wangyiyun-music-front/src/api/ai.js`

中单独维护 AI 流式接口，不要复用普通 Axios 实例。

建议能力：

- `streamAiChat(payload, handlers, signal)`
- `parseSseBlocks(buffer)`

建议事件处理回调：

- `onSession`
- `onProgress`
- `onReplyDelta`
- `onToolResult`
- `onDone`
- `onError`

说明：

- 当前可以移除 `onThinkingDelta`，或者保留但不期待后端触发

## 9.2 页面状态机实现意见

建议页面状态最少包含：

```ts
type StreamStatus = 'idle' | 'connecting' | 'streaming' | 'completed' | 'error'
```

每轮助手消息建议维护：

```ts
interface AssistantMessageState {
	status: StreamStatus
	content: string
	progressMessage: string
	thinkingSummary: string
	toolStatus: {
		status?: string
		warnings?: string[]
	} | null
	parsedData: {
		title?: string
		coverUrl?: string
		duration?: number
		platform?: string
		normalizedVideoUrl?: string
		availableActions?: string[]
		audioSupported?: boolean
		videoSupported?: boolean
		sourceVideoId?: string
		message?: string
	} | null
	errorMessage: string
}
```

推荐状态流转：

```text
idle
-> connecting
-> streaming
-> completed
or
-> error
```

## 9.3 页面渲染实现意见

聊天区建议分三块展示：

1. 进度区
   - 展示 `progress.message`
2. 回复区
   - 增量拼接 `reply_delta.delta`
3. 结构化结果区
   - 展示 `parsedData`

结构化卡片建议至少展示：

- 标题 `title`
- 封面 `coverUrl`
- 平台 `platform`
- 时长 `duration`
- 原始视频 ID `sourceVideoId`
- 可用动作 `availableActions`
- 后端提示 `message`

## 9.4 会话管理实现意见

建议前端：

- 在页面状态中保存 `sessionId`
- 下一轮发送时透传 `sessionId`

如果产品需要刷新后继续：

- 可以落 localStorage

但要明确告知：

- 后端只做内存会话
- 服务重启后上下文会丢失

## 9.5 解析结果后续动作实现意见

当前 `parsedData.availableActions` 已经明确告诉前端有哪些后续能力。

建议前端据此决定按钮显隐，而不是硬编码。

例如：

- 包含 `AUDIO_PREPARE` 时显示“准备音频”
- 包含 `VIDEO_DOWNLOAD` 时显示“下载视频”

同时结合：

- `audioSupported`
- `videoSupported`

做最终按钮禁用控制。

## 9.6 错误处理实现意见

建议区分三类错误：

1. HTTP 错误
   - 如 400、500
2. SSE 业务错误
   - 收到 `event: error`
3. 前端流解析错误
   - 比如 JSON 解析失败、网络中断、Abort

推荐处理方式：

- HTTP 错误：优先读取 JSON message
- SSE 错误：更新消息失败态
- Abort：标记为用户主动中断，不弹系统错误

## 9.7 兼容性实现意见

建议 API 解析层做以下保护：

- 忽略未知事件名
- 忽略空 `data`
- 忽略注释行
- 不因为单条事件解析失败而让整个流崩掉

这是因为 SSE 在后续扩展时，事件种类可能增加。

---

## 10. 推荐请求/消费示例

```js
export async function streamAiChat(payload, handlers = {}, signal) {
	const response = await fetch('/api/ai/chat/stream', {
		method: 'POST',
		headers: {
			Accept: 'text/event-stream',
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(payload),
		signal,
	})

	if (!response.ok) {
		const errorResult = await response.json().catch(() => null)
		throw new Error(errorResult?.message || '流式请求失败')
	}

	if (!response.body) {
		throw new Error('当前浏览器不支持流式读取')
	}

	const reader = response.body.getReader()
	const decoder = new TextDecoder('utf-8')
	let buffer = ''

	while (true) {
		const { value, done } = await reader.read()

		if (done) {
			buffer += decoder.decode()
			break
		}

		buffer += decoder.decode(value, { stream: true })
		const { events, rest } = parseSseBlocks(buffer)
		buffer = rest

		for (const item of events) {
			switch (item.event) {
				case 'session':
					handlers.onSession?.(item.data)
					break
				case 'progress':
					handlers.onProgress?.(item.data)
					break
				case 'reply_delta':
					handlers.onReplyDelta?.(item.data)
					break
				case 'tool_result':
					handlers.onToolResult?.(item.data)
					break
				case 'done':
					handlers.onDone?.(item.data)
					break
				case 'error':
					handlers.onError?.(item.data)
					break
				default:
					break
			}
		}
	}
}
```

`parseSseBlocks` 需要注意：

- 以空行切事件块
- 支持 `\r\n`
- 忽略注释行
- 只解析 `event:` 和 `data:`

---

## 11. 与当前前端代码的差异建议

当前前端文件：

- `D:/JavaCodeStudy/wangyiyun-music-front/src/api/ai.js`
- `D:/JavaCodeStudy/wangyiyun-music-front/src/views/AiParser.vue`

存在以下明显不一致：

| 前端当前假设                   | 后端当前真实实现                                     |
| ------------------------------ | ---------------------------------------------------- |
| 会收到 `thinking_delta`        | 当前不会发送                                         |
| `parsedData.cover`             | 实际是 `parsedData.coverUrl`                         |
| `parsedData.shareUrl`          | 实际是 `parsedData.normalizedVideoUrl`               |
| `parsedData.author`            | 当前未返回                                           |
| `parsedData.audioReady`        | 当前未返回                                           |
| `parsedData.videoUrl/audioUrl` | 当前未返回                                           |
| 下载逻辑基于 `shareUrl`        | 当前 AI 对话流仅提供 `normalizedVideoUrl` 和动作建议 |

实现建议：

1. 先以本文档修正文档与类型定义
2. 再同步调整 `src/api/ai.js`
3. 最后调整 `AiParser.vue` 的字段映射和按钮逻辑

这样改动面最小，也最符合 KISS 和 DRY。

---

## 12. 总结

当前 `AiChatController` 对前端暴露的是一个典型的：

- `POST`
- `JSON 请求体`
- `SSE 流式返回`

接口。

前端接入时最重要的不是“怎么把流读出来”，而是准确理解当前真实协议：

- 正常时返回 SSE，不走统一 `Result`
- 事件核心是 `session / progress / tool_result / reply_delta / done / error`
- 当前没有 `thinking_delta`
- 当前 `parsedData` 字段是 `VideoParseResultVO`，不能继续按旧字段消费

如果前端严格按本文档实现，能够稳定完成：

- AI 文本流渲染
- 视频解析结果展示
- 会话续传
- 错误处理

如果要进一步完善，优先建议下一步做两件事：

1. 统一前后端 `parsedData` 类型定义，避免继续漂移
2. 明确“后续音频准备/视频下载”接口契约，避免 AI 对话页自行猜测下载字段
