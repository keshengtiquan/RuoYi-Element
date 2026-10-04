<template>
  <div class="flex flex-col gap-4 p-4">
    <SectionCard
      title="FormItem 全属性 + 全部 type 示例"
      desc="每张卡标题里写了它覆盖的属性；表单里的「确定」会把清洗后的 payload 打在卡片下方（校验不通过不会触发 submit）。最后一张卡覆盖 componentMap 里全部 27 种 type。schema 说明见 doc/json-form.md。"
    >
      <ul class="list-disc space-y-1 pl-5 text-xs leading-5 text-(--el-text-color-secondary)">
        <li v-for="section in sectionIndex" :key="section.id">
          <span class="text-(--el-text-color-primary)">{{ section.title }}</span> ——
          {{ section.props }}
        </li>
      </ul>
    </SectionCard>

    <SectionCard
      title="1 基础：key / label / placeholder / props / span / colProps / labelWidth / formItemProps / tooltip"
      desc="label 用字符串；placeholder 等价于 props.placeholder；span 覆盖整行列宽，colProps 继续追加 ElCol 属性（会覆盖 span 推算出来的断点）；labelWidth 只调这一项的标签宽度；formItemProps 透传给 ElFormItem（这里只加了 required，只画星号不校验）；tooltip 在标签后面挂问号。"
    >
      <BasicForm
        v-model="baseModel"
        :items="baseItems"
        :span="12"
        label-width="110px"
        @submit="onSubmit('base')"
      />
      <JsonBlock :value="submitted.base" label="submit payload（空值已被清洗）" />
    </SectionCard>

    <SectionCard
      title="2 label 的三种写法"
      desc="label 可以是字符串、渲染函数，或直接给一个组件（内部走 <component :is>）。"
    >
      <BasicForm v-model="labelModel" :items="labelItems" :span="8" @submit="onSubmit('label')" />
      <JsonBlock :value="submitted.label" label="submit payload" />
    </SectionCard>

    <SectionCard
      title="3 render：完全接管控件区域"
      desc="render 优先级高于 type，可以给函数也可以给组件；它不参与 v-model 绑定，适合只读展示、二维码等自管理状态的控件。"
    >
      <BasicForm v-model="renderModel" :items="renderItems" :span="24" />
    </SectionCard>

    <SectionCard
      title="4 校验：required / requiredMessage / rules / formItemProps（服务端错误态）"
      desc="required 自动生成「请输入 xxx」；requiredMessage 换文案；rules 是原生 Element Plus 规则数组（与 required 生成的规则合并）；服务端校验失败用 formItemProps 的 error + validateStatus 展示。点「确定」时校验不过不会抛 submit。"
    >
      <BasicForm
        v-model="validateModel"
        :items="validateItems"
        :span="12"
        label-width="130px"
        @submit="onSubmit('validate')"
      />
      <JsonBlock
        :value="submitted.validate"
        label="submit payload"
        placeholder="（校验不通过不会抛 submit：把「必填」「必填（自定义文案）」「多条 rules」都填对再点确定）"
      />
    </SectionCard>

    <SectionCard
      title="5 联动与默认值：hidden / disabled / defaultValue / on"
      desc="hidden、disabled 都可以写函数，函数里读到的 model 字段会自动成为响应式依赖（切「会员类型」看 VIP 码出现/消失，切「锁定」看下面输入框禁用）；hidden: true 的项永远不会渲染（也不会参与校验）；defaultValue 是「重置」的落点；on 里的控件事件写进下面的日志。"
    >
      <BasicForm
        v-model="linkModel"
        :items="linkItems"
        :span="12"
        label-width="140px"
        @submit="onSubmit('link')"
        @reset="pushLog('reset 事件：model 回到 defaultValue / 初始快照')"
      />
      <JsonBlock :value="submitted.link" label="submit payload" />
      <JsonBlock
        :value="eventLog"
        label="on 里挂的控件事件 / reset 日志"
        placeholder="（动一动「on 事件」那个输入框）"
      />
    </SectionCard>

    <SectionCard
      title="6 选项：options / optionKeys / optionProps / 异步 options / loading / optionTarget"
      desc="options 可以是数组，也可以是读 model 的函数（可异步，依赖变化会重新加载——切「省份」看「城市」重新拉取；依赖要在 await 之前读才有效）。optionKeys 把后端字典字段（dictLabel/dictValue）映射成 label/value；optionProps 追加到每个子选项；loading 手动显示加载态；optionTarget 决定选项走子节点（ElOption/ElRadio/ElCheckbox）还是走属性（cascader 的 options、treeselect 的 data、selectv2 的 options），不写就按 type 推断。"
    >
      <BasicForm
        v-model="optionModel"
        :items="optionItems"
        :span="12"
        label-width="150px"
        @submit="onSubmit('option')"
      />
      <JsonBlock :value="submitted.option" label="submit payload" />
    </SectionCard>

    <SectionCard
      title="7 slots：控件插槽"
      desc="slots 里的函数会挂到控件对应的具名插槽上（ElInput 的前后缀、ElSelect 的空数据等）。"
    >
      <BasicForm
        v-model="slotModel"
        :items="slotItems"
        :span="12"
        label-width="130px"
        @submit="onSubmit('slot')"
      />
      <JsonBlock :value="submitted.slot" label="submit payload" />
    </SectionCard>

    <SectionCard
      title="8 type 传组件 + modelProp + 组件自己的 slots"
      desc="type 除了 componentMap 里的名字，也可以直接给一个组件；如果这个组件的 v-model 不是 modelValue（示例组件用的是 v-model:value），就必须配 modelProp: 'value'。这一项还顺便演示了把 slots 透传给自定义组件。"
    >
      <BasicForm
        v-model="customModel"
        :items="customItems"
        :span="12"
        label-width="170px"
        @submit="onSubmit('custom')"
      />
      <JsonBlock :value="submitted.custom" label="submit payload" />
    </SectionCard>

    <SectionCard
      title="9 componentMap 全部 27 种 type"
      desc="文本类 5 种、选择类 6 种、日期时间类 12 种、树/级联/数值类 4 种。范围类（daterange / datetimerange / monthrange / yearrange）在 useFormFields 里已经默认补好 ElDatePicker 的 type，直接写 type 名即可；valueFormat 之类仍从 props 传。"
    >
      <BasicForm
        v-model="allTypeModel"
        :items="allTypeItems"
        :span="8"
        label-width="120px"
        @submit="onSubmit('allType')"
      />
      <JsonBlock :value="submitted.allType" label="submit payload" />
    </SectionCard>

    <SectionCard
      title="10 按钮区：对齐方式 + 第三个按钮 / 整行自己拼"
      desc="上半部分：actionAlign 控制按钮在按钮区内的对齐（left / center / right），不传时按表单项数量推断（≤ buttonLeftLimit 靠左，否则靠右）；actionSpan 控制按钮区宽度（不传：靠左占 span 一列，居中/靠右独占一行 24 列）。下半部分：传 #actions 整行接管按钮区，插槽 props 的 submit / reset 复用了内置的校验与清洗，所以加第三个按钮不用自己再写一遍。"
    >
      <div class="flex flex-col gap-3">
        <div v-for="align in actionAligns" :key="align">
          <p class="mb-1 text-xs text-(--el-text-color-secondary)">actionAlign: '{{ align }}'</p>
          <BasicForm
            v-model="alignModels[align]"
            :items="alignItems"
            :span="12"
            :action-align="align"
            label-width="90px"
            @submit="onSubmit(`align-${align}`)"
          />
        </div>
      </div>

      <div class="mt-4 border-t border-(--el-border-color-lighter) pt-4">
        <p class="mb-2 text-xs text-(--el-text-color-secondary)">
          三个按钮：#actions 里自己拼一行，submit 走内置校验 + 清洗，存草稿只读 model
        </p>
        <BasicForm
          v-model="actionModel"
          :items="actionItems"
          :span="12"
          label-width="110px"
          @submit="onSubmit('action')"
        >
          <template #actions="{ submit, reset, total }">
            <ElButton @click="saveDraft(actionModel)">存草稿</ElButton>
            <ElButton @click="reset">重置</ElButton>
            <ElButton type="primary" @click="submit">确定提交</ElButton>
            <span class="text-xs text-(--el-text-color-secondary)">（共 {{ total }} 项）</span>
          </template>
        </BasicForm>
        <JsonBlock :value="draftOutput" label="存草稿读到的东西（不校验、不清洗）" />
        <JsonBlock :value="submitted.action" label="确定提交的 payload（校验 + 清洗）" />
      </div>
    </SectionCard>
  </div>
