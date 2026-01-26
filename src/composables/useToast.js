import { ref } from 'vue'

const toasts = ref([])

// 全局 toast 实例，供非 Vue 组件使用（如 request.js）
let globalToastInstance = null

/**
 * Toast 提示 composable
 * @example
 * const toast = useToast()
 * toast.success('操作成功')
 * toast.error('操作失败')
 */
export function useToast() {
  /**
   * 显示 Toast
   */
  function show(options) {
    const id = Date.now()

    const toast = {
      id,
      ...options,
      visible: true
    }

    toasts.value.push(toast)

    return id
  }

  /**
   * 成功提示
   */
  function success(message, duration = 3000) {
    return show({
      message,
      variant: 'success',
      duration
    })
  }

  /**
   * 错误提示
   */
  function error(message, duration = 5000) {
    return show({
      message,
      variant: 'error',
      duration
    })
  }

  /**
   * 警告提示
   */
  function warning(message, duration = 3000) {
    return show({
      message,
      variant: 'warning',
      duration
    })
  }

  /**
   * 信息提示
   */
  function info(message, duration = 3000) {
    return show({
      message,
      variant: 'info',
      duration
    })
  }

  /**
   * 关闭指定 Toast
   */
  function close(id) {
    const index = toasts.value.findIndex((t) => t.id === id)
    if (index !== -1) {
      toasts.value.splice(index, 1)
    }
  }

  /**
   * 关闭所有 Toast
   */
  function closeAll() {
    toasts.value = []
  }

  const instance = {
    toasts,
    show,
    success,
    error,
    warning,
    info,
    close,
    closeAll
  }

  // 保存全局实例
  if (!globalToastInstance) {
    globalToastInstance = instance
  }

  return instance
}

/**
 * 导出全局 toast 实例，供非 Vue 组件使用
 * @example
 * import { toast } from '@/composables/useToast'
 * toast.error('请求失败')
 */
export const toast = {
  success: (message, duration) => {
    if (!globalToastInstance) {
      console.warn('Toast instance not initialized. Call useToast() first.')
      return
    }
    return globalToastInstance.success(message, duration)
  },
  error: (message, duration) => {
    if (!globalToastInstance) {
      console.warn('Toast instance not initialized. Call useToast() first.')
      return
    }
    return globalToastInstance.error(message, duration)
  },
  warning: (message, duration) => {
    if (!globalToastInstance) {
      console.warn('Toast instance not initialized. Call useToast() first.')
      return
    }
    return globalToastInstance.warning(message, duration)
  },
  info: (message, duration) => {
    if (!globalToastInstance) {
      console.warn('Toast instance not initialized. Call useToast() first.')
      return
    }
    return globalToastInstance.info(message, duration)
  }
}
