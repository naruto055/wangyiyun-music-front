<template>
	<Transition name="toast">
		<div v-if="visible" :class="toastClasses" class="toast-component">
			<!-- 进度条 -->
			<div v-if="duration > 0" class="toast-progress" :style="{ animationDuration: `${duration}ms` }"></div>

			<!-- 图标容器 -->
			<div class="toast-icon-wrapper">
				<div :class="iconWrapperClasses">
					<component :is="iconComponent" class="toast-icon" />
				</div>
			</div>

			<!-- 消息内容 -->
			<div class="toast-content">
				<p class="toast-message">{{ message }}</p>
			</div>

			<!-- 关闭按钮 -->
			<button @click="handleClose" class="toast-close" aria-label="关闭">
				<svg xmlns="http://www.w3.org/2000/svg" class="close-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<line x1="18" y1="6" x2="6" y2="18"></line>
					<line x1="6" y1="6" x2="18" y2="18"></line>
				</svg>
			</button>
		</div>
	</Transition>
</template>

<script setup>
import { computed, onMounted, onUnmounted, h } from 'vue'
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

// 根据类型设置样式类
const toastClasses = computed(() => {
	const classes = {
		success: 'toast-success',
		error: 'toast-error',
		warning: 'toast-warning',
		info: 'toast-info',
	}
	return classes[props.variant]
})

// 图标容器样式
const iconWrapperClasses = computed(() => {
	const classes = {
		success: 'icon-wrapper-success',
		error: 'icon-wrapper-error',
		warning: 'icon-wrapper-warning',
		info: 'icon-wrapper-info',
	}
	return classes[props.variant]
})

// 图标组件
const iconComponent = computed(() => {
	const icons = {
		success: () =>
			h('svg', { xmlns: 'http://www.w3.org/2000/svg', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2.5' }, [
				h('path', { d: 'M20 6L9 17l-5-5' }),
			]),
		error: () =>
			h('svg', { xmlns: 'http://www.w3.org/2000/svg', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2.5' }, [
				h('circle', { cx: '12', cy: '12', r: '10' }),
				h('line', { x1: '15', y1: '9', x2: '9', y2: '15' }),
				h('line', { x1: '9', y1: '9', x2: '15', y2: '15' }),
			]),
		warning: () =>
			h('svg', { xmlns: 'http://www.w3.org/2000/svg', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2.5' }, [
				h('path', { d: 'M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z' }),
				h('line', { x1: '12', y1: '9', x2: '12', y2: '13' }),
				h('line', { x1: '12', y1: '17', x2: '12.01', y2: '17' }),
			]),
		info: () =>
			h('svg', { xmlns: 'http://www.w3.org/2000/svg', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2.5' }, [
				h('circle', { cx: '12', cy: '12', r: '10' }),
				h('line', { x1: '12', y1: '16', x2: '12', y2: '12' }),
				h('line', { x1: '12', y1: '8', x2: '12.01', y2: '8' }),
			]),
	}
	return icons[props.variant]
})

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
/* 基础样式 */
.toast-component {
	position: relative;
	display: flex;
	align-items: center;
	gap: 14px;
	min-width: 320px;
	max-width: 480px;
	padding: 16px 18px;
	border-radius: 12px;
	backdrop-filter: blur(12px);
	box-shadow:
		0 8px 24px rgba(0, 0, 0, 0.12),
		0 2px 8px rgba(0, 0, 0, 0.08),
		0 0 1px rgba(0, 0, 0, 0.04);
	overflow: hidden;
}

/* 成功状态 - 网易云绿色渐变 */
.toast-success {
	background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
	border: 1.5px solid #86efac;
	color: #166534;
}

.toast-success .toast-progress {
	background: linear-gradient(90deg, #22c55e 0%, #16a34a 100%);
}

.toast-success .icon-wrapper-success {
	background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
	box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3);
}

/* 错误状态 - 网易云红色渐变 */
.toast-error {
	background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
	border: 1.5px solid #fca5a5;
	color: #991b1b;
}

.toast-error .toast-progress {
	background: linear-gradient(90deg, #ec4141 0%, #dc2626 100%);
}

.toast-error .icon-wrapper-error {
	background: linear-gradient(135deg, #ec4141 0%, #dc2626 100%);
	box-shadow: 0 4px 12px rgba(236, 65, 65, 0.3);
}

/* 警告状态 - 琥珀色渐变 */
.toast-warning {
	background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
	border: 1.5px solid #fcd34d;
	color: #92400e;
}

.toast-warning .toast-progress {
	background: linear-gradient(90deg, #f59e0b 0%, #d97706 100%);
}

.toast-warning .icon-wrapper-warning {
	background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
	box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
}

/* 信息状态 - 蓝色渐变 */
.toast-info {
	background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
	border: 1.5px solid #93c5fd;
	color: #1e3a8a;
}

.toast-info .toast-progress {
	background: linear-gradient(90deg, #3b82f6 0%, #2563eb 100%);
}

.toast-info .icon-wrapper-info {
	background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
	box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

/* 进度条 */
.toast-progress {
	position: absolute;
	bottom: 0;
	left: 0;
	height: 3px;
	width: 100%;
	transform-origin: left;
	animation: progress linear forwards;
}

@keyframes progress {
	from {
		transform: scaleX(1);
	}
	to {
		transform: scaleX(0);
	}
}

/* 图标容器 */
.toast-icon-wrapper {
	flex-shrink: 0;
}

.icon-wrapper-success,
.icon-wrapper-error,
.icon-wrapper-warning,
.icon-wrapper-info {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 36px;
	height: 36px;
	border-radius: 10px;
	transition: transform 0.2s ease;
}

.toast-component:hover .icon-wrapper-success,
.toast-component:hover .icon-wrapper-error,
.toast-component:hover .icon-wrapper-warning,
.toast-component:hover .icon-wrapper-info {
	transform: scale(1.05);
}

.toast-icon {
	width: 20px;
	height: 20px;
	color: white;
	stroke-width: 2.5;
}

/* 消息内容 */
.toast-content {
	flex: 1;
	min-width: 0;
}

.toast-message {
	margin: 0;
	font-size: 14px;
	font-weight: 500;
	line-height: 1.5;
	letter-spacing: 0.01em;
}

/* 关闭按钮 */
.toast-close {
	flex-shrink: 0;
	display: flex;
	align-items: center;
	justify-content: center;
	width: 28px;
	height: 28px;
	margin: -4px -4px -4px 0;
	border-radius: 8px;
	background: transparent;
	border: none;
	cursor: pointer;
	transition: all 0.2s ease;
	opacity: 0.5;
}

.toast-close:hover {
	opacity: 1;
	background: rgba(0, 0, 0, 0.05);
}

.toast-close:active {
	transform: scale(0.95);
}

.close-icon {
	width: 16px;
	height: 16px;
}

/* 动画效果 */
.toast-enter-active {
	animation: slideInRight 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.toast-leave-active {
	animation: slideOutRight 0.25s cubic-bezier(0.4, 0, 1, 1);
}

@keyframes slideInRight {
	from {
		opacity: 0;
		transform: translateX(100%) scale(0.9);
	}
	to {
		opacity: 1;
		transform: translateX(0) scale(1);
	}
}

@keyframes slideOutRight {
	from {
		opacity: 1;
		transform: translateX(0) scale(1);
	}
	to {
		opacity: 0;
		transform: translateX(100%) scale(0.9);
	}
}
</style>
