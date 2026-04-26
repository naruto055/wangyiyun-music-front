<template>
	<div class="min-h-screen bg-linear-to-b from-background via-background to-muted/20">
		<Header />

		<main class="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-5xl flex-col px-4 pb-44 pt-6">
			<section class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
				<div class="space-y-2">
					<h1 class="text-3xl font-semibold text-foreground">AI 解析</h1>
					<p class="max-w-2xl text-sm leading-6 text-muted-foreground">
						输入链接或分享文案，让 AI 在对话中直接返回解析结果，并在对应消息里完成视频或音频下载。
					</p>
				</div>

				<div class="flex flex-wrap items-center gap-2">
					<span v-if="sessionId" class="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">会话 {{ shortSessionId }}</span>
					<Button v-if="messages.length" variant="ghost" size="sm" @click="resetConversation">清空会话</Button>
				</div>
			</section>

			<section class="flex-1 space-y-6 pb-6">
				<div
					v-if="!messages.length"
					class="flex min-h-[48vh] flex-col items-center justify-center rounded-[32px] border border-dashed border-border bg-linear-to-br from-muted/40 via-white to-primary/5 px-6 text-center"
				>
					<div class="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
						<svg class="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
							<path stroke-linecap="round" stroke-linejoin="round" d="M15 10l4.5-2.2A1 1 0 0121 8.6v6.8a1 1 0 01-1.5.9L15 14" />
							<rect x="3" y="6" width="12" height="12" rx="2" />
						</svg>
					</div>
					<h2 class="text-xl font-semibold text-foreground">让 AI 帮你解析视频</h2>
					<p class="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
						粘贴抖音、B 站链接或分享文案，AI 会在当前聊天流里返回过程、结果卡和直接下载按钮。
					</p>
				</div>

				<article v-for="item in messages" :key="item.id" class="mx-auto w-full max-w-4xl">
					<div v-if="item.role === 'user'" class="flex justify-end">
						<div class="max-w-[88%] rounded-[28px] bg-foreground px-5 py-3 text-sm leading-7 text-background shadow-sm">
							{{ item.content }}
						</div>
					</div>

					<div v-else class="space-y-4">
						<div v-if="item.progressMessage || item.thinkingText" class="rounded-2xl border border-border/70 bg-muted/40 px-4 py-3">
							<button
								type="button"
								class="flex w-full items-center justify-between gap-3 text-left text-sm font-medium text-foreground"
								@click="toggleThinking(item.id)"
							>
								<span class="truncate">{{ item.progressMessage || '查看过程' }}</span>
								<span class="shrink-0 text-xs text-muted-foreground">{{ item.thinkingExpanded ? '收起' : '展开' }}</span>
							</button>

							<div v-if="item.thinkingExpanded" class="mt-3 space-y-3">
								<div>
									<p class="text-xs uppercase tracking-wide text-muted-foreground">进度</p>
									<p class="mt-1 text-sm leading-6 text-foreground">
										{{ item.progressMessage || '暂无阶段进度' }}
									</p>
								</div>
								<div>
									<p class="text-xs uppercase tracking-wide text-muted-foreground">思考</p>
									<p class="mt-1 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
										{{ item.thinkingText || '暂无更多过程信息' }}
									</p>
								</div>
							</div>
						</div>

						<div class="rounded-[28px] border border-border/70 bg-white px-5 py-4 shadow-sm">
							<div class="mb-3 flex items-center gap-3 text-xs text-muted-foreground">
								<span class="rounded-full bg-primary/10 px-3 py-1 font-medium text-primary">AI</span>
								<span>{{ assistantStatusLabel(item.status) }}</span>
							</div>
							<p class="whitespace-pre-wrap text-sm leading-7 text-foreground">
								{{ getAssistantDisplayText(item) }}
							</p>
						</div>

						<div
							v-if="item.parsedData"
							class="overflow-hidden rounded-[28px] border border-primary/15 bg-linear-to-br from-white via-white to-primary/5 shadow-sm"
						>
							<div v-if="showMessageWarning(item)" class="border-b border-amber-200 bg-amber-50 px-5 py-3 text-sm text-amber-900">
								{{ getWarningText(item) }}
							</div>

							<div class="grid gap-4 p-5 md:grid-cols-[112px_minmax(0,1fr)]">
								<div class="overflow-hidden rounded-2xl bg-muted">
									<img
										v-if="getParsedCover(item)"
										:src="getParsedCover(item)"
										:alt="item.parsedData.title || '解析封面'"
										class="h-28 w-full object-cover md:h-full"
									/>
									<div v-else class="flex h-28 items-center justify-center text-sm text-muted-foreground md:h-full">暂无封面</div>
								</div>

								<div class="space-y-4">
									<div>
										<h3 class="text-lg font-semibold leading-7 text-foreground">
											{{ item.parsedData.title || '未返回标题' }}
										</h3>
										<p class="mt-1 text-sm text-muted-foreground">
											{{ getParsedAuthor(item) }}
										</p>
									</div>

									<div class="flex flex-wrap gap-2 text-xs text-muted-foreground">
										<span class="rounded-full bg-muted px-3 py-1">时长 {{ formatMessageDuration(item.parsedData.duration) }}</span>
										<span class="rounded-full bg-muted px-3 py-1">来源 {{ getSourceSummary(item.parsedData) }}</span>
										<span class="rounded-full bg-muted px-3 py-1">状态 {{ getToolStatusLabel(item.toolStatus) }}</span>
									</div>

									<div class="rounded-2xl border border-border/70 bg-background/80 px-4 py-3">
										<p class="text-xs uppercase tracking-wide text-muted-foreground">风险提示</p>
										<p class="mt-2 text-sm leading-6 text-foreground">
											{{ getRiskText(item) }}
										</p>
									</div>

									<div class="flex flex-col gap-3 sm:flex-row">
										<Button
											class="w-full sm:flex-1"
											:disabled="!canDownloadMessage(item) || isDownloadPending(item, 'video')"
											@click="handleDownload(item, 'video')"
										>
											{{ isDownloadPending(item, 'video') ? '下载中...' : '下载视频' }}
										</Button>
										<Button
											variant="outline"
											class="w-full sm:flex-1"
											:disabled="!canDownloadMessage(item) || isDownloadPending(item, 'audio')"
											@click="handleDownload(item, 'audio')"
										>
											{{ getAudioButtonLabel(item) }}
										</Button>
									</div>

									<p class="text-xs leading-5 text-muted-foreground">
										{{
											canDownloadMessage(item)
												? '下载会直接使用当前消息里的解析结果执行，不会影响其他消息。'
												: '当前解析结果暂不可下载，请重新解析或继续追问。'
										}}
									</p>
								</div>
							</div>
						</div>

						<div v-if="item.errorMessage" class="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
							<p class="font-medium">请求失败</p>
							<p class="mt-1 leading-6">{{ item.errorMessage }}</p>
						</div>
					</div>
				</article>
			</section>

			<section class="fixed inset-x-0 bottom-[10px] z-10 px-4">
				<div class="mx-auto w-full max-w-5xl">
					<Card class="border-primary/15 bg-background/95 shadow-lg backdrop-blur">
						<div class="space-y-4 p-4 sm:p-5">
							<div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
								<div>
									<p class="text-sm font-medium text-foreground">{{ inputStatusLabel }}</p>
									<p class="text-xs text-muted-foreground">{{ inputStatusHint }}</p>
								</div>
								<span class="text-xs text-muted-foreground">发送中可继续查看历史消息，重复发送会被禁用。</span>
							</div>

							<textarea
								v-model="message"
								placeholder="例如：帮我解析这个视频并给出可下载资源，https://v.douyin.com/xxxxx/"
								class="min-h-28 w-full resize-none rounded-2xl border border-input bg-background px-4 py-3 text-sm leading-6 text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
							></textarea>

							<div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
								<p class="text-xs text-muted-foreground">
									{{
										isSending
											? '当前请求仍在流式返回中，完成后即可继续发送下一轮。'
											: '支持抖音、B 站链接或分享文案，结果会以内联卡片出现在聊天流中。'
									}}
								</p>
								<Button size="lg" class="sm:min-w-36" :disabled="!canSubmit" @click="handleSubmit">
									{{ isSending ? '解析中...' : '发送解析' }}
								</Button>
							</div>
						</div>
					</Card>
				</div>
			</section>
		</main>
	</div>
