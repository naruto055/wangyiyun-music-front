<template>
	<div class="toast-container">
		<Toast
			v-for="toast in toasts"
			:key="toast.id"
			:message="toast.message"
			:variant="toast.variant"
			:duration="toast.duration"
			v-model:visible="toast.visible"
			@close="removeToast(toast.id)"
		/>
	</div>
</template>

<script setup>
import { watch } from 'vue'
import { useToast } from '@/composables/useToast'
import Toast from './Toast.vue'

const { toasts } = useToast()

/**
 * 移除 Toast
 */
function removeToast(id) {
	const index = toasts.value.findIndex((t) => t.id === id)
	if (index !== -1) {
		toasts.value.splice(index, 1)
	}
}
</script>

<style scoped>
.toast-container {
	position: fixed;
	top: 0;
	right: 0;
	z-index: 50;
	display: flex;
	flex-direction: column;
	gap: 8px;
	padding: 16px;
	pointer-events: none;
}

.toast-container > * {
	pointer-events: auto;
}
</style>
