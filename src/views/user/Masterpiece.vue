<template>
  <div class="masterpiece-wrapper">
    <div class="page-container">
    <!-- Tab 导航区 -->
    <div class="tab-nav" v-if="taskTabs.length > 0">
      <!-- 左箭头 -->
      <div class="tab-arrow left" v-if="showLeftArrow && !isMobile" @click="scrollTabs('left')">
        <el-icon><ArrowLeft /></el-icon>
      </div>
      <div class="tab-list" ref="tabListRef" @scroll="updateScrollArrows">
        <!-- 创建任务 Tab -->
        <div
          class="tab-item create-tab"
          :class="{ active: activeTabId === 'create' }"
          @click="switchToCreateTab"
        >
          <div class="tab-add-icon">
            <span class="add-icon">+</span>
          </div>
          <div class="tab-info">
            <span class="tab-label">创建任务</span>
          </div>
        </div>

        <!-- 任务 Tab 列表 -->
        <div
          v-for="task in displayedTasks"
          :key="task.id"
          class="tab-item task-tab"
          :class="{ active: activeTabId === task.id }"
        >
          <div class="tab-thumb-wrap" @click="switchToTaskTab(task)">
            <img :src="(task.status === 'pending_consume' || task.status === 'done' || task.status === 'completed') && task.generated_thumb ? task.generated_thumb : task.image_url" class="tab-thumb" />
            <div class="tab-status-bar" :class="getTaskStatusClass(task.status)">
              {{ getTaskStatusText(task.status) }}
            </div>
          </div>
          <div class="tab-info">
            <span class="tab-label">{{ task.dish_name || '未命名' }}</span>
          </div>
          <div class="tab-actions">
            <el-button size="small" type="primary" @click.stop="switchToTaskTab(task)">进入</el-button>
            <el-button size="small" class="delete-btn" @click.stop="handleDeleteTask(task)">删除</el-button>
          </div>
        </div>

        <!-- 加载更多 -->
        <div v-if="hasMoreTasks" class="tab-item load-more" @click="loadMoreTasks">
          <div class="load-more-icon">
            <span class="load-icon">↓</span>
            <span class="load-text">加载更多</span>
          </div>
        </div>
      </div>
      <!-- 任务清单标题 -->
      <div class="task-list-footer">
        <span class="task-list-title">任务清单</span>
      </div>
      <!-- 右箭头 -->
      <div class="tab-arrow right" v-if="showRightArrow && !isMobile" @click="scrollTabs('right')">
        <el-icon><ArrowRight /></el-icon>
      </div>
    </div>

    <!-- 内容区 -->
    <div class="content-area">
      <!-- ========== 创建任务 Tab 内容 ========== -->
      <div v-show="activeTabId === 'create'" class="tab-panel">
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
                <p class="upload-text">请拍摄/上传您的菜品出餐照片</p>
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
                :disabled="!previewUrl || isRecognizeDone"
                @click="handleRecognize"
              >
                {{ isRecognizing ? '识别中...' : (isRecognizeDone ? '识别完成' : '开始识别') }}
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
              <h3 class="error-title">{{ getErrorTitle(recognizeError.code) }}</h3>
              <p class="error-message">{{ recognizeError.message }}</p>
              <p class="error-hint">{{ recognizeError.action || '请更换图片后重新上传识别' }}</p>
              <el-button type="primary" @click="handleReset">重新上传</el-button>
            </div>

            <!-- 识别结果卡片 -->
            <div v-else-if="recognizeResult" class="result-card">
              <h3 class="result-title">识别结果</h3>
              <div class="result-tip">
                <el-icon><InfoFilled /></el-icon>
                <span>AI 识别结果仅供参考，如有不准确可自行修改</span>
              </div>
              <div class="result-form">
                <div class="form-item" v-for="field in visibleFields" :key="field.key">
                  <label class="form-label">
                    {{ field.label }}
                    <span v-if="isFieldEditable(field.key)" class="field-badge editable">可编辑</span>
                    <span v-else class="field-badge readonly">系统生成</span>
                  </label>
                  <el-input
                    v-if="isFieldEditable(field.key)"
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

      <!-- ========== 任务详情 Tab 内容 ========== -->
      <div v-show="activeTabId !== 'create'" class="tab-panel task-detail-panel">
        <!-- 删除按钮 - 右上角 -->
        <div class="task-detail-delete" v-if="currentTaskDetail">
          <el-button size="small" class="delete-btn" @click="handleDeleteCurrentTask">删除任务</el-button>
        </div>

        <!-- 任务基本信息 -->
        <div class="task-detail-topbar" v-if="currentTaskDetail">
          <div class="task-detail-title">
            <h3 class="task-detail-name">{{ currentTaskDetail.dish_name || '未知菜品' }}</h3>
            <span class="task-status" :class="getTaskStatusClass(currentTaskDetail.status)">
              {{ getTaskStatusText(currentTaskDetail.status) }}
            </span>
          </div>
        </div>

        <!-- 步骤二：选择背景图（pending_select 状态） -->
        <div v-if="currentTaskDetail?.status === 'failed'" class="failed-section">
          <div class="failed-icon">
            <el-icon :size="64" color="#f56c6c"><CircleCloseFilled /></el-icon>
          </div>
          <h2 class="failed-title">任务失败</h2>
          <p class="failed-desc">{{ currentTaskDetail.error_message || '未找到匹配的背景图，请稍后重试' }}</p>
          <div class="failed-actions">
            <el-button type="primary" @click="handleRetryCurrentTask">重新上传</el-button>
          </div>
        </div>
        <div v-else-if="currentTaskDetail?.status === 'pending_select'" class="step2-panel">
          <h4 class="step-title">选择背景图</h4>
          <p class="step-desc">当前显示 {{ backgroundImages.length }} 张，可选 {{ maxSelect }} 张</p>
          <div class="background-grid">
            <div
              v-for="bg in backgroundImages"
              :key="bg.id"
              class="bg-item"
              :class="{ selected: selectedBackgrounds.includes(bg.id) }"
              @click="toggleBackground(bg.id)"
            >
              <img :src="bg.url" :alt="`背景图 ${bg.name}`" />
              <div class="bg-item-name" v-if="showBackgroundName">{{ bg.name }}</div>
              <div class="bg-select-badge" v-if="selectedBackgrounds.includes(bg.id)">
                <el-icon><Check /></el-icon>
              </div>
            </div>
          </div>
          <div class="step2-footer">
            <span class="selected-count">已选择：{{ selectedBackgrounds.length }} / {{ maxSelect }} 张</span>
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

        <!-- 生成中状态（轮询进度） -->
        <div v-else-if="currentTaskDetail?.status === 'generating'" class="generating-panel">
          <div class="generating-progress">
            <el-progress
              :percentage="Math.round((generationProgress?.current || 0) / (generationProgress?.total || 1) * 100)"
              :stroke-width="16"
              status="success"
            />
            <p class="generating-message">{{ generationProgress?.message || '正在生成...' }}</p>
          </div>

          <div class="generation-grid">
            <div
              v-for="img in generatedImages"
              :key="img.index"
              class="gen-item"
              :class="{
                selected: selectedGenerations.includes(img.index),
                failed: img.status === 'failed',
                pending: img.status === 'pending'
              }"
              @click="img.status === 'success' && toggleGeneration(img.index)"
            >
              <div class="gen-image-wrapper">
                <img v-if="img.url" :src="img.url" :alt="`生成图 ${img.index + 1}`" />
                <div v-else class="gen-placeholder">
                  <el-icon v-if="img.status === 'pending'" class="is-loading"><Loading /></el-icon>
                  <el-icon v-else-if="img.status === 'failed'" color="#f56c6c"><CircleCloseFilled /></el-icon>
                </div>
                <div v-if="img.url && watermarkEnabled" class="watermark-overlay">
                  <span class="watermark-text">预览水印</span>
                </div>
              </div>
              <div class="gen-status-badge" :class="img.status">
                {{ img.status === 'success' ? '成功' : img.status === 'failed' ? '失败' : '生成中' }}
              </div>
              <div class="gen-select-badge" v-if="selectedGenerations.includes(img.index)">
                <el-icon><Check /></el-icon>
              </div>
            </div>
          </div>

          <div class="generating-tip">
            <el-alert type="info" :closable="false" show-icon>
              <template #default>
                图片生成中，请耐心等待...
              </template>
            </el-alert>
          </div>
        </div>

        <!-- 待消费状态（pending_consume） -->
        <div v-else-if="currentTaskDetail?.status === 'pending_consume'" class="step3-panel">
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

          <div class="generation-grid">
            <div
              v-for="img in generatedImages"
              :key="img.index"
              class="gen-item"
              :class="{
                selected: selectedGenerations.includes(img.index),
                failed: img.status === 'failed'
              }"
            >
              <div class="gen-image-wrapper">
                <img v-if="img.url" :src="img.url" :alt="`生成图 ${img.index + 1}`" />
                <div v-else class="gen-placeholder gen-placeholder-failed">
                  <el-icon color="#f56c6c"><CircleCloseFilled /></el-icon>
                  <span class="failed-text">{{ img.error || '生成失败' }}</span>
                </div>
                <div v-if="img.url && watermarkEnabled" class="watermark-overlay">
                  <span class="watermark-text">预览水印</span>
                </div>
              </div>
              <div class="gen-select-btn" v-if="img.status === 'success'" @click="toggleGeneration(img.index)">
                <el-icon><Check /></el-icon>
                {{ selectedGenerations.includes(img.index) ? '已选' : '选择' }}
              </div>
            </div>
          </div>

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

            <div class="consume-actions">
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

        <!-- 完成状态 -->
        <div v-else-if="currentTaskDetail?.status === 'done' || currentTaskDetail?.status === 'completed'" class="complete-section">
          <!-- 已购买的图片展示 -->
          <div class="generation-grid" v-if="purchasedImages.length > 0">
            <div
              v-for="(url, index) in purchasedImages"
              :key="index"
              class="gen-item"
            >
              <div class="gen-image-wrapper" @click="previewImage(url)">
                <img
                  :src="url"
                  :alt="`图片 ${index + 1}`"
                  class="purchased-img"
                />
              </div>
              <div class="gen-select-btn" @click="downloadImage(url, `${currentTaskDetail?.dish_name || '菜品'}_${index + 1}.jpg`)">
                <el-icon><Download /></el-icon>
                下载高清原图
              </div>
            </div>
          </div>
        </div>

        <!-- 失败状态 -->
        <div v-else-if="currentTaskDetail?.status === 'failed'" class="failed-section">
          <div class="failed-icon">
            <el-icon :size="64" color="#f56c6c"><CircleCloseFilled /></el-icon>
          </div>
          <h2 class="failed-title">任务失败</h2>
          <p class="failed-desc">{{ currentTaskDetail.error_message || '未知错误' }}</p>
          <div class="failed-actions">
            <el-button class="delete-btn" @click="handleDeleteAndBack">删除任务</el-button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- 图片预览弹窗 -->
  <el-dialog
    v-model="showPreview"
    :show-close="false"
    :close-on-click-modal="true"
    :modal-append-to-body="true"
    :append-to-body="true"
    class="image-preview-dialog"
    @click="showPreview = false"
  >
    <div class="preview-content" @click="showPreview = false">
      <img :src="previewUrl" class="preview-image" @click.stop />
    </div>
  </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { UploadFilled, Check, CircleCheckFilled, Setting, InfoFilled, CircleCloseFilled, Lock, ArrowLeft, ArrowRight, Loading, Download } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { uploadFile } from '@/api/oss'
