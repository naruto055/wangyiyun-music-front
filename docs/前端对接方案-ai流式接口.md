# 前端对接方案：`POST /api/ai/chat/stream`

## 1. 文档目标

本文档只面向前端对接 AI 流式对话接口：

- `POST /api/ai/chat/stream`

本文档重点说明：

- 如何用 `fetch + ReadableStream` 消费 SSE
- 如何处理接口中的 function calling 结果
- 如何从流式事件中拿到视频解析结果
- 如何基于解析结果衔接视频、音频下载

说明边界：

- 本文档不展开普通接口 `POST /api/ai/chat`
- 本文档不展开纯解析接口 `POST /api/parse`
- 下载能力仍然走现有统一入口 `GET /api/download`

---

## 2. 接口定位

该接口适合以下前端场景：

- 需要像聊天一样逐步展示 AI 回复
- 需要展示“分析中”“解析中”等过程状态
- 需要接收 function calling 的结构化结果
- 需要在解析完成后提供“下载视频”“下载音频”操作

和普通聊天接口相比，它的差异是：

- 普通接口一次性返回完整 JSON
- 流式接口通过 SSE 逐步返回 `session`、`progress`、`tool_result`、`reply_delta`、`done` 等事件

---

## 3. 请求定义

### 3.1 请求地址

```http
POST /api/ai/chat/stream
```

### 3.2 请求头

```http
Accept: text/event-stream
Content-Type: application/json
```

### 3.3 请求体

```json
{
  "message": "帮我解析这个抖音链接 https://v.douyin.com/xxxxx/",
  "sessionId": "optional-session-id"
}
```

请求参数：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `message` | `string` | 是 | 用户输入的自然语言消息，可包含抖音链接或分享文案 |
| `sessionId` | `string` | 否 | 会话 ID；不传时由后端生成 |

---

## 4. 响应头与传输方式

服务端会建立标准 SSE 响应：

```http
Content-Type: text/event-stream; charset=utf-8
Cache-Control: no-cache, no-transform
Connection: keep-alive
```

注意：

- 这是 `POST` 接口，不适合用浏览器原生 `EventSource`
- 前端应使用 `fetch + ReadableStream`
- 服务端会发送心跳注释行 `: keep-alive`，前端应忽略

---

## 5. 事件协议

### 5.1 事件总览

当前接口会输出以下事件：

| 事件名 | 说明 |
| --- | --- |
| `session` | 返回本次会话 ID |
| `progress` | 当前处理阶段提示 |
| `tool_result` | function calling 执行后的结构化解析结果 |
| `thinking_delta` | 思考内容增量 |
| `reply_delta` | 最终回复内容增量 |
| `done` | 最终完整结果 |
| `error` | 流式过程中发生错误 |

推荐前端处理原则：

- `reply_delta` 用于实时渲染聊天回答
- `tool_result` 用于更新视频卡片、下载按钮、媒体信息
- `done` 作为本轮消息完成信号

### 5.2 `session`

示例：

```text
event: session
data: {"sessionId":"f4df1d0b-cb2b-49ca-bfe3-7262d5e9ec67"}
```

用途：

- 保存本轮会话 ID
- 下次继续聊天时把该 `sessionId` 回传给后端

### 5.3 `progress`

示例：

```text
event: progress
data: {"stage":"model_start","message":"AI 正在分析输入"}
```

当前已确认的阶段值里，至少包含：

- `model_start`

前端建议：

- 直接展示 `message`
- 不要对 `stage` 做过度硬编码，只把它作为可选状态标识

### 5.4 `tool_result`

这是最关键的事件，它表示模型通过 function calling 调用了后端工具，或者后端 fallback 触发了解析，并返回了结构化结果。

示例：

```text
event: tool_result
data: {
  "parsedData": {
    "source": "puppeteer",
    "title": "示例标题",
    "author": "示例作者",
    "cover": "https://.../cover.jpg",
    "duration": 15000,
    "videoUrl": "https://.../video.mp4",
    "audioUrl": "https://.../audio.mp3",
    "audioReady": true,
    "shareUrl": "https://v.douyin.com/xxxxx/"
  },
  "toolStatus": {
    "status": "resolved",
    "warnings": []
  }
}
```

字段说明：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `parsedData` | `object \| null` | 解析出的结构化视频信息 |
| `toolStatus` | `object \| null` | 工具结果状态摘要 |
| `toolStatus.status` | `string` | 当前可能为 `resolved` 或 `suspect` |
| `toolStatus.warnings` | `string[]` | 告警列表，例如 `placeholder_share_url` |

