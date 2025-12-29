<template>
  <div class="page-container">
    <div class="page-header">
      <h1 class="page-title">🎬 视频分享</h1>
      <p class="page-subtitle">精彩视频内容，记录生活点滴</p>
    </div>

    <!-- 搜索和工具栏 -->
    <div class="card">
      <div class="toolbar">
        <div class="search-section">
          <el-input 
            v-model="searchQuery" 
            placeholder="搜索视频标题或描述..."
            prefix-icon="Search"
            clearable
            class="search-input"
          />
        <el-button @click="showUploadDialog = true" type="primary" icon="Upload">
          上传视频
        </el-button>
        <el-button @click="showImportDialog = true" icon="Link">
          导入链接
        </el-button>
        <el-button @click="exportData" icon="Download">
          导出数据
        </el-button>
        <el-button @click="showImportDialog = true" icon="Upload">
          导入数据
        </el-button>
        <el-button @click="addTestVideo" icon="VideoPlay" type="success">
          添加测试视频
        </el-button>
        </div>
        <div class="view-controls">
          <el-select v-model="sortOrder" placeholder="排序方式" size="small">
            <el-option label="最新发布" value="newest"></el-option>
            <el-option label="最多观看" value="views"></el-option>
            <el-option label="最多点赞" value="likes"></el-option>
          </el-select>
          <el-button-group>
            <el-button @click="viewMode = 'grid'" :type="viewMode === 'grid' ? 'primary' : ''" icon="Grid">
              网格
            </el-button>
            <el-button @click="viewMode = 'list'" :type="viewMode === 'list' ? 'primary' : ''" icon="List">
              列表
            </el-button>
          </el-button-group>
        </div>
      </div>
    </div>

    <!-- 精选视频播放器 -->
    <div class="card featured-video-card" v-if="featuredVideo">
      <h2 class="card-title">🎥 正在播放</h2>
      <div class="featured-video">
        <div class="video-player">
          <video 
            ref="videoPlayer"
            controls
            :poster="featuredVideo.thumbnail"
            @play="isPlaying = true"
            @pause="isPlaying = false"
            @ended="onVideoEnded"
            @loadedmetadata="onVideoLoaded"
            @error="onVideoError"
          >
            <source :src="featuredVideo.url" :type="featuredVideo.type || 'video/mp4'">
            您的浏览器不支持视频播放
          </video>
          <div class="video-overlay" v-if="!featuredVideo.url">
            <div class="no-video-message">
              <el-icon size="48"><VideoPlay /></el-icon>
              <p>请选择一个视频进行播放</p>
            </div>
          </div>
          <div class="video-status" v-if="featuredVideo.url">
            <el-tag v-if="featuredVideo.videoSource === 'upload'" type="success" size="small">
              本地文件
            </el-tag>
            <el-tag v-else-if="featuredVideo.videoSource === 'link'" type="info" size="small">
              在线链接
            </el-tag>
            <el-tag v-if="featuredVideo.type" size="small">
              {{ featuredVideo.type }}
            </el-tag>
          </div>
        </div>
        <div class="video-info">
          <div class="video-header">
            <h3>{{ featuredVideo.title }}</h3>
            <el-tag :type="getCategoryType(featuredVideo.category)">
              {{ getCategoryName(featuredVideo.category) }}
            </el-tag>
          </div>
          <div class="video-meta">
            <span><el-icon><Calendar /></el-icon> {{ featuredVideo.date }}</span>
            <span><el-icon><View /></el-icon> {{ formatNumber(featuredVideo.views) }} 次观看</span>
            <span><el-icon><Timer /></el-icon> {{ featuredVideo.duration }}</span>
          </div>
          <div class="video-tags" v-if="featuredVideo.tags && featuredVideo.tags.length">
            <el-tag 
              v-for="tag in featuredVideo.tags" 
              :key="tag"
              size="small"
              class="video-tag"
            >
              {{ tag }}
            </el-tag>
          </div>
          <p class="video-description">{{ featuredVideo.description }}</p>
          <div class="video-actions">
            <el-button @click="likeVideo" :type="isLiked ? 'danger' : 'default'">
              <el-icon><Heart /></el-icon> {{ formatNumber(featuredVideo.likes) }}
            </el-button>
            <el-button @click="shareVideo">
              <el-icon><Share /></el-icon> 分享
            </el-button>
            <el-button @click="collectVideo" :type="isCollected ? 'warning' : 'default'">
              <el-icon><Star /></el-icon> 收藏
            </el-button>
            <el-button @click="downloadVideo" v-if="featuredVideo.url">
              <el-icon><Download /></el-icon> 下载
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 视频分类 -->
    <div class="card">
      <div class="section-header">
        <h2 class="card-title">📂 视频分类</h2>
        <el-button @click="showCategoryDialog = true" type="primary" size="small" icon="Plus">
          添加分类
        </el-button>
      </div>
      <div class="category-tabs">
        <button 
          v-for="category in categories" 
          :key="category.id"
          :class="['tab-btn', { active: activeCategory === category.id }]"
          @click="switchCategory(category.id)"
        >
          <span class="category-icon">{{ category.icon || '📁' }}</span>
          <span class="category-name">{{ category.name }}</span>
          <span class="category-count">({{ getVideoCount(category.id) }})</span>
          <el-button 
            v-if="!isDefaultCategory(category.id) && getVideoCount(category.id) === 0"
            @click.stop="deleteCategory(category.id)"
            size="small" 
            circle 
            icon="Close" 
            class="category-delete"
            type="danger"
          />
        </button>
      </div>
    </div>

    <!-- 视频列表 -->
    <div class="card">
      <div class="section-header">
        <h2 class="card-title">{{ currentCategoryName }} ({{ filteredVideos.length }})</h2>
      </div>
      
      <!-- 空状态 -->
      <div v-if="filteredVideos.length === 0" class="empty-state">
        <div class="empty-icon">🎬</div>
        <h3>暂无视频</h3>
        <p>{{ searchQuery ? '没有找到匹配的视频' : '快去上传你的第一个视频吧！' }}</p>
        <el-button @click="showUploadDialog = true" type="primary" icon="Upload">
          上传视频
        </el-button>
      </div>

      <!-- 网格视图 -->
      <div v-else-if="viewMode === 'grid'" class="video-grid">
        <div 
          v-for="video in filteredVideos" 
          :key="video.id"
          class="video-item"
          @click="playVideo(video)"
        >
          <div class="video-thumbnail">
            <img :src="video.thumbnail" :alt="video.title" />
            <div class="play-overlay">
              <div class="play-btn">
                <el-icon size="24"><VideoPlay /></el-icon>
              </div>
            </div>
            <div class="duration-badge">{{ video.duration }}</div>
            <div class="video-quality" v-if="video.quality">{{ video.quality }}</div>
          </div>
          <div class="video-details">
            <h3>{{ video.title }}</h3>
            <div class="video-meta">
              <span><el-icon><Calendar /></el-icon> {{ formatDate(video.date) }}</span>
              <span><el-icon><View /></el-icon> {{ formatNumber(video.views) }}</span>
            </div>
            <p class="video-desc">{{ video.description }}</p>
            <div class="video-tags" v-if="video.tags && video.tags.length">
              <el-tag 
                v-for="tag in video.tags.slice(0, 2)" 
                :key="tag"
                size="small"
                type="info"
              >
                {{ tag }}
              </el-tag>
              <span v-if="video.tags.length > 2" class="more-tags">+{{ video.tags.length - 2 }}</span>
            </div>
          </div>
          <div class="video-actions-overlay">
            <el-button size="small" @click.stop="editVideo(video)">编辑</el-button>
            <el-button size="small" type="danger" @click.stop="deleteVideo(video)">删除</el-button>
          </div>
        </div>
      </div>

      <!-- 列表视图 -->
      <div v-else class="video-list">
        <div 
          v-for="video in filteredVideos" 
          :key="video.id"
          class="list-item"
          @click="playVideo(video)"
        >
          <div class="list-thumbnail">
            <img :src="video.thumbnail" :alt="video.title" />
            <div class="duration-badge">{{ video.duration }}</div>
          </div>
          <div class="list-content">
            <h3>{{ video.title }}</h3>
            <p class="list-desc">{{ video.description }}</p>
            <div class="list-meta">
              <span><el-icon><Calendar /></el-icon> {{ formatDate(video.date) }}</span>
              <span><el-icon><View /></el-icon> {{ formatNumber(video.views) }}</span>
              <span><el-icon><Heart /></el-icon> {{ formatNumber(video.likes || 0) }}</span>
              <el-tag :type="getCategoryType(video.category)" size="small">
                {{ getCategoryName(video.category) }}
              </el-tag>
            </div>
          </div>
          <div class="list-actions">
            <el-button size="small" @click.stop="editVideo(video)">编辑</el-button>
            <el-button size="small" type="danger" @click.stop="deleteVideo(video)">删除</el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 上传/编辑视频对话框 -->
    <el-dialog 
      v-model="showUploadDialog" 
      :title="editingVideo ? '编辑视频' : '上传视频'"
      width="700px"
      @close="resetVideoForm"
    >
      <el-form :model="videoForm" :rules="videoRules" ref="videoFormRef" label-width="80px">
        <el-form-item label="视频标题" prop="title">
          <el-input 
            v-model="videoForm.title" 
            placeholder="请输入视频标题"
            maxlength="100"
            show-word-limit
          ></el-input>
        </el-form-item>
        <el-form-item label="视频分类" prop="category">
          <el-select v-model="videoForm.category" placeholder="请选择分类" style="width: 100%">
            <el-option 
              v-for="category in categories" 
              :key="category.id"
              :label="category.name" 
              :value="category.id"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="视频描述">
          <el-input
            type="textarea"
            v-model="videoForm.description"
            placeholder="请输入视频描述"
            :rows="3"
            maxlength="500"
            show-word-limit
          ></el-input>
        </el-form-item>
        <el-form-item label="视频来源" prop="videoSource">
          <el-radio-group v-model="videoForm.videoSource" @change="onVideoSourceChange">
            <el-radio label="upload">上传视频文件</el-radio>
            <el-radio label="link">在线视频链接</el-radio>
          </el-radio-group>
        </el-form-item>
        
        <!-- 文件上传 -->
        <el-form-item v-if="videoForm.videoSource === 'upload'" label="视频文件" prop="videoFile">
          <el-upload
            ref="videoUpload"
            :auto-upload="false"
            :on-change="handleVideoFile"
            :before-upload="beforeVideoUpload"
            accept="video/*"
            :limit="1"
            drag
            class="video-uploader"
          >
            <div class="upload-content" v-if="!videoForm.videoFile">
              <el-icon class="upload-icon"><UploadFilled /></el-icon>
              <div class="upload-text">
                <p>点击或拖拽视频文件到此区域上传</p>
                <p class="upload-tip">支持 MP4、WebM、OGG 格式，最大 100MB</p>
              </div>
            </div>
            <div v-else class="uploaded-file">
              <video 
                :src="videoForm.videoFile" 
                controls 
                style="width: 100%; max-height: 200px;"
              ></video>
              <div class="file-info">
                <p><strong>{{ videoForm.fileName }}</strong></p>
                <p>{{ videoForm.fileSize }}</p>
              </div>
              <el-button @click="removeVideoFile" type="danger" size="small" circle icon="Close" />
            </div>
          </el-upload>
        </el-form-item>
        
        <!-- 链接输入 -->
        <el-form-item v-if="videoForm.videoSource === 'link'" label="视频链接" prop="url">
          <el-input v-model="videoForm.url" placeholder="请输入视频链接地址"></el-input>
        </el-form-item>
        <el-form-item label="封面链接">
          <el-input v-model="videoForm.thumbnail" placeholder="请输入视频封面链接"></el-input>
        </el-form-item>
        <el-form-item label="视频质量">
          <el-select v-model="videoForm.quality" placeholder="选择视频质量">
            <el-option label="1080p" value="1080p"></el-option>
            <el-option label="720p" value="720p"></el-option>
            <el-option label="480p" value="480p"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="标签">
          <el-tag
            v-for="tag in videoForm.tags"
            :key="tag"
            closable
            @close="removeTag(tag)"
            style="margin-right: 0.5rem; margin-bottom: 0.5rem;"
          >
            {{ tag }}
          </el-tag>
          <el-input
            v-if="tagInputVisible"
            ref="tagInput"
            v-model="tagInputValue"
            size="small"
            @keyup.enter="addTag"
            @blur="addTag"
            style="width: 100px;"
          />
          <el-button 
            v-else 
            size="small" 
            @click="showTagInput"
            icon="Plus"
          >
            添加标签
          </el-button>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="showUploadDialog = false">取消</el-button>
        <el-button type="primary" @click="saveVideo" :loading="saving">
          {{ editingVideo ? '保存修改' : '添加视频' }}
        </el-button>
      </template>
    </el-dialog>

    <!-- 导入视频对话框 -->
    <el-dialog 
      v-model="showImportDialog" 
      title="导入视频链接"
      width="500px"
    >
      <el-form :model="importForm" label-width="80px">
        <el-form-item label="视频链接">
          <el-input
            type="textarea"
            v-model="importForm.urls"
            placeholder="请输入视频链接，每行一个链接"
            :rows="6"
          ></el-input>
        </el-form-item>
        <el-form-item label="默认分类">
          <el-select v-model="importForm.defaultCategory" placeholder="选择默认分类">
            <el-option 
              v-for="category in categories" 
              :key="category.id"
              :label="category.name" 
              :value="category.id"
            ></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="showImportDialog = false">取消</el-button>
        <el-button type="primary" @click="importVideos">导入视频</el-button>
      </template>
    </el-dialog>

    <!-- 添加分类对话框 -->
    <el-dialog 
      v-model="showCategoryDialog" 
      title="添加视频分类"
      width="400px"
      @close="resetCategoryForm"
    >
      <el-form :model="categoryForm" :rules="categoryRules" ref="categoryFormRef" label-width="80px">
        <el-form-item label="分类名称" prop="name">
          <el-input 
            v-model="categoryForm.name" 
            placeholder="请输入分类名称"
            maxlength="20"
            show-word-limit
          ></el-input>
        </el-form-item>
        <el-form-item label="分类图标">
          <el-input 
            v-model="categoryForm.icon" 
            placeholder="选择分类图标（可选）"
          >
            <template #append>
              <el-button @click="showIconPicker = !showIconPicker">选择</el-button>
            </template>
          </el-input>
        </el-form-item>
        
        <!-- 图标选择器 -->
        <div v-if="showIconPicker" class="icon-picker">
          <div class="icon-grid">
            <span 
              v-for="icon in iconOptions" 
              :key="icon"
              :class="['icon-item', { selected: categoryForm.icon === icon }]"
              @click="selectIcon(icon)"
            >
              {{ icon }}
            </span>
          </div>
        </div>
        
        <el-form-item label="描述">
          <el-input
            type="textarea"
            v-model="categoryForm.description"
            placeholder="分类描述（可选）"
            :rows="2"
            maxlength="50"
            show-word-limit
          ></el-input>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="showCategoryDialog = false">取消</el-button>
        <el-button type="primary" @click="addCategory">添加分类</el-button>
      </template>
    </el-dialog>

    <!-- 登录对话框 -->
    <el-dialog 
      v-model="showLoginDialog" 
      title="登录账号"
      width="400px"
      @close="resetLoginForm"
    >
      <el-form :model="loginForm" :rules="loginRules" ref="loginFormRef" label-width="80px">
        <el-form-item label="用户名" prop="username">
          <el-input 
            v-model="loginForm.username" 
            placeholder="请输入用户名"
            prefix-icon="User"
          ></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input 
            v-model="loginForm.password" 
            type="password"
            placeholder="请输入密码"
            prefix-icon="Lock"
            show-password
          ></el-input>
        </el-form-item>
        <el-form-item label="API Key" prop="apiKey">
          <el-input 
            v-model="loginForm.apiKey" 
            type="password"
            placeholder="请输入API Key（可选）"
            prefix-icon="Key"
            show-password
          ></el-input>
        </el-form-item>
      </el-form>
      
      <div class="login-tips">
        <p>💡 登录后可以：</p>
        <ul>
          <li>✅ 跨设备同步视频数据</li>
          <li>✅ 云端备份视频信息</li>
          <li>✅ 更大的存储空间</li>
          <li>✅ 在线视频上传</li>
        </ul>
      </div>
      
      <template #footer>
        <el-button @click="showLoginDialog = false">取消</el-button>
        <el-button type="primary" @click="handleLogin" :loading="logging">
          {{ logging ? '登录中...' : '登录' }}
        </el-button>
      </template>
    </el-dialog>

    <!-- 数据导入对话框 -->
    <el-dialog 
      v-model="showDataImportDialog" 
      title="导入数据备份"
      width="500px"
    >
      <div class="import-section">
        <p class="import-tip">
          💡 请选择之前导出的备份文件（.json格式）来恢复您的视频数据
        </p>
        <el-upload
          ref="dataUpload"
          :auto-upload="false"
          :on-change="handleDataFile"
          accept=".json"
          :limit="1"
          drag
          class="data-uploader"
        >
          <div class="upload-content" v-if="!dataImportFile">
            <el-icon class="upload-icon"><UploadFilled /></el-icon>
            <div class="upload-text">
              <p>点击或拖拽备份文件到此区域</p>
              <p class="upload-tip">支持 .json 格式的备份文件</p>
            </div>
          </div>
          <div v-else class="uploaded-file">
            <el-icon><Document /></el-icon>
            <span>{{ dataImportFile.name }}</span>
            <el-button @click="removeDataFile" type="danger" size="small" circle icon="Close" />
          </div>
        </el-upload>
      </div>
      
      <template #footer>
        <el-button @click="showDataImportDialog = false">取消</el-button>
        <el-button type="primary" @click="importData" :loading="saving">
          导入数据
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
/**
 * 视频管理组件
 * 支持视频上传、分类管理、搜索筛选、数据统计等功能
 */
