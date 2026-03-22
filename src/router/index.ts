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

    // ========== 移动端/客户端路由 ==========
    {
      path: '/',
      component: () => import('@/layouts/MobileLayout.vue'),
      meta: { requiresAuth: false },
      children: [
        {
          path: '',
          name: 'home',
          component: () => import('@/views/mobile/Home.vue')
        },
        // 教程
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
        // 我的图库
        {
          path: 'gallery',
          name: 'gallery',
          component: () => import('@/views/mobile/Gallery.vue'),
          meta: { requiresAuth: true }
        },
        // 个人信息
        {
          path: 'profile',
          name: 'profile',
          component: () => import('@/views/mobile/Profile.vue'),
          meta: { requiresAuth: true }
        }
      ]
    },

    // ========== PC 管理后台路由 (admin/vip) ==========
    {
      path: '/admin',
      component: () => import('@/layouts/AdminLayout.vue'),
      meta: { requiresAuth: true, requiresAdmin: true },
      children: [
        {
          path: '',
          name: 'admin-dashboard',
          component: () => import('@/views/admin/Dashboard.vue')
        },
        {
          path: 'users',
          name: 'admin-users',
          component: () => import('@/views/admin/users/UserList.vue')
        },
        {
          path: 'vip',
          name: 'admin-vip',
          component: () => import('@/views/admin/users/VipList.vue')
        },
        {
          path: 'config',
          name: 'admin-config',
          component: () => import('@/views/admin/config/SystemConfig.vue'),
          meta: { requiresAdmin: true }
        },
        {
          path: 'features',
          name: 'admin-features',
          component: () => import('@/views/admin/config/FeatureConfig.vue'),
          meta: { requiresAdmin: true }
        },
        {
          path: 'maintenance',
          name: 'admin-maintenance',
          component: () => import('@/views/admin/system/Maintenance.vue'),
          meta: { requiresAdmin: true }
        },
        {
          path: 'query',
          name: 'admin-query',
          component: () => import('@/views/admin/query/DataQuery.vue')
        },
        {
          path: 'audit',
          name: 'admin-audit',
          component: () => import('@/views/admin/audit/TaskAudit.vue')
        }
      ]
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
    // 非 admin/vip 用户重定向到移动端首页
    return '/'
  }

  // 继续导航
  return true
})

export default router