<template>
  <div class="data-query">
    <div class="query-tabs">
      <el-tabs v-model="activeTab">
        <el-tab-pane label="账单查询" name="bills">
          <div class="query-form">
            <el-form inline>
              <el-form-item label="用户">
                <el-input v-model="queryForm.username" placeholder="请输入用户名" />
              </el-form-item>
              <el-form-item label="时间范围">
                <el-date-picker
                  v-model="queryForm.dateRange"
                  type="daterange"
                  range-separator="至"
                  start-placeholder="开始日期"
                  end-placeholder="结束日期"
                />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="searchBills">查询</el-button>
              </el-form-item>
            </el-form>
          </div>
          <el-table :data="bills" style="width: 100%; margin-top: 16px">
            <el-table-column prop="username" label="用户" />
            <el-table-column prop="type" label="类型" />
            <el-table-column prop="amount" label="金额" />
            <el-table-column prop="status" label="状态">
              <template #default="{ row }">
                <el-tag :type="row.status === 'paid' ? 'success' : 'warning'" size="small">
                  {{ row.status === 'paid' ? '已支付' : '待支付' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="createdAt" label="时间" />
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="图库查询" name="images">
          <div class="query-form">
            <el-form inline>
              <el-form-item label="用户">
                <el-input v-model="queryForm.username" placeholder="请输入用户名" />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="searchImages">查询</el-button>
              </el-form-item>
            </el-form>
          </div>
          <div class="image-grid">
            <div class="image-item" v-for="img in images" :key="img.id">
              <img :src="img.url" :alt="img.name" />
              <div class="image-info">
                <p>{{ img.username }}</p>
                <p>{{ img.createdAt }}</p>
              </div>
            </div>
          </div>
        </el-tab-pane>

        <el-tab-pane label="操作日志" name="logs">
          <el-table :data="logs" style="width: 100%">
            <el-table-column prop="username" label="用户" width="120" />
            <el-table-column prop="action" label="操作" />
            <el-table-column prop="detail" label="详情" />
            <el-table-column prop="ip" label="IP" width="140" />
            <el-table-column prop="createdAt" label="时间" width="180" />
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const activeTab = ref('bills')

const queryForm = ref({
  username: '',
  dateRange: null as [Date, Date] | null
})

const bills = ref([
  { id: 1, username: 'user1', type: '订阅', amount: '¥99', status: 'paid', createdAt: '2024-01-01' }
])

const images = ref<{ id: number; url: string; name: string; username: string; createdAt: string }[]>([])

const logs = ref([
  { id: 1, username: 'admin', action: '登录', detail: '后台登录', ip: '127.0.0.1', createdAt: '2024-01-01 12:00:00' }
])

function searchBills() {
  // TODO: 查询账单
}

function searchImages() {
  // TODO: 查询图库
}
</script>

<style scoped>
.data-query {
  padding: 0;
}

.query-tabs {
  background: #ffffff;
  border-radius: 10px;
  padding: 20px;
  border: 1px solid #f0f0f0;
}

.query-form {
  margin-bottom: 16px;
}

.query-tabs :deep(.el-tabs__item) {
  font-weight: 500;
}

.query-tabs :deep(.el-tabs__item.is-active) {
  color: #1a1a1a;
}

.query-tabs :deep(.el-tabs__active-bar) {
  background-color: #1a1a1a;
}

.image-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12px;
  margin-top: 16px;
}

.image-item {
  border-radius: 8px;
  overflow: hidden;
  background: #f5f5f5;
}

.image-item img {
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
}

.image-info {
  padding: 10px;
  font-size: 12px;
  color: #595959;
}

.image-info p {
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
