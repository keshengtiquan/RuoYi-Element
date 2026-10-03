<template>
  <!--
    设置面板里的「缩略图 + 名字」选项卡：缩略图和文字同属一个按钮（点文字也能切）。
    导航模式、侧栏风格两行共用，缩略图由插槽传进来。
  -->
  <button
    type="button"
    role="radio"
    :aria-checked="active"
    :aria-label="label"
    class="group flex w-16 shrink-0 cursor-pointer flex-col items-center gap-1.5"
    @click="emit('select')"
  >
    <span
      class="aspect-7/5 w-full overflow-hidden rounded-md border border-(--el-border-color) bg-(--el-bg-color) transition-colors duration-200 group-hover:border-(--el-color-primary-light-5) group-focus-visible:outline-2 group-focus-visible:outline-offset-2 group-focus-visible:outline-(--el-color-primary)"
    >
      <slot />
    </span>
    <span
      class="text-xs whitespace-nowrap transition-colors"
      :class="active ? 'text-(--el-color-primary)' : 'text-(--el-text-color-regular)'"
    >
      {{ label }}
    </span>
  </button>
</template>

<script setup lang="ts">
defineOptions({ name: 'PreviewCard' })

defineProps<{
  /** 卡片下方的名字（同时作为 aria-label） */
  label: string
  /** 是否是当前选中项：选中时名字染主色、`aria-checked` 为 true */
  active: boolean
}>()

const emit = defineEmits<{
  select: []
}>()
</script>
