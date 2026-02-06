# 组件文档

[🏠 返回根目录](../CLAUDE.md)

> **模块路径：** `src/components/`
> **最后更新：** 2026-01-29

---

## 📋 概述

组件层按照功能和职责分为布局组件、业务组件和 UI 组件库。

---

## 🏗️ 组件结构

```
src/components/
├── layout/              # 布局组件
│   ├── Header.vue       # 顶部导航栏
│   └── index.js
├── player/              # 播放器组件
│   ├── PlayerBar.vue           # 播放器底栏
│   ├── PlayerControls.vue      # 播放控制器
│   ├── PlayerInfo.vue          # 歌曲信息
│   ├── PlayerProgress.vue      # 进度条
│   ├── PlayerVolume.vue        # 音量控制
│   └── PlayerPlaylist.vue      # 播放列表
├── ui/                  # UI 组件库
│   ├── button/
│   ├── card/
│   ├── input/
│   ├── dialog/
│   ├── pagination/
│   ├── skeleton/
│   └── toast/
├── MusicCard.vue        # 音乐卡片
└── MusicDetailDialog.vue # 音乐详情弹窗
```

---

## 🎨 布局组件

### Header.vue

**路径：** [layout/Header.vue](./layout/Header.vue)

**功能：**

- 显示应用标题
- 导航菜单（音乐列表、我的收藏）
- 路由切换

**使用示例：**

```vue
<template>
	<Header />
</template>
```

---

## 🎵 播放器组件

### PlayerBar.vue

**路径：** [player/PlayerBar.vue](./player/PlayerBar.vue)

**功能：**

- 显示当前播放歌曲信息
- 播放控制按钮（播放/暂停、上一曲、下一曲）
- 进度条显示和控制
- 音量控制
- 播放列表展开/收起
- 播放模式切换

**使用：**
已在 `App.vue` 中全局注册，无需手动引入。

### PlayerControls.vue

**路径：** [player/PlayerControls.vue](./player/PlayerControls.vue)

**功能：**

- 播放/暂停按钮
- 上一曲/下一曲按钮
- 播放模式切换按钮（顺序/随机/单曲循环）

**Props：** 无

**Emits：** 无

**状态：** 直接从 `playerStore` 读取

### PlayerInfo.vue

**路径：** [player/PlayerInfo.vue](./player/PlayerInfo.vue)

**功能：**

- 显示当前播放歌曲封面
- 显示歌曲名称
- 显示歌手名称
- 点击展开播放列表

### PlayerProgress.vue

**路径：** [player/PlayerProgress.vue](./player/PlayerProgress.vue)

**功能：**

- 显示播放进度条
- 拖动进度条跳转播放时间
- 显示当前时间和总时长

**交互：**

- 点击进度条跳转到指定位置
- 拖动滑块实时更新播放时间

### PlayerVolume.vue

**路径：** [player/PlayerVolume.vue](./player/PlayerVolume.vue)

**功能：**

- 音量滑块控制
- 静音切换
- 音量图标显示

### PlayerPlaylist.vue

**路径：** [player/PlayerPlaylist.vue](./player/PlayerPlaylist.vue)

**功能：**

- 显示播放列表
- 切换播放歌曲
- 移除歌曲
- 清空播放列表

**交互：**

- 点击歌曲切换播放
- 点击删除按钮移除歌曲
- 点击清空按钮清空列表

---

## 🎴 业务组件

### MusicCard.vue

**路径：** [MusicCard.vue](./MusicCard.vue)

**功能：**

- 显示音乐封面、标题、歌手
- 播放按钮
- 收藏按钮
- 点击查看详情

**Props：**

```javascript
{
  music: {
    type: Object,
    required: true
  }
}
```

**事件：**

- `play` - 点击播放按钮
- `toggle-favorite` - 点击收藏按钮

**使用示例：**

```vue
<template>
	<MusicCard :music="music" @play="handlePlay" @toggle-favorite="handleToggleFavorite" />
</template>
```

### MusicDetailDialog.vue

**路径：** [MusicDetailDialog.vue](./MusicDetailDialog.vue)

**功能：**

- 显示音乐详细信息
- 播放控制
- 收藏控制

**Props：**

