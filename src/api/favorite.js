import request from '@/utils/request'

/**
 * 收藏管理相关接口
 */

/**
 * 收藏音乐
 * @param {number} musicId - 音乐ID
 * @returns {Promise} 返回操作结果
 */
export function addFavorite(musicId) {
	return request({
		url: `/favorite/${musicId}`,
		method: 'post',
	})
}

/**
 * 取消收藏
 * @param {number} musicId - 音乐ID
 * @returns {Promise} 返回操作结果
 */
export function removeFavorite(musicId) {
	return request({
		url: `/favorite/${musicId}`,
		method: 'delete',
	})
}

/**
 * 查询收藏列表
 * @param {Object} params - 查询参数
 * @param {number} params.pageNum - 页码，默认 1
 * @param {number} params.pageSize - 每页大小，默认 10
 * @returns {Promise} 返回分页数据 { records, total, pages, current, size }
 */
export function getFavoriteList(params) {
	return request({
		url: '/favorite/list',
		method: 'get',
		params,
	})
}
