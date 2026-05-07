<template>
	<article class="mx-auto w-full max-w-4xl">
		<div v-if="item.role === 'user'" class="flex justify-end">
			<div class="max-w-[88%] rounded-[28px] bg-foreground px-5 py-3 text-sm leading-7 text-background shadow-sm">
				{{ item.content }}
			</div>
		</div>

		<div v-else class="space-y-4">
			<div v-if="shouldShowThinkingPanel(item)" class="rounded-2xl border border-border/70 bg-muted/40 px-4 py-3">
				<button
					type="button"
					class="flex w-full items-center justify-between gap-3 text-left text-sm font-medium text-foreground"
					@click="handleToggleThinking"
				>
					<span class="truncate">{{ getThinkingLabel(item) }}</span>
					<span class="shrink-0 text-xs text-muted-foreground">{{ item.thinkingExpanded ? '收起' : '展开' }}</span>
				</button>

				<div v-if="item.thinkingExpanded" class="mt-3">
					<div v-if="item.progressMessage">
						<p class="text-xs uppercase tracking-wide text-muted-foreground">进度</p>
						<p class="mt-1 text-sm leading-6 text-foreground">
							{{ item.progressMessage }}
						</p>
					</div>
					<div :class="item.progressMessage ? 'mt-3' : ''">
						<p class="text-xs uppercase tracking-wide text-muted-foreground">思考</p>
						<p class="mt-1 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
							{{ item.thinkingText || '本轮尚未返回处理摘要' }}
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
								{{ getParsedMeta(item.parsedData) }}
							</p>
						</div>

						<div class="flex flex-wrap gap-2 text-xs text-muted-foreground">
							<span class="rounded-full bg-muted px-3 py-1">时长 {{ formatMessageDuration(item.parsedData.duration) }}</span>
							<span class="rounded-full bg-muted px-3 py-1">来源 {{ getSourceSummary(item.parsedData) }}</span>
							<span class="rounded-full bg-muted px-3 py-1">状态 {{ getToolStatusLabel(item.toolStatus) }}</span>
						</div>

						<div v-if="item.parsedData.message" class="rounded-2xl border border-border/70 bg-background/80 px-4 py-3">
							<p class="text-xs uppercase tracking-wide text-muted-foreground">后端提示</p>
							<p class="mt-2 text-sm leading-6 text-foreground">
								{{ item.parsedData.message }}
							</p>
						</div>

						<div class="rounded-2xl border border-border/70 bg-background/80 px-4 py-3">
							<p class="text-xs uppercase tracking-wide text-muted-foreground">风险提示</p>
							<p class="mt-2 text-sm leading-6 text-foreground">
								{{ getRiskText(item, hasAnyFollowupAction) }}
							</p>
						</div>

						<div class="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
							<Button v-if="canPlayAudioMessage(item)" class="w-full sm:flex-1" :disabled="isDownloadPending(item, 'play')" @click="handlePlayAudio">
								{{ isDownloadPending(item, 'play') ? '准备中...' : '播放音频' }}
							</Button>
							<Button
								v-if="canDownloadAudioMessage(item)"
								variant="outline"
								class="w-full sm:flex-1"
								:disabled="isDownloadPending(item, 'audio')"
								@click="handleDownload('audio')"
							>
								{{ isDownloadPending(item, 'audio') ? '准备中...' : '下载音频' }}
							</Button>
							<Button
								v-if="canDownloadVideoMessage(item)"
								class="w-full sm:flex-1"
								:disabled="isDownloadPending(item, 'video')"
								@click="handleDownload('video')"
							>
								{{ isDownloadPending(item, 'video') ? '下载中...' : '下载视频' }}
							</Button>
						</div>

						<p class="text-xs leading-5 text-muted-foreground">
							{{
								hasAnyFollowupAction(item)
									? '后续操作会复用当前消息里的规范化链接与平台信息，不会依赖旧下载协议。'
									: '当前解析结果未声明可执行动作，请重新解析或继续追问。'
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
</template>

<script setup>
import Button from '@/components/ui/button/Button.vue'
import {
	assistantStatusLabel,
	canDownloadAudioMessage,
	canDownloadVideoMessage,
	canPlayAudioMessage,
	formatMessageDuration,
	getAssistantDisplayText,
	getParsedCover,
	getParsedMeta,
	getRiskText,
	getSourceSummary,
	getThinkingLabel,
	getToolStatusLabel,
	getWarningText,
	hasAnyFollowupAction,
	showMessageWarning,
	shouldShowThinkingPanel,
} from './aiParserUtils.js'

const { item, isDownloadPending } = defineProps({
	item: {
		type: Object,
		required: true,
	},
	isDownloadPending: {
		type: Function,
		required: true,
	},
})

const emit = defineEmits(['toggle-thinking', 'play-audio', 'download'])

function handleToggleThinking() {
	emit('toggle-thinking', item.id)
}

function handlePlayAudio() {
	emit('play-audio', item)
}

function handleDownload(type) {
	emit('download', { item, type })
}
</script>
