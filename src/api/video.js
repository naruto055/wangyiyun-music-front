import request from '@/utils/request'

/**
 * 解析视频元数据
 * @param {Object} data - 请求参数
 * @param {string} data.videoUrl - 视频链接或分享文本（支持B站原始分享链接）
 * @param {string} data.platform - 平台类型（BILIBILI/YOUTUBE/DOUYIN）
 * @param {boolean} [data.includeAvailableActions=true] - 是否返回可用动作列表
 * @returns {Promise<Object>} 元数据解析结果
 * @example
 * parseVideo({
 *   videoUrl: 'https://www.bilibili.com/video/BV1xxx',
 *   platform: 'BILIBILI',
 *   includeAvailableActions: true
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
 * 按需准备音频资源
 * @param {Object} data - 请求参数
 * @param {string} data.videoUrl - 建议使用 parse 接口返回的 normalizedVideoUrl
 * @param {string} data.platform - 平台类型（BILIBILI/YOUTUBE/DOUYIN）
 * @param {string} [data.preferredAudioFormat] - 期望音频格式
 * @returns {Promise<Object>} 音频资源结果
 */
export function prepareAudio(data) {
	return request({
		url: '/video/audio/prepare',
		method: 'post',
		data,
	})
}

/**
 * 按需下载视频资源
 * @param {Object} data - 请求参数
 * @param {string} data.videoUrl - 建议使用 parse 接口返回的 normalizedVideoUrl
 * @param {string} data.platform - 平台类型（BILIBILI/YOUTUBE/DOUYIN）
 * @param {string} [data.preferredVideoFormat] - 期望视频格式
 * @returns {Promise<Object>} 视频资源结果
 */
export function downloadVideo(data) {
	return request({
		url: '/video/video/download',
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
