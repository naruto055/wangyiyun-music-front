import { createRouter, createWebHistory } from 'vue-router'

/**
 * Vue Router 配置
 */

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
	{
		path: '/albums',
		name: 'AlbumList',
		component: () => import('@/views/AlbumList.vue'),
		meta: {
			title: '专辑列表',
		},
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
]

const router = createRouter({
	history: createWebHistory(),
	routes,
})

export default router
