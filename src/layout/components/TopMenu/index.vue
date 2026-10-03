<template>
  <nav ref="navRef" class="relative flex min-w-0 flex-1 items-center" aria-label="顶栏菜单">
    <!-- 横向菜单项：放不下的（下标 ≥ visibleCount）移出文档流并隐藏，宽度仍可测量 -->
    <TopMenuBarItem
      v-for="(entry, index) in entries"
      :key="entry.path"
      :hidden="index >= visibleCount"
      :title="entry.title"
      :icon="entry.icon"
      :active="entry.path === activePath"
      :open="openPath === entry.path"
      :is-leaf="entry.isLeaf"
      :index="entry.index"
      @open="openPath = entry.path"
      @close="closeIfOpen(entry.path)"
      @activate="openPath = entry.path"
      @navigate="handleSelect"
    >
      <template #panel>
        <TopMenuDropdownItem
          v-for="(child, childIndex) in entry.children"
          :key="`${child.path}-${childIndex}`"
          :item="child"
          :base-path="resolveMenuPath(entry.path, child.path)"
          @navigate="handleSelect"
          @close="closeAll"
        />
      </template>
    </TopMenuBarItem>

    <!-- 放不下的一级菜单折叠进「更多」 -->
    <TopMenuBarItem
      v-if="overflowEntries.length"
      title="更多"
      icon="ellipsis"
      :active="false"
      :open="openPath === MORE_PATH"
      :is-leaf="false"
      index=""
      @open="openPath = MORE_PATH"
      @close="closeIfOpen(MORE_PATH)"
      @activate="openPath = MORE_PATH"
    >
      <template #panel>
        <TopMenuDropdownItem
          v-for="(entry, index) in overflowEntries"
          :key="`${entry.path}-${index}`"
          :item="entry.item"
          :base-path="entry.path"
          @navigate="handleSelect"
          @close="closeAll"
        />
      </template>
    </TopMenuBarItem>
  </nav>
</template>

<script setup lang="ts">
import {
  isExternalUrl,
  resolveMenuLeaf,
  resolveMenuPath,
  visibleChildren,
  type MenuNodeLike
} from '@/utils/route'
import { isGroupActive } from '../Sidebar/menu'
import { useMenuRoutes } from '../Sidebar/useMenuRoutes'
import TopMenuBarItem from './TopMenuBarItem.vue'
import TopMenuDropdownItem from './TopMenuDropdownItem.vue'

defineOptions({ name: 'TopMenu' })

/** 「更多」在 openPath 里的占位标识（不会和菜单路径冲突） */
const MORE_PATH = '@@more'

/** 「更多」按钮宽度估算值（图标 + 两字 + 内边距），量到真实值后会用真实值 */
const MORE_WIDTH_FALLBACK = 84

const route = useRoute()
const router = useRouter()

/** 与侧边栏 / 双栏布局同一份菜单数据源 */
const menuRoutes = useMenuRoutes()

interface TopEntry {
  /** 一级菜单路径 */
  path: string
  /** 显示名（叶子被降级时用子项的名字） */
  title: string
  icon?: string
  /** 是否叶子（点击直接跳转，没有弹层） */
  isLeaf: boolean
  /** 叶子跳转目标（站内路径或外链网址） */
  index: string
  /** 弹层里的子菜单（目录才有） */
  children: MenuNodeLike[]
  /** 原始节点（「更多」弹层里要按节点渲染） */
  item: MenuNodeLike
}

const entries = computed<TopEntry[]>(() =>
  menuRoutes.value.map((item) => {
    const basePath = item.path
    const leaf = resolveMenuLeaf(item, basePath)
    return {
      path: basePath,
      title: leaf?.title ?? item.meta?.title ?? '',
      icon: leaf?.icon ?? item.meta?.icon,
      isLeaf: !!leaf,
      index: leaf?.index ?? basePath,
      children: leaf ? [] : visibleChildren(item),
      item
    }
  })
)

/** 当前路由落在一级菜单上：isGroupActive 为主，路径相等兜底（外链菜单的 index 是网址） */
const activePath = computed(
  () =>
    entries.value.find(
      (entry) => isGroupActive(entry.item, entry.path, route.path) || entry.path === route.path
    )?.path ?? ''
)

/* ------------------------------------------------------------------ *
 * 弹层开合（悬停展开、点击切换、点击外部 / ESC 关闭）
 * ------------------------------------------------------------------ */

/** 当前展开的项（一级菜单路径，或 MORE_PATH） */
const openPath = ref<string | null>(null)

