<template>
  <div class="page-container">
    <div class="page-header">
      <h1 class="page-title">欢迎来到chenjunyi的博客</h1>
      <p class="page-subtitle">记录生活，分享知识，探索世界</p>
    </div>

    <div class="grid">
      <div class="card">
        <h2 class="card-title">🎵 音乐世界</h2>
        <p>分享我喜欢的音乐，从古典到流行，从摇滚到电子。音乐是生活的调味剂，让每一天都充满旋律。</p>
        <router-link to="/music" class="btn">探索音乐</router-link>
      </div>

      <div class="card">
        <h2 class="card-title">📚 学习笔记</h2>
        <p>编程技巧、技术分享、读书心得。在这里记录我的学习历程，希望对你有所帮助。</p>
        <router-link to="/study" class="btn">查看笔记</router-link>
      </div>

      <div class="card">
        <h2 class="card-title">📸 图片展示</h2>
        <p>生活中的美好瞬间，旅行中的风景照片，用镜头记录这个世界的精彩。</p>
        <router-link to="/gallery" class="btn">浏览图片</router-link>
      </div>

      <div class="card">
        <h2 class="card-title">🎬 视频分享</h2>
        <p>有趣的视频内容，生活记录，技术教程。在这里发现更多精彩内容。</p>
        <router-link to="/video" class="btn">观看视频</router-link>
      </div>

      <div class="card">
        <h2 class="card-title">🎮 小游戏</h2>
        <p>休闲小游戏，放松心情。简单有趣的游戏让你在工作学习之余得到放松。</p>
        <router-link to="/game" class="btn">开始游戏</router-link>
      </div>

      <div class="card">
        <h2 class="card-title">👨‍💻 关于我</h2>
        <p>我是chenjunyi，一个热爱编程、喜欢运动和创作的开发者。喜欢探索新技术，分享生活点滴。</p>
        <div class="about-info">
          <p><strong>技能：</strong>JavaScript, Vue3, React, Node.js</p>
          <p><strong>爱好：</strong>编程、乒乓球、视频剪辑、音乐</p>
          <p><strong>目标：</strong>希望学好前端，成为一名优秀的前端工程师</p>
          <p><strong>座右铭：</strong>学而时习之，不亦说乎</p>
        </div>
      </div>
    </div>

    <div class="card latest-updates">
      <h2 class="card-title">📝 最新动态</h2>
      <div class="timeline">
        <div class="timeline-item">
          <div class="timeline-date">2025-12-26</div>
          <div class="timeline-content">
            <h4>博客网站正式上线</h4>
            <p>使用Vue3构建的个人博客网站，包含音乐、学习、图片、视频、游戏等多个模块。</p>
          </div>
        </div>
        <div class="timeline-item">
          <div class="timeline-date">2025-12-25</div>
          <div class="timeline-content">
            <h4>学习Vue3框架</h4>
            <p>深入学习Vue3的Composition API，掌握了更现代的前端开发方式。</p>
          </div>
        </div>
        <div class="timeline-item">
          <div class="timeline-date">2025-12-20</div>
          <div class="timeline-content">
            <h4>完成小游戏开发</h4>
            <p>使用纯JavaScript开发了几个有趣的小游戏，包括贪吃蛇、2048等。</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
/**
 * 首页组件
 * 展示个人博客的主要功能入口和最新动态
 */
export default {
  name: 'Home'  // 组件名称
}
</script>

<style scoped>
.btn {
  display: inline-block;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 0.8rem 1.5rem;
  border-radius: 8px;
  text-decoration: none;
  margin-top: 1rem;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(118, 75, 162, 0.3);
}

.about-info {
  margin-top: 1rem;
}

.about-info p {
  margin: 0.5rem 0;
  color: #666;
}

.latest-updates {
  margin-top: 2rem;
}

.timeline {
  position: relative;
  padding-left: 2rem;
}

.timeline::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 2px;
  background: #764ba2;
}

.timeline-item {
  position: relative;
  margin-bottom: 2rem;
}

.timeline-item::before {
  content: '';
  position: absolute;
  left: -2.5rem;
  top: 0;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #764ba2;
  border: 3px solid white;
  box-shadow: 0 0 0 3px rgba(118, 75, 162, 0.2);
}

.timeline-date {
  font-size: 0.9rem;
  color: #764ba2;
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.timeline-content h4 {
  color: #333;
  margin-bottom: 0.5rem;
}

.timeline-content p {
  color: #666;
  line-height: 1.6;
}
</style>