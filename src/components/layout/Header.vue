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
					to="/albums"
					class="inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors"
					:class="
						currentPath === '/albums' ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
					"
				>
					<svg xmlns="http://www.w3.org/2000/svg" class="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" />
					</svg>
					专辑列表
				</router-link>
				<router-link
					to="/video-parser"
					class="inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors"
					:class="
						currentPath === '/video-parser'
							? 'bg-accent text-accent-foreground'
							: 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
					"
				>
					<svg xmlns="http://www.w3.org/2000/svg" class="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
						/>
					</svg>
					视频解析
				</router-link>
				<router-link
					to="/bilibili-search"
					class="inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors"
					:class="
						currentPath === '/bilibili-search'
							? 'bg-accent text-accent-foreground'
							: 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
					"
				>
					<svg xmlns="http://www.w3.org/2000/svg" class="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
						<path
							d="M17.813 4.653h.854c1.51.054 2.769.578 3.773 1.574 1.004.995 1.524 2.249 1.56 3.76v7.36c-.036 1.51-.556 2.769-1.56 3.773s-2.262 1.524-3.773 1.56H5.333c-1.51-.036-2.769-.556-3.773-1.56S.036 18.858 0 17.347v-7.36c.036-1.511.556-2.765 1.56-3.76 1.004-.996 2.262-1.52 3.773-1.574h.774l-1.174-1.12a1.234 1.234 0 0 1-.373-.906c0-.356.124-.658.373-.907l.027-.027c.267-.249.573-.373.92-.373.347 0 .653.124.92.373L9.653 4.44c.071.071.134.142.187.213h4.267a.836.836 0 0 1 .16-.213l2.853-2.747c.267-.249.573-.373.92-.373.347 0 .662.151.929.4.267.249.391.551.391.907 0 .355-.124.657-.373.906zM5.333 7.24c-.746.018-1.373.276-1.88.773-.506.498-.769 1.13-.786 1.894v7.52c.017.764.28 1.395.786 1.893.507.498 1.134.756 1.88.773h13.334c.746-.017 1.373-.275 1.88-.773.506-.498.769-1.129.786-1.893v-7.52c-.017-.765-.28-1.396-.786-1.894-.507-.497-1.134-.755-1.88-.773zM8 11.107c.373 0 .684.124.933.373.25.249.383.569.4.96v1.173c-.017.391-.15.711-.4.96-.249.25-.56.374-.933.374s-.684-.125-.933-.374c-.25-.249-.383-.569-.4-.96V12.44c0-.373.129-.689.386-.947.258-.257.574-.386.947-.386zm8 0c.373 0 .684.124.933.373.25.249.383.569.4.96v1.173c-.017.391-.15.711-.4.96-.249.25-.56.374-.933.374s-.684-.125-.933-.374c-.25-.249-.383-.569-.4-.96V12.44c.017-.391.15-.711.4-.96.249-.249.56-.373.933-.373Z"
						/>
					</svg>
					B站搜索
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
