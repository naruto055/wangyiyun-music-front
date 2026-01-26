import request from '@/utils/request'

/**
 * 音乐管理相关接口
 */

/**
 * 分页查询音乐列表
 * @param {Object} params - 查询参数
 * @param {number} params.pageNum - 页码，默认 1
 * @param {number} params.pageSize - 每页大小，默认 10
 * @param {number} params.categoryId - 分类ID，可选
 * @param {string} params.keyword - 关键词（歌曲名/歌手名），可选
 * @param {string} params.sortField - 排序字段，默认 create_time
 * @param {string} params.sortOrder - 排序方式（asc/desc），默认 desc
 * @returns {Promise} 返回分页数据 { records, total, pages, current, size }
 */
export function getMusicList(params) {
  return request({
    url: '/music/list',
    method: 'get',
    params
  })
}

/**
 * 获取音乐详情
 * @param {number} id - 音乐ID
 * @returns {Promise} 返回音乐详情对象（包含歌手、标签等）
 */
export function getMusicDetail(id) {
  return request({
    url: `/music/${id}`,
    method: 'get'
  })
}
