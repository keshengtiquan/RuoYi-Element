<template>
  <div />
</template>

<script setup lang="ts">
/**
 * 「重新加载」中转页。
 *
 * 由 TagsViews 跳到 /redirect/<原路径>，这里立刻 replace 回原路径：
 * 目标组件会重新挂载，从而达到刷新当前页的效果（配合 <KeepAlive> 也能拿到新实例）。
 * 该路由是隐藏路由，且 TagsViews 不会为 /redirect 开头的路径生成标签。
 */
defineOptions({ name: 'Redirect' })

const route = useRoute()
const router = useRouter()

const rawPath = route.params.path
const path = Array.isArray(rawPath) ? rawPath.join('/') : (rawPath ?? '')

router.replace({ path: `/${String(path).replace(/^\/+/, '')}`, query: route.query })
</script>
