<template>
  <div>
    <div class="search-bar">
      <SearchForm v-model="query" :items="searchItems" @search="handleSearch" />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { FormItem } from '@/components/Form'

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

const handleSearch = () => {}
</script>
