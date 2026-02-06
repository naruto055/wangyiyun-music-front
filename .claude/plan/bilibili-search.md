# 🎵 B站搜索功能前端对接规划文档

## 📋 项目概述

### 功能定位
为用户提供 B 站视频搜索能力，通过关键词搜索 B 站视频，并支持将搜索结果保存为音乐到系统音乐库。本功能作为视频解析功能的补充，增强用户获取音乐的便捷性。

### 核心价值
- **降低使用门槛**：用户无需复制链接，直接搜索即可
- **快速发现内容**：通过关键词快速定位目标音乐视频
- **智能历史记录**：自动记录搜索关键词，支持快速重复搜索
- **轻量化设计**：仅展示核心信息（标题、时长、BV号），专注音乐本身

---

## 🎯 功能需求分析

### 1. 核心功能模块

#### 1.1 B站视频搜索
- **输入**：关键词搜索（支持歌曲名、歌手名、BV号等）
- **输出**：搜索结果列表（标题、时长、BV号、视频链接）
- **分页**：支持分页浏览（默认10条/页）
- **防抖处理**：搜索输入防抖500ms，避免频繁请求
- **空状态**：无搜索结果时显示友好提示

#### 1.2 保存为音乐
- **触发**：点击搜索结果项的"保存为音乐"按钮
- **分类选择**：支持选择音乐分类（需获取后端分类列表）
- **加载状态**：保存过程3-10秒，显示加载动画和阶段提示
- **成功反馈**：保存成功后跳转到音乐列表，并定位到新添加的音乐
- **错误处理**：网络错误、文件过大、存储容量不足等异常提示

#### 1.3 搜索历史管理
- **查看历史**：展示最近10条搜索历史
- **快速搜索**：点击历史记录快速填充搜索框
- **清空历史**：支持一键清空所有历史记录
- **显示统计**：显示搜索次数和最后搜索时间

---

## 🏗️ 技术架构设计

### 2. API 接口层设计

#### 2.1 新建文件：`src/api/bilibili.js`

```javascript
/**
 * B站相关接口
 */
import request from '@/utils/request'

/**
 * 搜索B站视频
 * @param {Object} params - 搜索参数
 * @param {string} params.keyword - 搜索关键词
 * @param {number} params.page - 页码，默认 1
 * @param {number} params.pageSize - 每页大小，默认 10
 * @returns {Promise} 返回分页数据 { records, total, pages, current, size }
 */
export function searchBilibiliVideos(params) {
  return request({
    url: '/bilibili/search',
    method: 'post',
    data: params,
  })
}

/**
 * 从B站保存音乐
 * @param {Object} data - 保存参数
 * @param {string} data.bvid - B站视频BV号
 * @param {string} data.title - 标题
 * @param {number} data.categoryId - 分类ID
 * @returns {Promise} 返回音乐ID和音频URL { musicId, audioUrl }
 */
export function saveFromBilibili(data) {
  return request({
    url: '/music/from-bilibili',
    method: 'post',
    data,
  })
}

/**
 * 查询搜索历史
 * @param {Object} params - 查询参数
 * @param {number} params.page - 页码，默认 1
 * @param {number} params.pageSize - 每页大小，默认 10
 * @returns {Promise} 返回分页数据 { records, total, pages, current, size }
 */
export function getSearchHistory(params) {
  return request({
    url: '/bilibili/search/history',
    method: 'get',
    params,
  })
}

/**
 * 清空搜索历史
 * @returns {Promise}
 */
export function clearSearchHistory() {
  return request({
    url: '/bilibili/search/history',
    method: 'delete',
  })
}

/**
 * 获取音乐分类列表
 * @returns {Promise} 返回分类数组 [{ id, name }]
 */
export function getMusicCategories() {
  return request({
    url: '/category/list',
    method: 'get',
  })
}
```

