import type { Component } from 'vue'
import {
  AlarmClock,
  ArrowLeftRight,
  ArrowLeft,
  ArrowRight,
  Bell,
  Blocks,
  BookText,
  CalendarClock,
  ChartLine,
  ChevronDown,
  CircleCheck,
  CircleDot,
  CircleUserRound,
  ClipboardList,
  Copy,
  ChevronRight,
  ChevronLeft,
  ChevronUp,
  Database,
  DatabaseBackup,
  Download,
  Ellipsis,
  ExternalLink,
  FileCode,
  FileSpreadsheet,
  FileText,
  Files,
  Folder,
  FolderArchive,
  Globe,
  GraduationCap,
  GripVertical,
  Hash,
  House,
  IdCard,
  Image,
  Images,
  KeyRound,
  Languages,
  LayoutDashboard,
  LayoutGrid,
  LayoutTemplate,
  List,
  ListFilter,
  ListTree,
  Lock,
  LockOpen,
  LogIn,
  Mail,
  Menu,
  MonitorCog,
  Network,
  Palette,
  PanelLeftClose,
  PanelLeftOpen,
  Phone,
  Radio,
  ScrollText,
  Search,
  Server,
  Settings,
  ShieldCheck,
  ShoppingCart,
  SlidersHorizontal,
  Star,
  SunMoon,
  Sun,
  Moon,
  Table,
  TextCursorInput,
  Timer,
  Upload,
  User,
  Users,
  Webhook,
  Wrench
} from '@lucide/vue'

/**
 * 图标注册表
 *
 * 统一支持四种名称形式（解析顺序见 `resolveIcon`）：
 *   1. RuoYi 菜单表老命名            'system' / 'peoples' / 'tree-table'
 *   2. Iconify 带前缀命名            'ri:checkbox-circle-line' / 'lucide:circle-check'
 *   3. Lucide 图标名（kebab-case）   'circle-check' / 'square-pen'
 *   4. Lucide 图标名（PascalCase）   'CircleCheck'
 *
 * 只登记用到的图标 → 只有这些会被打包（@lucide/vue 的 ESM 入口是逐个图标模块的
 * barrel re-export，且 sideEffects: false，tree-shaking 生效）。
 *
 * 想加图标：从 '@lucide/vue' 具名引入，再在下面登记一行即可。
 * 图标名以 https://lucide.dev/icons 为准（注意 v1 已删除 Filter / Unlock /
 * AlertTriangle / Trash2 等旧别名，请用 ListFilter / LockOpen / TriangleAlert / Trash）。
 */

/** 登记为「可直接按名字使用」的 lucide 图标（同时提供 PascalCase 与 kebab-case 两种键） */
const lucideIcons: Record<string, Component> = {
  AlarmClock,
  ArrowLeftRight,
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  ChevronLeft,
  ChevronUp,
  ChevronDown,
  Bell,
  Blocks,
  BookText,
  CalendarClock,
  ChartLine,
  CircleCheck,
  CircleDot,
  CircleUserRound,
  ClipboardList,
  Copy,
  Database,
  DatabaseBackup,
  Download,
  Ellipsis,
  ExternalLink,
  FileCode,
  FileSpreadsheet,
  FileText,
  Files,
  Folder,
  FolderArchive,
  Globe,
  GraduationCap,
  GripVertical,
  Hash,
  House,
  IdCard,
  Image,
  Images,
  KeyRound,
  Languages,
  LayoutDashboard,
  LayoutGrid,
  LayoutTemplate,
  List,
  ListFilter,
  ListTree,
  Lock,
  LockOpen,
  LogIn,
  Mail,
  Menu,
  MonitorCog,
  Network,
  Palette,
  PanelLeftClose,
  PanelLeftOpen,
  Phone,
  Radio,
  ScrollText,
  Search,
  Server,
  Settings,
  ShieldCheck,
  ShoppingCart,
  SlidersHorizontal,
  Star,
  SunMoon,
  Sun,
  Moon,
  Table,
  TextCursorInput,
  Timer,
  Upload,
  User,
  Users,
  Webhook,
  Wrench
}

