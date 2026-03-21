# CLAUDE.md

本文件为 Claude Code (claude.ai/code) 提供代码工作指导。

# 主厨相机 - 前端

## 项目概述

- **项目名称**：主厨相机
- **项目类型**：SaaS 应用（PC + 移动端）
- **核心功能**：菜品图片美化与营销素材生成
- **未来规划**：微信小程序

## 技术栈

- Vue 3 (Composition API + `<script setup>`)
- TypeScript
- Vite
- Element Plus（PC 端）
- Pinia（状态管理）
- Vue Router

## 目录结构

```
frontend/                      # 前端项目（当前目录）
├── src/
│   ├── api/                 # API 调用模块
│   │   ├── request.ts      # Axios 实例配置
│   │   ├── auth.ts         # 认证 API
│   │   ├── user.ts         # 用户管理 API
│   │   ├── vip.ts          # VIP 管理 API
│   │   ├── oss.ts          # 文件上传 API
│   │   ├── vision.ts       # 视觉 AI API
│   │   └── masterpiece.ts   # 大师成相 API
│   ├── stores/              # Pinia 状态管理
│   │   └── user.ts         # 用户状态
│   ├── router/              # Vue Router 配置
│   │   └── index.ts        # 路由守卫
│   ├── layouts/             # 布局组件
│   │   ├── MobileLayout.vue # 移动端布局
│   │   └── AdminLayout.vue  # PC 管理后台布局
│   ├── views/               # 页面组件
│   │   ├── mobile/         # 移动端页面
│   │   │   ├── Home.vue
│   │   │   ├── Gallery.vue
│   │   │   ├── Profile.vue
│   │   │   └── masterpiece/ # 大师成相流程
│   │   └── admin/          # PC 管理后台页面
│   │       ├── Dashboard.vue
│   │       ├── users/      # 用户管理
│   │       ├── config/     # 系统配置
│   │       ├── query/      # 数据查询
│   │       ├── audit/      # 任务审核
│   │       └── system/     # 系统运维
│   └── styles/
│       └── variables.css   # CSS 变量
└── ...
```

## 常用命令

```bash
npm run dev      # 开发服务器 http://localhost:5174
npm run build    # 生产构建
npm run preview  # 预览构建结果
```

## 端口配置

- 前端：`http://localhost:5174`
- 后端 API：`http://localhost:8001`
- Vite 代理：`/api` → `http://localhost:8001/api`

## API 集成

### 基础路径
- API 基础路径：`/api/v1`
- Axios 实例配置在 `src/api/request.ts`

### 认证流程
1. 登录：`POST /api/v1/auth/login` → 获取 `access_token` + `refresh_token`
2. 请求头：`Authorization: Bearer <token>`
3. Token 有效期：Access Token 1小时，Refresh Token 7天
4. 401 响应：自动跳转登录页

### 核心 API 模块

| 模块 | 路径 | 说明 |
|------|------|------|
| 认证 | `/api/v1/auth/*` | 登录/注册/刷新/登出 |
| 用户 | `/api/v1/users/*` | 用户信息/头像/密码 |
| VIP | `/api/v1/vips/*` | VIP 管理（需管理员） |
| Vision | `/api/v1/vision/*` | 图片生成/理解/超分 |
| OSS | `/api/v1/oss/*` | 文件上传 |
| Masterpiece | `/api/v1/masterpiece/*` | 大师成相任务 |
| Config | `/api/v1/config/*` | 系统配置（需管理员） |
| LLM | `/api/v1/llm/*` | 大模型对话（需管理员） |
| Library | `/api/v1/library/*` | 图片库（需管理员） |
| Vector | `/api/v1/vector/*` | 向量检索（需管理员） |

详见 `../API_INTEGRATION.md`

## 开发规范

### 新增页面
1. 移动端页面：`src/views/mobile/` 添加 `.vue` 文件
2. 管理后台页面：`src/views/admin/` 添加 `.vue` 文件
3. `src/router/index.ts` 添加路由（注意布局组件：移动端用 `MobileLayout`，管理后台用 `AdminLayout`）

### 新增 API
1. `src/api/` 添加 API 模块文件
2. 使用 `request.ts` 封装的 Axios 实例

### 任务状态轮询
Vision 和 Masterpiece 任务是异步的，需要轮询状态：
- 状态：`pending` → `generating` → `done` / `failed`
- 轮询间隔建议：2-3秒

## 文档维护

- **API 文档**：`../API_INTEGRATION.md` - **只读**，由后端负责维护
- **共享信息**：`../SHARED_INFO.md` - 与后端共同维护，实现功能后及时录入
- **本项目职责**：及时读取 API 文档了解接口变更，前端实现的功能录入 SHARED_INFO.md

## 参考文档

- 后端 Swagger API 文档：`http://localhost:8001/docs`
- API 对接文档：`../API_INTEGRATION.md`（由后端维护）
- 共享信息文档：`../SHARED_INFO.md`（与后端共同维护）
- 后端源码：`../backend/`

---

## Design Context

### 用户
专业餐饮从业者（厨师长、餐饮品牌运营者），需要在移动端快速将随手拍的菜品图转化为专业摄影级别的营销素材。

### 品牌个性
**专业 · 高端 · 信赖**

### 美学方向
- **主题**：浅色模式为主，参考高端餐厅品牌 + 专业摄影器材官网 + Apple 产品风格
- **特征**：大量留白、克制优雅、精致的微交互、清晰的信息层级

### 设计禁忌
- ❌ 紫蓝渐变背景（AI 感）
- ❌ Emoji 装饰图标
- ❌ 卡片嵌套卡片
- ❌ 居中对称的 hero 布局
- ❌ 圆角过大的按钮和卡片

### 设计原则
1. **内容优先**：界面设计服务于菜品图片展示
2. **克制优雅**：避免过度装饰，用间距和留白创造呼吸感
3. **可预期性**：遵循常见移动端交互模式
4. **精致细节**：按钮、输入框、过渡动画都应体现高端品质感
5. **功能明确**：每个操作入口清晰
