/**
 * 音频格式处理工具
 * 用于检测浏览器支持的音频格式并选择最佳音频源
 */

/**
 * 获取音频格式对应的 MIME 类型
 * @param {string} format - 音频格式（如 'mp3', 'ogg', 'wav' 等）
 * @returns {string} MIME 类型
 */
export function getFormatMimeType(format) {
	const mimeTypes = {
		mp3: 'audio/mpeg',
		ogg: 'audio/ogg',
		wav: 'audio/wav',
		flac: 'audio/flac',
		m4a: 'audio/mp4',
		aac: 'audio/aac',
		webm: 'audio/webm',
	}
	return mimeTypes[format.toLowerCase()] || ''
}

/**
 * 检测浏览器是否支持指定音频格式
 * @param {string} format - 音频格式（如 'mp3', 'ogg' 等）
 * @returns {boolean} 是否支持
 */
export function canPlayFormat(format) {
	const audio = document.createElement('audio')
	const mimeType = getFormatMimeType(format)

	if (!mimeType) return false

	// canPlayType 返回值：'probably', 'maybe', '' (不支持)
	const canPlay = audio.canPlayType(mimeType)
	return canPlay === 'probably' || canPlay === 'maybe'
}

/**
 * 音质优先级映射
 */
const QUALITY_PRIORITY = {
	high: 3,
	medium: 2,
	standard: 2, // 'standard' 等同于 'medium'
	low: 1,
}

/**
 * 从多个音频源中选择最佳音频源
 * 优先级：浏览器支持 > 音质高低
 *
 * @param {Array} sources - 音频源数组
 * @param {string} sources[].format - 音频格式
 * @param {string} sources[].quality - 音质等级（high/medium/low）
 * @param {string} sources[].url - 音频 URL
 * @returns {Object|null} 最佳音频源对象，如果没有可用源则返回 null
 *
 * @example
 * selectBestAudioSource([
 *   { format: 'mp3', quality: 'high', url: 'http://...' },
 *   { format: 'ogg', quality: 'low', url: 'http://...' }
 * ])
 * // => { format: 'mp3', quality: 'high', url: 'http://...' }
 */
export function selectBestAudioSource(sources) {
	if (!sources || sources.length === 0) {
		return null
	}

	// 1. 过滤出浏览器支持的音频源
	const supportedSources = sources.filter((source) => {
		if (!source.format || !source.url) return false
		return canPlayFormat(source.format)
	})

	// 2. 如果没有浏览器支持的格式，返回第一个源作为降级方案
	if (supportedSources.length === 0) {
		console.warn('没有浏览器支持的音频格式，使用降级方案')
		return sources[0]
	}

	// 3. 按音质排序，选择最高音质的音频源
	const sortedSources = supportedSources.sort((a, b) => {
		const priorityA = QUALITY_PRIORITY[a.quality?.toLowerCase()] || 0
		const priorityB = QUALITY_PRIORITY[b.quality?.toLowerCase()] || 0
		return priorityB - priorityA // 降序排列，高音质在前
	})

	return sortedSources[0]
}

/**
 * 格式化时长（秒 → mm:ss）
 * @param {number} seconds - 秒数
 * @returns {string} 格式化后的时长
 */
export function formatDuration(seconds) {
	if (!seconds || isNaN(seconds)) return '0:00'
	const minutes = Math.floor(seconds / 60)
	const secs = Math.floor(seconds % 60)
	return `${minutes}:${secs.toString().padStart(2, '0')}`
}

/**
 * 格式化播放量（万为单位）
 * @param {number} count - 播放量
 * @returns {string} 格式化后的播放量
 */
export function formatPlayCount(count) {
	if (!count) return '0'
	if (count >= 10000) {
		return (count / 10000).toFixed(1) + '万'
	}
	return count.toString()
}
