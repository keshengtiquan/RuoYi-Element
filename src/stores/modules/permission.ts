import type { RouteComponent, RouteMeta, RouteRecordRaw, Router } from 'vue-router'
import { getRoutersApi, type RouterVo } from '@/api/auth'
import { componentToName, isExternalUrl, normalizeRoutePath } from '@/utils/route'
import Layout from '@/layout/index.vue'
import ParentView from '@/components/ParentView/index.vue'
import InnerLink from '@/components/InnerLink/index.vue'

/** 路由组件：同步组件或懒加载组件 */
type RouteComponentLazy = RouteComponent | (() => Promise<RouteComponent>)

/**
 * views 目录下所有页面组件（懒加载）。
 * 用于把后端下发的 component 字符串（如 'system/user/index'）映射为真实组件。
 * 注意：import.meta.glob 的 key 与 pattern 前缀保持一致，故用相对路径匹配。
 */
const viewModules = import.meta.glob('../../views/**/*.vue')

/** 未匹配到视图组件时的兜底页面 */
const NotFoundView = () => import('@/views/error/404.vue')

/**
 * 解析后端下发的 component 字符串：
 * - 'Layout' / 'ParentView' / 'InnerLink' → 前端内置组件
 * - 其他（如 'system/user/index'）→ views/system/user/index.vue
 *
 * ⚠️ 三个内置组件必须「在函数体内读取」，不能在模块顶层拼成映射对象：
 * layout/index.vue → Sidebar → 本模块，与本模块 → layout/index.vue 构成循环引用，
 * 模块顶层读取这些绑定会在求值阶段命中 TDZ 报错（Cannot access before initialization），
 * 函数体内读取是安全的（与 RuoYi 官方 permission store 的写法一致）。
 */
function resolveComponent(component?: string): RouteComponentLazy {
  // 后端未下发组件时用 ParentView 承载子路由，避免生成「既无组件又无子路由」的非法路由
  if (!component) {
    return ParentView
  }

  if (component === 'Layout') {
    return Layout
  }
  if (component === 'ParentView') {
    return ParentView
  }
  if (component === 'InnerLink') {
    return InnerLink
  }

  const loader = viewModules[`../../views/${component}.vue`]
  if (!loader) {
    console.warn(`[permission] 未找到视图组件 views/${component}.vue，已回退到 404 页面`)
    return NotFoundView as unknown as RouteComponentLazy
  }
  return loader as unknown as RouteComponentLazy
}

/**
 * 该 component 字符串对应的 keep-alive 缓存名。
 * 只有「真实存在页面文件」的菜单才返回名字：布局/ParentView/InnerLink 之类的
 * 内置组件不参与缓存，找不到文件的兜底 404 也不缓存。
 */
function resolveCacheName(component?: string): string | undefined {
  if (!component || !viewModules[`../../views/${component}.vue`]) {
    return undefined
  }
  return componentToName(component)
}

/**
 * 把后端下发的一条 RouterVo 转换为 vue-router 路由记录。
 *
 * @param item 后端下发的路由
 * @param isTopLevel 是否为顶层路由（顶层 path 必须以 '/' 开头）
 */
function transformRoute(item: RouterVo, isTopLevel = true): RouteRecordRaw {
  // 外链/内链菜单的 path 是完整网址（如 http://ruoyi.vip），不能被 vue-router 接受，
  // 因此改写为站内占位路径，真实地址保留到 meta.link 供侧边栏新窗口打开。
  const external = isExternalUrl(item.path)
  const path = normalizeRoutePath(item.path, isTopLevel)

  if (external) {
    console.warn(
      `[permission] 菜单「${item.meta?.title ?? item.name}」的 path 是完整网址（${item.path}），` +
        `已改写为站内路径 ${path}，真实地址见 meta.link`
    )
  }

  const meta: RouteMeta = {
    title: item.meta?.title,
    icon: item.meta?.icon ?? undefined,
    noCache: item.meta?.noCache,
    // 外链菜单的真实地址就是它的 path；内链菜单后端已把地址放在 meta.link
    link: external ? item.path : (item.meta?.link ?? undefined),
    external: external || undefined,
    // hidden / alwaysShow 收进 meta，避免给路由记录挂非标准字段（侧边栏读 route.meta.hidden）
    hidden: item.hidden,
    alwaysShow: item.alwaysShow,
    // keep-alive 缓存名（TagsViews 用它决定该页缓存到哪个组件名下）
    cacheName: resolveCacheName(item.component)
  }

  const children = item.children?.length
    ? item.children.map((child: RouterVo) => transformRoute(child, false))
    : undefined

  // 无子路由的外链用 InnerLink 承载：万一被直接访问也是在布局内嵌展示目标页面，而不是白屏
  const component = external && !children ? InnerLink : resolveComponent(item.component)

  // 'noRedirect' 是后端给目录路由的占位值，并非真实跳转目标；
  // 若原样交给 vue-router，访问该目录时会跳到不存在的 /noRedirect，故需剔除。
  const redirect = item.redirect && item.redirect !== 'noRedirect' ? item.redirect : undefined

  return {
    path,
    // 后端对「一级菜单」会下发空字符串 name，空名在 vue-router 里等价于未命名，统一转成 undefined
    name: item.name || undefined,
    component,
    redirect,
    meta,
    children
  } as unknown as RouteRecordRaw
}

export const usePermissionStore = defineStore('permission', () => {
  /** 已生成并注册的动态路由（侧边栏用） */
  const routes = ref<RouteRecordRaw[]>([])

  /** 上一次注册的移除函数（vue-router addRoute 的返回值），用于重新生成前清理 */
  const routeRemovers = ref<Array<() => void>>([])

  /**
   * 拉取后端路由，转换为 vue-router 路由并注册到传入的 router 实例。
   * 会先移除上一次注册的动态路由，避免切换账号后残留上一个用户的菜单。
   */
  const generateRoutes = async (router: Router): Promise<RouteRecordRaw[]> => {
    // 1. 清理上一次注册的动态路由（用 addRoute 返回的移除函数，未命名路由也能清理）
    routeRemovers.value.forEach((remove) => remove())
    routeRemovers.value = []

    // 2. 拉取并转换
    const routerVos = (await getRoutersApi()) ?? []
    const accessRoutes = routerVos.map((item) => transformRoute(item, true))

    // 3. 注册到 router 实例，并记录移除函数
    routeRemovers.value = accessRoutes.map((route) => router.addRoute(route))
    routes.value = accessRoutes

    return accessRoutes
  }

  /**
   * 清空已生成的路由状态（退出登录时调用，下次进入守卫会重新拉取）。
   * 注意：不清空 routeRemovers，以便下次生成时能正确移除本次注册的路由。
   */
  const resetRoutes = () => {
    routes.value = []
  }

  return {
    routes,
    generateRoutes,
    resetRoutes
  }
})
