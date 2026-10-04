/**
 * 应用默认配置（系统设置里那些配置项的出厂值）。
 *
 * ⚠️ **默认值的唯一来源**：各模块的 `DEFAULT_*` 常量都从这里取，
 * 设置面板的「恢复默认配置」按这份对象重置，「复制当前配置」复制出来的 JSON 与它同结构
 * —— 想改出厂值只改这里。
 *
 * 只放「设置面板里能改的项」：侧边栏折叠、双栏一级栏展开之类的运行时状态不属于配置。
 * 类型都是 `import type`（编译后不留 import），所以这里不会和各模块形成运行时循环依赖。
 */
import type { RouteTransitionName } from '@/layout/components/AppMain/transitions'
import type { TagsViewStyle } from '@/layout/components/TagsViews/styles'
import type { ThemeMode } from '@/layout/components/ThemeToggle/useThemeMode'
import type { LayoutName } from '@/layout/layouts'
import type { SidebarStyle } from '@/utils/theme'

/** 一份完整配置（键顺序即「复制当前配置」复制出来的顺序） */
export interface AppSettings {
  /** 主题模式：亮色 / 暗黑 / 跟随系统（存在 vueuse 的 vueuse-color-scheme 里） */
  themeMode: ThemeMode
  /** 导航模式（布局） */
  layout: LayoutName
  /** 侧栏风格 */
  sidebarStyle: SidebarStyle
  /** 主题色（Element Plus 主色） */
  themeColor: string
  /** 页签显示风格 */
  tagStyle: TagsViewStyle
  /** 是否显示多页签栏 */
  tagsViewVisible: boolean
  /** 是否缓存页面 */
  pageCacheEnabled: boolean
  /** 路由切换动画 */
  routeTransition: RouteTransitionName
}

/** 出厂默认配置 */
export const DEFAULT_SETTINGS: AppSettings = {
  themeMode: 'auto',
  layout: 'default',
  sidebarStyle: 'dark',
  themeColor: '#3054ec',
  tagStyle: 'tag',
  tagsViewVisible: true,
  pageCacheEnabled: true,
  routeTransition: 'slide-right'
}
