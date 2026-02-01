# Requirements Document - 专辑管理功能 (Album CRUD)

## Introduction

### 功能概述
为网易云音乐前端应用添加完整的专辑管理功能,包括专辑列表浏览、详情查看、创建、编辑和删除操作。此功能将与后端已实现的专辑 CRUD API 对接,为用户提供便捷的专辑管理体验。

### 功能价值
- **用户价值**: 用户可以浏览和管理专辑信息,更好地组织和分类音乐内容
- **业务价值**: 完善音乐管理体系,提升内容组织效率
- **技术价值**: 展示 Vue 3 + Pinia + Tailwind CSS 技术栈的最佳实践

### 后端对接说明
后端已完成专辑 CRUD 功能实现,提供以下 API 接口:
- **后端项目路径**: `D:\JavaCodeStudy\wangyiyun-music`
- **后端规划文档**: `D:\JavaCodeStudy\wangyiyun-music\.zcf\plan\history\20260201-专辑功能CRUD.md`
- **API Base URL**: `http://localhost:8910/api/album`
- **响应格式**: `{ code: 200, message: '操作成功', data: {...} }`

## Alignment with Product Vision

### 与现有功能的一致性
本功能遵循项目现有的架构模式和设计规范:
- **架构一致性**: 采用三层架构 (Views → Stores → API → Backend)
- **UI 一致性**: 使用项目现有的 UI 组件库 (Radix Vue + Tailwind CSS)
- **交互一致性**: 参考现有的音乐列表和收藏列表功能模式
- **代码规范**: 遵循项目的 Prettier 配置和 Vue 3 Composition API 最佳实践

### 技术栈对齐
- Vue 3.5.24 (Composition API)
- Pinia 2.3.1 (状态管理)
- Vue Router 4.6.4 (路由)
- Tailwind CSS 4.1.18 (样式)
- Axios 1.13.3 (HTTP 客户端)

---

## Requirements

### Requirement 1: 专辑列表浏览

**User Story**: 作为用户,我希望能够浏览专辑列表,以便了解系统中的所有专辑信息

#### Acceptance Criteria

1. **WHEN** 用户访问 `/albums` 路径 **THEN** 系统 **SHALL** 显示专辑列表页面,默认展示第一页的 12 个专辑
2. **WHEN** 专辑列表加载中 **THEN** 系统 **SHALL** 显示骨架屏占位符,提供良好的加载体验
3. **WHEN** 专辑列表加载成功 **THEN** 系统 **SHALL** 以卡片形式展示每个专辑的以下信息:
   - 专辑封面图 (coverUrl,默认占位图)
   - 专辑名称 (name)
   - 发行日期 (releaseDate,格式: YYYY-MM-DD)
   - 创建时间 (createTime,格式: YYYY-MM-DD HH:mm)
4. **WHEN** 专辑列表加载失败 **THEN** 系统 **SHALL** 显示错误提示 Toast 消息,并提供重试按钮
5. **WHEN** 专辑列表为空 **THEN** 系统 **SHALL** 显示 "暂无专辑数据" 的空状态提示,并引导用户创建专辑
6. **IF** 总记录数超过 12 条 **THEN** 系统 **SHALL** 在列表底部显示分页组件
7. **WHEN** 用户点击分页按钮 **THEN** 系统 **SHALL** 加载对应页码的专辑数据,并滚动到页面顶部

---

### Requirement 2: 专辑排序功能

**User Story**: 作为用户,我希望能够对专辑列表进行排序,以便按照不同维度浏览专辑

#### Acceptance Criteria

1. **WHEN** 用户点击排序下拉框 **THEN** 系统 **SHALL** 显示以下排序选项:
   - 发行日期降序 (默认)
   - 发行日期升序
   - 创建时间降序
   - 创建时间升序
2. **WHEN** 用户选择排序方式 **THEN** 系统 **SHALL** 重新请求数据并应用排序规则
3. **WHEN** 排序规则变更 **THEN** 系统 **SHALL** 重置页码为第 1 页
4. **WHEN** 排序请求成功 **THEN** 系统 **SHALL** 保存用户的排序偏好到 Store,刷新页面后保持

---

### Requirement 3: 查看专辑详情

**User Story**: 作为用户,我希望能够查看专辑的详细信息,以便了解专辑的完整内容

#### Acceptance Criteria

