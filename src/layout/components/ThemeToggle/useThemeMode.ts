/**
 * 主题模式（亮色 / 暗黑 / 跟随系统）。
 *
 * 基于 vueuse 的 `useColorMode`：用户偏好落在 localStorage 的 `vueuse-color-scheme`
 * （'light' | 'dark' | 'auto'），并按 `attribute: 'class'` 写成 `<html>` 上的 `.dark`
 * —— Element Plus 的暗色变量依赖这个类（见 styles/el-dark.scss）。
 *
 * ⚠️ 每调用一次 `useColorMode` 都会建一份独立状态 + 一个把 class 写回 `<html>` 的 watcher，
 * 而偏好是同一份（同一个 storage key，vueuse 内部用 storage 事件同步）。
 * 所以 `selector / attribute / modes` 三个选项必须收口在这里：
 * 两处调用要是 modes 不一致（比如一处把亮色映射成 `light` 类、一处映射成空类），就会互相加类 / 删类。
 */

/** 暗色主题挂在 `<html>` 上的类名（Element Plus 暗色变量按 .dark 生效） */
export const DARK_CLASS = 'dark'

/** 主题模式：亮色 / 暗黑 / 跟随系统 */
export type ThemeMode = 'light' | 'dark' | 'auto'

/** 设置面板里的选项（数组顺序即展示顺序） */
export const THEME_MODE_OPTIONS: Array<{ value: ThemeMode; label: string }> = [
  { value: 'light', label: '亮色模式' },
  { value: 'dark', label: '暗黑模式' },
  { value: 'auto', label: '跟随系统' }
]

export function useThemeMode() {
  const mode = useColorMode({
    attribute: 'class',
    modes: {
      dark: DARK_CLASS,
      light: ''
    }
  })

  /**
   * 用户选的主题模式（**原始偏好**，跟随系统时是 'auto'）。
   *
   * `mode` 本身是「解析后」的值 —— 跟随系统时会变成 'light' / 'dark'，
   * 拿不到「用户到底有没有选跟随系统」，所以设置面板读 `store`。
   */
  const preference = computed<ThemeMode>(() => (mode.store.value ?? 'auto') as ThemeMode)

  /** 当前生效的是不是暗色（跟随系统时按系统偏好算，等价于 `<html>` 上有没有 `.dark`） */
  const isDark = computed(() => mode.value === 'dark')

  const setMode = (value: ThemeMode): void => {
    mode.store.value = value
  }

  return { mode, preference, isDark, setMode }
}