**接口设计说明**：
- 遵循现有项目 API 封装规范
- 使用统一的 `request` 工具
- 添加完整的 JSDoc 注释
- 分页格式与 MusicList 保持一致

---

### 3. 状态管理设计（可选）

**方案选择**：考虑到B站搜索功能相对独立，建议**不新建单独的 Store**，直接在页面组件中管理状态。理由如下：

1. **状态局部化**：搜索结果仅在B站搜索页面使用，无需全局共享
2. **简化架构**：避免过度设计，减少状态管理复杂度
3. **参考现有模式**：视频解析页面（VideoParser.vue）也采用组件内状态管理

**状态定义**（在组件 `<script setup>` 中）：

```javascript
// 搜索参数
const searchParams = ref({
  keyword: '',
  page: 1,
  pageSize: 10,
})

// 搜索结果
const searchResults = ref([])
const total = ref(0)
const loading = ref(false)

// 搜索历史
const searchHistory = ref([])
const historyLoading = ref(false)

// 保存状态
const savingBvid = ref(null) // 当前正在保存的BV号
const saveStage = ref('')    // 保存阶段提示
```

**如需 Store 的替代方案**：
如果后续需要在其他页面复用搜索历史，可考虑新建 `src/stores/bilibili.js`，但当前阶段不建议过度设计。

---

### 4. UI/UX 设计方案

#### 4.1 页面布局设计

**新建页面**：`src/views/BilibiliSearch.vue`

**布局结构**：

```
┌─────────────────────────────────────────┐
│  Header 导航栏                           │
├─────────────────────────────────────────┤
│  【 B站音乐搜索 】                        │
│  ├── 搜索框（带搜索图标）                 │
│  └── 搜索历史标签（可点击）                │
├─────────────────────────────────────────┤
│  搜索结果列表                             │
│  ┌─────────────────────────────────┐   │
│  │ 标题：告白气球               [保存]│   │
│  │ 时长：4:12  |  BV号：BV1xxx        │   │
│  └─────────────────────────────────┘   │
│  ┌─────────────────────────────────┐   │
│  │ 标题：晴天                   [保存]│   │
│  │ 时长：4:30  |  BV号：BV1yyy        │   │
│  └─────────────────────────────────┘   │
├─────────────────────────────────────────┤
│  分页组件                                │
└─────────────────────────────────────────┘
```

#### 4.2 组件设计

**主组件**：`BilibiliSearch.vue`（页面组件）

**复用现有组件**：
- `Header` - 顶部导航
- `Input` - 搜索输入框
- `Button` - 搜索按钮、保存按钮
- `Card` - 搜索结果卡片
- `Pagination` - 分页组件
- `Skeleton` - 加载骨架屏
- `Dialog` - 分类选择对话框

**新建业务组件**：
- `BilibiliVideoItem.vue` - 单个搜索结果项（可选，也可直接在页面中实现）

#### 4.3 交互流程设计

**流程1：搜索流程**
```
用户输入关键词 → 防抖500ms → 调用搜索API
  → 显示加载骨架屏 → 渲染搜索结果
  → 自动记录搜索历史（后端自动）
```

**流程2：保存音乐流程**
```
点击"保存"按钮 → 弹出分类选择对话框
  → 选择分类并确认 → 调用保存API
  → 显示加载状态（3-10秒，阶段提示）
  → 保存成功 → 跳转到音乐列表
  → Toast提示 "保存成功，已添加到音乐库"
```

**流程3：搜索历史流程**
```
页面加载 → 获取搜索历史 → 显示标签列表
点击历史标签 → 填充搜索框 → 自动触发搜索
长按/右键 → 显示"清空历史"确认对话框
```

#### 4.4 加载状态处理

**搜索加载状态**：
- 骨架屏：显示10个占位卡片（参考 MusicList.vue）
- 加载文案：搜索框下方显示"搜索中..."