import { recognizeImage, updateTask, generateImages, consumeTask, getTasks, getTask, cancelTask, getConfig } from '@/api/masterpiece'

const router = useRouter()
const userStore = useUserStore()

// Tab 控制
const activeTabId = ref('create')
const taskTabs = ref<TaskItem[]>([])
const displayedTaskCount = ref(10)
const isMobile = ref(false)

// 图片预览
const showPreview = ref(false)
const previewUrl = ref('')

// 任务详情
interface TaskItem {
  id: string
  image_url: string
  dish_name: string
  status: string
  created_at: string
  generated_thumb?: string | null
}

const currentTaskDetail = ref<any>(null)

// 已购买的图片列表
const purchasedImages = computed(() => {
  if (!currentTaskDetail.value) return []
  // 优先使用 selected_images（用户选中的图片）
  if (currentTaskDetail.value.selected_images?.length > 0) {
    return currentTaskDetail.value.selected_images
  }
  // 备选：使用 generated_images（生成的图片）
  if (currentTaskDetail.value.generated_images?.length > 0) {
    return currentTaskDetail.value.generated_images
  }
  // 备选：使用 generated_images_detail 中的成功图片
  const detail = currentTaskDetail.value.generated_images_detail
  if (detail?.length > 0) {
    const successUrls = detail
      .filter((img: any) => img.status === 'success' && img.url)
      .map((img: any) => img.url)
    if (successUrls.length > 0) return successUrls
  }
  return []
})

// 显示的任务（限制10个）
const displayedTasks = computed(() => {
  return taskTabs.value.slice(0, displayedTaskCount.value)
})

const hasMoreTasks = computed(() => {
  return taskTabs.value.length > displayedTaskCount.value
})

function loadMoreTasks() {
  displayedTaskCount.value += 10
}

