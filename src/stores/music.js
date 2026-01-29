import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getMusicList, getMusicDetail } from '@/api/music'
import { getAudioUrl } from '@/api/audio'

/**
 * 音乐状态管理 Store
 */
export const useMusicStore = defineStore('music', () => {
	// ========== 状态 ==========
	const musicList = ref([]) // 音乐列表
	const total = ref(0) // 总记录数
	const loading = ref(false) // 加载状态

	// 搜索参数
	const searchParams = ref({
		pageNum: 1,
		pageSize: 12,
		categoryId: null,
		keyword: '',
		sortField: 'create_time',
		sortOrder: 'desc',
	})

	// ========== 计算属性 ==========
	const totalPages = computed(() => {
		return Math.ceil(total.value / searchParams.value.pageSize) || 1
	})

	const currentPage = computed(() => {
		return searchParams.value.pageNum
	})

	const pageSize = computed(() => {
		return searchParams.value.pageSize
	})

	// ========== 操作方法 ==========

	/**
	 * 获取音乐列表
	 */
	async function fetchMusicList() {
		loading.value = true
		try {
			const response = await getMusicList(searchParams.value)
			musicList.value = response.records || []
			total.value = response.total || 0
		} catch (error) {
			console.error('获取音乐列表失败:', error)
			musicList.value = []
			total.value = 0
		} finally {
			loading.value = false
		}
	}

	/**
	 * 设置搜索关键词
	 * @param {string} keyword - 搜索关键词
	 */
	function setSearchKeyword(keyword) {
		searchParams.value.keyword = keyword
		searchParams.value.pageNum = 1 // 重置到第一页
	}

	/**
	 * 设置分页
	 * @param {number} pageNum - 页码
	 * @param {number} pageSize - 每页大小
	 */
	function setPagination(pageNum, pageSize) {
		if (pageNum !== undefined) {
			searchParams.value.pageNum = pageNum
		}
		if (pageSize !== undefined) {
			searchParams.value.pageSize = pageSize
		}
	}

	/**
	 * 重置搜索条件
	 */
	function resetSearch() {
		searchParams.value = {
			pageNum: 1,
			pageSize: 12,
			categoryId: null,
			keyword: '',
			sortField: 'create_time',
			sortOrder: 'desc',
		}
	}

	/**
	 * 从文件 URL 提取音频格式
	 * @param {string} url - 文件 URL
	 * @returns {string} 音频格式（如 'mp3', 'flac' 等）
	 */
	function extractAudioFormat(url) {
		if (!url) return 'mp3' // 默认 mp3
		const match = url.match(/\.([a-z0-9]+)(\?|$)/i)
		return match ? match[1].toLowerCase() : 'mp3'
	}

	/**
	 * 将后台音乐详情转换为播放器需要的格式
	 * @param {Object} detail - 后台返回的音乐详情
	 * @param {string} audioUrl - 从音频接口获取的实际播放URL
	 * @returns {Object} 转换后的音乐对象
	 */
	function transformMusicDetail(detail, audioUrl) {
		if (!detail) return null

		// 字段名映射：后台使用 title，前端使用 name
		if (detail.title && !detail.name) {
			detail.name = detail.title
		}

		// 如果后台返回的数据已经有 audioSources，直接返回
		if (detail.audioSources && detail.audioSources.length > 0) {
			return detail
		}

		// 使用从音频接口获取的URL，转换为 audioSources 格式
		if (audioUrl) {
			const format = extractAudioFormat(audioUrl)
			detail.audioSources = [
				{
					format: format,
					quality: 'standard', // 默认标准音质
					url: audioUrl, // 使用实际的音频URL
				},
			]
		}

		return detail
	}

	/**
	 * 获取音乐详情（包含可播放的音频URL）
	 * @param {number} id - 音乐ID
	 */
	async function fetchMusicDetail(id) {
		try {
			// 1. 获取音乐详情
			const detail = await getMusicDetail(id)
			if (!detail) {
				console.error('音乐详情为空')
				return null
			}

			// 2. 获取音频访问URL
			let audioUrl = null
			try {
				const audioData = await getAudioUrl(id)
				audioUrl = audioData?.audioUrl
				console.log('获取到音频URL:', audioUrl)
			} catch (error) {
				console.error('获取音频URL失败:', error)
				// 继续执行，使用 fileUrl 作为降级方案
			}

			// 3. 转换数据格式以适配播放器
			return transformMusicDetail(detail, audioUrl)
		} catch (error) {
			console.error('获取音乐详情失败:', error)
			return null
		}
	}

	return {
		// 状态
		musicList,
		total,
		loading,
		searchParams,
		// 计算属性
		totalPages,
		currentPage,
		pageSize,
		// 方法
		fetchMusicList,
		setSearchKeyword,
		setPagination,
		resetSearch,
		fetchMusicDetail,
	}
})
