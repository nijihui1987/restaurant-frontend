<template>
  <div class="mobile-gallery">
    <header class="page-header">
      <h1>我的图库</h1>
    </header>

    <main class="gallery-content" v-loading="loading">
      <el-tabs v-model="activeTab" class="gallery-tabs" @tab-change="onTabChange">
        <el-tab-pane label="全部" name="all">
          <div class="image-list" v-if="displayImages.length > 0">
            <div class="image-item" v-for="img in displayedImages" :key="img.id">
              <img :src="img.url" :alt="img.dish_name" class="item-image" @click="previewImage(img)" />
              <div class="item-info">
                <span class="dish-name">{{ img.dish_name }}</span>
                <div class="item-actions">
                  <el-button size="small" @click.stop="downloadImage(img)">
                    <el-icon><Download /></el-icon>
                    保存
                  </el-button>
                  <el-button size="small" type="danger" @click.stop="deleteImage(img)">
                    <el-icon><Delete /></el-icon>
                    删除
                  </el-button>
                </div>
              </div>
            </div>
            <div class="load-more" v-if="hasMore" @click="loadMore">
              <span v-if="loadingMore">加载中...</span>
              <span v-else>加载更多</span>
            </div>
            <div class="no-more" v-else-if="displayImages.length > 0">
              没有更多了
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
          <div class="image-list" v-if="displayImages.length > 0">
            <div class="image-item" v-for="img in displayedImages" :key="img.id">
              <img :src="img.url" :alt="img.dish_name" class="item-image" @click="previewImage(img)" />
              <div class="item-info">
                <span class="dish-name">{{ img.dish_name }}</span>
                <div class="item-actions">
                  <el-button size="small" @click.stop="downloadImage(img)">
                    <el-icon><Download /></el-icon>
                    保存
                  </el-button>
                  <el-button size="small" type="danger" @click.stop="deleteImage(img)">
                    <el-icon><Delete /></el-icon>
                    删除
                  </el-button>
                </div>
              </div>
            </div>
            <div class="load-more" v-if="hasMore" @click="loadMore">
              <span v-if="loadingMore">加载中...</span>
              <span v-else>加载更多</span>
            </div>
            <div class="no-more" v-else-if="displayImages.length > 0">
              没有更多了
            </div>
          </div>
          <div class="empty-state" v-else-if="!loading">
            <p class="empty-title">暂无原图</p>
          </div>
        </el-tab-pane>
        <el-tab-pane label="生成图" name="generated">
          <div class="image-list" v-if="displayImages.length > 0">
            <div class="image-item" v-for="img in displayedImages" :key="img.id">
              <img :src="img.url" :alt="img.dish_name" class="item-image" @click="previewImage(img)" />
              <div class="item-info">
                <span class="dish-name">{{ img.dish_name }}</span>
                <div class="item-actions">
                  <el-button size="small" @click.stop="downloadImage(img)">
                    <el-icon><Download /></el-icon>
                    保存
                  </el-button>
                  <el-button size="small" type="danger" @click.stop="deleteImage(img)">
                    <el-icon><Delete /></el-icon>
                    删除
                  </el-button>
                </div>
              </div>
            </div>
            <div class="load-more" v-if="hasMore" @click="loadMore">
              <span v-if="loadingMore">加载中...</span>
              <span v-else>加载更多</span>
            </div>
            <div class="no-more" v-else-if="displayImages.length > 0">
              没有更多了
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

const PAGE_SIZE = 5

const activeTab = ref('all')
const loading = ref(false)
const loadingMore = ref(false)
const allImages = ref<ImageItem[]>([])
const originalImages = ref<ImageItem[]>([])
const generatedImages = ref<ImageItem[]>([])
const displayImages = ref<ImageItem[]>([])
const displayOriginal = ref<ImageItem[]>([])
const displayGenerated = ref<ImageItem[]>([])
const currentPage = ref(1)

// 预览相关
const previewVisible = ref(false)
const currentImage = ref<ImageItem | null>(null)

// 根据 Tab 获取当前显示的图片列表
function getCurrentDisplayList() {
  if (activeTab.value === 'original') return displayOriginal.value
  if (activeTab.value === 'generated') return displayGenerated.value
  return displayImages.value
}

