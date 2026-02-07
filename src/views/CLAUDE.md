# 页面视图模块 (Views)

> **导航：** [项目根目录](../../CLAUDE.md) > [src](../CLAUDE.md) > views
>
> **最后更新：** 2026-02-07
> **文件数量：** 5 个
> **职责：** 应用页面视图、路由对应组件

---

## 📋 模块概览

页面视图模块包含应用的所有主要页面，每个路由对应一个视图组件。

### 页面列表

| 页面 | 路由 | 功能 | 状态 |
|------|------|------|------|
| [MusicList](#1-musiclistvue-音乐列表页) | `/music` | 音乐浏览、搜索、播放、收藏 | ✅ 完成 |
| [FavoriteList](#2-favoritelistvue-收藏列表页) | `/favorites` | 收藏列表、播放、取消收藏 | ✅ 完成 |
| [VideoParser](#3-videoparservue-视频解析页) | `/video-parser` | B 站视频解析并提取音频 | ✅ 完成 |
| [AlbumList](#4-albumlistvue-专辑列表页) | `/albums` | 专辑浏览、创建、编辑、删除 | 🚧 新增 |
| [BilibiliSearch](#5-bibilisearchvue-b站音乐搜索页) | `/bilibili-search` | B 站音乐视频搜索、保存 | 🚧 新增 |

---

## 🏗️ 视图结构

```
src/views/
├── MusicList.vue        # 音乐列表页
├── FavoriteList.vue     # 收藏列表页
├── VideoParser.vue      # 视频解析页
├── AlbumList.vue        # 专辑列表页（NEW）
└── BilibiliSearch.vue   # B站音乐搜索页（NEW）
```

---

## 1. MusicList.vue (音乐列表页)

**路由：** `/music`

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

## 2. FavoriteList.vue (收藏列表页)

**路由：** `/favorites`

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

## 3. VideoParser.vue (视频解析页)

**路由：** `/video-parser`

### 功能特性

1. **视频链接解析**
   - 支持 B 站视频链接输入
   - 支持 BV 号输入
   - 支持分享文本粘贴

2. **音频提取**
   - 提取视频音频流
   - 转换为 MP3 格式
   - 显示文件大小和时长

3. **在线播放**
   - 提取完成后直接播放
   - 集成播放器控制

4. **下载功能**
   - 下载提取的音频文件
   - 1 小时有效期提示

### 状态管理

使用的 Store：

- `playerStore` - 播放器状态

### 核心逻辑

#### 视频解析逻辑

```javascript
import { parseVideo } from '@/api/video'
import { adaptVideoToTrack } from '@/utils/trackAdapter'

async function handleParse() {
  try {
    loading.value = true
    const result = await parseVideo(videoUrl.value)

    // 转换为音轨对象
    const track = adaptVideoToTrack(result)

    // 显示结果
    parsedVideo.value = result
    toast.success('解析成功')
  } catch (error) {
    toast.error('解析失败: ' + error.message)
  } finally {
    loading.value = false
  }
}
```

#### 播放逻辑

```javascript
function handlePlay(video) {
  const track = adaptVideoToTrack(video)
  playerStore.playTrack(track)
  toast.success('已添加到播放器')
}
```

### UI 布局

```
┌─────────────────────────────────────┐
│  视频解析                            │
├─────────────────────────────────────┤
│  ┌───────────────────────────────┐  │
│  │ 输入框：视频链接或 BV 号      │  │
│  │ [解析] 按钮                   │  │
│  └───────────────────────────────┘  │
│                                     │
│  支持平台：B站 / YouTube / 抖音     │
│                                     │
│  ┌───────────────────────────────┐  │
│  │ 解析结果：                     │  │
│  │ - 标题                         │  │
│  │ - 封面                         │  │
│  │ - 时长 / 文件大小              │  │
│  │ - 有效期：1 小时后过期         │  │
│  │ [播放] [下载] 按钮             │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

---

## 4. AlbumList.vue (专辑列表页)

**路由：** `/albums`
**状态：** 🚧 新增页面

### 功能特性

1. **专辑浏览**
   - 响应式网格展示专辑卡片
   - 专辑封面、标题、歌手、发行日期
   - 分页支持

2. **排序功能**
   - 发行日期降序（默认）
   - 发行日期升序
   - 创建时间降序
   - 创建时间升序

3. **专辑创建**
   - 点击"创建专辑"按钮
   - 打开专辑表单对话框
   - 输入专辑信息并保存

4. **专辑详情**
   - 点击专辑卡片查看详情
   - 显示专辑完整信息
   - 查看专辑内音乐列表

5. **专辑编辑**
   - 编辑专辑信息
   - 更新专辑封面
   - 修改专辑元数据

6. **专辑删除**
   - 删除确认提示
   - 级联删除专辑内音乐

7. **空状态处理**
   - 无专辑时显示空状态提示
   - 引导创建第一个专辑

### 状态管理

使用的 Store：

- `albumStore` - 专辑列表状态（假设存在）

### 核心逻辑

#### 排序逻辑

```javascript
const sortOption = ref('release_date_desc')

function handleSortChange() {
  // 根据排序选项更新列表
  albumStore.setSortOption(sortOption.value)
  albumStore.fetchAlbumList()
}
```

#### 创建专辑逻辑

```javascript
function handleCreateAlbum() {
  formMode.value = 'create'
  showFormDialog.value = true
}

function handleFormSuccess() {
  // 刷新列表
  albumStore.fetchAlbumList()
  showFormDialog.value = false
}
```

#### 专辑详情逻辑

```javascript
function handleAlbumClick(albumId) {
  selectedAlbumId.value = albumId
  showDetailDialog.value = true
}
```

### UI 布局

```
┌─────────────────────────────────────┐
│  [排序下拉框] [创建专辑] 按钮       │
├─────────────────────────────────────┤
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐   │
│  │专辑 │ │专辑 │ │专辑 │ │专辑 │   │
│  │卡片 │ │卡片 │ │卡片 │ │卡片 │   │
│  └─────┘ └─────┘ └─────┘ └─────┘   │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐   │
│  │专辑 │ │专辑 │ │专辑 │ │专辑 │   │
│  │卡片 │ │卡片 │ │卡片 │ │卡片 │   │
│  └─────┘ └─────┘ └─────┘ └─────┘   │
├─────────────────────────────────────┤
│         分页组件                     │
└─────────────────────────────────────┘

或（空状态）
┌─────────────────────────────────────┐
│  [排序下拉框] [创建专辑] 按钮       │
├─────────────────────────────────────┤
│                                     │
│         💿 暂无专辑数据             │
│     点击上方按钮创建第一个专辑吧     │
│         [创建专辑] 按钮             │
│                                     │
└─────────────────────────────────────┘
```

---

## 5. BilibiliSearch.vue (B站音乐搜索页)

**路由：** `/bilibili-search`
**状态：** 🚧 新增页面

### 功能特性

1. **关键词搜索**
   - 支持歌曲名、歌手名搜索
   - 支持 BV 号精确搜索
   - 实时搜索结果展示

2. **搜索历史**
   - 记录搜索关键词
   - 显示搜索次数
   - 快速点击重新搜索
   - 清空搜索历史

3. **视频卡片展示**
   - 视频封面、标题、UP 主
   - 播放量、时长、发布时间
   - 响应式网格布局

4. **保存为音乐**
   - 点击"保存"按钮
   - 解析视频并提取音频
   - 保存到音乐库

5. **在线播放**
   - 点击"播放"按钮
   - 解析视频并添加到播放器
   - 无需保存即可播放

6. **查看详情**
   - 点击视频标题跳转 B 站
   - 查看视频完整信息

7. **加载状态**
   - 骨架屏加载占位
   - 搜索中提示

8. **空状态处理**
   - 未搜索时显示引导
   - 无结果时显示提示

### 状态管理

使用的 Store：

- `bilibiliSearchStore` - B 站搜索状态（假设存在）
- `playerStore` - 播放器状态

### 核心逻辑

#### 搜索逻辑

```javascript
const searchKeyword = ref('')
const searchHistory = ref([])

async function handleSearch() {
  if (!searchKeyword.value.trim()) return

  try {
    loading.value = true
    const results = await bilibiliSearchStore.search(searchKeyword.value)

    // 添加到搜索历史
    addToHistory(searchKeyword.value)

    searchResults.value = results
    hasSearched.value = true
  } catch (error) {
    toast.error('搜索失败')
  } finally {
    loading.value = false
  }
}
```

#### 搜索历史逻辑

```javascript
function addToHistory(keyword) {
  const existingItem = searchHistory.value.find(item => item.keyword === keyword)
  if (existingItem) {
    existingItem.searchCount++
  } else {
    searchHistory.value.unshift({
      id: Date.now(),
      keyword,
      searchCount: 1
    })
  }
  // 限制历史记录数量
  if (searchHistory.value.length > 10) {
    searchHistory.value.pop()
  }
}

function handleHistoryClick(keyword) {
  searchKeyword.value = keyword
  handleSearch()
}

function handleClearHistory() {
  searchHistory.value = []
}
```

#### 保存为音乐逻辑

```javascript
async function handleSaveAsMusic(video) {
  try {
    loading.value = true
    // 1. 解析视频提取音频
    const audioResult = await parseVideo(video.url)

    // 2. 保存到音乐库
    await saveToMusicLibrary({
      title: video.title,
      audioUrl: audioResult.audioUrl,
      coverUrl: video.cover,
      duration: video.duration,
      platform: 'BILIBILI',
      sourceVideoId: video.bvid
    })

    toast.success('保存成功')
  } catch (error) {
    toast.error('保存失败')
  } finally {
    loading.value = false
  }
}
```

#### 播放逻辑

```javascript
async function handlePlay(video) {
  try {
    loading.value = true
    // 解析视频提取音频
    const audioResult = await parseVideo(video.url)

    // 转换为音轨对象并播放
    const track = adaptVideoToTrack(audioResult)
    playerStore.playTrack(track)

    toast.success('已添加到播放器')
  } catch (error) {
    toast.error('播放失败')
  } finally {
    loading.value = false
  }
}
```

### UI 布局

```
┌─────────────────────────────────────┐
│  B站音乐搜索                         │
│  搜索 B 站视频并保存为音乐           │
├─────────────────────────────────────┤
│  ┌───────────────────────────────┐  │
│  │ 🔍 [搜索框]      [搜索] 按钮  │  │
│  └───────────────────────────────┘  │
│                                     │
│  搜索历史：                         │
│  [周杰伦 (3)] [晴天 (2)] [清空]    │
├─────────────────────────────────────┤
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐   │
│  │视频 │ │视频 │ │视频 │ │视频 │   │
│  │卡片 │ │卡片 │ │卡片 │ │卡片 │   │
│  │ [保存] │ [播放] │              │
│  └─────┘ └─────┘ └─────┘ └─────┘   │
└─────────────────────────────────────┘

或（未搜索）
┌─────────────────────────────────────┐
│  🔍 输入关键词或 BV 号开始搜索       │
│  例如：周杰伦、晴天、BV1xxx          │
└─────────────────────────────────────┘

或（无结果）
┌─────────────────────────────────────┐
│  🎵 未找到相关视频                  │
│  换个关键词试试，或者尝试输入 BV 号  │
└─────────────────────────────────────┘
```

---

## 🎨 共同特性

### 1. 响应式设计

所有页面都采用响应式网格布局：

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

### 4. 空状态处理

所有列表页面都有空状态提示：

```vue
<div v-if="list.length === 0" class="empty-state">
  <!-- 空状态图标和文案 -->
</div>
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
		meta: { title: '音乐列表' },
	},
	{
		path: '/favorites',
		name: 'FavoriteList',
		component: () => import('@/views/FavoriteList.vue'),
		meta: { title: '我的收藏' },
	},
	{
		path: '/albums',
		name: 'AlbumList',
		component: () => import('@/views/AlbumList.vue'),
		meta: { title: '专辑列表' },
	},
	{
		path: '/video-parser',
		name: 'VideoParser',
		component: () => import('@/views/VideoParser.vue'),
		meta: { title: '视频解析' },
	},
	{
		path: '/bilibili-search',
		name: 'BilibiliSearch',
		component: () => import('@/views/BilibiliSearch.vue'),
		meta: { title: 'B站音乐搜索' },
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
   router.push('/albums')
   router.push('/video-parser')
   router.push('/bilibili-search')
   ```

---

## 📝 待办事项

### 已完成页面

- [x] MusicList - 音乐列表页
- [x] FavoriteList - 收藏列表页
- [x] VideoParser - 视频解析页

### 新增页面待完善

- [ ] AlbumList - 专辑列表页
  - [ ] 实现 `albumStore` 状态管理
  - [ ] 完善专辑创建功能
  - [ ] 完善专辑编辑功能
  - [ ] 完善专辑删除功能
  - [ ] 添加单元测试

- [ ] BilibiliSearch - B站音乐搜索页
  - [ ] 实现 `bilibiliSearchStore` 状态管理
  - [ ] 实现 B 站搜索 API 对接
  - [ ] 完善搜索历史持久化（localStorage）
  - [ ] 完善保存为音乐功能
  - [ ] 添加单元测试

### 通用待优化项

- [ ] 添加音乐分类筛选功能
- [ ] 实现排序功能（最新、最热、播放最多）
- [ ] 添加批量操作（批量收藏、批量删除）
- [ ] 优化列表滚动性能（虚拟滚动）
- [ ] 添加页面过渡动画
- [ ] 实现下拉刷新和上拉加载更多
- [ ] 添加页面元信息（SEO 优化）
- [ ] 完善错误边界处理
- [ ] 添加 E2E 测试

---

## 🔗 相关文档

| 文档 | 说明 |
|------|------|
| [项目根文档](../../CLAUDE.md) | 项目完整架构和模块索引 |
| [Router 模块](../router/CLAUDE.md) | 路由配置文档 |
| [Stores 模块](../stores/CLAUDE.md) | 状态管理文档 |
| [API 模块](../api/CLAUDE.md) | API 接口层文档 |
| [Components 模块](../components/CLAUDE.md) | UI 组件文档 |

---

**最后更新：** 2026-02-07 00:05:33
**文档版本：** 2.0.0
**维护者：** AI 自动生成
