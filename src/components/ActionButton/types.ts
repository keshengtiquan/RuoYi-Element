import type { ButtonProps } from 'element-plus'

/**
 * 统一动作按钮（ActionButton）的类型定义。
 *
 * 设计约定：`type` 决定"这是什么动作"，外观（文案 / 图标 / 颜色）由 presets.ts 里的预设给出，
 * 页面只写 `<ActionButton type="delete" @click="..." />`，需要微调时再覆盖单个属性。
 */

/** 内置的动作类型 */
export type ActionButtonType = 'add' | 'edit' | 'delete' | 'export' | 'link'

/**
 * 语义色，两种形态共用：
 * - ElButton 形态 → 直接作为它的 `type`；
 * - `<a>` 形态 → 取 EP 主题变量当文字色（hover 用 `-light-3`）。
 */
export type ActionButtonColor = 'primary' | 'success' | 'info' | 'warning' | 'danger'

/** 单个动作类型的默认外观 */
export interface ActionButtonPreset {
  /** 默认文案 */
  label: string
  /** 默认图标：AppIcon 的图标名（见 @/components/AppIcon/icons.ts，支持 lucide 名 / RuoYi 老命名） */
  icon: string
  /** 默认语义色，不传按 primary */
  color?: ActionButtonColor
  /** 默认是否朴素按钮（仅 ElButton 形态） */
  plain?: boolean
}

/** ActionButton 的属性 */
export interface ActionButtonProps {
  /** 动作类型：决定默认文案 / 图标 / 样式 */
  type: ActionButtonType
  /** 覆盖默认文案 */
  label?: string
  /** 覆盖默认图标（图标名）；传 null 表示不显示图标 */
  icon?: string | null
  /** 覆盖默认语义色（ElButton 的 type / `<a>` 的文字色） */
  color?: ActionButtonColor
  /** 按钮尺寸 */
  size?: ButtonProps['size']
  /** 是否朴素按钮；不传时用类型内置默认值（仅 ElButton 形态） */
  plain?: boolean
  /** 是否禁用 */
  disabled?: boolean
  /** 是否 loading（`link` 类型走 `<a>`，不支持 loading） */
  loading?: boolean
  /**
   * `link` 类型的跳转地址。
   * 不传时只抛 click、不跳转（相当于"长得像链接的按钮"）。
   */
  href?: string
  /** `link` 类型的打开方式，`_blank` 时会自动补 `rel="noopener noreferrer"` */
  target?: '_blank' | '_self' | '_parent' | '_top'
}