**保存加载状态**（参考 VideoParser.vue 的加载动画）：
```vue
<!-- 音乐波形动画 + 阶段提示 -->
<div class="loading-animation">
  <div class="wave-bars">
    <div v-for="i in 7" :key="i" class="bar"></div>
  </div>
  <p class="stage-text">{{ saveStage }}</p>
  <p class="sub-text">预计需要 10-60 秒，请稍候...</p>
</div>
```

**阶段提示轮播**：
```javascript
const saveStages = [
  '正在解析视频信息...',
  '提取音频流...',
  '处理音频数据...',
  '保存到音乐库...',
  '即将完成...'
]
```

#### 4.5 错误处理

**错误类型及处理**：

| 错误场景 | 提示内容 | 交互方式 |
|---------|---------|---------|
| 搜索失败 | "搜索失败，请检查网络连接" | Toast 错误提示 |
| 无搜索结果 | "未找到相关结果，换个关键词试试" | 空状态插画 + 文案 |
| 保存失败（网络） | "保存失败：网络连接异常" | Toast 错误提示 + 重试按钮 |
| 文件过大 | "保存失败：视频文件超过100MB" | Toast 错误提示 |
| 存储容量不足 | "保存失败：临时存储空间不足" | Toast 错误提示 |
| 已存在音乐 | "该音乐已存在于音乐库" | Toast 警告提示 |

#### 4.6 样式主题

**遵循现有设计**：
- **颜色**：主色调红色（`text-red-500`），与播放器主题一致
- **卡片样式**：白色背景、圆角、hover 悬浮效果
- **按钮样式**：复用 `Button` 组件的 `default`、`outline` 变体
- **间距**：`gap-4`、`p-4`，与 MusicList.vue 保持一致
- **响应式**：适配移动端（使用 Tailwind 响应式断点）

---

### 5. 组件开发计划

#### 5.1 核心组件列表

| 组件名称 | 文件路径 | 职责 | 优先级 |
|---------|---------|------|--------|
| **BilibiliSearch.vue** | `src/views/BilibiliSearch.vue` | B站搜索页面（主组件） | P0 |
| **CategorySelectDialog.vue** | `src/components/CategorySelectDialog.vue` | 音乐分类选择对话框 | P0 |
| **SearchHistoryBar.vue** | `src/components/SearchHistoryBar.vue`（可选） | 搜索历史标签栏 | P1 |

**说明**：
- **P0（必须）**：核心功能组件，必须实现
- **P1（可选）**：优化体验组件，可后续迭代

#### 5.2 组件详细设计

##### 5.2.1 BilibiliSearch.vue（页面组件）

**职责**：
- 搜索框和历史标签
- 搜索结果列表展示
- 分页控制
- 触发保存音乐流程

**核心代码结构**：

