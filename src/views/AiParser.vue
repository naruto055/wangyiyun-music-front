<template>
	<div class="min-h-screen bg-background">
		<Header />

		<main
			class="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-5xl flex-col px-4 pt-6 transition-[padding-bottom] duration-200"
			:class="hasActivePlayer ? 'pb-[17rem] md:pb-[18rem]' : 'pb-44'"
		>
			<AiParserHeader
				:session-id="sessionId"
				:short-session-id="shortSessionId"
				:has-messages="messages.length > 0"
				@reset-conversation="resetConversation"
			/>

			<section class="flex-1 space-y-6 pb-6">
				<AiParserEmptyState v-if="!messages.length" />

				<AiChatMessageItem
					v-for="item in messages"
					:key="item.id"
					:item="item"
					:is-download-pending="isDownloadPending"
					@toggle-thinking="toggleThinking"
					@play-audio="handlePlayAudio"
					@download="({ item: messageItem, type }) => handleDownload(messageItem, type)"
				/>
			</section>

			<AiParserComposer
				v-model:message="message"
				:is-sending="isSending"
				:can-submit="canSubmit"
				:input-status-label="inputStatusLabel"
				:input-status-hint="inputStatusHint"
				:has-active-player="hasActivePlayer"
				@submit="handleSubmit"
			/>
		</main>
	</div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { streamAiChat } from '@/api/ai'
import { downloadVideo, prepareAudio } from '@/api/video'
import { useToast } from '@/composables/useToast'
import { usePlayerStore } from '@/stores/player'
import { adaptVideoToTrack } from '@/utils/trackAdapter'
import Header from '@/components/layout/Header.vue'
import AiChatMessageItem from '@/components/ai-parser/AiChatMessageItem.vue'
import AiParserComposer from '@/components/ai-parser/AiParserComposer.vue'
import AiParserEmptyState from '@/components/ai-parser/AiParserEmptyState.vue'
import AiParserHeader from '@/components/ai-parser/AiParserHeader.vue'
import { canDownloadAudioMessage, canDownloadVideoMessage, canPlayAudioMessage, splitReplyAndThink } from '@/components/ai-parser/aiParserUtils.js'

const toast = useToast()
const playerStore = usePlayerStore()

const message = ref('')
const sessionId = ref('')
const sendingState = ref('idle')
const messages = ref([])
const activeAssistantMessageId = ref('')
const pendingDownloads = ref({})

let activeController = null

const isSending = computed(() => ['connecting', 'streaming'].includes(sendingState.value))
const canSubmit = computed(() => message.value.trim().length > 0 && !isSending.value)
const hasActivePlayer = computed(() => Boolean(playerStore.currentTrack))
const shortSessionId = computed(() => sessionId.value.slice(0, 8))
const inputStatusLabel = computed(() => {
	const labelMap = {
		idle: '准备开始新的解析',
		connecting: '正在建立流式连接',
		streaming: 'AI 正在生成回复',
	}

	return labelMap[sendingState.value] || '准备开始新的解析'
})
const inputStatusHint = computed(() => {
	if (isSending.value) {
		return 'AI 正在处理当前输入，完成后会在消息上方展示思考过程。'
	}

	if (sessionId.value) {
		return '当前清空仅清除前端消息流，会继续复用已有会话上下文。'
	}

	return '输入链接或分享文案后，AI 会把正文、过程和解析结果写入同一条消息。'
})

