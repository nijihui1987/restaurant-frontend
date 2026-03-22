<template>
  <div class="user-management">
    <!-- 页面标题 -->
    <div class="page-header">
      <div class="header-left">
        <h2>用户管理</h2>
      </div>
      <div class="header-right">
        <el-button type="primary" @click="openCreateDialog">
          <el-icon><Plus /></el-icon>
          新增用户
        </el-button>
      </div>
    </div>

    <!-- 搜索和筛选 -->
    <div class="filter-bar">
      <el-input
        v-model="searchKeyword"
        placeholder="搜索用户名、手机号、显示名称"
        size="large"
        style="width: 320px"
        clearable
        @input="handleSearch"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
      <el-select v-model="filterRole" placeholder="全部角色" clearable style="width: 140px" @change="handleSearch">
        <el-option label="全部角色" value="" />
        <el-option label="管理员" value="admin" />
        <el-option label="专业组" value="vip" />
        <el-option label="普通用户" value="user" />
      </el-select>
    </div>

    <!-- 用户列表卡片 -->
    <div class="content-card">
      <el-table v-loading="loading" :data="users" style="width: 100%">
        <el-table-column prop="id" label="ID" width="70" />
        <el-table-column prop="username" label="用户名" width="120">
          <template #default="{ row }">
            <div class="user-cell">
              <span class="username">{{ row.username }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="anonymous_name" label="显示名称" width="120">
          <template #default="{ row }">
            <span class="anonymous-name">{{ row.anonymous_name || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="vip_name" label="所属上级" width="120">
          <template #default="{ row }">
            <span class="parent-vip">{{ row.vip_name || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="余额信息" min-width="200">
          <template #default="{ row }">
            <div class="balance-info">
              <div class="balance-item">
                <span class="balance-label">余额</span>
                <span class="balance-value">{{ row.balance ?? '-' }}</span>
              </div>
              <div class="balance-item">
                <span class="balance-label">近7日消耗</span>
                <span class="balance-value consumption">{{ row.consumption_7d ?? '-' }}</span>
              </div>
              <div class="balance-item">
                <span class="balance-label">累计充值</span>
                <span class="balance-value">{{ row.total_recharge ?? '-' }}</span>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="role" label="角色" width="100">
          <template #default="{ row }">
            <el-tag :type="getRoleTagType(row.role)" size="small">
              {{ getRoleName(row.role) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="is_active" label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.is_active ? 'success' : 'info'" size="small">
              {{ row.is_active ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" text size="small" @click="openEditDialog(row)">编辑</el-button>
            <el-button
              :type="row.is_active ? 'danger' : 'success'"
              text
              size="small"
              @click="toggleUserStatus(row)"
            >
              {{ row.is_active ? '禁用' : '启用' }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next"
          @current-change="fetchUsers"
          @size-change="handleSizeChange"
        />
      </div>
    </div>

    <!-- 用户编辑弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑用户' : '新增用户'"
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
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-select v-model="form.role" placeholder="请选择角色" style="width: 100%">
            <el-option label="管理员" value="admin" />
            <el-option label="专业组" value="vip" />
            <el-option label="普通用户" value="user" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { Search, Plus } from '@element-plus/icons-vue'
import { getUserList, createUser, updateUser, updateUserStatus, type UserListItem } from '@/api/user'
import type { UserRole } from '@/api/auth'

// 扩展 UserListItem 类型以包含余额信息
interface UserWithBalance extends UserListItem {
  balance?: number
  consumption_7d?: number
  total_recharge?: number
}

const loading = ref(false)
const submitLoading = ref(false)
const dialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref<FormInstance>()

const searchKeyword = ref('')
const filterRole = ref('')
const currentPage = ref(1)
const pageSize = ref(20)
const total = ref(0)

const users = ref<UserWithBalance[]>([])
const currentUserId = ref<number | null>(null)

const form = reactive({
  username: '',
  password: '',
  anonymous_name: '',
  phone: '',
  email: '',
  role: 'user' as UserRole
})

const rules: FormRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
  role: [{ required: true, message: '请选择角色', trigger: 'change' }]
}

function getRoleName(role: string): string {
  const names: Record<string, string> = {
    admin: '管理员',
    vip: '专业组',
    user: '用户'
  }
  return names[role] || role
}

function getRoleTagType(role: string): string {
  const types: Record<string, string> = {
    admin: 'danger',
    vip: 'warning',
    user: 'info'
  }
  return types[role] || 'info'
}

async function fetchUsers() {
  loading.value = true
  try {
    const res = await getUserList({
      page: currentPage.value,
      page_size: pageSize.value,
      keyword: searchKeyword.value || undefined,
      role: filterRole.value as UserRole || undefined
    })
    users.value = res.users
    total.value = res.total
  } catch (error: any) {
    ElMessage.error(error.response?.data?.detail || '获取用户列表失败')
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  currentPage.value = 1
  fetchUsers()
}

function handleSizeChange() {
  currentPage.value = 1
  fetchUsers()
}

function openCreateDialog() {
  isEdit.value = false
  dialogVisible.value = true
}

function openEditDialog(row: UserWithBalance) {
  isEdit.value = true
  currentUserId.value = row.id
  form.username = row.username
  form.anonymous_name = row.anonymous_name || ''
  form.phone = row.phone || ''
  form.email = row.email || ''
  form.role = row.role
  dialogVisible.value = true
}

function resetForm() {
  formRef.value?.resetFields()
  form.username = ''
  form.password = ''
  form.anonymous_name = ''
  form.phone = ''
  form.email = ''
  form.role = 'user'
  currentUserId.value = null
}

async function handleSubmit() {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (!valid) return

    submitLoading.value = true
    try {
      if (isEdit.value && currentUserId.value) {
        await updateUser(currentUserId.value, {
          phone: form.phone || undefined,
          email: form.email || undefined,
          role: form.role,
          anonymous_name: form.anonymous_name || undefined
        })
        ElMessage.success('更新成功')
      } else {
        await createUser({
          username: form.username,
          password: form.password,
          phone: form.phone || undefined,
          email: form.email || undefined,
          role: form.role,
          anonymous_name: form.anonymous_name || undefined
        })
        ElMessage.success('创建成功')
      }
      dialogVisible.value = false
      fetchUsers()
    } catch (error: any) {
      ElMessage.error(error.response?.data?.detail || '操作失败')
    } finally {
      submitLoading.value = false
    }
  })
}

async function toggleUserStatus(row: UserWithBalance) {
  const action = row.is_active ? '禁用' : '启用'
  try {
    await ElMessageBox.confirm(`确定${action}用户 ${row.username}？`, '提示', {
      type: 'warning',
      confirmButtonText: '确定',
      cancelButtonText: '取消'
    })
    await updateUserStatus(row.id, !row.is_active)
    ElMessage.success(`${action}成功`)
    fetchUsers()
  } catch {
    // 取消
  }
}

onMounted(() => {
  fetchUsers()
})
</script>

<style scoped>
.user-management {
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

.filter-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.content-card {
  background: #ffffff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

.user-cell {
  display: flex;
  flex-direction: column;
}

.username {
  font-weight: 500;
  color: #1a1a1a;
}

.anonymous-name {
  color: #595959;
  font-size: 13px;
}

.parent-vip {
  color: #8c8c8c;
  font-size: 13px;
}

.balance-info {
  display: flex;
  gap: 16px;
}

.balance-item {
  display: flex;
  flex-direction: column;
  min-width: 60px;
}

.balance-label {
  font-size: 11px;
  color: #8c8c8c;
  margin-bottom: 2px;
}

.balance-value {
  font-size: 14px;
  font-weight: 500;
  color: #1a1a1a;
  font-family: 'SF Mono', Monaco, monospace;
}

.balance-value.consumption {
  color: #ff4d4f;
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

.pagination-wrapper {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.pagination-wrapper :deep(.el-pagination) {
  --el-pagination-button-bg-color: #fafbfc;
  --el-pagination-hover-color: #1a1a1a;
}
</style>
