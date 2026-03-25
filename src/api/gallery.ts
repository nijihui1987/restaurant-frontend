import api from './request'

// ========== 类型定义 ==========

// 图片类型枚举
export type ImageType = 'original' | 'generated'

// 图片项
export interface ImageItem {
  id: string
  url: string
  type: ImageType
  task_id: string
  dish_name: string
  deleted: boolean
  created_at: string
  // 预留扩展字段
  source_feature?: string
  tags?: string[]
  metadata?: Record<string, any>
}

// 图库响应结构
export interface GalleryResponse {
  original_images: ImageItem[]
  generated_images: ImageItem[]
}

// ========== API 函数 ==========

/**
 * 获取图库列表
 */
export async function getGalleryImages(): Promise<GalleryResponse> {
  const res = await api.get<GalleryResponse>('/gallery/images')
  return res.data
}

/**
 * 删除图片（软删除）
 */
export async function deleteGalleryImage(id: string): Promise<{ success: boolean; message: string }> {
  const res = await api.delete<{ success: boolean; message: string }>(`/gallery/images/${id}`)
  return res.data
}