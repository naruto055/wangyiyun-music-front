<template>
	<div class="min-h-screen bg-background">
		<!-- 顶部导航 -->
		<Header />

		<main class="container mx-auto px-4 py-8">
			<!-- 操作栏 -->
			<div class="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<!-- 排序下拉框 -->
				<div class="w-full sm:w-64">
					<select
						v-model="sortOption"
						@change="handleSortChange"
						class="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
					>
						<option value="release_date_desc">发行日期降序（默认）</option>
						<option value="release_date_asc">发行日期升序</option>
						<option value="create_time_desc">创建时间降序</option>
						<option value="create_time_asc">创建时间升序</option>
					</select>
				</div>

				<!-- 创建专辑按钮 -->
				<button
					@click="handleCreateAlbum"
					class="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring bg-primary text-primary-foreground shadow hover:bg-primary/90 h-10 px-4 py-2"
				>
					<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M5 12h14" />
						<path d="M12 5v14" />
					</svg>
					<span>创建专辑</span>
				</button>
			</div>

			<!-- 加载状态 - 骨架屏 -->
			<div v-if="loading && albumList.length === 0" class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
				<div v-for="i in 12" :key="i" class="space-y-3">
					<Skeleton class="aspect-square w-full rounded-lg" />
					<Skeleton class="h-4 w-3/4" />
					<Skeleton class="h-3 w-1/2" />
				</div>
			</div>

			<!-- 专辑列表 -->
			<div v-else class="space-y-8">
				<!-- 空状态 -->
				<div v-if="albumList.length === 0" class="py-20 text-center">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="mx-auto h-24 w-24 text-muted-foreground"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="1"
					>
						<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" />
					</svg>
					<h3 class="mt-4 text-lg font-semibold">暂无专辑数据</h3>
					<p class="mt-2 text-sm text-muted-foreground">点击上方按钮创建第一个专辑吧</p>
					<button
						@click="handleCreateAlbum"
						class="mt-4 inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2"
					>
						创建专辑
					</button>
				</div>

				<!-- 专辑网格 -->
				<div v-else>
					<div class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
						<AlbumCard v-for="album in albumList" :key="album.id" :album="album" @click="handleAlbumClick" />
					</div>

					<!-- 分页器 -->
					<div v-if="total > pageSize" class="mt-8 flex justify-center">
						<Pagination v-model:current-page="currentPage" :page-size="pageSize" :total="total" @page-change="handlePageChange" />
					</div>
				</div>
			</div>
		</main>

		<!-- 专辑详情对话框 -->
		<AlbumDetailDialog v-model:open="showDetailDialog" :album-id="selectedAlbumId" @edit="handleEditAlbum" @delete="handleDeleteAlbum" />

		<!-- 专辑表单对话框 -->
		<AlbumFormDialog v-model:open="showFormDialog" :mode="formMode" :album-id="formAlbumId" @success="handleFormSuccess" />
	</div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAlbumStore } from '@/stores/album'
import { toast } from '@/composables/useToast'
import Header from '@/components/layout/Header.vue'
import AlbumCard from '@/components/AlbumCard.vue'
import AlbumDetailDialog from '@/components/AlbumDetailDialog.vue'
import AlbumFormDialog from '@/components/AlbumFormDialog.vue'
import Pagination from '@/components/ui/pagination/Pagination.vue'
import Skeleton from '@/components/ui/skeleton/Skeleton.vue'

const albumStore = useAlbumStore()

// 排序选项
const sortOption = ref('release_date_desc')

// 对话框状态
const showDetailDialog = ref(false)
const selectedAlbumId = ref(null)

const showFormDialog = ref(false)
const formMode = ref('create')
const formAlbumId = ref(null)

// 计算属性
const albumList = computed(() => albumStore.albumList)
const total = computed(() => albumStore.total)
const currentPage = computed({
	get: () => albumStore.currentPage,
	set: (val) => albumStore.setPagination(val, undefined),
})
const pageSize = computed(() => albumStore.pageSize)
const loading = computed(() => albumStore.loading)

/**
 * 处理排序变更
 */
function handleSortChange() {
	const [field, order] = sortOption.value.split('_')
	const sortField = field === 'release' ? 'release_date' : 'create_time'
	const sortOrder = order // asc or desc

	albumStore.setSortField(sortField, sortOrder)
	loadAlbumList()
}

/**
 * 加载专辑列表
 */
async function loadAlbumList() {
	await albumStore.fetchAlbumList()
}

/**
 * 页码变化
 */
function handlePageChange(page) {
	loadAlbumList()
	// 滚动到顶部
	window.scrollTo({ top: 0, behavior: 'smooth' })
}

/**
 * 点击专辑卡片
 */
function handleAlbumClick(albumId) {
	selectedAlbumId.value = albumId
	showDetailDialog.value = true
}

/**
 * 点击创建专辑
 */
function handleCreateAlbum() {
	formMode.value = 'create'
	formAlbumId.value = null
	showFormDialog.value = true
}

/**
 * 点击编辑专辑
 */
function handleEditAlbum(albumId) {
	// 关闭详情对话框
	showDetailDialog.value = false

	// 打开表单对话框
	formMode.value = 'edit'
	formAlbumId.value = albumId
	showFormDialog.value = true
}

/**
 * 点击删除专辑
 */
async function handleDeleteAlbum(albumId) {
	try {
		await albumStore.deleteAlbum(albumId)
		toast.success('专辑删除成功')

		// 关闭详情对话框
		showDetailDialog.value = false

		// 刷新列表
		await loadAlbumList()

		// 如果当前页为空，跳转到上一页
		if (albumList.value.length === 0 && currentPage.value > 1) {
			albumStore.setPagination(currentPage.value - 1, undefined)
			await loadAlbumList()
		}
	} catch (error) {
		console.error('删除专辑失败:', error)
		toast.error(error.message || '删除失败，请稍后重试')
	}
}

/**
 * 表单提交成功
 */
async function handleFormSuccess() {
	// 刷新列表
	await loadAlbumList()
}

/**
 * 组件挂载
 */
onMounted(() => {
	loadAlbumList()
})
</script>
