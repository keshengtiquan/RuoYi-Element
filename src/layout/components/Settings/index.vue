<template>
  <ElDrawer
    :model-value="visible"
    title="系统设置"
    direction="rtl"
    size="300px"
    @update:model-value="closeDrawer"
  >
    <div class="flex flex-col">
      <!-- 主题模式：亮色 / 暗黑 / 跟随系统（偏好存在 vueuse 的 vueuse-color-scheme，顶栏的主题按钮读写同一份） -->
      <div class="flex flex-col gap-2 py-2.5">
        <span class="text-sm text-(--el-text-color-secondary)">主题模式</span>

        <ElSegmented
          :model-value="themeMode"
          :options="THEME_MODE_OPTIONS"
          block
          aria-label="主题模式"
          @update:model-value="setThemeMode"
        />
      </div>

      <div class="h-px bg-(--el-border-color-lighter)" />

      <!-- 导航模式：缩略图点选（选项来自 layout/layouts.ts 的注册表，新增布局会自动出现在这里） -->
      <div class="flex flex-col gap-2 py-2.5">
        <span class="text-sm text-(--el-text-color-secondary)">导航模式</span>

        <div class="flex gap-2" role="radiogroup" aria-label="导航模式">
          <ElTooltip
            v-for="option in layoutOptions"
            :key="option.name"
            :content="option.description"
            placement="top"
            :show-after="120"
          >
            <PreviewCard
              :label="option.label"
              :active="layoutName === option.name"
              @select="layoutName = option.name"
            >
              <LayoutPreview :name="option.name" :active="layoutName === option.name" />
            </PreviewCard>
          </ElTooltip>
        </div>
      </div>

      <div class="h-px bg-(--el-border-color-lighter)" />

      <!-- 侧栏风格：亮色 / 暗色 / 主色（配色见 styles/tailwind.css 的 html.sidebar-*） -->
      <div class="flex flex-col gap-2 py-2.5">
        <span class="text-sm text-(--el-text-color-secondary)">侧栏风格</span>

        <div class="flex gap-2" role="radiogroup" aria-label="侧栏风格">
          <PreviewCard
            v-for="option in SIDEBAR_STYLE_OPTIONS"
            :key="option.value"
            :label="option.label"
            :active="sidebarStyle === option.value"
            @select="sidebarStyle = option.value"
          >
            <SidebarPreview :style="option.value" :active="sidebarStyle === option.value" />
          </PreviewCard>
        </div>
      </div>

      <div class="h-px bg-(--el-border-color-lighter)" />

      <!-- 主题颜色：点色块即改主色，最后一个是自定义取色 -->
      <div class="flex flex-col gap-2 py-2.5">
        <span class="text-sm text-(--el-text-color-secondary)">主题颜色</span>

        <div class="flex flex-wrap items-center gap-2" role="radiogroup" aria-label="主题颜色">
          <button
            v-for="color in THEME_COLOR_PRESETS"
            :key="color"
            type="button"
            role="radio"
            :aria-checked="themeColor === color"
            :aria-label="`主题色 ${color}`"
            class="flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-lg transition-transform duration-200 hover:scale-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--el-color-primary)"
            :style="{ backgroundColor: color }"
            @click="themeColor = color"
          >
            <Check v-if="themeColor === color" :size="14" :stroke-width="3" class="text-white" />
          </button>

          <!-- 自定义：彩虹块 + ElColorPicker（触发器画成彩虹，见 <style>） -->
          <div class="theme-color-custom relative size-6 shrink-0">
            <ElColorPicker
              :model-value="themeColor"
              aria-label="自定义主题色"
              @update:model-value="setCustomColor"
            />
            <Check
              v-if="isCustomColor"
              :size="14"
              :stroke-width="3"
              class="pointer-events-none absolute inset-0 m-auto text-white"
            />
          </div>
        </div>
      </div>
      <div class="h-px bg-(--el-border-color-lighter)" />

      <!-- 页签配置：两个开关 + 显示风格 -->
      <div class="flex flex-col gap-2 py-2.5">
        <span class="text-sm text-(--el-text-color-secondary)">页签配置</span>

        <div class="flex flex-col">
          <div class="flex items-center justify-between gap-4 py-1.5">
            <span class="text-sm whitespace-nowrap text-(--el-text-color-primary)">
              开启多页签栏
            </span>
            <ElSwitch v-model="tagsViewVisible" aria-label="开启多页签栏" />
          </div>
          <div class="flex items-center justify-between gap-4 py-1.5">
            <span class="text-sm whitespace-nowrap text-(--el-text-color-primary)">
              页面切换缓存
            </span>
            <ElSwitch v-model="pageCacheEnabled" aria-label="页面切换缓存" />
          </div>
          <div class="flex items-center justify-between gap-4 py-1.5">
            <span class="text-sm whitespace-nowrap text-(--el-text-color-primary)">
              页签显示风格
            </span>
            <!-- ElSelect 自身是 width:100%，宽度要由外层容器给（直接写 w-28 会被 EP 样式盖掉） -->
            <div class="w-28 shrink-0">
              <ElSelect v-model="tagStyle" aria-label="页签显示风格" size="small">
                <ElOption
                  v-for="option in tagsViewStyleOptions"
                  :key="option.value"
                  :label="option.label"
                  :value="option.value"
                />
              </ElSelect>
            </div>
          </div>
        </div>
      </div>

      <div class="h-px bg-(--el-border-color-lighter)" />

      <!-- 其他配置 -->
      <div class="flex flex-col gap-2 py-2.5">
        <span class="text-sm text-(--el-text-color-secondary)">其他配置</span>

        <div class="flex items-center justify-between gap-4 py-1.5">
          <span class="text-sm whitespace-nowrap text-(--el-text-color-primary)">路由切换动画</span>
          <!-- 选项 = styles/animation.scss 里的过渡类名，见 AppMain/transitions.ts -->
          <div class="w-28 shrink-0">
            <ElSelect v-model="routeTransition" aria-label="路由切换动画" size="small">
              <ElOption
                v-for="option in ROUTE_TRANSITION_OPTIONS"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              />
            </ElSelect>
          </div>
        </div>
      </div>
      <div class="h-px bg-(--el-border-color-lighter)" />

      <!-- 配置管理：复制当前配置 / 恢复默认配置（出厂值见 src/config.ts） -->
      <div class="flex gap-2 py-2.5">
        <ElButton class="flex-1" aria-label="复制当前配置" @click="copySettings">
          复制当前配置
        </ElButton>
        <ElButton class="flex-1" aria-label="恢复默认配置" @click="restoreSettings">
          恢复默认配置
        </ElButton>
      </div>
    </div>
  </ElDrawer>