```vue
<template>
  <div class="min-h-screen bg-background">
    <Header />

    <main class="container mx-auto px-4 py-8">
      <!-- 页面标题 -->
      <h1 class="text-3xl font-bold mb-2">B站音乐搜索</h1>
      <p class="text-sm text-muted-foreground mb-8">搜索B站视频，一键保存到音乐库</p>

      <!-- 搜索框 -->
      <div class="mb-6">
        <div class="relative max-w-md">
          <Input
            v-model="searchParams.keyword"
            placeholder="输入歌曲名、歌手名..."
            @keydown.enter="handleSearch"
          />
          <Button class="absolute right-2 top-2" @click="handleSearch">
            搜索
          </Button>
        </div>
      </div>

      <!-- 搜索历史标签 -->
      <div v-if="searchHistory.length > 0" class="mb-8">
        <div class="flex items-center gap-2 mb-2">
          <span class="text-sm text-muted-foreground">搜索历史</span>
          <Button variant="ghost" size="sm" @click="handleClearHistory">
            清空
          </Button>
        </div>
        <div class="flex flex-wrap gap-2">
          <Button
            v-for="item in searchHistory"
            :key="item.id"
            variant="outline"
            size="sm"
            @click="handleHistoryClick(item.keyword)"
          >
            {{ item.keyword }} ({{ item.searchCount }})
          </Button>
        </div>
      </div>

      <!-- 加载状态 -->
      <div v-if="loading" class="space-y-4">
        <Skeleton v-for="i in 5" :key="i" class="h-20" />
      </div>

      <!-- 搜索结果列表 -->
      <div v-else-if="searchResults.length > 0" class="space-y-8">
        <div class="space-y-4">
          <Card
            v-for="video in searchResults"
            :key="video.bvid"
            class="p-4 hover:shadow-lg transition-all"
          >
            <div class="flex items-center justify-between">
              <div class="flex-1">
                <h3 class="text-lg font-semibold">{{ video.title }}</h3>
                <div class="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                  <span>时长：{{ formatDuration(video.duration) }}</span>
                  <span>BV号：{{ video.bvid }}</span>
                </div>
              </div>
              <Button
                @click="handleSave(video)"
                :disabled="savingBvid === video.bvid"
              >
                {{ savingBvid === video.bvid ? '保存中...' : '保存为音乐' }}
              </Button>
            </div>
          </Card>
        </div>

        <!-- 分页 -->
        <Pagination
          v-model:current-page="searchParams.page"
          :page-size="searchParams.pageSize"
          :total="total"
          @page-change="handlePageChange"
        />
      </div>

      <!-- 空状态 -->
      <div v-else class="py-20 text-center">
        <svg class="mx-auto h-24 w-24 text-muted-foreground"><!-- 图标 --></svg>
        <h3 class="mt-4 text-lg font-semibold">未找到相关结果</h3>
        <p class="mt-2 text-sm text-muted-foreground">换个关键词试试吧</p>
      </div>
    </main>

    <!-- 分类选择对话框 -->
    <CategorySelectDialog
      v-model:open="showCategoryDialog"
      @confirm="handleConfirmSave"
    />

    <!-- 保存加载对话框 -->
    <Dialog v-model:open="isSaving">
      <DialogContent>
        <!-- 波形动画 + 阶段提示 -->
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useDebounceFn } from '@/composables/useDebounce'
import { useToast } from '@/composables/useToast'
import {
  searchBilibiliVideos,
  saveFromBilibili,
  getSearchHistory,
  clearSearchHistory
} from '@/api/bilibili'

// ... 组件逻辑
</script>
```

##### 5.2.2 CategorySelectDialog.vue（分类选择对话框）

**职责**：
- 展示音乐分类列表（单选）
- 确认/取消操作

**Props**：
```javascript
{
  open: Boolean, // 是否显示
}
```

**Emits**：
```javascript
{
  'update:open': (value) => void,
  'confirm': (categoryId) => void,
}
```

**核心代码**：

```vue
<template>
  <Dialog v-model:open="localOpen">
    <DialogContent>
      <DialogTitle>选择音乐分类</DialogTitle>
      <DialogDescription>请为音乐选择一个分类</DialogDescription>

      <div class="space-y-2 mt-4">
        <div
          v-for="category in categories"
          :key="category.id"
          class="p-3 border rounded cursor-pointer hover:bg-muted"
          :class="{ 'border-red-500': selectedCategoryId === category.id }"
          @click="selectedCategoryId = category.id"
        >
          {{ category.name }}
        </div>
      </div>

      <div class="flex gap-2 mt-6">
        <Button variant="outline" @click="handleCancel">取消</Button>
        <Button @click="handleConfirm" :disabled="!selectedCategoryId">
          确认
        </Button>
      </div>
    </DialogContent>
  </Dialog>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { getMusicCategories } from '@/api/bilibili'

// ... 组件逻辑
</script>
```

---

### 6. 路由配置

#### 6.1 新增路由

**文件**：`src/router/index.js`

```javascript
{
  path: '/bilibili-search',
  name: 'BilibiliSearch',
  component: () => import('@/views/BilibiliSearch.vue'),
  meta: {
    title: 'B站音乐搜索',
  },
}
```

