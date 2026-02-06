<template>
	<Dialog :open="open" @update:open="handleClose" class="max-w-md">
		<template #header>
			<h2 class="text-lg font-semibold">{{ mode === 'create' ? '创建专辑' : '编辑专辑' }}</h2>
		</template>

		<form @submit.prevent="handleSubmit" class="space-y-4">
			<!-- 专辑名称 -->
			<div class="space-y-2">
				<label for="albumName" class="text-sm font-medium"> 专辑名称 <span class="text-red-500">*</span> </label>
				<input
					id="albumName"
					v-model="formData.name"
					type="text"
					maxlength="200"
					placeholder="请输入专辑名称"
					:class="[
						'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
						errors.name && 'border-red-500',
					]"
				/>
				<p v-if="errors.name" class="text-xs text-red-500">{{ errors.name }}</p>
			</div>

			<!-- 封面 URL -->
			<div class="space-y-2">
				<label for="coverUrl" class="text-sm font-medium">封面 URL</label>
				<input
					id="coverUrl"
					v-model="formData.coverUrl"
					type="text"
					maxlength="500"
					placeholder="https://example.com/cover.jpg"
					:class="[
						'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
						errors.coverUrl && 'border-red-500',
					]"
				/>
				<p v-if="errors.coverUrl" class="text-xs text-red-500">{{ errors.coverUrl }}</p>
			</div>

			<!-- 专辑简介 -->
			<div class="space-y-2">
				<label for="description" class="text-sm font-medium">专辑简介</label>
				<textarea
					id="description"
					v-model="formData.description"
					maxlength="1000"
					rows="4"
					placeholder="请输入专辑简介"
					class="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
				></textarea>
			</div>

			<!-- 发行日期 -->
			<div class="space-y-2">
				<label for="releaseDate" class="text-sm font-medium">发行日期</label>
				<input
					id="releaseDate"
					v-model="formData.releaseDate"
					type="date"
					:class="[
						'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
						errors.releaseDate && 'border-red-500',
					]"
				/>
				<p v-if="errors.releaseDate" class="text-xs text-red-500">{{ errors.releaseDate }}</p>
			</div>
		</form>

		<template #footer>
			<div class="flex items-center justify-end gap-3">
				<!-- 取消按钮 -->
				<button
					type="button"
					@click="handleClose"
					:disabled="submitting"
					class="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2 disabled:cursor-not-allowed disabled:opacity-50"
				>
					取消
				</button>

				<!-- 提交按钮 -->
				<button
					type="button"
					@click="handleSubmit"
					:disabled="submitting"
					class="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2 disabled:cursor-not-allowed disabled:opacity-50"
				>
					{{ submitting ? (mode === 'create' ? '创建中...' : '保存中...') : mode === 'create' ? '创建' : '保存' }}
				</button>
			</div>
		</template>
	</Dialog>
</template>

<script setup>
import { ref, watch, reactive } from 'vue'
import Dialog from '@/components/ui/dialog/Dialog.vue'
import { useAlbumStore } from '@/stores/album'
import { toast } from '@/composables/useToast'
import { useConfirm } from '@/composables/useConfirm'

const props = defineProps({
	open: {
		type: Boolean,
		required: true,
	},
	mode: {
		type: String,
		required: true,
		validator: (value) => ['create', 'edit'].includes(value),
	},
	albumId: {
		type: Number,
		default: null,
	},
})

const emit = defineEmits(['update:open', 'success'])

const albumStore = useAlbumStore()

// 表单数据
const formData = reactive({
	name: '',
	coverUrl: '',
	description: '',
	releaseDate: '',
})

// 原始数据（用于变更检测）
const originalData = ref(null)

// 表单错误
const errors = reactive({
	name: '',
	coverUrl: '',
	releaseDate: '',
})

// 提交状态
const submitting = ref(false)

/**
 * 监听弹窗打开，加载数据
 */
watch(
	() => props.open,
	async (newVal) => {
		if (newVal) {
			// 重置表单
			resetForm()

			// 编辑模式：加载专辑详情
			if (props.mode === 'edit' && props.albumId) {
				const detail = await albumStore.fetchAlbumDetail(props.albumId)
				if (detail) {
					formData.name = detail.name || ''
					formData.coverUrl = detail.coverUrl || ''
					formData.description = detail.description || ''
					formData.releaseDate = detail.releaseDate ? formatDateForInput(detail.releaseDate) : ''

					// 保存原始数据
					originalData.value = { ...formData }
				}
			}
		}
	}
)

