import type { SysRole } from '@/types/entity'
import type { PageQuery, PageResult } from '@/types/http'

/**
 * 角色列表接口（GET /system/role/list）的类型定义。
 *
 * 后端：SysRoleController#list(SysRole role)
 *   startPage() + roleService.selectRoleList(role) → TableDataInfo
 * 权限：system:role:list
 */

/** 角色状态（sys_role.status：0 正常 / 1 停用） */
export type RoleStatus = '0' | '1'

/**
 * 创建时间范围。
 * 后端 SysRoleMapper.xml 的 selectRoleList 用 `params.beginTime` / `params.endTime` 过滤，
 * 所以这两个字段必须放在 params 里（qs 会序列化成 params[beginTime]=xxx）。
 */
export interface RoleListDateRange {
  /** 起始时间（yyyy-MM-dd） */
  beginTime?: string
  /** 结束时间（yyyy-MM-dd） */
  endTime?: string
}

/**
 * 角色列表查询参数。
 *
 * 后端把 query 参数直接绑到 SysRole 上，因此除分页参数外，
 * SysRole 上的字段都能当筛选条件；这里只列了 selectRoleList 真正用到的几个。
 */
export interface RoleListParams extends PageQuery {
  /** 角色ID（精确匹配） */
  roleId?: number
  /** 角色名称（模糊匹配） */
  roleName?: string
  /** 权限字符（模糊匹配） */
  roleKey?: string
  /** 角色状态：0 正常 / 1 停用 */
  status?: RoleStatus
  /** 创建时间范围（对应后端的 params.beginTime / params.endTime） */
  params?: RoleListDateRange
}

/**
 * 角色列表返回。
 * 后端 TableDataInfo 为 `{ code, msg, rows, total }`（rows / total 平铺在顶层，没有 data 包裹），
 * 结构与 PageResult 一致。
 */
export type RoleListResult = PageResult<SysRole>
