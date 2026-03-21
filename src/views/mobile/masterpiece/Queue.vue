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
                  :class="{ selected: task.selected_images.includes(idx) }"
                  @click="toggleImage(task, idx)"
                >
                  <img :src="img" alt="生成图片" />
                  <div class="select-indicator" v-if="task.selected_images.includes(idx)">
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
  const idx = task.selected_images.indexOf(index)
  if (idx > -1) {
    task.selected_images.splice(idx, 1)
  } else {
    task.selected_images.push(index)
  }
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

.queue-content {
  padding: 16px 20px;
  max-width: 480px;
  margin: 0 auto;
}

.queue-tabs {
  background: #ffffff;
  border-radius: 16px;
  padding: 16px;
}

.queue-tabs :deep(.el-tabs__header) {
  margin-bottom: 16px;
}

.queue-tabs :deep(.el-tabs__item) {
  font-size: 15px;
  font-weight: 500;
  color: #8c8c8c;
  padding: 0 12px;
}

.queue-tabs :deep(.el-tabs__item.is-active) {
  color: #1a1a1a;
}

.queue-tabs :deep(.el-tabs__active-bar) {
  background-color: #1a1a1a;
  height: 2px;
}

.queue-tabs :deep(.el-tabs__nav-wrap::after) {
  display: none;
}

.task-list {
  min-height: 200px;
}

.task-item {
  padding: 16px;
  background: #fafbfc;
  border-radius: 12px;
  margin-bottom: 12px;
}

.task-item:last-child {
  margin-bottom: 0;
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.task-name {
  font-size: 15px;
  font-weight: 600;
  color: #1a1a1a;
}

.task-time {
  font-size: 12px;
  color: #8c8c8c;
  margin: 0 0 12px;
}

.status-badge {
  font-size: 12px;
  font-weight: 500;
  padding: 3px 10px;
  border-radius: 12px;
}

.status-badge.generating {
  background: #f0f0f0;
  color: #595959;
}

.status-badge.pending {
  background: #fff7e6;
  color: #d48806;
}

.status-badge.done {
  background: #f6ffed;
  color: #52c41a;
}

.task-progress {
  margin-top: 12px;
}

.progress-bar {
  height: 4px;
  background: #e6e6e6;
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 8px;
}

.progress-fill {
  width: 60%;
  height: 100%;
  background: linear-gradient(90deg, #1a1a1a 0%, #595959 100%);
  border-radius: 2px;
  animation: progress 2s ease-in-out infinite;
}

@keyframes progress {
  0% { width: 30%; }
  50% { width: 70%; }
  100% { width: 30%; }
}

.progress-text {
  font-size: 13px;
  color: #8c8c8c;
  margin: 0;
  text-align: center;
}

.task-images {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 8px;
  margin: 0 -4px;
  padding: 4px;
}

.selectable-image {
  width: 76px;
  height: 76px;
  flex-shrink: 0;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  position: relative;
  border: 2px solid transparent;
  transition: border-color 0.2s ease;
}

.selectable-image.selected {
  border-color: #1a1a1a;
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
  width: 22px;
  height: 22px;
  background: #1a1a1a;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.task-actions {
  margin-top: 12px;
  text-align: center;
}

.action-btn {
  height: 36px;
  font-size: 14px;
  font-weight: 500;
  border-radius: 18px;
  background: #1a1a1a;
  border-color: #1a1a1a;
  padding: 0 20px;
}

.action-btn:disabled {
  background: #d9d9d9;
  border-color: #d9d9d9;
}

.done-images {
  display: flex;
  gap: 8px;
  overflow-x: auto;
}

.done-images img {
  width: 88px;
  height: 88px;
  object-fit: cover;
  border-radius: 8px;
}

.empty-state {
  text-align: center;
  padding: 40px 0;
  color: #b3b3b3;
}

.empty-icon {
  margin-bottom: 12px;
}

.empty-state p {
  font-size: 14px;
  margin: 0;
}
</style>