// 根据 Tab 获取完整图片列表
function getFullList() {
  if (activeTab.value === 'original') return originalImages.value
  if (activeTab.value === 'generated') return generatedImages.value
  return allImages.value
}

// 计算当前显示的图片
const displayedImages = computed(() => {
  return getCurrentDisplayList()
})

// 是否有更多可加载
const hasMore = computed(() => {
  return getCurrentDisplayList().length < getFullList().length
})

// 加载图库数据
async function loadGallery() {
  loading.value = true
  try {
    const data = await getGalleryImages()
    // 按时间倒序，最新的在前
    allImages.value = [...data.original_images, ...data.generated_images].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
    originalImages.value = [...data.original_images].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
    generatedImages.value = [...data.generated_images].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
    // 重置并加载第一页
    currentPage.value = 1
    displayImages.value = allImages.value.slice(0, PAGE_SIZE)
    displayOriginal.value = originalImages.value.slice(0, PAGE_SIZE)
    displayGenerated.value = generatedImages.value.slice(0, PAGE_SIZE)
  } catch (error) {
    console.error('Failed to load gallery:', error)
    ElMessage.error('加载图库失败')
  } finally {
    loading.value = false
  }
}

// 加载更多
function loadMore() {
  if (loadingMore.value || !hasMore.value) return
  loadingMore.value = true
  currentPage.value++

  const fullList = getFullList()
  const currentList = getCurrentDisplayList()
  const start = (currentPage.value - 1) * PAGE_SIZE
  const end = start + PAGE_SIZE
  const newItems = fullList.slice(start, end)

  if (activeTab.value === 'original') {
    displayOriginal.value = [...displayOriginal.value, ...newItems]
  } else if (activeTab.value === 'generated') {
    displayGenerated.value = [...displayGenerated.value, ...newItems]
  } else {
    displayImages.value = [...displayImages.value, ...newItems]
  }

  loadingMore.value = false
}

// Tab 切换时重置
function onTabChange() {
  currentPage.value = 1
  if (activeTab.value === 'original') {
    displayOriginal.value = originalImages.value.slice(0, PAGE_SIZE)
  } else if (activeTab.value === 'generated') {
    displayGenerated.value = generatedImages.value.slice(0, PAGE_SIZE)
  } else {
    displayImages.value = allImages.value.slice(0, PAGE_SIZE)
  }
}

function goToMasterpiece() {
  router.push('/masterpiece')
}

function previewImage(img: ImageItem) {
  currentImage.value = img
  previewVisible.value = true
}

async function downloadImage(img: ImageItem) {
  const url = img.url
  const dishName = img.dish_name || 'image'

  try {
    const response = await fetch(url)
    const blob = await response.blob()
    const blobUrl = URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = blobUrl
    link.download = `${dishName}.jpg`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    setTimeout(() => URL.revokeObjectURL(blobUrl), 100)
    ElMessage.success('已保存')
  } catch {
    // 降级：直接打开图片，让用户手动保存
    window.location.href = url
  }
}

async function downloadCurrentImage() {
  if (!currentImage.value) return
  const url = currentImage.value.url
  const dishName = currentImage.value.dish_name || 'image'

  try {
    const response = await fetch(url)
    const blob = await response.blob()
    const blobUrl = URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = blobUrl
    link.download = `${dishName}.jpg`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    setTimeout(() => URL.revokeObjectURL(blobUrl), 100)
    ElMessage.success('已保存')
  } catch {
    window.location.href = url
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
    displayImages.value = displayImages.value.filter(i => i.id !== img.id)
    displayOriginal.value = displayOriginal.value.filter(i => i.id !== img.id)
    displayGenerated.value = displayGenerated.value.filter(i => i.id !== img.id)
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
  padding: var(--space-lg) var(--space-xl);
  display: flex;
  align-items: center;
  gap: var(--space-lg);
  position: sticky;
  top: 0;
  z-index: 10;
  border-bottom: 1px solid var(--border-light);
}

.page-header h1 {
  margin: 0;
  font-size: var(--font-size-xl);
  font-weight: 700;
  color: var(--color-text-primary);
  letter-spacing: -0.02em;
}

.gallery-content {
  padding: var(--space-lg) var(--space-xl);
  max-width: 480px;
  margin: 0 auto;
}

.gallery-tabs {
  background: var(--bg-surface);
  border-radius: var(--radius-xl);
  padding: var(--space-lg);
  border: 1px solid var(--border-light);
}

.gallery-tabs :deep(.el-tabs__header) {
  margin-bottom: var(--space-lg);
}

.gallery-tabs :deep(.el-tabs__item) {
  font-size: var(--font-size-base);
  font-weight: 500;
  color: var(--color-text-secondary);
  padding: 0 var(--space-md);
}

.gallery-tabs :deep(.el-tabs__item.is-active) {
  color: var(--color-accent);
}

.gallery-tabs :deep(.el-tabs__active-bar) {
  background-color: var(--color-accent);
  height: 2px;
}

.gallery-tabs :deep(.el-tabs__nav-wrap::after) {
  display: none;
}

/* 单列图片列表 */
.image-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}

