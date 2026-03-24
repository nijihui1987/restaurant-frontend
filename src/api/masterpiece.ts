import api from './request'

// 大师成相任务状态
export type MasterpieceTaskStatus =
  | 'pending'
  | 'recognizing'
  | 'matching'
  | 'generating'
  | 'pending_select'
  | 'pending_consume'
  | 'enhancing'
  | 'pending_audit'
  | 'done'
  | 'failed'

// ========== 速率限制状态 ==========

export interface RateLimitStatus {
  is_blocked: boolean
  remaining_seconds: number
  window_seconds: number
  max_attempts: number
  block_seconds: number
}

export async function getRateLimitStatus(): Promise<RateLimitStatus | null> {
  try {
    const res = await api.get<RateLimitStatus>('/masterpiece/rate_limit_status')
    return res.data
  } catch (error) {
    console.error('Failed to get rate limit status:', error)
    return null
  }
}

// ========== 类型定义 ==========

// 生成图片项
export interface GeneratedImageItem {
  index: number
  url: string | null
  status: 'success' | 'failed' | 'pending'
  error?: string
}

// 生成进度
export interface GenerationProgress {
  current: number
  total: number
  message: string
}

// 背景图
export interface BackgroundImage {
  id: string
  url: string
  name?: string
  score?: number
}

// 大师成相任务
export interface MasterpieceTask {
  id: string
  image_url: string
  dish_name: string
  status: MasterpieceTaskStatus
  recognized_items: string[]
  recognized_data?: any
  generated_images: GeneratedImageItem[]
  generated_images_detail?: GeneratedImageItem[]  // 后端返回的详细状态
  selected_images: string[]
  hd_images: string[]
  backgrounds?: BackgroundImage[]  // 匹配的背景图列表
  generation_progress?: GenerationProgress
  success_count?: number
  failed_count?: number
  created_at: string
  completed_at?: string
  error_message?: string
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
  task_id?: string
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

// 更新任务请求
export interface UpdateTaskRequest {
  dish_name: string
  recognized_items?: string[]
}

// 更新任务响应
export interface UpdateTaskResponse {
  task_id: string
  status: MasterpieceTaskStatus
  backgrounds: BackgroundImage[]
}

// 更新任务（修改识别结果后提交）
export async function updateTask(taskId: string, data: UpdateTaskRequest): Promise<UpdateTaskResponse> {
  const res = await api.put<UpdateTaskResponse>(`/masterpiece/tasks/${taskId}`, data)
  return res.data
}

// 获取任务详情
export async function getTask(taskId: string): Promise<MasterpieceTask> {
  const res = await api.get<MasterpieceTask>(`/masterpiece/tasks/${taskId}`)
  return res.data
}

// 获取任务列表
export async function getTasks(status?: string): Promise<any> {
  const params = status ? { status } : {}
  const res = await api.get('/masterpiece/tasks', { params })
  return res.data
}

// ========== 生成图片（第二步） ==========

// 触发生成请求
export interface GenerateImagesRequest {
  selected_background_indices: number[]
}

// 触发生成响应
export interface GenerateImagesResponse {
  task_id: string
  status: string
  message: string
  total_images: number
}

// 触发生成图片
export async function generateImages(
  taskId: string,
  data: GenerateImagesRequest
): Promise<GenerateImagesResponse> {
  const res = await api.post<GenerateImagesResponse>(
    `/masterpiece/tasks/${taskId}/generate`,
    data
  )
  return res.data
}

// ========== 消费确认（第三步） ==========

// 消费确认请求
export interface ConsumeRequest {
  selected_indices: number[]
}

// 消费确认响应
export interface ConsumeResponse {
  success: boolean
  task_id: string
  coin_cost: number
  balance: number
  selected_images: string[]
}

// 消费确认
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
