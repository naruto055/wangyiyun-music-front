import { prepareAudio } from '@/api/video'
import { adaptVideoToTrack } from '@/utils/trackAdapter'

/**
 * 创建流播放失败后的统一回退处理器
 * @param {Object} options
 * @param {Function} options.getPayload - 返回 prepareAudio 所需请求参数
 * @param {Function} options.getMetadata - 返回音轨元数据
 * @param {Object} options.playerStore - 播放器 store
 * @param {Object} options.toast - toast 实例
 * @param {Function} [options.onBeforePrepare] - 回退前的状态同步回调
 * @returns {Function}
 */
export function createStreamFallbackResolver({ getPayload, getMetadata, playerStore, toast, onBeforePrepare }) {
	return async () => {
		try {
			onBeforePrepare?.()
			toast.info('直连音频流播放失败，正在切换为临时音频资源...')
			const audioResult = await prepareAudio({
				...getPayload(),
				preferredAudioFormat: 'mp3',
			})
			const fallbackTrack = adaptVideoToTrack(audioResult, getMetadata())
			playerStore.playTrack(fallbackTrack)
			playerStore.setPlaybackFallbackResolver(null)
			toast.success('已切换为临时音频资源并重新开始播放')
		} catch (fallbackError) {
			console.error('音频流回退失败:', fallbackError)
			toast.error(fallbackError.message || '临时音频回退失败')
		}
	}
}
