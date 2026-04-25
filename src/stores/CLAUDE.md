# 状态管理文档

[🏠 返回根目录](../CLAUDE.md)

> **模块路径：** `src/stores/`
> **最后更新：** 2026-04-25

---

## 概览

当前状态管理层仅保留播放器 Store。旧的音乐列表、收藏、专辑 Store 已下线。

### 目录结构

```text
src/stores/
└── player.js
```

---

## Player Store

**文件：** [player.js](./player.js)

### 职责

- 管理当前播放音轨
- 管理播放队列和当前索引
- 管理播放状态、时长、进度、音量
- 管理播放模式与音频源选择

### 核心状态

- `currentTrack`
- `isPlaying`
- `currentTime`
- `duration`
- `volume`
- `playlist`
- `currentIndex`
- `playMode`
- `currentAudioSource`

### 核心方法

- `playTrack(track)`
- `togglePlay()`
- `playNext()`
- `playPrevious()`
- `setVolume(value)`
- `seek(time)`
- `clearPlaylist()`

### 播放模式

```javascript
export const PLAY_MODES = {
	SEQUENTIAL: 'sequential',
	RANDOM: 'random',
	REPEAT_ONE: 'repeat-one',
}
```

---

## 维护说明

- 如果播放器需要持久化更多状态，应优先在本模块扩展，而不是新建分散状态
- 页面层不要直接操作 `HTMLAudioElement`，统一通过 `useAudioPlayer` 与 `player.js` 协作