</template>

<script setup lang="ts">
import { ElAlert, ElButton, ElIcon } from 'element-plus'
import { Search } from '@lucide/vue'
import { BasicForm, type FormItem } from '@/components/Form'
import SectionCard from './SectionCard.vue'
import JsonBlock from './JsonBlock.vue'
import DemoLabel from './DemoLabel.vue'
import DemoReadonly from './DemoReadonly.vue'
import DemoValueInput from './DemoValueInput.vue'

// keep-alive 按组件名匹配，需与路由 meta.cacheName 一致（见 routes/modules/main.ts）
defineOptions({ name: 'FormDemo' })

// ---------------------------------------------------------------------------
// 公共数据与工具
// ---------------------------------------------------------------------------

/** 各卡片的提交结果 */
const submitted = reactive<Record<string, any>>({})
const onSubmit = (key: string) => (payload: Record<string, any>) => {
  submitted[key] = payload
}

/** on 事件日志 */
const eventLog = ref<string[]>([])
const pushLog = (text: string) => {
  eventLog.value = [`${new Date().toLocaleTimeString()} ${text}`, ...eventLog.value].slice(0, 6)
}

const statusOptions = [
  { label: '正常', value: '0' },
  { label: '停用', value: '1' }
]
const hobbyOptions = [
  { label: '阅读', value: 'read' },
  { label: '运动', value: 'sport' },
  { label: '音乐', value: 'music', disabled: true }
]
/** 后端字典风格：字段名是 dictLabel / dictValue，靠 optionKeys 映射 */
const dictOptions = [
  { dictLabel: '正常', dictValue: '0' },
  { dictLabel: '停用', dictValue: '1' }
]
const cascaderOptions = [
  {
    value: 'zj',
    label: '浙江',
    children: [
      { value: 'hz', label: '杭州' },
      { value: 'nb', label: '宁波' }
    ]
  },
  {
    value: 'gd',
    label: '广东',
    children: [{ value: 'gz', label: '广州' }]
  }
]
const deptTree = [
  {
    value: 1,
    label: '若依科技',
    children: [
      { value: 11, label: '研发部门' },
      { value: 12, label: '市场部门' }
    ]
  }
]

