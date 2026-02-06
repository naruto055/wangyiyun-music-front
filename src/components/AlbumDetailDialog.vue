<template>
	<Dialog :open="open" @update:open="$emit('update:open', $event)" class="max-w-2xl">
		<!-- 加载成功 -->
		<template v-if="!loading && !error && albumDetail">
			<div class="flex gap-6">
				<!-- 封面大图 -->
				<div class="relative h-48 w-48 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
					<img
						v-if="albumDetail.coverUrl"
						:src="albumDetail.coverUrl"
						:alt="albumDetail.name"
						class="h-full w-full object-cover"
						:onerror="handleImageError"
					/>
					<div v-else class="flex h-full w-full items-center justify-center bg-gradient-to-br from-purple-400 to-purple-600 text-white">
						<svg xmlns="http://www.w3.org/2000/svg" class="h-24 w-24" viewBox="0 0 24 24" fill="currentColor">
							<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" />
						</svg>
					</div>
				</div>

				<!-- 专辑信息 -->
				<div class="flex-1 space-y-4">
					<div>
						<h2 class="text-2xl font-bold">{{ albumDetail.name }}</h2>
						<p v-if="albumDetail.releaseDate" class="mt-2 text-sm text-muted-foreground">发行日期：{{ formatDate(albumDetail.releaseDate) }}</p>
						<p class="text-sm text-muted-foreground">歌曲数量：{{ albumDetail.musicCount || 0 }} 首</p>
					</div>

					<!-- 专辑简介 -->
					<div v-if="albumDetail.description" class="space-y-2">
						<h3 class="text-sm font-semibold">专辑简介</h3>
						<p class="text-sm text-muted-foreground">{{ albumDetail.description }}</p>
					</div>

					<!-- 时间信息 -->
					<div class="space-y-1">
						<p class="text-xs text-muted-foreground">创建时间：{{ formatDateTime(albumDetail.createTime) }}</p>
						<p v-if="albumDetail.updateTime" class="text-xs text-muted-foreground">更新时间：{{ formatDateTime(albumDetail.updateTime) }}</p>
					</div>
				</div>
			</div>
		</template>

		<!-- 加载中 -->
		<div v-else-if="loading" class="flex items-center justify-center py-12">
			<div class="text-center">
				<div
					class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite]"
				></div>
				<p class="mt-4 text-sm text-muted-foreground">加载中...</p>
			</div>
		</div>

		<!-- 加载失败 -->
		<div v-else-if="error" class="flex items-center justify-center py-12">
			<div class="text-center">
				<p class="text-sm text-muted-foreground">{{ error }}</p>
				<button
					@click="retryLoad"
					class="mt-4 inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2"
				>
					重试
				</button>
			</div>
		</div>

		<template #footer>
			<div class="flex items-center justify-between gap-4">
				<!-- 编辑按钮 -->
				<button
					v-if="albumDetail"
					@click="handleEdit"
					class="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2"
				>
					<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
						<path d="m15 5 4 4" />
					</svg>
					<span>编辑</span>
				</button>

				<!-- 删除按钮 -->
				<button
					v-if="albumDetail"
					@click="handleDelete"
					class="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring border border-input bg-background hover:bg-red-50 hover:text-red-600 h-9 px-4 py-2"
				>
					<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M3 6h18" />
						<path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
						<path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
					</svg>
					<span>删除</span>
				</button>

				<!-- 关闭按钮 -->
				<button
					@click="$emit('update:open', false)"
					class="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2 ml-auto"
				>
					关闭
				</button>
			</div>
		</template>
	</Dialog>
</template>

<script setup>
import { ref, watch } from 'vue'
import Dialog from '@/components/ui/dialog/Dialog.vue'
import { useAlbumStore } from '@/stores/album'
import { useConfirm } from '@/composables/useConfirm'

const props = defineProps({
	open: {
		type: Boolean,
		required: true,
	},
	albumId: {
		type: Number,
		default: null,
	},
})

const emit = defineEmits(['update:open', 'edit', 'delete'])

const albumStore = useAlbumStore()

// 组件内部状态
const albumDetail = ref(null)
const loading = ref(false)
const error = ref(null)

/**
 * 监听弹窗打开，获取专辑详情
 */
watch(
	() => props.open,
	async (newVal) => {
		if (newVal && props.albumId) {
			await loadAlbumDetail()
		}
	},
	{ immediate: true }
)

/**
 * 加载专辑详情
 */
async function loadAlbumDetail() {
	loading.value = true
	error.value = null
	try {
		albumDetail.value = await albumStore.fetchAlbumDetail(props.albumId)
		if (!albumDetail.value) {
			error.value = '专辑不存在或已被删除'
		}
	} catch (err) {
		console.error('获取专辑详情失败:', err)
		error.value = '加载失败，请稍后重试'
	} finally {
		loading.value = false
	}
}

/**
 * 重试加载
 */
function retryLoad() {
	loadAlbumDetail()
}

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
 * 格式化日期时间为 YYYY-MM-DD HH:mm
 * @param {string} dateTimeStr - 日期时间字符串
 * @returns {string} 格式化后的日期时间
 */
function formatDateTime(dateTimeStr) {
	if (!dateTimeStr) return ''
	try {
		const date = new Date(dateTimeStr)
		const year = date.getFullYear()
		const month = String(date.getMonth() + 1).padStart(2, '0')
		const day = String(date.getDate()).padStart(2, '0')
		const hours = String(date.getHours()).padStart(2, '0')
		const minutes = String(date.getMinutes()).padStart(2, '0')
		return `${year}-${month}-${day} ${hours}:${minutes}`
	} catch (error) {
		console.error('日期时间格式化失败:', error)
		return dateTimeStr
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
 * 处理编辑按钮点击
 */
function handleEdit() {
	emit('edit', props.albumId)
}

/**
 * 处理删除按钮点击
 */
async function handleDelete() {
	try {
		await useConfirm({
			title: '删除专辑',
			message: `确定要删除专辑 "${albumDetail.value?.name}" 吗？如果专辑下有歌曲，将无法删除。`,
			type: 'danger',
			confirmText: '删除',
			cancelText: '取消',
			confirmButtonType: 'danger',
		})
		// 用户确认删除
		emit('delete', props.albumId)
	} catch {
		// 用户取消删除，不做任何操作
	}
}
</script>
