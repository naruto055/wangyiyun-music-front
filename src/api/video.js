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
 * 快速获取可播放音频流
 * @param {Object} data - 请求参数
 * @param {string} data.videoUrl - 视频链接，建议优先传规范化后的页面链接
 * @param {string} data.platform - 平台类型（当前前端仅对 BILIBILI 启用）
 * @param {string} [data.preferredQuality] - 期望音质
 * @param {string} [data.preferredAudioFormat] - 期望音频格式
 * @param {boolean} [data.allowFallback=true] - 是否允许回退到临时音频资源
 * @returns {Promise<Object>} 音频流结果
 */
export function streamAudio(data) {
	return request({
		url: '/video/audio/stream',
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