/** 依赖 model 的异步选项：province 必须在 await 之前读出来才会重新加载 */
const cityMap: Record<string, string[]> = {
  zj: ['杭州', '宁波'],
  gd: ['广州', '深圳']
}
const loadCities = async (model: Record<string, any>) => {
  const province = model.province
  await new Promise((resolve) => setTimeout(resolve, 400))
  return (cityMap[province] ?? []).map((city) => ({ label: city, value: city }))
}

/** 分区索引 */
const sectionIndex = [
  {
    id: 1,
    title: '1 基础',
    props:
      'key / label / placeholder / props / span / colProps / labelWidth / formItemProps / tooltip'
  },
  { id: 2, title: '2 label 写法', props: 'label（字符串 / 渲染函数 / 组件）' },
  { id: 3, title: '3 自定义渲染', props: 'render（函数 / 组件）' },
  { id: 4, title: '4 校验', props: 'required / requiredMessage / rules / formItemProps' },
  { id: 5, title: '5 联动与默认值', props: 'hidden / disabled / defaultValue / on' },
  { id: 6, title: '6 选项', props: 'options / optionKeys / optionProps / loading / optionTarget' },
  { id: 7, title: '7 插槽', props: 'slots' },
  { id: 8, title: '8 自定义组件', props: 'type（传组件）/ modelProp / slots' },
  { id: 9, title: '9 全部 type', props: 'componentMap 27 种 type' },
  {
    id: 10,
    title: '10 按钮区',
    props: '#actions 插槽 props（submit / reset / search / toggleExpand）'
  }
]

// ---------------------------------------------------------------------------
// 1 基础
// ---------------------------------------------------------------------------

