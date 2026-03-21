import api from './request'

export interface UploadResponse {
  url: string
  path: string
}

export async function uploadFile(file: File, folder: string = 'uploads'): Promise<UploadResponse> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('folder', folder)

  const res = await api.post<UploadResponse>('/oss/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
  return res.data
}