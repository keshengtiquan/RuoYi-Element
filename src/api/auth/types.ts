import type { SysUser } from '@/types/entity'

/**
 * 验证码图片接口返回。
 * 后端 CaptchaController 返回 AjaxResult，字段平铺在顶层（无 data 包裹）：
 * { code, msg, captchaEnabled, uuid, img }
 */
export interface CaptchaResult {
  code: number
  msg: string
  captchaEnabled: boolean
  uuid: string
  img: string
}

/**
 * 登录接口返回。
 * 后端 SysLoginController#login 返回 AjaxResult，token 平铺在顶层（无 data 包裹）：
 * { code, msg, token }
 */
export interface LoginResult {
  code: number
  msg: string
  token: string
}

/**
 * 获取用户信息接口返回。
 * 后端 SysLoginController#getInfo 返回 AjaxResult，字段平铺在顶层（无 data 包裹）：
 * { code, msg, user, roles, permissions, pwdChrtype, isDefaultModifyPwd, isPasswordExpired }
 * 其中 roles / permissions 是 Set<String>，序列化为 string[]。
 */
export interface UserInfoResult {
  code: number
  msg: string
  user: SysUser
  roles: string[]
  permissions: string[]
  pwdChrtype: string
  isDefaultModifyPwd: boolean
  isPasswordExpired: boolean
}

/**
 * 路由显示信息（对应后端 MetaVo）。
 * 注意：MetaVo 未标 @JsonInclude，为 null 的字段仍会输出，故 icon / link 可能为 null。
 */
export interface MetaVo {
  /** 菜单标题，用于侧边栏与面包屑展示 */
  title: string
  /** 菜单图标 */
  icon?: string | null
  /** 是否不被 <keep-alive> 缓存 */
  noCache?: boolean
  /** 内链地址（http(s):// 开头） */
  link?: string | null
}

/**
 * 路由配置信息（对应后端 RouterVo）。
 * 注意：后端标了 @JsonInclude(JsonInclude.Include.NON_EMPTY)，
 * 值为空（null / 空串 / 空集合 / 空数组）的字段会被省略，因此除 path 外字段多为可选。
 */
export interface RouterVo {
  /** 路由名字（首字母大写的驼峰，如 System、SystemUser） */
  name?: string
  /** 路由地址 */
  path: string
  /** 是否隐藏路由（true 时不在侧边栏出现） */
  hidden?: boolean
  /** 重定向地址，为 'noRedirect' 时面包屑中不可点击 */
  redirect?: string
  /** 组件地址 */
  component?: string
  /** 路由参数（JSON 字符串，如 '{"id":1,"name":"ry"}'） */
  query?: string
  /** 当子路由超过 1 个时是否始终显示父级 */
  alwaysShow?: boolean
  /** 路由元信息 */
  meta?: MetaVo
  /** 子路由 */
  children?: RouterVo[]
}
