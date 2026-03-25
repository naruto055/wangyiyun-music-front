<template>
	<Teleport to="body">
		<Transition name="fade">
			<div v-if="isVisible" class="confirm-overlay" @click.self="handleCancel">
				<div class="overlay-backdrop"></div>
			</div>
		</Transition>

		<Transition name="scale">
			<div v-if="isVisible" class="confirm-dialog" :class="dialogClass">
				<!-- 装饰性背景 -->
				<div class="dialog-decoration"></div>

				<!-- 标题区域 -->
				<div class="dialog-header">
					<div class="header-content">
						<!-- 图标 -->
						<div v-if="type" class="icon-container" :class="iconContainerClass">
							<component :is="iconComponent" class="dialog-icon" />
						</div>

						<!-- 标题文本 -->
						<div class="title-wrapper">
							<h3 class="dialog-title">{{ title }}</h3>
						</div>
					</div>
				</div>

				<!-- 内容区域 -->
				<div class="dialog-body">
					<p class="dialog-message">{{ message }}</p>
				</div>

				<!-- 按钮区域 -->
				<div class="dialog-footer">
					<button @click="handleCancel" class="btn btn-cancel">
						<span>{{ cancelText }}</span>
					</button>
					<button @click="handleConfirm" class="btn btn-confirm" :class="confirmButtonClass">
						<span>{{ confirmText }}</span>
					</button>
				</div>
			</div>
		</Transition>
	</Teleport>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, h } from 'vue'

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
		default: 'warning',
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
		default: 'danger',
		validator: (value) => ['danger', 'primary'].includes(value),
	},
})

const emit = defineEmits(['confirm', 'cancel'])

const isVisible = ref(false)

// 对话框样式类
const dialogClass = computed(() => {
	if (!props.type) return ''
	return `dialog-${props.type}`
})

// 图标容器样式类
const iconContainerClass = computed(() => {
	if (!props.type) return ''
	return `icon-${props.type}`
})

// 确认按钮样式类
const confirmButtonClass = computed(() => {
	if (props.confirmButtonType === 'danger') {
		return 'btn-danger'
	}
	return 'btn-primary'
})

// 图标组件
const iconComponent = computed(() => {
	const icons = {
		warning: () =>
			h('svg', { xmlns: 'http://www.w3.org/2000/svg', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2.5' }, [
				h('path', { d: 'M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z' }),
				h('line', { x1: '12', y1: '9', x2: '12', y2: '13' }),
				h('line', { x1: '12', y1: '17', x2: '12.01', y2: '17' }),
			]),
		danger: () =>
			h('svg', { xmlns: 'http://www.w3.org/2000/svg', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2.5' }, [
				h('circle', { cx: '12', cy: '12', r: '10' }),
				h('line', { x1: '15', y1: '9', x2: '9', y2: '15' }),
				h('line', { x1: '9', y1: '9', x2: '15', y2: '15' }),
			]),
		info: () =>
			h('svg', { xmlns: 'http://www.w3.org/2000/svg', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2.5' }, [
				h('circle', { cx: '12', cy: '12', r: '10' }),
				h('line', { x1: '12', y1: '16', x2: '12', y2: '12' }),
				h('line', { x1: '12', y1: '8', x2: '12.01', y2: '8' }),
			]),
	}
	return icons[props.type]
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
	show()
})

onBeforeUnmount(() => {
	document.removeEventListener('keydown', handleEscape)
})
</script>

<style scoped>
/* 遮罩层 */
.confirm-overlay {
	position: fixed;
	inset: 0;
	z-index: 9998;
}

.overlay-backdrop {
	position: absolute;
	inset: 0;
	background: linear-gradient(135deg, rgba(0, 0, 0, 0.6) 0%, rgba(0, 0, 0, 0.4) 100%);
	backdrop-filter: blur(8px) saturate(180%);
}

/* 对话框主体 */
.confirm-dialog {
	position: fixed;
	left: 50%;
	top: 50%;
	z-index: 9999;
	width: 90%;
	max-width: 440px;
	transform: translate(-50%, -50%);
	background: white;
	border-radius: 20px;
	box-shadow:
		0 20px 60px rgba(0, 0, 0, 0.3),
		0 10px 30px rgba(0, 0, 0, 0.2),
		0 0 1px rgba(0, 0, 0, 0.1);
	overflow: hidden;
	animation: dialogEnter 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* 装饰性背景 */
.dialog-decoration {
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	height: 120px;
	background: linear-gradient(135deg, rgba(236, 65, 65, 0.03) 0%, rgba(236, 65, 65, 0.01) 100%);
	border-bottom: 1px solid rgba(236, 65, 65, 0.05);
}

/* 不同类型的装饰背景 */
.dialog-warning .dialog-decoration {
	background: linear-gradient(135deg, rgba(245, 158, 11, 0.05) 0%, rgba(245, 158, 11, 0.02) 100%);
	border-bottom-color: rgba(245, 158, 11, 0.1);
}

.dialog-danger .dialog-decoration {
	background: linear-gradient(135deg, rgba(236, 65, 65, 0.05) 0%, rgba(236, 65, 65, 0.02) 100%);
	border-bottom-color: rgba(236, 65, 65, 0.1);
}

.dialog-info .dialog-decoration {
	background: linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(59, 130, 246, 0.02) 100%);
	border-bottom-color: rgba(59, 130, 246, 0.1);
}

