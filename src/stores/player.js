import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { selectBestAudioSource } from '@/utils/audioFormat';

/**
 * 播放模式枚举
 */
export const PLAY_MODES = {
	SEQUENTIAL: 'sequential', // 顺序播放
	RANDOM: 'random', // 随机播放
	REPEAT_ONE: 'repeat-one', // 单曲循环
};

/**
 * 音乐播放器状态管理 Store
 */
export const usePlayerStore = defineStore('player', () => {
	// ========== 播放状态 ==========
	const currentTrack = ref(null); // 当前播放的歌曲对象
	const isPlaying = ref(false); // 是否正在播放
	const currentTime = ref(0); // 当前播放时间（秒）
	const duration = ref(0); // 总时长（秒）
	const volume = ref(0.8); // 音量 (0-1)
	const loading = ref(false); // 音频加载状态

	// ========== 播放列表 ==========
	const playlist = ref([]); // 播放队列
	const currentIndex = ref(-1); // 当前播放的索引
	const playMode = ref(PLAY_MODES.SEQUENTIAL); // 播放模式

	// ========== 音频源 ==========
	const currentAudioSource = ref(null); // 当前选中的音频源对象

	// ========== 计算属性 ==========

	/**
	 * 是否有上一曲
	 */
	const hasPrevious = computed(() => {
		if (playlist.value.length === 0) return false;
		if (playMode.value === PLAY_MODES.REPEAT_ONE) return true;
		return currentIndex.value > 0;
	});

	/**
	 * 是否有下一曲
	 */
	const hasNext = computed(() => {
		if (playlist.value.length === 0) return false;
		if (playMode.value === PLAY_MODES.REPEAT_ONE) return true;
		return currentIndex.value < playlist.value.length - 1;
	});

	/**
	 * 播放进度百分比
	 */
	const progress = computed(() => {
		if (!duration.value) return 0;
		return (currentTime.value / duration.value) * 100;
	});

	// ========== 操作方法 ==========

	/**
	 * 播放指定歌曲
	 * @param {Object} track - 歌曲对象
	 */
	function playTrack(track) {
		console.log('播放歌曲：', track);
		if (!track) return;

		// 检查是否已在播放列表中
		const existingIndex = playlist.value.findIndex((item) => item.id === track.id);

		if (existingIndex !== -1) {
			// 已在列表中，直接切换到该歌曲
			currentIndex.value = existingIndex;
		} else {
			// 不在列表中，添加到当前播放位置之后
			if (currentIndex.value === -1) {
				// 列表为空或无当前播放，直接添加
				playlist.value.push(track);
				currentIndex.value = playlist.value.length - 1;
			} else {
				// 插入到当前播放位置之后
				playlist.value.splice(currentIndex.value + 1, 0, track);
				currentIndex.value = currentIndex.value + 1;
			}
		}

		// 处理歌曲信息：提取歌手名称
		const processedTrack = {
			...track,
			artistNames: extractArtistNames(track.artists)
		};

		// 设置当前播放歌曲
		currentTrack.value = processedTrack;

		// 选择最佳音频源
		if (track.audioSources && track.audioSources.length > 0) {
			currentAudioSource.value = selectBestAudioSource(track.audioSources);
		} else {
			currentAudioSource.value = null;
		}

		// 标记为正在播放
		isPlaying.value = true;
	}

	/**
	 * 从 artists 数组中提取歌手名称
	 * @param {Array} artists - 艺术家数组
	 * @returns {string} 歌手名称字符串，多个歌手用逗号分隔
	 */
	function extractArtistNames(artists) {
		if (!artists || !Array.isArray(artists) || artists.length === 0) {
			return '未知歌手';
		}

		// 筛选出 role 为 singer 的艺术家
		const singers = artists.filter((artist) => artist.role === 'singer');

		if (singers.length === 0) {
			// 如果没有找到 singer，尝试使用第一个艺术家
			return artists[0]?.name || '未知歌手';
		}

		// 提取歌手名称，多个歌手用 / 分隔
		return singers.map((singer) => singer.name).filter(Boolean).join(' / ');
	}

	/**
	 * 添加到播放列表（不立即播放）
	 * @param {Object} track - 歌曲对象
	 */
	function addToPlaylist(track) {
		if (!track) return;

		// 检查是否已在列表中（去重）
		const exists = playlist.value.some((item) => item.id === track.id);
		if (exists) {
			console.log('歌曲已在播放列表中');
			return;
		}

		playlist.value.push(track);
	}

	/**
	 * 切换播放/暂停
	 */
	function togglePlay() {
		if (!currentTrack.value) return;
		isPlaying.value = !isPlaying.value;
	}

	/**
	 * 暂停播放
	 */
	function pause() {
		isPlaying.value = false;
	}

	/**
	 * 恢复播放
	 */
	function resume() {
		if (!currentTrack.value) return;
		isPlaying.value = true;
	}

	/**
	 * 计算下一曲索引
	 * @returns {number} 下一曲索引，-1 表示没有下一曲
	 */
	function getNextIndex() {
		if (playlist.value.length === 0) return -1;

		switch (playMode.value) {
			case PLAY_MODES.SEQUENTIAL:
				// 顺序播放
				if (currentIndex.value < playlist.value.length - 1) {
					return currentIndex.value + 1;
				}
				return -1; // 列表结束

			case PLAY_MODES.RANDOM:
				// 随机播放
				if (playlist.value.length === 1) return 0;
				let randomIndex;
				do {
					randomIndex = Math.floor(Math.random() * playlist.value.length);
				} while (randomIndex === currentIndex.value);
				return randomIndex;

			case PLAY_MODES.REPEAT_ONE:
				// 单曲循环
				return currentIndex.value;

			default:
				return -1;
		}
	}

	/**
	 * 播放下一曲
	 */
	function playNext() {
		const nextIndex = getNextIndex();
		if (nextIndex === -1) {
			// 没有下一曲，停止播放
			pause();
			return;
		}

		currentIndex.value = nextIndex;
		const nextTrack = playlist.value[nextIndex];
		if (nextTrack) {
			// 处理歌曲信息：提取歌手名称
			const processedTrack = {
				...nextTrack,
				artistNames: extractArtistNames(nextTrack.artists)
			};
			currentTrack.value = processedTrack;

			// 选择最佳音频源
			if (nextTrack.audioSources && nextTrack.audioSources.length > 0) {
				currentAudioSource.value = selectBestAudioSource(nextTrack.audioSources);
			} else {
				currentAudioSource.value = null;
			}

			isPlaying.value = true;
		}
	}

	/**
	 * 播放上一曲
	 */
	function playPrevious() {
		if (playlist.value.length === 0) return;

		if (playMode.value === PLAY_MODES.REPEAT_ONE) {
			// 单曲循环模式，重新开始播放当前歌曲
			currentTime.value = 0;
			isPlaying.value = true;
			return;
		}

		if (currentIndex.value > 0) {
			currentIndex.value -= 1;
			const prevTrack = playlist.value[currentIndex.value];
			if (prevTrack) {
				// 处理歌曲信息：提取歌手名称
				const processedTrack = {
					...prevTrack,
					artistNames: extractArtistNames(prevTrack.artists)
				};
				currentTrack.value = processedTrack;

				// 选择最佳音频源
				if (prevTrack.audioSources && prevTrack.audioSources.length > 0) {
					currentAudioSource.value = selectBestAudioSource(prevTrack.audioSources);
				} else {
					currentAudioSource.value = null;
				}

				isPlaying.value = true;
			}
		}
	}

	/**
	 * 设置播放模式
	 * @param {string} mode - 播放模式
	 */
	function setPlayMode(mode) {
		if (Object.values(PLAY_MODES).includes(mode)) {
			playMode.value = mode;
		}
	}

	/**
	 * 切换播放模式（循环切换）
	 */
	function togglePlayMode() {
		const modes = Object.values(PLAY_MODES);
		const currentModeIndex = modes.indexOf(playMode.value);
		const nextModeIndex = (currentModeIndex + 1) % modes.length;
		playMode.value = modes[nextModeIndex];
	}

	/**
	 * 清空播放列表
	 */
	function clearPlaylist() {
		playlist.value = [];
		currentIndex.value = -1;
		currentTrack.value = null;
		currentAudioSource.value = null;
		isPlaying.value = false;
		currentTime.value = 0;
		duration.value = 0;
	}

	/**
	 * 从播放列表移除指定索引的歌曲
	 * @param {number} index - 索引
	 */
	function removeFromPlaylist(index) {
		if (index < 0 || index >= playlist.value.length) return;

		// 如果删除的是当前播放的歌曲
		if (index === currentIndex.value) {
			// 尝试播放下一曲
			const nextIndex = getNextIndex();
			if (nextIndex !== -1 && nextIndex !== index) {
				playNext();
			} else {
				// 没有下一曲，停止播放
				currentTrack.value = null;
				currentAudioSource.value = null;
				isPlaying.value = false;
			}
		}

		// 删除歌曲
		playlist.value.splice(index, 1);

		// 调整当前索引
		if (index < currentIndex.value) {
			currentIndex.value -= 1;
		} else if (index === currentIndex.value && currentIndex.value >= playlist.value.length) {
			currentIndex.value = playlist.value.length - 1;
		}
	}

	/**
	 * 更新当前播放时间
	 * @param {number} time - 时间（秒）
	 */
	function updateTime(time) {
		currentTime.value = time;
	}

	/**
	 * 更新总时长
	 * @param {number} time - 时长（秒）
	 */
	function updateDuration(time) {
		duration.value = time;
	}

	/**
	 * 设置音量
	 * @param {number} value - 音量值 (0-1)
	 */
	function setVolume(value) {
		if (value < 0 || value > 1) return;
		volume.value = value;
		// 持久化到 localStorage
		localStorage.setItem('player-volume', value.toString());
	}

	/**
	 * 跳转到指定时间
	 * @param {number} time - 时间（秒）
	 */
	function seek(time) {
		if (time < 0 || time > duration.value) return;
		currentTime.value = time;
	}

	/**
	 * 设置加载状态
	 * @param {boolean} state - 加载状态
	 */
	function setLoading(state) {
		loading.value = state;
	}

	/**
	 * 初始化播放器（从 localStorage 恢复设置）
	 */
	function initialize() {
		// 恢复音量设置
		const savedVolume = localStorage.getItem('player-volume');
		if (savedVolume !== null) {
			const volumeValue = parseFloat(savedVolume);
			if (!isNaN(volumeValue) && volumeValue >= 0 && volumeValue <= 1) {
				volume.value = volumeValue;
			}
		}
	}

	// 初始化
	initialize();

	return {
		// 状态
		currentTrack,
		isPlaying,
		currentTime,
		duration,
		volume,
		loading,
		playlist,
		currentIndex,
		playMode,
		currentAudioSource,

		// 计算属性
		hasPrevious,
		hasNext,
		progress,

		// 方法
		playTrack,
		addToPlaylist,
		togglePlay,
		pause,
		resume,
		playNext,
		playPrevious,
		setPlayMode,
		togglePlayMode,
		clearPlaylist,
		removeFromPlaylist,
		updateTime,
		updateDuration,
		setVolume,
		seek,
		setLoading,
	};
});
