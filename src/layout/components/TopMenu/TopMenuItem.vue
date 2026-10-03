<template>
  <!-- 目录：ElSubMenu（横向模式下是悬浮弹层），子项递归渲染 -->
  <ElSubMenu v-if="!leaf" :index="basePath">
    <template #title>
      <span class="flex items-center gap-2.5">
        <AppIcon v-if="item.meta?.icon" :name="item.meta.icon" :size="16" />
        <span>{{ item.meta?.title }}</span>
      </span>
    </template>
    <TopMenuItem
      v-for="(child, index) in children"
      :key="`${child.path}-${index}`"
      :item="child"
      :base-path="resolveMenuPath(basePath, child.path)"
    />
  </ElSubMenu>

  <!-- 叶子：ElMenuItem。外链菜单的 index 就是真实网址，由 TopMenu 的 select 打开新窗口 -->
  <ElMenuItem v-else :index="leaf.index">
    <span class="flex items-center gap-2.5">
      <AppIcon v-if="leaf.icon" :name="leaf.icon" :size="16" />
      <span>{{ leaf.title }}</span>
    </span>
  </ElMenuItem>
</template>

<script setup lang="ts">
import AppIcon from '@/components/AppIcon/index.vue'
import { resolveMenuLeaf, resolveMenuPath, visibleChildren, type MenuNodeLike } from '@/utils/route'

// 同名自引用实现递归渲染（<TopMenuItem> 在模板中指向自身）
defineOptions({ name: 'TopMenuItem' })

const props = defineProps<{
  /** 菜单节点 */
  item: MenuNodeLike
  /** 该节点的完整路径（父级路径 + 自身 path） */
  basePath: string
}>()

/**
 * 与侧边栏共用同一套降级规则：无可见子菜单、或只有一个没有下级子菜单的子项时，
 * 这个节点本身就是叶子（直接渲染成一个可点击的项，而不是带弹层的目录）。
 */
const leaf = computed(() => resolveMenuLeaf(props.item, props.basePath))

/** 目录模式下要渲染的可见子项 */
const children = computed(() => visibleChildren(props.item))
</script>

<style scoped></style>
