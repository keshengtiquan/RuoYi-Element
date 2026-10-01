/**
 * RuoYi 后端实体类型定义（与后端 Java 实体字段一一对应）
 */

/** 部门对象 SysDept */
export interface SysDept {
  deptId: number
  parentId: number
  ancestors: string
  deptName: string
  orderNum: number
  leader: string
  phone: string
  email: string
  status: string
  delFlag: string
  createBy: string
  createTime: string
  updateBy: string
  updateTime: string
}

/** 角色对象 SysRole */
export interface SysRole {
  roleId: number
  roleName: string
  roleKey: string
  roleSort: number
  dataScope: string
  menuCheckStrictly: boolean
  deptCheckStrictly: boolean
  status: string
  delFlag: string
  flag: boolean
  remark: string
  createBy: string
  createTime: string
  updateBy: string
  updateTime: string
}

/** 用户对象 SysUser */
export interface SysUser {
  userId: number
  deptId: number
  userName: string
  nickName: string
  email: string
  phonenumber: string
  sex: string
  avatar: string
  status: string
  delFlag: string
  loginIp: string
  loginDate: string
  pwdUpdateDate: string
  dept: SysDept
  roles: SysRole[]
  roleIds: number[]
  postIds: number[]
  roleId: number
  createBy: string
  createTime: string
  updateBy: string
  updateTime: string
  remark: string
}
