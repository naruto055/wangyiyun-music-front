/**
 * B站相关接口
 */
import request from '@/utils/request'

/**
 * 搜索B站视频
 * @param {Object} params - 搜索参数
 * @param {string} params.keyword - 搜索关键词
 * @param {number} [params.page=1] - 页码
 * @param {number} [params.pageSize=10] - 每页大小
 * @returns {Promise<{records: Array, total: number, pages: number, current: number, size: number}>} 返回分页数据
 */
export function searchBilibiliVideos(params) {
	return request({
		url: '/bilibili/search',
		method: 'post',
		data: params,
	})
}

/**
 * 从B站保存音乐
 * @param {Object} data - 保存参数
 * @param {string} data.bvid - B站视频BV号
 * @param {string} data.title - 标题
 * @param {number} [data.categoryId] - 分类ID
 * @returns {Promise<{musicId: number, audioUrl: string}>} 返回音乐ID和音频URL
 */
export function saveFromBilibili(data) {
	return request({
		url: '/music/from-bilibili',
		method: 'post',
		data,
	})
}

/**
 * 查询搜索历史
 * @param {Object} params - 查询参数
 * @param {number} [params.page=1] - 页码
 * @param {number} [params.pageSize=10] - 每页大小
 * @returns {Promise<{records: Array, total: number, pages: number, current: number, size: number}>} 返回分页数据
 */
export function getSearchHistory(params) {
	return request({
		url: '/bilibili/search/history',
		method: 'get',
		params,
	})
}

/**
 * 清空搜索历史
 * @returns {Promise<void>}
 */
export function clearSearchHistory() {
	return request({
		url: '/bilibili/search/history',
		method: 'delete',
	})
}

/**
 * 获取音乐分类列表
 * @returns {Promise<Array<{id: number, name: string}>>} 返回分类数组
 */
export function getMusicCategories() {
	return request({
		url: '/category/list',
		method: 'get',
	})
}
