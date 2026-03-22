# Findings - 账务系统

## 用户需求
1. 代币预充值系统，用户提前充值代币
2. 消耗代币的消费方式

## 充值与划拨规则
| 角色 | 充值（自己） | 划拨（他人） |
|------|-------------|-------------|
| Admin | ✅ 可以 | ✅ 可以给任何人划拨，包括自己 |
| VIP（专业组） | ✅ 可以 | ✅ 可以给下属充值，不能给其他人 |
| User（普通用户） | ✅ 可以 | ❌ 不能 |

## 现有代码结构

### 用户角色系统 (src/stores/user.ts)
```typescript
const isAdmin = computed(() => userInfo.value?.role === 'admin')
const isVip = computed(() => userInfo.value?.role === 'vip')
const isUser = computed(() => userInfo.value?.role === 'user')
const isAdminOrVip = computed(() => isAdmin.value || isVip.value)
const canAccessAdmin = computed(() => isAdmin.value || isVip.value)
```

### 用户数据结构 (src/api/auth.ts)
```typescript
interface User {
  id: number
  username: string
  role: 'admin' | 'vip' | 'user'
  vip_id?: number  // 所属VIP分组ID，user角色特有
  // ...
}
```

### 现有 Billing.vue (src/views/user/Billing.vue)
- 当前为空壳页面，显示"账单查询功能开发中"
- 需要完全重写

### 现有 API 模块
- 无 billing 相关 API
- API 目录：auth.ts, user.ts, vip.ts, oss.ts, vision.ts, masterpiece.ts, config.ts

## 待后端实现的API接口

### 1. 余额查询
- GET /api/v1/billing/balance
- 返回: { balance: number, user_id: number }

### 2. 充值
- POST /api/v1/billing/recharge
- 请求: { amount: number } (充值金额)
- 返回: { balance: number, transaction_id: string }

### 3. 划拨 (管理员/VIP)
- POST /api/v1/billing/transfer
- 请求: { target_user_id: number, amount: number }
- 权限: Admin可划拨给任何人，VIP只能划拨给vip_id一致的用户

### 4. 消费记录查询
- GET /api/v1/billing/records
- 参数: ?page=1&page_size=20&type=all|income|expense
- 返回: { records: Transaction[], total: number }

### 5. 交易记录结构
```typescript
interface Transaction {
  id: string
  type: 'recharge' | 'transfer_in' | 'transfer_out' | 'consume'
  amount: number
  balance_after: number
  description: string
  related_user_id?: number  // 划拨时对方用户ID
  created_at: string
}
```

## 业务规则（已确认）
- 兑换比例：待定
- 扣费方式：按量扣费（根据处理图片数量/大小）
- 支付渠道：待定/模拟（暂不接入真实支付）
- 充值档次：固定+任意（提供快捷选项，也可自定义金额）

## API接口设计（给后端）

### 1. 余额查询
- GET /api/v1/billing/balance
- 响应: { balance: number, user_id: number }

### 2. 充值
- POST /api/v1/billing/recharge
- 请求: { amount: number } (人民币金额，元为单位)
- 响应: { balance: number, coins: number, transaction_id: string }

### 3. 划拨 (管理员/VIP)
- POST /api/v1/billing/transfer
- 请求: { target_user_id: number, amount: number } (代币数量)
- 权限:
  - Admin: 可划拨给任何人
  - VIP: 只能划拨给vip_id一致的用户（下属）
- 响应: { success: boolean, balance: number }

### 4. 消费记录查询
- GET /api/v1/billing/records
- 参数: ?page=1&page_size=20&type=all|income|expense
- 响应: { records: Transaction[], total: number, page: number }

### 5. 交易记录结构
```typescript
interface Transaction {
  id: string
  type: 'recharge' | 'transfer_in' | 'transfer_out' | 'consume'
  amount: number  // 正数表示收入，负数表示支出
  balance_after: number
  description: string
  related_user_id?: number  // 划拨时对方用户ID
  related_user_name?: string
  created_at: string
}
```

### 6. 消费扣费 (内部接口)
- POST /api/v1/billing/consume
- 请求: { amount: number, description: string, feature: string }
- 响应: { success: boolean, balance: number, transaction_id: string }

### 7. 用户列表查询（用于划拨）
- GET /api/v1/billing/users (仅Admin)
- GET /api/v1/billing/sub-users (仅VIP，返回下属用户)
- 响应: { users: { id, username, role }[] }