// Tab 滚动相关
const tabListRef = ref<HTMLElement | null>(null)
const showLeftArrow = ref(false)
const showRightArrow = ref(false)

// 第一步相关
const fileInputRef = ref<HTMLInputElement | null>(null)
const isRecognizing = ref(false)
const isRecognizeDone = ref(false)
const recognizeResult = ref<Record<string, string> | null>(null)
const originalRecognizeResult = ref<Record<string, string> | null>(null)
const recognizeError = ref<{ code: string; message: string; action?: string } | null>(null)

// 识别错误码定义
const RECOGNIZE_ERROR_CODES = {
  VIOLATION_IMAGE: {
    code: 'VIOLATION_IMAGE',
    message: '图片内容违规，请更换图片后重试',
    action: '请上传合规的菜品图片'
  },
  NON_DISH_IMAGE: {
    code: 'NON_DISH_IMAGE',
    message: '未检测到菜品主体，请上传菜品图片',
    action: '请上传包含单个菜品的图片'
  },
  MULTIPLE_DISHES: {
    code: 'MULTIPLE_DISHES',
    message: '检测到多个菜品，请上传单一菜品的图片',
    action: '每次只上传一个菜品'
  },
  UNSUPPORTED_IMAGE_FORMAT: {
    code: 'UNSUPPORTED_IMAGE_FORMAT',
    message: '图片格式不支持，请上传 jpg、png 等常见格式的图片',
    action: '请使用 JPG、PNG 格式'
  },
  PARSE_ERROR: {
    code: 'PARSE_ERROR',
    message: '无法识别菜品，请上传清晰的菜品图片',
    action: '确保图片清晰，菜品占据主体'
  },
  RATE_LIMITED: {
    code: 'RATE_LIMITED',
    message: '操作过于频繁，请稍后重试',
    action: '请等待片刻后再试'
  },
  UNKNOWN_ERROR: {
    code: 'UNKNOWN_ERROR',
    message: '识别失败，请重试',
    action: '如持续失败请联系管理员'
  }
} as const

// 根据错误码获取错误标题
function getErrorTitle(errorCode: string): string {
  const titles: Record<string, string> = {
    VIOLATION_IMAGE: '图片内容违规',
    NON_DISH_IMAGE: '未检测到菜品',
    MULTIPLE_DISHES: '检测到多个菜品',
    UNSUPPORTED_IMAGE_FORMAT: '图片格式不支持',
    PARSE_ERROR: '无法识别菜品',
    RATE_LIMITED: '操作过于频繁',
    NETWORK_ERROR: '网络错误',
    UNKNOWN_ERROR: '识别失败'
  }
  return titles[errorCode] || '识别失败'
}

// 防恶意提交状态
const isDisabled = ref(false)
const disableUntil = ref<number | null>(null)
const remainingTime = ref(0)
let countdownTimer: ReturnType<typeof setInterval> | null = null

