/**
 * 路由切换动画。
 *
 * 选项就是 `src/styles/animation.scss` 里的 `slide-*` 那几组过渡类名，`<Transition :name>` 直接吃：
 * 例如 `slide-right` 会命中 `.slide-right-enter-active / -enter-from / -leave-active / -leave-to`。
 *
 * 中文名按「新页面从哪边滑进来」起，和类名后缀是一致的：
 *   slide-right = enter-from `translate(15px)`  → 往右偏了 15px，即从右侧进来
 *   slide-left  = enter-from `translate(-15px)` → 从左侧进来
 *   slide-up    = enter-from `translateY(-15px)` → 从上方进来
 *   slide-down  = enter-from `translateY(15px)`  → 从下方进来
 *
 * 这里只放「类型 + 选项 + 兜底」，动画本身仍然写在那份 scss 里
 * （新增动画：scss 补一组类 + 这里补一条选项）。`animation.scss` 里其余的 `fade*` 组目前不在下拉里。
 */

/** 路由切换动画名（= animation.scss 里的过渡类名前缀） */
export type RouteTransitionName = 'slide-right' | 'slide-left' | 'slide-up' | 'slide-down'

/** 默认动画（与改造前一致） */
export const DEFAULT_ROUTE_TRANSITION: RouteTransitionName = 'slide-right'

/** 设置面板里的动画选项（数组顺序即展示顺序） */
export const ROUTE_TRANSITION_OPTIONS: Array<{ value: RouteTransitionName; label: string }> = [
  { value: 'slide-right', label: '从右滑入' },
  { value: 'slide-left', label: '从左滑入' },
  { value: 'slide-up', label: '从上滑入' },
  { value: 'slide-down', label: '从下滑入' }
]

/**
 * 把任意字符串收窄成合法动画名。
 * 本地存储是用户可改的，旧版本存过 `fade-scale` 之类的值也会走到这里 → 回落默认动画，
 * 不至于因为过渡类名对不上而「看着像没动画」。
 */
export function resolveRouteTransition(value?: string | null): RouteTransitionName {
  const matched = ROUTE_TRANSITION_OPTIONS.find((option) => option.value === value)
  return matched ? matched.value : DEFAULT_ROUTE_TRANSITION
}
