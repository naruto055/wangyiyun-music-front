import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/api/video', () => ({
	streamAudio: vi.fn(),
	prepareAudio: vi.fn(),
}))

import { resolveVideoPlaybackTrack } from './videoPlayback'
import { prepareAudio, streamAudio } from '@/api/video'

const streamAudioMock = vi.mocked(streamAudio)
const prepareAudioMock = vi.mocked(prepareAudio)

describe('videoPlayback', () => {
	beforeEach(() => {
		streamAudioMock.mockReset()
		prepareAudioMock.mockReset()
	})

	it('DIRECT_API 即使带请求头，也先直接返回流播放音轨，不应立刻调用 prepareAudio', async () => {
		streamAudioMock.mockResolvedValue({
			title: '测试视频',
			sourceVideoId: 'BV1stream',
			streamUrl: 'https://example.com/audio.m4s',
			headers: {
				Referer: 'https://www.bilibili.com/',
				'User-Agent': 'Mozilla/5.0',
			},
			mimeType: 'audio/mp4',
			sourceType: 'DIRECT_API',
			fallbackUsed: false,
		})

		const result = await resolveVideoPlaybackTrack({
			payload: {
				videoUrl: 'https://www.bilibili.com/video/BV1stream',
				platform: 'BILIBILI',
				preferredAudioFormat: 'mp3',
				allowFallback: true,
			},
			metadata: {
				title: '测试视频',
				platform: 'BILIBILI',
			},
		})

		expect(streamAudioMock).toHaveBeenCalledTimes(1)
		expect(prepareAudioMock).not.toHaveBeenCalled()
		expect(result.mode).toBe('stream')
		expect(result.track.audioSources[0].url).toBe('https://example.com/audio.m4s')
		expect(result.track.audioSources[0].headers).toEqual({
			Referer: 'https://www.bilibili.com/',
			'User-Agent': 'Mozilla/5.0',
		})
	})

	it('非B站平台继续直接走 prepareAudio', async () => {
		prepareAudioMock.mockResolvedValue({
			sourceVideoId: 'dy001',
			title: '抖音测试',
			audioUrl: 'http://localhost:8910/temp-audio/dy001.mp3',
			audioFormat: 'mp3',
		})

		const result = await resolveVideoPlaybackTrack({
			payload: {
				videoUrl: 'https://www.douyin.com/video/1',
				platform: 'DOUYIN',
			},
			metadata: {
				title: '抖音测试',
				platform: 'DOUYIN',
			},
		})

		expect(streamAudioMock).not.toHaveBeenCalled()
		expect(prepareAudioMock).toHaveBeenCalledTimes(1)
		expect(result.mode).toBe('prepare')
	})
})
