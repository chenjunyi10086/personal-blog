/**
 * 学习资料库
 * 提供各种编程学习资源和预设内容
 */

export const programmingResources = {
  frontend: [
    {
      id: 'vue-official',
      title: 'Vue.js 官方文档',
      url: 'https://cn.vuejs.org/',
      description: 'Vue.js 官方中文文档，最权威的学习资料',
      type: 'documentation',
      difficulty: 'intermediate',
      tags: ['Vue', '文档', '前端'],
      rating: 5,
      duration: '20小时',
      author: 'Vue.js Team',
      lastUpdated: '2024-01-01'
    },
    {
      id: 'vue-mastery',
      title: 'Vue Mastery',
      url: 'https://www.vuemastery.com/',
      description: 'Vue.js 视频教程平台，从入门到精通',
      type: 'video',
      difficulty: 'beginner',
      tags: ['Vue', '视频教程', '前端'],
      rating: 5,
      duration: '40小时',
      author: 'Vue Mastery',
      price: '免费+付费'
    },
    {
      id: 'css-tricks',
      title: 'CSS-Tricks',
      url: 'https://css-tricks.com/',
      description: 'CSS 技巧和最佳实践，前端开发者必备',
      type: 'blog',
      difficulty: 'intermediate',
      tags: ['CSS', '前端', '技巧'],
      rating: 5,
      duration: '持续学习',
      author: 'CSS-Tricks Team',
      price: '免费'
    },
    {
      id: 'javascript-info',
      title: 'JavaScript.info',
      url: 'https://javascript.info/',
      description: '现代 JavaScript 教程，从基础到高级',
      type: 'tutorial',
      difficulty: 'beginner',
      tags: ['JavaScript', '教程', '前端'],
      rating: 5,
      duration: '50小时',
      author: 'Ilya Kantor',
      price: '免费'
    }
  ],
  
  backend: [
    {
      id: 'nodejs-official',
      title: 'Node.js 官方文档',
      url: 'https://nodejs.org/docs/',
      description: 'Node.js 官方文档，包含完整 API 参考',
      type: 'documentation',
      difficulty: 'intermediate',
      tags: ['Node.js', '后端', '文档'],
      rating: 5,
      duration: '30小时',
      author: 'OpenJS Foundation',
      price: '免费'
    },
    {
      id: 'express-guide',
      title: 'Express.js 指南',
      url: 'https://expressjs.com/zh-cn/',
      description: 'Express.js 中文官方指南，快速搭建 Web 应用',
      type: 'tutorial',
      difficulty: 'beginner',
      tags: ['Express', 'Node.js', '后端'],
      rating: 4,
      duration: '15小时',
      author: 'Express.js Team',
      price: '免费'
    },
    {
      id: 'mongodb-university',
      title: 'MongoDB University',
      url: 'https://university.mongodb.com/',
      description: 'MongoDB 官方在线课程，包含免费认证',
      type: 'course',
      difficulty: 'intermediate',
      tags: ['MongoDB', '数据库', 'NoSQL'],
      rating: 4,
      duration: '40小时',
      author: 'MongoDB',
      price: '免费'
    }
  ],
  
  algorithm: [
    {
      id: 'leetcode',
      title: 'LeetCode',
      url: 'https://leetcode.cn/',
      description: '算法练习平台，包含海量编程题目',
      type: 'practice',
      difficulty: 'intermediate',
      tags: ['算法', '练习', '面试'],
      rating: 5,
      duration: '持续练习',
      author: 'LeetCode',
      price: '免费+付费'
    },
    {
      id: 'algorithm-visualizer',
      title: '算法可视化',
      url: 'https://visualgo.net/zh',
      description: '算法可视化工具，直观理解算法原理',
      type: 'tool',
      difficulty: 'beginner',
      tags: ['算法', '可视化', '工具'],
      rating: 5,
      duration: '20小时',
      author: 'Dr Steven Halim',
      price: '免费'
    },
    {
      id: 'cp-algorithms',
      title: 'Competitive Programming Algorithms',
      url: 'https://cp-algorithms.com/',
      description: '竞赛算法大全，包含各种高级算法实现',
      type: 'documentation',
      difficulty: 'advanced',
      tags: ['算法', '竞赛', '高级'],
      rating: 5,
      duration: '100小时',
      author: 'Community',
      price: '免费'
    }
  ]
}