/**
 * RuoYi 菜单表沿用的图标名（admin-lte 风格）→ lucide 图标。
 *
 * 键统一小写。这些名字对应 `sys_menu.icon` 列里历史遗留的取值，
 * 不映射的话侧边栏会没图标（值域见 sql/ry_20260417.sql）。
 */
const ruoyiAlias: Record<string, Component> = {
  // 一级目录
  system: Settings,
  monitor: MonitorCog,
  tool: Wrench,
  guide: ExternalLink,
  dashboard: LayoutDashboard,
  shouye: House,

  // 系统管理
  user: User,
  people: Users,
  peoples: Users,
  avatar: CircleUserRound,
  role: ShieldCheck,
  tree: Network,
  'tree-table': ListTree,
  post: IdCard,
  dict: BookText,
  edit: SlidersHorizontal,
  message: Bell,

  // 系统监控
  log: ScrollText,
  online: Radio,
  job: Timer,
  druid: Database,
  server: Server,
  redis: DatabaseBackup,
  'redis-list': List,

  // 系统工具
  build: LayoutTemplate,
  code: FileCode,
  swagger: Webhook,
  form: ClipboardList,
  logininfor: LogIn,

  // 表单类控件（代码生成模板等处会用到）
  table: Table,
  list: List,
  grid: LayoutGrid,
  component: Blocks,
  nested: Menu,
  menu: Menu,
  email: Mail,
  phone: Phone,
  excel: FileSpreadsheet,
  pdf: FileText,
  clipboard: Copy,
  documentation: FileText,
  cron: AlarmClock,
  chart: ChartLine,
  star: Star,
  education: GraduationCap,
  checkbox: CircleCheck,
  radio: CircleDot,
  select: ListFilter,
  input: TextCursorInput,
  textarea: TextCursorInput,
  number: Hash,
  datetime: CalendarClock,
  rate: Star,
  color: Palette,
  transfer: ArrowLeftRight,
  carousel: Images,
  icon: Image,
  'valid-code': ShieldCheck,
  download: Download,
  upload: Upload,
  drag: GripVertical,
  search: Search,
  lock: Lock,
  unlock: LockOpen,
  password: KeyRound,
  shopping: ShoppingCart,
  international: Globe,
  language: Languages,
  theme: SunMoon,
  folder: Folder,
  zip: FolderArchive,
  files: Files
}

/**
 * 从 Iconify 迁过来的名字（Remix Icon 等）→ lucide。
 *
 * 保留这层是为了兼容历史菜单数据里以 `ri:` / `mdi:` 等形式写入的图标名，
 * 以及从旧项目粘贴过来的配置。新增图标建议直接用 lucide 名。
 */
const iconifyCompat: Record<string, Component> = {
  'checkbox-circle-line': CircleCheck,
  'checkbox-circle-fill': CircleCheck,
  'user-line': User,
  'settings-line': Settings,
  'menu-line': Menu,
  'home-line': House,
  'dashboard-line': LayoutDashboard,
  'file-list-line': ScrollText
}

/** PascalCase → kebab-case（CircleUserRound → circle-user-round） */
function toKebab(name: string): string {
  return name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()
}

/** 同时登记 PascalCase 与 kebab-case 两种键，两种写法都能取到 */
const registry: Record<string, Component> = {}
for (const [pascal, component] of Object.entries(lucideIcons)) {
  registry[pascal] = component
  registry[toKebab(pascal)] = component
}

/** 去掉 Iconify 的 `前缀:`（ri: / ep: / mdi: / lucide: …），无前缀时原样返回 */
function stripPrefix(name: string): string {
  const index = name.indexOf(':')
  return index === -1 ? name : name.slice(index + 1)
}

/**
 * 图标名 → 组件。未收录的名字返回 undefined（调用方不渲染图标，不报错）。
 *
 * 解析顺序：RuoYi 老命名 / Remix 兼容名 → lucide 名（原样、小写、kebab 三种写法）。
 */
export function resolveIcon(name?: string | null): Component | undefined {
  const raw = stripPrefix(name?.trim() ?? '').trim()
  if (!raw) {
    return undefined
  }

  const lower = raw.toLowerCase()
  return (
    ruoyiAlias[lower] ??
    iconifyCompat[lower] ??
    registry[raw] ??
    registry[lower] ??
    registry[toKebab(raw)]
  )
}
