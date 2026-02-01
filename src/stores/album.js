import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getAlbumList, getAlbumDetail, createAlbum, updateAlbum, deleteAlbum } from '@/api/album'

/**
 * 专辑状态管理 Store
 */
export const useAlbumStore = defineStore('album', () => {
	// ========== 状态 ==========
	const albumList = ref([]) // 专辑列表
	const total = ref(0) // 总记录数
	const loading = ref(false) // 加载状态

	// 搜索参数
	const searchParams = ref({
		pageNum: 1,
		pageSize: 12,
		sortField: 'release_date',
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
	 * 获取专辑列表
	 */
	async function fetchAlbumList() {
		loading.value = true
		try {
			const response = await getAlbumList(searchParams.value)
			albumList.value = response.records || []
			total.value = response.total || 0
		} catch (error) {
			console.error('获取专辑列表失败:', error)
			albumList.value = []
			total.value = 0
		} finally {
			loading.value = false
		}
	}

	/**
	 * 获取专辑详情
	 * @param {number} id - 专辑ID
	 */
	async function fetchAlbumDetail(id) {
		try {
			const detail = await getAlbumDetail(id)
			return detail
		} catch (error) {
			console.error('获取专辑详情失败:', error)
			return null
		}
	}

	/**
	 * 创建专辑
	 * @param {Object} data - 专辑数据
	 */
	async function createAlbumAction(data) {
		try {
			const result = await createAlbum(data)
			return result
		} catch (error) {
			console.error('创建专辑失败:', error)
			throw error
		}
	}

	/**
	 * 更新专辑
	 * @param {number} id - 专辑ID
	 * @param {Object} data - 专辑数据
	 */
	async function updateAlbumAction(id, data) {
		try {
			const result = await updateAlbum(id, data)
			return result
		} catch (error) {
			console.error('更新专辑失败:', error)
			throw error
		}
	}

	/**
	 * 删除专辑
	 * @param {number} id - 专辑ID
	 */
	async function deleteAlbumAction(id) {
		try {
			await deleteAlbum(id)
		} catch (error) {
			console.error('删除专辑失败:', error)
			throw error
		}
	}

	/**
	 * 设置排序字段
	 * @param {string} field - 排序字段
	 * @param {string} order - 排序方式 (asc/desc)
	 */
	function setSortField(field, order) {
		searchParams.value.sortField = field
		searchParams.value.sortOrder = order
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
			sortField: 'release_date',
			sortOrder: 'desc',
		}
	}

	return {
		// 状态
		albumList,
		total,
		loading,
		searchParams,
		// 计算属性
		totalPages,
		currentPage,
		pageSize,
		// 方法
		fetchAlbumList,
		fetchAlbumDetail,
		createAlbum: createAlbumAction,
		updateAlbum: updateAlbumAction,
		deleteAlbum: deleteAlbumAction,
		setSortField,
		setPagination,
		resetSearch,
	}
})
