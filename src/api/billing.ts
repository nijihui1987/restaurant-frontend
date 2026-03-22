import api from './request'

// ==================== 类型定义 ====================

export interface Balance {
  balance: number
  user_id: number
}

export interface Transaction {
  id: string
  type: 'recharge' | 'transfer_in' | 'transfer_out' | 'consume'
  amount: number
  balance_after: number
  description: string
  related_user_id?: number
  related_user_name?: string
  created_at: string
}

export interface RechargeRequest {
  amount: number
}

export interface RechargeResponse {
  balance: number
  coins: number
  transaction_id: string
}

export interface TransferRequest {
  target_user_id: number
  amount: number
}

export interface TransferResponse {
  success: boolean
  balance: number
  transaction_id: string
}

export interface ConsumeRequest {
  amount: number
  description: string
  feature: string
}

export interface ConsumeResponse {
  success: boolean
  balance: number
  transaction_id: string
}

export interface BillingUser {
  id: number
  username: string
  role: string
  vip_id?: number
  vip_name?: string
  balance?: number
}

export interface TransactionRecordsResponse {
  records: Transaction[]
  total: number
  page: number
  page_size: number
}

export interface UserListResponse {
  users: BillingUser[]
  total: number
  page: number
  page_size: number
}

// ==================== API 函数 ====================

/**
 * 获取当前用户积分余额
 */
export async function getBalance(): Promise<Balance | null> {
  try {
    const res = await api.get<Balance>('/billing/balance')
    return res.data
  } catch (error) {
    console.error('获取余额失败:', error)
    return null
  }
}

/**
 * 用户充值（模拟）
 * @param amount 充值金额（人民币，元）
 */
export async function recharge(amount: number): Promise<RechargeResponse | null> {
  try {
    const res = await api.post<RechargeResponse>('/billing/recharge', { amount })
    return res.data
  } catch (error) {
    console.error('充值失败:', error)
    throw error
  }
}

/**
 * 积分划拨（管理员/VIP）
 * @param targetUserId 目标用户 ID
 * @param amount 划拨积分数量
 */
export async function transfer(targetUserId: number, amount: number): Promise<TransferResponse | null> {
  try {
    const res = await api.post<TransferResponse>('/billing/transfer', {
      target_user_id: targetUserId,
      amount
    })
    return res.data
  } catch (error) {
    console.error('划拨失败:', error)
    throw error
  }
}

/**
 * 获取交易记录
 * @param page 页码
 * @param pageSize 每页数量
 * @param type 交易类型过滤
 */
export async function getTransactionRecords(
  page = 1,
  pageSize = 20,
  type?: string
): Promise<TransactionRecordsResponse | null> {
  try {
    const params: Record<string, any> = { page, page_size: pageSize }
    if (type) params.type = type

    const res = await api.get<TransactionRecordsResponse>('/billing/records', { params })
    return res.data
  } catch (error) {
    console.error('获取交易记录失败:', error)
    return null
  }
}

/**
 * 获取用户列表（仅 Admin）
 * @param keyword 关键词搜索
 * @param page 页码
 * @param pageSize 每页数量
 */
export async function getBillingUsers(
  keyword?: string,
  page = 1,
  pageSize = 20
): Promise<UserListResponse | null> {
  try {
    const params: Record<string, any> = { page, page_size: pageSize }
    if (keyword) params.keyword = keyword

    const res = await api.get<UserListResponse>('/billing/users', { params })
    return res.data
  } catch (error) {
    console.error('获取用户列表失败:', error)
    return null
  }
}

/**
 * 获取下属用户列表（仅 VIP）
 */
export async function getSubUsers(): Promise<{ users: BillingUser[]; total: number } | null> {
  try {
    const res = await api.get<{ users: BillingUser[]; total: number }>('/billing/sub-users')
    return res.data
  } catch (error) {
    console.error('获取下属用户列表失败:', error)
    return null
  }
}

/**
 * 消费扣费（内部接口）
 * @param amount 消费积分数量
 * @param description 消费描述
 * @param feature 功能标识
 */
export async function consume(
  amount: number,
  description: string,
  feature: string
): Promise<ConsumeResponse | null> {
  try {
    const res = await api.post<ConsumeResponse>('/billing/consume', {
      amount,
      description,
      feature
    })
    return res.data
  } catch (error: any) {
    // 余额不足时返回错误
    if (error.response?.status === 400) {
      throw new Error('余额不足')
    }
    throw error
  }
}

// ==================== 工具函数 ====================

/**
 * 获取交易类型的中文描述
 */
export function getTransactionTypeName(type: string): string {
  const typeMap: Record<string, string> = {
    recharge: '充值',
    transfer_in: '划拨收入',
    transfer_out: '划拨支出',
    consume: '消费'
  }
  return typeMap[type] || type
}

/**
 * 获取交易类型的图标
 */
export function getTransactionTypeIcon(type: string): string {
  const iconMap: Record<string, string> = {
    recharge: 'Wallet',
    transfer_in: 'Download',
    transfer_out: 'Upload',
    consume: 'ShoppingCart'
  }
  return iconMap[type] || 'Coin'
}