export default {
  name: 'Video',
  data() {
    return {
      // 播放状态
      isPlaying: false,
      isLiked: false,
      isCollected: false,
      
      // 视图和筛选
      activeCategory: 'all',
      searchQuery: '',
      sortOrder: 'newest',
      viewMode: 'grid',
      
      // 对话框状态
      showUploadDialog: false,
      showImportDialog: false,
      showCategoryDialog: false,
      showLoginDialog: false,
      
      // 加载状态
      syncing: false,
      logging: false,
      
      // 编辑状态
      editingVideo: null,
      featuredVideo: null,
      
      // 表单数据
      videoForm: {
        videoSource: 'upload',
        videoFile: null,
        videoType: '',
        fileName: '',
        fileSize: '',
        title: '',
        category: '',
        description: '',
        url: '',
        thumbnail: '',
        tags: [],
        quality: '',
        duration: ''
      },
      loginForm: {
        username: '',
        password: '',
        apiKey: ''
      },
      categoryForm: {
        name: '',
        icon: '📁',
        description: ''
      },
      
      // 默认分类
      categories: [
        {
          id: 'life',
          name: '生活记录',
          icon: '🎬',
          isDefault: true
        },
        {
          id: 'tech',
          name: '技术教程',
          icon: '💻',
          isDefault: true
        },
        {
          id: 'travel',
          name: '旅行视频',
          icon: '✈️',
          isDefault: true
        },
        {
          id: 'entertainment',
          name: '娱乐搞笑',
          icon: '😄',
          isDefault: true
        }
      ],
      
      // 视频数据
      videos: [],
      
      // 收藏数据
      collections: [],
      
      // 云存储配置
      cloudConfig: {
        apiKey: '',
        userId: '',
        baseUrl: 'https://api.example.com/videos'
      },
      
      // 用户登录状态
      isUserLoggedIn: false,
      currentUser: null,
      
      // 导入表单
      importForm: {
        urls: '',
        defaultCategory: ''
      },
      
      // 数据导入对话框
      showDataImportDialog: false,
      dataImportFile: null,
      
      // 其他状态
      saving: false,
      tagInputVisible: false,
      tagInputValue: '',
      showIconPicker: false,
      
      // 表单验证
      videoRules: {
        title: [
          { required: true, message: '请输入视频标题', trigger: 'blur' },
          { min: 1, max: 100, message: '标题长度在 1 到 100 个字符', trigger: 'blur' }
        ],
        category: [
          { required: true, message: '请选择分类', trigger: 'change' }
        ]
      },
      loginRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 20, message: '用户名长度在 3 到 20 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, message: '密码至少6位字符', trigger: 'blur' }
        ]
      },
      categoryRules: {
        name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' },
          { min: 1, max: 20, message: '分类名称长度在 1 到 20 个字符', trigger: 'blur' }
        ]
      },
      
      // 图标选项
      iconOptions: [
        '🎬', '💻', '✈️', '😄', '🎮', '🎨', '📚', '🏃',
        '🍳', '🌍', '🎵', '🎯', '⚡', '🔥', '💡', '🚀',
        '🌟', '⭐', '📹', '📷', '🎪', '🎭', '🎪', '🎨'
      ]
    }
  },
  
  created() {
    // 动态添加验证规则
    this.videoRules.videoFile = [
      { validator: this.validateVideoFile, trigger: 'change' }
    ]
    this.videoRules.url = [
      { validator: this.validateVideoUrl, trigger: 'blur' }
    ]
    
    // 简化数据加载逻辑，优先使用 localStorage
    this.loadAllData()
    
    this.checkLoginStatus()
  },
  
  computed: {
    currentCategoryName() {
      if (this.activeCategory === 'all') return '全部视频'
      const category = this.categories.find(cat => cat.id === this.activeCategory)
      return category ? category.name : '全部视频'
    },
    
    filteredVideos() {
      let videos = this.activeCategory === 'all' 
        ? this.videos 
        : this.videos.filter(video => video.category === this.activeCategory)
      
      // 搜索过滤
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase()
        videos = videos.filter(video => 
          video.title.toLowerCase().includes(query) ||
          video.description.toLowerCase().includes(query) ||
          (video.tags && video.tags.some(tag => tag.toLowerCase().includes(query)))
        )
      }
      
      // 排序
      videos.sort((a, b) => {
        switch (this.sortOrder) {
          case 'newest':
            return new Date(b.date) - new Date(a.date)
          case 'views':
            return b.views - a.views
          case 'likes':
            return (b.likes || 0) - (a.likes || 0)
          default:
            return 0
        }
      })
      
      return videos
    },
    
    totalVideos() {
      return this.videos.length
    },
    
    totalViews() {
      return this.videos.reduce((total, video) => total + video.views, 0)
    },
    
    totalLikes() {
      return this.videos.reduce((total, video) => total + (video.likes || 0), 0)
    }
  },
  
  methods: {
    // ========== 分类管理 ==========
    isDefaultCategory(categoryId) {
      const defaultCategories = ['life', 'tech', 'travel', 'entertainment']
      return defaultCategories.includes(categoryId)
    },
    
    switchCategory(categoryId) {
      this.activeCategory = categoryId
    },
    
    getCategoryName(categoryId) {
      const category = this.categories.find(cat => cat.id === categoryId)
      return category ? category.name : '未分类'
    },
    
    getCategoryType(categoryId) {
      const typeMap = {
        life: '',
        tech: 'success',
        travel: 'warning',
        entertainment: 'danger'
      }
      return typeMap[categoryId] || ''
    },
    
    getVideoCount(categoryId) {
      if (categoryId === 'all') return this.videos.length
      return this.videos.filter(video => video.category === categoryId).length
    },
    
    // ========== 视频播放管理 ==========
    playVideo(video) {
      this.featuredVideo = video
      this.isLiked = this.collections.some(c => c.videoId === video.id && c.type === 'like')
      this.isCollected = this.collections.some(c => c.videoId === video.id && c.type === 'favorite')
      
      // 增加观看次数
      video.views = (video.views || 0) + 1
      this.saveVideosToStorage()
      
      // 调试信息
      console.log('播放视频:', {
        title: video.title,
        url: video.url,
        type: video.type,
        source: video.videoSource
      })
      
      this.$nextTick(() => {
        this.$refs.videoPlayer?.scrollIntoView({ behavior: 'smooth' })
      })
    },
    
    onVideoEnded() {
      this.isPlaying = false
      // 可以添加自动播放下一个视频的逻辑
    },
    
    onVideoLoaded(event) {
      // 视频元数据加载完成，获取视频时长
      const video = event.target
      if (video && video.duration && !isNaN(video.duration)) {
        this.featuredVideo.duration = this.formatDuration(video.duration)
        this.saveVideosToStorage()
      }
    },
    
    onVideoError(event) {
      console.error('视频加载错误:', event)
      this.$message.error('视频加载失败，请检查视频文件或链接是否有效')
      
      // 尝试重新加载视频
      const video = event.target
      if (video && this.featuredVideo) {
        setTimeout(() => {
          video.load()
        }, 1000)
      }
    },
    
    formatDuration(seconds) {
      if (!seconds || isNaN(seconds)) return '00:00'
      
      const minutes = Math.floor(seconds / 60)
      const remainingSeconds = Math.floor(seconds % 60)
      
      return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
    },
    
    likeVideo() {
      if (!this.featuredVideo) return
      
      this.isLiked = !this.isLiked
      if (this.isLiked) {
        this.featuredVideo.likes = (this.featuredVideo.likes || 0) + 1
        this.collections.push({
          videoId: this.featuredVideo.id,
          type: 'like',
          createdAt: new Date().toISOString()
        })
      } else {
        this.featuredVideo.likes = Math.max(0, this.featuredVideo.likes - 1)
        this.collections = this.collections.filter(c => 
          !(c.videoId === this.featuredVideo.id && c.type === 'like')
        )
      }
      this.saveVideosToStorage()
      this.saveCollectionsToStorage()
    },
    
    shareVideo() {
      if (!this.featuredVideo) return
      
      const shareText = `🎬 ${this.featuredVideo.title}\n\n${this.featuredVideo.description}\n\n🔗 ${window.location.href}#video-${this.featuredVideo.id}`
      
      if (navigator.share) {
        navigator.share({
          title: this.featuredVideo.title,
          text: this.featuredVideo.description,
          url: `${window.location.href}#video-${this.featuredVideo.id}`
        })
      } else {
        navigator.clipboard.writeText(shareText)
        this.$message.success('分享内容已复制到剪贴板！')
      }
    },
    
    collectVideo() {
      if (!this.featuredVideo) return
      
      this.isCollected = !this.isCollected
      if (this.isCollected) {
        this.collections.push({
          videoId: this.featuredVideo.id,
          type: 'favorite',
          createdAt: new Date().toISOString()
        })
        this.$message.success('已添加到收藏夹！')
      } else {
        this.collections = this.collections.filter(c => 
          !(c.videoId === this.featuredVideo.id && c.type === 'favorite')
        )
        this.$message.success('已取消收藏！')
      }
      this.saveCollectionsToStorage()
    },
    
    downloadVideo() {
      if (!this.featuredVideo || !this.featuredVideo.url) return
      
      const link = document.createElement('a')
      link.href = this.featuredVideo.url
      link.download = this.featuredVideo.title + '.mp4'
      link.click()
      this.$message.success('开始下载视频...')
    },
    
    // ========== 视频编辑管理 ==========
    editVideo(video) {
      this.editingVideo = { ...video }
      this.videoForm = {
        title: video.title,
        category: video.category,
        description: video.description,
        url: video.url,
        thumbnail: video.thumbnail,
        tags: video.tags || [],
        quality: video.quality || '',
        videoType: video.type || '',
        duration: video.duration || '',
        fileName: video.fileName || '',
        fileSize: video.fileSize || '',
        videoSource: video.videoSource || 'link'
      }
      this.showUploadDialog = true
    },
    
    async deleteVideo(video) {
      try {
        await this.$confirm(`确定要删除视频《${video.title}》吗？`, '确认删除', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        
        this.videos = this.videos.filter(v => v.id !== video.id)
        
        // 删除相关的收藏记录
        this.collections = this.collections.filter(c => c.videoId !== video.id)
        
        // 如果删除的是正在播放的视频，清空播放器
        if (this.featuredVideo && this.featuredVideo.id === video.id) {
          this.featuredVideo = null
        }
        
        this.saveVideosToStorage()
        this.saveCollectionsToStorage()
        this.$message.success('视频删除成功！')
      } catch {
        // 用户取消删除
      }
    },
    
    async saveVideo() {
      if (!this.videoForm.title || !this.videoForm.category) {
        this.$message.warning('请填写必要信息！')
        return
      }
      
      // 根据来源处理视频URL
      let videoUrl = ''
      if (this.videoForm.videoSource === 'upload') {
        videoUrl = this.videoForm.videoFile
      } else {
        videoUrl = this.videoForm.url
      }
      
      if (!videoUrl) {
        this.$message.warning('请提供视频文件或链接！')
        return
      }
      
      try {
        if (this.editingVideo) {
          // 编辑模式
          const index = this.videos.findIndex(v => v.id === this.editingVideo.id)
          if (index > -1) {
            this.videos[index] = {
              ...this.videos[index],
              title: this.videoForm.title,
              category: this.videoForm.category,
              description: this.videoForm.description,
              url: videoUrl,
              thumbnail: this.videoForm.thumbnail,
              tags: this.videoForm.tags,
              quality: this.videoForm.quality,
              updatedAt: new Date().toISOString()
            }
          }
        } else {
          // 添加模式
          const newVideo = {
            id: 'video_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            title: this.videoForm.title,
            category: this.videoForm.category,
            description: this.videoForm.description,
            url: videoUrl,
            type: this.videoForm.videoType || 'video/mp4',
            thumbnail: this.videoForm.thumbnail || `https://picsum.photos/seed/${Date.now()}/400/225.jpg`,
            tags: this.videoForm.tags,
            quality: this.videoForm.quality,
            videoSource: this.videoForm.videoSource,
            fileName: this.videoForm.fileName,
            fileSize: this.videoForm.fileSize,
            duration: this.videoForm.duration || '00:00',
            date: new Date().toISOString(),
            views: 0,
            likes: 0,
            createdAt: new Date().toISOString()
          }
          
          this.videos.unshift(newVideo)
        }
        
        // 保存到本地存储
        this.saveVideosToStorage()
        
        console.log(`视频${this.editingVideo ? '更新' : '添加'}成功`)
        
        // 如果已登录，同步到云端
        if (this.isUserLoggedIn) {
          await this.syncData()
        }
        
        this.showUploadDialog = false
        this.resetVideoForm()
        
        this.$message.success(this.editingVideo ? '视频更新成功！' : '视频添加成功！')
      } catch (error) {
        console.error('保存视频失败:', error)
        this.$message.error('保存失败，请重试')
      }
    },
    
    // ========== 工具方法 ==========
    formatNumber(num) {
      if (num >= 10000) {
        return (num / 10000).toFixed(1) + 'w'
      } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'k'
      }
      return num.toString()
    },
    
    formatDate(dateStr) {
      const date = new Date(dateStr)
      const now = new Date()
      const diff = now - date
      
      if (diff < 86400000) { // 24小时内
        return '今天'
      } else if (diff < 172800000) { // 48小时内
        return '昨天'
      } else {
        return date.toLocaleDateString('zh-CN')
      }
    },
    
    resetVideoForm() {
      // 清理文件URL以避免内存泄漏
      if (this.videoForm.videoFile && this.videoForm.videoFile.startsWith('blob:')) {
        URL.revokeObjectURL(this.videoForm.videoFile)
      }
      
      this.videoForm = {
        videoSource: 'upload',
        videoFile: null,
        videoType: '',
        fileName: '',
        fileSize: '',
        title: '',
        category: '',
        description: '',
        url: '',
        thumbnail: '',
        tags: [],
        quality: '',
        duration: ''
      }
      this.editingVideo = null
    },
    
    // ========== 简化数据操作 ==========
    loadAllData() {
      try {
        console.log('开始加载数据...')
        
        // 从 localStorage 加载数据
        this.loadVideosFromStorage()
        this.loadCategoriesFromStorage()
        this.loadCollectionsFromStorage()
        
        console.log('数据加载完成:', {
          videos: this.videos.length,
          categories: this.categories.length,
          collections: this.collections.length
        })
        
        // 设置默认精选视频
        if (this.videos.length > 0 && !this.featuredVideo) {
          this.featuredVideo = this.videos[0]
        }
        
        // 检查数据状态
        this.$nextTick(() => {
          if (this.videos.length === 0) {
            console.log('暂无视频数据，可以添加测试视频')
            this.$message.info('暂无视频数据，您可以点击"添加测试视频"试试，或通过"上传视频"功能添加。', 5000)
          } else {
            console.log(`成功加载 ${this.videos.length} 个视频`)
          }
        })
      } catch (error) {
        console.error('数据加载失败:', error)
        this.$message.error('数据加载失败，请刷新页面重试')
      }
    },

    // ========== 数据导入导出 ==========
    exportData() {
      try {
        this.$message.info('正在导出数据...')
        
        const exportData = {
          videos: this.videos,
          categories: this.categories,
          collections: this.collections,
          exportDate: new Date().toISOString(),
          version: '1.0'
        }
        
        // 创建下载链接
        const blob = new Blob([JSON.stringify(exportData, null, 2)], {
          type: 'application/json'
        })
        const url = URL.createObjectURL(blob)
        
        const link = document.createElement('a')
        link.href = url
        link.download = `video-backup-${new Date().toISOString().split('T')[0]}.json`
        link.click()
        
        URL.revokeObjectURL(url)
        this.$message.success('数据导出成功！请检查下载文件夹')
        
        console.log('导出的数据:', exportData)
      } catch (error) {
        console.error('数据导出失败:', error)
        this.$message.error('数据导出失败，请重试')
      }
    },

    importData() {
      try {
        if (!this.dataImportFile) {
          this.$message.warning('请选择备份文件')
          return
        }

        this.$message.info('正在导入数据，请稍候...')

        const file = this.dataImportFile
        const reader = new FileReader()

        reader.onload = (e) => {
          try {
            const data = JSON.parse(e.target.result)
            
            // 验证数据格式
            if (!data.videos || !Array.isArray(data.videos)) {
              throw new Error('数据格式不正确')
            }
            
            // 恢复数据
            this.videos = data.videos || []
            this.categories = [...this.categories, ...(data.categories || [])]
            this.collections = data.collections || []
            
            // 保存到 localStorage
            this.saveVideosToStorage()
            this.saveCategoriesToStorage()
            this.saveCollectionsToStorage()
            
            // 设置精选视频
            if (this.videos.length > 0) {
              this.featuredVideo = this.videos[0]
            }
            
            this.showDataImportDialog = false
            this.dataImportFile = null
            
            this.$message.success(`数据导入成功！恢复了 ${this.videos.length} 个视频`)
            console.log('导入的数据:', data)
          } catch (error) {
            console.error('数据导入失败:', error)
            this.$message.error('数据导入失败，请检查文件格式')
          }
        }

        reader.readAsText(file)
      } catch (error) {
        console.error('导入过程出错:', error)
        this.$message.error('导入失败，请重试')
      }
    },

    // ========== 存储相关 ==========
    loadVideosFromStorage() {
      try {
        const savedVideos = localStorage.getItem('videos')
        console.log('从 localStorage 读取视频数据:', savedVideos)
        
        if (savedVideos) {
          this.videos = JSON.parse(savedVideos)
          console.log('解析后的视频数据:', this.videos)
        } else {
          console.log('localStorage 中没有视频数据')
          this.videos = []
        }
        
        // 设置默认精选视频
        if (this.videos.length > 0 && !this.featuredVideo) {
          this.featuredVideo = this.videos[0]
        }
      } catch (error) {
        console.error('加载视频失败:', error)
        this.videos = []
      }
    },
    
    loadCategoriesFromStorage() {
      try {
        const savedCategories = localStorage.getItem('videoCategories')
        if (savedCategories) {
          const customCategories = JSON.parse(savedCategories)
          this.categories = [...this.categories, ...customCategories]
        }
      } catch (error) {
        console.error('加载分类失败:', error)
      }
    },
    
    loadCollectionsFromStorage() {
      try {
        const savedCollections = localStorage.getItem('videoCollections')
        if (savedCollections) {
          this.collections = JSON.parse(savedCollections)
        }
      } catch (error) {
        console.error('加载收藏数据失败:', error)
        this.collections = []
      }
    },
    
    saveVideosToStorage() {
      try {
        const dataToSave = JSON.stringify(this.videos)
        console.log('保存视频数据到 localStorage:', dataToSave)
        localStorage.setItem('videos', dataToSave)
        console.log('视频数据保存成功')
      } catch (error) {
        console.error('保存视频失败:', error)
      }
    },
    
    saveCategoriesToStorage() {
      try {
        const customCategories = this.categories.filter(cat => !cat.isDefault)
        localStorage.setItem('videoCategories', JSON.stringify(customCategories))
      } catch (error) {
        console.error('保存分类失败:', error)
      }
    },
    
    saveCollectionsToStorage() {
      try {
        localStorage.setItem('videoCollections', JSON.stringify(this.collections))
      } catch (error) {
        console.error('保存收藏数据失败:', error)
      }
    },
    
    // ========== 标签管理 ==========
    showTagInput() {
      this.tagInputVisible = true
      this.$nextTick(() => {
        this.$refs.tagInput?.focus()
      })
    },
    
    addTag() {
      const tag = this.tagInputValue.trim()
      if (tag && !this.videoForm.tags.includes(tag)) {
        this.videoForm.tags.push(tag)
        this.tagInputValue = ''
        this.tagInputVisible = false
      }
    },
    
    removeTag(tag) {
      this.videoForm.tags = this.videoForm.tags.filter(t => t !== tag)
    },
    
    // ========== 分类管理 ==========
    async addCategory() {
      try {
        await this.$refs.categoryFormRef.validate()
        
        // 检查分类名称是否重复
        if (this.categories.some(cat => cat.name === this.categoryForm.name)) {
          this.$message.warning('分类名称已存在')
          return
        }
        
        // 生成唯一ID
        const categoryId = 'custom_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
        
        // 添加新分类
        const newCategory = {
          id: categoryId,
          name: this.categoryForm.name,
          icon: this.categoryForm.icon,
          description: this.categoryForm.description,
          isDefault: false,
          createdAt: new Date().toISOString()
        }
        
        this.categories.push(newCategory)
        this.saveCategoriesToStorage()
        
        this.showCategoryDialog = false
        this.resetCategoryForm()
        
        this.$message.success('分类添加成功！')
      } catch (error) {
        console.error('添加分类失败:', error)
      }
    },
    
    async deleteCategory(categoryId) {
      try {
        await this.$confirm('确定要删除这个分类吗？', '确认删除', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        
        // 删除分类
        this.categories = this.categories.filter(cat => cat.id !== categoryId)
        
        // 如果删除的是当前分类，切换到第一个分类
        if (this.activeCategory === categoryId) {
          this.activeCategory = this.categories[0]?.id || 'all'
        }
        
        this.saveCategoriesToStorage()
        this.$message.success('分类删除成功！')
      } catch {
        // 用户取消删除
      }
    },
    
    selectIcon(icon) {
      this.categoryForm.icon = icon
      this.showIconPicker = false
    },
    
    resetCategoryForm() {
      this.categoryForm = {
        name: '',
        icon: '📁',
        description: ''
      }
      this.showIconPicker = false
      if (this.$refs.categoryFormRef) {
        this.$refs.categoryFormRef.resetFields()
      }
    },
    
    // ========== 导入功能 ==========
    async importVideos() {
      if (!this.importForm.urls.trim()) {
        this.$message.warning('请输入视频链接')
        return
      }
      
      const urls = this.importForm.urls.trim().split('\n').filter(url => url.trim())
      if (urls.length === 0) {
        this.$message.warning('请输入有效的视频链接')
        return
      }
      
      let successCount = 0
      
      for (const url of urls) {
        try {
          // 这里可以添加链接验证和自动获取视频信息的逻辑
          const newVideo = {
            id: 'video_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            title: '未命名视频',
            category: this.importForm.defaultCategory || 'life',
            description: '通过链接导入的视频',
            url: url.trim(),
            thumbnail: 'https://picsum.photos/seed/import/400/225.jpg',
            date: new Date().toISOString(),
            views: 0,
            likes: 0,
            tags: ['导入'],
            createdAt: new Date().toISOString()
          }
          
          this.videos.unshift(newVideo)
          successCount++
        } catch (error) {
          console.error('导入视频失败:', url, error)
        }
      }
      
      if (successCount > 0) {
        this.saveVideosToStorage()
        this.showImportDialog = false
        this.importForm = { urls: '', defaultCategory: '' }
        this.$message.success(`成功导入 ${successCount} 个视频！`)
      } else {
        this.$message.error('导入失败，请检查链接格式')
      }
    },
    
    // ========== 文件上传相关 ==========
    onVideoSourceChange(source) {
      // 切换视频来源时清空相关字段
      if (source === 'upload') {
        this.videoForm.url = ''
      } else {
        this.videoForm.videoFile = null
        this.videoForm.fileName = ''
        this.videoForm.fileSize = ''
      }
    },
    
    beforeVideoUpload(file) {
      const isVideo = file.type.startsWith('video/')
      const isLt100M = file.size / 1024 / 1024 < 100
      
      if (!isVideo) {
        this.$message.error('只能上传视频文件！')
        return false
      }
      if (!isLt100M) {
        this.$message.error('视频文件大小不能超过 100MB！')
        return false
      }
      
      // 读取文件为blob URL（更高效）
      this.videoForm.videoFile = URL.createObjectURL(file)
      this.videoForm.videoType = file.type // 保存视频类型
      
      this.videoForm.fileName = file.name
      this.videoForm.fileSize = this.formatFileSize(file.size)
      
      // 尝试获取视频时长
      this.getVideoDuration(file)
      
      return false // 阻止自动上传
    },
    
    handleVideoFile(file) {
      // 处理文件选择
      if (file.raw) {
        this.beforeVideoUpload(file.raw)
      }
    },
    
    removeVideoFile() {
      this.videoForm.videoFile = null
      this.videoForm.fileName = ''
      this.videoForm.fileSize = ''
    },
    
    getVideoDuration(file) {
      const video = document.createElement('video')
      video.preload = 'metadata'
      
      video.onloadedmetadata = () => {
        this.videoForm.duration = this.formatDuration(video.duration)
        URL.revokeObjectURL(video.src) // 清理临时URL
      }
      
      video.onerror = () => {
        console.warn('无法获取视频时长')
        URL.revokeObjectURL(video.src)
      }
      
      video.src = URL.createObjectURL(file)
    },

    // ========== 数据文件处理 ==========
    handleDataFile(file) {
      if (file.raw && file.raw.type === 'application/json') {
        this.dataImportFile = file.raw
      }
    },

    removeDataFile() {
      this.dataImportFile = null
    },
    
    // ========== 文件验证方法 ==========
    validateVideoFile(rule, value, callback) {
      if (this.videoForm.videoSource === 'upload' && !this.videoForm.videoFile) {
        callback(new Error('请选择视频文件'))
      } else {
        callback()
      }
    },
    
    validateVideoUrl(rule, value, callback) {
      if (this.videoForm.videoSource === 'link' && !value) {
        callback(new Error('请输入视频链接'))
      } else if (value && !this.isValidUrl(value)) {
        callback(new Error('请输入有效的链接地址'))
      } else {
        callback()
      }
    },
    
    isValidUrl(string) {
      try {
        new URL(string)
        return true
      } catch (_) {
        return false
      }
    },
    
    formatFileSize(bytes) {
      if (bytes === 0) return '0 Bytes'
      const k = 1024
      const sizes = ['Bytes', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    },
    
    // ========== 用户认证相关 ==========
    checkLoginStatus() {
      const token = localStorage.getItem('userToken')
      const userInfo = localStorage.getItem('userInfo')
      
      if (token && userInfo) {
        this.isUserLoggedIn = true
        this.currentUser = JSON.parse(userInfo)
        this.cloudConfig.apiKey = token
      }
    },
    
    async handleLogin() {
      try {
        await this.$refs.loginFormRef.validate()
        
        this.logging = true
        
        // 模拟登录API调用
        const loginResponse = await this.mockLoginAPI(this.loginForm)
        
        if (loginResponse.success) {
          this.isUserLoggedIn = true
          this.currentUser = loginResponse.user
          this.cloudConfig.apiKey = loginResponse.token
          this.cloudConfig.userId = loginResponse.user.id
          
          // 保存登录状态
          localStorage.setItem('userToken', loginResponse.token)
          localStorage.setItem('userInfo', JSON.stringify(loginResponse.user))
          
          this.showLoginDialog = false
          this.resetLoginForm()
          
          this.$message.success('登录成功！开始同步数据...')
          
          // 自动同步数据
          await this.syncData()
        } else {
          this.$message.error(loginResponse.message || '登录失败')
        }
      } catch (error) {
        console.error('登录失败:', error)
        this.$message.error('登录失败，请检查信息')
      } finally {
        this.logging = false
      }
    },
    
    mockLoginAPI(formData) {
      // 模拟API调用 - 实际项目中应该调用真实的后端API
      return new Promise((resolve) => {
        setTimeout(() => {
          if (formData.username === 'demo' && formData.password === '123456') {
            resolve({
              success: true,
              token: 'mock_token_' + Date.now(),
              user: {
                id: 'user_' + Date.now(),
                username: formData.username,
                email: 'demo@example.com',
                createdAt: new Date().toISOString()
              }
            })
          } else if (formData.apiKey) {
            resolve({
              success: true,
              token: formData.apiKey,
              user: {
                id: 'api_user_' + Date.now(),
                username: 'API User',
                email: 'api@example.com',
                createdAt: new Date().toISOString()
              }
            })
          } else {
            resolve({
              success: false,
              message: '用户名或密码错误（测试账号：demo/123456）'
            })
          }
        }, 1500)
      })
    },
    
    logout() {
      this.$confirm('确定要退出登录吗？', '确认退出', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // 清除登录状态
        this.isUserLoggedIn = false
        this.currentUser = null
        this.cloudConfig.apiKey = ''
        this.cloudConfig.userId = ''
        
        localStorage.removeItem('userToken')
        localStorage.removeItem('userInfo')
        
        this.$message.success('已退出登录')
      }).catch(() => {
        // 用户取消
      })
    },
    
    resetLoginForm() {
      this.loginForm = {
        username: '',
        password: '',
        apiKey: ''
      }
      if (this.$refs.loginFormRef) {
        this.$refs.loginFormRef.resetFields()
      }
    },
    
    // ========== 测试功能 ==========
    addTestVideo() {
      // 使用一个可用的在线测试视频
      const testVideo = {
        id: 'test_video_' + Date.now(),
        title: '示例视频 - Big Buck Bunny',
        category: 'entertainment',
        description: '这是一个开源的示例视频，用于测试视频播放功能。Big Buck Bunny 是一个著名的开源动画短片。',
        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        type: 'video/mp4',
        thumbnail: 'https://picsum.photos/seed/bunny/400/225.jpg',
        tags: ['测试', '动画', '开源'],
        quality: '720p',
        videoSource: 'link',
        duration: '09:56',
        date: new Date().toISOString(),
        views: 0,
        likes: 0,
        createdAt: new Date().toISOString()
      }
      
      this.videos.unshift(testVideo)
      this.saveVideosToStorage()
      this.$message.success('测试视频添加成功！点击视频卡片即可播放。')
      
      // 自动播放测试视频
      this.$nextTick(() => {
        this.playVideo(testVideo)
      })
    },
    
    // ========== 云同步相关 ==========
    async syncData() {
      if (!this.isUserLoggedIn) {
        this.$message.warning('请先登录')
        return
      }
      
      this.syncing = true
      
      try {
        // 上传本地数据到云端
        const uploadData = {
          videos: this.videos,
          categories: this.categories.filter(cat => !cat.isDefault),
          collections: this.collections,
          lastSyncTime: new Date().toISOString()
        }
        
        const syncResponse = await this.mockSyncAPI(uploadData)
        
        if (syncResponse.success) {
          // 下载云端最新数据
          const cloudData = await this.fetchCloudData()
          
          if (cloudData.success) {
            // 合并数据（云端优先）
            this.mergeCloudData(cloudData.data)
            
            this.$message.success('数据同步完成！')
          }
        } else {
          this.$message.error('同步失败：' + syncResponse.message)
        }
      } catch (error) {
        console.error('同步失败:', error)
        this.$message.error('同步失败，请检查网络连接')
      } finally {
        this.syncing = false
      }
    },
    
    mockSyncAPI(data) {
      // 模拟同步API调用
      return new Promise((resolve) => {
        setTimeout(() => {
          console.log('上传数据到云端:', data)
          resolve({
            success: true,
            message: '同步成功',
            syncId: 'sync_' + Date.now()
          })
        }, 2000)
      })
    },
    
    async fetchCloudData() {
      // 模拟从云端获取数据
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            success: true,
            data: {
              videos: [],
              categories: [],
              collections: []
            }
          })
        }, 1500)
      })
    },
    
    mergeCloudData(cloudData) {
      // 合并云端和本地数据
      if (cloudData.videos && cloudData.videos.length > 0) {
        // 简单合并，实际项目中应该更智能的合并策略
        const existingIds = this.videos.map(v => v.id)
        const newVideos = cloudData.videos.filter(v => !existingIds.includes(v.id))
        this.videos = [...newVideos, ...this.videos]
        this.saveVideosToStorage()
      }
      
      if (cloudData.categories && cloudData.categories.length > 0) {
        this.categories = [...this.categories, ...cloudData.categories]
        this.saveCategoriesToStorage()
      }
    }
  }
}
</script>