function checkDisableStatus() {
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

function recordError() {
  if (userStore.isAdmin) return
  const now = Date.now()
  const fiveMinutesAgo = now - 5 * 60 * 1000
  const stored = localStorage.getItem('masterpiece_errors')
  const errors: number[] = stored ? JSON.parse(stored) : []
  const recentErrors = errors.filter(t => t > fiveMinutesAgo)
  recentErrors.push(now)
  if (recentErrors.length >= 3) {
    const disableUntilTime = now + 15 * 60 * 1000
    isDisabled.value = true
    disableUntil.value = disableUntilTime
    localStorage.setItem('masterpiece_disable', JSON.stringify({
      disableUntil: disableUntilTime
    }))
    localStorage.removeItem('masterpiece_errors')
    startCountdown()
  } else {
    localStorage.setItem('masterpiece_errors', JSON.stringify(recentErrors))
  }
}

function startCountdown() {
  if (countdownTimer) clearInterval(countdownTimer)
  updateRemainingTime()
  countdownTimer = setInterval(updateRemainingTime, 1000)
}

function updateRemainingTime() {
  if (disableUntil.value) {
    const remaining = Math.max(0, Math.ceil((disableUntil.value - Date.now()) / 1000))
    remainingTime.value = remaining
    if (remaining <= 0) {
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

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}分${secs}秒`
}

// 可编辑字段配置
const baseFields = [
  { key: 'dish_name', label: '菜品名称', editable: true },
  { key: 'business_type', label: '所属业态', editable: true },
  { key: 'cuisine_type', label: '所属菜系', editable: true },
  { key: 'main_ingredients', label: '主要原材料', editable: false },
  { key: 'cooking_method', label: '主要做法', editable: false },
  { key: 'description', label: '整体详细描述', editable: false },
  { key: 'photo_tips', label: '摄影建议', editable: false }
]

// 从配置加载的字段
const editableFieldsConfig = ref<string[]>([])
const visibleFieldsConfig = ref<string[]>([])

// 根据配置过滤显示的字段
const editableFields = computed(() => {
  return baseFields.filter(field => {
    // 如果配置为空，显示所有字段
    if (editableFieldsConfig.value.length === 0) return true
    return editableFieldsConfig.value.includes(field.key)
  })
})

const visibleFields = computed(() => {
  return baseFields.filter(field => {
    // 如果配置为空，显示所有字段
    if (visibleFieldsConfig.value.length === 0) return true
    return visibleFieldsConfig.value.includes(field.key)
  })
})

const canSubmit = computed(() => {
  return recognizeResult.value && recognizeResult.value.dish_name
})

const isResultModified = computed(() => {
  if (!originalRecognizeResult.value || !recognizeResult.value) return false
  return JSON.stringify(originalRecognizeResult.value) !== JSON.stringify(recognizeResult.value)
})

// 判断字段是否可编辑
function isFieldEditable(key: string): boolean {
  // 如果配置为空，默认都可编辑
  if (editableFieldsConfig.value.length === 0) return true
  return editableFieldsConfig.value.includes(key)
}

// 第二步相关
const taskId = ref<string | null>(null)
const backgroundImages = ref<Array<{ id: string; url: string; name: string }>>([])
const selectedBackgrounds = ref<string[]>([])
const maxSelect = ref(6)
const showBackgroundName = ref(true)
const subtitle = ref('')
const watermarkEnabled = ref(true)
const isGenerating = ref(false)

// 生成进度相关（轮询）
const isPolling = ref(false)
const pollingTimer = ref<ReturnType<typeof setTimeout> | null>(null)
const pollingStartTime = ref<number>(0)
const POLLING_TIMEOUT = 10 * 60 * 1000 // 10分钟超时
const generationProgress = ref<{ current: number; total: number; message: string } | null>(null)

// 第三步相关
const generatedImages = ref<Array<{ index: number; url: string | null; status: string; error?: string }>>([])
const selectedGenerations = ref<number[]>([])
const coinCostPerImage = ref(5)

const isConsuming = ref(false)

const totalCoin = computed(() => {
  return selectedGenerations.value.length * coinCostPerImage.value
})

// 当前上传到 OSS 的文件路径
const uploadedImageUrl = ref<string>('')

// 加载任务列表
async function loadTaskList() {
  try {
    const data = await getTasks()
    taskTabs.value = (data.tasks || []).map((t: any) => ({
      id: t.id,
      image_url: t.image_url,
      generated_thumb: t.generated_thumb || null,
      dish_name: t.dish_name,
      status: t.status,
      created_at: t.created_at
    }))
  } catch (error) {
    console.error('加载任务列表失败', error)
  }
  updateScrollArrows()
}

// 加载大师成相配置
async function loadMasterpieceConfig() {
  try {
    const data = await getConfig()
    showBackgroundName.value = data.show_background_name ?? true
    maxSelect.value = data.select_count_max ?? 6
    subtitle.value = data.subtitle ?? ''
    watermarkEnabled.value = data.watermark_enabled ?? true
    editableFieldsConfig.value = data.editable_fields || []
    visibleFieldsConfig.value = data.visible_fields || []
    coinCostPerImage.value = data.coin_cost_per_image ?? 5
  } catch (error) {
    console.error('加载配置失败', error)
  }
}

// Tab 滚动
function updateScrollArrows() {
  const el = tabListRef.value
  if (!el) return
  showLeftArrow.value = el.scrollLeft > 0
  showRightArrow.value = el.scrollLeft < el.scrollWidth - el.clientWidth - 1
}

function scrollTabs(direction: 'left' | 'right') {
  const el = tabListRef.value
  if (!el) return
  const scrollAmount = 200
  if (direction === 'left') {
    el.scrollLeft -= scrollAmount
  } else {
    el.scrollLeft += scrollAmount
  }
  setTimeout(updateScrollArrows, 50)
}

// Tab 切换
function switchToCreateTab() {
  stopPolling()  // 停止轮询
  activeTabId.value = 'create'
  currentTaskDetail.value = null
  resetTaskState()
}

async function switchToTaskTab(task: TaskItem) {
  activeTabId.value = task.id
  await loadTaskDetail(task.id)
}

// 加载任务详情
async function loadTaskDetail(tid: string) {
  try {
    await loadMasterpieceConfig()
    const detail = await getTask(tid)
    currentTaskDetail.value = detail
    taskId.value = tid
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

    // 恢复背景图
    if (detail.backgrounds && detail.backgrounds.length > 0) {
      backgroundImages.value = detail.backgrounds.map((bg: any, index: number) => {
        const url = bg.url || bg
        const urlParts = url.split('/')
        const filename = urlParts[urlParts.length - 1] || String(index)
        return {
          id: String(index),
          name: filename,
          url: url
        }
      })
    } else if (detail.recognized_data && detail.recognized_data.background_urls) {
      backgroundImages.value = detail.recognized_data.background_urls.map((url: string, index: number) => {
        const urlParts = url.split('/')
        const filename = urlParts[urlParts.length - 1] || String(index)
        return {
          id: String(index),
          name: filename,
          url: url
        }
      })
    }

    // 恢复生成图（使用 generated_images_detail）
    if (detail.generated_images_detail && detail.generated_images_detail.length > 0) {
      generatedImages.value = detail.generated_images_detail.map((img: any) => ({
        index: img.index,
        url: img.url,
        status: img.status,
        error: img.error
      }))
      // 同步生成图缩略图到任务列表
      const firstGenerated = detail.generated_images_detail.find((img: any) => img.status === 'success')
      if (firstGenerated) {
        const taskIndex = taskTabs.value.findIndex(t => t.id === tid)
        if (taskIndex !== -1) {
          taskTabs.value[taskIndex].generated_thumb = firstGenerated.url
        }
      }
    } else {
      generatedImages.value = []
    }

    // 恢复生成进度
    if (detail.generation_progress) {
      generationProgress.value = detail.generation_progress
    }

    // 如果正在生成中，启动轮询
    if (detail.status === 'generating') {
      startPolling()
    } else {
      stopPolling()
    }

    selectedBackgrounds.value = []
    selectedGenerations.value = []
  } catch (error) {
    console.error('加载任务详情失败', error)
  }
}

// 重置任务状态
function resetTaskState() {
  // 释放之前的 blob URL
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value)
  }
  previewUrl.value = ''
  uploadedImageUrl.value = ''
  recognizeResult.value = null
  originalRecognizeResult.value = null
  recognizeError.value = null
  isRecognizeDone.value = false
  taskId.value = null
  backgroundImages.value = []
  selectedBackgrounds.value = []
  generatedImages.value = []
  selectedGenerations.value = []
  currentTaskDetail.value = null
}

// 删除当前任务
async function handleDeleteCurrentTask() {
  if (!taskId.value) return
  try {
    await ElMessageBox.confirm(
      '确定要删除该任务吗？删除后无法恢复。',
      '确认删除',
      {
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        confirmButtonClass: 'delete-confirm-btn',
        cancelButtonClass: 'delete-cancel-btn',
      }
    )
    await cancelTask(taskId.value)
    ElMessage.success('任务已删除')
    // 切换到创建任务 Tab
    switchToCreateTab()
    // 刷新任务列表
    loadTaskList()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

async function handleDeleteAndBack() {
  if (!taskId.value) return
  try {
    await cancelTask(taskId.value)
    ElMessage.success('任务已删除')
    // 切换到创建任务 Tab
    switchToCreateTab()
    // 刷新任务列表
    loadTaskList()
  } catch (error: any) {
    ElMessage.error('删除失败')
  }
}

// 删除指定任务
async function handleDeleteTask(task: TaskItem) {
  try {
    await ElMessageBox.confirm(
      '确定要删除该任务吗？删除后无法恢复。',
      '确认删除',
      {
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        confirmButtonClass: 'delete-confirm-btn',
        cancelButtonClass: 'delete-cancel-btn',
      }
    )
    await cancelTask(task.id)
    ElMessage.success('任务已删除')
    // 从列表中移除
    const idx = taskTabs.value.findIndex(t => t.id === task.id)
    if (idx !== -1) {
      taskTabs.value.splice(idx, 1)
    }
    // 如果当前选中的就是被删除的任务，切换到创建任务
    if (activeTabId.value === task.id) {
      switchToCreateTab()
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

// 重新识别当前任务
function handleRetryCurrentTask() {
  switchToCreateTab()
}

// 任务状态文本
function getTaskStatusText(status: string): string {
  const statusMap: Record<string, string> = {
    'pending': '等待中',
    'recognizing': '识别中',
    'matching': '匹配中',
    'generating': '生成中',
    'pending_select': '请选背景',
    'pending_consume': '生成成功',
    'enhancing': '增强中',
    'done': '任务完成',
    'failed': '生成失败',
    'completed': '任务完成'
  }
  return statusMap[status] || status
}

function getTaskStatusClass(status: string): string {
  const classMap: Record<string, string> = {
    'generating': 'status-generating',
    'pending_select': 'status-yellow',
    'pending_consume': 'status-green',
    'done': 'status-blue',
    'failed': 'status-failed',
    'completed': 'status-blue'
  }
  return classMap[status] || 'status-default'
}

// 上传相关
function triggerUpload() {
  fileInputRef.value?.click()
}

function onDragOver(_e: DragEvent) {}

function onDragLeave(_e: DragEvent) {}

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

  // 先创建预览（如果之前有blob URL先释放）
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value)
  }
  previewUrl.value = URL.createObjectURL(file)

  try {
    const res = await uploadFile(file, 'uploads')
    uploadedImageUrl.value = res.url
  } catch (error: any) {
    console.error('上传失败:', error)
    // 清理预览
    if (previewUrl.value) {
      URL.revokeObjectURL(previewUrl.value)
      previewUrl.value = ''
    }
    // 清理文件输入（避免同文件无法再次触发change）
    if (fileInputRef.value) {
      fileInputRef.value.value = ''
    }
    // 显示具体错误
    const msg = error?.response?.data?.detail || error?.message || '上传失败'
    ElMessage.error(msg)
  }
}

function handleReset() {
  if (taskId.value) {
    cancelTask(taskId.value).catch(console.error)
  }
  resetTaskState()
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
      originalRecognizeResult.value = JSON.parse(JSON.stringify(recognizeResult.value))
      if (res.task_id) {
        taskId.value = res.task_id
        loadTaskBackgrounds(res.task_id)
      }
      isRecognizeDone.value = true
      ElMessage.success('识别完成')
    } else if (res.status === 'error') {
      if (res.error_code === 'disabled') {
        isDisabled.value = true
        ElMessage.warning(res.error_message || '功能暂时停用')
      } else if (res.error_code === 'RATE_LIMITED') {
        // 速率限制错误
        const remaining = res.remaining_seconds || 60
        ElMessage.warning(`操作过于频繁，请在 ${remaining} 秒后重试`)
        recognizeError.value = {
          code: 'RATE_LIMITED',
          message: `操作过于频繁，请在 ${remaining} 秒后重试`,
          action: '请稍后再试'
        }
        recordError()
      } else {
        // 使用预定义错误消息或回退到后端返回的消息
        const errorInfo = RECOGNIZE_ERROR_CODES[res.error_code as keyof typeof RECOGNIZE_ERROR_CODES]
        if (errorInfo) {
          recognizeError.value = {
            code: errorInfo.code,
            message: res.error_message || errorInfo.message,
            action: errorInfo.action
          }
        } else {
          // 完全未知的错误
          recognizeError.value = {
            code: res.error_code || 'UNKNOWN',
            message: res.error_message || '识别失败，请重试',
            action: '请更换图片后重试'
          }
        }
        recordError()
      }
    }
  } catch (error: any) {
    // 检查是否是 429 速率限制错误
    if (error?.response?.status === 429) {
      const data = error?.response?.data
      const remaining = data?.remaining_seconds || data?.error_message?.match(/\d+/)?.[0] || 60
      ElMessage.warning(`操作过于频繁，请在 ${remaining} 秒后重试`)
      recognizeError.value = {
        code: 'RATE_LIMITED',
        message: `操作过于频繁，请在 ${remaining} 秒后重试`,
        action: '请稍后再试'
      }
      recordError()
      return
    }

    let msg = error?.response?.data?.detail || '识别请求失败'
    let errorCode = 'NETWORK_ERROR'
    let errorAction = '请检查网络后重试'
    if (msg.includes('media format') || msg.includes('data inspection') || msg.includes('UnsupportedMediaType')) {
      msg = '图片格式不支持，请上传 JPG/PNG 格式的图片'
      errorCode = 'UNSUPPORTED_IMAGE_FORMAT'
      errorAction = '请使用 JPG、PNG 格式'
    } else if (msg.includes('百炼API错误')) {
      msg = '图片无法被 AI 访问，请联系管理员检查图床配置'
      errorAction = '请联系管理员'
    }
    ElMessage.error(msg)
    recognizeError.value = {
      code: errorCode,
      message: msg,
      action: errorAction
    }
    recordError()
  } finally {
    isRecognizing.value = false
  }
}

// 加载任务的背景图列表
async function loadTaskBackgrounds(tid: string) {
  await loadMasterpieceConfig()
  try {
    const detail = await getTask(tid)
    if (detail.backgrounds && detail.backgrounds.length > 0) {
      backgroundImages.value = detail.backgrounds.map((bg: any, index: number) => {
        const url = bg.url || bg
        const urlParts = url.split('/')
        const filename = urlParts[urlParts.length - 1] || String(index)
        return {
          id: String(index),
          name: filename,
          url: url
        }
      })
    }
  } catch (error) {
    console.error('加载背景图列表失败', error)
  }
}

// 提交任务
async function handleSubmit() {
  if (!canSubmit.value || !taskId.value) return

  try {
    if (isResultModified.value) {
      const res = await updateTask(taskId.value, {
        dish_name: recognizeResult.value?.dish_name || '',
        recognized_items: recognizeResult.value?.main_ingredients
          ? recognizeResult.value.main_ingredients.split('、')
          : []
      })
      taskId.value = res.task_id
      backgroundImages.value = (res.backgrounds || []).map((bg: any, index: number) => ({
        id: String(index),
        name: bg.name || '',
        url: bg.url
      }))
      ElMessage.success('已更新任务信息')
    }

    // 刷新任务列表
    await loadTaskList()

    // 切换到该任务的 Tab
    if (taskId.value) {
      const task = taskTabs.value.find(t => t.id === taskId.value)
      if (task) {
        await switchToTaskTab(task)
      } else {
        activeTabId.value = taskId.value
      }
    }
  } catch (error: any) {
    // 检查是否是 429 速率限制错误
    if (error?.response?.status === 429) {
      const data = error?.response?.data
      const remaining = data?.remaining_seconds || 60
      ElMessage.warning(`操作过于频繁，请在 ${remaining} 秒后重试`)
      return
    }
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

// 轮询函数
function startPolling() {
  if (isPolling.value) return
  isPolling.value = true
  pollingStartTime.value = Date.now()

  // 等待1秒后开始轮询
  pollingTimer.value = setTimeout(() => {
    pollTaskDetail()
  }, 1000)
}

function stopPolling() {
  isPolling.value = false
  if (pollingTimer.value) {
    clearTimeout(pollingTimer.value)
    pollingTimer.value = null
  }
}

async function pollTaskDetail() {
  if (!isPolling.value || !taskId.value) return

  // 检查超时
  if (Date.now() - pollingStartTime.value > POLLING_TIMEOUT) {
    stopPolling()
    ElMessage.error('生成超时，请刷新页面重试')
    return
  }

  try {
    const detail = await getTask(taskId.value)
    currentTaskDetail.value = detail

    // 更新生成进度
    if (detail.generation_progress) {
      generationProgress.value = detail.generation_progress
    }

    // 更新生成图片状态
    if (detail.generated_images_detail && detail.generated_images_detail.length > 0) {
      generatedImages.value = detail.generated_images_detail.map((img: any) => ({
        index: img.index,
        url: img.url,
        status: img.status,
        error: img.error
      }))
    }

    // 根据状态处理
    if (detail.status === 'generating') {
      // 继续轮询，每3-5秒
      pollingTimer.value = setTimeout(pollTaskDetail, 3000 + Math.random() * 2000)
    } else if (detail.status === 'pending_consume') {
      // 停止轮询
      stopPolling()
      ElMessage.success('图片生成完成')
      // 刷新任务列表（更新状态）
      await loadTaskList()
    } else if (detail.status === 'failed') {
      // 停止轮询
      stopPolling()
      ElMessage.error(detail.error_message || '图片生成失败')
      // 刷新任务列表（更新状态）
      await loadTaskList()
    }
  } catch (error) {
    console.error('轮询失败', error)
    // 继续轮询
    pollingTimer.value = setTimeout(pollTaskDetail, 5000)
  }
}

// 生成
async function handleGenerate() {
  if (selectedBackgrounds.value.length === 0 || !taskId.value) return

  isGenerating.value = true
  stopPolling() // 停止之前的轮询

  try {
    const res = await generateImages(taskId.value, {
      selected_background_indices: selectedBackgrounds.value.map(id => parseInt(id))
    })

    // 立即返回后开始轮询
    if (res.status === 'generating') {
      generationProgress.value = {
        current: 0,
        total: res.total_images || selectedBackgrounds.value.length,
        message: res.message || '已加入生成队列'
      }
      // 开始轮询
      startPolling()
    } else if (res.status === 'pending_consume') {
      // 如果后端直接返回 pending_consume（生成很快完成），停止轮询
      stopPolling()
      ElMessage.success('图片生成完成')
    }

    ElMessage.success(res.message || '已提交生成任务')
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
    const res = await consumeTask(taskId.value, {
      selected_indices: selectedGenerations.value
    })
    ElMessage.success('购买成功，图片已存入图库')

    // 先刷新任务列表（更新状态）
    await loadTaskList()

    // 再刷新任务详情
    if (taskId.value) {
      await loadTaskDetail(taskId.value)
    }
  } catch (error: any) {
    console.error('Consume error:', error)
    const msg = error?.response?.data?.detail || '购买失败'
    ElMessage.error(msg)
  } finally {
    isConsuming.value = false
  }
}

function goToGallery() {
  router.push('/gallery')
}

function handleStartNew() {
  switchToCreateTab()
}

function downloadImage(url: string, filename: string) {
  // 直接打开新窗口下载，避免跨域问题
  window.open(url, '_blank')
}

function previewImage(url: string) {
  previewUrl.value = url
  showPreview.value = true
}

function goToConfig() {
  router.push('/masterpiece-config')
}

// 页面加载时检查停用状态
onMounted(async () => {
  checkDisableStatus()
  await loadMasterpieceConfig()
  await loadTaskList()
  updateScrollArrows()
})
</script>

<style scoped>
.masterpiece-wrapper {
  /* Single root wrapper for Transition compatibility */
}

.page-container {
  max-width: 1200px;
}

.page-header {
  margin-bottom: var(--space-sm);
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  padding: var(--space-xs) 0;
}

.page-title-wrap {
  text-align: center;
}

.header-right {
  position: absolute;
  right: 0;
}

@media (max-width: 640px) {
  .header-right {
    display: none;
  }
}

.page-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0;
}

.page-subtitle {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin: var(--space-xs) 0 0;
}

.page-tip {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  margin: var(--space-xs) 0 0;
  line-height: 1.5;
}

/* 任务清单标题 */
.task-list-footer {
  margin-top: var(--space-sm);
  text-align: center;
}

.task-list-title {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  font-weight: 500;
}

/* Tab 导航 */
.tab-nav {
  background: var(--color-bg-surface);
  border-radius: var(--radius-xl);
  padding: var(--space-lg);
  margin-bottom: var(--space-lg);
  position: relative;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.tab-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 36px;
  height: 36px;
  background: var(--color-bg-page);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
  transition: all var(--transition-fast);
  border: 1px solid var(--color-border);
}

.tab-arrow:hover {
  background: var(--color-primary);
  color: #fff;
  border-color: var(--color-primary);
}

.tab-arrow.left {
  left: -18px;
}

.tab-arrow.right {
  right: -18px;
}

.tab-list {
  display: flex;
  gap: var(--space-lg);
  overflow-x: auto;
  scrollbar-width: none;
  flex-wrap: wrap;
  justify-content: flex-start;
}

.tab-list::-webkit-scrollbar {
  display: none;
}

.tab-item {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all var(--transition-normal);
  border: 1px solid var(--color-border-light);
  overflow: hidden;
  background: var(--color-bg-page);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.tab-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  border-color: var(--color-primary-light);
}

.tab-item.active {
  border-color: var(--color-primary);
  box-shadow: 0 4px 16px rgba(64, 158, 255, 0.2);
}

.create-tab {
  width: 160px;
}

.tab-add-icon {
  width: 160px;
  height: 180px;
  background: linear-gradient(135deg, var(--color-bg-page) 0%, var(--color-bg-surface) 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-sm);
  transition: all var(--transition-fast);
}

.tab-add-icon .add-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--color-bg-surface);
  border: 2px dashed var(--color-border);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: var(--color-text-placeholder);
  transition: all var(--transition-fast);
}

.tab-add-icon .add-text {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.create-tab:hover .tab-add-icon .add-icon {
  border-color: var(--color-primary);
  color: var(--color-primary);
  background: rgba(64, 158, 255, 0.05);
}

.create-tab.active .tab-add-icon .add-icon {
  border-color: var(--color-primary);
  background: rgba(64, 158, 255, 0.1);
  color: var(--color-primary);
}

.task-tab {
  width: 160px;
}

.tab-thumb-wrap {
  position: relative;
  cursor: pointer;
  width: 160px;
  height: 150px;
  overflow: hidden;
}

.tab-thumb {
  width: 160px;
  height: 150px;
  object-fit: cover;
  transition: transform var(--transition-fast);
  display: block;
}

.tab-item:hover .tab-thumb {
  transform: scale(1.02);
}

.tab-status-bar {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  padding: 4px 6px;
  font-size: 11px;
  text-align: center;
  z-index: 2;
}

.tab-status-bar.status-failed {
  background: rgba(255, 255, 255, 0.95);
  color: #1a1a1a;
}

.tab-status-bar.status-yellow {
  background: rgba(255, 255, 255, 0.95);
  color: #1a1a1a;
}

.tab-status-bar.status-green {
  background: rgba(255, 255, 255, 0.95);
  color: #1a1a1a;
}

.tab-status-bar.status-blue {
  background: rgba(255, 255, 255, 0.95);
  color: #1a1a1a;
}

.tab-status-bar.status-generating {
  background: rgba(255, 255, 255, 0.95);
  color: #1a1a1a;
}

.tab-status-bar.status-default {
  background: rgba(255, 255, 255, 0.95);
  color: #1a1a1a;
}

.tab-info {
  padding: var(--space-md) var(--space-sm) var(--space-sm);
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
  background: var(--color-bg-page);
  width: 100%;
}

.tab-label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  padding: 0;
  background: transparent;
  width: 100%;
  display: block;
  max-width: 70px;
}

.tab-actions {
  display: flex;
  gap: var(--space-xs);
  justify-content: center;
  padding: 0 var(--space-sm) var(--space-md);
  background: var(--color-bg-page);
}

.tab-actions .el-button {
  border-radius: var(--radius-md);
  font-size: 12px;
  padding: 4px 12px;
}

.load-more {
  cursor: pointer;
}

.load-more-icon {
  width: 160px;
  height: 180px;
  background: linear-gradient(135deg, var(--color-bg-page) 0%, var(--color-bg-surface) 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-sm);
  transition: all var(--transition-fast);
}

.load-more-icon .load-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--color-bg-surface);
  border: 2px dashed var(--color-border);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: var(--color-text-placeholder);
  transition: all var(--transition-fast);
}

.load-more-icon .load-text {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.load-more:hover .load-more-icon {
  border-color: var(--color-primary);
}

.load-more:hover .load-more-icon .load-icon {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

/* 内容区 */
.content-area {
  min-height: 500px;
}

.tab-panel {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.step-inner {
  background: var(--color-bg-surface);
  border-radius: var(--radius-lg);
  padding: var(--space-2xl);
  display: flex;
  gap: var(--space-2xl);
}

/* 上传区域 */
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
  aspect-ratio: 4 / 3;
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

/* 停用状态 */
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

/* 识别结果 */
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

/* 错误提示 */
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

/* 任务详情面板 */
.task-detail-panel {
  background: var(--color-bg-surface);
  border-radius: var(--radius-lg);
  padding: var(--space-xl);
  position: relative;
}

.task-detail-delete {
  position: absolute;
  top: var(--space-md);
  right: var(--space-md);
  z-index: 10;
}

/* 删除按钮 - 黑色背景白色字 */
.delete-btn {
  background: #1a1a1a !important;
  border-color: #1a1a1a !important;
  color: #fff !important;
}

.delete-btn:hover {
  background: #333 !important;
  border-color: #333 !important;
  color: #fff !important;
}

/* 删除确认弹窗按钮 */
:deep(.delete-confirm-btn) {
  background: #1a1a1a !important;
  border-color: #1a1a1a !important;
  color: #fff !important;
}

:deep(.delete-confirm-btn:hover) {
  background: #333 !important;
  border-color: #333 !important;
}

:deep(.delete-cancel-btn) {
  background: #fff !important;
  border-color: #1a1a1a !important;
  color: #1a1a1a !important;
}

:deep(.delete-cancel-btn:hover) {
  background: #f5f5f5 !important;
  border-color: #333 !important;
}

/* 删除确认弹窗图标 - 改为黑白 */
:deep(.el-message-box__status) {
  color: #1a1a1a !important;
}

.task-detail-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-xl);
}

.task-detail-title {
  display: flex;
  align-items: center;
  gap: var(--space-md);
}

.task-detail-name {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0;
}

.task-status {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: var(--font-size-xs);
}

.status-active {
  background: rgba(64, 158, 255, 0.1);
  color: var(--color-primary);
}

.status-done {
  background: rgba(103, 194, 58, 0.1);
  color: #67c23a;
}

.status-failed {
  background: rgba(245, 108, 108, 0.1);
  color: #f56c6c;
}

.status-default {
  background: var(--color-bg-page);
  color: var(--color-text-secondary);
}

.task-detail-actions {
  display: flex;
  gap: var(--space-sm);
}

/* 步骤二：选择背景 */
.step2-panel {
  padding: var(--space-lg) 0;
}

.step-title {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0 0 var(--space-xs);
}

.step-desc {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin: 0 0 var(--space-lg);
}

.background-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: var(--space-md);
  margin-bottom: var(--space-xl);
}

.bg-item {
  position: relative;
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

.bg-item-name {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  font-size: 10px;
  color: rgba(255, 255, 255, 0.8);
  background: rgba(0, 0, 0, 0.4);
  padding: 2px 6px;
  z-index: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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

/* 步骤三：选择与消费 */
.step3-panel {
  padding: var(--space-lg) 0;
}

.step-info {
  margin-bottom: var(--space-lg);
}

.generation-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-xl);
  margin-bottom: var(--space-xl);
}

.gen-item {
  position: relative;
  border-radius: var(--radius-lg);
  overflow: hidden;
  cursor: pointer;
  border: 2px solid transparent;
  transition: all var(--transition-fast);
  display: flex;
  flex-direction: column;
  background: var(--color-bg-page);
}

.gen-item img {
  width: 100%;
  aspect-ratio: 4/3;
  object-fit: cover;
  display: block;
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
  aspect-ratio: 4/3;
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

.gen-select-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: var(--space-sm);
  background: var(--color-bg-page);
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  border-top: 1px solid var(--color-border);
}

.gen-select-btn:hover {
  background: var(--color-bg-surface);
}

.gen-item.selected .gen-select-btn {
  background: var(--color-primary);
  color: #fff;
  border-color: var(--color-primary);
}

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

/* 完成/失败状态 */
.complete-section,
.failed-section {
  text-align: center;
  padding: var(--space-3xl);
}

.complete-icon,
.failed-icon {
  margin-bottom: var(--space-lg);
}

.complete-title,
.failed-title {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0 0 var(--space-sm);
}

.failed-title {
  color: #f56c6c;
}

.complete-desc,
.failed-desc {
  font-size: var(--font-size-base);
  color: var(--color-text-secondary);
  margin: 0 0 var(--space-xl);
}

.complete-actions,
.failed-actions {
  display: flex;
  gap: var(--space-md);
  justify-content: center;
}

/* 图片预览弹窗 */
.image-preview-dialog {
  background: transparent !important;
}

.image-preview-dialog :deep(.el-dialog) {
  background: transparent !important;
  box-shadow: none !important;
  max-width: 96vw !important;
  max-height: 96vh !important;
  margin: 2vh auto !important;
}

.image-preview-dialog :deep(.el-dialog__header) {
  display: none;
}

.image-preview-dialog :deep(.el-dialog__body) {
  padding: 0 !important;
  background: transparent !important;
}

.image-preview-dialog :deep(.el-overlay) {
  background: rgba(0, 0, 0, 0.9) !important;
}

.preview-content {
  display: flex;
  justify-content: center;
  align-items: center;
}

.preview-image {
  max-width: 92vw;
  max-height: 88vh;
  object-fit: contain;
  display: block;
}

/* 已购买图片展示 */
.purchased-images-section {
  margin: var(--space-xl) 0;
}

.purchased-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-lg);
  margin-bottom: var(--space-xl);
}

.purchased-item {
  position: relative;
  border-radius: var(--radius-lg);
  overflow: hidden;
  background: var(--color-bg-page);
  border: 2px solid transparent;
  transition: all var(--transition-fast);
}

.purchased-item:hover {
  border-color: var(--color-primary);
}

.purchased-img {
  width: 100%;
  aspect-ratio: 4/3;
  object-fit: cover;
  display: block;
  cursor: pointer;
}

.purchased-item .download-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.purchased-item .download-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

/* 生成中面板 */
.generating-panel {
  padding: var(--space-xl) 0;
}

.generating-progress {
  margin-bottom: var(--space-2xl);
  padding: var(--space-xl);
  background: var(--color-bg-page);
  border-radius: var(--radius-lg);
}

.generating-message {
  text-align: center;
  font-size: var(--font-size-base);
  color: var(--color-text-secondary);
  margin-top: var(--space-lg);
  font-weight: 500;
}

.generating-tip {
  margin-top: var(--space-lg);
}

/* 生成图片项 */
.gen-item.failed {
  border-color: #f56c6c;
  background: rgba(245, 108, 108, 0.05);
}

.gen-item.pending {
  border-color: var(--color-border);
  background: var(--color-bg-page);
}

.gen-item .gen-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-sm);
  background: var(--color-bg-surface);
  color: var(--color-text-placeholder);
}

.gen-item .gen-placeholder.is-loading {
  color: var(--color-primary);
}

.gen-item .gen-placeholder-failed {
  color: #f56c6c;
  font-size: var(--font-size-sm);
}

.gen-item .failed-text {
  color: #f56c6c;
  font-size: var(--font-size-xs);
  text-align: center;
  max-width: 80%;
}

/* 生成状态徽章 */
.gen-status-badge {
  position: absolute;
  bottom: var(--space-sm);
  left: var(--space-sm);
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: var(--font-weight-medium);
}

.gen-status-badge.success {
  background: rgba(103, 194, 58, 0.9);
  color: #fff;
}

.gen-status-badge.failed {
  background: rgba(245, 108, 108, 0.9);
  color: #fff;
}

.gen-status-badge.pending {
  background: rgba(64, 158, 255, 0.9);
  color: #fff;
}

/* 状态样式 */
.status-generating {
  background: rgba(64, 158, 255, 0.1);
  color: var(--color-primary);
}

/* 响应式 */
@media (max-width: 1024px) {
  .step-inner {
    flex-direction: column;
  }

  .background-grid {
    grid-template-columns: repeat(3, 1fr);
  }

  .generation-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .page-header {
    padding: var(--space-lg) 0;
    margin-bottom: var(--space-md);
  }

  .page-title {
    font-size: 18px;
  }

  .page-subtitle {
    font-size: 12px;
  }

  .tab-nav {
    padding: var(--space-sm);
    margin-bottom: var(--space-md);
    position: relative;
  }

  .tab-list {
    display: flex;
    gap: var(--space-sm);
    overflow-x: auto;
    scrollbar-width: none;
    flex-wrap: nowrap;
  }

  .tab-list::-webkit-scrollbar {
    display: none;
  }

  .tab-item {
    flex-shrink: 0;
  }

  .create-tab,
  .task-tab {
    width: 100px;
    padding: 0;
    border: none;
    background: transparent;
    box-shadow: none;
    flex-direction: column;
    align-items: center;
  }

  .create-tab:hover,
  .task-tab:hover {
    transform: none;
    box-shadow: none;
    border: none;
  }

  .tab-add-icon {
    width: 100px;
    height: 75px;
    background: var(--color-bg-page);
    border: 1px dashed var(--color-border);
    border-radius: var(--radius-sm);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .tab-add-icon .add-icon {
    display: none;
  }

  .tab-add-icon::before {
    content: '+';
    font-size: 28px;
    color: var(--color-text-placeholder);
  }

  .tab-add-icon .add-text {
    display: block;
    font-size: 11px;
    color: var(--color-text-secondary);
    text-align: center;
    margin-top: var(--space-xs);
  }

  .tab-thumb-wrap {
    width: 100px;
    height: 75px;
    border-radius: var(--radius-sm);
    overflow: hidden;
  }

  .tab-thumb {
    width: 100px;
    height: 75px;
    aspect-ratio: 4 / 3;
    border-radius: var(--radius-sm);
  }

  .tab-status {
    top: 4px;
    left: 4px;
    width: 8px;
    height: 8px;
    border: 1px solid #fff;
  }

  .tab-info {
    display: block;
    padding: var(--space-xs) 0 0;
    background: transparent;
    width: 100px;
    text-align: center;
  }

  .tab-label {
    display: block;
    font-size: 11px;
    color: var(--color-text-primary);
    text-align: center;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 100px;
    padding: 0;
  }

  .tab-actions {
    display: none;
  }

  .tab-arrow {
    width: 24px;
    height: 24px;
  }

  .tab-arrow.left {
    left: 0;
  }

  .tab-arrow.right {
    right: 0;
  }

  .load-more {
    display: none;
  }

  .step-inner {
    padding: var(--space-md);
  }

  .background-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--space-sm);
  }

  .generation-grid {
    grid-template-columns: 1fr;
  }

  .task-detail-panel {
    padding: var(--space-md);
  }

  .task-detail-topbar {
    flex-direction: column;
    gap: var(--space-md);
    align-items: flex-start;
  }

  .consume-summary {
    flex-direction: column;
    gap: var(--space-sm);
  }
}
</style>
