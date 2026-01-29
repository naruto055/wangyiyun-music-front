<template>
	<RouterView />
	<ToastContainer />
	<PlayerBar />
</template>

<script setup>
import ToastContainer from '@/components/ui/toast/ToastContainer.vue'
import PlayerBar from '@/components/player/PlayerBar.vue'
// 使用 Vue Router 渲染路由组件
</script>

<style scoped>
/* 全局样式在 main.css 中定义 */
</style>
