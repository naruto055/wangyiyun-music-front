# API 接口层文档

[🏠 返回根目录](../../CLAUDE.md)

> **模块路径：** `src/api/`
> **最后更新：** 2026-02-07

---

## 📋 概述

API 层负责与后端服务器通信，封装所有 HTTP 请求。基于 Axios 实现，提供统一的请求/响应处理和错误处理机制。

---

## 🏗️ 模块结构

```
src/api/
├── music.js      # 音乐管理接口
├── favorite.js   # 收藏管理接口
├── audio.js      # 音频管理接口
└── video.js      # 视频解析接口 (NEW)
```

---

## 🔌 接口列表

### 1. 音乐管理接口 (music.js)

#### `getMusicList(params)`

分页查询音乐列表

**参数：**

- `pageNum` (number) - 页码，默认 1
- `pageSize` (number) - 每页大小，默认 10
- `categoryId` (number, 可选) - 分类ID
- `keyword` (string, 可选) - 搜索关键词（歌曲名/歌手名）
- `sortField` (string) - 排序字段，默认 'create_time'
- `sortOrder` (string) - 排序方式（asc/desc），默认 'desc'

**返回：**

```javascript
{
  records: Array,   // 音乐列表
  total: number,    // 总记录数
  pages: number,    // 总页数
  current: number,  // 当前页码
  size: number      // 每页大小
}
```

#### `getMusicDetail(id)`

获取音乐详情

**参数：**

- `id` (number) - 音乐ID

**返回：**

```javascript
{
  id: number,
  title: string,        // 歌曲标题
  artists: Array,       // 艺术家列表
  coverUrl: string,     // 封面图URL
  duration: number,     // 时长（秒）
  // ... 其他字段
}
```

---

### 2. 收藏管理接口 (favorite.js)

#### `addFavorite(musicId)`

收藏音乐

**参数：**

- `musicId` (number) - 音乐ID

**返回：** 操作结果

#### `removeFavorite(musicId)`

取消收藏

**参数：**

- `musicId` (number) - 音乐ID

**返回：** 操作结果

#### `getFavoriteList(params)`

查询收藏列表

**参数：**

- `pageNum` (number) - 页码，默认 1
- `pageSize` (number) - 每页大小，默认 10

**返回：**

```javascript
{
  records: Array,   // 收藏列表（包含 musicId 字段）
  total: number,
  pages: number,
  current: number,
  size: number
}
```

---

### 3. 音频管理接口 (audio.js)

#### `getAudioUrl(id)`

获取音频访问 URL

**参数：**

- `id` (number) - 音乐ID

**返回：**

```javascript
{
	audioUrl: string // 音频文件访问URL
}
```

---

### 4. 视频解析接口 (video.js) - NEW

#### `parseVideo(data)`

解析视频并提取音频

**参数：**

```javascript
{
  videoUrl: string,    // 视频链接或分享文本（支持B站原始分享链接）
  platform: string     // 平台类型（BILIBILI/YOUTUBE/DOUYIN）
}
```

**返回：**

```javascript
{
  sourceVideoId: string,    // 源视频ID（如 BV1xxx）
  platform: string,         // 平台类型（BILIBILI/YOUTUBE）
  title: string,            // 标题
  audioUrl: string,         // 音频访问URL
  audioFormat: string,      // 音频格式（mp3/m4a）
  coverUrl: string,         // 封面图URL
  duration: number,         // 时长（秒）
  fileSize: number,         // 文件大小（字节）
  expiresAt: string         // 过期时间（1小时后）
}
```

**示例：**

```javascript
import { parseVideo } from '@/api/video'

const result = await parseVideo({
  videoUrl: 'https://www.bilibili.com/video/BV1xxx',
  platform: 'BILIBILI'
})
```

**注意事项：**

- 音频文件临时存储，1 小时后自动删除
- 支持 URL、BV号、分享文本等多种输入格式
- 文件大小限制：单文件不超过 100MB
- 存储容量限制：临时目录总容量不超过 1GB

#### `getSupportedPlatforms()`

获取支持的平台列表

**返回：**

```javascript
[
  {
    platform: string,   // 平台标识（如 'BILIBILI'）
    name: string,       // 平台名称
    enabled: boolean    // 是否启用
  }
]
```

---

## 🔄 请求拦截器

所有 API 请求都通过 [src/utils/request.js](../utils/request.js) 统一处理：

### 请求拦截器功能

1. **防缓存处理**：自动为 GET 请求添加时间戳参数 `_t`
2. **统一请求头**：设置 Content-Type 为 application/json
3. **认证预留**：预留 token 认证逻辑（当前未实现）

### 响应拦截器功能

1. **统一响应格式处理**：提取 `data.data` 字段
2. **错误提示**：自动显示错误消息
3. **HTTP 状态码处理**：
   - 400 - 请求参数错误
   - 401 - 未授权
   - 403 - 拒绝访问
   - 404 - 资源不存在
   - 500 - 服务器内部错误

---

## 🔧 使用示例

### 在组件中使用

```javascript
import { getMusicList, getMusicDetail } from '@/api/music'
import { addFavorite, removeFavorite } from '@/api/favorite'
import { parseVideo } from '@/api/video'

// 获取音乐列表
const response = await getMusicList({
	pageNum: 1,
	pageSize: 12,
	keyword: '周杰伦',
})

// 获取音乐详情
const detail = await getMusicDetail(123)

// 收藏音乐
await addFavorite(123)

// 取消收藏
await removeFavorite(123)

// 解析视频
const result = await parseVideo({
  videoUrl: 'https://www.bilibili.com/video/BV1xxx',
  platform: 'BILIBILI'
})
```

### 在 Store 中使用

```javascript
import { defineStore } from 'pinia'
import { getMusicList } from '@/api/music'

export const useMusicStore = defineStore('music', () => {
	async function fetchMusicList() {
		const response = await getMusicList({ pageNum: 1, pageSize: 12 })
		// 处理响应数据
	}

	return { fetchMusicList }
})
```

---

## ⚠️ 注意事项

1. **Base URL 配置**：所有请求会自动添加 `/api` 前缀，由 Vite 代理转发到后端服务器（`http://localhost:8910`）
2. **超时时间**：默认 10 秒
3. **错误处理**：接口调用失败时会自动显示 Toast 错误提示
4. **用户 ID**：收藏功能当前使用固定用户 ID（USER_ID = 0），后续需要实现动态用户认证
5. **视频解析**：
   - 解析后的音频文件为临时文件，1 小时后自动删除
   - 前端应妥善处理文件过期、解析失败等异常情况
   - 建议在播放前检查音频 URL 的有效性

---

## 📝 待优化项

- [ ] 添加请求取消机制（AbortController）
- [ ] 实现请求缓存策略
- [ ] 添加请求重试机制
- [ ] 完善用户认证 token 管理
- [ ] 添加接口请求日志记录
- [ ] 优化视频解析接口的错误处理和重试逻辑

---

**生成时间：** 2026-02-07
