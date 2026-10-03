import type { RouteRecordRaw } from 'vue-router'
import { usePermissionStore } from '@/stores/modules/permission'

/**
 * 菜单数据源：静态路由（router.options.routes）+ 后端下发的动态路由，
 * 过滤掉 meta.hidden 的项。
 *
 * 经典布局的 Sidebar、双栏布局的图标栏 / 菜单栏都从这里取，避免每处各写一份。
 */
export function useMenuRoutes() {
  const router = useRouter()
  const permissionStore = usePermissionStore()

  return computed<RouteRecordRaw[]>(() => {
    const staticRoutes = router.options.routes.filter((item) => !item.meta?.hidden)
    const dynamicRoutes = permissionStore.routes.filter((item) => !item.meta?.hidden)
    return [...staticRoutes, ...dynamicRoutes]
  })
}
