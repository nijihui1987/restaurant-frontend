<template>
  <div class="tutorial-page">
    <main class="tutorial-content" v-if="content">
      <div class="markdown-body" v-html="renderedContent"></div>
    </main>

    <div class="loading-state" v-else-if="loading">
      <el-icon class="loading-icon" :size="32"><Loading /></el-icon>
      <p>加载中...</p>
    </div>

    <div class="empty-state" v-else-if="isEmpty">
      <el-icon :size="48"><Document /></el-icon>
      <p class="empty-title">教程内容待配置</p>
      <p class="empty-desc">请联系管理员在后台配置使用教程内容</p>
    </div>

    <div class="error-state" v-else>
      <el-icon :size="48"><Warning /></el-icon>
      <p>教程内容加载失败</p>
      <el-button size="small" @click="fetchTutorial">重试</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { marked } from 'marked'
import { Loading, Warning, Document } from '@element-plus/icons-vue'
import { getTutorial } from '@/api/config'

const content = ref('')
const loading = ref(true)
const loadError = ref(false)

const renderedContent = ref('')

const isEmpty = computed(() => !content.value && !loading.value && !loadError.value)

async function fetchTutorial() {
  loading.value = true
  loadError.value = false
  try {
    // 优先从API获取教程内容
    const apiContent = await getTutorial()
    if (apiContent && apiContent.trim()) {
      content.value = apiContent
      renderedContent.value = await marked.parse(content.value)
      return
    }

    // API没有内容时使用静态文件作为后备
    const response = await fetch('/tutorials/tutorial.md')
    if (response.ok) {
      const text = await response.text()
      if (text && text.trim()) {
        content.value = text
        renderedContent.value = await marked.parse(content.value)
        return
      }
    }

    // 内容和静态文件都为空
    content.value = ''
  } catch (error) {
    console.error('Failed to load tutorial:', error)
    loadError.value = true
    // 尝试加载静态文件作为后备
    try {
      const response = await fetch('/tutorials/tutorial.md')
      if (response.ok) {
        const text = await response.text()
        if (text && text.trim()) {
          content.value = text
          renderedContent.value = await marked.parse(content.value)
          loadError.value = false
          return
        }
      }
    } catch (e) {
      console.error('Failed to load static tutorial:', e)
    }
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchTutorial()
})
</script>

<style scoped>
.tutorial-page {
  min-height: 100vh;
  background: var(--bg-page);
  padding-top: 16px;
}

.tutorial-content {
  padding: 0 var(--space-xl) var(--space-2xl);
  max-width: 680px;
  margin: 0 auto;
}

.loading-state,
.error-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px var(--space-xl);
  color: var(--color-text-secondary);
  gap: var(--space-md);
}

.empty-state {
  color: var(--color-text-regular);
}

.empty-title {
  margin: 0;
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--color-text-primary);
}

.empty-desc {
  margin: 0;
  font-size: var(--font-size-base);
  color: var(--color-text-secondary);
}

.loading-icon {
  animation: rotate 1s linear infinite;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.error-state p {
  margin: 0;
  font-size: var(--font-size-base);
}

/* Markdown 样式 */
.markdown-body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  font-size: var(--font-size-md);
  line-height: 1.7;
  color: var(--color-text-regular);
}

.markdown-body :deep(h1) {
  font-size: var(--font-size-3xl);
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0 0 var(--space-2xl);
  padding-bottom: var(--space-md);
  border-bottom: 1px solid var(--border-light);
}

.markdown-body :deep(h2) {
  font-size: var(--font-size-2xl);
  font-weight: 600;
  color: var(--color-text-primary);
  margin: var(--space-3xl) 0 var(--space-lg);
}

.markdown-body :deep(h3) {
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--color-text-primary);
  margin: var(--space-2xl) 0 var(--space-md);
}

.markdown-body :deep(p) {
  margin: 0 0 var(--space-lg);
  color: var(--color-text-regular);
}

.markdown-body :deep(ul),
.markdown-body :deep(ol) {
  margin: 0 0 16px;
  padding-left: 24px;
}

.markdown-body :deep(li) {
  margin-bottom: 8px;
  color: var(--color-text-regular);
}

.markdown-body :deep(strong) {
  font-weight: 600;
  color: var(--color-text-primary);
}

.markdown-body :deep(code) {
  background: var(--bg-hover);
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'SF Mono', Monaco, 'Cascadia Code', monospace;
  font-size: 13px;
}

.markdown-body :deep(pre) {
  background: var(--bg-hover);
  padding: var(--space-lg);
  border-radius: var(--radius-md);
  overflow-x: auto;
  margin: 0 0 var(--space-lg);
}

.markdown-body :deep(pre code) {
  background: none;
  padding: 0;
}

.markdown-body :deep(blockquote) {
  margin: 0 0 var(--space-lg);
  padding: var(--space-md) var(--space-lg);
  background: var(--bg-page);
  border-left: 4px solid var(--color-primary);
  color: var(--color-text-regular);
}

.markdown-body :deep(hr) {
  border: none;
  border-top: 1px solid var(--border-light);
  margin: var(--space-2xl) 0;
}
</style>