.image-item {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  overflow: hidden;
  border: 1px solid var(--border-light);
  transition: all var(--transition-normal);
}

.image-item:hover {
  border-color: var(--border-default);
  box-shadow: var(--shadow-md);
}

.item-image {
  width: 100%;
  aspect-ratio: 4 / 3;
  object-fit: cover;
  display: block;
}

.item-info {
  padding: var(--space-lg);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-md);
}

.dish-name {
  font-size: var(--font-size-base);
  font-weight: 500;
  color: var(--color-text-primary);
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-actions {
  display: flex;
  gap: var(--space-sm);
  flex-shrink: 0;
}

.item-actions .el-button {
  height: 32px;
  font-size: var(--font-size-sm);
  padding: 0 var(--space-md);
}

.load-more {
  text-align: center;
  padding: var(--space-xl);
  color: var(--color-accent);
  font-size: var(--font-size-sm);
  font-weight: 500;
  cursor: pointer;
  background: var(--bg-surface);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-light);
  transition: all var(--transition-fast);
}

.load-more:hover {
  background: var(--bg-hover);
  border-color: var(--border-default);
}

.no-more {
  text-align: center;
  padding: var(--space-xl);
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

.empty-state {
  text-align: center;
  padding: var(--space-4xl) var(--space-xl);
  background: var(--bg-surface);
  border-radius: var(--radius-xl);
  margin-top: var(--space-lg);
  border: 1px solid var(--border-light);
}

.empty-icon {
  color: var(--color-text-secondary);
  margin-bottom: var(--space-xl);
  opacity: 0.5;
}

.empty-title {
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0 0 var(--space-sm);
}

.empty-hint {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin: 0 0 var(--space-xl);
}

.empty-btn {
  min-width: 120px;
  height: 44px;
  font-size: var(--font-size-sm);
  font-weight: 600;
  border-radius: var(--radius-full);
  background: var(--color-accent);
  border-color: var(--color-accent);
  color: #0a0a0a;
  letter-spacing: 0.02em;
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
  background: rgba(0, 0, 0, 0.95) !important;
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
  border-radius: var(--radius-lg);
}

.preview-actions {
  margin-top: var(--space-2xl);
}

.action-btn {
  background: rgba(196, 149, 106, 0.2);
  border: 1px solid rgba(196, 149, 106, 0.4);
  color: var(--color-accent);
  min-width: 160px;
  height: 48px;
  border-radius: var(--radius-full);
  font-size: var(--font-size-sm);
  font-weight: 600;
  backdrop-filter: blur(12px);
  transition: all var(--transition-fast);
}

.action-btn:hover {
  background: rgba(196, 149, 106, 0.3);
  border-color: var(--color-accent);
  transform: translateY(-2px);
}

/* 删除确认框按钮样式 */
:deep(.delete-confirm-btn) {
  background: var(--color-danger) !important;
  border-color: var(--color-danger) !important;
  color: #fff !important;
}

:deep(.delete-cancel-btn) {
  background: var(--bg-surface) !important;
  border-color: var(--border-default) !important;
  color: var(--color-text-primary) !important;
}
</style>
