<template>
  <div class="masterpiece-queue">
    <header class="page-header">
      <button class="back-btn" @click="goBack">
        <el-icon :size="24"><ArrowLeft /></el-icon>
      </button>
      <h1>备菜队列</h1>
    </header>

    <main class="queue-content">
      <el-tabs v-model="activeTab" class="queue-tabs">
        <el-tab-pane label="生成中" name="generating">
          <div class="task-list">
            <div class="task-item" v-for="task in generatingTasks" :key="task.id">
              <div class="task-header">
                <span class="task-name">{{ task.dish_name }}</span>
                <span class="status-badge generating">{{ getStatusText(task.status) }}</span>
              </div>
              <p class="task-time">{{ formatTime(task.created_at) }}</p>
              <div class="task-progress">
                <div class="progress-bar">
                  <div class="progress-fill"></div>
                </div>
                <p class="progress-text">AI 正在为您生成专业菜品图...</p>
              </div>
            </div>
            <div class="empty-state" v-if="generatingTasks.length === 0">
              <div class="empty-icon">
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                  <circle cx="24" cy="24" r="20" stroke="currentColor" stroke-width="1.5"/>
                  <path d="M24 14V24L30 30" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                </svg>
              </div>
              <p>暂无正在生成的任务</p>
            </div>
          </div>
        </el-tab-pane>

        <el-tab-pane label="待选择" name="pending">
          <div class="task-list">
            <div class="task-item" v-for="task in pendingTasks" :key="task.id">
              <div class="task-header">
                <span class="task-name">{{ task.dish_name }}</span>
                <span class="status-badge pending">{{ getStatusText(task.status) }}</span>
              </div>
              <p class="task-time">{{ formatTime(task.created_at) }}</p>
              <div class="task-images">
                <div
                  class="selectable-image"
                  v-for="(img, idx) in task.generated_images"
                  :key="idx"
                  :class="{ selected: isImageSelected(task, idx) }"
                  @click="toggleImage(task, idx)"
                >
                  <img :src="typeof img === 'string' ? img : (img.url || '')" alt="生成图片" />
                  <div class="select-indicator" v-if="isImageSelected(task, idx)">
                    <el-icon :size="16"><Check /></el-icon>
                  </div>
                </div>
              </div>
              <div class="task-actions">
                <el-button
                  type="primary"
                  size="small"
                  :disabled="task.selected_images.length === 0"
                  @click="submitToHD(task)"
                  class="action-btn"
                >
                  高清出餐 ({{ task.selected_images.length }})
                </el-button>
              </div>
            </div>
            <div class="empty-state" v-if="pendingTasks.length === 0">
              <div class="empty-icon">
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                  <rect x="8" y="8" width="32" height="32" rx="4" stroke="currentColor" stroke-width="1.5"/>
                  <path d="M18 24L22 28L30 20" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <p>暂无待选择的任务</p>
            </div>
          </div>
        </el-tab-pane>

        <el-tab-pane label="已完成" name="done">
          <div class="task-list">
            <div class="task-item done" v-for="task in doneTasks" :key="task.id">
              <div class="task-header">
                <span class="task-name">{{ task.dish_name }}</span>
                <span class="status-badge done">{{ getStatusText(task.status) }}</span>
              </div>
              <p class="task-time" v-if="task.completed_at">{{ formatTime(task.completed_at) }}</p>
              <div class="task-images done-images">
                <img v-for="(img, idx) in task.hd_images" :key="idx" :src="img" alt="完成图片" />
              </div>
            </div>
            <div class="empty-state" v-if="doneTasks.length === 0">
              <div class="empty-icon">
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                  <rect x="6" y="10" width="36" height="28" rx="3" stroke="currentColor" stroke-width="1.5"/>
                  <path d="M6 18H42" stroke="currentColor" stroke-width="1.5"/>
                  <circle cx="14" cy="14" r="2" fill="currentColor"/>
                  <circle cx="20" cy="14" r="2" fill="currentColor"/>
                </svg>
              </div>
              <p>暂无已完成的任务</p>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft, Check } from '@element-plus/icons-vue'
