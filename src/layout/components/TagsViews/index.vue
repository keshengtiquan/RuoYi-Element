<template>
  <div
    class="flex h-10 shrink-0 items-center border-b border-(--el-border-color-lighter) bg-(--el-bg-color)"
  >
    <!--
      左右箭头：只有标签总宽溢出时才出现，占实际宽度并与标签栏等高（h-full）。
      出现时标签区会自动收窄，测量以收窄后的宽度为准，因此不会来回抖动。
    -->
    <button
      v-show="canScrollLeft"
      type="button"
      class="flex h-full w-8 shrink-0 cursor-pointer items-center justify-center border-r border-(--el-border-color-lighter) bg-(--el-bg-color) text-(--el-text-color-secondary) transition-colors hover:bg-(--el-fill-color-light) hover:text-(--el-text-color-primary)"
      aria-label="向左滚动标签"
      @click="scrollBy(-TAG_SCROLL_STEP)"
    >
      <ChevronLeft :size="16" />
    </button>

    <div
      ref="stripRef"
      class="tag-strip flex h-full min-w-0 flex-1 items-center gap-1 overflow-x-auto px-2"
      @wheel="onWheel"
    >
      <TagItem
        v-for="tag in tags"
        :key="tag.path"
        :tag="tag"
        :active="tag.path === route.path"
        :menu-open="menuVisible && menuTag?.path === tag.path"
        @select="openTag"
        @close="closeTag"
        @contextmenu="openMenu"
      />
    </div>

    <button
      v-show="canScrollRight"
      type="button"
      class="flex h-full w-8 shrink-0 cursor-pointer items-center justify-center border-l border-(--el-border-color-lighter) bg-(--el-bg-color) text-(--el-text-color-secondary) transition-colors hover:bg-(--el-fill-color-light) hover:text-(--el-text-color-primary)"
      aria-label="向右滚动标签"
      @click="scrollBy(TAG_SCROLL_STEP)"
    >
      <ChevronRight :size="16" />
    </button>

    <TagContextMenu
      :visible="menuVisible"
      :x="menuX"
      :y="menuY"
      :items="menuItems"
      @select="handleMenuSelect"
      @close="menuVisible = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ChevronLeft, ChevronRight } from '@lucide/vue'
import { HOME_ROUTE_PATH } from '@/constants/app'
import { useTagsViewStore, type TagView } from '@/stores/modules/tagsView'
import TagContextMenu from './TagContextMenu.vue'
import TagItem from './TagItem.vue'
import { buildTagContextMenu, type TagContextMenuKey } from './menu'
import { TAG_SCROLL_STEP, useTagsScroll } from './useTagsScroll'

defineOptions({ name: 'TagsViews' })

/** 「重新加载」用的中转路由前缀，见 router/routes/coreRoutes.ts */
const REDIRECT_PREFIX = '/redirect'

/** 全屏目标元素在布局与 AppMain 上的 id */
const BODY_ELEMENT_ID = 'app-main-column'
const CONTENT_ELEMENT_ID = 'app-main'

const route = useRoute()
const router = useRouter()
const tagsViewStore = useTagsViewStore()

const tags = computed(() => tagsViewStore.visitedViews)

// ------------------------------ 横向滚动与溢出箭头 ------------------------------
const stripRef = ref<HTMLElement | null>(null)
const { canScrollLeft, canScrollRight, update, scrollBy, scrollTagIntoView, onWheel } =
  useTagsScroll(stripRef, () => [tags.value.length, route.path])

// ------------------------------ 右键菜单 ------------------------------
const menuVisible = ref(false)
const menuX = ref(0)
const menuY = ref(0)
const menuTag = ref<TagView | null>(null)

const menuItems = computed(() => {
  if (!menuTag.value) {
    return []
  }
  return buildTagContextMenu({
    tag: menuTag.value,
    tags: tags.value,
    bodyFullscreen: bodyFullscreen.value,
    contentFullscreen: contentFullscreen.value,
    fullscreenSupported: fullscreenSupported.value
  })
})

/** 右键打开菜单，菜单跟随鼠标位置（组件内部会收敛到视口内） */
const openMenu = (tag: TagView, event: MouseEvent): void => {
  menuTag.value = tag
  menuX.value = event.clientX
  menuY.value = event.clientY
  menuVisible.value = true
}

