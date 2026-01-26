import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getMusicList, getMusicDetail } from '@/api/music'

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
	 * 获取音乐详情
	 * @param {number} id - 音乐ID
	 */
	async function fetchMusicDetail(id) {
		try {
			const detail = await getMusicDetail(id)
			return detail
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
