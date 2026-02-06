# 状态管理文档

[🏠 返回根目录](../CLAUDE.md)

> **模块路径：** `src/stores/`
> **最后更新：** 2026-01-29

---

## 📋 概述

使用 **Pinia** 进行全局状态管理，提供响应式状态存储和计算属性。

---

## 🏗️ Store 列表

```
src/stores/
├── player.js     # 播放器状态管理
├── music.js      # 音乐列表状态管理
└── favorite.js   # 收藏状态管理
```

---

## 🎵 Player Store

**文件：** [player.js](./player.js)

### 状态

| 状态                 | 类型           | 说明                 |
| -------------------- | -------------- | -------------------- |
| `currentTrack`       | Object \| null | 当前播放的歌曲对象   |
| `isPlaying`          | boolean        | 是否正在播放         |
| `currentTime`        | number         | 当前播放时间（秒）   |
| `duration`           | number         | 总时长（秒）         |
| `volume`             | number         | 音量 (0-1)           |
| `loading`            | boolean        | 音频加载状态         |
| `playlist`           | Array          | 播放队列             |
| `currentIndex`       | number         | 当前播放的索引       |
| `playMode`           | string         | 播放模式             |
| `currentAudioSource` | Object \| null | 当前选中的音频源对象 |

### 计算属性

| 属性          | 类型    | 说明                   |
| ------------- | ------- | ---------------------- |
| `hasPrevious` | boolean | 是否有上一曲           |
| `hasNext`     | boolean | 是否有下一曲           |
| `progress`    | number  | 播放进度百分比 (0-100) |

### 播放模式

```javascript
export const PLAY_MODES = {
	SEQUENTIAL: 'sequential', // 顺序播放
	RANDOM: 'random', // 随机播放
	REPEAT_ONE: 'repeat-one', // 单曲循环
}
```

### 主要方法

#### `playTrack(track)`

播放指定歌曲，自动处理播放列表和歌手信息提取

#### `playNext()`

播放下一曲，根据播放模式计算

#### `playPrevious()`

播放上一曲

#### `togglePlay()`

切换播放/暂停状态

#### `setPlayMode(mode)`

设置播放模式

#### `togglePlayMode()`

循环切换播放模式

#### `setVolume(value)`

设置音量 (0-1)，自动持久化到 localStorage

#### `seek(time)`

跳转到指定时间

#### `addToPlaylist(track)`

添加到播放列表（不立即播放）

#### `removeFromPlaylist(index)`

从播放列表移除指定索引的歌曲

---

## 🎼 Music Store

**文件：** [music.js](./music.js)

### 状态

| 状态           | 类型    | 说明     |
| -------------- | ------- | -------- |
| `musicList`    | Array   | 音乐列表 |
| `total`        | number  | 总记录数 |
| `loading`      | boolean | 加载状态 |
| `searchParams` | Object  | 搜索参数 |

### 搜索参数结构

```javascript
{
  pageNum: 1,              // 页码
  pageSize: 12,            // 每页大小
  categoryId: null,        // 分类ID
  keyword: '',             // 搜索关键词
  sortField: 'create_time', // 排序字段
  sortOrder: 'desc'        // 排序方式
}
```

### 计算属性

| 属性          | 类型   | 说明     |
| ------------- | ------ | -------- |
| `totalPages`  | number | 总页数   |
| `currentPage` | number | 当前页码 |
| `pageSize`    | number | 每页大小 |

### 主要方法

#### `fetchMusicList()`

获取音乐列表

#### `setSearchKeyword(keyword)`

设置搜索关键词，自动重置到第一页

#### `setPagination(pageNum, pageSize)`

设置分页参数

#### `resetSearch()`

重置搜索条件

#### `fetchMusicDetail(id)`

获取音乐详情（包含可播放的音频URL）

---

## ⭐ Favorite Store

**文件：** [favorite.js](./favorite.js)

### 状态

| 状态           | 类型    | 说明                       |
| -------------- | ------- | -------------------------- |
| `favoriteList` | Array   | 收藏列表                   |
| `favoriteIds`  | Set     | 收藏ID集合（用于快速查找） |
| `total`        | number  | 总收藏数                   |
| `loading`      | boolean | 加载状态                   |
| `searchParams` | Object  | 搜索参数                   |

### 搜索参数结构

```javascript
{
  pageNum: 1,      // 页码
  pageSize: 12     // 每页大小
}
```

### 计算属性

| 属性          | 类型   | 说明     |
| ------------- | ------ | -------- |
| `totalPages`  | number | 总页数   |
| `currentPage` | number | 当前页码 |
| `pageSize`    | number | 每页大小 |

### 主要方法

#### `fetchFavoriteList()`

获取收藏列表，自动更新 favoriteIds 集合

#### `toggleFavorite(musicId)`

切换收藏状态

- 返回 `true` 表示已收藏
- 返回 `false` 表示已取消收藏

#### `isFavorited(musicId)`

检查音乐是否已收藏（O(1) 时间复杂度）

#### `setPagination(pageNum, pageSize)`

设置分页参数

---

## 💡 使用示例

### 在组件中使用

```vue
<script setup>
import { usePlayerStore } from '@/stores/player'
import { useMusicStore } from '@/stores/music'
import { useFavoriteStore } from '@/stores/favorite'

const playerStore = usePlayerStore()
const musicStore = useMusicStore()
const favoriteStore = useFavoriteStore()

// 播放音乐
playerStore.playTrack(music)

// 切换播放状态
playerStore.togglePlay()

// 获取音乐列表
await musicStore.fetchMusicList()

// 切换收藏状态
await favoriteStore.toggleFavorite(musicId)
</script>
```

### 在模板中使用

```vue
<template>
	<div>
		<!-- 播放状态 -->
		<div v-if="playerStore.isPlaying">正在播放</div>

		<!-- 当前歌曲 -->
		<div>{{ playerStore.currentTrack?.name }}</div>

		<!-- 进度条 -->
		<progress :value="playerStore.progress" max="100"></progress>

		<!-- 收藏状态 -->
		<button @click="toggleFavorite">
			{{ favoriteStore.isFavorited(music.id) ? '已收藏' : '收藏' }}
		</button>
	</div>
</template>
```

---

## 🔄 Store 交互

### 播放流程

1. 用户点击播放按钮
2. 调用 `musicStore.fetchMusicDetail(id)` 获取音乐详情和音频 URL
3. 调用 `playerStore.playTrack(track)` 设置当前歌曲
4. `useAudioPlayer` 监听 `currentAudioSource` 变化，自动加载和播放音频

### 收藏流程

1. 用户点击收藏按钮
2. 调用 `favoriteStore.toggleFavorite(musicId)`
3. Store 自动调用 API 接口
4. 更新 `favoriteIds` 集合和 `favoriteList` 数组

---

## ⚠️ 注意事项

1. **持久化**：只有音量设置持久化到 localStorage，其他状态在页面刷新后会丢失
2. **用户 ID**：收藏功能当前使用固定用户 ID（USER_ID = 0），需要实现动态用户认证
3. **音频源选择**：播放器会自动选择最佳音频源（基于音频格式和质量）
4. **播放列表去重**：添加歌曲时会检查是否已存在，避免重复

---

## 📝 待优化项

- [ ] 实现播放列表持久化（localStorage 或 sessionStorage）
- [ ] 添加播放历史记录
- [ ] 实现用户认证后动态加载用户数据
- [ ] 添加状态持久化插件（pinia-plugin-persistedstate）
- [ ] 优化收藏列表的实时同步机制

---

**生成时间：** 2026-01-29
