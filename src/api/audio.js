import request from '@/utils/request'

/**
 * 音频管理相关接口
 */

/**
 * 获取音频访问URL
 * @param {number} musicId - 音乐ID
 * @returns {Promise} 返回音频URL信息 { audioUrl, musicId, title, fileName, duration }
 */
export function getAudioUrl(musicId) {
	return request({
		url: `/audio/${musicId}`,
		method: 'get',
	})
}
