<template>
  <el-dialog
    v-model="visible"
    title="提示"
    width="320px"
    :close-on-click-modal="true"
    @closed="onClosed"
  >
    <div class="modal-content">
      <div class="modal-icon">🔐</div>
      <p class="modal-message">您还未登录，请先登录后继续操作</p>
    </div>
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="goToLogin">去登录</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const router = useRouter()

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

function goToLogin() {
  visible.value = false
  router.push('/login')
}

function onClosed() {
  visible.value = false
}
</script>

<style scoped>
.modal-content {
  text-align: center;
  padding: 20px 0;
}

.modal-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.modal-message {
  color: #666;
  font-size: 15px;
  margin: 0;
}
</style>