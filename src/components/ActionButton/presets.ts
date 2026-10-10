import type { ActionButtonPreset, ActionButtonType } from './types'

/**
 * 动作类型 → 默认外观（文案 / 图标 / 语义色 / 是否朴素）。
 *
 * 页面只写动作类型：`<ActionButton type="delete" @click="handleDelete" />`；
 * 需要微调时用 `label` / `icon` / `color` / `plain` / `size` 覆盖，例如把「删除」改成红色文字链接：
 * `<ActionButton type="link" label="删除" color="danger" @click="..." />`。
 *
 * 颜色沿用项目里的习惯：新增 = 主色实心、编辑 / 导出 = 主色朴素、删除 = 危险色实心。
 */
export const ACTION_BUTTON_PRESETS: Record<ActionButtonType, ActionButtonPreset> = {
  /** 新增 */
  add: { label: '新增', icon: 'plus', color: 'primary' },

  /** 编辑 */
  edit: { label: '编辑', icon: 'square-pen', color: 'primary', plain: true },

  /** 删除 */
  delete: { label: '删除', icon: 'trash', color: 'danger' },

  /** 导出 */
  export: { label: '导出', icon: 'download', color: 'primary', plain: true },

  /** 链接（渲染成 `<a>`，外链图标） */
  link: { label: '链接', icon: 'external-link', color: 'primary' }
}
