<template>
  <div class="billing-page">
    <header class="page-header">
      <h1>我的钱包</h1>
    </header>

    <main class="page-content">
      <!-- 余额卡片 -->
      <div class="balance-card">
        <div class="balance-info">
          <span class="balance-label">当前余额</span>
          <div class="balance-amount">
            <span class="coin-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
              </svg>
            </span>
            <span class="amount">{{ formatBalance(balance) }}</span>
          </div>
        </div>
        <div class="balance-actions">
          <el-button v-if="canRecharge" type="primary" size="large" class="recharge-btn" @click="showRechargeDialog">
            充值
          </el-button>
          <el-button v-if="canTransfer" type="default" size="large" class="transfer-btn" @click="showTransferDialog">
            划拨
          </el-button>
        </div>
      </div>

      <!-- 消费记录 -->
      <div class="records-section">
        <div class="section-header">
          <h2>交易记录</h2>
          <div class="filter-tabs">
            <span
              v-for="tab in filterTabs"
              :key="tab.value"
              class="tab"
              :class="{ active: currentFilter === tab.value }"
              @click="changeFilter(tab.value)"
            >
              {{ tab.label }}
            </span>
          </div>
        </div>

        <!-- 加载状态 -->
        <div v-if="loading" class="loading-state">
          <el-skeleton :rows="5" animated />
        </div>

        <!-- 空状态 -->
        <div v-else-if="records.length === 0" class="empty-state">
          <el-empty description="暂无交易记录" />
        </div>

        <!-- 记录列表 -->
        <div v-else class="records-list">
          <div
            v-for="record in records"
            :key="record.id"
            class="record-item"
          >
            <div class="record-icon" :class="record.type">
              <el-icon :size="20">
                <component :is="getRecordIcon(record.type)" />
              </el-icon>
            </div>
            <div class="record-info">
              <span class="record-desc">{{ record.description }}</span>
              <span class="record-time">{{ formatTime(record.created_at) }}</span>
            </div>
            <div class="record-amount" :class="record.type">
              <span class="prefix">{{ record.amount > 0 ? '+' : '' }}</span>
              {{ record.amount }}
            </div>
          </div>
        </div>

        <!-- 分页 -->
        <div v-if="total > pageSize" class="pagination">
          <el-pagination
            v-model:current-page="currentPage"
            :page-size="pageSize"
            :total="total"
            layout="prev, pager, next"
            @current-change="loadRecords"
          />
        </div>
      </div>
    </main>

    <!-- 充值弹窗 -->
    <RechargeModal
      v-model="rechargeDialogVisible"
      :current-balance="balance"
      @success="onRechargeSuccess"
    />

    <!-- 划拨弹窗 -->
    <el-dialog v-model="transferDialogVisible" title="积分划拨" width="420px">
      <el-form :model="transferForm" :rules="transferRules" ref="transferFormRef" label-width="100px">
        <el-form-item label="目标用户" prop="targetUserId">
          <el-input
            v-model="transferForm.targetUserName"
            placeholder="请输入用户名"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="划拨积分" prop="amount">
          <el-input-number
            v-model="transferForm.amount"
            :min="1"
            :max="100000"
            style="width: 100%"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="transferDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="transferLoading" @click="handleTransfer">确认划拨</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import {
  Wallet,
  Download,
  Upload,
  ShoppingCart
} from '@element-plus/icons-vue'
import { getBalance, getTransactionRecords, transfer, getBillingUsers, type Transaction } from '@/api/billing'
import { useUserStore } from '@/stores/user'
import { useConfigStore } from '@/stores/config'
import RechargeModal from '@/components/billing/RechargeModal.vue'

const userStore = useUserStore()
const configStore = useConfigStore()

// 余额
const balance = ref(0)

// 交易记录
const records = ref<Transaction[]>([])
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(20)
const total = ref(0)
const currentFilter = ref('')

// 筛选标签
const filterTabs = [
  { label: '全部', value: '' },
  { label: '充值', value: 'recharge' },
  { label: '划拨', value: 'transfer_in' },
  { label: '消费', value: 'consume' }
]

// 是否有充值权限
const canRecharge = computed(() => {
  if (!userStore.userInfo) return false
  return configStore.canRecharge(userStore.userInfo.role)
})

// 是否有划拨权限（Admin 和 VIP）
const canTransfer = computed(() => {
  return userStore.isAdmin || userStore.isVip
})

// 充值弹窗
const rechargeDialogVisible = ref(false)

// 划拨弹窗
const transferDialogVisible = ref(false)
const transferFormRef = ref<FormInstance>()
const transferForm = reactive({
  targetUserName: '',
  amount: 100
})
const transferRules: FormRules = {
  targetUserName: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  amount: [{ required: true, message: '请输入划拨数量', trigger: 'blur' }]
}
const transferLoading = ref(false)

// 格式化余额
function formatBalance(val: number): string {
  return val.toFixed(2)
}