#### 6.2 导航菜单更新

**文件**：`src/components/layout/Header.vue`

在导航菜单中添加"B站搜索"入口：

```vue
<RouterLink to="/bilibili-search" class="nav-link">
  B站搜索
</RouterLink>
```

---

### 7. 技术细节实现

#### 7.1 防抖处理（搜索）

**使用 `useDebounceFn`**：

```javascript
import { useDebounceFn } from '@/composables/useDebounce'

const debouncedSearch = useDebounceFn(async (keyword) => {
  if (!keyword.trim()) return

  searchParams.value.keyword = keyword
  searchParams.value.page = 1 // 重置页码
  await fetchSearchResults()
}, 500)

// 监听输入变化
watch(() => searchParams.value.keyword, (newKeyword) => {
  debouncedSearch(newKeyword)
})
```

#### 7.2 长耗时操作处理（保存音乐）

**阶段提示轮播**：

```javascript
const saveStages = [
  '正在解析视频信息...',
  '提取音频流...',
  '处理音频数据...',
  '保存到音乐库...',
  '即将完成...'
]

let stageIndex = 0
const stageInterval = setInterval(() => {
  stageIndex = (stageIndex + 1) % saveStages.length
  saveStage.value = saveStages[stageIndex]
}, 5000)

try {
  const result = await saveFromBilibili({ bvid, title, categoryId })
  // 成功处理
} finally {
  clearInterval(stageInterval)
}
```

**超时提示**：

```javascript
const SAVE_TIMEOUT = 60000 // 60秒超时

const timeoutPromise = new Promise((_, reject) => {
  setTimeout(() => reject(new Error('操作超时，请重试')), SAVE_TIMEOUT)
})

try {
  const result = await Promise.race([
    saveFromBilibili({ bvid, title, categoryId }),
    timeoutPromise
  ])
} catch (error) {
  if (error.message === '操作超时，请重试') {
    toast.error('保存超时，请检查网络或稍后重试')
  }
}
```

#### 7.3 分页处理

**与 MusicList.vue 保持一致**：

```javascript
async function fetchSearchResults() {
  loading.value = true
  try {
    const response = await searchBilibiliVideos(searchParams.value)
    searchResults.value = response.records || []
    total.value = response.total || 0
  } catch (error) {
    console.error('搜索失败:', error)
    searchResults.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

function handlePageChange(page) {
  searchParams.value.page = page
  fetchSearchResults()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
```

#### 7.4 错误处理

**统一错误处理**：

```javascript
try {
  const result = await saveFromBilibili({ bvid, title, categoryId })

  toast.success('保存成功，已添加到音乐库')

  // 跳转到音乐列表并定位到新音乐
  router.push({
    path: '/music',
    query: { highlight: result.musicId }
  })
} catch (error) {
  console.error('保存失败:', error)

  // 根据错误类型显示不同提示
  if (error.message.includes('文件过大')) {
    toast.error('保存失败：视频文件超过100MB')
  } else if (error.message.includes('存储容量')) {
    toast.error('保存失败：临时存储空间不足')
  } else {
    toast.error('保存失败: ' + (error.message || '请稍后重试'))
  }
}
```

---

## 📋 实施步骤（按优先级排序）

### 阶段一：核心功能开发（P0）

| 任务 | 优先级 | 预估工时 | 验收标准 |
|------|--------|---------|---------|
| **1. API 接口层开发** | P0 | 1小时 | 接口封装完成，JSDoc注释完整 |
| **2. BilibiliSearch.vue 页面开发** | P0 | 3小时 | 搜索框、结果列表、分页功能正常 |
| **3. 防抖搜索实现** | P0 | 0.5小时 | 输入延迟500ms后触发搜索 |
| **4. CategorySelectDialog.vue 组件开发** | P0 | 1.5小时 | 分类列表展示、单选交互正常 |
| **5. 保存音乐功能实现** | P0 | 2小时 | 保存流程完整，加载状态显示 |
| **6. 路由配置** | P0 | 0.5小时 | 路由注册，导航菜单更新 |
| **7. 错误处理** | P0 | 1小时 | 各类错误场景提示友好 |

