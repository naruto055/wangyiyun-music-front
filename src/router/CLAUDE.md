# 路由配置模块 (Router)

> **导航：** [项目根目录](../../CLAUDE.md) > [src](../CLAUDE.md) > router
>
> **最后更新：** 2026-04-25
> **文件数量：** 1 个
> **职责：** Vue Router 配置、页面导航、默认重定向

---

## 概览

当前路由层只保留视频相关页面入口，历史上的音乐、收藏、专辑路由已移除。

### 路由列表

| 路径 | 名称 | 组件 | 说明 |
|------|------|------|------|
| `/` | - | - | 重定向到 `/video-parser` |
| `/video-parser` | `VideoParser` | `@/views/VideoParser.vue` | 视频解析页 |
| `/bilibili-search` | `BilibiliSearch` | `@/views/BilibiliSearch.vue` | B 站搜索页 |
| `/:pathMatch(.*)*` | - | - | 未匹配路由统一重定向到 `/video-parser` |

### 路由特性

- 使用 `createWebHistory()`
- 页面组件均使用懒加载
- 根路径和兜底路由统一回到视频解析页

### 当前结构

```text
/
├── /video-parser
└── /bilibili-search
```

---

## index.js

### 职责

- 创建 Router 实例
- 定义当前可访问页面
- 统一默认跳转和兜底跳转

### 维护说明

- 新增页面时，应同步更新顶部导航组件 `@/components/layout/Header.vue`
- 如果首页默认入口发生变化，需要同时更新根路由和兜底路由
