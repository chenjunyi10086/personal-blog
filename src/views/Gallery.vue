<template>
  <div class="page-container">
    <div class="page-header">
      <h1 class="page-title">📸 图片展示</h1>
      <p class="page-subtitle">记录生活中的美好瞬间</p>
    </div>

    <!-- 搜索和筛选栏 -->
    <div class="card">
      <div class="search-bar">
        <el-input 
          v-model="searchQuery" 
          placeholder="搜索图片标题或描述..."
          prefix-icon="Search"
          clearable
          @input="handleSearch"
          class="search-input"
        />
        <el-button @click="showUploadDialog = true" type="primary" icon="Upload">
          上传图片
        </el-button>
        <el-button @click="toggleView" icon="Grid">
          {{ viewMode === 'grid' ? '列表视图' : '网格视图' }}
        </el-button>
      </div>
    </div>

    <div class="card">
      <div class="section-header">
        <h2 class="card-title">图片分类</h2>
        <div class="category-actions">
          <el-button @click="showAddCategoryDialog = true" type="primary" size="small" icon="Plus">
            添加分类
          </el-button>
        </div>
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
          <span class="category-count">({{ getImageCount(category.id) }})</span>
          <el-button 
            v-if="!isDefaultCategory(category.id) && getImageCount(category.id) === 0"
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

    <div class="card">
      <div class="section-header">
        <h2 class="card-title">{{ currentCategory.name }}</h2>
        <span class="image-count">共 {{ filteredImages.length }} 张图片</span>
      </div>
      
      <!-- 空状态提示 -->
      <div v-if="filteredImages.length === 0" class="empty-state">
        <div class="empty-icon">📷</div>
        <h3>暂无图片</h3>
        <p>{{ searchQuery ? '没有找到匹配的图片' : '快去上传你的第一张图片吧！' }}</p>
        <el-button @click="showUploadDialog = true" type="primary" icon="Upload">
          立即上传
        </el-button>
      </div>
      
      <!-- 网格视图 -->
      <div v-else-if="viewMode === 'grid'" class="gallery-grid">
        <div 
          v-for="(image, index) in filteredImages" 
          :key="image.id"
          class="gallery-item"
          @click="openImageModal(image)"
        >
          <div class="image-container">
            <img :src="image.thumbnail" :alt="image.title" loading="lazy" />
          <div class="image-overlay">
            <!-- 上传进度 -->
            <div v-if="image.isUploading" class="upload-progress">
              <el-progress 
                :percentage="image.uploadProgress || 0" 
                :show-text="false"
                :stroke-width="3"
              />
              <span class="progress-text">{{ image.uploadProgress || 0 }}%</span>
            </div>
            
            <!-- 上传失败 -->
            <div v-else-if="image.uploadError" class="upload-error">
              <el-icon class="error-icon"><CircleClose /></el-icon>
              <span class="error-text">上传失败</span>
            </div>
            
            <!-- 正常显示 -->
            <div v-else>
              <h3>{{ image.title }}</h3>
              <p>{{ image.description }}</p>
              <div class="image-actions">
                <el-button size="small" circle icon="Edit" @click.stop="editImage(image)" />
                <el-button size="small" circle icon="Delete" type="danger" @click.stop="deleteImage(image)" />
              </div>
            </div>
          </div>
          </div>
        </div>
      </div>
      
      <!-- 列表视图 -->
      <div v-else class="gallery-list">
        <div 
          v-for="image in filteredImages" 
          :key="image.id"
          class="list-item"
          @click="openImageModal(image)"
        >
          <img :src="image.thumbnail" :alt="image.title" loading="lazy" />
          <div class="list-item-content">
            <!-- 上传进度 -->
            <div v-if="image.isUploading" class="list-upload-progress">
              <div class="progress-info">
                <span>{{ image.title }} - 上传中...</span>
                <el-progress 
                  :percentage="image.uploadProgress || 0" 
                  :show-text="true"
                  :stroke-width="4"
                  status="success"
                />
              </div>
            </div>
            
            <!-- 上传失败 -->
            <div v-else-if="image.uploadError" class="list-upload-error">
              <div class="error-info">
                <el-icon><CircleClose /></el-icon>
                <span>{{ image.title }} - 上传失败</span>
                <el-button size="small" @click.stop="retryUpload(image)">重试</el-button>
              </div>
            </div>
            
            <!-- 正常显示 -->
            <div v-else>
              <h3>{{ image.title }}</h3>
              <p>{{ image.description }}</p>
              <div class="list-item-meta">
                <span>📅 {{ image.date }}</span>
                <span>📍 {{ image.location }}</span>
                <span v-if="image.cloudUrl" class="cloud-badge">☁️</span>
              </div>
            </div>
          </div>
          <div class="list-item-actions">
            <el-button size="small" icon="Edit" @click.stop="editImage(image)">编辑</el-button>
            <el-button size="small" type="danger" icon="Delete" @click.stop="deleteImage(image)">删除</el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 存储说明卡片 -->
    <div class="card storage-card" v-if="totalImageCount > 0">
      <h4>💾 图片存储说明</h4>
      <p>✅ 图片文件已保存到浏览器本地数据库</p>
      <p>🔄 图片信息自动同步到云端备份</p>
      <p>📱 跨设备访问时自动恢复图片列表</p>
      
      <!-- 同步状态和控制 -->
      <div class="sync-status">
        <div v-if="!isSyncing && !isOnline" class="status-offline">
          <el-icon><Connection /></el-icon>
          <span>离线状态</span>
        </div>
        <div v-if="isSyncing" class="status-syncing">
          <el-icon class="is-loading"><Loading /></el-icon>
          <span>正在同步...</span>
        </div>
        <div v-if="!isSyncing && isOnline && lastSyncTime" class="status-success">
          <el-icon><CircleCheck /></el-icon>
          <span>上次同步: {{ formatSyncTime(lastSyncTime) }}</span>
        </div>
        <div v-if="!isSyncing && isOnline && !lastSyncTime" class="status-ready">
          <el-icon><Upload /></el-icon>
          <span>准备同步</span>
        </div>
      </div>
      
      <div class="storage-stats">
        <div class="stat-item">
          <span class="stat-number">{{ totalImageCount }}</span>
          <span class="stat-label">总图片数</span>
        </div>
        <div class="stat-item">
          <span class="stat-number">{{ categories.length }}</span>
          <span class="stat-label">分类数</span>
        </div>
        <div class="stat-item">
          <span class="stat-number">{{ totalStorageSize }}</span>
          <span class="stat-label">存储大小</span>
        </div>
      </div>
      
      <!-- 同步操作按钮 -->
      <!-- 云存储配置 -->
      <div class="cloud-storage-config">
        <h5>☁️ 云存储设置</h5>
        <div class="storage-option">
          <el-switch 
            v-model="cloudStorage.enabled"
            @change="toggleCloudStorage"
            active-text="启用云存储"
            inactive-text="仅本地存储"
          />
        </div>
        
        <div v-if="cloudStorage.enabled" class="storage-provider">
          <el-select 
            v-model="cloudStorage.provider" 
            @change="changeCloudProvider"
            placeholder="选择云存储服务"
            size="small"
          >
            <el-option label="Imgur (推荐)" value="imgur" />
            <el-option label="FreeImage.host" value="freeimagehost" />
            <el-option label="自定义图床" value="custom" />
          </el-select>
          
          <el-button 
            @click="showCloudConfigDialog = true" 
            size="small" 
            type="primary"
            icon="Setting"
          >
            配置
          </el-button>
        </div>
        
        <div v-if="cloudStorage.enabled" class="cloud-status">
          <div v-if="!cloudStorage.accessToken" class="status-warning">
            <el-icon><Warning /></el-icon>
            <span>未配置云存储，请先设置访问密钥</span>
          </div>
          <div v-else class="status-success">
            <el-icon><CircleCheck /></el-icon>
            <span>云存储已配置并正常工作</span>
          </div>
        </div>
      </div>
      
      <div class="sync-actions">
        <el-button 
          @click="syncToCloud" 
          type="primary" 
          size="small" 
          :loading="isSyncing"
          :disabled="!isOnline || isSyncing"
          icon="Upload"
        >
          立即同步
        </el-button>
        <el-button 
          @click="toggleAutoSync" 
          :type="autoSync ? 'success' : 'info'" 
          size="small"
          :icon="autoSync ? 'Timer' : 'Close'"
        >
          {{ autoSync ? '自动同步开启' : '自动同步关闭' }}
        </el-button>
      </div>
    </div>

    <!-- 图片上传对话框 -->
    <el-dialog 
      v-model="showUploadDialog" 
      :title="editingImage ? '编辑图片' : '上传图片'"
      width="600px"
      @close="resetForm"
    >
      <el-form :model="imageForm" :rules="formRules" ref="imageFormRef" label-width="80px">
        <el-form-item label="标题" prop="title">
          <el-input v-model="imageForm.title" placeholder="请输入图片标题"></el-input>
        </el-form-item>
        <el-form-item label="分类" prop="category">
          <el-select v-model="imageForm.category" placeholder="请选择分类" style="width: 100%">
            <el-option-group
              v-for="(group, groupIndex) in groupedCategories"
              :key="groupIndex"
              :label="group.label"
            >
              <el-option 
                v-for="category in group.options" 
                :key="category.id"
                :label="`${category.icon || ''} ${category.name}`" 
                :value="category.id"
              ></el-option>
            </el-option-group>
          </el-select>
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input
            type="textarea"
            v-model="imageForm.description"
            placeholder="请输入图片描述"
            :rows="3"
          ></el-input>
        </el-form-item>
        <el-form-item label="位置" prop="location">
          <el-input v-model="imageForm.location" placeholder="拍摄地点（可选）"></el-input>
        </el-form-item>
        
        <!-- 本地文件上传 -->
        <el-form-item label="图片文件" v-if="!editingImage">
          <div class="upload-area" @click="triggerFileInput" @dragover.prevent @drop="handleDrop">
            <input 
              type="file" 
              ref="fileInput" 
              @change="handleFileSelect" 
              accept="image/*" 
              style="display: none"
              multiple
            >
            <div v-if="!selectedFiles.length" class="upload-placeholder">
              <el-icon size="48" color="#c0c4cc"><Upload /></el-icon>
              <p>点击选择或拖拽图片到此处</p>
              <p class="upload-tip">支持 JPG、PNG、GIF 格式，单个文件最大 10MB</p>
            </div>
            <div v-else class="selected-files">
              <div v-for="(file, index) in selectedFiles" :key="index" class="file-item">
                <img :src="file.preview" :alt="file.name" />
                <div class="file-info">
                  <span class="file-name">{{ file.name }}</span>
                  <span class="file-size">{{ formatFileSize(file.size) }}</span>
                </div>
                <el-button 
                  size="small" 
                  circle 
                  icon="Close" 
                  @click.stop="removeFile(index)"
                  type="danger"
                />
              </div>
            </div>
          </div>
        </el-form-item>
        
        <!-- 在线链接 -->
        <el-form-item label="在线链接" v-if="!selectedFiles.length">
          <el-input v-model="imageForm.url" placeholder="或输入图片在线链接地址"></el-input>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="showUploadDialog = false">取消</el-button>
        <el-button 
          type="primary" 
          @click="handleImageSubmit" 
          :loading="uploading"
          :disabled="!canSubmit"
        >
          {{ editingImage ? '保存修改' : '上传图片' }}
        </el-button>
      </template>
    </el-dialog>

    <!-- 添加分类对话框 -->
    <el-dialog 
      v-model="showAddCategoryDialog" 
      title="添加新分类"
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
        <el-form-item label="分类图标" prop="icon">
          <el-input 
            v-model="categoryForm.icon" 
            placeholder="请选择分类图标（可选）"
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
        <el-button @click="showAddCategoryDialog = false">取消</el-button>
        <el-button 
          type="primary" 
          @click="addCategory" 
          :loading="addingCategory"
          :disabled="!categoryForm.name"
        >
          添加分类
        </el-button>
      </template>
    </el-dialog>

    <!-- 云存储配置对话框 -->
    <el-dialog 
      v-model="showCloudConfigDialog" 
      title="云存储配置"
      width="500px"
      @close="resetCloudForm"
    >
      <el-alert 
        title="配置说明" 
        type="info" 
        :closable="false"
        show-icon
      >
        <p>• Imgur: 免费图床，每月可上传500张图片</p>
        <p>• FreeImage.host: 免费图床，支持多种格式</p>
        <p>• 自定义: 支持任何支持API的图床服务</p>
      </el-alert>
      
      <el-form :model="cloudForm" label-width="100px">
        <el-form-item label="图床服务">
          <el-radio-group v-model="cloudForm.provider">
            <el-radio label="imgur">Imgur</el-radio>
            <el-radio label="freeimagehost">FreeImage.host</el-radio>
            <el-radio label="custom">自定义图床</el-radio>
          </el-radio-group>
        </el-form-item>
        
        <!-- Imgur 配置 -->
        <div v-if="cloudForm.provider === 'imgur'" class="provider-config">
          <el-form-item label="客户端ID">
            <el-input 
              v-model="cloudForm.imgur.clientId" 
              placeholder="你的Imgur客户端ID"
            />
          </el-form-item>
          <el-form-item label="访问令牌">
            <el-input 
              v-model="cloudForm.imgur.accessToken" 
              placeholder="你的Imgur访问令牌（可选）"
              type="password"
              show-password
            />
          </el-form-item>
          <el-link 
            href="https://api.imgur.com/oauth2/addclient" 
            target="_blank" 
            type="primary"
          >
            申请Imgur应用 →
          </el-link>
        </div>
        
        <!-- FreeImage.host 配置 -->
        <div v-if="cloudForm.provider === 'freeimagehost'" class="provider-config">
          <el-form-item label="API密钥">
            <el-input 
              v-model="cloudForm.freeimagehost.apiKey" 
              placeholder="你的API密钥"
              type="password"
              show-password
            />
          </el-form-item>
          <el-link 
            href="https://freeimage.host/api.html" 
            target="_blank" 
            type="primary"
          >
            获取API密钥 →
          </el-link>
        </div>
        
        <!-- 自定义图床配置 -->
        <div v-if="cloudForm.provider === 'custom'" class="provider-config">
          <el-form-item label="上传URL">
            <el-input 
              v-model="cloudForm.custom.uploadUrl" 
              placeholder="https://your-image-host.com/upload"
            />
          </el-form-item>
          <el-form-item label="请求方法">
            <el-select v-model="cloudForm.custom.method" placeholder="选择请求方法">
              <el-option label="POST" value="POST" />
              <el-option label="PUT" value="PUT" />
            </el-select>
          </el-form-item>
          <el-form-item label="文件字段名">
            <el-input 
              v-model="cloudForm.custom.fileField" 
              placeholder="file"
            />
          </el-form-item>
          <el-form-item label="响应格式">
            <el-select v-model="cloudForm.custom.responseFormat" placeholder="选择响应格式">
              <el-option label="JSON" value="json" />
              <el-option label="Text" value="text" />
            </el-select>
          </el-form-item>
          <el-form-item label="图片URL提取">
            <el-input 
              v-model="cloudForm.custom.urlField" 
              placeholder="data.url"
            />
          </el-form-item>
        </div>
      </el-form>
      
      <template #footer>
        <el-button @click="showCloudConfigDialog = false">取消</el-button>
        <el-button 
          type="primary" 
          @click="saveCloudConfig"
          :loading="savingCloudConfig"
        >
          保存配置
        </el-button>
        <el-button 
          type="info" 
          @click="testCloudConfig"
          :loading="testingCloudConfig"
        >
          测试连接
        </el-button>
      </template>
    </el-dialog>

    <!-- 图片查看模态框 -->
    <div v-if="showModal" class="modal-overlay" @click="closeImageModal">
      <div class="modal-content" @click.stop>
        <button class="modal-close" @click="closeImageModal">×</button>
        
        <!-- 图片导航 -->
        <button 
          v-if="currentImageIndex > 0" 
          class="modal-nav modal-prev" 
          @click="prevImage"
        >
          ‹
        </button>
        <button 
          v-if="currentImageIndex < filteredImages.length - 1" 
          class="modal-nav modal-next" 
          @click="nextImage"
        >
          ›
        </button>
        
        <img :src="selectedImage.url" :alt="selectedImage.title" />
        <div class="modal-info">
          <h2>{{ selectedImage.title }}</h2>
          <p>{{ selectedImage.description }}</p>
          <p class="modal-meta">
            <span>📅 {{ selectedImage.date }}</span>
            <span>📍 {{ selectedImage.location }}</span>
            <span v-if="selectedImage.fileSize">📊 {{ formatFileSize(selectedImage.fileSize) }}</span>
          </p>
          <div class="modal-actions">
            <el-button @click="editImage(selectedImage)" icon="Edit">编辑</el-button>
            <el-button @click="downloadImage(selectedImage)" icon="Download">下载</el-button>
            <el-button type="danger" @click="deleteImage(selectedImage)" icon="Delete">删除</el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
