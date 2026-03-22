<template>
  <div class="data-query">
    <div class="query-tabs">
      <el-tabs v-model="activeTab">
        <!-- 账单查询 -->
        <el-tab-pane label="账单查询" name="bills">
          <!-- 积分划拨区域（Admin/VIP可见） -->
          <div class="transfer-section" v-if="userStore.isAdmin || userStore.isVip">
            <h3>积分划拨</h3>
            <el-form :model="transferForm" :rules="transferRules" ref="transferFormRef" inline>
              <el-form-item label="目标用户" prop="targetUserId">
                <el-select
                  v-model="transferForm.targetUserId"
                  filterable
                  remote
                  :remote-method="searchUsers"
                  placeholder="搜索用户"
                  :loading="userLoading"
                  style="width: 200px"
                >
                  <el-option
                    v-for="user in userOptions"
                    :key="user.id"
                    :label="user.username"
                    :value="user.id"
                  >
                    <span>{{ user.username }}</span>
                    <span class="user-role-tag" v-if="user.role !== 'user'">{{ user.role }}</span>
                  </el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="划拨数量" prop="amount">
                <el-input-number
                  v-model="transferForm.amount"
                  :min="1"
                  :max="100000"
                  placeholder="积分数量"
                  style="width: 150px"
                />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" :loading="transferLoading" @click="handleTransfer">
                  确认划拨
                </el-button>
              </el-form-item>
            </el-form>
            <div class="transfer-tip">
              <el-icon :size="14"><InfoFilled /></el-icon>
              <span v-if="userStore.isAdmin">管理员可划拨给任意用户</span>
              <span v-else>VIP 只能划拨给下属用户</span>
            </div>
          </div>

          <!-- 账单查询表单 -->
          <div class="query-form">
            <el-form inline>
              <el-form-item label="用户名">
                <el-input v-model="billQueryForm.username" placeholder="请输入用户名" clearable />
              </el-form-item>
              <el-form-item label="交易类型">
                <el-select v-model="billQueryForm.type" placeholder="全部" clearable style="width: 120px">
                  <el-option label="全部" value="" />
                  <el-option label="充值" value="recharge" />
                  <el-option label="划拨收入" value="transfer_in" />
                  <el-option label="划拨支出" value="transfer_out" />
                  <el-option label="消费" value="consume" />
                </el-select>
              </el-form-item>
              <el-form-item label="时间范围">
                <el-date-picker
                  v-model="billQueryForm.dateRange"
                  type="daterange"
                  range-separator="至"
                  start-placeholder="开始日期"
                  end-placeholder="结束日期"
                  value-format="YYYY-MM-DD"
                />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="searchBills">查询</el-button>
              </el-form-item>
            </el-form>
          </div>

          <!-- 账单列表 -->
          <el-table :data="bills" v-loading="billLoading" style="width: 100%; margin-top: 16px">
            <el-table-column prop="id" label="ID" width="80" />
            <el-table-column prop="username" label="用户名" width="120" />
            <el-table-column prop="type" label="类型" width="100">
              <template #default="{ row }">
                <el-tag :type="getBillTypeTag(row.type)" size="small">
                  {{ getBillTypeName(row.type) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="amount" label="金额" width="120">
              <template #default="{ row }">
                <span :class="row.amount > 0 ? 'amount-positive' : 'amount-negative'">
                  {{ row.amount > 0 ? '+' : '' }}{{ row.amount }}
                </span>
              </template>
            </el-table-column>
            <el-table-column prop="description" label="描述" min-width="150" show-overflow-tooltip />
            <el-table-column prop="created_at" label="时间" width="160" />
          </el-table>

          <div class="pagination" v-if="billTotal > billPageSize">
            <el-pagination
              v-model:current-page="billCurrentPage"
              :page-size="billPageSize"
              :total="billTotal"
              layout="prev, pager, next"
              @current-change="loadBills"
            />
          </div>
        </el-tab-pane>

        <!-- 图库查询 -->
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

        <!-- 操作日志 -->
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
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { InfoFilled } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import {
  getTransactionRecords,
  getBillingUsers,
  transfer as transferApi,
  type Transaction,
  type BillingUser
} from '@/api/billing'
import { getBillTypeName, getBillTypeTag } from '@/utils/billing'

const userStore = useUserStore()

// 当前激活的 tab
const activeTab = ref('bills')

// ==================== 账单查询 ====================
const billQueryForm = ref({
  username: '',
  type: '',
  dateRange: null as [string, string] | null
})

const bills = ref<Transaction[]>([])
const billLoading = ref(false)
const billCurrentPage = ref(1)
const billPageSize = ref(20)
const billTotal = ref(0)

async function loadBills() {
  billLoading.value = true
  try {
    const data = await getTransactionRecords(
      billCurrentPage.value,
      billPageSize.value,
      billQueryForm.value.type || undefined
    )
    if (data) {
      bills.value = data.records
      billTotal.value = data.total
    }
  } finally {
    billLoading.value = false
  }
}

async function searchBills() {
  billCurrentPage.value = 1
  await loadBills()
}

// ==================== 积分管理 ====================
const transferFormRef = ref<FormInstance>()
const transferForm = reactive({
  targetUserId: null as number | null,
  amount: 100
})

const transferRules: FormRules = {
  targetUserId: [{ required: true, message: '请选择目标用户', trigger: 'change' }],
  amount: [{ required: true, message: '请输入划拨数量', trigger: 'blur' }]
}

const userOptions = ref<BillingUser[]>([])
const userLoading = ref(false)
const transferLoading = ref(false)

// 搜索用户
async function searchUsers(query: string) {
  if (!query) {
    userOptions.value = []
    return
  }
  userLoading.value = true
  try {
    const data = await getBillingUsers(query, 1, 20)
    if (data) {
      userOptions.value = data.users
    }
  } finally {
    userLoading.value = false
  }
}

// 确认划拨
async function handleTransfer() {
  if (!transferFormRef.value) return

  await transferFormRef.value.validate(async (valid) => {
    if (!valid) return

    if (!transferForm.targetUserId || !transferForm.amount) {
      ElMessage.warning('请填写完整的划拨信息')
      return
    }

    transferLoading.value = true
    try {
      const result = await transferApi(transferForm.targetUserId, transferForm.amount)
      if (result) {
        ElMessage.success('划拨成功')
        // 重置表单
        transferForm.targetUserId = null
        transferForm.amount = 100
        // 刷新用户余额列表
        loadUserBalances()
      }
    } catch (error: any) {
      ElMessage.error(error.message || '划拨失败')
    } finally {
      transferLoading.value = false
    }
  })
}

// 用户余额列表
const balanceKeyword = ref('')
const userBalances = ref<BillingUser[]>([])
const balanceLoading = ref(false)

async function loadUserBalances() {
  balanceLoading.value = true
  try {
    const data = await getBillingUsers(balanceKeyword.value || undefined, 1, 50)
    if (data) {
      userBalances.value = data.users
    }
  } finally {
    balanceLoading.value = false
  }
}

// ==================== 图库查询 ====================
const queryForm = ref({
  username: ''
})

const images = ref<{ id: number; url: string; name: string; username: string; createdAt: string }[]>([])

function searchImages() {
  // TODO: 实现图库查询
}

const logs = ref([
  { id: 1, username: 'admin', action: '登录', detail: '后台登录', ip: '127.0.0.1', createdAt: '2024-01-01 12:00:00' }
])

onMounted(() => {
  loadBills()
  if (userStore.isAdmin || userStore.isVip) {
    loadUserBalances()
  }
})
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

/* 金额样式 */
.amount-positive {
  color: #52c41a;
  font-weight: 500;
}

.amount-negative {
  color: #ff4d4f;
  font-weight: 500;
}

/* 分页 */
.pagination {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}

/* 图库 */
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

/* 积分管理 */
.coin-management {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.transfer-form {
  background: #fafafa;
  border-radius: 8px;
  padding: 16px;
}

.transfer-form h3,
.balance-list h3 {
  margin: 0 0 16px;
  font-size: 14px;
  font-weight: 600;
  color: #1a1a1a;
}

.transfer-tip {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 12px;
  font-size: 12px;
  color: #8c8c8c;
}

.user-role-tag {
  margin-left: 8px;
  padding: 1px 6px;
  background: #f0f0f0;
  border-radius: 4px;
  font-size: 10px;
  color: #666;
}

.balance-list {
  background: #fafafa;
  border-radius: 8px;
  padding: 16px;
}

.balance-search {
  margin-bottom: 16px;
}

.balance-amount {
  font-weight: 600;
  color: #1a1a1a;
}
</style>