export const defaultLearningNotes = [
  {
    id: 'vue3-reactive-note',
    title: 'Vue 3 响应式原理学习笔记',
    category: 'frontend',
    tags: ['Vue', '响应式', 'JavaScript', 'Proxy'],
    content: `## Vue 3 响应式原理

### 核心：Proxy 和 Reflect

Vue 3 使用 Proxy 来实现响应式系统，相比 Vue 2 的 Object.defineProperty 有以下优势：

1. **可以监听数组变化**
2. **可以监听对象属性的添加和删除**
3. **更好的性能**

### 基本实现

\`\`\`javascript
function reactive(obj) {
  return new Proxy(obj, {
    get(target, key) {
      track(target, key) // 收集依赖
      return target[key]
    },
    set(target, key, value) {
      target[key] = value
      trigger(target, key) // 触发更新
      return true
    }
  })
}
\`\`\`

### 依赖收集和触发

- **track()**: 收集当前 effect 依赖的属性
- **trigger()**: 当属性变化时，触发相关的 effect

### ref 和 reactive

- **ref**: 用于基础类型的响应式
- **reactive**: 用于对象的响应式

这是 Vue 3 响应式系统的核心原理，理解这一点对深入使用 Vue 很重要。`,
    codeExample: `// ref 的使用
import { ref, reactive } from 'vue'

const count = ref(0)
const state = reactive({
  name: 'Vue 3',
  version: '3.0'
})

// 修改值
count.value = 1
state.name = 'Vue 3 Composition API'`,
    importance: 5,
    date: new Date().toISOString(),
    views: 0,
    likes: 0
  },
  {
    id: 'js-async-patterns',
    title: 'JavaScript 异步编程模式',
    category: 'frontend',
    tags: ['JavaScript', '异步', 'Promise', 'Async/Await'],
    content: `## JavaScript 异步编程

### 回调函数 (Callback)

最早的异步处理方式，容易造成回调地狱。

\`\`\`javascript
getData(function(a) {
    getMoreData(a, function(b) {
        getMoreData(b, function(c) { 
            console.log(c);
        });
    });
});
\`\`\`

### Promise

链式调用，避免回调地狱。

\`\`\`javascript
getData()
  .then(a => getMoreData(a))
  .then(b => getMoreData(b))
  .then(c => console.log(c))
  .catch(error => console.error(error));
\`\`\`

### Async/Await

语法糖，让异步代码看起来像同步代码。

\`\`\`javascript
async function fetchData() {
  try {
    const a = await getData();
    const b = await getMoreData(a);
    const c = await getMoreData(b);
    console.log(c);
  } catch (error) {
    console.error(error);
  }
}
\`\`\`

### 最佳实践

1. 优先使用 async/await
2. 合理使用 Promise.all 处理并发
3. 做好错误处理`,
    codeExample: `// 并发请求示例
async function fetchMultipleUrls(urls) {
  try {
    const responses = await Promise.all(
      urls.map(url => fetch(url))
    );
    
    const data = await Promise.all(
      responses.map(res => res.json())
    );
    
    return data;
  } catch (error) {
    console.error('请求失败:', error);
  }
}`,
    importance: 4,
    date: new Date().toISOString(),
    views: 0,
    likes: 0
  },
  {
    id: 'css-flexbox-guide',
    title: 'CSS Flexbox 完全指南',
    category: 'frontend',
    tags: ['CSS', 'Flexbox', '布局', '前端'],
    content: `## CSS Flexbox 布局

Flexbox 是一维布局方法，可以轻松实现灵活的布局。

### 容器属性

#### display: flex
将元素设置为 flex 容器。

#### flex-direction
决定主轴方向：
- \`row\` (默认): 水平方向
- \`column\`: 垂直方向
- \`row-reverse\`: 水平反向
- \`column-reverse\`: 垂直反向

#### justify-content
主轴对齐方式：
- \`flex-start\`: 起点对齐
- \`flex-end\`: 终点对齐
- \`center\`: 居中对齐
- \`space-between\`: 两端对齐
- \`space-around\`: 环绕对齐
- \`space-evenly\`: 均匀对齐

#### align-items
交叉轴对齐方式：
- \`flex-start\`: 起点对齐
- \`flex-end\`: 终点对齐
- \`center\`: 居中对齐
- \`stretch\`: 拉伸填满
- \`baseline\`: 基线对齐

### 项目属性

#### flex
是 flex-grow, flex-shrink, flex-basis 的简写。

\`\`\`css
.item {
  flex: 1 1 300px; /* 增长 收缩 基础宽度 */
}
\`\`\`

### 常用布局模式

#### 1. 水平居中
\`\`\`css
.container {
  display: flex;
  justify-content: center;
  align-items: center;
}
\`\`\`

#### 2. 三栏布局
\`\`\`css
.container {
  display: flex;
}
.left { flex: 1; }
.center { flex: 2; }
.right { flex: 1; }
\`\`\`

Flexbox 让复杂布局变得简单！`,
    codeExample: `<style>
.card-container {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
  justify-content: space-between;
}

.card {
  flex: 1 1 300px;
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}
</style>

<div class="card-container">
  <div class="card">卡片1</div>
  <div class="card">卡片2</div>
  <div class="card">卡片3</div>
</div>`,
    importance: 4,
    date: new Date().toISOString(),
    views: 0,
    likes: 0
  },
  {
    id: 'nodejs-event-loop',
    title: 'Node.js 事件循环详解',
    category: 'backend',
    tags: ['Node.js', '事件循环', '异步', '后端'],
    content: `## Node.js 事件循环

Node.js 是单线程的，但通过事件循环实现非阻塞 I/O。

### 事件循环阶段

1. **Timers**: setTimeout, setInterval
2. **Pending Callbacks**: I/O 回调
3. **Idle, Prepare**: 内部使用
4. **Poll**: 获取新的 I/O 事件
5. **Check**: setImmediate 回调
6. **Close Callbacks**: 关闭回调

### setTimeout vs setImmediate

\`\`\`javascript
setTimeout(() => {
  console.log('timeout');
}, 0);

setImmediate(() => {
  console.log('immediate');
});
\`\`\`

输出顺序不确定，取决于事件循环阶段。

### process.nextTick

在当前操作结束后立即执行，优先级最高。

\`\`\`javascript
console.log('start');

process.nextTick(() => {
  console.log('nextTick');
});

console.log('end');

// 输出: start, end, nextTick
\`\`\`

### 微任务 vs 宏任务

- **微任务**: Promise.then, process.nextTick
- **宏任务**: setTimeout, setImmediate

微任务优先级更高。

理解事件循环对 Node.js 开发很重要！`,
    codeExample: `const fs = require('fs');

console.log('start');

// 微任务
Promise.resolve().then(() => {
  console.log('promise');
});

// 宏任务
setTimeout(() => {
  console.log('timeout');
}, 0);

// I/O 操作
fs.readFile(__filename, () => {
  console.log('file read');
});

console.log('end');

// 输出顺序：start, end, promise, file read, timeout`,
    importance: 5,
    date: new Date().toISOString(),
    views: 0,
    likes: 0
  },
  {
    id: 'sorting-algorithms',
    title: '常用排序算法总结',
    category: 'algorithm',
    tags: ['算法', '排序', '数据结构', '面试'],
    content: `## 排序算法对比

### 1. 冒泡排序
- **时间复杂度**: O(n²)
- **空间复杂度**: O(1)
- **稳定性**: 稳定
- **适用场景**: 小规模数据，基本有序

\`\`\`javascript
function bubbleSort(arr) {
  const n = arr.length;
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
      }
    }
  }
  return arr;
}
\`\`\`

### 2. 快速排序
- **时间复杂度**: O(n log n) 平均
- **空间复杂度**: O(log n)
- **稳定性**: 不稳定
- **适用场景**: 大规模随机数据

\`\`\`javascript
function quickSort(arr) {
  if (arr.length <= 1) return arr;
  
  const pivot = arr[0];
  const left = [];
  const right = [];
  
  for (let i = 1; i < arr.length; i++) {
    if (arr[i] < pivot) left.push(arr[i]);
    else right.push(arr[i]);
  }
  
  return [...quickSort(left), pivot, ...quickSort(right)];
}
\`\`\`

### 3. 归并排序
- **时间复杂度**: O(n log n)
- **空间复杂度**: O(n)
- **稳定性**: 稳定
- **适用场景**: 链表排序，外部排序

### 选择建议

- 小数据量：插入排序
- 一般场景：快速排序
- 稳定性要求：归并排序
- 内存受限：堆排序`,
    codeExample: `// 性能测试
function testSort() {
  const arr = Array.from({length: 10000}, () => Math.random() * 1000);
  
  console.time('sort');
  quickSort(arr);
  console.timeEnd('sort');
}

// 内置排序
const numbers = [5, 2, 8, 1, 9];
numbers.sort((a, b) => a - b);
console.log(numbers); // [1, 2, 5, 8, 9]`,
    importance: 4,
    date: new Date().toISOString(),
    views: 0,
    likes: 0
  }
]

