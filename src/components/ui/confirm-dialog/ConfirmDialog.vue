<template>
	<Teleport to="body">
		<Transition name="fade">
			<div v-if="isVisible" class="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm" @click.self="handleCancel" />
		</Transition>

		<Transition name="scale">
			<div
				v-if="isVisible"
				class="fixed left-[50%] top-[50%] z-50 w-full max-w-md translate-x-[-50%] translate-y-[-50%] rounded-lg border bg-background p-6 shadow-lg"
			>
				<!-- 标题 -->
				<div class="mb-4 flex items-start justify-between">
					<div class="flex items-center gap-3">
						<!-- 图标 -->
						<div v-if="type === 'warning'" class="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/20">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								class="h-6 w-6 text-orange-600 dark:text-orange-500"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
							>
								<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
								<line x1="12" y1="9" x2="12" y2="13" />
								<line x1="12" y1="17" x2="12.01" y2="17" />
							</svg>
						</div>
						<div v-else-if="type === 'danger'" class="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								class="h-6 w-6 text-red-600 dark:text-red-500"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
							>
								<circle cx="12" cy="12" r="10" />
								<line x1="15" y1="9" x2="9" y2="15" />
								<line x1="9" y1="9" x2="15" y2="15" />
							</svg>
						</div>
						<div v-else-if="type === 'info'" class="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								class="h-6 w-6 text-blue-600 dark:text-blue-500"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
							>
								<circle cx="12" cy="12" r="10" />
								<line x1="12" y1="16" x2="12" y2="12" />
								<line x1="12" y1="8" x2="12.01" y2="8" />
							</svg>
						</div>

						<h3 class="text-lg font-semibold">{{ title }}</h3>
					</div>
				</div>

				<!-- 内容 -->
				<div class="mb-6 text-sm text-muted-foreground" :class="type ? 'ml-13' : ''">
					{{ message }}
				</div>

				<!-- 按钮 -->
				<div class="flex justify-end gap-3">
					<button
						@click="handleCancel"
						class="inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
					>
						{{ cancelText }}
					</button>
					<button
						@click="handleConfirm"
						class="inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
						:class="confirmButtonClass"
					>
						{{ confirmText }}
					</button>
				</div>
			</div>
		</Transition>
	</Teleport>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
	title: {
		type: String,
		default: '提示',
	},
	message: {
		type: String,
		required: true,
	},
	type: {
		type: String,
		default: 'warning', // 'warning' | 'danger' | 'info' | null
		validator: (value) => ['warning', 'danger', 'info', null].includes(value),
	},
	confirmText: {
		type: String,
		default: '确定',
	},
	cancelText: {
		type: String,
		default: '取消',
	},
	confirmButtonType: {
		type: String,
		default: 'danger', // 'danger' | 'primary'
		validator: (value) => ['danger', 'primary'].includes(value),
	},
})

const emit = defineEmits(['confirm', 'cancel'])

const isVisible = ref(false)

const confirmButtonClass = computed(() => {
	if (props.confirmButtonType === 'danger') {
		return 'bg-red-600 text-white hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700'
	}
	return 'bg-primary text-primary-foreground hover:bg-primary/90'
})

/**
 * 显示对话框
 */
function show() {
	isVisible.value = true
}

/**
 * 隐藏对话框
 */
function hide() {
	isVisible.value = false
}

/**
 * 确认
 */
function handleConfirm() {
	emit('confirm')
	hide()
}

/**
 * 取消
 */
function handleCancel() {
	emit('cancel')
	hide()
}

/**
 * ESC 键关闭
 */
function handleEscape(e) {
	if (e.key === 'Escape' && isVisible.value) {
		handleCancel()
	}
}

onMounted(() => {
	document.addEventListener('keydown', handleEscape)
	// 显示对话框
	show()
})

onBeforeUnmount(() => {
	document.removeEventListener('keydown', handleEscape)
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
	transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
	opacity: 0;
}

.scale-enter-active,
.scale-leave-active {
	transition: all 0.2s ease;
}

.scale-enter-from,
.scale-leave-to {
	opacity: 0;
	transform: translate(-50%, -50%) scale(0.95);
}
</style>
