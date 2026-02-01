import axios from 'axios'
import { toast } from '@/composables/useToast'

/**
 * Axios 请求实例封装
 * 功能：统一请求/响应拦截、错误处理
 */

// 创建 axios 实例
const request = axios.create({
	baseURL: '/api', // 使用 Vite 代理，无需完整 URL
	timeout: 120000, // 请求超时时间（120秒，视频解析需要较长时间）
	headers: {
		'Content-Type': 'application/json;charset=UTF-8',
	},
})

/**
 * 请求拦截器
 * 功能：添加 timestamp 防止缓存、统一配置请求头
 */
request.interceptors.request.use(
	(config) => {
		// 添加时间戳防止缓存（GET 请求）
		// 可通过 config.skipCacheTTL 禁用
		if (config.method === 'get' && !config.skipCacheTTL) {
			config.params = {
				...config.params,
				_t: Date.now(),
			}
		}

		// 可以在这里添加 token 等认证信息
		// const token = localStorage.getItem('token')
		// if (token) {
		//   config.headers.Authorization = `Bearer ${token}`
		// }

		return config
	},
	(error) => {
		console.error('请求错误:', error)
		return Promise.reject(error)
	}
)

/**
 * 响应拦截器
 * 功能：统一处理响应数据、统一错误处理
 */
request.interceptors.response.use(
	(response) => {
		const { data } = response

		// 后端统一返回格式：{ code: 200, message: '操作成功', data: ... }
		// 判断响应状态码
		if (data.code === 200) {
			// 成功：直接返回 data 字段
			return data.data
		} else {
			// 失败：显示错误提示
			toast.error(data.message || '请求失败')
			return Promise.reject(new Error(data.message || '请求失败'))
		}
	},
	(error) => {
		console.error('响应错误:', error)

		// 处理 HTTP 状态码错误
		if (error.response) {
			const { status } = error.response

			switch (status) {
				case 400:
					toast.error('请求参数错误')
					break
				case 401:
					toast.error('未授权，请重新登录')
					// 可以在这里跳转到登录页
					break
				case 403:
					toast.error('拒绝访问')
					break
				case 404:
					toast.error('请求的资源不存在')
					break
				case 500:
					toast.error('服务器内部错误')
					break
				default:
					toast.error(`请求失败: ${status}`)
			}

			return Promise.reject(error)
		}

		// 网络错误或超时
		if (error.message.includes('timeout')) {
			toast.error('请求超时，请检查网络连接')
		} else if (error.message.includes('Network Error')) {
			toast.error('网络错误，请检查网络连接')
		}

		return Promise.reject(error)
	}
)

export default request
