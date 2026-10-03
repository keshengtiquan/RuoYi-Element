/**
 * 标签页（TagsViews）状态。
 *
 * 只做数据与操作，不碰路由跳转：关闭当前激活标签后该去哪一页由组件决定
 * （见 TagsViews/index.vue 的 closeTag），这样 store 可以被任意布局复用。
 *
 * 标签 key 用 `path`（不含 query），与 RuoYi 一致：同一个页面带不同 query
 * 不产生第二个标签，重复访问只更新 fullPath（保证跳转带上最新参数）。
 *
 * 不做持久化：刷新浏览器后只剩固定标签（meta.affix），避免残留已改权限/已删除的标签。
 */

/** 一个已打开的标签页 */
export interface TagView {
  /** 唯一标识（不含 query），同时作为标签缓存与去重的依据 */
  path: string
  /** 点击标签时跳转的完整地址（含 query） */
  fullPath: string
  /** 标签标题（route.meta.title） */
  title: string
  /** 标签图标（route.meta.icon，交给 AppIcon 解析） */
  icon?: string
  /** 固定标签：不显示关闭按钮，也不被「关闭左侧/右侧/其它/全部」影响 */
  affix?: boolean
  /** keep-alive 缓存名（route.meta.cacheName，见 utils/route.ts 的 componentToName） */
  cacheName?: string
}

/** 生成标签所需的最小路由结构（RouteLocationNormalizedLoaded / RouteRecordNormalized 都满足） */
interface TagRouteLike {
  path: string
  fullPath?: string
  meta?: {
    title?: string
    icon?: string
    hidden?: boolean
    affix?: boolean
    noCache?: boolean
    cacheName?: string
  } | null
}

/**
 * 中转页路由前缀。
 * 早期「重新加载」用 /redirect/xxx 中转页实现，现已改为 refreshContent()（不换路由）；
 * 这里保留过滤：万一有菜单把 path 配成 /redirect/xxx，也不会被生成成标签。
 */
const REDIRECT_PATH_PREFIX = '/redirect'

