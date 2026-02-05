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
				<div class="flex items-center gap-2">
					<p class="truncate text-sm font-medium leading-tight">
						{{ currentTrack.name || currentTrack.title || '未知歌曲' }}
					</p>
					<!-- 临时文件标识 -->
					<span
						v-if="isTemporaryTrack(currentTrack)"
						class="inline-flex items-center rounded bg-amber-100 px-1.5 py-0.5 text-xs font-medium text-amber-800 flex-shrink-0"
						:title="getExpiryHint(currentTrack) || '临时文件'"
					>
						<svg class="w-3 h-3 mr-0.5" fill="currentColor" viewBox="0 0 20 20">
							<path
								fill-rule="evenodd"
								d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
								clip-rule="evenodd"
							/>
						</svg>
						临时
					</span>
				</div>
				<p class="truncate text-xs text-gray-500">
					{{ currentTrack.artistNames || '未知歌手' }}
					<span v-if="expiryHint" class="text-amber-600 ml-1">{{ expiryHint }}</span>
				</p>
			</template>
			<template v-else>
				<p class="text-sm text-gray-400">暂无播放</p>
			</template>
		</div>
	</div>
</template>

<script setup>
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { usePlayerStore } from '@/stores/player'
import { isTemporaryTrack, getExpiryHint } from '@/utils/trackAdapter'

const playerStore = usePlayerStore()
const { currentTrack } = storeToRefs(playerStore)

// 计算过期提示文本
const expiryHint = computed(() => {
	if (!currentTrack.value) return null
	return getExpiryHint(currentTrack.value)
})
</script>
