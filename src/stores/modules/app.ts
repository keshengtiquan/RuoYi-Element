import { DEFAULT_TAGS_VIEW_STYLE, type TagsViewStyle } from '@/layout/components/TagsViews/styles'
import {
  DEFAULT_ROUTE_TRANSITION,
  type RouteTransitionName
} from '@/layout/components/AppMain/transitions'
import { DEFAULT_LAYOUT, type LayoutName } from '@/layout/layouts'
import {
  DEFAULT_SIDEBAR_STYLE,
  DEFAULT_THEME_COLOR,
  isHexColor,
  type SidebarStyle
} from '@/utils/theme'

/**
 * 应用级 UI 状态（布局、侧边栏折叠、标签样式等）。
 * 与业务无关，刷新后保持用户上次的选择。
 */
export const useAppStore = defineStore(
  'app',
  () => {
    /** 侧边栏是否折叠 */
    const sidebarCollapsed = ref(false)

    /**
     * 双栏布局里「一级栏是否展开」：展开时一级图标下方显示文字、栏宽加大。
     * 只影响双栏布局，由一级栏底部的切换按钮控制。
     */
    const railExpanded = ref(false)

    /** 当前布局名（layout/index.vue 据此选择布局组件） */
    const layout = ref<LayoutName>(DEFAULT_LAYOUT)

    /**
     * 标签页激活样式：line 指示线 / tag 标签（选项见 TagsViews/styles.ts）。
     * 放在应用级 store 而不是标签页 store 里，是为了设置面板
     * 和布局、侧边栏折叠一起读写同一份 UI 配置。
     */
    const tagStyle = ref<TagsViewStyle>(DEFAULT_TAGS_VIEW_STYLE)

    /**
     * 是否显示多页签栏（设置抽屉「页签配置 → 开启多页签栏」）。
     * 关掉只是不渲染 TagsViews 的那一条 bar：组件仍然挂载，标签照常登记，
     * 所以重新打开时之前的标签都还在。三种布局共用这一份开关。
     */
    const tagsViewVisible = ref(true)

    /**
     * 是否缓存页面（设置抽屉「页签配置 → 页面切换缓存」）。
     * 关掉后 AppMain 的 <KeepAlive> 不拿到 include → 切换页面时组件重新挂载（不保状态）。
     * 标签本身照常记录，重新打开缓存时按当前标签重新进缓存。
     */
    const pageCacheEnabled = ref(true)

    /**
     * 系统设置抽屉是否展开。
     *
     * 放在 store 里而不是 NavbarActions 的组件内 ref：抽屉挂在 NavbarActions 内部，
     * 而切换布局会把 `layout/index.vue` 里的 `<component :is>` 整个换掉，
     * NavbarActions 连同抽屉一起卸载重建 —— 组件内的 ref 会跟着丢，表现为「切完布局抽屉自动关了」。
     * 状态提到 store 后，新布局挂载时读到的仍是 true，抽屉会原地重新出现（不关）。
     */
    const settingsVisible = ref(false)

    /**
     * 主题色（Element Plus 主色），由设置抽屉的「主题颜色」改。
     * 真正落到界面上的动作在 utils/theme.ts（App.vue 里 watchEffect 调用）。
     */
    const themeColor = ref<string>(DEFAULT_THEME_COLOR)

    /**
     * 侧栏风格（暗色 / 亮色 / 主色），由设置抽屉的「侧栏风格」改。
     * 配色写在 styles/tailwind.css 的 `html.sidebar-*` 里，这里只存选择。
     */
    const sidebarStyle = ref<SidebarStyle>(DEFAULT_SIDEBAR_STYLE)

    /**
     * 路由切换动画（AppMain 的 `<Transition :name>`），选项 = styles/animation.scss 里的过渡类名。
     */
    const routeTransition = ref<RouteTransitionName>(DEFAULT_ROUTE_TRANSITION)

    const openSettings = () => {
      settingsVisible.value = true
    }

    const closeSettings = () => {
      settingsVisible.value = false
    }

    const toggleSidebar = () => {
      sidebarCollapsed.value = !sidebarCollapsed.value
    }

    /** 切换双栏布局一级栏的展开/收起 */
    const toggleRail = () => {
      railExpanded.value = !railExpanded.value
    }

    /** 切换布局；名字需已在 @/layout/layouts 注册，否则会被回退到默认布局 */
    const setLayout = (name: LayoutName) => {
      layout.value = name
    }

    /** 切换标签页激活样式（设置抽屉调用） */
    const setTagStyle = (style: TagsViewStyle) => {
      tagStyle.value = style
    }

    /** 显示 / 隐藏多页签栏（设置抽屉调用） */
    const setTagsViewVisible = (visible: boolean) => {
      tagsViewVisible.value = visible
    }

    /** 开启 / 关闭页面缓存（设置抽屉调用） */
    const setPageCacheEnabled = (enabled: boolean) => {
      pageCacheEnabled.value = enabled
    }

    /** 切换侧栏风格（设置抽屉调用） */
    const setSidebarStyle = (style: SidebarStyle) => {
      sidebarStyle.value = style
    }

    /** 切换路由切换动画（设置抽屉调用） */
    const setRouteTransition = (name: RouteTransitionName) => {
      routeTransition.value = name
    }

    /**
     * 切换主题色（设置抽屉调用）。
     * 只接受 #rgb / #rrggbb：本地存储是用户可改的，非法值直接忽略，
     * 读的时候 applyThemeColor 还有一层兜底（回落默认色）。
     */
    const setThemeColor = (color: string) => {
      if (isHexColor(color)) {
        themeColor.value = color.trim().toLowerCase()
      }
    }

    return {
      sidebarCollapsed,
      railExpanded,
      layout,
      tagStyle,
      tagsViewVisible,
      pageCacheEnabled,
      settingsVisible,
      themeColor,
      sidebarStyle,
      routeTransition,
      toggleSidebar,
      toggleRail,
      setLayout,
      setTagStyle,
      setTagsViewVisible,
      setPageCacheEnabled,
      openSettings,
      closeSettings,
      setThemeColor,
      setSidebarStyle,
      setRouteTransition
    }
  },
  {
    persist: {
      key: 'app',
      storage: localStorage,
      // 只持久化「用户偏好」；settingsVisible 这类瞬时状态不写进本地存储，否则刷新后抽屉会自己弹出来
      pick: [
        'sidebarCollapsed',
        'railExpanded',
        'layout',
        'tagStyle',
        'tagsViewVisible',
        'pageCacheEnabled',
        'themeColor',
        'sidebarStyle',
        'routeTransition'
      ]
    }
  }
)
