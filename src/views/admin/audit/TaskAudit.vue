<template>
  <div class="task-audit">
    <div class="audit-content">
      <el-tabs v-model="activeTab">
        <el-tab-pane label="待审核" name="pending">
          <div class="task-list">
            <div class="task-card" v-for="task in pendingTasks" :key="task.id">
              <div class="task-header">
                <div class="task-user">
                  <span class="username">{{ task.username }}</span>
                  <span class="time">{{ task.createdAt }}</span>
                </div>
                <el-tag type="warning" size="small">待审核</el-tag>
              </div>
              <div class="task-images">
                <div class="image-item" v-for="(img, idx) in task.images" :key="idx">
                  <img :src="img" alt="生成图片" />
                </div>
              </div>
              <div class="task-info">
                <p><strong>菜品：</strong>{{ task.dishName }}</p>
                <p><strong>描述：</strong>{{ task.description }}</p>
              </div>
              <div class="task-actions">
                <el-button type="danger" @click="rejectTask(task)">拒绝</el-button>
                <el-button type="success" @click="approveTask(task)">通过</el-button>
              </div>
            </div>
            <div class="empty-state" v-if="pendingTasks.length === 0">
              <div class="empty-icon">
                <el-icon :size="48"><CircleCheck /></el-icon>
              </div>
              <p>暂无待审核任务</p>
            </div>
          </div>
        </el-tab-pane>

        <el-tab-pane label="已通过" name="approved">
          <el-table :data="approvedTasks" style="width: 100%">
            <el-table-column prop="username" label="用户" width="120" />
            <el-table-column prop="dishName" label="菜品" />
            <el-table-column prop="approvedAt" label="通过时间" width="180" />
            <el-table-column prop="auditor" label="审核人" width="120" />
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="已拒绝" name="rejected">
          <el-table :data="rejectedTasks" style="width: 100%">
            <el-table-column prop="username" label="用户" width="120" />
            <el-table-column prop="dishName" label="菜品" />
            <el-table-column prop="reason" label="拒绝原因" />
            <el-table-column prop="rejectedAt" label="拒绝时间" width="180" />
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { CircleCheck } from '@element-plus/icons-vue'

const activeTab = ref('pending')

interface Task {
  id: number
  username: string
  dishName: string
  description: string
  images: string[]
  createdAt: string
}

const pendingTasks = ref<Task[]>([
  {
    id: 1,
    username: 'user1',
    dishName: '红烧肉',
    description: '咸甜口味，猪肉为主料',
    images: ['data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="%23ddd" width="100" height="100"/></svg>'],
    createdAt: '10分钟前'
  }
])

const approvedTasks = ref([
  { id: 1, username: 'user2', dishName: '宫保鸡丁', approvedAt: '2024-01-01 12:00', auditor: 'admin' }
])

const rejectedTasks = ref([
  { id: 1, username: 'user3', dishName: '麻婆豆腐', reason: '图片质量问题', rejectedAt: '2024-01-01 11:00' }
])

function approveTask(task: Task) {
  ElMessage.success(`已通过任务: ${task.dishName}`)
  pendingTasks.value = pendingTasks.value.filter(t => t.id !== task.id)
}

function rejectTask(task: Task) {
  ElMessage.info(`已拒绝任务: ${task.dishName}`)
  pendingTasks.value = pendingTasks.value.filter(t => t.id !== task.id)
}
</script>

<style scoped>
.task-audit {
  padding: 0;
}

.audit-content {
  background: #ffffff;
  border-radius: 10px;
  padding: 20px;
  border: 1px solid #f0f0f0;
}

.audit-content :deep(.el-tabs__item) {
  font-weight: 500;
}

.audit-content :deep(.el-tabs__item.is-active) {
  color: #1a1a1a;
}

.audit-content :deep(.el-tabs__active-bar) {
  background-color: #1a1a1a;
}

.task-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.task-card {
  border: 1px solid #f0f0f0;
  border-radius: 10px;
  padding: 16px;
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.task-user {
  display: flex;
  align-items: center;
  gap: 12px;
}

.username {
  font-weight: 600;
  color: #1a1a1a;
  font-size: 14px;
}

.time {
  font-size: 13px;
  color: #8c8c8c;
}

.task-images {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
  overflow-x: auto;
}

.image-item {
  width: 88px;
  height: 88px;
  flex-shrink: 0;
  border-radius: 8px;
  overflow: hidden;
}

.image-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.task-info {
  margin-bottom: 12px;
}

.task-info p {
  margin: 0 0 4px;
  font-size: 14px;
  color: #595959;
}

.task-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.empty-state {
  text-align: center;
  padding: 40px;
  color: #8c8c8c;
}

.empty-icon {
  margin-bottom: 12px;
}
</style>
