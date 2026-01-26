<template>
	<div :class="cn('flex items-center justify-center gap-2', props.class)" v-bind="$attrs">
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

const displayedPages = computed(() => {
	const pages = []
	const current = props.currentPage
	const total = totalPages.value

	if (total <= 5) {
		// 总页数小于等于5，显示所有页码
		for (let i = 1; i <= total; i++) {
			pages.push(i)
		}
	} else if (current <= 3) {
		// 当前页在前面，显示：1, 2, 3, 4, ..., total
		for (let i = 1; i <= 4; i++) {
			pages.push(i)
		}
		pages.push('...')
		pages.push(total)
	} else if (current >= total - 2) {
		// 当前页在后面，显示：1, ..., total-3, total-2, total-1, total
		pages.push(1)
		pages.push('...')
		for (let i = total - 3; i <= total; i++) {
			pages.push(i)
		}
	} else {
		// 当前页在中间，显示：1, 2, ..., current, ..., total
		pages.push(1)
		pages.push(2)
		pages.push('...')
		pages.push(current)
		pages.push('...')
		pages.push(total)
	}

	return pages
})

const handlePageClick = (page) => {
	emit('update:currentPage', page)
	emit('pageChange', page)
}
</script>
