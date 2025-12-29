<template>
  <div class="page-container">
    <div class="page-header">
      <h1 class="page-title">📚 学习笔记</h1>
      <p class="page-subtitle">记录学习历程，分享技术心得</p>
    </div>

    <!-- 搜索和筛选栏 -->
    <div class="card">
      <div class="search-bar">
        <el-input 
          v-model="searchQuery" 
          placeholder="搜索笔记标题或内容..."
          prefix-icon="Search"
          clearable
          @input="handleSearch"
          class="search-input"
        />
        <el-button @click="showAddDialog = true" type="primary" icon="EditPen">
          写笔记
        </el-button>
        <el-button @click="toggleView" icon="Grid">
          {{ viewMode === 'card' ? '列表视图' : '卡片视图' }}
        </el-button>
      </div>
    </div>

    <!-- 分类标签 -->
    <div class="card">
      <div class="section-header">
        <h2 class="card-title">学习分类</h2>
        <div class="category-actions">
          <el-button @click="showCategoryDialog = true" type="primary" size="small" icon="Plus">
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
          <span class="category-count">({{ getNoteCount(category.id) }})</span>
          <el-button 
            v-if="!isDefaultCategory(category.id) && getNoteCount(category.id) === 0"
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

    <!-- 推荐学习资源 -->
    <div class="card">
      <div class="section-header">
        <h2 class="card-title">📚 推荐学习资源</h2>
        <div class="resource-controls">
          <el-select v-model="selectedResourceCategory" placeholder="选择分类" size="small" @change="filterResources">
            <el-option label="全部资源" value="all"></el-option>
            <el-option label="前端开发" value="frontend"></el-option>
            <el-option label="后端开发" value="backend"></el-option>
            <el-option label="综合教程" value="tutorial"></el-option>
          </el-select>
          <span class="resource-count">共 {{ getResourceCount() }} 个资源</span>
        </div>
      </div>
      
      <div class="resources-grid">
        <div 
          v-for="resource in filteredResources" 
          :key="resource.id"
          class="resource-card"
          @click="openResource(resource.url)"
        >
          <div class="resource-header">
            <span class="resource-icon">{{ resource.icon }}</span>
            <div class="resource-info">
              <h3 class="resource-title">{{ resource.title }}</h3>
              <span class="resource-category">{{ resource.category }}</span>
            </div>
          </div>
          <p class="resource-description">{{ resource.description }}</p>
          <div class="resource-meta">
            <el-tag 
              :type="resource.difficulty === 'beginner' ? 'success' : resource.difficulty === 'intermediate' ? 'warning' : 'danger'" 
              size="small"
            >
              {{ resource.difficulty === 'beginner' ? '入门' : resource.difficulty === 'intermediate' ? '进阶' : '高级' }}
            </el-tag>
            <span class="resource-price">{{ resource.price || '免费' }}</span>
          </div>
          <div class="resource-tags">
            <span v-for="tag in resource.tags" :key="tag" class="tag">{{ tag }}</span>
          </div>
          <div class="resource-actions">
            <el-button type="primary" size="small" @click.stop="openResource(resource.url)">
              访问学习
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 笔记列表 -->
    <div class="card">
      <div class="section-header">
        <h2 class="card-title">{{ currentCategoryName }}</h2>
        <span class="note-count">共 {{ filteredNotes.length }} 篇笔记</span>
      </div>
      
      <!-- 空状态 -->
      <div v-if="filteredNotes.length === 0" class="empty-state">
        <div class="empty-icon">📝</div>
        <h3>暂无笔记</h3>
        <p>{{ searchQuery ? '没有找到匹配的笔记' : '快去写你的第一篇学习笔记吧！' }}</p>
        <el-button @click="showAddDialog = true" type="primary" icon="EditPen">
          立即写笔记
        </el-button>
      </div>

      <!-- 卡片视图 -->
      <div v-else-if="viewMode === 'card'" class="notes-grid">
        <div 
          v-for="note in filteredNotes" 
          :key="note.id"
          class="note-card"
          @click="openNoteModal(note)"
        >
          <div class="note-header">
            <h3>{{ note.title }}</h3>
            <div class="note-meta">
              <span class="note-category">{{ getCategoryName(note.category) }}</span>
              <span class="note-date">{{ formatDate(note.date) }}</span>
            </div>
          </div>
          <div class="note-content">
            <p>{{ truncateText(note.content, 150) }}</p>
            <div class="note-tags">
              <span 
                v-for="tag in note.tags" 
                :key="tag"
                class="tag"
              >
                {{ tag }}
              </span>
            </div>
          </div>
          <div class="note-actions">
            <el-button size="small" icon="Edit" @click.stop="editNote(note)">编辑</el-button>
            <el-button size="small" type="danger" icon="Delete" @click.stop="deleteNote(note)">删除</el-button>
          </div>
        </div>
      </div>

      <!-- 列表视图 -->
      <div v-else class="notes-list">
        <div 
          v-for="note in filteredNotes" 
          :key="note.id"
          class="list-item"
          @click="openNoteModal(note)"
        >
          <div class="list-item-content">
            <h3>{{ note.title }}</h3>
            <p>{{ truncateText(note.content, 200) }}</p>
            <div class="list-item-meta">
              <span class="note-category">{{ getCategoryName(note.category) }}</span>
              <span class="note-date">{{ formatDate(note.date) }}</span>
              <span class="note-tags">
                <span v-for="tag in note.tags" :key="tag" class="tag">#{{ tag }}</span>
              </span>
            </div>
          </div>
          <div class="list-item-actions">
            <el-button size="small" icon="Edit" @click.stop="editNote(note)">编辑</el-button>
            <el-button size="small" type="danger" icon="Delete" @click.stop="deleteNote(note)">删除</el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 添加/编辑笔记对话框 -->
    <el-dialog 
      v-model="showAddDialog" 
      :title="editingNote ? '编辑笔记' : '添加学习笔记'"
      width="700px"
      @close="resetForm"
    >
      <el-form :model="noteForm" :rules="formRules" ref="noteFormRef" label-width="80px">
        <el-form-item label="标题" prop="title">
          <el-input 
            v-model="noteForm.title" 
            placeholder="请输入笔记标题"
            maxlength="100"
            show-word-limit
          ></el-input>
        </el-form-item>
        <el-form-item label="分类" prop="category">
          <el-select v-model="noteForm.category" placeholder="请选择分类" style="width: 100%">
            <el-option 
              v-for="category in categories" 
              :key="category.id"
              :label="category.name" 
              :value="category.id"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="标签">
          <el-tag
            v-for="tag in noteForm.tags"
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
        <el-form-item label="内容" prop="content">
          <el-input
            type="textarea"
            v-model="noteForm.content"
            placeholder="请输入笔记内容，支持Markdown格式"
            :rows="6"
            maxlength="5000"
            show-word-limit
          ></el-input>
        </el-form-item>
        <el-form-item label="代码示例">
          <el-input
            type="textarea"
            v-model="noteForm.codeExample"
            placeholder="可选：添加代码示例"
            :rows="4"
          ></el-input>
        </el-form-item>
        <el-form-item label="重要程度">
          <el-rate 
            v-model="noteForm.importance" 
            :max="5"
            show-text
            :texts="['一般', '重要', '很重要', '核心', '关键']"
          ></el-rate>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="showAddDialog = false">取消</el-button>
        <el-button 
          type="primary" 
          @click="saveNote"
          :loading="saving"
          :disabled="!canSubmit"
        >
          {{ editingNote ? '保存修改' : '添加笔记' }}
        </el-button>
      </template>
    </el-dialog>

    <!-- 笔记详情模态框 -->
    <el-dialog v-model="showNoteModal" width="800px" class="note-detail-dialog">
      <div class="note-detail">
        <div class="note-detail-header">
          <h2>{{ selectedNote.title }}</h2>
          <div class="note-detail-meta">
            <span class="category-badge">{{ getCategoryName(selectedNote.category) }}</span>
            <span class="date-badge">{{ formatDate(selectedNote.date) }}</span>
            <el-rate 
              v-model="selectedNote.importance" 
              disabled 
              show-score
            ></el-rate>
          </div>
        </div>
        <div class="note-detail-content">
          <div class="content-section" v-html="formatContent(selectedNote.content)"></div>
          <div v-if="selectedNote.codeExample" class="code-section">
            <h4>💻 代码示例</h4>
            <pre><code>{{ selectedNote.codeExample }}</code></pre>
          </div>
        </div>
        <div class="note-detail-tags">
          <h4>🏷️ 标签</h4>
          <el-tag 
            v-for="tag in selectedNote.tags" 
            :key="tag"
            style="margin-right: 0.5rem;"
          >
            {{ tag }}
          </el-tag>
        </div>
      </div>
    </el-dialog>

    <!-- 添加分类对话框 -->
    <el-dialog 
      v-model="showCategoryDialog" 
      title="添加学习分类"
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
  </div>
