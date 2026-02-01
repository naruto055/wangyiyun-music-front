<template>
	<header class="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
		<div class="container mx-auto flex h-16 items-center justify-between px-4">
			<div class="flex items-center gap-2">
				<div class="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500">
					<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" viewBox="0 0 24 24" fill="currentColor">
						<path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
					</svg>
				</div>
				<h1 class="text-xl font-bold">网易云音乐</h1>
			</div>

			<!-- 导航菜单 -->
			<nav class="flex items-center gap-1">
				<router-link
					to="/music"
					class="inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors"
					:class="
						currentPath === '/music' ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
					"
				>
					<svg xmlns="http://www.w3.org/2000/svg" class="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M9 18V5l12-2v13"></path>
						<circle cx="6" cy="18" r="3"></circle>
						<circle cx="18" cy="16" r="3"></circle>
					</svg>
					音乐列表
				</router-link>
				<router-link
					to="/favorites"
					class="inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors"
					:class="
						currentPath === '/favorites' ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
					"
				>
					<svg xmlns="http://www.w3.org/2000/svg" class="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path
							d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"
						></path>
					</svg>
					我的收藏
				</router-link>
				<router-link
					to="/video-parser"
					class="inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors"
					:class="
						currentPath === '/video-parser' ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
					"
				>
					<svg xmlns="http://www.w3.org/2000/svg" class="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path stroke-linecap="round" stroke-linejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
					</svg>
					视频解析
				</router-link>
			</nav>

			<div v-if="$slots.right" class="flex items-center gap-2">
				<slot name="right" />
			</div>
		</div>
	</header>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

// 当前路径
const currentPath = computed(() => route.path)
</script>
