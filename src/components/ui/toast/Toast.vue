<template>
	<Teleport to="body">
		<Transition name="toast">
			<div
				v-if="visible"
				:class="cn('fixed top-4 right-4 z-50 flex items-center gap-3 rounded-lg border px-4 py-3 shadow-lg', variantClasses[variant])"
			>
				<!-- 图标 -->
				<component :is="icon" class="h-5 w-5 flex-shrink-0" />

				<!-- 消息 -->
				<p class="text-sm font-medium">{{ message }}</p>

				<!-- 关闭按钮 -->
				<button @click="handleClose" class="ml-auto flex-shrink-0 rounded-full p-1 hover:bg-black/10 dark:hover:bg-white/10">
					<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<line x1="18" y1="6" x2="6" y2="18"></line>
						<line x1="6" y1="6" x2="18" y2="18"></line>
					</svg>
				</button>
			</div>
		</Transition>
	</Teleport>
</template>

<script setup>
import { computed, onMounted, onUnmounted } from 'vue'
import { cn } from '@/utils'

const props = defineProps({
	message: {
		type: String,
		required: true,
	},
	variant: {
		type: String,
		default: 'info',
		validator: (value) => ['success', 'error', 'warning', 'info'].includes(value),
	},
	duration: {
		type: Number,
		default: 3000,
	},
})

const emit = defineEmits(['close'])

const visible = defineModel('visible', { default: true })

let timer = null

const variantClasses = {
	success: 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-200',
	error: 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200',
	warning: 'bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-200',
	info: 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-200',
}

const icons = {
	success: 'svg-success',
	error: 'svg-error',
	warning: 'svg-warning',
	info: 'svg-info',
}

const icon = computed(() => icons[props.variant])

function handleClose() {
	visible.value = false
	emit('close')
}

onMounted(() => {
	if (props.duration > 0) {
		timer = setTimeout(() => {
			handleClose()
		}, props.duration)
	}
})

onUnmounted(() => {
	if (timer) {
		clearTimeout(timer)
	}
})
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
	transition: all 0.3s ease;
}

.toast-enter-from,
.toast-leave-to {
	opacity: 0;
	transform: translateX(100%);
}
</style>
