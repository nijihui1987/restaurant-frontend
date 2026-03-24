<template>
  <div class="page-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1 class="page-title">一键变身菜品图</h1>
      <div class="header-right" v-if="userStore.isAdmin">
        <el-button @click="goToConfig">
          <el-icon><Setting /></el-icon>
        </el-button>
      </div>
    </div>

    <!-- 步骤条 -->
    <div class="steps-container">
      <el-steps :active="currentStep" align-center finish-status="success" :inline="true">
        <el-step title="上传识别" description="上传图片并确认信息" />
        <el-step title="选择背景" description="挑选合适的背景图" />
        <el-step title="确认获取" description="选择并付费获取" />
      </el-steps>
    </div>

    <!-- 步骤内容区 -->
    <div class="step-content">
      <!-- ========== 第一步：上传与识别 ========== -->
      <div v-show="currentStep === 0" class="step-panel">
        <div class="step-inner">
          <!-- 左侧：上传区域 -->
          <div class="upload-section">
            <div
              class="upload-zone"
              :class="{ 'has-image': previewUrl }"
              @click="triggerUpload"
              @dragover.prevent="onDragOver"
              @dragleave="onDragLeave"
              @drop.prevent="onDrop"
            >
              <input
                ref="fileInputRef"
                type="file"
                accept="image/*"
                class="file-input"
                @change="onFileChange"
              />
              <div v-if="!previewUrl" class="upload-placeholder">
                <el-icon class="upload-icon" :size="48"><UploadFilled /></el-icon>
                <p class="upload-text">点击或拖拽上传图片</p>
                <p class="upload-hint">支持 JPG、PNG 格式</p>
              </div>
              <div v-else class="preview-container">
                <img :src="previewUrl" alt="预览图" class="preview-image" />
                <div class="preview-overlay">
                  <el-button size="small" @click.stop="triggerUpload">更换图片</el-button>
                </div>
              </div>
            </div>
            <div class="upload-action">
              <!-- 停用状态 -->
              <div v-if="isDisabled" class="disabled-card">
                <div class="disabled-icon">
                  <el-icon :size="40"><Lock /></el-icon>
                </div>
                <h4 class="disabled-title">功能暂时停用</h4>
                <p class="disabled-desc">识别失败次数过多，请 {{ formatTime(remainingTime) }} 后再试</p>
              </div>
              <!-- 正常识别按钮 -->
              <el-button
                v-else
                type="primary"
                size="large"
                :loading="isRecognizing"
                :disabled="!previewUrl"
                @click="handleRecognize"
              >
                {{ isRecognizing ? '识别中...' : '开始识别' }}
              </el-button>
            </div>
          </div>

          <!-- 右侧：识别结果 -->
          <div class="result-section">
            <!-- 错误提示卡片 -->
            <div v-if="recognizeError" class="error-card">
              <div class="error-icon">
                <el-icon :size="48"><CircleCloseFilled /></el-icon>
              </div>
              <h3 class="error-title">识别失败</h3>
              <p class="error-message">{{ recognizeError.message }}</p>
              <p class="error-hint">请更换图片后重新上传识别</p>
              <el-button type="primary" @click="handleReset">重新上传</el-button>
            </div>

            <!-- 识别结果卡片 -->
            <div v-else-if="recognizeResult" class="result-card">
              <h3 class="result-title">识别结果</h3>
              <div class="result-tip">
                <el-icon><InfoFilled /></el-icon>
                <span>AI 识别结果仅供参考，如有不准确可自行修改；不可修改字段如有不准确一般不影响模型性能，若出入过于大请重新提交</span>
              </div>
              <div class="result-form">
                <div class="form-item" v-for="field in editableFields" :key="field.key">
                  <label class="form-label">
                    {{ field.label }}
                    <span v-if="field.editable" class="field-badge editable">可编辑</span>
                    <span v-else class="field-badge readonly">系统生成</span>
                  </label>
                  <el-input
                    v-if="field.editable"
                    v-model="recognizeResult[field.key]"
                    size="default"
                    :placeholder="`请输入${field.label}`"
                  />
                  <div v-else class="form-value">{{ recognizeResult[field.key] }}</div>
                </div>
              </div>
              <div class="result-actions">
                <el-button @click="handleReset">重新上传</el-button>
                <el-button type="primary" @click="handleSubmit" :disabled="!canSubmit">
                  {{ isResultModified ? '确认并继续' : '继续' }}
                </el-button>
              </div>
            </div>
            <div v-else class="result-empty">
              <el-empty description="请先上传并识别图片" />
            </div>
          </div>
        </div>
      </div>

      <!-- ========== 第二步：选择背景 ========== -->
      <div v-show="currentStep === 1" class="step-panel step2-panel">
        <!-- 说明信息 -->
        <div class="step2-header">
          <h3>选择背景图</h3>
        </div>

        <!-- 背景图网格 -->
        <div class="background-grid">
          <div
            v-for="bg in backgroundImages"
            :key="bg.id"
            class="bg-item"
            :class="{ selected: selectedBackgrounds.includes(bg.id) }"
            @click="toggleBackground(bg.id)"
          >
            <img :src="bg.url" :alt="`背景图 ${bg.id}`" />
            <div class="bg-select-badge" v-if="selectedBackgrounds.includes(bg.id)">
              <el-icon><Check /></el-icon>
            </div>
          </div>
        </div>

        <!-- 按钮区域 -->
        <div class="step2-footer">
          <span class="selected-count">已选择：{{ selectedBackgrounds.length }} / {{ maxSelect }} 张</span>
          <div class="action-buttons">
            <el-button @click="handleBackToStep1">上一步</el-button>
            <el-button
              type="primary"
              size="large"
              :disabled="selectedBackgrounds.length === 0"
              :loading="isGenerating"
              @click="handleGenerate"
            >
              {{ isGenerating ? '生成中...' : '生成图片' }}
            </el-button>
          </div>
        </div>
      </div>

      <!-- ========== 第三步：选择与消费 ========== -->
      <div v-show="currentStep === 2" class="step-panel">
        <div class="step-inner">
          <div class="step-info">
            <el-alert
              title="确认获取"
              type="info"
              :closable="false"
              show-icon
            >
              <template #default>
                选择您喜欢的图片，确认后将扣除积分并解锁无水印原图
              </template>
            </el-alert>
          </div>

          <!-- 生成图网格 -->
          <div class="generation-grid">
            <div
              v-for="(img, index) in generatedImages"
              :key="index"
              class="gen-item"
              :class="{ selected: selectedGenerations.includes(index) }"
              @click="toggleGeneration(index)"
            >
              <div class="gen-image-wrapper">
                <img :src="img.url" :alt="`生成图 ${index + 1}`" />
                <div class="watermark-overlay">
                  <span class="watermark-text">预览水印</span>
                </div>
              </div>
              <div class="gen-select-badge" v-if="selectedGenerations.includes(index)">
                <el-icon><Check /></el-icon>
              </div>
            </div>
          </div>

          <!-- 付费确认区 -->
          <div class="consume-section">
            <div class="consume-summary">
              <div class="summary-item">
                <span class="summary-label">已选图片：</span>
                <span class="summary-value">{{ selectedGenerations.length }} 张</span>
              </div>
              <div class="summary-item">
                <span class="summary-label">普通版：</span>
                <span class="summary-value">{{ coinCostPerImage }} 积分/张</span>
              </div>
              <div class="summary-item highlight">
                <span class="summary-label">合计：</span>
                <span class="summary-value">{{ totalCoin }} 积分</span>
              </div>
            </div>

            <div class="hd-option">
              <el-checkbox v-model="includeHd">同时获取高清版本（+{{ hdEnhanceCoin }} 积分/张）</el-checkbox>
            </div>

            <div class="consume-actions">
              <el-button size="large" @click="handleBackToStep2">上一步</el-button>
              <el-button
                type="primary"
                size="large"
                :disabled="selectedGenerations.length === 0"
                :loading="isConsuming"
                @click="handleConsume"
              >
                确认并扣除积分
              </el-button>
            </div>
          </div>
        </div>
      </div>

      <!-- ========== 完成状态 ========== -->
      <div v-show="currentStep === 3" class="step-panel">
        <div class="step-inner complete-section">
          <div class="complete-icon">
            <el-icon :size="64" color="#67c23a"><CircleCheckFilled /></el-icon>
          </div>
          <h2 class="complete-title">任务完成</h2>
          <p class="complete-desc">图片已存入您的图库，可随时查看和使用</p>
          <div class="complete-actions">
            <el-button @click="goToGallery">前往图库</el-button>
            <el-button type="primary" @click="handleStartNew">开始新任务</el-button>
          </div>
        </div>
      </div>

      <!-- ========== 任务列表 ========== -->
      <div class="task-list-section" v-if="taskList.length > 0">
        <div class="task-list-header">
          <h3>已创建的任务</h3>
          <span class="task-list-tip">最新5条</span>
        </div>
        <div class="task-list-grid">
          <div
            v-for="task in taskList"
            :key="task.id"
            class="task-item"
            :class="getTaskStatusClass(task.status)"
          >
            <img :src="task.image_url" class="task-thumb" />
            <div class="task-info">
              <div class="task-name">{{ task.dish_name || '未知菜品' }}</div>
              <div class="task-meta">
                <span class="task-status" :class="getTaskStatusClass(task.status)">
                  {{ getTaskStatusText(task.status) }}
                </span>
                <span class="task-time">{{ formatTaskTime(task.created_at) }}</span>
              </div>
            </div>
            <div class="task-actions">
              <el-button
                v-if="task.status === 'pending_select'"
                size="small"
                type="primary"
                @click="continueTask(task)"
              >
                继续
              </el-button>
              <el-button
                v-else-if="task.status === 'done'"
                size="small"
                @click="viewTask(task)"
              >
                查看
              </el-button>
              <el-button
                v-else-if="task.status === 'failed'"
                size="small"
                type="warning"
                @click="retryTask(task)"
              >
                重试
              </el-button>
              <el-button
                v-else
                size="small"
                @click="viewTask(task)"
              >
                查看
              </el-button>
              <el-button
                size="small"
                type="danger"
                plain
                @click="deleteTask(task)"
              >
                删除
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { UploadFilled, Check, CircleCheckFilled, Setting, InfoFilled, CircleCloseFilled, Lock } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { uploadFile } from '@/api/oss'
import { recognizeImage, createTask, updateTask, selectBackgrounds, consumeTask, getTasks, getTask, cancelTask } from '@/api/masterpiece'

