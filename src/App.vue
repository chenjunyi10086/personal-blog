<template>
  <div id="app">
    <!-- 导航栏 -->
    <header class="header">
      <div class="container">
        <div class="logo">
          <h1>chenjunyi的博客</h1>
        </div>
        <nav class="nav">
          <router-link to="/" class="nav-link" active-class="active">首页</router-link>
          <router-link to="/music" class="nav-link" active-class="active">音乐</router-link>
          <router-link to="/study" class="nav-link" active-class="active">学习</router-link>
          <router-link to="/gallery" class="nav-link" active-class="active">图片</router-link>
          <router-link to="/video" class="nav-link" active-class="active">视频</router-link>
          <router-link to="/game" class="nav-link" active-class="active">小游戏</router-link>


        </nav>
      </div>
    </header>

    <!-- 主要内容区域 -->
    <main class="main">
      <router-view />
    </main>

    <!-- 页脚 -->
    <footer class="footer">
      <div class="container">
        <p>&copy; 2025 chenjunyi的个人博客. All rights reserved.</p>
        <p>用心记录生活，分享知识与快乐</p>
      </div>
    </footer>
  </div>
</template>

<script>
/**
 * 应用程序根组件
 * 定义整个应用的基本布局结构，包括导航栏、内容区域和页脚
 */
export default {
  name: 'App'  // 组件名称，用于调试和开发工具识别
}
</script>

<style>
/* 全局样式重置 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;  /* 内边距和边框包含在元素总宽度内 */
}

/* 页面主体样式 */
body {
  font-family: 'Helvetica Neue', Arial, sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);  /* 紫色渐变背景 */
  min-height: 100vh;
}

/* 应用根容器 - 使用flexbox实现粘性页脚 */
#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;  /* 垂直布局：头部、内容、页脚 */
}

/* 通用容器类 - 响应式布局 */
.container {
  max-width: 1200px;  /* 最大宽度限制 */
  margin: 0 auto;     /* 水平居中 */
  padding: 0 20px;    /* 左右内边距 */
}

/* 导航栏样式 */
.header {
  background: rgba(255, 255, 255, 0.95);  /* 半透明白色背景 */
  backdrop-filter: blur(10px);           /* 毛玻璃效果 */
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);  /* 阴影效果 */
  position: sticky;      /* 粘性定位，滚动时固定在顶部 */
  top: 0;               /* 固定在顶部 */
  z-index: 100;         /* 确保在其他元素之上 */
}

/* 导航栏内容布局 */
.header .container {
  display: flex;
  justify-content: space-between;  /* 左右分布 */
  align-items: center;             /* 垂直居中 */
  padding: 1rem 20px;             /* 内边距 */
}

/* 网站标题样式 */
.logo h1 {
  color: #764ba2;      /* 主题紫色 */
  font-size: 1.8rem;   /* 字体大小 */
  font-weight: bold;    /* 加粗 */
}

/* 导航菜单布局 */
.nav {
  display: flex;
  gap: 2rem;           /* 导航项间距 */
}

/* 导航链接样式 */
.nav-link {
  text-decoration: none;  /* 移除下划线 */
  color: #333;           /* 默认文字颜色 */
  font-weight: 500;      /* 字体粗细 */
  padding: 0.5rem 1rem;  /* 内边距 */
  border-radius: 8px;    /* 圆角 */
  transition: all 0.3s ease;  /* 平滑过渡效果 */
}

/* 导航链接悬停效果 */
.nav-link:hover {
  background: rgba(118, 75, 162, 0.1);  /* 淡紫色背景 */
  color: #764ba2;                         /* 紫色文字 */
}

/* 当前页面导航链接样式 */
.nav-link.active {
  background: #764ba2;  /* 紫色背景 */
  color: white;          /* 白色文字 */
}

/* 主要内容区域 */
.main {
  flex: 1;           /* 占据剩余空间 */
  padding: 2rem 0;   /* 上下内边距 */
}

/* 页脚样式 */
.footer {
  background: rgba(255, 255, 255, 0.95);  /* 半透明白色背景 */
  text-align: center;                      /* 文字居中 */
  padding: 1.5rem 0;                       /* 内边距 */
  margin-top: auto;    /* 推到底部，实现粘性页脚 */
}

/* 页脚文字样式 */
.footer p {
  color: #666;      /* 灰色文字 */
  margin: 0.3rem 0; /* 上下间距 */
}

/* 响应式设计 */
@media (max-width: 768px) {
  .header .container {
    flex-direction: column;
    gap: 1rem;
  }
  
  .nav {
    flex-wrap: wrap;
    justify-content: center;
    gap: 1rem;
  }
  
  .page-title {
    font-size: 2rem;
  }
  
  .grid {
    grid-template-columns: 1fr;
  }
}
</style>