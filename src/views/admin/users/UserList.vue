<template>
  <div class="user-management">
    <div class="page-header">
      <div class="header-left">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索用户名"
          size="default"
          style="width: 200px"
          clearable
          @input="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </div>
      <div class="header-right">
        <el-button type="primary" @click="openCreateDialog">
          <el-icon><Plus /></el-icon>
          新增用户
        </el-button>
      </div>
    </div>

    <div class="content-card">
      <el-table v-loading="loading" :data="users" style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="username" label="用户名" width="120" />
        <el-table-column prop="anonymous_name" label="显示名称" width="120" />
        <el-table-column prop="real_name" label="真实姓名" width="100" />
        <el-table-column prop="phone" label="手机号" width="130" />
        <el-table-column prop="company_name" label="公司" min-width="120" />
        <el-table-column prop="position" label="职位" width="100" />
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
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" text size="small" @click="openEditDialog(row)">编辑</el-button>
            <el-button
              type="danger"
              text
              size="small"
              @click="toggleUserStatus(row)"
            >
              {{ row.is_active ? '禁用' : '启用' }}
            </el-button>
            <el-button type="danger" text size="small" @click="handleDelete(row)">删除</el-button>
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
      width="500px"
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
        <el-form-item label="真实姓名" prop="real_name">
          <el-input v-model="form.real_name" placeholder="请输入真实姓名" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="form.phone" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="公司名称" prop="company_name">
          <el-input v-model="form.company_name" placeholder="请输入公司名称" />
        </el-form-item>
        <el-form-item label="职位" prop="position">
          <el-input v-model="form.position" placeholder="请输入职位" />
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
import { getUserList, createUser, updateUser, deleteUser, updateUserStatus, type UserListItem } from '@/api/user'
import type { UserRole } from '@/api/auth'

const loading = ref(false)
const submitLoading = ref(false)
const dialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref<FormInstance>()

const searchKeyword = ref('')
const currentPage = ref(1)
const pageSize = ref(20)
const total = ref(0)

const users = ref<UserListItem[]>([])
const currentUserId = ref<number | null>(null)

const form = reactive({
  username: '',
  password: '',
  anonymous_name: '',
  real_name: '',
  phone: '',
  email: '',
  role: 'user' as UserRole,
  company_name: '',
  position: ''
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
      keyword: searchKeyword.value || undefined
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

function openEditDialog(row: UserListItem) {
  isEdit.value = true
  currentUserId.value = row.id
  form.username = row.username
  form.anonymous_name = row.anonymous_name || ''
  form.real_name = row.real_name || ''
  form.phone = row.phone || ''
  form.email = row.email || ''
  form.role = row.role
  form.company_name = row.company_name || ''
  form.position = row.position || ''
  dialogVisible.value = true
}

function resetForm() {
  formRef.value?.resetFields()
  form.username = ''
  form.password = ''
  form.anonymous_name = ''
  form.real_name = ''
  form.phone = ''
  form.email = ''
  form.role = 'user'
  form.company_name = ''
  form.position = ''
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
          company_name: form.company_name || undefined,
          anonymous_name: form.anonymous_name || undefined,
          real_name: form.real_name || undefined,
          position: form.position || undefined
        })
        ElMessage.success('更新成功')
      } else {
        await createUser({
          username: form.username,
          password: form.password,
          phone: form.phone || undefined,
          email: form.email || undefined,
          role: form.role,
          company_name: form.company_name || undefined,
          anonymous_name: form.anonymous_name || undefined,
          real_name: form.real_name || undefined,
          position: form.position || undefined
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

async function handleDelete(row: UserListItem) {
  try {
    await ElMessageBox.confirm(`确定删除用户 ${row.username}？`, '警告', {
      type: 'warning',
      confirmButtonText: '删除',
      cancelButtonText: '取消'
    })
    await deleteUser(row.id)
    ElMessage.success('删除成功')
    fetchUsers()
  } catch {
    // 取消
  }
}

async function toggleUserStatus(row: UserListItem) {
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
  margin-bottom: 20px;
}

.header-right :deep(.el-button) {
  background: #1a1a1a;
  border-color: #1a1a1a;
}

.content-card {
  background: #ffffff;
  border-radius: 10px;
  padding: 20px;
  border: 1px solid #f0f0f0;
}

.content-card :deep(.el-table th) {
  background: #fafbfc;
  color: #595959;
  font-weight: 500;
  font-size: 13px;
  padding: 14px 0;
}

.content-card :deep(.el-table td) {
  padding: 14px 0;
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
