import axios from 'axios'

const api = axios.create({
  baseURL: '/api/v1',
  timeout: 60000,
  maxRedirects: 0
})

// 请求拦截器 - 添加 token 和修复路径
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    // 修复：FastAPI 对 /users 和 /vips 会重定向到带斜杠版本
    // 直接在请求时添加斜杠避免 307 重定向丢失 Authorization 头
    if (config.url === '/users' || config.url === '/vips') {
      config.url += '/'
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 响应拦截器 - 处理 307 重定向和 401
api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config

    // 处理 307/308 重定向，手动跟随并保留认证头
    if (error.response?.status === 307 || error.response?.status === 308) {
      const redirectUrl = error.response.headers.location
      if (redirectUrl && !originalRequest._retry) {
        originalRequest._retry = true
        originalRequest.url = redirectUrl
        originalRequest.baseURL = ''
        return api(originalRequest)
      }
    }

    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api