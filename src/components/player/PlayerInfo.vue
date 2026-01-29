<template>
	<div class="flex items-center gap-3">
		<!-- 封面图片 -->
		<div class="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded bg-gradient-to-br from-red-400 to-red-600">
			<img v-if="currentTrack?.coverUrl" :src="currentTrack.coverUrl" :alt="currentTrack.name" class="h-full w-full object-cover" />
			<!-- 默认音乐图标 -->
			<div v-else class="flex h-full w-full items-center justify-center text-white">
				<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
					<path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
				</svg>
			</div>
		</div>

		<!-- 歌曲信息 -->
		<div class="min-w-0 flex-1">
			<template v-if="currentTrack">
				<p class="truncate text-sm font-medium leading-tight">
					{{ currentTrack.name || currentTrack.title || '未知歌曲' }}
				</p>
				<p class="truncate text-xs text-gray-500">
					{{ currentTrack.artistNames || '未知歌手' }}
				</p>
			</template>
			<template v-else>
				<p class="text-sm text-gray-400">暂无播放</p>
			</template>
		</div>
	</div>
</template>

<script setup>
import { storeToRefs } from 'pinia'
import { usePlayerStore } from '@/stores/player'

const playerStore = usePlayerStore()
const { currentTrack } = storeToRefs(playerStore)
</script>
