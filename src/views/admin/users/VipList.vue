<template>
  <div class="vip-management">
    <!-- 页面标题 -->
    <div class="page-header">
      <div class="header-left">
        <h2>专业组管理</h2>
      </div>
      <div class="header-right">
        <el-button type="primary" @click="openCreateDialog">
          <el-icon><Plus /></el-icon>
          新增专业组
        </el-button>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-row">
      <div class="stat-card">
        <div class="stat-icon">
          <el-icon :size="24"><OfficeBuilding /></el-icon>
        </div>
        <div class="stat-info">
          <p class="stat-value">{{ vipList.length }}</p>
          <p class="stat-label">专业组数量</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">
          <el-icon :size="24"><User /></el-icon>
        </div>
        <div class="stat-info">
          <p class="stat-value">{{ totalUsers }}</p>
          <p class="stat-label">下属用户总数</p>
        </div>
      </div>
    </div>

    <!-- 专业组列表卡片 -->
    <div class="content-card">
      <el-table v-loading="loading" :data="vipList" style="width: 100%">
        <el-table-column prop="id" label="ID" width="70" />
        <el-table-column label="专业组信息" min-width="200">
          <template #default="{ row }">
            <div class="vip-info">
              <div class="vip-name">{{ row.username }}</div>
              <div class="vip-detail">{{ row.anonymous_name || '-' }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="phone" label="手机号" width="130" />
        <el-table-column prop="user_count" label="下属用户" width="100">
          <template #default="{ row }">
            <span class="count-badge">{{ row.user_count }}</span>
          </template>
        </el-table-column>
        <el-table-column label="业务数据" min-width="150">
          <template #default="{ row }">
            <div class="biz-stats">
              <div class="biz-stat">
                <span class="biz-label">图片</span>
                <span class="biz-value">{{ row.image_count || 0 }}</span>
              </div>
              <div class="biz-stat">
                <span class="biz-label">任务</span>
                <span class="biz-value">{{ row.task_count || 0 }}</span>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="is_active" label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.is_active ? 'success' : 'info'" size="small">
              {{ row.is_active ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="创建时间" width="100">
          <template #default="{ row }">
            <span class="date-text">{{ formatDate(row.created_at) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" text size="small" @click="openEditDialog(row)">编辑</el-button>
            <el-button type="primary" text size="small" @click="viewUsers(row)">下属用户</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 专业组编辑弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑专业组' : '新增专业组'"
      width="480px"
      @closed="resetForm"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="用户名" prop="username" v-if="!isEdit">
          <el-input v-model="form.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="密码" :prop="isEdit ? '' : 'password'" v-if="!isEdit">
          <el-input v-model="form.password" type="password" placeholder="请输入密码" show-password />
        </el-form-item>
        <el-form-item label="显示名称" prop="anonymous_name">
          <el-input v-model="form.anonymous_name" placeholder="请输入显示名称" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="form.phone" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="公司名称" prop="company_name">
          <el-input v-model="form.company_name" placeholder="请输入公司名称" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>

    <!-- 下属用户弹窗 -->
    <el-dialog v-model="usersDialogVisible" title="下属用户" width="700px">
      <el-table :data="vipUsers" style="width: 100%" max-height="400">
        <el-table-column prop="id" label="ID" width="70" />
        <el-table-column prop="username" label="用户名" width="120" />
        <el-table-column prop="anonymous_name" label="显示名称" width="120">
          <template #default="{ row }">
            <span class="anonymous-name">{{ row.anonymous_name || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="phone" label="手机号" width="130" />
        <el-table-column prop="company_name" label="公司" min-width="120" />
        <el-table-column prop="is_active" label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.is_active ? 'success' : 'info'" size="small">
              {{ row.is_active ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { Plus, OfficeBuilding, User } from '@element-plus/icons-vue'
import { getVipList, createVip, updateVip, getVipUsers, type VipInfo } from '@/api/vip'

const loading = ref(false)
const submitLoading = ref(false)
const dialogVisible = ref(false)
const usersDialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref<FormInstance>()

const vipList = ref<VipInfo[]>([])
const vipUsers = ref<any[]>([])
const currentVipId = ref<number | null>(null)

// 计算下属用户总数
const totalUsers = computed(() => {
  return vipList.value.reduce((sum, vip) => sum + (vip.user_count || 0), 0)
})

const form = reactive({
  username: '',
  password: '',
  anonymous_name: '',
  phone: '',
  company_name: ''
})

const rules: FormRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '-'
  return dateStr.split('T')[0]
}

async function fetchVipList() {
  loading.value = true
  try {
    const res = await getVipList()
    vipList.value = res.vips
  } catch (error: any) {
    ElMessage.error(error.response?.data?.detail || '获取专业组列表失败')
  } finally {
    loading.value = false
  }
}

function openCreateDialog() {
  isEdit.value = false
  dialogVisible.value = true
}

function openEditDialog(row: VipInfo) {
  isEdit.value = true
  currentVipId.value = row.id
  form.username = row.username
  form.anonymous_name = row.anonymous_name || ''
  form.phone = row.phone || ''
  form.company_name = row.company_name || ''
  dialogVisible.value = true
}

function resetForm() {
  formRef.value?.resetFields()
  form.username = ''
  form.password = ''
  form.anonymous_name = ''
  form.phone = ''
  form.company_name = ''
  currentVipId.value = null
}

async function handleSubmit() {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (!valid) return

    submitLoading.value = true
    try {
      if (isEdit.value && currentVipId.value) {
        await updateVip(currentVipId.value, {
          phone: form.phone || undefined,
          company_name: form.company_name || undefined,
          anonymous_name: form.anonymous_name || undefined
        })
        ElMessage.success('更新成功')
      } else {
        await createVip({
          username: form.username,
          password: form.password,
          phone: form.phone || undefined,
          company_name: form.company_name || undefined,
          anonymous_name: form.anonymous_name || undefined
        })
        ElMessage.success('创建成功')
      }
      dialogVisible.value = false
      fetchVipList()
    } catch (error: any) {
      ElMessage.error(error.response?.data?.detail || '操作失败')
    } finally {
      submitLoading.value = false
    }
  })
}

async function viewUsers(row: VipInfo) {
  currentVipId.value = row.id
  usersDialogVisible.value = true
  try {
    vipUsers.value = await getVipUsers(row.id)
  } catch (error: any) {
    ElMessage.error(error.response?.data?.detail || '获取下属用户失败')
    vipUsers.value = []
  }
}

onMounted(() => {
  fetchVipList()
})
</script>

<style scoped>
.vip-management {
  padding: 0;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.header-left h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #1a1a1a;
}

.header-right :deep(.el-button) {
  background: #1a1a1a;
  border-color: #1a1a1a;
}

/* 统计卡片 */
.stats-row {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
}

.stat-card {
  background: #ffffff;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  min-width: 200px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: #f0f4ff;
  color: #1a1a1a;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-value {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #1a1a1a;
  font-family: 'SF Mono', Monaco, monospace;
}

.stat-label {
  margin: 0;
  font-size: 13px;
  color: #8c8c8c;
}

/* 列表卡片 */
.content-card {
  background: #ffffff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

.vip-info {
  display: flex;
  flex-direction: column;
}

.vip-name {
  font-weight: 500;
  color: #1a1a1a;
}

.vip-detail {
  font-size: 12px;
  color: #8c8c8c;
  margin-top: 2px;
}

.count-badge {
  display: inline-block;
  padding: 2px 8px;
  background: #f0f4ff;
  color: #1a1a1a;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 500;
}

.biz-stats {
  display: flex;
  gap: 12px;
}

.biz-stat {
  display: flex;
  flex-direction: column;
}

.biz-label {
  font-size: 11px;
  color: #8c8c8c;
}

.biz-value {
  font-size: 14px;
  font-weight: 500;
  color: #1a1a1a;
  font-family: 'SF Mono', Monaco, monospace;
}

.date-text {
  font-size: 13px;
  color: #595959;
}

.anonymous-name {
  color: #595959;
  font-size: 13px;
}

.content-card :deep(.el-table th) {
  background: #fafbfc;
  color: #595959;
  font-weight: 500;
  font-size: 13px;
  padding: 12px 0;
}

.content-card :deep(.el-table td) {
  padding: 12px 0;
  font-size: 14px;
  color: #1a1a1a;
}
</style>
