import type { SysRole } from '@/types/entity'
import { getPage } from '@/utils/http'
import type { RoleListParams, RoleListResult } from './types'

// 类型定义统一放在 ./types，这里再导出一次，方便直接从 '@/api/role' 引用
export type { RoleListDateRange, RoleListParams, RoleListResult, RoleStatus } from './types'

/**
 * 查询角色列表（分页）。
 *
 * GET /system/role/list，需要权限 system:role:list。
 * 后端返回 TableDataInfo（rows / total 平铺在顶层），所以用 getPage，
 * 拿到的是 `{ code, msg, rows: SysRole[], total }`。
 *
 * 分页参数是后端 PageDomain 的 pageNum（从 1 开始）/ pageSize；
 * 页面上的 PaginationConfig 用的是 current / size，取值时要换算：
 * pageNum = current，pageSize = size。
 *
 * @example
 * const { rows, total } = await getRoleListApi({
 *   pageNum: 1,
 *   pageSize: 10,
 *   roleName: '管理',
 *   status: '0',
 *   params: { beginTime: '2026-01-01', endTime: '2026-12-31' }
 * })
 */
export const getRoleListApi = (params?: RoleListParams): Promise<RoleListResult> => {
  return getPage<SysRole>('/system/role/list', params)
}
