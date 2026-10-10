<template>
  <div class="relative flex h-full min-h-0 border border-(--el-border-color) rounded-lg">
    <!-- ===================== 左侧：部门树 ===================== -->
    <aside
      class="h-full shrink-0 overflow-hidden bg-(--el-bg-color) border-r border-(--el-border-color) transition-[width] duration-200 ease-in-out rounded-l-lg"
      :class="deptPanelCollapsed ? 'w-0' : 'w-75'"
    >
      <div class="flex h-full w-75 flex-col">
        <ElInput
          v-model="deptKeyword"
          class="shrink-0 px-4 py-4.5"
          placeholder="输入部门名称搜索"
          clearable
        >
          <template #prefix>
            <AppIcon name="Search" :size="14" />
          </template>
        </ElInput>

        <ElScrollbar
          v-loading="deptLoading"
          class="min-h-0 flex-1 border-t border-(--el-border-color) px-4 py-4.5"
        >
          <ElTree
            ref="deptTreeRef"
            :data="deptTree"
            :props="deptTreeProps"
            node-key="id"
            default-expand-all
            highlight-current
            :expand-on-click-node="false"
            :empty-text="deptKeyword ? '没有匹配的部门' : '暂无部门数据'"
            @node-click="handleDeptClick"
          >
            <!-- 部门节点：部门图标 + 名称（图标名见 @/components/AppIcon/icons.ts） -->
            <template #default="{ data }">
              <span class="flex min-w-0 items-center gap-1.5">
                <AppIcon name="Building2" :size="14" class="text-(--el-text-color-regular)" />
                <span class="truncate">{{ data.label }}</span>
              </span>
            </template>
          </ElTree>
        </ElScrollbar>
      </div>
    </aside>

    <!--
      折叠开关：骑在分隔线正中间。
      不放在 aside 里是因为 aside 收起时是 overflow-hidden，按钮会被裁掉。
    -->
    <button
      type="button"
      class="absolute top-1/2 z-10 flex size-6 -translate-x-1/2 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-(--el-border-color) bg-(--el-bg-color) text-(--el-text-color-regular) transition-colors hover:border-(--el-color-primary) hover:text-(--el-color-primary)"
      :style="{ left: deptPanelCollapsed ? '0px' : '300px' }"
      :aria-label="deptPanelCollapsed ? '展开部门树' : '收起部门树'"
      @click="deptPanelCollapsed = !deptPanelCollapsed"
    >
      <AppIcon :name="deptPanelCollapsed ? 'ChevronRight' : 'ChevronLeft'" :size="14" />
    </button>

    <!-- ===================== 右侧：查询栏 + 用户表格 ===================== -->
    <div class="flex min-w-0 flex-1 flex-col bg-(--el-bg-color) rounded-r-lg">
      <!--
        查询条件：默认 span=6（一行 4 列），3 个条件 + 按钮正好占满一行。
        按钮不另配 action-align：不配时 Form 会推断成「紧跟表单项靠左」，
        正好落在第 4 列（配置 center/right 会让按钮独占一行，与设计稿不符）。
      -->
      <SearchForm
        v-model="query"
        class="shrink-0 border-b border-(--el-border-color) pt-4.5 rounded-r-lg"
        search-text="搜索"
        :items="searchItems"
        @search="handleSearch"
        @reset="handleReset"
      />

      <!--
        min-h-0 不能删：flex 子项默认 min-height: auto，会给表格撑出一个「内容高度」下限，
        查询栏变化时整页会出滚动条。加上它表格才会跟着变矮（ElTable 自己会重算 body 高度）。
      -->
      <div class="mt-2 min-h-0 flex-1 px-4 pb-4">
        <BasicTable
          ref="tableRef"
          v-model:pagination="pagination"
          :data="tableData"
          :columns="columns"
          :loading="loading"
          :autoHeight="true"
          border
          @refresh="getTableData"
          @page-change="getTableData"
          @selection-change="handleSelectionChange"
          @filter-change="handleFilterChange"
        >
          <!-- 工具条左侧按钮：添加 / 删除 / 导入 / 导出 -->
          <template #header-left>
            <ActionButton type="add" @click="handleAdd" />
            <!--
              设计稿里未勾选时「删除」也是正常样式，所以不挂 disabled，
              未勾选时由 handleBatchDelete 提示（而不是让按钮变灰）。
            -->
            <ActionButton type="delete" @click="handleBatchDelete" />
            <ElButton @click="handleImport">
              <AppIcon name="Upload" class="mr-1" :size="14" />
              导入
            </ElButton>
            <ElButton :loading="exporting" @click="handleExport">
              <AppIcon name="Download" class="mr-1" :size="14" />
              导出
            </ElButton>
          </template>

          <!-- 行内操作：修改 / 删除 / 更多（超级管理员不给操作，与 RuoYi 一致） -->
          <template #operation="{ row }">
            <div v-if="!isSuperAdmin(row)" class="flex items-center justify-center gap-1">
              <ActionButton type="link" icon="PenLine" label="修改" @click="handleEdit(row)" />
              <ElDivider direction="vertical" />
              <ActionButton
                type="link"
                icon="Trash"
                color="danger"
                label="删除"
                @click="handleDelete(row)"
              />
              <ElDivider direction="vertical" />
              <ElDropdown
                trigger="click"
                placement="bottom-end"
                @command="(command: string) => handleMoreCommand(command, row)"
              >
                <span
                  class="inline-flex cursor-pointer items-center gap-0.5 text-(--el-color-primary) transition-colors hover:text-(--el-color-primary-light-3)"
                >
                  更多
                  <AppIcon name="ChevronDown" :size="14" />
                </span>
                <template #dropdown>
                  <ElDropdownMenu>
                    <ElDropdownItem command="resetPwd">重置密码</ElDropdownItem>
                    <ElDropdownItem command="authRole">分配角色</ElDropdownItem>
                  </ElDropdownMenu>
                </template>
              </ElDropdown>
            </div>
          </template>
        </BasicTable>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  ElButton,
  ElDivider,
  ElDropdown,
  ElDropdownItem,
  ElDropdownMenu,
  ElInput,
  ElMessage,
  ElMessageBox,
  ElScrollbar,
  ElSwitch,
  ElTree
} from 'element-plus'
import ActionButton from '@/components/ActionButton/index.vue'
import AppIcon from '@/components/AppIcon/index.vue'
import BasicTable from '@/components/BasicTable/index.vue'
import type { ColumnOption, PaginationConfig, TableInstance } from '@/components/BasicTable/types'
import { sanitizeFormData, SearchForm, type FormItem } from '@/components/Form'
import { getDeptTreeApi, type DeptTreeNode } from '@/api/system/dept'
import {
  changeUserStatusApi,
  deleteUserApi,
  exportUserApi,
  getUserListApi,
  type UserListParams,
  type UserStatus
} from '@/api/system/user'
import type { SysUser } from '@/types/entity'