const closeIfOpen = (path: string): void => {
  if (openPath.value === path) {
    openPath.value = null
  }
}

const closeAll = (): void => {
  openPath.value = null
}

const onDocumentPointerDown = (event: PointerEvent): void => {
  const nav = navRef.value
  if (nav && event.target instanceof Node && nav.contains(event.target)) {
    return
  }
  closeAll()
}

/** ESC 关闭：菜单项本身拿不到焦点，所以监听 document（不是 nav 上的 keydown） */
const onDocumentKeydown = (event: KeyboardEvent): void => {
  if (event.key === 'Escape') {
    closeAll()
  }
}

watch(openPath, (value) => {
  if (value) {
    document.addEventListener('pointerdown', onDocumentPointerDown, true)
    document.addEventListener('keydown', onDocumentKeydown)
  } else {
    document.removeEventListener('pointerdown', onDocumentPointerDown, true)
    document.removeEventListener('keydown', onDocumentKeydown)
  }
})

onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', onDocumentPointerDown, true)
  document.removeEventListener('keydown', onDocumentKeydown)
})

/* ------------------------------------------------------------------ *
 * 溢出折叠：自己算哪几项放得下，放不下的收进「更多」
 * ------------------------------------------------------------------ */

const navRef = ref<HTMLElement | null>(null)

/** 可见的一级菜单数量，其余折叠进「更多」 */
const visibleCount = ref(Number.MAX_SAFE_INTEGER)
/** 实测到的「更多」按钮宽度 */
let measuredMoreWidth = MORE_WIDTH_FALLBACK

const measure = (): void => {
  const nav = navRef.value
  if (!nav) {
    return
  }

  const available = nav.clientWidth
  // 直接读 DOM：菜单项是 nav 的直接子元素，最后多出来的那个就是「更多」
  const children = [...nav.querySelectorAll<HTMLElement>(':scope > div')]
  const widths = children.slice(0, entries.value.length).map((el) => el.offsetWidth)
  if (widths.length !== entries.value.length || widths.some((width) => width === 0)) {
    // 首帧还没量全，下一帧再试
    nextTick(measure)
    return
  }

  const moreEl = children[entries.value.length]
  if (moreEl) {
    measuredMoreWidth = moreEl.offsetWidth
  }

  const used = (count: number, withMore: boolean): number => {
    const items = widths.slice(0, count).reduce((sum, width) => sum + width, 0)
    return withMore ? items + measuredMoreWidth : items
  }

  let count = widths.length
  while (count > 0 && used(count, false) > available) {
    count--
  }
  // 被裁掉了就要给「更多」腾位置，再收敛一次
  if (count < widths.length) {
    while (count > 0 && used(count, true) > available) {
      count--
    }
  }

  visibleCount.value = count

  // 展开中的项正好被折进「更多」了，顺手收起
  if (openPath.value && openPath.value !== MORE_PATH) {
    const index = entries.value.findIndex((entry) => entry.path === openPath.value)
    if (index >= count) {
      closeAll()
    }
  }
}

// 折叠起来的项是 absolute（脱离文档流但仍在 DOM 里），宽度照样能量到，
// 所以容器变宽时能自动把项放回来，不需要「先全显示再收敛」。
useResizeObserver(navRef, measure)

/**
 * 双保险：窗口 resize 也重算一次。
 * 注意要防抖：resize 事件可能先于新视口生效（此时读到的还是旧宽度），
 * 而容器 ResizeObserver 在后台标签会被延后到下一帧，所以两条路都要有。
 */
let resizeTimer: ReturnType<typeof setTimeout> | undefined
const onWindowResize = (): void => {
  clearTimeout(resizeTimer)
  resizeTimer = setTimeout(measure, 120)
}

useEventListener(window, 'resize', onWindowResize)
onBeforeUnmount(() => clearTimeout(resizeTimer))
watch(entries, () => nextTick(measure))
onMounted(() => nextTick(measure))

/** 折叠进「更多」的项 */
const overflowEntries = computed(() => entries.value.slice(visibleCount.value))

/* ------------------------------------------------------------------ *
 * 跳转
 * ------------------------------------------------------------------ */

/**
 * 选中某个叶子：
 * - 外链菜单（index 是真实网址）→ 新窗口打开，不参与路由；
 * - 站内菜单 → 跳转（已在当前路由上就不重复 push）。
 */
const handleSelect = (index: string): void => {
  closeAll()
  if (isExternalUrl(index)) {
    window.open(index, '_blank', 'noopener,noreferrer')
    return
  }
  if (index !== route.path) {
    router.push(index)
  }
}
</script>

<style scoped></style>