<style scoped>
/* 工具栏样式 */
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.search-section {
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
}

.search-input {
  width: 300px;
}

.view-controls {
  display: flex;
  gap: 1rem;
  align-items: center;
}

/* 分类标签样式 */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.category-tabs {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.tab-btn {
  padding: 0.8rem 1.5rem;
  border: none;
  background: #f8f9fa;
  color: #666;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  position: relative;
  min-width: 120px;
  justify-content: center;
}

.tab-btn:hover {
  background: #e9ecef;
  transform: translateY(-2px);
}

.tab-btn.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.category-icon {
  font-size: 1.2rem;
}

.category-name {
  font-weight: 500;
  flex: 1;
}

.category-count {
  font-size: 0.8rem;
  opacity: 0.7;
  background: rgba(255, 255, 255, 0.2);
  padding: 0.2rem 0.5rem;
  border-radius: 10px;
}

.tab-btn.active .category-count {
  background: rgba(255, 255, 255, 0.3);
}

.category-delete {
  position: absolute;
  top: -5px;
  right: -5px;
  width: 20px !important;
  height: 20px !important;
  min-height: auto !important;
  font-size: 0.7rem !important;
  padding: 0 !important;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.tab-btn:hover .category-delete {
  opacity: 1;
}

/* 空状态样式 */
.empty-state {
  text-align: center;
  padding: 3rem 2rem;
  color: #999;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-state h3 {
  color: #666;
  margin-bottom: 1rem;
  font-size: 1.3rem;
}

.empty-state p {
  font-size: 0.9rem;
  line-height: 1.5;
  margin-bottom: 2rem;
  color: #888;
}

/* 精选视频播放器 */
.featured-video-card {
  background: linear-gradient(135deg, #f8f9fa, #e9ecef);
  border-left: 4px solid #764ba2;
}

.featured-video {
  margin-bottom: 2rem;
}

.video-player {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  margin-bottom: 1.5rem;
  background: #000;
}

.video-player {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  margin-bottom: 1.5rem;
  background: #000;
}

.video-player video {
  width: 100%;
  height: auto;
  max-height: 500px;
  display: block;
}

.video-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(0, 0, 0, 0.7);
}

.no-video-message {
  text-align: center;
  color: white;
}

.no-video-message p {
  margin-top: 1rem;
  opacity: 0.8;
}

.video-status {
  position: absolute;
  top: 8px;
  left: 8px;
  display: flex;
  gap: 0.5rem;
  z-index: 10;
}

.video-info {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.video-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.video-header h3 {
  color: #333;
  font-size: 1.5rem;
  margin: 0;
  flex: 1;
}

.video-meta {
  display: flex;
  gap: 2rem;
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.video-meta span {
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.video-tags {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-bottom: 1rem;
}

.video-tag {
  margin: 0;
}

.video-description {
  color: #666;
  line-height: 1.6;
  margin-bottom: 1.5rem;
}

.video-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

/* 视频网格视图 */
.video-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 2rem;
}

.video-item {
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.video-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
}

.video-thumbnail {
  position: relative;
  overflow: hidden;
  aspect-ratio: 16/9;
}

.video-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.play-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  justify-content: center;
  align-items: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.video-item:hover .play-overlay {
  opacity: 1;
}

.video-item:hover .video-thumbnail img {
  transform: scale(1.1);
}

.play-btn {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  width: 60px;
  height: 60px;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #764ba2;
  transition: all 0.3s ease;
}

.play-btn:hover {
  background: white;
  transform: scale(1.1);
}

.duration-badge {
  position: absolute;
  bottom: 8px;
  right: 8px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 500;
}

.video-quality {
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(102, 126, 234, 0.9);
  color: white;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
}

.video-details {
  padding: 1rem;
}

.video-details h3 {
  color: #333;
  margin-bottom: 0.5rem;
  font-size: 1.1rem;
  line-height: 1.4;
}

.video-details .video-meta {
  font-size: 0.8rem;
  margin-bottom: 0.5rem;
  gap: 1rem;
}

.video-desc {
  color: #666;
  font-size: 0.9rem;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  margin-bottom: 0.5rem;
}

.more-tags {
  color: #999;
  font-size: 0.8rem;
}

.video-actions-overlay {
  position: absolute;
  top: 8px;
  right: 8px;
  opacity: 0;
  transition: opacity 0.3s ease;
  display: flex;
  gap: 0.5rem;
}

.video-item:hover .video-actions-overlay {
  opacity: 1;
}

/* 列表视图 */
.video-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.list-item {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  padding: 1rem;
}

.list-item:hover {
  transform: translateX(5px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.list-thumbnail {
  position: relative;
  width: 160px;
  height: 90px;
  border-radius: 6px;
  overflow: hidden;
  margin-right: 1rem;
  flex-shrink: 0;
}

.list-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.list-content {
  flex: 1;
  margin-right: 1rem;
}

.list-content h3 {
  color: #333;
  margin-bottom: 0.5rem;
  font-size: 1.1rem;
}

.list-desc {
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.list-meta {
  display: flex;
  gap: 1rem;
  align-items: center;
  font-size: 0.8rem;
  color: #666;
  flex-wrap: wrap;
}

.list-meta span {
  display: flex;
  align-items: center;
  gap: 0.2rem;
}

.list-actions {
  display: flex;
  gap: 0.5rem;
  flex-shrink: 0;
}

/* 图标选择器 */
.icon-picker {
  margin-top: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 6px;
  max-height: 200px;
  overflow-y: auto;
}

.icon-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(40px, 1fr));
  gap: 0.5rem;
}

.icon-item {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1.2rem;
  transition: all 0.3s ease;
}

.icon-item:hover {
  border-color: #409eff;
  background: #f0f9ff;
  transform: scale(1.1);
}

.icon-item.selected {
  border-color: #409eff;
  background: #409eff;
  color: white;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .toolbar {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-section {
    flex-direction: column;
  }
  
  .search-input {
    width: 100%;
  }
  
  .video-grid {
    grid-template-columns: 1fr;
  }
  
  .list-item {
    flex-direction: column;
    align-items: stretch;
  }
  
  .list-thumbnail {
    width: 100%;
    height: 200px;
    margin-right: 0;
    margin-bottom: 1rem;
  }
  
  .list-content {
    margin-right: 0;
  }
  
  .list-actions {
    justify-content: center;
  }
  
  .video-header {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .video-meta {
    gap: 1rem;
  }
}

@media (max-width: 480px) {
  .tab-btn {
    min-width: 100px;
    font-size: 0.9rem;
    padding: 0.6rem 1rem;
  }
  
  .video-actions {
    justify-content: center;
  }
  
  .video-meta {
    gap: 0.5rem;
  }
}

/* 视频上传器样式 */
.video-uploader {
  width: 100%;
}

.video-uploader .el-upload {
  width: 100%;
  border: 2px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
}

.video-uploader .el-upload:hover {
  border-color: #409eff;
}

.upload-content {
  text-align: center;
  padding: 2rem;
  color: #606266;
}

.upload-icon {
  font-size: 48px;
  color: #c0c4cc;
  margin-bottom: 1rem;
}

.upload-text p {
  margin: 0.5rem 0;
  font-size: 14px;
}

.upload-tip {
  font-size: 12px;
  color: #909399;
}

.uploaded-file {
  position: relative;
  text-align: center;
  padding: 1rem;
}

.file-info {
  margin-top: 1rem;
  font-size: 14px;
  color: #606266;
}

.file-info p {
  margin: 0.25rem 0;
}

/* 登录提示样式 */
.login-tips {
  background: #f0f9ff;
  border: 1px solid #b3d8ff;
  border-radius: 6px;
  padding: 1rem;
  margin-bottom: 1rem;
}

.login-tips p {
  color: #409eff;
  font-weight: 500;
  margin-bottom: 0.5rem;
}

.login-tips ul {
  margin: 0;
  padding-left: 1.5rem;
  color: #666;
  font-size: 14px;
  line-height: 1.5;
}

.login-tips li {
  margin-bottom: 0.25rem;
}

/* 响应式上传器 */
@media (max-width: 768px) {
  .upload-content {
    padding: 1.5rem;
  }
  
  .upload-icon {
    font-size: 36px;
  }
}

/* 数据导入样式 */
.import-section {
  text-align: center;
}

.import-tip {
  color: #666;
  font-size: 0.9rem;
  line-height: 1.5;
  margin-bottom: 1rem;
  background: #f0f9ff;
  border: 1px solid #b3d8ff;
  border-radius: 6px;
  padding: 1rem;
}

.data-uploader .el-upload {
  width: 100%;
  border: 2px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
}

.data-uploader .el-upload:hover {
  border-color: #409eff;
}

.data-uploader .uploaded-file {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1rem;
  color: #67c23a;
  font-weight: 500;
}

.data-uploader .uploaded-file .el-icon {
  font-size: 1.2rem;
}
</style>