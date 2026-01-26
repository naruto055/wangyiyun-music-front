import { ref, watch } from 'vue'

/**
 * 防抖函数 composable
 * @param {Function} fn - 需要防抖的函数
 * @param {number} delay - 延迟时间（毫秒）
 * @returns {Function} - 防抖后的函数
 *
 * @example
 * const debouncedSearch = useDebounceFn((value) => {
 *   console.log('搜索:', value)
 * }, 500)
 *
 * debouncedSearch('keyword')
 */
export function useDebounceFn(fn, delay = 300) {
	let timeout = null

	return function (...args) {
		if (timeout) {
			clearTimeout(timeout)
		}

		timeout = setTimeout(() => {
			fn.apply(this, args)
		}, delay)
	}
}

/**
 * 防抖值 composable
 * @param {any} value - 需要防抖的值
 * @param {number} delay - 延迟时间（毫秒）
 * @returns {Ref} - 防抖后的值
 *
 * @example
 * const searchKeyword = ref('')
 * const debouncedKeyword = useDebounceValue(searchKeyword, 500)
 *
 * watch(debouncedKeyword, (newVal) => {
 *   console.log('执行搜索:', newVal)
 * })
 */
export function useDebounceValue(value, delay = 300) {
	const debouncedValue = ref(value.value)

	let timeout = null

	watch(
		value,
		(newValue) => {
			if (timeout) {
				clearTimeout(timeout)
			}

			timeout = setTimeout(() => {
				debouncedValue.value = newValue
			}, delay)
		},
		{ immediate: true }
	)

	return debouncedValue
}