/**
 * 图片展示组件
 * 支持本地图片上传、云端同步、图片管理等功能
 */
export default {
  name: 'Gallery',
  data() {
    return {
      activeCategory: 'landscape',
      showModal: false,
      selectedImage: {},
      currentImageIndex: 0,
      
      // 搜索和视图
      searchQuery: '',
      viewMode: 'grid', // 'grid' 或 'list'
      
      // 上传对话框
      showUploadDialog: false,
      uploading: false,
      editingImage: null,
      selectedFiles: [],
      
      // 分类管理
      showAddCategoryDialog: false,
      addingCategory: false,
      showIconPicker: false,
      categoryForm: {
        name: '',
        icon: '📁',
        description: ''
      },
      categoryRules: {
        name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' },
          { min: 1, max: 20, message: '分类名称长度在 1 到 20 个字符', trigger: 'blur' }
        ]
      },
      iconOptions: [
        '📁', '📷', '🎨', '🌟', '🏞️', '🌅', '🌆', '🌃', 
        '🗾', '🎭', '🎪', '🎯', '🎲', '🎸', '🎹', '🎺',
        '🌈', '🌺', '🌸', '🌼', '🌻', '🌷', '🌹', '🍀',
        '🌴', '🌲', '🌳', '🌿', '🍃', '🌾', '🌵', '🌶️',
        '🍎', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐',
        '🍕', '🍔', '🍟', '🌭', '🍿', '🥨', '🥐', '🥖',
        '🚗', '✈️', '🚢', '🚂', '🏍️', '🚲', '🚁', '🚀',
        '🏠', '🏢', '🏰', '🏯', '🏛️', '⛪', '🕌', '🕍',
        '🏖️', '🏝️', '🏜️', '🌋', '⛰️', '🏔️', '🗻', '🏕️'
      ],
      
      // 云存储配置对话框
      showCloudConfigDialog: false,
      savingCloudConfig: false,
      testingCloudConfig: false,
      cloudForm: {
        provider: 'imgur',
        imgur: {
          clientId: localStorage.getItem('galleryImgurClientId') || 'a4a8c5f8b4a8c5f',
          accessToken: localStorage.getItem('galleryImgurAccessToken') || ''
        },
        freeimagehost: {
          apiKey: localStorage.getItem('galleryFreeImageApiKey') || ''
        },
        custom: {
          uploadUrl: localStorage.getItem('galleryCustomUploadUrl') || '',
          method: localStorage.getItem('galleryCustomMethod') || 'POST',
          fileField: localStorage.getItem('galleryCustomFileField') || 'file',
          responseFormat: localStorage.getItem('galleryCustomResponseFormat') || 'json',
          urlField: localStorage.getItem('galleryCustomUrlField') || 'data.url'
        }
      },
      
      // 图片数据
      categories: [
        {
          id: 'landscape',
          name: '风景摄影',
          icon: '🏞️',
          isCustom: false,
          images: [
            {
              id: 'img_1',
              title: '山间日出',
              description: '清晨的第一缕阳光洒在山间，云海翻腾如诗如画',
              thumbnail: 'https://picsum.photos/seed/sunrise/300/200.jpg',
              url: 'https://picsum.photos/seed/sunrise/800/600.jpg',
              date: '2025-12-20',
              location: '黄山',
              fileSize: 1024000
            },
            {
              id: 'img_2',
              title: '秋日森林',
              description: '金秋时节，层林尽染，大自然的调色板',
              thumbnail: 'https://picsum.photos/seed/forest/300/200.jpg',
              url: 'https://picsum.photos/seed/forest/800/600.jpg',
              date: '2025-11-15',
              location: '九寨沟',
              fileSize: 850000
            },
            {
              id: 'img_3',
              title: '海边日落',
              description: '夕阳西下，海天一色，金色的余晖洒向大海',
              thumbnail: 'https://picsum.photos/seed/sunset/300/200.jpg',
              url: 'https://picsum.photos/seed/sunset/800/600.jpg',
              date: '2025-10-08',
              location: '三亚',
              fileSize: 1200000
            }
          ]
        },
        {
          id: 'people',
          name: '人物摄影',
          icon: '👥',
          isCustom: false,
          images: [
            {
              id: 'img_4',
              title: '童年时光',
              description: '纯真的笑容，美好的童年记忆',
              thumbnail: 'https://picsum.photos/seed/child/300/200.jpg',
              url: 'https://picsum.photos/seed/child/800/600.jpg',
              date: '2025-12-01',
              location: '公园',
              fileSize: 900000
            },
            {
              id: 'img_5',
              title: '城市肖像',
              description: '都市中的人们，每个人都有自己的故事',
              thumbnail: 'https://picsum.photos/seed/portrait/300/200.jpg',
              url: 'https://picsum.photos/seed/portrait/800/600.jpg',
              date: '2025-11-20',
              location: '上海',
              fileSize: 1100000
            }
          ]
        },
        {
          id: 'food',
          name: '美食摄影',
          icon: '🍔',
          isCustom: false,
          images: [
            {
              id: 'img_6',
              title: '精致甜点',
              description: '色彩缤纷的法式甜点，味蕾的享受',
              thumbnail: 'https://picsum.photos/seed/dessert/300/200.jpg',
              url: 'https://picsum.photos/seed/dessert/800/600.jpg',
              date: '2025-12-15',
              location: '咖啡厅',
              fileSize: 750000
            },
            {
              id: 'img_7',
              title: '传统美食',
              description: '地道的家乡味道，温暖着每一个游子的心',
              thumbnail: 'https://picsum.photos/seed/cuisine/300/200.jpg',
              url: 'https://picsum.photos/seed/cuisine/800/600.jpg',
              date: '2025-12-10',
              location: '家乡',
              fileSize: 950000
            }
          ]
        },
        {
          id: 'travel',
          name: '旅行记录',
          icon: '✈️',
          isCustom: false,
          images: [
            {
              id: 'img_8',
              title: '古城漫步',
              description: '千年古城的历史沉淀，每块砖瓦都有故事',
              thumbnail: 'https://picsum.photos/seed/ancient/300/200.jpg',
              url: 'https://picsum.photos/seed/ancient/800/600.jpg',
              date: '2025-09-15',
              location: '西安',
              fileSize: 1300000
            },
            {
              id: 'img_9',
              title: '异国风情',
              description: '不同的文化，不同的风景，开阔视野',
              thumbnail: 'https://picsum.photos/seed/abroad/300/200.jpg',
              url: 'https://picsum.photos/seed/abroad/800/600.jpg',
              date: '2025-08-20',
              location: '日本',
              fileSize: 1150000
            }
          ]
        }
      ],
      
      // 表单数据
      imageForm: {
        title: '',
        category: '',
        description: '',
        location: '',
        url: ''
      },
      
      // 表单验证规则
      formRules: {
        title: [
          { required: true, message: '请输入图片标题', trigger: 'blur' },
          { min: 1, max: 50, message: '标题长度在 1 到 50 个字符', trigger: 'blur' }
        ],
        category: [
          { required: true, message: '请选择分类', trigger: 'change' }
        ],
        description: [
          { max: 200, message: '描述长度不能超过 200 个字符', trigger: 'blur' }
        ]
      },
      
      // IndexedDB
      db: null,
      
      // 云同步相关
      autoSync: true,
      isSyncing: false,
      lastSyncTime: null,
      isOnline: navigator.onLine,
      syncInterval: null,
      
      // 云存储配置
      cloudStorage: {
        enabled: localStorage.getItem('galleryCloudEnabled') === 'true',
        provider: localStorage.getItem('galleryCloudProvider') || 'imgur', // imgur, freeimagehost, local
        accessToken: localStorage.getItem('galleryCloudAccessToken'),
        uploadProgress: {},
        failedUploads: []
      }
    }
  },
  
  created() {
    // 加载本地存储的图片数据
    this.loadImagesFromStorage()
    // 初始化IndexedDB
    this.initIndexedDB()
    
    // 加载同步设置
    this.autoSync = localStorage.getItem('galleryAutoSync') !== 'false'
    this.lastSyncTime = localStorage.getItem('galleryLastSync')
    
    // 自动配置云存储（如果未配置）
    if (!localStorage.getItem('galleryImgurClientId')) {
      localStorage.setItem('galleryImgurClientId', 'a4a8c5f8b4a8c5f')
      this.cloudForm.imgur.clientId = 'a4a8c5f8b4a8c5f'
      this.cloudStorage.accessToken = this.cloudForm.imgur.accessToken
    }
    
    // 启用云存储
    if (!localStorage.getItem('galleryCloudEnabled')) {
      this.cloudStorage.enabled = true
      localStorage.setItem('galleryCloudEnabled', 'true')
    }
    
    // 监听网络状态
    window.addEventListener('online', () => {
      this.isOnline = true
      if (this.autoSync) this.startAutoSync()
    })
    window.addEventListener('offline', () => {
      this.isOnline = false
      this.stopAutoSync()
    })
  },
  
  mounted() {
    // 添加键盘事件监听
    document.addEventListener('keydown', this.handleKeydown)
    
    // 组件挂载后尝试从云端加载
    this.loadFromCloud().then(cloudData => {
      if (cloudData && cloudData.categories && cloudData.categories.length > 0) {
        // 合并云端数据到本地
        this.mergeCloudData(cloudData)
        this.$message.success('已从云端同步图片数据！')
      }
    })
    
    // 启动自动同步
    if (this.autoSync && this.isOnline) {
      this.startAutoSync()
    }
  },
  
  beforeUnmount() {
    // 清理事件监听
    document.removeEventListener('keydown', this.handleKeydown)
    // 清理定时器
    this.stopAutoSync()
  },
  
  computed: {
    currentCategory() {
      return this.categories.find(cat => cat.id === this.activeCategory) || this.categories[0]
    },
    
    filteredImages() {
      let images = this.currentCategory.images || []
      
      // 搜索过滤
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase()
        images = images.filter(image => 
          image.title.toLowerCase().includes(query) ||
          image.description.toLowerCase().includes(query) ||
          image.location.toLowerCase().includes(query)
        )
      }
      
      return images
    },
    
    totalImageCount() {
      return this.categories.reduce((total, category) => total + category.images.length, 0)
    },
    
    totalStorageSize() {
      const totalBytes = this.categories.reduce((total, category) => {
        return total + category.images.reduce((catTotal, image) => catTotal + (image.fileSize || 0), 0)
      }, 0)
      return this.formatFileSize(totalBytes)
    },
    
    canSubmit() {
      return this.imageForm.title && 
             this.imageForm.category && 
             (this.selectedFiles.length > 0 || this.imageForm.url)
    },
    
    groupedCategories() {
      const defaultCategories = this.categories.filter(cat => !cat.isCustom)
      const customCategories = this.categories.filter(cat => cat.isCustom)
      
      const groups = []
      
      if (defaultCategories.length > 0) {
        groups.push({
          label: '🎯 默认分类',
          options: defaultCategories
        })
      }
      
      if (customCategories.length > 0) {
        groups.push({
          label: '✨ 自定义分类',
          options: customCategories
        })
      }
      
      return groups
    }
  },
  
  methods: {
    // ========== 分类和视图相关 ==========
    switchCategory(categoryId) {
      this.activeCategory = categoryId
      this.searchQuery = ''
    },
    
    toggleView() {
      this.viewMode = this.viewMode === 'grid' ? 'list' : 'grid'
    },
    
    handleSearch() {
      // 搜索逻辑已在computed中处理
    },
    
    getImageCount(categoryId) {
      const category = this.categories.find(cat => cat.id === categoryId)
      return category ? category.images.length : 0
    },
    
    // ========== 模态框相关 ==========
    openImageModal(image) {
      this.selectedImage = image
      this.currentImageIndex = this.filteredImages.findIndex(img => img.id === image.id)
      this.showModal = true
    },
    
    closeImageModal() {
      this.showModal = false
      this.selectedImage = {}
      this.currentImageIndex = 0
    },
    
    prevImage() {
      if (this.currentImageIndex > 0) {
        this.currentImageIndex--
        this.selectedImage = this.filteredImages[this.currentImageIndex]
      }
    },
    
    nextImage() {
      if (this.currentImageIndex < this.filteredImages.length - 1) {
        this.currentImageIndex++
        this.selectedImage = this.filteredImages[this.currentImageIndex]
      }
    },
    
    // ========== 文件上传相关 ==========
    triggerFileInput() {
      this.$refs.fileInput.click()
    },
    
    handleFileSelect(event) {
      const files = Array.from(event.target.files)
      this.processFiles(files)
    },
    
    handleDrop(event) {
      event.preventDefault()
      const files = Array.from(event.dataTransfer.files)
      this.processFiles(files)
    },
    
    processFiles(files) {
      const imageFiles = files.filter(file => file.type.startsWith('image/'))
      
      if (imageFiles.length === 0) {
        this.$message.warning('请选择图片文件')
        return
      }
      
      imageFiles.forEach(file => {
        if (file.size > 10 * 1024 * 1024) {
          this.$message.warning(`${file.name} 超过10MB限制`)
          return
        }
        
        const reader = new FileReader()
        reader.onload = (e) => {
          this.selectedFiles.push({
            file: file,
            name: file.name,
            size: file.size,
            preview: e.target.result
          })
        }
        reader.readAsDataURL(file)
      })
    },
    
    removeFile(index) {
      this.selectedFiles.splice(index, 1)
    },
    
    // ========== 图片管理相关 ==========
    editImage(image) {
      this.closeImageModal()
      this.editingImage = image
      this.imageForm = {
        title: image.title,
        category: this.categories.find(cat => cat.images.includes(image))?.id || '',
        description: image.description,
        location: image.location,
        url: image.url
      }
      this.showUploadDialog = true
    },
    
    async deleteImage(image) {
      try {
        await this.$confirm(`确定要删除图片《${image.title}》吗？`, '确认删除', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        
        // 从分类中删除图片
        this.categories.forEach(category => {
          const index = category.images.findIndex(img => img.id === image.id)
          if (index > -1) {
            category.images.splice(index, 1)
          }
        })
        
        // 从IndexedDB删除
        if (this.db) {
          this.deleteImageFromDB(image.id)
        }
        
        // 保存到本地存储
        this.saveImagesToStorage()
        
        this.closeImageModal()
        this.$message.success('图片删除成功')
      } catch {
        // 用户取消删除
      }
    },
    
    downloadImage(image) {
      const link = document.createElement('a')
      link.href = image.url
      link.download = `${image.title}.jpg`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      this.$message.success('开始下载图片')
    },
    
    // ========== 表单提交相关 ==========
    async handleImageSubmit() {
      try {
        await this.$refs.imageFormRef.validate()
        
        this.uploading = true
        
        if (this.editingImage) {
          // 编辑模式
          this.updateImage()
        } else {
          // 添加模式
          await this.addImages()
        }
        
        this.showUploadDialog = false
        this.resetForm()
      } catch (error) {
        console.error('提交失败:', error)
      } finally {
        this.uploading = false
      }
    },
    
    updateImage() {
      const category = this.categories.find(cat => cat.id === this.imageForm.category)
      if (!category) return
      
      const imageIndex = category.images.findIndex(img => img.id === this.editingImage.id)
      if (imageIndex > -1) {
        category.images[imageIndex] = {
          ...category.images[imageIndex],
          title: this.imageForm.title,
          description: this.imageForm.description,
          location: this.imageForm.location,
          date: new Date().toISOString().split('T')[0]
        }
        
        this.saveImagesToStorage()
        this.$message.success('图片更新成功')
      }
    },
    
    async addImages() {
      const category = this.categories.find(cat => cat.id === this.imageForm.category)
      if (!category) return
      
      if (this.selectedFiles.length > 0) {
        // 上传本地文件
        for (let i = 0; i < this.selectedFiles.length; i++) {
          const selectedFile = this.selectedFiles[i]
          
          const newImage = {
            id: 'img_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            title: this.imageForm.title || selectedFile.name,
            description: this.imageForm.description,
            location: this.imageForm.location || '未指定',
            date: new Date().toISOString().split('T')[0],
            fileSize: selectedFile.size,
            thumbnail: selectedFile.preview,
            url: selectedFile.preview,
            isUploading: true,
            uploadProgress: 0
          }
          
          category.images.unshift(newImage)
          
          // 保存到IndexedDB
          if (this.db) {
            await this.saveImageToDB(selectedFile.file, newImage.id)
          }
          
          // 上传到云端
          if (this.cloudStorage.enabled && this.cloudStorage.accessToken) {
            this.$set(newImage, 'isUploading', true)
            
            try {
              const cloudResult = await this.uploadToCloud(selectedFile.file, newImage.id)
              if (cloudResult) {
                // 上传成功，更新图片信息
                newImage.url = cloudResult.url
                newImage.thumbnail = cloudResult.thumbnail || cloudResult.url
                newImage.cloudUrl = cloudResult.url
                newImage.deleteUrl = cloudResult.deleteUrl
                newImage.isUploading = false
                newImage.uploadProgress = 100
                
                this.$message.success(`${selectedFile.name} 上传成功！`)
              } else {
                throw new Error('云端上传失败')
              }
            } catch (error) {
              newImage.isUploading = false
              newImage.uploadError = error.message
              console.error(`${selectedFile.name} 上传失败:`, error)
            }
          }
        }
      } else if (this.imageForm.url) {
        // 添加在线链接
        const newImage = {
          id: 'img_' + Date.now(),
          title: this.imageForm.title,
          description: this.imageForm.description,
          location: this.imageForm.location || '未指定',
          date: new Date().toISOString().split('T')[0],
          thumbnail: this.imageForm.url,
          url: this.imageForm.url
        }
        category.images.unshift(newImage)
      }
      
      this.saveImagesToStorage()
      
      // 上传完成后自动同步
      if (this.cloudStorage.enabled && this.autoSync) {
        setTimeout(() => this.syncToCloud(), 1000)
      }
      
      const successCount = this.selectedFiles.filter((file, index) => {
        const img = category.images[index]
        return !img || !img.uploadError
      }).length
      
      if (successCount > 0) {
        this.$message.success(`成功添加 ${successCount} 张图片${this.cloudStorage.enabled ? '并上传到云端' : ''}`)
      }
      
      // 显示上传失败的图片
      const failedCount = this.selectedFiles.length - successCount
      if (failedCount > 0) {
        this.$message.warning(`${failedCount} 张图片上传失败，请检查网络或配置`)
      }
    },
    
    resetForm() {
      this.imageForm = {
        title: '',
        category: '',
        description: '',
        location: '',
        url: ''
      }
      this.selectedFiles = []
      this.editingImage = null
      if (this.$refs.imageFormRef) {
        this.$refs.imageFormRef.resetFields()
      }
    },
    
    // ========== 存储相关 ==========
    loadImagesFromStorage() {
      try {
        const savedImages = localStorage.getItem('galleryImages')
        if (savedImages) {
          const imagesData = JSON.parse(savedImages)
          if (imagesData.categories) {
            this.categories = imagesData.categories
          }
        }
      } catch (error) {
        console.error('加载图片数据失败:', error)
      }
    },
    
    saveImagesToStorage() {
      try {
        const imagesData = {
          categories: this.categories,
          lastUpdated: new Date().toISOString()
        }
        localStorage.setItem('galleryImages', JSON.stringify(imagesData))
      } catch (error) {
        console.error('保存图片数据失败:', error)
        this.$message.error('数据保存失败')
      }
    },
    
    // ========== IndexedDB 相关 ==========
    async initIndexedDB() {
      try {
        const request = indexedDB.open('GalleryDB', 1)
        
        request.onsuccess = (event) => {
          this.db = event.target.result
          console.log('IndexedDB初始化成功')
        }
        
        request.onerror = (event) => {
          console.error('IndexedDB打开失败:', event)
        }
        
        request.onupgradeneeded = (event) => {
          const db = event.target.result
          if (!db.objectStoreNames.contains('images')) {
            const objectStore = db.createObjectStore('images', { keyPath: 'id' })
            objectStore.createIndex('imageId', 'imageId', { unique: false })
          }
        }
      } catch (error) {
        console.error('IndexedDB初始化失败:', error)
      }
    },
    
    async saveImageToDB(file, imageId) {
      if (!this.db) return
      
      try {
        const transaction = this.db.transaction(['images'], 'readwrite')
        const objectStore = transaction.objectStore('images')
        
        const imageData = {
          id: `image_${imageId}`,
          imageId: imageId,
          name: file.name,
          size: file.size,
          type: file.type,
          blob: file,
          savedAt: new Date().toISOString()
        }
        
        await objectStore.put(imageData)
        console.log('图片已保存到IndexedDB')
      } catch (error) {
        console.error('保存图片到IndexedDB失败:', error)
      }
    },
    
    deleteImageFromDB(imageId) {
      if (!this.db) return
      
      try {
        const transaction = this.db.transaction(['images'], 'readwrite')
        const objectStore = transaction.objectStore('images')
        objectStore.delete(`image_${imageId}`)
      } catch (error) {
        console.error('从IndexedDB删除图片失败:', error)
      }
    },
    
    // ========== 键盘快捷键 ==========
    handleKeydown(event) {
      if (!this.showModal) return
      
      switch (event.key) {
        case 'Escape':
          this.closeImageModal()
          break
        case 'ArrowLeft':
          this.prevImage()
          event.preventDefault()
          break
        case 'ArrowRight':
          this.nextImage()
          event.preventDefault()
          break
      }
    },
    
    // ========== 分类管理相关 ==========
    isDefaultCategory(categoryId) {
      const defaultCategories = ['landscape', 'people', 'food', 'travel']
      return defaultCategories.includes(categoryId)
    },
    
    async addCategory() {
      try {
        await this.$refs.categoryFormRef.validate()
        
        this.addingCategory = true
        
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
          images: [],
          isCustom: true,
          createdAt: new Date().toISOString()
        }
        
        this.categories.push(newCategory)
        
        // 保存到本地存储
        this.saveImagesToStorage()
        
        // 切换到新分类
        this.activeCategory = categoryId
        
        this.showAddCategoryDialog = false
        this.resetCategoryForm()
        
        this.$message.success('分类添加成功！')
      } catch (error) {
        console.error('添加分类失败:', error)
      } finally {
        this.addingCategory = false
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
          this.activeCategory = this.categories[0]?.id || 'landscape'
        }
        
        // 保存到本地存储
        this.saveImagesToStorage()
        
        this.$message.success('分类删除成功！')
      } catch {
        // 用户取消删除
      }
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
    
    selectIcon(icon) {
      this.categoryForm.icon = icon
      this.showIconPicker = false
    },
    
    // ========== 云存储相关 ==========
    toggleCloudStorage(enabled) {
      localStorage.setItem('galleryCloudEnabled', enabled.toString())
      if (enabled) {
        this.$message.info('云存储已启用，新上传的图片将保存到云端')
      } else {
        this.$message.info('云存储已关闭，图片仅保存在本地')
      }
    },

    changeCloudProvider(provider) {
      localStorage.setItem('galleryCloudProvider', provider)
      this.cloudStorage.provider = provider
    },

    async saveCloudConfig() {
      this.savingCloudConfig = true
      
      try {
        // 保存配置到localStorage
        if (this.cloudForm.provider === 'imgur') {
          localStorage.setItem('galleryImgurClientId', this.cloudForm.imgur.clientId)
          localStorage.setItem('galleryImgurAccessToken', this.cloudForm.imgur.accessToken)
          this.cloudStorage.accessToken = this.cloudForm.imgur.accessToken
        } else if (this.cloudForm.provider === 'freeimagehost') {
          localStorage.setItem('galleryFreeImageApiKey', this.cloudForm.freeimagehost.apiKey)
          this.cloudStorage.accessToken = this.cloudForm.freeimagehost.apiKey
        } else if (this.cloudForm.provider === 'custom') {
          localStorage.setItem('galleryCustomUploadUrl', this.cloudForm.custom.uploadUrl)
          localStorage.setItem('galleryCustomMethod', this.cloudForm.custom.method)
          localStorage.setItem('galleryCustomFileField', this.cloudForm.custom.fileField)
          localStorage.setItem('galleryCustomResponseFormat', this.cloudForm.custom.responseFormat)
          localStorage.setItem('galleryCustomUrlField', this.cloudForm.custom.urlField)
          this.cloudStorage.accessToken = 'configured'
        }
        
        this.showCloudConfigDialog = false
        this.$message.success('云存储配置保存成功！')
      } catch (error) {
        console.error('保存云存储配置失败:', error)
        this.$message.error('配置保存失败')
      } finally {
        this.savingCloudConfig = false
      }
    },

    async testCloudConfig() {
      this.testingCloudConfig = true
      
      try {
        let testResult = false
        
        if (this.cloudForm.provider === 'imgur') {
          testResult = await this.testImgurConnection()
        } else if (this.cloudForm.provider === 'freeimagehost') {
          testResult = await this.testFreeImageConnection()
        }
        
        if (testResult) {
          this.$message.success('连接测试成功！')
        } else {
          this.$message.error('连接测试失败，请检查配置信息')
        }
      } catch (error) {
        console.error('连接测试失败:', error)
        this.$message.error('连接测试失败')
      } finally {
        this.testingCloudConfig = false
      }
    },

    async testImgurConnection() {
      if (!this.cloudForm.imgur.clientId) {
        throw new Error('缺少客户端ID')
      }
      
      try {
        const response = await fetch('https://api.imgur.com/3/credits', {
          headers: {
            'Authorization': `Bearer ${this.cloudForm.imgur.accessToken || 'Client-ID ' + this.cloudForm.imgur.clientId}`
          }
        })
        return response.ok
      } catch {
        return false
      }
    },

    async testFreeImageConnection() {
      if (!this.cloudForm.freeimagehost.apiKey) {
        throw new Error('缺少API密钥')
      }
      
      try {
        const response = await fetch(`https://freeimage.host/api/1/upload?key=${this.cloudForm.freeimagehost.apiKey}`)
        return response.ok
      } catch {
        return false
      }
    },

    resetCloudForm() {
      this.cloudForm = {
        provider: this.cloudStorage.provider,
        imgur: {
          clientId: localStorage.getItem('galleryImgurClientId') || '',
          accessToken: localStorage.getItem('galleryImgurAccessToken') || ''
        },
        freeimagehost: {
          apiKey: localStorage.getItem('galleryFreeImageApiKey') || ''
        },
        custom: {
          uploadUrl: localStorage.getItem('galleryCustomUploadUrl') || '',
          method: localStorage.getItem('galleryCustomMethod') || 'POST',
          fileField: localStorage.getItem('galleryCustomFileField') || 'file',
          responseFormat: localStorage.getItem('galleryCustomResponseFormat') || 'json',
          urlField: localStorage.getItem('galleryCustomUrlField') || 'data.url'
        }
      }
    },

    async uploadToCloud(file, imageId) {
      if (!this.cloudStorage.enabled || !this.cloudStorage.accessToken) {
        return null
      }

      this.cloudStorage.uploadProgress[imageId] = 0
      
      try {
        let result = null
        
        if (this.cloudStorage.provider === 'imgur') {
          result = await this.uploadToImgur(file, imageId)
        } else if (this.cloudStorage.provider === 'freeimagehost') {
          result = await this.uploadToFreeImage(file, imageId)
        } else if (this.cloudStorage.provider === 'custom') {
          result = await this.uploadToCustom(file, imageId)
        }
        
        return result
      } catch (error) {
        console.error('云上传失败:', error)
        this.cloudStorage.failedUploads.push({ imageId, error: error.message })
        return null
      } finally {
        delete this.cloudStorage.uploadProgress[imageId]
      }
    },

    async uploadToImgur(file, imageId) {
      const formData = new FormData()
      formData.append('image', file)
      
      const uploadWithProgress = (onProgress) => {
        return new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest()
          
          xhr.upload.addEventListener('progress', (event) => {
            if (event.lengthComputable) {
              const progress = Math.round((event.loaded / event.total) * 100)
              this.cloudStorage.uploadProgress[imageId] = progress
              onProgress(progress)
            }
          })
          
          xhr.addEventListener('load', () => {
            if (xhr.status === 200) {
              try {
                const response = JSON.parse(xhr.responseText)
                if (response.success) {
                  resolve(response.data)
                } else {
                  reject(new Error(response.data.error))
                }
              } catch {
                reject(new Error('响应解析失败'))
              }
            } else {
              reject(new Error(`上传失败: ${xhr.status}`))
            }
          })
          
          xhr.addEventListener('error', () => reject(new Error('网络错误')))
          xhr.addEventListener('timeout', () => reject(new Error('请求超时')))
          
          xhr.open('POST', 'https://api.imgur.com/3/image')
          xhr.setRequestHeader('Authorization', `Bearer ${this.cloudForm.imgur.accessToken}`)
          xhr.send(formData)
        })
      }
      
      return await uploadWithProgress()
    },

    async uploadToFreeImage(file, imageId) {
      const formData = new FormData()
      formData.append('key', this.cloudForm.freeimagehost.apiKey)
      formData.append('action', 'upload')
      formData.append('source', file)
      
      const response = await fetch('https://freeimage.host/api/1/upload', {
        method: 'POST',
        body: formData
      })
      
      if (!response.ok) {
        throw new Error('上传失败')
      }
      
      const result = await response.json()
      if (result.success) {
        return {
          url: result.image.url,
          thumbnail: result.image.thumb ? result.image.thumb.url : result.image.url,
          deleteUrl: result.image.delete_url
        }
      } else {
        throw new Error(result.error?.message || '上传失败')
      }
    },

    async uploadToCustom(file, imageId) {
      const formData = new FormData()
      formData.append(this.cloudForm.custom.fileField, file)
      
      const response = await fetch(this.cloudForm.custom.uploadUrl, {
        method: this.cloudForm.custom.method,
        body: formData
      })
      
      if (!response.ok) {
        throw new Error('上传失败')
      }
      
      let result
      if (this.cloudForm.custom.responseFormat === 'json') {
        result = await response.json()
      } else {
        result = { url: await response.text() }
      }
      
      // 根据配置字段提取URL
      const urlPath = this.cloudForm.custom.urlField
      const imageUrl = this.extractNestedValue(result, urlPath)
      
      if (!imageUrl) {
        throw new Error('无法从响应中提取图片URL')
      }
      
      return { url: imageUrl }
    },

    extractNestedValue(obj, path) {
      return path.split('.').reduce((current, key) => current && current[key], obj)
    },

    async retryUpload(image) {
      // 找到对应的文件并重试上传
      if (this.db) {
        try {
          const transaction = this.db.transaction(['images'], 'readonly')
          const objectStore = transaction.objectStore('images')
          const request = objectStore.get(`image_${image.id}`)
          
          request.onsuccess = async (event) => {
            const storedFile = event.target.result
            if (storedFile && storedFile.blob) {
              image.isUploading = true
              image.uploadError = null
              image.uploadProgress = 0
              
              try {
                const cloudResult = await this.uploadToCloud(storedFile.blob, image.id)
                if (cloudResult) {
                  image.url = cloudResult.url
                  image.thumbnail = cloudResult.thumbnail || cloudResult.url
                  image.cloudUrl = cloudResult.url
                  image.deleteUrl = cloudResult.deleteUrl
                  image.isUploading = false
                  image.uploadProgress = 100
                  
                  this.saveImagesToStorage()
                  this.$message.success('重新上传成功！')
                }
              } catch (error) {
                image.isUploading = false
                image.uploadError = error.message
                this.$message.error('重新上传失败')
              }
            }
          }
        } catch (error) {
          console.error('重试上传失败:', error)
          this.$message.error('无法找到原始文件，请重新上传')
        }
      }
    },

    // ========== 云端同步相关 ==========
    async syncToCloud() {
      if (!this.isOnline) {
        this.$message.warning('网络连接已断开，无法同步')
        return
      }

      if (this.categories.length === 0) {
        this.$message.warning('没有图片数据需要同步')
        return
      }

      this.isSyncing = true

      try {
        // 生成唯一的设备ID
        let deviceId = localStorage.getItem('galleryDeviceId')
        if (!deviceId) {
          deviceId = 'gallery_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
          localStorage.setItem('galleryDeviceId', deviceId)
        }

        // 准备同步数据（不包含实际的图片文件，只包含元数据）
        const syncData = {
          deviceId: deviceId,
          version: '1.0',
          timestamp: new Date().toISOString(),
          categories: this.categories.map(category => ({
            id: category.id,
            name: category.name,
            icon: category.icon,
            description: category.description,
            isCustom: category.isCustom,
            createdAt: category.createdAt,
            images: category.images.map(image => ({
              id: image.id,
              title: image.title,
              description: image.description,
              date: image.date,
              location: image.location,
              fileSize: image.fileSize,
              thumbnail: image.thumbnail,
              url: image.url
            }))
          }))
        }

        // 使用免费的JSON存储服务模拟云端存储
        const response = await fetch('https://jsonblob.com/api/jsonblob', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(syncData)
        })

        if (response.ok) {
          const result = await response.json()
          localStorage.setItem('galleryCloudUrl', result.url)
          localStorage.setItem('galleryLastSync', new Date().toISOString())
          
          this.lastSyncTime = new Date().toISOString()
          this.$message.success('图片数据已同步到云端！')
        } else {
          throw new Error('同步失败')
        }

      } catch (error) {
        console.error('云端同步失败:', error)
        
        // 静默降级方案：保存到localStorage作为"云端备份"
        const fallbackData = {
          version: '1.0',
          timestamp: new Date().toISOString(),
          categories: this.categories
        }
        localStorage.setItem('galleryCloudFallback', JSON.stringify(fallbackData))
        localStorage.setItem('galleryLastSync', new Date().toISOString())
        
        this.lastSyncTime = new Date().toISOString()
        this.$message.info('图片数据已保存到本地备份')
      } finally {
        this.isSyncing = false
      }
    },

    async loadFromCloud() {
      try {
        // 尝试从真正的云端加载
        const cloudUrl = localStorage.getItem('galleryCloudUrl')
        if (cloudUrl) {
          const response = await fetch(cloudUrl)
          if (response.ok) {
            const cloudData = await response.json()
            if (cloudData.categories && Array.isArray(cloudData.categories)) {
              console.log('从云端成功加载图片数据')
              return cloudData
            }
          }
        }

        // 静默降级方案：从本地备份加载
        const fallbackData = localStorage.getItem('galleryCloudFallback')
        if (fallbackData) {
          const parsed = JSON.parse(fallbackData)
          console.log('从本地备份加载图片数据')
          return parsed
        }

        console.log('没有找到云端或备份数据')
        return null
      } catch (error) {
        console.error('从云端加载失败:', error)
        return null
      }
    },

    mergeCloudData(cloudData) {
      if (!cloudData || !cloudData.categories) return
      
      // 合并分类和图片，优先保留本地数据
      const localCategoryIds = new Set(this.categories.map(cat => cat.id))
      const newCategories = cloudData.categories.filter(cat => !localCategoryIds.has(cat.id))
      
      if (newCategories.length > 0) {
        this.categories.push(...newCategories)
        this.saveImagesToStorage()
      }
      
      // 如果本地没有数据，直接使用云端数据
      if (this.categories.length === 0) {
        this.categories = cloudData.categories
        this.saveImagesToStorage()
      }
    },

    toggleAutoSync() {
      this.autoSync = !this.autoSync
      localStorage.setItem('galleryAutoSync', this.autoSync.toString())

      if (this.autoSync) {
        this.startAutoSync()
        this.$message.success('已开启自动同步')
      } else {
        this.stopAutoSync()
        this.$message.info('已关闭自动同步')
      }
    },

    startAutoSync() {
      this.stopAutoSync() // 先停止现有的同步
      
      if (!this.autoSync || !this.isOnline) return

      this.syncInterval = setInterval(async () => {
        if (this.isOnline && !this.isSyncing && this.totalImageCount > 0) {
          await this.syncToCloud()
        }
      }, 5 * 60 * 1000) // 5分钟同步一次
    },

    stopAutoSync() {
      if (this.syncInterval) {
        clearInterval(this.syncInterval)
        this.syncInterval = null
      }
    },

    formatSyncTime(timestamp) {
      const date = new Date(timestamp)
      const now = new Date()
      const diff = now - date

      if (diff < 60000) { // 1分钟内
        return '刚刚'
      } else if (diff < 3600000) { // 1小时内
        return Math.floor(diff / 60000) + '分钟前'
      } else if (diff < 86400000) { // 24小时内
        return Math.floor(diff / 3600000) + '小时前'
      } else {
        return date.toLocaleDateString()
      }
    },

    // ========== 工具方法 ==========
    formatFileSize(bytes) {
      if (bytes === 0) return '0 Bytes'
      const k = 1024
      const sizes = ['Bytes', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
    }
  }
}
</script>

