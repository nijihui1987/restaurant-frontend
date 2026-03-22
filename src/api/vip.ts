import api from './request'

export interface VipInfo {
  id: number
  username: string
  phone?: string
  email?: string
  company_name?: string
  user_count: number
  image_count: number
  task_count: number
  is_active: boolean
  created_at: string
  anonymous_name?: string
  nickname?: string
  position?: string
}

export interface VipListResponse {
  vips: VipInfo[]
  total: number
}

export interface CreateVipData {
  username: string
  password: string
  phone?: string
  email?: string
  company_name?: string
  anonymous_name?: string
  nickname?: string
  position?: string
}

export interface UpdateVipData {
  phone?: string
  email?: string
  company_name?: string
  is_active?: boolean
  anonymous_name?: string
  nickname?: string
  position?: string
}

/**
 * 获取专业组列表 (admin)
 */
export async function getVipList(): Promise<VipListResponse> {
  const res = await api.get<VipListResponse>('/vips')
  return res.data
}

/**
 * 获取单个专业组详情 (admin)
 */
export async function getVip(id: number): Promise<VipInfo> {
  const res = await api.get<VipInfo>(`/vips/${id}`)
  return res.data
}

/**
 * 创建专业组 (admin)
 */
export async function createVip(data: CreateVipData): Promise<VipInfo> {
  const res = await api.post<VipInfo>('/vips', data)
  return res.data
}

/**
 * 更新专业组 (admin)
 */
export async function updateVip(id: number, data: UpdateVipData): Promise<VipInfo> {
  const res = await api.put<VipInfo>(`/vips/${id}`, data)
  return res.data
}

/**
 * 删除专业组 (admin)
 */
export async function deleteVip(id: number): Promise<void> {
  await api.delete(`/vips/${id}`)
}

/**
 * 获取专业组下的用户列表 (admin)
 */
export async function getVipUsers(vipId: number): Promise<any[]> {
  const res = await api.get<any[]>(`/vips/${vipId}/users`)
  return res.data
}