`parsedData` 中前端重点使用字段：

| 字段 | 类型 | 用途 |
| --- | --- | --- |
| `title` | `string` | 视频标题展示、下载文件名候选 |
| `author` | `string` | 作者昵称展示 |
| `cover` | `string` | 封面图展示 |
| `duration` | `number` | 时长展示 |
| `videoUrl` | `string` | 仅用于理解解析结果，不建议前端直接拿它下载 |
| `audioUrl` | `string` | 仅用于理解解析结果，不建议前端直接拿它下载 |
| `audioReady` | `boolean` | 判断音频按钮文案与提示 |
| `shareUrl` | `string` | 前端调用 `/api/download` 时最重要的输入 |

### 5.5 `thinking_delta`

示例：

```text
event: thinking_delta
data: {"delta":"我先识别用户消息中的抖音链接。"}
```

前端建议：

- 如果产品不打算展示推理内容，可以直接忽略
- 如果需要展示“思考过程”，应单独渲染，不要混入最终回答正文

### 5.6 `reply_delta`

示例：

```text
event: reply_delta
data: {"delta":"解析成功，这个视频标题是示例标题。"}
```

前端建议：

- 把 `delta` 逐段拼接到当前 AI 回复文本
- 将它作为聊天区主渲染内容

### 5.7 `done`

示例：

```text
event: done
data: {
  "thinking": "...",
  "reply": "解析成功，这个视频标题是示例标题。",
  "sessionId": "f4df1d0b-cb2b-49ca-bfe3-7262d5e9ec67",
  "parsedData": {
    "title": "示例标题",
    "author": "示例作者",
    "shareUrl": "https://v.douyin.com/xxxxx/",
    "audioReady": true
  },
  "toolStatus": {
    "status": "resolved",
    "warnings": []
  }
}
```

用途：

- 标记本轮流式输出结束
- 以最终完整结果覆盖前面增量态数据
- 作为前端一次消息完成、可解锁输入框的信号

### 5.8 `error`

示例：

```text
event: error
data: {"error":"AI stream failed"}
```

注意：

- 一旦 SSE 已经建立，后端不会再切回普通 JSON
- 前端应把 `error` 视为流式失败事件，而不是 HTTP 失败

---

## 6. Function Calling 说明

### 6.1 前端应该如何理解

这个接口内部可能触发工具 `parse_douyin_video`。

它的作用是：

- 从用户消息中提取抖音链接或分享文案
- 调用后端解析逻辑
- 返回标题、作者、封面、视频地址、音频地址等结构化数据

对前端来说，不需要参与 function calling 的实现，只需要消费 `tool_result` 或 `done` 中的 `parsedData`。

前端真正需要关注的是：

1. 工具是否返回了 `parsedData`
2. `toolStatus.status` 是否为 `resolved`
3. `parsedData.shareUrl` 是否可用于后续下载

### 6.2 `toolStatus` 的使用建议

建议规则：

- `status === "resolved"`：按正常可下载状态处理
- `status === "suspect"`：允许展示结果，但应提示用户“解析结果可能不完整，请确认链接是否正确”

如果存在告警：

- `placeholder_share_url`

建议前端处理：

- 不直接隐藏下载按钮
- 但需要给出明显提示，提醒用户二次确认

---

## 7. 前端状态机建议

推荐将一次流式对话拆成这些状态：

- `idle`：未发送
- `connecting`：请求已发出，等待首个事件
- `streaming`：正在接收 `reply_delta`
- `tool_ready`：已经收到 `tool_result`
- `completed`：收到 `done`
- `error`：收到 `error` 或请求失败

推荐维护的数据：

```ts
interface StreamChatState {
  sessionId: string;
  progressMessage: string;
  thinkingText: string;
  replyText: string;
  parsedData: ParseResult | null;
  toolStatus: ToolStatus | null;
  status: 'idle' | 'connecting' | 'streaming' | 'tool_ready' | 'completed' | 'error';
}
```

---

## 8. TypeScript 类型建议

