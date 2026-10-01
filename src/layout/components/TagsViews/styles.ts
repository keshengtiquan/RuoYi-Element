/**
 * 标签页（TagsViews）的激活样式。
 *
 * - line：指示线——蓝字 + 底部指示条
 * - tag：标签——淡蓝底圆角块
 *
 * 这里只放「类型 + 元信息 + class 映射」，组件内不写死具体样式；
 * 设置抽屉（layout/components/Settings）改 appStore.tagStyle 就能整条标签栏换样式。
 */

/** 标签激活样式名 */
export type TagsViewStyle = 'line' | 'tag'

/** 默认样式 */
export const DEFAULT_TAGS_VIEW_STYLE: TagsViewStyle = 'tag'

/**
 * 设置面板用的样式选项（数组顺序即展示顺序）。
 *
 * ⚠️ 这里只提供「可选项」，不会切换样式；真正生效的是 `appStore.tagStyle`，
 * 而它是持久化的：浏览器里已有值时以持久化值为准，改 DEFAULT_TAGS_VIEW_STYLE 不会生效。
 */
export const tagsViewStyleOptions: Array<{ value: TagsViewStyle; label: string }> = [
  { value: 'line', label: '指示线' },
  { value: 'tag', label: '标签' }
]

/**
 * 把任意字符串收窄成合法样式名。
 *
 * 用于持久化恢复后的兜底：本地存储里可能留着已经删掉的样式名（例如早期三选一里的 `google`），
 * 不处理的话 `tagStyleClasses[tagStyle]` 会取到 undefined，标签组件直接报错。
 */
export function resolveTagsViewStyle(value?: string | null): TagsViewStyle {
  const matched = tagsViewStyleOptions.find((option) => option.value === value)
  return matched ? matched.value : DEFAULT_TAGS_VIEW_STYLE
}

interface TagStyleClasses {
  /** 两种样式共用的基础 class（高度、圆角、左右内边距） */
  base: string
  /** 激活态追加的 class */
  active: string
  /** 未激活态追加的 class（含 hover） */
  idle: string
  /** 是否需要底部指示条（只有「指示线」样式需要） */
  indicator: boolean
}

/** 样式名 → class 映射 */
export const tagStyleClasses: Record<TagsViewStyle, TagStyleClasses> = {
  line: {
    base: 'h-full px-3',
    active: 'text-(--el-color-primary)',
    idle: 'text-(--el-text-color-regular) hover:text-(--el-text-color-primary)',
    indicator: true
  },
  tag: {
    base: 'h-8 rounded-md px-3',
    active: 'bg-(--el-color-primary-light-9) text-(--el-color-primary)',
    idle: 'text-(--el-text-color-regular) hover:bg-(--el-fill-color-light) hover:text-(--el-text-color-primary)',
    indicator: false
  }
}
