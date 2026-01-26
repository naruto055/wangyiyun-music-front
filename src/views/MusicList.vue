<template>
	<div class="min-h-screen bg-background">
		<!-- 顶部导航 -->
		<Header />

		<main class="container mx-auto px-4 py-8">
			<!-- 搜索框 -->
			<div class="mb-8">
				<div class="relative max-w-md">
					<Input v-model="searchKeyword" type="text" placeholder="搜索歌曲、歌手..." class="h-12 pr-28 pl-12" @keydown.enter.prevent="handleSearch" />
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<circle cx="11" cy="11" r="8"></circle>
						<path d="m21 21-4.35-4.35"></path>
					</svg>
					<Button class="absolute right-1.5 top-1.5 h-9" @click="handleSearch">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="h-4 w-4"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
						>
							<circle cx="11" cy="11" r="8"></circle>
							<path d="m21 21-4.35-4.35"></path>
						</svg>
						<span>搜索</span>
					</Button>
				</div>
			</div>

			<!-- 加载状态 - 骨架屏 -->
			<div v-if="loading && musicList.length === 0" class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
				<div v-for="i in 12" :key="i" class="space-y-3">
					<Skeleton class="aspect-square w-full rounded-lg" />
					<Skeleton class="h-4 w-3/4" />
					<Skeleton class="h-3 w-1/2" />
				</div>
			</div>

			<!-- 音乐列表 -->
			<div v-else class="space-y-8">
				<!-- 空状态 -->
				<div v-if="musicList.length === 0" class="py-20 text-center">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="mx-auto h-24 w-24 text-muted-foreground"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="1"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<path d="M9 18V5l12-2v13"></path>
						<circle cx="6" cy="18" r="3"></circle>
						<circle cx="18" cy="16" r="3"></circle>
					</svg>
					<h3 class="mt-4 text-lg font-semibold">暂无音乐</h3>
					<p class="mt-2 text-sm text-muted-foreground">试试其他搜索关键词吧</p>
				</div>

				<!-- 音乐网格 -->
				<div v-else>
					<div class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
						<MusicCard v-for="music in musicList" :key="music.id" :music="music" @click="handleMusicClick" />
					</div>

					<!-- 分页器 -->
					<div class="mt-8 flex justify-center">
						<Pagination v-model:current-page="currentPage" :page-size="pageSize" :total="total" @page-change="handlePageChange" />
					</div>
				</div>
			</div>
		</main>

		<!-- 音乐详情对话框 -->
		<MusicDetailDialog v-model:open="showDetailDialog" :music-id="selectedMusicId" />
	</div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useMusicStore } from '@/stores/music'
import Header from '@/components/layout/Header.vue'
import Input from '@/components/ui/input/Input.vue'
import Button from '@/components/ui/button/Button.vue'
import MusicCard from '@/components/MusicCard.vue'
import MusicDetailDialog from '@/components/MusicDetailDialog.vue'
import Pagination from '@/components/ui/pagination/Pagination.vue'
import Skeleton from '@/components/ui/skeleton/Skeleton.vue'

const musicStore = useMusicStore()

// 搜索关键词
const searchKeyword = ref('')

// 对话框状态
const showDetailDialog = ref(false)
const selectedMusicId = ref(null)

// 计算属性
const musicList = computed(() => musicStore.musicList)
const total = computed(() => musicStore.total)
const currentPage = computed({
	get: () => musicStore.currentPage,
	set: (val) => musicStore.setPagination(val, undefined),
})
const pageSize = computed(() => musicStore.pageSize)
const loading = computed(() => musicStore.loading)

/**
 * 搜索处理
 */
const handleSearch = () => {
	musicStore.setSearchKeyword(searchKeyword.value)
	loadMusicList()
}

/**
 * 加载音乐列表
 */
async function loadMusicList() {
	await musicStore.fetchMusicList()
}

/**
 * 页码变化
 */
function handlePageChange(page) {
	loadMusicList()
	// 滚动到顶部
	window.scrollTo({ top: 0, behavior: 'smooth' })
}

/**
 * 点击音乐卡片
 */
function handleMusicClick(music) {
	selectedMusicId.value = music.id
	showDetailDialog.value = true
}

/**
 * 初始化
 */
onMounted(() => {
	loadMusicList()
})
</script>