const baseModel = ref<Record<string, any>>({})
const baseItems: FormItem[] = [
  {
    key: 'userName',
    label: '用户名称',
    type: 'input',
    placeholder: '请输入用户名称',
    props: { clearable: true, maxlength: 20, showWordLimit: true }
  },
  {
    key: 'spanDemo',
    label: 'span = 24',
    type: 'input',
    span: 24,
    placeholder: '本项独占一行（span: 24）'
  },
  {
    key: 'colPropsDemo',
    label: 'colProps',
    type: 'input',
    colProps: { xs: 24, sm: 24, md: 12, lg: 8 },
    placeholder: 'md 12 列 / lg 8 列（覆盖 span 推算值）'
  },
  {
    key: 'labelWidthDemo',
    label: '标签很宽的一项',
    type: 'input',
    labelWidth: '170px',
    placeholder: 'labelWidth 只影响这一项'
  },
  {
    key: 'formItemPropsDemo',
    label: 'formItemProps',
    type: 'input',
    formItemProps: { required: true, clearable: true },
    placeholder: 'ElFormItem 的 required：只画星号、不校验'
  },
  {
    key: 'tooltipDemo',
    label: '带提示的字段',
    type: 'input',
    tooltip: '这条提示来自 item.tooltip',
    placeholder: '把鼠标移到标签后面的问号上'
  }
]

// ---------------------------------------------------------------------------
// 2 label 的三种写法
// ---------------------------------------------------------------------------

const labelModel = ref<Record<string, any>>({})
const labelItems: FormItem[] = [
  { key: 'labelString', label: '字符串标签', type: 'input', placeholder: "label: '字符串标签'" },
  {
    key: 'labelRender',
    label: () => h('span', { class: 'text-(--el-color-primary)' }, '渲染函数标签'),
    type: 'input',
    placeholder: 'label 是一个返回 VNode 的函数'
  },
  { key: 'labelComponent', label: DemoLabel, type: 'input', placeholder: 'label 是一个组件' }
]

// ---------------------------------------------------------------------------
// 3 render
// ---------------------------------------------------------------------------

const renderModel = ref<Record<string, any>>({})
const renderItems: FormItem[] = [
  {
    key: 'renderFn',
    label: 'render 函数',
    render: () =>
      h(ElAlert, {
        type: 'success',
        closable: false,
        title: 'render: () => h(ElAlert, …)',
        description: '这一段由渲染函数返回，不参与 v-model。'
      })
  },
  { key: 'renderComponent', label: 'render 组件', render: DemoReadonly }
]

// ---------------------------------------------------------------------------
// 4 校验
// ---------------------------------------------------------------------------

const validateModel = ref<Record<string, any>>({})
const validateItems: FormItem[] = [
  {
    key: 'requiredField',
    label: '必填',
    type: 'input',
    required: true,
    placeholder: '自动生成「请输入必填」'
  },
  {
    key: 'requiredMessageField',
    label: '必填（自定义文案）',
    type: 'input',
    required: true,
    requiredMessage: '这一段必须填哦',
    placeholder: 'requiredMessage 覆盖默认文案'
  },
  {
    key: 'rulesField',
    label: '多条 rules',
    type: 'input',
    placeholder: '3-10 位小写字母/数字',
    rules: [
      { min: 3, max: 10, message: '长度需要 3-10 个字符', trigger: 'blur' },
      { pattern: /^[a-z0-9]+$/, message: '只能是小写字母和数字', trigger: 'blur' }
    ]
  },
  {
    key: 'serverErrorField',
    label: '服务端错误态',
    type: 'input',
    formItemProps: { error: '服务端返回：该名称已存在', validateStatus: 'error' },
    placeholder: 'formItemProps: { error, validateStatus }'
  }
]

// ---------------------------------------------------------------------------
// 5 联动与默认值
// ---------------------------------------------------------------------------

const linkModel = ref<Record<string, any>>({})
const linkItems: FormItem[] = [
  {
    key: 'memberType',
    label: '会员类型',
    type: 'select',
    defaultValue: 'normal',
    options: [
      { label: '普通会员', value: 'normal' },
      { label: 'VIP', value: 'vip' }
    ]
  },
  {
    key: 'vipCode',
    label: 'VIP 码',
    type: 'input',
    required: true,
    hidden: (model) => model.memberType !== 'vip',
    placeholder: '选 VIP 才出现（hidden 是函数）'
  },
  {
    key: 'alwaysHidden',
    label: '永远隐藏',
    type: 'input',
    hidden: true
  },
  { key: 'lockAll', label: '锁定下面的输入', type: 'switch', defaultValue: false },
  {
    key: 'disabledFn',
    label: 'disabled 函数',
    type: 'input',
    defaultValue: '受上面的开关控制',
    disabled: (model) => model.lockAll === true
  },
  {
    key: 'disabledBool',
    label: 'disabled 常量',
    type: 'input',
    defaultValue: '一直禁用',
    disabled: true
  },
  {
    key: 'defaultValueDemo',
    label: 'defaultValue',
    type: 'input',
    defaultValue: '点「重置」会回到这里',
    placeholder: '改掉它，再点重置试试'
  },
  {
    key: 'eventDemo',
    label: 'on 事件',
    type: 'input',
    placeholder: '输入或失焦，看下面的日志',
    on: {
      change: (value: any) => pushLog(`change → ${JSON.stringify(value)}`),
      blur: () => pushLog('blur')
    }
  }
]

