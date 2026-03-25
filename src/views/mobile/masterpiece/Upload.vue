<template>
  <div class="masterpiece-upload">
    <header class="page-header">
      <button class="back-btn" @click="goBack">
        <el-icon :size="24"><ArrowLeft /></el-icon>
      </button>
      <h1>上传菜品图</h1>
    </header>

    <main class="upload-content">
      <div
        class="upload-area"
        :class="{ 'has-image': previewUrl }"
        @click="triggerUpload"
      >
        <input
          type="file"
          ref="fileInput"
          accept="image/*"
          @change="onFileChange"
          style="display: none"
        />
        <template v-if="!previewUrl">
          <div class="upload-placeholder">
            <div class="upload-icon">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                <rect x="8" y="12" width="32" height="24" rx="2" stroke="currentColor" stroke-width="1.5"/>
                <circle cx="16" cy="20" r="3" stroke="currentColor" stroke-width="1.5"/>
                <path d="M8 32L16 24L22 30L30 22L40 32" stroke="currentColor" stroke-width="1.5"/>
                <path d="M32 6V14M32 6L26 10M32 6L38 10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
            </div>
            <p class="upload-text">点击上传菜品照片</p>
            <p class="upload-hint">支持 JPG、PNG 格式，建议 1MB 以内</p>
          </div>
        </template>
        <template v-else>
          <img :src="previewUrl" alt="预览" class="preview-image" />
          <button class="remove-btn" @click.stop="removeImage">
            <el-icon :size="18"><Close /></el-icon>
          </button>
        </template>
      </div>

      <div class="tips-section">
        <h3 class="tips-title">拍摄建议</h3>
        <ul class="tips-list">
          <li>光线充足的环境效果更佳</li>
          <li>菜品占画面 60% 以上</li>
          <li>尽量展示菜品全貌</li>
        </ul>
      </div>

      <div class="action-section">
        <el-button
          type="primary"
          size="large"
          :disabled="!selectedFile"
          :loading="uploading"
          @click="startCooking"
          class="submit-btn"
        >
          开始备菜
        </el-button>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft, Close } from '@element-plus/icons-vue'
import { uploadFile } from '@/api/oss'

const router = useRouter()

const fileInput = ref<HTMLInputElement>()
const selectedFile = ref<File | null>(null)
const previewUrl = ref<string>('')
const uploading = ref(false)

function goBack() {
  router.back()
}

function triggerUpload() {
  fileInput.value?.click()
}

function onFileChange(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  if (!file.type.startsWith('image/')) {
    ElMessage.error('请上传图片文件')
    return
  }

  if (file.size > 10 * 1024 * 1024) {
    ElMessage.error('图片大小不能超过 10MB')
    return
  }

  selectedFile.value = file
  previewUrl.value = URL.createObjectURL(file)
}

function removeImage() {
  selectedFile.value = null
  previewUrl.value = ''
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

async function startCooking() {
  if (!selectedFile.value) return

  uploading.value = true
  try {
    const res = await uploadFile(selectedFile.value, 'uploads')
    ElMessage.success('图片上传成功')
    router.push({
      path: '/masterpiece/recognize',
      query: { imageUrl: res.url }
    })
  } catch (error) {
    ElMessage.error('上传失败，请重试')
  } finally {
    uploading.value = false
  }
}
</script>

<style scoped>
.masterpiece-upload {
  min-height: 100vh;
  background: var(--bg-page);
}

.page-header {
  background: var(--bg-surface);
  padding: 16px 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  position: sticky;
  top: 0;
  z-index: 10;
  box-shadow: 0 1px 0 var(--border-light);
}

.back-btn {
  background: none;
  border: none;
  padding: 4px;
  cursor: pointer;
  color: var(--color-text-primary);
  display: flex;
  align-items: center;
  justify-content: center;
}

.page-header h1 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.upload-content {
  padding: 24px 20px;
  max-width: 480px;
  margin: 0 auto;
}

.upload-area {
  background: var(--bg-surface);
  border-radius: 16px;
  border: 1.5px dashed var(--border-default);
  min-height: 280px;
  max-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: border-color 0.2s ease;
  position: relative;
  overflow: hidden;
}

.upload-area:active {
  border-color: var(--color-text-primary);
}

.upload-area.has-image {
  border-style: solid;
  border-color: var(--color-text-primary);
  min-height: auto;
  padding: 0;
}

.upload-area.has-image .preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  max-height: none;
}

.upload-placeholder {
  text-align: center;
  padding: 40px;
}

.upload-icon {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: var(--bg-page);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  color: var(--color-text-secondary);
}

.upload-text {
  font-size: 16px;
  font-weight: 500;
  color: var(--color-text-primary);
  margin: 0 0 8px;
}

.upload-hint {
  font-size: 13px;
  color: var(--color-text-secondary);
  margin: 0;
}

.preview-image {
  width: 100%;
  height: auto;
  max-height: 400px;
  object-fit: contain;
}

.remove-btn {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 36px;
  height: 36px;
  background: rgba(0, 0, 0, 0.6);
  color: var(--bg-surface);
  border: none;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s ease;
}

.remove-btn:active {
  background: rgba(0, 0, 0, 0.8);
}

.tips-section {
  background: var(--bg-surface);
  border-radius: 16px;
  padding: 20px 24px;
  margin-top: 20px;
}

.tips-title {
  margin: 0 0 12px;
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.tips-list {
  margin: 0;
  padding-left: 20px;
}

.tips-list li {
  font-size: 14px;
  color: var(--color-text-regular);
  margin-bottom: 8px;
  line-height: 1.5;
}

.tips-list li:last-child {
  margin-bottom: 0;
}

.action-section {
  padding: 28px 0 24px;
  text-align: center;
}

.submit-btn {
  width: 100%;
  max-width: 280px;
  height: 52px;
  font-size: 16px;
  font-weight: 500;
  border-radius: 26px;
  background: var(--color-primary);
  border-color: var(--color-primary);
  transition: all 0.2s ease;
}

.submit-btn:not(:disabled):hover {
  background: var(--color-primary-hover);
  border-color: var(--color-primary-hover);
}

.submit-btn:disabled {
  background: var(--border-default);
  border-color: var(--border-default);
}
</style>