1. **WHEN** 用户点击专辑卡片 **THEN** 系统 **SHALL** 打开专辑详情对话框 (Dialog)
2. **WHEN** 详情对话框打开 **THEN** 系统 **SHALL** 调用后端 API `GET /api/album/{id}` 获取专辑详情
3. **WHEN** 详情数据加载中 **THEN** 系统 **SHALL** 显示骨架屏占位符
4. **WHEN** 详情数据加载成功 **THEN** 系统 **SHALL** 显示以下信息:
   - 专辑封面图 (coverUrl,大图展示)
   - 专辑名称 (name)
   - 专辑简介 (description,支持多行文本)
   - 发行日期 (releaseDate,格式化显示)
   - 创建时间 (createTime,格式化显示)
   - 更新时间 (updateTime,格式化显示)
   - 歌曲数量 (musicCount,显示 "X 首歌曲")
5. **WHEN** 详情加载失败 **THEN** 系统 **SHALL** 显示错误提示,并提供重试按钮
6. **WHEN** 用户点击对话框外部或关闭按钮 **THEN** 系统 **SHALL** 关闭详情对话框
7. **IF** 用户有编辑权限 **THEN** 系统 **SHALL** 在详情对话框底部显示 "编辑" 和 "删除" 按钮

---

### Requirement 4: 创建专辑

**User Story**: 作为管理员,我希望能够创建新专辑,以便丰富音乐内容库

#### Acceptance Criteria

1. **WHEN** 用户点击 "创建专辑" 按钮 **THEN** 系统 **SHALL** 打开专辑表单对话框 (Dialog)
2. **WHEN** 表单对话框打开 **THEN** 系统 **SHALL** 显示以下表单字段:
   - 专辑名称 (必填,文本输入框,最大长度 200 字符)
   - 封面 URL (可选,文本输入框,最大长度 500 字符,URL 格式校验)
   - 专辑简介 (可选,多行文本输入框,最大长度 1000 字符)
   - 发行日期 (可选,日期选择器,格式 YYYY-MM-DD)
3. **WHEN** 用户提交表单 **THEN** 系统 **SHALL** 进行前端校验:
   - 专辑名称不能为空
   - 封面 URL 必须是有效的 URL 格式 (如填写)
   - 发行日期必须是有效的日期 (如填写)
4. **IF** 前端校验失败 **THEN** 系统 **SHALL** 在对应字段下显示错误提示,不发起请求
5. **IF** 前端校验通过 **THEN** 系统 **SHALL** 调用后端 API `POST /api/album` 创建专辑
6. **WHEN** 创建请求发送中 **THEN** 系统 **SHALL** 禁用提交按钮,显示 "创建中..." 加载状态
7. **WHEN** 创建成功 **THEN** 系统 **SHALL**:
   - 显示成功提示 Toast "专辑创建成功"
   - 关闭表单对话框
   - 刷新专辑列表,展示新创建的专辑
8. **WHEN** 创建失败 **THEN** 系统 **SHALL** 显示错误提示 Toast,保留用户填写的数据,允许重试
9. **WHEN** 用户点击 "取消" 按钮 **THEN** 系统 **SHALL** 弹出确认提示 "确定要放弃创建吗?未保存的数据将丢失",确认后关闭对话框

---

### Requirement 5: 编辑专辑

**User Story**: 作为管理员,我希望能够编辑专辑信息,以便更新过时或错误的数据

#### Acceptance Criteria

1. **WHEN** 用户在详情对话框中点击 "编辑" 按钮 **THEN** 系统 **SHALL** 打开专辑表单对话框,预填充当前专辑数据
2. **WHEN** 用户修改表单字段 **THEN** 系统 **SHALL** 标记字段为 "已修改" 状态
3. **WHEN** 用户提交表单 **THEN** 系统 **SHALL** 进行前端校验 (规则同创建专辑)
4. **IF** 前端校验通过 **THEN** 系统 **SHALL** 调用后端 API `PUT /api/album/{id}` 更新专辑
5. **WHEN** 更新请求发送中 **THEN** 系统 **SHALL** 禁用提交按钮,显示 "保存中..." 加载状态
6. **WHEN** 更新成功 **THEN** 系统 **SHALL**:
   - 显示成功提示 Toast "专辑更新成功"
   - 关闭表单对话框
   - 刷新专辑列表和详情数据,展示最新信息
7. **WHEN** 更新失败 **THEN** 系统 **SHALL** 显示错误提示 Toast,保留用户修改的数据,允许重试
8. **IF** 用户未修改任何字段就点击 "保存" **THEN** 系统 **SHALL** 提示 "未检测到数据变更",不发起请求

