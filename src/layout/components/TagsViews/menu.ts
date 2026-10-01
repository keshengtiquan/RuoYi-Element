import type { Component } from 'vue'
import {
  ArrowLeft,
  ArrowRight,
  CircleMinus,
  CircleX,
  ExternalLink,
  Maximize,
  Pin,
  PinOff,
  RotateCw,
  Shrink,
  X
} from '@lucide/vue'
import type { TagView } from '@/stores/modules/tagsView'

/** 右键菜单动作标识（TagsViews/index.vue 里按此分发） */
export type TagContextMenuKey =
  | 'reload'
  | 'close'
  | 'fullscreen-body'
  | 'fullscreen-content'
  | 'close-left'
  | 'close-right'
  | 'close-others'
  | 'close-all'
  | 'affix'
  | 'open-window'

/** 一条右键菜单项 */
export interface TagContextMenuItem {
  key: TagContextMenuKey
  label: string
  icon: Component
  /** 不可点击（置灰），如「关闭标签页」对固定标签不可用 */
  disabled?: boolean
  /** 该项之前画一条分隔线 */
  divided?: boolean
}

export interface BuildTagContextMenuOptions {
  /** 右键点中的标签 */
  tag: TagView
  /** 当前全部标签（用于判断左侧/右侧/其它是否有可关闭项） */
  tags: TagView[]
  /** 主体区域（顶栏+标签+内容，不含侧边栏）是否处于全屏 */
  bodyFullscreen: boolean
  /** 内容区域（AppMain）是否处于全屏 */
  contentFullscreen: boolean
  /** 浏览器是否支持 Fullscreen API，不支持时隐藏两个全屏项 */
  fullscreenSupported: boolean
}

/**
 * 组装右键菜单项。
 *
 * 规则：
 * - 固定标签不能「关闭标签页」，但可以「取消固定」；
 * - 左侧/右侧/其它/全部 在没有可关闭标签时置灰；
 * - 两个全屏项在浏览器不支持 Fullscreen API 时整体隐藏，全屏进行中时文案变为「退出…」。
 */
export function buildTagContextMenu(options: BuildTagContextMenuOptions): TagContextMenuItem[] {
  const { tag, tags, bodyFullscreen, contentFullscreen, fullscreenSupported } = options
  const index = tags.findIndex((item) => item.path === tag.path)
  const closable = tags.filter((item) => !item.affix)

  const items: TagContextMenuItem[] = [
    { key: 'reload', label: '重新加载', icon: RotateCw },
    { key: 'close', label: '关闭标签页', icon: X, disabled: Boolean(tag.affix) },
    {
      key: 'fullscreen-body',
      label: bodyFullscreen ? '退出全屏主体区域' : '全屏主体区域',
      icon: Maximize,
      divided: true
    },
    {
      key: 'fullscreen-content',
      label: contentFullscreen ? '退出全屏内容区域' : '全屏内容区域',
      icon: Shrink
    },
    {
      key: 'close-left',
      label: '关闭左侧标签页',
      icon: ArrowLeft,
      divided: true,
      disabled: !tags.slice(0, Math.max(index, 0)).some((item) => !item.affix)
    },
    {
      key: 'close-right',
      label: '关闭右侧标签页',
      icon: ArrowRight,
      disabled: !tags.slice(index + 1).some((item) => !item.affix)
    },
    {
      key: 'close-others',
      label: '关闭其它标签页',
      icon: CircleMinus,
      disabled: !closable.some((item) => item.path !== tag.path)
    },
    {
      key: 'close-all',
      label: '关闭全部标签页',
      icon: CircleX,
      disabled: closable.length === 0
    },
    {
      key: 'affix',
      label: tag.affix ? '取消固定' : '固定',
      icon: tag.affix ? PinOff : Pin,
      divided: true
    },
    { key: 'open-window', label: '在新窗口中打开', icon: ExternalLink }
  ]

  return fullscreenSupported
    ? items
    : items.filter((item) => item.key !== 'fullscreen-body' && item.key !== 'fullscreen-content')
}