</template>

<script setup lang="ts">
import { Check } from '@lucide/vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { layoutOptions, type LayoutName } from '@/layout/layouts'
import { useAppStore } from '@/stores/modules/app'
import { SIDEBAR_STYLE_OPTIONS, THEME_COLOR_PRESETS, type SidebarStyle } from '@/utils/theme'
import { ROUTE_TRANSITION_OPTIONS, type RouteTransitionName } from '../AppMain/transitions'
import { tagsViewStyleOptions, type TagsViewStyle } from '../TagsViews/styles'
import { THEME_MODE_OPTIONS, useThemeMode, type ThemeMode } from '../ThemeToggle/useThemeMode'
import LayoutPreview from './LayoutPreview.vue'
import PreviewCard from './PreviewCard.vue'
import SidebarPreview from './SidebarPreview.vue'
import { useAppSettings } from './useAppSettings'

defineOptions({ name: 'SettingsPanel' })

defineProps<{
  /** 抽屉是否显示（由 Navbar 的齿轮按钮控制） */
  visible: boolean
}>()

const emit = defineEmits<{
  'update:visible': [visible: boolean]
}>()

const appStore = useAppStore()

const { preference: themeModePreference, setMode } = useThemeMode()

/** 主题模式：亮色 / 暗黑 / 跟随系统（与顶栏的主题按钮共用一份偏好） */
const themeMode = computed<ThemeMode>(() => themeModePreference.value)

/** ElSegmented 的值类型是 string | number | boolean，按选项收窄回主题模式 */
const setThemeMode = (value: string | number | boolean): void => {
  const matched = THEME_MODE_OPTIONS.find((option) => option.value === value)
  if (matched) {
    setMode(matched.value)
  }
}

/** 页签显示风格（直接读写 appStore.tagStyle，选项来自 TagsViews/styles.ts） */
const tagStyle = computed<TagsViewStyle>({
  get: () => appStore.tagStyle,
  set: (value) => appStore.setTagStyle(value)
})