// ---------------------------------------------------------------------------
// 6 选项
// ---------------------------------------------------------------------------

const optionModel = ref<Record<string, any>>({ province: 'zj' })
const optionItems: FormItem[] = [
  { key: 'staticSelect', label: '静态 options', type: 'select', options: statusOptions },
  {
    key: 'dictRadio',
    label: 'optionKeys 字典映射',
    type: 'radiogroup',
    defaultValue: '0',
    options: dictOptions,
    optionKeys: { label: 'dictLabel', value: 'dictValue' }
  },
  {
    key: 'optionPropsDemo',
    label: 'optionProps',
    type: 'checkboxgroup',
    options: hobbyOptions,
    optionProps: { title: '这段 title 来自 optionProps' }
  },
  { key: 'province', label: '省份（联动源）', type: 'select', options: cascaderOptions },
  {
    key: 'city',
    label: '异步 options',
    type: 'select',
    placeholder: '切省份会重新加载',
    options: loadCities
  },
  {
    key: 'manualLoading',
    label: '手动 loading',
    type: 'select',
    options: statusOptions,
    loading: true
  },
  {
    key: 'optionTargetProps',
    label: 'optionTarget: props',
    type: 'cascader',
    options: cascaderOptions,
    optionTarget: 'props',
    props: { clearable: true }
  },
  {
    key: 'optionTargetChildren',
    label: 'optionTarget: children',
    type: 'select',
    options: statusOptions,
    optionTarget: 'children'
  }
]

// ---------------------------------------------------------------------------
// 7 插槽
// ---------------------------------------------------------------------------

const slotModel = ref<Record<string, any>>({})
const slotItems: FormItem[] = [
  {
    key: 'slotInput',
    label: 'input 插槽',
    type: 'input',
    placeholder: '前缀 / 后缀由 slots 提供',
    slots: {
      prefix: () => h(ElIcon, null, () => h(Search, { size: 14 })),
      append: () => h(ElButton, null, () => '搜索')
    }
  },
  {
    key: 'slotSelect',
    label: 'select 空数据插槽',
    type: 'select',
    options: [],
    placeholder: '展开看 empty 插槽',
    slots: {
      empty: () =>
        h('span', { class: 'text-(--el-text-color-secondary)' }, '暂无数据（empty 插槽）')
    }
  }
]

// ---------------------------------------------------------------------------
// 8 type 传组件 + modelProp
// ---------------------------------------------------------------------------

const customModel = ref<Record<string, any>>({})
const customItems: FormItem[] = [
  {
    key: 'customValue',
    label: 'type 组件 + modelProp',
    type: DemoValueInput,
    modelProp: 'value',
    required: true,
    placeholder: '这一项绑的是 v-model:value'
  },
  {
    key: 'customValueWithSlots',
    label: '组件 + slots',
    type: DemoValueInput,
    modelProp: 'value',
    slots: {
      prepend: () => h('span', '金额'),
      append: () => h('span', '元')
    }
  }
]

// ---------------------------------------------------------------------------
// 9 全部 type
// ---------------------------------------------------------------------------

