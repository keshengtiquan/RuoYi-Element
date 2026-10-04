<template>
  <ElAlert
    type="info"
    :closable="false"
    show-icon
    title="这是用 render 传入的只读组件"
    description="render 会完全接管这一项的控件区域，不参与 v-model 绑定（适合展示类内容）。"
  />
</template>

<script setup lang="ts">
/** 示例用「作为 render 的组件」：FormItem.render 可以直接传组件 */
defineOptions({ name: 'DemoReadonly' })
</script>