const router = useRouter()
const userStore = useUserStore()

// 步骤控制
const currentStep = ref(0)

// 第一步相关
const fileInputRef = ref<HTMLInputElement | null>(null)
const previewUrl = ref('')
const isRecognizing = ref(false)
const recognizeResult = ref<Record<string, string> | null>(null)
const originalRecognizeResult = ref<Record<string, string> | null>(null)  // 原始识别结果，用于对比是否修改
const recognizeError = ref<{ code: string; message: string } | null>(null)

// 防恶意提交状态
const isDisabled = ref(false)
const disableUntil = ref<number | null>(null)  // 毫秒时间戳
const remainingTime = ref(0)  // 剩余秒数
let countdownTimer: ReturnType<typeof setInterval> | null = null

// 检查是否在停用期内（从 localStorage 恢复）
function checkDisableStatus() {
  // Admin 用户不受停用限制
  if (userStore.isAdmin) return

  const stored = localStorage.getItem('masterpiece_disable')
  if (stored) {
    const data = JSON.parse(stored)
    const now = Date.now()
    if (data.disableUntil > now) {
      isDisabled.value = true
      disableUntil.value = data.disableUntil
      startCountdown()
    } else {
      localStorage.removeItem('masterpiece_disable')
    }
  }
}

// 记录错误并检查是否需要停用
function recordError() {
  // Admin 用户不受停用限制
  if (userStore.isAdmin) return

  const now = Date.now()
  const fiveMinutesAgo = now - 5 * 60 * 1000

  // 获取历史错误记录
  const stored = localStorage.getItem('masterpiece_errors')
  const errors: number[] = stored ? JSON.parse(stored) : []

  // 只保留5分钟内的错误
  const recentErrors = errors.filter(t => t > fiveMinutesAgo)
  recentErrors.push(now)

  // 超过3次错误
  if (recentErrors.length >= 3) {
    const disableUntilTime = now + 15 * 60 * 1000
    isDisabled.value = true
    disableUntil.value = disableUntilTime

    // 保存停用状态
    localStorage.setItem('masterpiece_disable', JSON.stringify({
      disableUntil: disableUntilTime
    }))
    // 清除错误记录
    localStorage.removeItem('masterpiece_errors')

    startCountdown()
  } else {
    // 保存错误记录
    localStorage.setItem('masterpiece_errors', JSON.stringify(recentErrors))
  }
}

