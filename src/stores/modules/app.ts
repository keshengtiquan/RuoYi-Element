import { DEFAULT_LAYOUT, type LayoutName } from '@/layout/layouts'

/**
 * 应用级 UI 状态（布局、侧边栏折叠等）。
 * 与业务无关，刷新后保持用户上次的选择。
 */
export const useAppStore = defineStore(
  'app',
  () => {
    /** 侧边栏是否折叠 */
    const sidebarCollapsed = ref(false)

    /** 当前布局名（layout/index.vue 据此选择布局组件） */
    const layout = ref<LayoutName>(DEFAULT_LAYOUT)

    const toggleSidebar = () => {
      sidebarCollapsed.value = !sidebarCollapsed.value
    }

    /** 切换布局；名字需已在 @/layout/layouts 注册，否则会被回退到默认布局 */
    const setLayout = (name: LayoutName) => {
      layout.value = name
    }

    return {
      sidebarCollapsed,
      layout,
      toggleSidebar,
      setLayout
    }
  },
  {
    persist: {
      key: 'app',
      storage: localStorage
    }
  }
)
