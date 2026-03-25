<template>
	<div class="min-h-screen bg-background">
		<Header />

		<main class="container mx-auto px-4 py-8 max-w-4xl">
			<!-- 页面标题 -->
			<div class="mb-8">
				<h1 class="text-3xl font-bold text-foreground mb-2">视频解析</h1>
				<p class="text-sm text-muted-foreground">输入视频链接,一键提取高品质音频文件</p>
			</div>

			<!-- 输入区域 -->
			<Card class="p-6 mb-8">
				<!-- 平台选择器 -->
				<div class="mb-4">
					<label class="text-sm font-medium mb-3 block">选择平台</label>
					<div class="flex flex-col sm:flex-row gap-4">
						<div class="flex-1">
							<input type="radio" id="bilibili" value="BILIBILI" v-model="platform" class="peer sr-only" />
							<label
								for="bilibili"
								class="flex min-h-[112px] flex-col items-center justify-center gap-2 rounded-lg border-2 border-muted bg-background p-4 cursor-pointer hover:bg-muted/50 peer-checked:border-primary peer-checked:bg-primary/5 transition-all"
							>
								<svg class="w-8 h-8 text-muted-foreground peer-checked:text-primary" viewBox="0 0 24 24" fill="currentColor">
									<path
										d="M17.813 4.653h.854c1.51.054 2.769.578 3.773 1.574 1.004.995 1.524 2.249 1.56 3.76v7.36c-.036 1.51-.556 2.769-1.56 3.773s-2.262 1.524-3.773 1.56H5.333c-1.51-.036-2.769-.556-3.773-1.56S.036 18.858 0 17.347v-7.36c.036-1.511.556-2.765 1.56-3.76 1.004-.996 2.262-1.52 3.773-1.574h.774l-1.174-1.12a1.234 1.234 0 0 1-.373-.906c0-.356.124-.658.373-.907l.027-.027c.267-.249.573-.373.92-.373.347 0 .653.124.92.373L9.653 4.44c.071.071.134.142.187.213h4.267a.836.836 0 0 1 .16-.213l2.853-2.747c.267-.249.573-.373.92-.373.347 0 .662.151.929.4.267.249.391.551.391.907 0 .355-.124.657-.373.906zM5.333 7.24c-.746.018-1.373.276-1.88.773-.506.498-.769 1.13-.786 1.894v7.52c.017.764.28 1.395.786 1.893.507.498 1.134.756 1.88.773h13.334c.746-.017 1.373-.275 1.88-.773.506-.498.769-1.129.786-1.893v-7.52c-.017-.765-.28-1.396-.786-1.894-.507-.497-1.134-.755-1.88-.773zM8 11.107c.373 0 .684.124.933.373.25.249.383.569.4.96v1.173c-.017.391-.15.711-.4.96-.249.25-.56.374-.933.374s-.684-.125-.933-.374c-.25-.249-.383-.569-.4-.96V12.44c0-.373.129-.689.386-.947.258-.257.574-.386.947-.386zm8 0c.373 0 .684.124.933.373.25.249.383.569.4.96v1.173c-.017.391-.15.711-.4.96-.249.25-.56.374-.933.374s-.684-.125-.933-.374c-.25-.249-.383-.569-.4-.96V12.44c.017-.391.15-.711.4-.96.249-.249.56-.373.933-.373Z"
									/>
								</svg>
								<span class="text-sm font-medium">哔哩哔哩</span>
							</label>
						</div>

						<div class="flex-1">
							<input type="radio" id="youtube" value="YOUTUBE" v-model="platform" class="peer sr-only" disabled />
							<label
								for="youtube"
								class="flex min-h-[112px] flex-col items-center justify-center gap-2 rounded-lg border-2 border-muted bg-background p-4 cursor-not-allowed opacity-50 transition-all"
							>
								<svg class="w-8 h-8 text-muted-foreground" viewBox="0 0 24 24" fill="currentColor">
									<path
										d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"
									/>
								</svg>
								<span class="text-sm font-medium">YouTube</span>
								<span class="text-xs text-muted-foreground">(即将支持)</span>
							</label>
						</div>

						<div class="flex-1">
							<input type="radio" id="douyin" value="DOUYIN" v-model="platform" class="peer sr-only" />
							<label
								for="douyin"
								class="flex min-h-[112px] flex-col items-center justify-center gap-2 rounded-lg border-2 border-muted bg-background p-4 cursor-pointer hover:bg-muted/50 peer-checked:border-primary peer-checked:bg-primary/5 transition-all"
							>
								<svg class="w-8 h-8 text-muted-foreground peer-checked:text-primary" viewBox="0 0 24 24" fill="currentColor">
									<path
										d="M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.10-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.50-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.50 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.40-.67.41-1.06.10-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"
									/>
								</svg>
								<span class="text-sm font-medium">抖音</span>
							</label>
						</div>
					</div>
				</div>

				<!-- 链接输入框 -->
				<div class="mb-4">
					<label class="text-sm font-medium mb-2 block">视频链接</label>
					<textarea
						v-model="videoUrl"
						:placeholder="inputPlaceholder"
						class="w-full h-32 resize-none rounded-lg border border-input bg-background px-4 py-3 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
						:disabled="isLoading"
					></textarea>
				</div>

				<!-- 解析按钮 -->
				<Button class="w-full h-12 text-base font-medium" @click="handleParse" :disabled="!canParse || isLoading">
					<svg v-if="!isLoading" class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
					</svg>
					<svg v-else class="w-5 h-5 mr-2 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
					</svg>
					{{ isLoading ? '解析中...' : '开始解析' }}
				</Button>
			</Card>

			<!-- 结果区域 -->
			<Transition
				enter-active-class="transition-all duration-300 ease-out"
				enter-from-class="opacity-0 translate-y-4"
				enter-to-class="opacity-100 translate-y-0"
				leave-active-class="transition-all duration-200 ease-in"
				leave-from-class="opacity-100 translate-y-0"
				leave-to-class="opacity-0 -translate-y-4"
				mode="out-in"
			>
				<!-- 加载状态 -->
				<Card v-if="isLoading" class="p-8 text-center">
					<!-- 音乐波形动画 -->
					<div class="flex items-center justify-center gap-1 h-16 mb-6">
						<div v-for="i in 7" :key="i" class="w-2 bg-primary rounded-full animate-wave" :style="{ animationDelay: `${i * 0.1}s` }"></div>
					</div>

					<!-- 阶段提示 -->
					<div class="space-y-2">
						<p class="text-lg font-medium text-foreground">{{ currentStage }}</p>
						<p class="text-sm text-muted-foreground">预计需要 10-60 秒,请稍候...</p>
					</div>

					<!-- 进度条 -->
					<div class="mt-6 w-full h-1 bg-muted rounded-full overflow-hidden">
						<div class="h-full w-1/4 bg-primary animate-indeterminate"></div>
					</div>
				</Card>

				<!-- 成功状态 -->
				<Card v-else-if="parseResult" class="overflow-hidden border border-primary/20">
					<!-- 警告横幅 -->
					<div class="bg-amber-50 border-l-4 border-amber-500 p-4 flex items-center gap-3">
						<svg class="w-5 h-5 text-amber-600 shrink-0" fill="currentColor" viewBox="0 0 20 20">
							<path
								fill-rule="evenodd"
								d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
								clip-rule="evenodd"
							/>
						</svg>
						<p class="text-sm font-medium text-amber-900">
							⏰ 音频链接将在 <span class="font-bold text-amber-600">1 小时</span> 后失效,请尽快播放或下载
						</p>
					</div>

					<!-- 内容区域 -->
					<div class="p-6">
						<div class="flex flex-col sm:flex-row gap-6">
							<!-- 封面图 -->
							<div
								class="relative shrink-0 w-full sm:w-32 aspect-square sm:aspect-auto sm:h-32 rounded-lg overflow-hidden group cursor-pointer"
								@click="handlePlay"
							>
								<img
									:src="parseResult.coverUrl"
									:alt="parseResult.title"
									class="w-full h-full object-cover transition-transform group-hover:scale-105"
								/>
								<div class="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
									<svg class="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 20 20">
										<path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
									</svg>
								</div>
							</div>

							<!-- 元数据面板 -->
							<div class="flex-1 space-y-3">
								<!-- 标题 -->
								<h3 class="text-lg font-semibold text-foreground line-clamp-2 leading-snug">{{ parseResult.title }}</h3>

								<!-- 元数据标签 -->
								<div class="flex flex-wrap gap-4 text-sm text-muted-foreground">
									<!-- 时长 -->
									<div class="flex items-center gap-1.5">
										<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
										</svg>
										<span>{{ formatDuration(parseResult.duration) }}</span>
									</div>

									<!-- 文件大小 -->
									<div class="flex items-center gap-1.5">
										<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
											/>
										</svg>
										<span>{{ formatFileSize(parseResult.fileSize) }}</span>
									</div>

									<!-- 音频格式 -->
									<div class="flex items-center gap-1.5">
										<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
											/>
										</svg>
										<span class="uppercase">{{ parseResult.audioFormat }}</span>
									</div>
								</div>

								<!-- 来源视频ID -->
								<div class="text-xs text-muted-foreground">来源：{{ parseResult.sourceVideoId }}</div>
							</div>
						</div>

						<!-- 操作按钮组 -->
						<div class="mt-6 flex flex-col sm:flex-row gap-3">
							<!-- 立即播放 -->
							<Button variant="default" size="lg" class="flex-1 h-11" @click="handlePlay">
								<svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
									<path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
								</svg>
								立即播放
							</Button>

							<!-- 下载音频 -->
							<Button variant="outline" size="lg" class="flex-1 h-11" @click="handleDownload">
								<svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
									/>
								</svg>
								下载音频
							</Button>

							<!-- 重新解析 -->
							<Button variant="ghost" size="lg" class="sm:w-auto h-11" @click="handleReset">
								<svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
									/>
								</svg>
								重新解析
							</Button>
						</div>
					</div>
				</Card>

				<!-- 错误状态 -->
				<Card v-else-if="error" class="p-8 text-center border border-red-200 bg-red-50">
					<!-- 错误图标 -->
					<div class="flex justify-center mb-4">
						<div class="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
							<svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
							</svg>
						</div>
					</div>

					<!-- 错误标题 -->
					<h3 class="text-lg font-semibold text-red-800 mb-2">解析失败</h3>

					<!-- 错误详情 -->
					<p class="text-sm text-red-600 mb-6">{{ error }}</p>

					<!-- 重试按钮 -->
					<Button variant="outline" class="border-red-300 text-red-700 hover:bg-red-100" @click="handleReset">
						<svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
							/>
						</svg>
						重新尝试
					</Button>
				</Card>

				<!-- 空状态 -->
				<div v-else class="py-16 text-center">
					<!-- 插画图标 -->
					<div class="flex justify-center mb-6">
						<svg class="w-24 h-24 text-muted-foreground/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="1.5"
								d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
							/>
						</svg>
					</div>

					<!-- 引导文字 -->
					<h3 class="text-lg font-medium text-foreground mb-2">开始提取音频</h3>
					<p class="text-sm text-muted-foreground max-w-sm mx-auto">粘贴视频链接,一键提取高品质音频文件</p>
				</div>
			</Transition>
		</main>
	</div>
