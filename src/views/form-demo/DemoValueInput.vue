<template>
  <ElInput
    :model-value="value"
    :placeholder="placeholder"
    @update:model-value="(val: string | number) => emit('update:value', String(val ?? ''))"
  >
    <!-- 自定义组件也可以把 slots 透传下去，方便 FormItem.slots 生效 -->
    <template v-if="$slots.prepend" #prepend>
      <slot name="prepend" />
    </template>
    <template v-if="$slots.append" #append>
      <slot name="append" />
    </template>
  </ElInput>
</template>

<script setup lang="ts">
/**
 * 示例用自定义组件：v-model 绑的是 `value` 而不是默认的 `modelValue`，
 * 用来演示 FormItem 的 `type: 组件` + `modelProp: 'value'`。
 */
defineOptions({ name: 'DemoValueInput' })

defineProps<{
  /** v-model:value */
  value?: string
  /** 占位文本 */
  placeholder?: string
}>()

const emit = defineEmits<{ 'update:value': [string] }>()
</script>
