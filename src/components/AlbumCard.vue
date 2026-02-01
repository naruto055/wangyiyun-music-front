<template>
	<Card class="album-card group cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1" @click="handleClick">
		<CardContent class="p-0">
			<!-- 封面图片 -->
			<div class="relative aspect-square overflow-hidden rounded-t-lg bg-muted">
				<img
					v-if="album.coverUrl"
					:src="album.coverUrl"
					:alt="album.name"
					:onerror="handleImageError"
					class="h-full w-full object-cover transition-transform group-hover:scale-105"
					loading="lazy"
				/>
				<div v-else class="flex h-full w-full items-center justify-center bg-gradient-to-br from-red-400 to-red-600 text-white">
					<svg xmlns="http://www.w3.org/2000/svg" class="h-20 w-20" viewBox="0 0 24 24" fill="currentColor">
						<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" />
					</svg>
				</div>
			</div>

			<!-- 专辑信息 -->
			<div class="space-y-1 p-3">
				<h3 class="truncate text-sm font-medium leading-tight group-hover:text-red-500">
					{{ album.name }}
				</h3>
				<p class="truncate text-xs text-muted-foreground">发布日期：{{ album.releaseDate ? formatDate(album.releaseDate) : '发行日期未知' }}</p>
			</div>
		</CardContent>
	</Card>
</template>

<script setup>
import Card from '@/components/ui/card/Card.vue'
import CardContent from '@/components/ui/card/CardContent.vue'

const props = defineProps({
	album: {
		type: Object,
		required: true,
	},
})

const emit = defineEmits(['click'])

/**
 * 格式化日期为 YYYY-MM-DD
 * @param {string} dateStr - 日期字符串
 * @returns {string} 格式化后的日期
 */
function formatDate(dateStr) {
	if (!dateStr) return ''
	try {
		const date = new Date(dateStr)
		const year = date.getFullYear()
		const month = String(date.getMonth() + 1).padStart(2, '0')
		const day = String(date.getDate()).padStart(2, '0')
		return `${year}-${month}-${day}`
	} catch (error) {
		console.error('日期格式化失败:', error)
		return dateStr
	}
}

/**
 * 处理图片加载失败
 * @param {Event} event - 错误事件
 */
function handleImageError(event) {
	event.target.src = '/images/default-album-cover.png'
}

/**
 * 处理点击事件
 */
function handleClick() {
	emit('click', props.album.id)
}
</script>

<style scoped>
.album-card {
	border-radius: 8px;
}
</style>
