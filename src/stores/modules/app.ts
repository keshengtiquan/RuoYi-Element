import { DEFAULT_TAGS_VIEW_STYLE, type TagsViewStyle } from '@/layout/components/TagsViews/styles'
import { DEFAULT_LAYOUT, type LayoutName } from '@/layout/layouts'

/**
 * 应用级 UI 状态（布局、侧边栏折叠、标签样式等）。
 * 与业务无关，刷新后保持用户上次的选择。
 */
export const useAppStore = defineStore(
  'app',
  () => {
    /** 侧边栏是否折叠 */
    const sidebarCollapsed = ref(false)

    /** 当前布局名（layout/index.vue 据此选择布局组件） */
    const layout = ref<LayoutName>(DEFAULT_LAYOUT)

    /**
     * 标签页激活样式：line 指示线 / tag 标签（选项见 TagsViews/styles.ts）。
     * 放在应用级 store 而不是标签页 store 里，是为了设置面板
     * 和布局、侧边栏折叠一起读写同一份 UI 配置。
     */
    const tagStyle = ref<TagsViewStyle>(DEFAULT_TAGS_VIEW_STYLE)

    const toggleSidebar = () => {
      sidebarCollapsed.value = !sidebarCollapsed.value
    }

    /** 切换布局；名字需已在 @/layout/layouts 注册，否则会被回退到默认布局 */
    const setLayout = (name: LayoutName) => {
      layout.value = name
    }

    /** 切换标签页激活样式（设置抽屉调用） */
    const setTagStyle = (style: TagsViewStyle) => {
      tagStyle.value = style
    }

    return {
      sidebarCollapsed,
      layout,
      tagStyle,
      toggleSidebar,
      setLayout,
      setTagStyle
    }
  },
  {
    persist: {
      key: 'app',
      storage: localStorage
    }
  }
)
