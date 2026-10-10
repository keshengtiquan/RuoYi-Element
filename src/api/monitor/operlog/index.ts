import type { SysOperLog } from '@/types/entity'
import { del, getPage, post } from '@/utils/http'
import type { OperLogListParams, OperLogListResult } from './types'

// 类型定义统一放在 ./types，这里再导出一次，方便直接从 '@/api/monitor/operlog' 引用
export type {
  OperBusinessType,
  OperLogListDateRange,
  OperLogListParams,
  OperLogListResult,
  OperStatus
} from './types'

/**
 * 查询操作日志列表（分页）。
 *
 * GET /monitor/operlog/list，需要权限 monitor:operlog:list。
 * 后端返回 TableDataInfo（rows / total 平铺在顶层），所以用 getPage，
 * 拿到的是 `{ code, msg, rows: SysOperLog[], total }`。
 *
 * 分页参数是后端 PageDomain 的 pageNum（从 1 开始）/ pageSize；
 * 页面上的 PaginationConfig 用的是 current / size，取值时要换算：
 * pageNum = current，pageSize = size。
 *
 * @example
 * const { rows, total } = await getOperLogListApi({
 *   pageNum: 1,
 *   pageSize: 10,
 *   title: '用户管理',
 *   businessType: 2,
 *   status: 1,
 *   params: { beginTime: '2026-01-01 00:00:00', endTime: '2026-01-31 23:59:59' }
 * })
 */
export const getOperLogListApi = (params?: OperLogListParams): Promise<OperLogListResult> => {
  return getPage<SysOperLog>('/monitor/operlog/list', params)
}

/**
 * 删除操作日志（支持批量）。
 *
 * DELETE /monitor/operlog/{operIds}，需要权限 monitor:operlog:remove。
 * 后端签名是 `@PathVariable Long[] operIds`，所以多个 id 用英文逗号拼在路径上：
 * `/monitor/operlog/1,2,3`。
 *
 * @example
 * await deleteOperLogApi([1, 2, 3])
 */
export const deleteOperLogApi = (operIds: number | number[]): Promise<void> => {
  const ids = Array.isArray(operIds) ? operIds.join(',') : operIds
  return del<void>(`/monitor/operlog/${ids}`)
}

/**
 * 清空操作日志（后端是 truncate 表，不可恢复）。
 *
 * DELETE /monitor/operlog/clean，需要权限 monitor:operlog:remove。
 * 注意：Spring 会把 `/clean` 优先匹配到 clean()，而不是 remove() 的 `/{operIds}`。
 */
export const cleanOperLogApi = (): Promise<void> => {
  return del<void>('/monitor/operlog/clean')
}

/**
 * 导出操作日志（按当前筛选条件，不分页）。
 *
 * POST /monitor/operlog/export，需要权限 monitor:operlog:export；返回 Excel 二进制流。
 *
 * 参数放在 URL query 上而不是请求体里：后端签名是 `export(SysOperLog operLog)`，
 * 没有 @RequestBody，Spring 只从 query / form 参数绑定，放 body 里的 JSON 会被忽略。
 */
export const exportOperLogApi = (params?: OperLogListParams): Promise<Blob> => {
  return post<Blob>('/monitor/operlog/export', undefined, { params, responseType: 'blob' })
}
