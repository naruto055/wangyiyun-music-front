<template>
	<div class="min-h-screen bg-background">
		<Header />

		<main class="container mx-auto px-4 py-8 max-w-6xl">
			<!-- 页面标题 -->
			<div class="mb-8">
				<h1 class="text-3xl font-bold text-foreground mb-2">B站音乐搜索</h1>
				<p class="text-sm text-muted-foreground">搜索 B 站视频并在线播放音频，支持关键词、BV号搜索</p>
			</div>

			<!-- 搜索功能区 -->
			<Card class="p-6 mb-8">
				<!-- 搜索输入框 -->
				<div class="flex gap-2 mb-4">
					<div class="relative flex-1">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
						>
							<circle cx="11" cy="11" r="8"></circle>
							<path d="m21 21-4.35-4.35"></path>
						</svg>
						<Input v-model="searchKeyword" placeholder="搜索歌曲、歌手或输入 BV 号..." class="pl-10" @keyup.enter="handleSearch" />
					</div>
					<Button @click="handleSearch" :disabled="loading || !searchKeyword.trim()">
						<svg xmlns="http://www.w3.org/2000/svg" class="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<circle cx="11" cy="11" r="8"></circle>
							<path d="m21 21-4.35-4.35"></path>
						</svg>
						搜索
					</Button>
				</div>

				<!-- 搜索历史 -->
				<div v-if="searchHistory.length > 0">
					<div class="flex items-center justify-between mb-3">
						<span class="text-sm text-muted-foreground">搜索历史</span>
						<Button variant="ghost" size="sm" @click="handleClearHistory">
							<svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
								<path d="M18 6 6 18" />
								<path d="m6 6 12 12" />
							</svg>
							清空
						</Button>
					</div>
					<div class="flex flex-wrap gap-2">
						<Button
							v-for="item in searchHistory"
							:key="item.id"
							variant="outline"
							size="sm"
							class="text-xs"
							@click="handleHistoryClick(item.keyword)"
						>
							{{ item.keyword }}
							<span class="ml-1 text-muted-foreground">({{ item.searchCount }})</span>
						</Button>
					</div>
				</div>
			</Card>

			<!-- 骨架屏加载状态 -->
			<div v-if="loading" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
				<Card v-for="i in 8" :key="i" class="p-4">
					<Skeleton class="w-full aspect-video mb-3" />
					<Skeleton class="h-4 w-3/4 mb-2" />
					<Skeleton class="h-3 w-1/2" />
				</Card>
			</div>

			<!-- 空状态 -->
			<div v-else-if="searchResults.length === 0 && hasSearched" class="flex flex-col items-center justify-center py-16">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-20 w-20 text-muted-foreground mb-4"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="1"
				>
					<path d="M9 18V5l12-2v13"></path>
					<circle cx="6" cy="18" r="3"></circle>
					<circle cx="18" cy="16" r="3"></circle>
				</svg>
				<p class="text-lg font-medium text-foreground mb-2">未找到相关视频</p>
				<p class="text-sm text-muted-foreground">换个关键词试试，或者尝试输入 BV 号</p>
			</div>

			<!-- 视频卡片网格 -->
			<div v-else-if="searchResults.length > 0" class="space-y-8">
				<div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
					<Card v-for="video in searchResults" :key="video.bvid" class="group p-4 hover:shadow-lg transition-all flex flex-col">
						<!-- 内容区域（标题 + 元信息）- 自动占据剩余空间 -->
						<div class="flex-1 flex flex-col">
							<!-- 标题（可点击查看B站详情） -->
							<h3
								class="text-sm font-medium text-foreground mb-2 line-clamp-2 group-hover:text-red-500 transition-colors cursor-pointer"
								@click="() => window.open(video.url, '_blank')"
								title="点击查看B站详情"
							>
								{{ video.title }}
							</h3>

							<!-- 元信息 -->
							<div class="flex items-center justify-between text-xs text-muted-foreground mt-auto mb-3">
								<span>{{ video.bvid }}</span>
								<span>{{ video.duration }}</span>
							</div>
						</div>

						<!-- 加载阶段提示（解析时显示） -->
						<div v-if="isVideoLoading(video.bvid)" class="text-xs text-muted-foreground text-center mb-2 animate-pulse">
							{{ getCurrentStage(video.bvid) }}
						</div>

						<!-- 按钮组 -->
						<div class="flex gap-2">
							<!-- 播放按钮 -->
							<Button
								class="flex-1"
								size="sm"
								variant="default"
								:disabled="isVideoLoading(video.bvid)"
								@click.stop="debouncedPlayVideo(video)"
							>
								<!-- 加载状态：旋转图标 -->
								<svg
									v-if="isVideoLoading(video.bvid)"
									class="mr-2 h-4 w-4 animate-spin"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
								>
									<circle class="opacity-25" cx="12" cy="12" r="10" stroke-width="4" />
									<path
										class="opacity-75"
										fill="currentColor"
										d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
									/>
								</svg>

								<!-- 正常状态：播放图标 -->
								<svg v-else class="mr-2 h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
									<path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
								</svg>

								<!-- 按钮文本 -->
								{{ isVideoLoading(video.bvid) ? '解析中...' : '播放' }}
							</Button>

							<!-- 保存能力暂未接入 -->
							<Button class="flex-1" size="sm" variant="outline" :disabled="true" title="当前版本暂不支持保存为音乐">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									class="mr-2 h-4 w-4"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
									stroke-linecap="round"
									stroke-linejoin="round"
								>
									<path d="M12 5v14" />
									<path d="M5 12h14" />
								</svg>
								暂不可用
							</Button>
						</div>
					</Card>
				</div>

				<!-- 分页 -->
				<div class="mt-8 flex justify-center">
					<Pagination v-model:current-page="currentPage" :page-size="pageSize" :total="total" @page-change="handlePageChange" />
				</div>
			</div>
		</main>

	</div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { searchBilibiliVideos, getSearchHistory, clearSearchHistory as clearSearchHistoryAPI } from '@/api/bilibili'
