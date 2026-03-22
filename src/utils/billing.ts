/**
 * 获取交易类型的中文名称
 */
export function getBillTypeName(type: string): string {
  const typeMap: Record<string, string> = {
    recharge: '充值',
    transfer_in: '划拨收入',
    transfer_out: '划拨支出',
    consume: '消费'
  }
  return typeMap[type] || type
}

/**
 * 获取交易类型的 Element Plus Tag 类型
 */
export function getBillTypeTag(type: string): string {
  const tagMap: Record<string, string> = {
    recharge: 'success',
    transfer_in: 'success',
    transfer_out: 'warning',
    consume: 'danger'
  }
  return tagMap[type] || 'info'
}