```ts
export interface ToolStatus {
  status: 'resolved' | 'suspect';
  warnings: string[];
}

export interface ParseResult {
  source?: string;
  title?: string;
  author?: string;
  cover?: string;
  duration?: number;
  videoUrl?: string;
  audioUrl?: string;
  audioReady?: boolean;
  shareUrl?: string;
}

export interface StreamDonePayload {
  thinking: string;
  reply: string;
  sessionId: string;
  parsedData: ParseResult | null;
  toolStatus: ToolStatus | null;
}

export interface StreamEventMap {
  session: { sessionId: string };
  progress: { stage?: string; message?: string };
  thinking_delta: { delta: string };
  reply_delta: { delta: string };
  tool_result: { parsedData: ParseResult | null; toolStatus: ToolStatus | null };
  done: StreamDonePayload;
  error: { error: string };
}
```

---

## 9. 前端接入示例

### 9.1 基础版 SSE 消费

```ts
type StreamHandlers = {
  onSession?: (payload: StreamEventMap['session']) => void;
  onProgress?: (payload: StreamEventMap['progress']) => void;
  onThinkingDelta?: (payload: StreamEventMap['thinking_delta']) => void;
  onReplyDelta?: (payload: StreamEventMap['reply_delta']) => void;
  onToolResult?: (payload: StreamEventMap['tool_result']) => void;
  onDone?: (payload: StreamEventMap['done']) => void;
  onError?: (payload: { error: string }) => void;
};

function parseSSEBlocks(buffer: string) {
  const chunks = buffer.split('\n\n');
  const complete = chunks.slice(0, -1);
  const rest = chunks[chunks.length - 1] || '';

  const events = complete
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => {
      const lines = block.split('\n');
      const eventLine = lines.find((line) => line.startsWith('event:'));
      const dataLine = lines.find((line) => line.startsWith('data:'));

      if (!eventLine || !dataLine) {
        return null;
      }

      return {
        event: eventLine.slice(6).trim(),
        data: JSON.parse(dataLine.slice(5).trim())
      };
    })
    .filter(Boolean);

  return { events, rest };
}

export async function streamChat(
  payload: { message: string; sessionId?: string },
  handlers: StreamHandlers = {}
) {
  const response = await fetch('/api/ai/chat/stream', {
    method: 'POST',
    headers: {
      Accept: 'text/event-stream',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorResult = await response.json().catch(() => null);
    throw new Error(errorResult?.message || '流式请求失败');
  }

  if (!response.body) {
    throw new Error('当前浏览器不支持流式读取');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder('utf-8');
  let buffer = '';

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const parsed = parseSSEBlocks(buffer);
    buffer = parsed.rest;

    for (const item of parsed.events) {
      if (!item) continue;

      switch (item.event) {
        case 'session':
          handlers.onSession?.(item.data);
          break;
        case 'progress':
          handlers.onProgress?.(item.data);
          break;
        case 'thinking_delta':
          handlers.onThinkingDelta?.(item.data);
          break;
        case 'reply_delta':
          handlers.onReplyDelta?.(item.data);
          break;
        case 'tool_result':
          handlers.onToolResult?.(item.data);
          break;
        case 'done':
          handlers.onDone?.(item.data);
          break;
        case 'error':
          handlers.onError?.(item.data);
          break;
        default:
          break;
      }
    }
  }
}
```

### 9.2 推荐的页面处理方式

推荐逻辑：

1. 发送消息后先进入 `connecting`
2. 收到 `session` 后保存 `sessionId`
3. 收到 `progress` 后刷新顶部状态文案
4. 收到 `reply_delta` 后增量渲染 AI 回复
5. 收到 `tool_result` 后渲染视频信息卡片
6. 收到 `done` 后把消息状态切到完成

---

## 10. 下载处理方案

### 10.1 结论先行

前端不要直接使用 `parsedData.videoUrl` 或 `parsedData.audioUrl` 作为最终下载入口。

正确做法是：

- 视频下载：调用 `GET /api/download?type=video&url=${shareUrl}&title=${title}`
- 音频下载：调用 `GET /api/download?type=audio&url=${shareUrl}&title=${title}`

原因：

- `/api/download` 会统一复用后端解析与缓存逻辑
- 音频场景下，后端可能需要走“直接音频流”或“从视频提取音频”两种路径
- 前端直接使用 `audioUrl` / `videoUrl` 会绕过后端稳定契约

### 10.2 下载按钮展示建议

收到 `tool_result` 或 `done` 后，如果存在 `parsedData.shareUrl`，就可以展示下载按钮。

推荐规则：

- 永远基于 `shareUrl` 构造下载地址
- 视频按钮：默认展示
- 音频按钮：
  - `audioReady === true` 时文案用“下载原声音频”
  - 否则文案用“提取并下载音频”

