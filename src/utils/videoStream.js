/**
 * 视频音频流播放能力判定工具
 * 仅封装前端当前播放器可以安全处理的逻辑，不承担网络请求职责。
 */

const SUPPORTED_DIRECT_STREAM_PLATFORM = 'BILIBILI'

/**
 * 是否属于当前前端允许启用快速播放链路的平台
 * @param {string} platform
 * @returns {boolean}
 */
export function isBilibiliDirectStreamSupported(platform) {
	return platform === SUPPORTED_DIRECT_STREAM_PLATFORM
}

/**
 * 当前解析结果是否允许尝试新的流播放链路
 * 若已拿到 parse 结果，则以后端返回的 AUDIO_STREAM 为准；
 * 未经过 parse 的 B 站专用入口保留兼容逻辑。
 * @param {Object} parsedData
 * @returns {boolean}
 */
export function canUseVideoStreamPlayback(parsedData) {
	if (!isBilibiliDirectStreamSupported(parsedData?.platform)) {
		return false
	}

	if (!Array.isArray(parsedData?.availableActions)) {
		return true
	}

	return parsedData.availableActions.includes('AUDIO_STREAM')
}

/**
 * 判断流播放结果是否声明了必须携带的请求头
 * @param {Object} streamResult
 * @returns {boolean}
 */
export function hasRequiredPlaybackHeaders(streamResult) {
	const headers = streamResult?.headers
	return Boolean(headers && Object.keys(headers).length > 0)
}

/**
 * 当前原生 audio 是否可以直接消费该流地址
 * @param {Object} streamResult
 * @returns {boolean}
 */
export function canUseNativeAudioStream(streamResult) {
	if (!streamResult?.streamUrl) {
		return false
	}

	if (streamResult.sourceType === 'YTDLP_FALLBACK') {
		return true
	}

	if (streamResult.sourceType === 'DIRECT_API') {
		return true
	}

	return false
}

/**
 * 是否需要降级为 prepareAudio 临时音频链路
 * @param {Object} streamResult
 * @returns {boolean}
 */
export function shouldFallbackToPreparedAudio(streamResult) {
	if (!streamResult?.streamUrl) {
		return true
	}

	return false
}

/**
 * 获取原生播放器可直接使用的音频 URL
 * @param {Object} streamResult
 * @returns {string}
 */
export function getPlayableVideoUrl(streamResult) {
	return streamResult?.streamUrl || ''
}

/**
 * 构建流播放降级提示文案
 * @param {Object} streamResult
 * @returns {string}
 */
export function buildStreamFallbackReason(streamResult) {
	if (streamResult?.sourceType === 'YTDLP_FALLBACK' || streamResult?.fallbackUsed) {
		return '平台直连失败，已自动切换为临时音频资源播放'
	}

	if (streamResult?.sourceType === 'DIRECT_API' && hasRequiredPlaybackHeaders(streamResult)) {
		return '当前直连音频流播放失败，已切换为临时音频资源播放'
	}

	return '已切换为临时音频资源播放'
}
