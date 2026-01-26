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
]

const router = createRouter({
	history: createWebHistory(),
	routes,
})

export default router
