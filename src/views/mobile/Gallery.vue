<template>
  <div class="mobile-gallery">
    <header class="page-header">
      <h1>我的图库</h1>
    </header>

    <main class="gallery-content">
      <el-tabs v-model="activeTab" class="gallery-tabs">
        <el-tab-pane label="全部" name="all">
          <div class="image-grid" v-if="allImages.length > 0">
            <div class="image-item" v-for="img in allImages" :key="img.id">
              <img :src="img.url" :alt="img.name" @click="previewImage(img)" />
              <div class="image-overlay">
                <el-button size="small" @click.stop="downloadImage(img)">
                  <el-icon><Download /></el-icon>
                </el-button>
                <el-button size="small" type="danger" @click.stop="deleteImage(img)">
                  <el-icon><Delete /></el-icon>
                </el-button>
              </div>
            </div>
          </div>
        </el-tab-pane>
        <el-tab-pane label="原图" name="original">
          <div class="image-grid" v-if="originalImages.length > 0">
            <div class="image-item" v-for="img in originalImages" :key="img.id">
              <img :src="img.url" :alt="img.name" />
            </div>
          </div>
        </el-tab-pane>
        <el-tab-pane label="生成图" name="generated">
          <div class="image-grid" v-if="generatedImages.length > 0">
            <div class="image-item" v-for="img in generatedImages" :key="img.id">
              <img :src="img.url" :alt="img.name" />
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>

      <div class="empty-state" v-if="allImages.length === 0">
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
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Download, Delete } from '@element-plus/icons-vue'

const router = useRouter()

const activeTab = ref('all')

interface GalleryImage {
  id: number
  name: string
  url: string
  type: 'original' | 'generated'
}

const allImages = ref<GalleryImage[]>([])
const originalImages = ref<GalleryImage[]>([])
const generatedImages = ref<GalleryImage[]>([])

function goToMasterpiece() {
  router.push('/masterpiece')
}

function previewImage(_img: GalleryImage) {
  console.log('preview', _img)
}

function downloadImage(_img: GalleryImage) {
  ElMessage.success('下载成功')
}

async function deleteImage(img: GalleryImage) {
  try {
    await ElMessageBox.confirm('确定删除这张图片？', '提示', { type: 'warning' })
    allImages.value = allImages.value.filter(i => i.id !== img.id)
    ElMessage.success('删除成功')
  } catch {
    // 用户取消
  }
}
</script>

<style scoped>
.mobile-gallery {
  min-height: 100vh;
  background: #fafbfc;
}

.page-header {
  background: #ffffff;
  padding: 16px 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  position: sticky;
  top: 0;
  z-index: 10;
  box-shadow: 0 1px 0 #f0f0f0;
}

.back-btn {
  background: none;
  border: none;
  padding: 4px;
  cursor: pointer;
  color: #1a1a1a;
  display: flex;
  align-items: center;
  justify-content: center;
}

.page-header h1 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
}

.gallery-content {
  padding: 16px 20px;
  max-width: 480px;
  margin: 0 auto;
}

.gallery-tabs {
  background: #ffffff;
  border-radius: 16px;
  padding: 16px;
}

.gallery-tabs :deep(.el-tabs__header) {
  margin-bottom: 16px;
}

.gallery-tabs :deep(.el-tabs__item) {
  font-size: 14px;
  font-weight: 500;
  color: #8c8c8c;
  padding: 0 12px;
}

.gallery-tabs :deep(.el-tabs__item.is-active) {
  color: #1a1a1a;
}

.gallery-tabs :deep(.el-tabs__active-bar) {
  background-color: #1a1a1a;
  height: 2px;
}

.gallery-tabs :deep(.el-tabs__nav-wrap::after) {
  display: none;
}

.image-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
}

.image-item {
  aspect-ratio: 1;
  border-radius: 8px;
  overflow: hidden;
  background: #f5f5f5;
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

.image-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.5));
  display: flex;
  justify-content: center;
  gap: 8px;
  padding: 16px 8px 8px;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.image-item:hover .image-overlay {
  opacity: 1;
}

.image-overlay .el-button {
  min-width: 32px;
  height: 28px;
  padding: 0 8px;
}

.image-overlay .el-icon {
  font-size: 14px;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  background: #ffffff;
  border-radius: 16px;
  margin-top: 16px;
}

.empty-icon {
  color: #d9d9d9;
  margin-bottom: 16px;
}

.empty-title {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 4px;
}

.empty-hint {
  font-size: 14px;
  color: #8c8c8c;
  margin: 0 0 20px;
}

.empty-btn {
  min-width: 100px;
  height: 40px;
  font-size: 14px;
  font-weight: 500;
  border-radius: 20px;
  background: #1a1a1a;
  border-color: #1a1a1a;
}
</style>
