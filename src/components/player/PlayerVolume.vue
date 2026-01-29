<template>
	<div class="flex items-center gap-2">
		<!-- 音量图标/静音按钮 -->
		<button @click="toggleMute" class="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-gray-100">
			<!-- 静音图标 -->
			<svg v-if="isMuted || volume === 0" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-600" viewBox="0 0 24 24" fill="currentColor">
				<path
					d="M3.63 3.63a.996.996 0 000 1.41L7.29 8.7 7 9H4c-.55 0-1 .45-1 1v4c0 .55.45 1 1 1h3l3.29 3.29c.63.63 1.71.18 1.71-.71v-4.17l4.18 4.18c-.49.37-1.02.68-1.6.91-.36.15-.58.53-.58.92 0 .72.73 1.18 1.39.91.8-.33 1.55-.77 2.22-1.31l1.34 1.34a.996.996 0 101.41-1.41L5.05 3.63c-.39-.39-1.02-.39-1.42 0zM19 12c0 .82-.15 1.61-.41 2.34l1.53 1.53c.56-1.17.88-2.48.88-3.87 0-3.83-2.4-7.11-5.78-8.4-.59-.23-1.22.23-1.22.86v.19c0 .38.25.71.61.85C17.18 6.54 19 9.06 19 12zm-8.71-6.29l-.17.17L12 7.76V6.41c0-.89-1.08-1.33-1.71-.7zM16.5 12A4.5 4.5 0 0014 7.97v1.79l2.48 2.48c.01-.08.02-.16.02-.24z"
				/>
			</svg>
			<!-- 低音量图标 -->
			<svg
				v-else-if="volume > 0 && volume <= 0.5"
				xmlns="http://www.w3.org/2000/svg"
				class="h-5 w-5 text-gray-600"
				viewBox="0 0 24 24"
				fill="currentColor"
			>
				<path d="M7 9v6h4l5 5V4l-5 5H7zm7.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
			</svg>
			<!-- 高音量图标 -->
			<svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-600" viewBox="0 0 24 24" fill="currentColor">
				<path
					d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"
				/>
			</svg>
		</button>

		<!-- 音量滑块（仅在桌面端显示） -->
		<div class="group relative hidden md:block">
			<input
				type="range"
				min="0"
				max="100"
				:value="volumePercent"
				@input="handleVolumeChange"
				class="h-1 w-20 cursor-pointer appearance-none rounded-full bg-gray-200 outline-none transition-all"
				:style="volumeBarStyle"
			/>
		</div>
	</div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { usePlayerStore } from '@/stores/player'

const playerStore = usePlayerStore()
const { volume } = storeToRefs(playerStore)

// 静音前的音量（用于恢复）
const volumeBeforeMute = ref(0.8)

/**
 * 音量百分比 (0-100)
 */
const volumePercent = computed(() => {
	return Math.round(volume.value * 100)
})

/**
 * 是否静音
 */
const isMuted = computed(() => {
	return volume.value === 0
})

/**
 * 音量条样式
 */
const volumeBarStyle = computed(() => {
	const progress = volumePercent.value
	return {
		background: `linear-gradient(to right, #ef4444 0%, #ef4444 ${progress}%, #e5e7eb ${progress}%, #e5e7eb 100%)`,
	}
})

/**
 * 处理音量变化
 */
function handleVolumeChange(event) {
	const newVolume = parseFloat(event.target.value) / 100
	if (!isNaN(newVolume)) {
		playerStore.setVolume(newVolume)
		if (newVolume > 0) {
			volumeBeforeMute.value = newVolume
		}
	}
}

/**
 * 切换静音
 */
function toggleMute() {
	if (volume.value === 0) {
		// 恢复音量
		playerStore.setVolume(volumeBeforeMute.value || 0.8)
	} else {
		// 保存当前音量并静音
		volumeBeforeMute.value = volume.value
		playerStore.setVolume(0)
	}
}
</script>

<style scoped>
/* 自定义滑块样式 */
input[type='range']::-webkit-slider-thumb {
	appearance: none;
	width: 10px;
	height: 10px;
	border-radius: 50%;
	background: #ef4444;
	cursor: pointer;
	opacity: 0;
	transition: opacity 0.2s;
}

input[type='range']:hover::-webkit-slider-thumb {
	opacity: 1;
}

input[type='range']::-moz-range-thumb {
	width: 10px;
	height: 10px;
	border-radius: 50%;
	background: #ef4444;
	cursor: pointer;
	border: none;
	opacity: 0;
	transition: opacity 0.2s;
}

input[type='range']:hover::-moz-range-thumb {
	opacity: 1;
}
</style>