// 格式化时间
function formatTime(timeStr: string): string {
  const date = new Date(timeStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()

  // 一天内显示相对时间
  if (diff < 86400000) {
    if (diff < 3600000) {
      const mins = Math.floor(diff / 60000)
      return `${mins} 分钟前`
    }
    const hours = Math.floor(diff / 3600000)
    return `${hours} 小时前`
  }

  // 超过一天显示日期
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 获取记录图标
function getRecordIcon(type: string) {
  const iconMap: Record<string, any> = {
    recharge: Wallet,
    transfer_in: Download,
    transfer_out: Upload,
    consume: ShoppingCart
  }
  return iconMap[type] || Wallet
}

// 加载余额
async function loadBalance() {
  const data = await getBalance()
  if (data) {
    balance.value = data.balance
  }
}

// 加载交易记录
async function loadRecords() {
  loading.value = true
  try {
    const data = await getTransactionRecords(
      currentPage.value,
      pageSize.value,
      currentFilter.value || undefined
    )
    if (data) {
      records.value = data.records
      total.value = data.total
    }
  } finally {
    loading.value = false
  }
}

// 切换筛选
function changeFilter(filter: string) {
  currentFilter.value = filter
  currentPage.value = 1
  loadRecords()
}

// 显示充值弹窗
function showRechargeDialog() {
  rechargeDialogVisible.value = true
}

// 充值成功回调
function onRechargeSuccess(newBalance: number) {
  balance.value = newBalance
  loadRecords()
}

// 显示划拨弹窗
function showTransferDialog() {
  transferDialogVisible.value = true
}

// 确认划拨
async function handleTransfer() {
  if (!transferFormRef.value) return

  await transferFormRef.value.validate(async (valid) => {
    if (!valid) return

    if (!transferForm.targetUserName || !transferForm.amount) {
      ElMessage.warning('请填写完整的划拨信息')
      return
    }

    transferLoading.value = true
    try {
      // 先通过用户名查找用户
      const data = await getBillingUsers(transferForm.targetUserName, 1, 1)
      if (!data || !data.users || data.users.length === 0) {
        ElMessage.error('用户不存在')
        return
      }
      const targetUser = data.users.find(u => u.username === transferForm.targetUserName)
      if (!targetUser) {
        ElMessage.error('用户不存在')
        return
      }

      const result = await transfer(targetUser.id, transferForm.amount)
      if (result) {
        ElMessage.success('划拨成功')
        transferDialogVisible.value = false
        // 重置表单
        transferForm.targetUserName = ''
        transferForm.amount = 100
      }
    } catch (error: any) {
      ElMessage.error(error.message || '划拨失败')
    } finally {
      transferLoading.value = false
    }
  })
}

onMounted(() => {
  // 加载账务配置（包含充值权限）
  configStore.loadBillingConfig()
  loadBalance()
  loadRecords()
})
</script>

<style scoped>
.billing-page {
  max-width: 800px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: var(--space-xl);
}

.page-header h1 {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0;
}

.page-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-xl);
}

/* 余额卡片 */
.balance-card {
  background: linear-gradient(135deg, #f0f4ff 0%, #e8eeff 100%);
  border-radius: var(--radius-lg);
  padding: var(--space-2xl);
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: var(--color-text-primary);
}

.balance-info {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.balance-label {
  font-size: var(--font-size-sm);
  opacity: 0.9;
}

.balance-amount {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.coin-icon {
  display: flex;
  align-items: center;
  opacity: 0.9;
}

.amount {
  font-size: 36px;
  font-weight: var(--font-weight-bold);
  font-family: 'SF Mono', Monaco, monospace;
}

.unit {
  font-size: var(--font-size-base);
  opacity: 0.8;
}

.balance-actions {
  display: flex;
  gap: var(--space-sm);
}

.recharge-btn {
  background: var(--color-primary);
  border: none;
  color: #fff;
  padding: 12px 32px;
  height: auto;
  font-weight: var(--font-weight-medium);
}

.recharge-btn:hover {
  background: var(--color-primary-light);
}

.transfer-btn {
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  color: var(--color-text-primary);
  padding: 12px 32px;
  height: auto;
  font-weight: var(--font-weight-medium);
}

.transfer-btn:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
  background: var(--color-bg-surface);
}

/* 消费记录区域 */
.records-section {
  background: var(--color-bg-surface);
  border-radius: var(--radius-lg);
  padding: var(--space-xl);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-lg);
}

.section-header h2 {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0;
}

.filter-tabs {
  display: flex;
  gap: var(--space-sm);
}

.tab {
  padding: 6px 12px;
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  cursor: pointer;
  border-radius: var(--radius-sm);
  transition: all var(--transition-fast);
}

.tab:hover {
  color: var(--color-text-primary);
  background: var(--color-bg-hover);
}

.tab.active {
  color: var(--color-primary);
  background: var(--color-primary-bg-light);
}

/* 加载状态 */
.loading-state {
  padding: var(--space-lg);
}

/* 空状态 */
.empty-state {
  padding: var(--space-3xl);
}

/* 记录列表 */
.records-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.record-item {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-md);
  border-radius: var(--radius-md);
  transition: background var(--transition-fast);
}

.record-item:hover {
  background: var(--color-bg-hover);
}

.record-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.record-icon.recharge {
  background: #e6f7ff;
  color: #1890ff;
}

.record-icon.transfer_in {
  background: #f6ffed;
  color: #52c41a;
}

.record-icon.transfer_out {
  background: #fff7e6;
  color: #fa8c16;
}

.record-icon.consume {
  background: #fff1f0;
  color: #ff4d4f;
}

.record-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.record-desc {
  font-size: var(--font-size-base);
  color: var(--color-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.record-time {
  font-size: var(--font-size-xs);
  color: var(--color-text-placeholder);
}

.record-amount {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  font-family: 'SF Mono', Monaco, monospace;
}

.record-amount.recharge,
.record-amount.transfer_in {
  color: var(--color-success);
}

.record-amount.transfer_out,
.record-amount.consume {
  color: var(--color-error);
}

/* 分页 */
.pagination {
  margin-top: var(--space-lg);
  display: flex;
  justify-content: center;
}
</style>
