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
