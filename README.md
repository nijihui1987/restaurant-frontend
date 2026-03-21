# 餐饮视觉工作台前端

Vue 3 + TypeScript 前端应用，用于餐饮品牌视觉管理和营销素材生成。

## 技术栈

- Vue 3 (Composition API + `<script setup>`)
- TypeScript
- Vite
- Element Plus
- Pinia (状态管理)
- Vue Router

## 开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览构建结果
npm run preview
```

## 项目结构

```
src/
├── api/           # API 调用
├── stores/        # Pinia 状态
├── router/        # 路由配置
├── layouts/       # 布局组件
├── views/         # 页面组件
└── styles/        # 样式文件
```

## 端口配置

- 前端开发服务器：`http://localhost:5174`
- 后端 API：`http://localhost:8001`
- API 代理：`/api` → `http://localhost:8001/api`

## 参考文档

- [API 对接文档](../API_INTEGRATION.md)
- [共享信息文档](../SHARED_INFO.md)
