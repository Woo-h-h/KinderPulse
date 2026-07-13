<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  Plus,
  Clock,
  Document,
  Reading,
  DataAnalysis,
  HomeFilled,
} from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()
const isCollapsed = ref(false)

const menuItems = [
  {
    path: '/',
    title: '首页',
    icon: HomeFilled,
  },
  {
    title: '周计划',
    icon: Document,
    children: [
      { path: '/weekly-plan/create', title: '新建周计划', icon: Plus },
      { path: '/weekly-plan/history', title: '历史记录', icon: Clock },
    ],
  },
  {
    path: '/curriculum',
    title: '课程资源库',
    icon: Reading,
  },
  {
    path: '/research',
    title: '教研档案',
    icon: DataAnalysis,
  },
]

const activeMenu = computed(() => {
  if (route.path.startsWith('/weekly-plan')) return '/weekly-plan/create'
  return route.path
})

function navigateTo(path: string) {
  router.push(path)
}
</script>

<template>
  <el-container class="app-layout">
    <!-- 侧边栏 -->
    <el-aside :width="isCollapsed ? '64px' : '220px'" class="app-aside">
      <div class="aside-header">
        <span v-show="!isCollapsed" class="aside-title">🏫 附幼智能平台</span>
        <span v-show="isCollapsed" class="aside-title-compact">🏫</span>
      </div>

      <el-menu
        :default-active="activeMenu"
        :collapse="isCollapsed"
        :collapse-transition="false"
        background-color="#304156"
        text-color="#bfcbd9"
        active-text-color="#409EFF"
        router
      >
        <template v-for="item in menuItems" :key="item.title">
          <!-- 有子菜单 -->
          <el-sub-menu v-if="'children' in item" :index="item.title">
            <template #title>
              <el-icon><component :is="item.icon" /></el-icon>
              <span>{{ item.title }}</span>
            </template>
            <el-menu-item
              v-for="child in item.children"
              :key="child.path"
              :index="child.path"
              @click="navigateTo(child.path)"
            >
              <el-icon><component :is="child.icon" /></el-icon>
              <span>{{ child.title }}</span>
            </el-menu-item>
          </el-sub-menu>

          <!-- 无子菜单 -->
          <el-menu-item v-else :index="item.path!" @click="navigateTo(item.path!)">
            <el-icon><component :is="item.icon" /></el-icon>
            <span>{{ item.title }}</span>
          </el-menu-item>
        </template>
      </el-menu>

      <div class="aside-toggle" @click="isCollapsed = !isCollapsed">
        <el-icon :size="18">
          <component :is="isCollapsed ? 'DArrowRight' : 'DArrowLeft'" />
        </el-icon>
      </div>
    </el-aside>

    <!-- 主内容 -->
    <el-container class="app-main-container">
      <el-header class="app-header">
        <el-breadcrumb separator="/">
          <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item v-if="route.meta.title">{{ route.meta.title }}</el-breadcrumb-item>
        </el-breadcrumb>
      </el-header>

      <el-main class="app-main">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<style scoped>
.app-layout {
  height: 100vh;
}

.app-aside {
  background-color: #304156;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: width 0.3s;
}

.aside-header {
  padding: 16px;
  text-align: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.aside-title {
  color: #fff;
  font-size: 18px;
  font-weight: 600;
  white-space: nowrap;
}

.aside-title-compact {
  color: #fff;
  font-size: 20px;
}

.aside-toggle {
  margin-top: auto;
  padding: 12px;
  text-align: center;
  color: #bfcbd9;
  cursor: pointer;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  transition: color 0.2s;
}

.aside-toggle:hover {
  color: #fff;
}

.app-main-container {
  flex-direction: column;
}

.app-header {
  background: #fff;
  display: flex;
  align-items: center;
  padding: 0 24px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  z-index: 1;
}

.app-main {
  background: #f0f2f5;
  padding: 24px;
  overflow-y: auto;
}

.el-menu {
  border-right: none;
}
</style>
