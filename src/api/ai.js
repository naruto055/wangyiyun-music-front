/**
 * AI 流式解析相关工具
 */

/**
 * 解析 SSE 事件块
 * @param {string} buffer - 当前缓冲文本
 * @returns {{ events: Array<{ event: string, data: any }>, rest: string }}
 */
export function parseSseBlocks(buffer) {
	const normalizedBuffer = buffer.replace(/\r\n/g, '\n')
	const chunks = normalizedBuffer.split('\n\n')
	const completeBlocks = chunks.slice(0, -1)
	const rest = chunks[chunks.length - 1] || ''

	const events = completeBlocks
		.map((block) => block.trim())
		.filter(Boolean)
		.map((block) => {
			const lines = block
				.split('\n')
				.map((line) => line.trim())
				.filter((line) => line && !line.startsWith(':'))

			const eventLine = lines.find((line) => line.startsWith('event:'))
			const dataLine = lines.find((line) => line.startsWith('data:'))

			if (!eventLine || !dataLine) {
				return null
			}

			try {
				return {
					event: eventLine.slice(6).trim(),
					data: JSON.parse(dataLine.slice(5).trim()),
				}
			} catch {
				return null
			}
		})
		.filter(Boolean)

	return { events, rest }
}

/**
 * 构造下载地址
 * @param {{ type: 'video' | 'audio', shareUrl: string, title?: string }} params
 * @returns {string}
 */
export function buildDownloadUrl(params) {
	const search = new URLSearchParams({
		type: params.type,
		url: params.shareUrl,
	})

	if (params.title) {
		search.set('title', params.title)
	}

	return `/ai-api/download?${search.toString()}`
}

/**
 * 从 Content-Disposition 获取文件名
 * @param {string | null} disposition
 * @param {string} fallback
 * @returns {string}
 */
export function getFilenameFromDisposition(disposition, fallback) {
	if (!disposition) return fallback

	const match = disposition.match(/filename\*?=(?:UTF-8'')?"?([^";]+)"?/i)
	if (!match) return fallback

	try {
		return decodeURIComponent(match[1])
	} catch {
		return match[1]
	}
}

/**
 * 发起 AI 流式对话
 * @param {{ message: string, sessionId?: string }} payload
 * @param {{
 *   onSession?: (payload: { sessionId: string }) => void,
 *   onProgress?: (payload: { stage?: string, message?: string }) => void,
 *   onThinkingDelta?: (payload: { delta: string }) => void,
 *   onReplyDelta?: (payload: { delta: string }) => void,
 *   onToolResult?: (payload: { parsedData: object | null, toolStatus: object | null }) => void,
 *   onDone?: (payload: object) => void,
 *   onError?: (payload: { error: string }) => void,
 * }} handlers
 * @param {AbortSignal} [signal]
 */
export async function streamAiChat(payload, handlers = {}, signal) {
	const response = await fetch('/ai-api/ai/chat/stream', {
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
		const parsed = parseSseBlocks(buffer)
		buffer = parsed.rest

		for (const item of parsed.events) {
			switch (item.event) {
				case 'session':
					handlers.onSession?.(item.data)
					break
				case 'progress':
					handlers.onProgress?.(item.data)
					break
				case 'thinking_delta':
					handlers.onThinkingDelta?.(item.data)
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

	if (buffer.trim()) {
		const parsed = parseSseBlocks(`${buffer}\n\n`)
		for (const item of parsed.events) {
			if (item.event === 'done') {
				handlers.onDone?.(item.data)
			}
		}
	}
}

/**
 * 下载解析后的媒体资源
 * @param {{ type: 'video' | 'audio', shareUrl: string, title?: string }} params
 */
export async function downloadParsedMedia(params) {
	const response = await fetch(buildDownloadUrl(params))
	const contentType = response.headers.get('content-type') || ''

	if (!response.ok || contentType.includes('application/json')) {
		const errorResult = await response.json().catch(() => null)
		throw new Error(errorResult?.message || '下载失败')
	}

	const blob = await response.blob()
	const disposition = response.headers.get('content-disposition')
	const extension = params.type === 'video' ? 'mp4' : 'mp3'
	const fallback = `${params.title || 'media'}.${extension}`
	const filename = getFilenameFromDisposition(disposition, fallback)

	const blobUrl = URL.createObjectURL(blob)
	const link = document.createElement('a')
	link.href = blobUrl
	link.download = filename
	document.body.appendChild(link)
	link.click()
	link.remove()
	URL.revokeObjectURL(blobUrl)
}