import {
  type MasterpieceTask,
  type MasterpieceTaskStatus
} from '@/api/masterpiece'

const router = useRouter()

const activeTab = ref('generating')
const tasks = ref<MasterpieceTask[]>([])
let pollTimer: ReturnType<typeof setInterval> | null = null

const generatingTasks = computed(() =>
  tasks.value.filter(t => ['pending', 'recognizing', 'matching', 'generating'].includes(t.status))
)

const pendingTasks = computed(() =>
  tasks.value.filter(t => t.status === 'pending_select')
)

const doneTasks = computed(() =>
  tasks.value.filter(t => ['done', 'pending_audit', 'enhancing'].includes(t.status))
)

onMounted(async () => {
  await fetchTasks()
  pollTimer = setInterval(fetchTasks, 3000)
})

onUnmounted(() => {
  if (pollTimer) {
    clearInterval(pollTimer)
  }
})

async function fetchTasks() {
  try {
    // TODO: 后端实现后替换为真实 API
    // tasks.value = await getMasterpieceTasks()
  } catch (error) {
    console.error('获取任务列表失败', error)
  }
}

function goBack() {
  router.back()
}

function toggleImage(task: MasterpieceTask, index: number) {
  const key = String(index)
  const idx = task.selected_images.indexOf(key)
  if (idx > -1) {
    task.selected_images.splice(idx, 1)
  } else {
    task.selected_images.push(key)
  }
}

function isImageSelected(task: MasterpieceTask, index: number): boolean {
  return task.selected_images.includes(String(index))
}

async function submitToHD(task: MasterpieceTask) {
  if (task.selected_images.length === 0) {
    ElMessage.warning('请选择至少一张图片')
    return
  }

  try {
    ElMessage.success('已提交高清处理')
    await fetchTasks()
  } catch (error) {
    ElMessage.error('提交失败，请重试')
  }
}

function formatTime(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diff < 60) return '刚刚'
  if (diff < 3600) return `${Math.floor(diff / 60)}分钟前`
  if (diff < 86400) return `${Math.floor(diff / 3600)}小时前`
  return `${Math.floor(diff / 86400)}天前`
}

function getStatusText(status: MasterpieceTaskStatus): string {
  const map: Record<MasterpieceTaskStatus, string> = {
    pending: '等待中',
    recognizing: 'AI 识别中',
    matching: '背景匹配中',
    generating: '图片生成中',
    pending_select: '待选择',
    pending_consume: '待消费',
    enhancing: '高清处理中',
    pending_audit: '审核中',
    done: '已完成',
    failed: '失败'
  }
  return map[status] || status
}
</script>

<style scoped>
.masterpiece-queue {
  min-height: 100vh;
  background: var(--bg-page);
}

.page-header {
  background: var(--bg-surface);
  padding: var(--space-md) var(--space-xl);
  display: flex;
  align-items: center;
  gap: var(--space-md);
  position: sticky;
  top: 0;
  z-index: 10;
  border-bottom: 1px solid var(--border-light);
}

.back-btn {
  background: none;
  border: none;
  padding: var(--space-sm);
  cursor: pointer;
  color: var(--color-text-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-md);
  transition: background var(--transition-fast);
}

.back-btn:hover {
  background: var(--bg-hover);
}

.page-header h1 {
  margin: 0;
  font-size: var(--font-size-lg);
  font-weight: 700;
  color: var(--color-text-primary);
  letter-spacing: -0.02em;
}

.queue-content {
  padding: var(--space-lg) var(--space-xl);
  max-width: 480px;
  margin: 0 auto;
}

.queue-tabs {
  background: var(--bg-surface);
  border-radius: var(--radius-xl);
  padding: var(--space-lg);
  border: 1px solid var(--border-light);
}

.queue-tabs :deep(.el-tabs__header) {
  margin-bottom: var(--space-lg);
}

