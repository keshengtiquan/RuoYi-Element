import { get, getResult, post, postResult } from '@/utils/http'
import type { CaptchaResult, LoginResult, RouterVo, UserInfoResult } from './types'

// 类型定义统一放在 ./types，这里再导出一次，方便直接从 '@/api/auth' 引用
export type { CaptchaResult, LoginResult, MetaVo, RouterVo, UserInfoResult } from './types'

/** 验证码图片接口 */
export const captchaImage = () => {
  return getResult<CaptchaResult>('/captchaImage')
}

/** 登录接口 */
export const loginApi = (username: string, password: string, code: string, uuid: string) => {
  return postResult<LoginResult>('/login', { username, password, code, uuid })
}

/** 获取用户信息接口 */
export const getInfoApi = () => {
  return getResult<UserInfoResult>('/getInfo')
}

export const logoutApi = () => {
  return post('/logout')
}

/**
 * 获取路由信息接口。
 * 后端 SysLoginController#getRouters 用 AjaxResult.success(data) 返回，
 * 结构为 { code, msg, data: RouterVo[] }（有 data 包裹），
 * 因此用 get，返回值即 RouterVo[]。
 */
export const getRoutersApi = () => {
  return get<RouterVo[]>('/getRouters')
}
