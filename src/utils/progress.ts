import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

/**
 * 全局顶部进度条：统一入口。
 *
 * 为什么必须收敛到这一个文件？
 * 1. NProgress 是单例，且 nprogress 内部没有引用计数；
 * 2. NProgress.start() 会递归 setTimeout 挂一个 trickle 定时器，它的退出条件是
 *    `if (!NProgress.status) return`，而 status 只有在 set(1)（即 done()）时才被置为 null。
 *    换句话说：**只要有一条路径 start 了却没 done，定时器就会无限循环、进度条永不消失**，
 *    同时还会造成不必要的定时器开销。
 * 3. 因此这里把 NProgress 的配置、start、done 全部收口，路由守卫只调用
 *    startProgress / doneProgress，不允许在别处直接 import nprogress。
 *    若将来需要「HTTP 请求也驱动进度条」，必须在本文件内做引用计数，
 *    绝不能在 axios 拦截器里自行 start/done —— 那会造成路由与请求互相抢占、
 *    一方 done() 把另一方的进度条提前掐断。
 */

/** 兜底时长（ms）：路由守卫若因异常迟迟不返回（如接口挂死），强制收尾，避免进度条永久卡死 */
const WATCHDOG_TIMEOUT = 10_000

/** 收尾延迟（ms）：吸收「旧导航被取消后其 afterEach 晚于新导航 start」的竞态，肉眼无感知 */
const FINISH_DELAY = 80

/** 兜底定时器句柄 */
let watchdog: ReturnType<typeof setTimeout> | undefined

/** 待执行的收尾定时器句柄 */
let pendingFinish: ReturnType<typeof setTimeout> | undefined

NProgress.configure({
  easing: 'ease',
  speed: 600,
  showSpinner: false,
  trickleSpeed: 200,
  minimum: 0.1,
  parent: 'body'
})

/** 开始进度条（导航开始前调用，重复调用安全，不会把已有进度重置回 0） */
export function startProgress(): void {
  // 取消尚未落地的收尾：否则「旧导航的 afterEach」会掐断刚刚开始的进度条
  if (pendingFinish !== undefined) {
    clearTimeout(pendingFinish)
    pendingFinish = undefined
  }

  // 上一次导航的兜底还没清掉就先清掉，始终只保留最新一次导航的兜底
  if (watchdog !== undefined) {
    clearTimeout(watchdog)
  }

  NProgress.start()

  watchdog = setTimeout(() => {
    watchdog = undefined
    console.warn('[progress] 进度条超时未收尾，已强制结束（请检查路由守卫是否有未返回的分支）')
    NProgress.done()
  }, WATCHDOG_TIMEOUT)
}

/** 结束进度条（导航结束时调用，含成功 / 失败 / 被重定向；未开始时调用为无操作） */
export function doneProgress(): void {
  if (watchdog !== undefined) {
    clearTimeout(watchdog)
    watchdog = undefined
  }

  if (pendingFinish !== undefined) {
    clearTimeout(pendingFinish)
  }

  pendingFinish = setTimeout(() => {
    pendingFinish = undefined
    // nprogress 内部：done() 在 status 为 null 时会直接 return，天然幂等，可放心重复调用
    NProgress.done()
  }, FINISH_DELAY)
}
