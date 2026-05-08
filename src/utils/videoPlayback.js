import { streamAudio, prepareAudio } from '@/api/video'
import { adaptStreamToTrack, adaptVideoToTrack } from '@/utils/trackAdapter'
import { canUseNativeAudioStream, canUseVideoStreamPlayback, shouldFallbackToPreparedAudio } from '@/utils/videoStream'

function buildPreparedAudioPayload(payload) {
	return {
		videoUrl: payload.videoUrl,
		platform: payload.platform,
		preferredAudioFormat: payload.preferredAudioFormat || 'mp3',
	}
}

/**
 * 统一处理视频“立即播放”链路：
 * 1. 仅 B 站尝试 /audio/stream
 * 2. 只有 stream 本身不可用时，才在请求阶段直接回退到 prepareAudio
 * @param {Object} options
 * @param {Object} options.payload - 请求参数
 * @param {Object} options.metadata - 音轨元数据
 * @param {Function} [options.onStreamResponse] - 收到 stream 响应时回调
 * @returns {Promise<{ track: Object, mode: string, streamResult?: Object, audioResult?: Object }>}
 */
export async function resolveVideoPlaybackTrack({ payload, metadata, onStreamResponse } = {}) {
	if (!payload?.videoUrl || !payload?.platform) {
		throw new Error('缺少视频链接或平台信息')
	}

	if (!canUseVideoStreamPlayback({ platform: payload.platform })) {
		const audioResult = await prepareAudio(buildPreparedAudioPayload(payload))
		return {
			track: adaptVideoToTrack(audioResult, metadata),
			mode: 'prepare',
			audioResult,
		}
	}

	const streamResult = await streamAudio({
		...payload,
		preferredAudioFormat: payload.preferredAudioFormat || 'mp3',
		allowFallback: payload.allowFallback ?? true,
	})

	onStreamResponse?.(streamResult)

	if (canUseNativeAudioStream(streamResult) && !shouldFallbackToPreparedAudio(streamResult)) {
		return {
			track: adaptStreamToTrack(streamResult, metadata),
			mode: 'stream',
			streamResult,
		}
	}

	const audioResult = await prepareAudio(buildPreparedAudioPayload(payload))
	return {
		track: adaptVideoToTrack(audioResult, metadata),
		mode: 'prepare',
		streamResult,
		audioResult,
	}
}
