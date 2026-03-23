import api from './request'

// 大师成相任务状态
export type MasterpieceTaskStatus =
  | 'pending'
  | 'recognizing'
  | 'matching'
  | 'generating'
  | 'pending_select'
  | 'enhancing'
  | 'pending_audit'
  | 'done'
  | 'failed'

// 大师成相任务
export interface MasterpieceTask {
  id: string
  image_url: string
  dish_name: string
  status: MasterpieceTaskStatus
  recognized_items: string[]
  generated_images: string[]
  selected_images: number[]
  hd_images: string[]
  created_at: string
  completed_at?: string
  error?: string
}

// ========== 识别相关 ==========

// 识别结果
export interface RecognizeResult {
  dish_name: string
  business_type: string
  cuisine_type: string
  main_ingredients: string[]
  cooking_method: string
  description: string
  photo_tips: string
  search_text: string
}

// 识别响应
export interface RecognizeResponse {
  status: 'success' | 'error'
  data?: RecognizeResult
  error_code?: 'VIOLATION_IMAGE' | 'NON_DISH_IMAGE' | 'MULTIPLE_DISHES' | 'UNSUPPORTED_IMAGE_FORMAT' | 'disabled'
  error_message?: string
  disable_until?: string
}

// 识别图片（第一步）
export async function recognizeImage(imageUrl: string): Promise<RecognizeResponse> {
  const res = await api.post<RecognizeResponse>('/masterpiece/recognize', {
    image_url: imageUrl
  })
  return res.data
}

// ========== 任务相关 ==========

// 背景图
export interface BackgroundImage {
  id: string
  url: string
}

// 创建任务请求
export interface CreateTaskRequest {
  image_url: string
  dish_name: string
  recognized_items?: string[]
}

// 创建任务响应
export interface CreateTaskResponse {
  task_id: string
  status: MasterpieceTaskStatus
  backgrounds: BackgroundImage[]
  created_at: string
}

// 创建任务（提交识别结果）
export async function createTask(data: CreateTaskRequest): Promise<CreateTaskResponse> {
  const res = await api.post<CreateTaskResponse>('/masterpiece/tasks', data)
  return res.data
}

// 获取任务详情
export async function getTask(taskId: string): Promise<any> {
  const res = await api.get(`/masterpiece/tasks/${taskId}`)
  return res.data
}

// 获取任务列表
export async function getTasks(status?: string): Promise<any> {
  const params = status ? { status } : {}
  const res = await api.get('/masterpiece/tasks', { params })
  return res.data
}

// 选择背景图并触发生成（第二步）
export interface SelectBackgroundsRequest {
  background_ids: string[]
}

export interface SelectBackgroundsResponse {
  task_id: string
  status: MasterpieceTaskStatus
  generated_images?: { url: string }[]
}

export async function selectBackgrounds(
  taskId: string,
  data: SelectBackgroundsRequest
): Promise<SelectBackgroundsResponse> {
  const res = await api.post<SelectBackgroundsResponse>(
    `/masterpiece/tasks/${taskId}/select`,
    data
  )
  return res.data
}

// 消费确认（第三步）
export interface ConsumeRequest {
  selected_indices: number[]
  include_hd: boolean
}

export interface ConsumeResponse {
  task_id: string
  status: MasterpieceTaskStatus
  images: string[]
  hd_images?: string[]
}

export async function consumeTask(
  taskId: string,
  data: ConsumeRequest
): Promise<ConsumeResponse> {
  const res = await api.post<ConsumeResponse>(
    `/masterpiece/tasks/${taskId}/consume`,
    data
  )
  return res.data
}

// 取消任务
export async function cancelTask(taskId: string): Promise<any> {
  const res = await api.delete(`/masterpiece/tasks/${taskId}`)
  return res.data
}

// ========== 配置相关 ==========

// 获取配置
export async function getConfig(): Promise<any> {
  const res = await api.get('/masterpiece/config')
  return res.data
}

// 更新配置
export async function updateConfig(data: any): Promise<any> {
  const res = await api.put('/masterpiece/config', data)
  return res.data
}
