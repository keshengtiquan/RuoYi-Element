<template>
  <section class="rounded-lg bg-(--el-bg-color) p-4">
    <h2 class="text-sm font-medium text-(--el-text-color-primary)">{{ title }}</h2>
    <p v-if="desc" class="mt-1 text-xs leading-5 text-(--el-text-color-secondary)">
      {{ desc }}
    </p>
    <div class="mt-3">
      <slot />
    </div>
  </section>
</template>

<script setup lang="ts">
/** 示例页里的分区卡片（标题 + 说明 + 内容） */
defineOptions({ name: 'SectionCard' })

defineProps<{
  /** 分区标题（一般写成「序号 覆盖的属性」） */
  title: string
  /** 说明：这块示例在演示什么 */
  desc?: string
}>()
</script>
