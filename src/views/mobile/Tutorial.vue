<template>
  <div class="tutorial-page">
    <header class="tutorial-header">
      <h1>使用教程</h1>
    </header>

    <main class="tutorial-content" v-if="content">
      <div class="markdown-body" v-html="renderedContent"></div>
    </main>

    <div class="loading-state" v-else-if="loading">
      <el-icon class="loading-icon" :size="32"><Loading /></el-icon>
      <p>加载中...</p>
    </div>

    <div class="error-state" v-else>
      <el-icon :size="48"><Warning /></el-icon>
      <p>教程内容加载失败</p>
      <el-button size="small" @click="fetchTutorial">重试</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { marked } from 'marked'
import { Loading, Warning } from '@element-plus/icons-vue'
import { getTutorial } from '@/api/config'

const content = ref('')
const loading = ref(true)

const renderedContent = ref('')

async function fetchTutorial() {
  loading.value = true
  try {
    // 优先从API获取教程内容
    const apiContent = await getTutorial()
    if (apiContent) {
      content.value = apiContent
      renderedContent.value = await marked.parse(content.value)
      return
    }

    // API没有内容时使用静态文件作为后备
    const response = await fetch('/tutorials/tutorial.md')
    if (response.ok) {
      content.value = await response.text()
      renderedContent.value = await marked.parse(content.value)
    }
  } catch (error) {
    console.error('Failed to load tutorial:', error)
    // 尝试加载静态文件
    try {
      const response = await fetch('/tutorials/tutorial.md')
      if (response.ok) {
        content.value = await response.text()
        renderedContent.value = await marked.parse(content.value)
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
  background: #fafbfc;
}

.tutorial-header {
  background: #ffffff;
  padding: 16px 20px;
  position: sticky;
  top: 0;
  z-index: 10;
  box-shadow: 0 1px 0 #f0f0f0;
}

.tutorial-header h1 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
  text-align: center;
}

.tutorial-content {
  padding: 24px 20px;
  max-width: 680px;
  margin: 0 auto;
}

.loading-state,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  color: #8c8c8c;
  gap: 12px;
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
  font-size: 14px;
}

/* Markdown 样式 */
.markdown-body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  font-size: 15px;
  line-height: 1.7;
  color: #333;
}

.markdown-body :deep(h1) {
  font-size: 24px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 24px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e6e6e6;
}

.markdown-body :deep(h2) {
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 32px 0 16px;
}

.markdown-body :deep(h3) {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 24px 0 12px;
}

.markdown-body :deep(p) {
  margin: 0 0 16px;
  color: #595959;
}

.markdown-body :deep(ul),
.markdown-body :deep(ol) {
  margin: 0 0 16px;
  padding-left: 24px;
}

.markdown-body :deep(li) {
  margin-bottom: 8px;
  color: #595959;
}

.markdown-body :deep(strong) {
  font-weight: 600;
  color: #1a1a1a;
}

.markdown-body :deep(code) {
  background: #f5f5f5;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'SF Mono', Monaco, 'Cascadia Code', monospace;
  font-size: 13px;
}

.markdown-body :deep(pre) {
  background: #f5f5f5;
  padding: 16px;
  border-radius: 8px;
  overflow-x: auto;
  margin: 0 0 16px;
}

.markdown-body :deep(pre code) {
  background: none;
  padding: 0;
}

.markdown-body :deep(blockquote) {
  margin: 0 0 16px;
  padding: 12px 16px;
  background: #fafafa;
  border-left: 4px solid #1a1a1a;
  color: #595959;
}

.markdown-body :deep(hr) {
  border: none;
  border-top: 1px solid #e6e6e6;
  margin: 24px 0;
}
</style>
