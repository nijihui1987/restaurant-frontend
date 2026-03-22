<template>
  <el-dialog
    :model-value="modelValue"
    title="充值"
    width="420px"
    :close-on-click-modal="false"
    @update:model-value="$emit('update:modelValue', $event)"
    @close="handleClose"
  >
    <div class="recharge-content">
      <!-- 固定金额选项 -->
      <div class="amount-options">
        <span class="option-label">选择充值金额</span>
        <div class="options-grid">
          <div
            v-for="option in computedPresetAmounts"
            :key="option.amount"
            class="amount-option"
            :class="{ selected: selectedAmount === option.amount && !customAmount }"
            @click="selectPreset(option.amount)"
          >
            <span class="rmb">¥{{ option.amount }}</span>
            <span class="coins">{{ option.coins }}</span>
            <span v-if="option.bonus > 0" class="bonus">送 {{ option.bonus }}</span>
          </div>
        </div>
      </div>

      <!-- 自定义金额 -->
      <div class="custom-amount">
        <span class="option-label">自定义金额</span>
        <el-input
          v-model="customAmountInput"
          type="number"
          placeholder="输入金额"
          :min="1"
          @input="onCustomInput"
        >
          <template #prefix>¥</template>
        </el-input>
        <div v-if="customCoins > 0" class="custom-coins-preview">
          预计获得 <strong>{{ customCoins }}</strong>
          <span v-if="customBonus > 0" class="bonus-tag">含赠送 {{ customBonus }}</span>
        </div>
      </div>

      <!-- 充值说明 -->
      <div class="recharge-tip">
        <el-icon :size="14"><InfoFilled /></el-icon>
        <span>
          充值比例：1 元 = {{ configStore.coinExchangeRate }}
          <template v-if="configStore.bulkDiscountThreshold > 0">
            ，满 {{ configStore.bulkDiscountThreshold }} 元额外赠送 {{ configStore.bulkDiscountRate }}%
          </template>
        </span>
      </div>

      <!-- 错误提示 -->
      <div v-if="errorMessage" class="error-message">
        <el-icon :size="14"><CircleCloseFilled /></el-icon>
        <span>{{ errorMessage }}</span>
      </div>
    </div>

    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" :loading="loading" @click="handleRecharge">
        确认充值 ¥{{ displayAmount }}
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { InfoFilled, CircleCloseFilled } from '@element-plus/icons-vue'
import { recharge } from '@/api/billing'
import { useConfigStore } from '@/stores/config'

interface Props {
  modelValue: boolean
  currentBalance: number
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'success', newBalance: number): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const configStore = useConfigStore()

// 预设充值金额（固定几档，不受兑换比例影响）
const presetAmounts = [10, 50, 100, 200, 500]

// 状态
const selectedAmount = ref(10)
const customAmount = ref(false)
const customAmountInput = ref('')
const loading = ref(false)
const errorMessage = ref('')

// 计算预设金额选项（根据配置动态计算）
const computedPresetAmounts = computed(() => {
  return presetAmounts.map(amount => {
    const coins = configStore.calculateCoins(amount)
    const baseCoins = amount * configStore.coinExchangeRate
    const bonus = coins - baseCoins
    return { amount, coins, bonus }
  })
})

// 计算显示金额
const displayAmount = computed(() => {
  if (customAmount.value && customAmountInput.value) {
    return parseFloat(customAmountInput.value)
  }
  return selectedAmount.value
})

// 自定义金额获得的积分
const customCoins = computed(() => {
  if (customAmount.value && customAmountInput.value) {
    return configStore.calculateCoins(parseFloat(customAmountInput.value))
  }
  return 0
})

// 自定义金额的赠送积分
const customBonus = computed(() => {
  if (customAmount.value && customAmountInput.value) {
    const amount = parseFloat(customAmountInput.value)
    const coins = configStore.calculateCoins(amount)
    const baseCoins = amount * configStore.coinExchangeRate
    return coins - baseCoins
  }
  return 0
})

// 选择预设金额
function selectPreset(amount: number) {
  selectedAmount.value = amount
  customAmount.value = false
  customAmountInput.value = ''
  errorMessage.value = ''
}

// 自定义金额输入
function onCustomInput() {
  if (customAmountInput.value) {
    customAmount.value = true
    errorMessage.value = ''
  }
}

// 关闭弹窗
function handleClose() {
  emit('update:modelValue', false)
}

// 充值
async function handleRecharge() {
  const amount = displayAmount.value

  if (!amount || amount <= 0) {
    errorMessage.value = '请输入有效的充值金额'
    return
  }

  loading.value = true
  errorMessage.value = ''

  try {
    const result = await recharge(amount)
    if (result) {
      ElMessage.success(`充值成功，获得 ${result.coins}`)
      emit('success', result.balance)
      handleClose()
    }
  } catch (error: any) {
    errorMessage.value = error.message || '充值失败，请重试'
  } finally {
    loading.value = false
  }
}

// 加载配置
onMounted(() => {
  if (!configStore.loaded) {
    configStore.loadBillingConfig()
  }
})

// 监听弹窗打开，重置状态
watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    selectedAmount.value = 10
    customAmount.value = false
    customAmountInput.value = ''
    loading.value = false
    errorMessage.value = ''
    // 确保配置已加载
    if (!configStore.loaded) {
      configStore.loadBillingConfig()
    }
  }
})
</script>

<style scoped>
.recharge-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}

.option-label {
  display: block;
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin-bottom: var(--space-sm);
}

/* 预设金额选项 */
.options-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-sm);
}

.amount-option {
  padding: var(--space-md);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  text-align: center;
  cursor: pointer;
  transition: all var(--transition-fast);
  position: relative;
}

.amount-option:hover {
  border-color: var(--color-primary);
  background: var(--color-bg-hover);
}

.amount-option.selected {
  border-color: var(--color-primary);
  background: var(--color-primary-bg-light);
}

.amount-option .rmb {
  display: block;
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.amount-option .coins {
  display: block;
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  margin-top: 2px;
}

.amount-option .bonus {
  display: block;
  font-size: 10px;
  color: var(--color-primary);
  margin-top: 2px;
}

/* 自定义金额 */
.custom-amount .el-input {
  width: 100%;
}

.custom-coins-preview {
  margin-top: var(--space-sm);
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.custom-coins-preview strong {
  color: var(--color-primary);
}

.custom-coins-preview .bonus-tag {
  margin-left: 8px;
  padding: 1px 6px;
  background: var(--color-primary-bg-light);
  color: var(--color-primary);
  border-radius: var(--radius-sm);
  font-size: 10px;
}

/* 充值提示 */
.recharge-tip {
  display: flex;
  align-items: flex-start;
  gap: var(--space-sm);
  padding: var(--space-md);
  background: #fafafa;
  border-radius: var(--radius-md);
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
}

.recharge-tip .el-icon {
  flex-shrink: 0;
  margin-top: 1px;
}

/* 错误提示 */
.error-message {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-sm) var(--space-md);
  background: #fff1f0;
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  color: var(--color-error);
}
</style>
