<template>
  <!-- 装饰性缩略图：只画导航骨架，交互（选中/点击）全部由外层卡片负责 -->
  <div class="layout-preview" :class="`layout-preview--${name}`" aria-hidden="true">
    <!-- 顶栏布局：深色导航条通栏，下面整块是内容区 -->
    <template v-if="isTop">
      <span class="layout-preview__topbar" />
      <div class="layout-preview__content">
        <Check v-if="active" class="layout-preview__check" :stroke-width="3" />
      </div>
    </template>

    <!-- 侧边导航布局：左导航（双栏多一条二级栏）+ 右侧「顶栏 + 内容区」 -->
    <template v-else>
      <!--
        暗色下 --sidebar-bg-color 和顶栏用的 --el-bg-color 都是 #141414，两者会连成一片、
        看不出左边还有一栏，所以只在暗色下给经典布局补一条分界线（双栏自带分隔线，不用补）。
      -->
      <span
        class="layout-preview__nav"
        :class="isTwoColumn ? undefined : 'dark:border-r dark:border-white/10'"
      />
      <span v-if="isTwoColumn" class="layout-preview__subnav" />
      <div class="layout-preview__main">
        <span class="layout-preview__header" />
        <div class="layout-preview__content">
          <Check v-if="active" class="layout-preview__check" :stroke-width="3" />
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { Check } from '@lucide/vue'

defineOptions({ name: 'LayoutPreview' })

const props = defineProps<{
  /** 布局名（来自 @/layout/layouts 的注册表；未登记的名字按经典布局画） */
  name: string
  /** 是否是当前选中的布局：选中时在内容区叠加一个对勾 */
  active?: boolean
}>()

const isTop = computed(() => props.name === 'top')
const isTwoColumn = computed(() => props.name === 'twoColumn')
</script>

<style scoped>
/*
 * 三套缩略图共用一套「导航条 / 顶栏 / 内容区」的骨架，只靠 --xxx 的宽度差异区分：
 *   default    ：深色侧边栏（26%） + 顶栏 + 内容区
 *   twoColumn  ：深色一级栏（9%） + 深色二级栏（24%） + 顶栏 + 内容区
 *   top        ：深色顶栏（高 30%） + 内容区
 * 颜色一律取主题变量（--sidebar-bg-color 等），深浅色主题下都不用改这里。
 */
.layout-preview {
  display: flex;
  width: 100%;
  height: 100%;
  background-color: var(--el-fill-color-light);
}

/* 经典 / 双栏的左侧导航栏（顶栏布局没有这一栏，它画的是下面的 __topbar） */
.layout-preview__nav {
  flex: none;
  width: 26%;
  height: 100%;
  background-color: var(--sidebar-bg-color);
}

.layout-preview--twoColumn .layout-preview__nav {
  width: 9%;
}

/* 二级菜单栏：真实布局里和一级栏同底色（靠 border 分界），缩略图里提亮一档才看得出是两栏 */
.layout-preview__subnav {
  flex: none;
  width: 24%;
  height: 100%;
  background-color: color-mix(in srgb, var(--sidebar-bg-color) 80%, #fff);
  border-left: 1px solid rgb(255 255 255 / 10%);
}

.layout-preview__main {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
}

/* 顶栏：真实布局是白底导航条 + 一条下边框，缩略图按同一比例给 30% 高 */
.layout-preview__header {
  flex: none;
  height: 30%;
  background-color: var(--el-bg-color);
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.layout-preview--top {
  flex-direction: column;
}

.layout-preview__topbar {
  flex: none;
  width: 100%;
  height: 30%;
  background-color: var(--sidebar-bg-color);
}

/* 内容区：对勾按这个区域居中（和参考图一致，不把导航栏算进去） */
.layout-preview__content {
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;
  min-height: 0;
}

/* 对勾取内容区高度的 48%（≈ 整张卡高的 1/3，与参考图里对勾和卡片的比例一致） */
.layout-preview__check {
  width: auto;
  height: 48%;
  color: var(--el-color-primary);
}
</style>