function createMessageId(prefix) {
	return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`
}

function createUserMessage(content) {
	return {
		id: createMessageId('user'),
		role: 'user',
		content,
		createdAt: Date.now(),
	}
}

function createAssistantMessage() {
	return {
		id: createMessageId('assistant'),
		role: 'assistant',
		content: '',
		rawReplyText: '',
		createdAt: Date.now(),
		status: 'connecting',
		progressMessage: '正在建立连接...',
		thinkingText: '',
		thinkingExpanded: false,
		parsedData: null,
		toolStatus: null,
		errorMessage: '',
		preparedAudioResource: null,
	}
}

function buildCompletedProgressMessage(payload) {
	if (payload?.parsedData?.title) {
		return '解析完成，已生成结果卡片'
	}

	if (payload?.reply) {
		return '回答已完成'
	}

	return '本轮处理已完成'
}

function getComposerLiftOffset() {
	return window.innerWidth >= 768 ? 92 : 84
}

function isViewportNearBottom(threshold = 320) {
	const { scrollTop, scrollHeight, clientHeight } = document.documentElement
	return scrollTop + clientHeight >= scrollHeight - threshold
}

function applyReplySegments(target, replyText, fallbackThinking = '') {
	const { replyText: cleanReplyText, thinkText } = splitReplyAndThink(replyText)
	target.content = cleanReplyText
	target.thinkingText = thinkText || fallbackThinking || target.thinkingText
}

function updateMessageById(messageId, updater) {
	const target = messages.value.find((item) => item.id === messageId)
	if (!target) {
		return
	}

	updater(target)
}

function appendConversationTurn(content) {
	const userMessage = createUserMessage(content)
	const assistantMessage = createAssistantMessage()
	messages.value.push(userMessage, assistantMessage)
	activeAssistantMessageId.value = assistantMessage.id
	return assistantMessage.id
}

function isDownloadPending(item, type) {
	return Boolean(pendingDownloads.value[`${item.id}:${type}`])
}

function buildMediaRequestPayload(item, extra = {}) {
	return {
		videoUrl: item.parsedData?.normalizedVideoUrl,
		platform: item.parsedData?.platform,
		...extra,
	}
}

function isPreparedAudioExpired(audioResource) {
	if (!audioResource?.audioUrl) {
		return true
	}

	if (!audioResource.expiresAt) {
		return false
	}

	return new Date(audioResource.expiresAt).getTime() <= Date.now()
}

async function prepareAudioResource(item, pendingType, options = {}) {
	if (!canPlayAudioMessage(item) && !canDownloadAudioMessage(item)) {
		toast.warning('当前结果暂不支持准备音频')
		return null
	}

	if (!item.parsedData?.normalizedVideoUrl || !item.parsedData?.platform) {
		toast.warning('当前结果缺少规范化链接或平台信息')
		return null
	}

	const { forceRefresh = false } = options
	if (!forceRefresh && item.preparedAudioResource && !isPreparedAudioExpired(item.preparedAudioResource)) {
		return item.preparedAudioResource
	}

	const downloadKey = `${item.id}:${pendingType}`
	pendingDownloads.value = {
		...pendingDownloads.value,
		[downloadKey]: true,
	}

	try {
		const audioResult = await prepareAudio({
			...buildMediaRequestPayload(item),
			preferredAudioFormat: 'mp3',
		})

		updateMessageById(item.id, (target) => {
			target.preparedAudioResource = audioResult
		})

		return audioResult
	} finally {
		const nextPendingDownloads = { ...pendingDownloads.value }
		delete nextPendingDownloads[downloadKey]
		pendingDownloads.value = nextPendingDownloads
	}
}

async function downloadTemporaryFile(resourceUrl, fileName) {
	const resourcePath = resourceUrl.replace(/^https?:\/\/[^/]+/, '')
	const response = await fetch(resourcePath)

	if (!response.ok) {
		throw new Error(`资源下载失败(${response.status})`)
	}

	const blob = await response.blob()
	const blobUrl = window.URL.createObjectURL(blob)
	const link = document.createElement('a')
	link.href = blobUrl
	link.download = fileName
	link.style.display = 'none'
	document.body.appendChild(link)
	link.click()
	document.body.removeChild(link)
	window.URL.revokeObjectURL(blobUrl)
}

function toggleThinking(messageId) {
	updateMessageById(messageId, (target) => {
		target.thinkingExpanded = !target.thinkingExpanded
	})
}

function abortActiveStream({ preserveMessage = true, progressMessage = '已停止生成' } = {}) {
	if (!activeController) {
		return
	}

	if (preserveMessage && activeAssistantMessageId.value) {
		updateMessageById(activeAssistantMessageId.value, (target) => {
			if (target.status === 'connecting' || target.status === 'streaming') {
				target.status = 'completed'
				target.progressMessage = progressMessage || target.progressMessage
			}
		})
	}

	activeController.abort()
	activeController = null
	activeAssistantMessageId.value = ''
}

function releaseActiveStream(controller, assistantMessageId) {
	if (activeController !== controller) {
		return
	}

	sendingState.value = 'idle'
	activeController = null

	if (activeAssistantMessageId.value === assistantMessageId) {
		activeAssistantMessageId.value = ''
	}
}

function failActiveStream(controller, assistantMessageId) {
	releaseActiveStream(controller, assistantMessageId)

	if (!controller.signal.aborted) {
		controller.abort()
	}
}

function resetConversation() {
	abortActiveStream({ preserveMessage: false })
	messages.value = []
	message.value = ''
	sendingState.value = 'idle'
	pendingDownloads.value = {}
}

async function handleSubmit() {
	const trimmedMessage = message.value.trim()
	if (!trimmedMessage) {
		toast.warning('请输入解析内容')
		return
	}

	abortActiveStream()

	const assistantMessageId = appendConversationTurn(trimmedMessage)
	const controller = new AbortController()
	activeController = controller
	message.value = ''
	sendingState.value = 'connecting'

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
					sendingState.value = 'streaming'
					updateMessageById(assistantMessageId, (target) => {
						target.status = 'streaming'
						target.progressMessage = nextMessage || '正在处理...'
					})
				},
				onReplyDelta: ({ delta }) => {
					sendingState.value = 'streaming'
					updateMessageById(assistantMessageId, (target) => {
						target.status = 'streaming'
						target.rawReplyText += delta || ''
						applyReplySegments(target, target.rawReplyText)
					})
				},
				onToolResult: ({ parsedData, toolStatus }) => {
					sendingState.value = 'streaming'
					updateMessageById(assistantMessageId, (target) => {
						target.status = 'streaming'
						target.parsedData = parsedData || null
						target.toolStatus = toolStatus || null
					})
				},
				onDone: (payload) => {
					sessionId.value = payload.sessionId || sessionId.value
					updateMessageById(assistantMessageId, (target) => {
						target.status = 'completed'
						target.rawReplyText = payload.reply || target.rawReplyText
						applyReplySegments(target, target.rawReplyText, payload.thinking || '')
						target.progressMessage = buildCompletedProgressMessage(payload)
						target.parsedData = payload.parsedData || target.parsedData
						target.toolStatus = payload.toolStatus || target.toolStatus
					})
				},
				onError: ({ error }) => {
					updateMessageById(assistantMessageId, (target) => {
						target.status = 'error'
						target.errorMessage = error || '流式请求失败'
					})
					failActiveStream(controller, assistantMessageId)
				},
			},
			controller.signal
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
		releaseActiveStream(controller, assistantMessageId)
	}
}

async function handleDownload(item, type) {
	try {
		if (type === 'audio') {
			if (!canDownloadAudioMessage(item)) {
				toast.warning('当前结果暂不支持下载音频')
				return
			}

			const audioResult = await prepareAudioResource(item, 'audio')
			if (!audioResult) return

			await downloadTemporaryFile(audioResult.audioUrl, `${audioResult.title}.${audioResult.audioFormat}`)
			toast.success('音频资源已开始下载')
			return
		}

		if (!canDownloadVideoMessage(item)) {
			toast.warning('当前结果暂不支持下载视频')
			return
		}

		if (!item.parsedData?.normalizedVideoUrl || !item.parsedData?.platform) {
			toast.warning('当前结果缺少规范化链接或平台信息')
			return
		}

		const downloadKey = `${item.id}:video`
		pendingDownloads.value = {
			...pendingDownloads.value,
			[downloadKey]: true,
		}

		try {
			const videoResult = await downloadVideo(buildMediaRequestPayload(item))
			const fileName = `${videoResult.title}.${videoResult.container || 'mp4'}`
			await downloadTemporaryFile(videoResult.videoUrl, fileName)
			toast.success('视频资源已开始下载')
		} finally {
			const nextPendingDownloads = { ...pendingDownloads.value }
			delete nextPendingDownloads[downloadKey]
			pendingDownloads.value = nextPendingDownloads
		}
	} catch (error) {
		toast.error(error.message || '下载失败')
	}
}

async function handlePlayAudio(item) {
	try {
		const audioResult = await prepareAudioResource(item, 'play')
		if (!audioResult) return

		const track = adaptVideoToTrack(audioResult, {
			coverUrl: item.parsedData?.coverUrl,
			platform: item.parsedData?.platform,
			title: item.parsedData?.title,
			duration: item.parsedData?.duration,
		})

		playerStore.playTrack(track)
		toast.success('音频已准备完成，开始播放')
	} catch (error) {
		toast.error(error.message || '播放失败')
	}
}

watch(hasActivePlayer, async (active, previousActive) => {
	if (!active || previousActive || typeof window === 'undefined') {
		return
	}

	const shouldPreserveBottomContext = isViewportNearBottom()
	await nextTick()

	if (shouldPreserveBottomContext) {
		window.scrollBy({
			top: getComposerLiftOffset() + 24,
			behavior: 'smooth',
		})
	}
})

onBeforeUnmount(() => {
	abortActiveStream({ preserveMessage: false })
})
</script>