---

### Requirement 6: 删除专辑

**User Story**: 作为管理员,我希望能够删除专辑,以便移除过时或错误的专辑数据

#### Acceptance Criteria

1. **WHEN** 用户在详情对话框中点击 "删除" 按钮 **THEN** 系统 **SHALL** 弹出确认对话框,提示: "确定要删除专辑 {专辑名称} 吗?如果专辑下有歌曲,将无法删除"
2. **WHEN** 用户确认删除 **THEN** 系统 **SHALL** 调用后端 API `DELETE /api/album/{id}` 删除专辑
3. **WHEN** 删除请求发送中 **THEN** 系统 **SHALL** 禁用确认按钮,显示 "删除中..." 加载状态
4. **WHEN** 删除成功 **THEN** 系统 **SHALL**:
   - 显示成功提示 Toast "专辑删除成功"
   - 关闭详情对话框
   - 从专辑列表中移除该专辑
   - 如果当前页为空,自动跳转到上一页
5. **WHEN** 删除失败 (如专辑下有歌曲关联) **THEN** 系统 **SHALL**:
   - 显示错误提示 Toast,包含具体失败原因 (如 "删除失败:专辑下有 5 首歌曲,请先移除歌曲")
   - 保持对话框打开状态,允许用户重试或取消
6. **WHEN** 用户取消删除 **THEN** 系统 **SHALL** 关闭确认对话框,返回详情页面

---

### Requirement 7: 响应式设计

**User Story**: 作为移动端用户,我希望专辑管理功能能够适配不同屏幕尺寸,以便在手机和平板上流畅使用

#### Acceptance Criteria

1. **WHEN** 屏幕宽度 < 640px (移动端) **THEN** 系统 **SHALL**:
   - 专辑卡片布局为 1 列
   - 排序下拉框占满全宽
   - 对话框宽度占屏幕 95%
   - 表单字段标签和输入框垂直排列
2. **WHEN** 屏幕宽度 640px ~ 1024px (平板) **THEN** 系统 **SHALL**:
   - 专辑卡片布局为 2 列
   - 对话框宽度占屏幕 80%
3. **WHEN** 屏幕宽度 ≥ 1024px (桌面端) **THEN** 系统 **SHALL**:
   - 专辑卡片布局为 3 列
   - 对话框宽度固定为 600px
4. **WHEN** 用户旋转设备 **THEN** 系统 **SHALL** 自动调整布局以适配新的屏幕方向

---

### Requirement 8: 错误处理与用户反馈

**User Story**: 作为用户,我希望系统能够清晰地提示错误信息,以便我了解问题并采取行动

#### Acceptance Criteria

1. **WHEN** API 请求超时 (> 10s) **THEN** 系统 **SHALL** 显示 "请求超时,请检查网络连接" 提示
2. **WHEN** API 返回 401 未授权 **THEN** 系统 **SHALL** 显示 "登录已过期,请重新登录" 提示,并跳转到登录页
3. **WHEN** API 返回 403 无权限 **THEN** 系统 **SHALL** 显示 "您没有权限执行此操作" 提示
4. **WHEN** API 返回 404 资源不存在 **THEN** 系统 **SHALL** 显示 "专辑不存在或已被删除" 提示
5. **WHEN** API 返回 500 服务器错误 **THEN** 系统 **SHALL** 显示 "服务器错误,请稍后重试" 提示
6. **WHEN** API 返回业务错误 (code ≠ 200) **THEN** 系统 **SHALL** 显示后端返回的具体错误消息 (message 字段)
7. **WHEN** 网络断开 **THEN** 系统 **SHALL** 显示 "网络连接失败,请检查您的网络设置" 提示

---

### Requirement 9: 性能优化

**User Story**: 作为用户,我希望专辑列表能够快速加载和响应,以便获得流畅的浏览体验

#### Acceptance Criteria

1. **WHEN** 用户首次访问专辑列表页面 **THEN** 系统 **SHALL** 在 1 秒内显示骨架屏占位符
2. **WHEN** 专辑列表数据返回 **THEN** 系统 **SHALL** 在 300ms 内完成数据渲染
3. **WHEN** 用户切换页码或排序方式 **THEN** 系统 **SHALL** 使用虚拟滚动技术 (如列表长度 > 100),优化渲染性能
4. **WHEN** 专辑封面图加载失败 **THEN** 系统 **SHALL** 显示默认占位图,不阻塞其他内容渲染
5. **WHEN** 用户返回专辑列表页面 **THEN** 系统 **SHALL** 恢复之前的滚动位置和排序状态 (使用 keep-alive)

