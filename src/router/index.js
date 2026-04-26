import { createRouter, createWebHistory } from 'vue-router'

/**
 * Vue Router 配置
 */

const routes = [
	{
		path: '/',
		redirect: '/video-parser',
	},
	{
		path: '/video-parser',
		name: 'VideoParser',
		component: () => import('@/views/VideoParser.vue'),
		meta: {
			title: '视频解析',
		},
	},
	{
		path: '/bilibili-search',
		name: 'BilibiliSearch',
		component: () => import('@/views/BilibiliSearch.vue'),
		meta: {
			title: 'B站音乐搜索',
		},
	},
	{
		path: '/ai-parser',
		name: 'AiParser',
		component: () => import('@/views/AiParser.vue'),
		meta: {
			title: 'AI解析',
		},
	},
	{
		path: '/:pathMatch(.*)*',
		redirect: '/video-parser',
	},
]

const router = createRouter({
	history: createWebHistory(),
	routes,
})

export default router
