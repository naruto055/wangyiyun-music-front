<template>
	<section class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
		<div class="space-y-2">
			<h1 class="text-3xl font-semibold text-foreground">AI 解析</h1>
			<p class="max-w-2xl text-sm leading-6 text-muted-foreground">
				输入链接或分享文案，让 AI 在对话中直接返回解析结果，并基于现有视频能力继续准备音频、播放或下载视频。
			</p>
		</div>

		<div class="flex flex-wrap items-center gap-2">
			<span v-if="sessionId" class="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">会话 {{ shortSessionId }}</span>
			<Button v-if="hasMessages" variant="ghost" size="sm" @click="emit('reset-conversation')">清空会话</Button>
		</div>
	</section>
</template>

<script setup>
import Button from '@/components/ui/button/Button.vue'

defineProps({
	sessionId: {
		type: String,
		default: '',
	},
	shortSessionId: {
		type: String,
		default: '',
	},
	hasMessages: {
		type: Boolean,
		default: false,
	},
})

const emit = defineEmits(['reset-conversation'])
</script>
