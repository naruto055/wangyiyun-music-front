# 可组合函数文档

[🏠 返回根目录](../CLAUDE.md)

> **模块路径：** `src/composables/`
> **最后更新：** 2026-04-25

---

## 概览

可组合函数层用于封装播放器、提示、确认与防抖等跨页面复用逻辑。

### 目录结构

```text
src/composables/
├── useAudioPlayer.js
├── useToast.js
├── useDebounce.js
└── useConfirm.js
```

---

## useAudioPlayer

**职责：**

- 封装 `HTMLAudioElement`
- 监听 `playerStore` 状态并同步播放
- 处理播放结束、时间更新、加载异常等事件

**依赖：**

- `@/stores/player`
- `@/utils/audioFormat`

---

## useToast

**职责：**

- 提供统一的成功、失败、警告、信息提示

---

## useDebounce

**职责：**

- 为搜索、点击等高频行为提供防抖能力

---

## useConfirm

**职责：**

- 提供统一确认弹窗调用能力

---

## 维护说明

- 页面层如果出现重复交互逻辑，优先考虑下沉到 composable
- composable 应保持单一职责，不直接耦合具体页面视图结构
