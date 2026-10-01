import axios, {
  type AxiosError,
  type AxiosRequestConfig,
  type AxiosResponse,
  type InternalAxiosRequestConfig
} from 'axios'
import { ElMessage } from 'element-plus'
import qs from 'qs'
import type { ApiResult, PageResult } from '@/types/http'
import { REQUEST_TIMEOUT, SUCCESS_CODE, UNAUTHORIZED_CODE } from '@/constants/auth'
import { getToken } from '../auth'

/** 环境变量：API 基础路径、是否跨域携带 Cookie */
const { VITE_API_URL, VITE_WITH_CREDENTIALS } = import.meta.env

// 注意：进度条（NProgress）统一由 @/utils/progress 管理，路由守卫负责 start/done。
// 这里不要自行 start/done —— NProgress 是单例且无引用计数，
// 拦截器里提前 done() 会把正在进行的路由进度条掐断。若确需请求驱动进度条，
// 请在 @/utils/progress 内补引用计数后统一暴露方法。

const service = axios.create({
  baseURL: VITE_API_URL,
  timeout: REQUEST_TIMEOUT,
  withCredentials: VITE_WITH_CREDENTIALS === 'true',
  headers: {
    'Content-Type': 'application/json;charset=utf-8'
  },
  // 序列化 query 参数：数组用 brackets 形式，如 a[]=1&a[]=2
  paramsSerializer: (params) => qs.stringify(params, { arrayFormat: 'brackets' })
})

// ---------------------------------------------------------------------------
// 请求拦截器
// ---------------------------------------------------------------------------
service.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error: AxiosError) => Promise.reject(error)
)

// ---------------------------------------------------------------------------
// 响应拦截器
//
// 说明：这里统一把 axios 的 AxiosResponse 剥掉，直接返回后端业务体 ApiResult。
// 因此下方 request<T> 拿到的是 ApiResult<T> 而非 AxiosResponse<ApiResult<T>>。
// 由于 axios 拦截器签名要求返回 AxiosResponse，这里用 as 断言绕过（业界通用做法），
// 运行时实际返回的是 ApiResult 业务体。
// ---------------------------------------------------------------------------
service.interceptors.response.use(
  (response: AxiosResponse<ApiResult>) => {
    const res = response.data

    // 二进制流（文件下载等）直接放行完整响应，交由调用方处理 Blob
    const responseType = response.config.responseType
    const isBlob = responseType === 'blob' || responseType === 'arraybuffer'
    if (isBlob) {
      return response as unknown as AxiosResponse<ApiResult>
    }

    // 非标准结构（无 code 字段），视为后端直接返回的数据，原样透传
    if (res == null || typeof res !== 'object' || !('code' in res)) {
      return res as unknown as AxiosResponse<ApiResult>
    }

    // 业务成功：返回完整业务体，data 交由 request 层取出
    if (res.code === SUCCESS_CODE) {
      return res as unknown as AxiosResponse<ApiResult>
    }

    // 登录失效
    if (res.code === UNAUTHORIZED_CODE) {
      ElMessage.error(res.msg || '登录状态已失效，请重新登录')
      // TODO: 跳转登录 / 清理 token / 刷新令牌
      return Promise.reject(new Error(res.msg || 'Unauthorized'))
    }

    // 其他业务错误
    ElMessage.error(res.msg || '请求失败')
    return Promise.reject(new Error(res.msg || `Error code ${res.code}`))
  },
  (error: AxiosError<ApiResult>) => {
    // HTTP 层错误（网络错误、超时、4xx/5xx 等）
    const status = error.response?.status
    const msg = error.response?.data?.msg

    let message = '网络异常，请稍后重试'
    if (status) {
      const statusMap: Record<number, string> = {
        400: '请求参数错误',
        401: '未授权，请重新登录',
        403: '拒绝访问',
        404: '请求地址不存在',
        405: '请求方法不允许',
        408: '请求超时',
        500: '服务器内部错误',
        502: '网关错误',
        503: '服务不可用',
        504: '网关超时'
      }
      message = msg || statusMap[status] || `请求错误（${status}）`
    } else if (error.code === 'ECONNABORTED') {
      message = '请求超时，请稍后重试'
    }

    if (status === UNAUTHORIZED_CODE) {
      ElMessage.error('登录状态已失效，请重新登录')
      // TODO: 跳转登录
    } else {
      ElMessage.error(message)
    }

    return Promise.reject(error)
  }
)

