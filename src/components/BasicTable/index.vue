<template>
  <!--
    表格容器：只做 UI。
    - 数据与分页状态都由页面持有：分页用 v-model:pagination，交互通过 page-change 抛出；
    - 列全部由 columns 描述，递归渲染成 ElTableColumn（多级表头 = 带 children 的列）；
    - autoHeight：容器是撑满父级的纵向 flex，表格占剩余高度、分页被顶到底部。
  -->
  <div :class="rootClass">
    <div :class="bodyClass">
      <ElTable ref="elTableRef" v-loading="loading" v-bind="mergedTableProps">
        <!--
          ElTable 只把「自己插槽里的 ElTableColumn」当成列（列序也按这里的 DOM 顺序算），
          所以列必须在这一层生成，不能包到别的插槽里去。
        -->
        <TableColumns :columns="columns" />

        <!-- 空数据：页面传了 #empty 就整块接管，否则用 ElEmpty 占位 -->
        <template #empty>
          <div class="flex w-full items-center justify-center" :style="{ minHeight: emptyHeight }">
            <slot name="empty">
              <ElEmpty :description="emptyText" />
            </slot>
          </div>
        </template>
      </ElTable>
    </div>

    <div v-if="showPagination" class="mt-4 flex" :class="paginationAlignClass">
      <ElPagination
        v-bind="mergedPaginationOptions"
        :total="pagination?.total"
        :page-size="pagination?.size"
        :current-page="pagination?.current"
        :disabled="loading"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { TableInstance as ElTableInstance } from 'element-plus'
import { useTablePagination } from './composables/useTablePagination'
import { useTableExpose } from './composables/useTableExpose'
import type { BasicTableProps, PaginationConfig, TableEmits, TableInstance } from './types'
import TableColumns from './columns.vue'

/**
 * 表格封装（全局可用名为 `Tables`）。
 *
 * - `columns` 是唯一的列描述入口：选择列 / 展开列 / 序号列 / 分组表头 / formatter / 插槽都在里面配；
 * - 列内容既能写在 `columns[].slots` 里，也能用模板插槽 `#prop`（模板插槽优先）；
 * - 分页只负责「显示 + 把操作换算成新状态」，取数由页面在 `page-change` 里完成；
 * - `class` / `style` 以及 ElTable 的事件（selection-change / sort-change …）都透传给 ElTable。
 */
defineOptions({ name: 'BasicTable', inheritAttrs: false })

const props = withDefaults(defineProps<BasicTableProps>(), {
  columns: () => [],
  fit: true,
  showHeader: true,
  stripe: undefined,
  border: undefined,
  size: undefined,
  emptyHeight: '100%',
  emptyText: '暂无数据',
  autoHeight: false,
  showTableHeader: true
})
const emit = defineEmits<TableEmits>()

const elTableRef = useTemplateRef<ElTableInstance>('elTableRef')
const attrs = useAttrs()

/** 序号列：分页时接着上一页数，从 (current - 1) * size + 1 开始 */
// const getGlobalIndex = (index: number): number => {
//   const page = props.pagination
//   return page ? (page.current - 1) * page.size + index + 1 : index + 1
// }

const { showPagination, mergedPaginationOptions, paginationAlignClass, nextPagination } =
  useTablePagination({
    pagination: () => props.pagination,
    paginationOptions: () => props.paginationOptions,
    isEmpty: () => props.data?.length === 0
  })

/** 分页交互的统一入口：同步 v-model:pagination，并让页面感知到要重新取数 */
const changePage = (patch: Partial<PaginationConfig>): void => {
  const next = nextPagination(patch)
  if (!next) return
  emit('update:pagination', next)
  emit('page-change', next)
}
/** 改每页条数后回到第 1 页（列表页的习惯做法） */
const handleSizeChange = (size: number): void => changePage({ size, current: 1 })
const handleCurrentChange = (current: number): void => changePage({ current })

// ---------------------------------------------------------------------------
// 透传给 ElTable 的属性
// ---------------------------------------------------------------------------

/** 本组件自己的属性：不能透传给 ElTable，否则会变成野属性落到 DOM 上 */
const OWN_TABLE_PROPS = new Set([
  'columns',
  'pagination',
  'paginationOptions',
  'loading',
  'emptyHeight',
  'emptyText',
  'autoHeight',
  'showTableHeader'
])

/** autoHeight 时把高度交给 flex 容器；页面显式传了 height 就尊重页面的高度 */
const resolvedHeight = computed(() => (props.autoHeight ? (props.height ?? '100%') : props.height))

/** ElTable 的属性 = $attrs（含事件）+ 非本组件的 props；没传的属性让 Element Plus 用自己的默认值 */
const mergedTableProps = computed(() => {
  const tableProps: Record<string, any> = { ...attrs }
  for (const [key, value] of Object.entries(props)) {
    if (!OWN_TABLE_PROPS.has(key) && value !== undefined) tableProps[key] = value
  }
  tableProps.height = resolvedHeight.value
  return tableProps
})

/** autoHeight：容器撑满父级，表格占剩余空间，分页自然吸底 */
const rootClass = computed(() => (props.autoHeight ? 'flex h-full min-h-0 flex-col' : ''))
const bodyClass = computed(() => (props.autoHeight ? 'min-h-0 flex-1' : ''))

defineExpose<TableInstance>(useTableExpose(elTableRef))
</script>

<style scoped></style>