</template>

<script setup>
import { ref, computed } from 'vue'
import axios from 'axios'
import { parseVideo } from '@/api/video'
import { usePlayerStore } from '@/stores/player'
import { useToast } from '@/composables/useToast'
import { adaptVideoToTrack } from '@/utils/trackAdapter'
import Header from '@/components/layout/Header.vue'
import Card from '@/components/ui/card/Card.vue'
import Button from '@/components/ui/button/Button.vue'

const toast = useToast()
const playerStore = usePlayerStore()

// 状态管理
const platform = ref('BILIBILI')
const videoUrl = ref('')
const isLoading = ref(false)
const parseResult = ref(null)
const error = ref(null)

// 加载阶段提示
const loadingStages = ['正在解析视频信息...', '提取音频流...', '处理音频数据...', '即将完成...']
const currentStage = ref('')

// 计算属性
const inputPlaceholder = computed(() => {
	if (platform.value === 'DOUYIN') {
		return '粘贴抖音视频链接或分享文本...\n\n支持格式：\n• 抖音链接：https://www.douyin.com/video/1234567890\n• 抖音短链：https://v.douyin.com/xxxxxxx/\n• 分享文本（包含链接）'
	}

	return '粘贴B站视频链接、BV号或分享文本...\n\n支持格式：\n• B站链接：https://www.bilibili.com/video/BV1xxx\n• B站 BV号：BV1xxx\n• 分享文本（包含链接）'
})