// ---------------------------------------------------------------------------
// 统一请求入口
//
// 返回值语义：
// - 业务层调用 get<T>/post<T> 拿到的是后端 ApiResult 的 data 字段（即真正业务数据）。
// - 分页接口用 getPage<T>，拿到 PageResult<T>（rows + total）。
// - 下载接口 download 拿到 Blob。
// ---------------------------------------------------------------------------

/**
 * 通用请求（底层）：返回后端完整业务体 ApiResult<T>。
 * 大多数接口用 request（取 data），需要完整结果体（如验证码平铺字段）时用 requestResult。
 */
async function requestResult<T = unknown>(config: AxiosRequestConfig): Promise<ApiResult<T>> {
  return await service.request<ApiResult<T>, ApiResult<T>>(config)
}

/**
 * 通用请求：从 ApiResult<T> 中取出 data 返回（覆盖绝大多数业务接口）。
 */
async function request<T = unknown>(config: AxiosRequestConfig): Promise<T> {
  const res = await requestResult<T>(config)
  return res.data as T
}

/** GET 请求 */
export function get<T = unknown>(
  url: string,
  params?: object,
  config?: AxiosRequestConfig
): Promise<T> {
  return request<T>({ url, method: 'get', params, ...config })
}

/**
 * GET 请求（返回完整响应体，不做 data 剥离）。
 * 用于后端字段平铺在结果体顶层（而非 data 里）的接口，例如验证码 /captchaImage。
 * 泛型 T 即完整返回体结构（含 code/msg 及顶层字段）。
 */
export function getResult<T = unknown>(
  url: string,
  params?: object,
  config?: AxiosRequestConfig
): Promise<T> {
  return requestResult<T>({ url, method: 'get', params, ...config }) as unknown as Promise<T>
}

/** POST 请求 */
export function post<T = unknown>(
  url: string,
  data?: object,
  config?: AxiosRequestConfig
): Promise<T> {
  return request<T>({ url, method: 'post', data, ...config })
}

/**
 * POST 请求（返回完整响应体，不做 data 剥离）。
 * 用于后端字段平铺在结果体顶层（而非 data 里）的接口，例如登录 /login 返回的 token。
 * 泛型 T 即完整返回体结构（含 code/msg 及顶层字段）。
 */
export function postResult<T = unknown>(
  url: string,
  data?: object,
  config?: AxiosRequestConfig
): Promise<T> {
  return requestResult<T>({ url, method: 'post', data, ...config }) as unknown as Promise<T>
}

/** PUT 请求 */
export function put<T = unknown>(
  url: string,
  data?: object,
  config?: AxiosRequestConfig
): Promise<T> {
  return request<T>({ url, method: 'put', data, ...config })
}

/** DELETE 请求 */
export function del<T = unknown>(
  url: string,
  params?: object,
  config?: AxiosRequestConfig
): Promise<T> {
  return request<T>({ url, method: 'delete', params, ...config })
}

/** PATCH 请求 */
export function patch<T = unknown>(
  url: string,
  data?: object,
  config?: AxiosRequestConfig
): Promise<T> {
  return request<T>({ url, method: 'patch', data, ...config })
}

/**
 * 分页查询：后端返回 TableDataInfo，rows / total 平铺在顶层（无 data 包裹）：
 * { code, msg, rows, total }
 * 因此用 getResult 拿完整响应体，业务层直接取 rows / total。
 */
export function getPage<T = unknown>(
  url: string,
  params?: object,
  config?: AxiosRequestConfig
): Promise<PageResult<T>> {
  return getResult<PageResult<T>>(url, params, config)
}

/** 文件下载（返回 Blob，配合前端生成下载链接） */
export function download(url: string, params?: object, config?: AxiosRequestConfig): Promise<Blob> {
  return request<Blob>({
    url,
    method: 'get',
    params,
    responseType: 'blob',
    ...config
  })
}

/** 文件上传（multipart/form-data） */
export function upload<T = unknown>(
  url: string,
  data?: FormData,
  config?: AxiosRequestConfig
): Promise<T> {
  return request<T>({
    url,
    method: 'post',
    data,
    headers: { 'Content-Type': 'multipart/form-data' },
    ...config
  })
}

export default service
