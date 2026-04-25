# 页面视图模块 (Views)

> **导航：** [项目根目录](../../CLAUDE.md) > [src](../CLAUDE.md) > views
>
> **最后更新：** 2026-04-25
> **文件数量：** 2 个
> **职责：** 应用页面视图、路由对应组件

---

## 概览

当前页面层仅保留视频相关业务，音乐列表、收藏列表、专辑列表已随服务端下线一并移除。

### 页面列表

| 页面 | 路由 | 功能 |
|------|------|------|
| `VideoParser.vue` | `/video-parser` | 解析视频元数据，按需准备音频，支持播放与下载 |
| `BilibiliSearch.vue` | `/bilibili-search` | 搜索 B 站视频并直接准备音频播放 |

### 目录结构

```text
src/views/
├── VideoParser.vue
└── BilibiliSearch.vue
```

---

## VideoParser.vue

**路由：** `/video-parser`

### 主要职责

- 输入视频链接或分享文本
- 调用 `/api/video/parse` 获取元数据和可用动作
- 调用 `/api/video/audio/prepare` 准备音频资源
- 调用 `/api/video/video/download` 下载视频资源
- 将准备好的音频资源适配为播放器可消费的音轨对象

### 依赖

- `@/api/video`
- `@/stores/player`
- `@/utils/trackAdapter`
- `@/composables/useToast`

---

## BilibiliSearch.vue

**路由：** `/bilibili-search`

### 主要职责

- 调用 `POST /api/bilibili/search` 搜索 B 站视频
- 支持关键词和 BV 号搜索
- 对搜索结果执行解析与音频准备
- 将结果接入全局播放器

### 当前行为说明

- 搜索历史接口已下线，页面不再展示或刷新历史记录
- “保存为音乐”“分类选择”等依赖旧音乐库能力的功能已移除

### 依赖

- `@/api/bilibili`
- `@/api/video`
- `@/stores/player`
- `@/utils/trackAdapter`
- `@/composables/useDebounce`
- `@/composables/useToast`

---

## 维护说明

- 新增页面时，需要同步更新 [../router/CLAUDE.md](../router/CLAUDE.md)
- 如果后端再次调整视频相关接口，优先核对本模块和 [../api/CLAUDE.md](../api/CLAUDE.md)