// keep-alive 按组件名匹配，名字需与路由 meta.cacheName 一致
// （后端菜单 component = 'system/user/index' → componentToName 推导出 'SystemUser'）
defineOptions({ name: 'SystemUser' })

// ---------------------------------------------------------------------------
// 左侧部门树
// ---------------------------------------------------------------------------

/** 部门树字段映射（后端 TreeSelect 用的是 id / label，不是 deptId / deptName） */
const deptTreeProps = { label: 'label', children: 'children' }

const deptTreeRef = useTemplateRef<InstanceType<typeof ElTree>>('deptTreeRef')
/** 后端返回的完整部门树（前端过滤的原始数据） */
const rawDeptTree = ref<DeptTreeNode[]>([])
const deptKeyword = ref('')
const deptLoading = ref(false)
const deptPanelCollapsed = ref(false)

/**
 * 当前选中的部门ID（左侧树点出来的）。
 *
 * 刻意不放进查询栏的 model：SearchForm 的「重置」会把 model 恢复成挂载时的快照
 * （快照里没有 deptId），会被一起清掉；部门是树的选中态，重置查询条件时不该丢。
 */
const deptId = ref<number>()

/**
 * 前端过滤部门树。
 *
 * 规则（两道命中）：
 * 1. 节点名命中关键字 → 保留该节点**及其整棵子树**（搜「长沙」时长沙分公司下面的部门都还在）；
 * 2. 节点名没命中、但有子孙命中 → 只保留命中的子孙（父节点留着当路径）；
 * 3. 都没命中 → 整枝裁掉。
 *
 * 用 computed 而不是 ElTree 的 filter-node-method：后者命中父节点时不会显示未命中的子节点，
 * 搜「深圳」会看不到深圳总公司下面的部门。
 */