const allTypeModel = ref<Record<string, any>>({})
const allTypeItems: FormItem[] = [
  // 文本类
  { key: 'tInput', label: 'input', type: 'input', placeholder: '普通输入框' },
  { key: 'tPassword', label: 'password', type: 'password', placeholder: '自动 showPassword' },
  {
    key: 'tTextarea',
    label: 'textarea',
    type: 'textarea',
    props: { rows: 2, maxlength: 100, showWordLimit: true }
  },
  { key: 'tInputTag', label: 'inputTag', type: 'inputTag', defaultValue: ['若依', 'element'] },
  {
    key: 'tNumber',
    label: 'number',
    type: 'number',
    props: { min: 0, max: 100, controlsPosition: 'right' }
  },
  // 选择类
  { key: 'tSelect', label: 'select', type: 'select', options: statusOptions, defaultValue: '0' },
  {
    key: 'tSelectV2',
    label: 'selectv2',
    type: 'selectv2',
    options: statusOptions,
    props: { style: 'width: 100%' }
  },
  { key: 'tSwitch', label: 'switch', type: 'switch', defaultValue: true },
  {
    key: 'tCheckbox',
    label: 'checkbox',
    type: 'checkbox',
    defaultValue: true,
    props: { label: '单个复选' }
  },
  {
    key: 'tCheckboxGroup',
    label: 'checkboxgroup',
    type: 'checkboxgroup',
    options: hobbyOptions,
    defaultValue: ['read']
  },
  {
    key: 'tRadioGroup',
    label: 'radiogroup',
    type: 'radiogroup',
    options: statusOptions,
    defaultValue: '1'
  },
  // 日期时间类
  { key: 'tDate', label: 'date', type: 'date', props: { valueFormat: 'YYYY-MM-DD' } },
  {
    key: 'tDateRange',
    label: 'daterange',
    type: 'daterange',
    props: { valueFormat: 'YYYY-MM-DD', unlinkPanels: true }
  },
  {
    key: 'tDateTime',
    label: 'datetime',
    type: 'datetime',
    props: { valueFormat: 'YYYY-MM-DD HH:mm:ss' }
  },
  {
    key: 'tDateTimeRange',
    label: 'datetimerange',
    type: 'datetimerange',
    props: { valueFormat: 'YYYY-MM-DD HH:mm:ss' }
  },
  { key: 'tMonth', label: 'month', type: 'month', props: { valueFormat: 'YYYY-MM' } },
  {
    key: 'tMonthRange',
    label: 'monthrange',
    type: 'monthrange',
    props: { valueFormat: 'YYYY-MM' }
  },
  { key: 'tYear', label: 'year', type: 'year', props: { valueFormat: 'YYYY' } },
  { key: 'tYearRange', label: 'yearrange', type: 'yearrange', props: { valueFormat: 'YYYY' } },
  { key: 'tWeek', label: 'week', type: 'week', props: { valueFormat: 'YYYY-MM-DD' } },
  { key: 'tDates', label: 'dates', type: 'dates', props: { valueFormat: 'YYYY-MM-DD' } },
  {
    key: 'tTimePicker',
    label: 'timepicker',
    type: 'timepicker',
    props: { valueFormat: 'HH:mm:ss' }
  },
  {
    key: 'tTimeSelect',
    label: 'timeselect',
    type: 'timeselect',
    props: { start: '08:30', step: '00:30', end: '18:30' }
  },
  // 树 / 级联 / 数值
  {
    key: 'tCascader',
    label: 'cascader',
    type: 'cascader',
    options: cascaderOptions,
    props: { clearable: true }
  },
  {
    key: 'tTreeSelect',
    label: 'treeselect',
    type: 'treeselect',
    options: deptTree,
    props: { checkStrictly: true }
  },
  { key: 'tRate', label: 'rate', type: 'rate', props: { max: 5 } },
  { key: 'tSlider', label: 'slider', type: 'slider', props: { max: 100 } }
]

// ---------------------------------------------------------------------------
// 10 按钮区加第三个按钮
// ---------------------------------------------------------------------------

/** 三种对齐方式各来一个（内置两个按钮） */
const actionAligns = ['left', 'center', 'right'] as const
const alignModels = reactive<Record<string, Record<string, any>>>({
  left: {},
  center: {},
  right: {}
})
const alignItems: FormItem[] = [
  {
    key: 'keyword',
    label: '关键字',
    type: 'input',
    span: 12,
    placeholder: 'actionSpan 不传时看对齐效果'
  },
  { key: 'status', label: '状态', type: 'select', span: 12, options: statusOptions }
]

const actionModel = ref<Record<string, any>>({})
const draftOutput = ref<Record<string, any> | null>(null)
const actionItems: FormItem[] = [
  { key: 'title', label: '标题', type: 'input', required: true, placeholder: '必填：确定时才校验' },
  { key: 'owner', label: '负责人', type: 'input', placeholder: '存草稿时可以是空的' },
  { key: 'remark', label: '备注', type: 'textarea', props: { rows: 2 } }
]

/** 存草稿：只读当前 model，不校验、不清洗（草稿允许残缺） */
const saveDraft = (model: Record<string, any>): void => {
  draftOutput.value = { ...model }
}
</script>
