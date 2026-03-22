<template>
  <div class="page-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <div class="header-left">
        <h1 class="page-title">一键变身菜品图</h1>
        <p class="page-desc">上传菜品图片，AI 智能识别并生成专业摄影级作品</p>
      </div>
      <div class="header-right" v-if="userStore.isAdmin">
        <el-button @click="goToConfig">
          <el-icon><Setting /></el-icon>
          功能配置
        </el-button>
      </div>
    </div>

    <!-- 步骤条 -->
    <div class="steps-container">
      <el-steps :active="currentStep" align-center finish-status="success">
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
              <el-button
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
            <div class="result-card" v-if="recognizeResult">
              <h3 class="result-title">识别结果</h3>
              <div class="result-form">
                <div class="form-item" v-for="field in editableFields" :key="field.key">
                  <label class="form-label">{{ field.label }}</label>
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
                  提交任务
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
      <div v-show="currentStep === 1" class="step-panel">
        <div class="step-inner">
          <div class="step-info">
            <el-alert
              title="选择背景图"
              type="info"
              :closable="false"
              show-icon
            >
              <template #default>
                从以下背景图中选择 {{ maxSelect }} 张作为参考，AI 将结合您的菜品图生成全新作品
              </template>
            </el-alert>
          </div>

          <!-- 背景图网格 -->
          <div class="background-grid">
            <div
              v-for="(bg, index) in backgroundImages"
              :key="index"
              class="bg-item"
              :class="{ selected: selectedBackgrounds.includes(index) }"
              @click="toggleBackground(index)"
            >
              <img :src="bg.url" :alt="`背景图 ${index + 1}`" />
              <div class="bg-select-badge" v-if="selectedBackgrounds.includes(index)">
                <el-icon><Check /></el-icon>
              </div>
            </div>
          </div>

          <div class="step-actions">
            <div class="selected-count">
              已选择：{{ selectedBackgrounds.length }} / {{ maxSelect }} 张
            </div>
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
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { UploadFilled, Check, CircleCheckFilled, Setting } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

// 步骤控制
const currentStep = ref(0)

// 第一步相关
const fileInputRef = ref<HTMLInputElement | null>(null)
const previewUrl = ref('')
const isRecognizing = ref(false)
const recognizeResult = ref<Record<string, string> | null>(null)

// 可编辑字段配置（mock，实际从 Admin 配置读取）
const editableFields = ref([
  { key: 'dish_name', label: '菜品名称', editable: true },
  { key: 'category', label: '分类', editable: true },
  { key: 'tags', label: '标签', editable: true },
  { key: 'description', label: '描述', editable: false },
  { key: 'search_text', label: '检索词', editable: false }
])

const canSubmit = computed(() => {
  return recognizeResult.value && recognizeResult.value.dish_name
})

// 第二步相关
const backgroundImages = ref<Array<{ url: string }>>([])
const selectedBackgrounds = ref<number[]>([])
const maxSelect = ref(6)
const isGenerating = ref(false)

// 第三步相关
const generatedImages = ref<Array<{ url: string }>>([])
const selectedGenerations = ref<number[]>([])
const coinCostPerImage = ref(5)
const hdEnhanceCoin = ref(5)
const includeHd = ref(false)
const isConsuming = ref(false)

const totalCoin = computed(() => {
  const base = selectedGenerations.value.length * coinCostPerImage.value
  const hd = includeHd.value ? selectedGenerations.value.length * hdEnhanceCoin.value : 0
  return base + hd
})

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

  // TODO: 上传到 OSS
  // try {
  //   const res = await uploadFile(file, 'masterpiece')
  //   // 保存 OSS URL
  // } catch (error) {
  //   ElMessage.error('上传失败')
  // }
}

function handleReset() {
  previewUrl.value = ''
  recognizeResult.value = null
  currentStep.value = 0
}

// 识别
async function handleRecognize() {
  if (!previewUrl.value) return

  isRecognizing.value = true

  // TODO: 调用 API 获取识别结果
  // Mock 模拟识别结果
  setTimeout(() => {
    recognizeResult.value = {
      dish_name: '红烧肉',
      category: '家常菜',
      tags: '宴客,硬菜,下饭菜',
      description: '一块色泽红亮的红烧肉，肥瘦相间，入口即化',
      search_text: '红烧肉 家常菜 宴客 硬菜'
    }
    isRecognizing.value = false
    ElMessage.success('识别完成')
  }, 1500)
}

// 提交任务
async function handleSubmit() {
  if (!canSubmit.value) return

  // TODO: 调用 API 创建任务
  ElMessage.success('任务已创建')

  // 进入第二步
  currentStep.value = 1

  // 加载背景图（mock）
  loadMockBackgrounds()
}

function loadMockBackgrounds() {
  backgroundImages.value = Array.from({ length: 10 }, (_, i) => ({
    url: `https://picsum.photos/seed/bg${i}/400/300`
  }))
}

// 切换背景选择
function toggleBackground(index: number) {
  const idx = selectedBackgrounds.value.indexOf(index)
  if (idx === -1) {
    if (selectedBackgrounds.value.length < maxSelect.value) {
      selectedBackgrounds.value.push(index)
    } else {
      ElMessage.warning(`最多只能选择 ${maxSelect.value} 张`)
    }
  } else {
    selectedBackgrounds.value.splice(idx, 1)
  }
}

// 生成
async function handleGenerate() {
  if (selectedBackgrounds.value.length === 0) return

  isGenerating.value = true

  // TODO: 调用 API 触发生成
  // Mock 模拟生成
  setTimeout(() => {
    generatedImages.value = selectedBackgrounds.value.map((_, i) => ({
      url: `https://picsum.photos/seed/gen${i}/600/400`
    }))
    isGenerating.value = false
    ElMessage.success('生成完成')
    currentStep.value = 2
  }, 2000)
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
  if (selectedGenerations.value.length === 0) return

  isConsuming.value = true

  // TODO: 调用 API 确认消费
  // Mock 模拟消费
  setTimeout(() => {
    isConsuming.value = false
    currentStep.value = 3
    ElMessage.success('购买成功，图片已存入图库')
  }, 1500)
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
  recognizeResult.value = null
  selectedBackgrounds.value = []
  selectedGenerations.value = []
  includeHd.value = false
  currentStep.value = 0
}

function goToConfig() {
  router.push('/masterpiece-config')
}
</script>

<style scoped>
.page-container {
  max-width: 1200px;
}

.page-header {
  margin-bottom: var(--space-xl);
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.header-left {
  flex: 1;
}

.header-right {
  flex-shrink: 0;
}

.page-title {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0 0 var(--space-sm);
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
  padding: var(--space-xl) var(--space-2xl);
  margin-bottom: var(--space-xl);
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
  margin: 0 0 var(--space-lg);
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

/* ========== 第二步：选择背景 ========== */
.step-info {
  margin-bottom: var(--space-xl);
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

  .background-grid {
    grid-template-columns: repeat(3, 1fr);
  }

  .generation-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .background-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .generation-grid {
    grid-template-columns: 1fr;
  }

  .consume-summary {
    flex-direction: column;
    gap: var(--space-sm);
  }
}
</style>
