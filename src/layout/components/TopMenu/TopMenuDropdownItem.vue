<template>
  <li class="relative" @mouseenter="openChild = true" @mouseleave="openChild = false">
    <!-- 叶子（站内）：RouterLink -->
    <RouterLink
      v-if="leaf && !isExternalUrl(leaf.index)"
      :to="leaf.index"
      :class="[rowClass, leafActive ? activeClass : idleClass]"
      @click="emit('navigate', leaf.index)"
    >
      <AppIcon :name="leaf.icon" :size="16" />
      <span class="min-w-0 flex-1 truncate" :title="leaf.title">{{ leaf.title }}</span>
    </RouterLink>

    <!-- 叶子（外链）：a 标签新窗口打开，自身不参与路由 -->
    <a
      v-else-if="leaf"
      :href="leaf.index"
      target="_blank"
      rel="noopener noreferrer"
      :class="[rowClass, idleClass]"
      @click="emit('close')"
    >
      <AppIcon :name="leaf.icon" :size="16" />
      <span class="min-w-0 flex-1 truncate" :title="leaf.title">{{ leaf.title }}</span>
    </a>

    <!-- 目录：悬停/点击在右侧展开下一层 -->
    <button
      v-else
      type="button"
      :class="[rowClass, groupActive ? activeClass : idleClass]"
      aria-haspopup="menu"
      :aria-expanded="openChild"
      @click="openChild = !openChild"
    >
      <AppIcon :name="item.meta?.icon" :size="16" />
      <span class="min-w-0 flex-1 truncate text-left" :title="item.meta?.title">
        {{ item.meta?.title }}
      </span>
      <ChevronRight class="size-3.5 shrink-0 opacity-60" />
    </button>

    <div v-if="!leaf && openChild" class="absolute top-0 left-full z-50 pl-1">
      <ul
        class="min-w-44 rounded-lg border border-(--el-border-color-lighter) bg-(--el-bg-color) p-1 shadow-lg"
        role="menu"
      >
        <TopMenuDropdownItem
          v-for="(child, index) in children"
          :key="`${child.path}-${index}`"
          :item="child"
          :base-path="resolveMenuPath(basePath, child.path)"
          @navigate="emit('navigate', $event)"
          @close="emit('close')"
        />
      </ul>
    </div>
  </li>
</template>

<script setup lang="ts">
import { ChevronRight } from '@lucide/vue'
import AppIcon from '@/components/AppIcon/index.vue'
import {
  isExternalUrl,
  resolveMenuLeaf,
  resolveMenuPath,
  visibleChildren,
  type MenuNodeLike
} from '@/utils/route'
import { isGroupActive, isPathActive } from '../Sidebar/menu'

// 同名自引用实现递归渲染（<TopMenuDropdownItem> 在模板中指向自身）
defineOptions({ name: 'TopMenuDropdownItem' })

const props = defineProps<{
  /** 菜单节点 */
  item: MenuNodeLike
  /** 该节点的完整路径 */
  basePath: string
}>()

const emit = defineEmits<{
  /** 点击站内叶子：交给 TopMenu 统一处理跳转 */
  navigate: [index: string]
  /** 关闭整条弹层链 */
  close: []
}>()

const route = useRoute()

/** 与侧边栏共用同一套降级规则 */
const leaf = computed(() => resolveMenuLeaf(props.item, props.basePath))

/** 目录模式下要渲染的可见子项 */
const children = computed(() => visibleChildren(props.item))

/** 下一层是否展开（悬停或点击） */
const openChild = ref(false)

const leafActive = computed(() => !!leaf.value && isPathActive(route.path, leaf.value.index))
const groupActive = computed(() => isGroupActive(props.item, props.basePath, route.path))

const rowClass =
  'flex w-full cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm no-underline transition-colors'

/** 选中/含选中项：主色浅底 + 主色文字 */
const activeClass = 'bg-(--el-color-primary-light-9) text-(--el-color-primary)'

/** 未选中：常规文字色 + 悬停浅底 */
const idleClass =
  'text-(--el-text-color-regular) hover:bg-(--el-fill-color-light) hover:text-(--el-text-color-primary)'
</script>

<style scoped></style>
