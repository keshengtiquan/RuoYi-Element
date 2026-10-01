import type { RouteLocationNormalized, Router } from 'vue-router'
import { getToken } from '@/utils/auth'
import { isPathMatch } from '@/utils/validate'
import { startProgress } from '@/utils/progress'
import { useUserStore } from '@/stores/modules/user'
import { usePermissionStore } from '@/stores/modules/permission'

/** 免登录白名单 */
const whiteList = ['/login', '/404']

const isWhiteList = (path: string): boolean => {
  return whiteList.some((pattern: string) => isPathMatch(pattern, path))
}

export function setupBeforeEachGuard(router: Router): void {
  router.beforeEach(async (to: RouteLocationNormalized) => {
    // 进度条在此统一开始。收尾统一交给 guards/afterEach.ts，
    // 这里各分支不要再写 NProgress.done()，否则重定向场景会出现进度条中断后重开。
    startProgress()

    const userStore = useUserStore()
    const permissionStore = usePermissionStore()

    // ---------------------- 未登录 ----------------------
    if (!getToken()) {
      // 白名单直接放行，其余跳转登录页并记录来源
      if (isWhiteList(to.path)) {
        return true
      }
      return `/login?redirect=${to.fullPath}`
    }

    // ---------------------- 已登录 ----------------------
    // 已登录时访问登录页，直接回首页
    if (to.path === '/login') {
      return { path: '/' }
    }

    if (isWhiteList(to.path)) {
      return true
    }

    // 动态路由尚未生成（首次登录 / 刷新页面 / 切换账号）→ 拉取用户信息与路由并注册。
    // 注意：user store 的 roles 会被 pinia 持久化，刷新后仍有值，
    // 因此这里必须以「动态路由是否已生成」作为判断依据，而不是 roles 是否为空。
    if (permissionStore.routes.length === 0) {
      try {
        if (userStore.roles.length === 0) {
          await userStore.getInfo()
        }
        await permissionStore.generateRoutes(router)
        // 重导航到原目标地址。注意不能写成 { ...to }：
        // to 展开后会带上已匹配的 name，而 404 兜底路由带有 name，name 优先级高于 path，
        // 会导致重导航命中 404 而不是真正目标页。
        return { path: to.path, query: to.query, hash: to.hash, replace: true }
      } catch (error) {
        console.error('[permission] 生成动态路由失败：', error)
        await userStore.logOut().catch(() => {})
        permissionStore.resetRoutes()
        return `/login?redirect=${to.fullPath}`
      }
    }

    return true
  })
}
