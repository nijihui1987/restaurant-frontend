import api from './request'

export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  access_token: string
  refresh_token: string
  token_type: string
}

export type UserRole = 'admin' | 'vip' | 'user'

export interface User {
  id: number
  username: string
  email?: string
  phone?: string
  role: UserRole
  avatar?: string
  company_name?: string
  is_active: boolean
  created_at: string
  updated_at: string
  vip_id?: number  // 所属 VIP 分组ID，user 角色特有
  anonymous_name?: string  // 匿名名称
  nickname?: string  // 昵称
  real_name?: string  // 真实姓名
  position?: string  // 职位
}

export async function login(data: LoginRequest): Promise<LoginResponse> {
  const res = await api.post<LoginResponse>('/auth/login', data)
  return res.data
}

export async function register(data: LoginRequest & { phone?: string }): Promise<LoginResponse> {
  const res = await api.post<LoginResponse>('/auth/register', data)
  return res.data
}

export async function refreshToken(refresh_token: string): Promise<LoginResponse> {
  const res = await api.post<LoginResponse>('/auth/refresh', { refresh_token })
  return res.data
}

export async function logout(): Promise<void> {
  await api.post('/auth/logout')
}

export async function getUserInfo(): Promise<User> {
  const res = await api.get<User>('/users/me')
  return res.data
}