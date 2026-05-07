<template>
	<section
		class="fixed inset-x-0 z-10 px-4 transition-[bottom] duration-200"
		:class="hasActivePlayer ? 'bottom-[84px] md:bottom-[92px]' : 'bottom-[10px]'"
	>
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
						:value="message"
						placeholder="例如：帮我解析这个视频并给出可下载资源，https://v.douyin.com/xxxxx/"
						class="min-h-28 w-full resize-none rounded-2xl border border-input bg-background px-4 py-3 text-sm leading-6 text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
						@input="handleInput"
					></textarea>

					<div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
						<p class="text-xs text-muted-foreground">
							{{
								isSending ? '当前请求仍在流式返回中，完成后即可继续发送下一轮。' : '支持抖音、B 站链接或分享文案，结果会以内联卡片出现在聊天流中。'
							}}
						</p>
						<Button size="lg" class="sm:min-w-36" :disabled="!canSubmit" @click="emit('submit')">
							{{ isSending ? '解析中...' : '发送解析' }}
						</Button>
					</div>
				</div>
			</Card>
		</div>
	</section>
</template>

<script setup>
import Button from '@/components/ui/button/Button.vue'
import Card from '@/components/ui/card/Card.vue'

const { message, isSending, canSubmit, inputStatusLabel, inputStatusHint, hasActivePlayer } = defineProps({
	message: {
		type: String,
		default: '',
	},
	isSending: {
		type: Boolean,
		default: false,
	},
	canSubmit: {
		type: Boolean,
		default: false,
	},
	inputStatusLabel: {
		type: String,
		default: '',
	},
	inputStatusHint: {
		type: String,
		default: '',
	},
	hasActivePlayer: {
		type: Boolean,
		default: false,
	},
})

const emit = defineEmits(['update:message', 'submit'])

function handleInput(event) {
	emit('update:message', event.target.value)
}
</script>
