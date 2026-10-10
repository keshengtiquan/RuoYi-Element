import { get } from '@/utils/http'
import type { DeptTreeNode, DeptTreeParams } from './types'

// 类型定义统一放在 ./types，这里再导出一次，方便直接从 '@/api/system/dept' 引用
export type { DeptListResult, DeptTreeNode, DeptTreeParams } from './types'

/**
 * 查询部门树（用户管理左侧那棵树）。
 *
 * GET /system/user/deptTree，需要权限 system:user:list。
 * 后端返回 AjaxResult（`{ code, msg, data }`），data 是 TreeSelect 数组
 * `[{ id, label, children }]`，所以用 get 取 data 即可。
 *
 * 说明：这是用户管理页的专用接口（SysUserController#deptTree），
 * 相比 /system/dept/list 少一次「平铺列表 → 树」的前端组装。
 *
 * @example
 * const tree = await getDeptTreeApi()
 */
export const getDeptTreeApi = (params?: DeptTreeParams): Promise<DeptTreeNode[]> => {
  return get<DeptTreeNode[]>('/system/user/deptTree', params)
}
