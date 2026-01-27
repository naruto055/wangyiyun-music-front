import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getFavoriteList, addFavorite, removeFavorite } from '@/api/favorite'

/**
 * 收藏状态管理 Store
 */
export const useFavoriteStore = defineStore('favorite', () => {
	// ========== 状态 ==========
	const favoriteList = ref([]) // 收藏列表
	const favoriteIds = ref(new Set()) // 收藏ID集合（用于快速查找）
	const total = ref(0) // 总收藏数
	const loading = ref(false) // 加载状态

	// 固定用户ID
	const USER_ID = 0

	// 搜索参数
	const searchParams = ref({
		pageNum: 1,
		pageSize: 12,
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
	 * 获取收藏列表
	 */
	async function fetchFavoriteList() {
		loading.value = true
		try {
			const response = await getFavoriteList(searchParams.value)
			favoriteList.value = response.records || []
			total.value = response.total || 0

			// 更新收藏ID集合（使用 musicId 字段作为音乐ID）
			favoriteIds.value = new Set(response.records.map((item) => item.musicId))
		} catch (error) {
			console.error('获取收藏列表失败:', error)
			favoriteList.value = []
			total.value = 0
			favoriteIds.value = new Set()
		} finally {
			loading.value = false
		}
	}

	/**
	 * 切换收藏状态
	 * @param {number} musicId - 音乐ID
	 * @returns {Promise<boolean>} 返回操作后的收藏状态
	 */
	async function toggleFavorite(musicId) {
		const isFav = favoriteIds.value.has(musicId)

		try {
			if (isFav) {
				// 取消收藏
				await removeFavorite(musicId)
				favoriteIds.value.delete(musicId)
				// 从列表中移除（使用 musicId 字段）
				favoriteList.value = favoriteList.value.filter((item) => item.musicId !== musicId)
				total.value = Math.max(0, total.value - 1)
				return false
			} else {
				// 添加收藏
				await addFavorite(musicId)
				favoriteIds.value.add(musicId)
				total.value += 1
				return true
			}
		} catch (error) {
			console.error('切换收藏状态失败:', error)
			throw error
		}
	}

	/**
	 * 检查音乐是否已收藏
	 * @param {number} musicId - 音乐ID
	 * @returns {boolean} 是否已收藏
	 */
	function isFavorited(musicId) {
		return favoriteIds.value.has(musicId)
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
	 * 重置状态
	 */
	function resetState() {
		favoriteList.value = []
		favoriteIds.value = new Set()
		total.value = 0
		searchParams.value = {
			pageNum: 1,
			pageSize: 12,
		}
	}

	return {
		// 状态
		favoriteList,
		favoriteIds,
		total,
		loading,
		searchParams,
		// 计算属性
		totalPages,
		currentPage,
		pageSize,
		// 方法
		fetchFavoriteList,
		toggleFavorite,
		isFavorited,
		setPagination,
		resetState,
	}
})
