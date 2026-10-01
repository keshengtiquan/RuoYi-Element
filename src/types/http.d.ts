/**
 * 后端统一响应结构
 * 约定：RuoYi 后端（AjaxResult / R）JSON 返回格式为 { code, msg, data }
 * 成功码 code === 200
 */
export interface ApiResult<T = unknown> {
  /** 业务状态码，200 表示成功 */
  code: number
  /** 提示信息 */
  msg: string
  /** 数据载荷（注意：后端 data 为 null 时此字段可能不存在） */
  data?: T
}

/**
 * 分页查询结果
 * 约定：RuoYi 后端 TableDataInfo 返回 { code, msg, rows, total }，无 data 字段
 */
export interface PageResult<T = unknown> {
  /** 业务状态码，200 表示成功 */
  code: number
  /** 提示信息 */
  msg: string
  /** 当前页数据 */
  rows: T[]
  /** 总条数 */
  total: number
}

/**
 * 请求方法类型
 */
export type HttpMethod = 'get' | 'post' | 'put' | 'delete' | 'patch'
