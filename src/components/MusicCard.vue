<template>
	<Card class="music-card group cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1" @click="handleClick">
		<CardContent class="p-0">
			<!-- 封面图片 -->
			<div class="relative aspect-square overflow-hidden rounded-t-lg bg-muted">
				<img
					v-if="music.coverUrl"
					:src="music.coverUrl"
					:alt="music.title"
					class="h-full w-full object-cover transition-transform group-hover:scale-105"
				/>
				<div v-else class="flex h-full w-full items-center justify-center bg-gradient-to-br from-red-400 to-red-600 text-white">
					<svg xmlns="http://www.w3.org/2000/svg" class="h-20 w-20" viewBox="0 0 24 24" fill="currentColor">
						<path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
					</svg>
				</div>

				<!-- 播放遮罩层 -->
				<div
					class="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100"
					@click.stop="handlePlay"
				>
					<div class="flex h-16 w-16 items-center justify-center rounded-full bg-red-500 text-white shadow-lg">
						<svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" viewBox="0 0 24 24" fill="currentColor">
							<path d="M8 5v14l11-7z" />
						</svg>
					</div>
				</div>

				<!-- 播放量 -->
				<div class="absolute right-2 top-2 flex items-center gap-1 rounded bg-black/50 px-2 py-1 text-xs text-white">
					<svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 24 24" fill="currentColor">
						<path d="M8 5v14l11-7z" />
					</svg>
					<span>{{ formatPlayCount(music.playCount) }}</span>
				</div>
			</div>

			<!-- 音乐信息 -->
			<div class="space-y-1 p-3">
				<h3 class="truncate text-sm font-medium leading-tight group-hover:text-red-500">
					{{ music.title }}
				</h3>
				<p class="truncate text-xs text-muted-foreground">
					{{ music.artistNames || '未知歌手' }}
				</p>
			</div>
		</CardContent>
	</Card>
</template>

<script setup>
import Card from '@/components/ui/card/Card.vue'
import CardContent from '@/components/ui/card/CardContent.vue'
import { usePlayerStore } from '@/stores/player'
import { useMusicStore } from '@/stores/music'
import { formatPlayCount } from '@/utils/audioFormat'
import { adaptMusicToTrack } from '@/utils/trackAdapter'

const playerStore = usePlayerStore()
const musicStore = useMusicStore()

const props = defineProps({
	music: {
		type: Object,
		required: true,
	},
})

const emit = defineEmits(['click'])

/**
 * 处理播放按钮点击
 * 先获取音乐详情（包含 fileUrl），再播放
 */
async function handlePlay() {
	// 获取音乐ID（兼容不同的数据结构）
	const musicId = props.music.id || props.music.musicId
	if (!musicId) {
		console.error('无法获取音乐ID')
		return
	}

	// 获取完整的音乐详情（包含 fileUrl 和 audioSources）
	const musicDetail = await musicStore.fetchMusicDetail(musicId)
	if (musicDetail) {
		// 使用适配器将音乐详情转换为统一的音轨格式
		const track = adaptMusicToTrack(musicDetail)
		playerStore.playTrack(track)
	} else {
		console.error('获取音乐详情失败')
	}
}

/**
 * 处理点击事件
 */
function handleClick() {
	emit('click', props.music)
}
</script>

<style scoped>
.music-card {
	border-radius: 8px;
}
</style>