import { parseVideo, prepareAudio } from '@/api/video'
import { useToast } from '@/composables/useToast'
import { useDebounceFn } from '@/composables/useDebounce'
import { confirmWarning } from '@/composables/useConfirm'
import { usePlayerStore } from '@/stores/player'
import { adaptVideoToTrack } from '@/utils/trackAdapter'
import Header from '@/components/layout/Header.vue'
import Input from '@/components/ui/input/Input.vue'
import Button from '@/components/ui/button/Button.vue'
import Card from '@/components/ui/card/Card.vue'
import Skeleton from '@/components/ui/skeleton/Skeleton.vue'
import Pagination from '@/components/ui/pagination/Pagination.vue'

const toast = useToast()
const playerStore = usePlayerStore()

// 搜索状态
const searchKeyword = ref('')
const searchResults = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const loading = ref(false)
const hasSearched = ref(false)

// 搜索历史
const searchHistory = ref([])

// 视频加载状态管理（每个视频独立状态）
const videoStates = ref({})

// 阶段提示文本
const loadingStages = [
	'正在解析视频信息...',
	'正在准备音频资源...',
	'正在接入播放器...',
	'即将开始播放...',
]

/**
 * 初始化视频状态
 */
function initVideoState(bvid) {
	if (!videoStates.value[bvid]) {
		videoStates.value[bvid] = {
			isLoading: false,
			currentStage: '',
		}
	}
}

/**
 * 检查视频是否正在加载
 */
function isVideoLoading(bvid) {
	return videoStates.value[bvid]?.isLoading || false
}

/**
 * 获取当前加载阶段提示
 */
function getCurrentStage(bvid) {
	return videoStates.value[bvid]?.currentStage || ''
}

/**
 * 页面加载
 */
onMounted(async () => {
	await loadSearchHistory()
})

/**
 * 防抖搜索函数（500ms延迟）
 * @param {string} keyword - 搜索关键词
 * @param {boolean} isNewSearch - 是否为新搜索（默认 true），分页操作时传 false
 */
const debouncedSearch = useDebounceFn(async (keyword, isNewSearch = true) => {
	if (!keyword || keyword.trim().length === 0) {
		return
	}

	loading.value = true
	hasSearched.value = true

	// 只在新搜索时重置页码，分页时保留当前页码
	if (isNewSearch) {
		currentPage.value = 1
	}

	try {
		const response = await searchBilibiliVideos({
			keyword,
			page: currentPage.value,
			pageSize: pageSize.value,
		})

		searchResults.value = response.records || []
		total.value = response.total || 0

		// 刷新搜索历史（后端会自动记录）
		await loadSearchHistory()

		if (searchResults.value.length === 0) {
			toast.info('未找到相关结果，换个关键词试试')
		}
	} catch (error) {
		console.error('搜索失败:', error)
		toast.error('搜索失败，请检查网络连接')
		searchResults.value = []
		total.value = 0
	} finally {
		loading.value = false
	}
}, 500)

/**
 * 加载搜索历史
 */
async function loadSearchHistory() {
	try {
		const response = await getSearchHistory({ page: 1, pageSize: 10 })
		searchHistory.value = response.records || []
	} catch (error) {
		console.error('加载搜索历史失败:', error)
	}
}

