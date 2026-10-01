<template>
  <ElDrawer
    :model-value="visible"
    title="系统设置"
    direction="rtl"
    size="320px"
    @update:model-value="closeDrawer"
  >
    <div class="flex flex-col gap-7">
      <!-- 标签页样式 -->
      <section>
        <h3 class="text-sm font-medium text-(--el-text-color-primary)">标签页样式</h3>
        <p class="mt-1 mb-3 text-xs text-(--el-text-color-secondary)">
          标签栏里当前激活标签的显示方式
        </p>

        <div class="flex flex-col gap-3" role="radiogroup" aria-label="标签页样式">
          <button
            v-for="option in tagsViewStyleOptions"
            :key="option.value"
            type="button"
            role="radio"
            :aria-checked="appStore.tagStyle === option.value"
            class="cursor-pointer rounded-lg border p-3 text-left transition-colors"
            :class="
              appStore.tagStyle === option.value
                ? 'border-(--el-color-primary) bg-(--el-color-primary-light-9)'
                : 'border-(--el-border-color-lighter) hover:border-(--el-color-primary-light-5)'
            "
            @click="appStore.setTagStyle(option.value)"
          >
            <!-- 预览用的 class 与标签栏同一份映射（styles.ts），所见即所得 -->
            <div
              class="flex h-10 items-center gap-1 overflow-hidden rounded-md border border-(--el-border-color-lighter) bg-(--el-bg-color) px-2"
            >
              <span
                class="shrink-0 text-xs whitespace-nowrap"
                :class="[previewClasses(option.value).base, previewClasses(option.value).idle]"
              >
                首页
              </span>
              <span
                class="relative flex shrink-0 items-center text-xs whitespace-nowrap"
                :class="[previewClasses(option.value).base, previewClasses(option.value).active]"
              >
                用户管理
                <span
                  v-if="previewClasses(option.value).indicator"
                  class="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-(--el-color-primary)"
                />
              </span>
            </div>

            <div class="mt-2 flex items-center justify-between">
              <span class="text-sm text-(--el-text-color-primary)">{{ option.label }}</span>
              <ElIcon v-if="appStore.tagStyle === option.value" class="text-(--el-color-primary)">
                <Check />
              </ElIcon>
            </div>
          </button>
        </div>
      </section>

      <!-- 布局 -->
      <section>
        <h3 class="text-sm font-medium text-(--el-text-color-primary)">布局</h3>
        <p class="mt-1 mb-3 text-xs text-(--el-text-color-secondary)">
          新增布局只需在 layout/layouts.ts 注册，选项会自动出现在这里
        </p>

        <div class="flex flex-col gap-3" role="radiogroup" aria-label="布局">
          <button
            v-for="option in layoutOptions"
            :key="option.name"
            type="button"
            role="radio"
            :aria-checked="appStore.layout === option.name"
            class="cursor-pointer rounded-lg border p-3 text-left transition-colors"
            :class="
              appStore.layout === option.name
                ? 'border-(--el-color-primary) bg-(--el-color-primary-light-9)'
                : 'border-(--el-border-color-lighter) hover:border-(--el-color-primary-light-5)'
            "
            @click="setLayout(option.name)"
          >
            <div class="flex items-center justify-between">
              <span class="text-sm text-(--el-text-color-primary)">{{ option.label }}</span>
              <ElIcon v-if="appStore.layout === option.name" class="text-(--el-color-primary)">
                <Check />
              </ElIcon>
            </div>
            <p class="mt-1 text-xs text-(--el-text-color-secondary)">{{ option.description }}</p>
          </button>
        </div>
      </section>
    </div>
  </ElDrawer>
</template>

<script setup lang="ts">
import { Check } from '@lucide/vue'
import { layoutOptions, type LayoutName } from '@/layout/layouts'
import { useAppStore } from '@/stores/modules/app'
import { tagStyleClasses, tagsViewStyleOptions, type TagsViewStyle } from '../TagsViews/styles'

defineOptions({ name: 'SettingsPanel' })

defineProps<{
  /** 抽屉是否显示（由 Navbar 的齿轮按钮控制） */
  visible: boolean
}>()

const emit = defineEmits<{
  'update:visible': [visible: boolean]
}>()

const appStore = useAppStore()

/** 预览用的样式映射，与标签栏本身共用 styles.ts */
const previewClasses = (style: TagsViewStyle) => tagStyleClasses[style]

/** 布局名来自注册表（当前只有一个），这里收一下类型 */
const setLayout = (name: string): void => {
  appStore.setLayout(name as LayoutName)
}

const closeDrawer = (value: boolean): void => {
  emit('update:visible', value)
}
</script>
