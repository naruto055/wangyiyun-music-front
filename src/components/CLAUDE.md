# 组件文档

[🏠 返回根目录](../CLAUDE.md)

> **模块路径：** `src/components/`
> **最后更新：** 2026-04-25

---

## 概览

组件层当前由布局组件、播放器组件和通用 UI 组件组成。旧的音乐卡片、音乐详情、专辑相关业务组件已下线。

### 目录结构

```text
src/components/
├── layout/
│   ├── Header.vue
│   └── index.js
├── player/
│   ├── PlayerBar.vue
│   ├── PlayerControls.vue
│   ├── PlayerInfo.vue
│   ├── PlayerProgress.vue
│   ├── PlayerVolume.vue
│   ├── PlayerPlaylist.vue
│   └── CLAUDE.md
└── ui/
    ├── button/
    ├── card/
    ├── confirm-dialog/
    ├── dialog/
    ├── input/
    ├── pagination/
    ├── skeleton/
    └── toast/
```

---

## 布局组件

### Header.vue

**路径：** [layout/Header.vue](./layout/Header.vue)

**职责：**

- 显示应用标题
- 提供当前仅保留的两个导航入口：
  - `/video-parser`
  - `/bilibili-search`

---

## 播放器组件

播放器组件说明请参考 [player/CLAUDE.md](./player/CLAUDE.md)。

---

## UI 组件

当前项目主要复用以下通用组件：

- `Button`
- `Card`
- `Input`
- `Dialog`
- `Pagination`
- `Skeleton`
- `Toast`
- `ConfirmDialog`

---

## 维护说明

- 新增业务组件时，应优先判断是否真的需要单独抽象，避免把页面逻辑过早拆散
- 导航结构变化时，需要同步更新本文件和 `layout/Header.vue`