export const learningPaths = [
  {
    id: 'frontend-path',
    title: '前端开发学习路径',
    description: '从零基础到前端工程师的完整学习路径',
    duration: '6个月',
    level: 'beginner',
    courses: [
      'HTML5 & CSS3 基础',
      'JavaScript 基础编程',
      'ES6+ 新特性',
      'Vue.js 框架学习',
      '前端工程化实践',
      '性能优化技巧'
    ],
    resources: programmingResources.frontend.slice(0, 3)
  },
  {
    id: 'fullstack-path',
    title: '全栈开发学习路径',
    description: '前后端兼顾的全栈工程师培养计划',
    duration: '12个月',
    level: 'intermediate',
    courses: [
      '前端框架深入',
      'Node.js 后端开发',
      '数据库设计',
      'RESTful API 设计',
      '部署与运维',
      '项目管理实践'
    ],
    resources: [...programmingResources.frontend.slice(0, 2), ...programmingResources.backend.slice(0, 2)]
  }
]

export const difficultyColors = {
  beginner: '#67c23a',
  intermediate: '#e6a23c', 
  advanced: '#f56c6c'
}

export const typeIcons = {
  documentation: '📖',
  tutorial: '🎯',
  video: '🎬',
  course: '🎓',
  practice: '💪',
  tool: '🔧',
  blog: '📝'
}