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
 * 分页查询公共参数（对应后端 PageDomain）。
 * 各列表接口（/system/role/list、/system/user/list …）都带这几个参数。
 */
export interface PageQuery {
  /** 当前页码，从 1 开始 */
  pageNum?: number
  /** 每页显示条数 */
  pageSize?: number
  /** 排序列（驼峰，后端会转成下划线，需与后端字段对应） */
  orderByColumn?: string
  /** 排序方向（后端兼容 asc / desc 与 ascending / descending） */
  isAsc?: 'asc' | 'desc' | 'ascending' | 'descending'
  /** 页码超出范围时是否返回首页（后端默认 true） */
  reasonable?: boolean
}

/**
 * 请求方法类型
 */
export type HttpMethod = 'get' | 'post' | 'put' | 'delete' | 'patch'
