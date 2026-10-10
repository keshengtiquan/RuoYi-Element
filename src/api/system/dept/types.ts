import type { SysDept } from '@/types/entity'

/**
 * 部门相关接口的类型定义。
 *
 * 后端：SysDeptController / SysUserController#deptTree
 *   tree  GET /system/user/deptTree  权限 system:user:list（用户管理左侧部门树专用，直接返回 TreeSelect 结构）
 *   list  GET /system/dept/list      权限 system:dept:list（部门管理页用，返回平铺的 SysDept 列表）
 */

/**
 * 部门树节点（后端 TreeSelect 结构）。
 *
 * `SysDeptServiceImpl#selectDeptTreeList` 把 SysDept 列表组装成 TreeSelect：
 * `{ id, label, children }`，所以字段名不是 deptId / deptName。
 */
export interface DeptTreeNode {
  /** 部门ID（对应 SysDept.deptId） */
  id: number
  /** 部门名称（对应 SysDept.deptName） */
  label: string
  /** 子部门 */
  children?: DeptTreeNode[]
}

/**
 * 部门树查询参数。
 *
 * 后端签名是 `deptTree(SysDept dept)`，没有 @RequestBody，
 * 所以只能从 query 上带过滤条件（当前页面用前端过滤，这里保留参数以备后台过滤场景）。
 */
export interface DeptTreeParams {
  /** 部门名称（模糊匹配） */
  deptName?: string
  /** 部门状态：0 正常 / 1 停用 */
  status?: string
}

/** 部门列表返回（GET /system/dept/list 的 rows） */
export type DeptListResult = SysDept[]