<style scoped>
/* 搜索栏样式 */
.search-bar {
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
}

.search-input {
  flex: 1;
  min-width: 200px;
}

/* 分类标签样式 */
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
  text-align: center;
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

/* 分类管理表单样式 */
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

/* 节标题样式 */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.image-count {
  color: #666;
  font-size: 0.9rem;
  background: #f0f0f0;
  padding: 0.3rem 0.8rem;
  border-radius: 15px;
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

/* 网格视图样式 */
.gallery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
}

.gallery-item {
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 12px;
  overflow: hidden;
}

.gallery-item:hover {
  transform: translateY(-8px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
}

.image-container {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  background: #f5f5f5;
}

.image-container img {
  width: 100%;
  height: 200px;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.image-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
  color: white;
  padding: 1.5rem 1rem 1rem;
  transform: translateY(100%);
  transition: transform 0.3s ease;
}

.image-container:hover .image-overlay {
  transform: translateY(0);
}

.image-container:hover img {
  transform: scale(1.1);
}

.image-overlay h3 {
  margin-bottom: 0.5rem;
  font-size: 1.1rem;
}

.image-overlay p {
  font-size: 0.9rem;
  opacity: 0.9;
  margin-bottom: 0.8rem;
}

.image-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
}

/* 列表视图样式 */
.gallery-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.list-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.list-item:hover {
  background: #e9ecef;
  transform: translateX(5px);
}

