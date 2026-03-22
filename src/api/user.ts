import api from './request'
import type { User, UserRole } from './auth'

export interface UserListItem extends User {
  vip_name?: string
}

export interface UserListParams {
  page?: number
  page_size?: number
  role?: UserRole
  vip_id?: number
  keyword?: string
}

export interface UserListResponse {
  users: UserListItem[]
  total: number
  page: number
  page_size: number
}

export interface CreateUserData {
  username: string
  password: string
  phone?: string
  email?: string
  role: UserRole
  company_name?: string
  vip_id?: number
  anonymous_name?: string
  nickname?: string
  real_name?: string
  position?: string
}

export interface UpdateUserData {
  phone?: string
  email?: string
  role?: UserRole
  company_name?: string
  vip_id?: number
  is_active?: boolean
  anonymous_name?: string
  nickname?: string
  real_name?: string
  position?: string
}

/**
 * 获取用户列表 (admin)
 */
export async function getUserList(params: UserListParams = {}): Promise<UserListResponse> {
  const res = await api.get<UserListResponse>('/users', { params })
  return res.data
}

/**
 * 获取单个用户详情 (admin)
 */
export async function getUser(id: number): Promise<User> {
  const res = await api.get<User>(`/users/${id}`)
  return res.data
}

/**
 * 创建用户 (admin)
 */
export async function createUser(data: CreateUserData): Promise<User> {
  const res = await api.post<User>('/users', data)
  return res.data
}

/**
 * 更新用户 (admin)
 */
export async function updateUser(id: number, data: UpdateUserData): Promise<User> {
  const res = await api.put<User>(`/users/${id}`, data)
  return res.data
}

/**
 * 删除用户 (admin)
 */
export async function deleteUser(id: number): Promise<void> {
  await api.delete(`/users/${id}`)
}

/**
 * 更新用户状态 (admin) - 启用/禁用
 */
export async function updateUserStatus(id: number, is_active: boolean): Promise<User> {
  const res = await api.put<User>(`/users/${id}/disable`, { is_active })
  return res.data
}
