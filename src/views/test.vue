<template>
  <div> 测试 </div>
</template>

<script setup lang="ts">
// keep-alive 按组件名匹配，名字需与路由 meta.cacheName 一致（见 routes/modules/main.ts）
defineOptions({ name: 'DashboardHome' })
</script>

<style scoped></style>