---

## Non-Functional Requirements

### Code Architecture and Modularity

#### 单一职责原则 (Single Responsibility Principle)
- **页面组件**: AlbumList.vue 仅负责页面布局和路由
- **业务组件**: AlbumCard.vue (专辑卡片), AlbumDetailDialog.vue (详情对话框), AlbumFormDialog.vue (表单对话框)
- **状态管理**: stores/album.js 负责专辑数据状态管理
- **API 层**: api/album.js 负责与后端 API 交互
- **工具函数**: 日期格式化、URL 校验等抽取到 utils/

#### 模块化设计 (Modular Design)
- **可复用组件**: AlbumCard 组件可在多个页面复用 (如主页、搜索页)
- **独立对话框**: DetailDialog 和 FormDialog 独立封装,便于维护
- **策略模式**: 表单校验逻辑抽取为独立的 validation 工具函数

#### 依赖管理 (Dependency Management)
- **最小化依赖**: 仅依赖项目现有的 UI 组件库,不引入新的第三方库
- **清晰接口**: Store 和 API 层提供明确的方法签名和返回值类型

#### 清晰接口 (Clear Interfaces)
```typescript
// stores/album.js 接口示例
interface AlbumStore {
  albumList: Album[]
  total: number
  searchParams: SearchParams

  fetchAlbumList(params: SearchParams): Promise<void>
  fetchAlbumDetail(id: number): Promise<Album>
  createAlbum(data: AlbumCreateDTO): Promise<number>
  updateAlbum(id: number, data: AlbumUpdateDTO): Promise<boolean>
  deleteAlbum(id: number): Promise<boolean>
}

// api/album.js 接口示例
export const albumApi = {
  getList(params: AlbumQueryDTO): Promise<IPage<AlbumListVO>>
  getDetail(id: number): Promise<AlbumDetailVO>
  create(data: AlbumCreateDTO): Promise<number>
  update(id: number, data: AlbumUpdateDTO): Promise<boolean>
  delete(id: number): Promise<boolean>
}
```

---

### Performance

#### 加载性能
- 专辑列表首屏渲染时间 < 1 秒 (使用骨架屏优化感知性能)
- 专辑详情对话框打开到数据展示 < 500ms
- 图片懒加载,仅加载可视区域内的封面图

#### 运行时性能
- 列表滚动帧率 ≥ 60fps
- 对话框打开/关闭动画流畅 (使用 CSS transition)
- 表单输入无明显卡顿 (使用 v-model.lazy 优化)

#### 网络性能
- 使用 Axios 拦截器统一处理请求/响应,减少重复代码
- 支持请求取消 (如用户快速切换页码时取消上一个请求)
- 图片 URL 使用 CDN 加速 (如后端提供)

---

### Security

#### 输入校验
- 前端对所有表单输入进行严格校验,防止 XSS 攻击
- 封面 URL 字段强制校验 URL 格式,防止注入恶意脚本
- 专辑名称和简介字段进行 HTML 转义

#### 权限控制
- 创建、编辑、删除操作仅对有权限的用户可见 (基于后端返回的用户角色)
- 敏感操作 (删除) 需要二次确认

#### 数据传输
- 所有 API 请求通过 HTTPS 加密传输 (生产环境)
- 不在 URL 中传递敏感信息

---

### Reliability

#### 错误恢复
- 当 API 请求失败时,提供明确的错误提示和重试按钮
- 当列表为空时,提供 "创建专辑" 的快捷入口
- 当网络断开时,提示用户检查网络并自动重试

#### 数据一致性
- 创建/更新/删除成功后,立即刷新列表数据,确保数据同步
- 使用 Pinia Store 统一管理状态,避免数据不一致
- 对话框关闭时清空表单数据,避免数据残留

#### 容错处理
- 封面图加载失败时显示默认占位图
- 日期格式化失败时显示原始数据
- API 返回异常数据时进行兜底处理,避免应用崩溃

---

### Usability

#### 易用性
- 表单字段提供清晰的标签和示例 (如 "封面 URL: https://example.com/cover.jpg")
- 错误提示信息具体且可操作 (如 "专辑名称不能为空,请输入专辑名称")
- 排序下拉框提供清晰的选项说明

#### 可访问性 (Accessibility)
- 所有交互元素支持键盘导航 (Tab 键切换焦点)
- 表单字段关联 label,支持屏幕阅读器
- 按钮和链接提供清晰的 aria-label
- 对话框支持 Esc 键关闭

