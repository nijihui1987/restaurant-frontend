# 主厨相机 - 前端部署文档

## 一、项目概述

- **项目名称**：主厨相机
- **项目类型**：Vue 3 + TypeScript + Vite SaaS 应用
- **核心功能**：菜品图片美化与营销素材生成（PC + 移动端）
- **技术栈**：Vue 3、TypeScript、Vite、Element Plus、Pinia、Vue Router

## 二、环境要求

| 环境 | 版本要求 |
|------|----------|
| Node.js | >= 18.0.0 |
| npm | >= 9.0.0 |

推荐使用 nvm 管理 Node.js 版本：
```bash
nvm install 18
nvm use 18
```

## 三、目录结构

```
frontend/
├── dist/                    # 构建产物（部署时使用）
├── src/
│   ├── api/                # API 调用模块
│   │   ├── auth.ts         # 认证 API
│   │   ├── user.ts         # 用户管理 API
│   │   ├── billing.ts      # 账务 API
│   │   ├── masterpiece.ts   # 大师成相 API
│   │   ├── config.ts       # 系统配置 API
│   │   ├── gallery.ts      # 图库 API
│   │   ├── oss.ts          # 文件上传 API
│   │   ├── vip.ts         # VIP API
│   │   ├── vision.ts       # AI 视觉 API
│   │   └── request.ts      # Axios 封装
│   ├── stores/             # Pinia 状态管理
│   ├── layouts/            # 布局组件
│   │   ├── MobileLayout.vue   # 移动端布局
│   │   └── UserLayout.vue     # PC 用户布局
│   ├── views/              # 页面组件
│   │   ├── mobile/         # 移动端页面
│   │   ├── user/           # PC 用户功能页面
│   │   └── admin/          # PC 管理后台页面
│   ├── router/             # 路由配置
│   └── styles/              # 样式文件
│       └── variables.css    # CSS 变量（主题配置）
├── index.html
├── vite.config.ts
├── package.json
└── tsconfig.json
```

## 四、本地开发

### 1. 安装依赖

```bash
cd frontend
npm install
```

### 2. 配置环境变量（如需要）

复制环境变量模板：
```bash
cp .env.example .env
```

编辑 `.env` 文件：
```env
# API 代理地址（开发环境使用 Vite 内置代理）
VITE_API_BASE_URL=/api/v1

# 是否启用 HTTPS
VITE_USE_HTTPS=false
```

### 3. 启动开发服务器

```bash
npm run dev
```

访问地址：`http://localhost:5174`

### 4. API 配置说明

开发环境下，Vite 内置代理将 `/api` 请求转发到后端服务器。

配置文件：`vite.config.ts`
```typescript
proxy: {
  '/api': {
    target: 'http://localhost:8001',  # 后端地址
    changeOrigin: true
  }
}
```

## 五、构建部署

### 1. 安装依赖

```bash
cd frontend
npm install
```

### 2. 构建生产版本

```bash
npm run build
```

构建产物输出到 `dist/` 目录。

### 3. 部署方式

#### 方式一：Nginx 部署

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # 前端静态文件
    root /path/to/frontend/dist;
    index index.html;

    # SPA fallback
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API 代理
    location /api/ {
        proxy_pass http://backend:8001/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

#### 方式二：Docker 部署

创建 `Dockerfile`：
```dockerfile
FROM nginx:alpine
COPY dist/ /usr/share/nginx/html/
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

创建 `nginx.conf`：
```nginx
server {
    listen 80;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://backend:8001/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }
}
```

构建并运行：
```bash
docker build -t chef-camera-frontend .
docker run -d -p 80:80 chef-camera-frontend
```

## 六、依赖清单

### 生产依赖

| 依赖 | 版本 | 用途 |
|------|------|------|
| vue | ^3.4 | 核心框架 |
| vue-router | ^4.2 | 路由管理 |
| pinia | ^2.1 | 状态管理 |
| element-plus | ^2.5 | UI 组件库 |
| axios | ^1.6 | HTTP 请求库 |
| marked | ^12.0 | Markdown 解析 |
| dompurify | ^3.3 | XSS 防护 |

### 开发依赖

| 依赖 | 版本 | 用途 |
|------|------|------|
| vite | ^8.0 | 构建工具 |
| typescript | ^5.3 | TypeScript 编译器 |
| vue-tsc | ^2.0 | Vue TypeScript 检查 |
| @vitejs/plugin-vue | ^5.0 | Vite Vue 插件 |
| @types/node | ^20.0 | Node.js 类型 |
| @types/dompurify | ^3.0 | DOMPurify 类型 |

## 七、关键配置

### 1. API 地址配置

**开发环境**：`vite.config.ts` 中的 proxy 配置

**生产环境**：Nginx/Docker 代理配置

### 2. Cookie 配置

后端 `.env` 中的 Cookie 安全设置：
```env
REFRESH_TOKEN_COOKIE_SECURE=false  # 开发环境设为 false
```

**注意**：生产环境务必设为 `true`，并使用 HTTPS。

### 3. 主题配置

CSS 变量定义在 `src/styles/variables.css`：
```css
:root {
  /* 颜色变量 */
  --color-primary: #C4956A;
  --bg-page: #fafbfc;
  --bg-surface: #ffffff;
  /* ... */
}
```

## 八、常见问题

### 1. 登录后跳转回登录页

**原因**：Cookie 未正确设置

**排查步骤**：
1. 打开浏览器开发者工具 → Application → Cookies
2. 检查是否有 `access_token` 和 `refresh_token` Cookie
3. 确认后端 `REFRESH_TOKEN_COOKIE_SECURE` 配置正确

**解决方案**：
- 开发环境：`REFRESH_TOKEN_COOKIE_SECURE=false`
- 生产环境：`REFRESH_TOKEN_COOKIE_SECURE=true` + HTTPS

### 2. API 请求 401 未认证

**原因**：Token 未正确传递

**排查步骤**：
1. 检查浏览器 Network 中请求的 `Authorization` header
2. 确认 Cookie 中的 `access_token` 存在

### 3. 构建失败 TypeScript 错误

如遇到 TypeScript 类型错误，可跳过检查直接构建：
```bash
npx vite build
```

或修复类型错误后重新构建。

## 九、联系方式

如有问题，请联系后端负责人。

---

**文档版本**：1.0.0
**更新日期**：2026-03-26
