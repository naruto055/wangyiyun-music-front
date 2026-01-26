<template>
	<Dialog :open="open" @update:open="$emit('update:open', $event)" class="max-w-2xl">
		<template v-if="musicDetail">
			<!-- 封面大图 -->
			<div class="flex gap-6">
				<div class="relative h-48 w-48 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
					<img v-if="musicDetail.coverUrl" :src="musicDetail.coverUrl" :alt="musicDetail.name" class="h-full w-full object-cover" />
					<div v-else class="flex h-full w-full items-center justify-center bg-gradient-to-br from-red-400 to-red-600 text-white">
						<svg xmlns="http://www.w3.org/2000/svg" class="h-24 w-24" viewBox="0 0 24 24" fill="currentColor">
							<path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
						</svg>
					</div>
				</div>

				<!-- 音乐信息 -->
				<div class="flex-1 space-y-4">
					<div>
						<h2 class="text-2xl font-bold">{{ musicDetail.name }}</h2>
						<p class="mt-2 text-sm text-muted-foreground">时长：{{ formatDuration(musicDetail.duration) }}</p>
						<p class="text-sm text-muted-foreground">播放量：{{ formatPlayCount(musicDetail.playCount) }}</p>
					</div>

					<!-- 歌手列表 -->
					<div v-if="musicDetail.artists && musicDetail.artists.length > 0" class="space-y-2">
						<h3 class="text-sm font-semibold">歌手</h3>
						<div class="flex flex-wrap gap-2">
							<div v-for="artist in musicDetail.artists" :key="artist.id" class="flex items-center gap-2 rounded-full bg-muted px-3 py-1.5">
								<img v-if="artist.avatarUrl" :src="artist.avatarUrl" :alt="artist.name" class="h-5 w-5 rounded-full object-cover" />
								<span class="text-sm">{{ artist.name }}</span>
							</div>
						</div>
					</div>

					<!-- 标签列表 -->
					<div v-if="musicDetail.tags && musicDetail.tags.length > 0" class="space-y-2">
						<h3 class="text-sm font-semibold">标签</h3>
						<div class="flex flex-wrap gap-2">
							<span v-for="tag in musicDetail.tags" :key="tag.id" class="rounded-full border border-border px-3 py-1 text-xs">
								{{ tag.name }}
							</span>
						</div>
					</div>
				</div>
			</div>
		</template>

		<!-- 加载状态 -->
		<div v-else class="flex items-center justify-center py-12">
			<div class="text-center">
				<div
					class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite]"
				></div>
				<p class="mt-4 text-sm text-muted-foreground">加载中...</p>
			</div>
		</div>

		<template #footer>
			<button
				@click="$emit('update:open', false)"
				class="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2"
			>
				关闭
			</button>
		</template>
	</Dialog>
</template>

<script setup>
import { ref, watch } from 'vue'
import Dialog from '@/components/ui/dialog/Dialog.vue'
import { useMusicStore } from '@/stores/music'

const props = defineProps({
	open: {
		type: Boolean,
		required: true,
	},
	musicId: {
		type: Number,
		default: null,
	},
})

const emit = defineEmits(['update:open'])

const musicStore = useMusicStore()

// 组件内部状态，不需要暴露给父组件
const musicDetail = ref(null)

/**
 * 监听弹窗打开，获取音乐详情
 */
watch(
	() => props.open,
	async (newVal) => {
		if (newVal && props.musicId) {
			musicDetail.value = await musicStore.fetchMusicDetail(props.musicId)
		}
	},
	{ immediate: true }
)

/**
 * 格式化时长
 */
function formatDuration(seconds) {
	if (!seconds) return '0:00'
	const minutes = Math.floor(seconds / 60)
	const secs = seconds % 60
	return `${minutes}:${secs.toString().padStart(2, '0')}`
}

/**
 * 格式化播放量
 */
function formatPlayCount(count) {
	if (!count) return '0'
	if (count >= 10000) {
		return (count / 10000).toFixed(1) + '万'
	}
	return count.toString()
}
</script>
