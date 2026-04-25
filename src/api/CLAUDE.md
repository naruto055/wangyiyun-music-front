# API 接口层文档

[🏠 返回根目录](../../CLAUDE.md)

> **模块路径：** `src/api/`
> **最后更新：** 2026-04-25

---

## 概览

前端 API 层当前只保留视频解析和 B 站搜索相关接口封装。旧的音乐、收藏、专辑、音频库接口已随服务端重构下线。

### 目录结构

```text
src/api/
├── bilibili.js   # B 站搜索接口
└── video.js      # 视频解析与资源准备接口
```

---

## bilibili.js

### `searchBilibiliVideos(params)`

调用 `POST /api/bilibili/search`

**用途：**

- 搜索 B 站视频
- 支持关键词和 BV 号
- 返回分页结果

**说明：**

- 搜索历史接口已删除，当前模块不再提供历史查询/清空方法

---

## video.js

### `parseVideo(data)`

调用 `POST /api/video/parse`

**用途：**

- 解析视频元数据
- 返回平台、标题、封面、时长、可用动作等信息

### `prepareAudio(data)`

调用 `POST /api/video/audio/prepare`

**用途：**

- 按需准备音频资源
- 为在线播放和下载提供临时音频地址

### `downloadVideo(data)`

调用 `POST /api/video/video/download`

**用途：**

- 按需准备视频下载资源

### `getSupportedPlatforms()`

调用 `GET /api/video/platforms`

**用途：**

- 获取服务端当前声明支持的平台列表

---

## 维护说明

- 如果后端再删除或改名视频接口，需要优先同步 [../views/CLAUDE.md](../views/CLAUDE.md)
- 所有请求统一经由 `@/utils/request` 处理响应码和错误提示
