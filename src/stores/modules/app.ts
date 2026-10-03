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

    /**
     * 双栏布局里「一级栏是否展开」：展开时一级图标下方显示文字、栏宽加大。
     * 只影响双栏布局，由一级栏底部的切换按钮控制。
     */
    const railExpanded = ref(false)

    /** 当前布局名（layout/index.vue 据此选择布局组件） */
    const layout = ref<LayoutName>(DEFAULT_LAYOUT)

    /**
     * 标签页激活样式：line 指示线 / tag 标签（选项见 TagsViews/styles.ts）。
     * 放在应用级 store 而不是标签页 store 里，是为了设置面板
     * 和布局、侧边栏折叠一起读写同一份 UI 配置。
     */
    const tagStyle = ref<TagsViewStyle>(DEFAULT_TAGS_VIEW_STYLE)

    /**
     * 系统设置抽屉是否展开。
     *
     * 放在 store 里而不是 NavbarActions 的组件内 ref：抽屉挂在 NavbarActions 内部，
     * 而切换布局会把 `layout/index.vue` 里的 `<component :is>` 整个换掉，
     * NavbarActions 连同抽屉一起卸载重建 —— 组件内的 ref 会跟着丢，表现为「切完布局抽屉自动关了」。
     * 状态提到 store 后，新布局挂载时读到的仍是 true，抽屉会原地重新出现（不关）。
     */
    const settingsVisible = ref(false)

    const openSettings = () => {
      settingsVisible.value = true
    }

    const closeSettings = () => {
      settingsVisible.value = false
    }

    const toggleSidebar = () => {
      sidebarCollapsed.value = !sidebarCollapsed.value
    }

    /** 切换双栏布局一级栏的展开/收起 */
    const toggleRail = () => {
      railExpanded.value = !railExpanded.value
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
      railExpanded,
      layout,
      tagStyle,
      settingsVisible,
      toggleSidebar,
      toggleRail,
      setLayout,
      setTagStyle,
      openSettings,
      closeSettings
    }
  },
  {
    persist: {
      key: 'app',
      storage: localStorage,
      // 只持久化「用户偏好」；settingsVisible 这类瞬时状态不写进本地存储，否则刷新后抽屉会自己弹出来
      pick: ['sidebarCollapsed', 'railExpanded', 'layout', 'tagStyle']
    }
  }
)