**小计**：9.5 小时

### 阶段二：体验优化（P1）

| 任务 | 优先级 | 预估工时 | 验收标准 |
|------|--------|---------|---------|
| **8. 搜索历史功能** | P1 | 2小时 | 历史列表显示、快速搜索、清空功能 |
| **9. 加载动画优化** | P1 | 1小时 | 波形动画、阶段提示轮播 |
| **10. 空状态优化** | P1 | 0.5小时 | 插画图标、引导文案 |
| **11. 响应式适配** | P1 | 1小时 | 移动端、平板布局适配 |
| **12. 保存成功跳转优化** | P1 | 1小时 | 跳转到音乐列表并高亮新音乐 |

**小计**：5.5 小时

### 阶段三：测试与文档（P2）

| 任务 | 优先级 | 预估工时 | 验收标准 |
|------|--------|---------|---------|
| **13. 功能测试** | P2 | 2小时 | 核心流程无bug，边界情况处理完善 |
| **14. 性能优化** | P2 | 1小时 | 搜索响应<1秒，保存响应<60秒 |
| **15. 模块文档编写** | P2 | 1小时 | 更新 CLAUDE.md，补充API文档 |

**小计**：4 小时

**总工时估算**：19 小时（约 2.5 个工作日）

---

## ✅ 验收标准

### 功能验收

- [ ] **搜索功能**：输入关键词后能正常搜索并展示结果
- [ ] **分页功能**：分页切换正常，总数显示正确
- [ ] **防抖处理**：输入停止500ms后才触发搜索
- [ ] **保存音乐**：能正确选择分类并保存到音乐库
- [ ] **加载状态**：搜索和保存过程中显示加载动画
- [ ] **错误处理**：网络错误、文件过大等场景有友好提示
- [ ] **搜索历史**：能查看历史、快速搜索、清空历史
- [ ] **路由跳转**：保存成功后跳转到音乐列表

### 性能验收

- [ ] **搜索响应时间** < 1秒（正常网络）
- [ ] **保存响应时间** < 60秒（正常网络）
- [ ] **防抖延迟** = 500ms
- [ ] **页面加载时间** < 2秒

### UI/UX 验收

- [ ] **样式一致性**：与现有页面风格统一
- [ ] **响应式设计**：移动端、平板、桌面端均正常显示
- [ ] **交互流畅性**：无卡顿、闪烁现象
- [ ] **空状态友好**：无结果时显示引导文案

### 代码质量验收

- [ ] **代码规范**：遵循 Prettier 配置，无格式问题
- [ ] **注释完整**：关键函数有 JSDoc 注释
- [ ] **错误日志**：错误场景有 console.error 记录
- [ ] **命名规范**：组件、函数、变量命名清晰

---

## 🔮 后续优化方向

### 功能增强
1. **高级搜索**：支持按时长、上传时间筛选
2. **批量保存**：支持勾选多个视频批量保存
3. **预览播放**：保存前支持在线预览音频
4. **标签系统**：为保存的音乐自动添加标签（如"翻唱"、"纯音乐"）

### 性能优化
1. **虚拟滚动**：搜索结果列表使用虚拟滚动（当结果超过100条时）
2. **图片懒加载**：封面图片使用懒加载（如需显示封面）
3. **缓存策略**：搜索结果缓存5分钟，减少重复请求

### 体验优化
1. **搜索建议**：输入时显示热门搜索词
2. **搜索联想**：根据输入实时显示联想词
3. **保存历史**：记录已保存的音乐，避免重复保存
4. **快捷操作**：支持键盘快捷键（Enter搜索、Esc关闭对话框）

---

## 📌 注意事项

### 开发注意事项