const filterDeptTree = (nodes: DeptTreeNode[], keyword: string): DeptTreeNode[] => {
  const kw = keyword.trim().toLowerCase()
  if (!kw) return nodes

  const result: DeptTreeNode[] = []
  for (const node of nodes) {
    const label = String(node.label ?? '').toLowerCase()
    if (label.includes(kw)) {
      // 命中自身：整棵子树原样保留
      result.push(node)
      continue
    }
    const children = node.children ? filterDeptTree(node.children, kw) : []
    if (children.length > 0) {
      result.push({ ...node, children })
    }
  }
  return result
}

/** 过滤后的部门树（绑定给 ElTree） */
const deptTree = computed(() => filterDeptTree(rawDeptTree.value, deptKeyword.value))

/** 拉取部门树，并默认选中第一个节点 → 表格按该部门过滤（设计稿的初始态就是这样） */
const getDeptTree = async (): Promise<void> => {
  deptLoading.value = true
  try {
    rawDeptTree.value = (await getDeptTreeApi()) ?? []
    const first = rawDeptTree.value[0]
    if (!first) return
    deptId.value = first.id
    // setCurrentKey 依赖节点已渲染（node-key="id"），等一次 nextTick 更稳
    await nextTick()
    deptTreeRef.value?.setCurrentKey(first.id)
  } finally {
    deptLoading.value = false
  }
}

/** 点击部门节点：按部门（后端会带上所有下级部门）查询用户，并回到第 1 页 */
const handleDeptClick = (data: DeptTreeNode): void => {
  deptId.value = data.id
  pagination.value.current = 1
  getTableData()
}

// ---------------------------------------------------------------------------
// 查询条件
// ---------------------------------------------------------------------------

/**
 * 查询栏表单模型。
 * dateRange 只在页面上用，请求前会拆成后端的 params.beginTime / params.endTime；
 * status 由状态列的漏斗筛写进来（不是查询栏的字段）。
 */
type UserSearchForm = {
  /** 用户名称（模糊匹配） */
  userName?: string
  /** 手机号码（模糊匹配） */
  phonenumber?: string
  /** 用户状态（状态列的漏斗筛选写入） */
  status?: UserStatus
  /** 创建时间范围（[开始时间, 结束时间]） */
  dateRange?: string[]
}

const query = ref<UserSearchForm>({})

const searchItems: FormItem[] = [
  { key: 'userName', label: '用户名称', type: 'input', placeholder: '请输入' },
  { key: 'phonenumber', label: '手机号码', type: 'input', placeholder: '请输入' },
  {
    key: 'dateRange',
    label: '创建时间',
    type: 'daterange',
    props: {
      valueFormat: 'YYYY-MM-DD',
      startPlaceholder: '开始日期',
      endPlaceholder: '结束日期',
      unlinkPanels: true
    }
  }
]

/** 状态列的漏斗筛选项（sys_user.status：0 正常 / 1 停用） */
const statusFilters: { text: string; value: UserStatus }[] = [
  { text: '正常', value: '0' },
  { text: '停用', value: '1' }
]

// ---------------------------------------------------------------------------
// 表格列
// ---------------------------------------------------------------------------

const columns: ColumnOption[] = [
  // 选择列与序号列都很窄，且表头留空（设计稿这两列没有表头文字）
  { type: 'selection', width: 40, align: 'center' },
  { type: 'index', width: 40, align: 'center' },
  { prop: 'userName', label: '用户名称', minWidth: 200, align: 'center' },
  { prop: 'nickName', label: '用户昵称', minWidth: 200, align: 'center' },
  {
    prop: 'deptName',
    label: '部门',
    minWidth: 200,
    align: 'center',
    // 列表接口把部门放在 row.dept.deptName 里，不是平铺的 deptName
    formatter: (row: SysUser) => row.dept?.deptName ?? ''
  },
  { prop: 'phonenumber', label: '手机号码', minWidth: 200, align: 'center' },
  {
    prop: 'status',
    label: '状态',
    width: 100,
    align: 'center',
    // columnKey 是 filter-change 事件的取值 key：不配的话 Element Plus 用内部列 id
    // （el-table_x_column_y），handleFilterChange 里就拿不到筛选值了。
    columnKey: 'status',
    // 漏斗筛选：真正的过滤交给后端（见 handleFilterChange），filterMethod 直接放行，
    // 避免 Element Plus 只把当前页数据过滤一遍、翻页后筛选结果对不上。
    filters: statusFilters,
    filterMethod: () => true,
    slots: {
      default: ({ row }) => renderStatusSwitch(row as SysUser)
    }
  },
  { prop: 'createTime', label: '创建时间', width: 200, align: 'center' },
  // 操作列要放下「修改 | 删除 | 更多 ⌄」一行，宽度略宽于其它固定列
  { label: '操作', width: 220, align: 'center', slots: { default: 'operation' } }
]

