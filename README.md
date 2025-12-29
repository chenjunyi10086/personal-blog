# chenjunyi的个人博客

这是一个使用Vue3构建的现代个人博客网站，包含音乐、学习笔记、图片展示、视频分享和小游戏等功能模块。

## 🚀 项目特性

- **现代化设计**: 使用Vue3 + Vite构建，响应式布局，美观大方
- **多页面应用**: 包含6个主要功能页面
- **丰富功能**: 音乐播放、学习笔记、图片画廊、视频展示、小游戏等
- **交互体验**: 流畅的页面切换动画和用户交互
- **可扩展性**: 支持用户添加内容，易于维护和扩展

## 📁 项目结构

```
personal-blog/
├── public/                 # 静态资源
├── src/
│   ├── views/            # 页面组件
│   │   ├── Home.vue      # 首页
│   │   ├── Music.vue     # 音乐页面
│   │   ├── Study.vue     # 学习笔记
│   │   ├── Gallery.vue   # 图片展示
│   │   ├── Video.vue     # 视频分享
│   │   └── Game.vue      # 小游戏
│   ├── App.vue           # 根组件
│   ├── main.js           # 入口文件
│   └── style.css         # 全局样式
├── index.html            # HTML模板
├── vite.config.js        # Vite配置
├── package.json          # 依赖配置
└── README.md            # 项目文档
```

## 🛠️ 技术栈

- **前端框架**: Vue 3
- **构建工具**: Vite
- **路由管理**: Vue Router 4
- **UI组件**: Element Plus
- **样式技术**: CSS3, HTML5, JavaScript ES6+
- **图标库**: Element Plus Icons

## 📦 安装与运行

### 环境要求

- Node.js 16+
- npm 或 yarn

### 安装依赖

```bash
cd personal-blog
npm install
```

### 开发模式

```bash
npm run dev
```

项目将在 http://localhost:3000 启动

### 构建生产版本

```bash
npm run build
```

### 预览生产版本

```bash
npm run preview
```

## 🎯 功能模块

### 1. 首页 (Home)
- 个人介绍和欢迎信息
- 各功能模块入口卡片
- 最新动态时间线
- 个人技能展示

### 2. 音乐世界 (Music)
- 在线音乐播放器
- 播放列表管理
- 音乐分类展示（摇滚、古典、流行、电子）
- 支持添加自定义音乐链接

### 3. 学习笔记 (Study)
- 前端开发笔记
- 算法学习总结
- 读书笔记和评价
- 技术资源推荐
- 支持添加新的学习笔记

### 4. 图片展示 (Gallery)
- 分类图片展示（风景、人物、美食、旅行）
- 图片点击放大预览
- 图片信息展示
- 支持添加新的图片链接

### 5. 视频分享 (Video)
- 精选视频展示
- 视频分类管理
- 视频播放功能
- 点赞、分享、收藏功能
- 视频统计信息
- 支持添加新的视频链接

### 6. 小游戏 (Game)
- **2048游戏**: 经典数字合并游戏
- **贪吃蛇**: 复古贪吃蛇游戏
- **记忆翻牌**: 记忆力训练游戏
- **打字速度**: 打字速度测试游戏
- 游戏统计和最佳成绩记录

## 🎨 设计特色

- **渐变背景**: 使用紫色渐变营造现代感
- **卡片布局**: 所有内容采用卡片式设计
- **响应式设计**: 完美适配桌面和移动设备
- **动画效果**: 平滑的页面切换和悬停效果
- **色彩搭配**: 协调的紫色主题配色

## 🔧 自定义配置

### 修改个人信息
在 `src/views/Home.vue` 中修改个人介绍信息：

```vue
<!-- 修改个人信息 -->
<h2 class="card-title">👨‍💻 关于我</h2>
<p>我是chenjunyi，一个热爱编程、喜欢音乐和摄影的开发者...</p>
```

### 添加新功能模块
1. 在 `src/views/` 下创建新的Vue组件
2. 在 `src/main.js` 中添加路由配置
3. 在 `src/App.vue` 中添加导航链接

### 修改样式主题
在 `src/App.vue` 和 `src/style.css` 中修改CSS变量和样式。

## 📱 响应式设计

项目采用移动优先的响应式设计：

- **桌面端**: 完整功能和布局
- **平板端**: 适应性布局调整
- **手机端**: 优化的移动体验

## 🚀 部署指南

### Vercel部署
1. 将代码推送到GitHub
2. 在Vercel中导入项目
3. 自动部署完成

### Netlify部署
1. 运行 `npm run build`
2. 将 `dist` 文件夹上传到Netlify
3. 配置重定向规则

### 服务器部署
1. 运行 `npm run build`
2. 将 `dist` 文件夹内容部署到Web服务器
3. 配置HTTPS和域名

## 🤝 贡献指南

欢迎提交Issue和Pull Request来改进项目：

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 👨‍💻 作者

**chenjunyi** - 个人博客项目

- 邮箱: your-email@example.com
- GitHub: https://github.com/your-username

## 🙏 致谢

感谢所有开源项目的贡献者，特别是：

- Vue.js 团队
- Element Plus 团队  
- Vite 开发团队

---

⭐ 如果这个项目对你有帮助，请给个Star！