.queue-tabs :deep(.el-tabs__item) {
  font-size: var(--font-size-sm);
  font-weight: 500;
  color: var(--color-text-secondary);
  padding: 0 var(--space-md);
}

.queue-tabs :deep(.el-tabs__item.is-active) {
  color: var(--color-accent);
}

.queue-tabs :deep(.el-tabs__active-bar) {
  background-color: var(--color-accent);
  height: 2px;
}

.queue-tabs :deep(.el-tabs__nav-wrap::after) {
  display: none;
}

.task-list {
  min-height: 200px;
}

.task-item {
  padding: var(--space-lg);
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  margin-bottom: var(--space-md);
  border: 1px solid var(--border-light);
}

.task-item:last-child {
  margin-bottom: 0;
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-sm);
}

.task-name {
  font-size: var(--font-size-base);
  font-weight: 600;
  color: var(--color-text-primary);
}

.task-time {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  margin: 0 0 var(--space-md);
}

.status-badge {
  font-size: var(--font-size-xs);
  font-weight: 600;
  padding: var(--space-xs) var(--space-sm);
  border-radius: var(--radius-full);
  letter-spacing: 0.02em;
}

.status-badge.generating {
  background: var(--bg-hover);
  color: var(--color-text-secondary);
}

.status-badge.pending {
  background: rgba(196, 149, 106, 0.15);
  color: var(--color-accent);
}

.status-badge.done {
  background: rgba(82, 196, 26, 0.15);
  color: var(--color-success);
}

.task-progress {
  margin-top: var(--space-md);
}

.progress-bar {
  height: 3px;
  background: var(--border-light);
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: var(--space-sm);
}

.progress-fill {
  width: 60%;
  height: 100%;
  background: linear-gradient(90deg, var(--color-accent) 0%, var(--color-accent-dark) 100%);
  border-radius: 2px;
  animation: progress 2s ease-in-out infinite;
}

@keyframes progress {
  0% { width: 30%; }
  50% { width: 70%; }
  100% { width: 30%; }
}

.progress-text {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  margin: 0;
  text-align: center;
}

.task-images {
  display: flex;
  gap: var(--space-sm);
  overflow-x: auto;
  padding-bottom: var(--space-sm);
  margin: 0 -4px;
  padding: 4px;
}

.selectable-image {
  width: 76px;
  height: 76px;
  flex-shrink: 0;
  border-radius: var(--radius-md);
  overflow: hidden;
  cursor: pointer;
  position: relative;
  border: 2px solid transparent;
  transition: all var(--transition-fast);
}

.selectable-image.selected {
  border-color: var(--color-accent);
  box-shadow: 0 0 0 2px rgba(196, 149, 106, 0.3);
}

.selectable-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.select-indicator {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 20px;
  height: 20px;
  background: var(--color-accent);
  color: #0a0a0a;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.task-actions {
  margin-top: var(--space-lg);
  text-align: center;
}

.action-btn {
  height: 40px;
  font-size: var(--font-size-sm);
  font-weight: 600;
  border-radius: var(--radius-full);
  background: var(--color-accent);
  border-color: var(--color-accent);
  color: #0a0a0a;
  padding: 0 var(--space-xl);
  letter-spacing: 0.02em;
}

.action-btn:disabled {
  background: var(--bg-hover);
  border-color: var(--border-default);
  color: var(--color-text-secondary);
}

.done-images {
  display: flex;
  gap: var(--space-sm);
  overflow-x: auto;
}

.done-images img {
  width: 88px;
  height: 88px;
  object-fit: cover;
  border-radius: var(--radius-md);
}

.empty-state {
  text-align: center;
  padding: var(--space-4xl) 0;
  color: var(--color-text-secondary);
}

.empty-icon {
  margin-bottom: var(--space-lg);
  opacity: 0.5;
}

.empty-state p {
  font-size: var(--font-size-sm);
  margin: 0;
}
</style>
