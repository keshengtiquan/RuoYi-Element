import type { SysUser } from '@/types/entity'
import { del, getPage, post, put } from '@/utils/http'
import type {
  UserListParams,
  UserListResult,
  UserResetPwdPayload,
  UserStatusPayload
} from './types'

// 类型定义统一放在 ./types，这里再导出一次，方便直接从 '@/api/system/user' 引用
export type {
  UserListDateRange,
  UserListParams,
  UserListResult,
  UserResetPwdPayload,
  UserStatus,
  UserStatusPayload
} from './types'

/**
 * 查询用户列表（分页）。
 *
 * GET /system/user/list，需要权限 system:user:list。
 * 后端返回 TableDataInfo（rows / total 平铺在顶层），所以用 getPage，
 * 拿到的是 `{ code, msg, rows: SysUser[], total }`。
 *
 * @example
 * const { rows, total } = await getUserListApi({
 *   pageNum: 1,
 *   pageSize: 20,
 *   deptId: 103,
 *   userName: 'admin',
 *   params: { beginTime: '2026-01-01', endTime: '2026-01-31' }
 * })
 */
export const getUserListApi = (params?: UserListParams): Promise<UserListResult> => {
  return getPage<SysUser>('/system/user/list', params)
}

/**
 * 修改用户状态。
 *
 * PUT /system/user/changeStatus，需要权限 system:user:edit。
 * 后端签名是 `changeStatus(@RequestBody SysUser user)`，所以参数放在请求体里。
 *
 * @example
 * await changeUserStatusApi({ userId: 2, status: '1' })
 */
export const changeUserStatusApi = (data: UserStatusPayload): Promise<void> => {
  return put<void>('/system/user/changeStatus', data)
}

/**
 * 删除用户（支持批量）。
 *
 * DELETE /system/user/{userIds}，需要权限 system:user:remove。
 * 后端签名是 `@PathVariable Long[] userIds`，多个 id 用英文逗号拼在路径上。
 *
 * @example
 * await deleteUserApi([2, 3])
 */
export const deleteUserApi = (userIds: number | number[]): Promise<void> => {
  const ids = Array.isArray(userIds) ? userIds.join(',') : userIds
  return del<void>(`/system/user/${ids}`)
}

/**
 * 重置用户密码。
 *
 * PUT /system/user/resetPwd，需要权限 system:user:resetPwd。
 *
 * @example
 * await resetUserPwdApi({ userId: 2, password: '123456' })
 */
export const resetUserPwdApi = (data: UserResetPwdPayload): Promise<void> => {
  return put<void>('/system/user/resetPwd', data)
}

/**
 * 导出用户（按当前筛选条件，不分页）。
 *
 * POST /system/user/export，需要权限 system:user:export；返回 Excel 二进制流。
 *
 * 参数放在 URL query 上而不是请求体里：后端签名是 `export(HttpServletResponse response, SysUser user)`，
 * 没有 @RequestBody，Spring 只从 query / form 参数绑定，放 body 里的 JSON 会被忽略。
 */
export const exportUserApi = (params?: UserListParams): Promise<Blob> => {
  return post<Blob>('/system/user/export', undefined, { params, responseType: 'blob' })
}
