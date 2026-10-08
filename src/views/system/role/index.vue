<template>
  <div class="h-full flex flex-col">
    <div class="search-bar">
      <SearchForm v-model="query" :items="searchItems" @search="handleSearch" />
    </div>
    <div class="mt-2 flex-1">
      <BasicTable
        :data="tableData"
        :columns="columns"
        :autoHeight="true"
        border
        :pagination="pagination"
        @refresh="getTableData"
      >
        <template #header-left>
          <ElButton type="primary">新增</ElButton>
          <ElButton type="primary">编辑</ElButton>
          <ElButton type="primary">删除</ElButton>
        </template>
      </BasicTable>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ColumnOption } from '@/components/BasicTable/types'
import type { FormItem } from '@/components/Form'
import BasicTable from '@/components/BasicTable/index.vue'
import { getRoleListApi } from '@/api/role'
import { type SysRole } from '@/types/entity'

defineOptions({ name: 'SystemRole' })
const query = ref<Record<string, any>>({})
const tableData = ref<SysRole[]>([])
const pagination = ref({
  current: 1,
  size: 10,
  total: 0
})
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
    type: 'index',
    label: '序号',
    width: 60
  },
  {
    prop: 'roleName',
    label: '角色名称',
    visible: true,
    resizable: true
  },
  {
    prop: 'roleKey',
    label: '权限字符'
  },
  {
    prop: 'roleSort',
    label: '显示顺序'
  },
  {
    prop: 'status',
    label: '状态'
  }
]
const handleSearch = () => {}

const getTableData = async () => {
  const data = await getRoleListApi()
  tableData.value = data.rows
  pagination.value.total = data.total
}

onMounted(async () => {
  await getTableData()
})
</script>
