/**
 * 主题色（运行时改 Element Plus 的主色）。
 *
 * ⚠️ 主色不是一个变量，而是一组：`--el-color-primary` 加上由它派生的
 * `light-3 / light-5 / light-7 / light-8 / light-9 / dark-2`（见 theme-chalk 的 var.scss）。
 * 组件库的 SCSS 里，浅色是往白色方向混、暗色是往暗色底方向混，所以这里用同一套规则在运行时算，
 * 再把结果写进一个 `<style>`：浅色写 `:root`、暗色写 `html.dark` ——
 * 主题切换交给 CSS 命中，不用再监听颜色模式重算一遍。
 */

import { DEFAULT_SETTINGS } from '@/constants/config'

/** 预设主题色（顺序即设置面板里的顺序） */
export const THEME_COLOR_PRESETS: readonly string[] = [
  '#3054ec',
  '#1777ff',
  '#19b495',
  '#9333eb',
  '#f5686f',
  '#f69b01',
  '#5f80c7'
]

/** 默认主题色（出厂值见 src/config.ts；改默认色记得也改那边的 themeColor） */
export const DEFAULT_THEME_COLOR: string = DEFAULT_SETTINGS.themeColor

/** 混色底：浅色往白里混，暗色往 EP 暗色底色（`--el-bg-color` = #141414）里混 */
const LIGHT_MIX_BASE = '#ffffff'
const DARK_MIX_BASE = '#141414'

/** 需要派生的浅色档位：light-N = 往底色混 N * 10% */
const LIGHT_LEVELS = [3, 5, 7, 8, 9] as const

/** 注入的 <style> 的 id（重复调用只更新同一个标签） */
const STYLE_ELEMENT_ID = 'app-theme-color'

/** 侧栏风格：暗色（默认）/ 亮色 / 主色 */
export type SidebarStyle = 'dark' | 'light' | 'primary'

/** 默认侧栏风格（出厂值见 src/config.ts） */
export const DEFAULT_SIDEBAR_STYLE: SidebarStyle = DEFAULT_SETTINGS.sidebarStyle

/** 设置面板里的侧栏风格选项（数组顺序即展示顺序） */
export const SIDEBAR_STYLE_OPTIONS: Array<{ value: SidebarStyle; label: string }> = [
  { value: 'light', label: '亮色侧栏' },
  { value: 'dark', label: '暗色侧栏' },
  { value: 'primary', label: '主色侧栏' }
]

/**
 * 侧栏风格 → `<html>` 上的类名。
 * 配色本身写在 styles/tailwind.css 的 `html.sidebar-*` 里（--sidebar-* 一组变量），
 * 这里只负责挂 / 摘类；暗色是默认值，没有类。
 */
const SIDEBAR_STYLE_CLASS: Record<SidebarStyle, string | null> = {
  dark: null,
  light: 'sidebar-light',
  primary: 'sidebar-primary'
}

/** 把任意字符串收窄成合法侧栏风格（本地存储是用户可改的） */
export function resolveSidebarStyle(value?: string | null): SidebarStyle {
  const matched = SIDEBAR_STYLE_OPTIONS.find((option) => option.value === value)
  return matched ? matched.value : DEFAULT_SIDEBAR_STYLE
}

/** 应用侧栏风格：在 `<html>` 上挂对应的类（幂等，可直接放 watchEffect 里） */
export function applySidebarStyle(value?: string | null): void {
  const current = resolveSidebarStyle(value)
  Object.entries(SIDEBAR_STYLE_CLASS).forEach(([style, className]) => {
    if (className) {
      document.documentElement.classList.toggle(className, style === current)
    }
  })
}

const HEX_PATTERN = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i

type Rgb = [number, number, number]

/** #rgb / #rrggbb → [r, g, b]；非法值返回 null */
function toRgb(value: string): Rgb | null {
  const trimmed = value.trim()
  if (!HEX_PATTERN.test(trimmed)) {
    return null
  }
  let hex = trimmed.slice(1)
  if (hex.length === 3) {
    hex = hex
      .split('')
      .map((char) => char + char)
      .join('')
  }
  return [
    Number.parseInt(hex.slice(0, 2), 16),
    Number.parseInt(hex.slice(2, 4), 16),
    Number.parseInt(hex.slice(4, 6), 16)
  ]
}

function toHex(rgb: Rgb): string {
  return (
    '#' +
    rgb
      .map((channel) =>
        Math.round(Math.min(255, Math.max(0, channel)))
          .toString(16)
          .padStart(2, '0')
      )
      .join('')
  )
}

/** 等价于 SCSS 的 `mix($base, $color, $weight)`：weight 是 base 的占比 */
function mix(base: string, color: string, weight: number): string {
  const from = toRgb(base)!
  const to = toRgb(color)!
  return toHex([
    from[0] * weight + to[0] * (1 - weight),
    from[1] * weight + to[1] * (1 - weight),
    from[2] * weight + to[2] * (1 - weight)
  ])
}

/** 是否是合法的 #rgb / #rrggbb 颜色 */
export function isHexColor(value: unknown): value is string {
  return typeof value === 'string' && HEX_PATTERN.test(value.trim())
}

/** 把任意输入收窄成可用颜色：非法值（本地存储可能被手改）回落到默认主题色 */
export function resolveThemeColor(value?: string | null): string {
  return isHexColor(value) ? value.trim().toLowerCase() : DEFAULT_THEME_COLOR
}

/** 某个主题色在指定模式下的全部 CSS 变量 */
export function themeColorVars(color: string, dark: boolean): Record<string, string> {
  const base = dark ? DARK_MIX_BASE : LIGHT_MIX_BASE
  const vars: Record<string, string> = { '--el-color-primary': color }
  LIGHT_LEVELS.forEach((level) => {
    vars[`--el-color-primary-light-${level}`] = mix(base, color, level / 10)
  })
  // dark-2 与 light-N 相反：浅色往黑里混，暗色往白里混（暗色下按钮 hover 要更亮）
  vars['--el-color-primary-dark-2'] = mix(dark ? LIGHT_MIX_BASE : '#000000', color, 0.2)
  return vars
}

const toCssBlock = (selector: string, vars: Record<string, string>): string =>
  `${selector}{${Object.entries(vars)
    .map(([name, value]) => `${name}:${value}`)
    .join(';')}}`

/**
 * 应用主题色：把主色及派生色写进 `<style id="app-theme-color">`。
 * 幂等，可以在 watchEffect 里直接调用。
 */
export function applyThemeColor(value?: string | null): void {
  const color = resolveThemeColor(value)
  const css = [
    toCssBlock(':root', themeColorVars(color, false)),
    toCssBlock('html.dark', themeColorVars(color, true))
  ].join('\n')

  let style = document.getElementById(STYLE_ELEMENT_ID) as HTMLStyleElement | null
  if (!style) {
    style = document.createElement('style')
    style.id = STYLE_ELEMENT_ID
    document.head.append(style)
  }
  if (style.textContent !== css) {
    style.textContent = css
  }
}
