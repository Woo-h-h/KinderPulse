import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'Dashboard',
      component: () => import('@/views/Dashboard.vue'),
      meta: { title: '首页' },
    },
    {
      path: '/weekly-plan',
      redirect: '/weekly-plan/create',
    },
    {
      path: '/weekly-plan/create',
      name: 'WeeklyPlanCreate',
      component: () => import('@/views/weekly-plan/CreatePage.vue'),
      meta: { title: '新建周计划' },
    },
    {
      path: '/weekly-plan/history',
      name: 'WeeklyPlanHistory',
      component: () => import('@/views/weekly-plan/HistoryPage.vue'),
      meta: { title: '历史记录' },
    },
    {
      path: '/curriculum',
      name: 'Curriculum',
      component: () => import('@/views/curriculum/IndexPage.vue'),
      meta: { title: '课程资源库' },
    },
    {
      path: '/research',
      name: 'Research',
      component: () => import('@/views/research/IndexPage.vue'),
      meta: { title: '教研档案' },
    },
  ],
})

export default router
