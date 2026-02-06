<template>
	<div :class="cn('flex items-center justify-center gap-2', props.class)" v-bind="$attrs">
		<!-- 上一页按钮 -->
		<button
			@click="handlePrevPage"
			:disabled="currentPage === 1"
			:class="
				cn(
					'h-9 px-3 inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors',
					'border border-input bg-background shadow-sm',
					currentPage === 1
						? 'opacity-50 cursor-not-allowed'
						: 'hover:bg-accent hover:text-accent-foreground'
				)
			"
		>
			<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<polyline points="15 18 9 12 15 6"></polyline>
			</svg>
		</button>

		<!-- 页码列表 -->
		<template v-for="page in displayedPages" :key="page">
			<!-- 省略号 -->
			<span v-if="page === '...'" class="h-9 w-9 flex items-center justify-center text-sm text-muted-foreground"> ... </span>

			<!-- 页码按钮 -->
			<button
				v-else
				@click="handlePageClick(page)"
				:class="
					cn(
						'h-9 w-9 inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors',
						currentPage === page
							? 'bg-primary text-primary-foreground hover:bg-primary/90'
							: 'border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground'
					)
				"
			>
				{{ page }}
			</button>
		</template>

		<!-- 下一页按钮 -->
		<button
			@click="handleNextPage"
			:disabled="currentPage === totalPages"
			:class="
				cn(
					'h-9 px-3 inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors',
					'border border-input bg-background shadow-sm',
					currentPage === totalPages
						? 'opacity-50 cursor-not-allowed'
						: 'hover:bg-accent hover:text-accent-foreground'
				)
			"
		>
			<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<polyline points="9 18 15 12 9 6"></polyline>
			</svg>
		</button>

		<!-- 总页数显示 -->
		<div class="ml-2 flex items-center gap-1 text-sm text-muted-foreground">
			<span>/</span>
			<span>共 {{ totalPages }} 页</span>
		</div>
	</div>
</template>

<script setup>
import { computed } from 'vue'
import { cn } from '@/utils'

const props = defineProps({
	currentPage: {
		type: Number,
		default: 1,
	},
	pageSize: {
		type: Number,
		default: 10,
	},
	total: {
		type: Number,
		default: 0,
	},
	class: {
		type: String,
		default: '',
	},
})

const emit = defineEmits(['update:currentPage', 'pageChange'])

const totalPages = computed(() => {
	return Math.ceil(props.total / props.pageSize) || 1
})

/**
 * 计算显示的页码列表
 * 逻辑：始终显示第1页和最后一页，当前页前后各显示2页，用省略号连接
 */
const displayedPages = computed(() => {
	const pages = []
	const current = props.currentPage
	const total = totalPages.value

	// 总页数 <= 7，显示所有页码
	if (total <= 7) {
		for (let i = 1; i <= total; i++) {
			pages.push(i)
		}
		return pages
	}

	// 总是添加第1页
	pages.push(1)

	// 计算当前页周围需要显示的页码范围（前后各2页）
	let startPage = Math.max(2, current - 2)
	let endPage = Math.min(total - 1, current + 2)

	// 如果当前页靠近开头，多显示几页
	if (current <= 4) {
		startPage = 2
		endPage = 5
	}

	// 如果当前页靠近结尾，多显示几页
	if (current >= total - 3) {
		startPage = total - 4
		endPage = total - 1
	}

	// 添加左侧省略号（如果需要）
	if (startPage > 2) {
		pages.push('...')
	}

	// 添加中间页码
	for (let i = startPage; i <= endPage; i++) {
		pages.push(i)
	}

	// 添加右侧省略号（如果需要）
	if (endPage < total - 1) {
		pages.push('...')
	}

	// 总是添加最后一页
	pages.push(total)

	return pages
})

/**
 * 页码点击事件
 */
const handlePageClick = (page) => {
	if (page !== props.currentPage) {
		emit('update:currentPage', page)
		emit('pageChange', page)
	}
}

/**
 * 上一页
 */
const handlePrevPage = () => {
	if (props.currentPage > 1) {
		const prevPage = props.currentPage - 1
		emit('update:currentPage', prevPage)
		emit('pageChange', prevPage)
	}
}

/**
 * 下一页
 */
const handleNextPage = () => {
	if (props.currentPage < totalPages.value) {
		const nextPage = props.currentPage + 1
		emit('update:currentPage', nextPage)
		emit('pageChange', nextPage)
	}
}
</script>
