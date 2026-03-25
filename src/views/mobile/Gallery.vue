<template>
  <div class="mobile-gallery">
    <header class="page-header">
      <h1>我的图库</h1>
    </header>

    <main class="gallery-content" v-loading="loading">
      <el-tabs v-model="activeTab" class="gallery-tabs">
        <el-tab-pane label="全部" name="all">
          <div class="image-grid" v-if="displayImages.length > 0 && !loading">
            <div class="image-item" v-for="img in displayImages" :key="img.id">
              <img :src="img.url" :alt="img.dish_name" @click="previewImage(img)" />
              <div class="delete-btn" @click.stop="deleteImage(img)">
                <el-icon><Delete /></el-icon>
              </div>
            </div>
          </div>
          <div class="empty-state" v-else-if="!loading">
            <div class="empty-icon">
              <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
                <rect x="8" y="14" width="48" height="36" rx="4" stroke="currentColor" stroke-width="1.5"/>
                <circle cx="22" cy="26" r="4" stroke="currentColor" stroke-width="1.5"/>
                <path d="M8 42L20 30L28 38L40 26L56 42" stroke="currentColor" stroke-width="1.5"/>
              </svg>
            </div>
            <p class="empty-title">图库为空</p>
            <p class="empty-hint">开始制作您的第一张作品</p>
            <el-button type="primary" @click="goToMasterpiece" class="empty-btn">
              去制作
            </el-button>
          </div>
        </el-tab-pane>
        <el-tab-pane label="原图" name="original">
          <div class="image-grid" v-if="displayImages.length > 0 && !loading">
            <div class="image-item" v-for="img in displayImages" :key="img.id">
              <img :src="img.url" :alt="img.dish_name" @click="previewImage(img)" />
              <div class="delete-btn" @click.stop="deleteImage(img)">
                <el-icon><Delete /></el-icon>
              </div>
            </div>
          </div>
          <div class="empty-state" v-else-if="!loading">
            <p class="empty-title">暂无原图</p>
          </div>
        </el-tab-pane>
        <el-tab-pane label="生成图" name="generated">
          <div class="image-grid" v-if="displayImages.length > 0 && !loading">
            <div class="image-item" v-for="img in displayImages" :key="img.id">
              <img :src="img.url" :alt="img.dish_name" @click="previewImage(img)" />
              <div class="delete-btn" @click.stop="deleteImage(img)">
                <el-icon><Delete /></el-icon>
              </div>
            </div>
          </div>
          <div class="empty-state" v-else-if="!loading">
            <p class="empty-title">暂无生成图</p>
          </div>
        </el-tab-pane>
      </el-tabs>
    </main>

    <!-- 图片预览弹窗 -->
    <el-dialog
      v-model="previewVisible"
      :show-close="false"
      :close-on-click-modal="true"
      :modal-append-to-body="true"
      :append-to-body="true"
      class="preview-dialog"
    >
      <div class="preview-content" @click="previewVisible = false">
        <img :src="currentImage?.url" :alt="currentImage?.dish_name" class="preview-image" @click.stop />
        <div class="preview-actions">
          <el-button @click.stop="downloadCurrentImage" class="action-btn">
            <el-icon><Download /></el-icon>
            下载高清原图
          </el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Download, Delete } from '@element-plus/icons-vue'
import { getGalleryImages, deleteGalleryImage, type ImageItem } from '@/api/gallery'

const router = useRouter()

const activeTab = ref('all')
const loading = ref(false)
const allImages = ref<ImageItem[]>([])
const originalImages = ref<ImageItem[]>([])
const generatedImages = ref<ImageItem[]>([])

// 预览相关
const previewVisible = ref(false)
const currentImage = ref<ImageItem | null>(null)

// 根据 Tab 筛选图片
const displayImages = computed(() => {
  if (activeTab.value === 'original') return originalImages.value
  if (activeTab.value === 'generated') return generatedImages.value
  return allImages.value
})

// 加载图库数据
async function loadGallery() {
  loading.value = true
  try {
    const data = await getGalleryImages()
    allImages.value = [...data.original_images, ...data.generated_images]
    originalImages.value = data.original_images
    generatedImages.value = data.generated_images
  } catch (error) {
    console.error('Failed to load gallery:', error)
    ElMessage.error('加载图库失败')
  } finally {
    loading.value = false
  }
}

function goToMasterpiece() {
  router.push('/masterpiece')
}

function previewImage(img: ImageItem) {
  currentImage.value = img
  previewVisible.value = true
}

