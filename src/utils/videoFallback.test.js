import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/api/video', () => ({
	prepareAudio: vi.fn(),
}))

const adaptVideoToTrackMock = vi.fn()
vi.mock('@/utils/trackAdapter', () => ({
	adaptVideoToTrack: (...args) => adaptVideoToTrackMock(...args),
}))

import { prepareAudio } from '@/api/video'
import { createStreamFallbackResolver } from './videoFallback'

const prepareAudioMock = vi.mocked(prepareAudio)

describe('videoFallback', () => {
	beforeEach(() => {
		prepareAudioMock.mockReset()
		adaptVideoToTrackMock.mockReset()
	})

	it('回退时先提示，再准备临时音频并重新播放', async () => {
		const toast = {
			info: vi.fn(),
			success: vi.fn(),
			error: vi.fn(),
		}
		const playerStore = {
			playTrack: vi.fn(),
			setPlaybackFallbackResolver: vi.fn(),
		}

		prepareAudioMock.mockResolvedValue({
			sourceVideoId: 'BV1fallback',
			title: '回退测试',
			audioUrl: 'http://localhost:8910/temp-audio/BV1fallback.mp3',
			audioFormat: 'mp3',
		})
		adaptVideoToTrackMock.mockReturnValue({ id: 'fallback-track' })

		const resolver = createStreamFallbackResolver({
			getPayload: () => ({
				videoUrl: 'https://www.bilibili.com/video/BV1fallback',
				platform: 'BILIBILI',
			}),
			getMetadata: () => ({
				title: '回退测试',
				platform: 'BILIBILI',
			}),
			playerStore,
			toast,
		})

		await resolver()

		expect(toast.info).toHaveBeenCalledWith('直连音频流播放失败，正在切换为临时音频资源...')
		expect(prepareAudioMock).toHaveBeenCalledTimes(1)
		expect(playerStore.playTrack).toHaveBeenCalledWith({ id: 'fallback-track' })
		expect(toast.success).toHaveBeenCalledWith('已切换为临时音频资源并重新开始播放')
	})
})
