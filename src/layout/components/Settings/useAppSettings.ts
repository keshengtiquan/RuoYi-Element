import { DEFAULT_SETTINGS, type AppSettings } from '@/constants/config'
import { useAppStore } from '@/stores/modules/app'
import { useThemeMode } from '../ThemeToggle/useThemeMode'

/**
 * 设置抽屉里「整份配置」的读写：当前配置、应用一份配置、恢复出厂默认。
 *
 * 单项的读写仍然分散在各自的 store / vueuse（布局、主题色、侧栏风格…），
 * 这里只是把它们拼成一份 `AppSettings`（复制 / 恢复默认用同一个结构）。
 * 出厂值见 `src/config.ts`。
 */
export function useAppSettings() {
  const appStore = useAppStore()
  const { preference: themeMode, setMode } = useThemeMode()

  /** 当前配置（键顺序与 DEFAULT_SETTINGS 一致，「复制当前配置」直接 JSON.stringify 它） */
  const currentSettings = computed<AppSettings>(() => ({
    themeMode: themeMode.value,
    layout: appStore.layout,
    sidebarStyle: appStore.sidebarStyle,
    themeColor: appStore.themeColor,
    tagStyle: appStore.tagStyle,
    tagsViewVisible: appStore.tagsViewVisible,
    pageCacheEnabled: appStore.pageCacheEnabled,
    routeTransition: appStore.routeTransition
  }))

  /** 把一份配置逐项写回各自的来源（主题模式写 vueuse，其余写 app store） */
  const applySettings = (settings: AppSettings): void => {
    setMode(settings.themeMode)
    appStore.setLayout(settings.layout)
    appStore.setSidebarStyle(settings.sidebarStyle)
    appStore.setThemeColor(settings.themeColor)
    appStore.setTagStyle(settings.tagStyle)
    appStore.setTagsViewVisible(settings.tagsViewVisible)
    appStore.setPageCacheEnabled(settings.pageCacheEnabled)
    appStore.setRouteTransition(settings.routeTransition)
  }

  /** 恢复出厂默认配置 */
  const restoreDefaults = (): void => {
    applySettings(DEFAULT_SETTINGS)
  }

  return { currentSettings, applySettings, restoreDefaults }
}