export const useTagsViewStore = defineStore('tagsView', () => {
  /** 已打开的标签（固定标签由 initAffixTags 初始化在最前） */
  const visitedViews = ref<TagView[]>([])

  /** 需要 <KeepAlive> 缓存的组件名列表 */
  const cachedViews = ref<string[]>([])

  /**
   * 内容区是否渲染。
   * AppMain 里写作 `<component v-if="contentVisible" :is="Component" />`：
   * 全局刷新时短暂置 false 再置回 true，让路由组件被销毁并重建。
   */
  const contentVisible = ref(true)

  /** 全局刷新的定时器（连续触发时只保留最后一次） */
  let refreshTimer: ReturnType<typeof setTimeout> | undefined

  /**
   * 全局刷新：销毁并重建内容区的路由组件。
   *
   * 三个要点：
   * 1. 先清空 include（cachedViews）：否则 <KeepAlive> 对 v-if 消失的组件只会 deactivate，
   *    重新渲染时又把旧实例取回来，等于没刷新；
   * 2. 再把 contentVisible 置 false（此刻组件被真正销毁），200ms 后置回 true 并恢复 include，
   *    当前页面重新挂载并重新纳入缓存；其它标签的缓存已在这一轮全部失效，下次进去时重建——即「全局刷新」；
   * 3. 延迟必须存在：同一个事件循环里 false→true 会被 Vue 合并成一次渲染，组件根本不会重建。
   *
   * @param delay 销毁到重建之间的间隔（毫秒）
   */
  const refreshContent = (delay = 200): void => {
    const cachedNames = [...cachedViews.value]

    cachedViews.value = []
    contentVisible.value = false

    if (refreshTimer) {
      clearTimeout(refreshTimer)
    }

    refreshTimer = setTimeout(() => {
      contentVisible.value = true
      cachedViews.value = cachedNames
      refreshTimer = undefined
    }, delay)
  }

  /**
   * 该路由是否应该生成标签：
   * 需要有 meta.title（无标题的路由不是页面菜单），且不能是隐藏路由与中转页。
   */
  const isTagRoute = (route: TagRouteLike): boolean => {
    if (!route.meta?.title || route.meta.hidden) {
      return false
    }
    return !route.path.startsWith(REDIRECT_PATH_PREFIX)
  }

  /** 把路由转换成标签数据（meta.noCache 的路由不参与缓存） */
  const toTagView = (route: TagRouteLike): TagView => ({
    path: route.path,
    fullPath: route.fullPath || route.path,
    title: route.meta?.title ?? route.path,
    icon: route.meta?.icon,
    affix: route.meta?.affix,
    cacheName: route.meta?.noCache ? undefined : route.meta?.cacheName
  })

  /** 只加入标签列表（固定标签初始化时用） */
  const addVisitedView = (route: TagRouteLike): void => {
    if (!isTagRoute(route)) {
      return
    }

    const tag = toTagView(route)
    const index = visitedViews.value.findIndex((item) => item.path === tag.path)

    if (index === -1) {
      visitedViews.value.push(tag)
      return
    }

    // 同一路径再次访问：保留已有的 fixed 状态，只刷新跳转地址/标题/图标
    const current = visitedViews.value[index]!
    visitedViews.value[index] = { ...current, ...tag, affix: current.affix || tag.affix }
  }

  /** 加入标签并登记缓存 */
  const addView = (route: TagRouteLike): void => {
    if (!isTagRoute(route)) {
      return
    }

    addVisitedView(route)

    const tag = visitedViews.value.find((item) => item.path === route.path)
    if (tag) {
      addCachedView(tag)
    }
  }

  /** 登记一个标签的 keep-alive 缓存名 */
  const addCachedView = (view: TagView): void => {
    if (!view.cacheName || cachedViews.value.includes(view.cacheName)) {
      return
    }
    cachedViews.value.push(view.cacheName)
  }

  /** 移除一个标签的 keep-alive 缓存（关闭标签 / 重新加载时调用） */
  const delCachedView = (view: TagView | undefined): void => {
    if (!view?.cacheName) {
      return
    }
    cachedViews.value = cachedViews.value.filter((name) => name !== view.cacheName)
  }

  /** 关闭单个标签 */
  const delView = (view: TagView): void => {
    delCachedView(view)
    visitedViews.value = visitedViews.value.filter((item) => item.path !== view.path)
  }

  /**
   * 关闭左侧标签页。
   * 固定标签不受影响（否则用户会「关掉关不掉的标签」）。
   */
  const delLeftViews = (view: TagView): void => {
    const index = visitedViews.value.findIndex((item) => item.path === view.path)
    if (index === -1) {
      return
    }

    visitedViews.value
      .filter((item, i) => i < index && !item.affix)
      .forEach((item) => delCachedView(item))

    visitedViews.value = visitedViews.value.filter((item, i) => item.affix || i >= index)
  }

  /** 关闭右侧标签页（固定标签保留） */
  const delRightViews = (view: TagView): void => {
    const index = visitedViews.value.findIndex((item) => item.path === view.path)
    if (index === -1) {
      return
    }

    visitedViews.value
      .filter((item, i) => i > index && !item.affix)
      .forEach((item) => delCachedView(item))

    visitedViews.value = visitedViews.value.filter((item, i) => item.affix || i <= index)
  }

  /** 关闭其它标签页（保留当前标签与固定标签） */
  const delOthersViews = (view: TagView): void => {
    visitedViews.value
      .filter((item) => !item.affix && item.path !== view.path)
      .forEach((item) => delCachedView(item))

    visitedViews.value = visitedViews.value.filter((item) => item.affix || item.path === view.path)
  }

  /** 关闭全部标签页（固定标签保留） */
  const delAllViews = (): void => {
    visitedViews.value.filter((item) => !item.affix).forEach((item) => delCachedView(item))
    visitedViews.value = visitedViews.value.filter((item) => item.affix)
  }

  /** 固定 / 取消固定（右键菜单「固定」项） */
  const toggleAffix = (view: TagView): void => {
    const target = visitedViews.value.find((item) => item.path === view.path)
    if (target) {
      target.affix = !target.affix
    }
  }

  /**
   * 初始化固定标签：把注册在路由上、meta.affix 为真的叶子路由加为不可关闭标签。
   * 传 router.getRoutes() 即可（返回值已按完整 path 拍平）。
   */
  const initAffixTags = (routes: TagRouteLike[]): void => {
    routes
      .filter((route) => route.meta?.affix && route.meta?.title)
      .forEach((route) => addVisitedView({ ...route, fullPath: route.path }))
  }

  /** 清空（退出登录时调用，避免下一个账号看到上一个账号的标签） */
  const reset = (): void => {
    visitedViews.value = []
    cachedViews.value = []
  }

  return {
    visitedViews,
    cachedViews,
    contentVisible,
    addView,
    addVisitedView,
    addCachedView,
    delView,
    delCachedView,
    delLeftViews,
    delRightViews,
    delOthersViews,
    delAllViews,
    toggleAffix,
    initAffixTags,
    refreshContent,
    reset
  }
})