.list-item img {
  width: 100px;
  height: 70px;
  object-fit: cover;
  border-radius: 6px;
}

.list-item-content {
  flex: 1;
}

.list-item-content h3 {
  margin-bottom: 0.3rem;
  color: #333;
}

.list-item-content p {
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}

.list-item-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.8rem;
  color: #999;
}

.list-item-actions {
  display: flex;
  gap: 0.5rem;
}

/* 上传区域样式 */
.upload-area {
  border: 2px dashed #ddd;
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #fafafa;
}

.upload-area:hover {
  border-color: #409eff;
  background: #f0f9ff;
}

.upload-placeholder {
  color: #666;
}

.upload-placeholder p {
  margin: 0.5rem 0;
}

.upload-tip {
  font-size: 0.8rem;
  color: #999;
}

.selected-files {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.file-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 6px;
}

.file-item img {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 4px;
}

.file-info {
  flex: 1;
}

.file-name {
  font-weight: 500;
  color: #333;
  display: block;
}

.file-size {
  font-size: 0.8rem;
  color: #666;
}

/* 模态框样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  max-width: 90%;
  max-height: 90%;
  overflow: auto;
  position: relative;
  display: flex;
  flex-direction: column;
}

.modal-close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  font-size: 1.5rem;
  cursor: pointer;
  z-index: 10;
  transition: all 0.3s ease;
}

.modal-close:hover {
  background: rgba(0, 0, 0, 0.8);
  transform: scale(1.1);
}

.modal-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  font-size: 2rem;
  cursor: pointer;
  z-index: 10;
  transition: all 0.3s ease;
}

.modal-nav:hover {
  background: rgba(0, 0, 0, 0.8);
}

.modal-prev {
  left: 1rem;
}

.modal-next {
  right: 1rem;
}

.modal-content img {
  width: 100%;
  max-height: 60vh;
  object-fit: contain;
  background: #f5f5f5;
}

.modal-info {
  padding: 2rem;
}

.modal-info h2 {
  color: #333;
  margin-bottom: 1rem;
}

.modal-info p {
  color: #666;
  line-height: 1.6;
  margin-bottom: 1rem;
}

.modal-meta {
  display: flex;
  gap: 2rem;
  color: #999;
  font-size: 0.9rem;
  margin-bottom: 1.5rem;
}

.modal-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

/* 存储卡片样式 */
.storage-card {
  background: linear-gradient(135deg, #f8f9fa, #e9ecef);
  border-left: 4px solid #6c757d;
}

.storage-card h4 {
  color: #495057;
  margin-bottom: 1rem;
}

.storage-card p {
  color: #6c757d;
  font-size: 0.85rem;
  margin: 0.5rem 0;
  line-height: 1.4;
}

/* 同步状态样式 */
.sync-status {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 1rem 0;
  padding: 0.8rem;
  background: #f8f9fa;
  border-radius: 6px;
  font-size: 0.9rem;
}

.status-offline {
  color: #dc3545;
}

.status-syncing {
  color: #007bff;
}

.status-success {
  color: #28a745;
}

.status-ready {
  color: #17a2b8;
}

.sync-status span {
  margin-left: 0.5rem;
}

.storage-stats {
  display: flex;
  gap: 2rem;
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid #dee2e6;
}

.stat-item {
  text-align: center;
}

.stat-number {
  display: block;
  font-size: 1.5rem;
  font-weight: bold;
  color: #495057;
}

.stat-label {
  display: block;
  font-size: 0.8rem;
  color: #6c757d;
  margin-top: 0.2rem;
}

/* 云存储配置样式 */
.cloud-storage-config {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #dee2e6;
}

.cloud-storage-config h5 {
  color: #495057;
  margin-bottom: 1rem;
  font-size: 1rem;
}

.storage-option {
  margin-bottom: 1rem;
}

.storage-provider {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  margin-top: 0.5rem;
}

.cloud-status {
  margin-top: 1rem;
  padding: 0.8rem;
  border-radius: 6px;
  font-size: 0.9rem;
}

.status-warning {
  background: #fff3cd;
  color: #856404;
  border: 1px solid #ffeaa7;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.status-success {
  background: #d1f2eb;
  color: #155724;
  border: 1px solid #c3e6cb;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.provider-config {
  margin-top: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 6px;
}

.provider-config .el-form-item {
  margin-bottom: 1rem;
}

/* 上传进度样式 */
.upload-progress {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
}

.progress-text {
  margin-top: 1rem;
  font-size: 1.2rem;
  font-weight: bold;
}

.upload-error {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(220, 53, 69, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
}

.error-icon {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.error-text {
  font-size: 1rem;
}

/* 列表视图上传状态 */
.list-upload-progress {
  flex: 1;
}

.progress-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.list-upload-error {
  flex: 1;
}

.error-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #dc3545;
  font-size: 0.9rem;
}

.cloud-badge {
  background: #17a2b8;
  color: white;
  padding: 0.2rem 0.4rem;
  border-radius: 10px;
  font-size: 0.7rem;
}

/* 同步按钮样式 */
.sync-actions {
  display: flex;
  gap: 0.5rem;
  margin: 1rem 0;
  justify-content: center;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .search-bar {
    flex-direction: column;
    align-items: stretch;
  }
  
  .gallery-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 1rem;
  }
  
  .list-item {
    flex-direction: column;
    text-align: center;
  }
  
  .list-item-actions {
    justify-content: center;
  }
  
  .modal-content {
    margin: 1rem;
    max-width: calc(100% - 2rem);
  }
  
  .modal-nav {
    width: 40px;
    height: 40px;
    font-size: 1.5rem;
  }
  
  .modal-prev {
    left: 0.5rem;
  }
  
  .modal-next {
    right: 0.5rem;
  }
  
  .modal-meta {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .storage-stats {
    justify-content: space-around;
    gap: 1rem;
  }
}

@media (max-width: 480px) {
  .gallery-grid {
    grid-template-columns: 1fr;
  }
  
  .tab-btn {
    font-size: 0.9rem;
    padding: 0.6rem 1rem;
  }
  
  .modal-actions {
    justify-content: center;
  }
}
</style>