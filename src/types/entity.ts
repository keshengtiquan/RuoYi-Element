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

/** 操作日志对象 SysOperLog（对应表 sys_oper_log） */
export interface SysOperLog {
  /** 日志主键 */
  operId: number
  /** 操作模块 */
  title: string
  /** 业务类型（0其它 1新增 2修改 3删除 4授权 5导出 6导入 7强退 8生成代码 9清空数据，字典 sys_oper_type） */
  businessType: number
  /** 业务类型数组（后端 SysOperLog.businessTypes，用于 in 查询） */
  businessTypes: number[]
  /** 请求方法（全限定类名.方法名） */
  method: string
  /** 请求方式（GET / POST / PUT / DELETE） */
  requestMethod: string
  /** 操作类别（0其它 1后台用户 2手机端用户） */
  operatorType: number
  /** 操作人员 */
  operName: string
  /** 部门名称 */
  deptName: string
  /** 请求url */
  operUrl: string
  /** 操作地址（IP） */
  operIp: string
  /** 操作地点 */
  operLocation: string
  /** 请求参数 */
  operParam: string
  /** 返回参数 */
  jsonResult: string
  /** 操作状态（0正常 1异常，字典 sys_common_status） */
  status: number
  /** 错误消息 */
  errorMsg: string
  /** 操作时间（后端 @JsonFormat yyyy-MM-dd HH:mm:ss） */
  operTime: string
  /** 消耗时间（毫秒） */
  costTime: number
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