// ------------------------------ 全屏：主体区域 / 内容区域 ------------------------------
// 主体区域 = 右侧列（顶栏 + 标签 + 内容，不含侧边栏）；内容区域 = AppMain 的 <main>
const bodyEl = ref<HTMLElement | null>(null)
const contentEl = ref<HTMLElement | null>(null)

const {
  isFullscreen: bodyFullscreen,
  isSupported: bodyFullscreenSupported,
  toggle: toggleBodyFullscreen
} = useFullscreen(bodyEl)

const {
  isFullscreen: contentFullscreen,
  isSupported: contentFullscreenSupported,
  toggle: toggleContentFullscreen
} = useFullscreen(contentEl)

const fullscreenSupported = computed(
  () => bodyFullscreenSupported.value && contentFullscreenSupported.value
)

// ------------------------------ 标签操作 ------------------------------
/** 点击标签：已经是当前页就不重复跳转 */
const openTag = (tag: TagView): void => {
  if (tag.path !== route.path) {
    router.push(tag.fullPath)
  }
}

/**
 * 关闭标签：关的是当前页时，优先激活它右边的标签，没有右边就激活左边；
 * 一个都不剩时回首页。
 */
const closeTag = async (tag: TagView): Promise<void> => {
  if (tag.affix) {
    return
  }

  const index = tags.value.findIndex((item) => item.path === tag.path)
  const isActive = tag.path === route.path

  tagsViewStore.delView(tag)

  if (!isActive) {
    return
  }

  const next = tags.value[Math.min(index, tags.value.length - 1)]
  await router.push(next ? next.fullPath : HOME_ROUTE_PATH)
}

/**
 * 重新加载：先清掉该页缓存，再经 /redirect 中转一次，
 * 让目标组件真正重新挂载（而不是被 <KeepAlive> 复用旧实例）。
 */
const reloadTag = async (tag: TagView): Promise<void> => {
  tagsViewStore.delCachedView(tag)
  await nextTick()
  await router.replace(`${REDIRECT_PREFIX}${tag.fullPath}`)
  tagsViewStore.addCachedView(tag)
}

/** 批量关闭后当前页标签可能已被关掉，此时跳到右键选中的标签 */
const ensureActiveTagExists = async (fallback: TagView): Promise<void> => {
  const stillOpen = tagsViewStore.visitedViews.some((item) => item.path === route.path)
  if (!stillOpen) {
    await router.push(fallback.fullPath)
  }
}

const handleMenuSelect = async (key: TagContextMenuKey): Promise<void> => {
  const tag = menuTag.value
  menuVisible.value = false

  if (!tag) {
    return
  }

  switch (key) {
    case 'reload':
      await reloadTag(tag)
      break
    case 'close':
      await closeTag(tag)
      break
    case 'fullscreen-body':
      await toggleBodyFullscreen()
      break
    case 'fullscreen-content':
      await toggleContentFullscreen()
      break
    case 'close-left':
      tagsViewStore.delLeftViews(tag)
      await ensureActiveTagExists(tag)
      break
    case 'close-right':
      tagsViewStore.delRightViews(tag)
      await ensureActiveTagExists(tag)
      break
    case 'close-others':
      tagsViewStore.delOthersViews(tag)
      await ensureActiveTagExists(tag)
      break
    case 'close-all': {
      tagsViewStore.delAllViews()
      const first = tags.value[0]
      await router.push(first ? first.fullPath : HOME_ROUTE_PATH)
      break
    }
    case 'affix':
      tagsViewStore.toggleAffix(tag)
      break
    case 'open-window':
      window.open(router.resolve(tag.fullPath).href, '_blank', 'noopener')
      break
  }
}

// ------------------------------ 生命周期 ------------------------------
onMounted(() => {
  // 全屏目标元素由布局与 AppMain 渲染，挂载后才能取到
  bodyEl.value = document.getElementById(BODY_ELEMENT_ID)
  contentEl.value = document.getElementById(CONTENT_ELEMENT_ID)

  // 固定标签（meta.affix）+ 首次进入的当前页
  tagsViewStore.initAffixTags(router.getRoutes())
  tagsViewStore.addView(route)

  nextTick(() => {
    update()
    scrollTagIntoView(route.path)
  })
})

watch(
  () => route.fullPath,
  () => {
    tagsViewStore.addView(route)
    nextTick(() => scrollTagIntoView(route.path))
  }
)
</script>

<style scoped>
/* 标签栏隐藏原生滚动条，改用左右箭头 */
.tag-strip {
  scrollbar-width: none;
}

.tag-strip::-webkit-scrollbar {
  display: none;
}
</style>
