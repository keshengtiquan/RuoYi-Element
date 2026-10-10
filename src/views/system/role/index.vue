<template>
  <div class="h-full flex flex-col">
    <div class="search-bar">
      <SearchForm v-model="query" :items="searchItems" @search="handleSearch" />
    </div>
    <div class="mt-2 flex-1">
      <BasicTable
        ref="basicTableRef"
        :data="tableData"
        :columns="columns"
        :autoHeight="true"
        border
        :pagination="pagination"
        @refresh="getTableData"
      >
        <template #header-left>
          <ActionButton type="add" />
          <ActionButton type="delete" @click="handleBatchDel" />
        </template>
        <template #operation="{ row }">
          <div v-if="row.roleKey !== 'admin'" class="flex gap-2 justify-center">
            <ActionButton icon="PenLine" type="link" label="修改" />
            <ActionButton icon="Trash" color="danger" type="link" label="删除" />
          </div>
        </template>
      </BasicTable>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ColumnOption, TableInstance } from '@/components/BasicTable/types'
import type { FormItem } from '@/components/Form'
import BasicTable from '@/components/BasicTable/index.vue'
import { changeStatusApi, getRoleListApi } from '@/api/role'
import { type SysRole } from '@/types/entity'
import { ElSwitch } from 'element-plus'

defineOptions({ name: 'SystemRole' })
const query = ref<Record<string, any>>({})
const tableData = ref<SysRole[]>([])
const pagination = ref({
  current: 1,
  size: 10,
  total: 0
})
const basicTableRef = useTemplateRef<TableInstance>('basicTableRef')
const searchItems: FormItem[] = [
  { key: 'userName', label: '用户名称', type: 'input', placeholder: '请输入用户名称' },
  {
    key: 'status',
    label: '用户状态',
    type: 'input',
    placeholder: '请选择状态'
  },

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
  },
  {
    key: 'auditRemark',
    label: '停用原因',
    type: 'input',
    placeholder: '状态为停用时才出现',
    hidden: (model) => model.status !== '1'
  }
]
const columns: ColumnOption[] = [
  {
    type: 'selection',
    width: 60
  },
  {
    type: 'index',
    label: '序号',
    width: 60,
    align: 'center'
  },
  {
    prop: 'roleName',
    label: '角色名称',
    visible: true,
    align: 'center'
  },
  {
    prop: 'roleKey',
    label: '权限字符',
    align: 'center'
  },
  {
    prop: 'roleSort',
    label: '显示顺序',
    align: 'center'
  },
  {
    prop: 'status',
    label: '状态',
    align: 'center',
    slots: {
      default: ({ row }) => {
        return h(ElSwitch, {
          modelValue: row.status === '0',
          size: 'small',
          'onUpdate:modelValue': async (val) => {
            row.status = val ? '0' : '1'
            await changeStatusApi({ roleId: row.roleId, status: val ? '0' : '1' })
            await getTableData()
          }
        })
      }
    }
  },
  {
    prop: 'createTime',
    label: '创建时间',
    align: 'center'
  },
  {
    label: '操作',
    width: 180,
    align: 'center',
    slots: {
      default: 'operation'
    }
  }
]
const handleSearch = () => {}

const getTableData = async () => {
  const data = await getRoleListApi()
  tableData.value = data.rows
  pagination.value.total = data.total
}

const handleBatchDel = () => {
  const rows = basicTableRef.value?.getSelectionRows()
  console.log('批量删除', rows)
}

onMounted(async () => {
  await getTableData()
})
</script>
