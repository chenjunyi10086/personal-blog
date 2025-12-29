/**
 * 应用程序入口文件
 * 负责创建Vue应用实例、配置路由、注册插件等核心初始化工作
 */

// 导入Vue3核心功能
import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'  // Vue Router路由管理

// 导入UI组件库
import ElementPlus from 'element-plus'                          // Element Plus组件库
import 'element-plus/dist/index.css'                           // Element Plus样式文件

// 导入应用根组件和全局样式
import App from './App.vue'                                     // 根组件
import './style.css'                                           // 全局样式

// ==================== 页面组件导入 ====================
import Home from './views/Home.vue'           // 首页组件
import Music from './views/Music.vue'         // 音乐页面组件
import Study from './views/Study.vue'         // 学习笔记页面组件
import Gallery from './views/Gallery.vue'      // 图片展示页面组件
import Video from './views/Video.vue'         // 视频分享页面组件
import Game from './views/Game.vue'           // 小游戏页面组件



// ==================== 路由配置 ====================
const routes = [
  { path: '/', name: 'Home', component: Home },                    // 首页路由
  { path: '/music', name: 'Music', component: Music },            // 音乐页面路由
  { path: '/study', name: 'Study', component: Study },            // 学习页面路由
  { path: '/gallery', name: 'Gallery', component: Gallery },      // 图片页面路由
  { path: '/video', name: 'Video', component: Video },            // 视频页面路由
  { path: '/game', name: 'Game', component: Game },              // 游戏页面路由

]

// 创建路由实例 - 使用HTML5 History模式
const router = createRouter({
  history: createWebHistory(),  // 使用HTML5 History API，URL更美观
  routes                       // 路由配置数组
})

// ==================== 应用实例创建和配置 ====================
const app = createApp(App)  // 创建Vue应用实例

// 注册插件
app.use(ElementPlus)  // 注册Element Plus UI组件库
app.use(router)       // 注册路由插件

// 挂载应用到DOM元素
app.mount('#app')     // 将应用挂载到index.html中的#app元素