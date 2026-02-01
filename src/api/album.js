import request from '@/utils/request'

/**
 * 专辑管理相关接口
 */

/**
 * 分页查询专辑列表
 * @param {Object} params - 查询参数
 * @param {number} params.pageNum - 页码，默认 1
 * @param {number} params.pageSize - 每页大小，默认 12
 * @param {string} params.keyword - 关键词（专辑名称），可选
 * @param {string} params.sortField - 排序字段，默认 release_date
 * @param {string} params.sortOrder - 排序方式（asc/desc），默认 desc
 * @returns {Promise} 返回分页数据 { records, total, pages, current, size }
 */
export function getAlbumList(params) {
	return request({
		url: '/album/list',
		method: 'get',
		params,
	})
}

/**
 * 获取专辑详情
 * @param {number} id - 专辑ID
 * @returns {Promise} 返回专辑详情对象（包含歌曲数量等）
 */
export function getAlbumDetail(id) {
	return request({
		url: `/album/${id}`,
		method: 'get',
	})
}

/**
 * 创建专辑
 * @param {Object} data - 专辑数据
 * @param {string} data.name - 专辑名称（必填，最大长度 200）
 * @param {string} data.coverUrl - 封面 URL（可选，最大长度 500）
 * @param {string} data.description - 专辑简介（可选，最大长度 1000）
 * @param {string} data.releaseDate - 发行日期（可选，格式 YYYY-MM-DD）
 * @returns {Promise} 返回创建的专辑对象
 */
export function createAlbum(data) {
	return request({
		url: '/album',
		method: 'post',
		data,
	})
}

/**
 * 更新专辑信息
 * @param {number} id - 专辑ID
 * @param {Object} data - 专辑数据（字段同创建接口）
 * @returns {Promise} 返回更新后的专辑对象
 */
export function updateAlbum(id, data) {
	return request({
		url: `/album/${id}`,
		method: 'put',
		data,
	})
}

/**
 * 删除专辑
 * @param {number} id - 专辑ID
 * @returns {Promise} 返回删除结果
 */
export function deleteAlbum(id) {
	return request({
		url: `/album/${id}`,
		method: 'delete',
	})
}
