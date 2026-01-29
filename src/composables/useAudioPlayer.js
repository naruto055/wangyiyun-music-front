import { ref, watch, onUnmounted } from 'vue'
import { usePlayerStore } from '@/stores/player'

/**
 * 全局单例 Audio 实例
 */
let audioInstance = null

/**
 * 音频播放器 Composable
 * 封装 HTMLAudioElement 的底层操作
 */
export function useAudioPlayer() {
	const playerStore = usePlayerStore()
	const audioElement = ref(null)
	const retryCount = ref(0)
	const MAX_RETRIES = 3

	/**
	 * 初始化或获取 Audio 实例（单例模式）
	 */
	function getAudioInstance() {
		if (!audioInstance) {
			audioInstance = new Audio()
			audioInstance.preload = 'auto'
			setupAudioListeners()
		}
		return audioInstance
	}

	/**
	 * 设置音频事件监听器
	 */
	function setupAudioListeners() {
		const audio = audioInstance

		// 时间更新事件
		audio.addEventListener('timeupdate', () => {
			playerStore.updateTime(audio.currentTime)
		})

		// 音频结束事件
		audio.addEventListener('ended', () => {
			handleAudioEnded()
		})

		// 音频元数据加载完成
		audio.addEventListener('loadedmetadata', () => {
			playerStore.updateDuration(audio.duration)
			playerStore.setLoading(false)
		})

		// 音频可以播放时
		audio.addEventListener('canplay', () => {
			playerStore.setLoading(false)
		})

		// 音频加载开始
		audio.addEventListener('loadstart', () => {
			playerStore.setLoading(true)
		})

		// 音频错误处理
		audio.addEventListener('error', (e) => {
			handleAudioError(e)
		})

		// 音频暂停事件
		audio.addEventListener('pause', () => {
			// 同步播放状态（处理浏览器自动暂停等情况）
			if (playerStore.isPlaying) {
				playerStore.pause()
			}
		})

		// 音频播放事件
		audio.addEventListener('play', () => {
			// 同步播放状态
			if (!playerStore.isPlaying) {
				playerStore.resume()
			}
		})
	}

	/**
	 * 处理音频播放结束
	 */
	function handleAudioEnded() {
		// 自动播放下一曲
		playerStore.playNext()
	}

	/**
	 * 处理音频错误
	 * @param {Event} event - 错误事件
	 */
	function handleAudioError(event) {
		console.error('音频播放错误:', event)
		playerStore.setLoading(false)

		const error = audioInstance.error
		if (error) {
			let errorMessage = '播放失败'
			switch (error.code) {
				case error.MEDIA_ERR_ABORTED:
					errorMessage = '音频加载被中止'
					break
				case error.MEDIA_ERR_NETWORK:
					errorMessage = '网络错误，无法加载音频'
					// 网络错误时尝试重试
					if (retryCount.value < MAX_RETRIES) {
						retryCount.value++
						console.log(`重试播放 (${retryCount.value}/${MAX_RETRIES})`)
						setTimeout(() => {
							loadAndPlay()
						}, 1000)
						return
					}
					break
				case error.MEDIA_ERR_DECODE:
					errorMessage = '音频解码失败'
					break
				case error.MEDIA_ERR_SRC_NOT_SUPPORTED:
					errorMessage = '不支持的音频格式'
					break
			}

			console.error(errorMessage, error)

			// 尝试播放下一曲
			setTimeout(() => {
				playerStore.playNext()
			}, 1000)
		}
	}

	/**
	 * 加载音频
	 * @param {string} url - 音频 URL
	 */
	async function loadAudio(url) {
		if (!url) {
			console.error('音频 URL 为空')
			return
		}

		const audio = getAudioInstance()
		playerStore.setLoading(true)
		retryCount.value = 0

		try {
			audio.src = url
			audio.load()
		} catch (error) {
			console.error('加载音频失败:', error)
			playerStore.setLoading(false)
		}
	}

	/**
	 * 播放音频
	 */
	async function play() {
		const audio = getAudioInstance()
		// 避免重复播放
		if (!audio.paused) {
			playerStore.resume()
			return
		}

		try {
			await audio.play()
			playerStore.resume()
		} catch (error) {
			// 处理各种播放错误
			if (error.name === 'NotAllowedError') {
				console.warn('浏览器阻止自动播放，需要用户交互')
				playerStore.pause()
			} else if (error.name === 'AbortError') {
				// AbortError 是正常的切换行为，不打印错误
				// 可能的原因：
				// 1. 切换歌曲时的 load 中断
				// 2. 快速切换播放/暂停
				// 3. 用户拖动进度条时的状态切换
				playerStore.pause()
			} else {
				// 其他未知错误才打印
				console.error('播放失败:', error)
				playerStore.pause()
			}
		}
	}

	/**
	 * 暂停音频
	 */
	function pause() {
		const audio = getAudioInstance()
		// 避免重复暂停
		if (audio.paused) {
			playerStore.pause()
			return
		}
		audio.pause()
		playerStore.pause()
	}

	/**
	 * 跳转到指定时间
	 * @param {number} time - 时间（秒）
	 */
	function seek(time) {
		const audio = getAudioInstance()
		if (isNaN(time) || time < 0) return
		audio.currentTime = Math.min(time, audio.duration || 0)
		// 不手动更新 Store，让 timeupdate 事件自动处理
	}

	/**
	 * 设置音量
	 * @param {number} volume - 音量值 (0-1)
	 */
	function setVolume(volume) {
		const audio = getAudioInstance()
		if (volume < 0 || volume > 1) return
		audio.volume = volume
		playerStore.setVolume(volume)
	}

	/**
	 * 加载并播放
	 */
	async function loadAndPlay() {
		const audioSource = playerStore.currentAudioSource
		if (!audioSource || !audioSource.url) {
			console.error('没有可用的音频源')
			return
		}

		await loadAudio(audioSource.url)
		await play()
	}

	// ========== 监听状态变化 ==========

	/**
	 * 监听当前音频源变化
	 */
	watch(
		() => playerStore.currentAudioSource,
		(newSource) => {
			if (newSource && newSource.url) {
				loadAndPlay()
			}
		},
		{ immediate: true }
	)

	/**
	 * 监听播放状态变化
	 */
	watch(
		() => playerStore.isPlaying,
		(isPlaying) => {
			const audio = getAudioInstance()
			if (isPlaying) {
				if (audio.paused) {
					play()
				}
			} else {
				if (!audio.paused) {
					pause()
				}
			}
		}
	)

	/**
	 * 监听音量变化
	 */
	watch(
		() => playerStore.volume,
		(newVolume) => {
			const audio = getAudioInstance()
			audio.volume = newVolume
		},
		{ immediate: true }
	)

	// ========== 初始化 ==========

	// 获取 audio 实例引用
	audioElement.value = getAudioInstance()

	// 组件卸载时不销毁 audio（全局单例）
	onUnmounted(() => {
		// 保持 audio 实例，不清理
	})

	return {
		audioElement,
		play,
		pause,
		seek,
		setVolume,
		loadAudio,
	}
}