/**
 * 搜索处理（手动触发，如点击按钮或回车）
 */
async function handleSearch() {
	if (!searchKeyword.value.trim()) {
		toast.warning('请输入搜索关键词')
		return
	}

	// 立即执行搜索（绕过防抖）
	debouncedSearch(searchKeyword.value, true) // 新搜索，重置页码
}

/**
 * 页码变化
 */
async function handlePageChange(page) {
	currentPage.value = page
	debouncedSearch(searchKeyword.value, false) // 分页操作，不重置页码
	window.scrollTo({ top: 0, behavior: 'smooth' })
}

/**
 * 点击历史标签
 */
function handleHistoryClick(keyword) {
	searchKeyword.value = keyword
	handleSearch()
}

/**
 * 清空搜索历史
 */
async function handleClearHistory() {
	try {
		await confirmWarning('确定要清空所有搜索历史吗？', '清空确认')
	} catch {
		// 用户取消操作
		return
	}

	try {
		await clearSearchHistoryAPI()
		searchHistory.value = []
		toast.success('搜索历史已清空')
	} catch (error) {
		console.error('清空历史失败:', error)
		toast.error('清空历史失败，请重试')
	}
}

/**
 * 播放 B 站视频音频
 * @param {Object} video - 视频对象 { bvid, title, url, duration }
 */
async function handlePlayVideo(video) {
	// 验证必要字段
	if (!video.bvid || !video.url) {
		toast.error('视频信息不完整，无法播放')
		return
	}

	// 初始化状态
	initVideoState(video.bvid)
	videoStates.value[video.bvid].isLoading = true

	// 启动阶段提示轮播
	let stageIndex = 0
	videoStates.value[video.bvid].currentStage = loadingStages[0]

	const stageInterval = setInterval(() => {
		stageIndex = (stageIndex + 1) % loadingStages.length
		if (videoStates.value[video.bvid]) {
			videoStates.value[video.bvid].currentStage = loadingStages[stageIndex]
		}
	}, 5000) // 每5秒切换一次提示

	// 显示初始加载提示
	toast.info(loadingStages[0] + ' (预计10-60秒)')

	try {
		const parseResult = await parseVideo({
			videoUrl: video.url,
			platform: 'BILIBILI',
			includeAvailableActions: true,
		})

		const canPrepareAudio = parseResult.audioSupported && parseResult.availableActions?.includes('AUDIO_PREPARE')
		if (!canPrepareAudio) {
			toast.warning(`《${video.title}》当前暂不支持音频播放`)
			return
		}

		videoStates.value[video.bvid].currentStage = loadingStages[1]

		const audioResult = await prepareAudio({
			videoUrl: parseResult.normalizedVideoUrl || video.url,
			platform: parseResult.platform || 'BILIBILI',
			preferredAudioFormat: 'mp3',
		})

		videoStates.value[video.bvid].currentStage = loadingStages[2]

		const track = adaptVideoToTrack(audioResult, {
			title: parseResult.title || video.title,
			duration: parseResult.duration,
			platform: parseResult.platform || 'BILIBILI',
		})

		playerStore.playTrack(track)

		toast.success(`《${video.title}》音频已准备完成，开始播放`, 5000)
	} catch (error) {
		console.error('播放准备失败:', error)
		handleParseError(error, video.title)
	} finally {
		// 清理状态
		clearInterval(stageInterval)
		if (videoStates.value[video.bvid]) {
			videoStates.value[video.bvid].isLoading = false
			videoStates.value[video.bvid].currentStage = ''
		}
	}
}

/**
 * 处理视频解析错误
 * @param {Error} error - 错误对象
 * @param {string} videoTitle - 视频标题
 */
function handleParseError(error, videoTitle) {
	const message = error.message || '解析失败'

	// 根据错误类型显示不同提示
	if (message.includes('文件过大') || message.includes('100MB')) {
		toast.error(`《${videoTitle}》音频文件超过100MB限制，无法解析`)
	} else if (message.includes('网络')) {
		toast.error('网络连接失败，请检查网络后重试')
	} else if (message.includes('超时')) {
		toast.error('解析超时，请稍后重试')
	} else if (message.includes('存储容量') || message.includes('1GB')) {
		toast.error('服务器存储容量不足，请稍后重试')
	} else if (message.includes('BV') || message.includes('无效')) {
		toast.error(`《${videoTitle}》视频链接无效，无法解析`)
	} else {
		toast.error(`解析失败: ${message}`)
	}
}

// 防抖播放函数（防止快速重复点击）
const debouncedPlayVideo = useDebounceFn(handlePlayVideo, 300)

</script>
