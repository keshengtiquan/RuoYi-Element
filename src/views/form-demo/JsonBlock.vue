<template>
  <div class="mt-3">
    <p v-if="label" class="mb-1 text-xs text-(--el-text-color-secondary)">{{ label }}</p>
    <pre
      class="max-h-64 overflow-auto rounded bg-(--el-fill-color-light) p-3 text-xs leading-5 text-(--el-text-color-regular)"
      >{{ text }}</pre>
  </div>
</template>

<script setup lang="ts">
/** 展示某个值（一般是提交的 payload / 事件日志）：空值时给占位提示 */
defineOptions({ name: 'JsonBlock' })

const props = withDefaults(
  defineProps<{
    /** 要展示的值，字符串原样展示，其余 JSON.stringify */
    value?: unknown
    /** 值上方的说明文字 */
    label?: string
    /** 没有值时的占位文案 */
    placeholder?: string
  }>(),
  { placeholder: '（还没有值：点表单里的「确定」看清洗后的 payload）' }
)

const text = computed(() => {
  const { value } = props
  if (value === undefined || value === null || (Array.isArray(value) && value.length === 0)) {
    return props.placeholder
  }
  if (typeof value === 'string') return value
  return JSON.stringify(value, null, 2)
})
</script>