</template>

<script>
/**
 * 学习笔记组件
 * 支持笔记管理、分类管理、搜索筛选、数据统计等功能
 */
export default {
  name: 'Study',
  data() {
    return {
      // 视图和搜索
      searchQuery: '',
      viewMode: 'card', // 'card' 或 'list'
      activeCategory: 'frontend',
      
      // 对话框状态
      showAddDialog: false,
      showNoteModal: false,
      showCategoryDialog: false,
      showIconPicker: false,
      
      // 编辑状态
      editingNote: null,
      selectedNote: {},
      saving: false,
      addingCategory: false,
      
      // 表单数据
      noteForm: {
        title: '',
        category: '',
        tags: [],
        content: '',
        codeExample: '',
        importance: 3
      },
      categoryForm: {
        name: '',
        icon: '📚',
        description: ''
      },
      tagInputVisible: false,
      tagInputValue: '',
      
      // 分类数据
      categories: [
        {
          id: 'frontend',
          name: '前端开发',
          icon: '🎨',
          isDefault: true
        },
        {
          id: 'backend',
          name: '后端开发',
          icon: '🔧',
          isDefault: true
        },
        {
          id: 'algorithm',
          name: '算法学习',
          icon: '📊',
          isDefault: true
        },
        {
          id: 'reading',
          name: '读书笔记',
          icon: '📖',
          isDefault: true
        },
        {
          id: 'blog',
          name: '技术博客',
          icon: '🌟',
          isDefault: true
        }
      ],
      
      // 笔记数据
      notes: [],
      
      // 推荐资源筛选
      selectedResourceCategory: 'all',
      
      // 表单验证
      formRules: {
        title: [
          { required: true, message: '请输入笔记标题', trigger: 'blur' },
          { min: 1, max: 100, message: '标题长度在 1 到 100 个字符', trigger: 'blur' }
        ],
        category: [
          { required: true, message: '请选择分类', trigger: 'change' }
        ],
        content: [
          { required: true, message: '请输入笔记内容', trigger: 'blur' },
          { min: 10, max: 5000, message: '内容长度在 10 到 5000 个字符', trigger: 'blur' }
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
        '📚', '💻', '🎨', '🔧', '📱', '🌐', '🔬', '📊',
        '🎯', '⚡', '🔥', '💡', '🚀', '🌟', '⭐',
        '📝', '📖', '📓', '🗂️', '📂', '📁', '📄',
        '🧮', '📐', '📏', '📎', '🖊', '🖋', '🖌', '🖍',
        '🎓', '🎔', '🎕', '🎖', '🎗', '🎘', '🎙', '🎚', '🎛',
        '🌱', '🌲', '🌳', '🌴', '🌵', '🌶', '🌷', '🌸'
      ]
    }
  },
  
  created() {
    // 加载本地数据
    this.loadNotesFromStorage()
    this.loadCategoriesFromStorage()
  },
  
  mounted() {
    // 添加键盘快捷键
    document.addEventListener('keydown', this.handleKeydown)
  },
  
  beforeUnmount() {
    // 清理事件监听
    document.removeEventListener('keydown', this.handleKeydown)
  },
  
  computed: {
    currentCategoryName() {
      const category = this.categories.find(cat => cat.id === this.activeCategory)
      return category ? category.name : '全部笔记'
    },
    
    filteredNotes() {
      let notes = this.activeCategory === 'all' 
        ? this.notes 
        : this.notes.filter(note => note.category === this.activeCategory)
      
      // 搜索过滤
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase()
        notes = notes.filter(note => 
          note.title.toLowerCase().includes(query) ||
          note.content.toLowerCase().includes(query) ||
          note.tags.some(tag => tag.toLowerCase().includes(query))
        )
      }
      
      // 按时间倒序排列
      return notes.sort((a, b) => new Date(b.date) - new Date(a.date))
    },
    
    canSubmit() {
      return this.noteForm.title && 
             this.noteForm.category && 
             this.noteForm.content &&
             this.noteForm.content.length >= 10
    },
    
    filteredResources() {
      if (this.selectedResourceCategory === 'all') {
        return this.learningResources()
      }
      return this.learningResources().filter(resource => resource.categoryType === this.selectedResourceCategory)
    }
  },
  
  methods: {
    // ========== 分类管理 ==========
    isDefaultCategory(categoryId) {
      const defaultCategories = ['frontend', 'backend', 'algorithm', 'reading', 'blog']
      return defaultCategories.includes(categoryId)
    },
    
    switchCategory(categoryId) {
      this.activeCategory = categoryId
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
          this.activeCategory = this.categories[0]?.id || 'frontend'
        }
        
        this.saveCategoriesToStorage()
        this.$message.success('分类删除成功！')
      } catch {
        // 用户取消
      }
    },
    
    getCategoryName(categoryId) {
      const category = this.categories.find(cat => cat.id === categoryId)
      return category ? category.name : '未分类'
    },
    
    getNoteCount(categoryId) {
      if (categoryId === 'all') return this.notes.length
      return this.notes.filter(note => note.category === categoryId).length
    },
    
    // ========== 笔记管理 ==========
    handleSearch() {
      // 搜索逻辑已在computed中处理
    },
    
    toggleView() {
      this.viewMode = this.viewMode === 'card' ? 'list' : 'card'
    },
    
    openNoteModal(note) {
      this.selectedNote = { ...note }
      this.showNoteModal = true
    },
    
    editNote(note) {
      this.editingNote = { ...note }
      this.noteForm = {
        title: note.title,
        category: note.category,
        tags: [...note.tags],
        content: note.content,
        codeExample: note.codeExample || '',
        importance: note.importance || 3
      }
      this.showAddDialog = true
    },
    
    async deleteNote(note) {
      try {
        await this.$confirm(`确定要删除笔记《${note.title}》吗？`, '确认删除', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        
        // 从数组中删除
        this.notes = this.notes.filter(n => n.id !== note.id)
        
        this.saveNotesToStorage()
        this.$message.success('笔记删除成功！')
      } catch {
        // 用户取消
      }
    },
    
    async saveNote() {
      try {
        await this.$refs.noteFormRef.validate()
        
        this.saving = true
        
        if (this.editingNote) {
          // 编辑模式
          const index = this.notes.findIndex(n => n.id === this.editingNote.id)
          if (index > -1) {
            this.notes[index] = {
              ...this.notes[index],
              ...this.noteForm,
              date: this.notes[index].date,
              updatedAt: new Date().toISOString()
            }
          }
        } else {
          // 添加模式
          const newNote = {
            id: 'note_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            ...this.noteForm,
            date: new Date().toISOString(),
            createdAt: new Date().toISOString()
          }
          
          this.notes.unshift(newNote)
        }
        
        this.saveNotesToStorage()
        this.showAddDialog = false
        this.resetForm()
        
        this.$message.success(this.editingNote ? '笔记更新成功！' : '笔记添加成功！')
      } catch (error) {
        console.error('保存笔记失败:', error)
      } finally {
        this.saving = false
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
      if (tag && !this.noteForm.tags.includes(tag)) {
        this.noteForm.tags.push(tag)
        this.tagInputValue = ''
        this.tagInputVisible = false
      }
    },
    
    removeTag(tag) {
      this.noteForm.tags = this.noteForm.tags.filter(t => t !== tag)
    },
    
    // ========== 图标选择 ==========
    selectIcon(icon) {
      this.categoryForm.icon = icon
      this.showIconPicker = false
    },
    
    // ========== 表单重置 ==========
    resetForm() {
      this.noteForm = {
        title: '',
        category: '',
        tags: [],
        content: '',
        codeExample: '',
        importance: 3
      }
      this.editingNote = null
      this.tagInputVisible = false
      this.tagInputValue = ''
      if (this.$refs.noteFormRef) {
        this.$refs.noteFormRef.resetFields()
      }
    },
    
    resetCategoryForm() {
      this.categoryForm = {
        name: '',
        icon: '📚',
        description: ''
      }
      this.showIconPicker = false
      if (this.$refs.categoryFormRef) {
        this.$refs.categoryFormRef.resetFields()
      }
    },
    
    // ========== 存储相关 ==========
    loadNotesFromStorage() {
      try {
        const savedNotes = localStorage.getItem('studyNotes')
        if (savedNotes) {
          this.notes = JSON.parse(savedNotes)
        }
      } catch (error) {
        console.error('加载笔记失败:', error)
        this.notes = []
      }
    },
    
    loadCategoriesFromStorage() {
      try {
        const savedCategories = localStorage.getItem('studyCategories')
        if (savedCategories) {
          const customCategories = JSON.parse(savedCategories)
          this.categories = [...this.categories, ...customCategories]
        }
      } catch (error) {
        console.error('加载分类失败:', error)
      }
    },
    
    saveNotesToStorage() {
      try {
        localStorage.setItem('studyNotes', JSON.stringify(this.notes))
      } catch (error) {
        console.error('保存笔记失败:', error)
      }
    },
    
    saveCategoriesToStorage() {
      try {
        const customCategories = this.categories.filter(cat => !cat.isDefault)
        localStorage.setItem('studyCategories', JSON.stringify(customCategories))
      } catch (error) {
        console.error('保存分类失败:', error)
      }
    },
    
    // ========== 工具方法 ==========
    handleKeydown(event) {
      if (!this.showNoteModal) return
      
      switch (event.key) {
        case 'Escape':
          this.showNoteModal = false
          break
      }
    },
    
    truncateText(text, maxLength) {
      if (text.length <= maxLength) return text
      return text.substring(0, maxLength) + '...'
    },
    
    formatDate(dateStr) {
      const date = new Date(dateStr)
      const now = new Date()
      const diff = now - date
      
      if (diff < 86400000) { // 24小时内
        return '今天 ' + date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
      } else if (diff < 172800000) { // 48小时内
        return '昨天 ' + date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
      } else {
        return date.toLocaleDateString('zh-CN')
      }
    },
    
    formatContent(content) {
      // 简单的Markdown渲染
      return content
        .replace(/^### (.*$)/gm, '<h3>$1</h3>')
        .replace(/^## (.*$)/gm, '<h2>$1</h2>')
        .replace(/^# (.*$)/gm, '<h1>$1</h1>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/`([^`]*)`/g, '<code>$1</code>')
        .replace(/\n\n/g, '</p><p>')
        .replace(/\n/g, '<br>')
        .replace(/^(.+)$/gm, '<p>$1</p>')
    },
    
    // ========== 学习资源数据 ==========
    learningResources() {
      return [
        {
          id: 'runoob-html',
          title: '菜鸟教程 - HTML/CSS',
          icon: '🌐',
          category: '菜鸟教程',
          categoryType: 'frontend',
          description: '从零开始学习HTML和CSS，适合完全初学者的入门教程',
          url: 'https://www.runoob.com/html/html-tutorial.html',
          difficulty: 'beginner',
          price: '免费',
          tags: ['HTML', 'CSS', '入门', '基础']
        },
        {
          id: 'runoob-js',
          title: '菜鸟教程 - JavaScript',
          icon: '💻',
          category: '菜鸟教程',
          categoryType: 'frontend',
          description: 'JavaScript基础教程，包含ES6新特性和实战案例',
          url: 'https://www.runoob.com/js/js-tutorial.html',
          difficulty: 'beginner',
          price: '免费',
          tags: ['JavaScript', 'ES6', '入门', '实战']
        },
        {
          id: 'runoob-vue',
          title: '菜鸟教程 - Vue.js',
          icon: '🎨',
          category: '菜鸟教程',
          categoryType: 'frontend',
          description: 'Vue.js 3.x 完整教程，从基础到进阶',
          url: 'https://www.runoob.com/vue3/vue3-tutorial.html',
          difficulty: 'intermediate',
          price: '免费',
          tags: ['Vue', '前端框架', '组件', '进阶']
        },
        {
          id: 'runoob-node',
          title: '菜鸟教程 - Node.js',
          icon: '🔧',
          category: '菜鸟教程',
          categoryType: 'backend',
          description: 'Node.js后端开发教程，适合前端转全栈',
          url: 'https://www.runoob.com/nodejs/nodejs-tutorial.html',
          difficulty: 'intermediate',
          price: '免费',
          tags: ['Node.js', '后端', 'JavaScript', '全栈']
        },
        {
          id: 'runoob-python',
          title: '菜鸟教程 - Python',
          icon: '🐍',
          category: '菜鸟教程',
          categoryType: 'backend',
          description: 'Python基础教程，包含Web开发和数据分析',
          url: 'https://www.runoob.com/python3/python3-tutorial.html',
          difficulty: 'beginner',
          price: '免费',
          tags: ['Python', '入门', '数据分析', 'Web开发']
        },
        {
          id: 'mdn-web',
          title: 'MDN Web Docs',
          icon: '📚',
          category: '官方文档',
          categoryType: 'frontend',
          description: 'Mozilla开发者网络，最权威的Web技术文档',
          url: 'https://developer.mozilla.org/zh-CN/',
          difficulty: 'intermediate',
          price: '免费',
          tags: ['HTML', 'CSS', 'JavaScript', 'WebAPI']
        },
        {
          id: 'vue-docs',
          title: 'Vue.js 官方文档',
          icon: '🎯',
          category: '官方文档',
          categoryType: 'frontend',
          description: 'Vue.js 3官方中文文档，包含完整的API和教程',
          url: 'https://cn.vuejs.org/',
          difficulty: 'intermediate',
          price: '免费',
          tags: ['Vue', '文档', 'API', '官方']
        },
        {
          id: 'javascript-info',
          title: 'JavaScript.info',
          icon: '📖',
          category: '在线教程',
          categoryType: 'frontend',
          description: '现代JavaScript教程，从基础到高级概念',
          url: 'https://javascript.info/',
          difficulty: 'intermediate',
          price: '免费',
          tags: ['JavaScript', '现代', '深入', '系统']
        },
        {
          id: 'css-tricks',
          title: 'CSS-Tricks',
          icon: '🎨',
          category: '在线教程',
          categoryType: 'frontend',
          description: 'CSS技巧和最佳实践，前端开发者必备',
          url: 'https://css-tricks.com/',
          difficulty: 'intermediate',
          price: '免费',
          tags: ['CSS', '技巧', '布局', '动画']
        },
        {
          id: 'freecodecamp',
          title: 'freeCodeCamp',
          icon: '🏕️',
          category: '在线教程',
          categoryType: 'tutorial',
          description: '免费编程学习平台，提供认证和项目实战',
          url: 'https://www.freecodecamp.org/chinese/',
          difficulty: 'beginner',
          price: '免费',
          tags: ['全栈', '项目', '认证', '英语']
        },
        {
          id: 'leetcode',
          title: 'LeetCode 力扣',
          icon: '💪',
          category: '算法练习',
          categoryType: 'backend',
          description: '算法刷题平台，提升编程能力和面试技巧',
          url: 'https://leetcode.cn/',
          difficulty: 'intermediate',
          price: '免费+会员',
          tags: ['算法', '面试', '数据结构', '刷题']
        },
        {
          id: 'github-learning',
          title: 'GitHub Learning Lab',
          icon: '🐙',
          category: '在线教程',
          categoryType: 'tutorial',
          description: 'GitHub官方学习平台，通过实践学习Git和GitHub',
          url: 'https://lab.github.com/',
          difficulty: 'beginner',
          price: '免费',
          tags: ['Git', 'GitHub', '版本控制', '协作']
        },
        {
          id: 'nodejs-docs',
          title: 'Node.js 官方文档',
          icon: '🟢',
          category: '官方文档',
          categoryType: 'backend',
          description: 'Node.js官方文档，包含完整的API参考和指南',
          url: 'https://nodejs.org/zh-cn/docs/',
          difficulty: 'intermediate',
          price: '免费',
          tags: ['Node.js', '文档', 'API', '后端']
        },
        {
          id: 'express-docs',
          title: 'Express.js 官方文档',
          icon: '🚂',
          category: '官方文档',
          categoryType: 'backend',
          description: 'Express.js官方文档，快速搭建Web应用',
          url: 'https://expressjs.com/zh-cn/',
          difficulty: 'beginner',
          price: '免费',
          tags: ['Express', 'Web框架', 'API', '后端']
        },
        {
          id: 'w3schools',
          title: 'W3Schools',
          icon: '🎓',
          category: '在线教程',
          categoryType: 'frontend',
          description: '经典的Web技术教程网站，适合初学者入门',
          url: 'https://www.w3school.com.cn/',
          difficulty: 'beginner',
          price: '免费',
          tags: ['HTML', 'CSS', 'JavaScript', '入门']
        },
        {
          id: 'devdocs',
          title: 'DevDocs',
          icon: '📖',
          category: '工具资源',
          categoryType: 'tutorial',
          description: '离线API文档浏览器，支持多种编程语言',
          url: 'https://devdocs.io/',
          difficulty: 'intermediate',
          price: '免费',
          tags: ['文档', 'API', '工具', '离线']
        }
      ]
    },
    
    // ========== 学习资源方法 ==========
    openResource(url) {
      window.open(url, '_blank')
      this.$message.success('正在打开学习资源...')
    },
    
    filterResources() {
      // 筛选逻辑已在computed中处理
    },
    
    // 获取当前筛选的资源数量
    getResourceCount() {
      return this.filteredResources.length
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
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.resource-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.resource-count {
  color: #909399;
  font-size: 0.9rem;
  background: #f4f4f5;
  padding: 0.3rem 0.8rem;
  border-radius: 6px;
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

/* 笔记卡片样式 */
.notes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 2rem;
}

.note-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.note-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
}

.note-header {
  padding: 1.5rem 1.5rem 0;
}

.note-header h3 {
  margin: 0 0 0.5rem 0;
  color: #333;
  font-size: 1.3rem;
  line-height: 1.4;
}

.note-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.9rem;
  color: #666;
}

.note-category {
  background: #e1f5fe;
  color: #409eff;
  padding: 0.2rem 0.6rem;
  border-radius: 12px;
  font-size: 0.8rem;
}

.note-date {
  color: #999;
}

.note-content {
  padding: 0 1.5rem 1rem 1.5rem;
}

.note-content p {
  margin: 0;
  color: #666;
  line-height: 1.6;
}

.note-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.tag {
  background: #f0f2f5;
  color: #606266;
  padding: 0.2rem 0.6rem;
  border-radius: 12px;
  font-size: 0.8rem;
}

.note-actions {
  display: flex;
  gap: 0.5rem;
  padding: 0 1.5rem 1.5rem 1.5rem;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.note-card:hover .note-actions {
  opacity: 1;
}

/* 笔记详情样式 */
.note-detail-dialog .el-dialog__body {
  padding: 0;
}

.note-detail {
  max-height: 70vh;
  overflow-y: auto;
}

.note-detail-header {
  padding: 2rem 2rem 1rem;
  border-bottom: 1px solid #ebeef5;
  background: #fafafa;
}

.note-detail-header h2 {
  margin: 0 0 1rem 0;
  color: #333;
  font-size: 1.5rem;
}

.note-detail-meta {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.category-badge {
  background: #e1f5fe;
  color: #409eff;
  padding: 0.3rem 0.8rem;
  border-radius: 12px;
  font-size: 0.9rem;
}

.date-badge {
  color: #666;
  font-size: 0.9rem;
}

.note-detail-content {
  padding: 2rem;
}

.content-section {
  margin-bottom: 2rem;
  line-height: 1.8;
  color: #333;
}

.content-section h1 {
  color: #333;
  margin-bottom: 1rem;
}

.content-section h2 {
  color: #333;
  margin-bottom: 0.8rem;
}

.content-section h3 {
  color: #333;
  margin-bottom: 0.6rem;
}

.content-section p {
  margin-bottom: 1rem;
}

.content-section code {
  background: #f4f4f5;
  color: #e83e8c;
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
}

.code-section {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 1.5rem;
  margin-top: 2rem;
}

.code-section h4 {
  margin: 0 0 1rem 0;
  color: #333;
}

.code-section pre {
  background: #282c34;
  color: #abb2bf;
  padding: 1rem;
  border-radius: 6px;
  overflow-x: auto;
  font-family: 'Courier New', monospace;
  line-height: 1.5;
}

.note-detail-tags {
  padding: 1rem 2rem 2rem;
  border-top: 1px solid #ebeef5;
}

.note-detail-tags h4 {
  margin: 0 0 1rem 0;
  color: #333;
}

/* 列表视图 */
.notes-list {
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

.list-item-content {
  flex: 1;
  margin-right: 1rem;
}

.list-item-content h3 {
  margin: 0 0 0.5rem 0;
  color: #333;
  font-size: 1.1rem;
}

.list-item-content p {
  margin: 0 0 0.5rem 0;
  color: #666;
  line-height: 1.4;
}

.list-item-meta {
  display: flex;
  gap: 1rem;
  align-items: center;
  font-size: 0.8rem;
  color: #666;
}

.list-item-actions {
  display: flex;
  gap: 0.5rem;
}

/* 分类管理对话框 */
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

/* 学习资源样式 */
.resources-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
}

.resource-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  border: 1px solid #e4e7ed;
  cursor: pointer;
}

.resource-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
  border-color: #409eff;
}

.resource-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.resource-icon {
  font-size: 2rem;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0f9ff;
  border-radius: 10px;
}

.resource-info {
  flex: 1;
}

.resource-title {
  margin: 0 0 0.3rem 0;
  color: #303133;
  font-size: 1.2rem;
  font-weight: 600;
  line-height: 1.4;
}

.resource-category {
  color: #909399;
  font-size: 0.9rem;
  background: #f4f4f5;
  padding: 0.2rem 0.6rem;
  border-radius: 6px;
}

.resource-description {
  color: #606266;
  font-size: 0.95rem;
  line-height: 1.6;
  margin-bottom: 1rem;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.resource-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.resource-price {
  color: #67c23a;
  font-weight: 500;
  font-size: 0.9rem;
}

.resource-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.resource-tags .tag {
  background: #f0f2f5;
  color: #606266;
  padding: 0.2rem 0.6rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
}

.resource-actions {
  display: flex;
  gap: 0.8rem;
}

.resource-actions .el-button {
  flex: 1;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .search-bar {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-input {
    width: 100%;
  }
  
  .notes-grid {
    grid-template-columns: 1fr;
  }
  
  .list-item {
    flex-direction: column;
    align-items: stretch;
  }
  
  .list-item-content {
    margin-right: 0;
  }
  
  .list-item-actions {
    justify-content: center;
  }
  
  .resources-grid {
    grid-template-columns: 1fr;
  }
  
  .resource-header {
    flex-direction: column;
    text-align: center;
    gap: 0.8rem;
  }
  
  .resource-meta {
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
  }
  
  .resource-actions {
    flex-direction: column;
  }
}

@media (max-width: 480px) {
  .tab-btn {
    min-width: 100px;
    font-size: 0.9rem;
    padding: 0.6rem 1rem;
  }
}
</style>