<template>
  <span class="inline-flex items-center gap-1">
    <ElTag type="success" size="small" effect="plain">组件标签</ElTag>
  </span>
</template>

<script setup lang="ts">
/** 示例用「作为 label 的组件」：FormItem.label 可以直接传组件 */
defineOptions({ name: 'DemoLabel' })
</script>
