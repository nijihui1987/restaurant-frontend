import api from './request'

// AI 理解/识别图片
export interface ImageUnderstandRequest {
  model?: string
  image_url: string
  question: string
}

export interface ImageUnderstandResponse {
  answer: string
  usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

export async function understandImage(
  data: ImageUnderstandRequest
): Promise<ImageUnderstandResponse> {
  const res = await api.post<ImageUnderstandResponse>(
    '/vision/image/understand',
    data
  )
  return res.data
}

// 图片生成任务
export interface ImageGenerateRequest {
  model?: string
  image_url: string
  prompt: string
}

export interface ImageGenerateResponse {
  task_id: string
  status: string
}

export async function generateImage(
  data: ImageGenerateRequest
): Promise<ImageGenerateResponse> {
  const res = await api.post<ImageGenerateResponse>(
    '/vision/image/generate',
    data
  )
  return res.data
}

// 查询任务状态
export interface TaskStatusResponse {
  task_id: string
  status: 'pending' | 'generating' | 'done' | 'failed'
  result?: {
    image_url?: string
    images?: string[]
  }
  error?: string
}

export async function getTaskStatus(
  taskId: string
): Promise<TaskStatusResponse> {
  const res = await api.get<TaskStatusResponse>(
    `/vision/image/task/${taskId}`
  )
  return res.data
}

// 图片超分
export interface ImageEnhanceRequest {
  model?: string
  image_url: string
}

export interface ImageEnhanceResponse {
  task_id: string
  status: string
}

export async function enhanceImage(
  data: ImageEnhanceRequest
): Promise<ImageEnhanceResponse> {
  const res = await api.post<ImageEnhanceResponse>(
    '/vision/image/enhance',
    data
  )
  return res.data
}

// 查询超分任务状态
export async function getEnhanceTaskStatus(
  taskId: string
): Promise<TaskStatusResponse> {
  const res = await api.get<TaskStatusResponse>(
    `/vision/image/enhance/${taskId}`
  )
  return res.data
}
