<template>
  <div class="admin-dashboard">
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon">
          <el-icon :size="24"><User /></el-icon>
        </div>
        <div class="stat-info">
          <p class="stat-value">{{ stats.totalUsers }}</p>
          <p class="stat-label">用户总数</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">
          <el-icon :size="24"><UserFilled /></el-icon>
        </div>
        <div class="stat-info">
          <p class="stat-value">{{ stats.totalVips }}</p>
          <p class="stat-label">VIP 总数</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">
          <el-icon :size="24"><Picture /></el-icon>
        </div>
        <div class="stat-info">
          <p class="stat-value">{{ stats.totalImages }}</p>
          <p class="stat-label">图片总数</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">
          <el-icon :size="24"><Operation /></el-icon>
        </div>
        <div class="stat-info">
          <p class="stat-value">{{ stats.totalTasks }}</p>
          <p class="stat-label">任务总数</p>
        </div>
      </div>
    </div>

    <div class="content-section">
      <div class="content-card">
        <div class="card-header">
          <h2>待审核任务</h2>
          <span class="badge" v-if="pendingTasks.length">{{ pendingTasks.length }}</span>
        </div>
        <el-table :data="pendingTasks" style="width: 100%" :row-class-name="tableRowClassName">
          <el-table-column prop="username" label="用户" width="140" />
          <el-table-column prop="dishName" label="菜品" />
          <el-table-column prop="createdAt" label="提交时间" width="140" />
          <el-table-column label="操作" width="100" fixed="right">
            <template #default="{ row }">
              <el-button type="primary" text size="small" @click="auditTask(row)">审核</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <div class="content-card">
        <div class="card-header">
          <h2>最近操作日志</h2>
        </div>
        <el-table :data="recentLogs" style="width: 100%">
          <el-table-column prop="username" label="用户" width="140" />
          <el-table-column prop="action" label="操作" />
          <el-table-column prop="target" label="对象" />
          <el-table-column prop="createdAt" label="时间" width="160" />
        </el-table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { User, UserFilled, Picture, Operation } from '@element-plus/icons-vue'

const stats = ref({
  totalUsers: 128,
  totalVips: 12,
  totalImages: 1024,
  totalTasks: 512
})

const pendingTasks = ref([
  { id: 1, username: '张三', dishName: '红烧肉', createdAt: '10分钟前' },
  { id: 2, username: '李四', dishName: '宫保鸡丁', createdAt: '30分钟前' }
])

const recentLogs = ref([
  { id: 1, username: '张三', action: '上传图片', target: '红烧肉.jpg', createdAt: '2024-01-01 12:00' },
  { id: 2, username: '李四', action: '生成图片', target: '任务 #123', createdAt: '2024-01-01 11:30' }
])

function tableRowClassName({ rowIndex }: { rowIndex: number }) {
  return rowIndex % 2 === 0 ? 'even-row' : 'odd-row'
}

function auditTask(row: typeof pendingTasks.value[0]) {
  ElMessage.info(`审核任务: ${row.dishName}`)
}
</script>

<style scoped>
.admin-dashboard {
  padding: 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  background: #ffffff;
  border-radius: 10px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  border: 1px solid #f0f0f0;
}

.stat-icon {
  width: 48px;
  height: 48px;
  background: #fafbfc;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #1a1a1a;
}

.stat-info {
  flex: 1;
}

.stat-value {
  margin: 0;
  font-size: 26px;
  font-weight: 600;
  color: #1a1a1a;
  letter-spacing: -0.5px;
}

.stat-label {
  margin: 4px 0 0;
  font-size: 13px;
  color: #8c8c8c;
}

.content-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.content-card {
  background: #ffffff;
  border-radius: 10px;
  padding: 20px;
  border: 1px solid #f0f0f0;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
}

.card-header h2 {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: #1a1a1a;
}

.badge {
  background: #1a1a1a;
  color: #ffffff;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 500;
}

.content-card :deep(.el-table) {
  border-radius: 8px;
  overflow: hidden;
}

.content-card :deep(.el-table th) {
  background: #fafbfc;
  color: #595959;
  font-weight: 500;
  font-size: 13px;
  padding: 12px 0;
}

.content-card :deep(.el-table td) {
  padding: 14px 0;
  font-size: 14px;
  color: #1a1a1a;
}

.content-card :deep(.even-row) {
  background: #fafbfc;
}

.content-card :deep(.el-button--primary) {
  color: #1a1a1a;
  font-weight: 500;
}

.content-card :deep(.el-button--primary:hover) {
  color: #409eff;
}
</style>
