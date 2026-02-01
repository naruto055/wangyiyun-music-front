import request from '@/utils/request'

/**
 * 解析视频并提取音频
 * @param {Object} data - 请求参数
 * @param {string} data.videoUrl - 视频链接或分享文本（支持B站原始分享链接）
 * @param {string} data.platform - 平台类型（BILIBILI/YOUTUBE/DOUYIN）
 * @returns {Promise<Object>} 解析结果
 * @example
 * parseVideo({
 *   videoUrl: 'https://www.bilibili.com/video/BV1xxx',
 *   platform: 'BILIBILI'
 * })
 */
export function parseVideo(data) {
	return request({
		url: '/video/parse',
		method: 'post',
		data,
	})
}

/**
 * 获取支持的平台列表
 * @returns {Promise<Array>} 平台列表
 */
export function getSupportedPlatforms() {
	return request({
		url: '/video/platforms',
		method: 'get',
	})
}
