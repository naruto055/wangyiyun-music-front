import { describe, expect, it } from 'vitest'
import { adaptStreamToTrack, adaptVideoToTrack } from './trackAdapter'

describe('trackAdapter', () => {
	it('能把音频流结果适配为播放器音轨', () => {
		const track = adaptStreamToTrack(
			{
				sourceVideoId: 'BV1demo',
				title: '测试流播放',
				streamUrl: 'https://example.com/audio.m4a',
				mimeType: 'audio/mp4',
				sourceType: 'DIRECT_API',
				fallbackUsed: false,
				headers: {
					Referer: 'https://www.bilibili.com/',
				},
				expireAt: null,
			},
			{
				coverUrl: 'https://example.com/cover.jpg',
				duration: 123,
				platform: 'BILIBILI',
			}
		)

		expect(track.audioSources).toEqual([
			{
				url: 'https://example.com/audio.m4a',
				format: 'm4a',
				quality: 'high',
				headers: {
					Referer: 'https://www.bilibili.com/',
				},
				mimeType: 'audio/mp4',
				sourceType: 'DIRECT_API',
				fallbackUsed: false,
			},
		])
		expect(track._source).toBe('video_stream')
		expect(track._expiresAt).toBe(null)
	})

	it('保留 prepareAudio 音轨适配结果兼容旧播放链路', () => {
		const track = adaptVideoToTrack(
			{
				sourceVideoId: 'BV1legacy',
				title: '临时音频',
				audioUrl: 'http://localhost:8910/temp-audio/demo.mp3',
				audioFormat: 'mp3',
				expiresAt: '2026-05-08T01:00:00',
			},
			{
				platform: 'BILIBILI',
				duration: 180,
			}
		)

		expect(track.audioSources).toEqual([
			{
				url: 'http://localhost:8910/temp-audio/demo.mp3',
				format: 'mp3',
				quality: 'high',
			},
		])
		expect(track._source).toBe('video_parse')
		expect(track._expiresAt).toBe('2026-05-08T01:00:00')
	})
})
