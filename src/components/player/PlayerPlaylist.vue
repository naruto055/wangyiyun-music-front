<template>
	<Dialog :open="open" @update:open="handleClose" class="max-w-md">
		<div class="flex h-[500px] flex-col">
			<!-- 标题栏 -->
			<div class="mb-4 flex items-center justify-between border-b pb-3">
				<h2 class="text-lg font-semibold">播放列表 ({{ playlist.length }})</h2>
				<button v-if="playlist.length > 0" @click="handleClearPlaylist" class="text-sm text-red-500 transition-colors hover:text-red-600">
					清空列表
				</button>
			</div>

			<!-- 播放列表 -->
			<div v-if="playlist.length > 0" class="flex-1 overflow-y-auto">
				<ul class="space-y-1">
					<li
						v-for="(track, index) in playlist"
						:key="`${track.id}-${index}`"
						class="group flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-gray-50"
						:class="{ 'bg-red-50': index === currentIndex }"
						@click="handlePlayTrack(index)"
					>
						<!-- 当前播放指示器 -->
						<div class="flex w-5 items-center justify-center">
							<div v-if="index === currentIndex" class="flex items-center justify-center">
								<svg v-if="isPlaying" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-red-500" viewBox="0 0 24 24" fill="currentColor">
									<path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
								</svg>
								<svg v-else xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-red-500" viewBox="0 0 24 24" fill="currentColor">
									<path d="M8 5v14l11-7z" />
								</svg>
							</div>
							<span v-else class="text-xs text-gray-400">{{ index + 1 }}</span>
						</div>

						<!-- 歌曲信息 -->
						<div class="min-w-0 flex-1">
							<p class="truncate text-sm font-medium" :class="{ 'text-red-500': index === currentIndex }">
								{{ track.name || track.title }}
							</p>
							<p class="truncate text-xs text-gray-500">
								{{ track.artistNames || '未知歌手' }}
							</p>
						</div>

						<!-- 删除按钮 -->
						<button @click.stop="handleRemoveTrack(index)" class="opacity-0 transition-opacity group-hover:opacity-100" title="从列表移除">
							<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-400 hover:text-red-500" viewBox="0 0 24 24" fill="currentColor">
								<path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
							</svg>
						</button>
					</li>
				</ul>
			</div>

			<!-- 空状态 -->
			<div v-else class="flex flex-1 flex-col items-center justify-center text-gray-400">
				<svg xmlns="http://www.w3.org/2000/svg" class="mb-3 h-16 w-16" viewBox="0 0 24 24" fill="currentColor">
					<path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
				</svg>
				<p class="text-sm">播放列表为空</p>
				<p class="mt-1 text-xs">点击歌曲卡片上的播放按钮添加歌曲</p>
			</div>
		</div>

		<template #footer>
			<button
				@click="handleClose"
				class="inline-flex w-full items-center justify-center gap-2 rounded-md bg-gray-100 px-4 py-2 text-sm font-medium transition-colors hover:bg-gray-200"
			>
				关闭
			</button>
		</template>
	</Dialog>
</template>

<script setup>
import { storeToRefs } from 'pinia'
import { usePlayerStore } from '@/stores/player'
import Dialog from '@/components/ui/dialog/Dialog.vue'

const props = defineProps({
	open: {
		type: Boolean,
		required: true,
	},
})

const emit = defineEmits(['update:open'])

const playerStore = usePlayerStore()
const { playlist, currentIndex, isPlaying } = storeToRefs(playerStore)

/**
 * 关闭弹窗
 */
function handleClose() {
	emit('update:open', false)
}

/**
 * 播放指定歌曲
 */
function handlePlayTrack(index) {
	if (index === currentIndex.value) {
		// 点击当前播放的歌曲，切换播放/暂停
		playerStore.togglePlay()
	} else {
		// 切换到指定歌曲
		playerStore.currentIndex = index
		const track = playlist.value[index]
		if (track) {
			playerStore.playTrack(track)
		}
	}
}

/**
 * 从列表移除歌曲
 */
function handleRemoveTrack(index) {
	playerStore.removeFromPlaylist(index)
}

/**
 * 清空播放列表
 */
function handleClearPlaylist() {
	if (confirm('确定要清空播放列表吗？')) {
		playerStore.clearPlaylist()
		handleClose()
	}
}
</script>
