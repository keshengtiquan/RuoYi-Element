import type { Component } from 'vue'
import DefaultLayout from './default.vue'
import TopLayout from './top.vue'
import TwoColumnLayout from './twoColumn.vue'

/**
 * 布局注册表。
 *
 * 新增一个布局只需三步（不用改路由、不用改守卫）：
 *   1. 在 `src/layout/` 下新建 `xxx.vue`（name 用 XxxLayout）；
 *   2. 在下方 `layoutComponents` 里登记 `xxx: XxxLayout`；
 *   3. 在 `layoutOptions` 里补一条元信息（用于设置面板展示）。
 *
 * ⚠️ 这里刻意用静态 import 而不是 `() => import()`：
 * 布局是首屏必经组件，异步加载会多出一帧空白；同时静态导入能复用
 * layout → routes → permission store 既有的一条引用链（该链上对 Layout 的读取
 * 都已收敛到函数体内，不存在 TDZ 问题，见 permission.ts 的注释）。
 */
export const layoutComponents: Record<string, Component> = {
  default: DefaultLayout,
  twoColumn: TwoColumnLayout,
  top: TopLayout
}

/** 布局元信息，数组顺序即设置面板中的展示顺序 */
export interface LayoutOption {
  /** 布局名，与 layoutComponents 的 key 一致 */
  name: LayoutName
  /** 面板上的显示名（设置面板用作缩略图的 aria-label） */
  label: string
  /** 一句话说明，设置面板用作缩略图的悬浮提示 */
  description: string
}

export const layoutOptions: LayoutOption[] = [
  {
    name: 'default',
    label: '默认布局',
    description: '左侧菜单 + 顶部导航栏'
  },
  {
    name: 'twoColumn',
    label: '双栏布局',
    description: '左侧图标栏 + 二级菜单栏'
  },
  {
    name: 'top',
    label: '顶部布局',
    description: '菜单横向排在顶栏'
  }
]

/** 布局名联合类型（新增布局时在此补充，与 layoutComponents 的 key 一致） */
export type LayoutName = 'default' | 'twoColumn' | 'top'

/** 默认布局名 */
export const DEFAULT_LAYOUT: LayoutName = 'default'

/**
 * 解析布局组件。
 *
 * 名字未注册时回退到默认布局：`layout` 是持久化字段，用户若在旧版本里存过
 * 一个已被删除的布局名，直接渲染会白屏，回退 + 告警比白屏友好。
 *
 * @param name 布局名（来自 app store，可能为持久化下来的历史值）
 */
export function resolveLayout(name?: string | null): Component {
  if (name) {
    const component = layoutComponents[name]
    if (component) {
      return component
    }
    console.warn(`[layout] 布局「${name}」未注册，已回退到「${DEFAULT_LAYOUT}」`)
  }
  return layoutComponents[DEFAULT_LAYOUT]!
}