const canParse = computed(() => {
	return videoUrl.value.trim().length > 0 && platform.value
})

// 解析视频
async function handleParse() {
	if (!videoUrl.value.trim()) {
		toast.warning('请输入视频链接')
		return
	}

	isLoading.value = true
	error.value = null
	parseResult.value = null

	// 启动阶段提示轮播
	let stageIndex = 0
	currentStage.value = loadingStages[0]
	const stageInterval = setInterval(() => {
		stageIndex = (stageIndex + 1) % loadingStages.length
		currentStage.value = loadingStages[stageIndex]
	}, 5000)

	try {
		const data = await parseVideo({
			videoUrl: videoUrl.value,
			platform: platform.value,
		})

		parseResult.value = data

		toast.success('解析成功，音频已准备就绪')
	} catch (err) {
		error.value = err.message || '解析失败,请重试'

		toast.error('解析失败: ' + error.value)
	} finally {
		isLoading.value = false
		clearInterval(stageInterval)
	}
}

// 播放音频
function handlePlay() {
	if (!parseResult.value) return

	// 使用适配器将视频解析结果转换为统一的音轨格式
	const track = adaptVideoToTrack(parseResult.value)

	// 播放音乐
	playerStore.playTrack(track)

	toast.success('开始播放')
}

// 下载音频
async function handleDownload() {
	if (!parseResult.value) return

	toast.info('准备下载，正在获取音频文件...')

	try {
		// 使用 axios 下载音频（后端已配置 CORS）
		const response = await axios({
			url: parseResult.value.audioUrl,
			method: 'GET',
			responseType: 'blob', // 关键：返回二进制数据
		})

		// 创建 Object URL 触发下载
		const url = window.URL.createObjectURL(response.data)
		const link = document.createElement('a')
		link.href = url
		link.download = `${parseResult.value.title}.${parseResult.value.audioFormat}`
		link.style.display = 'none'
		document.body.appendChild(link)
		link.click()
		document.body.removeChild(link)

		// 释放 Object URL
		window.URL.revokeObjectURL(url)

		toast.success('下载成功，音频文件已保存')
	} catch (err) {
		console.error('下载失败:', err)
		toast.error('下载失败: ' + (err.message || '请稍后重试'))
	}
}

// 重新解析
function handleReset() {
	parseResult.value = null
	error.value = null
	videoUrl.value = ''
}

// 工具函数
function formatDuration(seconds) {
	const mins = Math.floor(seconds / 60)
	const secs = seconds % 60
	return `${mins}:${secs.toString().padStart(2, '0')}`
}

function formatFileSize(bytes) {
	return (bytes / 1024 / 1024).toFixed(1) + ' MB'
}
</script>

<style scoped>
@keyframes wave {
	0%,
	100% {
		height: 1rem;
	}
	50% {
		height: 3rem;
	}
}

.animate-wave {
	animation: wave 1s ease-in-out infinite;
}

@keyframes indeterminate {
	0% {
		transform: translateX(-100%);
	}
	100% {
		transform: translateX(400%);
	}
}

.animate-indeterminate {
	animation: indeterminate 1.5s ease-in-out infinite;
}
</style>