</template>

<script setup>
import { computed, onBeforeUnmount, ref } from 'vue'
import { downloadParsedMedia, streamAiChat } from '@/api/ai'
import { useToast } from '@/composables/useToast'
import Header from '@/components/layout/Header.vue'
import Button from '@/components/ui/button/Button.vue'
import Card from '@/components/ui/card/Card.vue'

const toast = useToast()

const message = ref('')
const sessionId = ref('')
const sendingState = ref('idle')
const messages = ref([])
const activeAssistantMessageId = ref('')
const pendingDownloads = ref({})

let activeController = null

const isSending = computed(() => ['connecting', 'streaming'].includes(sendingState.value))
const canSubmit = computed(() => message.value.trim().length > 0 && !isSending.value)
const shortSessionId = computed(() => sessionId.value.slice(0, 8))
const activeAssistantMessage = computed(() => messages.value.find((item) => item.id === activeAssistantMessageId.value) || null)
const inputStatusLabel = computed(() => {
	const labelMap = {
		idle: '准备开始新的解析',
		connecting: '正在建立流式连接',
		streaming: 'AI 正在生成回复',
	}

	return labelMap[sendingState.value] || '准备开始新的解析'
})
const inputStatusHint = computed(() => {
	if (activeAssistantMessage.value?.progressMessage) {
		return activeAssistantMessage.value.progressMessage
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

function assistantStatusLabel(status) {
	const labelMap = {
		connecting: '连接中',
		streaming: '生成中',
		completed: '已完成',
		error: '失败',
	}

	return labelMap[status] || '处理中'
}

function getAssistantDisplayText(item) {
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
		return '已收到结构化结果，可直接查看并下载所需资源。'
	}

	return 'AI 正在准备回复...'
}

function getMessageWarnings(item) {
	const warnings = item.toolStatus?.warnings || item.parsedData?.warnings || []
	return Array.isArray(warnings) ? warnings.filter(Boolean) : []
}

function showMessageWarning(item) {
	return item.toolStatus?.status === 'suspect' || getMessageWarnings(item).length > 0
}

function getWarningText(item) {
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

function getRiskText(item) {
	if (!canDownloadMessage(item)) {
		return '当前结果缺少可下载链接，请重新解析或继续追问。'
	}

	if (showMessageWarning(item)) {
		return getWarningText(item)
	}

	if (item.parsedData?.audioReady) {
		return '原声音频已就绪，可以直接下载视频或原声音频。'
	}

	return '视频可直接下载，音频会在服务端提取后返回下载文件。'
}

function getToolStatusLabel(toolStatus) {
	if (!toolStatus?.status) {
		return '等待确认'
	}

	if (toolStatus.status === 'resolved') {
		return '已确认可用'
	}

	if (toolStatus.status === 'suspect') {
		return '结果待确认'
	}

	return toolStatus.status
}

function getParsedCover(item) {
	return item.parsedData?.cover || item.parsedData?.coverUrl || ''
}

function getParsedAuthor(item) {
	return item.parsedData?.author || item.parsedData?.uploader || '未返回作者信息'
}

function getSourceSummary(parsedData) {
	if (parsedData?.source) {
		return parsedData.source
	}

	if (!parsedData?.shareUrl) {
		return 'AI 工具解析'
	}

	try {
		return new URL(parsedData.shareUrl).hostname.replace(/^www\./, '')
	} catch {
		return parsedData.shareUrl
	}
}

function formatMessageDuration(duration) {
	if (duration !== 0 && !duration) {
		return '未知'
	}

	const normalizedDuration = duration >= 1000 ? Math.floor(duration / 1000) : duration
	const minutes = Math.floor(normalizedDuration / 60)
	const seconds = normalizedDuration % 60
	return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

function canDownloadMessage(item) {
	return Boolean(item.parsedData?.shareUrl)
}

function isDownloadPending(item, type) {
	return Boolean(pendingDownloads.value[`${item.id}:${type}`])
}

function getAudioButtonLabel(item) {
	if (isDownloadPending(item, 'audio')) {
		return '下载中...'
	}

	return item.parsedData?.audioReady ? '下载原声音频' : '提取并下载音频'
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
				onThinkingDelta: ({ delta }) => {
					sendingState.value = 'streaming'
					updateMessageById(assistantMessageId, (target) => {
						target.status = 'streaming'
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
	if (!item.parsedData?.shareUrl) {
		toast.warning('当前解析结果缺少可下载链接，请重新解析')
		return
	}

	const downloadKey = `${item.id}:${type}`
	pendingDownloads.value = {
		...pendingDownloads.value,
		[downloadKey]: true,
	}

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
		const nextPendingDownloads = { ...pendingDownloads.value }
		delete nextPendingDownloads[downloadKey]
		pendingDownloads.value = nextPendingDownloads
	}
}

onBeforeUnmount(() => {
	abortActiveStream({ preserveMessage: false })
})
</script>
