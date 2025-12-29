# 🚀 快速启动指南

## 📋 环境要求

- **Node.js**: 16.0+ 
- **npm**: 7.0+
- **现代浏览器**: Chrome, Firefox, Safari, Edge

## ⚡ 快速开始

### 1. 安装依赖
```bash
npm install
```

### 2. 启动开发服务器
```bash
npm run dev
```

### 3. 访问应用
打开浏览器访问：`http://localhost:3000`

## 🔧 开发说明

- 项目使用 Vite 构建工具，支持热重载
- 修改源代码后浏览器自动刷新
- 开发服务器端口默认为 3000

## 📦 生产部署

### 构建项目
```bash
npm run build
```

### 预览构建结果
```bash
npm run preview
```

## 📁 项目结构

```
personal-blog/
├── public/          # 静态资源
├── src/             # 源代码
│   ├── views/     # 页面组件
│   ├── utils/     # 工具函数
│   ├── App.vue    # 根组件
│   ├── main.js    # 入口文件
│   └── style.css  # 全局样式
├── package.json     # 项目配置
├── vite.config.js   # 构建配置
└── index.html      # HTML模板
```

## 🎯 功能模块

- **首页**: 个人介绍和导航
- **音乐**: 在线播放器和歌单管理
- **学习**: 笔记管理和学习资源
- **图片**: 画廊展示和图片管理
- **视频**: 视频播放和分享
- **游戏**: 趣味小游戏合集

## 🛠️ 技术栈

- Vue 3 + Composition API
- Element Plus UI组件库
- Vue Router 4 路由管理
- Vite 构建工具
- CSS3 渐变设计