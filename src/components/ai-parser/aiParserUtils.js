/**
 * 从模型回复中拆分思考块和最终回答
 * 当前后端未单独发送 thinking 事件，因此需要在前端消费 reply 时剥离 <think> 块。
 * @param {string} text
 * @returns {{ replyText: string, thinkText: string }}
 */
export function splitReplyAndThink(text) {
	if (!text) {
		return {
			replyText: '',
			thinkText: '',
		}
	}

	let replyText = ''
	let thinkText = ''
	let cursor = 0

	while (cursor < text.length) {
		const openIndex = text.indexOf('<think>', cursor)
		if (openIndex === -1) {
			replyText += text.slice(cursor)
			break
		}

		replyText += text.slice(cursor, openIndex)
		const thinkStart = openIndex + '<think>'.length
		const closeIndex = text.indexOf('</think>', thinkStart)

		if (closeIndex === -1) {
			thinkText += text.slice(thinkStart)
			break
		}

		thinkText += text.slice(thinkStart, closeIndex)
		cursor = closeIndex + '</think>'.length
	}

	return {
		replyText: replyText.replace(/<\/?think>/g, '').trim(),
		thinkText: thinkText.trim(),
	}
}

export function assistantStatusLabel(status) {
	const labelMap = {
		connecting: '连接中',
		streaming: '生成中',
		completed: '已完成',
		error: '失败',
	}

	return labelMap[status] || '处理中'
}

export function getThinkingLabel(item) {
	return item.status === 'completed' ? '思考过程' : '正在思考'
}

export function shouldShowThinkingPanel(item) {
	return Boolean(item?.progressMessage || item?.thinkingText)
}

export function getAssistantDisplayText(item) {
	if (item.content) {
		return item.content
	}

	if (item.errorMessage) {
		return '本轮解析未能完整返回，你可以调整链接后继续追问。'
	}

	if (item.progressMessage) {
		return item.progressMessage
	}

	if (item.parsedData) {
		return '已收到结构化结果，可按当前协议继续播放或下载资源。'
	}

	return 'AI 正在准备回复...'
}

export function getMessageWarnings(item) {
	const warnings = item.toolStatus?.warnings || item.parsedData?.warnings || []
	return Array.isArray(warnings) ? warnings.filter(Boolean) : []
}

export function showMessageWarning(item) {
	return item.toolStatus?.status === 'suspect' || getMessageWarnings(item).length > 0
}

export function getWarningText(item) {
	const segments = []

	if (item.toolStatus?.status === 'suspect') {
		segments.push('当前结果可信度待确认，请谨慎下载。')
	}

	const warnings = getMessageWarnings(item)
	if (warnings.length) {
		segments.push(warnings.join('；'))
	}

	return segments.join(' ')
}

export function getRiskText(item, hasAnyFollowupAction) {
	if (item.toolStatus?.status === 'failed') {
		return '工具处理失败，当前结构化结果可能不可用，请重新解析或调整输入。'
	}

	if (showMessageWarning(item)) {
		return getWarningText(item)
	}

	if (!hasAnyFollowupAction(item)) {
		return '当前结果未返回可执行动作，请重新解析或继续追问。'
	}

	return '后续动作会根据 normalizedVideoUrl、platform 和 availableActions 调用现有视频接口。'
}

export function getToolStatusLabel(toolStatus) {
	if (!toolStatus?.status) {
		return '等待确认'
	}

	if (toolStatus.status === 'resolved') {
		return '已确认可用'
	}

	if (toolStatus.status === 'failed') {
		return '执行失败'
	}

	return `未知状态：${toolStatus.status}`
}

export function getParsedCover(item) {
	return item.parsedData?.coverUrl || ''
}

export function getParsedMeta(parsedData) {
	const segments = []

	if (parsedData?.platform) {
		segments.push(`平台 ${parsedData.platform}`)
	}

	if (parsedData?.sourceVideoId) {
		segments.push(`视频ID ${parsedData.sourceVideoId}`)
	}

	return segments.join(' · ') || '未返回平台或视频标识'
}

export function getSourceSummary(parsedData) {
	if (parsedData?.platform) {
		return parsedData.platform
	}

	if (!parsedData?.normalizedVideoUrl) {
		return 'AI 工具解析'
	}

	try {
		return new URL(parsedData.normalizedVideoUrl).hostname.replace(/^www\./, '')
	} catch {
		return parsedData.normalizedVideoUrl
	}
}

export function formatMessageDuration(duration) {
	if (duration !== 0 && !duration) {
		return '未知'
	}

	const normalizedDuration = duration >= 1000 ? Math.floor(duration / 1000) : duration
	const minutes = Math.floor(normalizedDuration / 60)
	const seconds = normalizedDuration % 60
	return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

export function hasAvailableAction(item, action) {
	return item.parsedData?.availableActions?.includes(action) ?? false
}

export function canPlayAudioMessage(item) {
	return Boolean(item.parsedData?.audioSupported) && hasAvailableAction(item, 'AUDIO_PREPARE')
}

export function canDownloadAudioMessage(item) {
	return Boolean(item.parsedData?.audioSupported) && hasAvailableAction(item, 'AUDIO_DOWNLOAD')
}

export function canDownloadVideoMessage(item) {
	return Boolean(item.parsedData?.videoSupported) && hasAvailableAction(item, 'VIDEO_DOWNLOAD')
}

export function hasAnyFollowupAction(item) {
	return canPlayAudioMessage(item) || canDownloadAudioMessage(item) || canDownloadVideoMessage(item)
}