async function downloadCurrentImage() {
  if (!currentImage.value) return
  const url = currentImage.value.url
  const dishName = currentImage.value.dish_name || 'image'

  try {
    // 先 fetch 图片为 blob，绕过跨域限制
    const response = await fetch(url)
    const blob = await response.blob()
    const blobUrl = URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = blobUrl
    link.download = `${dishName}.jpg`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    // 释放 blob URL
    setTimeout(() => URL.revokeObjectURL(blobUrl), 100)
    ElMessage.success('下载成功')
  } catch {
    ElMessage.error('下载失败，请长按图片保存')
  }
}

async function deleteImage(img: ImageItem) {
  try {
    await ElMessageBox.confirm('确定删除这张图片？', '提示', {
      confirmButtonClass: 'delete-confirm-btn',
      cancelButtonClass: 'delete-cancel-btn',
      type: 'warning'
    })
    await deleteGalleryImage(img.id)
    // 从本地列表移除
    allImages.value = allImages.value.filter(i => i.id !== img.id)
    originalImages.value = originalImages.value.filter(i => i.id !== img.id)
    generatedImages.value = generatedImages.value.filter(i => i.id !== img.id)
    ElMessage.success('删除成功')
  } catch {
    // 用户取消
  }
}

onMounted(() => {
  loadGallery()
})
</script>

<style scoped>
.mobile-gallery {
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

.page-header h1 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.gallery-content {
  padding: 16px 20px;
  max-width: 480px;
  margin: 0 auto;
}

.gallery-tabs {
  background: var(--bg-surface);
  border-radius: 16px;
  padding: 16px;
}

.gallery-tabs :deep(.el-tabs__header) {
  margin-bottom: 16px;
}

.gallery-tabs :deep(.el-tabs__item) {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-secondary);
  padding: 0 12px;
}

.gallery-tabs :deep(.el-tabs__item.is-active) {
  color: var(--color-text-primary);
}

.gallery-tabs :deep(.el-tabs__active-bar) {
  background-color: var(--color-text-primary);
  height: 2px;
}

.gallery-tabs :deep(.el-tabs__nav-wrap::after) {
  display: none;
}

/* 2列布局，4:3比例 */
.image-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.image-item {
  aspect-ratio: 4 / 3;
  border-radius: 8px;
  overflow: hidden;
  background: var(--bg-hover);
  position: relative;
  cursor: pointer;
}

.image-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.2s ease;
}

.image-item:active img {
  transform: scale(0.98);
}

/* 右下角删除按钮 */
.delete-btn {
  position: absolute;
  bottom: 8px;
  right: 8px;
  width: 28px;
  height: 28px;
  background: rgba(0, 0, 0, 0.7);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--bg-surface);
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.image-item:active .delete-btn {
  opacity: 1;
}

.delete-btn .el-icon {
  font-size: 14px;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  background: var(--bg-surface);
  border-radius: 16px;
  margin-top: 16px;
}

.empty-icon {
  color: var(--color-text-placeholder);
  margin-bottom: 16px;
}

.empty-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0 0 4px;
}

.empty-hint {
  font-size: 14px;
  color: var(--color-text-secondary);
  margin: 0 0 20px;
}

.empty-btn {
  min-width: 100px;
  height: 40px;
  font-size: 14px;
  font-weight: 500;
  border-radius: 20px;
  background: var(--color-primary);
  border-color: var(--color-primary);
}

/* 预览弹窗 */
.preview-dialog {
  background: transparent !important;
}

.preview-dialog :deep(.el-dialog) {
  background: transparent !important;
  box-shadow: none !important;
  max-width: 96vw !important;
  max-height: 96vh !important;
  margin: 2vh auto !important;
}

.preview-dialog :deep(.el-dialog__header) {
  display: none;
}

.preview-dialog :deep(.el-dialog__body) {
  padding: 0 !important;
  background: transparent !important;
}

.preview-dialog :deep(.el-overlay) {
  background: rgba(0, 0, 0, 0.9) !important;
}

.preview-content {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
  cursor: pointer;
}

.preview-image {
  max-width: 92vw;
  max-height: 80vh;
  object-fit: contain;
  display: block;
  border-radius: 8px;
}

.preview-actions {
  margin-top: 20px;
}

.action-btn {
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: var(--bg-surface);
  min-width: 140px;
  height: 44px;
  border-radius: 22px;
  font-size: 14px;
  backdrop-filter: blur(10px);
}

.action-btn:hover {
  background: rgba(255, 255, 255, 0.25);
}

/* 删除确认框按钮样式 */
:deep(.delete-confirm-btn) {
  background: var(--color-primary) !important;
  border-color: var(--color-primary) !important;
  color: var(--bg-surface) !important;
}

:deep(.delete-cancel-btn) {
  background: var(--bg-surface) !important;
  border-color: var(--border-default) !important;
  color: var(--color-text-primary) !important;
}
</style>
