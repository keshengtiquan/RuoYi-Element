<template>
  <ElDrawer
    :model-value="visible"
    title="系统设置"
    direction="rtl"
    size="340px"
    @update:model-value="closeDrawer"
  >
    <div class="flex flex-col">
      <!-- 页签显示风格 -->
      <div class="flex items-center justify-between gap-4 py-2.5">
        <span class="text-sm whitespace-nowrap text-(--el-text-color-primary)">页签显示风格</span>
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

      <div class="h-px bg-(--el-border-color-lighter)" />

      <!-- 导航模式：缩略图点选（选项来自 layout/layouts.ts 的注册表，新增布局会自动出现在这里） -->
      <div class="flex flex-col gap-2 py-2.5">
        <span class="text-sm text-(--el-text-color-secondary)">导航模式</span>

        <div class="flex gap-2" role="radiogroup" aria-label="导航模式">
          <ElTooltip
            v-for="option in layoutOptions"
            :key="option.name"
            :content="`${option.label} · ${option.description}`"
            placement="top"
            :show-after="120"
          >
            <button
              type="button"
              role="radio"
              :aria-checked="layoutName === option.name"
              :aria-label="option.label"
              class="aspect-[7/5] w-16 shrink-0 cursor-pointer overflow-hidden rounded-md border border-(--el-border-color) bg-(--el-bg-color) transition-colors duration-200 hover:border-(--el-color-primary-light-5) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--el-color-primary)"
              @click="layoutName = option.name"
            >
              <LayoutPreview :name="option.name" :active="layoutName === option.name" />
            </button>
          </ElTooltip>
        </div>
      </div>
    </div>
  </ElDrawer>
</template>

<script setup lang="ts">
import { layoutOptions, type LayoutName } from '@/layout/layouts'
import { useAppStore } from '@/stores/modules/app'
import { tagsViewStyleOptions, type TagsViewStyle } from '../TagsViews/styles'
import LayoutPreview from './LayoutPreview.vue'

defineOptions({ name: 'SettingsPanel' })

defineProps<{
  /** 抽屉是否显示（由 Navbar 的齿轮按钮控制） */
  visible: boolean
}>()

const emit = defineEmits<{
  'update:visible': [visible: boolean]
}>()

const appStore = useAppStore()

/** 页签显示风格（直接读写 appStore.tagStyle，选项来自 TagsViews/styles.ts） */
const tagStyle = computed<TagsViewStyle>({
  get: () => appStore.tagStyle,
  set: (value) => appStore.setTagStyle(value)
})

/** 当前导航模式（选项来自 layout/layouts.ts 的注册表，新增布局会自动出现在缩略图里） */
const layoutName = computed<LayoutName>({
  get: () => appStore.layout,
  set: (value) => appStore.setLayout(value)
})

const closeDrawer = (value: boolean): void => {
  emit('update:visible', value)
}
</script>
<style lang="scss" scoped></style>
