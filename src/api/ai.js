/**
 * AI 流式解析相关工具
 */

const AI_STREAM_URL = '/api/ai/chat/stream'
const SUPPORTED_STREAM_EVENTS = new Set(['session', 'progress', 'reply_delta', 'tool_result', 'done', 'error'])

/**
 * 解析 SSE 事件块
 * @param {string} buffer - 当前缓冲文本
 * @returns {{ events: Array<{ event: string, data: any }>, rest: string }}
 */
export function parseSseBlocks(buffer) {
	const normalizedBuffer = buffer.replace(/\r\n/g, '\n').replace(/\r/g, '\n')
	const chunks = normalizedBuffer.split('\n\n')
	const completeBlocks = chunks.slice(0, -1)
	const rest = chunks[chunks.length - 1] || ''
	const events = []

	for (const block of completeBlocks) {
		if (!block.trim()) {
			continue
		}

		let eventName = ''
		const dataLines = []

		for (const rawLine of block.split('\n')) {
			const line = rawLine.trim()

			if (!line || line.startsWith(':')) {
				continue
			}

			if (line.startsWith('event:')) {
				eventName = line.slice(6).trim()
				continue
			}

			if (line.startsWith('data:')) {
				dataLines.push(line.slice(5).trim())
			}
		}

		if (!eventName || !SUPPORTED_STREAM_EVENTS.has(eventName) || dataLines.length === 0) {
			continue
		}

		try {
			events.push({
				event: eventName,
				data: JSON.parse(dataLines.join('\n')),
			})
		} catch {
			// 单条事件解析失败时直接忽略，避免整条流中断
		}
	}

	return { events, rest }
}

/**
 * 发起 AI 流式对话
 * @param {{ message: string, sessionId?: string }} payload
 * @param {{
 *   onSession?: (payload: { sessionId: string }) => void,
 *   onProgress?: (payload: { stage?: string, message?: string }) => void,
 *   onReplyDelta?: (payload: { delta: string }) => void,
 *   onToolResult?: (payload: { parsedData: object | null, toolStatus: object | null }) => void,
 *   onDone?: (payload: { thinking?: string, reply?: string, sessionId?: string, toolStatus?: object | null, parsedData?: object | null }) => void,
 *   onError?: (payload: { error: string }) => void,
 * }} handlers
 * @param {AbortSignal} [signal]
 */
export async function streamAiChat(payload, handlers = {}, signal) {
	const response = await fetch(AI_STREAM_URL, {
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

	// 统一在一处处理事件分发，避免收尾阶段漏掉已支持事件
	const dispatchEvent = (item) => {
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
		const parsed = parseSseBlocks(buffer)
		buffer = parsed.rest

		for (const item of parsed.events) {
			dispatchEvent(item)
		}
	}

	if (buffer.trim()) {
		const parsed = parseSseBlocks(`${buffer}\n\n`)
		for (const item of parsed.events) {
			dispatchEvent(item)
		}
	}
}
