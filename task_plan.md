# 任务计划：主厨相机 - 基础模板搭建

## 目标

搭建主厨相机项目基础模板，包含：
1. 登录页面
2. PC 端管理控制台（admin/vip 可访问）
3. 移动端页面（公开可浏览，未登录点击按钮弹登录提示）

---

## 一、权限体系

### 权限矩阵

| 角色 | PC 端管理控制台 | 移动端 | 数据范围 |
|------|----------------|--------|----------|
| admin | ✅ 全功能 | ✅ 全功能 | 全部数据 |
| vip | ✅ 全功能 | ✅ 全功能 | 旗下 user 数据 |
| user | ❌ 跳转移动端 | ✅ 展示+功能 | 仅自己数据 |

### 权限层级

```
admin (管理员)
  └── vip (分组) - 下属 user
        └── user (终端客户) - 归属 vip
              └── 未分配 → 散客分组 (默认)
```

---

## 二、端功能划分

### PC 端 - 管理控制台

| 模块 | 权限 | 说明 |
|------|------|------|
| 仪表盘 | admin + vip | 数据概览 |
| 系统设置 | 仅 admin | API Key、技术配置 |
| 功能配置 | 仅 admin | 功能开关、参数 |
| 系统运维 | 仅 admin | 维护工具 |
| 数据维护 | 仅 admin | 账户、图库、数据 |
| 数据查询 | admin + vip | 下级账单、图库、操作日志 |
| 任务审核 | admin + vip | 审核客户提交的高清任务 |

### 移动端 - 终端客户

| 模块 | 说明 | 登录要求 |
|------|------|----------|
| 首页 | 功能入口、效果展示 | 否 |
| 大师成相 | 完整 6 步流程 | 步骤 3 起需登录 |
| 我的图库 | 上传/查看/下载/删除 | 是 |
| 个人信息 | 账户信息维护 | 是 |
| 任务队列 | 查看任务状态 | 是 |

---

## 三、大师成相 - 完整流程

### 入口
- 移动端首页，不管登录与否都显示「大师成相」入口

### Step 1: 介绍页
- 展示效果对比图（随手拍 → 高清菜品图）
- 底部放置操作流程说明

### Step 2: 上传图片
- 客户通过手机相册上传菜品图
- 上传完成后显示「开始备菜」按钮

### Step 3: AI 菜品识别
- 调用 API 提交图片给大模型
- 返回 4-5 项菜品内容识别结果
- 客户确认准确性，可修改后提交
- 提交后显示「继续备餐」按钮

### Step 4: 备菜队列
- 任务进入后端队列，显示等待状态
- 客户可关闭页面，任务继续执行
- **后端执行流程**：
  1. 提交内容向量化
  2. 向量数据库匹配背景图
  3. 匹配 N 个菜品图作为参考
  4. 生图模型生成多张图片

### Step 5: 图片选择
- 客户在任务队列看到生成的图片（多张）
- 可选择一张或多张
- 提交「高清出餐」按钮

### Step 6: 高清化 + 审核
- 提交所选图片到高清大模型
- 根据客户设置决定审核模式：
  - 自动审核：直接生成
  - 手动审核：需 admin 在 PC 后台审核
- 完成后客户可在任务队列和图库中查看/下载

---

## 四、开发阶段

### Phase 1: 需求分析与设计 ✅
- [x] 理解用户需求
- [x] 确定权限设计方案（admin/vip/user 三级）
- [x] 确定端功能划分（PC 管理后台 vs 移动端客户）
- [x] 设计路由结构
- [x] 设计页面结构
- [x] 后端权限 API 确认（role 字段已确认）

### Phase 2: 基础框架搭建 ✅ (当前)
- [x] 路由结构设计与实现
- [x] 权限守卫实现
- [x] 响应式布局基础
- [x] 登录认证流程（角色跳转）
- [x] 布局组件（MobileLayout, AdminLayout）
- [x] 登录提示弹窗组件
- [x] 移动端页面框架
- [x] 管理后台页面框架

### Phase 3: 大师成相功能开发 (待定)
- [ ] 介绍页完善
- [ ] 上传组件完善
- [ ] AI 识别结果页
- [ ] 任务队列页
- [ ] API 对接

### Phase 4: 图库与个人信息 (待定)
- [ ] 我的图库功能完善
- [ ] 个人信息页完善
- [ ] API 对接

### Phase 5: PC 管理后台完善 (待定)
- [ ] 各管理模块完善
- [ ] API 对接

### Phase 6: 测试与部署 (待定)
- [ ] 功能测试
- [ ] 权限测试
- [ ] 部署上线

---

## 五、已创建文件

### 路由与状态
| 文件 | 说明 |
|------|------|
| `src/router/index.ts` | 路由配置，含守卫 |
| `src/stores/user.ts` | 用户状态，含角色判断 |
| `src/api/auth.ts` | 认证 API，含角色类型 |

### 布局组件
| 文件 | 说明 |
|------|------|
| `src/layouts/MobileLayout.vue` | 移动端布局+底部导航 |
| `src/layouts/AdminLayout.vue` | PC 管理后台布局+侧边栏 |

### 公共组件
| 文件 | 说明 |
|------|------|
| `src/components/LoginTipModal.vue` | 登录提示弹窗 |

### 移动端页面
| 文件 | 说明 |
|------|------|
| `src/views/mobile/Home.vue` | 首页 |
| `src/views/mobile/Gallery.vue` | 我的图库 |
| `src/views/mobile/Profile.vue` | 个人信息 |
| `src/views/mobile/masterpiece/Index.vue` | 大师成相介绍页 |
| `src/views/mobile/masterpiece/Upload.vue` | 上传图片 |
| `src/views/mobile/masterpiece/Recognize.vue` | AI 识别确认 |
| `src/views/mobile/masterpiece/Queue.vue` | 任务队列 |

### 管理后台页面
| 文件 | 说明 |
|------|------|
| `src/views/admin/Dashboard.vue` | 仪表盘 |
| `src/views/admin/users/UserList.vue` | 用户管理 |
| `src/views/admin/users/VipList.vue` | VIP 管理 |
| `src/views/admin/config/SystemConfig.vue` | 系统配置 |
| `src/views/admin/config/FeatureConfig.vue` | 功能配置 |
| `src/views/admin/system/Maintenance.vue` | 系统运维 |
| `src/views/admin/query/DataQuery.vue` | 数据查询 |
| `src/views/admin/audit/TaskAudit.vue` | 任务审核 |

### 其他
| 文件 | 说明 |
|------|------|
| `src/views/Login.vue` | 登录页（含角色跳转） |
| `src/views/NotFound.vue` | 404 页面 |
| `src/api/oss.ts` | OSS 上传 API |
| `src/router.d.ts` | 路由类型声明 |

---

## 六、待讨论/待开发

1. **大师成相 API 对接**：需与后端确认具体接口
2. **任务队列 API**：需后端实现
3. **图库 API**：需后端实现
4. **VIP 分组关联 API**：需后端实现