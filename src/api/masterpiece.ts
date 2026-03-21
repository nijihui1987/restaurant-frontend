// import api from './request' // TODO: 后端实现后启用

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

// 创建大师成相任务
export interface CreateMasterpieceTaskRequest {
  image_url: string
  dish_name: string
  recognized_items: string[]
}

export interface CreateMasterpieceTaskResponse {
  task_id: string
  status: MasterpieceTaskStatus
  created_at: string
}

export async function createMasterpieceTask(
  _data: CreateMasterpieceTaskRequest
): Promise<CreateMasterpieceTaskResponse> {
  // TODO: 后端实现后替换为真实 API
  // const res = await api.post<CreateMasterpieceTaskResponse>('/masterpiece/tasks', data)
  // return res.data

  // Mock 实现
  return {
    task_id: `task_${Date.now()}`,
    status: 'pending',
    created_at: new Date().toISOString()
  }
}

// 获取任务列表
export async function getMasterpieceTasks(): Promise<MasterpieceTask[]> {
  // TODO: 后端实现后替换为真实 API
  // const res = await api.get<MasterpieceTask[]>('/masterpiece/tasks')
  // return res.data

  // Mock 实现
  return []
}

// 获取单个任务详情
export async function getMasterpieceTask(
  taskId: string
): Promise<MasterpieceTask> {
  // TODO: 后端实现后替换为真实 API
  // const res = await api.get<MasterpieceTask>(`/masterpiece/tasks/${taskId}`)
  // return res.data

  // Mock 实现
  return {
    id: taskId,
    image_url: '',
    dish_name: '',
    status: 'pending',
    recognized_items: [],
    generated_images: [],
    selected_images: [],
    hd_images: [],
    created_at: new Date().toISOString()
  }
}

// 提交图片选择
export interface SelectImagesRequest {
  task_id: string
  selected_indices: number[]
}

export interface SelectImagesResponse {
  task_id: string
  status: MasterpieceTaskStatus
}

export async function selectImages(
  data: SelectImagesRequest
): Promise<SelectImagesResponse> {
  // TODO: 后端实现后替换为真实 API
  // const res = await api.post<SelectImagesResponse>('/masterpiece/tasks/select', data)
  // return res.data

  // Mock 实现
  return {
    task_id: data.task_id,
    status: 'enhancing'
  }
}

// 取消任务
export async function cancelMasterpieceTask(_taskId: string): Promise<void> {
  // TODO: 后端实现后替换为真实 API
  // await api.delete(`/masterpiece/tasks/${taskId}`)
}