### 10.3 下载 URL 构造示例

```ts
export function buildDownloadUrl(params: {
  type: 'video' | 'audio';
  shareUrl: string;
  title?: string;
}) {
  const search = new URLSearchParams({
    type: params.type,
    url: params.shareUrl
  });

  if (params.title) {
    search.set('title', params.title);
  }

  return `/api/download?${search.toString()}`;
}
```

### 10.4 推荐下载方式：`fetch + blob`

原因：

- 能统一处理 JSON 错误响应
- 能在页面内控制 loading、重试和提示文案
- 能避免浏览器直接跳到错误页

```ts
function getFilenameFromDisposition(disposition: string | null, fallback: string) {
  if (!disposition) return fallback;

  const match = disposition.match(/filename=\"?([^\";]+)\"?/i);
  if (!match) return fallback;

  try {
    return decodeURIComponent(match[1]);
  } catch {
    return match[1];
  }
}

export async function downloadParsedMedia(params: {
  type: 'video' | 'audio';
  shareUrl: string;
  title?: string;
}) {
  const response = await fetch(buildDownloadUrl(params));
  const contentType = response.headers.get('content-type') || '';

  if (!response.ok || contentType.includes('application/json')) {
    const errorResult = await response.json().catch(() => null);
    throw new Error(errorResult?.message || '下载失败');
  }

  const blob = await response.blob();
  const disposition = response.headers.get('content-disposition');
  const defaultName = `${params.title || 'douyin'}.${params.type === 'video' ? 'mp4' : 'mp3'}`;
  const filename = getFilenameFromDisposition(disposition, defaultName);

  const blobUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = blobUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(blobUrl);
}
```

### 10.5 前端必须处理的下载风险

前端需要显式考虑这些情况：

- 用户点击下载时，`shareUrl` 为空
- `toolStatus.status === 'suspect'`
- 音频按钮点击后，服务端提取音频耗时更长
- 下载接口失败时返回的是 JSON，而不是文件流

建议的产品提示：

- `shareUrl` 缺失：`当前解析结果缺少可下载链接，请重新解析`
- `status === suspect`：`解析结果可能不完整，请确认链接后再下载`
- 音频提取中：`正在准备音频文件，请稍候`

---

## 11. 会话续聊建议

如果产品是多轮聊天，前端必须保存 `sessionId`。

推荐方式：

- 当前聊天窗口内保存在状态管理中
- 刷新页面前如果需要延续上下文，可保存到本地存储

续聊时：

- 下一次调用 `/api/ai/chat/stream`，把上次拿到的 `sessionId` 带回去

不带 `sessionId` 的效果：

- 后端会新建一轮会话
- 之前的上下文不会参与本轮 AI 回复

---

## 12. 错误处理建议

### 12.1 建连前错误

如果请求还没建立 SSE，就可能直接收到普通 JSON 错误，例如：

```json
{
  "code": 400,
  "message": "message is required",
  "data": null
}
```

前端处理：

- 先判断 `response.ok`
- 若失败，优先按 JSON 解析错误信息

### 12.2 流中错误

如果 SSE 已经建立，后端会发：

```text
event: error
data: {"error":"AI stream failed"}
```

前端处理：

- 停止继续等待新内容
- 把当前消息标记为失败态
- 允许用户重试

### 12.3 限流

AI 接口会走独立限流。

前端建议提示：

- `请求过于频繁，请稍后再试`

---

## 13. 前端最小落地流程

```text
用户输入消息
-> 调用 POST /api/ai/chat/stream
-> 读取 session / progress / reply_delta
-> 如果收到 tool_result，则渲染视频卡片和下载按钮
-> 如果收到 done，则完成本轮消息
-> 用户点击下载按钮
-> 调用 GET /api/download 下载视频或音频
```

---

## 14. 结论

前端对接这个接口时，应把它理解为“两条数据流并行输出”：

- 一条是聊天文本流：`thinking_delta`、`reply_delta`
- 一条是工具结果流：`tool_result`、`done.parsedData`

最稳妥的接入方式是：

1. 用 `fetch + ReadableStream` 消费 `/api/ai/chat/stream`
2. 用 `tool_result` 驱动视频卡片和下载按钮状态
3. 下载统一走 `/api/download`
4. 不直接使用 `videoUrl`、`audioUrl` 作为前端最终下载入口
