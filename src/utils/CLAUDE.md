# 工具函数文档

[🏠 返回根目录](../CLAUDE.md)

> **模块路径：** `src/utils/`
> **最后更新：** 2026-01-29

---

## 📋 概述

工具函数模块提供通用的辅助函数，包括 HTTP 请求封装、音频格式处理等。

---

## 🏗️ 模块结构

```
src/utils/
├── request.js       # Axios 请求封装
├── audioFormat.js   # 音频格式处理
└── index.js         # 通用工具函数
```

---

## 🌐 request.js

**文件：** [request.js](./request.js)

### 功能

封装 Axios 实例，提供统一的请求/响应拦截和错误处理。

### 配置

```javascript
{
  baseURL: '/api',           // 使用 Vite 代理
  timeout: 10000,            // 10秒超时
  headers: {
    'Content-Type': 'application/json;charset=UTF-8'
  }
}
```

### 请求拦截器

**功能：**
1. 为 GET 请求添加时间戳参数 `_t` 防止缓存
2. 预留 token 认证逻辑（当前未实现）

**代码：**
```javascript
request.interceptors.request.use((config) => {
  if (config.method === 'get' && !config.skipCacheTTL) {
    config.params = {
      ...config.params,
      _t: Date.now(),
    }
  }

  // 预留 token 认证
  // const token = localStorage.getItem('token')
  // if (token) {
  //   config.headers.Authorization = `Bearer ${token}`
  // }

  return config
})
```

### 响应拦截器

**功能：**
1. 统一处理响应数据格式：`{ code: 200, message: '操作成功', data: ... }`
2. 自动显示错误提示
3. 处理 HTTP 状态码错误（400/401/403/404/500）
4. 处理网络错误和超时

**错误码映射：**

| 状态码 | 提示信息 |
|--------|----------|
| 400 | 请求参数错误 |
| 401 | 未授权，请重新登录 |
| 403 | 拒绝访问 |
| 404 | 请求的资源不存在 |
| 500 | 服务器内部错误 |

### 使用方式

```javascript
import request from '@/utils/request'

export function getData(params) {
  return request({
    url: '/endpoint',
    method: 'get',
    params,
  })
}

export function postData(data) {
  return request({
    url: '/endpoint',
    method: 'post',
    data,
  })
}
```

---

## 🎵 audioFormat.js

**文件：** [audioFormat.js](./audioFormat.js)

### 功能

提供音频格式相关的工具函数。

### 主要函数

#### `selectBestAudioSource(audioSources)`

从多个音频源中选择最佳质量

**参数：**
- `audioSources` (Array) - 音频源数组

**音频源结构：**
```javascript
{
  format: string,    // 音频格式（mp3, flac, wav 等）
  quality: string,   // 音质（low, standard, high, lossless）
  url: string        // 音频 URL
}
```

**选择优先级：**
1. lossless（无损） > high（高品质） > standard（标准） > low（低品质）
2. 格式优先级：flac > wav > mp3 > aac

**返回：** 最佳音频源对象

**代码：**
```javascript
export function selectBestAudioSource(audioSources) {
  if (!audioSources || audioSources.length === 0) {
    return null
  }

  // 定义质量优先级
  const qualityPriority = {
    lossless: 4,
    high: 3,
    standard: 2,
    low: 1,
  }

  // 定义格式优先级
  const formatPriority = {
    flac: 4,
    wav: 3,
    mp3: 2,
    aac: 1,
  }

  // 按优先级排序
  return audioSources.sort((a, b) => {
    const qualityDiff =
      (qualityPriority[b.quality] || 0) -
      (qualityPriority[a.quality] || 0)

    if (qualityDiff !== 0) return qualityDiff

    return (
      (formatPriority[b.format] || 0) - (formatPriority[a.format] || 0)
    )
  })[0]
}
```

### 使用示例

```javascript
import { selectBestAudioSource } from '@/utils/audioFormat'

const audioSources = [
  { format: 'mp3', quality: 'standard', url: '...' },
  { format: 'flac', quality: 'lossless', url: '...' },
  { format: 'aac', quality: 'low', url: '...' },
]

const bestSource = selectBestAudioSource(audioSources)
// 返回: { format: 'flac', quality: 'lossless', url: '...' }
```

---

## 🛠️ index.js

**文件：** [index.js](./index.js)

### 功能

通用工具函数集合。

### 主要函数

#### `cn(...classes)`

合并 CSS 类名，基于 `clsx` 和 `tailwind-merge` 实现

**参数：**
- `...classes` - 类名（字符串、对象、数组）

**返回：** 合并后的类名字符串

**使用示例：**
```javascript
import { cn } from '@/utils'

// 基础使用
cn('text-red-500', 'bg-blue-500')
// 'text-red-500 bg-blue-500'

// 条件类名
cn('base-class', {
  'text-red-500': isError,
  'text-green-500': isSuccess
})

// 数组
cn(['class1', 'class2'], 'class3')

// Tailwind 类名去重（后者覆盖前者）
cn('text-red-500 text-blue-500', 'text-red-500')
// 'text-red-500 text-blue-500'（第二个 text-red-500 会覆盖第一个）
```

#### 其他工具函数

待补充...

---

## 💡 使用示例

### 在 API 层使用 request

```javascript
// src/api/music.js
import request from '@/utils/request'

export function getMusicList(params) {
  return request({
    url: '/music/list',
    method: 'get',
    params,
  })
}
```

### 在 Store 中使用 audioFormat

```javascript
// src/stores/player.js
import { selectBestAudioSource } from '@/utils/audioFormat'

export const usePlayerStore = defineStore('player', () => {
  function playTrack(track) {
    if (track.audioSources && track.audioSources.length > 0) {
      currentAudioSource.value = selectBestAudioSource(track.audioSources)
    }
  }

  return { playTrack }
})
```

### 在组件中使用 cn

```vue
<template>
  <div :class="cn('base-class', { 'active-class': isActive })">
    Content
  </div>
</template>

<script setup>
import { cn } from '@/utils'
import { ref } from 'vue'

const isActive = ref(true)
</script>
```

---

## ⚠️ 注意事项

1. **request.js 是单例**：整个应用只有一个 Axios 实例，不要创建新的实例
2. **时间戳防缓存**：如需禁用，设置 `config.skipCacheTTL = true`
3. **audioFormat.js 的优先级**：可根据项目需求调整质量优先级
4. **cn 函数**：优先使用 `cn()` 合并 Tailwind 类名，避免类名冲突

---

## 📝 待优化项

- [ ] 添加更多通用工具函数（日期格式化、数字格式化等）
- [ ] 添加请求缓存机制
- [ ] 添加请求取消功能（AbortController）
- [ ] 完善 token 认证逻辑
- [ ] 添加单元测试

---

**生成时间：** 2026-01-29
