import type { SysUser } from '@/types/entity'
import type { PageQuery, PageResult } from '@/types/http'

/**
 * 用户管理接口（/system/user/*）的类型定义。
 *
 * 后端：SysUserController
 *   list         GET    /system/user/list                 权限 system:user:list
 *   deptTree     GET    /system/user/deptTree             权限 system:user:list（左侧部门树，见 @/api/system/dept）
 *   getInfo      GET    /system/user/{userId}             权限 system:user:query
 *   add          POST   /system/user                      权限 system:user:add
 *   edit         PUT    /system/user                      权限 system:user:edit
 *   remove       DELETE /system/user/{userIds}            权限 system:user:remove
 *   resetPwd     PUT    /system/user/resetPwd             权限 system:user:resetPwd
 *   changeStatus PUT    /system/user/changeStatus         权限 system:user:edit
 *   export       POST   /system/user/export               权限 system:user:export
 */

/** 用户状态（sys_user.status：0 正常 / 1 停用） */
export type UserStatus = '0' | '1'

/**
 * 创建时间范围。
 * 后端 SysUserMapper.xml 的 selectUserList 用 `params.beginTime` / `params.endTime` 过滤 create_time，
 * 所以这两个字段必须放在 params 里（qs 会序列化成 params[beginTime]=xxx）。
 */
export interface UserListDateRange {
  /** 起始时间（yyyy-MM-dd） */
  beginTime?: string
  /** 结束时间（yyyy-MM-dd） */
  endTime?: string
}

/**
 * 用户列表查询参数。
 *
 * 后端把 query 直接绑到 SysUser 上，因此除分页参数外，SysUser 上的字段都能当筛选条件；
 * 这里只列了 selectUserList 真正用到的几个。
 */
export interface UserListParams extends PageQuery {
  /** 用户ID（精确匹配） */
  userId?: number
  /**
   * 部门ID。
   * 后端除了匹配自身，还会带上该部门的所有下级部门
   * （selectUserList 里 `u.dept_id = #{deptId} or u.dept_id in (select dept_id from sys_dept where find_in_set(#{deptId}, ancestors))`），
   * 所以点左侧父级部门也能查到子部门的人。
   */
  deptId?: number
  /** 用户名称 / 登录账号（模糊匹配） */
  userName?: string
  /** 手机号码（模糊匹配） */
  phonenumber?: string
  /** 用户状态：0 正常 / 1 停用 */
  status?: UserStatus
  /** 创建时间范围（对应后端的 params.beginTime / params.endTime） */
  params?: UserListDateRange
}

/**
 * 用户列表返回。
 * 后端 TableDataInfo 为 `{ code, msg, rows, total }`（rows / total 平铺在顶层，没有 data 包裹），
 * 结构与 PageResult 一致。
 */
export type UserListResult = PageResult<SysUser>

/** 修改用户状态 / 重置密码等「只改一个字段」的入参 */
export interface UserStatusPayload {
  userId: number
  status: UserStatus
}

/** 重置密码入参（后端 SysUserController#resetPwd） */
export interface UserResetPwdPayload {
  userId: number
  /** 明文密码，后端会做 BCrypt 加密 */
  password: string
}