1. **防抖延迟调整**：如用户反馈响应慢，可将防抖时间调整为300ms
2. **保存超时时间**：建议设置60秒超时，避免长时间等待
3. **分类数据缓存**：分类列表可缓存到 localStorage，减少重复请求
4. **音乐库同步**：保存成功后建议刷新音乐列表 Store，确保数据同步

### 后端依赖

1. **分类接口**：需确认后端是否提供 `/api/category/list` 接口
2. **搜索历史自动记录**：后端会自动记录搜索历史，前端无需手动调用
3. **保存去重**：后端需检查音乐是否已存在，避免重复保存
4. **错误码规范**：确认后端错误码定义，便于前端精准处理

### 用户体验

1. **搜索提示**：建议在搜索框下方添加搜索示例（如"周杰伦 告白气球"）
2. **保存确认**：保存前显示视频标题，避免误操作
3. **进度反馈**：保存过程中显示阶段提示，降低用户焦虑
4. **快速退出**：保存中支持取消操作（如后端支持）

---

## 📄 关键文件清单

### 新建文件

| 文件路径 | 说明 | 优先级 |
|---------|------|--------|
| `src/api/bilibili.js` | B站接口封装 | P0 |
| `src/views/BilibiliSearch.vue` | B站搜索页面 | P0 |
| `src/components/CategorySelectDialog.vue` | 分类选择对话框 | P0 |

### 修改文件

| 文件路径 | 修改内容 | 优先级 |
|---------|---------|--------|
| `src/router/index.js` | 新增 `/bilibili-search` 路由 | P0 |
| `src/components/layout/Header.vue` | 新增"B站搜索"导航入口 | P0 |
| `src/api/CLAUDE.md` | 补充 B站接口文档 | P2 |
| `CLAUDE.md` | 更新功能模块清单 | P2 |

---

## 🎯 总结

本规划文档详细定义了B站搜索功能的设计方案，包括：

✅ **功能模块设计**：明确搜索、保存、历史管理三大核心功能
✅ **API 接口层**：完整的接口封装和 JSDoc 注释
✅ **UI/UX 方案**：轻量化设计，专注音乐本身，无冗余信息
✅ **组件开发计划**：2个核心组件，复用现有 UI 组件库
✅ **状态管理方案**：采用组件内状态管理，避免过度设计
✅ **技术细节**：防抖、分页、长耗时操作、错误处理全覆盖
✅ **实施步骤**：按优先级分3个阶段，总工时约19小时

**设计理念**：
- **轻量化**：仅展示标题、时长、BV号，专注音乐本身
- **一致性**：复用现有组件和设计模式，保持系统统一
- **易用性**：搜索历史、防抖处理、友好提示，提升用户体验
- **可扩展**：预留优化空间（批量保存、预览播放、高级筛选）

---

**关键文件清单**：

根据本规划，以下是实施此功能最关键的3-5个文件：

- **d:\JavaCodeStudy\wangyiyun-music-front\src\api\bilibili.js** - **[需新建]** B站接口封装层，定义所有后端交互接口
- **d:\JavaCodeStudy\wangyiyun-music-front\src\views\BilibiliSearch.vue** - **[需新建]** B站搜索主页面，包含搜索框、结果列表、分页等核心UI
- **d:\JavaCodeStudy\wangyiyun-music-front\src\components\CategorySelectDialog.vue** - **[需新建]** 音乐分类选择对话框，保存音乐时使用
- **d:\JavaCodeStudy\wangyiyun-music-front\src\router\index.js** - **[需修改]** 添加 `/bilibili-search` 路由配置
- **d:\JavaCodeStudy\wangyiyun-music-front\src\components\layout\Header.vue** - **[需修改]** 在导航菜单中添加"B站搜索"入口

---

**规划文档版本**: v1.0
**生成时间**: 2026-02-05
**预计工时**: 19 小时（2.5 个工作日）
**状态**: ✅ 规划完成，待执行