/** 是否显示多页签栏（三种布局的标签栏共用） */
const tagsViewVisible = computed<boolean>({
  get: () => appStore.tagsViewVisible,
  set: (value) => appStore.setTagsViewVisible(value)
})

/** 是否缓存页面（AppMain 的 KeepAlive include） */
const pageCacheEnabled = computed<boolean>({
  get: () => appStore.pageCacheEnabled,
  set: (value) => appStore.setPageCacheEnabled(value)
})

/** 当前导航模式（选项来自 layout/layouts.ts 的注册表，新增布局会自动出现在缩略图里） */
const layoutName = computed<LayoutName>({
  get: () => appStore.layout,
  set: (value) => appStore.setLayout(value)
})

/** 当前侧栏风格（暗色 / 亮色 / 主色，配色在 styles/tailwind.css） */
const sidebarStyle = computed<SidebarStyle>({
  get: () => appStore.sidebarStyle,
  set: (value) => appStore.setSidebarStyle(value)
})

/** 当前路由切换动画（选项来自 styles/animation.scss） */
const routeTransition = computed<RouteTransitionName>({
  get: () => appStore.routeTransition,
  set: (value) => appStore.setRouteTransition(value)
})

/** 当前主题色：色块点击与自定义取色器（ElColorPicker）共用这一份读写 */
const themeColor = computed<string>({
  get: () => appStore.themeColor,
  set: (value) => appStore.setThemeColor(value)
})

/** 自定义取色：ElColorPicker 清空时会抛 null，交给 store 的校验忽略掉 */
const setCustomColor = (value: string | null): void => {
  appStore.setThemeColor(value ?? '')
}

/** 当前主题色不在预设里 → 选中标记落在自定义色块上 */
const isCustomColor = computed(() => !THEME_COLOR_PRESETS.includes(appStore.themeColor))

// ------------------------------ 配置管理（复制 / 恢复默认） ------------------------------
const { currentSettings, restoreDefaults } = useAppSettings()

/**
 * 复制当前配置：复制出来的是与 `src/config.ts` 的 DEFAULT_SETTINGS 同结构的 JSON，
 * 可以直接粘回 config.ts 当默认值，或者存档发给别人。
 */
const { copy, isSupported: clipboardSupported } = useClipboard({ legacy: true })

const copySettings = async (): Promise<void> => {
  if (!clipboardSupported.value) {
    ElMessage.warning('当前环境不支持复制，请手动复制')
    return
  }
  await copy(JSON.stringify(currentSettings.value, null, 2))
  ElMessage.success('当前配置已复制')
}

/** 恢复默认配置：按 src/config.ts 的出厂值逐项重置（不可撤销，先确认一次） */
const restoreSettings = async (): Promise<void> => {
  try {
    await ElMessageBox.confirm('确定恢复默认配置吗？当前设置会被重置为出厂值。', '提示', {
      confirmButtonText: '恢复默认',
      cancelButtonText: '取消',
      type: 'warning'
    })
  } catch {
    return // 用户取消
  }
  restoreDefaults()
  ElMessage.success('已恢复默认配置')
}

const closeDrawer = (value: boolean): void => {
  emit('update:visible', value)
}
</script>
<style lang="scss" scoped>
/*
 * 自定义取色：ElColorPicker 的触发器本身就是「当前色方块 + 下拉箭头」，
 * 这里把它整块改成彩虹色块（当前色另有选中对勾表示），尺寸与预设色块对齐。
 *
 * ⚠️ 样式必须从外层这个 div 往下用 :deep()：ElColorPicker 的根节点（tooltip 触发器）
 * 拿不到本组件的 scoped 属性（`data-v-xxx`），直接写 `.el-color-picker__trigger` 选不中。
 */
.theme-color-custom {
  :deep(.el-color-picker) {
    width: 24px;
    height: 24px;
  }

  :deep(.el-color-picker__trigger) {
    width: 24px;
    height: 24px;
    padding: 0;
    background: conic-gradient(
      from 90deg,
      #ff3b30,
      #ff9500,
      #fc0,
      #34c759,
      #00c7be,
      #0a84ff,
      #af52de,
      #ff2d55,
      #ff3b30
    );
    border: none;
    border-radius: 8px;
  }

  :deep(.el-color-picker__color),
  :deep(.el-color-picker__icon) {
    display: none;
  }
}
</style>
