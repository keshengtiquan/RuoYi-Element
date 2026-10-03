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

      <!-- 布局 -->
      <div class="flex items-center justify-between gap-4 py-2.5">
        <span class="text-sm whitespace-nowrap text-(--el-text-color-primary)">布局</span>
        <div class="w-28 shrink-0">
          <ElSelect v-model="layoutName" aria-label="布局" size="small">
            <ElOption
              v-for="option in layoutOptions"
              :key="option.name"
              :label="option.label"
              :value="option.name"
            />
          </ElSelect>
        </div>
      </div>
    </div>
  </ElDrawer>
</template>

<script setup lang="ts">
import { layoutOptions, type LayoutName } from '@/layout/layouts'
import { useAppStore } from '@/stores/modules/app'
import { tagsViewStyleOptions, type TagsViewStyle } from '../TagsViews/styles'

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

/** 布局（选项来自 layout/layouts.ts 的注册表，新增布局会自动出现在下拉里） */
const layoutName = computed<LayoutName>({
  get: () => appStore.layout,
  set: (value) => appStore.setLayout(value)
})

const closeDrawer = (value: boolean): void => {
  emit('update:visible', value)
}
</script>
<style lang="scss" scoped></style>