#### 用户反馈
- 所有操作 (创建、更新、删除) 提供明确的成功/失败提示
- 加载状态使用骨架屏或 Spinner 动画,避免空白页面
- 鼠标悬停在专辑卡片上时显示操作按钮 (编辑、删除)

#### 响应式设计
- 支持移动端、平板、桌面端三种布局
- 触摸设备优化 (按钮点击区域 ≥ 44px)
- 支持横屏和竖屏自适应

---

## Out of Scope (不在本次范围内)

以下功能不在本次开发范围内,可作为未来迭代方向:

1. **专辑搜索**: 关键词搜索专辑名称 (未来迭代考虑)
2. **批量操作**: 批量删除多个专辑
3. **拖拽排序**: 拖拽专辑卡片调整顺序
4. **专辑封面上传**: 本地上传封面图片 (当前仅支持 URL)
5. **专辑歌曲管理**: 在专辑详情页管理所属歌曲 (新增/移除歌曲到专辑)
6. **专辑收藏**: 用户收藏专辑功能
7. **专辑分享**: 分享专辑链接到社交媒体
8. **专辑统计**: 展示专辑播放量、收藏量等数据
9. **高级筛选**: 按发行日期范围、歌手筛选专辑

---

## Success Metrics (成功指标)

本功能上线后,将通过以下指标评估成功度:

### 功能完整性
- ✅ 100% 实现所有 Requirement (1-9)
- ✅ 通过所有 Acceptance Criteria 验收

### 性能指标
- 📊 专辑列表首屏加载时间 < 1 秒 (达成率 > 95%)
- 📊 对话框打开动画流畅度 ≥ 60fps
- 📊 列表滚动流畅度 ≥ 60fps

### 质量指标
- 🧪 单元测试覆盖率 ≥ 80%
- 🧪 E2E 测试覆盖核心用户路径 (浏览、排序、创建、编辑、删除)
- 🐛 上线后 7 天内无 P0/P1 级别 Bug

### 用户体验指标
- 👥 用户操作成功率 > 95% (无错误提示)
- 👥 用户平均完成专辑创建时间 < 30 秒
- 👥 移动端可用性评分 ≥ 4.5/5.0

---

## Dependencies (依赖项)

### 后端依赖
- ✅ 后端专辑 CRUD API 已完成开发和测试
- ✅ 后端提供统一的响应格式 `Result<T>`
- ✅ 后端提供完整的 API 文档 (Swagger)

### 前端依赖
- ✅ 现有 UI 组件库 (Button, Card, Input, Dialog, Pagination, Toast, Select)
- ✅ 现有工具函数 (request.js, useToast.js)
- ✅ 现有路由配置 (Vue Router)
- ✅ 现有状态管理 (Pinia)

### 设计依赖
- ⏳ 专辑列表页面 UI 设计稿 (可参考现有音乐列表页面)
- ⏳ 专辑详情对话框 UI 设计稿 (可参考现有音乐详情对话框)
- ⏳ 专辑表单对话框 UI 设计稿 (可自行设计,符合 Tailwind CSS 风格)

---

## Risk Assessment (风险评估)

### 技术风险
- **风险**: 后端 API 响应格式不一致
  - **缓解措施**: 在开发前与后端团队确认 API 文档,并进行联调测试

- **风险**: 大量专辑数据导致列表渲染性能问题
  - **缓解措施**: 使用虚拟滚动或分页加载,限制单页数据量

### 业务风险
- **风险**: 用户误删除重要专辑
  - **缓解措施**: 添加二次确认对话框,并提示删除影响范围

- **风险**: 用户上传非法封面 URL
  - **缓解措施**: 前端校验 URL 格式,后端进行内容审核

### 时间风险
- **风险**: UI 组件开发时间超出预期
  - **缓解措施**: 优先实现核心功能 (列表、详情、创建),非核心功能 (编辑、删除) 可延后

---

## Approval

本需求文档需经以下人员审核通过后方可进入设计阶段:

- [ ] **产品经理**: 确认功能需求符合业务目标
- [ ] **技术负责人**: 确认技术方案可行且与现有架构一致
- [ ] **UI/UX 设计师**: 确认交互设计和视觉设计符合规范
- [ ] **后端团队**: 确认 API 对接方案无误

---

**文档版本**: v1.0
**创建时间**: 2026-02-01
**创建者**: AI Assistant
**审核状态**: 待审核