/** 状态单元格：开关（开启 = 正常），切换后调后端接口 */
const renderStatusSwitch = (row: SysUser) => {
  return h(ElSwitch, {
    modelValue: row.status === '0',
    size: 'small',
    'onUpdate:modelValue': async (value: string | number | boolean) => {
      const status: UserStatus = value ? '0' : '1'
      await changeUserStatusApi({ userId: row.userId, status })
      row.status = status
      ElMessage.success(value ? '启用成功' : '停用成功')
    }
  })
}

// ---------------------------------------------------------------------------
// 列表数据
// ---------------------------------------------------------------------------

const tableRef = useTemplateRef<TableInstance>('tableRef')
const tableData = ref<SysUser[]>([])
const loading = ref(false)
const exporting = ref(false)
const selectedIds = ref<number[]>([])
/** 是否一行都没勾选（批量删除前的前置校验） */
const multiple = computed(() => selectedIds.value.length === 0)

const pagination = ref<PaginationConfig>({
  current: 1,
  size: 20,
  total: 0
})

/**
 * 查询条件 → 接口参数。
 * - 空字符串 / 空数组在这里统一剔除（sanitizeFormData）；
 * - dateRange 拆成后端认识的 params.beginTime / params.endTime；
 * - 部门ID 为空时不带（= 查全部）。
 */
const buildQueryParams = (): UserListParams => {
  const { dateRange, ...filters } = sanitizeFormData({ ...query.value })
  const params: UserListParams = { ...filters, deptId: deptId.value }
  if (dateRange && dateRange.length === 2) {
    params.params = { beginTime: dateRange[0], endTime: dateRange[1] }
  }
  return params
}

/** 取数：分页状态由 BasicTable 通过 v-model:pagination 同步，这里只负责请求 */
const getTableData = async (): Promise<void> => {
  loading.value = true
  try {
    const { rows, total } = await getUserListApi({
      ...buildQueryParams(),
      // 后端的 pageNum 从 1 开始，和 PaginationConfig.current 一致
      pageNum: pagination.value.current,
      pageSize: pagination.value.size
    })
    tableData.value = rows
    pagination.value.total = total
  } finally {
    loading.value = false
  }
}

/** 查询回到第 1 页（SearchForm 已经把 payload 清洗好，这里只补页码与取数） */
const handleSearch = (): void => {
  pagination.value.current = 1
  getTableData()
}

/** 重置：清掉查询条件 + 状态列的漏斗筛，部门选中态保留 */
const handleReset = (): void => {
  pagination.value.current = 1
  tableRef.value?.clearFilter()
  delete query.value.status
  getTableData()
}

const handleSelectionChange = (rows: SysUser[]): void => {
  selectedIds.value = rows.map((row) => row.userId)
}

/** 状态列漏斗变化：写进查询条件后重新查询（key 是列的 columnKey） */
const handleFilterChange = (filters: Record<string, any[]>): void => {
  const status = (filters.status?.[0] as UserStatus | undefined) ?? undefined
  if (status) {
    query.value.status = status
  } else {
    delete query.value.status
  }
  pagination.value.current = 1
  getTableData()
}

// ---------------------------------------------------------------------------
// 添加 / 修改 / 删除 / 导入导出
// ---------------------------------------------------------------------------

/** 超级管理员（userId = 1）不允许被修改、删除，后端也会拦，这里直接不给操作入口 */
const isSuperAdmin = (row: SysUser): boolean => row.userId === 1

const handleAdd = (): void => {
  // TODO: 新增用户弹窗（用户名称 / 用户昵称 / 部门树 / 手机号码 / 邮箱 / 角色 / 岗位）
  ElMessage.info('添加用户：弹窗表单待接入')
}

