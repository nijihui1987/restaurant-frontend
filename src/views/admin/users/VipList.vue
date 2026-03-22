<template>
  <div class="vip-management">
    <div class="page-header">
      <div class="header-right">
        <el-button type="primary" @click="openCreateDialog">
          <el-icon><Plus /></el-icon>
          新增专业组
        </el-button>
      </div>
    </div>

    <div class="content-card">
      <el-table v-loading="loading" :data="vipList" style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="username" label="VIP 名称" />
        <el-table-column prop="company_name" label="公司" />
        <el-table-column prop="phone" label="手机号" />
        <el-table-column prop="user_count" label="下属用户" width="100" />
        <el-table-column prop="image_count" label="图片数量" width="100" />
        <el-table-column prop="task_count" label="任务数量" width="100" />
        <el-table-column prop="is_active" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.is_active ? 'success' : 'info'" size="small">
              {{ row.is_active ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="创建时间" width="120">
          <template #default="{ row }">
            {{ formatDate(row.created_at) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" text size="small" @click="openEditDialog(row)">编辑</el-button>
            <el-button type="primary" text size="small" @click="viewUsers(row)">下属用户</el-button>
            <el-button type="danger" text size="small" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 专业组编辑弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑专业组' : '新增专业组'"
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
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="form.phone" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" placeholder="请输入邮箱" />
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
    <el-dialog v-model="usersDialogVisible" title="下属用户" width="600px">
      <el-table :data="vipUsers" style="width: 100%" max-height="400">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="username" label="用户名" />
        <el-table-column prop="phone" label="手机号" />
        <el-table-column prop="company_name" label="公司" />
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
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { getVipList, createVip, updateVip, deleteVip, getVipUsers, type VipInfo } from '@/api/vip'

const loading = ref(false)
const submitLoading = ref(false)
const dialogVisible = ref(false)
const usersDialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref<FormInstance>()

const vipList = ref<VipInfo[]>([])
const vipUsers = ref<any[]>([])
const currentVipId = ref<number | null>(null)

const form = reactive({
  username: '',
  password: '',
  phone: '',
  email: '',
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
  form.phone = row.phone || ''
  form.email = row.email || ''
  form.company_name = row.company_name || ''
  dialogVisible.value = true
}

function resetForm() {
  formRef.value?.resetFields()
  form.username = ''
  form.password = ''
  form.phone = ''
  form.email = ''
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
          email: form.email || undefined,
          company_name: form.company_name || undefined
        })
        ElMessage.success('更新成功')
      } else {
        await createVip({
          username: form.username,
          password: form.password,
          phone: form.phone || undefined,
          email: form.email || undefined,
          company_name: form.company_name || undefined
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

async function handleDelete(row: VipInfo) {
  try {
    await ElMessageBox.confirm(`确定删除专业组 ${row.username}？`, '警告', {
      type: 'warning',
      confirmButtonText: '删除',
      cancelButtonText: '取消'
    })
    await deleteVip(row.id)
    ElMessage.success('删除成功')
    fetchVipList()
  } catch {
    // 取消
  }
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
  justify-content: flex-end;
  align-items: center;
  margin-bottom: 20px;
}

.page-header :deep(.el-button) {
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
</style>
