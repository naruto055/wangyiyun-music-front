<template>
	<div class="flex items-center justify-center gap-3">
		<!-- 上一曲按钮 -->
		<button
			:disabled="!hasPrevious"
			@click="handlePrevious"
			class="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-30"
			:class="{ 'hover:bg-gray-100': hasPrevious }"
		>
			<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
				<path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
			</svg>
		</button>

		<!-- 播放/暂停按钮 -->
		<button
			:disabled="!currentTrack"
			@click="handleTogglePlay"
			class="flex h-10 w-10 items-center justify-center rounded-full bg-red-500 text-white shadow-lg transition-all hover:bg-red-600 hover:shadow-xl disabled:cursor-not-allowed disabled:bg-gray-300"
		>
			<!-- 播放图标 -->
			<svg v-if="!isPlaying" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
				<path d="M8 5v14l11-7z" />
			</svg>
			<!-- 暂停图标 -->
			<svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
				<path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
			</svg>
		</button>

		<!-- 下一曲按钮 -->
		<button
			:disabled="!hasNext"
			@click="handleNext"
			class="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-30"
			:class="{ 'hover:bg-gray-100': hasNext }"
		>
			<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
				<path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
			</svg>
		</button>
	</div>
</template>

<script setup>
import { storeToRefs } from 'pinia'
import { usePlayerStore } from '@/stores/player'

const playerStore = usePlayerStore()
const { isPlaying, currentTrack, hasPrevious, hasNext } = storeToRefs(playerStore)

/**
 * 切换播放/暂停
 */
function handleTogglePlay() {
	playerStore.togglePlay()
}

/**
 * 播放上一曲
 */
function handlePrevious() {
	playerStore.playPrevious()
}

/**
 * 播放下一曲
 */
function handleNext() {
	playerStore.playNext()
}
</script>
