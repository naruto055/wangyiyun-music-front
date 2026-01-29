<template>
	<!-- 底部固定播放栏 -->
	<div
		class="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white shadow-lg"
		:class="{ 'pointer-events-none opacity-0': !currentTrack }"
	>
		<div class="container mx-auto px-4">
			<!-- 桌面端布局 -->
			<div class="hidden h-20 items-center justify-between gap-4 md:flex">
				<!-- 左侧：歌曲信息 -->
				<div class="w-1/4 min-w-0">
					<PlayerInfo />
				</div>

				<!-- 中间：播放控制 + 进度条 -->
				<div class="flex flex-1 flex-col items-center gap-2">
					<PlayerControls />
					<PlayerProgress class="w-full" />
				</div>

				<!-- 右侧：音量、模式、播放列表 -->
				<div class="flex w-1/4 items-center justify-end gap-3">
					<!-- 播放模式切换按钮 -->
					<button
						@click="togglePlayMode"
						class="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-gray-100"
						:title="playModeTitle"
					>
						<!-- 顺序播放 -->
						<svg
							v-if="playMode === PLAY_MODES.SEQUENTIAL"
							xmlns="http://www.w3.org/2000/svg"
							class="h-5 w-5 text-gray-600"
							viewBox="0 0 24 24"
							fill="currentColor"
						>
							<path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4zm-4-2V9h-1l-2 1v1h1.5v4H13z" />
						</svg>
						<!-- 随机播放 -->
						<svg
							v-else-if="playMode === PLAY_MODES.RANDOM"
							xmlns="http://www.w3.org/2000/svg"
							class="h-5 w-5 text-red-500"
							viewBox="0 0 24 24"
							fill="currentColor"
						>
							<path
								d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z"
							/>
						</svg>
						<!-- 单曲循环 -->
						<svg
							v-else-if="playMode === PLAY_MODES.REPEAT_ONE"
							xmlns="http://www.w3.org/2000/svg"
							class="h-5 w-5 text-red-500"
							viewBox="0 0 24 24"
							fill="currentColor"
						>
							<path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4zm-4-2V9h-1l-2 1v1h1.5v4H13z" />
						</svg>
					</button>

					<!-- 音量控制 -->
					<PlayerVolume />

					<!-- 播放列表按钮 -->
					<button
						@click="togglePlaylist"
						class="relative flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-gray-100"
						title="播放列表"
					>
						<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-600" viewBox="0 0 24 24" fill="currentColor">
							<path
								d="M15 6H3v2h12V6zm0 4H3v2h12v-2zM3 16h8v-2H3v2zM17 6v8.18c-.31-.11-.65-.18-1-.18-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3V8h3V6h-5z"
							/>
						</svg>
						<!-- 列表数量徽章 -->
						<span
							v-if="playlist.length > 0"
							class="absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white"
						>
							{{ playlist.length > 99 ? '99+' : playlist.length }}
						</span>
					</button>
				</div>
			</div>

			<!-- 移动端布局 -->
			<div class="flex h-16 items-center gap-3 md:hidden">
				<!-- 歌曲信息 -->
				<div class="min-w-0 flex-1">
					<PlayerInfo />
				</div>

				<!-- 播放控制 -->
				<PlayerControls />

				<!-- 播放列表按钮 -->
				<button
					@click="togglePlaylist"
					class="relative flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full transition-colors hover:bg-gray-100"
				>
					<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-600" viewBox="0 0 24 24" fill="currentColor">
						<path
							d="M15 6H3v2h12V6zm0 4H3v2h12v-2zM3 16h8v-2H3v2zM17 6v8.18c-.31-.11-.65-.18-1-.18-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3V8h3V6h-5z"
						/>
					</svg>
					<span
						v-if="playlist.length > 0"
						class="absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white"
					>
						{{ playlist.length > 99 ? '99+' : playlist.length }}
					</span>
				</button>
			</div>

			<!-- 移动端进度条 -->
			<div class="pb-2 md:hidden">
				<PlayerProgress />
			</div>
		</div>

		<!-- 播放列表弹窗 -->
		<PlayerPlaylist v-model:open="playlistVisible" />
	</div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { usePlayerStore, PLAY_MODES } from '@/stores/player'
import { useAudioPlayer } from '@/composables/useAudioPlayer'
import PlayerInfo from './PlayerInfo.vue'
import PlayerControls from './PlayerControls.vue'
import PlayerProgress from './PlayerProgress.vue'
import PlayerVolume from './PlayerVolume.vue'
import PlayerPlaylist from './PlayerPlaylist.vue'

const playerStore = usePlayerStore()
const { currentTrack, playMode, playlist } = storeToRefs(playerStore)

// 初始化音频播放器
useAudioPlayer()

// 播放列表弹窗显示状态
const playlistVisible = ref(false)

/**
 * 播放模式标题（自动响应模式变化）
 */
const playModeTitle = computed(() => {
	switch (playMode.value) {
		case PLAY_MODES.SEQUENTIAL:
			return '顺序播放'
		case PLAY_MODES.RANDOM:
			return '随机播放'
		case PLAY_MODES.REPEAT_ONE:
			return '单曲循环'
		default:
			return '顺序播放'
	}
})

/**
 * 切换播放模式
 */
function togglePlayMode() {
	playerStore.togglePlayMode()
}

/**
 * 切换播放列表显示
 */
function togglePlaylist() {
	playlistVisible.value = !playlistVisible.value
}
</script>