const handleEdit = (row: SysUser): void => {
  // TODO: 编辑用户弹窗（打开前 GET /system/user/{userId} 取详情 + 角色 / 岗位选项）
  ElMessage.info(`修改用户「${row.userName}」：弹窗表单待接入`)
}

const handleDelete = async (row: SysUser): Promise<void> => {
  try {
    await ElMessageBox.confirm(`是否确认删除用户「${row.userName}」？`, '提示', {
      type: 'warning'
    })
  } catch {
    // 点了取消 / 关闭
    return
  }
  await deleteUserApi(row.userId)
  ElMessage.success('删除成功')
  await getTableData()
}

/**
 * 批量删除。
 * 设计稿里「删除」按钮在未勾选时也是正常样式，所以按钮不做禁用兜底，这里给出未勾选时的提示。
 */
const handleBatchDelete = async (): Promise<void> => {
  if (multiple.value) {
    ElMessage.warning('请选择要删除的用户')
    return
  }
  try {
    await ElMessageBox.confirm(`是否确认删除选中的 ${selectedIds.value.length} 个用户？`, '提示', {
      type: 'warning'
    })
  } catch {
    return
  }
  await deleteUserApi(selectedIds.value)
  ElMessage.success('删除成功')
  tableRef.value?.clearSelection()
  selectedIds.value = []
  await getTableData()
}

const handleImport = (): void => {
  // TODO: 导入弹窗（下载模板 / 选择 xlsx / 是否更新已存在数据）
  ElMessage.info('导入用户：上传弹窗待接入')
}

/** 导出文件名，和 RuoYi 的习惯一致：user_yyyyMMddHHmmss.xlsx */
const buildExportFileName = (): string => {
  const now = new Date()
  const pad = (value: number): string => String(value).padStart(2, '0')
  const stamp = [
    now.getFullYear(),
    pad(now.getMonth() + 1),
    pad(now.getDate()),
    now.getHours(),
    pad(now.getMinutes()),
    pad(now.getSeconds())
  ].join('')
  return `user_${stamp}.xlsx`
}

/** 保存后端返回的二进制流（锚点挂到 body 上再点，兼容 Firefox） */
const saveBlob = (blob: Blob, fileName: string): void => {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  link.style.display = 'none'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/** 导出按当前筛选条件全量导出，不带分页参数 */
const handleExport = async (): Promise<void> => {
  exporting.value = true
  try {
    const blob = await exportUserApi(buildQueryParams())
    saveBlob(blob, buildExportFileName())
    ElMessage.success('导出成功')
  } finally {
    exporting.value = false
  }
}

/** 「更多」下拉：重置密码 / 分配角色 */
const handleMoreCommand = (command: string, row: SysUser): void => {
  if (command === 'resetPwd') {
    // TODO: 重置密码弹窗（PUT /system/user/resetPwd）
    ElMessage.info(`重置「${row.userName}」的密码：弹窗待接入`)
  } else if (command === 'authRole') {
    // TODO: 分配角色弹窗（GET /system/user/authRole/{userId} + PUT /system/user/authRole）
    ElMessage.info(`分配「${row.userName}」的角色：弹窗待接入`)
  }
}

// ---------------------------------------------------------------------------
// 初始化
// ---------------------------------------------------------------------------

onMounted(async () => {
  // 先拿部门树（顺带选中第一个部门），再取用户列表
  await getDeptTree()
  await getTableData()
})
</script>

<style scoped>
/* 部门树：行高 36px + 圆角高亮，和设计稿一致（Element Plus 默认是 26px 的紧凑行） */
:deep(.el-tree-node__content) {
  height: 36px;
  border-radius: 6px;
}

/*
  选中节点用主色显示（Element Plus 的 highlight-current 只给背景色，
  文字仍是常规色，设计稿里选中项文字是主色）。
*/
:deep(.el-tree--highlight-current .el-tree-node.is-current > .el-tree-node__content) {
  color: var(--el-color-primary);
}

/*
  操作列里的竖分隔线：Element Plus 默认左右各 8px 外边距，
  在窄列里会把「修改 / 删除 / 更多」挤成两行，这里收窄到 4px。
*/
:deep(.el-divider--vertical) {
  margin: 0 4px;
}
</style>
