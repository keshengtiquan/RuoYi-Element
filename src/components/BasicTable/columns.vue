<template>
  <template v-for="col in columns" :key="col.prop">
    <ElTableColumn v-if="col.type === 'index'" v-bind="cleanColumnProps(col)"> </ElTableColumn>
    <template v-else-if="col.children && col.children.length > 0">
      <ElTableColumn> </ElTableColumn>
    </template>
    <template v-else>
      <ElTableColumn v-bind="cleanColumnProps(col)"> </ElTableColumn>
    </template>
  </template>
</template>

<script setup lang="ts">
import { ElTableColumn } from 'element-plus'
import type { ColumnOption } from './types'
defineProps<{
  columns?: ColumnOption[]
}>()
const OWN_COLUMN_KEYS = new Set(['slots', 'children', 'visible', 'disabled', 'checked'])
const cleanColumnProps = (column: ColumnOption) => {
  const columnProps: Record<string, any> = { ...column }
  for (const [key, value] of Object.entries(column)) {
    if (!OWN_COLUMN_KEYS.has(key) && value !== undefined) columnProps[key] = value
  }
  return columnProps
}
</script>

<style scoped></style>
