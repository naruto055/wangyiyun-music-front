<template>
	<div class="min-h-screen bg-background">
		<!-- 顶部导航 -->
		<Header />

		<main class="container mx-auto px-4 py-8">
			<!-- 页面标题 -->
			<div class="mb-8">
				<h1 class="text-2xl font-bold">我的收藏</h1>
				<p class="mt-2 text-sm text-muted-foreground">共收藏 {{ total }} 首音乐</p>
			</div>

			<!-- 加载状态 - 骨架屏 -->
			<div v-if="loading && favoriteList.length === 0" class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
				<div v-for="i in 12" :key="i" class="space-y-3">
					<Skeleton class="aspect-square w-full rounded-lg" />
					<Skeleton class="h-4 w-3/4" />
					<Skeleton class="h-3 w-1/2" />
				</div>
			</div>

			<!-- 收藏列表 -->
			<div v-else class="space-y-8">
				<!-- 空状态 -->
				<div v-if="favoriteList.length === 0" class="py-20 text-center">
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
						<path
							d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"
						/>
					</svg>
					<h3 class="mt-4 text-lg font-semibold">暂无收藏</h3>
					<p class="mt-2 text-sm text-muted-foreground">快去发现喜欢的音乐吧</p>
				</div>

				<!-- 音乐网格 -->
				<div v-else>
					<div class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
						<MusicCard v-for="item in favoriteList" :key="item.id" :music="item" @click="handleMusicClick" />
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
import { useFavoriteStore } from '@/stores/favorite'
import Header from '@/components/layout/Header.vue'
import MusicCard from '@/components/MusicCard.vue'
import MusicDetailDialog from '@/components/MusicDetailDialog.vue'
import Pagination from '@/components/ui/pagination/Pagination.vue'
import Skeleton from '@/components/ui/skeleton/Skeleton.vue'

const favoriteStore = useFavoriteStore()

// 对话框状态
const showDetailDialog = ref(false)
const selectedMusicId = ref(null)

// 计算属性
const favoriteList = computed(() => favoriteStore.favoriteList)
const total = computed(() => favoriteStore.total)
const currentPage = computed({
	get: () => favoriteStore.currentPage,
	set: (val) => favoriteStore.setPagination(val, undefined),
})
const pageSize = computed(() => favoriteStore.pageSize)
const loading = computed(() => favoriteStore.loading)

/**
 * 加载收藏列表
 */
async function loadFavoriteList() {
	await favoriteStore.fetchFavoriteList()
}

/**
 * 页码变化
 */
function handlePageChange(page) {
	loadFavoriteList()
	// 滚动到顶部
	window.scrollTo({ top: 0, behavior: 'smooth' })
}

/**
 * 点击音乐卡片
 */
function handleMusicClick(item) {
	selectedMusicId.value = item.musicId
	showDetailDialog.value = true
}

/**
 * 初始化
 */
onMounted(() => {
	loadFavoriteList()
})
</script>