```javascript
{
  music: {
    type: Object,
    required: true
  },
  show: {
    type: Boolean,
    default: false
  }
}
```

**事件：**

- `update:show` - 更新显示状态
- `play` - 播放音乐
- `toggle-favorite` - 切换收藏

---

## 🧩 UI 组件库

基于 **Radix Vue** 和 **Tailwind CSS** 构建的无障碍 UI 组件。

### Button 组件

**路径：** [ui/button/Button.vue](./ui/button/Button.vue)

**功能：** 基础按钮组件，支持多种变体和尺寸。

**变体：**

- `default` - 默认样式
- `destructive` - 危险操作
- `outline` - 轮廓样式
- `secondary` - 次要按钮
- `ghost` - 幽灵按钮
- `link` - 链接样式

**尺寸：**

- `default` - 默认
- `sm` - 小
- `lg` - 大
- `icon` - 图标按钮

**使用示例：**

```vue
<Button variant="default">默认按钮</Button>
<Button variant="destructive">删除</Button>
<Button variant="outline" size="sm">小按钮</Button>
<Button variant="ghost" size="icon">
  <Icon name="search" />
</Button>
```

### Card 组件

**路径：** [ui/card/](./ui/card/)

**组件：**

- `Card` - 容器
- `CardHeader` - 头部
- `CardTitle` - 标题
- `CardDescription` - 描述
- `CardContent` - 内容
- `CardFooter` - 底部

**使用示例：**

```vue
<Card>
  <CardHeader>
    <CardTitle>标题</CardTitle>
    <CardDescription>描述信息</CardDescription>
  </CardHeader>
  <CardContent>
    内容区域
  </CardContent>
  <CardFooter>
    <Button>操作</Button>
  </CardFooter>
</Card>
```

### Input 组件

**路径：** [ui/input/Input.vue](./ui/input/Input.vue)

**功能：** 文本输入框

**Props：**

```javascript
{
  modelValue: String,
  type: {
    type: String,
    default: 'text'
  },
  placeholder: String,
  disabled: Boolean
}
```

### Dialog 组件

**路径：** [ui/dialog/Dialog.vue](./ui/dialog/Dialog.vue)

**功能：** 模态对话框

**组件：**

- `DialogRoot` - 对话框容器
- `DialogTrigger` - 触发器
- `DialogPortal` - 传送门
- `DialogOverlay` - 遮罩层
- `DialogContent` - 内容区域
- `DialogTitle` - 标题
- `DialogDescription` - 描述
- `DialogClose` - 关闭按钮

### Pagination 组件

**路径：** [ui/pagination/Pagination.vue](./ui/pagination/Pagination.vue)

**功能：** 分页组件

**Props：**

```javascript
{
  currentPage: Number,
  totalPages: Number,
  onPageChange: Function
}
```

### Skeleton 组件

**路径：** [ui/skeleton/Skeleton.vue](./ui/skeleton/Skeleton.vue)

**功能：** 骨架屏加载占位符

### Toast 组件

**路径：** [ui/toast/](./ui/toast/)

**组件：**

- `ToastContainer` - Toast 容器（已在 `App.vue` 中注册）
- `Toast` - 单个 Toast 组件

**类型：**

- `success` - 成功
- `error` - 错误
- `info` - 信息
- `warning` - 警告

---

## 💡 使用建议

### 1. UI 组件库使用

- **优先使用 UI 组件**：确保样式一致性
- **遵循设计规范**：不要随意修改组件样式
- **组合使用**：Card 组件建议组合使用其子组件

### 2. 播放器组件使用

- **全局单例**：播放器已在 `App.vue` 中全局注册，无需重复引入
- **状态管理**：播放器状态统一由 `playerStore` 管理
- **音频播放**：使用 `useAudioPlayer` composable 处理音频操作

### 3. 业务组件使用

- **Props 验证**：确保传入正确的 props
- **事件处理**：监听组件事件并处理业务逻辑

---

## 📝 待优化项

- [ ] 添加更多 UI 组件（Select, Checkbox, Radio, Switch 等）
- [ ] 组件单元测试
- [ ] 组件 Storybook 文档
- [ ] 优化组件性能（懒加载、虚拟滚动）
- [ ] 添加组件类型定义（TypeScript）

---

**生成时间：** 2026-01-29
