import { createRouter, createWebHistory } from 'vue-router'
import { watch } from 'vue'
import { useUserStore } from '@/stores/user'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // ========== 公开路由 ==========
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/Login.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('@/views/Register.vue'),
      meta: { requiresAuth: false }
    },

    // ========== 用户端路由 + 管理后台路由（统一使用 ResponsiveLayout） ==========
    {
      path: '/',
      component: () => import('@/layouts/ResponsiveLayout.vue'),
      meta: { requiresAuth: false },
      children: [
        // ========== 公开页面 ==========
        {
          path: '',
          name: 'home',
          component: () => import('@/views/mobile/Home.vue')
        },
        {
          path: 'tutorial',
          name: 'tutorial',
          component: () => import('@/views/mobile/Tutorial.vue')
        },
        // 大师成相
        {
          path: 'masterpiece',
          name: 'masterpiece',
          component: () => import('@/views/mobile/masterpiece/Index.vue')
        },
        {
          path: 'masterpiece/upload',
          name: 'masterpiece-upload',
          component: () => import('@/views/mobile/masterpiece/Upload.vue'),
          meta: { requiresAuth: true }
        },
        {
          path: 'masterpiece/recognize',
          name: 'masterpiece-recognize',
          component: () => import('@/views/mobile/masterpiece/Recognize.vue'),
          meta: { requiresAuth: true }
        },
        {
          path: 'masterpiece/queue',
          name: 'masterpiece-queue',
          component: () => import('@/views/mobile/masterpiece/Queue.vue'),
          meta: { requiresAuth: true }
        },
        // 用户页面（需登录）
        {
          path: 'gallery',
          name: 'gallery',
          component: () => import('@/views/mobile/Gallery.vue'),
          meta: { requiresAuth: true }
        },
        {
          path: 'profile',
          name: 'profile',
          component: () => import('@/views/mobile/Profile.vue'),
          meta: { requiresAuth: true }
        },
        {
          path: 'billing',
          name: 'billing',
          component: () => import('@/views/user/Billing.vue'),
          meta: { requiresAuth: true }
        },
        {
          path: 'gallery-pc',
          name: 'gallery-pc',
          component: () => import('@/views/user/Gallery.vue'),
          meta: { requiresAuth: true }
        },
        // ========== 新功能页面 ==========
        {
          path: 'masterpiece',
          name: 'masterpiece',
          component: () => import('@/views/user/Masterpiece.vue'),
          meta: { requiresAuth: true }
        },
        {
          path: 'masterpiece-tasks',
          name: 'masterpiece-tasks',
          component: () => import('@/views/user/MasterpieceTasks.vue'),
          meta: { requiresAuth: true }
        },
        {
          path: 'batch',
          name: 'batch',
          component: () => import('@/views/user/Batch.vue'),
          meta: { requiresAuth: true }
        },
        {
          path: 'enhance',
          name: 'enhance',
          component: () => import('@/views/user/Enhance.vue'),
          meta: { requiresAuth: true }
        },
        {
          path: 'wechat',
          name: 'wechat',
          component: () => import('@/views/user/Wechat.vue'),
          meta: { requiresAuth: true }
        },
        {
          path: 'dianping',
          name: 'dianping',
          component: () => import('@/views/user/Dianping.vue'),
          meta: { requiresAuth: true }
        },
        {
          path: 'douyin',
          name: 'douyin',
          component: () => import('@/views/user/Douyin.vue'),
          meta: { requiresAuth: true }
        },
        {
          path: 'menu',
          name: 'menu',
          component: () => import('@/views/user/Menu.vue'),
          meta: { requiresAuth: true }
        },
        // ========== 专业组页面（VIP）==========
        {
          path: 'customers',
          name: 'customers',
          component: () => import('@/views/vip/Customers.vue'),
          meta: { requiresAuth: true, requiresVip: true }
        },
        // ========== 管理页面（admin）==========
        {
          path: 'dashboard',
          name: 'dashboard',
          component: () => import('@/views/admin/Dashboard.vue'),
          meta: { requiresAuth: true, requiresAdmin: true }
        },
        {
          path: 'users',
          name: 'users',
          component: () => import('@/views/admin/users/UserList.vue'),
          meta: { requiresAuth: true, requiresAdmin: true }
        },
        {
          path: 'vip',
          name: 'vip',
          component: () => import('@/views/admin/users/VipList.vue'),
          meta: { requiresAuth: true, requiresAdmin: true }
        },
        {
          path: 'config',
          name: 'config',
          component: () => import('@/views/admin/config/SystemConfig.vue'),
          meta: { requiresAuth: true, requiresAdmin: true }
        },
        {
          path: 'features',
          name: 'features',
          component: () => import('@/views/admin/config/FeatureConfig.vue'),
          meta: { requiresAuth: true, requiresAdmin: true }
        },
        {
          path: 'masterpiece-config',
          name: 'masterpiece-config',
          component: () => import('@/views/admin/config/MasterpieceConfig.vue'),
          meta: { requiresAuth: true, requiresAdmin: true }
        },
        {
          path: 'maintenance',
          name: 'maintenance',
          component: () => import('@/views/admin/system/Maintenance.vue'),
          meta: { requiresAuth: true, requiresAdmin: true }
        },
        {
          path: 'query',
          name: 'query',
          component: () => import('@/views/admin/query/DataQuery.vue'),
          meta: { requiresAuth: true, requiresAdminOrVip: true }
        },
        {
          path: 'audit',
          name: 'audit',
          component: () => import('@/views/admin/audit/TaskAudit.vue'),
          meta: { requiresAuth: true, requiresAdmin: true }
        }
      ]
    },

    // ========== 兼容旧路径 /admin ==========
    {
      path: '/admin',
      redirect: '/dashboard'
    },

    // ========== 404 ==========
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/views/NotFound.vue')
    }
  ]
})

// 路由守卫
router.beforeEach(async (to, _from) => {
  const userStore = useUserStore()

  // 如果有 token 但 userInfo 还没加载，等待加载完成
  if (userStore.token && userStore.isLoading) {
    await new Promise<void>(resolve => {
      const unwatch = watch(
        () => userStore.isLoading,
        (loading) => {
          if (!loading) {
            unwatch()
            resolve()
          }
        },
        { immediate: true }
      )
    })
  }

  // 需要登录的页面
  if (to.meta.requiresAuth && !userStore.isLoggedIn) {
    return '/login'
  }

  // 已登录访问登录页，跳转首页
  if (to.path === '/login' && userStore.isLoggedIn) {
    return '/'
  }

  // 需要 admin/vip 权限的页面
  if (to.meta.requiresAdmin && !userStore.canAccessAdmin) {
    // 非 admin/vip 用户重定向到首页
    return '/'
  }

  // 需要 admin 或 vip 权限的页面
  if (to.meta.requiresAdminOrVip && !userStore.canAccessAdmin && !userStore.isVip) {
    // 非 admin 且非 vip 用户重定向到首页
    return '/'
  }

  // 需要 VIP 权限的页面
  if (to.meta.requiresVip && !userStore.isVip) {
    // 非 VIP 用户重定向到首页
    return '/'
  }

  // 继续导航
  return true
})

export default router