/**
 * 重置表单
 */
function resetForm() {
	formData.name = ''
	formData.coverUrl = ''
	formData.description = ''
	formData.releaseDate = ''
	originalData.value = null
	errors.name = ''
	errors.coverUrl = ''
	errors.releaseDate = ''
}

/**
 * 格式化日期为 YYYY-MM-DD（用于 input[type="date"]）
 * @param {string} dateStr - 日期字符串
 * @returns {string} 格式化后的日期
 */
function formatDateForInput(dateStr) {
	if (!dateStr) return ''
	try {
		const date = new Date(dateStr)
		const year = date.getFullYear()
		const month = String(date.getMonth() + 1).padStart(2, '0')
		const day = String(date.getDate()).padStart(2, '0')
		return `${year}-${month}-${day}`
	} catch (error) {
		console.error('日期格式化失败:', error)
		return ''
	}
}

/**
 * 验证表单
 * @returns {boolean} 是否验证通过
 */
function validateForm() {
	let isValid = true

	// 重置错误
	errors.name = ''
	errors.coverUrl = ''
	errors.releaseDate = ''

	// 验证专辑名称
	if (!formData.name || formData.name.trim() === '') {
		errors.name = '专辑名称不能为空，请输入专辑名称'
		isValid = false
	}

	// 验证封面 URL 格式
	if (formData.coverUrl && formData.coverUrl.trim() !== '') {
		const urlPattern = /^https?:\/\/.+/
		if (!urlPattern.test(formData.coverUrl)) {
			errors.coverUrl = 'URL 格式无效，请输入以 http:// 或 https:// 开头的 URL'
			isValid = false
		}
	}

	// 验证发行日期格式
	if (formData.releaseDate) {
		const datePattern = /^\d{4}-\d{2}-\d{2}$/
		if (!datePattern.test(formData.releaseDate)) {
			errors.releaseDate = '日期格式无效，请选择有效的日期'
			isValid = false
		}
	}

	return isValid
}

/**
 * 检测数据是否有变更
 * @returns {boolean} 是否有变更
 */
function hasChanges() {
	if (!originalData.value) return true

	return (
		formData.name !== originalData.value.name ||
		formData.coverUrl !== originalData.value.coverUrl ||
		formData.description !== originalData.value.description ||
		formData.releaseDate !== originalData.value.releaseDate
	)
}

/**
 * 提交表单
 */
async function handleSubmit() {
	// 验证表单
	if (!validateForm()) {
		return
	}

	// 编辑模式：检查是否有变更
	if (props.mode === 'edit' && !hasChanges()) {
		toast.info('未检测到数据变更')
		return
	}

	submitting.value = true
	try {
		// 准备提交数据
		const submitData = {
			name: formData.name.trim(),
			coverUrl: formData.coverUrl.trim() || undefined,
			description: formData.description.trim() || undefined,
			releaseDate: formData.releaseDate || undefined,
		}

		// 调用 API
		if (props.mode === 'create') {
			await albumStore.createAlbum(submitData)
			toast.success('专辑创建成功')
		} else {
			await albumStore.updateAlbum(props.albumId, submitData)
			toast.success('专辑更新成功')
		}

		// 触发成功事件
		emit('success')

		// 关闭对话框
		emit('update:open', false)
	} catch (error) {
		console.error('提交失败:', error)
		toast.error(error.message || '操作失败，请稍后重试')
	} finally {
		submitting.value = false
	}
}

/**
 * 处理关闭对话框
 */
async function handleClose() {
	// 检查是否有未保存的修改
	if (hasChanges() && (formData.name || formData.coverUrl || formData.description || formData.releaseDate)) {
		try {
			await useConfirm({
				title: '放弃修改',
				message: '确定要放弃吗？未保存的数据将丢失。',
				type: 'warning',
				confirmText: '放弃',
				cancelText: '取消',
				confirmButtonType: 'danger',
			})
		} catch {
			// 用户取消，不关闭对话框
			return
		}
	}

	emit('update:open', false)
}
</script>
