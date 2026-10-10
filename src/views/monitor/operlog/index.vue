<template>
  <div class="h-full flex flex-col">
    <div class="search-bar shrink-0">
      <!--
        action-align="left"：展开后按钮跟着最后一个查询项往后排，
        而不是默认的「独占一行贴行尾」（SearchForm 展开时默认 actionSpan = 24 + 靠右）。
      -->
      <SearchForm
        v-model="query"
        action-align="left"
        :items="searchItems"
        @search="handleSearch"
        @reset="handleReset"
      />
    </div>
    <!--
      min-h-0 不能删：flex 子项默认 min-height: auto，会以内容高度（含 Element Plus
      按当前高度算出来的表格 body 高度）为下限，查询栏展开后表格就不肯收缩，
      于是整页出现滚动条。加上它表格才会跟着变矮，ElTable 自己的 resize 监听会重算 body 高度。
    -->
    <div class="mt-2 min-h-0 flex-1">
      <BasicTable
        v-model:pagination="pagination"
        ref="tableRef"
        :data="tableData"
        :columns="columns"
        :loading="loading"
        :autoHeight="true"
        border
        @refresh="getTableData"
        @page-change="getTableData"
        @download="handleExport"
        @selection-change="handleSelectionChange"
      >
        <template #header-left>
          <ActionButton type="delete" :disabled="selectedIds.length === 0" @click="handleDelete" />
          <!-- 「清空」不在内置的 5 种动作里，保留普通按钮；也能用 type + label 覆盖出同款：
               <ActionButton type="delete" label="清空" plain @click="handleClean" /> -->
          <ElButton type="danger" plain @click="handleClean">清空</ElButton>
          <ActionButton type="export" @click="handleExport" />
        </template>

        <template #businessType="{ row }">
          <ElTag :type="businessTypeTagType(row.businessType)">
            {{ businessTypeLabel(row.businessType) }}
          </ElTag>
        </template>

        <template #status="{ row }">
          <ElTag :type="row.status === 0 ? 'success' : 'danger'">
            {{ statusLabel(row.status) }}
          </ElTag>
        </template>
      </BasicTable>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ElMessage, ElMessageBox } from 'element-plus'
import { sanitizeFormData, SearchForm, type FormItem, type FormOption } from '@/components/Form'
import BasicTable from '@/components/BasicTable/index.vue'
import ActionButton from '@/components/ActionButton/index.vue'
import type { ColumnOption, PaginationConfig } from '@/components/BasicTable/types'
import {
  cleanOperLogApi,
  deleteOperLogApi,
  exportOperLogApi,
  getOperLogListApi,
  type OperBusinessType,
  type OperLogListParams,
  type OperStatus
} from '@/api/monitor/operlog'
import type { SysOperLog } from '@/types/entity'

// keep-alive 按组件名匹配，名字需与路由 meta.cacheName 一致（见 routes/modules/main.ts）
defineOptions({ name: 'MonitorOperlog' })

/** ElTag 支持的语义色 */
type TagType = 'primary' | 'success' | 'info' | 'warning' | 'danger'

// ---------------------------------------------------------------------------
// 字典：后端 sys_oper_type / sys_common_status（前端暂时写死，接字典接口后换成 useDict）
// ---------------------------------------------------------------------------

/** 业务类型文案（sys_oper_type：0其它 1新增 2修改 3删除 4授权 5导出 6导入 7强退 8生成代码 9清空数据） */
const BUSINESS_TYPE_LABELS: Record<number, string> = {
  0: '其他',
  1: '新增',
  2: '修改',
  3: '删除',
  4: '授权',
  5: '导出',
  6: '导入',
  7: '强退',
  8: '生成代码',
  9: '清空数据'
}

/** 业务类型标签颜色（对齐 sys_dict_data.listClass） */
const BUSINESS_TYPE_TAG_TYPES: Record<number, TagType> = {
  0: 'info',
  1: 'info',
  2: 'info',
  3: 'danger',
  4: 'primary',
  5: 'warning',
  6: 'warning',
  7: 'danger',
  8: 'warning',
  9: 'danger'
}

const businessTypeOptions: FormOption[] = Object.entries(BUSINESS_TYPE_LABELS).map(
  ([value, label]) => ({ label, value: Number(value) })
)

/** 操作状态（sys_common_status：0正常 1异常） */
const statusOptions: FormOption[] = [
  { label: '正常', value: 0 },
  { label: '异常', value: 1 }
]

const businessTypeLabel = (value: number): string => BUSINESS_TYPE_LABELS[value] ?? '其他'
const businessTypeTagType = (value: number): TagType => BUSINESS_TYPE_TAG_TYPES[value] ?? 'info'
const statusLabel = (value: number): string => (value === 0 ? '正常' : '异常')

// ---------------------------------------------------------------------------
// 查询栏
// ---------------------------------------------------------------------------

/**
 * 查询栏表单模型。
 * dateRange 只在页面上用，请求前会拆成后端的 params.beginTime / params.endTime。
 * 注意 businessType / status 后端是 Integer，选项值必须是数字（0 也不会被清洗掉）。
 */
type OperLogSearchForm = {
  /** 操作模块（模糊匹配） */
  title?: string
  /** 操作人员（模糊匹配） */
  operName?: string
  /** 操作地址（模糊匹配） */
  operIp?: string
  /** 业务类型（精确匹配） */
  businessType?: OperBusinessType
  /** 操作状态：0 正常 / 1 异常 */
  status?: OperStatus
  /** 操作时间范围（[开始时间, 结束时间]） */
  dateRange?: string[]
}

