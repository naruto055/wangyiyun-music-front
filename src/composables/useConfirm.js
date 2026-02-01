import { createApp, h } from 'vue'
import ConfirmDialog from '@/components/ui/confirm-dialog/ConfirmDialog.vue'

/**
 * 确认对话框
 * @param {Object} options - 配置选项
 * @param {string} options.title - 标题
 * @param {string} options.message - 消息内容
 * @param {string} options.type - 类型：'warning' | 'danger' | 'info'
 * @param {string} options.confirmText - 确认按钮文本
 * @param {string} options.cancelText - 取消按钮文本
 * @param {string} options.confirmButtonType - 确认按钮类型：'danger' | 'primary'
 * @returns {Promise} 确认时 resolve，取消时 reject
 *
 * @example
 * try {
 *   await useConfirm({
 *     title: '删除确认',
 *     message: '确定要删除这条记录吗？',
 *     type: 'danger',
 *     confirmText: '删除',
 *     cancelText: '取消'
 *   })
 *   // 用户点击了确认
 *   console.log('Confirmed')
 * } catch {
 *   // 用户点击了取消
 *   console.log('Cancelled')
 * }
 */
export function useConfirm(options = {}) {
	return new Promise((resolve, reject) => {
		// 创建容器
		const container = document.createElement('div')
		document.body.appendChild(container)

		// 清理函数
		const cleanup = () => {
			if (app) {
				app.unmount()
			}
			if (container && container.parentNode) {
				container.parentNode.removeChild(container)
			}
		}

		// 创建组件实例
		const app = createApp({
			render() {
				return h(ConfirmDialog, {
					title: options.title || '提示',
					message: options.message || '',
					type: options.type || 'warning',
					confirmText: options.confirmText || '确定',
					cancelText: options.cancelText || '取消',
					confirmButtonType: options.confirmButtonType || 'danger',
					onConfirm: () => {
						cleanup()
						resolve(true)
					},
					onCancel: () => {
						cleanup()
						reject(new Error('User cancelled'))
					},
				})
			},
		})

		// 挂载组件
		app.mount(container)
	})
}

/**
 * 快捷方法：警告确认（橙色图标）
 */
export function confirmWarning(message, title = '警告') {
	return useConfirm({
		title,
		message,
		type: 'warning',
		confirmButtonType: 'primary',
	})
}

/**
 * 快捷方法：危险确认（红色图标 + 红色按钮）
 */
export function confirmDanger(message, title = '危险操作') {
	return useConfirm({
		title,
		message,
		type: 'danger',
		confirmButtonType: 'danger',
	})
}

/**
 * 快捷方法：信息确认（蓝色图标）
 */
export function confirmInfo(message, title = '提示') {
	return useConfirm({
		title,
		message,
		type: 'info',
		confirmButtonType: 'primary',
	})
}
