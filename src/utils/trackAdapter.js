/**
 * 音轨数据适配器
 * 用于将不同数据源（音乐详情、视频解析）统一转换为播放器需要的格式
 */

/**
 * 将已准备好的音频资源转换为音轨对象
 * @param {Object} audioPrepareResult - 音频准备结果
 * @param {Object} [metadata={}] - 补充元数据
 * @returns {Object} 统一的音轨对象
 */
export function adaptVideoToTrack(audioPrepareResult, metadata = {}) {
	return {
		// 基础信息
		id: `video_${audioPrepareResult.sourceVideoId}`, // 临时ID
		title: audioPrepareResult.title || metadata.title,
		coverUrl: metadata.coverUrl || null,
		duration: audioPrepareResult.duration ?? metadata.duration ?? 0,

		// 音频源（仅在音频资源准备完成后存在）
		audioSources: [
			{
				url: audioPrepareResult.audioUrl,
				format: audioPrepareResult.audioFormat,
				quality: 'high',
			},
		],

		// 缺失字段 - 使用默认值
		artistNames: '视频音频', // 标识来源为视频解析
		fileUrl: null, // 视频解析没有 fileUrl
		lyrics: null, // 视频解析没有歌词
		playCount: 0, // 没有播放量
		favoriteCount: 0, // 没有收藏量
		releaseDate: null, // 没有发布日期
		albumName: '视频提取', // 标识专辑为"视频提取"
		categoryName: '其他', // 默认分类
		artists: [], // 空歌手数组
		tags: ['视频音频'], // 特殊标签标识

		// 元数据（用于区分数据来源）
		_source: 'video_parse', // 标识数据来源
		_platform: metadata.platform || null, // 平台类型
		_sourceVideoId: audioPrepareResult.sourceVideoId, // 源视频ID
		_expiresAt: audioPrepareResult.expiresAt, // 过期时间
		_isTemporary: true, // 标记为临时文件
	}
}

/**
 * 将音乐详情转换为音轨对象
 * @param {Object} musicDetail - 音乐详情对象
 * @returns {Object} 统一的音轨对象
 */
export function adaptMusicToTrack(musicDetail) {
	// 构造 artistNames（多个歌手用 "/" 分隔）
	const artistNames =
		musicDetail.artists
			?.filter((a) => a.role === 'singer')
			.map((a) => a.name)
			.join('/') || '未知歌手'

	return {
		// 基础信息
		id: musicDetail.id,
		title: musicDetail.title,
		coverUrl: musicDetail.coverUrl,
		duration: musicDetail.duration,

		// 音频源（保留 music store 已经构造好的 audioSources）
		audioSources: musicDetail.audioSources || null,

		// 完整字段
		artistNames,
		fileUrl: musicDetail.fileUrl,
		lyrics: musicDetail.lyrics,
		playCount: musicDetail.playCount,
		favoriteCount: musicDetail.favoriteCount,
		releaseDate: musicDetail.releaseDate,
		albumName: musicDetail.albumName,
		categoryName: musicDetail.categoryName,
		artists: musicDetail.artists,
		tags: musicDetail.tags || [],

		// 元数据
		_source: 'music_detail', // 标识数据来源
		_isTemporary: false, // 不是临时文件
	}
}

/**
 * 检查音轨是否为临时文件（视频解析）
 * @param {Object} track - 音轨对象
 * @returns {boolean} 是否为临时文件
 */
export function isTemporaryTrack(track) {
	return track._isTemporary === true || track._source === 'video_parse'
}

/**
 * 获取音轨的过期时间提示
 * @param {Object} track - 音轨对象
 * @returns {string|null} 过期时间提示文本
 */
export function getExpiryHint(track) {
	if (!isTemporaryTrack(track) || !track._expiresAt) {
		return null
	}

	const expiresAt = new Date(track._expiresAt)
	const now = new Date()
	const remainingMs = expiresAt - now

	if (remainingMs <= 0) {
		return '音频已过期'
	}

	const remainingMinutes = Math.floor(remainingMs / 1000 / 60)
	if (remainingMinutes < 60) {
		return `${remainingMinutes} 分钟后过期`
	}

	return '1 小时后过期'
}

/**
 * 检查音轨是否已过期
 * @param {Object} track - 音轨对象
 * @returns {boolean} 是否已过期
 */
export function isTrackExpired(track) {
	if (!isTemporaryTrack(track) || !track._expiresAt) {
		return false
	}

	const expiresAt = new Date(track._expiresAt)
	const now = new Date()
	return now >= expiresAt
}
