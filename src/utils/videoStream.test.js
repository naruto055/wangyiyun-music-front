import { describe, expect, it } from 'vitest'
import {
	buildStreamFallbackReason,
	canUseNativeAudioStream,
	canUseVideoStreamPlayback,
	getPlayableVideoUrl,
	hasRequiredPlaybackHeaders,
	isBilibiliDirectStreamSupported,
	shouldFallbackToPreparedAudio,
} from './videoStream'

describe('videoStream', () => {
	it('仅B站支持新的直连流播放能力', () => {
		expect(isBilibiliDirectStreamSupported('BILIBILI')).toBe(true)
		expect(isBilibiliDirectStreamSupported('DOUYIN')).toBe(false)
		expect(isBilibiliDirectStreamSupported('YOUTUBE')).toBe(false)
	})

	it('当解析结果是B站且声明了 AUDIO_STREAM 时允许走流播放链路', () => {
		expect(
			canUseVideoStreamPlayback({
				platform: 'BILIBILI',
				availableActions: ['AUDIO_STREAM', 'AUDIO_DOWNLOAD'],
			})
		).toBe(true)
	})

	it('当解析结果是B站但后端未声明 AUDIO_STREAM 时仍保守允许尝试流播放', () => {
		expect(
			canUseVideoStreamPlayback({
				platform: 'BILIBILI',
				availableActions: ['AUDIO_PREPARE'],
			})
		).toBe(true)
	})

	it('非B站解析结果不走流播放链路', () => {
		expect(
			canUseVideoStreamPlayback({
				platform: 'DOUYIN',
				availableActions: ['AUDIO_STREAM'],
			})
		).toBe(false)
	})

	it('当返回自定义请求头时仍先尝试直接播放', () => {
		const streamResult = {
			streamUrl: 'https://example.com/audio.m4a',
			sourceType: 'DIRECT_API',
			headers: {
				Referer: 'https://www.bilibili.com/',
				'User-Agent': 'Mozilla/5.0',
			},
		}

		expect(hasRequiredPlaybackHeaders(streamResult)).toBe(true)
		expect(canUseNativeAudioStream(streamResult)).toBe(true)
		expect(shouldFallbackToPreparedAudio(streamResult)).toBe(false)
		expect(buildStreamFallbackReason(streamResult)).toBe('当前直连音频流播放失败，已切换为临时音频资源播放')
	})

	it('当直连流不需要额外请求头时可直接交给原生播放器', () => {
		const streamResult = {
			streamUrl: 'https://example.com/audio.m4a',
			sourceType: 'DIRECT_API',
			headers: {},
		}

		expect(hasRequiredPlaybackHeaders(streamResult)).toBe(false)
		expect(canUseNativeAudioStream(streamResult)).toBe(true)
		expect(shouldFallbackToPreparedAudio(streamResult)).toBe(false)
		expect(getPlayableVideoUrl(streamResult)).toBe('https://example.com/audio.m4a')
	})

	it('当后端已经回退到本地临时音频时允许直接播放', () => {
		const streamResult = {
			streamUrl: 'http://localhost:8910/temp-audio/demo.mp3',
			sourceType: 'YTDLP_FALLBACK',
			fallbackUsed: true,
			headers: {
				Referer: 'https://www.bilibili.com/',
			},
		}

		expect(canUseNativeAudioStream(streamResult)).toBe(true)
		expect(shouldFallbackToPreparedAudio(streamResult)).toBe(false)
		expect(buildStreamFallbackReason(streamResult)).toBe('平台直连失败，已自动切换为临时音频资源播放')
	})
})