/* 头部 */
.dialog-header {
	position: relative;
	padding: 28px 28px 0 28px;
}

.header-content {
	display: flex;
	align-items: center;
	gap: 16px;
}

/* 图标容器 */
.icon-container {
	position: relative;
	display: flex;
	align-items: center;
	justify-content: center;
	width: 56px;
	height: 56px;
	border-radius: 16px;
	flex-shrink: 0;
	transition: transform 0.2s ease;
}

.icon-warning {
	background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
	box-shadow: 0 8px 20px rgba(245, 158, 11, 0.3), 0 4px 12px rgba(245, 158, 11, 0.2);
}

.icon-danger {
	background: linear-gradient(135deg, #ec4141 0%, #dc2626 100%);
	box-shadow: 0 8px 20px rgba(236, 65, 65, 0.3), 0 4px 12px rgba(236, 65, 65, 0.2);
}

.icon-info {
	background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
	box-shadow: 0 8px 20px rgba(59, 130, 246, 0.3), 0 4px 12px rgba(59, 130, 246, 0.2);
}

.dialog-icon {
	width: 28px;
	height: 28px;
	color: white;
	stroke-width: 2.5;
}

/* 标题 */
.title-wrapper {
	flex: 1;
}

.dialog-title {
	margin: 0;
	font-size: 20px;
	font-weight: 600;
	color: #1f2937;
	line-height: 1.3;
	letter-spacing: -0.01em;
}

/* 内容区域 */
.dialog-body {
	padding: 20px 28px 28px 28px;
}

.dialog-message {
	margin: 0;
	font-size: 15px;
	line-height: 1.6;
	color: #6b7280;
	letter-spacing: 0.01em;
}

/* 按钮区域 */
.dialog-footer {
	display: flex;
	gap: 12px;
	padding: 0 28px 28px 28px;
}

/* 按钮基础样式 */
.btn {
	flex: 1;
	display: flex;
	align-items: center;
	justify-content: center;
	height: 48px;
	padding: 0 24px;
	border-radius: 12px;
	border: none;
	font-size: 15px;
	font-weight: 500;
	cursor: pointer;
	transition: all 0.2s ease;
	position: relative;
	overflow: hidden;
}

.btn::before {
	content: '';
	position: absolute;
	inset: 0;
	background: linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0) 100%);
	opacity: 0;
	transition: opacity 0.2s ease;
}

.btn:hover::before {
	opacity: 1;
}

.btn:active {
	transform: scale(0.98);
}

/* 取消按钮 */
.btn-cancel {
	background: #f3f4f6;
	color: #374151;
}

.btn-cancel:hover {
	background: #e5e7eb;
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

/* 主按钮 */
.btn-primary {
	background: linear-gradient(135deg, #ec4141 0%, #dc2626 100%);
	color: white;
	box-shadow: 0 4px 16px rgba(236, 65, 65, 0.25);
}

.btn-primary:hover {
	box-shadow: 0 6px 20px rgba(236, 65, 65, 0.35);
	transform: translateY(-1px);
}

/* 危险按钮 */
.btn-danger {
	background: linear-gradient(135deg, #ec4141 0%, #dc2626 100%);
	color: white;
	box-shadow: 0 4px 16px rgba(236, 65, 65, 0.25);
}

.btn-danger:hover {
	box-shadow: 0 6px 20px rgba(236, 65, 65, 0.35);
	transform: translateY(-1px);
}

/* 动画效果 */
.fade-enter-active,
.fade-leave-active {
	transition: opacity 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
	opacity: 0;
}

.scale-enter-active {
	animation: dialogEnter 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.scale-leave-active {
	animation: dialogLeave 0.2s cubic-bezier(0.4, 0, 1, 1);
}

@keyframes dialogEnter {
	from {
		opacity: 0;
		transform: translate(-50%, -50%) scale(0.9) translateY(20px);
	}
	to {
		opacity: 1;
		transform: translate(-50%, -50%) scale(1) translateY(0);
	}
}

@keyframes dialogLeave {
	from {
		opacity: 1;
		transform: translate(-50%, -50%) scale(1) translateY(0);
	}
	to {
		opacity: 0;
		transform: translate(-50%, -50%) scale(0.95) translateY(-10px);
	}
}

/* 响应式设计 */
@media (max-width: 640px) {
	.confirm-dialog {
		max-width: calc(100% - 32px);
		border-radius: 16px;
	}

	.dialog-header {
		padding: 24px 24px 0 24px;
	}

	.icon-container {
		width: 48px;
		height: 48px;
		border-radius: 14px;
	}

	.dialog-icon {
		width: 24px;
		height: 24px;
	}

	.dialog-title {
		font-size: 18px;
	}

	.dialog-body {
		padding: 16px 24px 24px 24px;
	}

	.dialog-message {
		font-size: 14px;
	}

	.dialog-footer {
		padding: 0 24px 24px 24px;
		flex-direction: column-reverse;
	}

	.btn {
		height: 44px;
	}
}
</style>
