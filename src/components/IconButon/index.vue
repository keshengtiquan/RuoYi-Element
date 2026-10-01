<template>
  <button
    type="button"
    class="flex cursor-pointer items-center rounded px-2 py-2 text-(--el-text-color-regular) transition-colors hover:bg-(--el-fill-color-light) hover:text-(--el-text-color-primary)"
  >
    <ElIcon :size="size">
      <slot></slot>
    </ElIcon>
  </button>
</template>

<script setup lang="ts">
defineProps<{
  size?: number
}>()
</script>

<style scoped></style>
