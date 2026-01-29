<template>
	<div class="flex w-full items-center gap-2 text-xs text-gray-500">
		<!-- 当前时间 -->
		<span class="min-w-[40px] text-right">{{ formattedCurrentTime }}</span>

		<!-- 进度条 -->
		<div class="group relative flex-1">
			<input
				type="range"
				min="0"
				:max="duration || 100"
				:value="currentTime"
				@input="handleSeek"
				@mousedown="handleSeekStart"
				@mouseup="handleSeekEnd"
				:disabled="!currentTrack"
				class="h-1 w-full cursor-pointer appearance-none rounded-full bg-gray-200 outline-none transition-all disabled:cursor-not-allowed disabled:opacity-30"
				:style="progressBarStyle"
			/>
		</div>

		<!-- 总时长 -->
		<span class="min-w-[40px]">{{ formattedDuration }}</span>
	</div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { usePlayerStore } from '@/stores/player'
import { useAudioPlayer } from '@/composables/useAudioPlayer'
import { formatDuration } from '@/utils/audioFormat'

const playerStore = usePlayerStore()
const { currentTime, duration, currentTrack } = storeToRefs(playerStore)

// 初始化音频播放器，获取 seek 方法
const { seek: seekAudio } = useAudioPlayer()

// 是否正在拖拽进度条
const isSeeking = ref(false)

/**
 * 格式化当前时间
 */
const formattedCurrentTime = computed(() => {
	return formatDuration(currentTime.value)
})

/**
 * 格式化总时长
 */
const formattedDuration = computed(() => {
	return formatDuration(duration.value)
})

/**
 * 进度条样式（使用渐变背景显示进度）
 */
const progressBarStyle = computed(() => {
	const progress = duration.value > 0 ? (currentTime.value / duration.value) * 100 : 0
	return {
		background: `linear-gradient(to right, #ef4444 0%, #ef4444 ${progress}%, #e5e7eb ${progress}%, #e5e7eb 100%)`,
	}
})

/**
 * 处理进度条拖拽
 */
function handleSeek(event) {
	const newTime = parseFloat(event.target.value)
	if (!isNaN(newTime)) {
		playerStore.updateTime(newTime)
	}
}

/**
 * 开始拖拽
 */
function handleSeekStart() {
	isSeeking.value = true
}

/**
 * 结束拖拽
 */
function handleSeekEnd(event) {
	isSeeking.value = false
	const newTime = parseFloat(event.target.value)
	if (!isNaN(newTime)) {
		// 同时更新 Store 状态和 Audio 元素
		playerStore.seek(newTime)
		seekAudio(newTime)
	}
}
</script>

<style scoped>
/* 自定义滑块样式 */
input[type='range']::-webkit-slider-thumb {
	appearance: none;
	width: 12px;
	height: 12px;
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
	width: 12px;
	height: 12px;
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
