<template>
  <div class="gallery-page">
    <header class="page-header">
      <h1>图库管理</h1>
    </header>

    <main class="page-content">
      <el-tabs v-model="activeTab" class="gallery-tabs">
        <el-tab-pane label="全部" name="all">
          <div class="image-grid" v-if="displayImages.length > 0">
            <div class="image-item" v-for="img in displayImages" :key="img.id">
              <img :src="img.url" :alt="img.dish_name" @click="previewImage(img)" />
              <div class="image-info">
                <span class="dish-name">{{ img.dish_name }}</span>
              </div>
              <div class="image-actions">
                <el-button size="small" @click.stop="downloadImage(img)">
                  <el-icon><Download /></el-icon>
                  下载
                </el-button>
                <el-button size="small" type="danger" @click.stop="deleteImage(img)">
                  <el-icon><Delete /></el-icon>
                  删除
                </el-button>
              </div>
            </div>
          </div>
          <div class="empty-state" v-else>
            <el-empty description="暂无图片">
              <el-button type="primary" @click="goToMasterpiece">去制作</el-button>
            </el-empty>
          </div>
        </el-tab-pane>
        <el-tab-pane label="原图" name="original">
          <div class="image-grid" v-if="displayImages.length > 0">
            <div class="image-item" v-for="img in displayImages" :key="img.id">
              <img :src="img.url" :alt="img.dish_name" @click="previewImage(img)" />
              <div class="image-info">
                <span class="dish-name">{{ img.dish_name }}</span>
              </div>
              <div class="image-actions">
                <el-button size="small" @click.stop="downloadImage(img)">
                  <el-icon><Download /></el-icon>
                  下载
                </el-button>
                <el-button size="small" type="danger" @click.stop="deleteImage(img)">
                  <el-icon><Delete /></el-icon>
                  删除
                </el-button>
              </div>
            </div>
          </div>
          <div class="empty-state" v-else>
            <el-empty description="暂无原图" />
          </div>
        </el-tab-pane>
        <el-tab-pane label="生成图" name="generated">
          <div class="image-grid" v-if="displayImages.length > 0">
            <div class="image-item" v-for="img in displayImages" :key="img.id">
              <img :src="img.url" :alt="img.dish_name" @click="previewImage(img)" />
              <div class="image-info">
                <span class="dish-name">{{ img.dish_name }}</span>
              </div>
              <div class="image-actions">
                <el-button size="small" @click.stop="downloadImage(img)">
                  <el-icon><Download /></el-icon>
                  下载
                </el-button>
                <el-button size="small" type="danger" @click.stop="deleteImage(img)">
                  <el-icon><Delete /></el-icon>
                  删除
                </el-button>
              </div>
            </div>
          </div>
          <div class="empty-state" v-else>
            <el-empty description="暂无生成图" />
          </div>
        </el-tab-pane>
      </el-tabs>
    </main>

    <!-- 图片预览弹窗 -->
    <el-dialog
      v-model="previewVisible"
      :show-close="false"
      :close-on-click-modal="true"
      class="preview-dialog"
    >
      <div class="preview-container" @click="previewVisible = false">
        <img :src="currentImage?.url" :alt="currentImage?.dish_name" class="preview-image" />
      </div>
      <div class="preview-footer">
        <span class="preview-dish-name">{{ currentImage?.dish_name }}</span>
        <div class="preview-actions">
          <el-button type="primary" @click="downloadCurrentImage">
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

function downloadImage(img: ImageItem) {
  window.open(img.url, '_blank')
  ElMessage.success('下载成功')
}

function downloadCurrentImage() {
  if (!currentImage.value) return
  window.open(currentImage.value.url, '_blank')
  ElMessage.success('下载成功')
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
.gallery-page {
  max-width: 900px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: var(--space-xl);
}

.page-header h1 {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0;
}

.page-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-xl);
}

.gallery-tabs {
  background: var(--color-bg-surface);
  border-radius: var(--radius-lg);
  padding: var(--space-xl);
}

.gallery-tabs :deep(.el-tabs__header) {
  margin-bottom: var(--space-lg);
}

.gallery-tabs :deep(.el-tabs__item) {
  font-size: var(--font-size-base);
  font-weight: 500;
  color: var(--color-text-secondary);
  padding: 0 16px;
}

.gallery-tabs :deep(.el-tabs__item.is-active) {
  color: var(--color-primary);
}

.gallery-tabs :deep(.el-tabs__active-bar) {
  background-color: var(--color-primary);
  height: 2px;
}

/* 2列布局，4:3比例 */
.image-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.image-item {
  aspect-ratio: 4 / 3;
  border-radius: var(--radius-md);
  overflow: hidden;
  background: var(--color-bg-hover);
  position: relative;
  cursor: pointer;
}

.image-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.2s ease;
}

.image-item:hover img {
  transform: scale(1.02);
}

.image-info {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 8px 12px;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.6));
  color: #ffffff;
}

.dish-name {
  font-size: var(--font-size-sm);
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: block;
}

.image-actions {
  position: absolute;
  top: 8px;
  right: 8px;
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.image-item:hover .image-actions {
  opacity: 1;
}

.image-actions .el-button {
  min-width: 60px;
  height: 28px;
  padding: 0 8px;
  font-size: var(--font-size-xs);
  background: rgba(255, 255, 255, 0.9);
  border: none;
  color: var(--color-text-primary);
}

.image-actions .el-button:hover {
  background: #ffffff;
}

.image-actions .el-button--danger {
  background: rgba(245, 34, 45, 0.9);
  color: #ffffff;
}

.image-actions .el-button--danger:hover {
  background: #f5222d;
}

/* 空状态 */
.empty-state {
  padding: var(--space-3xl);
  background: var(--color-bg-surface);
  border-radius: var(--radius-lg);
}

/* 预览弹窗 */
.preview-dialog :deep(.el-dialog) {
  background: transparent;
  box-shadow: none;
  max-width: 90%;
  padding: 0;
}

.preview-dialog :deep(.el-dialog__header) {
  display: none;
}

.preview-dialog :deep(.el-dialog__body) {
  padding: 0;
}

.preview-container {
  width: 80vw;
  max-height: 80vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.9);
  border-radius: var(--radius-lg);
  cursor: pointer;
}

.preview-image {
  max-width: 100%;
  max-height: 80vh;
  object-fit: contain;
}

.preview-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 16px 24px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 10;
}

.preview-dish-name {
  font-size: var(--font-size-base);
  font-weight: 500;
  color: var(--color-text-primary);
}

.preview-actions .el-button {
  min-width: 120px;
}

/* 删除确认框按钮样式 */
:deep(.delete-confirm-btn) {
  background: #1a1a1a !important;
  border-color: #1a1a1a !important;
  color: #ffffff !important;
}

:deep(.delete-cancel-btn) {
  background: #ffffff !important;
  border-color: #d9d9d9 !important;
  color: #1a1a1a !important;
}
</style>