const query = ref<OperLogSearchForm>({})
const searchItems: FormItem[] = [
  { key: 'title', label: '操作模块', type: 'input', placeholder: '请输入操作模块' },
  { key: 'operName', label: '操作人员', type: 'input', placeholder: '请输入操作人员' },
  { key: 'operIp', label: '操作地址', type: 'input', placeholder: '请输入操作地址' },
  {
    key: 'businessType',
    label: '业务类型',
    type: 'select',
    options: businessTypeOptions,
    placeholder: '请选择业务类型'
  },
  {
    key: 'status',
    label: '操作状态',
    type: 'select',
    options: statusOptions,
    placeholder: '请选择操作状态'
  },
  {
    key: 'dateRange',
    label: '操作时间',
    type: 'daterange',
    props: {
      valueFormat: 'YYYY-MM-DD HH:mm:ss',
      startPlaceholder: '开始时间',
      endPlaceholder: '结束时间',
      unlinkPanels: true,
      // 只选到日期时，把边界补成 00:00:00 / 23:59:59，避免漏掉当天的日志
      defaultTime: [new Date(2000, 0, 1, 0, 0, 0), new Date(2000, 0, 1, 23, 59, 59)]
    }
  }
]

// ---------------------------------------------------------------------------
// 表格列
// ---------------------------------------------------------------------------

const columns: ColumnOption[] = [
  { type: 'selection', width: 50, align: 'center' },
  { type: 'index', label: '序号', width: 60, align: 'center' },
  { prop: 'operId', label: '日志编号', width: 100 },
  { prop: 'title', label: '操作模块', minWidth: 120, showOverflowTooltip: true },
  { prop: 'businessType', label: '业务类型', width: 110, align: 'center' },
  { prop: 'requestMethod', label: '请求方式', width: 100, align: 'center' },
  { prop: 'operName', label: '操作人员', width: 120, showOverflowTooltip: true },
  { prop: 'operIp', label: '操作地址', width: 140, showOverflowTooltip: true },
  { prop: 'operLocation', label: '操作地点', width: 140, showOverflowTooltip: true },
  { prop: 'status', label: '操作状态', width: 100, align: 'center' },
  { prop: 'operTime', label: '操作时间', width: 180, align: 'center' },
  {
    prop: 'costTime',
    label: '消耗时间',
    width: 110,
    align: 'center',
    formatter: (row: SysOperLog) => `${row.costTime ?? 0} ms`
  }
]

// ---------------------------------------------------------------------------
// 列表数据
// ---------------------------------------------------------------------------

const tableRef = ref<InstanceType<typeof BasicTable> | null>(null)
const tableData = ref<SysOperLog[]>([])
const selectedIds = ref<number[]>([])
const loading = ref(false)
const pagination = ref<PaginationConfig>({
  current: 1,
  size: 10,
  total: 0
})

/**
 * 查询条件 → 接口参数。
 * dateRange 拆成 params.beginTime / params.endTime；空字符串 / 空数组在这里统一剔除。
 */
const buildFilterParams = (): OperLogListParams => {
  const { dateRange, ...filters } = sanitizeFormData(query.value)
  const params: OperLogListParams = { ...filters }
  if (dateRange && dateRange.length === 2) {
    params.params = { beginTime: dateRange[0], endTime: dateRange[1] }
  }
  return params
}

/** 取数：分页状态由 BasicTable 通过 v-model:pagination 同步，这里只负责请求 */
const getTableData = async (): Promise<void> => {
  loading.value = true
  try {
    const { rows, total } = await getOperLogListApi({
      ...buildFilterParams(),
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

/** 查询回到第 1 页（重置同理：SearchForm 已经清空 model，这里只补页码与取数） */
const handleSearch = (): void => {
  pagination.value.current = 1
  getTableData()
}

const handleReset = (): void => {
  pagination.value.current = 1
  getTableData()
}

const handleSelectionChange = (rows: SysOperLog[]): void => {
  selectedIds.value = rows.map((row) => row.operId)
}

// ---------------------------------------------------------------------------
// 删除 / 清空 / 导出
// ---------------------------------------------------------------------------

const handleDelete = async (): Promise<void> => {
  const operIds = selectedIds.value
  if (operIds.length === 0) return
  try {
    await ElMessageBox.confirm(`是否确认删除选中的 ${operIds.length} 条操作日志？`, '提示', {
      type: 'warning'
    })
  } catch {
    // 点了取消 / 关闭
    return
  }
  await deleteOperLogApi(operIds)
  ElMessage.success('删除成功')
  tableRef.value?.clearSelection()
  selectedIds.value = []
  await getTableData()
}

const handleClean = async (): Promise<void> => {
  try {
    await ElMessageBox.confirm('是否确认清空所有操作日志？清空后数据不可恢复。', '提示', {
      type: 'warning'
    })
  } catch {
    return
  }
  await cleanOperLogApi()
  ElMessage.success('清空成功')
  tableRef.value?.clearSelection()
  selectedIds.value = []
  pagination.value.current = 1
  await getTableData()
}

/** 导出文件名，和 RuoYi 的习惯一致：operlog_yyyyMMddHHmmss.xlsx */
const buildExportFileName = (): string => {
  const now = new Date()
  const pad = (value: number): string => String(value).padStart(2, '0')
  const stamp = [
    now.getFullYear(),
    pad(now.getMonth() + 1),
    pad(now.getDate()),
    pad(now.getHours()),
    pad(now.getMinutes()),
    pad(now.getSeconds())
  ].join('')
  return `operlog_${stamp}.xlsx`
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

const handleExport = async (): Promise<void> => {
  // 导出按当前筛选条件全量导出，不带分页参数
  const blob = await exportOperLogApi(buildFilterParams())
  saveBlob(blob, buildExportFileName())
  ElMessage.success('导出成功')
}

onMounted(async () => {
  await getTableData()
})
</script>
