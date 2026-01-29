# 可组合函数文档

[🏠 返回根目录](../CLAUDE.md)

> **模块路径：** `src/composables/`
> **最后更新：** 2026-01-29

---

## 📋 概述

可组合函数（Composables）是 Vue 3 Composition API 的核心概念，用于封装和复用状态逻辑。

---

## 🏗️ 模块结构

```
src/composables/
├── useAudioPlayer.js  # 音频播放器逻辑
├── useToast.js        # Toast 提示逻辑
└── useDebounce.js     # 防抖函数
```

---

## 🎵 useAudioPlayer

**文件：** [useAudioPlayer.js](./useAudioPlayer.js)

### 功能

封装 HTMLAudioElement 的底层操作，提供音频播放、暂停、跳转等功能。使用单例模式确保全局只有一个 Audio 实例。

### 返回值

```javascript
{
  audioElement: Ref<HTMLAudioElement>,  // Audio 实例引用
  play: Function,        // 播放音频
  pause: Function,       // 暂停音频
  seek: Function,        // 跳转到指定时间
  setVolume: Function,   // 设置音量
  loadAudio: Function,   // 加载音频
}
```

### 核心特性

#### 1. 单例模式

全局只有一个 Audio 实例，避免多个音频同时播放：

```javascript
let audioInstance = null

function getAudioInstance() {
  if (!audioInstance) {
    audioInstance = new Audio()
    audioInstance.preload = 'auto'
    setupAudioListeners()
  }
  return audioInstance
}
```

#### 2. 自动状态同步

监听 `playerStore` 的状态变化，自动同步到 Audio 实例：

- 监听 `currentAudioSource` 变化 → 自动加载和播放新音频
- 监听 `isPlaying` 变化 → 自动调用 play/pause
- 监听 `volume` 变化 → 自动更新音量

#### 3. 完整的事件处理

| 事件 | 处理逻辑 |
|------|----------|
| `timeupdate` | 更新当前播放时间 |
| `ended` | 自动播放下一曲 |
| `loadedmetadata` | 更新总时长，结束加载状态 |
| `canplay` | 结束加载状态 |
| `loadstart` | 开始加载状态 |
| `error` | 错误处理和重试机制 |
| `pause` | 同步播放状态 |
| `play` | 同步播放状态 |

#### 4. 错误重试机制

网络错误时自动重试（最多 3 次）：

```javascript
const MAX_RETRIES = 3

if (error.code === error.MEDIA_ERR_NETWORK) {
  if (retryCount.value < MAX_RETRIES) {
    retryCount.value++
    setTimeout(() => {
      loadAndPlay()
    }, 1000)
  }
}
```

### 使用示例

```vue
<script setup>
import { useAudioPlayer } from '@/composables/useAudioPlayer'
import { usePlayerStore } from '@/stores/player'

const playerStore = usePlayerStore()
const { play, pause, seek, setVolume } = useAudioPlayer()

// 在组件内部，useAudioPlayer 会自动监听 playerStore 的状态变化
// 并自动调用 play/pause/seek 等方法，无需手动调用
</script>
```

---

## 💬 useToast

**文件：** [useToast.js](./useToast.js)

### 功能

提供全局 Toast 提示功能，支持成功、错误、信息、警告四种类型。

### 返回值

```javascript
{
  toast: {
    success: (message, options?) => void,
    error: (message, options?) => void,
    info: (message, options?) => void,
    warning: (message, options?) => void,
  }
}
```

### 使用示例

```javascript
import { toast } from '@/composables/useToast'

// 成功提示
toast.success('操作成功')

// 错误提示
toast.error('操作失败')

// 信息提示
toast.info('这是一条信息')

// 警告提示
toast.warning('请注意')

// 自定义选项
toast.success('操作成功', {
  duration: 3000,  // 持续时间（毫秒）
  position: 'top', // 位置
})
```

### 相关组件

- [src/components/ui/toast/Toast.vue](../components/ui/toast/Toast.vue)
- [src/components/ui/toast/ToastContainer.vue](../components/ui/toast/ToastContainer.vue)

---

## ⏱️ useDebounce

**文件：** [useDebounce.js](./useDebounce.js)

### 功能

防抖函数，用于延迟执行函数，避免频繁触发（如搜索输入）。

### 参数

```javascript
useDebounce(fn, delay)
```

- `fn` (Function) - 需要防抖的函数
- `delay` (number) - 延迟时间（毫秒）

### 返回值

返回防抖后的函数

### 使用示例

```vue
<script setup>
import { ref } from 'vue'
import { useDebounce } from '@/composables/useDebounce'
import { useMusicStore } from '@/stores/music'

const musicStore = useMusicStore()
const searchKeyword = ref('')

// 创建防抖搜索函数
const debouncedSearch = useDebounce((keyword) => {
  musicStore.setSearchKeyword(keyword)
  musicStore.fetchMusicList()
}, 500)

// 监听输入变化，调用防抖函数
watch(searchKeyword, (newKeyword) => {
  debouncedSearch(newKeyword)
})
</script>
```

---

## 🎯 最佳实践

### 1. useAudioPlayer 使用建议

- **不需要手动调用**：`useAudioPlayer` 会自动监听 `playerStore` 的状态变化并执行相应操作
- **单例模式**：全局只需调用一次，多个组件调用会共享同一个 Audio 实例
- **在根组件初始化**：建议在 `App.vue` 或 `PlayerBar.vue` 中调用

### 2. useToast 使用建议

- **全局可用**：可以直接从 `@/composables/useToast` 导入使用
- **错误处理**：在 `request.js` 中已经集成，API 错误会自动显示 Toast
- **手动提示**：用户操作成功/失败时手动调用

### 3. useDebounce 使用建议

- **搜索场景**：搜索输入框必须使用防抖，避免频繁请求
- **延迟时间**：建议 300-500ms，平衡响应速度和性能
- **清理定时器**：组件卸载时会自动清理

---

## ⚠️ 注意事项

1. **useAudioPlayer 必须在组件内部调用**：因为它使用了 Vue 的 `watch` 和 `onUnmounted` 生命周期钩子
2. **Toast 容器组件**：确保在 `App.vue` 中已经添加 `<ToastContainer />` 组件
3. **防抖函数引用**：保存防抖函数的引用，避免每次都创建新的防抖实例

---

## 📝 待优化项

- [ ] useThrottle - 节流函数
- [ ] useLocalStorage - 本地存储 Hook
- [ ] useMediaQuery - 媒体查询 Hook
- [ ] useIntersectionObserver - 滚动监听 Hook
- [ ] useClipboard - 剪贴板操作 Hook

---

**生成时间：** 2026-01-29
