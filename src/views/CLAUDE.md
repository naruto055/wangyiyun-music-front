# 页面视图文档

[🏠 返回根目录](../CLAUDE.md)

> **模块路径：** `src/views/`
> **最后更新：** 2026-01-29

---

## 📋 概述

页面视图是应用的主要页面，每个路由对应一个视图组件。

---

## 🏗️ 视图结构

```
src/views/
├── MusicList.vue       # 音乐列表页
└── FavoriteList.vue    # 收藏列表页
```

---

## 🎵 MusicList.vue

**路由：** `/music`
**文件：** [MusicList.vue](./MusicList.vue)

### 功能特性

1. **音乐浏览**
   - 分页展示音乐列表
   - 音乐卡片展示（封面、标题、歌手）
   - 响应式网格布局

2. **搜索功能**
   - 关键词搜索（歌曲名/歌手名）
   - 防抖处理（500ms）
   - 实时搜索结果更新

3. **播放控制**
   - 点击播放按钮播放音乐
   - 点击卡片查看详情

4. **收藏功能**
   - 收藏/取消收藏音乐
   - 实时更新收藏状态

5. **分页控制**
   - 页码切换
   - 每页数量调整

### 状态管理

使用的 Store：
- `musicStore` - 音乐列表状态
- `favoriteStore` - 收藏状态
- `playerStore` - 播放器状态

### 核心逻辑

#### 搜索逻辑

```javascript
// 使用防抖搜索
const debouncedSearch = useDebounce((keyword) => {
  musicStore.setSearchKeyword(keyword)
  musicStore.fetchMusicList()
}, 500)

watch(searchKeyword, (newKeyword) => {
  debouncedSearch(newKeyword)
})
```

#### 分页逻辑

```javascript
function handlePageChange(page) {
  musicStore.setPagination(page, 12)
  musicStore.fetchMusicList()
  // 滚动到顶部
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
```

#### 播放逻辑

```javascript
async function handlePlay(music) {
  // 获取音乐详情和音频 URL
  const track = await musicStore.fetchMusicDetail(music.id)
  if (track) {
    playerStore.playTrack(track)
  }
}
```

#### 收藏逻辑

```javascript
async function handleToggleFavorite(musicId) {
  try {
    const isFavorited = await favoriteStore.toggleFavorite(musicId)
    // 显示提示
    toast.success(isFavorited ? '已添加到收藏' : '已取消收藏')
  } catch (error) {
    toast.error('操作失败')
  }
}
```

### UI 布局

```
┌─────────────────────────────────────┐
│  搜索框                              │
├─────────────────────────────────────┤
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐   │
│  │音乐 │ │音乐 │ │音乐 │ │音乐 │   │
│  │卡片 │ │卡片 │ │卡片 │ │卡片 │   │
│  └─────┘ └─────┘ └─────┘ └─────┘   │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐   │
│  │音乐 │ │音乐 │ │音乐 │ │音乐 │   │
│  │卡片 │ │卡片 │ │卡片 │ │卡片 │   │
│  └─────┘ └─────┘ └─────┘ └─────┘   │
├─────────────────────────────────────┤
│         分页组件                     │
└─────────────────────────────────────┘
```

---

## ⭐ FavoriteList.vue

**路由：** `/favorites`
**文件：** [FavoriteList.vue](./FavoriteList.vue)

### 功能特性

1. **收藏列表**
   - 分页展示收藏的音乐
   - 音乐卡片展示
   - 响应式网格布局

2. **播放控制**
   - 点击播放按钮播放音乐
   - 点击卡片查看详情

3. **取消收藏**
   - 点击收藏按钮取消收藏
   - 实时更新列表

4. **分页控制**
   - 页码切换
   - 每页数量调整

5. **空状态处理**
   - 无收藏时显示空状态提示

### 状态管理

使用的 Store：
- `favoriteStore` - 收藏状态
- `playerStore` - 播放器状态

### 核心逻辑

#### 初始化加载

```javascript
onMounted(() => {
  favoriteStore.fetchFavoriteList()
})
```

#### 取消收藏逻辑

```javascript
async function handleToggleFavorite(musicId) {
  try {
    await favoriteStore.toggleFavorite(musicId)
    toast.success('已取消收藏')
    // 刷新列表
    favoriteStore.fetchFavoriteList()
  } catch (error) {
    toast.error('操作失败')
  }
}
```

#### 空状态判断

```javascript
const isEmpty = computed(() => {
  return favoriteStore.favoriteList.length === 0 && !favoriteStore.loading
})
```

### UI 布局

```
┌─────────────────────────────────────┐
│  我的收藏                            │
├─────────────────────────────────────┤
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐   │
│  │音乐 │ │音乐 │ │音乐 │ │音乐 │   │
│  │卡片 │ │卡片 │ │卡片 │ │卡片 │   │
│  └─────┘ └─────┘ └─────┘ └─────┘   │
├─────────────────────────────────────┤
│         分页组件                     │
└─────────────────────────────────────┘

或（空状态）
┌─────────────────────────────────────┐
│  我的收藏                            │
├─────────────────────────────────────┤
│                                     │
│         💔 暂无收藏                 │
│     快去音乐列表添加喜欢的歌曲吧     │
│                                     │
└─────────────────────────────────────┘
```

---

## 🎨 共同特性

### 1. 响应式设计

两个页面都采用响应式网格布局：

```vue
<div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
  <MusicCard
    v-for="music in list"
    :key="music.id"
    :music="music"
  />
</div>
```

### 2. 加载状态

使用骨架屏加载占位：

```vue
<div v-if="loading" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
  <Skeleton v-for="i in 8" :key="i" class="h-48" />
</div>
```

### 3. 错误处理

统一的错误处理逻辑：

```javascript
try {
  // 执行操作
} catch (error) {
  console.error('操作失败:', error)
  toast.error('操作失败')
}
```

---

## 🔄 页面导航

### 路由配置

**文件：** [src/router/index.js](../router/index.js)

```javascript
const routes = [
  {
    path: '/',
    redirect: '/music',
  },
  {
    path: '/music',
    name: 'MusicList',
    component: () => import('@/views/MusicList.vue'),
    meta: {
      title: '音乐列表',
    },
  },
  {
    path: '/favorites',
    name: 'FavoriteList',
    component: () => import('@/views/FavoriteList.vue'),
    meta: {
      title: '我的收藏',
    },
  },
]
```

### 导航方式

1. **通过 Header 组件**：点击顶部导航菜单
2. **编程式导航**：
   ```javascript
   import { useRouter } from 'vue-router'

   const router = useRouter()
   router.push('/music')
   router.push('/favorites')
   ```

---

## 📝 待优化项

- [ ] 添加音乐分类筛选功能
- [ ] 实现排序功能（最新、最热、播放最多）
- [ ] 添加批量操作（批量收藏、批量删除）
- [ ] 优化列表滚动性能（虚拟滚动）
- [ ] 添加页面过渡动画
- [ ] 实现下拉刷新和上拉加载更多
- [ ] 添加页面元信息（SEO 优化）

---

**生成时间：** 2026-01-29
