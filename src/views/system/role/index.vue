<template>
  <div>
    <div class="search-bar">
      <SearchForm v-model="query" :items="searchItems" @search="handleSearch" />
    </div>
    <div class="mt-2">
      <BasicTable :columns="columns" />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ColumnOption } from '@/components/BasicTable/types'
import type { FormItem } from '@/components/Form'
import BasicTable from '@/components/BasicTable/index.vue'

defineOptions({ name: 'SystemRole' })
const query = ref<Record<string, any>>({})
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
    label: '角色名称'
  },
  {
    prop: 'userRole',
    label: '权限字符'
  },
  {
    prop: 'sort',
    label: '显示顺序'
  },
  {
    prop: 'status',
    label: '状态'
  }
]
const handleSearch = () => {}
</script>
