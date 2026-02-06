<template>
	<Dialog v-model:open="localOpen" :title="dialogTitle" :description="dialogDescription" class="sm:max-w-md">
		<!-- 加载状态 -->
		<div v-if="loading" class="py-8 text-center">
			<svg class="mx-auto h-8 w-8 animate-spin text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<path d="M21 12a9 9 0 1 1-6.219-8.56" />
			</svg>
			<p class="mt-2 text-sm text-muted-foreground">加载分类列表...</p>
		</div>

		<!-- 分类列表 -->
		<div v-else-if="categories.length > 0" class="py-4">
			<div class="space-y-3">
				<div
					v-for="category in categories"
					:key="category.id"
					class="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted cursor-pointer transition-colors"
					:class="{ 'bg-primary/10 border-2 border-primary': selectedCategoryId === category.id }"
					@click="selectedCategoryId = category.id"
				>
					<!-- 单选框 -->
					<div
						class="flex items-center justify-center w-5 h-5 rounded-full border-2 transition-all"
						:class="selectedCategoryId === category.id ? 'border-primary bg-primary' : 'border-muted-foreground'"
					>
						<div v-if="selectedCategoryId === category.id" class="w-2 h-2 rounded-full bg-white"></div>
					</div>

					<!-- 分类名称 -->
					<label class="flex-1 cursor-pointer text-sm font-medium">
						{{ category.name }}
					</label>
				</div>
			</div>
		</div>

		<!-- 空状态 -->
		<div v-else class="py-8 text-center">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				class="mx-auto h-12 w-12 text-muted-foreground"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="1"
			>
				<path d="M3 7V5a2 2 0 0 1 2-2h2" />
				<path d="M17 3h2a2 2 0 0 1 2 2v2" />
				<path d="M21 17v2a2 2 0 0 1-2 2h-2" />
				<path d="M7 21H5a2 2 0 0 1-2-2v-2" />
			</svg>
			<p class="mt-2 text-sm text-muted-foreground">暂无分类，请先创建分类</p>
		</div>

		<!-- 按钮区域 -->
		<template #footer>
			<Button variant="outline" @click="handleCancel">取消</Button>
			<Button @click="handleConfirm" :disabled="!selectedCategoryId || saving">
				<svg
					v-if="!saving"
					xmlns="http://www.w3.org/2000/svg"
					class="mr-2 h-4 w-4"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
				>
					<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
					<polyline points="7 10 12 15 17 10" />
					<line x1="12" x2="12" y1="15" y2="3" />
				</svg>
				<svg v-else class="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<path d="M21 12a9 9 0 1 1-6.219-8.56" />
				</svg>
				{{ saving ? '保存中...' : '确认保存' }}
			</Button>
		</template>
	</Dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { getMusicCategories } from '@/api/bilibili'
import Dialog from '@/components/ui/dialog/Dialog.vue'
import Button from '@/components/ui/button/Button.vue'

const props = defineProps({
	open: {
		type: Boolean,
		default: false,
	},
	video: {
		type: Object,
		default: null,
	},
})

const emit = defineEmits(['update:open', 'confirm'])

// 本地状态
const localOpen = computed({
	get: () => props.open,
	set: (value) => emit('update:open', value),
})

// Dialog 标题和描述
const dialogTitle = computed(() => '选择音乐分类')
const dialogDescription = computed(() => (props.video ? `为 "${props.video.title}" 选择一个分类` : ''))

const categories = ref([])
const selectedCategoryId = ref(null)
const loading = ref(false)
const saving = ref(false)

/**
 * 监听对话框打开，加载分类列表
 */
watch(
	() => props.open,
	async (newValue) => {
		if (newValue) {
			await loadCategories()
		} else {
			// 对话框关闭时重置状态
			selectedCategoryId.value = null
		}
	}
)

/**
 * 加载分类列表
 */
async function loadCategories() {
	loading.value = true
	try {
		const response = await getMusicCategories()
		categories.value = response || []

		// 如果只有一个分类，自动选中
		if (categories.value.length === 1) {
			selectedCategoryId.value = categories.value[0].id
		}
	} catch (error) {
		console.error('加载分类列表失败:', error)
		categories.value = []
	} finally {
		loading.value = false
	}
}

/**
 * 取消
 */
function handleCancel() {
	localOpen.value = false
}

/**
 * 确认
 */
function handleConfirm() {
	if (!selectedCategoryId.value) {
		return
	}

	emit('confirm', selectedCategoryId.value)
}
</script>
