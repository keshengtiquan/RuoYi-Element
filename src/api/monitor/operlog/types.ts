import type { SysOperLog } from '@/types/entity'
import type { PageQuery, PageResult } from '@/types/http'

/**
 * 操作日志接口（/monitor/operlog/*）的类型定义。
 *
 * 后端：SysOperlogController
 *   list   GET    /monitor/operlog/list     权限 monitor:operlog:list
 *   export POST   /monitor/operlog/export   权限 monitor:operlog:export
 *   remove DELETE /monitor/operlog/{operIds} 权限 monitor:operlog:remove
 *   clean  DELETE /monitor/operlog/clean    权限 monitor:operlog:remove
 */

/** 业务类型（sys_oper_type 字典：0其它 1新增 2修改 3删除 4授权 5导出 6导入 7强退 8生成代码 9清空数据） */
export type OperBusinessType = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9

/** 操作状态（sys_common_status 字典：0正常 1异常） */
export type OperStatus = 0 | 1

/**
 * 操作时间范围。
 * 后端 SysOperLogMapper.xml 的 selectOperLogList 用 `params.beginTime` / `params.endTime` 过滤 `oper_time`，
 * 所以这两个字段必须放在 params 里（qs 会序列化成 params[beginTime]=xxx）。
 */
export interface OperLogListDateRange {
  /** 起始时间（yyyy-MM-dd HH:mm:ss） */
  beginTime?: string
  /** 结束时间（yyyy-MM-dd HH:mm:ss） */
  endTime?: string
}

/**
 * 操作日志列表查询参数。
 *
 * 后端把 query 参数直接绑到 SysOperLog 上，因此除分页参数外，
 * SysOperLog 上的字段都能当筛选条件；这里只列了 selectOperLogList 真正用到的几个。
 * 注意 businessType / status 后端是 Integer，传字符串会匹配不上。
 */
export interface OperLogListParams extends PageQuery {
  /** 日志主键（精确匹配） */
  operId?: number
  /** 操作模块（模糊匹配） */
  title?: string
  /** 业务类型（精确匹配，字典 sys_oper_type） */
  businessType?: OperBusinessType
  /** 业务类型集合（对应 mapper 里的 business_type in (...)） */
  businessTypes?: OperBusinessType[]
  /** 操作人员（模糊匹配） */
  operName?: string
  /** 操作地址 / IP（模糊匹配） */
  operIp?: string
  /** 操作状态：0 正常 / 1 异常 */
  status?: OperStatus
  /** 操作时间范围（对应后端的 params.beginTime / params.endTime） */
  params?: OperLogListDateRange
}

/**
 * 操作日志列表返回。
 * 后端 TableDataInfo 为 `{ code, msg, rows, total }`（rows / total 平铺在顶层，没有 data 包裹），
 * 结构与 PageResult 一致。
 */
export type OperLogListResult = PageResult<SysOperLog>
