<template>
  <div class="page-container">
    <div class="page-header">
      <h1 class="page-title">我的任务</h1>
      <p class="page-desc">查看和管理您的一键变身菜品图任务</p>
    </div>

    <!-- 筛选 tabs -->
    <div class="filter-tabs">
      <el-tabs v-model="activeTab" @tab-change="handleTabChange">
        <el-tab-pane label="进行中" name="pending" />
        <el-tab-pane label="已完成" name="done" />
        <el-tab-pane label="已失败" name="failed" />
      </el-tabs>
    </div>

    <!-- 任务列表 -->
    <div class="task-list" v-if="tasks.length > 0">
      <div
        v-for="task in tasks"
        :key="task.id"
        class="task-card"
        @click="goToTask(task)"
      >
        <div class="task-image">
          <img :src="task.image_url || defaultImage" :alt="task.dish_name" />
        </div>
        <div class="task-info">
          <div class="task-name">{{ task.dish_name || '未命名任务' }}</div>
          <div class="task-time">{{ formatTime(task.created_at) }}</div>
          <div class="task-status">
            <el-tag :type="getStatusType(task.status)" size="small">
              {{ getStatusText(task.status) }}
            </el-tag>
          </div>
        </div>
        <div class="task-arrow">
          <el-icon><ArrowRight /></el-icon>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else class="empty-state">
      <el-empty :description="emptyText" />
    </div>

    <!-- 分页 -->
    <div class="pagination" v-if="total > pageSize">
      <el-pagination
        v-model:current-page="currentPage"
        :page-size="pageSize"
        :total="total"
        layout="prev, pager, next"
        @current-change="handlePageChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowRight } from '@element-plus/icons-vue'

interface Task {
  id: string
  image_url: string
  dish_name: string
  status: 'pending' | 'recognizing' | 'matching' | 'generating' | 'pending_select' | 'enhancing' | 'done' | 'failed'
  created_at: string
}

const router = useRouter()

const activeTab = ref('pending')
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const tasks = ref<Task[]>([])

const defaultImage = 'https://picsum.photos/seed/default/200/150'

const emptyText = computed(() => {
  switch (activeTab.value) {
    case 'pending':
      return '暂无进行中的任务'
    case 'done':
      return '暂无已完成的任务'
    case 'failed':
      return '暂无失败的任务'
    default:
      return '暂无任务'
  }
})

function getStatusType(status: string) {
  switch (status) {
    case 'pending':
    case 'recognizing':
    case 'matching':
    case 'generating':
    case 'pending_select':
    case 'enhancing':
      return 'warning'
    case 'done':
      return 'success'
    case 'failed':
      return 'danger'
    default:
      return 'info'
  }
}

function getStatusText(status: string) {
  const map: Record<string, string> = {
    pending: '等待中',
    recognizing: '识别中',
    matching: '匹配中',
    generating: '生成中',
    pending_select: '待选择',
    enhancing: '高清增强中',
    done: '已完成',
    failed: '已失败'
  }
  return map[status] || status
}

function formatTime(timeStr: string) {
  if (!timeStr) return ''
  const date = new Date(timeStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()

  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)} 分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)} 小时前`
  if (diff < 604800000) return `${Math.floor(diff / 86400000)} 天前`

  return date.toLocaleDateString('zh-CN')
}

function handleTabChange() {
  currentPage.value = 1
  loadTasks()
}

function handlePageChange() {
  loadTasks()
}

function goToTask(task: Task) {
  if (task.status === 'done') {
    router.push('/gallery')
  } else if (task.status !== 'failed') {
    router.push('/masterpiece')
  }
}

async function loadTasks() {
  // TODO: 调用 API 获取任务列表
  // Mock 数据
  tasks.value = [
    {
      id: '1',
      image_url: 'https://picsum.photos/seed/task1/200/150',
      dish_name: '红烧肉',
      status: 'pending_select',
      created_at: new Date(Date.now() - 3600000).toISOString()
    },
    {
      id: '2',
      image_url: 'https://picsum.photos/seed/task2/200/150',
      dish_name: '糖醋排骨',
      status: 'done',
      created_at: new Date(Date.now() - 86400000).toISOString()
    },
    {
      id: '3',
      image_url: 'https://picsum.photos/seed/task3/200/150',
      dish_name: '宫保鸡丁',
      status: 'failed',
      created_at: new Date(Date.now() - 172800000).toISOString()
    }
  ]
  total.value = tasks.value.length
}

onMounted(() => {
  loadTasks()
})
</script>

<style scoped>
.page-container {
  max-width: 900px;
}

.page-header {
  margin-bottom: var(--space-xl);
}

.page-title {
  font-size: var(--font-size-2xl);
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0 0 var(--space-sm);
}

.page-desc {
  font-size: var(--font-size-base);
  color: var(--color-text-secondary);
  margin: 0;
}

/* 筛选 tabs */
.filter-tabs {
  background: var(--bg-surface);
  border-radius: var(--radius-lg);
  padding: var(--space-md) var(--space-lg);
  margin-bottom: var(--space-xl);
  border: 1px solid var(--border-light);
}

/* 任务列表 */
.task-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.task-card {
  display: flex;
  align-items: center;
  gap: var(--space-lg);
  background: var(--bg-surface);
  border-radius: var(--radius-lg);
  padding: var(--space-lg);
  cursor: pointer;
  transition: all var(--transition-fast);
  border: 1px solid var(--border-light);
}

.task-card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
  border-color: var(--border-default);
}

.task-image {
  width: 80px;
  height: 60px;
  border-radius: var(--radius-md);
  overflow: hidden;
  flex-shrink: 0;
}

.task-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.task-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.task-name {
  font-size: var(--font-size-base);
  font-weight: 500;
  color: var(--color-text-primary);
}

.task-time {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.task-status {
  margin-top: var(--space-xs);
}

.task-arrow {
  color: var(--color-text-secondary);
  flex-shrink: 0;
}

/* 空状态 */
.empty-state {
  background: var(--bg-surface);
  border-radius: var(--radius-lg);
  padding: var(--space-3xl);
  border: 1px solid var(--border-light);
}

/* 分页 */
.pagination {
  display: flex;
  justify-content: center;
  margin-top: var(--space-xl);
}
</style>