// 开始倒计时
function startCountdown() {
  if (countdownTimer) {
    clearInterval(countdownTimer)
  }
  updateRemainingTime()
  countdownTimer = setInterval(updateRemainingTime, 1000)
}

// 更新剩余时间
function updateRemainingTime() {
  if (disableUntil.value) {
    const remaining = Math.max(0, Math.ceil((disableUntil.value - Date.now()) / 1000))
    remainingTime.value = remaining
    if (remaining <= 0) {
      // 停用期结束
      isDisabled.value = false
      disableUntil.value = null
      remainingTime.value = 0
      if (countdownTimer) {
        clearInterval(countdownTimer)
        countdownTimer = null
      }
      localStorage.removeItem('masterpiece_disable')
    }
  }
}

// 格式化时间显示
function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}分${secs}秒`
}

// 可编辑字段配置（mock，实际从 Admin 配置读取）
const editableFields = ref([
  { key: 'dish_name', label: '菜品名称', editable: true },
  { key: 'business_type', label: '所属业态', editable: true },
  { key: 'cuisine_type', label: '所属菜系', editable: true },
  { key: 'main_ingredients', label: '主要原材料', editable: false },
  { key: 'cooking_method', label: '主要做法', editable: false },
  { key: 'description', label: '整体详细描述', editable: false },
  { key: 'photo_tips', label: '摄影建议', editable: false }
])

const canSubmit = computed(() => {
  return recognizeResult.value && recognizeResult.value.dish_name
})

// 识别结果是否被用户修改过
const isResultModified = computed(() => {
  if (!originalRecognizeResult.value || !recognizeResult.value) return false
  return JSON.stringify(originalRecognizeResult.value) !== JSON.stringify(recognizeResult.value)
})

// 第二步相关
const taskId = ref<string | null>(null)  // 任务ID，后端返回
const backgroundImages = ref<Array<{ id: string; url: string }>>([])  // 背景图列表（含编号）
const selectedBackgrounds = ref<string[]>([])  // 选中的背景图编号
const maxSelect = ref(6)
const isGenerating = ref(false)

// 第三步相关
const generatedImages = ref<Array<{ url: string }>>([])
const selectedGenerations = ref<number[]>([])
const coinCostPerImage = ref(5)
const hdEnhanceCoin = ref(5)
const includeHd = ref(false)

// 任务列表
interface TaskItem {
  id: string
  image_url: string
  dish_name: string
  status: string
  created_at: string
}
const taskList = ref<TaskItem[]>([])

// 任务状态文本
function getTaskStatusText(status: string): string {
  const statusMap: Record<string, string> = {
    'pending': '等待中',
    'recognizing': '识别中',
    'matching': '匹配中',
    'generating': '生成中',
    'pending_select': '进行中',
    'enhancing': '增强中',
    'done': '已完成',
    'failed': '已失败'
  }
  return statusMap[status] || status
}

// 任务状态样式
function getTaskStatusClass(status: string): string {
  const classMap: Record<string, string> = {
    'pending_select': 'status-active',
    'done': 'status-done',
    'failed': 'status-failed'
  }
  return classMap[status] || 'status-default'
}

// 格式化任务时间
function formatTaskTime(dateStr: string): string {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 7) return `${days}天前`
  return date.toLocaleDateString()
}

// 加载任务列表
async function loadTaskList() {
  try {
    const data = await getTasks()
    taskList.value = (data.tasks || []).slice(0, 5)
  } catch (error) {
    console.error('加载任务列表失败', error)
  }
}

// 加载任务的背景图列表
async function loadTaskBackgrounds(tid: string) {
  try {
    const detail = await getTask(tid)
    // 优先从 backgrounds 字段获取
    if (detail.backgrounds && detail.backgrounds.length > 0) {
      backgroundImages.value = detail.backgrounds.map((bg: any, index: number) => ({
        id: String(index),
        url: bg.url
      }))
    }
  } catch (error) {
    console.error('加载背景图列表失败', error)
  }
}

// 继续任务
async function continueTask(task: TaskItem) {
  await restoreTaskDetails(task)
}

// 查看任务 - 根据任务状态恢复到对应步骤
async function viewTask(task: TaskItem) {
  try {
    const detail = await getTask(task.id)
    taskId.value = task.id

    // 恢复基础信息
    previewUrl.value = detail.image_url || ''
    uploadedImageUrl.value = detail.image_url || ''

    // 恢复识别结果
    if (detail.recognized_data) {
      recognizeResult.value = {
        dish_name: detail.recognized_data.dish_name || '',
        business_type: detail.recognized_data.business_type || '',
        cuisine_type: detail.recognized_data.cuisine_type || '',
        main_ingredients: Array.isArray(detail.recognized_data.main_ingredients)
          ? detail.recognized_data.main_ingredients.join('、')
          : (detail.recognized_data.main_ingredients || ''),
        cooking_method: detail.recognized_data.cooking_method || '',
        description: detail.recognized_data.description || '',
        photo_tips: detail.recognized_data.photo_tips || ''
      }
    }

    // 根据任务状态决定当前步骤
    switch (detail.status) {
      case 'pending_select':
        // 等待选择背景图 → 第2步
        if (detail.backgrounds && detail.backgrounds.length > 0) {
          backgroundImages.value = detail.backgrounds
        }
        currentStep.value = 1
        ElMessage.success('已加载任务，继续选择背景图')
        break

      case 'done':
        // 已完成 → 第3步展示生成图
        if (detail.generated_images && detail.generated_images.length > 0) {
          generatedImages.value = detail.generated_images.map((url: string) => ({ url }))
          currentStep.value = 2
          ElMessage.success('已加载任务详情')
        } else {
          // 没有生成图，停留在第2步
          currentStep.value = 1
          ElMessage.info('任务已完成，无生成图')
        }
        break

      case 'failed':
        // 失败 → 留在第1步，可重新开始
        currentStep.value = 0
        ElMessage.error('任务失败：' + (detail.error || '未知错误'))
        break

      default:
        // 其他状态默认到第1步
        currentStep.value = 1
        ElMessage.info('任务状态：' + detail.status)
    }
  } catch (error) {
    ElMessage.error('获取任务详情失败')
  }
}

// 重试任务
async function retryTask(task: TaskItem) {
  // 重置当前状态，重新开始
  handleStartNew()
  // 恢复图片
  previewUrl.value = task.image_url
  uploadedImageUrl.value = task.image_url
  ElMessage.success('已准备好重新识别，请点击开始识别')
}

// 删除任务
async function deleteTask(task: TaskItem) {
  try {
    await ElMessageBox.confirm(
      '确定要删除该任务吗？删除后无法恢复。',
      '确认删除',
      {
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
    await cancelTask(task.id)
    ElMessage.success('任务已删除')
    // 刷新任务列表
    loadTaskList()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}
const isConsuming = ref(false)

const totalCoin = computed(() => {
  const base = selectedGenerations.value.length * coinCostPerImage.value
  const hd = includeHd.value ? selectedGenerations.value.length * hdEnhanceCoin.value : 0
  return base + hd
})

// 当前上传到 OSS 的文件路径
const uploadedImageUrl = ref<string>('')

// 上传相关
function triggerUpload() {
  fileInputRef.value?.click()
}

function onDragOver(_e: DragEvent) {
  // 添加拖拽样式
}

function onDragLeave(_e: DragEvent) {
  // 移除拖拽样式
}

function onDrop(e: DragEvent) {
  const files = e.dataTransfer?.files
  if (files && files.length > 0) {
    handleFile(files[0])
  }
}

function onFileChange(e: Event) {
  const target = e.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    handleFile(target.files[0])
  }
}

async function handleFile(file: File) {
  if (!file.type.startsWith('image/')) {
    ElMessage.warning('请上传图片文件')
    return
  }
  previewUrl.value = URL.createObjectURL(file)

  try {
    const res = await uploadFile(file, 'uploads')
    uploadedImageUrl.value = res.url
  } catch (error) {
    ElMessage.error('上传失败')
    previewUrl.value = ''
  }
}

function handleReset() {
  previewUrl.value = ''
  uploadedImageUrl.value = ''
  recognizeResult.value = null
  originalRecognizeResult.value = null
  recognizeError.value = null
  taskId.value = null
  currentStep.value = 0
}

// 识别
async function handleRecognize() {
  if (!uploadedImageUrl.value) {
    ElMessage.warning('请先上传图片')
    return
  }
  if (isDisabled.value) return

  isRecognizing.value = true
  recognizeError.value = null

  try {
    const res = await recognizeImage(uploadedImageUrl.value)

    if (res.status === 'success' && res.data) {
      recognizeResult.value = {
        dish_name: res.data.dish_name || '',
        business_type: res.data.business_type || '',
        cuisine_type: res.data.cuisine_type || '',
        main_ingredients: Array.isArray(res.data.main_ingredients)
          ? res.data.main_ingredients.join('、')
          : (res.data.main_ingredients || ''),
        cooking_method: res.data.cooking_method || '',
        description: res.data.description || '',
        photo_tips: res.data.photo_tips || ''
      }
      // 保存原始识别结果（用于对比是否修改）
      originalRecognizeResult.value = JSON.parse(JSON.stringify(recognizeResult.value))
      // 保存任务ID（识别成功时后端已自动创建任务）
      if (res.task_id) {
        taskId.value = res.task_id
        // 加载任务详情以获取背景图列表
        loadTaskBackgrounds(res.task_id)
      }
      ElMessage.success('识别完成')
    } else if (res.status === 'error') {
      // 识别失败
      if (res.error_code === 'disabled') {
        // 被禁用
        isDisabled.value = true
        ElMessage.warning(res.error_message || '功能暂时停用')
      } else if (res.error_code === 'UNSUPPORTED_IMAGE_FORMAT') {
        // 图片格式不支持
        recognizeError.value = {
          code: res.error_code,
          message: res.error_message || '图片格式不支持，请上传 JPG/PNG 格式的图片'
        }
        recordError()
      } else {
        // 其他错误
        recognizeError.value = {
          code: res.error_code || 'UNKNOWN',
          message: res.error_message || '识别失败，请重试'
        }
        // 记录错误
        recordError()
      }
    }
  } catch (error: any) {
    let msg = error?.response?.data?.detail || '识别请求失败'
    let errorCode = 'NETWORK_ERROR'

    // 检测图片无法访问的错误
    if (msg.includes('media format') || msg.includes('data inspection') || msg.includes('UnsupportedMediaType')) {
      msg = '图片格式不支持，请上传 JPG/PNG 格式的图片'
      errorCode = 'UNSUPPORTED_IMAGE_FORMAT'
    } else if (msg.includes('百炼API错误')) {
      msg = '图片无法被 AI 访问，请联系管理员检查图床配置'
    }

    ElMessage.error(msg)
    recognizeError.value = {
      code: errorCode,
      message: msg
    }
    recordError()
  } finally {
    isRecognizing.value = false
  }
}

// 提交任务
async function handleSubmit() {
  if (!canSubmit.value || !taskId.value) return

  try {
    // 如果用户修改了识别结果，先更新任务
    if (isResultModified.value) {
      const res = await updateTask(taskId.value, {
        dish_name: recognizeResult.value?.dish_name || '',
        recognized_items: recognizeResult.value?.main_ingredients
          ? recognizeResult.value.main_ingredients.split('、')
          : []
      })
      taskId.value = res.task_id
      backgroundImages.value = res.backgrounds || []
      ElMessage.success('已更新任务信息')
    }

    // 刷新任务列表
    loadTaskList()

    // 进入第二步（选择背景图）
    currentStep.value = 1
  } catch (error: any) {
    const msg = error?.response?.data?.detail || '操作失败'
    ElMessage.error(msg)
  }
}

// 切换背景选择
function toggleBackground(id: string) {
  const idx = selectedBackgrounds.value.indexOf(id)
  if (idx === -1) {
    if (selectedBackgrounds.value.length < maxSelect.value) {
      selectedBackgrounds.value.push(id)
    } else {
      ElMessage.warning(`最多只能选择 ${maxSelect.value} 张`)
    }
  } else {
    selectedBackgrounds.value.splice(idx, 1)
  }
}

// 生成
async function handleGenerate() {
  if (selectedBackgrounds.value.length === 0 || !taskId.value) return

  isGenerating.value = true

  try {
    const res = await selectBackgrounds(taskId.value, {
      background_ids: selectedBackgrounds.value
    })

    // 后端返回生成图列表
    if (res.generated_images && res.generated_images.length > 0) {
      generatedImages.value = res.generated_images
    }
    ElMessage.success('生成完成')
    currentStep.value = 2
  } catch (error: any) {
    const msg = error?.response?.data?.detail || '生成失败'
    ElMessage.error(msg)
  } finally {
    isGenerating.value = false
  }
}

// 切换生成图选择
function toggleGeneration(index: number) {
  const idx = selectedGenerations.value.indexOf(index)
  if (idx === -1) {
    selectedGenerations.value.push(index)
  } else {
    selectedGenerations.value.splice(idx, 1)
  }
}

// 消费
async function handleConsume() {
  if (selectedGenerations.value.length === 0 || !taskId.value) return

  isConsuming.value = true

  try {
    await consumeTask(taskId.value, {
      selected_indices: selectedGenerations.value,
      include_hd: includeHd.value
    })
    ElMessage.success('购买成功，图片已存入图库')
    currentStep.value = 3
  } catch (error: any) {
    const msg = error?.response?.data?.detail || '购买失败'
    ElMessage.error(msg)
  } finally {
    isConsuming.value = false
  }
}

function handleBackToStep1() {
  currentStep.value = 0
}

function handleBackToStep2() {
  currentStep.value = 1
}

function goToGallery() {
  router.push('/gallery')
}

function handleStartNew() {
  previewUrl.value = ''
  uploadedImageUrl.value = ''
  recognizeResult.value = null
  originalRecognizeResult.value = null
  taskId.value = null
  backgroundImages.value = []
  selectedBackgrounds.value = []
  generatedImages.value = []
  selectedGenerations.value = []
  includeHd.value = false
  currentStep.value = 0
}

function goToConfig() {
  router.push('/masterpiece-config')
}

// 页面加载时检查停用状态
onMounted(() => {
  checkDisableStatus()
  restoreTask()
  loadTaskList()
})

// 恢复未完成的任务
async function restoreTask() {
  try {
    // 获取 pending_select 状态的任务（等待选择背景图）
    const data = await getTasks('pending_select')
    if (data.tasks && data.tasks.length > 0) {
      const task = data.tasks[0] // 取最新的一个
      await restoreTaskDetails(task)
    }
  } catch (error) {
    console.error('恢复任务失败', error)
  }
}

async function restoreTaskDetails(task: any) {
  try {
    // 获取任务详情
    const detail = await getTask(task.id)
    taskId.value = task.id
    previewUrl.value = detail.image_url || ''
    uploadedImageUrl.value = detail.image_url || ''

    if (detail.recognized_data) {
      // 恢复识别结果
      recognizeResult.value = {
        dish_name: detail.recognized_data.dish_name || '',
        business_type: detail.recognized_data.business_type || '',
        cuisine_type: detail.recognized_data.cuisine_type || '',
        main_ingredients: Array.isArray(detail.recognized_data.main_ingredients)
          ? detail.recognized_data.main_ingredients.join('、')
          : (detail.recognized_data.main_ingredients || ''),
        cooking_method: detail.recognized_data.cooking_method || '',
        description: detail.recognized_data.description || '',
        photo_tips: detail.recognized_data.photo_tips || ''
      }
    }

    if (detail.backgrounds && detail.backgrounds.length > 0) {
      // 恢复背景图列表
      backgroundImages.value = detail.backgrounds
    }

    // 进入第二步
    currentStep.value = 1
    ElMessage.success('已恢复之前的任务，请继续选择背景图')
  } catch (error) {
    console.error('获取任务详情失败', error)
  }
}
</script>

<style scoped>
.page-container {
  max-width: 1200px;
}

.page-header {
  margin-bottom: var(--space-lg);
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  padding: var(--space-md) 0;
}

.header-left {
  flex: 1;
}

.header-right {
  position: absolute;
  right: 0;
}

.page-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0;
  text-align: center;
}

.page-desc {
  font-size: var(--font-size-base);
  color: var(--color-text-secondary);
  margin: 0;
}

/* 步骤条 */
.steps-container {
  background: var(--color-bg-surface);
  border-radius: var(--radius-lg);
  padding: var(--space-md) var(--space-lg);
  margin-bottom: var(--space-lg);
}

/* 步骤内容区 */
.step-content {
  min-height: 500px;
}

.step-panel {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.step-inner {
  background: var(--color-bg-surface);
  border-radius: var(--radius-lg);
  padding: var(--space-2xl);
}

/* ========== 第一步：上传与识别 ========== */
.step-inner {
  display: flex;
  gap: var(--space-2xl);
}

.upload-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}

.upload-zone {
  position: relative;
  border: 2px dashed var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-2xl);
  text-align: center;
  cursor: pointer;
  transition: all var(--transition-fast);
  min-height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.upload-zone:hover {
  border-color: var(--color-primary);
  background: var(--color-bg-hover);
}

.upload-zone.has-image {
  padding: 0;
  border-style: solid;
}

.file-input {
  display: none;
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-sm);
}

.upload-icon {
  color: var(--color-text-placeholder);
}

.upload-text {
  font-size: var(--font-size-base);
  color: var(--color-text-regular);
  margin: 0;
}

.upload-hint {
  font-size: var(--font-size-sm);
  color: var(--color-text-placeholder);
  margin: 0;
}

.preview-container {
  position: relative;
  width: 100%;
  height: 100%;
}

.preview-image {
  width: 100%;
  height: 300px;
  object-fit: contain;
  border-radius: var(--radius-lg);
}

.preview-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity var(--transition-fast);
  border-radius: var(--radius-lg);
}

.upload-zone:hover .preview-overlay {
  opacity: 1;
}

.upload-action {
  display: flex;
  justify-content: center;
}

/* 停用状态卡片 */
.disabled-card {
  width: 100%;
  padding: var(--space-xl);
  background: var(--color-bg-page);
  border-radius: var(--radius-lg);
  text-align: center;
  border: 1px solid var(--color-border);
}

.disabled-icon {
  color: var(--color-text-placeholder);
  margin-bottom: var(--space-md);
}

.disabled-title {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0 0 var(--space-xs);
}

.disabled-desc {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin: 0;
}

/* 右侧识别结果 */
.result-section {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.result-card {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.result-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0 0 var(--space-sm);
}

.result-tip {
  display: flex;
  align-items: flex-start;
  gap: var(--space-sm);
  padding: var(--space-sm) var(--space-md);
  background: var(--color-bg-page);
  border-radius: var(--radius-md);
  margin-bottom: var(--space-lg);
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  line-height: var(--line-height-normal);
}

.result-tip .el-icon {
  flex-shrink: 0;
  margin-top: 2px;
  color: var(--color-primary);
}

.field-badge {
  font-size: 10px;
  padding: 1px 6px;
  border-radius: 4px;
  margin-left: var(--space-xs);
  font-weight: normal;
}

.field-badge.editable {
  background: rgba(64, 158, 255, 0.1);
  color: var(--color-primary);
}

.field-badge.readonly {
  background: var(--color-bg-page);
  color: var(--color-text-placeholder);
}

.result-form {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.form-item {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.form-label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
}

.form-value {
  font-size: var(--font-size-base);
  color: var(--color-text-primary);
  padding: var(--space-sm) 0;
}

.result-actions {
  display: flex;
  gap: var(--space-md);
  justify-content: flex-end;
  margin-top: var(--space-lg);
}

.result-empty {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 错误提示卡片 */
.error-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: var(--space-2xl);
  background: var(--color-bg-page);
  border-radius: var(--radius-lg);
}

.error-icon {
  color: #f56c6c;
  margin-bottom: var(--space-lg);
}

.error-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0 0 var(--space-sm);
}

.error-message {
  font-size: var(--font-size-base);
  color: #f56c6c;
  margin: 0 0 var(--space-xs);
}

.error-hint {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin: 0 0 var(--space-xl);
}

/* ========== 第二步：选择背景 ========== */
.step2-panel {
  padding: var(--space-2xl);
}

.step2-header {
  text-align: center;
  margin-bottom: var(--space-lg);
}

.step2-header h3 {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0;
}

.background-grid {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  gap: var(--space-md);
  margin-bottom: var(--space-xl);
}

.bg-item {
  position: relative;
  flex: 0 0 calc((100% - 4 * var(--space-md)) / 5);
  aspect-ratio: 4 / 3;
  border-radius: var(--radius-md);
  overflow: hidden;
  cursor: pointer;
  border: 2px solid transparent;
  transition: all var(--transition-fast);
  background: var(--color-bg-page);
}

.bg-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.bg-item:hover {
  border-color: var(--color-primary);
}

.bg-item.selected {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}

.bg-select-badge {
  position: absolute;
  top: var(--space-xs);
  right: var(--space-xs);
  width: 24px;
  height: 24px;
  background: var(--color-primary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}

.step2-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: var(--space-lg);
  border-top: 1px solid var(--color-border);
}

.selected-count {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.step-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.selected-count {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.action-buttons {
  display: flex;
  gap: var(--space-md);
}

/* ========== 第三步：选择与消费 ========== */
.generation-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-lg);
  margin-bottom: var(--space-xl);
}

.gen-item {
  position: relative;
  aspect-ratio: 3 / 2;
  border-radius: var(--radius-lg);
  overflow: hidden;
  cursor: pointer;
  border: 2px solid transparent;
  transition: all var(--transition-fast);
}

.gen-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.gen-item:hover {
  border-color: var(--color-primary);
}

.gen-item.selected {
  border-color: var(--color-primary);
}

.gen-image-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
}

.watermark-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
}

.watermark-text {
  color: rgba(255, 255, 255, 0.6);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  transform: rotate(-15deg);
}

.gen-select-badge {
  position: absolute;
  top: var(--space-sm);
  right: var(--space-sm);
  width: 28px;
  height: 28px;
  background: var(--color-primary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}

/* 付费确认区 */
.consume-section {
  background: var(--color-bg-page);
  border-radius: var(--radius-lg);
  padding: var(--space-xl);
}

.consume-summary {
  display: flex;
  gap: var(--space-2xl);
  margin-bottom: var(--space-lg);
}

.summary-item {
  display: flex;
  gap: var(--space-xs);
}

.summary-label {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

.summary-value {
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
}

.summary-item.highlight .summary-value {
  color: var(--color-primary);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
}

.hd-option {
  margin-bottom: var(--space-lg);
}

.consume-actions {
  display: flex;
  gap: var(--space-md);
  justify-content: flex-end;
}

/* ========== 完成状态 ========== */
.complete-section {
  text-align: center;
  padding: var(--space-3xl);
}

.complete-icon {
  margin-bottom: var(--space-lg);
}

.complete-title {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0 0 var(--space-sm);
}

.complete-desc {
  font-size: var(--font-size-base);
  color: var(--color-text-secondary);
  margin: 0 0 var(--space-xl);
}

.complete-actions {
  display: flex;
  gap: var(--space-md);
  justify-content: center;
}

/* 响应式 */
@media (max-width: 1024px) {
  .step-inner {
    flex-direction: column;
  }

  .bg-item {
    flex: 0 0 calc((100% - 3 * var(--space-md)) / 4);
  }

  .generation-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .page-header {
    padding: var(--space-sm) 0;
    margin-bottom: var(--space-md);
  }

  .page-title {
    font-size: var(--font-size-base);
  }

  .steps-container {
    padding: var(--space-sm) var(--space-md);
    margin-bottom: var(--space-md);
  }

  .steps-container :deep(.el-step__title) {
    font-size: 12px;
  }

  .steps-container :deep(.el-step__description) {
    display: none;
  }

  .step2-panel {
    padding: var(--space-md);
  }

  .background-grid {
    justify-content: center;
    gap: var(--space-sm);
  }

  .bg-item {
    flex: 0 0 calc((100% - var(--space-sm)) / 2);
  }

  .bg-item:nth-child(n+11) {
    display: none;
  }

  .step2-footer {
    flex-direction: column;
    gap: var(--space-md);
  }

  .generation-grid {
    grid-template-columns: 1fr;
  }

  .consume-summary {
    flex-direction: column;
    gap: var(--space-sm);
  }
}

/* ========== 任务列表 ========== */
.task-list-section {
  margin-top: var(--space-2xl);
  background: var(--color-bg-surface);
  border-radius: var(--radius-lg);
  padding: var(--space-xl);
}

.task-list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-lg);
}

.task-list-header h3 {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0;
}

.task-list-tip {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.task-list-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: var(--space-md);
}

.task-item {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  overflow: hidden;
  transition: all var(--transition-fast);
}

.task-item:hover {
  border-color: var(--color-primary);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.task-thumb {
  width: 100%;
  aspect-ratio: 4 / 3;
  object-fit: cover;
  display: block;
}

.task-info {
  padding: var(--space-sm);
}

.task-name {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
  margin-bottom: var(--space-xs);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.task-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: var(--font-size-xs);
}

.task-status {
  padding: 1px 6px;
  border-radius: 4px;
}

.task-status.status-active {
  background: rgba(64, 158, 255, 0.1);
  color: var(--color-primary);
}

.task-status.status-done {
  background: rgba(103, 194, 58, 0.1);
  color: #67c23a;
}

.task-status.status-failed {
  background: rgba(245, 108, 108, 0.1);
  color: #f56c6c;
}

.task-status.status-default {
  background: var(--color-bg-page);
  color: var(--color-text-secondary);
}

.task-time {
  color: var(--color-text-placeholder);
}

.task-actions {
  padding: 0 var(--space-sm) var(--space-sm);
  display: flex;
  gap: var(--space-xs);
  flex-wrap: wrap;
}

/* 响应式 */
@media (max-width: 1024px) {
  .task-list-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 640px) {
  .task-list-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
